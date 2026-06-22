import { countCurses, isCurse, purgeCurses } from "../src/combatZones.js";

const curse = (id) => ({ id, job: "curse", type: "心魔" });
const normal = (id) => ({ id, job: "sword", type: "攻击" });
const zones = {
  hand: [normal("a"), curse("c1")],
  discardPile: [curse("c2"), normal("b")],
  drawPile: [curse("c3")],
};

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(isCurse(curse("x")) && !isCurse(normal("x")), "心魔识别必须读取稳定类型字段");
expect(countCurses(zones) === 3, "必须统计手牌、弃牌堆和抽牌堆中的全部心魔");

const once = purgeCurses(zones, 1);
expect(once.removed.length === 1 && once.removed[0].id === "c1", "净除应优先释放被心魔占据的手牌");
expect(countCurses(once) === 2, "净除一张后必须保留其余两张心魔");

const twice = purgeCurses(zones, 2);
expect(twice.removed.length === 2, "真解净心必须能够净除两张心魔");
expect(twice.hand.every((card) => !isCurse(card)) && twice.discardPile.every((card) => !isCurse(card)), "净除必须跨手牌与弃牌堆结算");

const excessive = purgeCurses(zones, 9);
expect(excessive.removed.length === 3 && countCurses(excessive) === 0, "净除上限超过心魔数量时不得生成额外收益");

if (failures.length) {
  console.error(`Combat zone check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Combat zone check passed: curses are counted and purged across hand, discard, and draw zones.");
