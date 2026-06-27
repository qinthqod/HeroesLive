export const TRIBULATION_LEVELS = [
  {
    level: 0,
    id: "none",
    name: "无劫",
    short: "标准云游",
    risk: "敌人使用章节标准数值",
    reward: { jade: 0, spirit: 0, xp: 0, title: "" },
    enemyHpMultiplier: 1,
    enemyDamageBonus: 0,
    enemyShield: 0,
  },
  {
    level: 1,
    id: "wind",
    name: "风劫",
    short: "壹重劫数",
    risk: "敌人生命 +15% · 每段攻击伤害 +1",
    reward: { jade: 40, spirit: 2, xp: 50, title: "踏风破劫" },
    enemyHpMultiplier: 1.15,
    enemyDamageBonus: 1,
    enemyShield: 0,
  },
  {
    level: 2,
    id: "heart",
    name: "心劫",
    short: "贰重劫数",
    risk: "敌人生命 +25% · 每段伤害 +2 · 初始护体 6",
    reward: { jade: 70, spirit: 4, xp: 80, title: "照心见真" },
    enemyHpMultiplier: 1.25,
    enemyDamageBonus: 2,
    enemyShield: 6,
  },
  {
    level: 3,
    id: "fate",
    name: "命劫",
    short: "叁重劫数",
    risk: "敌人生命 +40% · 每段伤害 +3 · 初始护体 10",
    reward: { jade: 110, spirit: 6, xp: 120, title: "逆命执灯" },
    enemyHpMultiplier: 1.4,
    enemyDamageBonus: 3,
    enemyShield: 10,
  },
];

export function tribulationForLevel(level = 0) {
  return TRIBULATION_LEVELS.find((item) => item.level === Number(level)) || TRIBULATION_LEVELS[0];
}

export function applyTribulationEnemy(enemy, tribulation) {
  const rule = tribulationForLevel(tribulation?.level);
  if (!rule.level) return enemy;
  const max = Math.round(enemy.max * rule.enemyHpMultiplier);
  const moves = enemy.moves.map((move) => ({
    ...move,
    damage: move.damage ? move.damage + rule.enemyDamageBonus : move.damage,
  }));
  return { ...enemy, max, hp: max, moves };
}

export function tribulationClearKey(chapter, level) {
  return `${chapter}:${level}`;
}

export function tribulationRewardStatus(profile, chapter, level) {
  const rule = tribulationForLevel(level);
  const claimed = !rule.level || (profile.completedTribulations || []).includes(tribulationClearKey(chapter, rule.level));
  return { claimed, claimable: rule.level > 0 && !claimed, reward: rule.reward };
}

export function settleTribulationClear(profile, chapter, level) {
  const rule = tribulationForLevel(level);
  const status = tribulationRewardStatus(profile, chapter, rule.level);
  if (!status.claimable) return { profile, awarded: false, reward: rule.reward };
  const xp = (profile.xp || 0) + rule.reward.xp;
  return {
    awarded: true,
    reward: rule.reward,
    profile: {
      ...profile,
      jade: (profile.jade || 0) + rule.reward.jade,
      spirit: (profile.spirit || 0) + rule.reward.spirit,
      xp,
      level: Math.max(profile.level || 1, 3 + Math.floor(xp / 100)),
      completedTribulations: [...new Set([...(profile.completedTribulations || []), tribulationClearKey(chapter, rule.level)])],
      unlockedTitles: [...new Set([...(profile.unlockedTitles || []), rule.reward.title])],
      equippedTitle: rule.reward.title,
    },
  };
}
