import {
  ALL_CARDS,
  CHAPTERS,
  CHAPTER_ROUTE_COPY,
  CHAPTER_ROUTES,
  CHAPTER_STORIES,
  DECK_RECIPES,
  PROFESSIONS,
  ROUTE_ROWS,
  STORY_SCENES,
} from "../src/gameData.js";

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
  expect(job.starterDeck.length === 8, `${job.name} 起始牌组应有 8 张`);
  expect(names.size === job.cards.length, `${job.name} 存在重复卡名`);
  expect(effects.size >= 18, `${job.name} 的效果差异不足`);
  expect(keywords.size >= 8, `${job.name} 的关键词覆盖不足`);
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

console.log(`Game design check passed: ${PROFESSIONS.length} professions, ${ALL_CARDS.length} cards, ${DECK_RECIPES.length} builds, ${CHAPTERS.length} chapters.`);
