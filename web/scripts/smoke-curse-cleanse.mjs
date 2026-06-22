import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const cases = [
  {
    name: "净坛真言净除弃牌堆心魔",
    query: "screen=combat&origin=talisman&card=净坛真言&curses=1&qi=3&autoclick=1",
    check: (html) => /class="discard-count">弃 1<\/span>/.test(html),
    expected: "心魔被净除后，弃牌堆只留下打出的净坛真言",
  },
  {
    name: "净坛真言无心魔转化灵气",
    query: "screen=combat&origin=talisman&card=净坛真言&qi=1&autoclick=1",
    check: (html) => /class="qi-orb"><strong>2<\/strong><span>\/3<\/span>/.test(html),
    expected: "支付 1 灵气后返还 2 灵气，最终为 2/3",
  },
  {
    name: "命册缺页不可直接打出",
    query: "screen=combat&origin=talisman&handCurses=1&qi=10",
    check: (html) => /命册缺页/.test(html) && !/button class="game-card[^"]*playable[^"]*"[^>]*>[\s\S]*?命册缺页/.test(html),
    expected: "心魔即使灵气充足也不可点击施放",
  },
];

const failures = [];
for (const test of cases) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=1800",
    "--dump-dom",
    `${base}?${test.query}`,
  ], { encoding: "utf8" });
  if (!test.check(result.stdout)) failures.push(`${test.name}: ${test.expected}`);
  else console.log(`✓ ${test.name}`);
}

if (failures.length) {
  console.error(`Curse cleanse smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Curse cleanse smoke passed: ${cases.length} runtime cases.`);
