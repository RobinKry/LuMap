#!/bin/bash
set -euo pipefail
trap 'echo "ci_post_clone: FEHLER in Zeile $LINENO (exit $?)"' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=ci_common.sh
source "$SCRIPT_DIR/ci_common.sh"

REPO_ROOT="$(ci_repo_root)"
echo "ci_post_clone: start repo=$REPO_ROOT"

ci_prepare_path
ci_install_xcodebuild_shim "$REPO_ROOT"
ci_log_env

# Do NOT fail-fast on wrong ASC project path here — always install npm/pods so
# Artifacts prove dependency setup works. Shim covers Archive when ASC is wrong.
ci_warn_unless_workspace

ci_npm_install "$REPO_ROOT"
ci_pod_install "$REPO_ROOT"

# Re-export after pods ensured the workspace exists on disk.
ci_install_xcodebuild_shim "$REPO_ROOT"

NODE_BINARY="$(command -v node)"
echo "export NODE_BINARY=${NODE_BINARY}" > "$REPO_ROOT/ios/.xcode.env.local"
echo "ci_post_clone: wrote ios/.xcode.env.local NODE_BINARY=$NODE_BINARY"

ci_warn_unless_workspace

echo "ci_post_clone: done"
