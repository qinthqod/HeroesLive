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
    layout: app?.dataset.layout,
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
  const badgeText = await page.locator(".device-mode-badge").innerText();
  const panelText = await page.locator(".desktop-mode-panel").innerText();
  const mandateText = await page.locator(".home-action-mandate").innerText();
  const mandateCards = await page.locator(".home-action-mandate article").count();
  const mandateRows = await page.locator(".home-action-mandate article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const motivationText = await page.locator(".motivation-path-panel").innerText();
  const motivationCards = await page.locator(".motivation-path").count();
  const motivationRows = await page.locator(".motivation-path").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  if (layout.device !== "desktop" || !layout.className.includes("device-desktop")) throw new Error(`设备模式为 ${layout.device}`);
  if (layout.layout !== "wide-desktop") throw new Error(`PC 布局标识为 ${layout.layout}`);
  if (!badgeText.includes("PC 版")) throw new Error(`PC 页面没有显示设备判断：${badgeText}`);
  if (!panelText.includes("PC ADAPTIVE") || !panelText.includes("桌面端原则")) throw new Error("PC 首页没有桌面端专属状态栏");
  if (mandateCards !== 4 || mandateRows !== 1) throw new Error(`PC 今夜行动令没有四格展示：cards=${mandateCards}, rows=${mandateRows}`);
  for (const phrase of ["今夜行动令", "注意", "关联", "自信", "回报"]) {
    if (!mandateText.includes(phrase)) throw new Error(`PC 今夜行动令缺少 ${phrase}`);
  }
  if (motivationCards !== 3 || motivationRows !== 1) throw new Error(`PC 三线目标没有三列展示：cards=${motivationCards}, rows=${motivationRows}`);
  for (const phrase of ["三线目标", "稳健", "进取", "长期", "低风险", "高风险", "延迟满足"]) {
    if (!motivationText.includes(phrase)) throw new Error(`PC 三线目标缺少 ${phrase}`);
  }
  if (layout.shellWidth < 1200) throw new Error(`桌面壳层仍像移动端：${layout.shellWidth}px`);
  if (layout.navLeft > 80 || layout.navTop < 80 || layout.navBottomGap === 0) throw new Error("PC 导航没有切换为左侧栏");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 首页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动首页保持移动模式和底部导航", { width: 430, height: 932 }, "", async (page) => {
  const layout = await layoutSnapshot(page);
  const mandateText = await page.locator(".home-action-mandate").innerText();
  const mandateBox = await page.locator(".home-action-mandate").boundingBox();
  const mandateCards = await page.locator(".home-action-mandate article").count();
  const mandateRows = await page.locator(".home-action-mandate article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const motivationBox = await page.locator(".motivation-path-panel").boundingBox();
  const motivationCards = await page.locator(".motivation-path").count();
  const motivationText = await page.locator(".motivation-path-panel").innerText();
  if (layout.device !== "mobile" || !layout.className.includes("device-mobile")) throw new Error(`设备模式为 ${layout.device}`);
  if (layout.layout !== "compact-mobile") throw new Error(`移动布局标识为 ${layout.layout}`);
  if (await page.locator(".desktop-mode-panel").count()) throw new Error("移动首页不应渲染 PC 专属状态栏");
  if (mandateCards !== 4 || mandateRows !== 2) throw new Error(`移动今夜行动令没有两列展示：cards=${mandateCards}, rows=${mandateRows}`);
  for (const phrase of ["今夜行动令", "注意", "关联", "自信", "回报"]) {
    if (!mandateText.includes(phrase)) throw new Error(`移动今夜行动令缺少 ${phrase}`);
  }
  if (!mandateBox || mandateBox.width > 402) throw new Error(`移动今夜行动令过宽：${mandateBox?.width}`);
  if (motivationCards !== 3 || !motivationText.includes("三线目标")) throw new Error("移动首页缺少三线目标");
  if (!motivationBox || motivationBox.width > 402) throw new Error(`移动三线目标过宽：${motivationBox?.width}`);
  if (layout.shellWidth > 540) throw new Error(`移动壳层过宽：${layout.shellWidth}px`);
  if (layout.navBottomGap !== 0) throw new Error(`移动导航未贴底：${layout.navBottomGap}px`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动首页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 试炼札记提供四步学习手册", { width: 1366, height: 768 }, "?overlay=guide", async (page) => {
  await page.locator(".guide-playbook").waitFor();
  const layout = await layoutSnapshot(page);
  const guideText = await page.locator(".guide-overlay").innerText();
  const guideCards = await page.locator(".guide-playbook article").count();
  const guideRows = await page.locator(".guide-playbook article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (guideCards !== 4) throw new Error(`试炼札记区块数异常：${guideCards}`);
  for (const phrase of ["读局面", "选路线", "取战利", "整牌组", "当前牌组提醒"]) {
    if (!guideText.includes(phrase)) throw new Error(`试炼札记缺少 ${phrase}`);
  }
  if (guideRows !== 1) throw new Error("PC 试炼札记没有使用四列桌面手册");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 试炼札记横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动试炼札记单列且不横溢", { width: 430, height: 932 }, "?overlay=guide", async (page) => {
  await page.locator(".guide-playbook").waitFor();
  const layout = await layoutSnapshot(page);
  const guideBox = await page.locator(".guide-overlay").boundingBox();
  const guideCards = await page.locator(".guide-playbook article").count();
  const guideRows = await page.locator(".guide-playbook article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (guideCards !== 4 || guideRows !== 4) throw new Error(`移动试炼札记未保持四块单列：cards=${guideCards}, rows=${guideRows}`);
  if (!guideBox || guideBox.width > 402) throw new Error(`移动试炼札记过宽：${guideBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动试炼札记横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 牌组卷册展示四轴平衡雷达", { width: 1366, height: 768 }, "?overlay=deck&origin=sword", async (page) => {
  await page.locator(".deck-balance-radar").waitFor();
  const layout = await layoutSnapshot(page);
  const radarText = await page.locator(".deck-balance-radar").innerText();
  const radarCards = await page.locator(".deck-balance-radar article").count();
  const radarRows = await page.locator(".deck-balance-radar article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (radarCards !== 4 || radarRows !== 1) throw new Error(`PC 平衡雷达未四列展示：cards=${radarCards}, rows=${radarRows}`);
  for (const phrase of ["平衡雷达", "输出", "生存", "循环", "费用"]) {
    if (!radarText.includes(phrase)) throw new Error(`PC 平衡雷达缺少 ${phrase}`);
  }
  if (layout.scrollWidth > layout.width) throw new Error(`PC 牌组卷册横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动牌组卷册平衡雷达两列可读", { width: 430, height: 932 }, "?overlay=deck&origin=sword", async (page) => {
  await page.locator(".deck-balance-radar").waitFor();
  const layout = await layoutSnapshot(page);
  const radarText = await page.locator(".deck-balance-radar").innerText();
  const radarBox = await page.locator(".deck-balance-radar").boundingBox();
  const radarCards = await page.locator(".deck-balance-radar article").count();
  const radarRows = await page.locator(".deck-balance-radar article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (radarCards !== 4 || radarRows !== 2) throw new Error(`移动平衡雷达未两列展示：cards=${radarCards}, rows=${radarRows}`);
  for (const phrase of ["平衡雷达", "输出", "生存", "循环", "费用"]) {
    if (!radarText.includes(phrase)) throw new Error(`移动平衡雷达缺少 ${phrase}`);
  }
  if (!radarBox || radarBox.width > 402) throw new Error(`移动平衡雷达过宽：${radarBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动牌组卷册横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 异闻录按五卷组织二十五章宗卷", { width: 1366, height: 768 }, "?overlay=codex", async (page) => {
  await page.locator(".casebook-volume-grid").waitFor();
  const layout = await layoutSnapshot(page);
  const codexText = await page.locator(".codex-overlay").innerText();
  const volumeCount = await page.locator(".casebook-volume-grid button").count();
  const visibleArchiveCount = await page.locator(".investigation-archive article").count();
  const volumeRows = await page.locator(".casebook-volume-grid button").evaluateAll((buttons) => new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().top))).size);
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (volumeCount !== 5) throw new Error(`异闻录分卷数量为 ${volumeCount}`);
  if (visibleArchiveCount !== 5) throw new Error(`PC 异闻录当前卷没有限制为五章：${visibleArchiveCount}`);
  if (volumeRows !== 1) throw new Error("PC 异闻录五卷导航没有单行展示");
  for (const phrase of ["当前追踪", "调查宗卷 · 第 1 卷", "挑战卷", "最近战绩"]) {
    if (!codexText.includes(phrase)) throw new Error(`PC 异闻录缺少 ${phrase}`);
  }
  if (layout.scrollWidth > layout.width) throw new Error(`PC 异闻录横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动异闻录分卷横向导航且宗卷单列", { width: 430, height: 932 }, "?overlay=codex", async (page) => {
  await page.locator(".casebook-volume-grid").waitFor();
  const layout = await layoutSnapshot(page);
  const volumeCount = await page.locator(".casebook-volume-grid button").count();
  const visibleArchiveCount = await page.locator(".investigation-archive article").count();
  const archiveBox = await page.locator(".investigation-archive").boundingBox();
  const volumeDisplay = await page.locator(".casebook-volume-grid").evaluate((node) => getComputedStyle(node).display);
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (volumeCount !== 5) throw new Error(`移动异闻录分卷数量为 ${volumeCount}`);
  if (visibleArchiveCount !== 5) throw new Error(`移动异闻录当前卷没有限制为五章：${visibleArchiveCount}`);
  if (volumeDisplay !== "flex") throw new Error(`移动异闻录分卷导航没有切换为横向滑动：${volumeDisplay}`);
  if (!archiveBox || archiveBox.width > 402) throw new Error(`移动宗卷列表过宽：${archiveBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动异闻录横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 章节页使用三列章节卡片", { width: 1366, height: 768 }, "?screen=chapters", async (page) => {
  await page.locator(".chapter-card").first().waitFor();
  const layout = await layoutSnapshot(page);
  const arcText = await page.locator(".chapter-arc-overview").innerText();
  const arcCards = await page.locator(".chapter-arc-overview button").count();
  const arcRows = await page.locator(".chapter-arc-overview button").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const casefileText = await page.locator(".chapter-casefile").innerText();
  const briefingText = await page.locator(".chapter-starter-briefing").innerText();
  const briefingCards = await page.locator(".chapter-starter-briefing article").count();
  const briefingRows = await page.locator(".chapter-starter-briefing article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const casefileBox = await page.locator(".chapter-casefile").boundingBox();
  const bossCardBox = await page.locator(".casefile-boss-card").boundingBox();
  const loreCards = await page.locator(".casefile-lore section").count();
  const volumeButtons = await page.locator(".chapter-volume-nav button").count();
  const chapterCards = await page.locator(".chapter-card").count();
  const firstCardText = await page.locator(".chapter-card").first().innerText();
  const firstCardBox = await page.locator(".chapter-card").first().boundingBox();
  const firstBossSigil = await page.locator(".chapter-boss-sigil").first().innerText();
  const firstBossSigilBox = await page.locator(".chapter-boss-sigil").first().boundingBox();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (arcCards !== 5 || arcRows !== 1) throw new Error(`PC 主线五卷弧线没有五列展示：cards=${arcCards}, rows=${arcRows}`);
  for (const phrase of ["主线五卷弧线", "25 章 · 序破急回", "命册启疑", "归墟自在"]) {
    if (!arcText.includes(phrase)) throw new Error(`PC 主线弧线缺少 ${phrase}`);
  }
  for (const phrase of ["案卷预览", "首领现形", "调查目标", "路线节奏", "首领宗卷", "敌情压力"]) {
    if (!casefileText.includes(phrase)) throw new Error(`PC 章节案卷缺少 ${phrase}`);
  }
  if (briefingCards !== 4 || briefingRows !== 1) throw new Error(`PC 开局简报没有四列展示：cards=${briefingCards}, rows=${briefingRows}`);
  for (const phrase of ["开局简报", "本章焦点", "构筑准备", "调查回报", "失败保护"]) {
    if (!briefingText.includes(phrase)) throw new Error(`PC 开局简报缺少 ${phrase}`);
  }
  if (!casefileBox || casefileBox.width < 1000 || casefileBox.height < 330) throw new Error(`PC 章节案卷尺寸异常：${casefileBox?.width}×${casefileBox?.height}`);
  if (!bossCardBox || bossCardBox.width < 480) throw new Error(`PC 首领现形卡过窄：${bossCardBox?.width}`);
  if (loreCards !== 5) throw new Error(`PC 章节案卷信息块数量异常：${loreCards}`);
  if (volumeButtons !== 5) throw new Error(`PC 部卷筛选数量为 ${volumeButtons}`);
  if (chapterCards !== 5) throw new Error(`PC 当前部卷章节卡数量为 ${chapterCards}`);
  if (layout.chapterRows !== 1) throw new Error("前三个章节卡没有排成同一行");
  if (!firstBossSigil.includes("第七盏灯") || !firstBossSigil.includes("灯火试心")) throw new Error("PC 章节卡缺少 Boss 身份签");
  if (!firstBossSigilBox || firstBossSigilBox.width < 130) throw new Error(`PC 章节 Boss 签过窄：${firstBossSigilBox?.width}`);
  if (!firstCardText.includes("证据") || !firstCardText.includes("后记") || !firstCardText.includes("劫数") || !firstCardText.includes("下一目标")) throw new Error("PC 章节卡缺少复玩目标");
  if (!firstCardText.includes("敌压") || !firstCardText.includes("容错") || !firstCardText.includes("建议")) throw new Error("PC 章节卡缺少难度画像");
  if (!firstCardBox || firstCardBox.height < 300) throw new Error(`PC 章节卡高度不足以承载目标梯度：${firstCardBox?.height}`);
  if (layout.scrollWidth > layout.width) throw new Error(`PC 章节页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动章节页显示复玩目标且不横溢", { width: 430, height: 932 }, "?screen=chapters", async (page) => {
  await page.locator(".chapter-card").first().waitFor();
  const layout = await layoutSnapshot(page);
  const arcText = await page.locator(".chapter-arc-overview").innerText();
  const arcBox = await page.locator(".chapter-arc-overview").boundingBox();
  const arcCards = await page.locator(".chapter-arc-overview button").count();
  const casefileText = await page.locator(".chapter-casefile").innerText();
  const briefingText = await page.locator(".chapter-starter-briefing").innerText();
  const briefingBox = await page.locator(".chapter-starter-briefing").boundingBox();
  const briefingCards = await page.locator(".chapter-starter-briefing article").count();
  const briefingRows = await page.locator(".chapter-starter-briefing article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const casefileBox = await page.locator(".chapter-casefile").boundingBox();
  const bossCardBox = await page.locator(".casefile-boss-card").boundingBox();
  const volumeButtons = await page.locator(".chapter-volume-nav button").count();
  const chapterCards = await page.locator(".chapter-card").count();
  const firstCardText = await page.locator(".chapter-card").first().innerText();
  const firstBossSigil = await page.locator(".chapter-boss-sigil").first().innerText();
  const firstBossSigilBox = await page.locator(".chapter-boss-sigil").first().boundingBox();
  const goalBox = await page.locator(".chapter-replay-goals").first().boundingBox();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (arcCards !== 5) throw new Error(`移动主线五卷弧线数量为 ${arcCards}`);
  for (const phrase of ["主线五卷弧线", "命册启疑", "归墟自在"]) {
    if (!arcText.includes(phrase)) throw new Error(`移动主线弧线缺少 ${phrase}`);
  }
  if (!arcBox || arcBox.width > 402) throw new Error(`移动主线五卷弧线过宽：${arcBox?.width}`);
  for (const phrase of ["案卷预览", "首领现形", "调查目标", "路线节奏", "首领宗卷"]) {
    if (!casefileText.includes(phrase)) throw new Error(`移动章节案卷缺少 ${phrase}`);
  }
  if (briefingCards !== 4 || briefingRows !== 2) throw new Error(`移动开局简报未保持两列：cards=${briefingCards}, rows=${briefingRows}`);
  for (const phrase of ["开局简报", "本章焦点", "构筑准备", "调查回报", "失败保护"]) {
    if (!briefingText.includes(phrase)) throw new Error(`移动开局简报缺少 ${phrase}`);
  }
  if (!briefingBox || briefingBox.width > 366) throw new Error(`移动开局简报过宽：${briefingBox?.width}`);
  if (!casefileBox || casefileBox.width > 402) throw new Error(`移动章节案卷过宽：${casefileBox?.width}`);
  if (!bossCardBox || bossCardBox.width > 366) throw new Error(`移动首领现形卡过宽：${bossCardBox?.width}`);
  if (volumeButtons !== 5) throw new Error(`移动部卷筛选数量为 ${volumeButtons}`);
  if (chapterCards !== 5) throw new Error(`移动当前部卷章节卡数量为 ${chapterCards}`);
  if (!firstBossSigil.includes("第七盏灯") || !firstBossSigil.includes("灯火试心")) throw new Error("移动章节卡缺少 Boss 身份签");
  if (!firstBossSigilBox || firstBossSigilBox.width > 290) throw new Error(`移动章节 Boss 签过宽：${firstBossSigilBox?.width}`);
  if (!firstCardText.includes("证据") || !firstCardText.includes("后记") || !firstCardText.includes("劫数") || !firstCardText.includes("下一目标")) throw new Error("移动章节卡缺少复玩目标");
  if (!firstCardText.includes("敌压") || !firstCardText.includes("容错") || !firstCardText.includes("建议")) throw new Error("移动章节卡缺少难度画像");
  if (!goalBox || goalBox.width > 390) throw new Error(`移动章节复玩目标过宽：${goalBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动章节页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 悟道树展示成长处方和可点亮状态", { width: 1366, height: 768 }, "?screen=growth", async (page) => {
  await page.locator(".growth-prescription").waitFor();
  const layout = await layoutSnapshot(page);
  const prescriptionText = await page.locator(".growth-prescription").innerText();
  const prescriptionCards = await page.locator(".growth-prescription article").count();
  const prescriptionRows = await page.locator(".growth-prescription article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const affordableNodes = await page.locator(".talent-node.affordable").count();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (prescriptionCards !== 3 || prescriptionRows !== 1) throw new Error(`PC 成长处方没有三列展示：cards=${prescriptionCards}, rows=${prescriptionRows}`);
  for (const phrase of ["下一局处方", "确定放出", "补完收益", "消耗节奏"]) {
    if (!prescriptionText.includes(phrase)) throw new Error(`PC 悟道树处方缺少 ${phrase}`);
  }
  if (affordableNodes < 1) throw new Error("PC 悟道树没有标记可点亮节点");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 悟道树横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动悟道树处方单列且节点状态清晰", { width: 430, height: 932 }, "?screen=growth", async (page) => {
  await page.locator(".growth-prescription").waitFor();
  const layout = await layoutSnapshot(page);
  const prescriptionBox = await page.locator(".growth-prescription").boundingBox();
  const prescriptionRows = await page.locator(".growth-prescription article").evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size);
  const nodeText = await page.locator(".talent-path").innerText();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (prescriptionRows !== 3) throw new Error(`移动成长处方未保持三块单列：rows=${prescriptionRows}`);
  if (!nodeText.includes("可点亮") && !nodeText.includes("还差")) throw new Error("移动悟道树节点缺少可点亮/差额状态");
  if (!prescriptionBox || prescriptionBox.width > 402) throw new Error(`移动成长处方过宽：${prescriptionBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动悟道树横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 职业页展示起手牌与构筑入口", { width: 1366, height: 768 }, "?screen=classes&origin=sword", async (page) => {
  await page.locator(".class-system-grid").waitFor();
  const layout = await layoutSnapshot(page);
  const systemText = await page.locator(".mechanic-panel").innerText();
  const focusBox = await page.locator(".class-focus").boundingBox();
  const starterBox = await page.locator(".starter-handbook").boundingBox();
  const recipeBox = await page.locator(".class-recipe-preview").boundingBox();
  const miniCards = await page.locator(".starter-preview .mini-card").count();
  const recipeCards = await page.locator(".class-recipe-preview article").count();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  for (const phrase of ["开局循环", "起始手札", "推荐构筑入口", "真传核心"]) {
    if (!systemText.includes(phrase)) throw new Error(`PC 职业页缺少 ${phrase}`);
  }
  if (miniCards < 8) throw new Error(`PC 起手牌预览不足：${miniCards}`);
  if (recipeCards !== 3) throw new Error(`PC 构筑入口数量异常：${recipeCards}`);
  if (!focusBox || focusBox.height < 560) throw new Error(`PC 职业画像高度不足：${focusBox?.height}`);
  if (!starterBox || !recipeBox || recipeBox.x < starterBox.x - 4) throw new Error("PC 职业页没有形成右侧起手牌/构筑信息列");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 职业页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动职业页保留开局预览且不横溢", { width: 430, height: 932 }, "?screen=classes&origin=soul", async (page) => {
  await page.locator(".starter-handbook").waitFor();
  const layout = await layoutSnapshot(page);
  const systemText = await page.locator(".mechanic-panel").innerText();
  const starterBox = await page.locator(".starter-handbook").boundingBox();
  const countsBox = await page.locator(".starter-card-counts").boundingBox();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  for (const phrase of ["开局循环", "起始手札", "推荐构筑入口"]) {
    if (!systemText.includes(phrase)) throw new Error(`移动职业页缺少 ${phrase}`);
  }
  if (!starterBox || starterBox.width > 402) throw new Error(`移动起手牌面板过宽：${starterBox?.width}`);
  if (!countsBox || countsBox.width > 380) throw new Error(`移动起手牌统计过宽：${countsBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动职业页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 藏经阁流派页展示下一卷追踪", { width: 1366, height: 768 }, "?screen=collection&origin=sword&collectionView=builds", async (page) => {
  await page.locator(".build-target-panel").waitFor();
  const layout = await layoutSnapshot(page);
  const targetText = await page.locator(".build-target-panel").innerText();
  const libraryBox = await page.locator(".build-library").boundingBox();
  const recipeCards = await page.locator(".build-recipe").count();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  for (const phrase of ["下一卷追踪", "优先在战利、坊市和异闻", "未收录"]) {
    if (!targetText.includes(phrase)) throw new Error(`PC 流派追踪缺少 ${phrase}`);
  }
  if (recipeCards < 18) throw new Error(`PC 流派图谱数量不足：${recipeCards}`);
  if (!libraryBox || libraryBox.width < 1000) throw new Error(`PC 流派图谱区域过窄：${libraryBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`PC 藏经阁横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动藏经阁流派页保留关键词线索", { width: 430, height: 932 }, "?screen=collection&origin=soul&collectionView=builds", async (page) => {
  await page.locator(".build-target-panel").waitFor();
  const layout = await layoutSnapshot(page);
  const targetBox = await page.locator(".build-target-panel").boundingBox();
  const unknownText = await page.locator(".build-recipe .unknown").first().innerText();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (!targetBox || targetBox.width > 402) throw new Error(`移动流派追踪过宽：${targetBox?.width}`);
  if (!unknownText.includes("未收录组件") || !unknownText.includes("·")) throw new Error("移动流派未知组件缺少关键词线索");
  if (layout.scrollWidth > layout.width) throw new Error(`移动藏经阁横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 战斗页保持桌面战场布局", { width: 1366, height: 768 }, "?screen=combat&chapter=6&stage=3&move=0", async (page) => {
  await page.locator(".combat-screen").waitFor();
  const layout = await layoutSnapshot(page);
  const handBox = await page.locator(".hand").boundingBox();
  const enemyBox = await page.locator(".enemy-stage").boundingBox();
  const playerBox = await page.locator(".player-rail").boundingBox();
  const progressBox = await page.locator(".progress-rail").boundingBox();
  const qiBox = await page.locator(".qi-orb").boundingBox();
  const trackerBox = await page.locator(".combat-build-tracker").boundingBox();
  const cardStates = await page.locator(".hand .card-play-state").allTextContents();
  const controlHints = await page.locator(".desktop-control-hints").innerText();
  const learningCue = await page.locator(".combat-learning-cue").innerText();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (layout.layout !== "wide-desktop") throw new Error(`PC 战斗布局标识为 ${layout.layout}`);
  if (!handBox || handBox.width < 760) throw new Error(`PC 手牌区过窄：${handBox?.width}`);
  if (!enemyBox || enemyBox.width < 820) throw new Error(`PC 敌方舞台过窄：${enemyBox?.width}`);
  if (!playerBox || !progressBox || playerBox.right >= enemyBox.x || progressBox.x <= enemyBox.x + enemyBox.width) throw new Error("PC 战斗页没有形成左中右桌面战局");
  if (qiBox && trackerBox && !(trackerBox.y + trackerBox.height < qiBox.y || qiBox.y + qiBox.height < trackerBox.y || trackerBox.x + trackerBox.width < qiBox.x || qiBox.x + qiBox.width < trackerBox.x)) throw new Error("PC 流派目标卡压住了灵气球");
  if (!cardStates.some((text) => /可出|联动|差|需|心魔/.test(text))) throw new Error("PC 战斗页没有显示卡牌即时状态");
  if (!learningCue.includes("本回合目标") || !learningCue.includes("读敌意")) throw new Error(`PC 战斗页缺少本回合学习目标：${learningCue}`);
  if (!controlHints.includes("单击卡牌立即出牌") || !controlHints.includes("数字 1–7 出对应手牌") || !controlHints.includes("Space 结束回合")) throw new Error("PC 战斗页缺少桌面操作提示");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 战斗页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 首战引导按读敌意出牌交回合推进", { width: 1366, height: 768 }, "?screen=combat&chapter=1&stage=1&tutorial=1", async (page) => {
  await page.locator(".combat-guide").waitFor();
  let guideText = await page.locator(".combat-guide").innerText();
  const guideSteps = await page.locator(".guide-steps li").count();
  if (guideSteps !== 3 || !guideText.includes("读敌意") || !guideText.includes("点卡牌") || !guideText.includes("交回合")) throw new Error("首战引导缺少三步学习脚印");
  if (!guideText.includes("当前只要做一件事：读")) throw new Error("首战引导第一步没有聚焦单一动作");
  await page.locator(".guide-next").click();
  await page.locator(".combat-guide.guide-1").waitFor();
  guideText = await page.locator(".combat-guide").innerText();
  if (!guideText.includes("单击卡牌") || !guideText.includes("当前只要做一件事：点")) throw new Error("首战引导未进入单击出牌步骤");
  await page.locator(".hand .game-card.playable").first().click();
  await page.locator(".combat-learning-cue.mastery").waitFor();
  const masteryText = await page.locator(".combat-learning-cue").innerText();
  if (!masteryText.includes("模式掌握")) throw new Error(`出牌后没有形成模式掌握反馈：${masteryText}`);
  await page.locator(".combat-guide.guide-2").waitFor();
  guideText = await page.locator(".combat-guide").innerText();
  if (!guideText.includes("结束回合") || !guideText.includes("当前只要做一件事：交")) throw new Error("首战引导未在出牌后推进到交回合步骤");
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
  const spaceText = await page.locator(".route-space-read").first().innerText();
  const journeyBox = await page.locator(".route-journey").boundingBox();
  const notebookBox = await page.locator(".map-notebook").boundingBox();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!pacingText.includes("破") || !pacingText.includes("路线张力")) throw new Error("PC 路线页没有显示序破急节奏");
  for (const phrase of ["了望", "庇护", "光", "压"]) {
    if (!spaceText.includes(phrase)) throw new Error(`PC 路线空间读法缺少 ${phrase}：${spaceText}`);
  }
  if (!journeyBox || journeyBox.width < 560) throw new Error(`PC 路线主体过窄：${journeyBox?.width}`);
  if (!notebookBox || notebookBox.x <= journeyBox.x + journeyBox.width) throw new Error("PC 路线札记没有放在右侧信息栏");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 路线页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动路线页保留节奏提示且无横溢", { width: 430, height: 932 }, "?screen=map&chapter=4&routeProgress=2&clues=3", async (page) => {
  await page.locator(".route-pacing").waitFor();
  const layout = await layoutSnapshot(page);
  const pacingBox = await page.locator(".route-pacing").boundingBox();
  const spaceBox = await page.locator(".route-space-read").first().boundingBox();
  const spaceText = await page.locator(".route-space-read").first().innerText();
  const cardCount = await page.locator(".route-choice-card").count();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (!pacingBox || pacingBox.width > 400) throw new Error(`移动节奏提示过宽：${pacingBox?.width}`);
  if (!spaceBox || spaceBox.width > 372) throw new Error(`移动路线空间读法过宽：${spaceBox?.width}`);
  if (!spaceText.includes("庇护") && !spaceText.includes("了望")) throw new Error(`移动路线空间读法缺少了望/庇护：${spaceText}`);
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
  const economyText = await page.locator(".market-economy").innerText();
  const offerEconomy = await page.locator(".market-offer-economy").allTextContents();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!stallBox || !servicesBox || servicesBox.x <= stallBox.x + stallBox.width) throw new Error("PC 坊市页没有形成交易双栏");
  if (!economyText.includes("预算状态") || !economyText.includes("最低交易")) throw new Error("PC 坊市页缺少预算状态或最低交易提示");
  if (!offerEconomy.some((text) => text.includes("买后余") || text.includes("尚缺"))) throw new Error("PC 坊市商品缺少买后余量或缺口提示");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 坊市页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动坊市页显示预算且不横溢", { width: 430, height: 932 }, "?screen=market&chapter=6&origin=sword", async (page) => {
  await page.locator(".market-economy").waitFor();
  const layout = await layoutSnapshot(page);
  const economyBox = await page.locator(".market-economy").boundingBox();
  const economyText = await page.locator(".market-economy").innerText();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (!economyBox || economyBox.width > 402) throw new Error(`移动坊市预算面板过宽：${economyBox?.width}`);
  if (!economyText.includes("预算状态") || !economyText.includes("当前灵石")) throw new Error("移动坊市页缺少预算信息");
  if (layout.scrollWidth > layout.width) throw new Error(`移动坊市页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 奖励页保持宽屏三选一", { width: 1366, height: 768 }, "?screen=reward&chapter=6&stage=3&origin=sword&runChoices=%E6%89%BF%E6%8B%85%E9%81%97%E6%86%BE", async (page) => {
  await page.locator(".reward-screen").waitFor();
  await page.locator(".reward-reveal-panel").waitFor();
  const openButton = page.locator(".reward-open-spoils");
  if (!await openButton.innerText().then((text) => text.includes("启封战利"))) throw new Error("PC 奖励页缺少主动启封按钮");
  await openButton.click();
  await page.locator(".reward-card-wrap.revealed").first().waitFor();
  const layout = await layoutSnapshot(page);
  const rewardCards = await page.locator(".reward-card-wrap").count();
  const cardsBox = await page.locator(".reward-cards").boundingBox();
  const revealText = await page.locator(".reward-reveal-panel").innerText();
  const contractText = await page.locator(".reward-contract").innerText();
  const memoryText = await page.locator(".reward-pick-memory").first().innerText();
  const memoryCards = await page.locator(".reward-pick-memory").count();
  const sealCount = await page.locator(".reward-card-seal").count();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (rewardCards !== 3) throw new Error(`奖励卡数量为 ${rewardCards}`);
  if (sealCount !== 3 || !revealText.includes("战利已开")) throw new Error("PC 奖励页缺少启封后的翻牌揭示效果");
  for (const phrase of ["本次保底", "可变奖励", "重整代价", "兜底选择"]) {
    if (!contractText.includes(phrase)) throw new Error(`PC 奖励契约缺少 ${phrase}`);
  }
  if (memoryCards !== 3) throw new Error(`PC 入牌预期数量为 ${memoryCards}`);
  for (const phrase of ["入牌预期", "→"]) {
    if (!memoryText.includes(phrase)) throw new Error(`PC 入牌预期缺少 ${phrase}`);
  }
  if (!cardsBox || cardsBox.width < 700) throw new Error(`PC 奖励卡区过窄：${cardsBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`PC 奖励页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动奖励页公开战利契约且不横溢", { width: 430, height: 932 }, "?screen=reward&chapter=6&stage=3&origin=sword&runChoices=%E6%89%BF%E6%8B%85%E9%81%97%E6%86%BE", async (page) => {
  await page.locator(".reward-contract").waitFor();
  await page.locator(".reward-open-spoils").click();
  await page.locator(".reward-card-wrap.revealed").first().waitFor();
  const layout = await layoutSnapshot(page);
  const contractBox = await page.locator(".reward-contract").boundingBox();
  const openBox = await page.locator(".reward-open-spoils").boundingBox();
  const contractText = await page.locator(".reward-contract").innerText();
  const memoryText = await page.locator(".reward-pick-memory").first().innerText();
  const memoryBox = await page.locator(".reward-pick-memory").first().boundingBox();
  const memoryCards = await page.locator(".reward-pick-memory").count();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  for (const phrase of ["本次保底", "可变奖励", "重整代价", "兜底选择"]) {
    if (!contractText.includes(phrase)) throw new Error(`移动奖励契约缺少 ${phrase}`);
  }
  if (!contractBox || contractBox.width > 402) throw new Error(`移动奖励契约过宽：${contractBox?.width}`);
  if (!openBox || openBox.width > 402) throw new Error(`移动启封按钮过宽：${openBox?.width}`);
  if (memoryCards !== 3 || !memoryText.includes("入牌预期") || !memoryText.includes("→")) throw new Error("移动奖励页缺少入牌预期");
  if (!memoryBox || memoryBox.width > 124) throw new Error(`移动入牌预期过宽：${memoryBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`移动奖励页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("PC 今日试炼公开同局规则与奖励边界", { width: 1366, height: 768 }, "?screen=daily", async (page) => {
  await page.locator(".mode-rule-contract").waitFor();
  const layout = await layoutSnapshot(page);
  const contractText = await page.locator(".mode-rule-contract").innerText();
  const columns = await page.locator(".mode-rule-contract p").evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size);
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  for (const phrase of ["今日试炼规则", "同日同种子", "不继承终局劫数", "首次通关", "关键洗牌"]) {
    if (!contractText.includes(phrase)) throw new Error(`今日试炼规则契约缺少 ${phrase}`);
  }
  if (columns !== 1) throw new Error("PC 今日试炼规则没有使用四列契约");
  if (layout.scrollWidth > layout.width) throw new Error(`PC 今日试炼页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动挑战复刻公开复刻边界且不横溢", { width: 430, height: 932 }, "?screen=challenge", async (page) => {
  await page.locator(".mode-rule-contract").waitFor();
  const layout = await layoutSnapshot(page);
  const contractText = await page.locator(".mode-rule-contract").innerText();
  const contractBox = await page.locator(".mode-rule-contract").boundingBox();
  const rows = await page.locator(".mode-rule-contract p").evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size);
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  for (const phrase of ["挑战复刻规则", "不发每日首胜", "不继承终局劫数", "剧情选择", "比较分数"]) {
    if (!contractText.includes(phrase)) throw new Error(`挑战复刻规则契约缺少 ${phrase}`);
  }
  if (!contractBox || contractBox.width > 402) throw new Error(`移动挑战复刻契约过宽：${contractBox?.width}`);
  if (rows !== 2) throw new Error("移动挑战复刻规则没有使用双列契约");
  if (layout.scrollWidth > layout.width) throw new Error(`移动挑战复刻页横向溢出 ${layout.scrollWidth - layout.width}px`);
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

await run("PC 失败页显示学习处方", { width: 1366, height: 768 }, "?screen=defeat&chapter=4&stage=2&failures=2&clues=2&pendingRoute=1&pendingNode=elite", async (page) => {
  await page.locator(".defeat-learning").waitFor();
  const layout = await layoutSnapshot(page);
  const learningText = await page.locator(".defeat-learning").innerText();
  const learningBox = await page.locator(".defeat-learning").boundingBox();
  if (layout.device !== "desktop") throw new Error(`设备模式为 ${layout.device}`);
  if (!learningText.includes("错误类型") || !learningText.includes("下局行动") || !learningText.includes("节点练习") || !learningText.includes("本场敌人") || !learningText.includes("机制对策")) throw new Error("PC 失败页缺少学习处方字段");
  if (!learningBox || learningBox.width < 500) throw new Error(`PC 失败学习处方过窄：${learningBox?.width}`);
  if (layout.scrollWidth > layout.width) throw new Error(`PC 失败页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await run("移动失败页学习处方不横溢", { width: 430, height: 932 }, "?screen=defeat&chapter=4&stage=2&failures=2&clues=2&pendingRoute=1&pendingNode=elite", async (page) => {
  await page.locator(".defeat-learning").waitFor();
  const layout = await layoutSnapshot(page);
  const learningBox = await page.locator(".defeat-learning").boundingBox();
  const learningText = await page.locator(".defeat-learning").innerText();
  if (layout.device !== "mobile") throw new Error(`设备模式为 ${layout.device}`);
  if (!learningBox || learningBox.width > 402) throw new Error(`移动失败学习处方过宽：${learningBox?.width}`);
  if (!learningText.includes("错误类型") || !learningText.includes("下局行动") || !learningText.includes("本场敌人") || !learningText.includes("机制对策")) throw new Error("移动失败页缺少学习处方");
  if (layout.scrollWidth > layout.width) throw new Error(`移动失败页横向溢出 ${layout.scrollWidth - layout.width}px`);
});

await browser.close();

if (failures.length) {
  console.error(`Responsive layout smoke failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Responsive layout smoke passed: desktop and mobile modes use distinct, non-overflowing layouts.");
