import { createPendingClue, settlePendingClue } from "../src/investigationState.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const node = { id: "battle", name: "雾竹山径" };
const text = "妖影骨中嵌着山门名牌，它曾是试炼弟子。";
const pending = createPendingClue(text, node, 1);

expect(pending?.text === text && pending.nodeId === node.id && pending.route === 1, "进入调查节点必须只创建待查证记录");

const beforeVictory = ["血书警告：不可点亮山门前的第七盏灯。"];
expect(!beforeVictory.includes(text), "节点完成前不得把待查证内容写入已获线索");

const settled = settlePendingClue(beforeVictory, pending);
expect(settled.recovered === text, "节点完成后必须返回本次带回的证据");
expect(settled.clues.includes(text), "节点完成后必须写入已获线索");
expect(settled.pendingClue === null, "证据结算后必须清空待查证状态");

const duplicate = settlePendingClue(settled.clues, pending);
expect(duplicate.clues.filter((clue) => clue === text).length === 1, "同一证据重复结算不得重复入卷");

const empty = settlePendingClue(beforeVictory, null);
expect(empty.clues.length === beforeVictory.length && !empty.recovered, "安全节点不得凭空生成调查证据");

if (failures.length) {
  console.error(`Investigation state check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Investigation state check passed: clues remain pending until completion and settle idempotently.");
