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

# Do NOT pre-archive here: signing keychain is only ready during Cloud's own
# xcodebuild step (pre-archive → exit 65). Instead rewrite -project → -workspace.
echo "ci_pre_xcodebuild: installing xcodebuild workspace rewrite"
ci_hijack_xcodebuild "rewrite"

echo "ci_pre_xcodebuild: done"
