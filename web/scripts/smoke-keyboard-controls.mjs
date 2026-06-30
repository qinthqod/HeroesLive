import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
try {
  await page.goto(`${base}?screen=combat&chapter=1&stage=1&origin=sword&card=青竹剑诀&qi=9`, { waitUntil: "networkidle" });
  await page.locator(".combat-screen").waitFor();

  const hints = await page.locator(".desktop-control-hints").innerText();
  for (const phrase of ["单击卡牌立即出牌", "数字 1–7 出对应手牌", "Space 结束回合"]) {
    if (!hints.includes(phrase)) throw new Error(`PC 操作提示缺少：${phrase}`);
  }

  const firstStatus = await page.locator(".hand .game-card").first().innerText();
  if (!/青竹剑诀|可出/.test(firstStatus)) throw new Error(`第一张手牌不是稳定可出的青竹剑诀：${firstStatus}`);

  await page.keyboard.press("1");
  await page.locator(".played-card-fx").waitFor({ timeout: 4000 });
  const playedText = await page.locator(".played-card-fx").innerText();
  if (!playedText.includes("青竹剑诀")) throw new Error(`数字键 1 没有打出第一张手牌：${playedText}`);

  await page.locator(".played-card-fx").waitFor({ state: "hidden", timeout: 5000 });
  await page.keyboard.press("Space");
  await page.locator(".turn-flow").waitFor({ timeout: 5000 });
  const turnText = await page.locator(".turn-flow").innerText();
  if (!turnText.includes("回合流转")) throw new Error(`Space 没有触发回合结束流转：${turnText}`);

  console.log("Keyboard controls smoke passed: number keys cast cards and Space ends the turn.");
} catch (error) {
  failures.push(error.message);
} finally {
  await page.close();
  await browser.close();
}

if (failures.length) {
  console.error(`Keyboard controls smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
