import { PROFESSIONS } from "../src/gameData.js";
import { currentBuildState, generateRewardChoices, recipeMatches, rewardFit, rewardRecipeTarget } from "../src/deckStrategy.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

for (const [jobIndex, profession] of PROFESSIONS.entries()) {
  const starter = profession.starterDeck.map((cardId) => profession.cards.find((card) => card.id === cardId)).filter(Boolean);
  for (const stage of [1, 2, 3]) {
    const rewards = generateRewardChoices(profession, stage, starter, seededRandom(jobIndex * 17 + stage));
    expect(rewards.length === 3, `${profession.name} 第 ${stage} 幕必须生成三张战利`);
    expect(new Set(rewards.map((card) => card.id)).size === 3, `${profession.name} 第 ${stage} 幕战利不得重复`);
    expect(rewards.every((card) => card.tier <= Math.min(4, stage + 1)), `${profession.name} 第 ${stage} 幕出现了越级卡牌`);
    const advancesRecipe = rewards.some((card) => rewardFit(card, starter, profession.id).recipe);
    expect(advancesRecipe, `${profession.name} 第 ${stage} 幕至少一张战利应推进流派图谱`);
    const target = rewardRecipeTarget(profession, stage, starter);
    expect(Boolean(target && target.recipe.cards.includes(rewards[0].id)), `${profession.name} 第 ${stage} 幕首张战利必须推进页面展示的当前方向`);
    if (stage === 1) {
      const starterIds = new Set(starter.map((card) => card.id));
      expect(rewards.every((card) => !starterIds.has(card.id)), `${profession.name} 第一幕应优先展示尚未拥有的新基础牌`);
    }
  }

  const closest = recipeMatches(starter, profession.id).find((match) => !match.complete);
  expect(Boolean(closest), `${profession.name} 起始牌组应保留后续构筑目标`);
  const build = currentBuildState(starter, profession.id);
  expect(Boolean(build?.recipe && build.progress >= 3 && build.progress <= 4), `${profession.name} 起始牌组应能识别 3–4/5 的初始流派方向`);
  const baseCore = starter.find((card) => !card.refined);
  const refinedCore = profession.cards.find((card) => card.baseName === baseCore?.baseName && card.refined);
  if (baseCore && refinedCore) {
    const refinedDeck = starter.map((card, index) => index === starter.indexOf(baseCore) ? refinedCore : card);
    expect(currentBuildState(refinedDeck, profession.id)?.progress >= build.progress, `${profession.name} 精研核心牌后流派进度不得倒退`);
  }
}

if (failures.length) {
  console.error(`Reward strategy check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Reward strategy check passed: every profession and stage offers three unique cards with a guaranteed recipe advance.");
