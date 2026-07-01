import { chromium } from "playwright";
import { CHAPTERS, CHAPTER_STORIES, CHAPTER_STORY_CHOICES } from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const chapter of CHAPTERS) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  try {
    await page.goto(`${base}?screen=story&chapter=${chapter.id}`, { waitUntil: "networkidle" });
    await page.locator(".story-context").waitFor();
    const contextText = await page.locator(".story-context").innerText();
    if (!contextText.includes(chapter.name) || !contextText.includes(chapter.region)) throw new Error("剧情页缺少章节名或地域锚点");
    const tempoText = await page.locator(".story-tempo-card").innerText();
    if (!tempoText.includes("序") || !tempoText.includes("入境蓄势")) throw new Error("剧情页缺少序破急节奏提示");
    const chapterArt = await page.locator(".story-chapter-art").getAttribute("src");
    if (!chapterArt?.includes(chapter.art.split("/").at(-1))) throw new Error("剧情页幕布未绑定当前章节主视觉");
    const seen = [];
    for (let index = 0; index < CHAPTER_STORIES[chapter.id].length; index += 1) {
      await page.locator(".story-dialogue").waitFor();
      seen.push(await page.locator(".story-dialogue h1").innerText());
      const choices = CHAPTER_STORY_CHOICES[chapter.id]?.[index] || [];
      if (choices.length) {
        const buttons = page.locator(".story-choices button");
        if (await buttons.count() !== 2) throw new Error(`第 ${index + 1} 幕没有两个抉择`);
        await buttons.first().click();
      } else {
        await page.locator(".story-next").click();
      }
      if (index < CHAPTER_STORIES[chapter.id].length - 1) {
        await page.waitForFunction((previous) => document.querySelector(".story-dialogue h1")?.textContent !== previous, seen.at(-1));
      }
    }
    await page.locator(".campaign-map").waitFor();
    if (seen.length !== 5) throw new Error(`只读到 ${seen.length} 幕`);
    if (new Set(seen).size < 3) throw new Error("叙事角色变化不足");
    if (chapter.id === 1) {
      const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2")));
      if (!profile.unlockedLore.includes("shen-handbook-1")) throw new Error("五幕完成后未解锁砚秋手札");
      if (profile.spirit !== 40) throw new Error(`首次阅读后的悟道为 ${profile.spirit}`);
    }
    console.log(`✓ 第 ${chapter.id} 章 · 5 幕 / 2 次抉择`);
  } catch (error) {
    failures.push(`第 ${chapter.id} 章：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Story lore smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Story lore smoke passed: ${CHAPTERS.length} chapters, 30 scenes, 12 decision points.`);
