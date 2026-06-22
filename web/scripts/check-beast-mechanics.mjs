import { discoverInstructions, moonPhaseForTrial, recallBeastState } from "../src/beastMechanics.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(moonPhaseForTrial({ modifier: { id: "blood_moon" } }) === "blood", "血月异兆必须切换真实月相");
expect(moonPhaseForTrial({ modifier: { id: "frost_guard" } }) === "frost", "非血月试炼必须保持霜月");

const pile = [
  { id: "attack", keyword: "狼契", cost: 1 },
  { id: "command", keyword: "指令", cost: 1 },
  { id: "zero-command", keyword: "指令", cost: 0 },
  { id: "cooperate", keyword: "协同", cost: 2 },
];
const discovery = discoverInstructions(pile, 2, 2);
expect(discovery.discovered.map((card) => card.id).join(",") === "zero-command,command", "灵狐发现应优先提供低费指令并受数量限制");
expect(discovery.remaining.length === 2 && discovery.remaining.some((card) => card.id === "attack"), "定向发现不得吞掉无关牌");
expect(discoverInstructions(pile, 2, 0).discovered.length === 0, "手牌已满时发现不得移走抽牌堆卡牌");

const recalled = recallBeastState({ activeBeast: "玄狼", contracts: ["玄狼", "白鹿"], beastDiscount: 1, lastWasInstruction: true });
expect(recalled.activeBeast === "" && recalled.contracts.length === 2, "归巢必须召回当前灵兽但保留契约");
expect(recalled.beastDiscount === 0 && !recalled.lastWasInstruction, "归巢后不得保留未使用的指令状态");

if (failures.length) {
  console.error(`Beast mechanics check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Beast mechanics check passed: moon phase, instruction discovery, and recall state are deterministic.");
