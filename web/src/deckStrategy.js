import { ALL_CARDS, DECK_RECIPES } from "./gameData.js";

const CARD_BY_ID = new Map(ALL_CARDS.map((card) => [card.id, card]));
const RANK_ORDER = { 入门: 0, 进阶: 1, 真传: 2 };

export function analyzeDeck(deck) {
  const profile = {
    total: deck.length,
    attack: 0,
    defense: 0,
    draw: 0,
    heal: 0,
    highCost: 0,
    refined: 0,
    costs: [0, 0, 0, 0],
    keywords: {},
  };
  deck.forEach((card) => {
    if (["攻击", "术法"].includes(card.type) && /造成|伤害|毒|燃烧/.test(`${card.text}${card.combo || ""}`)) profile.attack += 1;
    if (/护盾|驱散|净除/.test(`${card.text}${card.combo || ""}`)) profile.defense += 1;
    if (/抽\s*\d*\s*张牌|返回手牌|发现/.test(`${card.text}${card.combo || ""}`)) profile.draw += 1;
    if (/恢复/.test(card.text)) profile.heal += 1;
    if (card.cost >= 2) profile.highCost += 1;
    if (card.refined) profile.refined += 1;
    profile.costs[Math.min(3, card.cost)] += 1;
    profile.keywords[card.keyword] = (profile.keywords[card.keyword] || 0) + 1;
  });
  const priorities = [];
  if (profile.attack <= Math.max(3, Math.floor(profile.total * 0.28))) priorities.push("稳定伤害");
  if (profile.defense + profile.heal <= 3) priorities.push("护盾 / 恢复");
  if (profile.draw <= 2 && profile.total >= 12) priorities.push("过牌 / 压缩");
  if (profile.highCost >= Math.ceil(profile.total * 0.38)) priorities.push("低费运转");
  if (profile.total >= 16) priorities.push("删去冗余");
  const keyComponents = Object.entries(profile.keywords)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  return { ...profile, priorities: priorities.slice(0, 4), keyComponents };
}

export function balanceRadar(deck) {
  const profile = analyzeDeck(deck);
  const total = Math.max(1, profile.total);
  const attackScore = Math.min(100, Math.round((profile.attack / Math.max(4, total * 0.34)) * 100));
  const survivalScore = Math.min(100, Math.round(((profile.defense + profile.heal) / Math.max(3, total * 0.24)) * 100));
  const cycleScore = Math.min(100, Math.round((profile.draw / Math.max(2, total * 0.2)) * 100));
  const lowCurve = Math.max(0, total - profile.highCost);
  const curveScore = Math.min(100, Math.round((lowCurve / Math.max(1, total * 0.68)) * 100));
  const dominantRisks = [
    profile.attack >= total * 0.55 && survivalScore < 70 ? "伤害占优但防线偏薄" : "",
    profile.highCost >= total * 0.38 ? "高费拥堵会放大卡手风险" : "",
    profile.draw <= 2 && total >= 12 ? "过牌不足，核心组件回转慢" : "",
    profile.defense + profile.heal <= 2 ? "缺少容错，遇到多段攻击容易崩盘" : "",
  ].filter(Boolean);
  const axes = [
    { key: "attack", label: "输出", score: attackScore, advice: attackScore >= 80 ? "足够斩杀" : "补稳定伤害" },
    { key: "survival", label: "生存", score: survivalScore, advice: survivalScore >= 80 ? "容错充足" : "补护盾/恢复" },
    { key: "cycle", label: "循环", score: cycleScore, advice: cycleScore >= 80 ? "回转顺畅" : "补过牌/压缩" },
    { key: "curve", label: "费用", score: curveScore, advice: curveScore >= 80 ? "曲线轻盈" : "降低高费密度" },
  ];
  const lowest = [...axes].sort((a, b) => a.score - b.score)[0];
  return {
    axes,
    lowest,
    dominantRisks,
    verdict: dominantRisks[0] || (lowest.score < 65 ? `优先修正「${lowest.label}」短板` : "结构均衡，可追求更高阶联动"),
  };
}

export function recipeMatches(deck, origin) {
  const deckIds = new Set(deck.map((card) => card.id));
  const deckFamilies = new Set(deck.map((card) => card.baseName));
  return DECK_RECIPES
    .filter((recipe) => recipe.job === origin)
    .map((recipe) => {
      const components = recipe.cards.map((cardId) => CARD_BY_ID.get(cardId)).filter(Boolean);
      const exact = components.filter((card) => deckIds.has(card.id)).length;
      const family = components.filter((card) => !deckIds.has(card.id) && deckFamilies.has(card.baseName)).length;
      const progress = exact + family;
      const missing = components.filter((card) => !deckIds.has(card.id) && !deckFamilies.has(card.baseName));
      return { recipe, components, missing, exact, family, progress, complete: progress === components.length };
    })
    .sort((a, b) =>
      Number(a.complete) - Number(b.complete)
      || b.progress - a.progress
      || b.exact - a.exact
      || RANK_ORDER[a.recipe.rank] - RANK_ORDER[b.recipe.rank]
    );
}

export function currentBuildState(deck, origin) {
  const matches = recipeMatches(deck, origin);
  const target = matches.find((match) => !match.complete) || matches[0] || null;
  if (!target) return null;
  return {
    ...target,
    label: target.complete ? "流派已成" : target.progress >= 4 ? "临门一术" : target.progress >= 3 ? "脉络初成" : "仍在寻路",
    nextCard: target.missing[0] || null,
  };
}

export function rewardRecipeTarget(profession, stage, deck) {
  const eligibleIds = new Set(
    profession.cards
      .filter((card) => card.tier <= Math.min(4, stage + 1))
      .map((card) => card.id)
  );
  return recipeMatches(deck, profession.id)
    .map((match) => ({ ...match, eligibleMissing: match.missing.filter((card) => eligibleIds.has(card.id)) }))
    .find((match) => !match.complete && match.eligibleMissing.length) || null;
}

function recipeImpact(card, deck, origin) {
  const deckIds = new Set(deck.map((item) => item.id));
  const deckFamilies = new Set(deck.map((item) => item.baseName));
  const candidates = DECK_RECIPES
    .filter((recipe) => recipe.job === origin && recipe.cards.includes(card.id) && !deckIds.has(card.id) && !deckFamilies.has(card.baseName))
    .map((recipe) => {
      const before = recipe.cards
        .map((cardId) => CARD_BY_ID.get(cardId))
        .filter((component) => component && (deckIds.has(component.id) || deckFamilies.has(component.baseName)))
        .length;
      return { recipe, before, after: before + 1 };
    })
    .sort((a, b) => b.after - a.after || RANK_ORDER[a.recipe.rank] - RANK_ORDER[b.recipe.rank]);
  return candidates[0] || null;
}

export function rewardFit(card, deck, origin = card.job) {
  const profile = analyzeDeck(deck);
  let score = 1;
  const reasons = [];
  const impact = recipeImpact(card, deck, origin);
  if (impact?.after === 5) {
    score += 5;
    reasons.push(`补全「${impact.recipe.name}」`);
  } else if (impact) {
    score += 2;
    reasons.push(`推进「${impact.recipe.name}」${impact.after}/5`);
  }
  const keywordCount = profile.keywords[card.keyword] || 0;
  if (keywordCount >= 2) {
    score += 3;
    reasons.push(`衔接 ${keywordCount} 张「${card.keyword}」`);
  } else if (keywordCount === 1) {
    score += 1;
    reasons.push(`延伸「${card.keyword}」组件`);
  }
  if (profile.attack <= 3 && /造成|伤害|毒|燃烧/.test(`${card.text}${card.combo || ""}`)) {
    score += 2;
    reasons.push("补足伤害");
  }
  if (profile.defense + profile.heal <= 3 && /护盾|恢复|驱散/.test(`${card.text}${card.combo || ""}`)) {
    score += 2;
    reasons.push("稳住血线");
  }
  if (profile.draw <= 2 && /抽|返回手牌|发现/.test(`${card.text}${card.combo || ""}`)) {
    score += 2;
    reasons.push("改善循环");
  }
  if (card.cost >= 2 && profile.highCost >= 5) {
    score -= 2;
    reasons.push("当前高费偏多");
  }
  const duplicateCount = deck.filter((item) => item.id === card.id).length;
  if (duplicateCount >= 2) {
    score -= 1;
    reasons.push("已有多张同名牌");
  }
  return {
    score,
    rank: score >= 6 ? "高" : score >= 3 ? "中" : "低",
    reason: reasons.slice(0, 2).join(" · ") || "独立强度稳定",
    recipe: impact?.recipe || null,
    recipeProgress: impact?.after || 0,
  };
}

function rarityWeight(card, stage) {
  const table = stage <= 1
    ? { 普通: 60, 精良: 30, 稀有: 10, 传说: 2 }
    : stage === 2
      ? { 普通: 42, 精良: 38, 稀有: 20, 传说: 5 }
      : { 普通: 34, 精良: 36, 稀有: 30, 传说: 9 };
  return table[card.rarity] || 1;
}

function weightedPick(pool, stage, random) {
  if (!pool.length) return null;
  const total = pool.reduce((sum, card) => sum + rarityWeight(card, stage), 0);
  let cursor = random() * total;
  for (const card of pool) {
    cursor -= rarityWeight(card, stage);
    if (cursor <= 0) return card;
  }
  return pool.at(-1);
}

export function generateRewardChoices(profession, stage, deck, random = Math.random) {
  const eligible = profession.cards.filter((card) => card.tier <= Math.min(4, stage + 1));
  const deckIds = new Set(deck.map((card) => card.id));
  const unseen = eligible.filter((card) => !deckIds.has(card.id));
  const candidatePool = unseen.length >= 3 ? unseen : eligible;
  const selected = [];
  const add = (card) => {
    if (card && !selected.some((item) => item.id === card.id)) selected.push(card);
  };

  const target = rewardRecipeTarget(profession, stage, deck);
  add(weightedPick(target?.eligibleMissing || [], stage, random));

  const synergyPool = candidatePool
    .filter((card) => !selected.some((item) => item.id === card.id))
    .map((card) => ({ card, fit: rewardFit(card, deck, profession.id) }))
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, 5)
    .map((entry) => entry.card);
  add(synergyPool[Math.floor(random() * synergyPool.length)]);

  while (selected.length < 3) {
    const pool = candidatePool.filter((card) => !selected.some((item) => item.id === card.id));
    if (!pool.length) break;
    add(weightedPick(pool, stage, random));
  }
  return selected;
}
