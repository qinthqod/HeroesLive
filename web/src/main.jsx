import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  ALL_CARDS,
  BOSS_MOVE_PATTERNS,
  BOSS_PHASES,
  ENCOUNTER_ENEMIES,
  ENCOUNTER_MOVE_PATTERNS,
  CHAPTERS,
  CHAPTER_ROUTE_COPY,
  CHAPTER_ROUTES,
  CHAPTER_STORIES,
  CHAPTER_HOME_STATES,
  CHAPTER_TRANSITIONS,
  CHAPTER_STORY_CHOICES,
  CHAPTER_EPILOGUES,
  CHAPTER_INVESTIGATIONS,
  CHAPTER_BOSS_DOSSIERS,
  CHAPTER_EVENTS,
  CHAPTER_ROUTE_STORIES,
  CHAPTER_MARKETS,
  DECK_RECIPES,
  META_TALENTS,
  MASTERY_MILESTONES,
  MASTERY_SIGNATURE_BY_JOB,
  MASTERY_TREASURE_BY_JOB,
  PROFESSIONS,
  ROUTE_ROWS,
  TREASURES,
  getProfession,
  resolveBossChoiceResponse,
  resolveBossPrelude,
  resolveBattleAftermath,
  resolveEncounterPrelude,
} from "./gameData";
import { analyzeDeck, currentBuildState, generateRewardChoices, rewardFit, rewardRecipeTarget } from "./deckStrategy";
import { createPendingClue, settlePendingClue } from "./investigationState";
import { INVESTIGATION_COMPLETION_REWARD, investigationEvidence, mergeInvestigationArchive } from "./investigationArchive";
import { retrySupportFor } from "./retrySupport";
import {
  claimProgressGoal,
  formatProgressReward,
  nextProgressGoals,
  progressSummaries,
} from "./progressGoals";
import { createRunNotebook } from "./runNotebook";
import {
  TRIBULATION_LEVELS,
  applyTribulationEnemy,
  settleTribulationClear,
  tribulationForLevel,
  tribulationRewardStatus,
} from "./tribulation";
import {
  DAILY_TRIAL_REWARD,
  applyDailyEnemy,
  createRunSeed,
  dailyRewardStatus,
  dailyTrialForDate,
  seededRandom,
  seededShuffle,
  settleDailyTrial,
} from "./dailyTrial";
import { challengeCodeForRun, parseChallengeCode } from "./challengeCode";
import { countCurses, isCurse, purgeCurses } from "./combatZones";
import {
  addDevices,
  deviceDamage,
  normalizeDevices,
  removeDevice,
  triggerDevices,
  upgradeDevices,
  withDevices,
} from "./artificerDevices";
import {
  discoverInstructions,
  moonPhaseForTrial,
  moonPhaseLabel,
  recallBeastState,
} from "./beastMechanics";

const origins = PROFESSIONS.map((job) => ({ ...job, line: job.style }));

const cards = Object.fromEntries(PROFESSIONS.map((job) => [
  job.id,
  job.starterDeck.map((cardId) => job.cards.find((card) => card.id === cardId)).filter(Boolean),
]));

function subtractCardInstances(pool, removed) {
  const counts = removed.reduce((map, card) => {
    if (card?.id) map.set(card.id, (map.get(card.id) || 0) + 1);
    return map;
  }, new Map());
  return pool.filter((card) => {
    const count = counts.get(card.id) || 0;
    if (!count) return true;
    counts.set(card.id, count - 1);
    return false;
  });
}

function treasureValue(treasures, key) {
  return treasures.reduce((sum, treasure) => sum + (treasure[key] || 0), 0);
}

function addProfileXp(profile, amount) {
  const xp = (profile.xp || 0) + amount;
  return { ...profile, xp, level: Math.max(profile.level || 1, 3 + Math.floor(xp / 100)) };
}

function refinedVersion(card, profession) {
  if (card.refined) return null;
  const index = profession.cards.findIndex((item) => item.id === card.id);
  return index >= 0 && index < 10 ? profession.cards[index + 10] : null;
}

function masteryStarterDeck(profession, mastery) {
  const starter = profession.starterDeck.map((cardId) => profession.cards.find((card) => card.id === cardId)).filter(Boolean);
  if (mastery < 50) return starter;
  const signature = MASTERY_SIGNATURE_BY_JOB[profession.id];
  const baseIndex = starter.findIndex((card) => card.baseName === signature && !card.refined);
  const refined = profession.cards.find((card) => card.baseName === signature && card.refined);
  return baseIndex >= 0 && refined
    ? starter.map((card, index) => index === baseIndex ? refined : card)
    : starter;
}

function masteryOpeningState(job, mastery) {
  const state = freshJobState();
  if (mastery < 75) return state;
  if (job === "talisman") state.seals = 1;
  if (job === "alchemy") state.heat = 1;
  if (job === "beast") {
    state.activeBeast = "玄狼";
    state.contracts = ["玄狼"];
  }
  if (job === "artificer") {
    state.devices = 1;
    state.deviceTypes = [{ type: "copper", power: 2 }];
    state.cunning = 1;
  }
  if (job === "soul") state.lamps = 1;
  return state;
}

function starterDeckSummary(starter) {
  const unique = new Map();
  starter.forEach((card) => {
    const key = card.baseName || card.name;
    const entry = unique.get(key) || { card, count: 0 };
    entry.count += 1;
    unique.set(key, entry);
  });
  const counts = {
    attack: starter.filter((card) => ["攻击", "术法"].includes(card.type)).length,
    guard: starter.filter((card) => /护盾|恢复|驱散|净除/.test(`${card.text}${card.combo || ""}`)).length,
    draw: starter.filter((card) => /抽|返回手牌|发现/.test(`${card.text}${card.combo || ""}`)).length,
    zero: starter.filter((card) => card.cost === 0).length,
  };
  return { unique: [...unique.values()], counts };
}

function openingStateSummary(job, mastery) {
  const state = masteryOpeningState(job.id || job, mastery);
  const resourceValue = job.id === "sword"
    ? state.sword || 0
    : job.id === "talisman"
      ? state.seals || 0
      : job.id === "alchemy"
        ? Math.max(state.heat || 0, state.cold || 0)
        : job.id === "beast"
          ? state.contracts?.length || 0
          : job.id === "artificer"
            ? state.cunning || state.devices || 0
            : state.lamps || 0;
  if (mastery < 75) return `初入道途：以 0 点${job.resource}起步，靠基础牌建立循环。`;
  return `本源初醒：每场战斗开局带入 ${resourceValue || 1} 点${job.resource}节奏。`;
}

function classRecipePreview(job) {
  return DECK_RECIPES
    .filter((recipe) => recipe.job === job.id)
    .slice(0, 3)
    .map((recipe) => ({
      ...recipe,
      components: recipe.cards
        .map((cardId) => job.cards.find((card) => card.id === cardId))
        .filter(Boolean),
    }));
}

function defaultDiscoveredCards() {
  return [...new Set(PROFESSIONS.flatMap((profession) => profession.starterDeck))];
}

function createFeedbackEngine() {
  let context = null;
  const tone = (frequency, duration, type, start, volume) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  };
  return (kind, preferences) => {
    try {
      if (preferences?.sound !== false) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          context ||= new AudioContext();
          if (context.state === "suspended") context.resume();
          const now = context.currentTime;
          const volume = Math.max(0.01, Math.min(1, preferences?.volume ?? 0.55)) * 0.12;
          const patterns = {
            tap: [[420, .05, "sine", 0, .4]],
            cast: [[260, .12, "triangle", 0, .6], [520, .18, "sine", .05, .75]],
            impact: [[130, .14, "sawtooth", 0, .9], [72, .2, "triangle", .02, .7]],
            guard: [[360, .13, "sine", 0, .55], [540, .18, "sine", .07, .55]],
            heal: [[440, .14, "sine", 0, .45], [660, .2, "sine", .08, .65]],
            draw: [[330, .08, "triangle", 0, .35], [440, .08, "triangle", .06, .4], [560, .12, "triangle", .12, .45]],
            enemy: [[95, .28, "sawtooth", 0, .72], [150, .18, "square", .08, .28]],
            hurt: [[110, .2, "square", 0, .7]],
            reward: [[392, .14, "sine", 0, .5], [523, .16, "sine", .1, .55], [784, .3, "sine", .2, .7]],
          };
          (patterns[kind] || patterns.tap).forEach(([frequency, duration, type, offset, gain]) => tone(frequency, duration, type, now + offset, volume * gain));
        }
      }
      if (preferences?.haptics !== false && navigator.vibrate) {
        const vibrations = { cast: 12, impact: [18, 18, 28], guard: 16, heal: 10, draw: 8, enemy: [24, 20, 38], hurt: 42, reward: [16, 28, 16] };
        navigator.vibrate(vibrations[kind] || 6);
      }
    } catch {
      // Feedback is optional; unsupported browsers should never interrupt play.
    }
  };
}

function GameImage({ eager = false, className = "", ...props }) {
  return (
    <img
      className={className || undefined}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      fetchPriority={eager ? "high" : "auto"}
      {...props}
    />
  );
}

function buildEnemyMoves(chapter, encounterStage) {
  return encounterStage === 3
    ? BOSS_MOVE_PATTERNS[chapter]
    : ENCOUNTER_MOVE_PATTERNS[chapter][encounterStage];
}

function chapterDifficultyProfile(chapterId, tribulation = null) {
  const enemies = Object.values(ENCOUNTER_ENEMIES[chapterId] || {});
  const moveGroups = [
    ...(ENCOUNTER_MOVE_PATTERNS[chapterId] ? Object.values(ENCOUNTER_MOVE_PATTERNS[chapterId]) : []),
    BOSS_MOVE_PATTERNS[chapterId] || [],
    BOSS_PHASES[chapterId]?.moves || [],
  ];
  const moves = moveGroups.flat();
  const totalHp = enemies.reduce((sum, enemy) => sum + (enemy?.max || enemy?.hp || 0), 0);
  const avgDamage = moves.length ? moves.reduce((sum, move) => sum + ((move.damage || 0) * (move.hits || 1)), 0) / moves.length : 0;
  const mechanismScore = moves.reduce((sum, move) => sum
    + (move.shield ? 1 : 0)
    + (move.drainQi ? 1 : 0)
    + (move.drawPenalty ? 1 : 0)
    + (move.curse ? 1 : 0)
    + (move.weak ? 0.7 : 0)
    + (move.heal ? 0.7 : 0)
    + (move.hits && move.hits > 1 ? 0.6 : 0), 0);
  const tribulationBoost = tribulation?.level ? tribulation.level * 8 : 0;
  const raw = Math.round(totalHp / 12 + avgDamage * 2.6 + mechanismScore * 5 + tribulationBoost);
  const pressure = Math.max(18, Math.min(99, raw));
  const tier = pressure >= 82 ? "凶险" : pressure >= 66 ? "高压" : pressure >= 48 ? "均衡" : "稳健";
  const tolerance = pressure >= 82 ? "容错低" : pressure >= 66 ? "容错中" : "容错高";
  const needShieldBreak = moves.some((move) => move.shield);
  const needCleanse = moves.some((move) => move.curse || move.weak || move.drawPenalty);
  const needQi = moves.some((move) => move.drainQi);
  const advice = needCleanse
    ? "带净心/过牌"
    : needShieldBreak
      ? "准备拆盾爆发"
      : needQi
        ? "保留聚气资源"
        : pressure >= 66 ? "提高防御密度" : "适合补证据";
  return { pressure, tier, tolerance, advice };
}

function intentLabel(move) {
  const parts = [];
  if (move.damage) parts.push(`${move.damage}${move.hits ? `×${move.hits}` : ""}`);
  if (move.shield) parts.push(`护体 ${move.shield}`);
  if (move.heal) parts.push(`恢复 ${move.heal}`);
  if (move.weak) parts.push(`虚弱 ${move.weak}`);
  if (move.drainQi) parts.push(`灵气 -${move.drainQi}`);
  if (move.drawPenalty) parts.push(`少抽 ${move.drawPenalty}`);
  if (move.curse) parts.push("心魔入牌堆");
  return `${move.name}${parts.length ? ` · ${parts.join(" · ")}` : ""}`;
}

function runLocationLabel(run) {
  if (!run) return "";
  if (run.screen === "combat") return `战斗 · 第 ${run.combatTurn || 1} 回合`;
  if (run.screen === "encounterPrelude") return `${run.pendingEncounterStage === 2 ? "精英" : "普通"}遭遇 · 敌情侦察`;
  if (run.screen === "bossPrelude") return "首领前夜 · 最终对峙";
  return {
    story: "章节开场",
    map: "命途地图",
    event: "途中异闻",
    market: "坊市整备",
    rest: "调息休整",
    training: "修炼推演",
    reward: "战利抉择",
  }[run.screen] || run.screen;
}

const FATE_CURSE = {
  id: "enemy-curse-missing-page",
  job: "curse",
  baseName: "命册缺页",
  name: "命册缺页",
  cost: 9,
  type: "心魔",
  rarity: "诅咒",
  tier: 4,
  art: "/card_clear_heart.png",
  keyword: "心魔",
  text: "无法打出。占据手牌，回合结束后进入弃牌堆。",
  combo: "净心牌可以将其永久净除。",
  upgrade: "不可精研",
  tags: ["心魔"],
  refined: false,
};

const freshJobState = () => ({
  seals: 0,
  cold: 0,
  heat: 0,
  contracts: [],
  activeBeast: "玄狼",
  devices: 0,
  deviceTypes: [],
  cunning: 0,
  copperTriggered: false,
  lamps: 0,
  attackBonus: 0,
  burnMultiplier: 1,
  talismanDiscount: 0,
  alchemyDiscount: 0,
  beastDiscount: 0,
  symbolCardsPlayed: 0,
  lastWasInstruction: false,
  whiteDeerGuard: false,
  mirrorDamage: 0,
});

const freshRunStats = () => ({
  cardsPlayed: 0,
  damageDealt: 0,
  damageTaken: 0,
  turns: 0,
  combatsWon: 0,
  rewardsTaken: 0,
  xpGained: 0,
  spiritGained: 0,
  jadeGained: 0,
});

function evaluateRun(stats, hp, maxHp) {
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
  const expectedTurns = Math.max(1, stats.combatsWon * 3);
  const pace = Math.max(0, Math.min(1, 1 - Math.max(0, stats.turns - expectedTurns) / 12));
  const endurance = Math.max(0, Math.min(1, 1 - stats.damageTaken / Math.max(1, maxHp * 1.5)));
  const completion = Math.min(1, stats.combatsWon / 3);
  const score = Math.round(hpRatio * 35 + pace * 20 + endurance * 20 + completion * 25);
  const grade = score >= 90 ? "甲上" : score >= 80 ? "甲" : score >= 68 ? "乙上" : score >= 55 ? "乙" : "丙";
  const title = hpRatio >= .75
    ? "道心稳固"
    : stats.damageTaken <= maxHp
      ? "险中求胜"
      : "浴血破局";
  return { score, grade, title };
}

function resolveChapterEpilogue(chapter, choices) {
  const variants = CHAPTER_EPILOGUES[chapter] || [];
  return [...variants].reverse().find((epilogue) => choices.includes(epilogue.choice)) || variants[0] || null;
}

function detectDeviceMode() {
  if (typeof window === "undefined") return "desktop";
  const wideEnough = window.innerWidth >= 900;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
  return wideEnough && !(coarsePointer && window.innerWidth < 1180) ? "desktop" : "mobile";
}

function useDeviceMode() {
  const [deviceMode, setDeviceMode] = useState(() => detectDeviceMode());
  useEffect(() => {
    const update = () => setDeviceMode(detectDeviceMode());
    const pointerQuery = window.matchMedia?.("(pointer: coarse)");
    window.addEventListener("resize", update);
    pointerQuery?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("resize", update);
      pointerQuery?.removeEventListener?.("change", update);
    };
  }, []);
  return deviceMode;
}

function App() {
  const query = new URLSearchParams(window.location.search);
  const deviceMode = useDeviceMode();
  const initialScreen = query.get("screen") || "home";
  const initialOrigin = PROFESSIONS.some((job) => job.id === query.get("origin")) ? query.get("origin") : "sword";
  const initialChapter = Math.min(CHAPTERS.length, Math.max(1, Number(query.get("chapter")) || 1));
  const initialStage = Math.min(3, Math.max(1, Number(query.get("stage")) || 1));
  const initialStory = import.meta.env.DEV
    ? Math.min((CHAPTER_STORIES[initialChapter]?.length || 1) - 1, Math.max(0, Number(query.get("story")) || 0))
    : 0;
  const debugEnemyHp = import.meta.env.DEV ? Math.max(0, Number(query.get("enemyHp")) || 0) : 0;
  const debugTreasures = import.meta.env.DEV
    ? (query.get("treasures") || "").split(",").map((id) => TREASURES.find((treasure) => treasure.id === id)).filter(Boolean)
    : [];
  const debugOverlay = ["guide", "codex", "settings", "map", "deck"].includes(query.get("overlay"))
    ? query.get("overlay")
    : null;
  const debugChoice = import.meta.env.DEV ? query.get("choice") : null;
  const debugRunChoices = (query.get("runChoices") || "").split(",").map((choice) => choice.trim()).filter(Boolean);
  const debugCard = import.meta.env.DEV
    ? ALL_CARDS.find((card) => card.id === query.get("card") || card.baseName === query.get("card"))
    : null;
  const debugLastCard = import.meta.env.DEV
    ? ALL_CARDS.find((card) => card.id === query.get("lastCard") || card.baseName === query.get("lastCard"))
    : null;
  const debugPlayedCard = import.meta.env.DEV
    ? ALL_CARDS.find((card) => card.id === query.get("playedCard") || card.baseName === query.get("playedCard"))
    : null;
  const queryNumber = (key, fallback = 0) => Math.max(0, Number(query.get(key)) || fallback);
  const debugNumber = (key, fallback = 0) => import.meta.env.DEV ? queryNumber(key, fallback) : fallback;
  const debugAutoplay = import.meta.env.DEV && query.get("autoplay") === "1";
  const debugAutoClick = import.meta.env.DEV && query.get("autoclick") === "1";
  const debugAutoEnd = import.meta.env.DEV && query.get("autoend") === "1";
  const debugTutorial = import.meta.env.DEV && query.get("tutorial") === "1";
  const debugAutoStory = import.meta.env.DEV && query.get("autostory") === "1";
  const debugMoon = import.meta.env.DEV ? query.get("moon") : null;
  const debugMastery = import.meta.env.DEV ? debugNumber("mastery") : 0;
  const debugMoveIndex = import.meta.env.DEV ? debugNumber("move") : 0;
  const debugClueCount = Math.min(5, queryNumber("clues"));
  const debugRouteProgress = Math.min(3, queryNumber("routeProgress"));
  const debugPendingRoute = Math.min(3, queryNumber("pendingRoute"));
  const debugPendingNode = query.get("pendingNode");
  const debugArchiveChapter = import.meta.env.DEV ? Math.min(CHAPTERS.length, Math.max(1, debugNumber("archiveChapter", initialChapter))) : 0;
  const debugArchiveCount = import.meta.env.DEV ? Math.min(7, debugNumber("archiveCount")) : 0;
  const debugEventChoice = import.meta.env.DEV && query.has("eventChoice") ? Math.min(3, debugNumber("eventChoice")) : null;
  const hasDebugFailures = import.meta.env.DEV && query.has("failures");
  const debugFailures = hasDebugFailures ? Math.min(3, debugNumber("failures")) : 0;
  const debugResetFailure = import.meta.env.DEV && query.get("resetFailure") === "1";
  const debugTribulationLevel = Math.min(3, queryNumber("tribulation"));
  const makeEnemy = (chapter, encounterStage, trial = null, tribulation = null) => {
    const enemyData = { ...ENCOUNTER_ENEMIES[chapter][encounterStage] };
    const moves = buildEnemyMoves(chapter, encounterStage);
    enemyData.moves = moves;
    enemyData.moveIndex = Math.min(moves.length - 1, debugMoveIndex);
    if (encounterStage === 3) {
      enemyData.phase = 1;
      enemyData.phaseName = "第一相 · 守序";
      enemyData.phaseLine = "首领尚未显露真正形态。";
    }
    const modified = applyTribulationEnemy(applyDailyEnemy(enemyData, trial), tribulation);
    modified.intent = intentLabel(modified.moves[modified.moveIndex]);
    if (debugEnemyHp > 0) modified.hp = Math.min(modified.max, debugEnemyHp);
    return modified;
  };
  const todaysTrial = dailyTrialForDate(new Date());
  const [screen, setScreen] = useState(initialScreen);
  const [savedRun, setSavedRun] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("qinglan-run-v1")) || null;
    } catch {
      return null;
    }
  });
  const [origin, setOrigin] = useState(initialOrigin);
  const [stage, setStage] = useState(initialStage);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [runMode, setRunMode] = useState("story");
  const [runSeed, setRunSeed] = useState(() => createRunSeed());
  const [runTrial, setRunTrial] = useState(null);
  const [runTribulation, setRunTribulation] = useState(() => tribulationForLevel(debugTribulationLevel));
  const [storyIndex, setStoryIndex] = useState(initialStory);
  const [routeProgress, setRouteProgress] = useState(debugRouteProgress);
  const [pendingEncounterStage, setPendingEncounterStage] = useState(initialStage);
  const [runChoices, setRunChoices] = useState(debugRunChoices);
  const [runChronicle, setRunChronicle] = useState([]);
  const [runClues, setRunClues] = useState(() => {
    if (!debugClueCount) return [];
    const investigation = CHAPTER_INVESTIGATIONS[initialChapter];
    const routeClues = (investigation?.routes || []).flatMap((route) => Object.values(route));
    return [investigation?.opening, ...routeClues].filter(Boolean).slice(0, debugClueCount);
  });
  const [pendingClue, setPendingClue] = useState(() => {
    const text = debugPendingNode ? CHAPTER_INVESTIGATIONS[initialChapter]?.routes?.[debugPendingRoute]?.[debugPendingNode] : "";
    return text ? createPendingClue(text, { id: debugPendingNode, name: debugPendingNode }, debugPendingRoute) : null;
  });
  const [nextEnemyShield, setNextEnemyShield] = useState(0);
  const [marketVisit, setMarketVisit] = useState({ key: "", sold: [], specialUsed: false, treasureBought: false });
  const [runStats, setRunStats] = useState(() => ({
    ...freshRunStats(),
    cardsPlayed: debugNumber("cards"),
    damageDealt: debugNumber("damage"),
    damageTaken: debugNumber("taken"),
    turns: debugNumber("turns"),
    combatsWon: debugNumber("wins"),
    rewardsTaken: debugNumber("rewards"),
    xpGained: debugNumber("xp"),
    spiritGained: debugNumber("spiritGained"),
    jadeGained: debugNumber("jadeGained"),
  }));
  const [profile, setProfile] = useState(() => {
    const saved = window.localStorage.getItem("qinglan-profile-v2");
    const base = saved ? JSON.parse(saved) : {
      level: 7,
      xp: 420,
      jade: 860,
      spirit: 32,
      chapter: 1,
      unlockedJobs: PROFESSIONS.map((job) => job.id),
      completedNodes: [],
      choices: [],
      unlockedLore: [],
      talentLevels: { meridian: 2, mind: 1, edge: 0 },
      jobMastery: {},
      discoveredTreasures: [],
      discoveredCards: defaultDiscoveredCards(),
      unlockedEndings: [],
      unlockedEpilogues: [],
      investigationArchive: {},
      investigationRewards: [],
      chapterFailures: {},
      recentRuns: [],
      claimedProgressGoals: [],
      unlockedTitles: [],
      equippedTitle: "云游录",
      completedDailyTrials: [],
      completedTribulations: [],
      tutorialFlags: {},
      seenEncounters: [],
      feedback: { sound: true, haptics: true, reducedMotion: false, readableText: false, volume: 0.55 },
    };
    return {
      ...base,
      unlockedJobs: PROFESSIONS.map((job) => job.id),
      talentLevels: base.talentLevels || { meridian: 2, mind: 1, edge: 0 },
      jobMastery: {
        ...(base.jobMastery || {}),
        ...(import.meta.env.DEV && query.has("mastery") ? { [initialOrigin]: debugMastery } : {}),
      },
      choices: debugChoice ? [...(base.choices || []), debugChoice] : (base.choices || []),
      completedNodes: base.completedNodes || [],
      unlockedLore: base.unlockedLore || [],
      discoveredTreasures: base.discoveredTreasures || [],
      discoveredCards: base.discoveredCards || defaultDiscoveredCards(),
      unlockedEndings: base.unlockedEndings || [],
      unlockedEpilogues: base.unlockedEpilogues || [],
      investigationArchive: base.investigationArchive || {},
      investigationRewards: base.investigationRewards || [],
      claimedProgressGoals: base.claimedProgressGoals || [],
      unlockedTitles: base.unlockedTitles || [],
      equippedTitle: base.equippedTitle || "云游录",
      completedDailyTrials: base.completedDailyTrials || [],
      completedTribulations: base.completedTribulations || [],
      chapterFailures: debugResetFailure
        ? { ...(base.chapterFailures || {}), [initialChapter]: 0 }
        : (base.chapterFailures || {}),
      recentRuns: base.recentRuns || [],
      tutorialFlags: base.tutorialFlags || {},
      seenEncounters: base.seenEncounters || [],
      feedback: { sound: true, haptics: true, reducedMotion: false, readableText: false, volume: 0.55, ...(base.feedback || {}) },
      ...(debugArchiveCount ? {
        investigationArchive: {
          ...(base.investigationArchive || {}),
          [String(debugArchiveChapter)]: investigationEvidence(debugArchiveChapter).slice(0, debugArchiveCount),
        },
      } : {}),
    };
  });
  const [progressNotice, setProgressNotice] = useState(null);
  const [hp, setHp] = useState(() => 72 + (profile.talentLevels.meridian || 0) * 4);
  const [qi, setQi] = useState(debugNumber("qi", 3 + treasureValue(debugTreasures, "maxQi") + treasureValue(debugTreasures, "firstTurnQi")));
  const [maxQi, setMaxQi] = useState(3 + treasureValue(debugTreasures, "maxQi"));
  const [shield, setShield] = useState(treasureValue(debugTreasures, "startShield"));
  const [edge, setEdge] = useState(debugNumber("edge"));
  const [jobState, setJobState] = useState(() => {
    const debugCopperDevices = debugNumber("copperDevices");
    const debugThunderDevices = debugNumber("thunderDevices");
    const debugDevices = debugCopperDevices + debugThunderDevices || debugNumber("devices");
    const debugDeviceTypes = debugCopperDevices + debugThunderDevices
      ? [
          ...Array.from({ length: debugCopperDevices }, () => ({ type: "copper", power: 2 })),
          ...Array.from({ length: debugThunderDevices }, () => ({ type: "thunder", power: 6 })),
        ]
      : Array.from({ length: debugDevices }, () => ({ type: "thunder", power: 6 }));
    return {
      ...freshJobState(),
      seals: debugNumber("seals"),
      burnMultiplier: Math.max(1, debugNumber("burnMultiplier", 1)),
      talismanDiscount: debugNumber("talismanDiscount"),
      symbolCardsPlayed: debugNumber("symbols"),
      cold: debugNumber("cold"),
      heat: debugNumber("heat"),
      contracts: debugNumber("contracts") > 0 ? ["玄狼", "白鹿", "青鸾", "石猿", "灵狐"].slice(0, debugNumber("contracts")) : [],
      devices: debugDevices,
      deviceTypes: debugDeviceTypes,
      cunning: debugNumber("cunning"),
      lamps: debugNumber("lamps"),
    };
  });
  const [enemyBurn, setEnemyBurn] = useState(debugNumber("burn"));
  const [enemyPoison, setEnemyPoison] = useState(debugNumber("poison"));
  const [enemyWeak, setEnemyWeak] = useState(debugNumber("weak"));
  const [enemyShield, setEnemyShield] = useState(0);
  const [playerWeak, setPlayerWeak] = useState(0);
  const [stones, setStones] = useState(18);
  const [consumables, setConsumables] = useState({ spirit: 2, skin: 1, clarity: 1, thunder: 1 });
  const [treasures, setTreasures] = useState(debugTreasures);
  const [enemy, setEnemy] = useState(() => makeEnemy(initialChapter, initialStage, null, tribulationForLevel(debugTribulationLevel)));
  const [runDeck, setRunDeck] = useState(cards[initialOrigin]);
  const initialHandSize = Math.min(7, debugNumber("hand", 5 + treasureValue(debugTreasures, "firstTurnDraw")));
  const debugHandCurseCount = debugNumber("handCurses");
  const debugHandCurses = Array.from({ length: debugHandCurseCount }, (_, index) => ({ ...FATE_CURSE, id: `${FATE_CURSE.id}-hand-debug-${index}` }));
  const initialHandBase = debugCard ? [debugCard, ...cards[initialOrigin].filter((card) => card.id !== debugCard.id)] : cards[initialOrigin];
  const initialHand = [...debugHandCurses, ...initialHandBase].slice(0, initialHandSize);
  const debugDiscardCount = debugNumber("discard");
  const debugCurseCount = debugNumber("curses");
  const initialDiscard = import.meta.env.DEV && debugDiscardCount > 0
    ? getProfession(initialOrigin).cards.filter((card) => !initialHand.some((held) => held.id === card.id)).slice(0, debugDiscardCount)
    : [];
  const [hand, setHand] = useState(initialHand);
  const [drawPile, setDrawPile] = useState(subtractCardInstances(cards[initialOrigin], initialHand));
  const [discardPile, setDiscardPile] = useState([
    ...initialDiscard,
    ...Array.from({ length: debugCurseCount }, (_, index) => ({ ...FATE_CURSE, id: `${FATE_CURSE.id}-debug-${index}` })),
  ]);
  const [exhaustPile, setExhaustPile] = useState([]);
  const [drawFx, setDrawFx] = useState(null);
  const [combatTurn, setCombatTurn] = useState(1);
  const [log, setLog] = useState("雨落石阶。妖影从竹林间显形。");
  const [overlay, setOverlay] = useState(debugOverlay);
  const [combatFx, setCombatFx] = useState(null);
  const [combatBusy, setCombatBusy] = useState(false);
  const [playerFx, setPlayerFx] = useState(null);
  const [triggerFx, setTriggerFx] = useState(null);
  const [turnFlowFx, setTurnFlowFx] = useState(null);
  const [transition, setTransition] = useState("");
  const timers = useRef([]);
  const feedbackEngine = useRef(null);
  const combatResolved = useRef(false);
  const firstAttackUsed = useRef(false);
  const firstSkillUsed = useRef(false);
  const enemyShieldRef = useRef(0);
  const enemyHpRef = useRef(enemy.hp);
  const playedThisTurnRef = useRef(debugPlayedCard ? [debugPlayedCard] : []);
  const lastPlayedCardRef = useRef(debugLastCard);
  const rewardClaimedRef = useRef(false);
  const maxHp = 72 + (profile.talentLevels.meridian || 0) * 4;
  const startingStones = 18 + (profile.talentLevels.mind || 0) * 2;
  const feedback = (kind) => {
    feedbackEngine.current ||= createFeedbackEngine();
    feedbackEngine.current(kind, profile.feedback);
  };
  function claimChallengeReward(goalId) {
    const result = claimProgressGoal(profile, goalId);
    if (!result.claimed) return;
    const nextAfterClaim = nextProgressGoals(result.profile, 1).find((goal) => goal.id !== result.goal.id) || null;
    setProfile(result.profile);
    setProgressNotice({
      title: result.goal.title,
      reward: formatProgressReward(result.reward),
      epithet: result.reward.epithet,
      hook: result.goal.hook,
      next: nextAfterClaim ? `${nextAfterClaim.title} · ${nextAfterClaim.current}/${nextAfterClaim.target}` : "挑战卷暂已收束，重返云游补全宗卷。",
    });
    feedback("reward");
    timers.current.push(window.setTimeout(() => setProgressNotice(null), 4200));
  }
  async function copyChallengeCode(code) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const field = document.createElement("textarea");
      field.value = code;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setProgressNotice(`挑战码已抄录 · ${code}`);
    timers.current.push(window.setTimeout(() => setProgressNotice(""), 2600));
  }

  useEffect(() => {
    const root = document.querySelector(".app");
    if (root) root.scrollTop = 0;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [screen]);
  useEffect(() => {
    enemyShieldRef.current = enemyShield;
  }, [enemyShield]);
  useEffect(() => {
    enemyHpRef.current = enemy.hp;
  }, [enemy.hp]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") setOverlay(null);
      if (screen === "combat" && event.code === "Space" && !combatBusy) endTurn();
      if (screen === "combat" && /^[1-7]$/.test(event.key) && !combatBusy) playCard(Number(event.key) - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    window.localStorage.setItem("qinglan-profile-v2", JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    if (!runDeck.length) return;
    setProfile((value) => {
      const discovered = new Set(value.discoveredCards || defaultDiscoveredCards());
      const before = discovered.size;
      runDeck.forEach((card) => {
        if (card?.job !== "curse" && card?.id) discovered.add(card.id);
      });
      return discovered.size === before ? value : { ...value, discoveredCards: [...discovered] };
    });
  }, [runDeck]);
  useEffect(() => {
    if (!["story", "map", "event", "market", "rest", "training", "encounterPrelude", "bossPrelude", "combat", "reward"].includes(screen)) return;
    const snapshot = {
      version: 3,
      origin,
      selectedChapter,
      stage,
      hp,
      qi,
      shield,
      edge,
      playerWeak,
      stones,
      maxQi,
      consumables,
      treasures: treasures.map((treasure) => treasure.id),
      storyIndex,
      routeProgress,
      pendingEncounterStage,
      runChoices,
      runChronicle,
      runClues,
      pendingClue,
      nextEnemyShield,
      marketVisit,
      runStats,
      screen,
      deck: runDeck,
      hand,
      drawPile,
      discardPile,
      exhaustPile,
      enemy,
      enemyBurn,
      enemyPoison,
      enemyWeak,
      enemyShield,
      combatTurn,
      jobState,
      log,
      playedThisTurn: playedThisTurnRef.current,
      lastPlayedCard: lastPlayedCardRef.current,
      firstAttackUsed: firstAttackUsed.current,
      firstSkillUsed: firstSkillUsed.current,
      runMode,
      runSeed,
      runTrial,
      runTribulation,
      savedAt: Date.now(),
    };
    window.localStorage.setItem("qinglan-run-v1", JSON.stringify(snapshot));
    setSavedRun(snapshot);
  }, [screen, origin, selectedChapter, stage, hp, qi, shield, edge, playerWeak, stones, maxQi, consumables, treasures, storyIndex, routeProgress, pendingEncounterStage, runChoices, runChronicle, runClues, pendingClue, nextEnemyShield, marketVisit, runStats, runDeck, hand, drawPile, discardPile, exhaustPile, enemy, enemyBurn, enemyPoison, enemyWeak, enemyShield, combatTurn, jobState, log, runMode, runSeed, runTrial, runTribulation]);
  useEffect(() => {
    if (screen === "combat" && enemy.hp <= 0 && !combatResolved.current) {
      finishCombat("敌影溃散");
    }
  }, [enemy.hp, screen]);
  useEffect(() => {
    if (screen === "combat" && hp <= 0 && !combatResolved.current) {
      combatResolved.current = true;
      setCombatBusy(true);
      setLog("道心失守，眼前的雨夜沉入黑暗……");
      setProfile((value) => ({
        ...value,
        chapterFailures: {
          ...(value.chapterFailures || {}),
          [selectedChapter]: Math.min(3, (value.chapterFailures?.[selectedChapter] || 0) + 1),
        },
      }));
      later(() => changeScreen("defeat", 180), 620);
    }
  }, [hp, screen, selectedChapter]);
  useEffect(() => {
    if (!debugAutoplay || screen !== "combat") return;
    const id = window.setTimeout(() => playCard(0), 300);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!debugAutoClick || screen !== "combat") return;
    const id = window.setTimeout(() => document.querySelector(".hand .game-card:not(:disabled)")?.click(), 300);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!debugAutoEnd || screen !== "combat") return;
    const id = window.setTimeout(() => endTurn(), debugAutoplay ? 1550 : 350);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!debugAutoStory || screen !== "story") return;
    const id = window.setTimeout(() => continueStory(), 250);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (["summary", "defeat"].includes(screen)) {
      window.localStorage.removeItem("qinglan-run-v1");
      setSavedRun(null);
    }
  }, [screen]);
  useEffect(() => {
    if (screen === "reward") rewardClaimedRef.current = false;
  }, [screen]);

  const selectedOrigin = origins.find((item) => item.id === origin);
  const moonPhase = debugMoon === "blood" || debugMoon === "frost" ? debugMoon : moonPhaseForTrial(runTrial);

  function later(callback, delay) {
    const id = window.setTimeout(callback, delay);
    timers.current.push(id);
    return id;
  }

  function changeScreen(nextScreen, delay = 360) {
    setTransition("closing");
    later(() => {
      setScreen(nextScreen);
      setTransition("opening");
      later(() => setTransition(""), 520);
    }, delay);
  }

  function beginRun(chapterId = selectedChapter, options = {}) {
    const nextMode = options.mode || "story";
    const nextTrial = options.trial || null;
    const nextTribulation = nextMode === "story" ? tribulationForLevel(options.tribulationLevel || 0) : tribulationForLevel(0);
    const runOrigin = options.origin || origin;
    const nextSeed = options.seed || createRunSeed();
    setOrigin(runOrigin);
    setSelectedChapter(chapterId);
    setRunMode(nextMode);
    setRunTrial(nextTrial);
    setRunTribulation(nextTribulation);
    setRunSeed(nextSeed);
    const mastery = profile.jobMastery[runOrigin] || 0;
    const retrySupport = retrySupportFor(hasDebugFailures ? debugFailures : (profile.chapterFailures?.[chapterId] || 0));
    const profession = getProfession(runOrigin);
    let starter = masteryStarterDeck(profession, mastery);
    if (nextTrial?.modifier?.refineStarter) {
      const refineIndex = starter.findIndex((card) => refinedVersion(card, profession));
      if (refineIndex >= 0) starter = starter.map((card, index) => index === refineIndex ? refinedVersion(card, profession) : card);
    }
    const masteryTreasure = mastery >= 100
      ? TREASURES.find((treasure) => treasure.id === MASTERY_TREASURE_BY_JOB[runOrigin])
      : null;
    setRunDeck(starter);
    prepareDeck(starter, false, 0, mastery, runOrigin, nextSeed, "opening");
    setStage(1);
    setHp(Math.max(1, maxHp + (nextTrial?.modifier?.hpDelta || 0)));
    setStones(Math.max(0, startingStones + (mastery >= 25 ? 4 : 0) + retrySupport.stones + (nextTrial?.modifier?.stonesDelta || 0)));
    setMaxQi(Math.min(5, 3 + (masteryTreasure?.maxQi || 0) + (nextTrial?.modifier?.maxQiDelta || 0)));
    setConsumables({
      spirit: 2 + (nextTrial?.modifier?.consumables?.spirit || 0),
      skin: 1 + retrySupport.skin + (nextTrial?.modifier?.consumables?.skin || 0),
      clarity: 1 + retrySupport.clarity + (nextTrial?.modifier?.consumables?.clarity || 0),
      thunder: 1 + (nextTrial?.modifier?.consumables?.thunder || 0),
    });
    setTreasures(masteryTreasure ? [masteryTreasure] : []);
    setStoryIndex(0);
    setRouteProgress(0);
    setPendingEncounterStage(1);
    setRunChoices([]);
    setRunClues([]);
    setPendingClue(null);
    setRunStats(freshRunStats());
    const inherited = MASTERY_MILESTONES.filter((milestone) => mastery >= milestone.level).map((milestone) => milestone.name);
    setRunChronicle([
      `第 ${chapterId} 章启程 · ${profession.name}`,
      ...(nextMode === "daily"
        ? [`今日试炼 · ${nextTrial.modifier.name} · ${nextSeed}`]
        : nextMode === "challenge"
          ? [`挑战复刻 · ${nextTrial?.modifier?.name || "标准规则"} · ${nextSeed}`]
          : [`试炼种子 · ${nextSeed}`]),
      ...(nextTribulation.level ? [`劫数加身 · ${nextTribulation.name} · ${nextTribulation.risk}`] : []),
      ...(inherited.length ? [`道途传承 · ${inherited.join(" / ")}`] : []),
      ...(retrySupport.tier ? [`山门扶助 · ${retrySupport.title} · ${retrySupport.detail}`] : []),
    ]);
    setNextEnemyShield(0);
    setMarketVisit({ key: "", sold: [], specialUsed: false, treasureBought: false });
    setProfile((value) => ({
      ...value,
      discoveredTreasures: masteryTreasure
        ? [...new Set([...(value.discoveredTreasures || []), masteryTreasure.id])]
        : value.discoveredTreasures,
    }));
    changeScreen("story");
  }

  function resumeRun() {
    if (!savedRun) return;
    const restoreCards = (items = []) => items.map((item) => {
      if (typeof item === "string") return ALL_CARDS.find((card) => card.id === item);
      return item?.id ? { ...item } : null;
    }).filter(Boolean);
    const resumedDeck = restoreCards(savedRun.deck);
    setOrigin(savedRun.origin || "sword");
    setSelectedChapter(savedRun.selectedChapter || 1);
    setRunMode(savedRun.runMode || "story");
    setRunSeed(savedRun.runSeed || createRunSeed(savedRun.savedAt || Date.now()));
    setRunTrial(savedRun.runTrial || null);
    setRunTribulation(tribulationForLevel(savedRun.runTribulation?.level || 0));
    setStage(savedRun.stage || 1);
    setHp(Math.max(1, savedRun.hp || 72));
    setQi(savedRun.qi ?? savedRun.maxQi ?? 3);
    setShield(savedRun.shield || 0);
    setEdge(savedRun.edge || 0);
    setPlayerWeak(savedRun.playerWeak || 0);
    setStones(savedRun.stones ?? 18);
    setMaxQi(savedRun.maxQi || 3);
    setConsumables(savedRun.consumables || { spirit: 2, skin: 1, clarity: 1, thunder: 1 });
    setTreasures((savedRun.treasures || []).map((id) => TREASURES.find((treasure) => treasure.id === id)).filter(Boolean));
    setStoryIndex(savedRun.storyIndex || 0);
    setRouteProgress(savedRun.routeProgress || 0);
    setPendingEncounterStage(savedRun.pendingEncounterStage || savedRun.stage || 1);
    setRunChoices(savedRun.runChoices || []);
    setRunChronicle(savedRun.runChronicle || []);
    setRunClues(savedRun.runClues || []);
    setPendingClue(savedRun.pendingClue || null);
    setNextEnemyShield(savedRun.nextEnemyShield || 0);
    setMarketVisit(savedRun.marketVisit || { key: "", sold: [], specialUsed: false, treasureBought: false });
    setRunStats({ ...freshRunStats(), ...(savedRun.runStats || {}) });
    setRunDeck(resumedDeck.length ? resumedDeck : cards[savedRun.origin || "sword"]);
    if (savedRun.screen === "combat" && savedRun.enemy) {
      combatResolved.current = false;
      const currentEnemy = makeEnemy(savedRun.selectedChapter || 1, savedRun.stage || 1, savedRun.runTrial || null, savedRun.runTribulation);
      const savedBossPhase = savedRun.stage === 3 && savedRun.enemy.phase === 2 ? BOSS_PHASES[savedRun.selectedChapter || 1] : null;
      const restoredMoves = savedBossPhase?.moves || currentEnemy.moves;
      const restoredMoveIndex = Math.min(restoredMoves.length - 1, savedRun.enemy.moveIndex || 0);
      setEnemy({
        ...currentEnemy,
        ...savedRun.enemy,
        archetype: currentEnemy.archetype,
        trait: currentEnemy.trait,
        counter: currentEnemy.counter,
        moves: restoredMoves,
        moveIndex: restoredMoveIndex,
        intent: intentLabel(restoredMoves[restoredMoveIndex]),
      });
      setEnemyBurn(savedRun.enemyBurn || 0);
      setEnemyPoison(savedRun.enemyPoison || 0);
      setEnemyWeak(savedRun.enemyWeak || 0);
      setEnemyShield(savedRun.enemyShield || 0);
      enemyShieldRef.current = savedRun.enemyShield || 0;
      setCombatTurn(savedRun.combatTurn || 1);
      const restoredJobState = { ...freshJobState(), ...(savedRun.jobState || {}) };
      setJobState(withDevices(restoredJobState, normalizeDevices(restoredJobState)));
      setHand(restoreCards(savedRun.hand));
      setDrawPile(restoreCards(savedRun.drawPile));
      setDiscardPile(restoreCards(savedRun.discardPile));
      setExhaustPile(restoreCards(savedRun.exhaustPile));
      playedThisTurnRef.current = restoreCards(savedRun.playedThisTurn);
      lastPlayedCardRef.current = restoreCards(savedRun.lastPlayedCard ? [savedRun.lastPlayedCard] : [])[0] || null;
      firstAttackUsed.current = Boolean(savedRun.firstAttackUsed);
      firstSkillUsed.current = Boolean(savedRun.firstSkillUsed);
      setLog(savedRun.log || "从中断的回合继续。");
      setCombatBusy(false);
      setCombatFx(null);
      setPlayerFx(null);
      setTriggerFx(null);
    }
    changeScreen(savedRun.screen || "map");
  }

  function abandonRun() {
    window.localStorage.removeItem("qinglan-run-v1");
    setSavedRun(null);
    setOverlay(null);
    setCombatBusy(false);
    combatResolved.current = false;
    changeScreen("home");
  }

  function shuffle(items, salt = "shuffle", seed = runSeed) {
    return seededShuffle(items, seed, salt);
  }

  function prepareDeck(deckCards, showDraw = true, extraDraw = 0, mastery = 0, runOrigin = origin, seed = runSeed, salt = "opening") {
    const pile = shuffle(deckCards, salt, seed);
    const openingHand = pile.slice(0, 5 + extraDraw);
    setHand(openingHand);
    setDrawPile(pile.slice(5 + extraDraw));
    setDiscardPile([]);
    setExhaustPile([]);
    setCombatTurn(1);
    setEdge(runOrigin === "sword" && mastery >= 75 ? 1 : 0);
    setJobState(masteryOpeningState(runOrigin, mastery));
    if (showDraw) {
      setDrawFx({ cards: openingHand, source: "开局手牌", nonce: Date.now() });
      later(() => setDrawFx(null), 1250);
    }
  }

  function continueStory(choice) {
    const storyChoice = typeof choice === "string"
      ? Object.values(CHAPTER_STORY_CHOICES[selectedChapter] || {}).flat().find((item) => item.value === choice)
      : choice;
    const choiceValue = storyChoice?.value || (typeof choice === "string" ? choice : "");
    const sceneId = `chapter-${selectedChapter}-scene-${storyIndex + 1}`;
    setProfile((value) => {
      const completedNodes = [...new Set([...(value.completedNodes || []), sceneId])];
      const firstChapterScenes = completedNodes.filter((node) => node.startsWith("chapter-1-scene-")).length;
      const unlockHandbook = firstChapterScenes >= CHAPTER_STORIES[1].length && !(value.unlockedLore || []).includes("shen-handbook-1");
      return {
        ...value,
        completedNodes,
        choices: choiceValue ? [...(value.choices || []).slice(-11), choiceValue] : (value.choices || []),
        unlockedLore: unlockHandbook ? [...(value.unlockedLore || []), "shen-handbook-1"] : (value.unlockedLore || []),
        spirit: value.spirit + (unlockHandbook ? 8 : 0),
      };
    });
    if (choiceValue) {
      const effect = storyChoice?.effect || {};
      const profession = getProfession(origin);
      setRunChoices((value) => [...value, choiceValue]);
      setRunChronicle((value) => [...value.slice(-7), `抉择 · ${choiceValue}`]);
      if (effect.stones) setStones((value) => value + effect.stones);
      if (effect.heal) setHp((value) => Math.min(maxHp, value + effect.heal));
      if (effect.fullHeal) setHp(maxHp);
      if (effect.hpLoss) setHp((value) => Math.max(1, value - effect.hpLoss));
      if (effect.maxQi) setMaxQi((value) => Math.min(5, value + effect.maxQi));
      if (effect.enemyShield) setNextEnemyShield((value) => value + effect.enemyShield);
      if (effect.consumables) {
        setConsumables((value) => Object.fromEntries(
          Object.entries(value).map(([key, amount]) => [key, amount + (effect.consumables[key] || 0)]),
        ));
      }
      if (effect.addKeywordCard) {
        const card = profession.cards.find((item) => item.keyword === effect.addKeywordCard && !item.refined);
        if (card) setRunDeck((value) => [...value, card]);
      }
      if (effect.addRarityCard) {
        const card = profession.cards.find((item) => item.rarity === effect.addRarityCard && !item.refined);
        if (card) setRunDeck((value) => [...value, card]);
      }
      if (effect.refineOne) {
        setRunDeck((value) => {
          const index = value.findIndex((card) => refinedVersion(card, profession));
          return index < 0 ? value : value.map((card, cardIndex) => cardIndex === index ? refinedVersion(card, profession) : card);
        });
      }
      if (effect.refineAll) {
        setRunDeck((value) => value.map((card) => refinedVersion(card, profession) || card));
      }
      setLog(`你的选择「${choiceValue}」已改变本次云游。`);
    }
    if (storyIndex < CHAPTER_STORIES[selectedChapter].length - 1) {
      setStoryIndex((value) => value + 1);
    } else {
      const openingClue = CHAPTER_INVESTIGATIONS[selectedChapter]?.opening;
      if (openingClue) setRunClues((value) => [...new Set([...value, openingClue])]);
      changeScreen("map");
    }
  }

  function enterCombat(nextStage = stage) {
    combatResolved.current = false;
    setStage(nextStage);
    const nextEnemy = makeEnemy(selectedChapter, nextStage, runTrial, runTribulation);
    setEnemy(nextEnemy);
    setQi(maxQi + treasureValue(treasures, "firstTurnQi") + (nextStage === 1 ? (profile.talentLevels.edge || 0) : 0));
    setEnemyBurn(0);
    setEnemyPoison(0);
    setEnemyWeak(0);
    const trialShield = runTrial?.modifier?.enemyShield || 0;
    const tribulationShield = runTribulation?.enemyShield || 0;
    setEnemyShield(nextEnemyShield + trialShield + tribulationShield);
    enemyShieldRef.current = nextEnemyShield + trialShield + tribulationShield;
    const totalOpeningShield = nextEnemyShield + trialShield + tribulationShield;
    if (nextEnemyShield > 0 || tribulationShield > 0) {
      setRunChronicle((value) => [
        ...value.slice(-5),
        nextEnemyShield > 0 ? `代价兑现 · 敌人获得 ${nextEnemyShield} 点护体` : "",
        tribulationShield > 0 ? `劫数压境 · ${runTribulation.name} 附加 ${tribulationShield} 点护体` : "",
      ].filter(Boolean));
      setNextEnemyShield(0);
    }
    setPlayerWeak(0);
    firstAttackUsed.current = false;
    firstSkillUsed.current = false;
    playedThisTurnRef.current = [];
    lastPlayedCardRef.current = null;
    const latestClue = pendingClue?.text || runClues.at(-1);
    const encounterRead = `敌情「${nextEnemy.trait}」：${nextEnemy.counter}`;
    setLog(totalOpeningShield > 0 ? `此前的选择与劫数化作压迫：敌人带着 ${totalOpeningShield} 点护体拦住去路。${encounterRead}` : pendingClue ? `若能胜出，便可查证：${pendingClue.text} ${encounterRead}` : latestClue ? `线索仍在耳边：${latestClue} ${encounterRead}` : encounterRead);
    setCombatFx(null);
    setTriggerFx(null);
    setShield(treasureValue(treasures, "startShield"));
    prepareDeck(runDeck, true, treasureValue(treasures, "firstTurnDraw"), profile.jobMastery[origin] || 0, origin, runSeed, `combat:${selectedChapter}:${nextStage}:${routeProgress}`);
    changeScreen("combat");
  }

  function finishCombat(source = "敌影溃散") {
    if (combatResolved.current) return;
    combatResolved.current = true;
    setRunStats((value) => ({ ...value, combatsWon: value.combatsWon + 1 }));
    setCombatBusy(true);
    const afterHeal = treasureValue(treasures, "battleHeal");
    const afterStones = treasureValue(treasures, "battleStones");
    if (afterHeal) setHp((value) => Math.min(maxHp, value + afterHeal));
    if (afterStones) setStones((value) => value + afterStones);
    if (treasureValue(treasures, "battleConsumable")) {
      const keys = ["spirit", "skin", "clarity", "thunder"];
      const key = keys[Math.floor(seededRandom(runSeed, `battle-consumable:${selectedChapter}:${stage}:${routeProgress}`) * keys.length)];
      setConsumables((value) => ({ ...value, [key]: (value[key] || 0) + 1 }));
    }
    const recoveredClue = completePendingClue();
    setLog(recoveredClue ? `${source}。证据已带回：${recoveredClue}` : `${source}。战利灵光正在凝聚……`);
    feedback("reward");
    later(() => changeScreen("reward", 220), 520);
  }

  function completePendingClue() {
    const settled = settlePendingClue([], pendingClue);
    if (!settled.recovered) return "";
    setRunClues((value) => settlePendingClue(value, pendingClue).clues);
    setRunChronicle((value) => [...value.slice(-5), `查证 · ${pendingClue.nodeName}`]);
    setPendingClue(settled.pendingClue);
    return settled.recovered;
  }

  function damageEnemy(amount, source, ignoreShield = false) {
    if (amount <= 0 || combatResolved.current) return;
    const beforeHp = enemyHpRef.current;
    const blocked = ignoreShield ? 0 : Math.min(enemyShieldRef.current, amount);
    const dealt = amount - blocked;
    const actualDamage = Math.min(beforeHp, dealt);
    const nextHp = Math.max(0, beforeHp - actualDamage);
    const phaseData = stage >= 3 ? BOSS_PHASES[selectedChapter] : null;
    const phaseThreshold = phaseData ? enemy.max * phaseData.threshold : 0;
    const phaseShift = Boolean(phaseData && enemy.phase !== 2 && beforeHp > phaseThreshold && nextHp <= phaseThreshold && nextHp > 0);
    enemyHpRef.current = nextHp;
    if (actualDamage > 0) setRunStats((value) => ({ ...value, damageDealt: value.damageDealt + actualDamage }));
    if (blocked) {
      enemyShieldRef.current = Math.max(0, enemyShieldRef.current - blocked);
      setEnemyShield(enemyShieldRef.current);
    }
    if (phaseShift) {
      const choiceResponse = resolveBossChoiceResponse(selectedChapter, runChoices);
      const phaseShield = Math.max(0, (phaseData.shield || 0) + (choiceResponse?.bossShieldDelta || 0));
      const phaseMoves = phaseData.moves.map((move) => ({
        ...move,
        damage: move.damage ? move.damage + (runTrial?.modifier?.enemyDamageBonus || 0) + (runTribulation?.enemyDamageBonus || 0) : move.damage,
      }));
      enemyShieldRef.current += phaseShield;
      setEnemyShield(enemyShieldRef.current);
      if (choiceResponse?.playerShield) setShield((value) => value + choiceResponse.playerShield);
      const phaseLine = choiceResponse?.line || phaseData.line;
      setEnemy((value) => ({
        ...value,
        hp: nextHp,
        phase: 2,
        phaseName: `第二相 · ${phaseData.name}`,
        phaseLine,
        choiceEcho: choiceResponse?.choice || "",
        moves: phaseMoves,
        moveIndex: 0,
        intent: intentLabel(phaseMoves[0]),
      }));
      const responseEffects = [
        phaseLine,
        `首领护体 +${phaseShield}`,
        choiceResponse?.effect,
      ].filter(Boolean);
      setTriggerFx({ card: phaseData.name, combo: choiceResponse ? `回应抉择 · ${choiceResponse.choice}` : "首领转相", effects: responseEffects });
      later(() => setTriggerFx(null), 2100);
    } else {
      setEnemy((value) => ({ ...value, hp: nextHp }));
    }
    const choiceResponse = phaseShift ? resolveBossChoiceResponse(selectedChapter, runChoices) : null;
    setLog(`${source}，造成 ${dealt} 点伤害${blocked ? `，其中 ${blocked} 点被护体抵消` : ""}。${phaseShift ? ` ${choiceResponse?.line || phaseData.line}${choiceResponse ? ` 首领回应了你的抉择「${choiceResponse.choice}」。` : ""}` : ""}`);
  }

  function useConsumable(kind) {
    if (combatBusy || (consumables[kind] || 0) <= 0 || enemy.hp <= 0) return;
    const effects = {
      spirit: () => {
        setQi((value) => Math.min(maxQi + 2, value + 2));
        setLog("服下聚气散，灵气 +2。");
      },
      skin: () => {
        setShield((value) => value + 10);
        setLog("石肤符化作岩甲，获得 10 点护盾。");
      },
      clarity: () => {
        setHp((value) => Math.min(maxHp, value + 8));
        setPlayerWeak(0);
        setLog("清神粉压下心神震荡，恢复 8 点生命并清除虚弱。");
      },
      thunder: () => {
        damageEnemy(12, "阴雷子在敌人脚下炸开");
        setCombatFx({ phase: "impact", kind: "fire", damage: 12 });
        later(() => setCombatFx(null), 620);
      },
    };
    effects[kind]();
    feedback(kind === "thunder" ? "impact" : kind === "skin" ? "guard" : kind === "clarity" ? "heal" : "tap");
    setConsumables((value) => ({ ...value, [kind]: value[kind] - 1 }));
  }

  function effectiveCardCost(card) {
    let cost = card.cost;
    if (origin === "talisman" && jobState.talismanDiscount > 0 && card.type === "术法") cost -= 1;
    if (origin === "alchemy" && jobState.alchemyDiscount > 0 && ["法门", "术法"].includes(card.type)) cost -= 1;
    if (origin === "beast" && jobState.beastDiscount > 0 && ["指令", "协同"].includes(card.keyword)) cost -= 1;
    if (card.baseName === "机关城垒" && jobState.cunning >= 5) cost -= 2;
    if (card.baseName === "百鬼夜行" && jobState.lamps >= 5) cost = 0;
    if (card.baseName === "阴阳大还丹" && jobState.cold > 0 && jobState.cold === jobState.heat) cost = Math.min(cost, 1);
    if (card.baseName === "万符归一") cost -= jobState.seals;
    return Math.max(0, cost);
  }

  function cardRequirementMet(card) {
    const base = card.baseName || card.name.replace("·真解", "");
    if (base === "药炉温养") return jobState.cold > 0 && jobState.heat > 0;
    if (base === "玄雷敕令") return jobState.seals > 0;
    if (base === "彼岸回响") return Boolean(lastPlayedCardRef.current);
    if (base === "无常索命") return hand.length > 1;
    if (base === "黄泉引路") return discardPile.length > 0;
    if (base === "魂火焚身") return jobState.lamps > 0;
    if (base === "忘川照影") return playedThisTurnRef.current.length > 0;
    if (base === "百鬼夜行") return discardPile.length > 0;
    return true;
  }

  function cardSynergyState(card) {
    const base = card.baseName || card.name.replace("·真解", "");
    const combatCurseCount = countCurses({ hand, drawPile, discardPile });
    const checks = {
      青竹剑诀: [playedThisTurnRef.current.some((item) => item.type === "攻击"), "本回合已打出攻击牌"],
      回风剑: [hand.length <= 3, "施放后手牌少于 3 张"],
      锋芒护身: [edge >= 4, `剑势 ${edge}/4`],
      小五行剑阵: [edge >= 2, `可消耗 2 层剑势`],
      逐月连斩: [edge > 0, `每层剑势强化三段伤害 · 当前 ${edge}`],
      裂魂剑: [enemyWeak > 0, `敌人已有虚弱 ${enemyWeak}`],
      引劫剑: [edge >= 5, `剑势 ${edge}/5，免除消耗`],
      玉月成璧: [moonPhase === "frost", moonPhase === "frost" ? "霜月护体，额外抽 1 张牌" : "当前为血月，不触发额外抽牌"],
      万剑归岚: [edge > 0, `可释放 ${edge} 层剑势`],
      火弹符: [enemyWeak > 0, "敌人已有虚弱"],
      镇魂符: [playerWeak > 0, `可驱散虚弱 ${playerWeak}`],
      阴火符: [jobState.seals > 0, `可引爆 1 枚符印 · 当前 ${jobState.seals}`],
      玄雷敕令: [jobState.seals > 0, `可引爆 ${jobState.seals} 枚符印`],
      净坛真言: [true, combatCurseCount > 0 ? `可净除 ${Math.min(card.refined ? 2 : 1, combatCurseCount)} 张心魔` : "无心魔时转化为 2 点灵气"],
      雷火连符: [true, `包含本牌，共追加 ${jobState.symbolCardsPlayed + 1} 次`],
      借风燃纸: [enemyBurn >= 5, `燃烧 ${enemyBurn}/5，额外获得护盾`],
      万符归一: [jobState.seals > 0 || enemyBurn > 0, `符印 ${jobState.seals} · 燃烧 ${enemyBurn}`],
      回春散: [hp < maxHp / 2, "生命低于一半，治疗增强"],
      赤芝养气丹: [jobState.heat > 0, "拥有热性，不再消耗"],
      药炉温养: [jobState.cold > 0 && jobState.heat > 0, `寒 ${jobState.cold} · 热 ${jobState.heat}`],
      腐脉毒雾: [enemyPoison > 0, `敌人已有丹毒 ${enemyPoison}`],
      玉液护心: [playerWeak > 0, "成功驱散后获得热性"],
      逆炼血丹: [jobState.heat > 0, `热性增伤 · 当前 ${jobState.heat}`],
      阴阳大还丹: [jobState.cold > 0 || jobState.heat > 0, `调和寒 ${jobState.cold} / 热 ${jobState.heat}`],
      玄狼奔袭: [jobState.lastWasInstruction, "上一张为指令牌"],
      石猿撼地: [shield > 0, `拥有护盾 ${shield}`],
      百兽同途: [jobState.contracts.length > 0, `已契约 ${jobState.contracts.length} 种灵兽`],
      灵狐探路: [discoverInstructions(drawPile, card.refined ? 2 : 1, Math.max(0, 7 - hand.length)).discovered.length > 0, "从抽牌堆定向发现指令或协同牌"],
      山君号令: [Boolean(jobState.activeBeast), `当前灵兽：${jobState.activeBeast}`],
      归巢: [Boolean(jobState.activeBeast), jobState.activeBeast ? `召回当前灵兽：${jobState.activeBeast}` : "当前没有出战灵兽"],
      血月兽潮: [moonPhase === "blood", moonPhase === "blood" ? "血月当空，每段伤害 +2" : "当前为霜月，未触发额外伤害"],
      山海盟誓: [jobState.contracts.length > 0, `召唤 ${Math.max(1, jobState.contracts.length)} 种灵兽`],
      玄甲机括: [jobState.devices > 0, `已有机关 ${jobState.devices}`],
      墨轮复位: [jobState.devices > 0, `可复位机关 ${jobState.devices}`],
      千机连弩: [jobState.devices > 0, `机关追加攻击 · 当前 ${jobState.devices}`],
      拆解回收: [jobState.devices > 0, `可拆解机关 ${jobState.devices}`],
      偃师护心镜: [jobState.cunning > 0, `机巧 ${jobState.cunning}，反击增强`],
      飞梭穿云: [enemyShield > 0, `可击破护体 ${enemyShield}`],
      机关城垒: [jobState.cunning >= 5, `机巧 ${jobState.cunning}/5，费用降低`],
      天工开物: [jobState.devices > 0, `立即触发 ${jobState.devices} 个机关`],
      幽灯守魄: [hp < maxHp / 2, "生命低于一半，护盾增强"],
      彼岸回响: [Boolean(lastPlayedCardRef.current), lastPlayedCardRef.current ? `召回「${lastPlayedCardRef.current.name}」` : "尚无上一张牌"],
      无常索命: [hand.some((item) => item !== card && item.type === "心魔"), "可弃掉心魔并追加伤害"],
      渡厄咒: [jobState.lamps > 0, `魂灯强化治疗 · 当前 ${jobState.lamps}`],
      借命灯: [jobState.lamps > 0, "已有魂灯，免除自伤"],
      黄泉引路: [discardPile.length > 0, `弃牌堆可召回 ${Math.min(2, discardPile.length, Math.max(0, 8 - hand.length))} 张`],
      魂火焚身: [jobState.lamps > 0, `可熄灭 ${jobState.lamps} 盏魂灯`],
      忘川照影: [playedThisTurnRef.current.length > 0, playedThisTurnRef.current[0] ? `复制「${playedThisTurnRef.current[0].name}」` : "本回合尚未出牌"],
      百鬼夜行: [discardPile.length > 0, `弃牌堆有 ${new Set(discardPile.map((item) => item.baseName || item.name)).size} 种牌`],
    };
    const result = checks[base];
    if (!result) return { conditional: false, active: false, reason: "基础效果稳定生效" };
    return { conditional: true, active: Boolean(result[0]), reason: result[1] };
  }

  function resolveCardMechanics(card) {
    const text = card.text;
    const combo = card.combo || "";
    const damageMatch = text.match(/造成\s*(\d+)\s*点伤害(?:\s*(\d+)\s*次)?/);
    const blockMatch = text.match(/获得\s*(\d+)\s*点护盾/);
    const healMatch = text.match(/恢复\s*(\d+)\s*点生命/);
    const qiMatch = text.match(/获得\s*(\d+)\s*点灵气/);
    const edgeMatch = text.match(/获得\s*(\d+)\s*层剑势/);
    const burnMatch = text.match(/施加\s*(\d+)\s*层燃烧/);
    const poisonMatch = text.match(/施加\s*(\d+)\s*层丹毒/);
    const weakMatch = text.match(/施加\s*(\d+)\s*层虚弱/);
    const drawMatch = text.match(/抽\s*(\d+)\s*张牌/);
    const selfMatch = text.match(/失去\s*(\d+)\s*点生命/);
    const sealMatch = text.match(/附着\s*(\d+)\s*枚符印/);
    const hits = damageMatch?.[2] ? Number(damageMatch[2]) : 1;
    const r = {
      damage: damageMatch ? Number(damageMatch[1]) * hits : 0,
      shield: blockMatch ? Number(blockMatch[1]) : 0,
      heal: healMatch ? Number(healMatch[1]) : 0,
      qi: qiMatch ? Number(qiMatch[1]) : 0,
      edge: edgeMatch ? Number(edgeMatch[1]) : 0,
      burn: burnMatch ? Number(burnMatch[1]) : 0,
      poison: poisonMatch ? Number(poisonMatch[1]) : 0,
      weak: weakMatch ? Number(weakMatch[1]) : 0,
      draw: drawMatch ? Number(drawMatch[1]) : 0,
      selfDamage: selfMatch ? Number(selfMatch[1]) : 0,
      ignoreShield: false,
      exhaust: /消耗|移出本场/.test(text),
      note: [],
      returnDiscard: 0,
      returnLast: false,
      copyFirst: false,
      discardOther: 0,
      removeCurse: Number(text.match(/净除\s*(\d+)\s*张心魔/)?.[1] || 0),
      recycleAlchemy: 0,
      discoverInstruction: 0,
      recallBeast: false,
      spellDrawQi: 0,
    };
    const base = card.baseName || card.name.replace("·真解", "");
    const refined = card.refined;

    if (origin === "sword") {
      if (base === "青竹剑诀" && playedThisTurnRef.current.some((item) => item.type === "攻击")) r.edge += 1;
      if (base === "藏锋诀") {
        if (refined) r.edge += 1;
        setJobState((value) => ({ ...value, attackBonus: value.attackBonus + 2 }));
      }
      if (base === "回风剑" && hand.length <= 3) r.draw += 1;
      if (base === "锋芒护身" && edge >= 4) r.shield += 4;
      if (base === "小五行剑阵" && edge >= 2) {
        r.damage += 6;
        r.edge -= 2;
      }
      if (base === "逐月连斩") r.damage += edge * 3;
      if (base === "裂魂剑" && enemyWeak > 0) r.edge += 2;
      if (base === "引劫剑" && edge >= 5) r.exhaust = false;
      if (base === "玉月成璧" && moonPhase === "frost") {
        r.draw += 1;
        r.note.push("霜月护体 · 额外抽牌");
      }
      if (base === "万剑归岚") {
        r.damage = edge * (refined ? 8 : 6);
        if (edge >= 4) r.qi += 1;
        r.edge = -edge;
      }
      if (card.type === "攻击" && jobState.attackBonus > 0) {
        r.damage += jobState.attackBonus;
        setJobState((value) => ({ ...value, attackBonus: 0 }));
      }
    }

    if (origin === "talisman") {
      if (base === "火弹符" && enemyWeak > 0) r.damage += 4;
      if (base === "镇魂符" && playerWeak > 0) r.draw += 1;
      if (base === "缚影法印") {
        const seals = sealMatch ? Number(sealMatch[1]) : refined ? 3 : 2;
        setJobState((value) => ({ ...value, seals: Math.min(12, value.seals + seals) }));
        r.note.push(`附着 ${seals} 枚符印`);
      }
      if (base === "赤篆连书") {
        setJobState((value) => ({ ...value, talismanDiscount: 1 }));
        r.spellDrawQi = 1;
      }
      if (base === "阴火符" && jobState.seals > 0) {
        r.damage += (enemyBurn + r.burn) * jobState.burnMultiplier;
        setJobState((value) => ({ ...value, seals: value.seals - 1 }));
      }
      if (base === "玄雷敕令") {
        r.damage = jobState.seals * (refined ? 8 : 6);
        if (jobState.seals >= 3) r.draw += 2;
        r.note.push(`引爆 ${jobState.seals} 枚符印`);
        setJobState((value) => ({ ...value, seals: 0 }));
      }
      if (base === "净坛真言" && countCurses({ hand, drawPile, discardPile }) === 0) r.qi += 2;
      if (base === "雷火连符") r.damage += ((jobState.symbolCardsPlayed + 1) * (refined ? 7 : 5));
      if (base === "借风燃纸") {
        setJobState((value) => ({ ...value, burnMultiplier: 2 }));
        if (enemyBurn >= 5) r.shield += 8;
        if (refined) r.draw += 1;
      }
      if (base === "万符归一") {
        r.damage += jobState.seals * 6 + enemyBurn * jobState.burnMultiplier;
        r.note.push(`符印与燃烧一并结算`);
        setJobState((value) => ({ ...value, seals: 0 }));
      }
      if (card.type === "术法") setJobState((value) => ({ ...value, symbolCardsPlayed: value.symbolCardsPlayed + 1, talismanDiscount: 0 }));
    }

    if (origin === "alchemy") {
      if (base === "回春散") {
        r.heal += hp < maxHp / 2 ? 3 : 0;
        setJobState((value) => ({ ...value, heat: Math.min(8, value.heat + 1) }));
      }
      if (base === "寒髓药引") {
        setJobState((value) => ({ ...value, cold: Math.min(8, value.cold + (refined ? 2 : 1)), alchemyDiscount: 1 }));
      }
      if (base === "赤芝养气丹" && jobState.heat > 0) r.exhaust = false;
      if (base === "药炉温养") {
        if (jobState.cold > 0 && jobState.heat > 0) {
          r.shield += 6;
          setJobState((value) => ({ ...value, cold: value.cold - 1, heat: value.heat - 1 }));
        } else {
          r.draw = 0;
        }
      }
      if (base === "百草相生") {
        r.recycleAlchemy = 2;
        r.qi += Math.min(2, discardPile.filter((item) => item.job === "alchemy").length);
      }
      if (base === "腐脉毒雾" && enemyPoison > 0) r.damage += 3;
      if (base === "玉液护心" && playerWeak > 0) setJobState((value) => ({ ...value, heat: Math.min(8, value.heat + 1) }));
      if (base === "逆炼血丹") r.damage += jobState.heat * 3;
      if (base === "阴阳大还丹") {
        r.note.push(`调和 ${jobState.cold} 寒 / ${jobState.heat} 热`);
        setJobState((value) => ({ ...value, cold: 0, heat: 0, alchemyDiscount: 0 }));
      } else if (["法门", "术法"].includes(card.type)) {
        setJobState((value) => ({ ...value, alchemyDiscount: 0 }));
      }
    }

    if (origin === "beast") {
      const beast = ["玄狼", "白鹿", "青鸾", "灵狐", "石猿"].find((name) => base.includes(name));
      if (beast) setJobState((value) => ({ ...value, activeBeast: beast, contracts: [...new Set([...value.contracts, beast])] }));
      if (base === "玄狼奔袭") {
        r.damage = refined ? 12 : 8;
        if (jobState.lastWasInstruction) r.damage += 3;
      }
      if (base === "白鹿守望") setJobState((value) => ({ ...value, whiteDeerGuard: true }));
      if (base === "青鸾回风") setJobState((value) => ({ ...value, beastDiscount: 1 }));
      if (base === "灵狐探路") {
        r.discoverInstruction = refined ? 2 : 1;
        r.note.push(`发现 ${r.discoverInstruction} 张指令牌`);
      }
      if (base === "石猿撼地" && shield > 0) r.damage += 6;
      if (base === "百兽同途") {
        r.damage = Math.max(1, jobState.contracts.length) * (refined ? 6 : 4);
        if (jobState.contracts.length >= 3) r.draw += 2;
      }
      if (base === "山君号令") {
        const actions = { 玄狼: 24, 石猿: 28, 白鹿: 0, 青鸾: 0, 灵狐: 0 };
        r.damage += actions[jobState.activeBeast] || 0;
        if (jobState.activeBeast === "白鹿") r.shield += 16;
        if (["青鸾", "灵狐"].includes(jobState.activeBeast)) r.draw += 2;
      }
      if (base === "归巢") {
        r.recallBeast = true;
        r.note.push("当前灵兽归巢，已建立契约保留");
      }
      if (base === "血月兽潮") {
        if (moonPhase === "blood") {
          r.damage += hits * 2;
          r.note.push(`血月强化 ${hits} 段攻击`);
        } else {
          r.note.push("当前为霜月，未触发血月额外伤害");
        }
      }
      if (base === "山海盟誓") {
        const contracts = jobState.contracts.length ? jobState.contracts : [jobState.activeBeast];
        r.damage += contracts.reduce((sum, name) => sum + ({ 玄狼: refined ? 10 : 8, 石猿: refined ? 16 : 14 }[name] || 0), 0);
        r.shield += contracts.length * (refined ? 5 : 3) + (contracts.includes("白鹿") ? (refined ? 10 : 8) : 0);
        r.draw += contracts.filter((name) => ["青鸾", "灵狐"].includes(name)).length;
      }
      const instruction = ["指令", "协同"].includes(card.keyword);
      setJobState((value) => ({ ...value, lastWasInstruction: instruction, beastDiscount: instruction ? 0 : value.beastDiscount }));
    }

    if (origin === "artificer") {
      const devices = normalizeDevices(jobState);
      if (base === "铜雀飞梭") {
        setJobState((value) => ({
          ...addDevices(value, [{ type: "copper", power: 2 }]),
          cunning: Math.min(10, value.cunning + 1),
        }));
        r.note.push("部署铜雀 · 每回合首次抽牌造成 2 点伤害");
      }
      if (base === "雷枢阵列") {
        r.damage = 0;
        setJobState((value) => ({
          ...addDevices(value, [{ type: "thunder", power: refined ? 10 : 6 }]),
          cunning: Math.min(10, value.cunning + 1),
        }));
        r.note.push(`部署雷枢 · 回合结束造成 ${refined ? 10 : 6}+机巧增幅伤害`);
      }
      if (base === "玄甲机括") {
        if (devices.length > 0) r.shield += 3;
        setJobState((value) => ({ ...value, cunning: Math.min(10, value.cunning + (refined ? 2 : 1)) }));
      }
      if (base === "墨轮复位" && devices.length > 0) {
        const target = devices.find((device) => device.type === "thunder") || devices[0];
        r.damage += deviceDamage(target, jobState.cunning);
        r.note.push(`复位${target.type === "thunder" ? "雷枢" : "铜雀"}`);
        setJobState((value) => ({ ...value, cunning: Math.min(10, value.cunning + 1) }));
      }
      if (base === "千机连弩") r.damage += devices.length * (refined ? 6 : 4);
      if (base === "拆解回收" && devices.length > 0) {
        setJobState((value) => removeDevice(value).state);
        r.note.push(`拆解${devices[0].type === "thunder" ? "雷枢" : "铜雀"}`);
      }
      if (base === "偃师护心镜") setJobState((value) => ({ ...value, mirrorDamage: (refined ? 14 : 10) + (value.cunning > 0 ? 5 : 0) }));
      if (base === "飞梭穿云") {
        r.ignoreShield = true;
        if (enemyShieldRef.current > 0) r.draw += 1;
      }
      if (base === "机关城垒") {
        const additions = [0, 1].map((index) => seededRandom(runSeed, `fortress:${selectedChapter}:${stage}:${combatTurn}:${index}`) < 0.5
          ? { type: "copper", power: 2 }
          : { type: "thunder", power: 6 });
        setJobState((value) => ({
          ...addDevices(value, additions),
          cunning: Math.min(10, value.cunning + 2),
        }));
        r.note.push(`部署${additions.map((device) => device.type === "thunder" ? "雷枢" : "铜雀").join("与")}`);
      }
      if (base === "天工开物") {
        const triggers = refined ? 2 : 1;
        r.damage += triggerDevices(devices, jobState.cunning, triggers);
        r.shield += devices.length * triggers;
        setJobState((value) => ({
          ...withDevices(value, upgradeDevices(normalizeDevices(value))),
          cunning: Math.min(10, value.cunning + normalizeDevices(value).length),
        }));
        r.note.push(`${devices.length} 个机关触发 ${triggers} 次并完成升级`);
      }
    }

    if (origin === "soul") {
      if (["引魂契", "幽灯守魄"].includes(base)) setJobState((value) => ({ ...value, lamps: Math.min(8, value.lamps + 1) }));
      if (base === "幽灯守魄" && hp < maxHp / 2) r.shield += 5;
      if (base === "彼岸回响") r.returnLast = true;
      if (base === "无常索命") r.discardOther = 1;
      if (base === "渡厄咒") r.heal += jobState.lamps * 2;
      if (base === "借命灯" && jobState.lamps > 0) r.selfDamage = 0;
      if (base === "黄泉引路") r.returnDiscard = 2;
      if (base === "魂火焚身") {
        r.damage = jobState.lamps * (refined ? 9 : 7);
        if (jobState.lamps >= 3) r.heal += 8;
        setJobState((value) => ({ ...value, lamps: 0 }));
      }
      if (base === "忘川照影") r.copyFirst = true;
      if (base === "百鬼夜行") r.damage = new Set(discardPile.map((item) => item.baseName || item.name)).size * (refined ? 5 : 3);
    }

    return r;
  }

  function playCard(index) {
    const card = hand[index];
    const cost = card ? effectiveCardCost(card) : 0;
    if (!card || !cardRequirementMet(card) || qi < cost || enemy.hp <= 0 || combatBusy) return;
    const synergy = cardSynergyState(card);
    const resolution = resolveCardMechanics(card);
    let damage = resolution.damage;
    if (damage > 0 && playerWeak > 0) damage = Math.max(0, damage - playerWeak * 2);
    if (card.type === "攻击" && !firstAttackUsed.current) {
      damage += treasureValue(treasures, "firstAttackDamage");
      firstAttackUsed.current = true;
    }
    const firstSkillBonus = card.type === "法门" && !firstSkillUsed.current
      ? treasureValue(treasures, "firstSkillDraw")
      : 0;
    if (card.type === "法门") firstSkillUsed.current = true;
    if (origin === "sword" && edge >= 3 && card.type === "攻击") damage += 3;
    const kind = damage > 0 ? (/燃|火/.test(card.name) ? "fire" : "attack") : resolution.shield > 0 ? "guard" : resolution.heal > 0 ? "heal" : "spirit";
    const remainingHand = hand.filter((_, cardIndex) => cardIndex !== index);
    const curseDiscardIndex = remainingHand.findIndex((item) => item.type === "心魔");
    const otherDiscardIndex = resolution.discardOther && remainingHand.length
      ? (curseDiscardIndex >= 0 ? curseDiscardIndex : remainingHand.length - 1)
      : -1;
    const otherDiscarded = otherDiscardIndex >= 0 ? remainingHand[otherDiscardIndex] : null;
    const handAfterDiscard = otherDiscarded ? remainingHand.filter((_, handIndex) => handIndex !== otherDiscardIndex) : remainingHand;
    const purged = resolution.removeCurse
      ? purgeCurses({ hand: handAfterDiscard, discardPile, drawPile }, resolution.removeCurse)
      : { hand: handAfterDiscard, discardPile, drawPile, removed: [] };
    const instructionDiscovery = resolution.discoverInstruction
      ? discoverInstructions(purged.drawPile, resolution.discoverInstruction, 7 - purged.hand.length)
      : { discovered: [], remaining: purged.drawPile };
    if ((card.baseName || card.name) === "无常索命" && otherDiscarded?.type === "心魔") damage += 10;
    setCombatBusy(true);
    setRunStats((value) => ({ ...value, cardsPlayed: value.cardsPlayed + 1 }));
    feedback("cast");
    setQi((value) => value - cost);
    setHand([...purged.hand, ...instructionDiscovery.discovered]);
    if (purged.removed.length || instructionDiscovery.discovered.length) {
      setDiscardPile(purged.discardPile);
      setDrawPile(instructionDiscovery.remaining);
    }
    const effectBursts = [
      damage > 0 ? { kind, label: `−${damage}`, detail: resolution.ignoreShield ? "穿透" : "命中" } : null,
      resolution.shield > 0 ? { kind: "guard", label: `+${resolution.shield}`, detail: "护盾" } : null,
      resolution.heal > 0 ? { kind: "heal", label: `+${resolution.heal}`, detail: "生命" } : null,
      resolution.draw + firstSkillBonus > 0 ? { kind: "draw", label: `+${resolution.draw + firstSkillBonus}`, detail: "抽牌" } : null,
      resolution.qi > 0 ? { kind: "spirit", label: `+${resolution.qi}`, detail: "灵气" } : null,
      resolution.edge > 0 ? { kind: "spirit", label: `+${resolution.edge}`, detail: "剑势" } : null,
      resolution.burn > 0 ? { kind: "fire", label: `+${resolution.burn}`, detail: "燃烧" } : null,
      resolution.poison > 0 ? { kind: "poison", label: `+${resolution.poison}`, detail: "丹毒" } : null,
      resolution.weak > 0 ? { kind: "weak", label: `+${resolution.weak}`, detail: "虚弱" } : null,
      purged.removed.length > 0 ? { kind: "cleanse", label: `−${purged.removed.length}`, detail: "心魔" } : null,
      instructionDiscovery.discovered.length > 0 ? { kind: "draw", label: `+${instructionDiscovery.discovered.length}`, detail: "发现" } : null,
    ].filter(Boolean);
    setCombatFx({ card, index, kind, damage, shieldGain: resolution.shield, heal: resolution.heal, qiGain: resolution.qi, effectBursts, phase: "cast" });
    setLog(`${card.name} · 引诀`);
    later(() => setCombatFx((value) => value ? { ...value, phase: "impact" } : value), 360);
    later(() => {
      const triggered = [
        damage > 0 ? `伤害 ${damage}` : "",
        resolution.shield > 0 ? `护盾 ${resolution.shield}` : "",
        resolution.heal > 0 ? `恢复 ${resolution.heal}` : "",
        resolution.draw + firstSkillBonus > 0 ? `抽牌 ${resolution.draw + firstSkillBonus}` : "",
        resolution.qi > 0 ? `灵气 +${resolution.qi}` : "",
        resolution.edge > 0 ? `剑势 +${resolution.edge}` : "",
        resolution.burn > 0 ? `燃烧 +${resolution.burn}` : "",
        resolution.poison > 0 ? `丹毒 +${resolution.poison}` : "",
        resolution.weak > 0 ? `虚弱 +${resolution.weak}` : "",
        purged.removed.length > 0 ? `净除 ${purged.removed.length} 张心魔` : "",
        instructionDiscovery.discovered.length > 0 ? `发现 ${instructionDiscovery.discovered.map((item) => item.name).join(" / ")}` : "",
        ...resolution.note,
      ].filter(Boolean);
      setTriggerFx({ card: card.name, combo: synergy.conditional && synergy.active ? synergy.reason : "", effects: triggered });
      later(() => setTriggerFx(null), 1450);
      if (resolution.shield) setShield((value) => value + resolution.shield);
      if (resolution.heal) setHp((value) => Math.min(maxHp, value + resolution.heal));
      if (resolution.qi) setQi((value) => Math.min(maxQi + 3, value + resolution.qi));
      if (resolution.edge) setEdge((value) => Math.max(0, value + resolution.edge));
      if (resolution.burn) setEnemyBurn((value) => value + resolution.burn);
      if (resolution.poison) setEnemyPoison((value) => value + resolution.poison);
      if (resolution.weak) setEnemyWeak((value) => value + resolution.weak);
      if (resolution.selfDamage) setHp((value) => Math.max(0, value - resolution.selfDamage));
      const cleanseMatch = card.text.match(/驱散\s*(\d+)\s*层虚弱/);
      if (cleanseMatch) setPlayerWeak((value) => Math.max(0, value - Number(cleanseMatch[1])));
      if (purged.removed.length) {
        const removedIds = new Set(purged.removed.map((item) => item.id));
        setRunDeck((value) => value.filter((item) => !removedIds.has(item.id)));
      }
      if (instructionDiscovery.discovered.some((item) => effectiveCardCost(item) === 0)) {
        setShield((value) => value + 4);
      }
      if (resolution.recallBeast) setJobState((value) => recallBeastState(value));
      if (resolution.draw + firstSkillBonus) {
        drawCardsIntoHand(
          resolution.draw + firstSkillBonus,
          firstSkillBonus ? `${card.name} · 青竹残简` : card.name,
          { spellDrawQi: resolution.spellDrawQi },
        );
      }
      if (resolution.returnLast && lastPlayedCardRef.current) {
        const echoed = { ...lastPlayedCardRef.current, id: `${lastPlayedCardRef.current.id}-echo-${Date.now()}` };
        if (echoed.type === "术法") echoed.cost = 0;
        setHand((value) => value.length < 7 ? [...value, echoed] : value);
      }
      if (resolution.copyFirst && playedThisTurnRef.current[0]) {
        const copied = { ...playedThisTurnRef.current[0], id: `${playedThisTurnRef.current[0].id}-copy-${Date.now()}` };
        if (!card.refined) copied.text = `${copied.text} 消耗。`;
        setHand((value) => value.length < 7 ? [...value, copied] : value);
      }
      if (resolution.returnDiscard > 0) {
        const returnCapacity = Math.max(0, 7 - handAfterDiscard.length);
        const returned = discardPile.slice(-Math.min(resolution.returnDiscard, returnCapacity));
        setDiscardPile((value) => value.slice(0, Math.max(0, value.length - returned.length)));
        setHand((value) => [...value, ...returned]);
        const spellCount = returned.filter((item) => item.type === "术法").length;
        if (spellCount) setJobState((value) => ({ ...value, lamps: Math.min(8, value.lamps + spellCount) }));
      }
      if (resolution.recycleAlchemy > 0) {
        const recycled = discardPile.filter((item) => item.job === "alchemy").slice(-resolution.recycleAlchemy);
        if (recycled.length) {
          setDiscardPile((value) => value.filter((item) => !recycled.includes(item)));
          setDrawPile((value) => [...recycled, ...value]);
        }
      }
      if (damage > 0) {
        feedback("impact");
        damageEnemy(damage, `${card.name}命中`, resolution.ignoreShield);
        setLog(`${card.name}命中，预计造成 ${damage} 点伤害。${resolution.note.join("；")}`);
      } else {
        feedback(resolution.shield ? "guard" : resolution.heal ? "heal" : "tap");
        const effect = resolution.shield
          ? `获得 ${resolution.shield} 点护盾`
          : resolution.heal
            ? `恢复 ${resolution.heal} 点生命`
            : resolution.burn
              ? `施加 ${resolution.burn} 层燃烧`
              : resolution.poison
                ? `施加 ${resolution.poison} 层丹毒`
                : resolution.weak
                  ? `施加 ${resolution.weak} 层虚弱`
                : /丹毒/.test(card.text)
                  ? card.text.replace(/。$/, "")
                  : resolution.qi
                    ? `获得 ${resolution.qi} 点灵气`
                    : `术法运转`;
        setLog(`${card.name}生效，${effect}。${resolution.note.join("；")}`);
      }
    }, 470);
    later(() => setCombatFx((value) => value ? { ...value, phase: "fade" } : value), 880);
    later(() => {
      if (resolution.exhaust) setExhaustPile((value) => [...value, card]);
      else setDiscardPile((value) => [...value, card]);
      if (otherDiscarded) setDiscardPile((value) => [...value, otherDiscarded]);
      playedThisTurnRef.current = [...playedThisTurnRef.current, card];
      lastPlayedCardRef.current = card;
      setCombatFx(null);
      setCombatBusy(false);
    }, 1120);
  }

  function drawCardsIntoHand(amount, source, options = {}) {
    const copperDevices = normalizeDevices(jobState).filter((device) => device.type === "copper");
    const canDraw = hand.length < 7 && drawPile.length + discardPile.length > 0;
    if (origin === "artificer" && copperDevices.length && !jobState.copperTriggered && amount > 0 && canDraw) {
      const copperDamage = triggerDevices(copperDevices, jobState.cunning);
      damageEnemy(copperDamage, `${source}唤醒铜雀`);
      setJobState((value) => ({ ...value, copperTriggered: true }));
    }
    setHand((currentHand) => {
      let pool = [...drawPile];
      let recycled = [...discardPile];
      if (pool.length < amount && recycled.length) {
        pool = [...pool, ...shuffle(recycled)];
        recycled = [];
      }
      const count = Math.min(amount, 7 - currentHand.length, pool.length);
      const drawn = pool.slice(0, count);
      setDrawPile(pool.slice(count));
      setDiscardPile(recycled);
      if (options.spellDrawQi && drawn.some((card) => card.type === "术法")) {
        setQi((value) => Math.min(maxQi + 3, value + options.spellDrawQi));
        setTriggerFx((value) => value
          ? { ...value, effects: [...value.effects, `实际抽到术法 · 灵气 +${options.spellDrawQi}`] }
          : value);
      }
      if (drawn.length) {
        feedback("draw");
        setDrawFx({ cards: drawn, source: `${source} · 抽牌`, nonce: Date.now() });
        later(() => setDrawFx(null), 1050);
      }
      return [...currentHand, ...drawn];
    });
  }

  function endTurn() {
    if (enemy.hp <= 0 || combatBusy) return;
    const currentMove = enemy.moves?.[enemy.moveIndex || 0] || { name: enemy.intent, damage: Number(enemy.intent.match(/\d+/)?.[0]) || 7 };
    const hitCount = currentMove.hits || 1;
    const perHit = Math.max(0, (currentMove.damage || 0) - enemyWeak * 2);
    let remainingShield = shield;
    let lost = 0;
    for (let hit = 0; hit < hitCount; hit += 1) {
      const blocked = Math.min(remainingShield, perHit);
      remainingShield -= blocked;
      lost += perHit - blocked;
    }
    const incoming = perHit * hitCount;
    setCombatBusy(true);
    setRunStats((value) => ({ ...value, turns: value.turns + 1 }));
    feedback("enemy");
    setCombatFx({ phase: "enemy-turn", kind: "enemy", damage: lost });
    setTurnFlowFx({ phase: "enemy", title: "破 · 敌方行动", detail: currentMove.name, nonce: Date.now() });
    setLog(`敌人正在发动「${currentMove.name}」……`);
    later(() => {
      setCombatFx({ phase: "enemy-impact", kind: "enemy", damage: lost });
      setTurnFlowFx({ phase: "impact", title: lost > 0 ? "急 · 受击结算" : "急 · 护体抵消", detail: lost > 0 ? `承受 ${lost} 点伤害` : "护盾挡下本轮伤害", nonce: Date.now() });
      setPlayerFx({ kind: lost > 0 ? "hurt" : "blocked", damage: lost });
      if (lost > 0) feedback("hurt");
      else feedback("guard");
      setHp((value) => Math.max(0, value - lost));
      if (lost > 0) setRunStats((value) => ({ ...value, damageTaken: value.damageTaken + lost }));
      setShield(0);
      if (lost > 0 && jobState.whiteDeerGuard) {
        setHp((value) => Math.min(maxHp, value + 3));
        setJobState((value) => ({ ...value, whiteDeerGuard: false }));
      }
      if (shield > 0 && incoming >= shield && jobState.mirrorDamage > 0) {
        damageEnemy(jobState.mirrorDamage, "护心镜碎裂反击");
        setJobState((value) => ({ ...value, mirrorDamage: 0 }));
      }
      if (currentMove.shield) setEnemyShield((value) => {
        const next = value + currentMove.shield;
        enemyShieldRef.current = next;
        return next;
      });
      if (currentMove.heal) setEnemy((value) => ({ ...value, hp: Math.min(value.max, value.hp + currentMove.heal) }));
      if (currentMove.shield && enemyPoison > 0) damageEnemy(2, "蚀骨丹阻断护体");
      setPlayerWeak((value) => Math.max(0, value - 1) + (currentMove.weak || 0));
      if (enemyWeak > 0) setEnemyWeak((value) => Math.max(0, value - 1));
      const extra = [
        currentMove.shield ? `敌人获得 ${currentMove.shield} 点护体` : "",
        currentMove.heal ? `敌人恢复 ${currentMove.heal} 点生命` : "",
        currentMove.weak ? `你受到 ${currentMove.weak} 层虚弱` : "",
        currentMove.drainQi ? `你下一回合灵气 -${currentMove.drainQi}` : "",
        currentMove.drawPenalty ? `你下一回合少抽 ${currentMove.drawPenalty} 张牌` : "",
        currentMove.curse ? "一张「命册缺页」被写入弃牌堆" : "",
      ].filter(Boolean).join("，");
      setLog(`敌人发动「${currentMove.name}」。护盾抵去 ${Math.min(shield, incoming)}，你受到 ${lost} 点伤害${extra ? `；${extra}` : ""}。`);
    }, 560);
    later(() => {
      setTurnFlowFx({ phase: "discard", title: "序 · 手牌入弃", detail: `${hand.length} 张余牌进入弃牌堆`, nonce: Date.now() });
    }, 1040);
    later(() => {
      const nextHandSize = Math.max(3, 5 - (currentMove.drawPenalty || 0));
      const burnTick = enemyBurn > 0 ? (enemyBurn + treasureValue(treasures, "burnDamage")) * jobState.burnMultiplier : 0;
      if (burnTick > 0) {
        damageEnemy(burnTick, "燃烧吞没了敌影");
        setEnemyBurn((value) => Math.max(0, value - 1));
      }
      if (enemyPoison > 0) {
        damageEnemy(enemyPoison, "丹毒侵蚀了敌影");
        setEnemyPoison((value) => Math.max(0, value - 1));
      }
      if (origin === "talisman" && jobState.seals > 0) {
        damageEnemy(jobState.seals * 2, "符印随敌人行动震荡");
      }
      if (origin === "artificer") {
        const devices = normalizeDevices(jobState);
        const thunderDevices = devices.filter((device) => device.type === "thunder");
        if (thunderDevices.length) damageEnemy(triggerDevices(thunderDevices, jobState.cunning), "雷枢阵列齐射");
        const copperDevices = devices.filter((device) => device.type === "copper");
        if (copperDevices.length && nextHandSize > 0) damageEnemy(triggerDevices(copperDevices, jobState.cunning), "新回合抽牌唤醒铜雀");
      }
      const turnDiscard = [...discardPile, ...hand, ...(currentMove.curse ? [{ ...FATE_CURSE, id: `${FATE_CURSE.id}-${Date.now()}` }] : [])];
      const carry = [...drawPile];
      const reshuffled = shuffle(turnDiscard, `reshuffle:${selectedChapter}:${stage}:${combatTurn}`);
      const hasEnoughDraw = carry.length >= nextHandSize;
      const source = hasEnoughDraw ? carry : [...carry, ...reshuffled];
      const nextHand = source.slice(0, nextHandSize);
      const flowDetail = hasEnoughDraw
        ? `抽取 ${nextHand.length} 张，抽牌堆余 ${Math.max(0, carry.length - nextHand.length)}`
        : `弃牌堆洗回，抽取 ${nextHand.length} 张`;
      setHand(nextHand);
      setDrawPile(source.slice(nextHandSize));
      setDiscardPile(hasEnoughDraw ? turnDiscard : []);
      setCombatTurn((value) => value + 1);
      playedThisTurnRef.current = [];
      setJobState((value) => ({
        ...value,
        attackBonus: 0,
        burnMultiplier: 1,
        symbolCardsPlayed: 0,
        lastWasInstruction: false,
        whiteDeerGuard: false,
        copperTriggered: normalizeDevices(value).some((device) => device.type === "copper"),
      }));
      setEnemy((value) => {
        const nextIndex = ((value.moveIndex || 0) + 1) % (value.moves?.length || 1);
        return { ...value, moveIndex: nextIndex, intent: intentLabel(value.moves[nextIndex]) };
      });
      setQi(Math.max(0, maxQi - (currentMove.drainQi || 0)));
      setDrawFx({ cards: nextHand, source: hasEnoughDraw ? "抽牌" : "洗牌后抽取", nonce: Date.now() });
      setTurnFlowFx({ phase: "draw", title: hasEnoughDraw ? "序 · 抽取新手牌" : "序 · 洗牌后抽取", detail: flowDetail, nonce: Date.now() });
      feedback("draw");
      setCombatFx(null);
      setPlayerFx(null);
      setCombatBusy(false);
      later(() => setDrawFx(null), 1250);
      later(() => setTurnFlowFx(null), 1400);
    }, 1280);
  }

  function claimReward(card, treasure = null) {
    if (rewardClaimedRef.current) return;
    rewardClaimedRef.current = true;
    const archiveResult = stage >= 3 ? mergeInvestigationArchive(profile, selectedChapter, runClues) : null;
    const dailyFirstClear = stage >= 3
      && runMode === "daily"
      && runTrial
      && !(profile.completedDailyTrials || []).includes(runTrial.dateKey);
    const dailyBonus = dailyFirstClear ? DAILY_TRIAL_REWARD : { jade: 0, spirit: 0, xp: 0 };
    const tribulationStatus = stage >= 3 && runMode === "story" && runTribulation?.level
      ? tribulationRewardStatus(profile, selectedChapter, runTribulation.level)
      : { claimable: false, reward: { jade: 0, spirit: 0, xp: 0 } };
    const tribulationBonus = tribulationStatus.claimable ? tribulationStatus.reward : { jade: 0, spirit: 0, xp: 0 };
    feedback("reward");
    setRunStats((value) => ({
      ...value,
      rewardsTaken: value.rewardsTaken + 1,
      xpGained: value.xpGained + 90 + dailyBonus.xp + tribulationBonus.xp,
      spiritGained: value.spiritGained + 4 + dailyBonus.spirit + tribulationBonus.spirit + (archiveResult?.newlyCompleted ? INVESTIGATION_COMPLETION_REWARD.spirit : 0),
      jadeGained: value.jadeGained + (stage >= 3 ? 120 : 0) + dailyBonus.jade + tribulationBonus.jade + (archiveResult?.newlyCompleted ? INVESTIGATION_COMPLETION_REWARD.jade : 0),
    }));
    if (card) setRunDeck((value) => [...value, card]);
    if (treasure) {
      setTreasures((value) => [...value, treasure]);
      if (treasure.maxQi) setMaxQi((value) => Math.min(5, value + treasure.maxQi));
    }
    setStones((value) => value + 8);
    setProfile((value) => {
      const gained = addProfileXp(value, 90);
      return {
        ...gained,
        spirit: gained.spirit + 4,
        jobMastery: { ...gained.jobMastery, [origin]: (gained.jobMastery[origin] || 0) + (card || treasure ? 5 : 2) },
        discoveredTreasures: treasure ? [...new Set([...(gained.discoveredTreasures || []), treasure.id])] : gained.discoveredTreasures,
      };
    });
    if (stage >= 3) {
      const endingId = selectedChapter === 5
        ? (runChoices.includes("重写命册") ? "rewrite_fate" : "restore_fate")
        : `chapter_${selectedChapter}_ending`;
      const epilogue = resolveChapterEpilogue(selectedChapter, runChoices);
      const evaluation = evaluateRun({ ...runStats, combatsWon: Math.max(runStats.combatsWon, 3) }, hp, maxHp);
      setProfile((value) => {
        const archived = mergeInvestigationArchive(value, selectedChapter, runClues).profile;
        const runRecord = {
          id: `${Date.now()}-${selectedChapter}`,
          chapter: selectedChapter,
          job: origin,
          mode: runMode,
          seed: runSeed,
          trialName: runTrial?.modifier?.name || "",
          modifierId: runTrial?.modifier?.id || "none",
          tribulationLevel: runTribulation?.level || 0,
          tribulationName: runTribulation?.name || "",
          grade: evaluation.grade,
          score: evaluation.score,
          deckSize: runDeck.length + (card ? 1 : 0),
          treasures: treasures.length + (treasure ? 1 : 0),
          clues: runClues.length,
          ending: endingId,
          epilogue: epilogue?.id || "",
        };
        let completedProfile = {
          ...archived,
          chapter: Math.max(Math.min(CHAPTERS.length, selectedChapter + 1), value.chapter),
          jade: archived.jade + 120,
          unlockedEndings: [...new Set([...(value.unlockedEndings || []), endingId])],
          unlockedEpilogues: epilogue
            ? [...new Set([...(value.unlockedEpilogues || []), epilogue.id])]
            : (value.unlockedEpilogues || []),
          chapterFailures: { ...(archived.chapterFailures || {}), [selectedChapter]: 0 },
          recentRuns: [runRecord, ...(archived.recentRuns || [])].slice(0, 6),
        };
        if (dailyFirstClear) completedProfile = settleDailyTrial(completedProfile, runTrial).profile;
        if (tribulationStatus.claimable) completedProfile = settleTribulationClear(completedProfile, selectedChapter, runTribulation.level).profile;
        return completedProfile;
      });
      changeScreen("summary");
    }
    else {
      setStage((value) => value + 1);
      setRouteProgress((value) => value + 1);
      changeScreen("map");
    }
  }

  function skipReward() {
    if (stage < 3) setHp((value) => Math.min(maxHp, value + 10));
    claimReward(null);
  }

  return (
    <main
      className={`app screen-${screen} device-${deviceMode} transition-${transition}`}
      data-device={deviceMode}
      data-layout={deviceMode === "desktop" ? "wide-desktop" : "compact-mobile"}
      data-motion={profile.feedback?.reducedMotion ? "reduced" : "full"}
      data-readability={profile.feedback?.readableText ? "large" : "standard"}
      onScroll={(event) => {
        if (screen === "combat" && event.currentTarget.scrollTop !== 0) {
          event.currentTarget.scrollTop = 0;
        }
      }}
    >
      <Atmosphere />
      <div className="screen-curtain" />
      <div className="device-mode-badge" aria-hidden="true">
        {deviceMode === "desktop" ? "PC 版 · 横屏战局" : "移动版 · 单手游玩"}
      </div>
      {deviceMode === "desktop" && ["home", "chapters", "classes", "growth", "collection", "daily", "challenge"].includes(screen) && (
        <DesktopModePanel
          screen={screen}
          profile={profile}
          chapter={selectedChapter}
          stage={stage}
          routeProgress={routeProgress}
          hp={hp}
          maxHp={maxHp}
          stones={stones}
          deck={runDeck}
          origin={selectedOrigin}
        />
      )}
      {progressNotice && <div className="progress-reward-toast" role="status">
        <small>挑战卷已落印</small>
        <strong>{progressNotice.title}</strong>
        <p>{progressNotice.reward}</p>
        {progressNotice.epithet && <b>新称号 · {progressNotice.epithet}</b>}
        <em>下一枚印记：{progressNotice.next}</em>
      </div>}
      {screen === "home" && (
        <HomeScreen
          profile={profile}
          setScreen={setScreen}
          setOverlay={setOverlay}
          beginRun={() => changeScreen("classes")}
          savedRun={savedRun}
          resumeRun={resumeRun}
          claimProgressReward={claimChallengeReward}
          dailyTrial={todaysTrial}
        />
      )}
      {screen === "daily" && (
        <DailyTrialScreen
          trial={todaysTrial}
          profile={profile}
          savedRun={savedRun}
          onBack={() => changeScreen("home")}
          onResume={resumeRun}
          onStart={() => beginRun(todaysTrial.chapter, {
            mode: "daily",
            trial: todaysTrial,
            origin: todaysTrial.origin,
            seed: todaysTrial.seed,
          })}
        />
      )}
      {screen === "challenge" && (
        <ChallengeCodeScreen
          profile={profile}
          savedRun={savedRun}
          onBack={() => changeScreen("home")}
          onCopy={copyChallengeCode}
          onStart={(challenge) => beginRun(challenge.chapter, {
            mode: "challenge",
            trial: challenge.trial,
            origin: challenge.origin,
            seed: challenge.seed,
          })}
        />
      )}
      {screen === "chapters" && (
        <ChapterScreen
          profile={profile}
          onBack={() => changeScreen("classes")}
          onChoose={(chapterId, tribulationLevel = 0) => {
            beginRun(chapterId, { tribulationLevel });
          }}
        />
      )}
      {screen === "classes" && (
        <ClassScreen
          origin={origin}
          setOrigin={setOrigin}
          profile={profile}
          onBack={() => changeScreen("home")}
          onStart={() => changeScreen("chapters")}
        />
      )}
      {screen === "story" && (
        <StoryScreen
          scene={CHAPTER_STORIES[selectedChapter][storyIndex]}
          index={storyIndex}
          total={CHAPTER_STORIES[selectedChapter].length}
          chapter={selectedChapter}
          choices={CHAPTER_STORY_CHOICES[selectedChapter]?.[storyIndex] || []}
          onChoose={continueStory}
        />
      )}
      {screen === "growth" && (
        <GrowthScreen
          profile={profile}
          setProfile={setProfile}
          onBack={() => changeScreen("home")}
        />
      )}
      {screen === "collection" && (
        <CollectionScreen
          origin={origin}
          setOrigin={setOrigin}
          profile={profile}
          onBack={() => changeScreen("home")}
        />
      )}
      {screen === "title" && (
        <TitleScreen
          origin={origin}
          setOrigin={setOrigin}
          selectedOrigin={selectedOrigin}
          beginRun={() => beginRun(selectedChapter)}
          setOverlay={setOverlay}
        />
      )}
      {screen === "map" && (
        <MapScreen
          stage={stage}
          chapter={selectedChapter}
          hp={hp}
          maxHp={maxHp}
          stones={stones}
          enterCombat={enterCombat}
          setScreen={setScreen}
          openEncounterPrelude={(nextStage) => {
            setPendingEncounterStage(nextStage);
            changeScreen("encounterPrelude");
          }}
          openBossPrelude={() => changeScreen("bossPrelude")}
          openMarket={() => {
            const key = `${selectedChapter}:${routeProgress}`;
            setMarketVisit((value) => value.key === key ? value : { key, sold: [], specialUsed: false, treasureBought: false });
            changeScreen("market");
          }}
          openRest={() => changeScreen("rest")}
          openTraining={() => changeScreen("training")}
          routeProgress={routeProgress}
          choices={runChoices}
          chronicle={runChronicle}
          clues={runClues}
          pendingClue={pendingClue}
          nextEnemyShield={nextEnemyShield}
          profile={profile}
          treasures={treasures}
          deck={runDeck}
          origin={origin}
          runMode={runMode}
          runSeed={runSeed}
          runTrial={runTrial}
          runTribulation={runTribulation}
          onChooseNode={(node, clue) => {
            setRunChronicle((value) => [...value.slice(-5), `路线 · ${node.name}`]);
            setPendingClue(createPendingClue(clue, node, routeProgress));
          }}
        />
      )}
      {screen === "encounterPrelude" && (
        <EncounterPreludeScreen
          chapter={selectedChapter}
          stage={pendingEncounterStage}
          seen={(profile.seenEncounters || []).includes(`${selectedChapter}:${pendingEncounterStage}`)}
          onBegin={() => {
            const prelude = resolveEncounterPrelude(selectedChapter, pendingEncounterStage);
            setProfile((value) => ({
              ...value,
              seenEncounters: [...new Set([...(value.seenEncounters || []), `${selectedChapter}:${pendingEncounterStage}`])],
            }));
            setRunChronicle((value) => [...value.slice(-5), `遭遇 · ${prelude?.enemy.name || "敌影"}`]);
            enterCombat(pendingEncounterStage);
          }}
        />
      )}
      {screen === "bossPrelude" && (
        <BossPreludeScreen
          chapter={selectedChapter}
          choices={runChoices}
          clues={runClues}
          onBegin={() => {
            const prelude = resolveBossPrelude(selectedChapter, runChoices);
            setRunChronicle((value) => [...value.slice(-5), `首领前夜 · ${prelude?.name || ENCOUNTER_ENEMIES[selectedChapter][3].name}`]);
            enterCombat(3);
          }}
        />
      )}
      {screen === "market" && (
        <MarketScreen
          chapter={selectedChapter}
          origin={selectedOrigin}
          deck={runDeck}
          setDeck={setRunDeck}
          hp={hp}
          maxHp={maxHp}
          setHp={setHp}
          stones={stones}
          setStones={setStones}
          consumables={consumables}
          setConsumables={setConsumables}
          treasures={treasures}
          setTreasures={setTreasures}
          setMaxQi={setMaxQi}
          setProfile={setProfile}
          randomSeed={runSeed}
          routeProgress={routeProgress}
          visit={marketVisit}
          setVisit={setMarketVisit}
          onLeave={() => {
            completePendingClue();
            setRouteProgress((value) => Math.min(3, value + 1));
            changeScreen("map");
          }}
        />
      )}
      {screen === "rest" && (
        <RestScreen
          hp={hp}
          maxHp={maxHp}
          deck={runDeck}
          origin={selectedOrigin}
          setHp={setHp}
          setDeck={setRunDeck}
          setConsumables={setConsumables}
          randomSeed={runSeed}
          routeProgress={routeProgress}
          onComplete={() => {
            completePendingClue();
            setRouteProgress((value) => Math.min(3, value + 1));
            changeScreen("map");
          }}
        />
      )}
      {screen === "training" && (
        <TrainingScreen
          deck={runDeck}
          origin={selectedOrigin}
          maxQi={maxQi}
          setMaxQi={setMaxQi}
          setDeck={setRunDeck}
          onComplete={() => {
            completePendingClue();
            setRouteProgress((value) => Math.min(3, value + 1));
            changeScreen("map");
          }}
        />
      )}
      {screen === "event" && <EventScreen chapter={selectedChapter} origin={selectedOrigin} deck={runDeck} hp={hp} maxHp={maxHp} stones={stones} clues={runClues} pendingClue={pendingClue} profile={profile} routeProgress={routeProgress} maxQi={maxQi} autoChoice={debugEventChoice} setProfile={setProfile} setScreen={setScreen} setHp={setHp} setStones={setStones} setRunDeck={setRunDeck} setRouteProgress={setRouteProgress} setNextEnemyShield={setNextEnemyShield} setMaxQi={setMaxQi} setConsumables={setConsumables} completeInvestigation={completePendingClue} abandonInvestigation={() => setPendingClue(null)} addRunEcho={(text) => setRunChronicle((value) => [...value.slice(-5), text])} />}
      {screen === "combat" && (
        <CombatScreen
          origin={selectedOrigin}
          stage={stage}
          chapter={selectedChapter}
          hp={hp}
          maxHp={maxHp}
          qi={qi}
          maxQi={maxQi}
          shield={shield}
          edge={edge}
          jobState={jobState}
          stones={stones}
          enemy={enemy}
          routeProgress={routeProgress}
          clues={runClues}
          pendingClue={pendingClue}
          profile={profile}
          enemyBurn={enemyBurn}
          enemyPoison={enemyPoison}
          enemyWeak={enemyWeak}
          enemyShield={enemyShield}
          playerWeak={playerWeak}
          hand={hand}
          drawPile={drawPile}
          discardPile={discardPile}
          exhaustPile={exhaustPile}
          drawFx={drawFx}
          combatTurn={combatTurn}
          log={log}
          combatFx={combatFx}
          combatBusy={combatBusy}
          playerFx={playerFx}
          triggerFx={triggerFx}
          turnFlowFx={turnFlowFx}
          runTribulation={runTribulation}
          playCard={playCard}
          effectiveCardCost={effectiveCardCost}
          cardRequirementMet={cardRequirementMet}
          cardSynergyState={cardSynergyState}
          endTurn={endTurn}
          consumables={consumables}
          treasures={treasures}
          deck={runDeck}
          moonPhase={moonPhase}
          useConsumable={useConsumable}
          setOverlay={setOverlay}
          showGuide={(debugTutorial || (!profile.tutorialFlags.combat && selectedChapter === 1 && stage === 1)) && !debugAutoplay && !debugAutoClick}
          completeGuide={() => setProfile((value) => ({ ...value, tutorialFlags: { ...value.tutorialFlags, combat: true } }))}
        />
      )}
      {screen === "reward" && <RewardScreen stage={stage} chapter={selectedChapter} routeProgress={routeProgress} origin={origin} hp={hp} maxHp={maxHp} deck={runDeck} treasures={treasures} stones={stones} clues={runClues} pendingClue={pendingClue} profile={profile} randomSeed={runSeed} runTribulation={runTribulation} setStones={setStones} claimReward={claimReward} skipReward={skipReward} />}
      {screen === "summary" && <SummaryScreen chapter={selectedChapter} origin={origin} hp={hp} maxHp={maxHp} stones={stones} treasures={treasures} deck={runDeck} profile={profile} runChoices={runChoices} runChronicle={runChronicle} runClues={runClues} runStats={runStats} runMode={runMode} runSeed={runSeed} runTrial={runTrial} runTribulation={runTribulation} onHome={() => changeScreen("home")} onContinue={(nextChapter, nextOrigin) => beginRun(nextChapter, { origin: nextOrigin })} />}
      {screen === "defeat" && (
        <DefeatScreen
          chapter={selectedChapter}
          stage={stage}
          deck={runDeck}
          treasures={treasures}
          clues={runClues}
          pendingClue={pendingClue}
          runMode={runMode}
          runSeed={runSeed}
          runTrial={runTrial}
          failureStreak={hasDebugFailures ? debugFailures : (profile.chapterFailures?.[selectedChapter] || 0)}
          onRetry={() => beginRun(selectedChapter, { mode: runMode, trial: runTrial, origin, seed: runSeed })}
          onHome={() => changeScreen("home")}
        />
      )}
      {overlay && <Overlay type={overlay} close={() => setOverlay(null)} deck={runDeck} origin={origin} profile={profile} setProfile={setProfile} treasures={treasures} savedRun={savedRun} abandonRun={abandonRun} feedback={feedback} claimProgressReward={claimChallengeReward} />}
    </main>
  );
}

function Atmosphere() {
  return (
    <>
      <div className="scene-backdrop" />
      <div className="scene-vignette" />
      <div className="rain" />
      <div className="mist mist-one" />
      <div className="mist mist-two" />
    </>
  );
}

function MobileTopBar({ title, subtitle, onBack, profile }) {
  return (
    <header className="mobile-topbar">
      {onBack ? <button className="back-button" onClick={onBack}>‹</button> : <span className="brand-mark small">青</span>}
      <div><strong>{title}</strong><small>{subtitle}</small></div>
      {profile && <span className="account-level">Lv.{profile.level}</span>}
    </header>
  );
}

function DesktopModePanel({ screen, profile, chapter, stage, routeProgress, hp, maxHp, stones, deck, origin }) {
  const copy = {
    home: ["山门桌面台", "左侧导航固定，右侧集中查看成长、试炼和长期目标。"],
    chapters: ["主线卷册", "三列章节卡适合鼠标浏览，锁定、当前和已结卷状态分开呈现。"],
    classes: ["道途选择", "职业画像与起始牌组并排，方便比较流派与熟练度收益。"],
    growth: ["悟道树", "宽屏保留更多节点视野，适合规划永久成长路线。"],
    collection: ["藏经阁", "桌面端提升卡牌和流派图谱的信息密度。"],
    daily: ["今日试炼", "异兆、路线和首胜奖励集中排布，开局前可快速判断风险。"],
    challenge: ["挑战复刻", "挑战码输入与历史战绩分区，方便复制和校验。"],
  }[screen] || ["桌面模式", "当前页面已切换为 PC 宽屏适配。"];
  const mastery = profile.jobMastery?.[origin] || 0;
  const build = deck?.length ? currentBuildState(deck, origin) : null;
  return (
    <aside className="desktop-mode-panel" aria-label="PC 端适配信息">
      <span>PC ADAPTIVE</span>
      <strong>{copy[0]}</strong>
      <p>{copy[1]}</p>
      <div className="desktop-mode-stats">
        <b>第 {chapter} 章 · {stage}/3</b>
        <b>路线 {routeProgress + 1}/4</b>
        <b>生命 {hp}/{maxHp}</b>
        <b>灵石 {stones}</b>
      </div>
      <div className="desktop-mode-shortcuts">
        <small>桌面端原则</small>
        <em>鼠标单击主操作</em>
        <em>双侧信息栏</em>
        <em>{build ? `${build.recipe.name} ${build.progress}/5` : `熟练 ${mastery}/100`}</em>
      </div>
    </aside>
  );
}

function ChallengeGoalCard({ goal, claimProgressReward, compact = false }) {
  const state = goal.claimed ? "claimed" : goal.claimable ? "claimable" : goal.complete ? "complete" : "active";
  return (
    <article className={`challenge-goal ${state} ${compact ? "compact" : ""}`}>
      <div className="challenge-goal-copy"><strong>{goal.title}</strong><p>{goal.hook}</p></div>
      <span className="challenge-goal-state">
        {goal.claimed ? "已领取" : goal.claimable ? "待领取" : `${goal.current}/${goal.target}`}
      </span>
      <i className="challenge-goal-progress"><b style={{ width: `${goal.percent}%` }} /></i>
      <div className="challenge-goal-reward">
        <small>{formatProgressReward(goal.reward)}</small>
        {goal.claimable && claimProgressReward && <button onClick={() => claimProgressReward(goal.id)}>领取</button>}
      </div>
    </article>
  );
}

function HomeScreen({ profile, setScreen, setOverlay, beginRun, savedRun, resumeRun, claimProgressReward, dailyTrial }) {
  const mainComplete = (profile.unlockedEndings || []).includes(`chapter_${CHAPTERS.length}_ending`);
  const currentChapterId = mainComplete ? CHAPTERS.length : Math.min(CHAPTERS.length, Math.max(1, profile.chapter || 1));
  const currentChapter = CHAPTERS[currentChapterId - 1];
  const worldState = CHAPTER_HOME_STATES[mainComplete ? "complete" : currentChapterId];
  const currentInvestigation = CHAPTER_INVESTIGATIONS[currentChapterId];
  const archiveFound = profile.investigationArchive?.[String(currentChapterId)]?.length || 0;
  const archiveTotal = investigationEvidence(currentChapterId).length;
  const goals = nextProgressGoals(profile, 2);
  const latestRun = profile.recentRuns?.[0];
  return (
    <section className="mobile-shell home-screen screen-content">
      <div className={`home-hero ${savedRun ? "has-save" : ""}`}>
        <GameImage eager src={currentChapter.art} alt="" />
        <div className="home-shade" />
        <MobileTopBar title="青岚夜行" subtitle={`${profile.equippedTitle || "云游录"} · 第七夜`} profile={profile} />
        <div className="home-player">
          <span className="section-index">{worldState.kicker}</span>
          <h1>{worldState.title.split("\n").map((line, index) => <React.Fragment key={line}>{line}{index === 0 && <br />}</React.Fragment>)}</h1>
          <p>{worldState.text}</p>
        </div>
        <button className="chapter-continue" onClick={beginRun}>
          <small>{savedRun ? `另有自动存档 · 第 ${savedRun.selectedChapter} 章` : mainComplete ? "主线已结 · 自由重访" : `当前主线 · 第 ${currentChapterId} 章`}</small>
          <strong>{savedRun ? CHAPTERS[savedRun.selectedChapter - 1]?.name : currentChapter.name}</strong>
          <span>{savedRun ? "重新选择云游 →" : mainComplete ? "选择旧卷 →" : "选择道途 →"}</span>
        </button>
        {savedRun && <button className="run-resume" onClick={resumeRun}><span>{savedRun.screen === "combat" ? "继续当前战斗" : "继续上次云游"}</span><small>{savedRun.screen === "combat" ? `第 ${savedRun.combatTurn || 1} 回合 · 敌人 ${savedRun.enemy?.hp ?? "?"}/${savedRun.enemy?.max ?? "?"}` : `路线 ${savedRun.routeProgress + 1}/4`} · {getProfession(savedRun.origin).short} · 生命 {savedRun.hp}</small></button>}
      </div>
      <div className="home-dashboard">
        <div className="resource-strip">
          <span><GameImage src="/ui/icons/stones.png" alt="" /><b>{profile.jade}</b><small>灵玉</small></span>
          <span><GameImage src="/ui/icons/qi.png" alt="" /><b>{profile.spirit}</b><small>悟道</small></span>
          <span><GameImage src="/ui/icons/treasure.png" alt="" /><b>6/6</b><small>道途</small></span>
        </div>
        <div className="account-progress"><span>修行等级 Lv.{profile.level}</span><i><b style={{ width: `${profile.xp % 100}%` }} /></i><small>{profile.xp % 100}/100</small></div>
        <div className="home-actions">
          <button onClick={() => setScreen("classes")}><GameImage src="/ui/breakthroughs/sword_heart.png" alt="" /><span><strong>道途</strong><small>{DECK_RECIPES.length} 套流派</small></span></button>
          <button onClick={() => setScreen("collection")}><GameImage src="/ui/treasures/bamboo_slip.png" alt="" /><span><strong>藏经阁</strong><small>{profile.discoveredCards?.length || 0}/{ALL_CARDS.length} 已收录</small></span></button>
          <button onClick={() => setScreen("growth")}><GameImage src="/ui/insights/open_meridians.png" alt="" /><span><strong>悟道树</strong><small>永久成长</small></span></button>
          <button onClick={() => setOverlay("codex")}><GameImage src="/ui/treasures/spirit_lamp.png" alt="" /><span><strong>异闻录</strong><small>人物与线索</small></span></button>
        </div>
        <article className={`daily-thread ${archiveFound === archiveTotal ? "completed" : ""}`} onClick={() => archiveFound === archiveTotal ? setOverlay("codex") : setScreen("chapters")}>
          <div><span className="section-index">{mainComplete ? "宗卷补完" : "当前调查"}</span><h2>{currentInvestigation.objective}</h2><p>{archiveFound === archiveTotal ? "本章全部分支证据已收入异闻宗卷。" : `${currentInvestigation.opening} · 重返不同路线可补全分支证据。`}</p></div>
          <strong>{archiveFound}/{archiveTotal}</strong>
        </article>
        <button className={`daily-trial-card ${dailyRewardStatus(profile, dailyTrial).claimed ? "completed" : ""}`} onClick={() => setScreen("daily")}>
          <span className="daily-trial-moon"><GameImage src="/ui/treasures/spirit_lamp.png" alt="" /></span>
          <div>
            <small>{dailyTrial.dateLabel} · 今日试炼</small>
            <strong>{dailyTrial.modifier.name}</strong>
            <p>固定 {getProfession(dailyTrial.origin).short} · 第 {dailyTrial.chapter} 章 · 种子 {dailyTrial.seed}</p>
          </div>
          <b>{dailyRewardStatus(profile, dailyTrial).claimed ? "已破局" : "查看"}</b>
        </button>
        <button className="challenge-code-entry" onClick={() => setScreen("challenge")}>
          <span>复刻卷</span>
          <div><strong>挑战码</strong><small>导入好友种子，或抄录最近战绩</small></div>
          <b>›</b>
        </button>
        <section className="progress-board">
          <header><span className="section-index">挑战卷</span><button onClick={() => setOverlay("codex")}>查看全卷</button></header>
          {goals.map((goal) => <ChallengeGoalCard goal={goal} compact claimProgressReward={claimProgressReward} key={goal.id} />)}
          {latestRun && <aside><small>{latestRun.mode === "daily" ? "最近今日试炼" : "最近云游"}</small><strong>第 {latestRun.chapter} 章 · {getProfession(latestRun.job).short} · {latestRun.grade}</strong><em>{latestRun.score} 分 · 线索 {latestRun.clues}/5 · 种子 {latestRun.seed || "旧档"}</em></aside>}
        </section>
      </div>
      <nav className="mobile-nav">
        <button className="active"><span>山门</span></button>
        <button onClick={() => setScreen("chapters")}><span>云游</span></button>
        <button onClick={() => setScreen("collection")}><span>藏经</span></button>
        <button onClick={() => setScreen("growth")}><span>悟道</span></button>
      </nav>
    </section>
  );
}

function ChallengeCodeScreen({ profile, savedRun, onBack, onCopy, onStart }) {
  const [code, setCode] = useState("");
  const parsed = useMemo(() => parseChallengeCode(code), [code]);
  const blockedBySave = Boolean(savedRun);
  const recent = (profile.recentRuns || []).map((run) => ({ run, code: challengeCodeForRun(run) })).filter((item) => item.code);
  const reason = {
    format: "格式不完整，请粘贴完整挑战码。",
    checksum: "挑战码校验失败，可能在传递时被改动。",
    chapter: "挑战码中的章节不存在。",
    origin: "挑战码中的道途不存在。",
    seed: "挑战种子不合法。",
    modifier: "挑战码引用了不存在的异兆。",
  }[parsed.reason];
  return (
    <section className="mobile-shell challenge-code-screen screen-content">
      <MobileTopBar title="挑战复刻" subtitle="同种同局 · 不发每日首胜" onBack={onBack} profile={profile} />
      <div className="challenge-code-heading">
        <span className="section-index">好友挑战码</span>
        <h1>把同一夜，<br />交给另一位修士。</h1>
        <p>挑战码会固定职业、章节、异兆和关键随机结果。剧情选择仍由你自己决定。</p>
      </div>
      <div className="challenge-code-form">
        <label htmlFor="challenge-code">粘贴挑战码</label>
        <textarea id="challenge-code" value={code} onChange={(event) => setCode(event.target.value.trim())} placeholder="QL1.2.sword.blood_moon.NIGHT-20260621.XXXX" spellCheck="false" />
        {code && !parsed.valid && <small className="challenge-code-error">{reason}</small>}
        {parsed.valid && <div className="challenge-code-preview">
          <span>挑战卷可用</span>
          <strong>第 {parsed.chapter} 章 · {getProfession(parsed.origin).name}</strong>
          <p>{parsed.trial?.modifier ? `${parsed.trial.modifier.name}：${parsed.trial.modifier.boon} / ${parsed.trial.modifier.hazard}` : "标准云游规则 · 无额外异兆"}</p>
          <small>种子 {parsed.seed}</small>
        </div>}
        <ModeRuleContract
          title="挑战复刻规则"
          rules={[
            ["固定", "职业、章节、异兆与关键随机结果"],
            ["自主", "剧情选择与路线取舍仍由你决定"],
            ["奖励", "不发每日首胜，不继承终局劫数"],
            ["用途", "适合复盘构筑、比较分数和分享同局"],
          ]}
        />
        {blockedBySave && <p className="daily-save-warning">当前有未完成云游。请先继续或主动放弃该存档，再开始复刻挑战。</p>}
        <button className="primary-cta challenge-code-start" disabled={!parsed.valid || blockedBySave} onClick={() => parsed.valid && onStart(parsed)}><span>展开挑战卷</span></button>
      </div>
      <section className="challenge-code-history">
        <header><span className="section-index">最近可分享战绩</span><small>挑战码只复刻开局条件，不复制你的剧情选择</small></header>
        {recent.length ? recent.slice(0, 4).map(({ run, code: runCode }) => (
          <article key={run.id}>
            <div><strong>{run.mode === "daily" ? run.trialName : `第 ${run.chapter} 章`} · {getProfession(run.job).short}</strong><small>{run.grade} · {run.score} 分 · {run.seed}</small></div>
            <button onClick={() => onCopy(runCode)}>复制挑战码</button>
          </article>
        )) : <p>完成带有种子的云游后，可以在这里生成挑战码。</p>}
      </section>
    </section>
  );
}

function ModeRuleContract({ title, rules }) {
  return (
    <section className="mode-rule-contract" aria-label={title}>
      <span>{title}</span>
      <div>
        {rules.map(([label, text]) => <p key={label}><b>{label}</b><small>{text}</small></p>)}
      </div>
    </section>
  );
}

function DailyTrialScreen({ trial, profile, savedRun, onBack, onResume, onStart }) {
  const profession = getProfession(trial.origin);
  const chapter = CHAPTERS[trial.chapter - 1];
  const status = dailyRewardStatus(profile, trial);
  const resumable = savedRun?.runMode === "daily" && savedRun?.runTrial?.dateKey === trial.dateKey;
  const blockedBySave = Boolean(savedRun && !resumable);
  return (
    <section className="mobile-shell daily-trial-screen screen-content">
      <div className="daily-trial-hero">
        <GameImage eager src="/ui/bg_title_shrine.png" alt="" />
        <div className="daily-trial-shade" />
        <MobileTopBar title="今日试炼" subtitle={`${trial.dateLabel} · 同日同局`} onBack={onBack} profile={profile} />
        <div className="daily-trial-title">
          <span className="section-index">挑战种子 · {trial.seed}</span>
          <h1>{trial.modifier.name}</h1>
          <p>今夜所有修士面对相同职业、章节与异兆。关键洗牌、坊市和战利也由同一种子决定。</p>
        </div>
      </div>
      <div className="daily-trial-body">
        <div className="daily-trial-route">
          <article><small>指定道途</small><strong>{profession.name}</strong><span>{profession.style}</span></article>
          <article><small>指定章节</small><strong>第 {trial.chapter} 章 · {chapter.name}</strong><span>{chapter.region}</span></article>
        </div>
        <section className="daily-mandate">
          <span className="section-index">今夜异兆</span>
          <h2>{trial.title}</h2>
          <div><b>助力</b><strong>{trial.modifier.boon}</strong></div>
          <div className="hazard"><b>劫数</b><strong>{trial.modifier.hazard}</strong></div>
        </section>
        <section className={`daily-first-clear ${status.claimed ? "claimed" : ""}`}>
          <div><small>每日首胜</small><strong>{status.claimed ? "今日奖励已领取" : "首次通关自动结算"}</strong></div>
          <p>灵玉 +{DAILY_TRIAL_REWARD.jade} · 悟道 +{DAILY_TRIAL_REWARD.spirit} · 修为 +{DAILY_TRIAL_REWARD.xp} · 称号「{DAILY_TRIAL_REWARD.title}」</p>
        </section>
        <ModeRuleContract
          title="今日试炼规则"
          rules={[
            ["固定", `同日同种子 · ${trial.seed}`],
            ["指定", `${profession.short} · 第 ${trial.chapter} 章 · 不继承终局劫数`],
            ["奖励", status.claimed ? "今日首胜已领，再战只记录复盘" : "首次通关发放每日首胜"],
            ["公平", "关键洗牌、坊市和战利由同一种子决定"],
          ]}
        />
        {blockedBySave && <p className="daily-save-warning">当前另有未完成云游。请先回到山门继续或放弃该存档，避免覆盖进度。</p>}
        <button className="primary-cta daily-start" disabled={blockedBySave} onClick={resumable ? onResume : onStart}>
          <span>{resumable ? "继续今日试炼" : status.claimed ? "再次挑战 · 不重复发放首胜" : "领取试炼签 · 开始挑战"}</span>
        </button>
      </div>
    </section>
  );
}

function ChapterScreen({ profile, onBack, onChoose }) {
  const mainComplete = (profile.unlockedEndings || []).includes(`chapter_${CHAPTERS.length}_ending`);
  const [tribulationLevel, setTribulationLevel] = useState(0);
  const initialPreviewChapter = Math.min(CHAPTERS.length, Math.max(1, profile.chapter || 1));
  const [previewChapterId, setPreviewChapterId] = useState(initialPreviewChapter);
  const totalChapterVolumes = Math.ceil(CHAPTERS.length / 5);
  const chapterVolumes = Array.from({ length: totalChapterVolumes }, (_, index) => {
    const chapters = CHAPTERS.slice(index * 5, index * 5 + 5);
    const start = chapters[0]?.id || 1;
    const end = chapters[chapters.length - 1]?.id || start;
    return {
      id: index + 1,
      title: index === 0 ? "命册残卷" : index === totalChapterVolumes - 1 ? "自在终卷" : `第${index + 1}部`,
      range: `卷 ${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")}`,
      chapters,
    };
  });
  const initialVolumeIndex = Math.min(chapterVolumes.length - 1, Math.floor((initialPreviewChapter - 1) / 5));
  const [activeVolumeIndex, setActiveVolumeIndex] = useState(initialVolumeIndex);
  const activeVolume = chapterVolumes[activeVolumeIndex] || chapterVolumes[0];
  const visibleChapters = activeVolume?.chapters || CHAPTERS.slice(0, 5);
  const selectedTribulation = mainComplete ? tribulationForLevel(tribulationLevel) : tribulationForLevel(0);
  const previewChapter = CHAPTERS.find((chapter) => chapter.id === previewChapterId) || CHAPTERS[0];
  const previewUnlocked = previewChapter.id === 1 || profile.chapter > previewChapter.id - 1;
  const previewInvestigation = CHAPTER_INVESTIGATIONS[previewChapter.id];
  const previewDossier = CHAPTER_BOSS_DOSSIERS[previewChapter.id];
  const previewEnemies = Object.values(ENCOUNTER_ENEMIES[previewChapter.id] || {});
  const previewBoss = ENCOUNTER_ENEMIES[previewChapter.id]?.[3];
  const previewFoundEvidence = profile.investigationArchive?.[String(previewChapter.id)]?.length || 0;
  const previewEvidenceTotal = investigationEvidence(previewChapter.id).length;
  const previewEpilogues = CHAPTER_EPILOGUES[previewChapter.id] || [];
  const previewFoundEpilogues = previewEpilogues.filter((epilogue) => (profile.unlockedEpilogues || []).includes(epilogue.id)).length;
  const previewDifficulty = chapterDifficultyProfile(previewChapter.id, selectedTribulation);
  const previewRouteBeats = CHAPTER_ROUTE_COPY[previewChapter.id]?.beats || [];
  const previewTempoContract = [
    { phase: "序", title: previewRouteBeats[0] || "入局观势", reward: "剧情抉择 · 线索伏笔", energy: "低压铺垫" },
    { phase: "破", title: previewRouteBeats[1] || "分支变局", reward: "战利三选 · 构筑推进", energy: "压力抬升" },
    { phase: "急", title: previewRouteBeats[2] || previewChapter.boss, reward: `首领宗卷 · ${previewBoss?.name || previewChapter.boss}`, energy: "爆发决战" },
    { phase: "回", title: previewRouteBeats[3] || "结卷回山", reward: "后记 / 证据 / 下一章桥梁", energy: "回落结算" },
  ];
  return (
    <section className="mobile-shell chapter-screen screen-content">
      <MobileTopBar title="云游录" subtitle={`${CHAPTERS.length} 卷主线 · 逐章解锁`} onBack={onBack} profile={profile} />
      <div className="chapter-heading">
        <span className="section-index">主线篇章</span>
        <h1>循灯而行</h1>
        <p>每一章包含剧情抉择、分支路线、精英事件与最终首领。</p>
      </div>
      {mainComplete && <div className="tribulation-panel" data-testid="tribulation-panel">
        <div className="tribulation-heading">
          <span>终局复刷 · 可选劫数</span>
          <strong>{selectedTribulation.short}</strong>
          <p>{selectedTribulation.level ? selectedTribulation.risk : "标准难度适合补线索、收集后记与熟悉新职业。"}</p>
        </div>
        <div className="tribulation-options">
          {TRIBULATION_LEVELS.map((item) => {
            const clearedCount = CHAPTERS.filter((chapter) => tribulationRewardStatus(profile, chapter.id, item.level).claimed).length;
            return (
              <button key={item.id} className={selectedTribulation.level === item.level ? "active" : ""} onClick={() => setTribulationLevel(item.level)}>
                <span>{item.name}</span>
                <strong>{item.short}</strong>
                <small>{item.level ? `首破：灵玉 +${item.reward.jade} · 悟道 +${item.reward.spirit}` : "无额外奖励"}</small>
                {item.level > 0 && <em>{clearedCount}/{CHAPTERS.length} 章已破</em>}
              </button>
            );
          })}
        </div>
      </div>}
      <article className={`chapter-casefile ${previewUnlocked ? "" : "locked"}`} aria-label="章节案卷预览">
        <GameImage eager src={previewChapter.art} alt="" />
        <div className="casefile-shade" />
        <div className="casefile-main">
          <span className="section-index">案卷预览 · 卷 {String(previewChapter.id).padStart(2, "0")}</span>
          <h2>{previewChapter.name}</h2>
          <p>{previewChapter.summary}</p>
          <div className="casefile-metrics">
            <span><b>{previewFoundEvidence}/{previewEvidenceTotal}</b><small>宗卷证据</small></span>
            <span><b>{previewFoundEpilogues}/{previewEpilogues.length}</b><small>人物后记</small></span>
            <span><b>{previewDifficulty.pressure}</b><small>敌压 · {previewDifficulty.tier}</small></span>
          </div>
          <div className="chapter-difficulty-brief" aria-label="章节难度建议">
            <span><b>容错</b>{previewDifficulty.tolerance}</span>
            <span><b>建议</b>{previewDifficulty.advice}</span>
          </div>
          <section className="chapter-tempo-contract" aria-label="章节节奏契约">
            <header>
              <span>节奏契约 · 序破急回</span>
              <strong>预计 10–14 分钟一局</strong>
            </header>
            <div>
              {previewTempoContract.map((beat) => (
                <i key={beat.phase}>
                  <b>{beat.phase}</b>
                  <em>{beat.title}</em>
                  <small>{beat.energy} · {beat.reward}</small>
                </i>
              ))}
            </div>
          </section>
          <button disabled={!previewUnlocked} onClick={() => onChoose(previewChapter.id, selectedTribulation.level)}>
            {previewUnlocked ? `进入${previewChapter.name}` : "完成前章后解锁"}
          </button>
        </div>
        <div className="casefile-lore">
          <section className="casefile-boss-card">
            <GameImage src={previewBoss?.art} alt="" />
            <div>
              <span>首领现形</span>
              <strong>{previewBoss?.name} · {previewBoss?.archetype}</strong>
              <p>{previewBoss?.trait} · {previewBoss?.counter}</p>
            </div>
          </section>
          <section>
            <span>调查目标</span>
            <strong>{previewInvestigation?.objective}</strong>
            <p>{previewFoundEvidence >= 4 ? previewInvestigation?.conclusion : previewInvestigation?.opening}</p>
          </section>
          <section>
            <span>路线节奏</span>
            <div className="casefile-route-beats">
              {previewRouteBeats.map((beat, index) => <i key={beat}><b>{index + 1}</b>{beat}</i>)}
            </div>
          </section>
          <section>
            <span>首领宗卷</span>
            <strong>{previewChapter.boss} · {previewDossier?.weakness}</strong>
            <p>{previewDossier?.origin}</p>
          </section>
          <section>
            <span>敌情压力</span>
            <div className="casefile-enemies">
              {previewEnemies.map((enemy) => <em key={enemy.name}><b>{enemy.name}</b><small>{enemy.archetype} · {enemy.trait}</small></em>)}
            </div>
          </section>
        </div>
      </article>
      <nav className="chapter-volume-nav" aria-label="主线部卷筛选">
        {chapterVolumes.map((volume, index) => {
          const unlockedCount = volume.chapters.filter((chapter) => chapter.id === 1 || profile.chapter > chapter.id - 1 || mainComplete).length;
          const completedCount = volume.chapters.filter((chapter) => (profile.unlockedEndings || []).some((ending) => ending === `chapter_${chapter.id}_ending` || (chapter.id === 5 && ["restore_fate", "rewrite_fate"].includes(ending)))).length;
          const active = index === activeVolumeIndex;
          return (
            <button
              key={volume.id}
              className={active ? "active" : ""}
              onClick={() => {
                const firstUnlocked = volume.chapters.find((chapter) => chapter.id === 1 || profile.chapter > chapter.id - 1 || mainComplete) || volume.chapters[0];
                setActiveVolumeIndex(index);
                if (firstUnlocked) setPreviewChapterId(firstUnlocked.id);
              }}
            >
              <span>{volume.title}</span>
              <strong>{volume.range}</strong>
              <small>{completedCount}/{volume.chapters.length} 已结卷 · {unlockedCount}/{volume.chapters.length} 可进入</small>
            </button>
          );
        })}
      </nav>
      <div className="chapter-list">
        {visibleChapters.map((chapter) => {
          const index = chapter.id - 1;
          const unlocked = index === 0 || profile.chapter > index || mainComplete;
          const completed = (profile.unlockedEndings || []).some((ending) => ending === `chapter_${chapter.id}_ending` || (chapter.id === 5 && ["restore_fate", "rewrite_fate"].includes(ending)));
          const current = unlocked && !completed && chapter.id === Math.min(CHAPTERS.length, profile.chapter || 1);
          const tribulationStatus = tribulationRewardStatus(profile, chapter.id, selectedTribulation.level);
          const evidence = investigationEvidence(chapter.id);
          const foundEvidence = profile.investigationArchive?.[String(chapter.id)]?.length || 0;
          const epilogues = CHAPTER_EPILOGUES[chapter.id] || [];
          const chapterBoss = ENCOUNTER_ENEMIES[chapter.id]?.[3];
          const difficulty = chapterDifficultyProfile(chapter.id, selectedTribulation);
          const foundEpilogues = epilogues.filter((epilogue) => (profile.unlockedEpilogues || []).includes(epilogue.id)).length;
          const tribulationClears = TRIBULATION_LEVELS.slice(1).filter((item) => tribulationRewardStatus(profile, chapter.id, item.level).claimed).length;
          const nextTarget = !unlocked
            ? "完成前章"
            : foundEvidence < evidence.length
              ? `补证据 ${foundEvidence}/${evidence.length}`
              : foundEpilogues < epilogues.length
                ? `补后记 ${foundEpilogues}/${epilogues.length}`
                : mainComplete && tribulationClears < TRIBULATION_LEVELS.length - 1
                  ? `破劫数 ${tribulationClears}/${TRIBULATION_LEVELS.length - 1}`
                  : completed ? "换职业复盘" : "推进主线";
          return (
            <button key={chapter.id} className={`chapter-card ${unlocked ? "" : "locked"} ${completed ? "completed" : ""} ${current ? "current" : ""} ${previewChapterId === chapter.id ? "previewed" : ""} ${selectedTribulation.level ? "tribulation-selected" : ""}`} disabled={!unlocked} onMouseEnter={() => setPreviewChapterId(chapter.id)} onFocus={() => setPreviewChapterId(chapter.id)} onClick={() => onChoose(chapter.id, selectedTribulation.level)}>
              <GameImage src={chapter.art} alt="" />
              <div className="chapter-card-shade" />
              <span className="chapter-number">{completed ? "已结卷" : current ? "当前主线" : `卷 ${String(chapter.id).padStart(2, "0")}`}</span>
              {chapterBoss && <span className="chapter-boss-sigil"><GameImage src={chapterBoss.art} alt="" /><b>{chapterBoss.name}</b><i>{chapterBoss.trait}</i></span>}
              <div><small>{chapter.region} · {chapter.level}</small><h2>{chapter.name}</h2><p>{chapter.summary}</p><strong>{!unlocked ? "完成前章后解锁" : selectedTribulation.level ? `${selectedTribulation.name} · ${tribulationStatus.claimed ? "首破已领" : `首破称号「${selectedTribulation.reward.title}」`}` : completed ? `可重访 · 首领 ${chapter.boss}` : `继续主线 · 首领 ${chapter.boss}`}</strong>
                <div className="chapter-replay-goals" aria-label={`第 ${chapter.id} 章复玩目标`}>
                  <span className={foundEvidence >= evidence.length ? "done" : ""}><b>证据</b><i>{foundEvidence}/{evidence.length}</i></span>
                  <span className={foundEpilogues >= epilogues.length ? "done" : ""}><b>后记</b><i>{foundEpilogues}/{epilogues.length}</i></span>
                  <span className={mainComplete && tribulationClears >= TRIBULATION_LEVELS.length - 1 ? "done" : ""}><b>劫数</b><i>{tribulationClears}/{TRIBULATION_LEVELS.length - 1}</i></span>
                </div>
                <div className="chapter-difficulty-tags" aria-label={`第 ${chapter.id} 章难度画像`}>
                  <span><b>敌压</b>{difficulty.pressure}</span>
                  <span><b>{difficulty.tier}</b>{difficulty.tolerance}</span>
                  <span><b>建议</b>{difficulty.advice}</span>
                </div>
                <em className="chapter-next-target">下一目标 · {nextTarget}</em>
              </div>
            </button>
          );
        })}
        {mainComplete && <div className="chapter-main-complete"><span>自在终卷 · 主线完成</span><strong>所有篇章已开放自由重访</strong><p>另一条路线、另一种抉择和另一门道途仍会留下不同证据与后记。</p></div>}
      </div>
    </section>
  );
}

function ClassScreen({ origin, setOrigin, profile, onBack, onStart }) {
  const current = getProfession(origin);
  const mastery = profile.jobMastery[origin] || 0;
  const nextMilestone = MASTERY_MILESTONES.find((milestone) => mastery < milestone.level);
  const starter = masteryStarterDeck(current, mastery);
  const starterSummary = starterDeckSummary(starter);
  const recipePreview = classRecipePreview(current);
  const signatureCard = current.cards.find((card) => card.baseName === MASTERY_SIGNATURE_BY_JOB[current.id] && card.refined)
    || current.cards.find((card) => card.baseName === MASTERY_SIGNATURE_BY_JOB[current.id]);
  const masteryTreasure = TREASURES.find((treasure) => treasure.id === MASTERY_TREASURE_BY_JOB[current.id]);
  return (
    <section className="mobile-shell class-screen screen-content">
      <MobileTopBar title="选择道途" subtitle="职业决定卡池与核心资源" onBack={onBack} profile={profile} />
      <div className="class-focus" style={{ "--job-color": current.color }}>
        <GameImage eager className="class-portrait" src={current.portrait} alt="" />
        <div className="class-focus-shade" />
        <div className="class-copy"><span>{current.resource}</span><h1>{current.name}</h1><p>{current.motto}</p><strong>{current.style}</strong><div className="mastery-line"><i style={{ width: `${Math.min(100, mastery)}%` }} /><small>道途熟练 {mastery}/100</small></div></div>
      </div>
      <div className="class-tabs">
        {PROFESSIONS.map((job) => {
          const unlocked = profile.unlockedJobs.includes(job.id);
          return <button key={job.id} disabled={!unlocked} className={origin === job.id ? "active" : ""} onClick={() => setOrigin(job.id)}><GameImage src={job.icon} alt="" /><span>{job.short}</span>{!unlocked && <i>锁</i>}</button>;
        })}
      </div>
      <article className="mechanic-panel">
        <span className="section-index">核心机制</span>
        <p>{current.mechanic}</p>
        <strong className="build-count">20 张专属技能 · 12 张起始牌库 · 18 套推荐构筑</strong>
        <div className="class-system-grid">
          <section className="class-cycle-card">
            <span>开局循环</span>
            <strong>{current.resource} · {current.style}</strong>
            <p>{openingStateSummary(current, mastery)}</p>
            <div className="class-cycle-tags">
              <b>攻击 {starterSummary.counts.attack}</b>
              <b>防御/恢复 {starterSummary.counts.guard}</b>
              <b>过牌 {starterSummary.counts.draw}</b>
              <b>0 费 {starterSummary.counts.zero}</b>
            </div>
          </section>
          <section className="class-signature-card">
            <span>真传核心</span>
            {signatureCard && <MiniCard card={signatureCard} />}
            <p>{signatureCard ? `${signatureCard.name} · ${signatureCard.keyword}。${signatureCard.combo}` : "完成熟练度后解锁核心真解。"}</p>
            {masteryTreasure && <small>本命法宝：{masteryTreasure.name} · {masteryTreasure.effect}</small>}
          </section>
        </div>
        <div className="mastery-rewards">
          <div className="mastery-reward-heading"><span>道途传承</span><small>{nextMilestone ? `下一层 · ${nextMilestone.level - mastery} 熟练` : "全部传承已觉醒"}</small></div>
          {MASTERY_MILESTONES.map((milestone) => <div className={`mastery-reward ${mastery >= milestone.level ? "unlocked" : ""}`} key={milestone.level}>
            <b>{milestone.level}</b><span><strong>{milestone.name}</strong><small>{milestone.effect}</small></span>
          </div>)}
        </div>
        <section className="starter-handbook">
          <div className="starter-handbook-head">
            <span>起始手札</span>
            <small>12 张 · {starterSummary.unique.length} 种基础术式 · 真解会替换同名基础牌</small>
          </div>
          <div className="starter-preview">{starter.slice(0, 8).map((card, index) => <MiniCard card={card} key={`${card.id}-${index}`} />)}</div>
          <div className="starter-card-counts">
            {starterSummary.unique.map(({ card, count }) => <span key={card.baseName || card.name}><b>{count}</b>{card.baseName || card.name}<small>{card.keyword}</small></span>)}
          </div>
        </section>
        <section className="class-recipe-preview" aria-label="职业构筑预览">
          <div className="starter-handbook-head">
            <span>推荐构筑入口</span>
            <small>真实读取流派图谱；战利页会优先补这些核心组件</small>
          </div>
          {recipePreview.map((recipe) => <article key={recipe.id}>
            <div><strong>{recipe.name}</strong><small>{recipe.rank} · {recipe.focus}</small></div>
            <p>{recipe.strategy}</p>
            <em>{recipe.components.slice(0, 5).map((card) => card.baseName).join(" / ")}</em>
          </article>)}
        </section>
      </article>
      <button className="primary-cta mobile-primary" onClick={onStart}>确认道途 · 选择章节</button>
    </section>
  );
}

function StoryScreen({ scene, index, total, choices, onChoose }) {
  return (
    <section className="story-screen screen-content">
      <GameImage eager className="story-art" src={scene.art} alt="" />
      <div className="story-gradient" />
      <div className="story-progress">{Array.from({ length: total }, (_, step) => <i className={step <= index ? "active" : ""} key={step} />)}</div>
      <div className="story-dialogue">
        <span>{scene.role}</span>
        <h1>{scene.speaker}</h1>
        <p>“{scene.text}”</p>
        {choices.length ? (
          <div className="story-choices">
            {choices.map((choice) => <button key={choice.value} onClick={() => onChoose(choice)}><strong>{choice.label}</strong><small>{choice.consequence}</small></button>)}
          </div>
        ) : <button className="story-next" onClick={() => onChoose()}>继续 <span>›</span></button>}
      </div>
    </section>
  );
}

function GrowthScreen({ profile, setProfile, onBack }) {
  const talentCost = 8;
  const upgradeCredits = Math.floor((profile.spirit || 0) / talentCost);
  const growthPlan = META_TALENTS
    .map((talent) => {
      const level = profile.talentLevels[talent.id] || 0;
      const remaining = Math.max(0, talent.max - level);
      const priority = talent.id === "edge" ? 3 : talent.id === "mind" ? 2 : 1;
      return { talent, level, remaining, priority };
    })
    .filter((item) => item.remaining > 0)
    .sort((a, b) => a.level - b.level || b.priority - a.priority)[0] || null;
  const nextShortfall = growthPlan ? Math.max(0, talentCost - (profile.spirit || 0)) : 0;
  const totalTalentLevels = META_TALENTS.reduce((sum, talent) => sum + (profile.talentLevels[talent.id] || 0), 0);
  const totalTalentCap = META_TALENTS.reduce((sum, talent) => sum + talent.max, 0);
  const incompleteCasebooks = CHAPTERS.filter((chapter) => {
    const evidence = investigationEvidence(chapter.id);
    const found = profile.investigationArchive?.[String(chapter.id)] || [];
    return evidence.length > 0 && found.length < evidence.length;
  }).length;
  const growthPrescriptions = [
    {
      label: "确定放出",
      title: "主线 / 今日试炼",
      text: upgradeCredits ? `当前可升级 ${upgradeCredits} 次，先把悟道转成战力。` : `还差 ${nextShortfall} 点悟道，优先完成一章或今日首胜。`,
    },
    {
      label: "补完收益",
      title: `${incompleteCasebooks} 卷未圆满`,
      text: incompleteCasebooks ? "重访缺证据章节，宗卷圆满会追加悟道与灵玉。" : "宗卷已圆满，资源重心可转向劫数首破。",
    },
    {
      label: "消耗节奏",
      title: growthPlan ? growthPlan.talent.name : "全树圆满",
      text: growthPlan ? `本次推荐补 ${growthPlan.talent.name}，避免单一路线被 Min/Max 成唯一答案。` : "永久成长已经完成，后续奖励转为职业熟练与挑战卷。",
    },
  ];
  const upgrade = (talent) => {
    const level = profile.talentLevels[talent.id] || 0;
    if (profile.spirit < talentCost || level >= talent.max) return;
    setProfile((value) => ({
      ...value,
      spirit: value.spirit - talentCost,
      talentLevels: { ...value.talentLevels, [talent.id]: level + 1 },
    }));
  };
  return (
    <section className="mobile-shell growth-screen screen-content">
      <MobileTopBar title="悟道树" subtitle="跨局永久成长" onBack={onBack} profile={profile} />
      <div className="growth-summary"><span>可用悟道</span><strong>{profile.spirit}</strong><p>完成章节、发现新卡牌和达成剧情结局均可获得。</p></div>
      <section className="growth-economy-ledger" aria-label="修行资源账本">
        <header>
          <span>修行账本 · 收放平衡</span>
          <strong>{totalTalentLevels}/{totalTalentCap}</strong>
        </header>
        <div className="growth-ledger-grid">
          <article>
            <small>立即满足</small>
            <b>{upgradeCredits}</b>
            <p>{upgradeCredits ? `现在可点亮 ${upgradeCredits} 次节点。` : `还差 ${nextShortfall} 点悟道可点亮下一次。`}</p>
          </article>
          <article>
            <small>延迟规划</small>
            <b>{growthPlan ? growthPlan.talent.name : "圆满"}</b>
            <p>{growthPlan ? `${growthPlan.level}/${growthPlan.talent.max} · ${growthPlan.talent.effect}` : "全部永久成长已经点满。"}</p>
          </article>
          <article>
            <small>资源来源</small>
            <b>章 / 卡 / 结局</b>
            <p>通关章节、收录新术法、补完宗卷都会继续放出悟道。</p>
          </article>
          <article>
            <small>资源消耗</small>
            <b>{talentCost}</b>
            <p>每次升级固定消耗，避免后期囤积失去意义。</p>
          </article>
        </div>
        {growthPlan && <div className="growth-next-advice">
          <span>推荐下一点</span>
          <strong>{growthPlan.talent.name}</strong>
          <p>{upgradeCredits ? "先补最低等级节点，保持开局生命、灵石和资源节奏均衡。" : "下一局优先追主线、宗卷或新卡收录，凑够一次确定成长。"}</p>
        </div>}
      </section>
      <section className="growth-prescription" aria-label="下一局成长处方">
        <header><span>下一局处方</span><strong>{upgradeCredits ? "先消耗" : "先获取"}</strong></header>
        <div>
          {growthPrescriptions.map((item) => (
            <article key={item.label}>
              <small>{item.label}</small>
              <b>{item.title}</b>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="talent-path">
        {META_TALENTS.map((talent, index) => {
          const level = profile.talentLevels[talent.id] || 0;
          const maxed = level >= talent.max;
          const affordable = profile.spirit >= talentCost && !maxed;
          const shortfall = maxed ? 0 : Math.max(0, talentCost - (profile.spirit || 0));
          return (
            <button key={talent.id} className={`talent-node ${growthPlan?.talent.id === talent.id ? "recommended" : ""} ${affordable ? "affordable" : ""} ${maxed ? "maxed" : ""}`} disabled={!affordable} onClick={() => upgrade(talent)}>
              <GameImage src={talent.art} alt="" />
              <div>
                <small>悟道节点 {index + 1}{growthPlan?.talent.id === talent.id ? " · 推荐" : ""}</small>
                <h2>{talent.name} · {level}/{talent.max}</h2>
                <p>{talent.effect}</p>
                <em>{maxed ? "已圆满" : affordable ? "可点亮" : `还差 ${shortfall} 悟道`}</em>
              </div>
              <span>{maxed ? "满" : talentCost}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CollectionScreen({ origin, setOrigin, profile, onBack }) {
  const current = getProfession(origin);
  const queryView = new URLSearchParams(window.location.search).get("collectionView");
  const [view, setView] = useState(queryView === "builds" ? "builds" : "cards");
  const [rarity, setRarity] = useState("全部");
  const shown = rarity === "全部" ? current.cards : current.cards.filter((card) => card.rarity === rarity);
  const discovered = new Set(profile.discoveredCards || []);
  const currentDiscovered = current.cards.filter((card) => discovered.has(card.id)).length;
  const refinedDiscovered = current.cards.filter((card) => card.refined && discovered.has(card.id)).length;
  const recipes = DECK_RECIPES.filter((recipe) => recipe.job === current.id);
  const recipeStates = recipes.map((recipe, index) => {
    const components = recipe.cards.map((cardId) => current.cards.find((card) => card.id === cardId)).filter(Boolean);
    const known = components.filter((card) => discovered.has(card.id));
    const missing = components.filter((card) => !discovered.has(card.id));
    return { recipe, index, components, known, missing, complete: known.length === components.length };
  });
  const completedRecipes = recipeStates.filter((state) => state.complete).length;
  const nextRecipe = recipeStates
    .filter((state) => !state.complete)
    .sort((a, b) => b.known.length - a.known.length || a.index - b.index)[0] || recipeStates[0];
  const totalCompletedRecipes = DECK_RECIPES.filter((recipe) => recipe.cards.every((cardId) => discovered.has(cardId))).length;
  return (
    <section className="mobile-shell collection-screen screen-content">
      <MobileTopBar title="藏经阁" subtitle={`${profile.discoveredCards?.length || 0}/${ALL_CARDS.length} 张术法 · ${totalCompletedRecipes}/${DECK_RECIPES.length} 套流派`} onBack={onBack} />
      <div className="collection-jobs">{PROFESSIONS.map((job) => {
        const count = job.cards.filter((card) => discovered.has(card.id)).length;
        return <button className={job.id === origin ? "active" : ""} key={job.id} onClick={() => setOrigin(job.id)}><GameImage src={job.icon} alt="" /><span>{job.short}<small>{count}/20</small></span></button>;
      })}</div>
      <div className="collection-mode" role="tablist" aria-label="藏经阁分类">
        <button className={view === "cards" ? "active" : ""} onClick={() => setView("cards")} role="tab" aria-selected={view === "cards"}><span>术法卷</span><small>{currentDiscovered}/20</small></button>
        <button className={view === "builds" ? "active" : ""} onClick={() => setView("builds")} role="tab" aria-selected={view === "builds"}><span>流派图谱</span><small>{completedRecipes}/18</small></button>
      </div>
      {view === "cards" ? (
        <>
          <div className="rarity-filter">{["全部", "普通", "精良", "稀有", "传说"].map((item) => <button className={item === rarity ? "active" : ""} key={item} onClick={() => setRarity(item)}>{item}</button>)}</div>
          <div className="collection-count"><span>{current.name} · 真解 {refinedDiscovered}/10</span><strong>{currentDiscovered} / 20</strong></div>
          <div className="collection-progress"><i><b style={{ width: `${currentDiscovered * 5}%` }} /></i><small>{currentDiscovered === 20 ? "本门术法已全部收录" : `再发现 ${20 - currentDiscovered} 张，补全本门卷册`}</small></div>
          <div className="card-library">{shown.map((card) => <LibraryCard card={card} discovered={discovered.has(card.id)} key={card.id} />)}</div>
        </>
      ) : (
        <>
          <div className="build-atlas-intro">
            <div><small>{current.name} · 构筑研习</small><strong>{completedRecipes}<i>/18</i></strong></div>
            <p>每卷由五张核心术法构成。收录全部组件即可成卷，并获得一条清晰的出牌思路。</p>
          </div>
          {nextRecipe && <section className={`build-target-panel ${nextRecipe.complete ? "complete" : ""}`} aria-label="下一套流派追踪">
            <div>
              <span>{nextRecipe.complete ? "已成卷示范" : "下一卷追踪"}</span>
              <strong>{nextRecipe.recipe.name}</strong>
              <p>{nextRecipe.complete ? nextRecipe.recipe.strategy : `${nextRecipe.recipe.focus} · 还缺 ${nextRecipe.missing.length} 张核心术法。优先在战利、坊市和异闻中寻找这些关键词。`}</p>
            </div>
            <div className="build-target-missing">
              {(nextRecipe.complete ? nextRecipe.components : nextRecipe.missing).slice(0, 5).map((card) => (
                <span className={discovered.has(card.id) ? "known" : ""} key={card.id}>
                  <b>{discovered.has(card.id) ? card.name : "未收录"}</b>
                  <small>{card.type} · {card.rarity} · {card.keyword}</small>
                </span>
              ))}
            </div>
            <i className="build-target-bar"><b style={{ width: `${nextRecipe.known.length * 20}%` }} /></i>
          </section>}
          <div className="build-library">
            {recipeStates.map((state) => <BuildRecipeCard key={state.recipe.id} state={state} discovered={discovered} />)}
          </div>
        </>
      )}
    </section>
  );
}

function BuildRecipeCard({ state, discovered }) {
  const { recipe, index, components, known, complete } = state;
  const missing = components.length - known.length;
  return (
    <article className={`build-recipe ${complete ? "complete" : ""}`}>
      <header>
        <span>卷 {String(index + 1).padStart(2, "0")} · {recipe.rank}</span>
        <b>{complete ? "已成卷" : `缺 ${missing} 张`}</b>
      </header>
      <h2>{recipe.name}</h2>
      <p className="build-focus">{recipe.focus} · {recipe.rankNote}</p>
      <div className="build-keywords">{recipe.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
      <div className="build-components">
        {components.map((card) => (
          <div className={discovered.has(card.id) ? "known" : "unknown"} key={card.id}>
            <GameImage src={discovered.has(card.id) ? card.art : "/card_back_qinglan_trial.png"} alt="" />
            <small>{discovered.has(card.id) ? card.name : `未收录组件 · ${card.keyword}`}</small>
          </div>
        ))}
      </div>
      <div className="build-progress"><i><b style={{ width: `${known.length * 20}%` }} /></i><span>{known.length}/5</span></div>
      <p className="build-strategy">{complete ? recipe.strategy : `继续在战利、坊市或异闻中寻找 ${missing} 张核心术法；优先留意 ${components.filter((card) => !discovered.has(card.id)).map((card) => card.keyword).slice(0, 3).join("、")} 关键词。`}</p>
    </article>
  );
}

function MiniCard({ card }) {
  return <div className="mini-card"><GameImage src={card.art} alt="" /><span>{card.cost}</span><small>{card.name}</small></div>;
}

function LibraryCard({ card, discovered }) {
  if (!discovered) {
    return <article className="library-card undiscovered"><div className="unknown-card-art"><GameImage src="/card_back_qinglan_trial.png" alt="" /><b>?</b></div><div><small>{card.rarity} · {card.type}</small><h3>未收录术法</h3><p>{card.refined ? `精研「${card.baseName}」后收录真解。` : `在战利、坊市或山中异闻中发现 · 关键词「${card.keyword}」`}</p></div></article>;
  }
  return <article className={`library-card rarity-${card.rarity} ${card.refined ? "refined-card" : ""}`}><GameImage src={card.art} alt="" /><div><span>{card.cost}</span><small>{card.rarity} · {card.type}</small><h3>{card.name}</h3><p>{card.text}</p></div></article>;
}

function TitleScreen({ origin, setOrigin, selectedOrigin, beginRun, setOverlay }) {
  return (
    <section className="title-screen screen-content">
      <header className="title-nav">
        <span className="brand-mark">青</span>
        <span className="eyebrow">青岚谷 · 外门试炼</span>
        <nav>
          <button onClick={() => setOverlay("guide")}>试炼札记</button>
          <button onClick={() => setOverlay("codex")}>图鉴</button>
          <button onClick={() => setOverlay("settings")}>设置</button>
        </nav>
      </header>
      <div className="title-copy">
        <p className="eyebrow">月下入谷，抽牌成术</p>
        <h1>青岚<br /><em>夜行</em></h1>
        <p className="lead">一个无名外门弟子，在妖影与山门之间，<br />寻找一线筑基机缘。</p>
      </div>
      <aside className="run-setup">
        <span className="section-index">壹 · 择道</span>
        <h2>今夜以何法入山？</h2>
        <div className="origin-list">
          {origins.map((item) => (
            <button
              key={item.id}
              className={origin === item.id ? "origin active" : "origin"}
              onClick={() => setOrigin(item.id)}
            >
              <GameImage src={item.icon} alt="" />
              <span><strong>{item.name}</strong><small>{item.line}</small></span>
              <i>选择</i>
            </button>
          ))}
        </div>
        <div className="run-seal">
          <div>
            <small>当前道途</small>
            <strong>{selectedOrigin.name}</strong>
          </div>
          <div>
            <small>月相</small>
            <strong>霜月护体</strong>
          </div>
        </div>
        <button className="primary-cta" onClick={beginRun}><span>启程入谷</span><kbd>Enter</kbd></button>
      </aside>
      <footer className="title-footer"><span>三幕试炼</span><span>可复现种子</span><span>自动存档</span></footer>
    </section>
  );
}

function RunHeader({ stage, chapter, hp, maxHp, stones, runMode, runSeed, runTrial, runTribulation, routeProgress = Math.max(0, stage - 1) }) {
  const chapterData = CHAPTERS[chapter - 1];
  const routeStep = Math.min(4, routeProgress + 1);
  const storySubtitle = runTribulation?.level
    ? `第 ${chapter} 章 · ${chapterData?.region} · ${runTribulation.name} · 路线 ${routeStep}/4`
    : `第 ${chapter} 章 · ${chapterData?.region} · 路线 ${routeStep}/4`;
  return (
    <header className="run-header">
      <div className="run-brand"><span className="brand-mark small">青</span><div><strong>{runMode === "daily" ? "今日试炼" : runMode === "challenge" ? "挑战复刻" : runTribulation?.level ? "劫数云游" : "青岚夜行"}</strong><small>{runMode !== "story" ? `${runTrial?.modifier?.name || "标准规则"} · ${runSeed}` : storySubtitle}</small></div></div>
      <div className="run-progress"><span style={{ width: `${routeStep * 25}%` }} /></div>
      <div className="header-resources"><span><GameImage src="/ui/icons/hp.png" alt="" />{hp}/{maxHp}</span><span><GameImage src="/ui/icons/stones.png" alt="" />{stones}</span></div>
    </header>
  );
}

function RunNotebook({ notebook, compact = false, className = "" }) {
  if (!notebook) return null;
  const shownItems = compact ? notebook.items.slice(0, 3) : notebook.items;
  return (
    <aside className={`run-notebook ${compact ? "compact" : ""} ${className}`}>
      <header>
        <span>试炼札记</span>
        <strong>{notebook.title}</strong>
        <small>{notebook.subtitle}</small>
      </header>
      <div className="notebook-lines">
        {shownItems.map((item) => (
          <article key={item.key}>
            <b>{item.label}</b>
            <em>{item.value}</em>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <footer>{notebook.advice}</footer>
    </aside>
  );
}

function MapScreen({ stage, chapter, hp, maxHp, stones, enterCombat, setScreen, openEncounterPrelude, openBossPrelude, openMarket, openRest, openTraining, routeProgress, choices, chronicle, clues, pendingClue, nextEnemyShield = 0, profile, treasures, deck, origin, runMode, runSeed, runTrial, runTribulation, onChooseNode }) {
  const chapterRoutes = CHAPTER_ROUTES[chapter] || ROUTE_ROWS;
  const baseChoices = chapterRoutes[Math.min(routeProgress, chapterRoutes.length - 1)];
  const currentChoices = [
    ...baseChoices,
    ...(routeProgress === 1 ? [{ id: "rest", kind: "调息", name: "避雨灵泉", desc: "恢复血线、温养术法或整理应急小物。", art: "/bg_spirit_rift.png" }] : []),
    ...(routeProgress === 2 ? [{ id: "training", kind: "修炼", name: "问心石阶", desc: "开拓灵气、精研核心牌或忘却冗余。", art: "/bg_soul_shrine.png" }] : []),
  ];
  const chapterCopy = CHAPTER_ROUTE_COPY[chapter];
  const investigation = CHAPTER_INVESTIGATIONS[chapter];
  const build = currentBuildState(deck, origin);
  const notebook = createRunNotebook({ screen: "map", chapter, stage, routeProgress, hp, maxHp, stones, deck, origin: getProfession(origin), clues, pendingClue, profile });
  const routePacing = [
    { beat: "序", mood: "入局", tension: 24, cue: "先读线索与局内目标，选择一条能补足牌组或调查的路。" },
    { beat: "破", mood: "分歧", tension: 48, cue: "风险开始分化：保血、拿牌或推进证据会互相牵扯。" },
    { beat: "破", mood: "加压", tension: 72, cue: "首领前的最后塑形点，优先修补构筑短板或带回关键证据。" },
    { beat: "急", mood: "临门", tension: 94, cue: "所有选择都将导向首领前夜，确认资源、线索与命途回响。" },
  ][Math.min(routeProgress, 3)];
  const nextKinds = chapterRoutes.slice(routeProgress + 1).map((row) => row.map((node) => node.kind).join(" / "));
  const latestEcho = chronicle.at(-1) || choices.at(-1) || "尚未留下本局抉择，下一处节点会成为本章第一枚回响。";
  const currentEvidence = pendingClue?.text || clues.at(-1) || investigation?.opening || "本章证据尚未带回。";
  const nextConsequence = nextEnemyShield > 0
    ? `下一战敌方开局护体 +${nextEnemyShield}`
    : routeProgress >= 3
      ? chapterCopy.bossConsequence
      : chapterCopy.beats[Math.min(routeProgress + 1, chapterCopy.beats.length - 1)];
  const routeMeta = {
    story: { risk: "无战斗", reward: "剧情线索", consequence: chapterCopy.storyConsequence },
    battle: { risk: "危险 · 低", reward: "职业卡牌", consequence: "稳定补强牌组" },
    event: { risk: "危险 · 未知", reward: "恢复 / 悟道", consequence: "可能留下本局印记" },
    elite: { risk: "危险 · 高", reward: "稀有牌 / 法宝", consequence: "首领前最后试炼" },
    market: { risk: `持有 ${stones} 灵石`, reward: "购牌 / 删牌", consequence: "牺牲经济换稳定性" },
    rest: { risk: "无战斗", reward: "恢复 / 精研 / 小物", consequence: "放弃战利，稳定血线" },
    training: { risk: "无战斗", reward: "灵气 / 精研 / 压缩", consequence: "永久改变本局牌组节奏" },
    boss: { risk: "首领战", reward: "章节突破", consequence: chapterCopy.bossConsequence },
  };
  const chooseNode = (node) => {
    const clue = investigation?.routes?.[routeProgress]?.[node.id];
    onChooseNode(node, clue);
    if (node.id === "boss") openBossPrelude();
    else if (["battle", "elite"].includes(node.id)) openEncounterPrelude(node.id === "elite" ? 2 : 1);
    else if (node.id === "event" || node.id === "story") setScreen("event");
    else if (node.id === "rest") openRest();
    else if (node.id === "training") openTraining();
    else openMarket();
  };
  return (
    <section className="map-screen campaign-map screen-content">
      <RunHeader stage={stage} chapter={chapter} hp={hp} maxHp={maxHp} stones={stones} runMode={runMode} runSeed={runSeed} runTrial={runTrial} runTribulation={runTribulation} routeProgress={routeProgress} />
      <div className="map-intro">
        <span className="section-index">第 {chapter} 章 · 路线 {routeProgress + 1}/4</span>
        <h1>{chapterCopy.title}</h1>
        <p>选择会改变资源、人物关系与后续剧情。首领在山门尽头等你。</p>
      </div>
      {runTribulation?.level > 0 && <div className="run-tribulation-strip">
        <span>{runTribulation.short}</span>
        <strong>{runTribulation.name}</strong>
        <p>{runTribulation.risk}</p>
        <small>本章首破：灵玉 +{runTribulation.reward.jade} · 悟道 +{runTribulation.reward.spirit} · 称号「{runTribulation.reward.title}」</small>
      </div>}
      {investigation && <div className="investigation-strip">
        <div><small>本章调查</small><strong>{investigation.objective}</strong></div>
        <span>{clues.length}/5</span>
        <i><b style={{ width: `${Math.min(100, clues.length * 20)}%` }} /></i>
        <p>{clues.at(-1) || "完成开场剧情后获得第一条线索。"}</p>
      </div>}
      <div className="route-causality-strip" aria-label="本章因果线索">
        <article>
          <small>上一因</small>
          <strong>{latestEcho}</strong>
        </article>
        <article>
          <small>当前证</small>
          <strong>{currentEvidence}</strong>
        </article>
        <article className={nextEnemyShield > 0 ? "debt" : ""}>
          <small>下一果</small>
          <strong>{nextConsequence}</strong>
        </article>
      </div>
      <RunNotebook notebook={notebook} className="map-notebook" />
      <div className="route-journey">
        <div className="route-pacing" aria-label={`当前路线节奏：${routePacing.beat}，${routePacing.mood}`}>
          <div className="route-pacing-seal">
            <strong>{routePacing.beat}</strong>
            <small>{routePacing.mood}</small>
          </div>
          <div className="route-pacing-copy">
            <span>路线张力 · {routePacing.tension}%</span>
            <i><b style={{ width: `${routePacing.tension}%` }} /></i>
            <p>{routePacing.cue}</p>
          </div>
          <div className="route-pacing-next">
            <small>将至</small>
            <strong>{nextKinds[0] || "首领前夜"}</strong>
          </div>
        </div>
        <div className="route-progress-scroll">
          {chapterRoutes.map((row, index) => <i key={index} className={index < routeProgress ? "done" : index === routeProgress ? "current" : ""}><span>{index + 1}</span></i>)}
        </div>
        <div className="route-now">
          <span className="section-index">命途所至</span>
          <strong>{chapterCopy.beats[routeProgress]}</strong>
          {build && <div className="route-build-goal"><small>{build.label} · {build.recipe.rank}</small><b>{build.recipe.name}</b><em>{build.progress}/5</em></div>}
        </div>
        <div className={`route-choice-grid choices-${currentChoices.length}`}>
          {currentChoices.map((node, index) => {
            const meta = routeMeta[node.id];
            return (
              <button className="route-choice-card" key={node.id} onClick={() => chooseNode(node)} style={{ "--choice-delay": `${index * 100}ms` }}>
                <GameImage src={node.art} alt="" />
                <div className="route-choice-shade" />
                <span className="route-choice-kind">{node.kind}</span>
                <div className="route-choice-copy">
                  <h2>{node.name}</h2>
                  <p>{node.desc}</p>
                  <div className="route-choice-facts"><b>{meta.risk}</b><b>{meta.reward}</b></div>
                  <small>{meta.consequence}</small>
                  <strong>踏入此处 <i>›</i></strong>
                </div>
              </button>
            );
          })}
        </div>
        <div className="route-forecast">
          <span>后续命途</span>
          {nextKinds.map((kinds, index) => <b key={index}>{kinds}</b>)}
          {!nextKinds.length && <b>首领前夜 / 章末突破</b>}
        </div>
      </div>
      <div className="map-side-note"><span>本章线索</span><p>{chapterCopy.clue}</p></div>
      {chronicle.length > 0 && <aside className="run-chronicle">
        <span>命途回响</span>
        {chronicle.slice(-3).map((entry, index) => <p key={`${entry}-${index}`}>{entry}</p>)}
      </aside>}
      <TreasureStrip treasures={treasures} />
    </section>
  );
}

function EncounterPreludeScreen({ chapter, stage, seen, onBegin }) {
  const prelude = resolveEncounterPrelude(chapter, stage);
  const [beatIndex, setBeatIndex] = useState(seen ? 1 : 0);
  const startingRef = useRef(false);
  if (!prelude) return null;
  const beat = prelude.beats[Math.min(beatIndex, prelude.beats.length - 1)];
  const isLast = beatIndex >= prelude.beats.length - 1;
  const advance = () => {
    if (!isLast) {
      setBeatIndex((value) => value + 1);
      return;
    }
    if (startingRef.current) return;
    startingRef.current = true;
    onBegin();
  };
  return (
    <section className={`encounter-prelude stage-${stage} screen-content`}>
      <div className="encounter-prelude-art"><GameImage eager src={prelude.enemy.art} alt={prelude.enemy.name} /></div>
      <div className="encounter-prelude-vignette" />
      <div className="encounter-prelude-copy">
        <span className="section-index">{prelude.eyebrow}</span>
        <h1>{prelude.title}</h1>
        <p>{prelude.setting}</p>
        <article key={`${chapter}-${stage}-${beatIndex}`}>
          <small>{beat.speaker}</small>
          <strong>{beat.text}</strong>
        </article>
        <div className="encounter-prelude-lesson"><small>{stage === 1 ? "本章机制" : "精英考核"}</small><b>{prelude.lesson}</b></div>
        <button onClick={advance}><span>{isLast ? `迎战 · ${prelude.enemy.name}` : "观察敌人"}</span><b>›</b></button>
        {seen && <em className="encounter-seen">已调查 · 再次遭遇时跳过第一段对白</em>}
      </div>
      <aside>
        <span>{prelude.enemy.archetype}</span>
        <strong>{prelude.enemy.trait}</strong>
        <p>{prelude.enemy.counter}</p>
      </aside>
    </section>
  );
}

function BossPreludeScreen({ chapter, choices, clues, onBegin }) {
  const prelude = resolveBossPrelude(chapter, choices);
  const [beatIndex, setBeatIndex] = useState(0);
  const startingRef = useRef(false);
  const boss = ENCOUNTER_ENEMIES[chapter][3];
  const beats = prelude?.beats || [];
  const beat = beats[Math.min(beatIndex, Math.max(0, beats.length - 1))];
  const isLast = beatIndex >= beats.length - 1;
  const advance = () => {
    if (!isLast) {
      setBeatIndex((value) => value + 1);
      return;
    }
    if (startingRef.current) return;
    startingRef.current = true;
    onBegin();
  };
  if (!prelude || !beat) return null;
  return (
    <section className="boss-prelude screen-content">
      <div className="boss-prelude-art"><GameImage eager src={prelude.art} alt="" /><div /></div>
      <div className="boss-prelude-copy">
        <span className="section-index">{prelude.eyebrow}</span>
        <h1>{prelude.name}</h1>
        <p className="boss-prelude-setting">{prelude.setting}</p>
        <article className="boss-prelude-dialogue" key={`${chapter}-${beatIndex}`}>
          <small>{beat.speaker}</small>
          <strong>{beat.text}</strong>
        </article>
        <div className="boss-prelude-progress" aria-label={`对白 ${beatIndex + 1}/${beats.length}`}>
          {beats.map((_, index) => <i key={index} className={index <= beatIndex ? "active" : ""} />)}
        </div>
        <button className="boss-prelude-action" onClick={advance}>
          <span>{isLast ? `迎战 · ${boss.name}` : "继续听下去"}</span><b>›</b>
        </button>
      </div>
      <aside className="boss-prelude-dossier">
        <span>首领敌情</span>
        <strong>{boss.name}</strong>
        <small>{boss.archetype} · {boss.trait}</small>
        <p>{boss.counter}</p>
        {prelude.dossier && <div className="boss-dossier-lore">
          <section><em>来历</em><b>{prelude.dossier.origin}</b></section>
          <section><em>执念</em><b>{prelude.dossier.obsession}</b></section>
          <section><em>破绽</em><b>{prelude.dossier.weakness}</b></section>
        </div>}
        <div><em>调查证据</em><b>{clues.length}/5</b></div>
        {prelude.choice && <div className="boss-prelude-choice"><em>将被回应的抉择</em><b>{prelude.choice}</b></div>}
      </aside>
    </section>
  );
}

function RestScreen({ hp, maxHp, deck, origin, randomSeed, routeProgress, setHp, setDeck, setConsumables, onComplete }) {
  const resolvedRef = useRef(false);
  const upgradable = deck.map((card, index) => ({ card, index, next: refinedVersion(card, origin) })).filter((item) => item.next);
  const resolve = (kind) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (kind === "heal") setHp((value) => Math.min(maxHp, value + 18));
    if (kind === "refine") {
      setHp((value) => Math.min(maxHp, value + 8));
      if (upgradable.length) {
        const chosen = upgradable[Math.floor(seededRandom(randomSeed, `rest-refine:${routeProgress}`) * upgradable.length)];
        setDeck((value) => value.map((card, index) => index === chosen.index ? chosen.next : card));
      }
    }
    if (kind === "supply") {
      setHp((value) => Math.min(maxHp, value + 6));
      const keys = ["spirit", "skin", "clarity", "thunder"];
      const key = keys[Math.floor(seededRandom(randomSeed, `rest-supply:${routeProgress}`) * keys.length)];
      setConsumables((value) => ({ ...value, [key]: (value[key] || 0) + 1 }));
    }
    onComplete();
  };
  return (
    <section className="sanctuary-screen screen-content">
      <div className="sanctuary-copy"><span className="section-index">路线节点 · 调息</span><h1>灵泉避雨</h1><p>泉声盖过山中的低语。你只能选择一种方式整理身心，然后继续赶路。</p><strong>当前生命 {hp}/{maxHp} · 可精研 {upgradable.length} 张</strong></div>
      <div className="sanctuary-options">
        <button onClick={() => resolve("heal")}><small>静息回元</small><strong>恢复 18 点生命</strong><span>最稳定的选择，适合首领战前保住血线。</span></button>
        <button disabled={!upgradable.length} onClick={() => resolve("refine")}><small>温养术法</small><strong>恢复 8 点并随机精研</strong><span>{upgradable.length ? `从 ${upgradable.length} 张候选中精研一张。` : "当前牌组已无可精研术法。"}</span></button>
        <button onClick={() => resolve("supply")}><small>整理行囊</small><strong>恢复 6 点并补充小物</strong><span>随机获得聚气散、石肤符、清神粉或阴雷子。</span></button>
      </div>
    </section>
  );
}

function TrainingScreen({ deck, origin, maxQi, setMaxQi, setDeck, onComplete }) {
  const resolvedRef = useRef(false);
  const upgradable = deck.map((card, index) => ({ card, index, next: refinedVersion(card, origin) })).filter((item) => item.next);
  const removable = deck
    .map((card, index) => ({ card, index, score: card.cost * 3 + deck.filter((item) => item.name === card.name).length }))
    .sort((a, b) => b.score - a.score);
  const resolve = (kind) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (kind === "qi") setMaxQi((value) => Math.min(5, value + 1));
    if (kind === "refine" && upgradable.length) {
      const chosen = upgradable[0];
      setDeck((value) => value.map((card, index) => index === chosen.index ? chosen.next : card));
    }
    if (kind === "remove" && removable.length && deck.length > 8) {
      setDeck((value) => value.filter((_, index) => index !== removable[0].index));
    }
    onComplete();
  };
  return (
    <section className="sanctuary-screen training-screen screen-content">
      <div className="sanctuary-copy"><span className="section-index">路线节点 · 修炼</span><h1>问心石阶</h1><p>石阶只允许带走一种领悟。增长上限、强化核心，或者承认某张牌已经不再适合你。</p><strong>灵气上限 {maxQi} · 牌组 {deck.length} 张</strong></div>
      <div className="sanctuary-options">
        <button disabled={maxQi >= 5} onClick={() => resolve("qi")}><small>吐纳周天</small><strong>灵气上限 +1</strong><span>{maxQi >= 5 ? "本局灵气上限已臻圆满。" : "提高每回合可使用术法的总量。"}</span></button>
        <button disabled={!upgradable.length} onClick={() => resolve("refine")}><small>推演真解</small><strong>精研「{upgradable[0]?.card.name || "无候选"}」</strong><span>优先强化牌组中尚未精研的核心术法。</span></button>
        <button disabled={deck.length <= 8} onClick={() => resolve("remove")}><small>斩却冗余</small><strong>忘却「{removable[0]?.card.name || "无候选"}」</strong><span>优先移除高费或重复牌，让抽牌循环更紧凑。</span></button>
      </div>
    </section>
  );
}

function MarketScreen({ chapter, origin, deck, setDeck, hp, maxHp, setHp, stones, setStones, consumables, setConsumables, treasures, setTreasures, setMaxQi, setProfile, randomSeed, routeProgress, visit, setVisit, onLeave }) {
  const market = CHAPTER_MARKETS[chapter];
  const visitKey = `${chapter}:${routeProgress}`;
  const [notice, setNotice] = useState(`${market.name}可多次交易，离开后路线才会推进。`);
  const sold = visit?.key === visitKey ? (visit.sold || []) : [];
  const specialUsed = visit?.key === visitKey && Boolean(visit.specialUsed);
  const treasureBought = visit?.key === visitKey && Boolean(visit.treasureBought);
  const leavingRef = useRef(false);
  const offers = useMemo(() => {
    const score = (card) => {
      const text = `${card.text}${card.combo || ""}`;
      if (market.bias === "low-cost") return (3 - card.cost) * 4 + Number(!card.refined) * 3;
      if (market.bias === "defense") return Number(/护盾|恢复|驱散|净除/.test(text)) * 9 + (3 - card.cost);
      if (market.bias === "power") return card.cost * 3 + Number(card.refined) * 7 + Number(["稀有", "传说"].includes(card.rarity)) * 5;
      if (market.bias === "cycle") return Number(/抽|返回手牌|复制|发现|回收/.test(text)) * 9 + Number(card.rarity === "稀有") * 4;
      if (market.bias === "afterlife") return Number(/净除|抽|返回手牌|复制|洗回|恢复/.test(text)) * 8 + Number(card.refined) * 5;
      return Number(["稀有", "传说"].includes(card.rarity)) * 7 + Number(card.refined) * 8 + card.tier;
    };
    const pool = origin.cards.filter((card) => chapter >= 3 || !card.refined);
    return [...pool].map((card) => ({ card, order: score(card) + seededRandom(randomSeed, `market:${chapter}:${routeProgress}:${card.id}`) * 3 })).sort((a, b) => b.order - a.order).slice(0, 3).map((item) => item.card);
  }, [chapter, market.bias, origin.id, randomSeed, routeProgress]);
  const discount = treasureValue(treasures, "marketDiscount");
  const priceFor = (card) => Math.max(4, ({ 普通: 10, 精良: 13, 稀有: 17, 传说: 22 }[card.rarity] || 12) + market.cardPrice + (card.refined ? 4 : 0) - discount);
  const pricedOffers = offers.map((card) => ({
    card,
    price: priceFor(card),
    sold: sold.includes(card.id),
    fit: rewardFit(card, deck, origin.id),
  }));
  const treasureOffer = useMemo(() => {
    const pool = TREASURES.filter((treasure) => !treasures.some((owned) => owned.id === treasure.id));
    return pool[Math.floor(seededRandom(randomSeed, `market-treasure:${chapter}:${routeProgress}`) * pool.length)] || null;
  }, [chapter, randomSeed, routeProgress]);
  const treasurePrice = treasureOffer ? Math.max(12, market.treasureCost - discount) : 0;
  const openOffers = pricedOffers.filter((item) => !item.sold);
  const affordableOffers = openOffers.filter((item) => stones >= item.price);
  const cheapestOffer = [...openOffers].sort((a, b) => a.price - b.price)[0] || null;
  const bestOffer = [...affordableOffers].sort((a, b) => b.fit.score - a.fit.score || a.price - b.price)[0] || null;
  const serviceCosts = [
    market.removeCost,
    market.refineCost,
    treasureOffer && !treasureBought && !treasures.some((item) => item.id === treasureOffer.id) ? treasurePrice : Infinity,
  ].filter(Number.isFinite);
  const cheapestService = serviceCosts.length ? Math.min(...serviceCosts) : Infinity;
  const cheapestTrade = Math.min(cheapestOffer?.price ?? Infinity, cheapestService);
  const canTradeNow = stones >= cheapestTrade;
  const economyState = canTradeNow ? "可交易" : "灵石紧缺";
  const economyAdvice = bestOffer
    ? `优先看「${bestOffer.card.name}」：${bestOffer.fit.reason}，买后余 ${stones - bestOffer.price}。`
    : cheapestOffer
      ? `最低价术法尚缺 ${cheapestOffer.price - stones} 灵石；可先评估专属交易、忘却冗牌或直接离开保血。`
      : treasureOffer && stones >= treasurePrice
        ? `卡牌货架已清，可用 ${treasurePrice} 灵石换法宝，或保留灵石进入下一段路线。`
        : "货架已接近清空，优先用精研、忘却或专属交易整理牌组。";
  const sourceSinkLine = market.special.cost.includes("+") || market.special.title.includes("+")
    ? "本章专属交易偏向放出资源，可补足灵石缺口。"
    : "购牌、法宝、精研和忘却都会消耗灵石，别把下段路线预算花空。";
  const buy = (card) => {
    const price = priceFor(card);
    if (sold.includes(card.id)) return setNotice(`「${card.name}」已经收入行囊。`);
    if (stones < price) return setNotice(`灵石不足：购入「${card.name}」还差 ${price - stones}。`);
    setStones((value) => value - price);
    setDeck((value) => [...value, card]);
    setVisit((value) => ({ ...(value.key === visitKey ? value : { key: visitKey, sold: [], specialUsed: false, treasureBought: false }), sold: [...new Set([...(value.key === visitKey ? value.sold || [] : []), card.id])] }));
    setNotice(`购得「${card.name}」，剩余 ${stones - price} 灵石。牌组增至 ${deck.length + 1} 张。`);
  };
  const remove = (index) => {
    if (stones < market.removeCost || deck.length <= 8) return;
    const card = deck[index];
    setStones((value) => value - market.removeCost);
    setDeck((value) => value.filter((_, cardIndex) => cardIndex !== index));
    setNotice(`净心完成：已忘却「${card.name}」。`);
  };
  const refine = (index) => {
    const next = refinedVersion(deck[index], origin);
    if (!next || stones < market.refineCost) return;
    setStones((value) => value - market.refineCost);
    setDeck((value) => value.map((card, cardIndex) => cardIndex === index ? next : card));
    setNotice(`精研完成：「${deck[index].name}」化为「${next.name}」。`);
  };
  const buyTreasure = () => {
    const price = Math.max(12, market.treasureCost - discount);
    if (!treasureOffer || treasureBought || stones < price || treasures.some((item) => item.id === treasureOffer.id)) return;
    setStones((value) => value - price);
    setTreasures((value) => [...value, treasureOffer]);
    setProfile((value) => ({ ...value, discoveredTreasures: [...new Set([...(value.discoveredTreasures || []), treasureOffer.id])] }));
    if (treasureOffer.maxQi) setMaxQi((value) => Math.min(5, value + treasureOffer.maxQi));
    setVisit((value) => ({ ...(value.key === visitKey ? value : { key: visitKey, sold: [], specialUsed: false }), treasureBought: true }));
    setNotice(`淘得法宝「${treasureOffer.name}」：${treasureOffer.effect}。`);
  };
  const specialTrade = () => {
    if (specialUsed) return;
    if (market.special.id === "duplicate") {
      const duplicateIndex = deck.findIndex((card, index) => deck.findIndex((item) => item.id === card.id) !== index);
      if (duplicateIndex < 0 || deck.length <= 8) return setNotice("当前没有可寄卖的重复术法。");
      const card = deck[duplicateIndex];
      setDeck((value) => value.filter((_, index) => index !== duplicateIndex));
      setStones((value) => value + 6);
      setNotice(`旧卷回收：「${card.name}」换得 6 灵石。`);
    }
    if (market.special.id === "purge") {
      const curseIndex = deck.findIndex((card) => card.job === "curse" || card.type === "心魔");
      if (curseIndex >= 0) {
        setDeck((value) => value.filter((_, index) => index !== curseIndex));
        setNotice("无名火焚去一张心魔。");
      } else {
        setConsumables((value) => ({ ...value, clarity: value.clarity + 1 }));
        setNotice("无心魔可净除，摊主赠予 1 份清神粉。");
      }
    }
    if (market.special.id === "thunder-refine") {
      const index = deck.findIndex((card) => refinedVersion(card, origin));
      setHp((value) => Math.max(1, value - 6));
      if (index >= 0) {
        const next = refinedVersion(deck[index], origin);
        setDeck((value) => value.map((card, cardIndex) => cardIndex === index ? next : card));
        setNotice(`借炉引雷：「${deck[index].name}」化为真解。`);
      } else {
        setStones((value) => value + 12);
        setNotice("无术可精研，雷炉残金换得 12 灵石。");
      }
    }
    if (market.special.id === "shadow") {
      setHp((value) => Math.max(1, value - 8));
      setStones((value) => value + 14);
      setNotice("影子被典当一角，获得 14 灵石。");
    }
    if (market.special.id === "rewrite") {
      if (stones < 8) return setNotice("交换命页至少需要 8 灵石。");
      const index = deck.findIndex((card) => refinedVersion(card, origin));
      if (index >= 0) {
        const next = refinedVersion(deck[index], origin);
        setStones((value) => value - 8);
        setDeck((value) => value.map((card, cardIndex) => cardIndex === index ? next : card));
        setNotice(`命页重写：「${deck[index].name}」化为真解。`);
      } else {
        setConsumables((value) => ({ ...value, spirit: value.spirit + 1 }));
        setNotice("无术可重写，命页化作 1 份聚气散。");
      }
    }
    if (market.special.id === "moon-debt") {
      if (deck.length <= 8) {
        setConsumables((value) => ({ ...value, clarity: value.clarity + 1 }));
        setNotice("牌组已足够精简，摆渡使留下一份清神粉。");
      } else {
        const candidates = deck
          .map((card, index) => ({ card, index }))
          .filter(({ card }) => card.type !== "心魔")
          .sort((a, b) => b.card.cost - a.card.cost || b.card.tier - a.card.tier);
        const removed = candidates[0];
        if (removed) {
          setDeck((value) => value.filter((_, index) => index !== removed.index));
          setHp((value) => Math.min(maxHp, value + 16));
          setNotice(`偿还未行之路：忘却「${removed.card.name}」，恢复 16 点生命。`);
        }
      }
    }
    setVisit((value) => ({ ...(value.key === visitKey ? value : { key: visitKey, sold: [], treasureBought: false }), specialUsed: true }));
  };
  const analysis = analyzeDeck(deck);
  return (
    <section className={`market-screen market-chapter-${chapter} screen-content`}>
      <header className="market-header">
        <div><span className="section-index">{market.eyebrow}</span><h1>{market.name}</h1><p>{market.description}</p></div>
        <div className="market-wallet"><GameImage src="/ui/icons/stones.png" alt="" /><span>灵石</span><strong>{stones}</strong></div>
      </header>
      <div className="market-notice">{notice}</div>
      <div className={`market-economy ${canTradeNow ? "trade-ready" : "trade-tight"}`}>
        <article>
          <small>预算状态 · {economyState}</small>
          <strong>{economyAdvice}</strong>
          <p>{sourceSinkLine}</p>
        </article>
        <div>
          <span><b>{stones}</b><small>当前灵石</small></span>
          <span><b>{Number.isFinite(cheapestTrade) ? cheapestTrade : "—"}</b><small>最低交易</small></span>
          <span><b>{discount || "无"}</b><small>木牌折扣</small></span>
        </div>
      </div>
      <div className="market-layout">
        <section className="market-stall">
          <div className="market-section-title"><span>{market.stall}</span><small>{market.stockNote}</small></div>
          <div className="market-offers">
            {pricedOffers.map(({ card, price, fit, sold: itemSold }, index) => {
              const unavailable = stones < price || itemSold;
              const afterBuy = stones - price;
              return <div className={`market-offer ${itemSold ? "sold" : unavailable ? "unaffordable" : ""}`} key={card.id}>
                <small className={`market-fit fit-${fit.rank}`}>{fit.reason}</small>
                <div className="market-offer-economy">
                  <span>{itemSold ? "库存已空" : stones >= price ? `买后余 ${afterBuy}` : `尚缺 ${price - stones}`}</span>
                  <b>{fit.rank}契合</b>
                </div>
                <Card card={card} index={index} playable={!unavailable} onClick={() => buy(card)} />
                <button disabled={unavailable} onClick={() => buy(card)}>
                  {itemSold ? "已购得" : stones < price ? `${price} 灵石 · 尚缺 ${price - stones}` : `${price} 灵石 · 购入`}
                </button>
              </div>;
            })}
          </div>
        </section>
        <aside className="market-services">
          <div className="market-section-title"><span>净心与精研</span><small>牌组 {deck.length} 张</small></div>
          <button className="market-special" disabled={specialUsed} onClick={specialTrade}>
            <span><small>{market.special.label}</small><strong>{market.special.title}</strong><p>{market.special.detail}</p></span><b>{specialUsed ? "已交易" : market.special.cost}</b>
          </button>
          {treasureOffer && <article className="market-treasure">
            <GameImage src={treasureOffer.art} alt="" />
            <div><small>本次法宝</small><strong>{treasureOffer.name}</strong><p>{treasureOffer.effect}</p></div>
            <button disabled={treasureBought || stones < Math.max(12, market.treasureCost - discount) || treasures.some((item) => item.id === treasureOffer.id)} onClick={buyTreasure}>{treasureBought || treasures.some((item) => item.id === treasureOffer.id) ? "已购得" : `${Math.max(12, market.treasureCost - discount)} 灵石`}</button>
          </article>}
          <div className="deck-mini-analysis">
            <b>当前短板</b>
            <p>{analysis.priorities.join(" · ") || "结构稳定，可围绕核心组件强化"}</p>
          </div>
          <div className="market-deck-list">
            {deck.map((card, index) => {
              const canRefine = Boolean(refinedVersion(card, origin));
              return <article key={`${card.id}-${index}`}>
                <GameImage src={card.art} alt="" />
                <div><strong>{card.name}</strong><small>{card.cost} 费 · {card.keyword} · {card.rarity}</small></div>
                <button disabled={!canRefine || stones < market.refineCost} onClick={() => refine(index)}>{card.refined ? "已真解" : `精研 ${market.refineCost}`}</button>
                <button disabled={stones < market.removeCost || deck.length <= 8} onClick={() => remove(index)}>忘却 {market.removeCost}</button>
              </article>;
            })}
          </div>
        </aside>
      </div>
      <button className="market-leave" onClick={() => {
        if (leavingRef.current) return;
        leavingRef.current = true;
        onLeave();
      }}>收起行囊 · 返回命途</button>
    </section>
  );
}

function EventScreen({ chapter, origin, deck, hp, maxHp, stones, clues, pendingClue, profile, routeProgress, maxQi, autoChoice, setProfile, setScreen, setHp, setStones, setRunDeck, setRouteProgress, setNextEnemyShield, setMaxQi, setConsumables, completeInvestigation, abandonInvestigation, addRunEcho }) {
  const event = pendingClue?.nodeId === "story" ? CHAPTER_ROUTE_STORIES[chapter] : CHAPTER_EVENTS[chapter];
  const resolvedRef = useRef(false);
  const notebook = createRunNotebook({ screen: "event", chapter, routeProgress, hp, maxHp, stones, deck, origin, clues, pendingClue, profile });
  const choose = (option) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const effect = option.effect || {};
    if (effect.heal) setHp((value) => Math.min(maxHp, value + effect.heal));
    if (effect.hpLoss) setHp((value) => Math.max(1, value - effect.hpLoss));
    if (effect.stones) setStones((value) => value + effect.stones);
    if (effect.enemyShield) setNextEnemyShield((value) => value + effect.enemyShield);
    if (effect.maxQi) {
      if (maxQi < 5) setMaxQi((value) => Math.min(5, value + effect.maxQi));
      else if (effect.maxQiFallbackConsumables) {
        setConsumables((value) => Object.fromEntries(Object.entries(value).map(([key, amount]) => [key, amount + (effect.maxQiFallbackConsumables[key] || 0)])));
      }
    }
    if (effect.consumables) {
      setConsumables((value) => Object.fromEntries(Object.entries(value).map(([key, amount]) => [key, amount + (effect.consumables[key] || 0)])));
    }
    if (effect.cardRarity) {
      setRunDeck((deck) => {
        const owned = new Set(deck.map((card) => card.id));
        const card = origin.cards.find((item) => item.rarity === effect.cardRarity && !item.refined && !owned.has(item.id))
          || origin.cards.find((item) => item.rarity === effect.cardRarity && !item.refined)
          || origin.cards.find((item) => !item.refined);
        return card ? [...deck, card] : deck;
      });
    }
    if (effect.refine) {
      const index = deck.findIndex((card) => refinedVersion(card, origin));
      if (index < 0) {
        if (effect.refineFallbackStones) setStones((value) => value + effect.refineFallbackStones);
      } else {
        setRunDeck((value) => value.map((card, cardIndex) => cardIndex === index ? refinedVersion(card, origin) : card));
      }
    }
    if (effect.removeCurse) {
      const index = deck.findIndex((card) => card.job === "curse" || card.type === "心魔");
      if (index < 0) {
        if (effect.curseFallbackHeal) setHp((value) => Math.min(maxHp, value + effect.curseFallbackHeal));
      } else {
        setRunDeck((value) => value.filter((_, cardIndex) => cardIndex !== index));
      }
    }
    addRunEcho(option.echo ? `${event.name} · ${option.echo}` : `${event.name} · ${option.label}`);
    if (option.revealsClue) completeInvestigation();
    else abandonInvestigation();
    setProfile((value) => ({ ...value, choices: [...value.choices.slice(-7), `${event.name}:${option.id}`] }));
    setRouteProgress((value) => Math.min(3, value + 1));
    setScreen("map");
  };
  useEffect(() => {
    if (autoChoice === null) return;
    const id = window.setTimeout(() => choose(event.options[autoChoice]), 120);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <section className="event-screen screen-content">
      <div className="event-art"><GameImage eager src={event.art} alt="" /></div>
      <div className="event-copy"><span className="section-index">{event.eyebrow}</span><h1>{event.name}</h1><p>{event.description}</p></div>
      <RunNotebook notebook={notebook} compact className="event-notebook" />
      <div className="event-choices">
        {event.options.map((option, index) => <button className={option.revealsClue ? "" : "safe-exit"} style={{ "--delay": `${140 + index * 70}ms` }} key={option.id} onClick={() => choose(option)}>
          <small>{option.label}<em>{option.tone}</em></small><strong>{option.title}</strong><span>{option.detail}</span>{option.echo && <i>{option.echo}</i>}
        </button>)}
      </div>
    </section>
  );
}

function CombatScreen({ origin, stage, chapter, routeProgress, hp, maxHp, qi, maxQi, shield, edge, jobState, stones, enemy, enemyBurn, enemyPoison, enemyWeak, enemyShield, playerWeak, hand, drawPile, discardPile, exhaustPile, drawFx, combatTurn, log, combatFx, combatBusy, playerFx, triggerFx, turnFlowFx, runTribulation, playCard, effectiveCardCost, cardRequirementMet, cardSynergyState, endTurn, consumables, treasures, deck, clues, pendingClue, profile, moonPhase, useConsumable, setOverlay, showGuide, completeGuide }) {
  const [guideStep, setGuideStep] = useState(showGuide ? 0 : -1);
  const hpPercent = Math.max(0, (enemy.hp / enemy.max) * 100);
  const currentEnemyMove = enemy.moves[enemy.moveIndex || 0];
  const artificerDevices = normalizeDevices(jobState);
  const copperCount = artificerDevices.filter((device) => device.type === "copper").length;
  const thunderCount = artificerDevices.filter((device) => device.type === "thunder").length;
  const professionResource = {
    sword: { icon: "/ui/icons/edge.png", label: "剑势", value: `${edge}·${moonPhaseLabel(moonPhase)}` },
    talisman: {
      icon: "/ui/icons/burn.png",
      label: "符印",
      value: `${jobState.seals}印/${jobState.symbolCardsPlayed}连${jobState.burnMultiplier > 1 ? "·燃×2" : ""}`,
    },
    alchemy: { icon: "/ui/icons/hp.png", label: "药性", value: `${jobState.cold}寒/${jobState.heat}热` },
    beast: { icon: "/ui/icons/treasure.png", label: "灵契", value: `${jobState.activeBeast || "归巢"}·${jobState.contracts.length}契·${moonPhaseLabel(moonPhase)}` },
    artificer: { icon: "/ui/icons/shield.png", label: "机巧", value: `${jobState.cunning} · 雀${copperCount}/枢${thunderCount}` },
    soul: {
      icon: "/ui/icons/curse.png",
      label: "魂灯",
      value: `${jobState.lamps}灯/${new Set(discardPile.map((item) => item.baseName || item.name)).size}忆`,
    },
  }[origin.id];
  const build = currentBuildState(deck, origin.id);
  const notebook = createRunNotebook({ screen: "combat", chapter, stage, routeProgress, hp, maxHp, stones, deck, origin, clues, pendingClue, profile, enemy });
  const cardRequirementHint = (card) => {
    const base = card.baseName || card.name.replace("·真解", "");
    const hints = {
      药炉温养: { label: "需寒热", detail: "需要寒性与热性各 1 点才能调和。" },
      玄雷敕令: { label: "需符印", detail: "至少附着 1 枚符印后才能引爆。" },
      彼岸回响: { label: "需前牌", detail: "本场至少打出过一张牌后才能回响。" },
      无常索命: { label: "需余牌", detail: "需要另一张手牌作为献祭目标。" },
      黄泉引路: { label: "需弃牌", detail: "弃牌堆中有牌后才能召回。" },
      魂火焚身: { label: "需魂灯", detail: "至少点亮 1 盏魂灯后才能燃魂。" },
      忘川照影: { label: "需本回合", detail: "本回合打出过牌后才能复制。" },
      百鬼夜行: { label: "需弃牌", detail: "弃牌堆中有牌后才能按种类结算。" },
    };
    return hints[base] || { label: "条件未满", detail: "此牌需要先满足卡面联动条件。" };
  };
  const cardPlayStatus = (card, cost, synergy, playable) => {
    if (combatBusy) return { kind: "busy", label: "结算中", detail: "当前动画或敌方行动尚未结束。" };
    if (isCurse(card)) return { kind: "curse", label: "心魔", detail: "心魔不可打出，会占据手牌并进入弃牌循环。" };
    if (!cardRequirementMet(card)) return { kind: "blocked", ...cardRequirementHint(card) };
    if (qi < cost) return { kind: "qi", label: `差${cost - qi}灵`, detail: `还缺 ${cost - qi} 点灵气才能打出。` };
    if (synergy.conditional && synergy.active) return { kind: "combo", label: "联动", detail: synergy.reason || "当前条件已满足，打出会触发额外效果。" };
    if (playable) return { kind: "ready", label: "可出", detail: "单击即可立即施放。" };
    return null;
  };
  const learningCue = (() => {
    if (triggerFx?.combo) {
      return { state: "mastery", label: "模式掌握", title: "连携条件成立", text: triggerFx.combo };
    }
    const effects = triggerFx?.effects || [];
    if (effects.some((effect) => /护盾|护体|格挡/.test(effect))) {
      return { state: "mastery", label: "模式掌握", title: "防守窗口", text: "你把敌意读成了护体时机；下一步看能否少掉血交回合。" };
    }
    if (effects.some((effect) => /抽牌|灵气|发现/.test(effect))) {
      return { state: "mastery", label: "模式掌握", title: "资源循环", text: "你正在把手牌、灵气和下一轮选择串成循环。" };
    }
    if (effects.some((effect) => /净除|心魔|驱散/.test(effect))) {
      return { state: "mastery", label: "模式掌握", title: "清理负担", text: "你减少了后续抽牌污染，长期胜率会更稳定。" };
    }
    if (effects.some((effect) => /伤害|燃烧|丹毒|虚弱/.test(effect))) {
      return { state: "mastery", label: "模式掌握", title: "压低血线", text: "你把本回合资源转成了有效压制；继续观察下一式风险。" };
    }
    return {
      state: "goal",
      label: "本回合目标",
      title: currentEnemyMove?.damage ? "先读敌意，再决定攻守" : "抓住安全窗口推进",
      text: currentEnemyMove?.damage
        ? `敌人当前会造成 ${currentEnemyMove.damage * (currentEnemyMove.hits || 1)} 点威胁；先找护体、虚弱或快速斩杀。`
        : "敌人本式压力较低，优先补资源、抽牌或铺职业组件。",
    };
  })();
  useEffect(() => {
    if (guideStep === 1 && combatFx?.card) setGuideStep(2);
  }, [combatFx?.card, guideStep]);
  useEffect(() => {
    if (guideStep === 2 && combatTurn > 1) {
      setGuideStep(-1);
      completeGuide();
    }
  }, [combatTurn, completeGuide, guideStep]);
  const guideSteps = [
    { label: "壹 · 先读敌意", verb: "读", title: "知道敌人下一步要做什么", text: `当前「${enemy.intent}」，下一式也会提前显示。先判断该进攻还是护体。`, action: "我看懂了" },
    { label: "贰 · 单击出牌", verb: "点", title: "亮起的卡牌可以立即施放", text: "左上角是灵气费用。单击卡牌就会直接出牌，不需要再次确认。" },
    { label: "叁 · 交出回合", verb: "交", title: "准备好后结束回合", text: "敌人会执行当前招式，随后弃置余牌、抽取新手牌并恢复灵气。" },
  ][guideStep];
  const guide = guideStep >= 0 ? guideSteps : null;
  return (
    <section className={`combat-screen screen-content ${combatFx?.phase || ""} ${playerFx?.kind || ""} guide-step-${guideStep}`}>
      <aside className={`player-rail ${playerFx ? "player-impact" : ""}`}>
        <div className="portrait"><GameImage src="/enemy_rogue_cultivator.png" alt="" /></div>
        <div className="player-name"><strong>{origin.name}</strong><small>炼气前期</small></div>
        <Resource icon="/ui/icons/hp.png" name="生命" value={`${hp}/${maxHp}`} />
        <Resource icon="/ui/icons/qi.png" name="灵气" value={`${qi}/${maxQi}`} />
        <Resource icon="/ui/icons/shield.png" name="护盾" value={shield} />
        {playerWeak > 0 && <Resource icon="/ui/icons/weak.png" name="虚弱" value={playerWeak} />}
        <Resource className="profession-resource" icon={professionResource.icon} name={professionResource.label} value={professionResource.value} />
        <Resource className="stones-resource" icon="/ui/icons/stones.png" name="灵石" value={stones} />
        <div className="quick-items">
          <button disabled={!consumables.spirit || combatBusy} aria-label={`聚气散，剩余 ${consumables.spirit}`} onClick={() => useConsumable("spirit")}><GameImage src="/ui/consumables/spirit_draught.png" alt="" /><span>{consumables.spirit}</span></button>
          <button disabled={!consumables.skin || combatBusy} aria-label={`石肤符，剩余 ${consumables.skin}`} onClick={() => useConsumable("skin")}><GameImage src="/ui/consumables/stone_skin_talisman.png" alt="" /><span>{consumables.skin}</span></button>
          <button disabled={!consumables.clarity || combatBusy} aria-label={`清神粉，剩余 ${consumables.clarity}`} onClick={() => useConsumable("clarity")}><GameImage src="/ui/consumables/clarity_powder.png" alt="" /><span>{consumables.clarity}</span></button>
          <button disabled={!consumables.thunder || combatBusy} aria-label={`阴雷子，剩余 ${consumables.thunder}`} onClick={() => useConsumable("thunder")}><GameImage src="/ui/consumables/thunder_seed.png" alt="" /><span>{consumables.thunder}</span></button>
        </div>
      </aside>
      <div className={`enemy-stage ${combatFx?.phase === "impact" && combatFx.damage > 0 ? "enemy-impact" : ""} ${combatFx?.phase === "enemy-turn" ? "enemy-lunge" : ""}`}>
        <div className="enemy-title"><span>第 {chapter} 章 · {stage === 1 ? "普通战" : stage === 2 ? "精英战" : "首领战"} · 第 {combatTurn} 回合{runTribulation?.level ? ` · ${runTribulation.name}` : ""}</span><h1>{enemy.name}</h1>{runTribulation?.level > 0 && <em className="enemy-tribulation-badge">{runTribulation.risk}</em>}</div>
        {stage === 3 && <div className={`boss-phase phase-${enemy.phase || 1}`}><small>{enemy.phaseName || "第一相 · 守序"}</small>{enemy.choiceEcho && <em>回应 · {enemy.choiceEcho}</em>}<span>{enemy.phaseLine}</span></div>}
        <div className="enemy-health"><span style={{ width: `${hpPercent}%` }} /><strong>{enemy.hp}/{enemy.max}</strong></div>
        <div className={`intent ${guideStep === 0 ? "guide-focus" : ""}`}><small>当前招式</small><strong>{enemy.intent}</strong><b>{currentEnemyMove.note}</b><em>下一式 · {intentLabel(enemy.moves[(enemy.moveIndex + 1) % enemy.moves.length])}</em></div>
        <div className="enemy-readout">
          <small>{enemy.archetype}</small>
          <strong>{enemy.trait}</strong>
          <p>{enemy.counter}</p>
        </div>
        {(enemyBurn > 0 || enemyPoison > 0 || enemyWeak > 0 || enemyShield > 0) && <div className="enemy-statuses">
          {enemyShield > 0 && <span className="status-shield"><GameImage src="/ui/icons/shield.png" alt="" />护体 {enemyShield}</span>}
          {enemyBurn > 0 && <span className="status-burn"><GameImage src="/ui/icons/burn.png" alt="" />燃烧 {enemyBurn}</span>}
          {enemyPoison > 0 && <span className="status-poison"><GameImage src="/ui/icons/curse.png" alt="" />丹毒 {enemyPoison}</span>}
          {enemyWeak > 0 && <span className="status-weak"><GameImage src="/ui/icons/weak.png" alt="" />虚弱 {enemyWeak}</span>}
        </div>}
        <GameImage eager className="enemy-art" src={enemy.art} alt={enemy.name} />
        {combatFx?.phase === "impact" && combatFx.damage > 0 && <div className={`damage-number damage-${combatFx.kind}`}>−{combatFx.damage}</div>}
        {combatFx?.phase === "impact" && combatFx.kind === "guard" && <div className="effect-number effect-guard">+{combatFx.shieldGain} 护盾</div>}
        {combatFx?.phase === "impact" && combatFx.kind === "heal" && <div className="effect-number effect-heal">+{combatFx.heal} 生命</div>}
        {combatFx?.phase === "impact" && combatFx.effectBursts?.length > 0 && <CombatEffectBursts bursts={combatFx.effectBursts} />}
        <p className="combat-log">{log}</p>
      </div>
      {combatFx?.card && <PlayedCardFx fx={combatFx} />}
      {combatFx?.phase === "impact" && combatFx.damage > 0 && <div className={`impact-streak streak-${combatFx.kind}`} />}
      {combatFx?.phase === "enemy-impact" && <div className="enemy-strike-flash" />}
      {playerFx && <div className={`player-damage-number ${playerFx.kind}`}>{playerFx.damage > 0 ? `−${playerFx.damage}` : "格挡"}</div>}
      {combatFx?.phase === "enemy-turn" && <div className="turn-banner"><small>敌方回合</small><strong>{enemy.intent}</strong></div>}
      {turnFlowFx && <TurnFlowFx fx={turnFlowFx} />}
      {triggerFx && <div className="trigger-feedback">
        <small>{triggerFx.combo ? "联动触发" : "术法结算"}</small>
        <strong>{triggerFx.card}</strong>
        {triggerFx.combo && <em>{triggerFx.combo}</em>}
        <div>{triggerFx.effects.map((effect) => <span key={effect}>{effect}</span>)}</div>
      </div>}
      <aside className={`combat-learning-cue ${learningCue.state}`} aria-label="战斗学习反馈">
        <small>{learningCue.label}</small>
        <strong>{learningCue.title}</strong>
        <p>{learningCue.text}</p>
      </aside>
      {drawFx && <DrawSequence fx={drawFx} />}
      <aside className="progress-rail">
        <span>本轮进度</span>
        {[1, 2, 3].map((step) => <i key={step} className={step <= stage ? "done" : ""}>{step}</i>)}
        <nav>
          <button onClick={() => setOverlay("map")}>地图</button>
          <button onClick={() => setOverlay("codex")}>图鉴</button>
          <button onClick={() => setOverlay("settings")}>设置</button>
        </nav>
        <div className="desktop-control-hints" aria-label="PC 战斗操作提示">
          <small>PC 操作</small>
          <span>单击卡牌立即出牌</span>
          <span>数字 1–7 出对应手牌</span>
          <span>Space 结束回合</span>
          <span>右栏快速查图鉴/地图</span>
        </div>
      </aside>
      <RunNotebook notebook={notebook} compact className="combat-notebook" />
      <div className={`hand hand-${Math.min(7, hand.length)} ${guideStep === 1 ? "guide-focus" : ""}`}>
        {hand.slice(0, 7).map((card, index) => {
          const cost = effectiveCardCost(card);
          const synergy = cardSynergyState(card);
          const playable = !combatBusy && !isCurse(card) && cardRequirementMet(card) && qi >= cost;
          return <Card key={`${card.id}-${index}`} card={card} index={index} displayCost={cost} comboReady={synergy.conditional && synergy.active} playable={playable} status={cardPlayStatus(card, cost, synergy, playable)} casting={combatFx?.index === index} onClick={() => playCard(index)} />;
        })}
      </div>
      <button className={`end-turn ${guideStep === 2 ? "guide-focus" : ""}`} disabled={combatBusy} onClick={endTurn}><span className="end-turn-ring" /><strong>结束<br />回合</strong><kbd>Space</kbd></button>
      <div className="pile-status">
        <button className="deck-count" aria-label={`抽牌堆剩余 ${drawPile.length} 张`} onClick={() => setOverlay("deck")}><GameImage src="/card_back_qinglan_trial.png" alt="" /><span>{drawPile.length}</span></button>
        <span className="discard-count">弃 {discardPile.length}</span>
        {exhaustPile.length > 0 && <span className="exhaust-count">耗 {exhaustPile.length}</span>}
      </div>
      {build && <button className={`combat-build-tracker progress-${build.progress}`} onClick={() => setOverlay("deck")}><small>{build.label}</small><strong>{build.recipe.name}</strong><span>{build.progress}/5</span></button>}
      <div className="qi-orb"><strong>{qi}</strong><span>/{maxQi}</span></div>
      <TreasureStrip treasures={treasures} compact />
      {guide && <aside className={`combat-guide guide-${guideStep}`}>
        <button className="guide-skip" onClick={() => { setGuideStep(-1); completeGuide(); }}>跳过</button>
        <ol className="guide-steps" aria-label={`战斗引导第 ${guideStep + 1} 步，共 3 步`}>
          {["读敌意", "点卡牌", "交回合"].map((step, index) => <li className={index < guideStep ? "done" : index === guideStep ? "active" : ""} key={step}><b>{index + 1}</b><span>{step}</span></li>)}
        </ol>
        <small>{guide.label}</small>
        <strong>{guide.title}</strong>
        <p>{guide.text}</p>
        <em className="guide-action-hint">当前只要做一件事：{guide.verb}</em>
        {guide.action && <button className="guide-next" onClick={() => setGuideStep(1)}>{guide.action}</button>}
      </aside>}
    </section>
  );
}

function DrawSequence({ fx }) {
  return (
    <div className="draw-sequence" key={fx.nonce}>
      <div className="draw-source"><GameImage src="/card_back_qinglan_trial.png" alt="" /><span>{fx.source}</span></div>
      {fx.cards.map((card, index) => (
        <div className={`draw-ghost draw-ghost-${index}`} style={{ "--draw-index": index }} key={`${card.id}-${index}`}>
          <GameImage src="/card_back_qinglan_trial.png" alt="" />
          <article>
            <span>{card.cost}</span>
            <GameImage src={card.art} alt="" />
            <strong>{card.name}</strong>
            <small>{card.keyword}</small>
          </article>
        </div>
      ))}
      <div className="draw-ink-bloom" />
    </div>
  );
}

function CombatEffectBursts({ bursts }) {
  return (
    <div className="combat-effect-bursts" aria-hidden="true">
      {bursts.slice(0, 8).map((burst, index) => (
        <span className={`effect-burst effect-burst-${burst.kind}`} style={{ "--burst-index": index }} key={`${burst.kind}-${burst.detail}-${index}`}>
          <b>{burst.label}</b>
          <small>{burst.detail}</small>
        </span>
      ))}
    </div>
  );
}

function TurnFlowFx({ fx }) {
  const steps = [
    ["enemy", "敌方行动"],
    ["impact", "伤害结算"],
    ["discard", "手牌入弃"],
    ["draw", "抽取新牌"],
  ];
  const activeIndex = Math.max(0, steps.findIndex(([phase]) => phase === fx.phase));
  return (
    <div className={`turn-flow phase-${fx.phase}`} key={fx.nonce} aria-live="polite">
      <div>
        <small>回合流转</small>
        <strong>{fx.title}</strong>
        <p>{fx.detail}</p>
      </div>
      <ol>
        {steps.map(([phase, label], index) => <li className={index < activeIndex ? "done" : index === activeIndex ? "active" : ""} key={phase}><span>{index + 1}</span><b>{label}</b></li>)}
      </ol>
    </div>
  );
}

function PlayedCardFx({ fx }) {
  return (
    <div className={`played-card-fx phase-${fx.phase} fx-${fx.kind}`}>
      <div className="played-card-glow" />
      <article>
        <span>{fx.card.cost}</span>
        <h3>{fx.card.name}</h3>
        <GameImage src={fx.card.art} alt="" />
        <small>{fx.card.type}</small>
      </article>
    </div>
  );
}

function Resource({ icon, name, value, className = "" }) {
  return <div className={`resource ${className}`}><GameImage src={icon} alt="" /><span>{name}</span><strong>{value}</strong></div>;
}

function Card({ card, index, playable, displayCost = card.cost, comboReady = false, casting = false, status = null, onClick }) {
  return (
    <button className={`game-card rarity-${card.rarity} ${playable ? "playable" : "disabled"} ${comboReady ? "combo-ready" : ""} ${casting ? "casting-card" : ""} type-${card.type}`} disabled={!playable} aria-disabled={!playable} title={status?.detail || status?.label || ""} onClick={onClick}>
      <span className={`card-cost ${displayCost < card.cost ? "discounted" : ""}`}>{displayCost}</span>
      <span className="card-key">{index + 1}</span>
      <h3>{card.name}</h3>
      <GameImage src={card.art} alt="" />
      <div className="card-meta"><small>{card.type}</small><b>{card.rarity}</b></div>
      <strong className="card-keyword">{card.keyword}</strong>
      {comboReady && <span className="combo-ready-seal">联</span>}
      <p>{card.text}</p>
      {card.combo && <em>{card.combo}</em>}
      {status && <span className={`card-play-state state-${status.kind}`} aria-label={status.detail || status.label}>{status.label}</span>}
    </button>
  );
}

function rewardRarityPlan(stage) {
  if (stage <= 1) return { name: "初幕战利池", weights: "普通 60 · 精良 30 · 稀有 10", promise: "优先给出尚未拥有的新基础牌，降低重复疲劳。" };
  if (stage === 2) return { name: "破局战利池", weights: "普通 42 · 精良 38 · 稀有 20", promise: "精良与稀有权重提高，并可能出现法宝取舍。" };
  return { name: "章末战利池", weights: "普通 34 · 精良 36 · 稀有 30 · 传说 9", promise: "终局牌与精研牌权重上升，至少一张继续推进当前流派。" };
}

function RewardScreen({ stage, chapter, routeProgress, origin, hp, maxHp, deck, treasures, stones, clues, pendingClue, profile, randomSeed, runTribulation, setStones, claimReward, skipReward }) {
  const [rerollCount, setRerollCount] = useState(0);
  const [rewardOpening, setRewardOpening] = useState(false);
  const [rewardRevealed, setRewardRevealed] = useState(false);
  const revealTimerRef = useRef(null);
  const profession = getProfession(origin);
  const chapterData = CHAPTERS[chapter - 1];
  const investigation = CHAPTER_INVESTIGATIONS[chapter];
  const bossClue = investigation?.routes?.at(-1)?.boss;
  const isBossReward = stage >= 3;
  const tribulationStatus = isBossReward && runTribulation?.level
    ? tribulationRewardStatus(profile, chapter, runTribulation.level)
    : null;
  const aftermath = !isBossReward ? resolveBattleAftermath(chapter, stage) : null;
  const notebook = createRunNotebook({ screen: "reward", chapter, stage, routeProgress, hp, maxHp, stones, deck, origin: profession, clues, pendingClue, profile });
  const buildDirection = useMemo(() => rewardRecipeTarget(profession, stage, deck), [profession, stage, deck]);
  const rewards = useMemo(() => {
    let call = 0;
    return generateRewardChoices(profession, stage, deck, () => seededRandom(randomSeed, `reward:${chapter}:${stage}:${routeProgress}:${rerollCount}:${call++}`));
  }, [profession, stage, deck, rerollCount, randomSeed, chapter, routeProgress]);
  const rewardRevealKey = rewards.map((card) => card.id).join(":");
  const rarityPlan = rewardRarityPlan(stage);
  useEffect(() => {
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    setRewardOpening(false);
    setRewardRevealed(false);
    return () => {
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    };
  }, [rewardRevealKey]);
  const treasureReward = useMemo(() => {
    if (stage < 2) return null;
    const pool = TREASURES.filter((treasure) => !treasures.some((owned) => owned.id === treasure.id));
    return pool[Math.floor(seededRandom(randomSeed, `reward-treasure:${chapter}:${stage}:${routeProgress}:${rerollCount}`) * pool.length)] || null;
  }, [origin, stage, rerollCount, randomSeed, chapter, routeProgress]);
  const rerollPrice = Math.max(4, 6 - Math.min(2, treasureValue(treasures, "marketDiscount")));
  const rewardFits = rewards.map((card) => rewardFit(card, deck, origin));
  const guaranteedFit = rewardFits.find((fit) => fit.recipe) || rewardFits[0];
  const highFitCount = rewardFits.filter((fit) => fit.rank === "高").length;
  const rewardDecisionOptions = rewards
    .map((card, index) => ({ card, fit: rewardFits[index], index }))
    .sort((a, b) =>
      b.fit.score - a.fit.score
      || Number(Boolean(b.fit.recipe)) - Number(Boolean(a.fit.recipe))
      || ({ 传说: 4, 稀有: 3, 精良: 2, 普通: 1 }[b.card.rarity] || 0) - ({ 传说: 4, 稀有: 3, 精良: 2, 普通: 1 }[a.card.rarity] || 0)
      || a.card.cost - b.card.cost
    );
  const recommendedReward = rewardDecisionOptions[0];
  const decisionAction = !rewardRevealed
    ? "先启封"
    : recommendedReward?.fit.rank === "高"
      ? "直接拿"
      : recommendedReward?.fit.rank === "中"
        ? "可接受"
        : stones >= rerollPrice ? "可重整" : "谨慎拿";
  const decisionReason = !rewardRevealed
    ? "启封后按构筑契合、当前短板、费用压力三步给出一个够好选择。"
    : recommendedReward?.fit.recipe
      ? `优先补「${recommendedReward.fit.recipe.name}」${recommendedReward.fit.recipeProgress}/5。`
      : recommendedReward?.fit.reason || "独立强度稳定，可作为保守补强。";
  const decisionFallback = !rewardRevealed
    ? "不用记三张牌细节，先看推荐条，再决定是否深读。"
    : highFitCount === 0 && stones >= rerollPrice
      ? `没有高契合牌；若你在追流派，可花 ${rerollPrice} 灵石重整。`
      : isBossReward
        ? "章末可不取战利直接结卷，避免牌组膨胀。"
        : "若牌组已臃肿，也可以调息离开，换稳定血线。";
  const reroll = () => {
    if (stones < rerollPrice) return;
    setStones((value) => value - rerollPrice);
    setRerollCount((value) => value + 1);
  };
  const openSpoils = () => {
    if (rewardOpening || rewardRevealed) return;
    setRewardOpening(true);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = window.setTimeout(() => {
      setRewardRevealed(true);
      setRewardOpening(false);
    }, 460);
  };
  return (
    <section className={`reward-screen screen-content ${isBossReward ? "boss-reward-screen" : ""}`}>
      <span className="section-index">{isBossReward ? `章末 · ${chapterData?.boss}已败` : "战利 · 择一"}</span>
      <h1>{isBossReward ? "胜者执卷，真相落印" : "妖影散尽，灵光未灭"}</h1>
      <p>{isBossReward ? investigation?.conclusion : "至少一张战利会推进当前最接近的流派，其余保留补强与转型空间。"}</p>
      {aftermath && <div className="battle-aftermath">
        <GameImage src={aftermath.enemy.art} alt="" />
        <div className="aftermath-copy">
          <small>战斗余波 · {aftermath.enemy.name}</small>
          <strong>{aftermath.title}</strong>
          <p>{aftermath.narration}</p>
          <blockquote>“{aftermath.finalWords}”</blockquote>
        </div>
        <aside>
          <span>带回证据</span>
          <b>{clues.at(-1) || "敌影消散前留下了新的调查方向"}</b>
          <small>战利来源</small>
          <em>{aftermath.rewardSource}</em>
        </aside>
      </div>}
      {isBossReward && bossClue && <div className="boss-revelation">
        <GameImage src={chapterData?.art} alt="" />
        <div>
          <small>首领最后的证词</small>
          <strong>{bossClue}</strong>
          <p>选择最后一份战利，随后本章将正式结卷。</p>
        </div>
      </div>}
      {tribulationStatus && <div className={`tribulation-reward ${tribulationStatus.claimed ? "claimed" : ""}`}>
        <span>{tribulationStatus.claimed ? "劫数已破 · 本章首破奖励已领取" : "劫数首破 · 结卷后发放"}</span>
        <strong>{runTribulation.name} · {runTribulation.reward.title}</strong>
        <p>{runTribulation.risk}</p>
        <small>灵玉 +{runTribulation.reward.jade} · 悟道 +{runTribulation.reward.spirit} · 修为 +{runTribulation.reward.xp}</small>
      </div>}
      {buildDirection && <div className="reward-build-direction">
        <div><small>当前构筑方向 · {buildDirection.recipe.rank}</small><strong>{buildDirection.recipe.name}</strong></div>
        <span>{buildDirection.progress}/5</span>
        <i><b style={{ width: `${buildDirection.progress * 20}%` }} /></i>
        <p>{buildDirection.recipe.focus} · 尚缺 {buildDirection.missing.length} 张核心组件</p>
      </div>}
      <div className={`reward-reveal-panel ${rewardOpening ? "opening" : ""} ${rewardRevealed ? "revealed" : ""}`} aria-live="polite">
        <span>{rewardRevealed ? "战利已开" : rewardOpening ? "封印松动" : "灵光聚拢"}</span>
        <strong>{rarityPlan.name}</strong>
        <p>{rarityPlan.weights}</p>
        <small>{rarityPlan.promise}</small>
        <button className="reward-open-spoils" disabled={rewardOpening || rewardRevealed} onClick={openSpoils}>{rewardRevealed ? "已启封" : rewardOpening ? "揭示中…" : "启封战利"}</button>
      </div>
      <div className="reward-contract" aria-label="战利保底与取舍说明">
        <article>
          <small>本次保底</small>
          <strong>{guaranteedFit?.recipe ? `推进「${guaranteedFit.recipe.name}」` : "三选一稳定补强"}</strong>
          <span>{highFitCount ? `${highFitCount} 张高契合` : "至少一张可补当前短板"}</span>
        </article>
        <article>
          <small>可变奖励</small>
          <strong>{treasureReward ? "法宝机会已出现" : stage >= 2 ? "本次未见法宝" : "法宝二幕后开放"}</strong>
          <span>{treasureReward ? treasureReward.name : "重整会重新抽取卡牌池"}</span>
        </article>
        <article>
          <small>重整代价</small>
          <strong>{rerollPrice} 灵石</strong>
          <span>{stones >= rerollPrice ? `重整后余 ${stones - rerollPrice}` : `还缺 ${rerollPrice - stones}`}</span>
        </article>
        <article>
          <small>兜底选择</small>
          <strong>{isBossReward ? "直接结卷" : "调息 +10"}</strong>
          <span>{isBossReward ? "放弃战利，不影响章节结算" : "用生命换稳定，不扩张牌组"}</span>
        </article>
      </div>
      <section className={`reward-decision-aid ${rewardRevealed ? "revealed" : "sealed"}`} aria-label="满意即可选择辅助">
        <span>满意即可 · 四步内决策</span>
        <strong>{rewardRevealed && recommendedReward ? `${decisionAction}：${recommendedReward.card.name}` : decisionAction}</strong>
        <p>{decisionReason}</p>
        <small>{decisionFallback}</small>
      </section>
      <RunNotebook notebook={notebook} compact className="reward-notebook" />
      <div className="reward-cards">{rewards.map((card, index) => {
        const fit = rewardFits[index];
        return <div className={`reward-card-wrap fit-${fit.rank} ${rewardOpening ? "opening" : ""} ${rewardRevealed ? "revealed" : "sealed"}`} style={{ "--delay": `${180 + index * 120}ms` }} key={card.id}>
          <div className="reward-fit"><b>推荐 {fit.rank}</b><span>{fit.reason}</span></div>
          <Card card={card} index={index} playable={rewardRevealed} onClick={() => rewardRevealed && claimReward(card)} />
          <div className="reward-card-seal" aria-hidden="true">
            <GameImage src="/card_back_qinglan_trial.png" alt="" />
            <span>{card.rarity}</span>
            <strong>待揭</strong>
          </div>
        </div>;
      })}</div>
      {treasureReward && <button className="reward-treasure" onClick={() => claimReward(null, treasureReward)}>
        <GameImage src={treasureReward.art} alt="" />
        <span><small>{stage === 2 ? "精英战法宝" : "首领遗珍"}</small><strong>{treasureReward.name}</strong><em>{treasureReward.effect}</em></span>
        <b>选择法宝</b>
      </button>}
      <small className="reward-tip">{isBossReward ? "章末战利 · 选择后进入本章结算" : `第 ${stage} 幕奖励 · 后续章节提高稀有牌和精研牌概率`}</small>
      <div className="reward-actions">
        <button className="reward-reroll" disabled={stones < rerollPrice || rewardOpening} onClick={reroll}>重整奖励 · {rerollPrice} 灵石</button>
        <button className="reward-skip" onClick={skipReward}>{isBossReward ? "不取战利 · 直接结卷" : "调息离开 · 恢复 10 生命"}</button>
      </div>
    </section>
  );
}

function TreasureStrip({ treasures, compact = false }) {
  if (!treasures.length) return null;
  return (
    <div className={`treasure-strip ${compact ? "compact" : ""}`}>
      <small>法宝</small>
      {treasures.map((treasure) => <span key={treasure.id} title={`${treasure.name}：${treasure.effect}`}><GameImage src={treasure.art} alt="" /><b>{treasure.name}</b></span>)}
    </div>
  );
}

function SummaryScreen({ chapter, origin, hp, maxHp, stones, treasures, deck, profile, runChoices, runChronicle, runClues, runStats, runMode, runSeed, runTrial, runTribulation, onHome, onContinue }) {
  const evaluation = evaluateRun(runStats, hp, maxHp);
  const baseEnding = {
    1: ["雨停山门，灯灭其一。", "你带着第二十四人的线索走入内门，师姐的名字仍在血书上发亮。"],
    2: ["鬼灯熄灭，旧名重现。", "师父留下的路引指向筑基雷池，而你的名字暂时从灯上消失。"],
    3: ["雷阵已破，道心未定。", "你跨过筑基门槛，也看清青岚谷百年安稳背后的代价。"],
    4: ["黑莲凋落，万梦归城。", "无灯城重新拥有噩梦，也重新拥有在命册之外选择明日的能力。"],
    5: ["天门无月，诸命由己。", "命册最后一页留下新的规则，沈砚秋和所有无名者终于被世界记住。"],
    6: ["月潮退去，归墟仍在。", "你没有消灭遗憾，只让未行之路重新成为可以回望、却不能吞没此生的月影。"],
  }[chapter];
  const endings = chapter === 5
    ? runChoices.includes("重写命册")
      ? ["末页新书，诸命由己。", "你没有修复旧日秩序，而是在命册末页写下新的规则：从今以后，名字只能记录选择，不能替任何人决定前路。"]
      : ["旧册重明，无名归卷。", "你修复命册，却保留了所有被抹去的旧名。天地重新记住他们，也永远留下了篡改命数的罪证。"]
    : baseEnding;
  const epilogue = resolveChapterEpilogue(chapter, runChoices);
  const bossResponse = resolveBossChoiceResponse(chapter, runChoices);
  const investigation = CHAPTER_INVESTIGATIONS[chapter];
  const investigationComplete = runClues.length >= 4;
  const archive = profile.investigationArchive?.[String(chapter)] || [];
  const archiveTotal = investigationEvidence(chapter).length;
  const archiveComplete = archiveTotal > 0 && archive.length === archiveTotal;
  const transition = CHAPTER_TRANSITIONS[chapter];
  const canContinue = runMode === "story" && chapter < CHAPTERS.length;
  const nextChapter = canContinue ? CHAPTERS[chapter] : null;
  const tribulationStatus = runMode === "story" && runTribulation?.level
    ? tribulationRewardStatus(profile, chapter, runTribulation.level)
    : null;
  const nextGoal = nextProgressGoals(profile, 1)[0];
  return (
    <section className="summary-screen screen-content">
      <div className="summary-seal"><span>{evaluation.grade}</span><small>{evaluation.score} 分 · {evaluation.title}</small></div>
      <div className="summary-copy"><span className="section-index">{runMode === "daily" ? `今日试炼 · ${runTrial?.modifier?.name}` : `第 ${chapter} 章 · 已完成`}</span><h1>{endings[0]}</h1><p>{endings[1]}</p><small className="run-seed-note">种子 {runSeed}</small>{chapter === 5 && <small className="ending-unlocked">新结局已收入异闻录 · {runChoices.includes("重写命册") ? "诸命由己" : "旧名归卷"}</small>}</div>
      {epilogue && <div className="summary-epilogue">
        <span>人物后记 · {epilogue.character}</span>
        <strong>{epilogue.title}</strong>
        <p>{epilogue.text}</p>
        <small>源于本局抉择「{epilogue.choice}」· 已收入异闻录</small>
      </div>}
      {bossResponse && <div className="summary-boss-causality">
        <span>首领因果 · {bossResponse.choice}</span>
        <strong>{bossResponse.effect}</strong>
        <p>{bossResponse.line}</p>
        <small>该抉择已在首领转相时改变战斗，并作为本章结局因果保留。</small>
      </div>}
      <div className="summary-stats">
        <div><small>余命</small><strong>{hp}/{maxHp}</strong></div>
        <div><small>战斗 / 回合</small><strong>{runStats.combatsWon} / {runStats.turns}</strong></div>
        <div><small>出牌 / 伤害</small><strong>{runStats.cardsPlayed} / {runStats.damageDealt}</strong></div>
        <div><small>牌组 / 法宝</small><strong>{deck.length} / {treasures.length}</strong></div>
      </div>
      <div className="summary-rewards"><span>本章所得</span><b>修为 +{runStats.xpGained}</b><b>悟道 +{runStats.spiritGained}</b><b>灵玉 +{runStats.jadeGained}</b><b>灵石结余 {stones}</b></div>
      {nextGoal && <section className={`summary-next-goal ${nextGoal.claimable ? "claimable" : ""}`}>
        <div>
          <span>{nextGoal.claimable ? "下一枚印记 · 可领取" : "下一枚印记 · 继续推进"}</span>
          <strong>{nextGoal.title}</strong>
          <p>{nextGoal.claimable ? "回到山门即可领取这份挑战卷奖励。" : nextGoal.hook}</p>
        </div>
        <ChallengeGoalCard goal={nextGoal} compact />
      </section>}
      {runMode === "daily" && <div className="summary-daily"><span>今日试炼已落印</span><strong>{runTrial?.modifier?.name} · {runSeed}</strong><p>同日重复挑战仍可复盘构筑与评阶，但每日首胜资源不会重复发放。</p></div>}
      {tribulationStatus && <div className="summary-daily summary-tribulation">
        <span>{tribulationStatus.claimed ? "劫数落印" : "劫数复盘"}</span>
        <strong>{runTribulation.name} · {runTribulation.reward.title}</strong>
        <p>{tribulationStatus.claimed ? `本章 ${runTribulation.short} 已完成首破。更高劫数会继续保留清晰风险与独立首破奖励。` : "本章此前已领取过该劫数奖励，本次只记录评分与路线复盘。"}</p>
      </div>}
      {investigation && <div className={`summary-investigation ${investigationComplete ? "complete" : ""}`}>
        <span>{investigationComplete ? "真相已明" : "疑云未尽"} · 线索 {runClues.length}/5</span>
        <strong>{investigation.objective}</strong>
        <p>{investigationComplete ? investigation.conclusion : `仍缺 ${Math.max(0, 4 - runClues.length)} 条关键证据；重返本章选择其他路线可补全真相。`}</p>
        <div>{runClues.slice(-4).map((clue, index) => <small key={`${clue}-${index}`}>{clue}</small>)}</div>
      </div>}
      {investigation && <div className={`summary-archive ${archiveComplete ? "complete" : ""}`}>
        <span>异闻宗卷 · {archive.length}/{archiveTotal}</span>
        <strong>{archiveComplete ? "本章全部分支证据已收录" : `跨局再寻 ${archiveTotal - archive.length} 条分支证据`}</strong>
        <small>{archiveComplete ? `宗卷圆满奖励：悟道 +${INVESTIGATION_COMPLETION_REWARD.spirit} · 灵玉 +${INVESTIGATION_COMPLETION_REWARD.jade}` : "已获证据会永久保留，重返本章可选择另一条路线。"}</small>
      </div>}
      {runChronicle.length > 0 && <div className="summary-chronicle"><span>本章命途</span>{runChronicle.slice(-4).map((entry, index) => <small key={`${entry}-${index}`}>{entry}</small>)}</div>}
      {transition && <section className={`chapter-transition ${canContinue ? "continuable" : "complete"}`}>
        <div><span>{transition.eyebrow}</span><strong>{transition.title}</strong><p>{transition.text}</p><small>{transition.speaker}</small></div>
        <aside><small>{canContinue ? "下一章目标" : "后续云游"}</small><b>{transition.hook}</b>{nextChapter && <em>{nextChapter.region} · {nextChapter.level} · 同一道途重新起牌</em>}</aside>
      </section>}
      <div className="summary-actions">
        {canContinue && <button className="primary-cta summary-action summary-continue" onClick={() => onContinue(chapter + 1, origin)}><span>沿此线索继续 · 第 {chapter + 1} 章</span></button>}
        <button className={`primary-cta summary-action ${canContinue ? "secondary" : ""}`} onClick={onHome}><span>{chapter === CHAPTERS.length && runMode === "story" ? "主线归档 · 返回山门" : "返回山门"}</span></button>
      </div>
    </section>
  );
}

function defeatLearningPlan(analysis, chapter, stage, clues, pendingClue, failureStreak, support) {
  const enemy = ENCOUNTER_ENEMIES[chapter]?.[stage];
  const moves = buildEnemyMoves(chapter, stage) || [];
  const hasShield = moves.some((move) => move.shield);
  const hasDrain = moves.some((move) => move.drainQi);
  const hasHandPressure = moves.some((move) => move.drawPenalty || move.curse || move.weak);
  const hasMultiHit = moves.some((move) => move.hits && move.hits > 1);
  const pressure = chapterDifficultyProfile(chapter);
  let lesson = {
    type: "节奏判断",
    cause: "牌组结构尚可，但本场攻守节奏没有跟上敌人当前招式。",
    next: "下一局先读当前与下一式：蓄势回合进攻，高压回合保留护盾或恢复。",
  };
  if (analysis.defense + analysis.heal <= 3) {
    lesson = {
      type: "生存疏漏",
      cause: "护盾与恢复偏少，连续伤害或虚弱回合容易直接击穿血线。",
      next: "战利优先拿护盾 / 恢复；坊市中若看到防御牌，宁可少买一张输出也要补生存。",
    };
  } else if (analysis.attack <= Math.max(3, Math.floor(analysis.total * 0.28))) {
    lesson = {
      type: "输出不足",
      cause: "稳定伤害牌偏少，敌人的护体、恢复或二阶段会把战斗拖长。",
      next: "下局至少补一张低费伤害或持续伤害牌；精英前不要只堆防御。",
    };
  } else if (analysis.draw <= 2 && analysis.total >= 12) {
    lesson = {
      type: "循环阻塞",
      cause: "牌组变厚但过牌不足，关键牌不容易回到手中。",
      next: "路线优先选择战利或修炼补过牌；坊市忘却重复低价值牌，让核心组件更快循环。",
    };
  } else if (analysis.highCost >= Math.ceil(analysis.total * 0.38)) {
    lesson = {
      type: "费用拥堵",
      cause: "高费牌比例偏高，灵气不足时会出现想出牌却出不动的回合。",
      next: "下局补 0–1 费运转牌；遇到夺气或多段攻击敌人时，保留低费防御更稳。",
    };
  } else if (analysis.total >= 16) {
    lesson = {
      type: "牌组冗余",
      cause: "牌组过厚会稀释核心组件，让成型流派来得太晚。",
      next: "优先走坊市或调息节点删牌；非核心高费牌不要因为稀有就全部收入。",
    };
  }
  const practice = stage >= 3
    ? "首领战先把二阶段当成新题目：转相后重新读意图，不沿用第一相的固定出牌节奏。"
    : stage === 2
      ? "精英战会把本章机制组合考核；进入前至少准备一项生存手段和一项破局输出。"
      : "普通战负责教本章压力；先用低风险路线看清敌人模式，再决定是否贪高收益。";
  const clueLine = pendingClue?.text
    ? `本次中断了「${pendingClue.text}」。若下局血线低，可先放弃安全外的调查收益。`
    : clues.length >= 3
      ? `已带回 ${clues.length}/5 条线索，下局可以更大胆补构筑而不是只追调查。`
      : "线索仍少，下局尽量完成一个战斗或异闻节点后再进入高风险路线。";
  const supportLine = support.tier
    ? `下次扶助会额外提供「${support.title}」，把它当容错窗口，不要当作降难度。`
    : failureStreak > 0
      ? "当前尚无额外数值扶助，先调整路线与牌组结构会更有效。"
      : "首次失败不发放额外资源，先从本页处方修正构筑方向。";
  const enemyLine = enemy
    ? `${enemy.name} · ${enemy.archetype}。${enemy.trait}`
    : `第 ${chapter} 章第 ${stage} 战。敌压 ${pressure.pressure}，${pressure.tolerance}。`;
  const counterLine = hasHandPressure
    ? "优先补净心、过牌或低费防御，别让手牌污染和虚弱同时拖慢回合。"
    : hasShield
      ? "优先准备拆盾与持续输出；看到敌人立壁回合，不要把全部伤害打进护体。"
      : hasDrain
        ? "保留聚气散或 0–1 费牌，避免被夺气后整回合空过。"
        : hasMultiHit
          ? "多段攻击最怕裸血硬吃，至少留一张即时护盾或恢复。"
          : enemy?.counter || pressure.advice;
  return { ...lesson, practice, clueLine, supportLine, enemyLine, counterLine };
}

function DefeatScreen({ chapter, stage, deck, treasures, clues, pendingClue, runMode, runSeed, runTrial, failureStreak, onRetry, onHome }) {
  const analysis = analyzeDeck(deck);
  const support = retrySupportFor(failureStreak);
  const lesson = defeatLearningPlan(analysis, chapter, stage, clues, pendingClue, failureStreak, support);
  return (
    <section className="defeat-screen screen-content">
      <div className="defeat-moon" />
      <div className="defeat-copy">
        <span className="section-index">{runMode === "daily" ? `今日试炼中断 · ${runTrial?.modifier?.name}` : `云游中断 · 第 ${chapter} 章`}</span>
        <h1>灯火未熄，<br />此路暂断。</h1>
        <p>你倒在第 {stage} 场试炼前。失败会结束本次云游，但已经获得的道途熟练与剧情记录仍会保留。</p>
        <small className="defeat-seed">本局种子 {runSeed} · 重试会保留相同试炼条件</small>
        <div className={`retry-support tier-${support.tier}`}>
          <span>连续受挫 {failureStreak} 次 · 下次扶助</span>
          <strong>{support.title}</strong>
          <p>{support.detail}</p>
          <small>扶助只改善容错，不降低敌人强度；通关本章后清零。</small>
        </div>
        <section className="defeat-learning">
          <header><span>失败学习处方</span><strong>{lesson.type}</strong></header>
          <div>
            <article><small>错误类型</small><b>{lesson.cause}</b></article>
            <article><small>下局行动</small><b>{lesson.next}</b></article>
            <article><small>节点练习</small><b>{lesson.practice}</b></article>
          </div>
          <p>{lesson.clueLine}</p>
          <em>{lesson.supportLine}</em>
          <div className="defeat-counterplay">
            <article><small>本场敌人</small><b>{lesson.enemyLine}</b></article>
            <article><small>机制对策</small><b>{lesson.counterLine}</b></article>
          </div>
        </section>
        <div className="defeat-diagnosis">
          <div><small>最终牌组</small><strong>{deck.length} 张</strong></div>
          <div><small>随身法宝</small><strong>{treasures.length ? treasures.map((item) => item.name).join(" / ") : "尚未获得"}</strong></div>
          <div><small>成型组件</small><strong>{analysis.keyComponents.map(([name]) => name).join(" / ") || "尚未成型"}</strong></div>
          <div><small>下次优先</small><strong>{analysis.priorities.join(" / ") || "保持当前节奏"}</strong></div>
          <div><small>已带回线索</small><strong>{clues.length}/5</strong></div>
          <div><small>中断调查</small><strong>{pendingClue?.text || "本次未遗失待查证线索"}</strong></div>
        </div>
        <div className="defeat-actions">
          <button onClick={onRetry}>重启本章</button>
          <button onClick={onHome}>返回山门</button>
        </div>
      </div>
    </section>
  );
}

const GUIDE_PLAYBOOK = [
  {
    label: "壹 · 读局面",
    title: "先看敌意，再决定攻守",
    text: "每回合只先判断两件事：当前招式会不会破血线，下一式是否需要提前留护体。",
    checks: ["当前招式", "下一式预告", "自身生命/护盾"],
  },
  {
    label: "贰 · 选路线",
    title: "用风险换最缺的资源",
    text: "血线低走调息，牌组散走修炼，缺核心走战斗或精英，缺稳定性再进坊市。",
    checks: ["风险", "收益", "后果"],
  },
  {
    label: "叁 · 取战利",
    title: "补短板优先于稀有度",
    text: "先补过牌、防护、核心组件，再考虑高稀有牌。不能服务流派的强牌也会拖慢成型。",
    checks: ["费用曲线", "流派进度", "防护/过牌"],
  },
  {
    label: "肆 · 整牌组",
    title: "牌组越清晰，抽牌越可靠",
    text: "每章至少让一个组件成型：删掉低贡献牌，精研常用牌，避免只拿不整理。",
    checks: ["核心 5 张", "冗余牌", "精研目标"],
  },
];

function Overlay({ type, close, deck, origin, profile, setProfile, treasures, savedRun, abandonRun, feedback, claimProgressReward }) {
  const analysis = analyzeDeck(deck);
  const build = currentBuildState(deck, origin);
  const [abandonArmed, setAbandonArmed] = useState(false);
  const defaultArchiveVolumeIndex = Math.min(4, Math.max(0, Math.floor(((profile.chapter || 1) - 1) / 5)));
  const [archiveVolumeIndex, setArchiveVolumeIndex] = useState(defaultArchiveVolumeIndex);
  useEffect(() => {
    setAbandonArmed(false);
  }, [type, savedRun?.savedAt]);
  useEffect(() => {
    if (type === "codex") setArchiveVolumeIndex(defaultArchiveVolumeIndex);
  }, [type, defaultArchiveVolumeIndex]);
  const content = useMemo(() => ({
    guide: ["试炼札记", "先读敌人意图，再决定护体或进攻。每一幕至少经过一次坊市或修炼，避免牌组失衡。"],
    codex: ["青岚图鉴", "术法、敌情、法宝和山中异闻会在发现后记入此卷。"],
    settings: ["设置与存档", "本地自动存档会在出牌、回合推进、路线和奖励变化后即时更新。"],
    map: ["路线概览", "青岚谷 → 玄阴山道 → 筑基雷云"],
    deck: ["当前牌组", "读懂费用、组件与短板，比单看稀有度更重要。"],
  })[type], [type]);
  return (
    <div className="overlay" onMouseDown={close}>
      <article className={type === "deck" ? "deck-overlay" : type === "codex" ? "codex-overlay" : type === "guide" ? "guide-overlay" : type === "settings" ? "settings-overlay" : ""} onMouseDown={(event) => event.stopPropagation()}>
        <button className="overlay-close" onClick={close}>收起</button>
        <span className="section-index">卷册</span><h2>{content[0]}</h2><p>{content[1]}</p>
        {type === "guide" && <>
          <section className="guide-current-run">
            <div>
              <small>当前牌组提醒</small>
              <strong>{build ? `${build.recipe.name} · ${build.progress}/5` : `${analysis.total} 张牌 · ${analysis.priorities[0] || "结构健康"}`}</strong>
              <p>{build?.nextCard ? `下一张核心优先寻找「${build.nextCard.name}」，关键词「${build.nextCard.keyword}」。` : analysis.priorities.join(" · ") || "继续保持低费、过牌与防护的平衡。"}</p>
            </div>
            <span>{analysis.total}<i>张</i></span>
          </section>
          <section className="guide-playbook" aria-label="试炼札记四步手册">
            {GUIDE_PLAYBOOK.map((item) => (
              <article key={item.label}>
                <small>{item.label}</small>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                <div>{item.checks.map((check) => <b key={check}>{check}</b>)}</div>
              </article>
            ))}
          </section>
          <section className="guide-rhythm-note">
            <span>一局节奏</span>
            <p>战斗学敌意，路线做取舍，战利补短板，牌组页看成型度。每次只处理一个主要问题，别同时追求伤害、防御、稀有度和剧情全满。</p>
          </section>
        </>}
        {type === "deck" && <>
          {build && <div className={`deck-build-state progress-${build.progress}`}>
            <div><small>{build.label} · {build.recipe.rank}</small><strong>{build.recipe.name}</strong><p>{build.recipe.strategy}</p></div>
            <span>{build.progress}<i>/5</i></span>
            <b><i style={{ width: `${build.progress * 20}%` }} /></b>
            <em>{build.complete ? "五张核心术法已经成卷。" : build.nextCard ? `下一核心：${build.nextCard.name} · ${build.nextCard.keyword}` : "继续强化当前核心组件。"}</em>
          </div>}
          <div className="deck-analysis-grid">
            <div><small>牌组</small><strong>{analysis.total}</strong></div>
            <div><small>攻击</small><strong>{analysis.attack}</strong></div>
            <div><small>防护 / 恢复</small><strong>{analysis.defense + analysis.heal}</strong></div>
            <div><small>过牌</small><strong>{analysis.draw}</strong></div>
          </div>
          <div className="deck-curve">
            {analysis.costs.map((count, cost) => <div key={cost}><i style={{ height: `${18 + count * 10}px` }} /><b>{count}</b><small>{cost === 3 ? "3+" : cost} 费</small></div>)}
          </div>
          <div className="deck-diagnosis"><b>补强优先级</b><span>{analysis.priorities.join(" · ") || "结构健康，继续强化核心组件"}</span></div>
          <div className="deck-diagnosis"><b>成型组件</b><span>{analysis.keyComponents.map(([name, count]) => `${name} ${count}`).join(" · ") || "尚未形成双卡组件"}</span></div>
          <div className="deck-scroll-list">{deck.map((card, index) => <span key={`${card.id}-${index}`}><GameImage src={card.art} alt="" /><b>{card.name}</b><small>{card.cost} 费 · {card.keyword}</small></span>)}</div>
        </>}
        {type === "codex" && <>
          {(() => {
            const archiveStats = CHAPTERS.map((chapter) => {
              const evidence = investigationEvidence(chapter.id);
              const found = profile.investigationArchive?.[String(chapter.id)] || [];
              const complete = evidence.length > 0 && found.length === evidence.length;
              return {
                chapter,
                investigation: CHAPTER_INVESTIGATIONS[chapter.id],
                evidence,
                found,
                complete,
                rewarded: (profile.investigationRewards || []).includes(`investigation-${chapter.id}-complete`),
              };
            });
            const totalEvidence = archiveStats.reduce((sum, item) => sum + item.evidence.length, 0);
            const foundEvidence = archiveStats.reduce((sum, item) => sum + item.found.length, 0);
            const archiveVolumes = Array.from({ length: Math.ceil(CHAPTERS.length / 5) }, (_, index) => {
              const chapters = archiveStats.slice(index * 5, index * 5 + 5);
              return {
                index,
                label: `第 ${index + 1} 卷`,
                range: `${chapters[0]?.chapter.id || 1}-${chapters.at(-1)?.chapter.id || 1} 章`,
                chapters,
                found: chapters.reduce((sum, item) => sum + item.found.length, 0),
                total: chapters.reduce((sum, item) => sum + item.evidence.length, 0),
                complete: chapters.length > 0 && chapters.every((item) => item.complete),
              };
            });
            const activeVolume = archiveVolumes[archiveVolumeIndex] || archiveVolumes[0];
            const focus = archiveStats.find((item) => !item.complete && item.chapter.id >= Math.min(profile.chapter || 1, CHAPTERS.length))
              || archiveStats.find((item) => !item.complete)
              || archiveStats.at(-1);
            return <>
              <div className="casebook-overview"><span>{CHAPTERS.length} 章调查宗卷</span><strong>{foundEvidence}<i>/{totalEvidence}</i></strong><p>每章单局查明真相后，重返另一条路线可补齐全部分支证据。</p></div>
              <section className="casebook-focus" aria-label="当前宗卷追踪">
                <div>
                  <small>当前追踪</small>
                  <strong>第 {focus.chapter.id} 章 · {focus.investigation.objective}</strong>
                  <p>{focus.complete ? "二十五章宗卷已经圆满，继续挑战高劫数或补职业熟练。" : focus.found.at(-1) || focus.investigation.opening}</p>
                </div>
                <span>{focus.found.length}<i>/{focus.evidence.length}</i></span>
              </section>
              <nav className="casebook-volume-grid" aria-label="调查宗卷分卷">
                {archiveVolumes.map((volume) => (
                  <button className={`${volume.index === activeVolume.index ? "active" : ""} ${volume.complete ? "complete" : ""}`} onClick={() => setArchiveVolumeIndex(volume.index)} key={volume.label}>
                    <b>{volume.label}</b>
                    <small>{volume.range}</small>
                    <i><em style={{ width: `${volume.total ? volume.found / volume.total * 100 : 0}%` }} /></i>
                    <span>{volume.found}/{volume.total}</span>
                  </button>
                ))}
              </nav>
              <h3 className="codex-heading">调查宗卷 · {activeVolume.label}</h3>
              <div className="investigation-archive">
                {activeVolume.chapters.map(({ chapter, investigation, evidence, found, complete, rewarded }) => (
                  <article className={complete ? "complete" : ""} key={chapter.id}>
                    <header><span>第 {chapter.id} 章 · {chapter.region}</span><b>{found.length}/{evidence.length}</b></header>
                    <strong>{investigation.objective}</strong>
                    <i><em style={{ width: `${evidence.length ? found.length / evidence.length * 100 : 0}%` }} /></i>
                    <p>{complete ? investigation.conclusion : found.at(-1) || "尚未带回本章调查证据。"}</p>
                    <small>{complete ? rewarded ? "宗卷圆满 · 奖励已领取" : "宗卷圆满 · 通关结算时领取奖励" : `尚缺 ${evidence.length - found.length} 条分支证据`}</small>
                  </article>
                ))}
              </div>
            </>;
          })()}
          <div className="codex-summary">
            <div><small>已收录术法</small><strong>{profile.discoveredCards?.length || 0}/{ALL_CARDS.length}</strong></div>
            <div><small>已见法宝</small><strong>{profile.discoveredTreasures?.length || 0}/{TREASURES.length}</strong></div>
            <div><small>剧情印记</small><strong>{profile.choices?.length || 0}</strong></div>
            <div><small>结局卷</small><strong>{profile.unlockedEndings?.length || 0}/7</strong></div>
          </div>
          <h3 className="codex-heading">挑战卷</h3>
          <div className="challenge-scroll">
            {progressSummaries(profile).map((goal) => <ChallengeGoalCard goal={goal} claimProgressReward={claimProgressReward} key={goal.id} />)}
          </div>
          <h3 className="codex-heading">最近战绩</h3>
          <div className="recent-runs">
            {(profile.recentRuns || []).length
              ? profile.recentRuns.map((run) => <article key={run.id}><span>{run.mode === "daily" ? `今日试炼 · ${run.trialName}` : `第 ${run.chapter} 章`} · {getProfession(run.job).short}</span><strong>{run.grade} · {run.score} 分</strong><small>牌组 {run.deckSize} · 线索 {run.clues}/5 · 种子 {run.seed || "旧档"}</small></article>)
              : <p>完成一次章节云游后，战绩会记录在这里。</p>}
          </div>
          <h3 className="codex-heading">法宝录</h3>
          <div className="codex-treasures">
            {TREASURES.map((treasure) => {
              const discovered = profile.discoveredTreasures?.includes(treasure.id) || treasures.some((owned) => owned.id === treasure.id);
              return <article className={discovered ? "" : "unknown"} key={treasure.id}><GameImage src={treasure.art} alt="" /><div><strong>{discovered ? treasure.name : "未识法器"}</strong><p>{discovered ? treasure.effect : "在精英战、坊市或山中异闻里发现。"}</p></div></article>;
            })}
          </div>
          <h3 className="codex-heading">命途印记</h3>
          <div className="codex-marks">{profile.choices?.length ? profile.choices.map((choice, index) => <span key={`${choice}-${index}`}>{choice}</span>) : <p>尚未留下剧情选择。进入章节后，你的决定会被记录在这里。</p>}</div>
          <h3 className="codex-heading">人物手札</h3>
          <div className="lore-scrolls">
            {(profile.unlockedLore || []).includes("shen-handbook-1")
              ? <article><span>沈砚秋 · 雨亭残页</span><strong>“第七盏灯不是为亡者而点。它在等一个仍然活着、却已经被命册写完的人。”</strong><small>完成第一章五幕剧情后收录</small></article>
              : <article className="locked"><span>未解手札</span><strong>完成第一章五幕剧情后显现。</strong><small>进度 {(profile.completedNodes || []).filter((node) => node.startsWith("chapter-1-scene-")).length}/5</small></article>}
          </div>
          <h3 className="codex-heading">结局卷轴</h3>
          <div className="codex-marks">{profile.unlockedEndings?.length ? profile.unlockedEndings.map((ending) => <span key={ending}>{{
            chapter_1_ending: "雨停山门",
            chapter_2_ending: "旧名重现",
            chapter_3_ending: "雷阵已破",
            chapter_4_ending: "万梦归城",
            chapter_6_ending: "月潮退去",
            restore_fate: "旧名归卷",
            rewrite_fate: "诸命由己",
          }[ending] || ending}</span>) : <p>完成章节后，结局会被永久收入此卷。</p>}</div>
          <h3 className="codex-heading">人物后记</h3>
          <div className="epilogue-scrolls">
            {Object.values(CHAPTER_EPILOGUES).flat().map((epilogue) => {
              const unlocked = (profile.unlockedEpilogues || []).includes(epilogue.id);
              return <article className={unlocked ? "" : "locked"} key={epilogue.id}>
                <span>{unlocked ? epilogue.character : "未解后记"}</span>
                <strong>{unlocked ? epilogue.title : "另一种抉择仍未走完"}</strong>
                <p>{unlocked ? epilogue.text : `在章节中作出与「${epilogue.choice}」相关的选择并完成云游。`}</p>
              </article>;
            })}
          </div>
        </>}
        {type === "settings" && <div className="save-management">
          <div className="feedback-settings">
            <div className="setting-heading"><span>战斗反馈</span><small>设置会保存在本机</small></div>
            <button className={profile.feedback.sound ? "active" : ""} onClick={() => {
              const sound = !profile.feedback.sound;
              setProfile((value) => ({ ...value, feedback: { ...value.feedback, sound } }));
              if (sound) feedback("reward");
            }}><strong>音效</strong><small>{profile.feedback.sound ? "已开启" : "已关闭"}</small></button>
            <button className={profile.feedback.haptics ? "active" : ""} onClick={() => {
              const haptics = !profile.feedback.haptics;
              setProfile((value) => ({ ...value, feedback: { ...value.feedback, haptics } }));
              if (haptics) feedback("impact");
            }}><strong>触觉</strong><small>{profile.feedback.haptics ? "已开启" : "已关闭"}</small></button>
            <button className={profile.feedback.reducedMotion ? "active" : ""} onClick={() => {
              const reducedMotion = !profile.feedback.reducedMotion;
              setProfile((value) => ({ ...value, feedback: { ...value.feedback, reducedMotion } }));
            }}><strong>低动效</strong><small>{profile.feedback.reducedMotion ? "已开启" : "已关闭"}</small></button>
            <button className={profile.feedback.readableText ? "active" : ""} onClick={() => {
              const readableText = !profile.feedback.readableText;
              setProfile((value) => ({ ...value, feedback: { ...value.feedback, readableText } }));
            }}><strong>可读模式</strong><small>{profile.feedback.readableText ? "大字距" : "标准"}</small></button>
            <label><span>音量</span><input type="range" min="0.1" max="1" step="0.05" value={profile.feedback.volume} onChange={(event) => setProfile((value) => ({ ...value, feedback: { ...value.feedback, volume: Number(event.target.value) } }))} /><b>{Math.round(profile.feedback.volume * 100)}%</b></label>
          </div>
          {savedRun ? <>
            <div className="save-summary-grid">
              <div><small>当前位置</small><strong>{runLocationLabel(savedRun)}</strong></div>
              <div><small>章节 / 路线</small><strong>{savedRun.selectedChapter} / {savedRun.routeProgress + 1}</strong></div>
              <div><small>生命 / 灵气</small><strong>{savedRun.hp} / {savedRun.qi ?? savedRun.maxQi}</strong></div>
              <div><small>牌组 / 法宝</small><strong>{savedRun.deck?.length || 0} / {savedRun.treasures?.length || 0}</strong></div>
            </div>
            {savedRun.screen === "combat" && <p className="save-combat-detail">敌人 {savedRun.enemy?.name} · {savedRun.enemy?.hp}/{savedRun.enemy?.max} 生命 · 手牌 {savedRun.hand?.length || 0} · 抽牌堆 {savedRun.drawPile?.length || 0} · 弃牌堆 {savedRun.discardPile?.length || 0}</p>}
            <small className="save-time">最近保存：{new Date(savedRun.savedAt).toLocaleString("zh-CN")}</small>
            {abandonArmed && <div className="abandon-confirm" role="alert">
              <strong>确认放弃这次云游？</strong>
              <span>这会清除当前局内手牌、路线、敌人和战利状态；永久成长与图鉴不会丢失。</span>
            </div>}
            <div className="abandon-actions">
              {abandonArmed && <button className="abandon-cancel" onClick={() => setAbandonArmed(false)}>取消</button>}
              <button className={`abandon-run ${abandonArmed ? "armed" : ""}`} onClick={() => abandonArmed ? abandonRun() : setAbandonArmed(true)}>{abandonArmed ? "确认放弃并回山门" : "放弃当前云游"}</button>
            </div>
            <p className="abandon-note">只清除未完成的局内存档，不影响等级、悟道、法宝图鉴、剧情印记和结局收藏。</p>
          </> : <p>当前没有未完成的云游存档。</p>}
        </div>}
      </article>
    </div>
  );
}

const rootElement = document.getElementById("root");
const appRoot = window.__qinglanAppRoot ?? createRoot(rootElement);
window.__qinglanAppRoot = appRoot;
appRoot.render(<App />);
