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
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!handBox || handBox.width < 760) throw new Error(`PC 手牌区过窄：${handBox?.width}`);
  if (!enemyBox || enemyBox.width < 900) throw new Error(`PC 敌方舞台过窄：${enemyBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`PC 战斗页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await browser.close();

if (failures.length) {
  console.error(`Responsive layout smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Responsive layout smoke passed: desktop and mobile modes use distinct, non-overflowing layouts.");
