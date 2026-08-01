#!/bin/bash
set -euo pipefail
trap 'echo "ci_post_clone: FEHLER in Zeile $LINENO (exit $?)"' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=ci_common.sh
source "$SCRIPT_DIR/ci_common.sh"

REPO_ROOT="$(ci_repo_root)"
echo "ci_post_clone: start repo=$REPO_ROOT CI_PRIMARY_REPOSITORY_PATH=${CI_PRIMARY_REPOSITORY_PATH:-}"

ci_prepare_path
ci_npm_install "$REPO_ROOT"
ci_pod_install "$REPO_ROOT"

# RN build phases need an absolute node path on Xcode Cloud.
NODE_BINARY="$(command -v node)"
echo "export NODE_BINARY=${NODE_BINARY}" > "$REPO_ROOT/ios/.xcode.env.local"
echo "ci_post_clone: wrote ios/.xcode.env.local NODE_BINARY=$NODE_BINARY"

# Install early so later Archive steps inherit DEVELOPER_DIR / PATH.
ci_install_xcodebuild_workspace_shim

echo "ci_post_clone: done"
