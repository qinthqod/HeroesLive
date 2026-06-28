import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../src/main.jsx", import.meta.url));
const stylesPath = fileURLToPath(new URL("../src/styles.css", import.meta.url));
const source = readFileSync(sourcePath, "utf8");
const styles = readFileSync(stylesPath, "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(source.includes("const [runChoices, setRunChoices]"), "本局剧情选择必须与跨局异闻记录分离");
expect(source.includes("function detectDeviceMode()") && source.includes("device-${deviceMode}") && source.includes("data-device={deviceMode}") && source.includes("data-layout={deviceMode === \"desktop\" ? \"wide-desktop\" : \"compact-mobile\"}"), "页面必须判断 PC/移动设备并暴露设备模式与布局模式");
expect(source.includes("runChoices.includes(\"重写命册\")"), "第五章结局必须读取本局选择");
expect(!source.includes("profile.choices.includes(\"重写命册\")"), "第五章结局不得读取跨局历史选择");
expect(source.includes("runChoices,") && source.includes("runChronicle,") && source.includes("nextEnemyShield,"), "自动存档必须覆盖本局选择、命途回响和待兑现代价");
expect(source.includes("runClues,") && source.includes("setRunClues(savedRun.runClues || [])"), "章节调查线索必须进入自动存档并可恢复");
expect(source.includes("pendingClue,") && source.includes("setPendingClue(savedRun.pendingClue || null)"), "待查证线索必须进入自动存档并可恢复");
expect(source.includes("completePendingClue()") && source.includes("证据已带回"), "路线证据必须在节点完成后结算");
expect(!source.includes("if (clue) setRunClues"), "进入路线节点时不得提前发放调查线索");
expect(source.includes("setRunChoices(savedRun.runChoices || [])"), "继续云游必须恢复本局剧情选择");
expect(source.includes("setNextEnemyShield((value) => value + effect.enemyShield)"), "奇遇的下一战护体代价必须真实写入状态");
expect(source.includes("runTribulation,") && source.includes("setRunTribulation(tribulationForLevel(savedRun.runTribulation?.level || 0))"), "终局劫数必须进入自动存档并可恢复");
expect(source.includes("setEnemyShield(nextEnemyShield + trialShield + tribulationShield)"), "进入战斗时必须同时兑现事件代价、每日异兆与劫数护体");
expect(source.includes("className=\"run-chronicle\""), "路线页必须展示本局命途回响");
expect(source.includes("onClick={() => playCard(index)}"), "战斗卡牌必须单击立即出牌");
expect(!source.includes("card-inspector") && !source.includes("onDoubleClick"), "战斗不得残留二次确认或双击施放");
expect(source.includes("tutorialFlags") && source.includes("className={`combat-guide"), "首场战斗必须提供可持久化的渐进式引导");
expect(source.includes("单击卡牌就会直接出牌，不需要再次确认"), "新手引导必须明确告知单击即出牌");
expect(source.includes("GUIDE_PLAYBOOK") && source.includes("guide-playbook") && source.includes("读局面") && source.includes("选路线") && source.includes("取战利") && source.includes("整牌组"), "可回看的试炼札记必须提供读局面、选路线、取战利和整牌组四步学习框架");
expect(source.includes("guide-current-run") && source.includes("当前牌组提醒"), "试炼札记必须结合当前牌组或流派给即时建议");
expect(source.includes("masteryStarterDeck") && source.includes("masteryOpeningState"), "职业熟练度必须真实改变起始牌组与战斗资源");
expect(source.includes("mastery >= 25 ? 4 : 0") && source.includes("mastery >= 100"), "熟练度资粮与本命法宝里程碑必须接入新局");
expect(source.includes("starterDeckSummary") && source.includes("class-system-grid") && source.includes("class-recipe-preview") && source.includes("起始手札"), "职业选择页必须展示真实起始牌组摘要、开局循环与构筑入口");
expect(source.includes("classRecipePreview(current)") && source.includes("推荐构筑入口") && source.includes("真实读取流派图谱"), "职业选择页的构筑预览必须读取真实流派图谱");
expect(source.includes("setDiscardPile(hasEnoughDraw ? turnDiscard : [])"), "抽牌堆充足时，回合弃牌不得被错误清空");
expect(source.includes("currentMove.curse") && source.includes("FATE_CURSE"), "第五章首领必须能将心魔真实写入牌堆");
expect(source.includes("ENCOUNTER_ENEMIES") && source.includes("ENCOUNTER_MOVE_PATTERNS"), "普通与精英战必须读取章节专属敌人与招式数据");
expect(source.includes("className=\"enemy-readout\"") && source.includes("enemy.counter"), "战场必须展示敌人特性与反制方向");
expect(source.includes("archetype: currentEnemy.archetype") && source.includes("moves: restoredMoves"), "旧战斗存档恢复时必须迁移到当前敌人身份与首领阶段招式循环");
expect(source.includes("retrySupportFor") && source.includes("chapterFailures"), "失败后必须记录章节受挫次数并生成有限扶助");
expect(source.includes("Math.min(3, (value.chapterFailures?.[selectedChapter] || 0) + 1)"), "章节扶助必须封顶，避免故意失败无限叠加");
expect(source.includes("chapterFailures: { ...(archived.chapterFailures || {}), [selectedChapter]: 0 }"), "章节通关后必须清零对应受挫记录");
expect(source.includes("扶助只改善容错，不降低敌人强度"), "失败页必须公开说明扶助边界");
expect(source.includes("defeatLearningPlan") && source.includes("defeat-learning") && source.includes("错误类型") && source.includes("下局行动"), "失败页必须给出可行动的错误类型与下局学习处方");
expect(!source.includes("jobMastery: { ...value.jobMastery, [origin]: (value.jobMastery[origin] || 0) + 10 }"), "开始或重试章节不得直接发放熟练度，避免故意失败刷成长");
expect(source.includes("nextProgressGoals(profile, 2)") && source.includes("progress-board"), "首页必须展示可行动的下一长期目标");
expect(source.includes("nextProgressGoals(profile, 1)") && source.includes("summary-next-goal") && source.includes("下一枚印记"), "结算页必须展示下一项长期挑战进度，形成回局动机");
expect(source.includes("nextAfterClaim") && source.includes("progressNotice.epithet") && source.includes("挑战卷已落印") && source.includes("下一枚印记："), "长期挑战领取必须展示称号、奖励明细与下一目标落印反馈");
expect(source.includes("recentRuns: [runRecord") && source.includes("最近战绩"), "章节通关必须记录最近战绩并在异闻录展示");
expect(source.includes("runMode,") && source.includes("runSeed,") && source.includes("runTrial,"), "试炼模式、种子与异兆必须进入自动存档");
expect(source.includes("completedDailyTrials") && source.includes("dailyFirstClear"), "每日首胜奖励必须具有永久日期锁");
expect(source.includes("completedTribulations") && source.includes("tribulationStatus.claimable") && source.includes("settleTribulationClear"), "劫数首破奖励必须具有永久章节锁并在章末结算");
expect(source.includes("nextMode === \"story\" ? tribulationForLevel(options.tribulationLevel || 0) : tribulationForLevel(0)"), "每日试炼和挑战复刻不得继承终局劫数");
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
expect(source.includes("build-target-panel") && source.includes("下一卷追踪") && source.includes("优先在战利、坊市和异闻中寻找这些关键词"), "流派图谱必须展示下一套最接近成卷的构筑追踪目标");
expect(source.includes("未收录组件 · ${card.keyword}") && source.includes("优先留意"), "未完成流派必须保留未知感但展示类型/关键词线索");
expect(source.includes("generateRewardChoices") && source.includes("reward-build-direction"), "战利选择必须接入流派图谱并展示当前构筑方向");
expect(source.includes("reward-reveal-panel") && source.includes("reward-card-seal") && source.includes("rewardRarityPlan"), "战利页必须保留自动揭示、牌背封印和奖励池说明");
expect(source.includes("reward-contract") && source.includes("本次保底") && source.includes("重整代价") && source.includes("兜底选择"), "战利页必须公开保底、可变奖励、重整代价与兜底选择");
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
expect(source.includes("market-economy") && source.includes("economyAdvice") && source.includes("买后余") && source.includes("sourceSinkLine"), "坊市必须展示预算状态、买后余量和资源收放提示");
expect(source.includes("cardPlayStatus") && source.includes("cardRequirementHint") && source.includes("card-play-state"), "战斗卡牌必须公开可出、联动、灵气不足和条件未满等即时状态");
expect(source.includes("TurnFlowFx") && source.includes("turn-flow") && source.includes("手牌入弃") && source.includes("洗牌后抽取"), "回合结束必须公开敌方行动、弃牌、洗牌与抽牌的流转节奏");
expect(source.includes("detectDeviceMode") && source.includes("data-device={deviceMode}") && source.includes("data-layout={deviceMode === \"desktop\" ? \"wide-desktop\" : \"compact-mobile\"}") && source.includes("device-mode-badge"), "页面必须判断 PC/移动设备并公开当前适配模式");
expect(source.includes("DesktopModePanel") && source.includes("desktop-mode-panel") && source.includes("PC ADAPTIVE"), "PC 非战斗页面必须拥有桌面端专属状态栏");
expect(source.includes("desktop-control-hints") && source.includes("Space 结束回合") && source.includes("单击卡牌立即出牌"), "PC 战斗页必须提供桌面端操作提示");
expect(styles.includes(".device-desktop .combat-screen") && styles.includes(".device-desktop .player-rail") && styles.includes(".device-desktop .progress-rail") && styles.includes(".device-desktop .hand"), "PC 战斗页必须拥有桌面端左中右战局与宽手牌区");
expect(styles.includes(".desktop-mode-panel") && styles.includes(".device-mobile .desktop-mode-panel") && styles.includes(".device-desktop .desktop-control-hints"), "PC 专属面板和战斗提示必须具备桌面/移动端样式隔离");
expect(styles.includes(".device-desktop .market-layout") && styles.includes(".device-desktop .reward-cards"), "PC 坊市与奖励页必须使用独立宽屏布局");
expect(styles.includes(".class-system-grid") && styles.includes(".starter-handbook") && styles.includes(".class-recipe-preview") && styles.includes(".device-desktop .mechanic-panel"), "职业选择页必须拥有移动/PC 的起手牌与构筑预览样式");
expect(styles.includes(".chapter-casefile") && styles.includes(".casefile-lore") && styles.includes(".device-desktop .chapter-casefile"), "章节案卷预览必须拥有移动/PC 样式");
expect(styles.includes(".build-target-panel") && styles.includes(".device-desktop .build-library") && styles.includes(".device-desktop .build-target-panel"), "流派图谱追踪目标必须拥有移动/PC 样式");
for (const trade of ["duplicate", "purge", "thunder-refine", "shadow", "rewrite", "moon-debt"]) {
  expect(source.includes(`market.special.id === "${trade}"`), `坊市缺少 ${trade} 专属交易运行时`);
}
expect(source.includes("CHAPTER_STORY_CHOICES") && source.includes("effect.refineAll") && source.includes("effect.addRarityCard"), "扩展剧情抉择必须由数据驱动并接入真实局内后果");
expect(source.includes("BOSS_PHASES[selectedChapter]") && source.includes("phaseShift"), "章节首领必须在半血后进入独立二阶段");
expect(source.includes("resolveBossChoiceResponse(selectedChapter, runChoices)") && source.includes("choiceEcho"), "首领转相必须识别并展示本局关键剧情抉择");
expect(source.includes("screen === \"bossPrelude\"") && source.includes("resolveBossPrelude(selectedChapter, runChoices)") && source.includes("enterCombat(3)"), "首领战前必须经过可恢复的章节高潮场景");
expect(source.includes("\"encounterPrelude\", \"bossPrelude\"") && source.includes("pendingEncounterStage"), "普通、精英与首领登场节点必须进入自动存档并恢复目标阶段");
expect(source.includes("seenEncounters") && source.includes("再次遭遇时跳过第一段对白"), "重复遭遇必须缩短登场流程");
expect(source.includes("resolveBattleAftermath(chapter, stage)") && source.includes("battle-aftermath") && source.includes("战利来源"), "普通与精英奖励页必须承接敌人余波、证据和战利来源");
expect(source.includes("resolveChapterEpilogue") && source.includes("unlockedEpilogues") && source.includes("summary-epilogue"), "章节抉择必须生成可持久化人物后记并在结算页回应");
expect(source.includes("const bossResponse = resolveBossChoiceResponse(chapter, runChoices)") && source.includes("summary-boss-causality"), "首领战回应必须在章末结算中形成因果落点");
expect(source.includes("CHAPTER_TRANSITIONS[chapter]") && source.includes("沿此线索继续") && source.includes("beginRun(nextChapter"), "主线结算必须提供章节桥梁与同职业连续远征");
expect(source.includes("runMode === \"story\" && chapter < CHAPTERS.length"), "每日试炼、挑战复刻和终章不得错误进入下一章");
expect(source.includes("CHAPTER_HOME_STATES[mainComplete ? \"complete\" : currentChapterId]") && source.includes("currentInvestigation.objective"), "山门首页必须读取真实主线章节与当前调查");
expect(source.includes("chapter-card") && source.includes("completed ? \"已结卷\"") && source.includes("current ? \"当前主线\""), "章节列表必须区分锁定、当前主线与已完成状态");
expect(source.includes("chapter-replay-goals") && source.includes("chapter-next-target") && source.includes("补证据") && source.includes("补后记") && source.includes("破劫数"), "章节列表必须展示证据、后记、劫数复玩目标和下一目标");
expect(source.includes("chapter-casefile") && source.includes("案卷预览") && source.includes("casefile-route-beats") && source.includes("casefile-enemies"), "章节选择页必须提供案卷预览，展示调查、路线节奏、首领宗卷和敌情压力");
expect(source.includes("CHAPTER_BOSS_DOSSIERS") && source.includes("CHAPTER_ROUTE_COPY[previewChapter.id]?.beats") && source.includes("ENCOUNTER_ENEMIES[previewChapter.id]"), "章节案卷必须读取真实宗卷、路线与遭遇数据");
expect(source.includes("tribulation-panel") && source.includes("TRIBULATION_LEVELS.map") && source.includes("selectedTribulation.reward.title"), "主线完成后的章节列表必须提供劫数选择、风险预览与首破奖励说明");
expect(source.includes("completedNodes") && source.includes("chapter-1-scene-"), "章节剧情节点必须形成跨局完成进度");
expect(source.includes("firstChapterScenes >= CHAPTER_STORIES[1].length") && source.includes("shen-handbook-1") && source.includes("unlockHandbook ? 8 : 0"), "第一章五幕剧情完成后必须一次性解锁手札并奖励悟道");
expect(source.includes("lore-scrolls") && source.includes("人物手札"), "异闻录必须展示已解锁与未解锁人物手札");

if (failures.length) {
  console.error(`Run continuity check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Run continuity check passed: isolated run choices, persisted consequences, route echoes, and single-tap card play.");
