#!/bin/bash
set -euo pipefail
trap 'echo "ci_post_clone: FEHLER in Zeile $LINENO (exit $?)"' ERR

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=ci_common.sh
source "$SCRIPT_DIR/ci_common.sh"

REPO_ROOT="$(ci_repo_root)"
echo "ci_post_clone: start repo=$REPO_ROOT"

ci_prepare_path
ci_log_env

# Fail before long npm/pod work when ASC still points at .xcodeproj.
ci_require_workspace_or_explain

ci_npm_install "$REPO_ROOT"
ci_pod_install "$REPO_ROOT"

NODE_BINARY="$(command -v node)"
echo "export NODE_BINARY=${NODE_BINARY}" > "$REPO_ROOT/ios/.xcode.env.local"
echo "ci_post_clone: wrote ios/.xcode.env.local NODE_BINARY=$NODE_BINARY"

# Re-check after pods created/refreshed the workspace on disk.
ci_require_workspace_or_explain

echo "ci_post_clone: done"
