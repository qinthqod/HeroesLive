import { chromium } from "playwright";
import {
  BOSS_CHOICE_RESPONSES,
  BOSS_PHASES,
  ENCOUNTER_ENEMIES,
} from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const [chapterKey, responses] of Object.entries(BOSS_CHOICE_RESPONSES)) {
  const chapter = Number(chapterKey);
  const phase = BOSS_PHASES[chapter];
  const boss = ENCOUNTER_ENEMIES[chapter][3];
  const startHp = Math.floor(boss.max * phase.threshold) + 10;

  for (const [choice, response] of Object.entries(responses)) {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    try {
      await page.goto(`${base}?screen=combat&chapter=${chapter}&stage=3&origin=alchemy&enemyHp=${startHp}&card=${encodeURIComponent("逆炼血丹")}&qi=3&autoclick=1&runChoices=${encodeURIComponent(choice)}`, {
        waitUntil: "networkidle",
      });
      await page.locator(".combat-screen").waitFor();
      await page.waitForTimeout(1350);

      const echo = await page.locator(".boss-phase em").innerText();
      const line = await page.locator(".boss-phase span").innerText();
      const expectedEnemyShield = Math.max(0, phase.shield + (response.bossShieldDelta || 0));
      const enemyShieldText = expectedEnemyShield > 0
        ? await page.locator(".enemy-statuses .status-shield").innerText()
        : "";
      const playerShieldText = await page.locator(".player-rail .resource").filter({ hasText: "护盾" }).innerText();

      if (!echo.includes(choice)) throw new Error(`抉择回响显示为「${echo}」`);
      if (line !== response.line) throw new Error("首领没有说出对应抉择台词");
      if (expectedEnemyShield > 0 && !enemyShieldText.includes(String(expectedEnemyShield))) {
        throw new Error(`首领护体为「${enemyShieldText}」，期望 ${expectedEnemyShield}`);
      }
      if (response.playerShield && !playerShieldText.includes(String(response.playerShield))) {
        throw new Error(`玩家护盾为「${playerShieldText}」，期望至少包含 ${response.playerShield}`);
      }
      console.log(`✓ 第 ${chapter} 章 · ${choice} → ${response.effect}`);
    } catch (error) {
      failures.push(`第 ${chapter} 章「${choice}」：${error.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
}

await browser.close();

if (failures.length) {
  console.error(`Boss choice response smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Boss choice response smoke passed: 12 story choices alter their chapter Boss transition.");
