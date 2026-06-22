import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

async function run(name, query, check) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=combat&origin=alchemy&chapter=3&stage=3&enemyHp=100&${query}`, {
      waitUntil: "networkidle",
    });
    await page.locator(".combat-screen").waitFor();
    await check(page);
    console.log(`✓ ${name}`);
  } catch (error) {
    failures.push(`${name}：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await run(
  "药炉温养缺少寒热时不可空放抽牌",
  "card=药炉温养&qi=10",
  async (page) => {
    const card = page.locator("button.game-card", { hasText: "药炉温养" });
    if (!(await card.isDisabled())) throw new Error("空炉状态下卡牌仍可点击");
  },
);

await run(
  "药炉温养成功调和后抽三并获得护盾",
  "card=药炉温养&cold=1&heat=1&qi=10&autoclick=1",
  async (page) => {
    await page.waitForTimeout(1200);
    const body = await page.locator("body").innerText();
    const shield = await page.locator(".resource", { hasText: "护盾" }).locator("strong").innerText();
    const drawLabel = await page.locator('[aria-label^="抽牌堆剩余"]').getAttribute("aria-label");
    if (shield !== "6") throw new Error(`护盾结算异常：${shield}`);
    if (drawLabel !== "抽牌堆剩余 4 张") throw new Error(`抽牌数量异常：${drawLabel}`);
    if (!body.includes("0寒/0热")) throw new Error("寒热没有各消耗 1 层");
  },
);

await run(
  "阴阳大还丹只兑现牌面十四点伤害",
  "card=阴阳大还丹&cold=2&heat=2&qi=10&autoclick=1",
  async (page) => {
    await page.waitForTimeout(1200);
    const body = await page.locator("body").innerText();
    if (!body.includes("86/100")) throw new Error("伤害不是牌面声明的 14 点");
    if (!body.includes("0寒/0热")) throw new Error("寒热没有被调和清空");
  },
);

await run(
  "阴阳大还丹寒热相等时费用变为一",
  "card=阴阳大还丹&cold=2&heat=2&qi=1",
  async (page) => {
    const cost = await page.locator("button.game-card", { hasText: "阴阳大还丹" }).locator(".card-cost").innerText();
    if (cost !== "1") throw new Error(`实际费用为 ${cost}`);
  },
);

await browser.close();

if (failures.length) {
  console.error(`Alchemy mechanics smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Alchemy mechanics smoke passed: 4 runtime cases.");
