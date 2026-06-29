import {
  ALL_CARDS,
  BOSS_MOVE_PATTERNS,
  BOSS_PHASES,
  BOSS_CHOICE_RESPONSES,
  CHAPTER_BOSS_DOSSIERS,
  BATTLE_AFTERMATHS,
  ENCOUNTER_ENEMIES,
  ENCOUNTER_PRELUDES,
  ENCOUNTER_MOVE_PATTERNS,
  CHAPTERS,
  CHAPTER_BOSS_PRELUDES,
  CHAPTER_HOME_STATES,
  CHAPTER_TRANSITIONS,
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
  resolveBossChoiceResponse,
  resolveBossPrelude,
  resolveBattleAftermath,
  resolveEncounterPrelude,
} from "../src/gameData.js";
import { TRIBULATION_LEVELS } from "../src/tribulation.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const expectAsset = (reference, label) => {
  expect(Boolean(reference), `${label} 缺少素材路径`);
  if (!reference) return;
  const artPath = fileURLToPath(new URL(`../../assets${reference}`, import.meta.url));
  expect(existsSync(artPath), `${label} 素材不存在：${reference}`);
};

expect(PROFESSIONS.length >= 6, "至少需要 6 个职业");
expect(ALL_CARDS.length >= 120, "至少需要 120 张职业卡牌");
expect(DECK_RECIPES.length >= 100, "至少需要 100 套构筑配方");
expect(CHAPTERS.length >= 25, "扩展版至少需要 25 章主线");
expect(TRIBULATION_LEVELS.length === 4, "终局劫数必须提供标准、风劫、心劫、命劫四档");
expect(TRIBULATION_LEVELS[0].level === 0 && TRIBULATION_LEVELS[0].enemyHpMultiplier === 1 && TRIBULATION_LEVELS[0].enemyDamageBonus === 0, "无劫必须保持普通剧情标准数值");
expect(TRIBULATION_LEVELS.every((item, index, list) => index === 0 || (item.enemyHpMultiplier > list[index - 1].enemyHpMultiplier && item.enemyDamageBonus >= list[index - 1].enemyDamageBonus)), "劫数风险必须随层级清晰递增");
expect(TRIBULATION_LEVELS.slice(1).every((item) => item.risk && item.reward.jade > 0 && item.reward.spirit > 0 && item.reward.xp > 0 && item.reward.title), "每个高阶劫数都必须声明风险与首破奖励");
expect(new Set(TRIBULATION_LEVELS.slice(1).map((item) => item.reward.title)).size === TRIBULATION_LEVELS.length - 1, "劫数首破称号必须唯一");
expect(CHAPTERS.every((chapter) => {
  const state = CHAPTER_HOME_STATES[chapter.id];
  return state?.kicker && state?.title && state?.text;
}), "每章必须具有独立山门世界状态");
expect(Boolean(CHAPTER_HOME_STATES.complete?.kicker && CHAPTER_HOME_STATES.complete?.title && CHAPTER_HOME_STATES.complete?.text), "主线完成后必须具有终局山门状态");
expect(ROUTE_ROWS.length >= 4, "章节路线至少需要 4 层");
expect(STORY_SCENES.length >= 5, "第一章至少需要 5 个剧情场景");
expect(TREASURES.length >= 10, "局内法宝池至少需要 10 件");
expect(MASTERY_MILESTONES.length === 4, "职业熟练度需要 4 个固定里程碑");
expect(MASTERY_MILESTONES.every((milestone, index) => milestone.level === (index + 1) * 25), "职业熟练度里程碑应为 25/50/75/100");
expect(Object.keys(BOSS_MOVE_PATTERNS).length === CHAPTERS.length, "每章必须拥有独立首领招式循环");
expect(Object.keys(BOSS_PHASES).length === CHAPTERS.length, "每章首领必须拥有独立二阶段");
const bossMoveNames = [];
for (const chapter of CHAPTERS) {
  const transition = CHAPTER_TRANSITIONS[chapter.id];
  expect(Boolean(transition?.eyebrow && transition?.title && transition?.text && transition?.speaker && transition?.hook), `${chapter.name} 缺少章末悬念或后续目标`);
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
    expectAsset(enemy?.art, `${chapter.name} 第 ${stage} 战敌人`);
    expect(Number.isFinite(enemy?.hp) && enemy.hp === enemy.max && enemy.hp > 0, `${chapter.name} 第 ${stage} 战生命配置非法`);
  }
  for (const stage of [1, 2]) {
    const moves = ENCOUNTER_MOVE_PATTERNS[chapter.id]?.[stage] || [];
    expect(moves.length === 3, `${chapter.name} 第 ${stage} 战必须有三式独立循环`);
    expect(moves.every((move) => move.name && move.note && Number.isFinite(move.damage)), `${chapter.name} 第 ${stage} 战招式缺少名称、说明或伤害`);
    expect(moves.some((move) => move.shield || move.heal || move.weak || move.drainQi || move.drawPenalty || move.curse || move.hits), `${chapter.name} 第 ${stage} 战缺少可辨识机制`);
    encounterMoveNames.push(...moves.map((move) => move.name));
    const prelude = ENCOUNTER_PRELUDES[chapter.id]?.[stage];
    expect(Boolean(prelude?.eyebrow && prelude?.title && prelude?.setting && prelude?.lesson), `${chapter.name} 第 ${stage} 战缺少独立遭遇登场`);
    expect(prelude?.beats?.length === 2 && prelude.beats.every((beat) => beat.speaker && beat.text), `${chapter.name} 第 ${stage} 战登场对白不完整`);
    expect(resolveEncounterPrelude(chapter.id, stage)?.enemy?.name === enemies[stage].name, `${chapter.name} 第 ${stage} 战登场未绑定正确敌人`);
    const aftermath = BATTLE_AFTERMATHS[chapter.id]?.[stage];
    expect(Boolean(aftermath?.title && aftermath?.narration && aftermath?.finalWords && aftermath?.rewardSource), `${chapter.name} 第 ${stage} 战缺少胜利余波或战利来源`);
    expect(resolveBattleAftermath(chapter.id, stage)?.enemy?.name === enemies[stage].name, `${chapter.name} 第 ${stage} 战余波未绑定正确敌人`);
  }
}
expect(new Set(encounterMoveNames).size === encounterMoveNames.length, "十场普通与精英战的招式名称必须保持唯一");
const dedicatedBossArt = {
  "第七盏灯": "/generated/enemy_seventh_lantern.png",
  "写名鬼灯": "/generated/enemy_writing_name_ghost_lantern.png",
  "雷池守阵者": "/generated/enemy_thunder_array_warden.webp",
  "无影城主": "/generated/enemy_black_lotus_dreamweaver.webp",
  "守门真君": "/generated/enemy_taixu_scribe_echo.webp",
  "月蚀司命": "/generated/enemy_moon_eclipse_scribe.png",
};
for (const chapter of CHAPTERS) {
  const boss = ENCOUNTER_ENEMIES[chapter.id]?.[3];
  const expectedArt = dedicatedBossArt[boss?.name] || boss?.art;
  const bossRouteNode = (CHAPTER_ROUTES[chapter.id] || []).flat().find((node) => node.id === "boss");
  expect(Boolean(expectedArt), `${chapter.name} 首领缺少专属美术登记`);
  if (!dedicatedBossArt[boss?.name]) {
    expect(expectedArt?.startsWith("/generated/chapters/"), `${chapter.name} 扩展章节首领必须使用专属章节 imagegen 图`);
  }
  expect(boss?.art === expectedArt, `${chapter.name} 首领「${boss?.name}」必须使用专属 Boss 图 ${expectedArt}`);
  expect(CHAPTER_BOSS_PRELUDES[chapter.id]?.art === expectedArt, `${chapter.name} 首领前夜必须使用与首领战一致的身份图 ${expectedArt}`);
  expect(bossRouteNode?.art === expectedArt, `${chapter.name} 路线终点必须使用与首领战一致的身份图 ${expectedArt}`);
  expectAsset(expectedArt, `${chapter.name} 首领专属图`);
}
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
  const bossResponses = BOSS_CHOICE_RESPONSES[chapter.id] || {};
  expect(Object.keys(bossResponses).length === 2, `${chapter.name} 首领必须回应两种关键剧情抉择`);
  expect(Object.entries(bossResponses).every(([choice, response]) => availableChoices.has(choice) && response.line && response.effect), `${chapter.name} 首领回应未绑定有效抉择或缺少叙事反馈`);
  expect(Object.values(bossResponses).every((response) => Number.isFinite(response.playerShield || 0) && Number.isFinite(response.bossShieldDelta || 0)), `${chapter.name} 首领回应数值非法`);
  expect(Object.values(bossResponses).some((response) => response.playerShield > 0), `${chapter.name} 至少需要一种守护型首领回应`);
  expect(Object.values(bossResponses).some((response) => response.bossShieldDelta < 0), `${chapter.name} 至少需要一种破局型首领回应`);
  expect(Object.keys(bossResponses).every((choice) => resolveBossChoiceResponse(chapter.id, ["无关选择", choice])?.choice === choice), `${chapter.name} 首领回应解析失败`);
  const prelude = CHAPTER_BOSS_PRELUDES[chapter.id];
  const dossier = CHAPTER_BOSS_DOSSIERS[chapter.id];
  expect(Boolean(prelude?.eyebrow && prelude?.name && prelude?.setting && prelude?.art), `${chapter.name} 缺少首领前夜场景`);
  expectAsset(prelude?.art, `${chapter.name} 首领前夜`);
  expect(prelude?.beats?.length === 3, `${chapter.name} 首领前夜必须包含三段序破急对白`);
  expect(prelude?.beats?.every((beat) => beat.speaker && beat.text), `${chapter.name} 首领前夜对白缺少角色或文本`);
  expect(Boolean(dossier?.origin && dossier?.obsession && dossier?.weakness), `${chapter.name} 缺少首领宗卷来历、执念或破绽`);
  expect(resolveBossPrelude(chapter.id, [])?.dossier?.weakness === dossier?.weakness, `${chapter.name} 首领宗卷未接入前夜场景`);
  for (const choice of Object.keys(bossResponses)) {
    const resolvedPrelude = resolveBossPrelude(chapter.id, [choice]);
    expect(resolvedPrelude?.choice === choice && resolvedPrelude?.beats?.length === 4, `${chapter.name} 首领前夜未接入抉择「${choice}」`);
  }
  expect(epilogues.every((epilogue) => epilogue.id && epilogue.title && epilogue.text && epilogue.character && availableChoices.has(epilogue.choice)), `${chapter.name} 人物后记未正确绑定剧情抉择`);
  expect((CHAPTER_ROUTE_COPY[chapter.id]?.beats || []).length === 4, `${chapter.name} 需要 4 层路线叙事`);
  expect(Boolean(CHAPTER_ROUTE_COPY[chapter.id]?.clue), `${chapter.name} 缺少章节线索`);
  expect(Boolean(CHAPTER_ROUTE_COPY[chapter.id]?.storyConsequence && CHAPTER_ROUTE_COPY[chapter.id]?.bossConsequence), `${chapter.name} 路线卡缺少章节专属剧情后果`);
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
  expectAsset(event?.art, `${chapter.name} 奇遇`);
  expect(event?.options?.length === 4, `${chapter.name} 奇遇必须提供四个清晰选项`);
  expect(new Set((event?.options || []).map((option) => option.id)).size === 4, `${chapter.name} 奇遇选项 ID 必须唯一`);
  expect(new Set((event?.options || []).map((option) => JSON.stringify(option.effect))).size >= 3, `${chapter.name} 奇遇后果差异不足`);
  expect((event?.options || []).every((option) => option.label && option.title && option.detail && option.tone && typeof option.revealsClue === "boolean"), `${chapter.name} 奇遇缺少透明的风险收益说明`);
  expect((event?.options || []).some((option) => !option.revealsClue && Object.keys(option.effect).length === 0), `${chapter.name} 奇遇需要一个无收益无风险的离开选项`);
  const routeStory = CHAPTER_ROUTE_STORIES[chapter.id];
  expect(Boolean(routeStory?.eyebrow && routeStory?.name && routeStory?.description && routeStory?.art), `${chapter.name} 缺少独立途中剧情`);
  expectAsset(routeStory?.art, `${chapter.name} 途中剧情`);
  expect(routeStory?.options?.length === 2, `${chapter.name} 途中剧情必须提供两个可执行抉择`);
  expect((routeStory?.options || []).every((option) => option.label && option.title && option.detail && option.tone && option.revealsClue && Object.keys(option.effect || {}).length > 0), `${chapter.name} 途中剧情抉择缺少真实后果`);
  expect((routeStory?.options || []).every((option) => option.echo && option.echo.length >= 20), `${chapter.name} 途中剧情抉择必须提供章末可读的回响文本`);
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

const dedicatedCardArt = {
  "锋芒护身": "/generated/card_edge_guard.png",
  "裂魂剑": "/generated/card_soul_rending_sword.png",
  "玄雷敕令": "/generated/card_thunder_decree.png",
  "缚影法印": "/generated/card_shadow_binding_seal.png",
  "腐脉毒雾": "/generated/card_corrupting_poison_mist.png",
  "玉液护心": "/generated/card_jade_elixir_heartguard.png",
  "阴阳大还丹": "/generated/card_yinyang_alchemy_cauldron.webp",
  "山海盟誓": "/generated/card_beast_oath_circle.webp",
  "铜雀飞梭": "/generated/card_copper_sparrow_shuttle.png",
  "天工开物": "/generated/card_artificer_creation.png",
  "幽灯守魄": "/generated/card_soul_lantern_guard.png",
  "百鬼夜行": "/generated/card_hundred_ghosts.png",
};
for (const [cardName, art] of Object.entries(dedicatedCardArt)) {
  const cards = ALL_CARDS.filter((card) => card.baseName === cardName);
  expect(cards.length === 2, `${cardName} 必须同时覆盖基础牌与真解牌`);
  expect(cards.every((card) => card.art === art), `${cardName} 必须使用专属 imagegen 卡图 ${art}`);
  expectAsset(art, `${cardName} 专属卡图`);
}

const dedicatedEncounterArt = [
  { chapter: 2, stage: 1, name: "玄阴灯侍", art: "/generated/enemy_xuanyin_lantern_attendant.png", routeNode: "阴魂拦道" },
  { chapter: 3, stage: 2, name: "问心劫使", art: "/generated/enemy_heart_trial_examiner.png", routeNode: "问心石阶" },
  { chapter: 6, stage: 2, name: "归墟摆渡使", art: "/generated/enemy_guixu_ferryman.png", routeNode: "归墟摆渡台" },
];
for (const item of dedicatedEncounterArt) {
  const enemy = ENCOUNTER_ENEMIES[item.chapter]?.[item.stage];
  const routeNode = CHAPTER_ROUTES[item.chapter]?.flat().find((node) => node.name === item.routeNode);
  expect(enemy?.name === item.name, `第 ${item.chapter} 章第 ${item.stage} 战应为 ${item.name}`);
  expect(enemy?.art === item.art, `${item.name} 必须使用专属 imagegen 敌人图 ${item.art}`);
  expect(routeNode?.art === item.art, `${item.routeNode} 路线节点必须预告 ${item.name} 专属图`);
  expectAsset(item.art, `${item.name} 专属敌人图`);
}

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
    expectAsset(card.art, `${card.id} 卡牌`);
  }
}

const dedicatedImagegenBosses = [
  ENCOUNTER_ENEMIES[1]?.[3]?.art,
  ENCOUNTER_ENEMIES[4]?.[3]?.art,
  ENCOUNTER_ENEMIES[6]?.[3]?.art,
];
expect(dedicatedImagegenBosses.every((art) => art?.startsWith("/generated/")), "第 1、4、6 章首领必须使用本轮 imagegen 专属素材，避免复用旧敌人图");
expect(ALL_CARDS.some((card) => card.art === "/generated/card_fate_page_fragment.png"), "命册/魂灯系卡牌必须接入新增命册缺页插画");
expect(ALL_CARDS.some((card) => card.art === "/generated/card_moon_tide_slash.png"), "逐月/月相系卡牌必须接入新增月潮斩插画");

if (failures.length) {
  console.error(`Game design check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Game design check passed: ${PROFESSIONS.length} professions, ${ALL_CARDS.length} cards, ${DECK_RECIPES.length} builds, ${TREASURES.length} treasures, ${CHAPTERS.length} chapters.`);
