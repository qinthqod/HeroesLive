import { chromium } from "playwright";
import {
  ENCOUNTER_ENEMIES,
  ENCOUNTER_PRELUDES,
} from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const chapter of Object.keys(ENCOUNTER_PRELUDES).map(Number)) {
  for (const stage of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    try {
      await page.goto(`${base}?screen=encounterPrelude&chapter=${chapter}&stage=${stage}`, { waitUntil: "networkidle" });
      await page.locator(".encounter-prelude").waitFor();
      const title = await page.locator(".encounter-prelude-copy h1").innerText();
      const lesson = await page.locator(".encounter-prelude-lesson").innerText();
      if (title !== ENCOUNTER_PRELUDES[chapter][stage].title) throw new Error(`登场标题为「${title}」`);
      if (!lesson.includes(stage === 1 ? "本章机制" : "精英考核")) throw new Error(`机制标签为「${lesson}」`);
      await page.locator(".encounter-prelude-copy > button").click();
      const action = page.locator(".encounter-prelude-copy > button");
      const actionText = await action.innerText();
      if (!actionText.includes(ENCOUNTER_ENEMIES[chapter][stage].name)) throw new Error(`迎战按钮为「${actionText}」`);
      await action.click();
      await page.locator(".combat-screen").waitFor();
      const enemyName = await page.locator(".enemy-title h1").innerText();
      if (enemyName !== ENCOUNTER_ENEMIES[chapter][stage].name) throw new Error(`进入战斗后敌人为「${enemyName}」`);
      const storage = await page.evaluate(() => ({
        run: JSON.parse(localStorage.getItem("qinglan-run-v1") || "null"),
        profile: JSON.parse(localStorage.getItem("qinglan-profile-v2") || "null"),
      }));
      if (storage.run?.screen !== "combat" || storage.run?.pendingEncounterStage !== stage) throw new Error("遭遇阶段未正确写入自动存档");
      if (!(storage.profile?.seenEncounters || []).includes(`${chapter}:${stage}`)) throw new Error("已调查遭遇未写入跨局记录");
      if (chapter === 6 && stage === 2) {
        await page.goto(`${base}?screen=encounterPrelude&chapter=6&stage=2`, { waitUntil: "networkidle" });
        const repeatedAction = await page.locator(".encounter-prelude-copy > button").innerText();
        if (!repeatedAction.includes(ENCOUNTER_ENEMIES[6][2].name)) throw new Error(`重复遭遇仍显示「${repeatedAction}」`);
        const seenLabel = await page.locator(".encounter-seen").innerText();
        if (!seenLabel.includes("跳过第一段")) throw new Error("重复遭遇未显示加速说明");
        console.log("✓ 重复遭遇自动跳过第一段对白");
      }
      console.log(`✓ 第 ${chapter} 章 · ${stage === 1 ? "普通" : "精英"} · ${enemyName}`);
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
    await page.goto(`${base}?screen=encounterPrelude&chapter=6&stage=2`, { waitUntil: "networkidle" });
    await page.locator(".encounter-prelude-copy > button").waitFor();
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      buttonWidth: document.querySelector(".encounter-prelude-copy > button")?.getBoundingClientRect().width || 0,
    }));
    if (layout.scrollWidth > layout.width) throw new Error(`横向溢出 ${layout.scrollWidth - layout.width}px`);
    if (!layout.buttonWidth) throw new Error("行动按钮不可见");
    console.log(`✓ 响应式 ${viewport.width}×${viewport.height}`);
  } catch (error) {
    failures.push(`响应式 ${viewport.width}×${viewport.height}：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Encounter prelude smoke failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Encounter prelude smoke passed: 12 chapter encounters enter the correct battles.");
