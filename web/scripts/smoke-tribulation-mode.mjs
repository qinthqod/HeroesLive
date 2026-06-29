import { chromium } from "playwright";
import { CHAPTERS, ENCOUNTER_ENEMIES } from "../src/gameData.js";
import { TRIBULATION_LEVELS } from "../src/tribulation.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

const postgameProfile = {
  level: 7,
  xp: 420,
  jade: 860,
  spirit: 32,
  chapter: CHAPTERS.length,
  unlockedJobs: ["sword", "talisman", "alchemy", "beast", "artificer", "soul"],
  talentLevels: { meridian: 2, mind: 1, edge: 0 },
  jobMastery: {},
  unlockedEndings: CHAPTERS.map((chapter) => `chapter_${chapter.id}_ending`),
  completedTribulations: [],
  completedDailyTrials: [],
  discoveredCards: [],
  discoveredTreasures: [],
  unlockedTitles: [],
  equippedTitle: "云游录",
  tutorialFlags: { combat: true },
  feedback: { sound: false, haptics: false, volume: 0 },
};

async function withProfile(profile, callback) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await context.addInitScript((value) => {
    if (!localStorage.getItem("qinglan-profile-v2")) {
      localStorage.setItem("qinglan-profile-v2", JSON.stringify(value));
      localStorage.removeItem("qinglan-run-v1");
    }
  }, profile);
  const page = await context.newPage();
  try {
    await callback(page);
  } finally {
    await context.close();
  }
}

try {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  await page.goto(`${base}?screen=combat&chapter=6&stage=2&tribulation=3&move=0`, { waitUntil: "networkidle" });
  await page.locator(".combat-screen").waitFor();
  const health = await page.locator(".enemy-health strong").innerText();
  const expectedMax = Math.round(ENCOUNTER_ENEMIES[6][2].max * TRIBULATION_LEVELS[3].enemyHpMultiplier);
  if (health !== `${expectedMax}/${expectedMax}`) throw new Error(`命劫精英生命显示为 ${health}，预期 ${expectedMax}/${expectedMax}`);
  const badge = await page.locator(".enemy-tribulation-badge").innerText();
  if (!badge.includes("敌人生命 +40%") || !badge.includes("每段伤害 +3")) throw new Error(`战斗风险提示不完整：${badge}`);
  console.log("✓ 命劫战斗敌人生命与风险提示生效");
  await context.close();
} catch (error) {
  failures.push(`战斗数值：${error.message.split("\n")[0]}`);
}

await withProfile(postgameProfile, async (page) => {
  try {
    await page.goto(`${base}?screen=chapters`, { waitUntil: "networkidle" });
    await page.locator(".tribulation-panel").waitFor();
    await page.locator(".tribulation-options button").filter({ hasText: "心劫" }).click();
    await page.locator(".chapter-card").nth(4).click();
    await page.locator(".story-screen").waitFor();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("qinglan-run-v1") || "null")?.runTribulation?.level === 2);
    const savedRun = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-run-v1") || "null"));
    if (savedRun?.runMode !== "story") throw new Error(`劫数误入模式 ${savedRun?.runMode}`);
    console.log("✓ 通关后章节页可选择心劫并写入新局存档");
  } catch (error) {
    failures.push(`章节选择：${error.message.split("\n")[0]}`);
  }
});

await withProfile(postgameProfile, async (page) => {
  let step = "打开首次首领奖励页";
  try {
    await page.goto(`${base}?screen=reward&chapter=6&stage=3&tribulation=2&origin=sword&runChoices=${encodeURIComponent("承担遗憾")}`, { waitUntil: "networkidle" });
    step = "等待首破奖励提示";
    await page.locator(".tribulation-reward").waitFor();
    step = "点击直接结卷";
    await page.locator(".reward-skip").click();
    step = "等待首次结算页";
    await page.locator(".summary-screen").waitFor();
    step = "等待首破资料写入存档";
    await page.waitForFunction(() => {
      const profile = JSON.parse(localStorage.getItem("qinglan-profile-v2") || "null");
      return profile?.completedTribulations?.includes("6:2") && profile?.jade >= 930;
    });
    const first = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2")));
    if (!first.unlockedTitles.includes("照心见真") || first.equippedTitle !== "照心见真") throw new Error("心劫首破称号未落印");
    const jadeAfterFirst = first.jade;
    step = "打开重复首领奖励页";
    await page.goto(`${base}?screen=reward&chapter=6&stage=3&tribulation=2&origin=sword`, { waitUntil: "networkidle" });
    step = "等待已领取提示";
    await page.locator(".tribulation-reward.claimed").waitFor();
    step = "点击重复结卷";
    await page.locator(".reward-skip").click();
    step = "等待重复结算页";
    await page.locator(".summary-screen").waitFor();
    step = "等待重复结算资料写入";
    await page.waitForFunction((previousJade) => {
      const profile = JSON.parse(localStorage.getItem("qinglan-profile-v2") || "null");
      return profile?.completedTribulations?.filter((key) => key === "6:2").length === 1
        && profile?.jade === previousJade + 120;
    }, jadeAfterFirst);
    const second = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2")));
    const keyCount = second.completedTribulations.filter((key) => key === "6:2").length;
    if (keyCount !== 1) throw new Error(`心劫首破键重复 ${keyCount} 次`);
    if (second.jade !== jadeAfterFirst + 120) throw new Error(`重复挑战额外发放了首破灵玉：${jadeAfterFirst} -> ${second.jade}`);
    console.log("✓ 劫数章末首破奖励只发一次，重复挑战只给常规结卷奖励");
  } catch (error) {
    await page.screenshot({ path: "/tmp/heroeslive-tribulation-reward-failure.png", fullPage: true }).catch(() => {});
    failures.push(`首破奖励（${step}）：${error.message.split("\n")[0]}`);
  }
});

await browser.close();

if (failures.length) {
  console.error(`Tribulation smoke failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Tribulation smoke passed: postgame selection, combat scaling, and first-clear rewards are coherent.");
