#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-/Applications/Godot.app/Contents/MacOS/Godot}"
BUILD_DIR="${ROOT_DIR}/exports/builds"
PLAYABLE_DIR="${ROOT_DIR}/exports/playable"
CHECK_LOG_DIR="${TMPDIR:-/tmp}/qinglan_godot_checks"
STAMP="$(date +%Y%m%d-%H%M%S)"
PRESET="${PRESET:-Web}"

cd "$ROOT_DIR"

mkdir -p "$BUILD_DIR" "$PLAYABLE_DIR" "$CHECK_LOG_DIR"

if [[ "${SKIP_CHECKS:-0}" != "1" ]]; then
	bash scripts/run_checks.sh
else
	"$GODOT_BIN" --headless --path . --script scripts/export_delivery_status.gd
fi

case "$PRESET" in
	Web)
		OUT_DIR="${PLAYABLE_DIR}/qinglan-night-web-${STAMP}"
		OUT_PATH="${OUT_DIR}/index.html"
		ZIP_PATH="${BUILD_DIR}/qinglan-night-web-${STAMP}.zip"
		rm -rf "$OUT_DIR"
		mkdir -p "$OUT_DIR"
		;;
	macOS)
		OUT_DIR="${PLAYABLE_DIR}/qinglan-night-macos-${STAMP}"
		OUT_PATH="${OUT_DIR}/QinglanNight.zip"
		ZIP_PATH="${BUILD_DIR}/qinglan-night-macos-${STAMP}.zip"
		rm -rf "$OUT_DIR"
		mkdir -p "$OUT_DIR"
		;;
	*)
		echo "Unsupported PRESET '${PRESET}'. Supported presets: Web, macOS." >&2
		exit 2
		;;
esac

EXPORT_LOG="${CHECK_LOG_DIR}/package_playable_${PRESET}.log"
"$GODOT_BIN" --headless --log-file "$EXPORT_LOG" --path . --export-release "$PRESET" "$OUT_PATH"
if grep -Eq "SCRIPT ERROR|ERROR: Failed to load script|Parse Error|Export failed" "$EXPORT_LOG"; then
	cat "$EXPORT_LOG"
	echo "Playable export failed. Check preset '${PRESET}' and export templates." >&2
	exit 1
fi

if [[ "$PRESET" == "Web" ]]; then
	cp scripts/serve_playable.py "${OUT_DIR}/serve_playable.py"
	cat > "${OUT_DIR}/PLAY_QINGLAN.command" <<'SCRIPT'
#!/usr/bin/env bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
	exec python3 serve_playable.py
elif command -v python >/dev/null 2>&1; then
	exec python serve_playable.py
fi
echo "未找到 Python 3。请安装 Python 3 后重新双击此文件。"
read -r -p "按回车键关闭..."
SCRIPT
	cat > "${OUT_DIR}/PLAY_QINGLAN.sh" <<'SCRIPT'
#!/usr/bin/env sh
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
	exec python3 serve_playable.py
fi
exec python serve_playable.py
SCRIPT
	cat > "${OUT_DIR}/PLAY_QINGLAN.bat" <<'SCRIPT'
@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 serve_playable.py
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  python serve_playable.py
  goto :eof
)
echo Python 3 is required to launch this Web demo.
pause
SCRIPT
	chmod +x "${OUT_DIR}/serve_playable.py" "${OUT_DIR}/PLAY_QINGLAN.command" "${OUT_DIR}/PLAY_QINGLAN.sh"
	cat > "${OUT_DIR}/PLAYABLE_README.txt" <<INFO
青岚夜行 Web 试玩版
版本：${STAMP}

快速启动：
  macOS：双击 PLAY_QINGLAN.command
  Windows：双击 PLAY_QINGLAN.bat
  Linux：运行 ./PLAY_QINGLAN.sh

启动器会在本机开启临时服务并自动打开浏览器。
关闭启动器窗口即可停止服务，存档保存在浏览器本地存储中。

核心操作：
  P：从标题页直接进入固定种子的快速战斗
  Enter：开始完整三幕试炼
  1-9：出牌或选择选项
  Space：结束回合
  Esc：保存当前试炼并返回标题
INFO
else
	cat > "${OUT_DIR}/PLAYABLE_README.txt" <<INFO
青岚夜行 macOS 试玩版
版本：${STAMP}

解压 QinglanNight.zip 后启动应用。
若 macOS 阻止未签名应用，请在 Finder 中按住 Control 点击应用并选择“打开”。

核心操作：
  P：从标题页直接进入固定种子的快速战斗
  Enter：开始完整三幕试炼
  1-9：出牌或选择选项
  Space：结束回合
  Esc：保存当前试炼并返回标题
INFO
fi

(cd "$OUT_DIR" && zip -r -q "$ZIP_PATH" .)

if [[ "$PRESET" == "Web" && "${VALIDATE_WEB:-0}" == "1" ]]; then
	bash scripts/validate_web_playable.sh "$OUT_DIR"
fi

echo "$ZIP_PATH"
