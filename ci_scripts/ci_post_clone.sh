#!/bin/bash
set -euo pipefail
# Repo-root entrypoint — delegates to ios/ci_scripts (Xcode project under ios/).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$SCRIPT_DIR/../ios/ci_scripts/ci_post_clone.sh"
