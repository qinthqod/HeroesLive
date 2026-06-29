import {
  PROGRESS_GOALS,
  claimProgressGoal,
  formatProgressReward,
  nextProgressGoals,
  progressSummaries,
} from "../src/progressGoals.js";
import { CHAPTERS } from "../src/gameData.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const sampleProfile = {
  discoveredCards: Array.from({ length: 80 }, (_, index) => `card-${index}`),
  discoveredTreasures: ["a", "b", "c"],
  investigationArchive: { 1: ["a", "b", "c", "d", "e", "f", "g"], 2: ["h", "i"] },
  unlockedEndings: ["chapter_1_ending", "chapter_2_ending"],
  jobMastery: { sword: 75 },
  recentRuns: [{ grade: "乙上" }],
  claimedProgressGoals: [],
};

expect(CHAPTERS.length >= 25, "挑战卷校验必须运行在 25 章主线版本上");
expect(PROGRESS_GOALS.length >= 12, "挑战卷至少需要覆盖 25 章主线阶梯、收集、调查、流派、熟练度和评阶");
for (const milestone of [5, 10, 15, 20, 25]) {
  expect(PROGRESS_GOALS.some((goal) => goal.target === milestone && goal.metric({ unlockedEndings: Array.from({ length: milestone }, (_, index) => `chapter_${index + 1}_ending`) }) === milestone), `挑战卷缺少 ${milestone} 章主线里程碑`);
}
expect(PROGRESS_GOALS.some((goal) => goal.id === "grand_casebooks" && goal.target >= 100), "二十五章宗卷需要百证级长期目标");
for (const goal of PROGRESS_GOALS) {
  expect(goal.id && goal.title && goal.hook && Number.isFinite(goal.target) && goal.reward, `${goal.id || "unknown"} 缺少目标或奖励配置`);
  expect(formatProgressReward(goal.reward).includes("称号"), `${goal.id} 奖励缺少可见称号反馈`);
  const summary = progressSummaries(sampleProfile).find((item) => item.id === goal.id);
  expect(summary && Number.isFinite(summary.current) && Number.isFinite(summary.percent), `${goal.id} 无法计算进度`);
  expect(summary.percent >= 0 && summary.percent <= 100, `${goal.id} 进度百分比越界`);
  expect(typeof summary.claimed === "boolean" && typeof summary.claimable === "boolean", `${goal.id} 缺少领取状态`);
}
const next = nextProgressGoals(sampleProfile, 2);
expect(next.length === 2, "首页应能选出两个下一目标");
expect(next.every((goal) => "complete" in goal && "current" in goal), "下一目标必须带有完成态和当前进度");

const completedProfile = {
  ...sampleProfile,
  level: 4,
  xp: 95,
  jade: 10,
  spirit: 2,
  unlockedEndings: ["chapter_1_ending"],
};
const firstClaim = claimProgressGoal(completedProfile, "first_truth");
expect(firstClaim.claimed, "已完成挑战应允许领取");
expect(firstClaim.profile.jade === 90 && firstClaim.profile.spirit === 5, "领取应准确结算灵玉与悟道");
expect(firstClaim.profile.xp === 115 && firstClaim.profile.level >= 4, "领取应结算修为并保持等级单调");
expect(firstClaim.profile.claimedProgressGoals.includes("first_truth"), "领取后必须写入永久锁");
expect(firstClaim.profile.equippedTitle === "初改命途", "领取后应装备里程碑称号");
const secondClaim = claimProgressGoal(firstClaim.profile, "first_truth");
expect(!secondClaim.claimed && secondClaim.reason === "claimed", "同一挑战不可重复领取");
expect(secondClaim.profile.jade === firstClaim.profile.jade, "重复领取不得增加资源");
const incompleteClaim = claimProgressGoal(sampleProfile, "hundred_cards");
expect(!incompleteClaim.claimed && incompleteClaim.reason === "incomplete", "未完成挑战不可提前领取");
const prioritized = nextProgressGoals(completedProfile, 1);
expect(prioritized[0]?.id === "first_truth" && prioritized[0]?.claimable, "首页应优先显示待领取挑战");
const duplicateFateProfile = {
  ...sampleProfile,
  unlockedEndings: ["chapter_1_ending", "chapter_2_ending", "chapter_3_ending", "restore_fate", "rewrite_fate"],
};
const fivePaths = progressSummaries(duplicateFateProfile).find((goal) => goal.id === "five_paths");
expect(fivePaths.current === 4, "第五章两个结局不得被误算成两个已完成章节");
const fullStoryProfile = {
  ...sampleProfile,
  unlockedEndings: CHAPTERS.map((chapter) => `chapter_${chapter.id}_ending`),
};
const finalMilestone = progressSummaries(fullStoryProfile).find((goal) => goal.id === "twenty_five_free_world");
expect(finalMilestone?.complete && finalMilestone.current === 25, "完成 25 章后必须点亮自在终卷挑战");

if (failures.length) {
  console.error(`Progress goal check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Progress goal check passed: challenge goals expose bounded progress, idempotent rewards, titles, and claim priority.");
