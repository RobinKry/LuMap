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
    echo "ci: installing node via Homebrew"
    brew install node@22 || brew install node
    brew link --force --overwrite node@22 2>/dev/null || true
  fi

  if ! command -v pod >/dev/null 2>&1; then
    echo "ci: installing cocoapods via Homebrew"
    brew install cocoapods
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
    echo "ci: FEHLER — Podfile.lock fehlt nach pod install"
    exit 1
  fi
  if [ ! -d LuMap.xcworkspace ]; then
    echo "ci: FEHLER — LuMap.xcworkspace fehlt nach pod install"
    exit 1
  fi
  echo "ci: pods ok"
}

# Write a wrapper that rewrites -project → -workspace (and can no-op archive).
ci_write_xcodebuild_wrapper() {
  local dest="$1"
  local mode="${2:-rewrite}" # rewrite | noop-archive
  mkdir -p "$(dirname "$dest")"
  cat > "$dest" <<WRAP
#!/bin/bash
# xcodebuild-wrapper ($mode) — LuMap Expo/CocoaPods on Xcode Cloud
MODE="$mode"
REAL_XB="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild"
if [ -x "\${REAL_XB}.lumap_real" ]; then
  REAL_XB="\${REAL_XB}.lumap_real"
fi

# If we already archived in ci_pre, skip Cloud's broken .xcodeproj archive.
if [ "\$MODE" = "noop-archive" ]; then
  for a in "\$@"; do
    if [ "\$a" = "archive" ]; then
      echo "xcodebuild-wrapper: archive already done in ci_pre — exit 0" >&2
      exit 0
    fi
  done
fi

ARGS=()
while [ "\$#" -gt 0 ]; do
  if [ "\$1" = "-project" ] && [ "\$#" -ge 2 ]; then
    proj="\$2"
    shift 2
    case "\$proj" in
      *.xcodeproj)
        ws="\${proj%.xcodeproj}.xcworkspace"
        if [ -d "\$ws" ]; then
          echo "xcodebuild-wrapper: -project \$(basename "\$proj") → -workspace \$(basename "\$ws")" >&2
          ARGS+=("-workspace" "\$ws")
          continue
        fi
        dir="\$(dirname "\$proj")"
        base="\$(basename "\$proj" .xcodeproj)"
        alt="\${dir}/\${base}.xcworkspace"
        if [ -d "\$alt" ]; then
          echo "xcodebuild-wrapper: -project → -workspace \$alt" >&2
          ARGS+=("-workspace" "\$alt")
          continue
        fi
        ARGS+=("-project" "\$proj")
        ;;
      *)
        ARGS+=("-project" "\$proj")
        ;;
    esac
    continue
  fi
  ARGS+=("\$1")
  shift
done
exec "\$REAL_XB" "\${ARGS[@]}"
WRAP
  chmod +x "$dest"
}

# Install wrapper so Cloud's absolute/PATH xcodebuild cannot archive via .xcodeproj.
ci_hijack_xcodebuild() {
  local mode="${1:-rewrite}"
  local wrap="$HOME/bin/xcodebuild"
  mkdir -p "$HOME/bin"
  ci_write_xcodebuild_wrapper "$wrap" "$mode"
  export PATH="$HOME/bin:$PATH"

  if [ -w /usr/local/bin ] || mkdir -p /usr/local/bin 2>/dev/null; then
    if [ -w /usr/local/bin ]; then
      cp "$wrap" /usr/local/bin/xcodebuild
      chmod +x /usr/local/bin/xcodebuild
      echo "ci: installed /usr/local/bin/xcodebuild"
    fi
  fi

  local real="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild"
  # Prefer replacing the real binary (Cloud often uses absolute path).
  if [ -x "$real" ] && [ ! -x "${real}.lumap_real" ]; then
    if cp "$real" "${real}.lumap_real" 2>/dev/null; then
      if cp "$wrap" "$real" 2>/dev/null; then
        chmod +x "$real" 2>/dev/null || true
        echo "ci: replaced $real with wrapper"
      fi
    elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
      sudo cp "$real" "${real}.lumap_real"
      sudo cp "$wrap" "$real"
      sudo chmod +x "$real"
      echo "ci: sudo-replaced $real with wrapper"
    else
      echo "ci: WARN — cannot replace absolute xcodebuild (not writable)"
    fi
  elif [ -x "${real}.lumap_real" ]; then
    cp "$wrap" "$real" 2>/dev/null || sudo -n cp "$wrap" "$real" 2>/dev/null || true
    echo "ci: refreshed wrapper at $real"
  fi

  # Point xcode-select at a fake developer dir as extra belt.
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
  xcode-select -s "$fake" 2>/dev/null || sudo -n xcode-select -s "$fake" 2>/dev/null || true
  echo "ci: DEVELOPER_DIR=$DEVELOPER_DIR xcode-select=$(xcode-select -p 2>/dev/null || true)"
}

# Archive with workspace BEFORE Cloud's xcodebuild (fixes Expo modulemaps).
ci_prearchive_workspace() {
  local root="$1"
  local ws="$root/ios/LuMap.xcworkspace"
  local scheme="${CI_XCODE_SCHEME:-LuMap}"
  local archive_path="${CI_ARCHIVE_PATH:-$root/ios/build/LuMap.xcarchive}"
  local derived="${CI_DERIVED_DATA_PATH:-$root/ios/build/DerivedData}"
  local real_xb="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild"
  if [ -x "${real_xb}.lumap_real" ]; then
    real_xb="${real_xb}.lumap_real"
  fi

  mkdir -p "$(dirname "$archive_path")" "$derived"
  echo "ci: workspace pre-archive → $archive_path"
  echo "ci: scheme=$scheme derived=$derived"

  "$real_xb" \
    -workspace "$ws" \
    -scheme "$scheme" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -derivedDataPath "$derived" \
    -archivePath "$archive_path" \
    archive \
    DEVELOPMENT_TEAM="${CI_TEAM_ID:-3RS7CS256A}" \
    -allowProvisioningUpdates

  echo "ci: workspace pre-archive OK"
  ls -la "$archive_path" | head -5 || true
}
