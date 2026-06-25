import { chromium } from "playwright";
import {
  BOSS_CHOICE_RESPONSES,
  CHAPTER_BOSS_PRELUDES,
  ENCOUNTER_ENEMIES,
} from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const chapter of Object.keys(CHAPTER_BOSS_PRELUDES).map(Number)) {
  const choice = Object.keys(BOSS_CHOICE_RESPONSES[chapter])[0];
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=bossPrelude&chapter=${chapter}&runChoices=${encodeURIComponent(choice)}`, {
      waitUntil: "networkidle",
    });
    await page.locator(".boss-prelude").waitFor();
    const title = await page.locator(".boss-prelude-copy h1").innerText();
    const echo = await page.locator(".boss-prelude-choice").innerText();
    if (title !== CHAPTER_BOSS_PRELUDES[chapter].name) throw new Error(`场景标题为「${title}」`);
    if (!echo.includes(choice)) throw new Error(`未显示抉择「${choice}」`);

    for (let beat = 0; beat < 4; beat += 1) {
      const action = page.locator(".boss-prelude-action");
      if (beat < 3) {
        await action.click();
      } else {
        const label = await action.innerText();
        if (!label.includes(ENCOUNTER_ENEMIES[chapter][3].name)) throw new Error(`迎战按钮为「${label}」`);
        await action.click();
      }
    }
    await page.locator(".combat-screen").waitFor();
    const bossName = await page.locator(".enemy-title h1").innerText();
    if (bossName !== ENCOUNTER_ENEMIES[chapter][3].name) throw new Error(`进入战斗后首领为「${bossName}」`);
    console.log(`✓ 第 ${chapter} 章 · ${title} → ${bossName}`);
  } catch (error) {
    failures.push(`第 ${chapter} 章：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

for (const viewport of [{ width: 430, height: 932 }, { width: 599, height: 772 }, { width: 960, height: 720 }]) {
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(`${base}?screen=bossPrelude&chapter=6&runChoices=${encodeURIComponent("承担遗憾")}`, {
      waitUntil: "networkidle",
    });
    await page.locator(".boss-prelude-action").waitFor();
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      actionVisible: Boolean(document.querySelector(".boss-prelude-action")?.getBoundingClientRect().width),
    }));
    if (layout.scrollWidth > layout.width) throw new Error(`横向溢出 ${layout.scrollWidth - layout.width}px`);
    if (!layout.actionVisible) throw new Error("迎战流程按钮不可见");
    console.log(`✓ 响应式 ${viewport.width}×${viewport.height}`);
  } catch (error) {
    failures.push(`响应式 ${viewport.width}×${viewport.height}：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Boss prelude smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Boss prelude smoke passed: 6 chapter climaxes enter their correct Boss battles.");
