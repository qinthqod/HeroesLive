import { CHAPTERS, CHAPTER_INVESTIGATIONS } from "./gameData.js";
import { analyzeDeck, currentBuildState, rewardFit, rewardRecipeTarget } from "./deckStrategy.js";
import { nextProgressGoals } from "./progressGoals.js";

const SCREEN_LABEL = {
  map: "择路",
  combat: "破敌",
  reward: "战利",
  event: "抉择",
  market: "整备",
  rest: "调息",
  training: "修炼",
};

function healthAdvice(hp, maxHp) {
  const ratio = maxHp ? hp / maxHp : 1;
  if (ratio <= 0.35) return "血线偏低：优先选择护盾、恢复或调息，不要贪高费爆发。";
  if (ratio <= 0.58) return "血线有压迫：下一次路线选择建议保留至少一张防御牌。";
  return "血线尚稳：可以主动追求构筑组件或调查线索。";
}

function deckAdvice(deck, origin) {
  const analysis = analyzeDeck(deck);
  const build = currentBuildState(deck, origin?.id || origin);
  if (build?.nextCard) return `构筑缺口：留意「${build.nextCard.name}」，可推进「${build.recipe.name}」。`;
  if (analysis.priorities.length) return `牌组短板：${analysis.priorities.slice(0, 2).join("、")}。`;
  return "牌组结构健康：继续精研核心牌，减少低契合奖励。";
}

function rewardAdvice(profession, stage, deck) {
  const target = rewardRecipeTarget(profession, stage, deck);
  if (target?.eligibleMissing?.length) {
    const best = target.eligibleMissing
      .map((card) => ({ card, fit: rewardFit(card, deck, profession.id) }))
      .sort((a, b) => b.fit.score - a.fit.score)[0];
    if (best) return `战利优先：若出现「${best.card.name}」，它能把「${target.recipe.name}」推至 ${target.progress + 1}/5。`;
  }
  return deckAdvice(deck, profession);
}

export function createRunNotebook({
  screen = "map",
  chapter = 1,
  stage = 1,
  routeProgress = 0,
  hp = 0,
  maxHp = 1,
  stones = 0,
  deck = [],
  origin,
  clues = [],
  pendingClue = null,
  profile = {},
  enemy = null,
}) {
  const chapterData = CHAPTERS[chapter - 1];
  const investigation = CHAPTER_INVESTIGATIONS[chapter];
  const build = currentBuildState(deck, origin?.id || origin);
  const longGoal = nextProgressGoals(profile, 1)[0];
  const clueTarget = Math.max(5, investigation?.routes?.length || 5);
  const advice = screen === "reward" ? rewardAdvice(origin, stage, deck) : deckAdvice(deck, origin);
  const survival = healthAdvice(hp, maxHp);
  const clueLine = pendingClue?.text
    ? `待带回：${pendingClue.text}`
    : clues.at(-1) || investigation?.opening || "尚未取得本章线索。";

  const items = [
    {
      key: "investigation",
      label: "主线调查",
      value: `${Math.min(clueTarget, clues.length)}/${clueTarget}`,
      text: investigation?.objective || chapterData?.summary || "继续推进本章云游。",
    },
    {
      key: "route",
      label: SCREEN_LABEL[screen] || "当前",
      value: screen === "combat" ? `第 ${stage} 战` : `路线 ${Math.min(4, routeProgress + 1)}/4`,
      text: screen === "combat"
        ? `${enemy?.name || "敌人"} · ${enemy?.counter || "读清意图后再决定攻守。"}`
        : clueLine,
    },
    {
      key: "build",
      label: "流派目标",
      value: build ? `${build.progress}/5` : `${deck.length} 张`,
      text: build ? `${build.label} · ${build.recipe.name}` : advice,
    },
    {
      key: "challenge",
      label: "挑战卷",
      value: longGoal ? `${longGoal.current}/${longGoal.target}` : `${stones} 石`,
      text: longGoal ? longGoal.title : "完成章节后记录最近云游。",
    },
  ];

  return {
    title: `${chapterData?.name || "云游"} · 试炼札记`,
    subtitle: `${chapterData?.region || "未知地域"} · ${SCREEN_LABEL[screen] || "行进"}`,
    advice: `${survival} ${advice}`,
    items,
  };
}
