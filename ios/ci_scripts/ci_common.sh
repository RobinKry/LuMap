#!/bin/bash
set -euo pipefail
# Shared helpers for Xcode Cloud (Expo / RN under ios/).

ci_repo_root() {
  local script_dir ios_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ios_dir="$(cd "$script_dir/.." && pwd)"
  cd "$ios_dir/.." && pwd
}

ci_log_env() {
  echo "ci: ---- Xcode Cloud env ----"
  echo "ci: CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset}"
  echo "ci: CI_XCODE_SCHEME=${CI_XCODE_SCHEME:-unset}"
  echo "ci: CI_WORKSPACE=${CI_WORKSPACE:-unset}"
  echo "ci: CI_PRIMARY_REPOSITORY_PATH=${CI_PRIMARY_REPOSITORY_PATH:-unset}"
  echo "ci: CI_DERIVED_DATA_PATH=${CI_DERIVED_DATA_PATH:-unset}"
  echo "ci: CI_XCODEBUILD_ACTION=${CI_XCODEBUILD_ACTION:-unset}"
  echo "ci: RNMAPBOX_MAPS_DOWNLOAD_TOKEN set? $([ -n "${RNMAPBOX_MAPS_DOWNLOAD_TOKEN:-}" ] && echo yes || echo no)"
  echo "ci: ---- end env ----"
}

ci_prepare_path() {
  export HOMEBREW_NO_AUTO_UPDATE=1
  export LANG=en_US.UTF-8
  export LC_ALL=en_US.UTF-8
  export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/bin:$PATH"
  # Never inherit local hijack leftovers into Cloud or subsequent steps.
  unset DEVELOPER_DIR 2>/dev/null || true
  if [ -d /Applications/Xcode.app/Contents/Developer ]; then
    export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
  fi

  if ! command -v node >/dev/null 2>&1; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "error: weder node noch brew auf PATH (Xcode Cloud image)"
      exit 127
    fi
    echo "ci: installing node via Homebrew"
    brew install node@22 || brew install node
    brew link --force --overwrite node@22 2>/dev/null || true
    # Homebrew may install without linking onto PATH for the current shell.
    export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
  fi

  if ! command -v pod >/dev/null 2>&1; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "error: weder pod noch brew auf PATH (Xcode Cloud image)"
      exit 127
    fi
    echo "ci: installing cocoapods via Homebrew"
    brew install cocoapods
  fi

  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "error: node/npm fehlt nach setup"
    exit 127
  fi
  if ! command -v pod >/dev/null 2>&1; then
    echo "error: pod fehlt nach setup"
    exit 127
  fi

  echo "ci: node=$(command -v node) $(node -v 2>/dev/null || true)"
  echo "ci: npm=$(command -v npm) $(npm -v 2>/dev/null || true)"
  echo "ci: pod=$(command -v pod) $(pod --version 2>/dev/null || true)"
}

ci_npm_install() {
  local root="$1"
  cd "$root"
  echo "ci: package.json deps include react-native-maps / expo-location (Apple Maps)"
  if [ -f package-lock.json ]; then
    echo "ci: npm ci"
    if ! npm ci; then
      echo "ci: npm ci failed — retrying with npm install"
      npm install
    fi
  else
    echo "ci: npm install"
    npm install
  fi
  # Sanity: Expo + Apple Maps packages must resolve for autolinking / pods.
  node -e "require.resolve('expo/package.json'); require.resolve('react-native-maps/package.json'); require.resolve('expo-location/package.json'); console.log('ci: npm deps ok (expo, react-native-maps, expo-location)')"
}

ci_pod_install() {
  local root="$1"
  cd "$root/ios"

  # Mapbox: download token is no longer required by current Mapbox SDKs, but
  # older / misconfigured @rnmapbox installs may still ask. Prefer env secret
  # if ASC provides one; never fail solely because it is unset.
  if [ -n "${RNMAPBOX_MAPS_DOWNLOAD_TOKEN:-}" ]; then
    echo "ci: RNMAPBOX_MAPS_DOWNLOAD_TOKEN is set (will be used if rnmapbox pods need it)"
    export RNMAPBOX_MAPS_DOWNLOAD_TOKEN
  else
    echo "ci: RNMAPBOX_MAPS_DOWNLOAD_TOKEN unset (ok if @rnmapbox/maps is not a dependency)"
  fi

  echo "ci: pod install (cwd=$(pwd))"
  # Prefer lockfile sync first (faster, deterministic). Fall back to repo-update.
  local pod_log
  pod_log="$(mktemp "${TMPDIR:-/tmp}/ci-pod-install.XXXXXX")"
  if ! pod install 2>&1 | tee "$pod_log"; then
    echo "ci: pod install failed — retrying with --repo-update"
    if ! pod install --repo-update 2>&1 | tee "$pod_log"; then
      echo "error: pod install failed"
      if grep -Eiq 'mapbox|RNMapbox|RNMAPBOX|download.?token|api\.mapbox\.com|401|403' "$pod_log"; then
        echo "error: Looks Mapbox-related. Either remove unused @rnmapbox/maps, or set ASC Environment Variable RNMAPBOX_MAPS_DOWNLOAD_TOKEN (secret download token from mapbox.com)."
      fi
      rm -f "$pod_log"
      exit 1
    fi
  fi
  rm -f "$pod_log"

  if [ ! -f Podfile.lock ]; then
    echo "error: Podfile.lock fehlt nach pod install"
    exit 1
  fi
  if [ ! -d LuMap.xcworkspace ]; then
    echo "error: LuMap.xcworkspace fehlt nach pod install"
    exit 1
  fi
  echo "ci: pods ok — workspace=$(pwd)/LuMap.xcworkspace"
}

# Expo/CocoaPods Archive MUST use the workspace. Building .xcodeproj skips Pod
# targets → missing *.modulemap / "No such module 'Expo'".
#
# Scripts CANNOT override App Store Connect → Workflow → Environment → Xcode Project.
# There is no reliable in-script workaround (xcodebuild PATH hijacks were removed).
ci_require_workspace_or_explain() {
  local project="${CI_XCODE_PROJECT:-}"
  local base
  base="$(basename "${project:-}")"
  echo "ci: CI_XCODE_PROJECT=${project:-unset} (basename=${base:-unset})"

  case "$project" in
    *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
  esac
  case "$base" in
    *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
  esac

  cat <<'EOF'

================================================================================
FATAL: Xcode Cloud builds LuMap.xcodeproj instead of LuMap.xcworkspace

Expo / CocoaPods Archive requires the workspace. With only the .xcodeproj,
Pods (Expo, react-native-maps, …) are skipped → "No such module 'Expo'".

ci_scripts CANNOT change this. You must fix App Store Connect:

  1. https://appstoreconnect.apple.com → Apps → LuMap → Xcode Cloud
  2. Workflow „Default“ → Edit → Environment
  3. Xcode Project / Workspace:
       ios/LuMap.xcworkspace
     (NOT ios/LuMap.xcodeproj)
  4. Save → Start Build

Expected CI_XCODE_PROJECT value: a path ending in LuMap.xcworkspace
EOF
  echo "Actual CI_XCODE_PROJECT='${project:-unset}'"
  echo "================================================================================"
  exit 1
}
