#!/bin/bash
set -euo pipefail
trap 'echo "ci_pre_xcodebuild: FEHLER in Zeile $LINENO (exit $?)"' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=ci_common.sh
source "$SCRIPT_DIR/ci_common.sh"

REPO_ROOT="$(ci_repo_root)"
echo "ci_pre_xcodebuild: start repo=$REPO_ROOT"
echo "ci_pre_xcodebuild: CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset}"
echo "ci_pre_xcodebuild: CI_XCODE_SCHEME=${CI_XCODE_SCHEME:-unset}"
echo "ci_pre_xcodebuild: CI_ARCHIVE_PATH=${CI_ARCHIVE_PATH:-unset}"
echo "ci_pre_xcodebuild: CI_DERIVED_DATA_PATH=${CI_DERIVED_DATA_PATH:-unset}"
echo "ci_pre_xcodebuild: CI_XCODEBUILD_ACTION=${CI_XCODEBUILD_ACTION:-unset}"

ci_prepare_path
ci_npm_install "$REPO_ROOT"
ci_pod_install "$REPO_ROOT"

NODE_BINARY="$(command -v node)"
echo "export NODE_BINARY=${NODE_BINARY}" > "$REPO_ROOT/ios/.xcode.env.local"

cd "$REPO_ROOT"
python3 <<'PY'
from pathlib import Path
p = Path("ios/LuMap.xcodeproj/project.pbxproj")
text = p.read_text()
orig = text
text = text.replace(
    "SWIFT_OBJC_BRIDGING_HEADER = \"LuMap/LuMap-Bridging-Header.h\";\n\t\t\t\tSWIFT_OPTIMIZATION_LEVEL",
    "SWIFT_OBJC_BRIDGING_HEADER = \"LuMap/LuMap-Bridging-Header.h\";\n\t\t\t\tSWIFT_ENABLE_EXPLICIT_MODULES = NO;\n\t\t\t\tSWIFT_OPTIMIZATION_LEVEL",
)
text = text.replace(
    "SWIFT_OBJC_BRIDGING_HEADER = \"LuMap/LuMap-Bridging-Header.h\";\n\t\t\t\tSWIFT_VERSION",
    "SWIFT_OBJC_BRIDGING_HEADER = \"LuMap/LuMap-Bridging-Header.h\";\n\t\t\t\tSWIFT_ENABLE_EXPLICIT_MODULES = NO;\n\t\t\t\tSWIFT_VERSION",
)
while "SWIFT_ENABLE_EXPLICIT_MODULES = NO;\n\t\t\t\tSWIFT_ENABLE_EXPLICIT_MODULES = NO;" in text:
    text = text.replace(
        "SWIFT_ENABLE_EXPLICIT_MODULES = NO;\n\t\t\t\tSWIFT_ENABLE_EXPLICIT_MODULES = NO;",
        "SWIFT_ENABLE_EXPLICIT_MODULES = NO;",
    )
if text != orig:
    p.write_text(text)
    print("ci_pre_xcodebuild: patched SWIFT_ENABLE_EXPLICIT_MODULES")
else:
    print("ci_pre_xcodebuild: explicit modules already set")
PY

ci_require_workspace_or_explain
ci_hijack_xcodebuild

# If workflow still points at .xcodeproj AND we could not replace absolute xcodebuild,
# fail fast with a clear ASC instruction instead of 29 Expo modulemap errors.
if [[ "${CI_XCODE_PROJECT:-}" == *.xcodeproj ]]; then
  real="/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild"
  if [ ! -x "${real}.lumap_real" ]; then
    echo "error: Cannot rewrite absolute xcodebuild on this image, and workflow uses .xcodeproj."
    echo "error: App Store Connect → LuMap → Xcode Cloud → Default → Edit → Environment → set to ios/LuMap.xcworkspace → Save → Start Build"
    exit 1
  fi
  # Verify wrapper is actually installed at absolute path (not the original Mach-O only)
  if ! head -1 "$real" 2>/dev/null | grep -q bash; then
    echo "error: absolute xcodebuild was not replaced with workspace shim."
    echo "error: App Store Connect → set Xcode Project to ios/LuMap.xcworkspace"
    exit 1
  fi
fi

echo "ci_pre_xcodebuild: done"
