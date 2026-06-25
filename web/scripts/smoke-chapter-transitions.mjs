import { chromium } from "playwright";
import { CHAPTERS, CHAPTER_TRANSITIONS } from "../src/gameData.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const chapter of CHAPTERS) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=summary&chapter=${chapter.id}&origin=alchemy`, { waitUntil: "networkidle" });
    await page.locator(".chapter-transition").waitFor();
    const title = await page.locator(".chapter-transition > div > strong").innerText();
    const hook = await page.locator(".chapter-transition > aside b").innerText();
    const continueCount = await page.locator(".summary-continue").count();
    if (title !== CHAPTER_TRANSITIONS[chapter.id].title) throw new Error(`桥梁标题为「${title}」`);
    if (hook !== CHAPTER_TRANSITIONS[chapter.id].hook) throw new Error(`下一章目标为「${hook}」`);
    if (chapter.id < CHAPTERS.length && continueCount !== 1) throw new Error("非终章缺少继续主线按钮");
    if (chapter.id === CHAPTERS.length && continueCount !== 0) throw new Error("终章不应显示继续主线按钮");
    console.log(`✓ 第 ${chapter.id} 章 · ${CHAPTER_TRANSITIONS[chapter.id].eyebrow}`);
  } catch (error) {
    failures.push(`第 ${chapter.id} 章：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  try {
    await page.goto(`${base}?screen=reward&chapter=1&stage=3&origin=alchemy&runChoices=${encodeURIComponent("留下回信")}`, { waitUntil: "networkidle" });
    await page.locator(".reward-skip").click();
    await page.locator(".summary-screen").waitFor();
    await page.locator(".summary-continue").click();
    await page.locator(".story-screen").waitFor();
    const storyChapter = await page.locator(".story-progress span").innerText().catch(() => "");
    const savedRun = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-run-v1") || "null"));
    if (savedRun?.selectedChapter !== 2) throw new Error(`连续远征进入第 ${savedRun?.selectedChapter || "?"} 章`);
    if (savedRun?.origin !== "alchemy") throw new Error(`连续远征职业变为「${savedRun?.origin}」`);
    if (savedRun?.screen !== "story") throw new Error(`新章存档页面为「${savedRun?.screen}」`);
    if (savedRun?.deck?.length !== 12) throw new Error(`新章没有按肉鸽规则重置起始牌组（${savedRun?.deck?.length}）`);
    if (!storyChapter && !(await page.locator(".story-screen").isVisible())) throw new Error("第二章剧情未显示");
    console.log("✓ 第一章结算沿线索进入第二章，保留职业并重新起牌");
  } catch (error) {
    failures.push(`连续远征：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

{
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=summary&chapter=2`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const root = document.querySelector("#root");
      if (root) root.dataset.test = "ready";
    });
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      transitionWidth: document.querySelector(".chapter-transition")?.getBoundingClientRect().width || 0,
    }));
    if (layout.scrollWidth > layout.width) throw new Error(`横向溢出 ${layout.scrollWidth - layout.width}px`);
    if (!layout.transitionWidth) throw new Error("章节桥梁不可见");
    console.log("✓ 章节桥梁移动端无横向溢出");
  } catch (error) {
    failures.push(`响应式：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Chapter transition smoke failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Chapter transition smoke passed: six endings bridge the campaign and preserve roguelike run boundaries.");
