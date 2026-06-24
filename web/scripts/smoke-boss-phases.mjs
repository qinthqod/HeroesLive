import { chromium } from "playwright";
import { BOSS_PHASES, ENCOUNTER_ENEMIES } from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const chapter of Object.keys(BOSS_PHASES).map(Number)) {
  const phase = BOSS_PHASES[chapter];
  const boss = ENCOUNTER_ENEMIES[chapter][3];
  const startHp = Math.floor(boss.max * phase.threshold) + 10;
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=combat&chapter=${chapter}&stage=3&origin=alchemy&enemyHp=${startHp}&card=逆炼血丹&qi=3&autoclick=1`, {
      waitUntil: "networkidle",
    });
    await page.locator(".combat-screen").waitFor();
    await page.waitForTimeout(1300);
    const phaseLabel = await page.locator(".boss-phase small").innerText();
    const intent = await page.locator(".intent strong").innerText();
    const shield = await page.locator(".enemy-statuses .status-shield").innerText();
    if (!phaseLabel.includes(phase.name)) throw new Error(`阶段显示为「${phaseLabel}」`);
    if (!intent.includes(phase.moves[0].name)) throw new Error(`转相后首招为「${intent}」`);
    if (!shield.includes(String(phase.shield))) throw new Error(`转相护体为「${shield}」`);
    console.log(`✓ 第 ${chapter} 章 · ${phase.name}`);
  } catch (error) {
    failures.push(`第 ${chapter} 章：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Boss phase smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Boss phase smoke passed: ${Object.keys(BOSS_PHASES).length} two-phase bosses.`);
