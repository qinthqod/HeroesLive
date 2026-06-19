import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  ALL_CARDS,
  CHAPTERS,
  CHAPTER_ROUTE_COPY,
  CHAPTER_ROUTES,
  CHAPTER_STORIES,
  DECK_RECIPES,
  META_TALENTS,
  PROFESSIONS,
  ROUTE_ROWS,
  getProfession,
} from "./gameData";

const origins = PROFESSIONS.map((job) => ({ ...job, line: job.style }));

const cards = Object.fromEntries(PROFESSIONS.map((job) => [job.id, job.cards.slice(0, 8)]));

const enemyByChapter = {
  1: {
    1: { name: "野狼妖影", hp: 34, max: 34, intent: "撕咬 7", art: "/enemy_wolf_shadow.png" },
    2: { name: "雾竹巡山妖", hp: 48, max: 48, intent: "竹影扑杀 9", art: "/enemy_rogue_cultivator.png" },
    3: { name: "第七盏灯", hp: 72, max: 72, intent: "灯火噬命 12", art: "/enemy_black_cult_deacon.png" },
  },
  2: {
    1: { name: "玄阴灯侍", hp: 42, max: 42, intent: "引灯入雾 8", art: "/enemy_xuanyin_guide.png" },
    2: { name: "断碑护灯长老", hp: 60, max: 60, intent: "旧名镇魂 11", art: "/enemy_black_cult_deacon.png" },
    3: { name: "写名鬼灯", hp: 84, max: 84, intent: "替命燃烧 14", art: "/enemy_xuanyin_guide.png" },
  },
  3: {
    1: { name: "雷云劫影", hp: 50, max: 50, intent: "落雷 10", art: "/enemy_thunder_pool_guardian.png" },
    2: { name: "问心劫使", hp: 70, max: 70, intent: "震脉雷罚 13", art: "/enemy_black_cult_deacon.png" },
    3: { name: "雷池守阵者", hp: 100, max: 100, intent: "阵雷齐鸣 16", art: "/enemy_thunder_pool_guardian.png" },
  },
  4: {
    1: { name: "失梦游魂", hp: 56, max: 56, intent: "窃梦 11", art: "/enemy_xuanyin_guide.png" },
    2: { name: "黑莲织梦师", hp: 78, max: 78, intent: "影缝 14", art: "/enemy_black_cult_deacon.png" },
    3: { name: "无影城主", hp: 112, max: 112, intent: "万梦归莲 18", art: "/enemy_black_cult_deacon.png" },
  },
  5: {
    1: { name: "旧命残影", hp: 64, max: 64, intent: "未行之路 12", art: "/enemy_rogue_cultivator.png" },
    2: { name: "执笔者遗念", hp: 88, max: 88, intent: "删名 16", art: "/enemy_xuanyin_guide.png" },
    3: { name: "守门真君", hp: 128, max: 128, intent: "天门定命 20", art: "/enemy_thunder_pool_guardian.png" },
  },
};

const freshJobState = () => ({
  seals: 0,
  cold: 0,
  heat: 0,
  contracts: [],
  activeBeast: "玄狼",
  devices: 0,
  cunning: 0,
  lamps: 0,
});

function App() {
  const query = new URLSearchParams(window.location.search);
  const initialScreen = query.get("screen") || "home";
  const initialOrigin = PROFESSIONS.some((job) => job.id === query.get("origin")) ? query.get("origin") : "sword";
  const initialChapter = Math.min(5, Math.max(1, Number(query.get("chapter")) || 1));
  const [screen, setScreen] = useState(initialScreen);
  const [origin, setOrigin] = useState(initialOrigin);
  const [stage, setStage] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [storyIndex, setStoryIndex] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
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
      talentLevels: { meridian: 2, mind: 1, edge: 0 },
      jobMastery: {},
    };
    return {
      ...base,
      unlockedJobs: PROFESSIONS.map((job) => job.id),
      talentLevels: base.talentLevels || { meridian: 2, mind: 1, edge: 0 },
      jobMastery: base.jobMastery || {},
    };
  });
  const [hp, setHp] = useState(72);
  const [qi, setQi] = useState(3);
  const [shield, setShield] = useState(0);
  const [edge, setEdge] = useState(0);
  const [jobState, setJobState] = useState(freshJobState);
  const [enemyBurn, setEnemyBurn] = useState(0);
  const [enemyPoison, setEnemyPoison] = useState(0);
  const [enemyWeak, setEnemyWeak] = useState(0);
  const [stones, setStones] = useState(18);
  const [enemy, setEnemy] = useState(enemyByChapter[initialChapter][1]);
  const [runDeck, setRunDeck] = useState(cards[initialOrigin]);
  const [hand, setHand] = useState(cards[initialOrigin].slice(0, 5));
  const [drawPile, setDrawPile] = useState(cards[initialOrigin].slice(5));
  const [discardPile, setDiscardPile] = useState([]);
  const [exhaustPile, setExhaustPile] = useState([]);
  const [drawFx, setDrawFx] = useState(null);
  const [combatTurn, setCombatTurn] = useState(1);
  const [log, setLog] = useState("雨落石阶。妖影从竹林间显形。");
  const [overlay, setOverlay] = useState(null);
  const [combatFx, setCombatFx] = useState(null);
  const [combatBusy, setCombatBusy] = useState(false);
  const [playerFx, setPlayerFx] = useState(null);
  const [transition, setTransition] = useState("");
  const timers = useRef([]);

  useEffect(() => {
    const root = document.querySelector(".app");
    if (root) root.scrollTop = 0;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [screen]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") setOverlay(null);
      if (screen === "combat" && event.code === "Space" && !combatBusy) endTurn();
      if (screen === "combat" && /^[1-5]$/.test(event.key) && !combatBusy) playCard(Number(event.key) - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    window.localStorage.setItem("qinglan-profile-v2", JSON.stringify(profile));
  }, [profile]);

  const selectedOrigin = origins.find((item) => item.id === origin);

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

  function beginRun() {
    const starter = cards[origin];
    setRunDeck(starter);
    prepareDeck(starter, false);
    setStage(1);
    setHp(72);
    setStones(18);
    setStoryIndex(0);
    setRouteProgress(0);
    setProfile((value) => ({
      ...value,
      jobMastery: { ...value.jobMastery, [origin]: (value.jobMastery[origin] || 0) + 10 },
    }));
    changeScreen("story");
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function prepareDeck(deckCards, showDraw = true) {
    const pile = shuffle(deckCards);
    const openingHand = pile.slice(0, 5);
    setHand(openingHand);
    setDrawPile(pile.slice(5));
    setDiscardPile([]);
    setExhaustPile([]);
    setCombatTurn(1);
    setEdge(0);
    setJobState(freshJobState());
    if (showDraw) {
      setDrawFx({ cards: openingHand, source: "开局手牌", nonce: Date.now() });
      later(() => setDrawFx(null), 1250);
    }
  }

  function continueStory(choice) {
    if (choice) {
      setProfile((value) => ({ ...value, choices: [...value.choices.slice(-7), choice] }));
    }
    if (storyIndex < CHAPTER_STORIES[selectedChapter].length - 1) {
      setStoryIndex((value) => value + 1);
    } else {
      changeScreen("map");
    }
  }

  function enterCombat(nextStage = stage) {
    setStage(nextStage);
    setEnemy({ ...enemyByChapter[selectedChapter][nextStage] });
    setQi(3);
    setShield(0);
    setEnemyBurn(0);
    setEnemyPoison(0);
    setEnemyWeak(0);
    setLog("雨幕骤紧，敌人拦住了去路。");
    setCombatFx(null);
    prepareDeck(runDeck);
    changeScreen("combat");
  }

  function resolveProfessionCard(card, baseDamage) {
    let damage = baseDamage;
    let note = "";

    if (origin === "talisman") {
      if (card.keyword === "符印") {
        setJobState((value) => ({ ...value, seals: Math.min(9, value.seals + 2) }));
        note = "附着 2 枚符印";
      }
      if (card.keyword === "引爆" || /引爆/.test(card.text)) {
        const burst = jobState.seals * 6;
        damage += burst;
        note = `引爆 ${jobState.seals} 枚符印，追加 ${burst} 点伤害`;
        setJobState((value) => ({ ...value, seals: 0 }));
      }
    }

    if (origin === "alchemy") {
      if (card.keyword === "温药") setJobState((value) => ({ ...value, heat: Math.min(6, value.heat + 1) }));
      if (card.keyword === "寒药") setJobState((value) => ({ ...value, cold: Math.min(6, value.cold + 1) }));
      const poisonMatch = card.text.match(/施加\s*(\d+)\s*层丹毒/);
      if (poisonMatch) setEnemyPoison((value) => value + Number(poisonMatch[1]));
      if (card.keyword === "调和" && jobState.cold > 0 && jobState.heat > 0) {
        damage += 6;
        setShield((value) => value + 6);
        setJobState((value) => ({ ...value, cold: value.cold - 1, heat: value.heat - 1 }));
        note = "寒热调和，追加 6 点伤害与 6 点护盾";
      }
    }

    if (origin === "beast") {
      const beast = ["玄狼", "白鹿", "青鸾", "灵狐", "石猿"].find((name) => card.name.includes(name));
      if (beast) {
        setJobState((value) => ({ ...value, activeBeast: beast, contracts: [...new Set([...value.contracts, beast])] }));
        note = `灵契切换为${beast}`;
      }
      if (card.keyword === "协同") {
        const bonus = jobState.contracts.length * 4;
        damage += bonus;
        note = `${jobState.contracts.length} 种灵兽协同，追加 ${bonus} 点伤害`;
      }
    }

    if (origin === "artificer") {
      if (["机关", "阵列"].includes(card.keyword) || /部署/.test(card.text)) {
        setJobState((value) => ({ ...value, devices: Math.min(6, value.devices + 1), cunning: Math.min(9, value.cunning + 1) }));
        note = "部署机关，机巧 +1";
      }
      if (/每个已部署机关|每个机关/.test(card.combo || "")) {
        const bonus = jobState.devices * 4;
        damage += bonus;
        note = `${jobState.devices} 个机关协同，追加 ${bonus} 点伤害`;
      }
      if (card.keyword === "复位" && jobState.devices > 0) {
        damage += 4;
        note = "复位机关，再次触发 4 点伤害";
      }
    }

    if (origin === "soul") {
      if (card.keyword === "魂灯" || /点亮\s*1\s*盏魂灯/.test(card.combo || "")) {
        setJobState((value) => ({ ...value, lamps: Math.min(7, value.lamps + 1) }));
        note = "点亮 1 盏魂灯";
      }
      if (card.keyword === "燃魂" || /熄灭全部魂灯/.test(card.text)) {
        const bonus = jobState.lamps * 7;
        damage += bonus;
        note = `熄灭 ${jobState.lamps} 盏魂灯，追加 ${bonus} 点伤害`;
        setJobState((value) => ({ ...value, lamps: 0 }));
      }
    }

    return { damage, note };
  }

  function playCard(index) {
    const card = hand[index];
    if (!card || qi < card.cost || enemy.hp <= 0 || combatBusy) return;
    const damageMatch = card.text.match(/造成\s*(\d+)\s*点伤害(?:\s*(\d+)\s*次)?/);
    const blockMatch = card.text.match(/获得\s*(\d+)\s*点护盾/);
    const healMatch = card.text.match(/恢复\s*(\d+)\s*点生命/);
    const qiMatch = card.text.match(/获得\s*(\d+)\s*点灵气/);
    const edgeMatch = card.text.match(/获得\s*(\d+)\s*层剑势/);
    const burnMatch = card.text.match(/施加\s*(\d+)\s*层燃烧/);
    const weakMatch = card.text.match(/施加\s*(\d+)\s*层虚弱/);
    const drawMatch = card.text.match(/抽\s*(\d+)\s*张牌/);
    const selfMatch = card.text.match(/失去\s*(\d+)\s*点生命/);
    const hits = damageMatch?.[2] ? Number(damageMatch[2]) : 1;
    let damage = damageMatch ? Number(damageMatch[1]) * hits : 0;
    if (origin === "sword" && edge >= 3 && card.type === "攻击") damage += 3;
    const professionResult = resolveProfessionCard(card, damage);
    damage = professionResult.damage;
    const shieldGain = blockMatch ? Number(blockMatch[1]) : 0;
    const heal = healMatch ? Number(healMatch[1]) : 0;
    const qiGain = qiMatch ? Number(qiMatch[1]) : 0;
    const edgeGain = edgeMatch ? Number(edgeMatch[1]) : card.type === "攻击" && origin === "sword" ? 1 : 0;
    const burnGain = burnMatch ? Number(burnMatch[1]) : 0;
    const weakGain = weakMatch ? Number(weakMatch[1]) : 0;
    const drawGain = drawMatch ? Number(drawMatch[1]) : 0;
    const selfDamage = selfMatch ? Number(selfMatch[1]) : 0;
    const kind = damage > 0 ? (card.id === "fire" ? "fire" : "attack") : shieldGain > 0 ? "guard" : heal > 0 ? "heal" : "spirit";
    setCombatBusy(true);
    setQi((value) => value - card.cost);
    setHand((value) => value.filter((_, cardIndex) => cardIndex !== index));
    setCombatFx({ card, index, kind, damage, shieldGain, heal, qiGain, phase: "cast" });
    setLog(`${card.name} · 引诀`);
    later(() => setCombatFx((value) => value ? { ...value, phase: "impact" } : value), 360);
    later(() => {
      if (shieldGain) setShield((value) => value + shieldGain);
      if (heal) setHp((value) => Math.min(72, value + heal));
      if (qiGain) setQi((value) => Math.min(5, value + qiGain));
      if (edgeGain) setEdge((value) => value + edgeGain);
      if (burnGain) setEnemyBurn((value) => value + burnGain);
      if (weakGain) setEnemyWeak((value) => value + weakGain);
      if (selfDamage) setHp((value) => Math.max(1, value - selfDamage));
      if (drawGain) drawCardsIntoHand(drawGain, card.name);
      if (damage > 0) {
        const nextHp = Math.max(0, enemy.hp - damage);
        setEnemy((value) => ({ ...value, hp: nextHp }));
        setLog(`${card.name}命中，造成 ${damage} 点伤害。${professionResult.note ? professionResult.note + "。" : ""}${nextHp === 0 ? "敌影溃散。" : ""}`);
        if (nextHp === 0) later(() => changeScreen("reward", 260), 680);
      } else {
        const effect = shieldGain
          ? `获得 ${shieldGain} 点护盾`
          : heal
            ? `恢复 ${heal} 点生命`
            : burnGain
              ? `施加 ${burnGain} 层燃烧`
              : weakGain
                ? `施加 ${weakGain} 层虚弱`
                : /丹毒/.test(card.text)
                  ? card.text.replace(/。$/, "")
                  : qiGain
                    ? `获得 ${qiGain} 点灵气`
                    : `术法运转`;
        setLog(`${card.name}生效，${effect}。${professionResult.note ? professionResult.note + "。" : ""}`);
      }
    }, 470);
    later(() => setCombatFx((value) => value ? { ...value, phase: "fade" } : value), 880);
    later(() => {
      if (/消耗|移出本场/.test(card.text)) setExhaustPile((value) => [...value, card]);
      else setDiscardPile((value) => [...value, card]);
      setCombatFx(null);
      setCombatBusy(false);
    }, 1120);
  }

  function drawCardsIntoHand(amount, source) {
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
      if (drawn.length) {
        setDrawFx({ cards: drawn, source: `${source} · 抽牌`, nonce: Date.now() });
        later(() => setDrawFx(null), 1050);
      }
      return [...currentHand, ...drawn];
    });
  }

  function endTurn() {
    if (enemy.hp <= 0 || combatBusy) return;
    const baseIncoming = Number(enemy.intent.match(/\d+/)?.[0]) || (stage === 1 ? 7 : stage === 2 ? 9 : 12);
    const incoming = Math.max(0, baseIncoming - enemyWeak * 2);
    const lost = Math.max(0, incoming - shield);
    setCombatBusy(true);
    setCombatFx({ phase: "enemy-turn", kind: "enemy", damage: lost });
    setLog(`敌人正在发动「${enemy.intent}」……`);
    later(() => {
      setCombatFx({ phase: "enemy-impact", kind: "enemy", damage: lost });
      setPlayerFx({ kind: lost > 0 ? "hurt" : "blocked", damage: lost });
      setHp((value) => Math.max(1, value - lost));
      setShield(0);
      if (enemyWeak > 0) setEnemyWeak((value) => Math.max(0, value - 1));
      setLog(`敌人发动「${enemy.intent}」。护盾抵去 ${Math.min(shield, incoming)}，你受到 ${lost} 点伤害。`);
    }, 560);
    later(() => {
      const burnTick = enemyBurn;
      if (burnTick > 0) {
        setEnemy((value) => {
          const nextHp = Math.max(0, value.hp - burnTick);
          if (nextHp === 0) later(() => changeScreen("reward", 220), 260);
          return { ...value, hp: nextHp };
        });
        setEnemyBurn((value) => Math.max(0, value - 1));
      }
      if (enemyPoison > 0) {
        setEnemy((value) => ({ ...value, hp: Math.max(0, value.hp - enemyPoison) }));
        setEnemyPoison((value) => Math.max(0, value - 1));
      }
      if (origin === "artificer" && jobState.devices > 0) {
        setEnemy((value) => ({ ...value, hp: Math.max(0, value.hp - jobState.devices * 4) }));
      }
      const carry = [...drawPile];
      const reshuffled = shuffle([...discardPile, ...hand]);
      const source = carry.length >= 5 ? carry : [...carry, ...reshuffled];
      const nextHand = source.slice(0, 5);
      setHand(nextHand);
      setDrawPile(source.slice(5));
      setDiscardPile([]);
      setCombatTurn((value) => value + 1);
      setQi(3);
      setDrawFx({ cards: nextHand, source: carry.length >= 5 ? "抽牌" : "洗牌后抽取", nonce: Date.now() });
      setCombatFx(null);
      setPlayerFx(null);
      setCombatBusy(false);
      later(() => setDrawFx(null), 1250);
    }, 1280);
  }

  function claimReward(card) {
    setRunDeck((value) => [...value, card]);
    setStones((value) => value + 8);
    setProfile((value) => ({
      ...value,
      xp: value.xp + 90,
      spirit: value.spirit + 4,
      jobMastery: { ...value.jobMastery, [origin]: (value.jobMastery[origin] || 0) + 5 },
    }));
    if (stage >= 3) {
      setProfile((value) => ({ ...value, chapter: Math.max(Math.min(5, selectedChapter + 1), value.chapter), jade: value.jade + 120 }));
      changeScreen("summary");
    }
    else {
      setStage((value) => value + 1);
      setRouteProgress((value) => value + 1);
      changeScreen("map");
    }
  }

  return (
    <main
      className={`app screen-${screen} transition-${transition}`}
      onScroll={(event) => {
        if (screen === "combat" && event.currentTarget.scrollTop !== 0) {
          event.currentTarget.scrollTop = 0;
        }
      }}
    >
      <Atmosphere />
      <div className="screen-curtain" />
      {screen === "home" && (
        <HomeScreen
          profile={profile}
          setScreen={setScreen}
          setOverlay={setOverlay}
          beginRun={() => changeScreen("chapters")}
        />
      )}
      {screen === "chapters" && (
        <ChapterScreen
          profile={profile}
          onBack={() => changeScreen("home")}
          onChoose={(chapterId) => {
            setSelectedChapter(chapterId);
            changeScreen("classes");
          }}
        />
      )}
      {screen === "classes" && (
        <ClassScreen
          origin={origin}
          setOrigin={setOrigin}
          profile={profile}
          onBack={() => changeScreen("chapters")}
          onStart={beginRun}
        />
      )}
      {screen === "story" && (
        <StoryScreen
          scene={CHAPTER_STORIES[selectedChapter][storyIndex]}
          index={storyIndex}
          total={CHAPTER_STORIES[selectedChapter].length}
          chapter={selectedChapter}
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
          onBack={() => changeScreen("home")}
        />
      )}
      {screen === "title" && (
        <TitleScreen
          origin={origin}
          setOrigin={setOrigin}
          selectedOrigin={selectedOrigin}
          beginRun={beginRun}
          setOverlay={setOverlay}
        />
      )}
      {screen === "map" && (
        <MapScreen
          stage={stage}
          hp={hp}
          stones={stones}
          enterCombat={enterCombat}
          setScreen={setScreen}
          setOverlay={setOverlay}
          routeProgress={routeProgress}
          setRouteProgress={setRouteProgress}
          choices={profile.choices}
          chapter={selectedChapter}
        />
      )}
      {screen === "event" && <EventScreen chapter={selectedChapter} origin={selectedOrigin} choices={profile.choices} setProfile={setProfile} setScreen={setScreen} setHp={setHp} setStones={setStones} setRunDeck={setRunDeck} setRouteProgress={setRouteProgress} />}
      {screen === "combat" && (
        <CombatScreen
          origin={selectedOrigin}
          stage={stage}
          hp={hp}
          qi={qi}
          shield={shield}
          edge={edge}
          jobState={jobState}
          stones={stones}
          enemy={enemy}
          enemyBurn={enemyBurn}
          enemyPoison={enemyPoison}
          enemyWeak={enemyWeak}
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
          playCard={playCard}
          endTurn={endTurn}
          setOverlay={setOverlay}
        />
      )}
      {screen === "reward" && <RewardScreen stage={stage} origin={origin} claimReward={claimReward} />}
      {screen === "summary" && <SummaryScreen hp={hp} stones={stones} setScreen={setScreen} profile={profile} />}
      {overlay && <Overlay type={overlay} close={() => setOverlay(null)} hand={hand} />}
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

function HomeScreen({ profile, setScreen, setOverlay, beginRun }) {
  return (
    <section className="mobile-shell home-screen screen-content">
      <div className="home-hero">
        <img src="/ui/bg_title_shrine.png" alt="" />
        <div className="home-shade" />
        <MobileTopBar title="青岚夜行" subtitle="云游录 · 第七夜" profile={profile} />
        <div className="home-player">
          <span className="section-index">当前境界 · 炼气七层</span>
          <h1>命册有缺，<br />此夜无归。</h1>
          <p>师姐留下的血书正在褪色。第七盏灯亮起之前，你必须进入青岚谷。</p>
        </div>
        <button className="chapter-continue" onClick={beginRun}>
          <small>主线 · 第一章</small>
          <strong>雨入青岚</strong>
          <span>继续调查 →</span>
        </button>
      </div>
      <div className="home-dashboard">
        <div className="resource-strip">
          <span><img src="/ui/icons/stones.png" alt="" /><b>{profile.jade}</b><small>灵玉</small></span>
          <span><img src="/ui/icons/qi.png" alt="" /><b>{profile.spirit}</b><small>悟道</small></span>
          <span><img src="/ui/icons/treasure.png" alt="" /><b>6/6</b><small>道途</small></span>
        </div>
        <div className="home-actions">
          <button onClick={() => setScreen("classes")}><img src="/ui/breakthroughs/sword_heart.png" alt="" /><span><strong>道途</strong><small>{DECK_RECIPES.length} 套流派</small></span></button>
          <button onClick={() => setScreen("collection")}><img src="/ui/treasures/bamboo_slip.png" alt="" /><span><strong>藏经阁</strong><small>{ALL_CARDS.length} 张术法</small></span></button>
          <button onClick={() => setScreen("growth")}><img src="/ui/insights/open_meridians.png" alt="" /><span><strong>悟道树</strong><small>永久成长</small></span></button>
          <button onClick={() => setOverlay("codex")}><img src="/ui/treasures/spirit_lamp.png" alt="" /><span><strong>异闻录</strong><small>人物与线索</small></span></button>
        </div>
        <article className="daily-thread">
          <div><span className="section-index">今夜异闻</span><h2>谁点亮了第七盏灯？</h2><p>完成第一章的三个剧情节点，解锁沈砚秋的旧日手札。</p></div>
          <strong>1/3</strong>
        </article>
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

function ChapterScreen({ profile, onBack, onChoose }) {
  return (
    <section className="mobile-shell chapter-screen screen-content">
      <MobileTopBar title="云游录" subtitle="五卷主线 · 逐章解锁" onBack={onBack} profile={profile} />
      <div className="chapter-heading">
        <span className="section-index">主线篇章</span>
        <h1>循灯而行</h1>
        <p>每一章包含剧情抉择、分支路线、精英事件与最终首领。</p>
      </div>
      <div className="chapter-list">
        {CHAPTERS.map((chapter, index) => {
          const unlocked = index === 0 || profile.chapter > index;
          return (
            <button key={chapter.id} className={`chapter-card ${unlocked ? "" : "locked"}`} disabled={!unlocked} onClick={() => onChoose(chapter.id)}>
              <img src={chapter.art} alt="" />
              <div className="chapter-card-shade" />
              <span className="chapter-number">卷 {String(chapter.id).padStart(2, "0")}</span>
              <div><small>{chapter.region} · {chapter.level}</small><h2>{chapter.name}</h2><p>{chapter.summary}</p><strong>{unlocked ? `首领 · ${chapter.boss}` : "完成前章后解锁"}</strong></div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ClassScreen({ origin, setOrigin, profile, onBack, onStart }) {
  const current = getProfession(origin);
  const mastery = profile.jobMastery[origin] || 0;
  return (
    <section className="mobile-shell class-screen screen-content">
      <MobileTopBar title="选择道途" subtitle="职业决定卡池与核心资源" onBack={onBack} profile={profile} />
      <div className="class-focus" style={{ "--job-color": current.color }}>
        <img className="class-portrait" src={current.portrait} alt="" />
        <div className="class-focus-shade" />
        <div className="class-copy"><span>{current.resource}</span><h1>{current.name}</h1><p>{current.motto}</p><strong>{current.style}</strong><div className="mastery-line"><i style={{ width: `${Math.min(100, mastery)}%` }} /><small>道途熟练 {mastery}/100</small></div></div>
      </div>
      <div className="class-tabs">
        {PROFESSIONS.map((job) => {
          const unlocked = profile.unlockedJobs.includes(job.id);
          return <button key={job.id} disabled={!unlocked} className={origin === job.id ? "active" : ""} onClick={() => setOrigin(job.id)}><img src={job.icon} alt="" /><span>{job.short}</span>{!unlocked && <i>锁</i>}</button>;
        })}
      </div>
      <article className="mechanic-panel">
        <span className="section-index">核心机制</span>
        <p>{current.mechanic}</p>
        <strong className="build-count">该职业拥有 20 张专属卡牌 · 18 套推荐构筑</strong>
        <div className="starter-preview">{current.cards.slice(0, 4).map((card) => <MiniCard card={card} key={card.id} />)}</div>
      </article>
      <button className="primary-cta mobile-primary" onClick={onStart}>以此道途进入第一章</button>
    </section>
  );
}

function StoryScreen({ scene, index, total, chapter, onChoose }) {
  const chapterChoices = {
    1: [["追问第二十四人的身份", "相信守门人"], ["隐瞒师姐来信", "隐瞒血书"]],
    2: [["接过写有自己名字的灯", "接受引灯"], ["先寻找师父留下的旧灯", "追查旧案"]],
    3: [["借雷劫强行破阵", "破阵"], ["先寻找沈砚秋的阵眼", "寻人"]],
    4: [["唤醒城中人的噩梦", "归还梦境"], ["夺取黑莲保存的影子", "夺回影子"]],
    5: [["让命册保留所有旧名", "修复命册"], ["在最后一页写下新的规则", "重写命册"]],
  }[chapter];
  return (
    <section className="story-screen screen-content">
      <img className="story-art" src={scene.art} alt="" />
      <div className="story-gradient" />
      <div className="story-progress">{Array.from({ length: total }, (_, step) => <i className={step <= index ? "active" : ""} key={step} />)}</div>
      <div className="story-dialogue">
        <span>{scene.role}</span>
        <h1>{scene.speaker}</h1>
        <p>“{scene.text}”</p>
        {index === 1 ? (
          <div className="story-choices">
            {chapterChoices.map(([label, value]) => <button key={value} onClick={() => onChoose(value)}>{label}</button>)}
          </div>
        ) : <button className="story-next" onClick={() => onChoose()}>继续 <span>›</span></button>}
      </div>
    </section>
  );
}

function GrowthScreen({ profile, setProfile, onBack }) {
  const upgrade = (talent) => {
    const level = profile.talentLevels[talent.id] || 0;
    if (profile.spirit < 8 || level >= talent.max) return;
    setProfile((value) => ({
      ...value,
      spirit: value.spirit - 8,
      talentLevels: { ...value.talentLevels, [talent.id]: level + 1 },
    }));
  };
  return (
    <section className="mobile-shell growth-screen screen-content">
      <MobileTopBar title="悟道树" subtitle="跨局永久成长" onBack={onBack} profile={profile} />
      <div className="growth-summary"><span>可用悟道</span><strong>{profile.spirit}</strong><p>完成章节、发现新卡牌和达成剧情结局均可获得。</p></div>
      <div className="talent-path">
        {META_TALENTS.map((talent, index) => (
          <button key={talent.id} className="talent-node" onClick={() => upgrade(talent)}>
            <img src={talent.art} alt="" /><div><small>悟道节点 {index + 1}</small><h2>{talent.name} · {profile.talentLevels[talent.id] || 0}/{talent.max}</h2><p>{talent.effect}</p></div><span>8</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CollectionScreen({ origin, setOrigin, onBack }) {
  const current = getProfession(origin);
  const [rarity, setRarity] = useState("全部");
  const shown = rarity === "全部" ? current.cards : current.cards.filter((card) => card.rarity === rarity);
  return (
    <section className="mobile-shell collection-screen screen-content">
      <MobileTopBar title="藏经阁" subtitle={`${ALL_CARDS.length} 张职业卡牌`} onBack={onBack} />
      <div className="collection-jobs">{PROFESSIONS.map((job) => <button className={job.id === origin ? "active" : ""} key={job.id} onClick={() => setOrigin(job.id)}><img src={job.icon} alt="" />{job.short}</button>)}</div>
      <div className="rarity-filter">{["全部", "普通", "精良", "稀有", "传说"].map((item) => <button className={item === rarity ? "active" : ""} key={item} onClick={() => setRarity(item)}>{item}</button>)}</div>
      <div className="collection-count"><span>{current.name}</span><strong>{shown.length} / 20</strong></div>
      <div className="card-library">{shown.map((card) => <LibraryCard card={card} key={card.id} />)}</div>
    </section>
  );
}

function MiniCard({ card }) {
  return <div className="mini-card"><img src={card.art} alt="" /><span>{card.cost}</span><small>{card.name}</small></div>;
}

function LibraryCard({ card }) {
  return <article className={`library-card rarity-${card.rarity}`}><img src={card.art} alt="" /><div><span>{card.cost}</span><small>{card.rarity} · {card.type}</small><h3>{card.name}</h3><p>{card.text}</p></div></article>;
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
              <img src={item.icon} alt="" />
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

function RunHeader({ stage, hp, stones }) {
  return (
    <header className="run-header">
      <div className="run-brand"><span className="brand-mark small">青</span><div><strong>青岚夜行</strong><small>第 {stage} 幕 · {stage === 1 ? "青岚谷" : stage === 2 ? "玄阴山道" : "筑基雷云"}</small></div></div>
      <div className="run-progress"><span style={{ width: `${Math.min(100, stage * 33)}%` }} /></div>
      <div className="header-resources"><span><img src="/ui/icons/hp.png" alt="" />{hp}/72</span><span><img src="/ui/icons/stones.png" alt="" />{stones}</span></div>
    </header>
  );
}

function MapScreen({ stage, hp, stones, enterCombat, setScreen, setOverlay, routeProgress, setRouteProgress, choices, chapter }) {
  const chapterRoutes = CHAPTER_ROUTES[chapter] || ROUTE_ROWS;
  const currentChoices = chapterRoutes[Math.min(routeProgress, chapterRoutes.length - 1)];
  const chapterCopy = CHAPTER_ROUTE_COPY[chapter];
  const routeMeta = {
    story: { risk: "无战斗", reward: "剧情线索", consequence: choices.includes("相信守门人") ? "陆观愿意透露名册旧案" : "陆观仍在试探你的来意" },
    battle: { risk: "危险 · 低", reward: "职业卡牌", consequence: "稳定补强牌组" },
    event: { risk: "危险 · 未知", reward: "恢复 / 悟道", consequence: "可能留下本局印记" },
    elite: { risk: "危险 · 高", reward: "稀有牌 / 法宝", consequence: "首领前最后试炼" },
    market: { risk: `持有 ${stones} 灵石`, reward: "购牌 / 删牌", consequence: "牺牲经济换稳定性" },
    boss: { risk: "首领战", reward: "章节突破", consequence: "揭开第七盏灯真相" },
  };
  const chooseNode = (node) => {
    if (["battle", "elite", "boss"].includes(node.id)) enterCombat(Math.min(3, routeProgress || 1));
    else if (node.id === "event" || node.id === "story") setScreen("event");
    else {
      setOverlay("market");
      setRouteProgress((value) => Math.min(3, value + 1));
    }
  };
  return (
    <section className="map-screen campaign-map screen-content">
      <RunHeader stage={stage} hp={hp} stones={stones} />
      <div className="map-intro">
        <span className="section-index">第 {chapter} 章 · 路线 {routeProgress + 1}/4</span>
        <h1>{chapterCopy.title}</h1>
        <p>选择会改变资源、人物关系与后续剧情。首领在山门尽头等你。</p>
      </div>
      <div className="route-journey">
        <div className="route-progress-scroll">
          {chapterRoutes.map((row, index) => <i key={index} className={index < routeProgress ? "done" : index === routeProgress ? "current" : ""}><span>{index + 1}</span></i>)}
        </div>
        <div className="route-now">
          <span className="section-index">命途所至</span>
          <strong>{chapterCopy.beats[routeProgress]}</strong>
        </div>
        <div className={`route-choice-grid choices-${currentChoices.length}`}>
          {currentChoices.map((node, index) => {
            const meta = routeMeta[node.id];
            return (
              <button className="route-choice-card" key={node.id} onClick={() => chooseNode(node)} style={{ "--choice-delay": `${index * 100}ms` }}>
                <img src={node.art} alt="" />
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
          {chapterRoutes.slice(routeProgress + 1).map((row, index) => <b key={index}>{row.map((node) => node.kind).join(" / ")}</b>)}
        </div>
      </div>
      <div className="map-side-note"><span>本章线索</span><p>{chapterCopy.clue}</p></div>
    </section>
  );
}

function EventScreen({ chapter, origin, choices, setProfile, setScreen, setHp, setStones, setRunDeck, setRouteProgress }) {
  const choose = (kind) => {
    if (kind === "rest") setHp((value) => Math.min(72, value + 12));
    if (kind === "stones") setStones((value) => value + 18);
    if (kind === "profession") {
      const classCard = origin.cards.find((card) => card.rarity === "精良" && !card.refined) || origin.cards[5];
      setRunDeck((value) => [...value, classCard]);
    }
    setProfile((value) => ({ ...value, choices: [...value.choices.slice(-7), `古龛:${kind}`] }));
    setRouteProgress((value) => Math.min(3, value + 1));
    setScreen("map");
  };
  const professionOffer = {
    sword: ["参悟残留剑痕", "获得一张精良剑修牌", "剑痕与血书上的笔锋出自同一人。"],
    talisman: ["临摹镇魂残符", "获得一张精良符师牌", "符脚藏着沈砚秋惯用的落款。"],
    alchemy: ["辨认龛下药灰", "获得一张精良丹师牌", "药灰中混有内门才有的寒髓草。"],
    beast: ["安抚龛后灵狐", "获得一张精良御灵牌", "灵狐认得血书上的气息。"],
    artificer: ["拆解供台机括", "获得一张精良偃师牌", "机关里刻着被抹去的第二十四号。"],
    soul: ["点亮无主魂灯", "获得一张精良契师牌", "魂灯中传出师姐尚未消散的回声。"],
  }[origin.id];
  const eventCopy = {
    1: ["山中机缘", "月隐古龛", "残香在雨里燃着。神龛下压着一枚裂开的青玉，黑雾不敢靠近半步。", "/bg_soul_shrine.png"],
    2: ["玄阴异闻", "镇魂古龛", "每张残符都写着一个被鬼灯替换过的名字，师父的名字也在其中。", "/ui/bg_act2_mountain.png"],
    3: ["雷云异闻", "洗雷池", "池中雷水倒映的不是现在，而是每一次你本可做出不同选择的时刻。", "/bg_thunder_pool.png"],
    4: ["无灯异闻", "失梦茶楼", "茶汤里漂着一段陌生童年。店主说，那是城主抵押在这里的梦。", "/bg_dark_forge.png"],
    5: ["天门异闻", "缺页书库", "书架上每个空位都在低声念诵一个无人记得的名字。", "/bg_secret_realm.png"],
  }[chapter];
  return (
    <section className="event-screen screen-content">
      <div className="event-art"><img src={eventCopy[3]} alt="" /></div>
      <div className="event-copy"><span className="section-index">{eventCopy[0]}</span><h1>{eventCopy[1]}</h1><p>{eventCopy[2]}</p></div>
      <div className="event-choices">
        <button style={{ "--delay": "140ms" }} onClick={() => choose("profession")}><small>{professionOffer[0]}</small><strong>{professionOffer[1]}</strong><span>{professionOffer[2]}</span></button>
        <button style={{ "--delay": "220ms" }} onClick={() => choose("rest")}><small>安坐调息</small><strong>恢复 12 点生命</strong><span>{choices.includes("相信守门人") ? "陆观教过你的吐纳法压住了黑雾。" : "你独自抵御神龛中的执念。"}</span></button>
        <button style={{ "--delay": "270ms" }} onClick={() => choose("stones")}><small>揭符取玉</small><strong>获得 18 灵石</strong><span>下一战敌人获得 5 点护体。</span></button>
        <button style={{ "--delay": "340ms" }} onClick={() => choose("leave")}><small>拱手离去</small><strong>保持谨慎</strong><span>不获得任何收益，也不承担风险。</span></button>
      </div>
    </section>
  );
}

function CombatScreen({ origin, stage, hp, qi, shield, edge, jobState, stones, enemy, enemyBurn, enemyPoison, enemyWeak, hand, drawPile, discardPile, exhaustPile, drawFx, combatTurn, log, combatFx, combatBusy, playerFx, playCard, endTurn, setOverlay }) {
  const hpPercent = Math.max(0, (enemy.hp / enemy.max) * 100);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const selectedCard = selectedCardIndex === null ? null : hand[selectedCardIndex];
  useEffect(() => setSelectedCardIndex(null), [hand]);
  const professionResource = {
    sword: { icon: "/ui/icons/edge.png", label: "剑势", value: edge },
    talisman: { icon: "/ui/icons/burn.png", label: "符印", value: jobState.seals },
    alchemy: { icon: "/ui/icons/hp.png", label: "药性", value: `${jobState.cold}寒/${jobState.heat}热` },
    beast: { icon: "/ui/icons/treasure.png", label: "灵契", value: `${jobState.activeBeast}·${jobState.contracts.length}` },
    artificer: { icon: "/ui/icons/shield.png", label: "机巧", value: `${jobState.cunning}/${jobState.devices}机` },
    soul: { icon: "/ui/icons/curse.png", label: "魂灯", value: jobState.lamps },
  }[origin.id];
  return (
    <section className={`combat-screen screen-content ${combatFx?.phase || ""} ${playerFx?.kind || ""}`}>
      <aside className={`player-rail ${playerFx ? "player-impact" : ""}`}>
        <div className="portrait"><img src="/enemy_rogue_cultivator.png" alt="" /></div>
        <div className="player-name"><strong>{origin.name}</strong><small>炼气前期</small></div>
        <Resource icon="/ui/icons/hp.png" name="生命" value={`${hp}/72`} />
        <Resource icon="/ui/icons/qi.png" name="灵气" value={`${qi}/3`} />
        <Resource icon="/ui/icons/shield.png" name="护盾" value={shield} />
        <Resource icon={professionResource.icon} name={professionResource.label} value={professionResource.value} />
        <Resource icon="/ui/icons/stones.png" name="灵石" value={stones} />
        <div className="quick-items">
          <button aria-label="聚气诀，剩余 2"><img src="/ui/consumables/spirit_draught.png" alt="" /><span>2</span></button>
          <button aria-label="护体灵气，剩余 1"><img src="/ui/consumables/stone_skin_talisman.png" alt="" /><span>1</span></button>
          <button aria-label="清心散，剩余 1"><img src="/ui/consumables/clarity_powder.png" alt="" /><span>1</span></button>
        </div>
      </aside>
      <div className={`enemy-stage ${combatFx?.phase === "impact" && combatFx.damage > 0 ? "enemy-impact" : ""} ${combatFx?.phase === "enemy-turn" ? "enemy-lunge" : ""}`}>
        <div className="enemy-title"><span>第 {stage} 幕 · 第 {combatTurn} 回合</span><h1>{enemy.name}</h1></div>
        <div className="enemy-health"><span style={{ width: `${hpPercent}%` }} /><strong>{enemy.hp}/{enemy.max}</strong></div>
        <div className="intent"><small>下次行动</small><strong>{enemy.intent}</strong></div>
        {(enemyBurn > 0 || enemyPoison > 0 || enemyWeak > 0) && <div className="enemy-statuses">
          {enemyBurn > 0 && <span className="status-burn"><img src="/ui/icons/burn.png" alt="" />燃烧 {enemyBurn}</span>}
          {enemyPoison > 0 && <span className="status-poison"><img src="/ui/icons/curse.png" alt="" />丹毒 {enemyPoison}</span>}
          {enemyWeak > 0 && <span className="status-weak"><img src="/ui/icons/weak.png" alt="" />虚弱 {enemyWeak}</span>}
        </div>}
        <img className="enemy-art" src={enemy.art} alt={enemy.name} />
        {combatFx?.phase === "impact" && combatFx.damage > 0 && <div className={`damage-number damage-${combatFx.kind}`}>−{combatFx.damage}</div>}
        {combatFx?.phase === "impact" && combatFx.kind === "guard" && <div className="effect-number effect-guard">+{combatFx.shieldGain} 护盾</div>}
        {combatFx?.phase === "impact" && combatFx.kind === "heal" && <div className="effect-number effect-heal">+{combatFx.heal} 生命</div>}
        <p className="combat-log">{log}</p>
      </div>
      {combatFx?.card && <PlayedCardFx fx={combatFx} />}
      {combatFx?.phase === "impact" && combatFx.damage > 0 && <div className={`impact-streak streak-${combatFx.kind}`} />}
      {combatFx?.phase === "enemy-impact" && <div className="enemy-strike-flash" />}
      {playerFx && <div className={`player-damage-number ${playerFx.kind}`}>{playerFx.damage > 0 ? `−${playerFx.damage}` : "格挡"}</div>}
      {combatFx?.phase === "enemy-turn" && <div className="turn-banner"><small>敌方回合</small><strong>{enemy.intent}</strong></div>}
      {drawFx && <DrawSequence fx={drawFx} />}
      <aside className="progress-rail">
        <span>本轮进度</span>
        {[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= stage ? "done" : ""}>{step}</i>)}
        <nav>
          <button onClick={() => setOverlay("map")}>地图</button>
          <button onClick={() => setOverlay("codex")}>图鉴</button>
          <button onClick={() => setOverlay("settings")}>设置</button>
        </nav>
      </aside>
      <div className="hand">
        {hand.slice(0, 5).map((card, index) => <Card key={`${card.id}-${index}`} card={card} index={index} selected={selectedCardIndex === index} playable={!combatBusy && qi >= card.cost} casting={combatFx?.index === index} onClick={() => setSelectedCardIndex(index)} onDoubleClick={() => playCard(index)} />)}
      </div>
      {selectedCard && <div className="card-inspector">
        <div><span>{selectedCard.keyword}</span><strong>{selectedCard.name}</strong><small>{selectedCard.rarity} · {selectedCard.type} · {selectedCard.cost} 灵气</small></div>
        <p>{selectedCard.text}</p>
        <em>{selectedCard.combo}</em>
        <button disabled={combatBusy || qi < selectedCard.cost} onClick={() => playCard(selectedCardIndex)}>施展</button>
      </div>}
      <button className="end-turn" disabled={combatBusy} onClick={endTurn}><span className="end-turn-ring" /><strong>结束<br />回合</strong><kbd>Space</kbd></button>
      <div className="pile-status">
        <button className="deck-count" aria-label={`抽牌堆剩余 ${drawPile.length} 张`} onClick={() => setOverlay("deck")}><img src="/card_back_qinglan_trial.png" alt="" /><span>{drawPile.length}</span></button>
        <span className="discard-count">弃 {discardPile.length}</span>
        {exhaustPile.length > 0 && <span className="exhaust-count">耗 {exhaustPile.length}</span>}
      </div>
      <div className="qi-orb"><strong>{qi}</strong><span>/3</span></div>
    </section>
  );
}

function DrawSequence({ fx }) {
  return (
    <div className="draw-sequence" key={fx.nonce}>
      <div className="draw-source"><img src="/card_back_qinglan_trial.png" alt="" /><span>{fx.source}</span></div>
      {fx.cards.map((card, index) => (
        <div className={`draw-ghost draw-ghost-${index}`} style={{ "--draw-index": index }} key={`${card.id}-${index}`}>
          <img src="/card_back_qinglan_trial.png" alt="" />
          <article>
            <span>{card.cost}</span>
            <strong>{card.name}</strong>
            <small>{card.keyword}</small>
          </article>
        </div>
      ))}
      <div className="draw-ink-bloom" />
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
        <img src={fx.card.art} alt="" />
        <small>{fx.card.type}</small>
      </article>
    </div>
  );
}

function Resource({ icon, name, value }) {
  return <div className="resource"><img src={icon} alt="" /><span>{name}</span><strong>{value}</strong></div>;
}

function Card({ card, index, playable, casting = false, selected = false, onClick, onDoubleClick }) {
  return (
    <button className={`game-card rarity-${card.rarity} ${playable ? "playable" : "disabled"} ${selected ? "selected-card" : ""} ${casting ? "casting-card" : ""} type-${card.type}`} disabled={!playable} onClick={onClick} onDoubleClick={onDoubleClick}>
      <span className="card-cost">{card.cost}</span>
      <span className="card-key">{index + 1}</span>
      <h3>{card.name}</h3>
      <img src={card.art} alt="" />
      <div className="card-meta"><small>{card.type}</small><b>{card.rarity}</b></div>
      <strong className="card-keyword">{card.keyword}</strong>
      <p>{card.text}</p>
      {card.combo && <em>{card.combo}</em>}
    </button>
  );
}

function RewardScreen({ stage, origin, claimReward }) {
  const rewards = useMemo(() => {
    const profession = getProfession(origin);
    const eligible = profession.cards.filter((card) => card.tier <= Math.min(4, stage + 1) && !profession.starterDeck.includes(card.id));
    const weighted = eligible.flatMap((card) => {
      const weight = card.rarity === "普通" ? (stage === 1 ? 5 : 2) : card.rarity === "精良" ? 4 : card.rarity === "稀有" ? stage + 1 : 1;
      return Array.from({ length: weight }, () => card);
    });
    const selected = [];
    while (selected.length < 3 && weighted.length) {
      const candidate = weighted[Math.floor(Math.random() * weighted.length)];
      if (!selected.some((card) => card.id === candidate.id)) selected.push(candidate);
    }
    return selected;
  }, [origin, stage]);
  return (
    <section className="reward-screen screen-content">
      <span className="section-index">战利 · 择一</span><h1>妖影散尽，灵光未灭</h1><p>奖励已按章节、稀有度和当前职业牌池生成。</p>
      <div className="reward-cards">{rewards.map((card, index) => <div className="reward-card-wrap" style={{ "--delay": `${180 + index * 120}ms` }} key={card.id}><Card card={card} index={index} playable onClick={() => claimReward(card)} /></div>)}</div>
      <small className="reward-tip">第 {stage} 幕奖励 · 后续章节提高稀有牌和精研牌概率</small>
    </section>
  );
}

function SummaryScreen({ hp, stones, setScreen }) {
  return (
    <section className="summary-screen screen-content">
      <div className="summary-seal"><span>甲上</span><small>试炼评阶</small></div>
      <div className="summary-copy"><span className="section-index">筑基卷 · 已成</span><h1>雷云散去，<br />灵台澄明。</h1><p>你守住了这一夜的道心，也跨过了筑基门槛。</p></div>
      <div className="summary-stats"><div><small>余命</small><strong>{hp}</strong></div><div><small>灵石</small><strong>{stones}</strong></div><div><small>战斗</small><strong>7</strong></div><div><small>修为</small><strong>+38</strong></div></div>
      <button className="primary-cta summary-action" onClick={() => setScreen("home")}><span>返回山门</span></button>
    </section>
  );
}

function Overlay({ type, close, hand }) {
  const content = useMemo(() => ({
    guide: ["试炼札记", "先读敌人意图，再决定护体或进攻。每一幕至少经过一次坊市或修炼，避免牌组失衡。"],
    codex: ["青岚图鉴", "术法、敌情、法宝和山中异闻会在发现后记入此卷。"],
    settings: ["设置", "音乐 80% · 环境音 65% · 动效：完整 · 决策提示：开启"],
    market: ["山脚坊市", "摊主收起油纸伞：灵石够多时，再来谈一门真正的好术法。"],
    map: ["路线概览", "青岚谷 → 玄阴山道 → 筑基雷云"],
    deck: ["当前牌组", `${hand.map((card) => card.name).join(" · ")} · 共 ${hand.length + 7} 张`],
  })[type], [type, hand]);
  return (
    <div className="overlay" onMouseDown={close}>
      <article onMouseDown={(event) => event.stopPropagation()}>
        <button className="overlay-close" onClick={close}>收起</button>
        <span className="section-index">卷册</span><h2>{content[0]}</h2><p>{content[1]}</p>
      </article>
    </div>
  );
}

const rootElement = document.getElementById("root");
const appRoot = window.__qinglanAppRoot ?? createRoot(rootElement);
window.__qinglanAppRoot = appRoot;
appRoot.render(<App />);
