import { chromium } from "playwright";

const base = "http://127.0.0.1:5174/";
const browser = await chromium.launch({ headless: true });
const failures = [];

async function run(name, viewport, path, check) {
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.locator(".app").waitFor();
    await page.waitForTimeout(250);
    await check(page);
    console.log(`✓ ${name}`);
  } catch (error) {
    failures.push(`${name}：${error.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

const layoutSnapshot = async (page) => page.evaluate(() => {
  const app = document.querySelector(".app");
  const shell = document.querySelector(".mobile-shell");
  const nav = document.querySelector(".mobile-nav");
  const chapterCards = [...document.querySelectorAll(".chapter-card")].map((card) => card.getBoundingClientRect());
  const shellBox = shell?.getBoundingClientRect();
  const navBox = nav?.getBoundingClientRect();
  return {
    device: app?.dataset.device,
    className: app?.className || "",
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    shellWidth: shellBox?.width || 0,
    navLeft: navBox?.left || 0,
    navTop: navBox?.top || 0,
    navBottomGap: navBox ? Math.round(window.innerHeight - navBox.bottom) : null,
    chapterRows: new Set(chapterCards.slice(0, 3).map((box) => Math.round(box.top))).size,
  };
});

await run("PC 首页进入桌面模式并使用宽屏壳层", { width: 1366, height: 768 }, "", async (page) => {
  const layout = await layoutSnapshot(page);
  if (layout.device !== "desktop" || !layout.className.includes("device-desktop")) throw new Error(`设备模式为 ${layout.device}`);
  if (layout.shellWidth < 1200) throw new Error(`桌面壳层仍像移动端：${layout.shellWidth}px`);
  if (layout.navLeft > 80 || layout.navTop < 80 || layout.navBottomGap === 0) throw new Error("PC 导航没有切换为左侧栏");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 首页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动首页保持移动模式和底部导航", { width: 430, height: 932 }, "", async (page) => {
  const layout = await layoutSnapshot(page);
  if (layout.device !== "mobile" || !layout.className.includes("device-mobile")) throw new Error(`设备模式为 ${layout.device}`);
  if (layout.shellWidth > 540) throw new Error(`移动壳层过宽：${layout.shellWidth}px`);
  if (layout.navBottomGap !== 0) throw new Error(`移动导航未贴底：${layout.navBottomGap}px`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动首页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 章节页使用三列章节卡片", { width: 1366, height: 768 }, "?screen=chapters", async (page) => {
  await page.locator(".chapter-card").first().waitFor();
  const layout = await layoutSnapshot(page);
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (layout.chapterRows !== 1) throw new Error("前三个章节卡没有排成同一行");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 章节页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 战斗页保持桌面战场布局", { width: 1366, height: 768 }, "?screen=combat&chapter=6&stage=3&move=0", async (page) => {
  await page.locator(".combat-screen").waitFor();
  const layout = await layoutSnapshot(page);
  const handBox = await page.locator(".hand").boundingBox();
  const enemyBox = await page.locator(".enemy-stage").boundingBox();
  const cardStates = await page.locator(".hand .card-play-state").allTextContents();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!handBox || handBox.width < 760) throw new Error(`PC 手牌区过窄：${handBox?.width}`);
  if (!enemyBox || enemyBox.width < 900) throw new Error(`PC 敌方舞台过窄：${enemyBox?.width}`);
  if (!cardStates.some((text) => /可出|联动|差|需|心魔/.test(text))) throw new Error("PC 战斗页没有显示卡牌即时状态");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 战斗页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 结束回合显示回合流转节奏", { width: 1366, height: 768 }, "?screen=combat&chapter=6&stage=3&move=0", async (page) => {
  await page.locator(".combat-screen").waitFor();
  await page.locator(".end-turn").click();
  await page.locator(".turn-flow").waitFor();
  const flowText = await page.locator(".turn-flow").innerText();
  const flowSteps = await page.locator(".turn-flow li").count();
  if (!flowText.includes("回合流转") || !flowText.includes("敌方行动")) throw new Error("结束回合没有显示敌方行动节奏");
  if (flowSteps !== 4) throw new Error(`回合流转步骤数异常：${flowSteps}`);
});

await run("PC 路线页显示序破急节奏导航", { width: 1366, height: 768 }, "?screen=map&chapter=4&routeProgress=2&clues=3", async (page) => {
  await page.locator(".route-pacing").waitFor();
  const layout = await layoutSnapshot(page);
  const pacingText = await page.locator(".route-pacing").innerText();
  const journeyBox = await page.locator(".route-journey").boundingBox();
  const notebookBox = await page.locator(".map-notebook").boundingBox();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!pacingText.includes("破") || !pacingText.includes("路线张力")) throw new Error("PC 路线页没有显示序破急节奏");
  if (!journeyBox || journeyBox.width < 560) throw new Error(`PC 路线主体过窄：${journeyBox?.width}`);
  if (!notebookBox || notebookBox.x <= journeyBox.x + journeyBox.width) throw new Error("PC 路线札记没有放在右侧信息栏");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 路线页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动路线页保留节奏提示且无横溢", { width: 430, height: 932 }, "?screen=map&chapter=4&routeProgress=2&clues=3", async (page) => {
  await page.locator(".route-pacing").waitFor();
  const layout = await layoutSnapshot(page);
  const pacingBox = await page.locator(".route-pacing").boundingBox();
  const cardCount = await page.locator(".route-choice-card").count();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (!pacingBox || pacingBox.width > 400) throw new Error(`移动节奏提示过宽：${pacingBox?.width}`);
  if (cardCount < 2 || cardCount > 3) throw new Error(`移动路线选择数量异常：${cardCount}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动路线页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 事件页使用左右分栏", { width: 1366, height: 768 }, "?screen=event&chapter=6&pendingRoute=0&pendingNode=story", async (page) => {
  await page.locator(".event-screen").waitFor();
  const layout = await layoutSnapshot(page);
  const copyBox = await page.locator(".event-copy").boundingBox();
  const choicesBox = await page.locator(".event-choices").boundingBox();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!copyBox || !choicesBox || choicesBox.x <= copyBox.x + copyBox.width) throw new Error("PC 事件页没有形成左右分栏");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 事件页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 坊市页保持双栏交易布局", { width: 1366, height: 768 }, "?screen=market&chapter=6&origin=sword", async (page) => {
  await page.locator(".market-layout").waitFor();
  const layout = await layoutSnapshot(page);
  const stallBox = await page.locator(".market-stall").boundingBox();
  const servicesBox = await page.locator(".market-services").boundingBox();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!stallBox || !servicesBox || servicesBox.x <= stallBox.x + stallBox.width) throw new Error("PC 坊市页没有形成交易双栏");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 坊市页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 奖励页保持宽屏三选一", { width: 1366, height: 768 }, "?screen=reward&chapter=6&stage=3&origin=sword&runChoices=%E6%89%BF%E6%8B%85%E9%81%97%E6%86%BE", async (page) => {
  await page.locator(".reward-screen").waitFor();
  await page.locator(".reward-reveal-panel").waitFor();
  await page.locator(".reward-card-wrap.revealed").first().waitFor();
  const layout = await layoutSnapshot(page);
  const rewardCards = await page.locator(".reward-card-wrap").count();
  const cardsBox = await page.locator(".reward-cards").boundingBox();
  const revealText = await page.locator(".reward-reveal-panel").innerText();
  const sealCount = await page.locator(".reward-card-seal").count();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (rewardCards !== 3) throw new Error(`奖励卡数量为 ${rewardCards}`);
  if (sealCount !== 3 || !revealText.includes("战利已开")) throw new Error("PC 奖励页缺少自动翻牌揭示效果");
  if (!cardsBox || cardsBox.width < 700) throw new Error(`PC 奖励卡区过窄：${cardsBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`PC 奖励页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 结算页可滚动复盘且不横溢", { width: 1366, height: 768 }, "?screen=summary&chapter=6&runChoices=%E6%89%BF%E6%8B%85%E9%81%97%E6%86%BE&clues=4", async (page) => {
  await page.locator(".summary-screen").waitFor();
  const layout = await layoutSnapshot(page);
  const summaryBox = await page.locator(".summary-copy").boundingBox();
  const causality = await page.locator(".summary-boss-causality").innerText();
  const nextGoal = await page.locator(".summary-next-goal").innerText();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!summaryBox || summaryBox.width < 500) throw new Error(`PC 结算主体过窄：${summaryBox?.width}`);
  if (!causality.includes("承担遗憾")) throw new Error("PC 结算页没有显示首领因果");
  if (!nextGoal.includes("下一枚印记")) throw new Error("PC 结算页没有展示下一项长期目标");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 结算页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await browser.close();

if (failures.length) {
  console.error(`Responsive layout smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Responsive layout smoke passed: desktop and mobile modes use distinct, non-overflowing layouts.");
