import { retrySupportFor } from "../src/retrySupport.js";

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const tiers = [0, 1, 2, 3].map(retrySupportFor);
expect(tiers[0].stones === 0 && tiers[0].skin === 0 && tiers[0].clarity === 0, "首次挑战不得携带重试扶助");
expect(tiers[1].skin === 1 && tiers[1].stones === 0, "首次失败后应只增加一张石肤符");
expect(tiers[2].stones === 4 && tiers[2].skin === 1, "第二次失败后应增加 4 灵石与一张石肤符");
expect(tiers[3].stones === 6 && tiers[3].skin === 1 && tiers[3].clarity === 1, "第三级扶助配置错误");
expect(JSON.stringify(retrySupportFor(99)) === JSON.stringify(tiers[3]), "扶助必须在第三级封顶");
expect(tiers.every((tier) => tier.damage === undefined && tier.maxHp === undefined && tier.qi === undefined), "扶助不得直接增加伤害、生命上限或灵气");

if (failures.length) {
  console.error(`Retry support check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Retry support check passed: three capped defensive tiers without damage or difficulty reduction.");
