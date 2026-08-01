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

ci_prepare_path

if [ ! -d "$REPO_ROOT/ios/Pods" ] || [ ! -f "$REPO_ROOT/ios/Podfile.lock" ]; then
  echo "ci_pre_xcodebuild: Pods fehlen — npm + pod install"
  ci_npm_install "$REPO_ROOT"
fi
ci_pod_install "$REPO_ROOT"

NODE_BINARY="$(command -v node)"
echo "export NODE_BINARY=${NODE_BINARY}" > "$REPO_ROOT/ios/.xcode.env.local"

# Always install shim: Cloud workflow may still select .xcodeproj.
ci_install_xcodebuild_workspace_shim

if [[ "${CI_XCODE_PROJECT:-}" == *.xcodeproj ]]; then
  echo "ci_pre_xcodebuild: WARN — workflow points at .xcodeproj; shim rewrites to .xcworkspace"
fi

cd "$REPO_ROOT"
# Ensure target Release also disables explicit modules (Xcode 26 Archive)
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
    print("ci_pre_xcodebuild: patched SWIFT_ENABLE_EXPLICIT_MODULES on app target")
else:
    print("ci_pre_xcodebuild: app target already has explicit modules setting or pattern mismatch")
PY

echo "ci_pre_xcodebuild: done"
