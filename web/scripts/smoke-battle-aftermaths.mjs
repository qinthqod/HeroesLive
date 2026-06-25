import { chromium } from "playwright";
import {
  BATTLE_AFTERMATHS,
  ENCOUNTER_ENEMIES,
} from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const chapter of Object.keys(BATTLE_AFTERMATHS).map(Number)) {
  for (const stage of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    try {
      await page.goto(`${base}?screen=reward&chapter=${chapter}&stage=${stage}&clues=2`, { waitUntil: "networkidle" });
      await page.locator(".battle-aftermath").waitFor();
      const title = await page.locator(".aftermath-copy strong").innerText();
      const finalWords = await page.locator(".aftermath-copy blockquote").innerText();
      const source = await page.locator(".battle-aftermath > aside").innerText();
      if (title !== BATTLE_AFTERMATHS[chapter][stage].title) throw new Error(`余波标题为「${title}」`);
      if (!finalWords.includes(BATTLE_AFTERMATHS[chapter][stage].finalWords)) throw new Error("敌人遗言未显示");
      if (!source.includes(BATTLE_AFTERMATHS[chapter][stage].rewardSource)) throw new Error("战利来源未显示");
      if (!source.includes("带回证据")) throw new Error("调查证据未显示");
      const imageSource = await page.locator(".battle-aftermath > img").getAttribute("src");
      if (imageSource !== ENCOUNTER_ENEMIES[chapter][stage].art) throw new Error(`余波敌人素材为「${imageSource}」`);
      console.log(`✓ 第 ${chapter} 章 · ${stage === 1 ? "普通" : "精英"}余波 · ${title}`);
    } catch (error) {
      failures.push(`第 ${chapter} 章第 ${stage} 战：${error.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
}

for (const viewport of [{ width: 430, height: 932 }, { width: 599, height: 772 }, { width: 960, height: 720 }]) {
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(`${base}?screen=reward&chapter=6&stage=2&clues=3`, { waitUntil: "networkidle" });
    await page.locator(".battle-aftermath").waitFor();
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      aftermathWidth: document.querySelector(".battle-aftermath")?.getBoundingClientRect().width || 0,
    }));
    if (layout.scrollWidth > layout.width) throw new Error(`横向溢出 ${layout.scrollWidth - layout.width}px`);
    if (!layout.aftermathWidth) throw new Error("战斗余波不可见");
    console.log(`✓ 响应式 ${viewport.width}×${viewport.height}`);
  } catch (error) {
    failures.push(`响应式 ${viewport.width}×${viewport.height}：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Battle aftermath smoke failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Battle aftermath smoke passed: 12 victories preserve story, evidence, and reward provenance.");
