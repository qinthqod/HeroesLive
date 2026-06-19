#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${1:-}"
CHECK_LOG_DIR="${TMPDIR:-/tmp}/qinglan_godot_checks"
ARTIFACT_DIR="${ROOT_DIR}/exports/validation"

cd "$ROOT_DIR"

if [[ -z "$WEB_DIR" ]]; then
	WEB_DIR="$(find exports/playable -maxdepth 1 -type d -name 'qinglan-night-web-*' 2>/dev/null | sort | tail -n 1)"
fi

if [[ -z "$WEB_DIR" || ! -d "$WEB_DIR" ]]; then
	echo "No Web playable directory found. Run: bash scripts/package_playable.sh" >&2
	exit 1
fi

for required_file in index.html index.js index.wasm index.pck; do
	if [[ ! -f "${WEB_DIR}/${required_file}" ]]; then
		echo "Missing Web playable file: ${WEB_DIR}/${required_file}" >&2
		exit 1
	fi
done

NODE_BIN="${NODE_BIN:-}"
NODE_MODULE_DIR="${NODE_MODULE_DIR:-}"
CODEX_NODE="/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
CODEX_NODE_MODULES="/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"

if [[ -z "$NODE_BIN" ]]; then
	if command -v node >/dev/null 2>&1; then
		NODE_BIN="$(command -v node)"
	elif [[ -x "$CODEX_NODE" ]]; then
		NODE_BIN="$CODEX_NODE"
	fi
fi

if [[ -z "$NODE_MODULE_DIR" && -d "$CODEX_NODE_MODULES" ]]; then
	NODE_MODULE_DIR="$CODEX_NODE_MODULES"
fi

if [[ -z "$NODE_BIN" ]]; then
	echo "Node.js is required for Web playable validation. Set NODE_BIN=/path/to/node." >&2
	exit 1
fi

CHROME_BIN="${CHROME_BIN:-}"
if [[ -z "$CHROME_BIN" ]]; then
	for candidate in \
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
		"/Applications/Chromium.app/Contents/MacOS/Chromium"; do
		if [[ -x "$candidate" ]]; then
			CHROME_BIN="$candidate"
			break
		fi
	done
fi

PYTHON_BIN="${PYTHON_BIN:-}"
if [[ -z "$PYTHON_BIN" ]]; then
	if command -v python3 >/dev/null 2>&1; then
		PYTHON_BIN="$(command -v python3)"
	else
		PYTHON_BIN="/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
	fi
fi

if [[ ! -x "$PYTHON_BIN" ]]; then
	echo "python3 is required to serve the Web playable. Set PYTHON_BIN=/path/to/python3." >&2
	exit 1
fi

mkdir -p "$CHECK_LOG_DIR" "$ARTIFACT_DIR"

PORT="$("$PYTHON_BIN" - <<'PY'
import socket
sock = socket.socket()
sock.bind(("127.0.0.1", 0))
print(sock.getsockname()[1])
sock.close()
PY
)"

SERVER_LOG="${CHECK_LOG_DIR}/web_playable_http.log"
(cd "$WEB_DIR" && "$PYTHON_BIN" -m http.server "$PORT" --bind 127.0.0.1 >"$SERVER_LOG" 2>&1) &
SERVER_PID=$!
cleanup() {
	kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

VALIDATOR_JS="${CHECK_LOG_DIR}/validate_web_playable.js"
TITLE_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-title.png"
MANDATE_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-mandate.png"
MAP_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-validation.png"
ROUTE_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-route-result.png"
NARROW_MANDATE_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-narrow-mandate.png"
NARROW_MAP_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-narrow-map.png"
COMBAT_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-combat.png"
NARROW_COMBAT_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-narrow-combat.png"
COMBAT_PLAYED_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-combat-card-played.png"
COMBAT_TURN_TWO_SCREENSHOT_PATH="${ARTIFACT_DIR}/web-playable-combat-turn-two.png"
cat > "$VALIDATOR_JS" <<'JS'
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('fs');

const url = process.argv[2];
const titleScreenshotPath = process.argv[3];
const mandateScreenshotPath = process.argv[4];
const mapScreenshotPath = process.argv[5];
const routeScreenshotPath = process.argv[6];
const narrowMandateScreenshotPath = process.argv[7];
const narrowMapScreenshotPath = process.argv[8];
const combatScreenshotPath = process.argv[9];
const narrowCombatScreenshotPath = process.argv[10];
const combatPlayedScreenshotPath = process.argv[11];
const combatTurnTwoScreenshotPath = process.argv[12];

function readPng(path) {
  return PNG.sync.read(fs.readFileSync(path));
}

function sampledColorBuckets(image) {
  let sampled = 0;
  const colors = new Set();
  const stepX = Math.max(1, Math.floor(image.width / 64));
  const stepY = Math.max(1, Math.floor(image.height / 36));
  for (let y = 0; y < image.height; y += stepY) {
    for (let x = 0; x < image.width; x += stepX) {
      const idx = (image.width * y + x) << 2;
      const r = image.data[idx];
      const g = image.data[idx + 1];
      const b = image.data[idx + 2];
      const a = image.data[idx + 3];
      if (a > 0) {
        colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
        sampled += 1;
      }
    }
  }
  return { sampled, colorBuckets: colors.size };
}

function sampledDifference(first, second) {
  if (first.width !== second.width || first.height !== second.height) return 1;
  let different = 0;
  let sampled = 0;
  const stepX = Math.max(1, Math.floor(first.width / 96));
  const stepY = Math.max(1, Math.floor(first.height / 54));
  for (let y = 0; y < first.height; y += stepY) {
    for (let x = 0; x < first.width; x += stepX) {
      const idx = (first.width * y + x) << 2;
      const delta =
        Math.abs(first.data[idx] - second.data[idx]) +
        Math.abs(first.data[idx + 1] - second.data[idx + 1]) +
        Math.abs(first.data[idx + 2] - second.data[idx + 2]);
      if (delta >= 36) different += 1;
      sampled += 1;
    }
  }
  return sampled > 0 ? different / sampled : 0;
}

function lowerHalfActivity(image) {
  const bg = [image.data[0], image.data[1], image.data[2]];
  let active = 0;
  let sampled = 0;
  const stepX = Math.max(1, Math.floor(image.width / 128));
  const stepY = Math.max(1, Math.floor(image.height / 72));
  for (let y = Math.floor(image.height * 0.48); y < image.height; y += stepY) {
    for (let x = 0; x < image.width; x += stepX) {
      const idx = (image.width * y + x) << 2;
      const delta =
        Math.abs(image.data[idx] - bg[0]) +
        Math.abs(image.data[idx + 1] - bg[1]) +
        Math.abs(image.data[idx + 2] - bg[2]);
      if (delta >= 42) active += 1;
      sampled += 1;
    }
  }
  return sampled > 0 ? active / sampled : 0;
}

function interactionBandActivity(image) {
  const bg = [image.data[0], image.data[1], image.data[2]];
  let active = 0;
  let sampled = 0;
  const stepX = Math.max(1, Math.floor(image.width / 128));
  const stepY = Math.max(1, Math.floor(image.height / 72));
  for (let y = Math.floor(image.height * 0.20); y < Math.floor(image.height * 0.62); y += stepY) {
    for (let x = 0; x < image.width; x += stepX) {
      const idx = (image.width * y + x) << 2;
      const delta =
        Math.abs(image.data[idx] - bg[0]) +
        Math.abs(image.data[idx + 1] - bg[1]) +
        Math.abs(image.data[idx + 2] - bg[2]);
      if (delta >= 42) active += 1;
      sampled += 1;
    }
  }
  return sampled > 0 ? active / sampled : 0;
}

function centralRightEdgeActivity(image) {
  const bg = [image.data[0], image.data[1], image.data[2]];
  let active = 0;
  let sampled = 0;
  for (let y = Math.floor(image.height * 0.38); y < Math.floor(image.height * 0.82); y += 3) {
    for (let x = image.width - 4; x < image.width; x += 1) {
      const idx = (image.width * y + x) << 2;
      const delta =
        Math.abs(image.data[idx] - bg[0]) +
        Math.abs(image.data[idx + 1] - bg[1]) +
        Math.abs(image.data[idx + 2] - bg[2]);
      if (delta >= 42) active += 1;
      sampled += 1;
    }
  }
  return sampled > 0 ? active / sampled : 0;
}

(async () => {
  const launchOptions = { headless: true };
  if (process.env.CHROME_BIN) {
    launchOptions.executablePath = process.env.CHROME_BIN;
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (message) => {
    const text = message.text();
    if (/error|failed|exception/i.test(text)) consoleMessages.push(text);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.waitForTimeout(6000);
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const rect = canvas ? canvas.getBoundingClientRect() : { width: 0, height: 0 };
    return {
      title: document.title,
      canvasCount: document.querySelectorAll('canvas').length,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      visible: !!canvas && rect.width > 100 && rect.height > 100,
      bodyText: document.body ? document.body.innerText.slice(0, 500) : ''
    };
  });
  if (!canvasInfo.visible) {
    throw new Error(`Godot canvas is not visible: ${JSON.stringify(canvasInfo)}`);
  }
  await page.screenshot({ path: titleScreenshotPath, fullPage: false });
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 640, y: 360 } });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: mandateScreenshotPath, fullPage: false });
  await page.keyboard.press('Digit1');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: mapScreenshotPath, fullPage: false });
  await page.keyboard.press('Digit1');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: routeScreenshotPath, fullPage: false });

  const narrowPage = await browser.newPage({ viewport: { width: 960, height: 720 } });
  narrowPage.on('console', (message) => {
    const text = message.text();
    if (/error|failed|exception/i.test(text)) consoleMessages.push(`[narrow] ${text}`);
  });
  narrowPage.on('pageerror', (error) => pageErrors.push(`[narrow] ${error.message}`));
  await narrowPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await narrowPage.waitForSelector('canvas', { timeout: 60000 });
  await narrowPage.waitForTimeout(6000);
  const narrowCanvas = narrowPage.locator('canvas');
  await narrowCanvas.click({ position: { x: 480, y: 360 } });
  await narrowPage.keyboard.press('Enter');
  await narrowPage.waitForTimeout(1500);
  await narrowPage.screenshot({ path: narrowMandateScreenshotPath, fullPage: false });
  await narrowPage.keyboard.press('Digit1');
  await narrowPage.waitForTimeout(1500);
  await narrowPage.screenshot({ path: narrowMapScreenshotPath, fullPage: false });

  const combatPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  combatPage.on('console', (message) => {
    const text = message.text();
    if (/error|failed|exception/i.test(text)) consoleMessages.push(`[combat] ${text}`);
  });
  combatPage.on('pageerror', (error) => pageErrors.push(`[combat] ${error.message}`));
  await combatPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await combatPage.waitForSelector('canvas', { timeout: 60000 });
  await combatPage.waitForTimeout(6000);
  const combatCanvas = combatPage.locator('canvas');
  await combatCanvas.click({ position: { x: 640, y: 360 } });
  await combatPage.keyboard.press('KeyP');
  await combatPage.waitForTimeout(2000);
  await combatPage.screenshot({ path: combatScreenshotPath, fullPage: false });
  await combatPage.keyboard.press('Digit3');
  await combatPage.waitForTimeout(1000);
  await combatPage.screenshot({ path: combatPlayedScreenshotPath, fullPage: false });
  await combatPage.keyboard.press('Space');
  await combatPage.waitForTimeout(1200);
  await combatPage.screenshot({ path: combatTurnTwoScreenshotPath, fullPage: false });

  const narrowCombatPage = await browser.newPage({ viewport: { width: 960, height: 720 } });
  narrowCombatPage.on('console', (message) => {
    const text = message.text();
    if (/error|failed|exception/i.test(text)) consoleMessages.push(`[narrow-combat] ${text}`);
  });
  narrowCombatPage.on('pageerror', (error) => pageErrors.push(`[narrow-combat] ${error.message}`));
  await narrowCombatPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await narrowCombatPage.waitForSelector('canvas', { timeout: 60000 });
  await narrowCombatPage.waitForTimeout(6000);
  const narrowCombatCanvas = narrowCombatPage.locator('canvas');
  await narrowCombatCanvas.click({ position: { x: 480, y: 360 } });
  await narrowCombatPage.keyboard.press('KeyP');
  await narrowCombatPage.waitForTimeout(2000);
  await narrowCombatPage.screenshot({ path: narrowCombatScreenshotPath, fullPage: false });
  await browser.close();

  const titleImage = readPng(titleScreenshotPath);
  const mandateImage = readPng(mandateScreenshotPath);
  const mapImage = readPng(mapScreenshotPath);
  const routeImage = readPng(routeScreenshotPath);
  const narrowMandateImage = readPng(narrowMandateScreenshotPath);
  const narrowMapImage = readPng(narrowMapScreenshotPath);
  const combatImage = readPng(combatScreenshotPath);
  const narrowCombatImage = readPng(narrowCombatScreenshotPath);
  const combatPlayedImage = readPng(combatPlayedScreenshotPath);
  const combatTurnTwoImage = readPng(combatTurnTwoScreenshotPath);
  const mapColorStats = sampledColorBuckets(mapImage);
  if (mapColorStats.sampled < 100 || mapColorStats.colorBuckets < 6) {
    throw new Error(`Map screenshot appears blank or too uniform: ${JSON.stringify(mapColorStats)}`);
  }
  const titleToMandate = sampledDifference(titleImage, mandateImage);
  const mandateToMap = sampledDifference(mandateImage, mapImage);
  const mapToRoute = sampledDifference(mapImage, routeImage);
  const narrowMandateToMap = sampledDifference(narrowMandateImage, narrowMapImage);
  const titleToCombat = sampledDifference(titleImage, combatImage);
  const narrowMandateToCombat = sampledDifference(narrowMandateImage, narrowCombatImage);
  const combatToPlayed = sampledDifference(combatImage, combatPlayedImage);
  const playedToTurnTwo = sampledDifference(combatPlayedImage, combatTurnTwoImage);
  const mandateLowerActivity = lowerHalfActivity(mandateImage);
  const mapLowerActivity = lowerHalfActivity(mapImage);
  const narrowMandateInteractionActivity = interactionBandActivity(narrowMandateImage);
  const narrowMapInteractionActivity = interactionBandActivity(narrowMapImage);
  const combatLowerActivity = lowerHalfActivity(combatImage);
  const narrowCombatLowerActivity = lowerHalfActivity(narrowCombatImage);
  const mandateRightEdgeActivity = centralRightEdgeActivity(mandateImage);
  const mapRightEdgeActivity = centralRightEdgeActivity(mapImage);
  const narrowMandateRightEdgeActivity = centralRightEdgeActivity(narrowMandateImage);
  const narrowMapRightEdgeActivity = centralRightEdgeActivity(narrowMapImage);
  const combatRightEdgeActivity = centralRightEdgeActivity(combatImage);
  const narrowCombatRightEdgeActivity = centralRightEdgeActivity(narrowCombatImage);
  if (titleToMandate < 0.03) {
    throw new Error(`Enter did not visibly advance from title to mandate choice: diff=${titleToMandate.toFixed(4)}`);
  }
  if (mandateToMap < 0.008) {
    throw new Error(`Digit1 did not visibly advance from mandate choice to map: diff=${mandateToMap.toFixed(4)}`);
  }
  if (mapToRoute < 0.008) {
    throw new Error(`Digit1 did not visibly resolve the first map route: diff=${mapToRoute.toFixed(4)}`);
  }
  if (narrowMandateToMap < 0.008) {
    throw new Error(`Narrow viewport did not visibly advance from mandate choice to map: diff=${narrowMandateToMap.toFixed(4)}`);
  }
  if (titleToCombat < 0.08 || narrowMandateToCombat < 0.05) {
    throw new Error(
      `Quick battle did not produce a distinct combat scene: ` +
      `desktop=${titleToCombat.toFixed(4)} narrow=${narrowMandateToCombat.toFixed(4)}`
    );
  }
  if (combatToPlayed < 0.015) {
    throw new Error(`Playing the third card did not visibly change combat state: diff=${combatToPlayed.toFixed(4)}`);
  }
  if (playedToTurnTwo < 0.025) {
    throw new Error(`Ending the turn did not visibly advance enemy action and redraw: diff=${playedToTurnTwo.toFixed(4)}`);
  }
  if (mandateLowerActivity < 0.025) {
    throw new Error(`Mandate choices are not visibly present in the lower viewport: activity=${mandateLowerActivity.toFixed(4)}`);
  }
  if (mapLowerActivity < 0.025) {
    throw new Error(`Map choices are not visibly present in the lower viewport: activity=${mapLowerActivity.toFixed(4)}`);
  }
  if (narrowMandateInteractionActivity < 0.025 || narrowMapInteractionActivity < 0.025) {
    throw new Error(
      `Narrow viewport choices are not visibly present: ` +
      `mandate=${narrowMandateInteractionActivity.toFixed(4)} map=${narrowMapInteractionActivity.toFixed(4)}`
    );
  }
  if (combatLowerActivity < 0.04 || narrowCombatLowerActivity < 0.04) {
    throw new Error(
      `Combat hand and controls are not visibly present in the lower viewport: ` +
      `desktop=${combatLowerActivity.toFixed(4)} narrow=${narrowCombatLowerActivity.toFixed(4)}`
    );
  }
  if (mandateRightEdgeActivity > 0.02 || mapRightEdgeActivity > 0.02) {
    throw new Error(
      `Choice controls appear clipped at the right viewport edge: ` +
      `mandate=${mandateRightEdgeActivity.toFixed(4)} map=${mapRightEdgeActivity.toFixed(4)}`
    );
  }
  if (narrowMandateRightEdgeActivity > 0.02 || narrowMapRightEdgeActivity > 0.02) {
    throw new Error(
      `Narrow viewport controls appear clipped at the right edge: ` +
      `mandate=${narrowMandateRightEdgeActivity.toFixed(4)} map=${narrowMapRightEdgeActivity.toFixed(4)}`
    );
  }
  if (combatRightEdgeActivity > 0.02 || narrowCombatRightEdgeActivity > 0.02) {
    throw new Error(
      `Combat controls appear clipped at the right edge: ` +
      `desktop=${combatRightEdgeActivity.toFixed(4)} narrow=${narrowCombatRightEdgeActivity.toFixed(4)}`
    );
  }
  if (pageErrors.length > 0) {
    throw new Error(`Page errors: ${pageErrors.join(' | ')}`);
  }
  const severeConsole = consoleMessages.filter((text) => !/AudioContext|SharedArrayBuffer|favicon/i.test(text));
  if (severeConsole.length > 0) {
    throw new Error(`Console errors: ${severeConsole.slice(0, 5).join(' | ')}`);
  }
  console.log(
    `Web playable validation passed: ${JSON.stringify(canvasInfo)} ` +
    `titleToMandate=${titleToMandate.toFixed(4)} mandateToMap=${mandateToMap.toFixed(4)} mapToRoute=${mapToRoute.toFixed(4)} ` +
    `narrowMandateToMap=${narrowMandateToMap.toFixed(4)} titleToCombat=${titleToCombat.toFixed(4)} narrowMandateToCombat=${narrowMandateToCombat.toFixed(4)} ` +
    `combatToPlayed=${combatToPlayed.toFixed(4)} playedToTurnTwo=${playedToTurnTwo.toFixed(4)} ` +
    `mandateLowerActivity=${mandateLowerActivity.toFixed(4)} mapLowerActivity=${mapLowerActivity.toFixed(4)} ` +
    `narrowMandateInteractionActivity=${narrowMandateInteractionActivity.toFixed(4)} narrowMapInteractionActivity=${narrowMapInteractionActivity.toFixed(4)} ` +
    `combatLowerActivity=${combatLowerActivity.toFixed(4)} narrowCombatLowerActivity=${narrowCombatLowerActivity.toFixed(4)} ` +
    `mandateRightEdgeActivity=${mandateRightEdgeActivity.toFixed(4)} mapRightEdgeActivity=${mapRightEdgeActivity.toFixed(4)} ` +
    `narrowMandateRightEdgeActivity=${narrowMandateRightEdgeActivity.toFixed(4)} narrowMapRightEdgeActivity=${narrowMapRightEdgeActivity.toFixed(4)} ` +
    `combatRightEdgeActivity=${combatRightEdgeActivity.toFixed(4)} narrowCombatRightEdgeActivity=${narrowCombatRightEdgeActivity.toFixed(4)} ` +
    `screenshots=${titleScreenshotPath},${mandateScreenshotPath},${mapScreenshotPath},${routeScreenshotPath},${narrowMandateScreenshotPath},${narrowMapScreenshotPath},${combatScreenshotPath},${narrowCombatScreenshotPath},${combatPlayedScreenshotPath},${combatTurnTwoScreenshotPath}`
  );
})().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
JS

NODE_PATH="${NODE_MODULE_DIR}${NODE_PATH:+:${NODE_PATH}}" CHROME_BIN="$CHROME_BIN" "$NODE_BIN" "$VALIDATOR_JS" \
	"http://127.0.0.1:${PORT}/index.html" \
	"$TITLE_SCREENSHOT_PATH" \
	"$MANDATE_SCREENSHOT_PATH" \
	"$MAP_SCREENSHOT_PATH" \
	"$ROUTE_SCREENSHOT_PATH" \
	"$NARROW_MANDATE_SCREENSHOT_PATH" \
	"$NARROW_MAP_SCREENSHOT_PATH" \
	"$COMBAT_SCREENSHOT_PATH" \
	"$NARROW_COMBAT_SCREENSHOT_PATH" \
	"$COMBAT_PLAYED_SCREENSHOT_PATH" \
	"$COMBAT_TURN_TWO_SCREENSHOT_PATH"
