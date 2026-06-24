import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

async function open(query) {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
  await page.goto(`${base}?screen=combat&stage=3&enemyHp=100&qi=3&autoend=1&${query}`, { waitUntil: "networkidle" });
  await page.locator(".combat-screen").waitFor();
  await page.waitForTimeout(1700);
  return page;
}

try {
  const qiPage = await open("chapter=2&origin=sword&move=0");
  const qi = await qiPage.locator(".resource", { hasText: "灵气" }).locator("strong").innerText();
  if (qi !== "2/3") failures.push(`写名鬼灯夺气后应为 2/3，实际 ${qi}`);
  await qiPage.close();

  const dreamPage = await open("chapter=4&origin=sword&move=0");
  const dreamHand = await dreamPage.locator(".hand .game-card").count();
  if (dreamHand !== 4) failures.push(`无影城主窃梦后应有 4 张手牌，实际 ${dreamHand}`);
  await dreamPage.close();

  const cursePage = await open("chapter=5&origin=sword&move=1");
  const discard = await cursePage.locator(".discard-count").innerText();
  const shield = await cursePage.locator(".enemy-statuses .status-shield").innerText();
  if (discard !== "弃 6") failures.push(`守门真君改写后弃牌应为 6，实际 ${discard}`);
  if (!shield.includes("10")) failures.push(`守门真君改写后护体异常：${shield}`);
  await cursePage.close();
} catch (error) {
  failures.push(error.message.split("\n")[0]);
}

await browser.close();

if (failures.length) {
  console.error(`Boss pattern smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Boss pattern smoke passed: qi suppression, draw reduction, curse insertion, and shield gain.");
