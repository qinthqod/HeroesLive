import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const render = (query) => spawnSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--virtual-time-budget=2400",
  "--dump-dom",
  `${base}?screen=combat&enemyHp=100&qi=3&autoend=1&${query}`,
], { encoding: "utf8", timeout: 12000 }).stdout;

const failures = [];

const wolfDom = render("chapter=1&stage=1&origin=sword&move=1");
if (!wolfDom.includes("伏身蓄爪") || !wolfDom.includes("护体 6")) {
  failures.push("野狼妖影「伏身蓄爪」未获得 6 点护体");
}

const lanternDom = render("chapter=2&stage=1&origin=sword&move=0");
if (!lanternDom.includes('<div class="qi-orb"><strong>2</strong><span>/3</span></div>')) {
  failures.push("玄阴灯侍「灯绳缚气」未使下一回合灵气降为 2/3");
}

const thunderDom = render("chapter=3&stage=2&origin=sword&move=1");
if (!thunderDom.includes("你受到 15 点伤害")) {
  failures.push("问心劫使「二问承雷」未结算三段共 15 点伤害");
}

const dreamDom = render("chapter=4&stage=1&origin=sword&move=0");
const dreamHand = (dreamDom.match(/class="game-card /g) || []).length;
if (dreamHand !== 4) failures.push(`失梦游魂「舔食梦边」应使下一回合手牌为 4，实际 ${dreamHand}`);

const fateDom = render("chapter=5&stage=1&origin=sword&move=1");
if (!fateDom.includes('<span class="discard-count">弃 6</span>')) {
  failures.push("旧命残影「补写缺页」未将心魔连同余牌保留在弃牌堆");
}

if (failures.length) {
  console.error(`Enemy pattern smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Enemy pattern smoke passed: shield, qi drain, multi-hit, draw loss, and curse insertion.");
