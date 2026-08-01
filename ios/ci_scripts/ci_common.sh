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
# targets → missing *.modulemap / "No such module 'Expo'".
ci_require_workspace_or_explain() {
  local project="${CI_XCODE_PROJECT:-}"
  echo "ci: CI_XCODE_PROJECT=${project:-unset}"
  case "$project" in
    *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
    *.xcodeproj|"")
      # Still try hijack below; also print actionable error prefix for ASC logs.
      echo "error: Xcode Cloud Project is set to .xcodeproj (or unset). Expo needs ios/LuMap.xcworkspace."
      echo "error: Fix in App Store Connect → LuMap → Xcode Cloud → Workflow „Default“ → Edit → Environment → Xcode Project: ios/LuMap.xcworkspace → Save → Start Build"
      echo "ci: attempting xcodebuild -project→-workspace rewrite as fallback"
      return 0
      ;;
  esac
}

# Write a wrapper that rewrites -project → -workspace.
ci_write_xcodebuild_wrapper() {
  local dest="$1"
  mkdir -p "$(dirname "$dest")"
  cat > "$dest" <<'WRAP'
#!/bin/bash
# LuMap: force CocoaPods workspace when Cloud passes -project
REAL_XB="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild"
if [ -x "${REAL_XB}.lumap_real" ]; then
  REAL_XB="${REAL_XB}.lumap_real"
elif [ -x "/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild.lumap_real" ]; then
  REAL_XB="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild.lumap_real"
fi

ARGS=()
while [ "$#" -gt 0 ]; do
  if [ "$1" = "-project" ] && [ "$#" -ge 2 ]; then
    proj="$2"
    shift 2
    case "$proj" in
      *.xcodeproj)
        ws="${proj%.xcodeproj}.xcworkspace"
        if [ -d "$ws" ]; then
          echo "xcodebuild-wrapper: -project → -workspace $ws" >&2
          ARGS+=("-workspace" "$ws")
          continue
        fi
        ;;
    esac
    ARGS+=("-project" "$proj")
    continue
  fi
  ARGS+=("$1")
  shift
done
exec "$REAL_XB" "${ARGS[@]}"
WRAP
  chmod +x "$dest"
}

ci_install_xcodebuild_workspace_shim() {
  ci_hijack_xcodebuild
}

ci_hijack_xcodebuild() {
  local wrap="$HOME/bin/xcodebuild"
  local wrap_xcrun="$HOME/bin/xcrun"
  mkdir -p "$HOME/bin"
  ci_write_xcodebuild_wrapper "$wrap"
  export PATH="$HOME/bin:/usr/local/bin:$PATH"

  # Also wrap xcrun so `xcrun xcodebuild` hits our shim.
  cat > "$wrap_xcrun" <<'XCRUN'
#!/bin/bash
REAL_XCRUN="/usr/bin/xcrun"
if [ "${1:-}" = "xcodebuild" ]; then
  shift
  exec "$HOME/bin/xcodebuild" "$@"
fi
exec "$REAL_XCRUN" "$@"
XCRUN
  chmod +x "$wrap_xcrun"

  if [ -w /usr/local/bin ] || mkdir -p /usr/local/bin 2>/dev/null; then
    if [ -w /usr/local/bin ]; then
      cp "$wrap" /usr/local/bin/xcodebuild
      chmod +x /usr/local/bin/xcodebuild
      echo "ci: installed /usr/local/bin/xcodebuild"
    fi
  fi

  local real="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild"
  local replaced=0
  if [ -x "$real" ] && [ ! -x "${real}.lumap_real" ]; then
    if cp "$real" "${real}.lumap_real" 2>/dev/null && cp "$wrap" "$real" 2>/dev/null; then
      chmod +x "$real" 2>/dev/null || true
      echo "ci: replaced absolute xcodebuild with workspace wrapper"
      replaced=1
    elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
      sudo cp "$real" "${real}.lumap_real"
      sudo cp "$wrap" "$real"
      sudo chmod +x "$real"
      echo "ci: sudo-replaced absolute xcodebuild with workspace wrapper"
      replaced=1
    else
      echo "ci: WARN — /Applications/.../xcodebuild not writable; PATH/xcrun shim only"
    fi
  elif [ -x "${real}.lumap_real" ]; then
    cp "$wrap" "$real" 2>/dev/null || sudo -n cp "$wrap" "$real" 2>/dev/null || true
    echo "ci: refreshed absolute xcodebuild wrapper"
    replaced=1
  fi

  # Fake DEVELOPER_DIR so tools that resolve via xcode-select/DEVELOPER_DIR get the shim.
  local fake="$HOME/XcodeCloudFakeDeveloper"
  local app_dev="/Applications/Xcode.app/Contents/Developer"
  rm -rf "$fake"
  mkdir -p "$fake/usr/bin"
  local item base
  for item in "$app_dev"/*; do
    base="$(basename "$item")"
    [ "$base" = "usr" ] && continue
    ln -s "$item" "$fake/$base"
  done
  for item in "$app_dev/usr"/*; do
    base="$(basename "$item")"
    [ "$base" = "bin" ] && continue
    ln -s "$item" "$fake/usr/$base"
  done
  for item in "$app_dev/usr/bin"/*; do
    base="$(basename "$item")"
    [ "$base" = "xcodebuild" ] && continue
    ln -s "$item" "$fake/usr/bin/$base"
  done
  cp "$wrap" "$fake/usr/bin/xcodebuild"
  chmod +x "$fake/usr/bin/xcodebuild"
  export DEVELOPER_DIR="$fake"
  # Persist for subsequent Cloud steps when supported
  if [ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]; then
    echo "export DEVELOPER_DIR=\"$fake\"" >> "$HOME/.zshrc" 2>/dev/null || true
    echo "export PATH=\"$HOME/bin:\$PATH\"" >> "$HOME/.zshrc" 2>/dev/null || true
  fi
  xcode-select -s "$fake" 2>/dev/null || sudo -n xcode-select -s "$fake" 2>/dev/null || true
  echo "ci: DEVELOPER_DIR=$DEVELOPER_DIR replaced_absolute=$replaced xcode-select=$(xcode-select -p 2>/dev/null || true)"
}
