import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

async function run(name, query, check) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=combat&chapter=3&stage=3&enemyHp=100&origin=soul&qi=10&${query}`, {
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

async function settle(page) {
  await page.waitForTimeout(1250);
}

await run("彼岸回响没有上一张牌时不可空放", "card=彼岸回响", async (page) => {
  if (!(await page.locator("button.game-card", { hasText: "彼岸回响" }).isDisabled())) throw new Error("空回响仍可点击");
});

await run("彼岸回响召回术法并将费用变为零", "card=彼岸回响&lastCard=火弹符&autoclick=1", async (page) => {
  await settle(page);
  const echoed = page.locator("button.game-card", { hasText: "火弹符" });
  if (await echoed.count() !== 1) throw new Error("没有召回上一张术法");
  if (await echoed.locator(".card-cost").innerText() !== "0") throw new Error("召回术法费用没有变为 0");
});

await run("无常索命优先献祭心魔并追加十点伤害", "card=无常索命&handCurses=1&autoclick=1", async (page) => {
  await settle(page);
  const body = await page.locator("body").innerText();
  if (!body.includes("74/100")) throw new Error("献祭心魔后没有造成 26 点伤害");
  if (await page.locator(".hand", { hasText: "命册缺页" }).count()) throw new Error("心魔仍留在手牌");
});

await run("借命灯拥有魂灯时免除自伤", "card=借命灯&lamps=1&autoclick=1", async (page) => {
  await settle(page);
  const hp = await page.locator(".resource", { hasText: "生命" }).locator("strong").innerText();
  if (hp !== "80/80") throw new Error(`实际生命为 ${hp}`);
});

await run("黄泉引路在满手时只召回可容纳的一张", "card=黄泉引路&hand=7&discard=2&autoclick=1", async (page) => {
  await settle(page);
  const handCount = await page.locator(".hand .game-card").count();
  const discard = await page.locator(".discard-count").innerText();
  if (handCount !== 7) throw new Error(`手牌数量为 ${handCount}`);
  if (discard !== "弃 2") throw new Error(`弃牌数量为 ${discard}`);
});

await run("燃魂与照影缺少资源时不可空放", "card=魂火焚身", async (page) => {
  if (!(await page.locator("button.game-card", { hasText: "魂火焚身" }).isDisabled())) throw new Error("零魂灯仍可燃魂");
});

await run("忘川照影没有本回合首牌时不可空放", "card=忘川照影", async (page) => {
  if (!(await page.locator("button.game-card", { hasText: "忘川照影" }).isDisabled())) throw new Error("无首牌仍可复制");
});

await run("百鬼夜行弃牌堆为空时不可空放", "card=百鬼夜行&lamps=5", async (page) => {
  if (!(await page.locator("button.game-card", { hasText: "百鬼夜行" }).isDisabled())) throw new Error("空弃牌堆仍可终结");
});

{
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=combat&chapter=3&stage=3&enemyHp=100&origin=sword&qi=10&card=青竹剑诀&treasures=wolf_tooth&autoclick=1`, {
      waitUntil: "networkidle",
    });
    await settle(page);
    const body = await page.locator("body").innerText();
    if (!body.includes("90/100")) throw new Error("首张攻击法宝没有严格追加一次 3 点伤害");
    console.log("✓ 首张攻击法宝只结算一次");
  } catch (error) {
    failures.push(`首张攻击法宝：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Soul mechanics smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Soul mechanics smoke passed: 9 runtime cases.");
