import { CHAPTERS, DECK_RECIPES, TREASURES } from "./gameData.js";
import { investigationEvidence } from "./investigationArchive.js";

const gradeRank = { 丁: 1, 丙: 2, 乙: 3, 乙上: 4, 甲: 5, 甲上: 6 };

function completedStoryChapters(profile) {
  const chapters = new Set();
  for (const ending of profile.unlockedEndings || []) {
    const chapter = String(ending).match(/^chapter_(\d+)_ending$/)?.[1];
    if (chapter) chapters.add(Number(chapter));
    if (ending === "restore_fate" || ending === "rewrite_fate") chapters.add(5);
  }
  return chapters;
}

export const PROGRESS_GOALS = [
  {
    id: "first_truth",
    title: "第一盏灯熄灭",
    hook: "完成任意章节，证明一条命途可以被改写。",
    target: 1,
    reward: { jade: 80, spirit: 3, xp: 20, epithet: "初改命途" },
    metric: (profile) => profile.unlockedEndings?.length || 0,
  },
  {
    id: "five_paths",
    title: "五卷云游",
    hook: "完成五章主线，抵达天门末页。",
    target: 5,
    reward: { jade: 260, spirit: 8, xp: 60, epithet: "五卷归人" },
    metric: (profile) => Math.min(5, completedStoryChapters(profile).size),
  },
  {
    id: "sixth_tide",
    title: "月海归人",
    hook: "完成第六章“月沉归墟”，承担自由之后的第一场月潮。",
    target: 1,
    reward: { jade: 180, spirit: 6, xp: 50, epithet: "归墟渡月" },
    metric: (profile) => Number((profile.unlockedEndings || []).includes("chapter_6_ending")),
  },
  {
    id: "hundred_cards",
    title: "百术入卷",
    hook: "收录 100 张术法，形成真正的藏经阁。",
    target: 100,
    reward: { jade: 180, spirit: 6, xp: 40, epithet: "百术藏家" },
    metric: (profile) => profile.discoveredCards?.length || 0,
  },
  {
    id: "treasure_record",
    title: "十一法宝录",
    hook: "见过全部局内法宝，补全法器图鉴。",
    target: TREASURES.length,
    reward: { jade: 120, spirit: 4, xp: 30, epithet: "鉴宝司录" },
    metric: (profile) => profile.discoveredTreasures?.length || 0,
  },
  {
    id: "casebooks",
    title: "诸卷证据",
    hook: "带回十五条跨局调查证据，拼出命册真相。",
    target: 15,
    reward: { jade: 180, spirit: 6, xp: 45, epithet: "命册见证" },
    metric: (profile) => CHAPTERS.reduce((sum, chapter) => sum + (profile.investigationArchive?.[String(chapter.id)] || []).length, 0),
  },
  {
    id: "build_atlas",
    title: "流派寻路人",
    hook: "收录足够核心牌，解锁 30 套流派图谱。",
    target: 30,
    reward: { jade: 160, spirit: 5, xp: 40, epithet: "万法寻路" },
    metric: (profile) => {
      const discovered = new Set(profile.discoveredCards || []);
      return DECK_RECIPES.filter((recipe) => recipe.cards.every((cardId) => discovered.has(cardId))).length;
    },
  },
  {
    id: "mastery_inheritance",
    title: "六脉传承",
    hook: "任一职业熟练度达到 100，取得本命法宝。",
    target: 100,
    reward: { jade: 220, spirit: 7, xp: 50, epithet: "一脉宗师" },
    metric: (profile) => Math.max(0, ...Object.values(profile.jobMastery || {})),
  },
  {
    id: "a_grade",
    title: "甲等云游",
    hook: "获得一次甲等或甲上评阶。",
    target: 5,
    reward: { jade: 120, spirit: 4, xp: 30, epithet: "甲卷行者" },
    metric: (profile) => Math.max(0, ...((profile.recentRuns || []).map((run) => gradeRank[run.grade] || 0))),
  },
];

export function summarizeGoal(goal, profile) {
  const current = Math.min(goal.target, goal.metric(profile));
  const complete = current >= goal.target;
  const claimed = (profile.claimedProgressGoals || []).includes(goal.id);
  return {
    ...goal,
    current,
    complete,
    claimed,
    claimable: complete && !claimed,
    percent: goal.target ? Math.round((current / goal.target) * 100) : 0,
  };
}

export function progressSummaries(profile) {
  return PROGRESS_GOALS.map((goal) => summarizeGoal(goal, profile));
}

export function nextProgressGoals(profile, count = 2) {
  const summaries = progressSummaries(profile);
  return [
    ...summaries.filter((goal) => goal.claimable),
    ...summaries.filter((goal) => !goal.complete).sort((a, b) => (b.percent - a.percent) || (a.target - a.current) - (b.target - b.current)),
    ...summaries.filter((goal) => goal.claimed),
  ].slice(0, count);
}

export function formatProgressReward(reward) {
  return [
    reward.jade ? `灵玉 +${reward.jade}` : "",
    reward.spirit ? `悟道 +${reward.spirit}` : "",
    reward.xp ? `修为 +${reward.xp}` : "",
    reward.epithet ? `称号「${reward.epithet}」` : "",
  ].filter(Boolean).join(" · ");
}

export function claimProgressGoal(profile, goalId) {
  const goal = PROGRESS_GOALS.find((item) => item.id === goalId);
  if (!goal) return { profile, claimed: false, reason: "missing" };
  const summary = summarizeGoal(goal, profile);
  if (!summary.complete) return { profile, claimed: false, reason: "incomplete", goal: summary };
  if (summary.claimed) return { profile, claimed: false, reason: "claimed", goal: summary };

  const reward = goal.reward || {};
  const xp = (profile.xp || 0) + (reward.xp || 0);
  const unlockedTitles = reward.epithet
    ? [...new Set([...(profile.unlockedTitles || []), reward.epithet])]
    : (profile.unlockedTitles || []);
  const nextProfile = {
    ...profile,
    jade: (profile.jade || 0) + (reward.jade || 0),
    spirit: (profile.spirit || 0) + (reward.spirit || 0),
    xp,
    level: Math.max(profile.level || 1, 3 + Math.floor(xp / 100)),
    claimedProgressGoals: [...new Set([...(profile.claimedProgressGoals || []), goal.id])],
    unlockedTitles,
    equippedTitle: reward.epithet || profile.equippedTitle || "云游录",
  };
  return { profile: nextProfile, claimed: true, goal: summarizeGoal(goal, nextProfile), reward };
}

export function totalEvidenceCount() {
  return CHAPTERS.reduce((sum, chapter) => sum + investigationEvidence(chapter.id).length, 0);
}
