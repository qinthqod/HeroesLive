import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../src/main.jsx", import.meta.url));
const source = readFileSync(sourcePath, "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(source.includes("const [runChoices, setRunChoices]"), "本局剧情选择必须与跨局异闻记录分离");
expect(source.includes("runChoices.includes(\"重写命册\")"), "第五章结局必须读取本局选择");
expect(!source.includes("profile.choices.includes(\"重写命册\")"), "第五章结局不得读取跨局历史选择");
expect(source.includes("runChoices,") && source.includes("runChronicle,") && source.includes("nextEnemyShield,"), "自动存档必须覆盖本局选择、命途回响和待兑现代价");
expect(source.includes("runClues,") && source.includes("setRunClues(savedRun.runClues || [])"), "章节调查线索必须进入自动存档并可恢复");
expect(source.includes("pendingClue,") && source.includes("setPendingClue(savedRun.pendingClue || null)"), "待查证线索必须进入自动存档并可恢复");
expect(source.includes("completePendingClue()") && source.includes("证据已带回"), "路线证据必须在节点完成后结算");
expect(!source.includes("if (clue) setRunClues"), "进入路线节点时不得提前发放调查线索");
expect(source.includes("setRunChoices(savedRun.runChoices || [])"), "继续云游必须恢复本局剧情选择");
expect(source.includes("setNextEnemyShield((value) => value + effect.enemyShield)"), "奇遇的下一战护体代价必须真实写入状态");
expect(source.includes("setEnemyShield(nextEnemyShield + trialShield)"), "进入战斗时必须同时兑现事件代价与每日异兆护体");
expect(source.includes("className=\"run-chronicle\""), "路线页必须展示本局命途回响");
expect(source.includes("onClick={() => playCard(index)}"), "战斗卡牌必须单击立即出牌");
expect(!source.includes("card-inspector") && !source.includes("onDoubleClick"), "战斗不得残留二次确认或双击施放");
expect(source.includes("tutorialFlags") && source.includes("className={`combat-guide"), "首场战斗必须提供可持久化的渐进式引导");
expect(source.includes("单击卡牌就会直接出牌，不需要再次确认"), "新手引导必须明确告知单击即出牌");
expect(source.includes("masteryStarterDeck") && source.includes("masteryOpeningState"), "职业熟练度必须真实改变起始牌组与战斗资源");
expect(source.includes("mastery >= 25 ? 4 : 0") && source.includes("mastery >= 100"), "熟练度资粮与本命法宝里程碑必须接入新局");
expect(source.includes("setDiscardPile(hasEnoughDraw ? turnDiscard : [])"), "抽牌堆充足时，回合弃牌不得被错误清空");
expect(source.includes("currentMove.curse") && source.includes("FATE_CURSE"), "第五章首领必须能将心魔真实写入牌堆");
expect(source.includes("ENCOUNTER_ENEMIES") && source.includes("ENCOUNTER_MOVE_PATTERNS"), "普通与精英战必须读取章节专属敌人与招式数据");
expect(source.includes("className=\"enemy-readout\"") && source.includes("enemy.counter"), "战场必须展示敌人特性与反制方向");
expect(source.includes("archetype: currentEnemy.archetype") && source.includes("moves: restoredMoves"), "旧战斗存档恢复时必须迁移到当前敌人身份与首领阶段招式循环");
expect(source.includes("retrySupportFor") && source.includes("chapterFailures"), "失败后必须记录章节受挫次数并生成有限扶助");
expect(source.includes("Math.min(3, (value.chapterFailures?.[selectedChapter] || 0) + 1)"), "章节扶助必须封顶，避免故意失败无限叠加");
expect(source.includes("chapterFailures: { ...(archived.chapterFailures || {}), [selectedChapter]: 0 }"), "章节通关后必须清零对应受挫记录");
expect(source.includes("扶助只改善容错，不降低敌人强度"), "失败页必须公开说明扶助边界");
expect(!source.includes("jobMastery: { ...value.jobMastery, [origin]: (value.jobMastery[origin] || 0) + 10 }"), "开始或重试章节不得直接发放熟练度，避免故意失败刷成长");
expect(source.includes("nextProgressGoals(profile, 2)") && source.includes("progress-board"), "首页必须展示可行动的下一长期目标");
expect(source.includes("recentRuns: [runRecord") && source.includes("最近战绩"), "章节通关必须记录最近战绩并在异闻录展示");
expect(source.includes("runMode,") && source.includes("runSeed,") && source.includes("runTrial,"), "试炼模式、种子与异兆必须进入自动存档");
expect(source.includes("completedDailyTrials") && source.includes("dailyFirstClear"), "每日首胜奖励必须具有永久日期锁");
expect(source.includes("createFeedbackEngine") && source.includes("navigator.vibrate"), "战斗必须提供可降级的音效与触觉反馈");
expect(source.includes("feedback: { sound: true, haptics: true, volume: 0.55"), "反馈偏好必须具有可持久化默认值");
for (const feedbackKind of ["cast", "impact", "draw", "enemy", "hurt", "reward"]) {
  expect(source.includes(`feedback("${feedbackKind}")`), `缺少 ${feedbackKind} 战斗反馈触点`);
}
expect(source.includes("freshRunStats") && source.includes("evaluateRun"), "章末结算必须基于整局表现动态评阶");
for (const stat of ["cardsPlayed", "damageDealt", "damageTaken", "turns", "combatsWon", "xpGained", "spiritGained", "jadeGained"]) {
  expect(source.includes(stat), `整局统计缺少 ${stat}`);
}
expect(source.includes("runStats,") && source.includes("setRunStats({ ...freshRunStats(), ...(savedRun.runStats || {}) })"), "整局统计必须进入自动存档并可恢复");
expect(!source.includes("<span>甲上</span>") && !source.includes("<strong>+38</strong>"), "章末不得继续显示固定评阶或虚假修为");
expect(source.includes("defaultDiscoveredCards") && source.includes("discoveredCards"), "藏经阁必须具有兼容旧档的卡牌发现状态");
expect(source.includes("runDeck.forEach((card)") && source.includes("discovered.add(card.id)"), "进入本局牌组的卡牌必须永久写入藏经阁");
expect(source.includes("未收录术法") && source.includes("collection-progress"), "藏经阁必须区分未知卡牌并展示职业收集进度");
expect(source.includes("流派图谱") && source.includes("BuildRecipeCard"), "藏经阁必须提供可浏览的流派图谱");
expect(source.includes("未收录组件") && source.includes("recipe.cards.every"), "流派图谱必须显示缺失组件并计算真实完成度");
expect(source.includes("generateRewardChoices") && source.includes("reward-build-direction"), "战利选择必须接入流派图谱并展示当前构筑方向");
expect(source.includes("boss-revelation") && source.includes("首领最后的证词"), "首领战利必须承接章节真相，而非复用普通战文案");
expect(source.includes("if (stage < 3) setHp") && source.includes("不取战利 · 直接结卷"), "章末跳过战利不得通过无后续价值的回血抬高评阶");
expect(source.includes("路线 ${routeStep}/4") && source.includes("routeStep * 25"), "路线顶栏必须与四层章节地图保持一致");
expect(source.includes("combat-build-tracker") && source.includes("route-build-goal") && source.includes("deck-build-state"), "局内流派目标必须贯穿战斗、路线和牌组卷册");
expect(source.includes("investigation-strip") && source.includes("summary-investigation"), "章节调查必须贯穿路线进度与章末结论");
expect(source.includes("中断调查") && source.includes("pendingClue?.text"), "失败复盘必须指出未能带回的待查证线索");
expect(source.includes("investigationArchive") && source.includes("investigationRewards"), "章节调查宗卷必须跨局保存完成度与奖励状态");
expect(source.includes("investigation-archive") && source.includes("章调查宗卷"), "异闻录必须展示永久调查宗卷");
expect(source.includes("rewardClaimedRef.current") && source.includes("if (rewardClaimedRef.current) return"), "战利与宗卷奖励必须防止快速连点重复领取");
expect(source.includes("CHAPTER_EVENTS[chapter]") && source.includes("event.options.map"), "章节奇遇必须由独立数据驱动而非复用古龛模板");
for (const effect of ["cardRarity", "refine", "removeCurse", "maxQi", "enemyShield", "consumables"]) {
  expect(source.includes(`effect.${effect}`), `奇遇运行时缺少 ${effect} 后果处理`);
}
expect(source.includes("if (option.revealsClue) completeInvestigation()") && source.includes("else abandonInvestigation()"), "奇遇离开选项必须放弃待查证线索");
expect(source.includes("CHAPTER_MARKETS[chapter]") && source.includes("market.special.id"), "章节坊市必须由章节数据和专属交易驱动");
expect(source.includes("rewardFit(card, deck, origin.id)") && source.includes("market-fit"), "坊市卡牌必须展示当前构筑契合理由");
for (const trade of ["duplicate", "purge", "thunder-refine", "shadow", "rewrite", "moon-debt"]) {
  expect(source.includes(`market.special.id === "${trade}"`), `坊市缺少 ${trade} 专属交易运行时`);
}
expect(source.includes("CHAPTER_STORY_CHOICES") && source.includes("effect.refineAll") && source.includes("effect.addRarityCard"), "扩展剧情抉择必须由数据驱动并接入真实局内后果");
expect(source.includes("BOSS_PHASES[selectedChapter]") && source.includes("phaseShift"), "章节首领必须在半血后进入独立二阶段");
expect(source.includes("resolveBossChoiceResponse(selectedChapter, runChoices)") && source.includes("choiceEcho"), "首领转相必须识别并展示本局关键剧情抉择");
expect(source.includes("screen === \"bossPrelude\"") && source.includes("resolveBossPrelude(selectedChapter, runChoices)") && source.includes("enterCombat(3)"), "首领战前必须经过可恢复的章节高潮场景");
expect(source.includes("resolveChapterEpilogue") && source.includes("unlockedEpilogues") && source.includes("summary-epilogue"), "章节抉择必须生成可持久化人物后记并在结算页回应");
expect(source.includes("completedNodes") && source.includes("chapter-1-scene-"), "章节剧情节点必须形成跨局完成进度");
expect(source.includes("firstChapterScenes >= CHAPTER_STORIES[1].length") && source.includes("shen-handbook-1") && source.includes("unlockHandbook ? 8 : 0"), "第一章五幕剧情完成后必须一次性解锁手札并奖励悟道");
expect(source.includes("lore-scrolls") && source.includes("人物手札"), "异闻录必须展示已解锁与未解锁人物手札");

if (failures.length) {
  console.error(`Run continuity check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Run continuity check passed: isolated run choices, persisted consequences, route echoes, and single-tap card play.");
