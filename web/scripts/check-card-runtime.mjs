import { readFileSync } from "node:fs";
import { ALL_CARDS, PROFESSIONS } from "../src/gameData.js";

const runtimeSource = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const baseCards = PROFESSIONS.flatMap((job) => job.cards.slice(0, 10));
expect(new Set(baseCards.map((card) => card.baseName)).size === 60, "应有 60 个唯一基础技能模板");

for (const card of baseCards) {
  expect(runtimeSource.includes(card.baseName), `${card.baseName} 没有显式运行时规则或联动说明`);
}

for (const job of PROFESSIONS) {
  const base = job.cards.slice(0, 10);
  const refined = job.cards.slice(10, 20);
  for (let index = 0; index < base.length; index += 1) {
    const before = base[index];
    const after = refined[index];
    const costUpgrade = /费用/.test(before.upgrade);
    expect(costUpgrade ? after.cost < before.cost : after.cost === before.cost, `${after.name} 的费用变化与精研说明不一致`);
    for (const [, , target] of before.upgrade.matchAll(/(\d+)\s*→\s*(\d+)/g)) {
      if (!costUpgrade) expect(after.text.includes(target), `${after.name} 未兑现精研目标数值 ${target}`);
    }
  }
}

for (const name of ["万剑归岚", "万符归一", "阴阳大还丹", "山海盟誓", "天工开物", "百鬼夜行"]) {
  expect(runtimeSource.includes(`base === "${name}"`), `${name} 缺少终结技运行时分支`);
}

const classBudgets = Object.fromEntries(PROFESSIONS.map((job) => {
  const values = job.cards.slice(0, 10).map((card) => {
    const text = `${card.text}${card.combo}`;
    const damage = [...text.matchAll(/造成\s*(\d+)\s*点伤害(?:\s*(\d+)\s*次)?/g)]
      .reduce((sum, match) => sum + Number(match[1]) * Number(match[2] || 1), 0);
    const shield = Number(text.match(/获得\s*(\d+)\s*点护盾/)?.[1] || 0);
    const heal = Number(text.match(/恢复\s*(\d+)\s*点生命/)?.[1] || 0);
    const draw = Number(text.match(/抽\s*(\d+)\s*张牌/)?.[1] || 0);
    const burn = Number(text.match(/(\d+)\s*层燃烧/)?.[1] || 0);
    const poison = Number(text.match(/(\d+)\s*层丹毒/)?.[1] || 0);
    return (damage + shield * 0.6 + heal * 0.7 + draw * 4 + burn * 2 + poison * 2.3) / Math.max(1, card.cost);
  });
  return [job.id, values.reduce((sum, value) => sum + value, 0) / values.length];
}));

const budgetValues = Object.values(classBudgets);
const budgetSpread = Math.max(...budgetValues) - Math.min(...budgetValues);
expect(budgetSpread <= 5, `职业基础牌预算差距过大：${JSON.stringify(classBudgets)}`);

for (const card of ALL_CARDS) expect(Boolean(card.baseName), `${card.id} 缺少稳定运行时标识 baseName`);
expect(runtimeSource.includes("purgeCurses({ hand: handAfterDiscard, discardPile, drawPile }"), "净心牌必须跨手牌、弃牌堆与抽牌堆净除心魔");
expect(
  runtimeSource.includes("!isCurse(card)")
    && runtimeSource.includes("cardRequirementMet(card)")
    && runtimeSource.includes("qi >= cost"),
  "心魔牌与前置条件不足的牌不得因灵气充足而变为可施放",
);
expect(runtimeSource.includes("Math.min(2, discardPile.filter((item) => item.job === \"alchemy\").length)"), "百草相生返还灵气必须取决于实际洗回的丹药数量");
expect(runtimeSource.includes("device.type === \"thunder\"") && runtimeSource.includes("新回合抽牌唤醒铜雀"), "铜雀与雷枢必须按不同触发时机结算");
expect(runtimeSource.includes("upgradeDevices(normalizeDevices(value))"), "天工开物必须永久升级当前机关阵列");
expect(runtimeSource.includes("discoverInstructions(purged.drawPile") && runtimeSource.includes("instructionDiscovery.discovered"), "灵狐探路必须从抽牌堆定向发现指令牌");
expect(runtimeSource.includes("recallBeastState(value)") && runtimeSource.includes("activeBeast || \"归巢\""), "归巢必须改变当前出战灵兽并在战斗栏可见");
expect(runtimeSource.includes("moonPhase === \"blood\"") && runtimeSource.includes("r.damage += hits * 2"), "血月兽潮必须读取真实月相并逐段增伤");
expect(!runtimeSource.includes("card.type === \"攻击\" && base !== \"万剑归岚\""), "剑修不得为所有攻击牌暗中增加牌面未声明的剑势");
expect(runtimeSource.includes("base === \"玉月成璧\" && moonPhase === \"frost\""), "玉月成璧额外抽牌必须仅在霜月生效");
expect(runtimeSource.includes("base === \"药炉温养\"") && runtimeSource.includes("cardRequirementMet(card)"), "药炉温养缺少寒热时不得获得无条件抽牌收益");
expect(!runtimeSource.includes("r.damage += total * 3") && !runtimeSource.includes("r.heal += total * 2"), "阴阳大还丹不得附加牌面未声明的隐藏药性倍率");

if (failures.length) {
  console.error(`Card runtime check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Card runtime check passed: 60 templates / 120 cards. Budget spread ${budgetSpread.toFixed(2)}.`);
