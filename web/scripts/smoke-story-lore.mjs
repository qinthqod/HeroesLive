import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:5174/";
const profile = "/tmp/qinglan-story-lore-smoke";
rmSync(profile, { recursive: true, force: true });

const render = (url, budget = 1000) => spawnSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  `--user-data-dir=${profile}`,
  `--virtual-time-budget=${budget}`,
  "--dump-dom",
  url,
], { encoding: "utf8", timeout: 12000 });

for (const story of [0, 1, 2]) {
  const result = render(`${base}?screen=story&chapter=1&story=${story}&autostory=1`);
  if (result.status !== 0) {
    console.error(`Story lore smoke failed while reading scene ${story + 1}`);
    process.exit(1);
  }
}

const home = render(base).stdout;
const failures = [];
if (!home.includes("异闻已解")) failures.push("主城未显示异闻已解");
if (!home.includes("《砚秋手札·雨亭残页》已收入异闻录")) failures.push("主城未显示手札已收录");
if (!home.includes("<b>40</b><small>悟道</small>")) failures.push("三段剧情后悟道应从 32 增至 40");

render(`${base}?screen=story&chapter=1&story=2&autostory=1`);
const repeated = render(base).stdout;
if (!repeated.includes("<b>40</b><small>悟道</small>")) failures.push("重复阅读不应再次发放 8 悟道");

if (failures.length) {
  console.error(`Story lore smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Story lore smoke passed: three real scenes unlock one handbook and award spirit exactly once.");
