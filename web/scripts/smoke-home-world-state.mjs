import { chromium } from "playwright";
import {
  CHAPTERS,
  CHAPTER_HOME_STATES,
  CHAPTER_INVESTIGATIONS,
} from "../src/gameData.js";
import { investigationEvidence } from "../src/investigationArchive.js";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

const states = [
  { label: "新档", chapter: 1, endings: [], current: 1 },
  { label: "中期", chapter: 4, endings: ["chapter_1_ending", "chapter_2_ending", "chapter_3_ending"], current: 4 },
  { label: "终局", chapter: 6, endings: ["chapter_1_ending", "chapter_2_ending", "chapter_3_ending", "chapter_4_ending", "restore_fate", "chapter_6_ending"], current: 6, complete: true },
];

for (const state of states) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await context.addInitScript((profile) => {
    localStorage.setItem("qinglan-profile-v2", JSON.stringify({
      level: 20,
      xp: 0,
      jade: 0,
      spirit: 0,
      chapter: profile.chapter,
      unlockedJobs: ["sword", "talisman", "alchemy", "beast", "artificer", "soul"],
      completedNodes: [],
      choices: [],
      unlockedLore: [],
      talentLevels: { meridian: 0, mind: 0, edge: 0 },
      jobMastery: {},
      discoveredTreasures: [],
      discoveredCards: [],
      unlockedEndings: profile.endings,
      unlockedEpilogues: [],
      investigationArchive: {},
      investigationRewards: [],
      chapterFailures: {},
      recentRuns: [],
      claimedProgressGoals: [],
      unlockedTitles: [],
      equippedTitle: "云游录",
      completedDailyTrials: [],
      tutorialFlags: {},
      feedback: { sound: false, haptics: false, volume: 0 },
    }));
  }, state);
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    const homeTitle = await page.locator(".home-player h1").innerText();
    const homeKicker = await page.locator(".home-player .section-index").innerText();
    const cta = await page.locator(".chapter-continue").innerText();
    const investigation = await page.locator(".daily-thread h2").innerText();
    const expectedState = CHAPTER_HOME_STATES[state.complete ? "complete" : state.current];
    if (homeTitle.replace(/\n/g, "").replace(/\s/g, "") !== expectedState.title.replace(/\n/g, "").replace(/\s/g, "")) throw new Error(`首页标题为「${homeTitle}」`);
    if (homeKicker !== expectedState.kicker) throw new Error(`首页阶段为「${homeKicker}」`);
    if (!cta.includes(CHAPTERS[state.current - 1].name)) throw new Error(`主线入口为「${cta}」`);
    if (investigation !== CHAPTER_INVESTIGATIONS[state.current].objective) throw new Error(`当前调查为「${investigation}」`);
    if (state.complete) await page.screenshot({ path: "/tmp/heroeslive-home-complete.png", fullPage: true });

    await page.locator(".mobile-nav button").filter({ hasText: "云游" }).click();
    await page.locator(".chapter-list").waitFor();
    await page.waitForTimeout(650);
    const currentCount = await page.locator(".chapter-card.current").count();
    const completedCount = await page.locator(".chapter-card.completed").count();
    if (!state.complete && currentCount !== 1) throw new Error(`当前主线卡数量为 ${currentCount}`);
    if (state.complete && currentCount !== 0) throw new Error("终局仍标记当前主线");
    if (completedCount !== state.endings.length) throw new Error(`已结卷数量为 ${completedCount}`);
    if (state.complete && await page.locator(".chapter-main-complete").count() !== 1) throw new Error("终局缺少自由重访说明");
    const replayGoalCount = await page.locator(".chapter-replay-goals").count();
    const firstReplayText = await page.locator(".chapter-card").first().innerText();
    if (replayGoalCount !== CHAPTERS.length) throw new Error(`章节复玩目标数量为 ${replayGoalCount}`);
    for (const phrase of ["证据", "后记", "劫数", "下一目标"]) {
      if (!firstReplayText.includes(phrase)) throw new Error(`章节卡缺少复玩字段 ${phrase}`);
    }
    if (state.complete) await page.screenshot({ path: "/tmp/heroeslive-chapters-complete.png", fullPage: true });
    console.log(`✓ ${state.label} · 山门第 ${state.current} 章状态`);
  } catch (error) {
    failures.push(`${state.label}：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await context.addInitScript(({ evidence, chapter }) => {
    localStorage.setItem("qinglan-profile-v2", JSON.stringify({
      level: 20, xp: 0, jade: 0, spirit: 0, chapter,
      unlockedJobs: ["sword", "talisman", "alchemy", "beast", "artificer", "soul"],
      talentLevels: {}, jobMastery: {}, unlockedEndings: [], investigationArchive: { [String(chapter)]: evidence },
    }));
  }, { chapter: 3, evidence: investigationEvidence(3) });
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    const status = await page.locator(".daily-thread > strong").innerText();
    if (status !== `${investigationEvidence(3).length}/${investigationEvidence(3).length}`) throw new Error(`宗卷进度为「${status}」`);
    if (!await page.locator(".daily-thread").getAttribute("class").then((value) => value.includes("completed"))) throw new Error("宗卷完成态未高亮");
    console.log("✓ 当前章节宗卷完成态");
  } catch (error) {
    failures.push(`宗卷完成态：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await context.addInitScript(() => {
    localStorage.setItem("qinglan-profile-v2", JSON.stringify({
      level: 20,
      xp: 0,
      jade: 0,
      spirit: 0,
      chapter: 2,
      unlockedJobs: ["sword", "talisman", "alchemy", "beast", "artificer", "soul"],
      completedNodes: [],
      choices: [],
      unlockedLore: [],
      talentLevels: { meridian: 0, mind: 0, edge: 0 },
      jobMastery: {},
      discoveredTreasures: [],
      discoveredCards: [],
      unlockedEndings: ["chapter_1_ending"],
      unlockedEpilogues: [],
      investigationArchive: {},
      investigationRewards: [],
      chapterFailures: {},
      recentRuns: [],
      claimedProgressGoals: [],
      unlockedTitles: [],
      equippedTitle: "云游录",
      completedDailyTrials: [],
      tutorialFlags: {},
      feedback: { sound: false, haptics: false, volume: 0 },
    }));
  });
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator(".challenge-goal.claimable button").click();
    await page.locator(".progress-reward-toast").waitFor();
    const toast = await page.locator(".progress-reward-toast").innerText();
    const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2")));
    if (!toast.includes("挑战卷已落印") || !toast.includes("新称号") || !toast.includes("下一枚印记")) throw new Error(`挑战领取反馈不完整：「${toast}」`);
    if (!profile.claimedProgressGoals.includes("first_truth")) throw new Error("挑战领取未写入永久锁");
    if (profile.equippedTitle !== "初改命途") throw new Error(`领取后称号为「${profile.equippedTitle}」`);
    console.log("✓ 挑战卷领取显示落印反馈并写入永久锁");
  } catch (error) {
    failures.push(`挑战卷领取：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Home world state smoke failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Home world state smoke passed: the gate reflects new, mid-campaign, and completed saves.");
