import {
  ALL_CARDS,
  BOSS_MOVE_PATTERNS,
  BOSS_PHASES,
  ENCOUNTER_ENEMIES,
  ENCOUNTER_MOVE_PATTERNS,
  CHAPTERS,
  CHAPTER_ROUTE_COPY,
  CHAPTER_ROUTES,
  CHAPTER_STORIES,
  CHAPTER_STORY_CHOICES,
  CHAPTER_EPILOGUES,
  CHAPTER_INVESTIGATIONS,
  CHAPTER_EVENTS,
  CHAPTER_ROUTE_STORIES,
  CHAPTER_MARKETS,
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
expect(CHAPTERS.length >= 6, "扩展版至少需要 6 章主线");
expect(ROUTE_ROWS.length >= 4, "章节路线至少需要 4 层");
expect(STORY_SCENES.length >= 5, "第一章至少需要 5 个剧情场景");
expect(TREASURES.length >= 10, "局内法宝池至少需要 10 件");
expect(MASTERY_MILESTONES.length === 4, "职业熟练度需要 4 个固定里程碑");
expect(MASTERY_MILESTONES.every((milestone, index) => milestone.level === (index + 1) * 25), "职业熟练度里程碑应为 25/50/75/100");
expect(Object.keys(BOSS_MOVE_PATTERNS).length === CHAPTERS.length, "每章必须拥有独立首领招式循环");
expect(Object.keys(BOSS_PHASES).length === CHAPTERS.length, "每章首领必须拥有独立二阶段");
const bossMoveNames = [];
for (const chapter of CHAPTERS) {
  const moves = BOSS_MOVE_PATTERNS[chapter.id] || [];
  expect(moves.length === 3, `${chapter.name} 首领必须具有序/破/急三式`);
  expect(moves.every((move) => move.name && move.note && Number.isFinite(move.damage)), `${chapter.name} 首领招式缺少名称、说明或伤害`);
  expect(moves.some((move) => move.shield || move.heal || move.drainQi || move.drawPenalty || move.curse), `${chapter.name} 首领缺少章节专属机制`);
  const phase = BOSS_PHASES[chapter.id];
  expect(Boolean(phase?.name && phase?.line && phase?.threshold > 0 && phase?.threshold < 1), `${chapter.name} 首领二阶段缺少名称、台词或血量阈值`);
  expect(phase?.moves?.length === 3, `${chapter.name} 首领二阶段必须具有三式循环`);
  expect(phase?.moves?.every((move) => move.name && move.note && Number.isFinite(move.damage)), `${chapter.name} 首领二阶段招式配置不完整`);
  bossMoveNames.push(...moves.map((move) => move.name));
  bossMoveNames.push(...(phase?.moves || []).map((move) => move.name));
}
expect(new Set(bossMoveNames).size === bossMoveNames.length, "首领招式名称必须在各章与阶段间保持唯一");
const encounterMoveNames = [];
for (const chapter of CHAPTERS) {
  const enemies = ENCOUNTER_ENEMIES[chapter.id] || {};
  expect(Object.keys(enemies).length === 3, `${chapter.name} 必须配置普通、精英与首领敌人`);
  for (const stage of [1, 2, 3]) {
    const enemy = enemies[stage];
    expect(Boolean(enemy?.name && enemy?.art && enemy?.archetype && enemy?.trait && enemy?.counter), `${chapter.name} 第 ${stage} 战缺少敌人身份或反制提示`);
    expect(Number.isFinite(enemy?.hp) && enemy.hp === enemy.max && enemy.hp > 0, `${chapter.name} 第 ${stage} 战生命配置非法`);
  }
  for (const stage of [1, 2]) {
    const moves = ENCOUNTER_MOVE_PATTERNS[chapter.id]?.[stage] || [];
    expect(moves.length === 3, `${chapter.name} 第 ${stage} 战必须有三式独立循环`);
    expect(moves.every((move) => move.name && move.note && Number.isFinite(move.damage)), `${chapter.name} 第 ${stage} 战招式缺少名称、说明或伤害`);
    expect(moves.some((move) => move.shield || move.heal || move.weak || move.drainQi || move.drawPenalty || move.curse || move.hits), `${chapter.name} 第 ${stage} 战缺少可辨识机制`);
    encounterMoveNames.push(...moves.map((move) => move.name));
  }
}
expect(new Set(encounterMoveNames).size === encounterMoveNames.length, "十场普通与精英战的招式名称必须保持唯一");
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
  expect((CHAPTER_STORIES[chapter.id] || []).length >= 5, `${chapter.name} 至少需要 5 个剧情场景`);
  const storyChoices = CHAPTER_STORY_CHOICES[chapter.id] || {};
  expect(Object.keys(storyChoices).length >= 2, `${chapter.name} 至少需要两次剧情抉择`);
  expect(Object.values(storyChoices).every((choices) => choices.length === 2 && choices.every((choice) => choice.label && choice.value && choice.consequence && choice.effect)), `${chapter.name} 剧情抉择缺少标签、后果或可执行效果`);
  const epilogues = CHAPTER_EPILOGUES[chapter.id] || [];
  expect(epilogues.length === 2, `${chapter.name} 必须具有两个可收集人物后记`);
  const availableChoices = new Set(Object.values(storyChoices).flat().map((choice) => choice.value));
  expect(epilogues.every((epilogue) => epilogue.id && epilogue.title && epilogue.text && epilogue.character && availableChoices.has(epilogue.choice)), `${chapter.name} 人物后记未正确绑定剧情抉择`);
  expect((CHAPTER_ROUTE_COPY[chapter.id]?.beats || []).length === 4, `${chapter.name} 需要 4 层路线叙事`);
  expect(Boolean(CHAPTER_ROUTE_COPY[chapter.id]?.clue), `${chapter.name} 缺少章节线索`);
  expect((CHAPTER_ROUTES[chapter.id] || []).length === 4, `${chapter.name} 需要 4 层独立路线`);
  const investigation = CHAPTER_INVESTIGATIONS[chapter.id];
  expect(Boolean(investigation?.objective && investigation?.opening && investigation?.conclusion), `${chapter.name} 缺少调查目标、开场线索或结论`);
  expect(investigation?.routes?.length === 4, `${chapter.name} 调查链必须覆盖四层路线`);
  for (const [routeIndex, nodes] of (CHAPTER_ROUTES[chapter.id] || []).entries()) {
    for (const node of nodes) {
      expect(Boolean(investigation?.routes?.[routeIndex]?.[node.id]), `${chapter.name} 路线「${node.name}」缺少专属线索`);
    }
  }
  const event = CHAPTER_EVENTS[chapter.id];
  expect(Boolean(event?.eyebrow && event?.name && event?.description && event?.art), `${chapter.name} 缺少独立奇遇场景`);
  expect(event?.options?.length === 4, `${chapter.name} 奇遇必须提供四个清晰选项`);
  expect(new Set((event?.options || []).map((option) => option.id)).size === 4, `${chapter.name} 奇遇选项 ID 必须唯一`);
  expect(new Set((event?.options || []).map((option) => JSON.stringify(option.effect))).size >= 3, `${chapter.name} 奇遇后果差异不足`);
  expect((event?.options || []).every((option) => option.label && option.title && option.detail && option.tone && typeof option.revealsClue === "boolean"), `${chapter.name} 奇遇缺少透明的风险收益说明`);
  expect((event?.options || []).some((option) => !option.revealsClue && Object.keys(option.effect).length === 0), `${chapter.name} 奇遇需要一个无收益无风险的离开选项`);
  const routeStory = CHAPTER_ROUTE_STORIES[chapter.id];
  expect(Boolean(routeStory?.eyebrow && routeStory?.name && routeStory?.description && routeStory?.art), `${chapter.name} 缺少独立途中剧情`);
  expect(routeStory?.options?.length === 2, `${chapter.name} 途中剧情必须提供两个可执行抉择`);
  expect((routeStory?.options || []).every((option) => option.label && option.title && option.detail && option.tone && option.revealsClue && Object.keys(option.effect || {}).length > 0), `${chapter.name} 途中剧情抉择缺少真实后果`);
  const market = CHAPTER_MARKETS[chapter.id];
  expect(Boolean(market?.eyebrow && market?.name && market?.description && market?.stall && market?.stockNote), `${chapter.name} 缺少独立坊市文案`);
  expect(Boolean(market?.bias && market?.special?.id && market?.special?.label && market?.special?.title && market?.special?.detail), `${chapter.name} 缺少坊市货架倾向或专属交易`);
  for (const field of ["cardPrice", "removeCost", "refineCost", "treasureCost"]) {
    expect(Number.isInteger(market?.[field]) && market[field] >= 0, `${chapter.name} 坊市 ${field} 定价非法`);
  }
}
expect(new Set(Object.values(CHAPTER_MARKETS).map((market) => market.name)).size === CHAPTERS.length, "各章坊市名称必须唯一");
expect(new Set(Object.values(CHAPTER_MARKETS).map((market) => market.bias)).size === CHAPTERS.length, "各章坊市货架倾向必须唯一");
expect(new Set(Object.values(CHAPTER_MARKETS).map((market) => market.special.id)).size === CHAPTERS.length, "各章坊市专属交易必须唯一");

for (const job of PROFESSIONS) {
  const names = new Set(job.cards.map((card) => card.name));
  const effects = new Set(job.cards.map((card) => `${card.text}|${card.combo}`));
  const keywords = new Set(job.cards.map((card) => card.keyword));
  expect(job.cards.length === 20, `${job.name} 应有 20 张卡牌`);
  expect(job.starterDeck.length === 12, `${job.name} 起始牌组应有 12 张`);
  expect(new Set(job.starterDeck).size >= 6 && new Set(job.starterDeck).size <= 8, `${job.name} 起始牌组应由 6–8 种基础牌组成合理复数`);
  expect(job.starterDeck.every((cardId) => job.cards.slice(0, 10).some((card) => card.id === cardId)), `${job.name} 起始牌组不得提前包含真解牌`);
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
