import { chromium } from "playwright";
import { CHAPTER_EPILOGUES } from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const [chapterText, variants] of Object.entries(CHAPTER_EPILOGUES)) {
  const chapter = Number(chapterText);
  for (const epilogue of variants) {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    try {
      await page.goto(`${base}?screen=summary&chapter=${chapter}&runChoices=${encodeURIComponent(epilogue.choice)}`, {
        waitUntil: "networkidle",
      });
      await page.locator(".summary-epilogue").waitFor();
      const title = await page.locator(".summary-epilogue strong").innerText();
      const body = await page.locator(".summary-epilogue p").innerText();
      if (title !== epilogue.title || body !== epilogue.text) throw new Error(`显示为「${title}」`);
      console.log(`✓ 第 ${chapter} 章 · ${epilogue.title}`);
    } catch (error) {
      failures.push(`第 ${chapter} 章「${epilogue.choice}」：${error.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
}

{
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  try {
    await page.goto(`${base}?screen=reward&chapter=6&stage=3&runChoices=${encodeURIComponent("承担遗憾")}`, {
      waitUntil: "networkidle",
    });
    await page.locator(".reward-skip").click();
    await page.locator(".summary-screen").waitFor();
    const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2")));
    if (!profile.unlockedEpilogues.includes("moon_regret")) throw new Error("人物后记没有写入永久存档");
    if (profile.recentRuns[0]?.epilogue !== "moon_regret") throw new Error("最近战绩没有记录后记分支");
    console.log("✓ 第六章后记写入永久异闻录与最近战绩");
  } catch (error) {
    failures.push(`后记持久化：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Epilogue branch smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Epilogue branch smoke passed: 12 narrative choices resolve to 12 distinct character epilogues.");
