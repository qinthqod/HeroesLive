import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const origins = [
  { id: "sword", name: "青竹剑修", line: "剑势逐层积蓄，攻守均衡", icon: "/ui/icons/edge.png" },
  { id: "talisman", name: "符箓散修", line: "以符火和虚弱控制战局", icon: "/ui/icons/burn.png" },
  { id: "spirit", name: "灵泉药修", line: "循环灵气，长线恢复", icon: "/ui/icons/qi.png" },
];

const cards = {
  sword: [
    { id: "iron", name: "青竹剑诀", cost: 1, type: "攻击", text: "造成 6 点伤害。若剑势 ≥3，追加 3 点伤害。", art: "/card_iron_sword.png" },
    { id: "clear", name: "清心诀", cost: 1, type: "法门", text: "恢复 4 点生命，抽 1 张牌。", art: "/card_clear_heart.png" },
    { id: "ward", name: "护体灵光", cost: 1, type: "法门", text: "获得 6 点护盾。持续 2 回合。", art: "/card_body_ward.png" },
    { id: "array", name: "小五行剑阵", cost: 2, type: "术法", text: "造成 14 点伤害，获得 4 点护盾。", art: "/card_sword_array.png" },
    { id: "fire", name: "火弹符", cost: 1, type: "术法", text: "造成 8 点伤害，施加 2 层燃烧。", art: "/card_fire_talisman.png" },
  ],
  talisman: [
    { id: "fire", name: "火弹符", cost: 1, type: "术法", text: "造成 8 点伤害，施加 2 层燃烧。", art: "/card_fire_talisman.png" },
    { id: "soul", name: "镇魂符", cost: 1, type: "法门", text: "净化 1 层负面状态，获得 5 点护盾。", art: "/card_soul_guard.png" },
    { id: "clear", name: "清心诀", cost: 1, type: "法门", text: "恢复 4 点生命，抽 1 张牌。", art: "/card_clear_heart.png" },
    { id: "stone", name: "灵石催发", cost: 0, type: "法门", text: "获得 2 点灵气。消耗。", art: "/card_spirit_stone.png" },
    { id: "array", name: "小五行剑阵", cost: 2, type: "术法", text: "造成 14 点伤害，获得 4 点护盾。", art: "/card_sword_array.png" },
  ],
  spirit: [
    { id: "breath", name: "吐纳术", cost: 0, type: "法门", text: "获得 1 点灵气。", art: "/card_breath_cycle.png" },
    { id: "clear", name: "清心诀", cost: 1, type: "法门", text: "恢复 4 点生命，抽 1 张牌。", art: "/card_clear_heart.png" },
    { id: "ward", name: "护体灵光", cost: 1, type: "法门", text: "获得 6 点护盾。", art: "/card_body_ward.png" },
    { id: "cloud", name: "御风步", cost: 1, type: "法门", text: "抽 1 张牌，获得 2 点护盾。", art: "/card_cloudstep.png" },
    { id: "sword", name: "青竹剑诀", cost: 1, type: "攻击", text: "造成 6 点伤害。", art: "/card_iron_sword.png" },
  ],
};

const routeNodes = [
  { id: "battle", name: "雾竹山径", kind: "战斗", desc: "妖影伏行，胜者可取一门新术。", art: "/ui/bg_act1_valley.png" },
  { id: "event", name: "月隐古龛", kind: "机缘", desc: "香灰未冷，残符仍镇着一缕执念。", art: "/bg_soul_shrine.png" },
  { id: "market", name: "山脚坊市", kind: "坊市", desc: "用灵石换取术法、法宝与小物。", art: "/bg_market_stall.png" },
];

const enemyByStage = {
  1: { name: "野狼妖影", hp: 34, max: 34, intent: "撕咬 7", art: "/enemy_wolf_shadow.png" },
  2: { name: "玄阴引路鬼", hp: 48, max: 48, intent: "阴灯误途 9", art: "/enemy_xuanyin_guide.png" },
  3: { name: "雷池守阵者", hp: 72, max: 72, intent: "雷纹镇压 12", art: "/enemy_thunder_pool_guardian.png" },
};

function App() {
  const initialScreen = new URLSearchParams(window.location.search).get("screen") || "title";
  const [screen, setScreen] = useState(initialScreen);
  const [origin, setOrigin] = useState("sword");
  const [stage, setStage] = useState(1);
  const [hp, setHp] = useState(72);
  const [qi, setQi] = useState(3);
  const [shield, setShield] = useState(0);
  const [edge, setEdge] = useState(0);
  const [stones, setStones] = useState(18);
  const [enemy, setEnemy] = useState(enemyByStage[1]);
  const [hand, setHand] = useState(cards.sword);
  const [log, setLog] = useState("雨落石阶。妖影从竹林间显形。");
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    const root = document.querySelector(".app");
    if (root) root.scrollTop = 0;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [screen]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") setOverlay(null);
      if (screen === "combat" && event.code === "Space") endTurn();
      if (screen === "combat" && /^[1-5]$/.test(event.key)) playCard(Number(event.key) - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const selectedOrigin = origins.find((item) => item.id === origin);

  function beginRun() {
    setHand(cards[origin]);
    setScreen("map");
  }

  function enterCombat(nextStage = stage) {
    setStage(nextStage);
    setEnemy({ ...enemyByStage[nextStage] });
    setQi(3);
    setShield(0);
    setScreen("combat");
    setLog("雨幕骤紧，敌人拦住了去路。");
  }

  function playCard(index) {
    const card = hand[index];
    if (!card || qi < card.cost || enemy.hp <= 0) return;
    setQi((value) => value - card.cost);
    let damage = 0;
    if (["iron", "sword"].includes(card.id)) damage = 6 + (edge >= 3 ? 3 : 0);
    if (card.id === "array") damage = 14;
    if (card.id === "fire") damage = 8;
    if (["ward", "soul"].includes(card.id)) setShield((value) => value + (card.id === "ward" ? 6 : 5));
    if (card.id === "clear") setHp((value) => Math.min(72, value + 4));
    if (["breath", "stone"].includes(card.id)) setQi((value) => Math.min(5, value + (card.id === "stone" ? 2 : 1)));
    if (["iron", "sword", "array"].includes(card.id)) setEdge((value) => value + 1);
    if (damage > 0) {
      const nextHp = Math.max(0, enemy.hp - damage);
      setEnemy((value) => ({ ...value, hp: nextHp }));
      setLog(`${card.name}命中，造成 ${damage} 点伤害。${nextHp === 0 ? "敌影溃散。" : ""}`);
      if (nextHp === 0) window.setTimeout(() => setScreen("reward"), 550);
    } else {
      setLog(`${card.name}生效。灵息在雨中荡开。`);
    }
  }

  function endTurn() {
    if (enemy.hp <= 0) return;
    const incoming = stage === 1 ? 7 : stage === 2 ? 9 : 12;
    const lost = Math.max(0, incoming - shield);
    setHp((value) => Math.max(1, value - lost));
    setShield(0);
    setQi(3);
    setLog(`敌人发动「${enemy.intent}」。护盾抵去 ${Math.min(shield, incoming)}，你受到 ${lost} 点伤害。`);
  }

  function claimReward(card) {
    setHand((value) => [...value.slice(0, 4), card]);
    setStones((value) => value + 8);
    if (stage >= 3) setScreen("summary");
    else {
      setStage((value) => value + 1);
      setScreen("map");
    }
  }

  return (
    <main className={`app screen-${screen}`}>
      <Atmosphere />
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
        />
      )}
      {screen === "event" && <EventScreen setScreen={setScreen} setHp={setHp} setStones={setStones} />}
      {screen === "combat" && (
        <CombatScreen
          origin={selectedOrigin}
          stage={stage}
          hp={hp}
          qi={qi}
          shield={shield}
          edge={edge}
          stones={stones}
          enemy={enemy}
          hand={hand}
          log={log}
          playCard={playCard}
          endTurn={endTurn}
          setOverlay={setOverlay}
        />
      )}
      {screen === "reward" && <RewardScreen stage={stage} claimReward={claimReward} />}
      {screen === "summary" && <SummaryScreen hp={hp} stones={stones} setScreen={setScreen} />}
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
    </>
  );
}

function TitleScreen({ origin, setOrigin, selectedOrigin, beginRun, setOverlay }) {
  return (
    <section className="title-screen">
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

function MapScreen({ stage, hp, stones, enterCombat, setScreen, setOverlay }) {
  return (
    <section className="map-screen">
      <RunHeader stage={stage} hp={hp} stones={stones} />
      <div className="map-intro">
        <span className="section-index">第 {stage} 幕 · 路线</span>
        <h1>{stage === 1 ? "雨入青岚" : stage === 2 ? "灯照玄阴" : "雷云问心"}</h1>
        <p>每条岔路都留下代价。选择下一处落脚之地。</p>
      </div>
      <div className="route-line" />
      <div className="route-cards">
        {routeNodes.map((node, index) => (
          <button
            className={`route-card route-${index}`}
            key={node.id}
            onClick={() => node.id === "battle" ? enterCombat(stage) : node.id === "event" ? setScreen("event") : setOverlay("market")}
          >
            <img src={node.art} alt="" />
            <span className="route-kind">{node.kind}</span>
            <div><h2>{node.name}</h2><p>{node.desc}</p><strong>踏入此处 →</strong></div>
          </button>
        ))}
      </div>
      <div className="map-side-note"><span>路线研判</span><p>当前生命充足，优先战斗补齐牌组。坊市可保留至灵石 30 以上。</p></div>
    </section>
  );
}

function EventScreen({ setScreen, setHp, setStones }) {
  const choose = (kind) => {
    if (kind === "rest") setHp((value) => Math.min(72, value + 12));
    if (kind === "stones") setStones((value) => value + 18);
    setScreen("map");
  };
  return (
    <section className="event-screen">
      <div className="event-art"><img src="/bg_soul_shrine.png" alt="" /></div>
      <div className="event-copy"><span className="section-index">山中机缘</span><h1>月隐古龛</h1><p>残香在雨里燃着。神龛下压着一枚裂开的青玉，黑雾不敢靠近半步。</p></div>
      <div className="event-choices">
        <button onClick={() => choose("rest")}><small>安坐调息</small><strong>恢复 12 点生命</strong><span>不惊动神龛中的执念。</span></button>
        <button onClick={() => choose("stones")}><small>揭符取玉</small><strong>获得 18 灵石</strong><span>下一战敌人获得 5 点护体。</span></button>
        <button onClick={() => choose("leave")}><small>拱手离去</small><strong>保持谨慎</strong><span>不获得任何收益，也不承担风险。</span></button>
      </div>
    </section>
  );
}

function CombatScreen({ origin, stage, hp, qi, shield, edge, stones, enemy, hand, log, playCard, endTurn, setOverlay }) {
  const hpPercent = Math.max(0, (enemy.hp / enemy.max) * 100);
  return (
    <section className="combat-screen">
      <aside className="player-rail">
        <div className="portrait"><img src="/enemy_rogue_cultivator.png" alt="" /></div>
        <div className="player-name"><strong>{origin.name}</strong><small>炼气前期</small></div>
        <Resource icon="/ui/icons/hp.png" name="生命" value={`${hp}/72`} />
        <Resource icon="/ui/icons/qi.png" name="灵气" value={`${qi}/3`} />
        <Resource icon="/ui/icons/shield.png" name="护盾" value={shield} />
        <Resource icon="/ui/icons/edge.png" name="剑势" value={edge} />
        <Resource icon="/ui/icons/stones.png" name="灵石" value={stones} />
        <div className="quick-items">
          <button aria-label="聚气诀，剩余 2"><img src="/ui/consumables/spirit_draught.png" alt="" /><span>2</span></button>
          <button aria-label="护体灵气，剩余 1"><img src="/ui/consumables/stone_skin_talisman.png" alt="" /><span>1</span></button>
          <button aria-label="清心散，剩余 1"><img src="/ui/consumables/clarity_powder.png" alt="" /><span>1</span></button>
        </div>
      </aside>
      <div className="enemy-stage">
        <div className="enemy-title"><span>第 {stage} 幕 · 遭遇</span><h1>{enemy.name}</h1></div>
        <div className="enemy-health"><span style={{ width: `${hpPercent}%` }} /><strong>{enemy.hp}/{enemy.max}</strong></div>
        <div className="intent"><small>下次行动</small><strong>{enemy.intent}</strong></div>
        <img className="enemy-art" src={enemy.art} alt={enemy.name} />
        <p className="combat-log">{log}</p>
      </div>
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
        {hand.slice(0, 5).map((card, index) => <Card key={`${card.id}-${index}`} card={card} index={index} playable={qi >= card.cost} onClick={() => playCard(index)} />)}
      </div>
      <button className="end-turn" onClick={endTurn}><strong>结束<br />回合</strong><kbd>Space</kbd></button>
      <button className="deck-count" aria-label="查看牌组，共 12 张" onClick={() => setOverlay("deck")}><img src="/card_back_qinglan_trial.png" alt="" /><span>12</span></button>
      <div className="qi-orb"><strong>{qi}</strong><span>/3</span></div>
    </section>
  );
}

function Resource({ icon, name, value }) {
  return <div className="resource"><img src={icon} alt="" /><span>{name}</span><strong>{value}</strong></div>;
}

function Card({ card, index, playable, onClick }) {
  return (
    <button className={`game-card ${playable ? "playable" : "disabled"} type-${card.type}`} onClick={onClick}>
      <span className="card-cost">{card.cost}</span>
      <span className="card-key">{index + 1}</span>
      <h3>{card.name}</h3>
      <img src={card.art} alt="" />
      <small>{card.type}</small>
      <p>{card.text}</p>
    </button>
  );
}

function RewardScreen({ stage, claimReward }) {
  const rewards = [
    { id: "thunder", name: "雷纹护体", cost: 1, type: "法门", text: "获得 12 点护盾，恢复 5 点生命。", art: "/card_thunder_body.png" },
    { id: "eclipse", name: "月蚀斩", cost: 2, type: "攻击", text: "连续造成 3 次 6 点伤害。", art: "/card_moon_eclipse_slash.png" },
    { id: "soul", name: "镇魂符", cost: 1, type: "法门", text: "净化负面状态，获得 5 点护盾。", art: "/card_soul_guard.png" },
  ];
  return (
    <section className="reward-screen">
      <span className="section-index">战利 · 择一</span><h1>妖影散尽，灵光未灭</h1><p>选择一门术法加入牌组，并获得 8 枚灵石。</p>
      <div className="reward-cards">{rewards.map((card, index) => <Card key={card.id} card={card} index={index} playable onClick={() => claimReward(card)} />)}</div>
      <small className="reward-tip">第 {stage} 幕奖励 · 点击卡牌确认</small>
    </section>
  );
}

function SummaryScreen({ hp, stones, setScreen }) {
  return (
    <section className="summary-screen">
      <div className="summary-seal"><span>甲上</span><small>试炼评阶</small></div>
      <div className="summary-copy"><span className="section-index">筑基卷 · 已成</span><h1>雷云散去，<br />灵台澄明。</h1><p>你守住了这一夜的道心，也跨过了筑基门槛。</p></div>
      <div className="summary-stats"><div><small>余命</small><strong>{hp}</strong></div><div><small>灵石</small><strong>{stones}</strong></div><div><small>战斗</small><strong>7</strong></div><div><small>修为</small><strong>+38</strong></div></div>
      <button className="primary-cta summary-action" onClick={() => setScreen("title")}><span>再入青岚</span></button>
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

createRoot(document.getElementById("root")).render(<App />);
