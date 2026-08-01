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

ci_scripts_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}

ci_shim_bin_dir() {
  echo "$(ci_scripts_dir)/bin"
}

# Prepend the LuMap-only xcodebuild/xcrun shims and keep DEVELOPER_DIR on real Xcode.
# Also force CI_XCODE_PROJECT to the CocoaPods workspace when ASC still has .xcodeproj.
ci_install_xcodebuild_shim() {
  local root="$1"
  local bin_dir shim xcrun_shim workspace_abs
  bin_dir="$(ci_shim_bin_dir)"
  shim="$bin_dir/xcodebuild"
  xcrun_shim="$bin_dir/xcrun"
  workspace_abs="$root/ios/LuMap.xcworkspace"

  if [ ! -x "$shim" ]; then
    echo "error: missing executable shim at $shim"
    exit 127
  fi
  chmod +x "$shim" "$xcrun_shim" 2>/dev/null || true

  # Remember ASC's original value once (before we override it).
  if [ -z "${CI_XCODE_PROJECT_ASC_ORIGINAL:-}" ]; then
    export CI_XCODE_PROJECT_ASC_ORIGINAL="${CI_XCODE_PROJECT:-unset}"
  fi

  mkdir -p "$HOME/bin" 2>/dev/null || true
  # Duplicate onto $HOME/bin in case Cloud's later step only inherits HOME paths.
  cp -f "$shim" "$HOME/bin/xcodebuild" 2>/dev/null || true
  cp -f "$xcrun_shim" "$HOME/bin/xcrun" 2>/dev/null || true
  chmod +x "$HOME/bin/xcodebuild" "$HOME/bin/xcrun" 2>/dev/null || true

  export PATH="$bin_dir:$HOME/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

  local real_dev="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
  if [ ! -d "$real_dev" ]; then
    real_dev=/Applications/Xcode.app/Contents/Developer
  fi
  # Never point local machines at a FakeDeveloper leftover.
  case "$real_dev" in
    *FakeDeveloper* | *LuMapXcodeShimDeveloper*)
      real_dev=/Applications/Xcode.app/Contents/Developer
      ;;
  esac

  # DEVELOPER_DIR overlay only on Xcode Cloud — avoids breaking local xcode-select.
  if [ -n "${CI:-}" ] || [ -n "${CI_XCODE_CLOUD:-}" ] || [ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]; then
    local overlay item base
    overlay="${HOME}/LuMapXcodeShimDeveloper"
    if [ -d "$real_dev" ]; then
      mkdir -p "$overlay/usr/bin"
      for item in "$real_dev"/*; do
        base="$(basename "$item")"
        [ "$base" = "usr" ] && continue
        ln -sfn "$item" "$overlay/$base"
      done
      mkdir -p "$overlay/usr"
      for item in "$real_dev/usr"/*; do
        base="$(basename "$item")"
        [ "$base" = "bin" ] && continue
        ln -sfn "$item" "$overlay/usr/$base"
      done
      mkdir -p "$overlay/usr/bin"
      for item in "$real_dev/usr/bin"/*; do
        base="$(basename "$item")"
        if [ "$base" = "xcodebuild" ] || [ "$base" = "xcrun" ]; then
          continue
        fi
        ln -sfn "$item" "$overlay/usr/bin/$base"
      done
      ln -sfn "$shim" "$overlay/usr/bin/xcodebuild"
      ln -sfn "$xcrun_shim" "$overlay/usr/bin/xcrun"
      export DEVELOPER_DIR="$overlay"
      echo "ci: DEVELOPER_DIR overlay=$DEVELOPER_DIR (xcodebuild/xcrun → shim)"
    fi
  else
    export DEVELOPER_DIR="$real_dev"
    echo "ci: DEVELOPER_DIR=$DEVELOPER_DIR (local — no overlay)"
  fi

  if [ -d "$workspace_abs" ]; then
    export CI_XCODE_PROJECT="$workspace_abs"
    echo "ci: exported CI_XCODE_PROJECT=$CI_XCODE_PROJECT (ASC original=${CI_XCODE_PROJECT_ASC_ORIGINAL:-unset})"
  else
    echo "ci: WARN — workspace missing at $workspace_abs (pod install may not have run yet)"
  fi

  # Persist PATH / DEVELOPER_DIR for shells some Cloud images spawn for xcodebuild.
  if [ -n "${CI:-}" ] || [ -n "${CI_XCODE_CLOUD:-}" ] || [ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]; then
    for rc in "$HOME/.zshenv" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
      touch "$rc" 2>/dev/null || continue
      if ! grep -q 'LuMap ci_scripts/bin xcodebuild shim' "$rc" 2>/dev/null; then
        {
          echo ""
          echo "# LuMap ci_scripts/bin xcodebuild shim"
          echo "export PATH=\"$bin_dir:\$HOME/bin:/opt/homebrew/bin:/usr/local/bin:\$PATH\""
          echo "export DEVELOPER_DIR=\"${DEVELOPER_DIR:-$real_dev}\""
          if [ -d "$workspace_abs" ]; then
            echo "export CI_XCODE_PROJECT=\"$workspace_abs\""
          fi
        } >> "$rc"
      fi
    done
  fi

  echo "ci: xcodebuild shim ready which=$(command -v xcodebuild)"
  echo "ci: xcrun shim ready which=$(command -v xcrun)"
  echo "ci: DEVELOPER_DIR=${DEVELOPER_DIR:-unset}"
}

ci_prepare_path() {
  export HOMEBREW_NO_AUTO_UPDATE=1
  export LANG=en_US.UTF-8
  export LC_ALL=en_US.UTF-8
  export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/bin:$PATH"
  # Drop leftover local FakeDeveloper paths from previous experiments.
  case "${DEVELOPER_DIR:-}" in
    *XcodeCloudFakeDeveloper* | *FakeDeveloper*)
      unset DEVELOPER_DIR 2>/dev/null || true
      ;;
  esac
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

# Run pod install through tee without masking the real exit code.
# With `set -o pipefail`, `${PIPESTATUS[0]}` is the pod exit; tee is [1].
ci_run_pod_install() {
  local extra_args=("$@")
  local pod_log pod_status
  pod_log="$(mktemp "${TMPDIR:-/tmp}/ci-pod-install.XXXXXX")"
  set +e
  pod install "${extra_args[@]}" 2>&1 | tee "$pod_log"
  pod_status=${PIPESTATUS[0]}
  set -e
  if [ "$pod_status" -ne 0 ]; then
    echo "ci: pod install exit=$pod_status"
    if grep -Eiq 'mapbox|RNMapbox|RNMAPBOX|download.?token|api\.mapbox\.com|401|403' "$pod_log"; then
      echo "error: Looks Mapbox-related. Either remove unused @rnmapbox/maps, or set ASC Environment Variable RNMAPBOX_MAPS_DOWNLOAD_TOKEN (secret download token from mapbox.com)."
    fi
    rm -f "$pod_log"
    return "$pod_status"
  fi
  rm -f "$pod_log"
  return 0
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
  if ! ci_run_pod_install; then
    echo "ci: pod install failed — retrying with --repo-update"
    if ! ci_run_pod_install --repo-update; then
      echo "error: pod install failed"
      exit 1
    fi
  fi

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

# True when ASC already points at the CocoaPods workspace.
# Accepts absolute/relative paths and any string containing LuMap.xcworkspace
# (ASC sometimes passes full paths vs ios/LuMap.xcworkspace).
ci_workspace_configured() {
  local project="${CI_XCODE_PROJECT:-}"
  local base
  base="$(basename "${project:-}")"
  echo "ci: CI_XCODE_PROJECT=${project:-unset} (basename=${base:-unset})"

  case "$project" in
    *LuMap.xcworkspace* | *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
  esac
  case "$base" in
    LuMap.xcworkspace | *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
  esac
  return 1
}

# Write a small artifact next to ci_scripts so Archive logs show the ASC path
# even when the UI collapses long script output.
ci_write_workspace_diag() {
  local diag_dir status_line
  status_line="${1:-unknown}"
  # BASH_SOURCE here is ci_common.sh (this file), which lives in ios/ci_scripts/.
  diag_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  {
    echo "status=${status_line}"
    echo "CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset}"
    echo "CI_XCODE_PROJECT_ASC_ORIGINAL=${CI_XCODE_PROJECT_ASC_ORIGINAL:-unset}"
    echo "CI_XCODE_SCHEME=${CI_XCODE_SCHEME:-unset}"
    echo "CI_WORKSPACE=${CI_WORKSPACE:-unset}"
    echo "CI_XCODEBUILD_ACTION=${CI_XCODEBUILD_ACTION:-unset}"
    echo "shim=$(ci_shim_bin_dir)/xcodebuild"
    echo "expected=ios/LuMap.xcworkspace"
    date -u +"utc=%Y-%m-%dT%H:%M:%SZ"
  } > "$diag_dir/CI_XCODE_PROJECT.txt"
  echo "ci: wrote $diag_dir/CI_XCODE_PROJECT.txt (status=${status_line})"
  # Repeat on its own line — easy to grep in Archive → Logs.
  echo "ci: DIAG CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset} ASC_ORIGINAL=${CI_XCODE_PROJECT_ASC_ORIGINAL:-unset}"
}

ci_print_workspace_fix_message() {
  local project="${CI_XCODE_PROJECT:-}"
  local severity="${1:-warn}"
  if [ "$severity" = "error" ]; then
    # Xcode Cloud surfaces lines starting with "error:" as the Archive issue.
    echo "error: Xcode Cloud Workflow muss ios/LuMap.xcworkspace nutzen — aktuell CI_XCODE_PROJECT='${project:-unset}'."
  else
    echo "ci: WARN — ASC Workflow sollte ios/LuMap.xcworkspace nutzen — aktuell CI_XCODE_PROJECT='${project:-unset}'. xcodebuild-Shim schreibt LuMap.xcodeproj → LuMap.xcworkspace um."
  fi
  cat <<'EOF'

================================================================================
Xcode Cloud should build ios/LuMap.xcworkspace (not LuMap.xcodeproj)

Expo / CocoaPods Archive requires the workspace. With only the .xcodeproj,
Pods (Expo, react-native-maps, …) are skipped → "No such module 'Expo'".

This repo installs ios/ci_scripts/bin/xcodebuild which rewrites
-project …/LuMap.xcodeproj → -workspace …/LuMap.xcworkspace when PATH is honored.

Still set ASC correctly when you can:

  1. https://appstoreconnect.apple.com → Apps → LuMap → Xcode Cloud
  2. Workflow „Default“ → Edit Workflow → Environment
  3. Xcode Project or Workspace:
       ios/LuMap.xcworkspace
     (NOT ios/LuMap.xcodeproj)
  4. Save → Start Build

Direct link (team + app):
  https://appstoreconnect.apple.com/apps/6796983748/ci

Expected CI_XCODE_PROJECT value: a path containing LuMap.xcworkspace
EOF
  echo "Actual CI_XCODE_PROJECT='${project:-unset}'"
  echo "================================================================================"
}

# Soft check for post_clone: never abort npm/pod work; only warn loudly.
ci_warn_unless_workspace() {
  if ci_workspace_configured; then
    ci_write_workspace_diag "ok-workspace"
    return 0
  fi
  echo "ci: WARN — ASC still points at .xcodeproj; continuing so npm/pods still run."
  ci_write_workspace_diag "warn-xcodeproj"
  ci_print_workspace_fix_message "warn"
  return 0
}

# Archive gate: prefer ASC workspace; otherwise rely on the xcodebuild shim.
ci_require_workspace_or_explain() {
  local root="$1"
  local shim asc_orig
  shim="$(ci_shim_bin_dir)/xcodebuild"
  asc_orig="${CI_XCODE_PROJECT_ASC_ORIGINAL:-${CI_XCODE_PROJECT:-}}"

  # Already a workspace according to (possibly overridden) env.
  if ci_workspace_configured; then
    case "$asc_orig" in
      *LuMap.xcworkspace* | *.xcworkspace)
        ci_write_workspace_diag "ok-workspace"
        return 0
        ;;
      *)
        # We overrode CI_XCODE_PROJECT ourselves — still need shim for Cloud's argv.
        if [ -x "$shim" ] && [ -d "$root/ios/LuMap.xcworkspace" ]; then
          echo "ci: ASC original was .xcodeproj (${asc_orig}) — shim + CI_XCODE_PROJECT override active."
          ci_write_workspace_diag "shim-override"
          ci_print_workspace_fix_message "warn"
          return 0
        fi
        ;;
    esac
  fi

  if [ -x "$shim" ] && [ -d "$root/ios/LuMap.xcworkspace" ]; then
    echo "ci: ASC still has .xcodeproj — proceeding with xcodebuild shim (rewrite to workspace)."
    ci_write_workspace_diag "shim-xcodeproj"
    ci_print_workspace_fix_message "warn"
    return 0
  fi

  echo "FATAL: ASC points at .xcodeproj and xcodebuild shim/workspace unavailable"
  ci_write_workspace_diag "fatal-xcodeproj"
  ci_print_workspace_fix_message "error"
  exit 1
}
