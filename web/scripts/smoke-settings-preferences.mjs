import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
try {
  await page.goto(`${base}?overlay=settings`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("qinglan-profile-v2"));
  await page.goto(`${base}?overlay=settings`, { waitUntil: "networkidle" });
  await page.locator(".settings-overlay").waitFor();
  const initialMotion = await page.locator(".app").getAttribute("data-motion");
  const initialReadability = await page.locator(".app").getAttribute("data-readability");
  if (initialMotion !== "full") throw new Error(`默认动效状态异常：${initialMotion}`);
  if (initialReadability !== "standard") throw new Error(`默认可读状态异常：${initialReadability}`);
  const testbenchText = await page.locator(".feedback-testbench").innerText();
  const testbenchButtons = await page.locator(".feedback-testbench button").count();
  if (testbenchButtons !== 4) throw new Error(`反馈试音台按钮数量异常：${testbenchButtons}`);
  for (const phrase of ["反馈试音台", "出牌轻响", "护盾回声", "受击震荡", "战利落袋", "试听不会改变存档"]) {
    if (!testbenchText.includes(phrase)) throw new Error(`反馈试音台缺少 ${phrase}`);
  }
  await page.locator(".feedback-testbench button", { hasText: "出牌轻响" }).click();
  await page.locator(".feedback-testbench button", { hasText: "战利落袋" }).click();

  await page.locator(".feedback-settings button", { hasText: "低动效" }).click();
  const reducedMotion = await page.locator(".app").getAttribute("data-motion");
  if (reducedMotion !== "reduced") throw new Error(`开启低动效后根节点状态异常：${reducedMotion}`);

  await page.locator(".feedback-settings button", { hasText: "可读模式" }).click();
  const largeReadability = await page.locator(".app").getAttribute("data-readability");
  if (largeReadability !== "large") throw new Error(`开启可读模式后根节点状态异常：${largeReadability}`);

  const savedPreference = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2") || "{}")?.feedback);
  if (savedPreference?.reducedMotion !== true) throw new Error("低动效偏好没有持久化到本地档案");
  if (savedPreference?.readableText !== true) throw new Error("可读模式偏好没有持久化到本地档案");

  await page.goto(`${base}?overlay=settings`, { waitUntil: "networkidle" });
  await page.locator(".settings-overlay").waitFor();
  const restoredMotion = await page.locator(".app").getAttribute("data-motion");
  const restoredReadability = await page.locator(".app").getAttribute("data-readability");
  if (restoredMotion !== "reduced") throw new Error(`刷新后低动效没有恢复：${restoredMotion}`);
  if (restoredReadability !== "large") throw new Error(`刷新后可读模式没有恢复：${restoredReadability}`);

  await page.locator(".feedback-settings button", { hasText: "低动效" }).click();
  const fullMotion = await page.locator(".app").getAttribute("data-motion");
  if (fullMotion !== "full") throw new Error(`关闭低动效后根节点状态异常：${fullMotion}`);

  await page.locator(".feedback-settings button", { hasText: "可读模式" }).click();
  const standardReadability = await page.locator(".app").getAttribute("data-readability");
  if (standardReadability !== "standard") throw new Error(`关闭可读模式后根节点状态异常：${standardReadability}`);

  console.log("Settings preference smoke passed: reduced-motion and readable-text modes toggle, persist, and restore.");
} catch (error) {
  failures.push(error.message);
} finally {
  await page.close();
  await browser.close();
}

if (failures.length) {
  console.error(`Settings preference smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
