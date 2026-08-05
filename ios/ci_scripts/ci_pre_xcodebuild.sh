#!/bin/bash
set -euo pipefail
trap 'echo "ci_pre_xcodebuild: FEHLER in Zeile $LINENO (exit $?)"' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=ci_common.sh
source "$SCRIPT_DIR/ci_common.sh"

REPO_ROOT="$(ci_repo_root)"
echo "ci_pre_xcodebuild: start repo=$REPO_ROOT"

ci_prepare_path
ci_install_xcodebuild_shim "$REPO_ROOT"
ci_log_env

# Soft warn early; archive gate allows embed and/or shim when ASC still has .xcodeproj.
ci_warn_unless_workspace

ci_npm_install "$REPO_ROOT"
ci_pod_install "$REPO_ROOT"

# Ensure shim + CI_XCODE_PROJECT override see the fresh workspace path.
ci_install_xcodebuild_shim "$REPO_ROOT"

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

# Use Xcode Cloud build number as CFBundleVersion when available (avoids duplicate build 1).
if [ -n "${CI_BUILD_NUMBER:-}" ]; then
  echo "ci_pre_xcodebuild: setting CURRENT_PROJECT_VERSION=${CI_BUILD_NUMBER}"
  python3 <<PY
from pathlib import Path
import os, re
build = os.environ["CI_BUILD_NUMBER"]
p = Path("ios/LuMap.xcodeproj/project.pbxproj")
text = re.sub(r"CURRENT_PROJECT_VERSION = \d+;", f"CURRENT_PROJECT_VERSION = {build};", p.read_text())
p.write_text(text)
print(f"ci_pre_xcodebuild: CURRENT_PROJECT_VERSION -> {build}")
PY
fi

# Gate: ASC workspace OK, or shim+workspace present → continue (no hard-fail).
ci_require_workspace_or_explain "$REPO_ROOT"
ci_verify_xcodebuild_shim "$REPO_ROOT"

echo "ci_pre_xcodebuild: which xcodebuild=$(command -v xcodebuild)"
echo "ci_pre_xcodebuild: DEVELOPER_DIR=${DEVELOPER_DIR:-unset}"
echo "ci_pre_xcodebuild: CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset}"
echo "ci_pre_xcodebuild: done"
