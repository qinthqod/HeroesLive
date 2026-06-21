import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../src/main.jsx", import.meta.url));
const source = readFileSync(sourcePath, "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(source.includes("const [runChoices, setRunChoices]"), "本局剧情选择必须与跨局异闻记录分离");
expect(source.includes("runChoices.includes(\"重写命册\")"), "第五章结局必须读取本局选择");
expect(!source.includes("profile.choices.includes(\"重写命册\")"), "第五章结局不得读取跨局历史选择");
expect(source.includes("runChoices,") && source.includes("runChronicle,") && source.includes("nextEnemyShield,"), "自动存档必须覆盖本局选择、命途回响和待兑现代价");
expect(source.includes("setRunChoices(savedRun.runChoices || [])"), "继续云游必须恢复本局剧情选择");
expect(source.includes("setNextEnemyShield((value) => value + 5)"), "古龛取玉的下一战护体代价必须真实写入状态");
expect(source.includes("setEnemyShield(nextEnemyShield)"), "进入战斗时必须兑现待处理的敌方护体");
expect(source.includes("className=\"run-chronicle\""), "路线页必须展示本局命途回响");
expect(source.includes("onClick={() => playCard(index)}"), "战斗卡牌必须单击立即出牌");
expect(!source.includes("card-inspector") && !source.includes("onDoubleClick"), "战斗不得残留二次确认或双击施放");
expect(source.includes("tutorialFlags") && source.includes("className={`combat-guide"), "首场战斗必须提供可持久化的渐进式引导");
expect(source.includes("单击卡牌就会直接出牌，不需要再次确认"), "新手引导必须明确告知单击即出牌");
expect(source.includes("masteryStarterDeck") && source.includes("masteryOpeningState"), "职业熟练度必须真实改变起始牌组与战斗资源");
expect(source.includes("mastery >= 25 ? 4 : 0") && source.includes("mastery >= 100"), "熟练度资粮与本命法宝里程碑必须接入新局");
expect(source.includes("setDiscardPile(hasEnoughDraw ? turnDiscard : [])"), "抽牌堆充足时，回合弃牌不得被错误清空");
expect(source.includes("currentMove.curse") && source.includes("FATE_CURSE"), "第五章首领必须能将心魔真实写入牌堆");
expect(source.includes("createFeedbackEngine") && source.includes("navigator.vibrate"), "战斗必须提供可降级的音效与触觉反馈");
expect(source.includes("feedback: { sound: true, haptics: true, volume: 0.55"), "反馈偏好必须具有可持久化默认值");
for (const feedbackKind of ["cast", "impact", "draw", "enemy", "hurt", "reward"]) {
  expect(source.includes(`feedback("${feedbackKind}")`), `缺少 ${feedbackKind} 战斗反馈触点`);
}
expect(source.includes("freshRunStats") && source.includes("evaluateRun"), "章末结算必须基于整局表现动态评阶");
for (const stat of ["cardsPlayed", "damageDealt", "damageTaken", "turns", "combatsWon", "xpGained", "spiritGained", "jadeGained"]) {
  expect(source.includes(stat), `整局统计缺少 ${stat}`);
}
expect(source.includes("runStats,") && source.includes("setRunStats({ ...freshRunStats(), ...(savedRun.runStats || {}) })"), "整局统计必须进入自动存档并可恢复");
expect(!source.includes("<span>甲上</span>") && !source.includes("<strong>+38</strong>"), "章末不得继续显示固定评阶或虚假修为");
expect(source.includes("defaultDiscoveredCards") && source.includes("discoveredCards"), "藏经阁必须具有兼容旧档的卡牌发现状态");
expect(source.includes("runDeck.forEach((card)") && source.includes("discovered.add(card.id)"), "进入本局牌组的卡牌必须永久写入藏经阁");
expect(source.includes("未收录术法") && source.includes("collection-progress"), "藏经阁必须区分未知卡牌并展示职业收集进度");
expect(source.includes("流派图谱") && source.includes("BuildRecipeCard"), "藏经阁必须提供可浏览的流派图谱");
expect(source.includes("未收录组件") && source.includes("recipe.cards.every"), "流派图谱必须显示缺失组件并计算真实完成度");
expect(source.includes("completedNodes") && source.includes("chapter-1-scene-"), "章节剧情节点必须形成跨局完成进度");
expect(source.includes("shen-handbook-1") && source.includes("unlockHandbook ? 8 : 0"), "第一章三段剧情完成后必须一次性解锁手札并奖励悟道");
expect(source.includes("lore-scrolls") && source.includes("人物手札"), "异闻录必须展示已解锁与未解锁人物手札");

if (failures.length) {
  console.error(`Run continuity check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Run continuity check passed: isolated run choices, persisted consequences, route echoes, and single-tap card play.");
