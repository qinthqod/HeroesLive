import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const savedRun = {
  screen: "map",
  selectedChapter: 3,
  routeProgress: 1,
  stage: 1,
  origin: "sword",
  hp: 64,
  qi: 3,
  maxQi: 3,
  stones: 18,
  deck: ["sword-0", "sword-1", "sword-2"],
  treasures: [],
  savedAt: Date.now(),
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
const failures = [];

try {
  await page.addInitScript((run) => {
    localStorage.setItem("qinglan-run-v1", JSON.stringify(run));
  }, savedRun);
  await page.goto(`${base}?overlay=settings`, { waitUntil: "networkidle" });
  await page.locator(".settings-overlay").waitFor();
  await page.locator(".save-summary-grid").waitFor();

  await page.locator(".abandon-run").click();
  await page.locator(".abandon-confirm").waitFor();
  let stillSaved = await page.evaluate(() => Boolean(localStorage.getItem("qinglan-run-v1")));
  if (!stillSaved) throw new Error("第一次点击放弃就删除了自动存档");

  await page.locator(".abandon-cancel").click();
  if (await page.locator(".abandon-confirm").count()) throw new Error("取消后确认提示仍然存在");
  stillSaved = await page.evaluate(() => Boolean(localStorage.getItem("qinglan-run-v1")));
  if (!stillSaved) throw new Error("取消放弃后自动存档丢失");

  await page.locator(".abandon-run").click();
  await page.locator(".abandon-confirm").waitFor();
  await page.locator(".abandon-run.armed").click();
  await page.waitForFunction(() => !localStorage.getItem("qinglan-run-v1"));
  const appClass = await page.locator(".app").getAttribute("class");
  if (!appClass?.includes("screen-home")) throw new Error(`确认放弃后没有回到山门：首页状态 ${appClass}`);

  console.log("Save safety smoke passed: abandon requires confirmation, supports cancel, and only then clears the run.");
} catch (error) {
  failures.push(error.message);
} finally {
  await page.close();
  await browser.close();
}

if (failures.length) {
  console.error(`Save safety smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
