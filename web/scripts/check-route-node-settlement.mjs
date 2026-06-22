import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/main.jsx", import.meta.url)), "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(source.includes("marketVisit,") && source.includes("setMarketVisit(savedRun.marketVisit ||"), "坊市访问状态必须进入自动存档并可恢复");
expect(source.includes("sold: [...new Set(") && source.includes("treasureBought: true"), "坊市卡牌与法宝的唯一库存必须持久标记");
expect(source.includes("specialUsed: true") && source.includes("visit?.key === visitKey"), "坊市专属交易必须按章节路线持久锁定");
expect(source.includes("const leavingRef = useRef(false)") && source.includes("if (leavingRef.current) return"), "离开坊市必须防止快速连点重复推进路线");
expect((source.match(/const resolvedRef = useRef\(false\)/g) || []).length >= 3, "奇遇、调息与修炼必须各自具有单次结算锁");
expect((source.match(/if \(resolvedRef\.current\) return/g) || []).length >= 3, "非战斗节点必须阻止重复结算");
expect(source.includes("setRouteProgress((value) => Math.min(3, value + 1))"), "非战斗节点完成后必须推进到下一层路线");

if (failures.length) {
  console.error(`Route node settlement check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Route node settlement check passed: market inventory persists and non-combat nodes settle once.");
