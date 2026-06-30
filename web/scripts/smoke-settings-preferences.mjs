import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
try {
  await page.goto(`${base}?overlay=settings`, { waitUntil: "networkidle" });
  await page.locator(".settings-overlay").waitFor();
  const initialMotion = await page.locator(".app").getAttribute("data-motion");
  if (initialMotion !== "full") throw new Error(`默认动效状态异常：${initialMotion}`);

  await page.locator(".feedback-settings button", { hasText: "低动效" }).click();
  const reducedMotion = await page.locator(".app").getAttribute("data-motion");
  if (reducedMotion !== "reduced") throw new Error(`开启低动效后根节点状态异常：${reducedMotion}`);

  const savedPreference = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-profile-v2") || "{}")?.feedback?.reducedMotion);
  if (savedPreference !== true) throw new Error("低动效偏好没有持久化到本地档案");

  await page.goto(`${base}?overlay=settings`, { waitUntil: "networkidle" });
  await page.locator(".settings-overlay").waitFor();
  const restoredMotion = await page.locator(".app").getAttribute("data-motion");
  if (restoredMotion !== "reduced") throw new Error(`刷新后低动效没有恢复：${restoredMotion}`);

  await page.locator(".feedback-settings button", { hasText: "低动效" }).click();
  const fullMotion = await page.locator(".app").getAttribute("data-motion");
  if (fullMotion !== "full") throw new Error(`关闭低动效后根节点状态异常：${fullMotion}`);

  console.log("Settings preference smoke passed: reduced-motion mode toggles, persists, and restores.");
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
