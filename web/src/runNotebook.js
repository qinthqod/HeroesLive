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

function screenReason(screen, { chapterData, stage, routeProgress, pendingClue, enemy, longGoal, build }) {
  const longHook = longGoal
    ? `长线钩子：${longGoal.title} ${longGoal.current}/${longGoal.target}，本局每次战斗、证据或战利都在推进下一枚印记。`
    : "长线钩子：完成章节会写入最近战绩，并解锁新的宗卷、职业熟练和复玩目标。";
  const buildHint = build ? `同时留意「${build.recipe.name}」${build.progress}/5。` : "同时保持输出、生存、循环三轴不失衡。";
  const reason = {
    map: `当前理由：第 ${Math.min(4, routeProgress + 1)}/4 路线决定本章风险和证据来源，先选能补线索或补牌组短板的节点。${buildHint}`,
    combat: `当前理由：先读「${enemy?.name || chapterData?.boss || "敌人"}」的当前与下一式，再决定进攻、防守或过牌。${buildHint}`,
    reward: `当前理由：战利不是越稀有越好，优先拿能补流派、短板或费用曲线的牌。${buildHint}`,
    event: pendingClue?.text
      ? `当前理由：这个抉择会决定线索「${pendingClue.text}」能否带回，先看清代价再点。`
      : `当前理由：异闻选项会改变资源、牌组或本局命途，优先选择能服务本章目标的代价。${buildHint}`,
    market: `当前理由：坊市是在花灵石换稳定性，买前确认买后余量和下一战血线。${buildHint}`,
    rest: "当前理由：调息牺牲一次战利换血线、精研或应急物，适合低血或牌组过厚时止损。",
    training: `当前理由：修炼会永久改变本局牌组节奏，优先处理高费拥堵、缺过牌或核心未精研。${buildHint}`,
  }[screen] || `当前理由：推进「${chapterData?.name || "本章"}」时，把调查、构筑和血线放在同一个决策里。`;
  return { reason, longHook };
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
  const currentReason = screenReason(screen, { chapterData, stage, routeProgress, pendingClue, enemy, longGoal, build });

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
    currentReason,
    advice: `${survival} ${advice}`,
    items,
  };
}
