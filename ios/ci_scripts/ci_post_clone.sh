#!/bin/bash
set -euo pipefail
# Xcode Cloud: project lives under ios/ — scripts must sit next to it.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$IOS_DIR/.." && pwd)"

echo "ci_post_clone: REPO_ROOT=$REPO_ROOT"
cd "$REPO_ROOT"

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

cd "$IOS_DIR"
export LANG=en_US.UTF-8
# Keep sandbox in sync with committed Podfile.lock (Xcode Cloud error otherwise).
pod install --repo-update

echo "ci_post_clone: done"
ls -la "$IOS_DIR" | head -20
