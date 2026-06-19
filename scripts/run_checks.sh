#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-/Applications/Godot.app/Contents/MacOS/Godot}"
CHECK_LOG_DIR="${TMPDIR:-/tmp}/qinglan_godot_checks"
CHECK_HOME_DIR="${TMPDIR:-/tmp}/qinglan_godot_home_$$"
GODOT_APP_LOG_DIR="${CHECK_HOME_DIR}/Library/Application Support/Godot/app_userdata/Mortal Cultivation Card Roguelike/logs"
cd "$ROOT_DIR"

mkdir -p "$GODOT_APP_LOG_DIR"
mkdir -p "$CHECK_LOG_DIR"

run_check() {
	local name="$1"
	shift
	local log_name="${name// /_}"
	local log_path="${CHECK_LOG_DIR}/${log_name}.log"
	echo "==> ${name}"
	HOME="$CHECK_HOME_DIR" "$GODOT_BIN" --headless --log-file "${log_path}" --path . "$@"
	if grep -Eq "SCRIPT ERROR|ERROR: Failed to load script|Parse Error" "${log_path}"; then
		cat "${log_path}"
		echo "FAIL: ${name}"
		exit 1
	fi
	echo "PASS: ${name}"
}

run_check "boot main scene" "scenes/Main.tscn" "--quit-after" "1"
run_check "image2 queue export" "--script" "scripts/export_image2_queue.gd"
run_check "image2 batch prompt export" "--script" "scripts/export_image2_batch_prompts.gd"
run_check "delivery status export" "--script" "scripts/export_delivery_status.gd"
run_check "data integrity" "--script" "scripts/check_integrity.gd"
run_check "image2 gap report" "--script" "scripts/report_image2_gaps.gd"
run_check "image2 import list" "--script" "scripts/import_image2_asset.gd" "--" "--list"
run_check "image2 missing list" "--script" "scripts/import_image2_asset.gd" "--" "--missing"
run_check "image2 import fit self-test" "--script" "scripts/import_image2_asset.gd" "--" "--self-test-fit"
run_check "package manifest" "--script" "scripts/check_package_manifest.gd"
run_check "smoke flow" "--script" "scripts/smoke_flow.gd"
run_check "smoke seed replay" "--script" "scripts/smoke_seed_replay.gd"
run_check "smoke defeat" "--script" "scripts/smoke_defeat.gd"
run_check "smoke victory" "--script" "scripts/smoke_victory.gd"

echo "All checks passed."
