import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const cases = [
  {
    name: "血月兽潮在霜月保持基础伤害",
    query: "card=血月兽潮&moon=frost&autoclick=1",
    check: (html) => /<strong>85\/100<\/strong>/.test(html),
  },
  {
    name: "血月兽潮在血月每段追加两点",
    query: "card=血月兽潮&moon=blood&autoclick=1",
    check: (html) => /<strong>79\/100<\/strong>/.test(html),
  },
  {
    name: "灵狐探路定向发现指令牌",
    query: "card=灵狐探路&autoclick=1",
    check: (html) => /山君号令/.test(html) && /发现 1 张指令牌/.test(html),
  },
  {
    name: "归巢召回当前灵兽但保留契约",
    query: "card=归巢&contracts=2&autoclick=1",
    check: (html) => /归巢·2契·霜月/.test(html),
  },
];

const failures = [];
for (const test of cases) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=1800",
    "--dump-dom",
    `${base}?screen=combat&origin=beast&chapter=3&stage=3&enemyHp=100&qi=10&${test.query}`,
  ], { encoding: "utf8" });
  if (!test.check(result.stdout)) failures.push(test.name);
  else console.log(`✓ ${test.name}`);
}

if (failures.length) {
  console.error(`Beast mechanics smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Beast mechanics smoke passed: ${cases.length} runtime cases.`);
