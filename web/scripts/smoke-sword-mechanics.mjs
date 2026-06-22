import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const cases = [
  {
    name: "回风剑只获得牌面声明的一层剑势",
    query: "card=回风剑&autoclick=1",
    check: (html) => /<strong>1·霜月<\/strong>/.test(html) && /<strong>92\/100<\/strong>/.test(html),
  },
  {
    name: "青竹剑诀首张攻击不产生隐藏剑势",
    query: "card=青竹剑诀&autoclick=1",
    check: (html) => /<strong>0·霜月<\/strong>/.test(html) && /<strong>93\/100<\/strong>/.test(html),
  },
  {
    name: "玉月成璧在霜月额外抽一张",
    query: "card=玉月成璧&moon=frost&autoclick=1",
    check: (html) => /aria-label="抽牌堆剩余 7 张"/.test(html) && /霜月护体 · 额外抽牌/.test(html),
  },
  {
    name: "玉月成璧在血月不额外抽牌",
    query: "card=玉月成璧&moon=blood&autoclick=1",
    check: (html) => /aria-label="抽牌堆剩余 8 张"/.test(html) && /<strong>0·血月<\/strong>/.test(html),
  },
];

const failures = [];
for (const test of cases) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=1800",
    "--dump-dom",
    `${base}?screen=combat&origin=sword&chapter=3&stage=3&enemyHp=100&qi=10&${test.query}`,
  ], { encoding: "utf8" });
  if (!test.check(result.stdout)) failures.push(test.name);
  else console.log(`✓ ${test.name}`);
}

if (failures.length) {
  console.error(`Sword mechanics smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Sword mechanics smoke passed: ${cases.length} runtime cases.`);
