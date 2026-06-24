import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

async function run(name, query, check) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await page.goto(`${base}?screen=combat&origin=talisman&chapter=3&stage=3&enemyHp=100&qi=3&${query}`, {
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

async function bodyAfterCast(page) {
  await page.waitForTimeout(1250);
  return page.locator("body").innerText();
}

await run(
  "玄雷敕令没有符印时不可空放",
  "card=玄雷敕令",
  async (page) => {
    const card = page.locator("button.game-card", { hasText: "玄雷敕令" });
    if (!(await card.isDisabled())) throw new Error("零符印时仍可点击");
  },
);

await run(
  "玄雷敕令按四枚符印造成二十四点伤害",
  "card=玄雷敕令&seals=4&autoclick=1",
  async (page) => {
    const body = await bodyAfterCast(page);
    const resource = await page.locator(".profession-resource strong").innerText();
    if (!body.includes("76/100")) throw new Error("四枚符印没有造成 24 点伤害");
    if (!resource.startsWith("0印/")) throw new Error("引爆后符印没有清空");
  },
);

await run(
  "雷火连符把自身计入追加段数",
  "card=雷火连符&symbols=2&autoclick=1",
  async (page) => {
    const body = await bodyAfterCast(page);
    if (!body.includes("75/100")) throw new Error("两张前序术法加本牌应造成 25 点伤害");
  },
);

await run(
  "阴火符即时燃烧读取借风倍率",
  "card=阴火符&seals=1&burn=3&burnMultiplier=2&autoclick=1",
  async (page) => {
    const body = await bodyAfterCast(page);
    const resource = await page.locator(".profession-resource strong").innerText();
    if (!body.includes("74/100")) throw new Error("基础伤害与双倍即时燃烧没有正确合计为 26");
    if (!resource.startsWith("0印/")) throw new Error("阴火符没有消耗一枚符印");
  },
);

await run(
  "赤篆减费明确作用于下一张术法牌",
  "card=火弹符&talismanDiscount=1",
  async (page) => {
    const cost = await page.locator("button.game-card", { hasText: "火弹符" }).locator(".card-cost").innerText();
    if (cost !== "0") throw new Error(`术法牌实际费用为 ${cost}`);
  },
);

await run(
  "赤篆连书按实际抽到的术法牌返还灵气",
  "card=赤篆连书&hand=7&autoclick=1",
  async (page) => {
    await bodyAfterCast(page);
    const qi = await page.locator(".resource", { hasText: "灵气" }).locator("strong").innerText();
    if (qi !== "4/3") throw new Error(`实际灵气为 ${qi}`);
  },
);

await browser.close();

if (failures.length) {
  console.error(`Talisman mechanics smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Talisman mechanics smoke passed: 6 runtime cases.");
