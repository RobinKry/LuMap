#!/bin/bash
set -euo pipefail
# Xcode Cloud: restore JS deps before archive.
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci
npx pod-install ios || (cd ios && pod install)
