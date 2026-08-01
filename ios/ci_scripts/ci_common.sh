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
  export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

  # Xcode Cloud images often lack a usable Node on PATH for RN/Expo.
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

# Expo/RN archives need LuMap.xcworkspace. Xcode Cloud often still passes
# -project LuMap.xcodeproj → rewrite via a DEVELOPER_DIR + PATH shim.
ci_install_xcodebuild_workspace_shim() {
  local real_dev fake_dev
  real_dev="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
  if [ -f "$real_dev/usr/bin/xcodebuild" ] && grep -q 'xcodebuild-wrapper' "$real_dev/usr/bin/xcodebuild" 2>/dev/null; then
    real_dev="/Applications/Xcode.app/Contents/Developer"
  fi
  fake_dev="${HOME}/XcodeCloudFakeDeveloper"
  echo "ci: installing xcodebuild workspace shim → $fake_dev"
  rm -rf "$fake_dev"
  mkdir -p "$fake_dev/usr/bin"

  local item base
  for item in "$real_dev"/*; do
    base="$(basename "$item")"
    if [ "$base" = "usr" ]; then
      continue
    fi
    ln -s "$item" "$fake_dev/$base"
  done
  for item in "$real_dev/usr"/*; do
    base="$(basename "$item")"
    if [ "$base" = "bin" ]; then
      continue
    fi
    ln -s "$item" "$fake_dev/usr/$base"
  done
  for item in "$real_dev/usr/bin"/*; do
    base="$(basename "$item")"
    if [ "$base" = "xcodebuild" ]; then
      continue
    fi
    ln -s "$item" "$fake_dev/usr/bin/$base"
  done

  cat > "$fake_dev/usr/bin/xcodebuild" <<'WRAP'
#!/bin/bash
# xcodebuild-wrapper: force CocoaPods workspace for LuMap / Expo archives.
ARGS=()
while [ "$#" -gt 0 ]; do
  if [ "$1" = "-project" ] && [ "$#" -ge 2 ]; then
    proj="$2"
    shift 2
    case "$proj" in
      *.xcodeproj)
        ws="${proj%.xcodeproj}.xcworkspace"
        if [ -d "$ws" ]; then
          echo "xcodebuild-wrapper: -project $(basename "$proj") → -workspace $(basename "$ws")" >&2
          ARGS+=("-workspace" "$ws")
          continue
        fi
        dir="$(dirname "$proj")"
        base="$(basename "$proj" .xcodeproj)"
        alt="${dir}/${base}.xcworkspace"
        if [ -d "$alt" ]; then
          echo "xcodebuild-wrapper: -project → -workspace $alt" >&2
          ARGS+=("-workspace" "$alt")
          continue
        fi
        ARGS+=("-project" "$proj")
        ;;
      *)
        ARGS+=("-project" "$proj")
        ;;
    esac
    continue
  fi
  ARGS+=("$1")
  shift
done
exec /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild "${ARGS[@]}"
WRAP
  chmod +x "$fake_dev/usr/bin/xcodebuild"

  export DEVELOPER_DIR="$fake_dev"
  export PATH="$fake_dev/usr/bin:$PATH"

  local rc
  for rc in "${HOME}/.zshenv" "${HOME}/.zshrc" "${HOME}/.bashrc" "${HOME}/.profile"; do
    touch "$rc"
    if ! grep -q 'XcodeCloudFakeDeveloper' "$rc" 2>/dev/null; then
      {
        echo "export DEVELOPER_DIR=\"$fake_dev\""
        echo "export PATH=\"$fake_dev/usr/bin:\$PATH\""
      } >> "$rc"
    fi
  done

  # Also drop a PATH-first shim for plain `xcodebuild` if /usr/local/bin is writable.
  if [ -w /usr/local/bin ] || mkdir -p /usr/local/bin 2>/dev/null; then
    if [ -w /usr/local/bin ]; then
      ln -sf "$fake_dev/usr/bin/xcodebuild" /usr/local/bin/xcodebuild
      echo "ci: linked /usr/local/bin/xcodebuild → shim"
    fi
  fi

  echo "ci: DEVELOPER_DIR=$DEVELOPER_DIR"
  echo "ci: which xcodebuild=$(command -v xcodebuild)"
}
