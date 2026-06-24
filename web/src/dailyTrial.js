import { CHAPTERS } from "./gameData.js";

const PROFESSIONS = ["sword", "talisman", "alchemy", "beast", "artificer", "soul"];

export const DAILY_TRIAL_REWARD = {
  jade: 90,
  spirit: 4,
  xp: 30,
  title: "今夜破局",
};

export const DAILY_MODIFIERS = [
  {
    id: "spirit_tide",
    name: "灵潮逆涌",
    boon: "灵气上限 +1",
    hazard: "以损失 12 点生命开始",
    maxQiDelta: 1,
    hpDelta: -12,
  },
  {
    id: "paper_lantern",
    name: "纸灯低鸣",
    boon: "额外携带 1 份清神粉",
    hazard: "每场敌人初始获得 8 点护体",
    consumables: { clarity: 1 },
    enemyShield: 8,
  },
  {
    id: "blood_moon",
    name: "血月催锋",
    boon: "额外携带 1 枚阴雷子",
    hazard: "敌人每段攻击伤害 +2",
    consumables: { thunder: 1 },
    enemyDamageBonus: 2,
  },
  {
    id: "broken_scroll",
    name: "残卷求真",
    boon: "起始牌组的一张核心术法化为真解",
    hazard: "初始灵石 -8，敌人生命 +10%",
    refineStarter: true,
    stonesDelta: -8,
    enemyHpMultiplier: 1.1,
  },
  {
    id: "frost_guard",
    name: "霜月压境",
    boon: "额外携带 1 枚石肤符",
    hazard: "敌人生命 +12%",
    consumables: { skin: 1 },
    enemyHpMultiplier: 1.12,
  },
];

export function seedHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed, salt = "") {
  let value = seedHash(`${seed}:${salt}`) || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967296;
}

export function seededShuffle(items, seed, salt = "") {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(seededRandom(seed, `${salt}:${index}`) * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function createRunSeed(now = Date.now()) {
  return `QL-${Number(now).toString(36).toUpperCase()}`;
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dailyTrialForDate(date = new Date()) {
  const dateKey = localDateKey(date);
  const seed = `NIGHT-${dateKey.replaceAll("-", "")}`;
  const hash = seedHash(seed);
  const chapter = (hash % CHAPTERS.length) + 1;
  const origin = PROFESSIONS[Math.floor(hash / CHAPTERS.length) % PROFESSIONS.length];
  const modifier = DAILY_MODIFIERS[Math.floor(hash / 31) % DAILY_MODIFIERS.length];
  return {
    dateKey,
    dateLabel: `${date.getMonth() + 1} 月 ${date.getDate()} 日`,
    seed,
    chapter,
    origin,
    modifier,
    title: `${modifier.name} · 第 ${chapter} 卷`,
  };
}

export function applyDailyEnemy(enemy, trial) {
  if (!trial?.modifier) return enemy;
  const multiplier = trial.modifier.enemyHpMultiplier || 1;
  const max = Math.round(enemy.max * multiplier);
  const moves = enemy.moves.map((move) => ({
    ...move,
    damage: move.damage ? move.damage + (trial.modifier.enemyDamageBonus || 0) : move.damage,
  }));
  return {
    ...enemy,
    max,
    hp: max,
    moves,
    intent: moves[enemy.moveIndex]?.name || enemy.intent,
  };
}

export function dailyRewardStatus(profile, trial) {
  const claimed = (profile.completedDailyTrials || []).includes(trial.dateKey);
  return { claimed, claimable: !claimed };
}

export function settleDailyTrial(profile, trial) {
  if (!trial || dailyRewardStatus(profile, trial).claimed) {
    return { profile, awarded: false, reward: DAILY_TRIAL_REWARD };
  }
  const xp = (profile.xp || 0) + DAILY_TRIAL_REWARD.xp;
  return {
    awarded: true,
    reward: DAILY_TRIAL_REWARD,
    profile: {
      ...profile,
      jade: (profile.jade || 0) + DAILY_TRIAL_REWARD.jade,
      spirit: (profile.spirit || 0) + DAILY_TRIAL_REWARD.spirit,
      xp,
      level: Math.max(profile.level || 1, 3 + Math.floor(xp / 100)),
      completedDailyTrials: [...new Set([...(profile.completedDailyTrials || []), trial.dateKey])],
      unlockedTitles: [...new Set([...(profile.unlockedTitles || []), DAILY_TRIAL_REWARD.title])],
      equippedTitle: DAILY_TRIAL_REWARD.title,
    },
  };
}
