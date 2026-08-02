#!/bin/bash
set -euo pipefail
# Shared helpers for Xcode Cloud (Expo / RN under ios/).

ci_repo_root() {
  local script_dir ios_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ios_dir="$(cd "$script_dir/.." && pwd)"
  cd "$ios_dir/.." && pwd
}

ci_log_env() {
  echo "ci: ---- Xcode Cloud env ----"
  echo "ci: CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset}"
  echo "ci: CI_XCODE_SCHEME=${CI_XCODE_SCHEME:-unset}"
  echo "ci: CI_WORKSPACE=${CI_WORKSPACE:-unset}"
  echo "ci: CI_PRIMARY_REPOSITORY_PATH=${CI_PRIMARY_REPOSITORY_PATH:-unset}"
  echo "ci: CI_DERIVED_DATA_PATH=${CI_DERIVED_DATA_PATH:-unset}"
  echo "ci: CI_XCODEBUILD_ACTION=${CI_XCODEBUILD_ACTION:-unset}"
  echo "ci: RNMAPBOX_MAPS_DOWNLOAD_TOKEN set? $([ -n "${RNMAPBOX_MAPS_DOWNLOAD_TOKEN:-}" ] && echo yes || echo no)"
  echo "ci: ---- end env ----"
}

ci_scripts_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}

ci_shim_bin_dir() {
  echo "$(ci_scripts_dir)/bin"
}

ci_overlay_root() {
  echo "$(ci_scripts_dir)/xcode_overlay"
}

ci_is_xcode_cloud() {
  [ -n "${CI:-}" ] || [ -n "${CI_XCODE_CLOUD:-}" ] || [ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]
}

# Resolve the real Mach-O toolchain binaries (never our shims / overlay).
ci_resolve_real_toolchain() {
  local real_xcodebuild="" real_xcrun=""
  if [ -x /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild ]; then
    real_xcodebuild=/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild
  fi
  if [ -x /usr/bin/xcrun ]; then
    real_xcrun=/usr/bin/xcrun
  elif [ -x /Applications/Xcode.app/Contents/Developer/usr/bin/xcrun ]; then
    real_xcrun=/Applications/Xcode.app/Contents/Developer/usr/bin/xcrun
  fi
  if [ -z "$real_xcodebuild" ] || [ -z "$real_xcrun" ]; then
    echo "error: cannot locate real Xcode toolchain binaries under /Applications/Xcode.app"
    exit 127
  fi
  CI_REAL_XCODEBUILD="$real_xcodebuild"
  CI_REAL_XCRUN="$real_xcrun"
  CI_REAL_DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
}

# Build a minimal DEVELOPER_DIR tree: everything symlinked from real Xcode,
# except usr/bin/xcodebuild + usr/bin/xcrun which point at our LuMap shims.
# /usr/bin/xcodebuild (Apple stub) and xcrun honor DEVELOPER_DIR → our shim runs
# even when Cloud does not use PATH. Absolute /Applications/.../xcodebuild still
# bypasses this (ASC workspace remains belt-and-suspenders).
ci_build_developer_overlay() {
  local real_dev="$1"
  local shim="$2"
  local xcrun_shim="$3"
  local overlay_root overlay contents_dir item base
  overlay_root="$(ci_overlay_root)"
  # Fake Xcode.app layout so Apple's /usr/bin stubs accept the developer path.
  contents_dir="$overlay_root/Xcode.app/Contents"
  overlay="$contents_dir/Developer"

  rm -rf "$overlay_root"
  mkdir -p "$overlay/usr/bin"

  if [ -f "$real_dev/../Info.plist" ]; then
    cp -f "$real_dev/../Info.plist" "$contents_dir/Info.plist" 2>/dev/null || true
  fi
  if [ -f "$real_dev/../version.plist" ]; then
    cp -f "$real_dev/../version.plist" "$contents_dir/version.plist" 2>/dev/null || true
  fi
  if [ -f "$real_dev/../_CodeSignature/CodeResources" ]; then
    mkdir -p "$contents_dir/_CodeSignature"
    # Best-effort; signature may not match but helps some validators.
    cp -f "$real_dev/../_CodeSignature/CodeResources" "$contents_dir/_CodeSignature/" 2>/dev/null || true
  fi

  for item in "$real_dev"/*; do
    [ -e "$item" ] || continue
    base="$(basename "$item")"
    [ "$base" = "usr" ] && continue
    ln -sfn "$item" "$overlay/$base"
  done
  mkdir -p "$overlay/usr"
  for item in "$real_dev/usr"/*; do
    [ -e "$item" ] || continue
    base="$(basename "$item")"
    [ "$base" = "bin" ] && continue
    ln -sfn "$item" "$overlay/usr/$base"
  done
  for item in "$real_dev/usr/bin"/*; do
    [ -e "$item" ] || continue
    base="$(basename "$item")"
    if [ "$base" = "xcodebuild" ] || [ "$base" = "xcrun" ]; then
      continue
    fi
    ln -sfn "$item" "$overlay/usr/bin/$base"
  done

  # Executable copies (not symlinks) so `file`/`which` stay stable if repo moves.
  cp -f "$shim" "$overlay/usr/bin/xcodebuild"
  cp -f "$xcrun_shim" "$overlay/usr/bin/xcrun"
  chmod +x "$overlay/usr/bin/xcodebuild" "$overlay/usr/bin/xcrun"

  # Also keep real_paths.env next to overlay copies (they resolve SELF_DIR to overlay/usr/bin).
  if [ -f "$(ci_shim_bin_dir)/real_paths.env" ]; then
    cp -f "$(ci_shim_bin_dir)/real_paths.env" "$overlay/usr/bin/real_paths.env"
  fi

  CI_OVERLAY_DEVELOPER_DIR="$overlay"
  echo "ci: built DEVELOPER_DIR overlay at $overlay"
}

# Prepend LuMap xcodebuild/xcrun shims, install DEVELOPER_DIR overlay on Cloud,
# and force CI_XCODE_PROJECT to the CocoaPods workspace when ASC still has .xcodeproj.
ci_install_xcodebuild_shim() {
  local root="$1"
  local bin_dir shim xcrun_shim workspace_abs
  bin_dir="$(ci_shim_bin_dir)"
  shim="$bin_dir/xcodebuild"
  xcrun_shim="$bin_dir/xcrun"
  workspace_abs="$root/ios/LuMap.xcworkspace"

  if [ ! -f "$shim" ]; then
    echo "error: missing shim at $shim"
    exit 127
  fi
  chmod +x "$shim" "$xcrun_shim" 2>/dev/null || true

  # Remember ASC's original value once (before we override it).
  if [ -z "${CI_XCODE_PROJECT_ASC_ORIGINAL:-}" ]; then
    export CI_XCODE_PROJECT_ASC_ORIGINAL="${CI_XCODE_PROJECT:-unset}"
  fi

  ci_resolve_real_toolchain
  # Persist absolute real binaries + workspace for shims (PATH / overlay copies).
  {
    echo "REAL_XCODEBUILD=${CI_REAL_XCODEBUILD}"
    echo "REAL_XCRUN=${CI_REAL_XCRUN}"
    if [ -d "$workspace_abs" ]; then
      echo "WORKSPACE_PATH=${workspace_abs}"
    fi
  } > "$bin_dir/real_paths.env"
  echo "ci: wrote $bin_dir/real_paths.env"

  mkdir -p "$HOME/bin" 2>/dev/null || true
  cp -f "$shim" "$HOME/bin/xcodebuild" 2>/dev/null || true
  cp -f "$xcrun_shim" "$HOME/bin/xcrun" 2>/dev/null || true
  cp -f "$bin_dir/real_paths.env" "$HOME/bin/real_paths.env" 2>/dev/null || true
  chmod +x "$HOME/bin/xcodebuild" "$HOME/bin/xcrun" 2>/dev/null || true

  export PATH="$bin_dir:$HOME/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

  local real_dev="$CI_REAL_DEVELOPER_DIR"

  if ci_is_xcode_cloud; then
    ci_build_developer_overlay "$real_dev" "$shim" "$xcrun_shim"
    export DEVELOPER_DIR="$CI_OVERLAY_DEVELOPER_DIR"
    echo "ci: DEVELOPER_DIR overlay=$DEVELOPER_DIR (xcodebuild/xcrun → shim)"
    # Best-effort: some Cloud spawners inherit launchd env.
    launchctl setenv DEVELOPER_DIR "$DEVELOPER_DIR" 2>/dev/null || true
    launchctl setenv PATH "$PATH" 2>/dev/null || true
    if [ -d "$workspace_abs" ]; then
      launchctl setenv CI_XCODE_PROJECT "$workspace_abs" 2>/dev/null || true
    fi
  else
    # Local: never leave DEVELOPER_DIR on a broken overlay/FakeDeveloper.
    export DEVELOPER_DIR="$real_dev"
    echo "ci: DEVELOPER_DIR=$DEVELOPER_DIR (local — no overlay)"
  fi

  if [ -d "$workspace_abs" ]; then
    export CI_XCODE_PROJECT="$workspace_abs"
    echo "ci: exported CI_XCODE_PROJECT=$CI_XCODE_PROJECT (ASC original=${CI_XCODE_PROJECT_ASC_ORIGINAL:-unset})"
  else
    echo "ci: WARN — workspace missing at $workspace_abs (pod install may not have run yet)"
  fi

  # Persist PATH / DEVELOPER_DIR for shells some Cloud images spawn for xcodebuild.
  if ci_is_xcode_cloud; then
    for rc in "$HOME/.zshenv" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
      touch "$rc" 2>/dev/null || continue
      # Refresh marker block on every install so DEVELOPER_DIR stays current.
      if grep -q 'LuMap ci_scripts/bin xcodebuild shim' "$rc" 2>/dev/null; then
        # Strip previous block (from marker through next blank-or-EOF is fragile);
        # append a fresh export line each time via a unique latest file instead.
        :
      fi
      {
        echo ""
        echo "# LuMap ci_scripts/bin xcodebuild shim ($(date -u +%Y%m%dT%H%M%SZ))"
        echo "export PATH=\"$bin_dir:\$HOME/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:\$PATH\""
        echo "export DEVELOPER_DIR=\"${DEVELOPER_DIR:-$real_dev}\""
        if [ -d "$workspace_abs" ]; then
          echo "export CI_XCODE_PROJECT=\"$workspace_abs\""
        fi
      } >> "$rc"
    done
  fi

  echo "ci: xcodebuild shim ready which=$(command -v xcodebuild)"
  echo "ci: xcrun shim ready which=$(command -v xcrun)"
  echo "ci: DEVELOPER_DIR=${DEVELOPER_DIR:-unset}"
  echo "ci: REAL_XCODEBUILD=$CI_REAL_XCODEBUILD"
}

# Smoke-test: PATH + DEVELOPER_DIR invocations must hit the rewrite shim.
ci_verify_xcodebuild_shim() {
  local root="$1"
  local workspace="$root/ios/LuMap.xcworkspace"
  local project="$root/ios/LuMap.xcodeproj"
  local log probe_out
  if [ ! -d "$workspace" ] || [ ! -d "$project" ]; then
    echo "ci: shim verify skipped (workspace/project missing)"
    return 0
  fi
  log="${CI_DERIVED_DATA_PATH:-${TMPDIR:-/tmp}}/ci_xcodebuild_shim.log"
  rm -f "$log" 2>/dev/null || true
  probe_out="$(mktemp "${TMPDIR:-/tmp}/ci-shim-probe.XXXXXX")"
  set +e
  # -version ignores -project/-workspace for the build, but our shim still rewrites argv + logs.
  xcodebuild -project "$project" -scheme LuMap -version >"$probe_out" 2>&1
  set -e
  if grep -q 'ci_xcodebuild_shim: rewrote LuMap.xcodeproj' "$probe_out" 2>/dev/null \
    || grep -q 'rewrote=1' "$log" 2>/dev/null; then
    echo "ci: shim verify OK (PATH xcodebuild rewrote .xcodeproj → .xcworkspace)"
  else
    echo "ci: WARN — PATH xcodebuild did not log a rewrite (Cloud may use absolute /Applications path)"
    echo "ci: probe head:"; head -20 "$probe_out" 2>/dev/null || true
  fi
  if [ -n "${DEVELOPER_DIR:-}" ] && [ -x "${DEVELOPER_DIR}/usr/bin/xcodebuild" ]; then
    rm -f "$log" 2>/dev/null || true
    set +e
    "${DEVELOPER_DIR}/usr/bin/xcodebuild" -project "$project" -scheme LuMap -version >"$probe_out" 2>&1
    set -e
    if grep -q 'ci_xcodebuild_shim: rewrote' "$probe_out" 2>/dev/null \
      || grep -q 'rewrote=1' "$log" 2>/dev/null; then
      echo "ci: shim verify OK (DEVELOPER_DIR/usr/bin/xcodebuild rewrite)"
    else
      echo "ci: WARN — DEVELOPER_DIR xcodebuild rewrite not observed"
    fi
  fi
  rm -f "$probe_out" 2>/dev/null || true
}

ci_prepare_path() {
  export HOMEBREW_NO_AUTO_UPDATE=1
  export LANG=en_US.UTF-8
  export LC_ALL=en_US.UTF-8
  export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/bin:$PATH"
  # Drop leftover local FakeDeveloper / stale overlay paths from previous experiments.
  # ci_install_xcodebuild_shim re-applies the Cloud overlay afterwards.
  case "${DEVELOPER_DIR:-}" in
    *XcodeCloudFakeDeveloper* | *FakeDeveloper* | *xcode_overlay* | *LuMapXcodeShimDeveloper*)
      unset DEVELOPER_DIR 2>/dev/null || true
      ;;
  esac
  if [ -d /Applications/Xcode.app/Contents/Developer ]; then
    export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
  fi

  if ! command -v node >/dev/null 2>&1; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "error: weder node noch brew auf PATH (Xcode Cloud image)"
      exit 127
    fi
    echo "ci: installing node via Homebrew"
    brew install node@22 || brew install node
    brew link --force --overwrite node@22 2>/dev/null || true
    # Homebrew may install without linking onto PATH for the current shell.
    export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
  fi

  if ! command -v pod >/dev/null 2>&1; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "error: weder pod noch brew auf PATH (Xcode Cloud image)"
      exit 127
    fi
    echo "ci: installing cocoapods via Homebrew"
    brew install cocoapods
  fi

  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "error: node/npm fehlt nach setup"
    exit 127
  fi
  if ! command -v pod >/dev/null 2>&1; then
    echo "error: pod fehlt nach setup"
    exit 127
  fi

  echo "ci: node=$(command -v node) $(node -v 2>/dev/null || true)"
  echo "ci: npm=$(command -v npm) $(npm -v 2>/dev/null || true)"
  echo "ci: pod=$(command -v pod) $(pod --version 2>/dev/null || true)"
}

ci_npm_install() {
  local root="$1"
  cd "$root"
  echo "ci: package.json deps include react-native-maps / expo-location (Apple Maps)"
  if [ -f package-lock.json ]; then
    echo "ci: npm ci"
    if ! npm ci; then
      echo "ci: npm ci failed — retrying with npm install"
      npm install
    fi
  else
    echo "ci: npm install"
    npm install
  fi
  # Sanity: Expo + Apple Maps packages must resolve for autolinking / pods.
  node -e "require.resolve('expo/package.json'); require.resolve('react-native-maps/package.json'); require.resolve('expo-location/package.json'); console.log('ci: npm deps ok (expo, react-native-maps, expo-location)')"
}

# Run pod install through tee without masking the real exit code.
# With `set -o pipefail`, `${PIPESTATUS[0]}` is the pod exit; tee is [1].
ci_run_pod_install() {
  local extra_args=("$@")
  local pod_log pod_status
  pod_log="$(mktemp "${TMPDIR:-/tmp}/ci-pod-install.XXXXXX")"
  set +e
  pod install "${extra_args[@]}" 2>&1 | tee "$pod_log"
  pod_status=${PIPESTATUS[0]}
  set -e
  if [ "$pod_status" -ne 0 ]; then
    echo "ci: pod install exit=$pod_status"
    if grep -Eiq 'mapbox|RNMapbox|RNMAPBOX|download.?token|api\.mapbox\.com|401|403' "$pod_log"; then
      echo "error: Looks Mapbox-related. Either remove unused @rnmapbox/maps, or set ASC Environment Variable RNMAPBOX_MAPS_DOWNLOAD_TOKEN (secret download token from mapbox.com)."
    fi
    rm -f "$pod_log"
    return "$pod_status"
  fi
  rm -f "$pod_log"
  return 0
}

# Embed Pods/Pods.xcodeproj into LuMap.xcodeproj (LuMap → Pods-LuMap dependency)
# so Archive with -project still builds CocoaPods. Idempotent; requires xcodeproj gem.
ci_embed_pods_in_xcodeproj() {
  local root="$1"
  local script="$root/ios/ci_scripts/embed_pods_in_xcodeproj.rb"
  if [ ! -f "$script" ]; then
    echo "ci: WARN — embed script missing at $script"
    return 1
  fi
  if [ ! -d "$root/ios/Pods/Pods.xcodeproj" ]; then
    echo "ci: WARN — Pods.xcodeproj missing; skip embed"
    return 1
  fi
  echo "ci: embedding Pods.xcodeproj into LuMap.xcodeproj"
  if ruby "$script"; then
    echo "ci: pods embed OK"
    return 0
  fi
  echo "ci: WARN — pods embed failed (Archive via .xcodeproj may miss Expo modules)"
  return 1
}

# True when LuMap.xcodeproj already depends on Pods-LuMap (subproject embed).
ci_pods_embedded_in_xcodeproj() {
  local root="$1"
  local pbx="$root/ios/LuMap.xcodeproj/project.pbxproj"
  [ -f "$pbx" ] || return 1
  grep -q 'Pods/Pods.xcodeproj' "$pbx" 2>/dev/null || return 1
  grep -q 'name = "Pods-LuMap"' "$pbx" 2>/dev/null || return 1
  grep -q 'PBXTargetDependency' "$pbx" 2>/dev/null || return 1
  return 0
}

ci_pod_install() {
  local root="$1"
  cd "$root/ios"

  # Mapbox: download token is no longer required by current Mapbox SDKs, but
  # older / misconfigured @rnmapbox installs may still ask. Prefer env secret
  # if ASC provides one; never fail solely because it is unset.
  if [ -n "${RNMAPBOX_MAPS_DOWNLOAD_TOKEN:-}" ]; then
    echo "ci: RNMAPBOX_MAPS_DOWNLOAD_TOKEN is set (will be used if rnmapbox pods need it)"
    export RNMAPBOX_MAPS_DOWNLOAD_TOKEN
  else
    echo "ci: RNMAPBOX_MAPS_DOWNLOAD_TOKEN unset (ok if @rnmapbox/maps is not a dependency)"
  fi

  echo "ci: pod install (cwd=$(pwd))"
  # Prefer lockfile sync first (faster, deterministic). Fall back to repo-update.
  if ! ci_run_pod_install; then
    echo "ci: pod install failed — retrying with --repo-update"
    if ! ci_run_pod_install --repo-update; then
      echo "error: pod install failed"
      exit 1
    fi
  fi

  if [ ! -f Podfile.lock ]; then
    echo "error: Podfile.lock fehlt nach pod install"
    exit 1
  fi
  if [ ! -d LuMap.xcworkspace ]; then
    echo "error: LuMap.xcworkspace fehlt nach pod install"
    exit 1
  fi
  echo "ci: pods ok — workspace=$(pwd)/LuMap.xcworkspace"

  # Embed Pods.xcodeproj into LuMap.xcodeproj so Archive via -project still builds pods
  # (ASC may still point at .xcodeproj; PATH/DEVELOPER_DIR shims miss absolute xcodebuild).
  if ! ci_embed_pods_in_xcodeproj "$root"; then
    echo "ci: WARN — continuing without embed (prefer ASC → ios/LuMap.xcworkspace)"
  fi
}

# True when ASC already points at the CocoaPods workspace.
# Accepts absolute/relative paths and any string containing LuMap.xcworkspace
# (ASC sometimes passes full paths vs ios/LuMap.xcworkspace).
ci_workspace_configured() {
  local project="${CI_XCODE_PROJECT:-}"
  local base
  base="$(basename "${project:-}")"
  echo "ci: CI_XCODE_PROJECT=${project:-unset} (basename=${base:-unset})"

  case "$project" in
    *LuMap.xcworkspace* | *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
  esac
  case "$base" in
    LuMap.xcworkspace | *.xcworkspace)
      echo "ci: workflow already points at xcworkspace — good"
      return 0
      ;;
  esac
  return 1
}

# Write a small artifact next to ci_scripts so Archive logs show the ASC path
# even when the UI collapses long script output.
ci_write_workspace_diag() {
  local diag_dir status_line
  status_line="${1:-unknown}"
  # BASH_SOURCE here is ci_common.sh (this file), which lives in ios/ci_scripts/.
  diag_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  {
    echo "status=${status_line}"
    echo "CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset}"
    echo "CI_XCODE_PROJECT_ASC_ORIGINAL=${CI_XCODE_PROJECT_ASC_ORIGINAL:-unset}"
    echo "CI_XCODE_SCHEME=${CI_XCODE_SCHEME:-unset}"
    echo "CI_WORKSPACE=${CI_WORKSPACE:-unset}"
    echo "CI_XCODEBUILD_ACTION=${CI_XCODEBUILD_ACTION:-unset}"
    echo "shim=$(ci_shim_bin_dir)/xcodebuild"
    echo "expected=ios/LuMap.xcworkspace"
    date -u +"utc=%Y-%m-%dT%H:%M:%SZ"
  } > "$diag_dir/CI_XCODE_PROJECT.txt"
  echo "ci: wrote $diag_dir/CI_XCODE_PROJECT.txt (status=${status_line})"
  # Repeat on its own line — easy to grep in Archive → Logs.
  echo "ci: DIAG CI_XCODE_PROJECT=${CI_XCODE_PROJECT:-unset} ASC_ORIGINAL=${CI_XCODE_PROJECT_ASC_ORIGINAL:-unset}"
}

ci_print_workspace_fix_message() {
  local project="${CI_XCODE_PROJECT:-}"
  local severity="${1:-warn}"
  if [ "$severity" = "error" ]; then
    # Xcode Cloud surfaces lines starting with "error:" as the Archive issue.
    echo "error: Xcode Cloud Workflow muss ios/LuMap.xcworkspace nutzen — aktuell CI_XCODE_PROJECT='${project:-unset}'."
  else
    echo "ci: WARN — ASC Workflow sollte ios/LuMap.xcworkspace nutzen — aktuell CI_XCODE_PROJECT='${project:-unset}'. xcodebuild-Shim schreibt LuMap.xcodeproj → LuMap.xcworkspace um."
  fi
  cat <<'EOF'

================================================================================
Xcode Cloud should build ios/LuMap.xcworkspace (not LuMap.xcodeproj)

Expo / CocoaPods Archive requires the workspace *or* Pods embedded in the
.xcodeproj (this repo does both). With only the naked .xcodeproj and no embed,
Pods (Expo, react-native-maps, …) are skipped → "No such module 'Expo'".

This repo:
  • embeds Pods/Pods.xcodeproj into LuMap.xcodeproj (LuMap → Pods-LuMap) after
    each pod install so -project Archive still builds pods
  • also installs a DEVELOPER_DIR overlay + xcodebuild/xcrun shims that rewrite
    -project …/LuMap.xcodeproj → -workspace …/LuMap.xcworkspace when possible

Absolute /Applications/.../xcodebuild may still bypass shims — set ASC to the
workspace when you can:



  1. https://appstoreconnect.apple.com → Apps → LuMap → Xcode Cloud
  2. Workflow „Default“ → Edit Workflow → Environment
  3. Xcode Project or Workspace:
       ios/LuMap.xcworkspace
     (NOT ios/LuMap.xcodeproj)
  4. Save → Start Build

Direct link (team + app):
  https://appstoreconnect.apple.com/apps/6796983748/ci

Expected CI_XCODE_PROJECT value: a path containing LuMap.xcworkspace
EOF
  echo "Actual CI_XCODE_PROJECT='${project:-unset}'"
  echo "================================================================================"
}

# Soft check for post_clone: never abort npm/pod work; only warn loudly.
ci_warn_unless_workspace() {
  if ci_workspace_configured; then
    ci_write_workspace_diag "ok-workspace"
    return 0
  fi
  echo "ci: WARN — ASC still points at .xcodeproj; continuing so npm/pods still run."
  ci_write_workspace_diag "warn-xcodeproj"
  ci_print_workspace_fix_message "warn"
  return 0
}

# Archive gate: prefer ASC workspace; else pods-embed and/or xcodebuild shim.
# Soft-gate: never hard-fail when Pods are embedded into LuMap.xcodeproj.
ci_require_workspace_or_explain() {
  local root="$1"
  local shim asc_orig
  shim="$(ci_shim_bin_dir)/xcodebuild"
  asc_orig="${CI_XCODE_PROJECT_ASC_ORIGINAL:-${CI_XCODE_PROJECT:-}}"

  # Already a workspace according to (possibly overridden) env.
  if ci_workspace_configured; then
    case "$asc_orig" in
      *LuMap.xcworkspace* | *.xcworkspace)
        ci_write_workspace_diag "ok-workspace"
        return 0
        ;;
      *)
        # We overrode CI_XCODE_PROJECT ourselves — still need shim for Cloud's argv.
        if [ -x "$shim" ] && [ -d "$root/ios/LuMap.xcworkspace" ]; then
          echo "ci: ASC original was .xcodeproj (${asc_orig}) — shim + CI_XCODE_PROJECT override active."
          ci_write_workspace_diag "shim-override"
          ci_print_workspace_fix_message "warn"
          return 0
        fi
        ;;
    esac
  fi

  # Primary fallback after Build 20: Pods embedded in .xcodeproj (no ASC/shim needed).
  if ci_pods_embedded_in_xcodeproj "$root"; then
    echo "ci: ASC still has .xcodeproj — Pods embedded in LuMap.xcodeproj (Pods-LuMap dependency); continuing."
    ci_write_workspace_diag "embed-xcodeproj"
    ci_print_workspace_fix_message "warn"
    return 0
  fi

  if [ -x "$shim" ] && [ -d "$root/ios/LuMap.xcworkspace" ]; then
    echo "ci: ASC still has .xcodeproj — proceeding with xcodebuild shim (rewrite to workspace)."
    ci_write_workspace_diag "shim-xcodeproj"
    ci_print_workspace_fix_message "warn"
    return 0
  fi

  echo "FATAL: ASC points at .xcodeproj, pods not embedded, and xcodebuild shim/workspace unavailable"
  ci_write_workspace_diag "fatal-xcodeproj"
  ci_print_workspace_fix_message "error"
  exit 1
}
