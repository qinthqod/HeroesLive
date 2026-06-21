import {
  ALL_CARDS,
  BOSS_MOVE_PATTERNS,
  CHAPTERS,
  CHAPTER_ROUTE_COPY,
  CHAPTER_ROUTES,
  CHAPTER_STORIES,
  DECK_RECIPES,
  MASTERY_MILESTONES,
  MASTERY_SIGNATURE_BY_JOB,
  MASTERY_TREASURE_BY_JOB,
  PROFESSIONS,
  ROUTE_ROWS,
  STORY_SCENES,
  TREASURES,
} from "../src/gameData.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(PROFESSIONS.length >= 6, "至少需要 6 个职业");
expect(ALL_CARDS.length >= 120, "至少需要 120 张职业卡牌");
expect(DECK_RECIPES.length >= 100, "至少需要 100 套构筑配方");
expect(CHAPTERS.length >= 5, "至少需要 5 章主线");
expect(ROUTE_ROWS.length >= 4, "章节路线至少需要 4 层");
expect(STORY_SCENES.length >= 3, "第一章至少需要 3 个剧情场景");
expect(TREASURES.length >= 10, "局内法宝池至少需要 10 件");
expect(MASTERY_MILESTONES.length === 4, "职业熟练度需要 4 个固定里程碑");
expect(MASTERY_MILESTONES.every((milestone, index) => milestone.level === (index + 1) * 25), "职业熟练度里程碑应为 25/50/75/100");
expect(Object.keys(BOSS_MOVE_PATTERNS).length === 5, "五章必须各自拥有独立首领招式循环");
const bossMoveNames = [];
for (const chapter of CHAPTERS) {
  const moves = BOSS_MOVE_PATTERNS[chapter.id] || [];
  expect(moves.length === 3, `${chapter.name} 首领必须具有序/破/急三式`);
  expect(moves.every((move) => move.name && move.note && Number.isFinite(move.damage)), `${chapter.name} 首领招式缺少名称、说明或伤害`);
  expect(moves.some((move) => move.shield || move.heal || move.drainQi || move.drawPenalty || move.curse), `${chapter.name} 首领缺少章节专属机制`);
  bossMoveNames.push(...moves.map((move) => move.name));
}
expect(new Set(bossMoveNames).size === bossMoveNames.length, "首领招式名称必须在五章间保持唯一");
expect(new Set(TREASURES.map((treasure) => treasure.id)).size === TREASURES.length, "法宝 ID 必须唯一");
expect(new Set(TREASURES.map((treasure) => treasure.name)).size === TREASURES.length, "法宝名称必须唯一");
const supportedTreasureEffects = new Set(["firstTurnQi", "firstAttackDamage", "firstSkillDraw", "battleHeal", "marketDiscount", "startShield", "battleConsumable", "burnDamage", "battleStones", "maxQi", "firstTurnDraw"]);
for (const treasure of TREASURES) {
  expect(Boolean(treasure.name && treasure.art && treasure.effect), `${treasure.id} 缺少名称、素材或效果`);
  const effectKeys = Object.keys(treasure).filter((key) => supportedTreasureEffects.has(key));
  expect(effectKeys.length === 1, `${treasure.id} 必须且只能配置一个受支持的首版被动字段`);
  const artPath = fileURLToPath(new URL(`../../assets${treasure.art}`, import.meta.url));
  expect(existsSync(artPath), `${treasure.id} 法宝素材不存在：${treasure.art}`);
}
for (const chapter of CHAPTERS) {
  expect((CHAPTER_STORIES[chapter.id] || []).length >= 3, `${chapter.name} 至少需要 3 个剧情场景`);
  expect((CHAPTER_ROUTE_COPY[chapter.id]?.beats || []).length === 4, `${chapter.name} 需要 4 层路线叙事`);
  expect(Boolean(CHAPTER_ROUTE_COPY[chapter.id]?.clue), `${chapter.name} 缺少章节线索`);
  expect((CHAPTER_ROUTES[chapter.id] || []).length === 4, `${chapter.name} 需要 4 层独立路线`);
}

for (const job of PROFESSIONS) {
  const names = new Set(job.cards.map((card) => card.name));
  const effects = new Set(job.cards.map((card) => `${card.text}|${card.combo}`));
  const keywords = new Set(job.cards.map((card) => card.keyword));
  expect(job.cards.length === 20, `${job.name} 应有 20 张卡牌`);
  expect(job.starterDeck.length === 12, `${job.name} 起始牌组应有 12 张`);
  expect(names.size === job.cards.length, `${job.name} 存在重复卡名`);
  expect(effects.size >= 18, `${job.name} 的效果差异不足`);
  expect(keywords.size >= 8, `${job.name} 的关键词覆盖不足`);
  expect(job.cards.some((card) => card.baseName === MASTERY_SIGNATURE_BY_JOB[job.id] && card.refined), `${job.name} 缺少熟练度真传术式`);
  expect(TREASURES.some((treasure) => treasure.id === MASTERY_TREASURE_BY_JOB[job.id]), `${job.name} 缺少熟练度本命法宝`);
  const recipes = DECK_RECIPES.filter((recipe) => recipe.job === job.id);
  const recipeCardSets = recipes.map((recipe) => [...recipe.cards].sort().join("|"));
  expect(recipes.length === 18, `${job.name} 应有 18 套构筑图谱`);
  expect(new Set(recipes.map((recipe) => recipe.name)).size === recipes.length, `${job.name} 存在重复流派名`);
  expect(new Set(recipeCardSets).size === recipes.length, `${job.name} 的构筑配方必须全部唯一`);
  for (const recipe of recipes) {
    expect(recipe.cards.length === 5 && new Set(recipe.cards).size === 5, `${recipe.name} 必须由 5 张不同核心牌组成`);
    expect(recipe.cards.every((cardId) => job.cards.some((card) => card.id === cardId)), `${recipe.name} 引用了其他职业或不存在的卡牌`);
    expect(Boolean(recipe.focus && recipe.rank && recipe.rankNote && recipe.strategy), `${recipe.name} 缺少流派说明`);
    expect(Array.isArray(recipe.keywords) && recipe.keywords.length >= 2, `${recipe.name} 的关键词线索不足`);
  }
  for (const card of job.cards) {
    for (const field of ["name", "type", "rarity", "keyword", "text", "combo", "upgrade", "art"]) {
      expect(Boolean(card[field]), `${card.id} 缺少 ${field}`);
    }
    expect(Number.isInteger(card.cost) && card.cost >= 0 && card.cost <= 3, `${card.id} 费用非法`);
  }
}

if (failures.length) {
  console.error(`Game design check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Game design check passed: ${PROFESSIONS.length} professions, ${ALL_CARDS.length} cards, ${DECK_RECIPES.length} builds, ${TREASURES.length} treasures, ${CHAPTERS.length} chapters.`);
