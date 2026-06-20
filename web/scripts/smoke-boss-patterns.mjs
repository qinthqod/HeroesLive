import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const render = (query) => spawnSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--virtual-time-budget=2400",
  "--dump-dom",
  `${base}?screen=combat&stage=3&enemyHp=100&qi=3&autoend=1&${query}`,
], { encoding: "utf8", timeout: 12000 }).stdout;

const failures = [];

const qiDom = render("chapter=2&origin=sword&move=0");
if (!qiDom.includes('<div class="qi-orb"><strong>2</strong><span>/3</span></div>')) {
  failures.push("写名鬼灯「借名引路」未使下一回合灵气降为 2/3");
}

const dreamDom = render("chapter=4&origin=sword&move=0");
const dreamHand = (dreamDom.match(/class="game-card /g) || []).length;
if (dreamHand !== 4) failures.push(`无影城主「窃取清梦」应使下一回合手牌为 4，实际 ${dreamHand}`);

const curseDom = render("chapter=5&origin=sword&move=1");
if (!curseDom.includes('<span class="discard-count">弃 6</span>')) {
  failures.push("守门真君「删去一页」未将心魔连同余牌保留在弃牌堆");
}
if (!curseDom.includes("护体 10")) failures.push("守门真君「删去一页」未获得 10 点护体");

if (failures.length) {
  console.error(`Boss pattern smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Boss pattern smoke passed: qi suppression, draw reduction, curse insertion, and shield gain.");
