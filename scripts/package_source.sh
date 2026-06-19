#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-/Applications/Godot.app/Contents/MacOS/Godot}"
BUILD_DIR="${ROOT_DIR}/exports/builds"
TMP_DIR="${ROOT_DIR}/exports/tmp/source_package"
STAMP="$(date +%Y%m%d-%H%M%S)"
PACKAGE_NAME="qinglan-night-source-${STAMP}.zip"
PACKAGE_PATH="${BUILD_DIR}/${PACKAGE_NAME}"

cd "$ROOT_DIR"

if [[ "${SKIP_CHECKS:-0}" != "1" ]]; then
	bash scripts/run_checks.sh
else
	"$GODOT_BIN" --headless --path . --script scripts/export_delivery_status.gd
fi

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
mkdir -p "$BUILD_DIR"

cat > "${TMP_DIR}/BUILD_INFO.txt" <<INFO
青岚夜行 source package
Created: ${STAMP}

Run:
  /Applications/Godot.app/Contents/MacOS/Godot --path .

Playable export:
  bash scripts/package_playable.sh

Playable browser validation:
  bash scripts/validate_web_playable.sh <exports/playable/qinglan-night-web-*>

Verify:
  bash scripts/run_checks.sh

Delivery status:
  docs/delivery_status.md

Package:
  bash scripts/package_source.sh
INFO

zip -r -q "$PACKAGE_PATH" \
	project.godot \
	export_presets.cfg \
	icon.svg \
	icon.svg.import \
	README.md \
	assets \
	scenes \
	scripts \
	docs \
	-x "*/.DS_Store" \
	-x ".godot/*" \
	-x "exports/*"

zip -j -q "$PACKAGE_PATH" "${TMP_DIR}/BUILD_INFO.txt"
rm -rf "$TMP_DIR"

echo "$PACKAGE_PATH"
