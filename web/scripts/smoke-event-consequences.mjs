import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const render = (query) => spawnSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--virtual-time-budget=1400",
  "--dump-dom",
  `${base}?screen=event&origin=sword&${query}`,
], { encoding: "utf8", timeout: 12000 }).stdout;

const failures = [];

const lampOil = render("chapter=2&eventChoice=2&pendingRoute=1&pendingNode=event");
if (!lampOil.includes("/ui/icons/stones.png") || !lampOil.includes(">38</span>")) {
  failures.push("第二章取走灯油后灵石应从 18 增至 38");
}
if (!lampOil.includes("1/5")) failures.push("调查型奇遇完成后应带回一条证据");

const relic = render("chapter=5&eventChoice=2&pendingRoute=1&pendingNode=event");
if (!relic.includes("/ui/icons/hp.png") || !relic.includes(">68/80</span>")) {
  failures.push("第五章取走无名者遗物后生命应从 80 降至 68");
}

const leave = render("chapter=4&eventChoice=3&pendingRoute=1&pendingNode=event");
if (!leave.includes("0/5")) failures.push("谨慎离开奇遇不得获得待查证线索");

if (failures.length) {
  console.error(`Event consequence smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Event consequence smoke passed: numeric costs apply and leaving forfeits the pending clue.");
