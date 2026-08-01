#!/bin/bash
set -euo pipefail
# Shared helpers for Xcode Cloud (Expo / RN under ios/).

ci_repo_root() {
  local script_dir ios_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ios_dir="$(cd "$script_dir/.." && pwd)"
  cd "$ios_dir/.." && pwd
}

ci_prepare_path() {
  export HOMEBREW_NO_AUTO_UPDATE=1
  export LANG=en_US.UTF-8
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
  if [ -f package-lock.json ]; then
    echo "ci: npm ci"
    npm ci
  else
    echo "ci: npm install"
    npm install
  fi
}

ci_pod_install() {
  local root="$1"
  cd "$root/ios"
  echo "ci: pod install --repo-update (cwd=$(pwd))"
  pod install --repo-update
  if [ ! -f Podfile.lock ]; then
    echo "error: Podfile.lock fehlt nach pod install"
    exit 1
  fi
  if [ ! -d LuMap.xcworkspace ]; then
    echo "error: LuMap.xcworkspace fehlt nach pod install"
    exit 1
  fi
  echo "ci: pods ok"
}

# Expo/CocoaPods Archive MUST use the workspace. Building .xcodeproj skips Pod
# targets → missing *.modulemap / "No such module 'Expo'". Scripts cannot
# reliably rewrite Xcode Cloud's absolute xcodebuild — fail fast instead.
ci_require_workspace_or_explain() {
  local project="${CI_XCODE_PROJECT:-}"
  echo "ci: CI_XCODE_PROJECT=${project:-unset}"
  case "$project" in
    *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
    *)
      echo "error: Xcode Cloud Project is '${project:-unset}' — Expo needs ios/LuMap.xcworkspace."
      echo "error: App Store Connect → LuMap → Xcode Cloud → Workflow „Default“ → Edit → Environment → Xcode Project: ios/LuMap.xcworkspace → Save → Start Build"
      exit 1
      ;;
  esac
}
