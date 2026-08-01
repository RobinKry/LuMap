#!/bin/bash
set -euo pipefail
trap 'echo "ci_pre_xcodebuild: FEHLER in Zeile $LINENO (exit $?)"' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=ci_common.sh
source "$SCRIPT_DIR/ci_common.sh"

REPO_ROOT="$(ci_repo_root)"
echo "ci_pre_xcodebuild: start repo=$REPO_ROOT"

ci_prepare_path

# Ensure Pods exist right before Archive (Veinue pattern).
if [ ! -d "$REPO_ROOT/ios/Pods" ] || [ ! -f "$REPO_ROOT/ios/Podfile.lock" ]; then
  echo "ci_pre_xcodebuild: Pods fehlen — npm + pod install"
  ci_npm_install "$REPO_ROOT"
fi
ci_pod_install "$REPO_ROOT"

NODE_BINARY="$(command -v node)"
echo "export NODE_BINARY=${NODE_BINARY}" > "$REPO_ROOT/ios/.xcode.env.local"
echo "ci_pre_xcodebuild: done"
