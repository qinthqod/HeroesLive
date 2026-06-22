import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const cases = [
  {
    name: "铜雀部署时只结算卡牌本身伤害",
    query: "card=铜雀飞梭&autoplay=1",
    hp: 93,
  },
  {
    name: "雷枢部署时不造成即时伤害",
    query: "card=雷枢阵列&autoplay=1",
    hp: 100,
  },
  {
    name: "既有铜雀不会冒充雷枢回合末炮击",
    query: "copperDevices=2&autoend=1",
    hp: 96,
  },
  {
    name: "雷枢伤害按每两点机巧增长",
    query: "thunderDevices=2&cunning=4&autoend=1",
    hp: 80,
  },
  {
    name: "墨轮抽牌唤醒铜雀且复位一个机关",
    query: "copperDevices=1&card=墨轮复位&autoplay=1",
    hp: 96,
  },
];

const failures = [];
for (const test of cases) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=3600",
    "--dump-dom",
    `${base}?screen=combat&origin=artificer&chapter=3&stage=3&enemyHp=100&qi=10&${test.query}`,
  ], { encoding: "utf8" });
  const match = result.stdout.match(/<strong>(\d+)\/100<\/strong>/);
  const actual = match ? Number(match[1]) : null;
  if (actual !== test.hp) failures.push(`${test.name}: expected ${test.hp}/100, got ${actual ?? "no result"}`);
  else console.log(`✓ ${test.name}: ${actual}/100`);
}

if (failures.length) {
  console.error(`Artificer device smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Artificer device smoke passed: ${cases.length} typed-device runtime cases.`);
