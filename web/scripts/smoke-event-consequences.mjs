import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

async function run(name, query, check) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  try {
    await page.goto(`${base}?screen=event&origin=sword&${query}`, { waitUntil: "networkidle" });
    await page.locator(".campaign-map").waitFor();
    await page.waitForTimeout(150);
    await check(page);
    console.log(`✓ ${name}`);
  } catch (error) {
    failures.push(`${name}：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

await run("第二章灯油结算", "chapter=2&eventChoice=2&pendingRoute=1&pendingNode=event", async (page) => {
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-run-v1")));
  if (save.stones !== 38) throw new Error(`灵石结余为 ${save.stones}`);
  if (save.runClues.length !== 1 || save.nextEnemyShield !== 8) throw new Error("证据或下一战护体未结算");
});

await run("第五章无名遗物代价", "chapter=5&eventChoice=2&pendingRoute=1&pendingNode=event", async (page) => {
  const body = await page.locator("body").innerText();
  if (!body.includes("68/80")) throw new Error("生命没有从 80 降至 68");
});

await run("第四章谨慎离开", "chapter=4&eventChoice=3&pendingRoute=1&pendingNode=event", async (page) => {
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-run-v1")));
  if (save.runClues.length !== 0 || save.pendingClue) throw new Error("谨慎离开仍获得待查证线索");
});

await run("第六章途中剧情独立于奇遇", "chapter=6&eventChoice=1&pendingRoute=0&pendingNode=story", async (page) => {
  const body = await page.locator("body").innerText();
  if (!body.includes("72/80")) throw new Error("途中剧情的 8 点生命代价未结算");
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-run-v1")));
  if (!save.runChronicle.some((entry) => entry.includes("沈砚秋没有回谷的人生"))) throw new Error("途中剧情没有写入命途回响");
  if (!save.runChronicle.some((entry) => entry.includes("药方被记下"))) throw new Error("途中剧情没有写入选项后果回响");
});

await run("第六章月海遗舟高收益代价", "chapter=6&eventChoice=2&pendingRoute=1&pendingNode=event", async (page) => {
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem("qinglan-run-v1")));
  if (save.stones !== 46) throw new Error(`灵石结余为 ${save.stones}`);
  if (save.nextEnemyShield !== 12) throw new Error("最终首领护体代价未保留");
});

{
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  try {
    await page.goto(`${base}?screen=market&chapter=6&origin=sword`, { waitUntil: "networkidle" });
    const before = await page.locator(".market-deck-list article").count();
    await page.locator(".market-special").click();
    const after = await page.locator(".market-deck-list article").count();
    const notice = await page.locator(".market-notice").innerText();
    if (before !== 12 || after !== 11 || !notice.includes("偿还未行之路")) throw new Error(`牌组 ${before}→${after}；提示「${notice}」`);
    console.log("✓ 第六章月下浮市专属交易");
  } catch (error) {
    failures.push(`第六章月下浮市专属交易：${error.message.split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(`Event consequence smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Event consequence smoke passed: chapter events and route stories apply distinct persisted outcomes.");
