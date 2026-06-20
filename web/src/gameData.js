const arts = [
  "/card_iron_sword.png",
  "/card_fire_talisman.png",
  "/card_clear_heart.png",
  "/card_body_ward.png",
  "/card_sword_array.png",
  "/card_cloudstep.png",
  "/card_soul_guard.png",
  "/card_spirit_stone.png",
  "/card_breath_cycle.png",
  "/card_thunder_body.png",
  "/card_moon_eclipse_slash.png",
  "/card_foundation_surge.png",
];

const classBlueprints = [
  {
    id: "sword",
    name: "青竹剑修",
    short: "剑修",
    icon: "/ui/icons/edge.png",
    portrait: "/enemy_rogue_cultivator.png",
    color: "#d6b45d",
    resource: "剑势",
    motto: "藏锋于雨，一剑问心。",
    style: "攻守均衡 · 连击爆发",
    mechanic: "连续使用攻击牌积蓄剑势，以终结技一次释放。",
    prefixes: ["青竹", "流云", "照夜", "藏锋", "问心"],
    actions: ["剑诀", "回锋", "破阵", "追月"],
    effects: ["造成 7 点伤害。", "造成 5 点伤害，获得 2 层剑势。", "获得 7 点护盾；若有剑势，抽 1 张牌。", "消耗全部剑势，每层追加 3 点伤害。"],
  },
  {
    id: "talisman",
    name: "赤篆符师",
    short: "符师",
    icon: "/ui/icons/burn.png",
    portrait: "/enemy_black_cult_deacon.png",
    color: "#cf7050",
    resource: "符印",
    motto: "朱砂落纸，百鬼退行。",
    style: "延迟引爆 · 状态控制",
    mechanic: "将符印贴在敌人身上，叠加后用敕令同时引爆。",
    prefixes: ["赤火", "镇魂", "玄雷", "缚影", "净坛"],
    actions: ["符", "敕令", "法印", "真言"],
    effects: ["施加 3 层燃烧。", "造成 5 点伤害并附着 1 枚符印。", "获得 6 点护盾，下一张符牌费用 -1。", "引爆所有符印，每枚造成 5 点伤害。"],
  },
  {
    id: "alchemy",
    name: "百草丹师",
    short: "丹师",
    icon: "/ui/icons/hp.png",
    portrait: "/enemy_xuanyin_guide.png",
    color: "#8fc08a",
    resource: "药性",
    motto: "草木有灵，毒亦是药。",
    style: "炼丹循环 · 毒疗转换",
    mechanic: "累积寒、热药性，调和后触发强力丹方与持续恢复。",
    prefixes: ["青囊", "赤芝", "寒髓", "回春", "蚀骨"],
    actions: ["散", "丹", "药引", "方"],
    effects: ["恢复 6 点生命。", "施加 4 层中毒。", "获得 2 点药性并抽 1 张牌。", "调和药性：恢复 8 点生命并造成 8 点伤害。"],
  },
  {
    id: "beast",
    name: "山海御灵",
    short: "御灵",
    icon: "/ui/icons/treasure.png",
    portrait: "/enemy_wolf_shadow.png",
    color: "#71b4a8",
    resource: "灵契",
    motto: "山川为盟，百兽同途。",
    style: "灵兽协同 · 指令连锁",
    mechanic: "召唤三类灵兽，以指令牌触发不同的协同攻击。",
    prefixes: ["白鹿", "玄狼", "青鸾", "石猿", "灵狐"],
    actions: ["契", "呼唤", "奔袭", "守望"],
    effects: ["灵兽造成 6 点伤害。", "获得 5 点护盾，灵兽获得守护。", "切换灵兽并抽 1 张牌。", "每有一只已契约灵兽，造成 4 点伤害。"],
  },
  {
    id: "artificer",
    name: "天工偃师",
    short: "偃师",
    icon: "/ui/icons/shield.png",
    portrait: "/enemy_thunder_pool_guardian.png",
    color: "#8ca8c2",
    resource: "机巧",
    motto: "木石无心，亦可问道。",
    style: "机关部署 · 护甲反击",
    mechanic: "部署持续生效的机关，以机巧升级并组合成阵列。",
    prefixes: ["铜雀", "墨轮", "雷枢", "千机", "玄甲"],
    actions: ["机括", "偃甲", "阵列", "飞梭"],
    effects: ["造成 6 点伤害，获得 3 点护盾。", "部署：回合结束造成 4 点伤害。", "获得 3 点机巧，随机升级一个机关。", "每个机关使本牌伤害 +4。"],
  },
  {
    id: "soul",
    name: "幽冥契师",
    short: "契师",
    icon: "/ui/icons/curse.png",
    portrait: "/enemy_xuanyin_guide.png",
    color: "#a584bd",
    resource: "魂灯",
    motto: "借一盏灯，照生死两岸。",
    style: "生命交易 · 魂魄复用",
    mechanic: "支付生命点亮魂灯，将已使用卡牌从弃牌堆再次唤回。",
    prefixes: ["引魂", "渡厄", "无常", "幽灯", "彼岸"],
    actions: ["契", "咒", "灯", "回响"],
    effects: ["失去 2 点生命，造成 10 点伤害。", "点亮 1 盏魂灯，获得 7 点护盾。", "将上一张牌返回手牌。", "熄灭全部魂灯，每盏恢复 4 点生命并造成 4 点伤害。"],
  },
];

const CARD_PATTERNS = {
  sword: [
    { name: "青竹剑诀", cost: 1, type: "攻击", rarity: "普通", keyword: "剑势", text: "造成 7 点伤害。", combo: "若本回合已打出攻击牌，获得 1 层剑势。", upgrade: "伤害 7 → 11", art: 0 },
    { name: "藏锋诀", cost: 0, type: "法门", rarity: "普通", keyword: "运转", text: "获得 1 层剑势，抽 1 张牌。", combo: "本回合下一张攻击牌伤害 +2。", upgrade: "额外获得 1 层剑势", art: 8 },
    { name: "回风剑", cost: 1, type: "攻击", rarity: "精良", keyword: "连携", text: "造成 8 点伤害，获得 1 层剑势。", combo: "若手牌少于 3 张，抽 1 张牌。", upgrade: "伤害 8 → 12", art: 5 },
    { name: "锋芒护身", cost: 1, type: "法门", rarity: "精良", keyword: "蓄势", text: "获得 6 点护盾与 2 层剑势。", combo: "剑势达到 4 层时，额外获得 4 点护盾。", upgrade: "护盾 6 → 10", art: 3 },
    { name: "小五行剑阵", cost: 2, type: "攻击", rarity: "精良", keyword: "阵法", text: "造成 14 点伤害，获得 4 点护盾。", combo: "消耗 2 层剑势，追加 6 点伤害。", upgrade: "费用 2 → 1", art: 4 },
    { name: "逐月连斩", cost: 2, type: "攻击", rarity: "稀有", keyword: "多段", text: "造成 6 点伤害 3 次。", combo: "每层剑势使每段伤害 +1。", upgrade: "每段伤害 6 → 8", art: 10 },
    { name: "裂魂剑", cost: 1, type: "攻击", rarity: "精良", keyword: "破绽", text: "造成 9 点伤害，施加 1 层虚弱。", combo: "若敌人已有虚弱，获得 2 层剑势。", upgrade: "伤害 9 → 13", art: 4 },
    { name: "引劫剑", cost: 2, type: "攻击", rarity: "稀有", keyword: "消耗", text: "造成 11 点伤害 2 次。用后移出本场战斗。", combo: "剑势达到 5 层时不再消耗。", upgrade: "每段伤害 11 → 14", art: 11 },
    { name: "玉月成璧", cost: 2, type: "法门", rarity: "稀有", keyword: "月相", text: "获得 12 点护盾，恢复 4 点生命。", combo: "霜月下额外抽 1 张牌。", upgrade: "护盾 12 → 16", art: 9 },
    { name: "万剑归岚", cost: 3, type: "攻击", rarity: "传说", keyword: "终结", text: "消耗全部剑势，每层造成 6 点伤害。", combo: "至少消耗 4 层时，返还 1 点灵气。", upgrade: "每层伤害 6 → 8", art: 11 },
  ],
  talisman: [
    { name: "火弹符", cost: 1, type: "术法", rarity: "普通", keyword: "燃烧", text: "造成 7 点伤害，施加 2 层燃烧。", combo: "敌人有破绽时额外造成 4 点伤害。", upgrade: "燃烧 2 → 4", art: 1 },
    { name: "镇魂符", cost: 1, type: "法门", rarity: "精良", keyword: "净心", text: "获得 7 点护盾，驱散 2 层虚弱。", combo: "若成功驱散，抽 1 张牌。", upgrade: "护盾 7 → 11", art: 6 },
    { name: "缚影法印", cost: 1, type: "术法", rarity: "普通", keyword: "符印", text: "附着 2 枚符印，施加 1 层虚弱。", combo: "敌人行动后，每枚符印造成 2 点伤害。", upgrade: "符印 2 → 3", art: 6 },
    { name: "赤篆连书", cost: 0, type: "法门", rarity: "普通", keyword: "运转", text: "抽 1 张牌；下一张符牌费用 -1。", combo: "若抽到术法牌，获得 1 点灵气。", upgrade: "抽牌 1 → 2", art: 7 },
    { name: "阴火符", cost: 2, type: "术法", rarity: "精良", keyword: "燃烧", text: "造成 12 点伤害，施加 4 层燃烧。", combo: "引爆 1 枚符印，立即结算一次燃烧。", upgrade: "费用 2 → 1", art: 1 },
    { name: "玄雷敕令", cost: 2, type: "术法", rarity: "稀有", keyword: "引爆", text: "引爆全部符印，每枚造成 6 点伤害。", combo: "引爆至少 3 枚时，抽 2 张牌。", upgrade: "每枚伤害 6 → 8", art: 9 },
    { name: "净坛真言", cost: 1, type: "法门", rarity: "精良", keyword: "净心", text: "净除 1 张心魔，获得 5 点护盾。", combo: "无心魔可净除时，改为获得 2 点灵气。", upgrade: "净除数量 1 → 2", art: 2 },
    { name: "雷火连符", cost: 1, type: "术法", rarity: "精良", keyword: "连携", text: "造成 5 点伤害 2 次。", combo: "本回合每打出一张符牌，追加 1 次。", upgrade: "每段伤害 5 → 7", art: 4 },
    { name: "借风燃纸", cost: 1, type: "法门", rarity: "稀有", keyword: "增幅", text: "本回合燃烧伤害翻倍，抽 1 张牌。", combo: "若敌人燃烧 ≥5，获得 8 点护盾。", upgrade: "额外抽 1 张牌", art: 5 },
    { name: "万符归一", cost: 3, type: "术法", rarity: "传说", keyword: "终结", text: "造成 18 点伤害，引爆符印并结算燃烧。", combo: "每引爆 1 枚符印，本牌费用 -1。", upgrade: "伤害 18 → 26", art: 11 },
  ],
  alchemy: [
    { name: "回春散", cost: 1, type: "法门", rarity: "普通", keyword: "温药", text: "恢复 6 点生命，获得 1 点热性。", combo: "生命低于一半时，额外恢复 3 点。", upgrade: "恢复 6 → 10", art: 2 },
    { name: "蚀骨丹", cost: 1, type: "术法", rarity: "普通", keyword: "毒", text: "施加 4 层丹毒。", combo: "敌人每次获得护盾时失去 2 点生命。", upgrade: "丹毒 4 → 6", art: 1 },
    { name: "寒髓药引", cost: 0, type: "法门", rarity: "普通", keyword: "寒药", text: "获得 1 点寒性，抽 1 张牌。", combo: "下一张丹药费用 -1。", upgrade: "额外获得 1 点寒性", art: 8 },
    { name: "赤芝养气丹", cost: 1, type: "法门", rarity: "精良", keyword: "灵气", text: "获得 2 点灵气，恢复 3 点生命。消耗。", combo: "拥有热性时不再消耗。", upgrade: "恢复 3 → 7", art: 7 },
    { name: "药炉温养", cost: 1, type: "法门", rarity: "精良", keyword: "调和", text: "消耗 1 寒性与 1 热性，抽 3 张牌。", combo: "若成功调和，获得 6 点护盾。", upgrade: "费用 1 → 0", art: 3 },
    { name: "百草相生", cost: 2, type: "法门", rarity: "稀有", keyword: "循环", text: "恢复 8 点生命，将 2 张丹药洗回抽牌堆。", combo: "每洗回一张牌，获得 1 点灵气。", upgrade: "恢复 8 → 12", art: 8 },
    { name: "腐脉毒雾", cost: 2, type: "术法", rarity: "精良", keyword: "毒", text: "施加 7 层丹毒与 1 层虚弱。", combo: "敌人已有丹毒时，立即结算 3 层。", upgrade: "丹毒 7 → 10", art: 6 },
    { name: "玉液护心", cost: 1, type: "法门", rarity: "精良", keyword: "护持", text: "获得 9 点护盾，驱散 1 层虚弱。", combo: "成功驱散时获得 1 点热性。", upgrade: "护盾 9 → 13", art: 3 },
    { name: "逆炼血丹", cost: 1, type: "术法", rarity: "稀有", keyword: "反噬", text: "失去 3 点生命，造成 18 点伤害。", combo: "每层热性使伤害 +3。", upgrade: "自伤 3 → 1", art: 11 },
    { name: "阴阳大还丹", cost: 3, type: "法门", rarity: "传说", keyword: "终结", text: "调和全部药性：恢复 14 点生命并造成 14 点伤害。", combo: "寒热相等时费用变为 1。", upgrade: "数值 14 → 20", art: 9 },
  ],
  beast: [
    { name: "玄狼奔袭", cost: 1, type: "攻击", rarity: "普通", keyword: "狼契", text: "灵兽造成 8 点伤害。", combo: "连续使用指令牌时追加 3 点伤害。", upgrade: "伤害 8 → 12", art: 0 },
    { name: "白鹿守望", cost: 1, type: "法门", rarity: "普通", keyword: "鹿契", text: "获得 8 点护盾。", combo: "本回合首次受伤后恢复 3 点生命。", upgrade: "护盾 8 → 12", art: 3 },
    { name: "青鸾回风", cost: 0, type: "法门", rarity: "普通", keyword: "鸾契", text: "切换为青鸾，抽 1 张牌。", combo: "下一张指令牌费用 -1。", upgrade: "抽牌 1 → 2", art: 5 },
    { name: "灵狐探路", cost: 1, type: "法门", rarity: "精良", keyword: "寻宝", text: "从牌堆中发现 1 张指令牌。", combo: "若选择 0 费牌，获得 4 点护盾。", upgrade: "发现数量 1 → 2", art: 6 },
    { name: "石猿撼地", cost: 2, type: "攻击", rarity: "精良", keyword: "猿契", text: "造成 14 点伤害，施加 1 层虚弱。", combo: "拥有护盾时伤害 +6。", upgrade: "伤害 14 → 20", art: 4 },
    { name: "百兽同途", cost: 2, type: "攻击", rarity: "稀有", keyword: "协同", text: "每种已契约灵兽造成 4 点伤害。", combo: "至少三种灵兽时抽 2 张牌。", upgrade: "每种伤害 4 → 6", art: 10 },
    { name: "山君号令", cost: 1, type: "法门", rarity: "精良", keyword: "指令", text: "当前灵兽立即行动两次。", combo: "若为玄狼，第二次伤害翻倍。", upgrade: "费用 1 → 0", art: 11 },
    { name: "归巢", cost: 1, type: "法门", rarity: "精良", keyword: "回收", text: "召回灵兽，恢复 7 点生命并抽 1 张牌。", combo: "保留当前灵兽的契约加成。", upgrade: "恢复 7 → 11", art: 2 },
    { name: "血月兽潮", cost: 2, type: "攻击", rarity: "稀有", keyword: "月相", text: "造成 5 点伤害 3 次。", combo: "血月下每段追加 2 点伤害。", upgrade: "攻击次数 3 → 4", art: 10 },
    { name: "山海盟誓", cost: 3, type: "法门", rarity: "传说", keyword: "终结", text: "召唤所有灵兽各行动一次。", combo: "每次行动后获得 3 点护盾。", upgrade: "行动伤害与护盾 +2", art: 9 },
  ],
  artificer: [
    { name: "铜雀飞梭", cost: 1, type: "攻击", rarity: "普通", keyword: "机关", text: "造成 7 点伤害，部署铜雀。", combo: "铜雀每回合首次抽牌时追加 2 点伤害。", upgrade: "伤害 7 → 11", art: 0 },
    { name: "玄甲机括", cost: 1, type: "法门", rarity: "普通", keyword: "偃甲", text: "获得 7 点护盾与 1 点机巧。", combo: "已有机关时额外获得 3 点护盾。", upgrade: "机巧 1 → 2", art: 3 },
    { name: "墨轮复位", cost: 0, type: "法门", rarity: "普通", keyword: "复位", text: "抽 1 张牌，使一个机关再次触发。", combo: "若触发攻击机关，获得 1 点机巧。", upgrade: "抽牌 1 → 2", art: 8 },
    { name: "雷枢阵列", cost: 2, type: "术法", rarity: "精良", keyword: "阵列", text: "部署雷枢：回合结束造成 6 点伤害。", combo: "每有 2 点机巧，伤害 +2。", upgrade: "基础伤害 6 → 10", art: 9 },
    { name: "千机连弩", cost: 2, type: "攻击", rarity: "精良", keyword: "多段", text: "造成 4 点伤害 3 次。", combo: "每个已部署机关追加 1 次攻击。", upgrade: "每段伤害 4 → 6", art: 4 },
    { name: "拆解回收", cost: 1, type: "法门", rarity: "精良", keyword: "回收", text: "移除一个机关，获得 2 点灵气并抽 2 张牌。", combo: "返还该机关一半护盾。", upgrade: "费用 1 → 0", art: 7 },
    { name: "偃师护心镜", cost: 1, type: "法门", rarity: "稀有", keyword: "反击", text: "获得 10 点护盾；护盾破裂时造成 10 点伤害。", combo: "拥有机巧时反击伤害 +5。", upgrade: "护盾与伤害 10 → 14", art: 3 },
    { name: "飞梭穿云", cost: 1, type: "攻击", rarity: "精良", keyword: "穿透", text: "造成 10 点伤害，无视护盾。", combo: "击破敌人护盾时抽 1 张牌。", upgrade: "伤害 10 → 15", art: 5 },
    { name: "机关城垒", cost: 3, type: "法门", rarity: "稀有", keyword: "阵地", text: "获得 18 点护盾，部署两个随机机关。", combo: "机巧达到 5 时费用 -2。", upgrade: "护盾 18 → 24", art: 9 },
    { name: "天工开物", cost: 3, type: "术法", rarity: "传说", keyword: "终结", text: "所有机关立即触发并升级。", combo: "每次触发返还 1 点护盾。", upgrade: "所有机关额外触发一次", art: 11 },
  ],
  soul: [
    { name: "引魂契", cost: 1, type: "术法", rarity: "普通", keyword: "魂灯", text: "失去 2 点生命，造成 11 点伤害。", combo: "点亮 1 盏魂灯。", upgrade: "自伤 2 → 0", art: 6 },
    { name: "幽灯守魄", cost: 1, type: "法门", rarity: "普通", keyword: "魂灯", text: "获得 7 点护盾，点亮 1 盏魂灯。", combo: "生命低于一半时护盾 +5。", upgrade: "护盾 7 → 12", art: 3 },
    { name: "彼岸回响", cost: 1, type: "法门", rarity: "精良", keyword: "回响", text: "将上一张打出的牌返回手牌。", combo: "若为术法牌，其费用变为 0。", upgrade: "费用 1 → 0", art: 5 },
    { name: "无常索命", cost: 2, type: "攻击", rarity: "精良", keyword: "献祭", text: "造成 16 点伤害，弃掉 1 张牌。", combo: "弃掉心魔时额外造成 10 点伤害。", upgrade: "伤害 16 → 22", art: 10 },
    { name: "渡厄咒", cost: 1, type: "法门", rarity: "精良", keyword: "净心", text: "净除 1 张心魔，恢复 6 点生命。", combo: "每盏魂灯使恢复 +2。", upgrade: "净除数量 1 → 2", art: 2 },
    { name: "借命灯", cost: 0, type: "法门", rarity: "精良", keyword: "反噬", text: "失去 3 点生命，获得 2 点灵气并抽 1 张牌。", combo: "点亮魂灯后本场不再自伤。", upgrade: "抽牌 1 → 2", art: 7 },
    { name: "黄泉引路", cost: 2, type: "术法", rarity: "稀有", keyword: "召回", text: "从弃牌堆选择 2 张牌加入手牌。", combo: "每选择一张术法，点亮 1 盏魂灯。", upgrade: "费用 2 → 1", art: 6 },
    { name: "魂火焚身", cost: 2, type: "攻击", rarity: "稀有", keyword: "燃魂", text: "熄灭全部魂灯，每盏造成 7 点伤害。", combo: "熄灭至少 3 盏时恢复 8 点生命。", upgrade: "每盏伤害 7 → 9", art: 1 },
    { name: "忘川照影", cost: 1, type: "法门", rarity: "稀有", keyword: "复制", text: "复制本回合第一张牌。", combo: "复制牌拥有消耗。", upgrade: "复制牌不再消耗", art: 10 },
    { name: "百鬼夜行", cost: 3, type: "术法", rarity: "传说", keyword: "终结", text: "弃牌堆每有一种牌，造成 3 点伤害。", combo: "魂灯达到 5 时费用变为 0。", upgrade: "每种伤害 3 → 5", art: 11 },
  ],
};

function makeCards(job) {
  const patterns = CARD_PATTERNS[job.id];
  const upgradedText = (base) => {
    const changes = [...base.upgrade.matchAll(/(\d+)\s*→\s*(\d+)/g)];
    if (!changes.length) return base.text;
    let text = base.text;
    for (const [, from, to] of changes) {
      const pattern = new RegExp(`(?<!\\d)${from}(?!\\d)`, "g");
      text = text.replace(pattern, to);
    }
    return text;
  };
  return Array.from({ length: 20 }, (_, index) => {
    const base = patterns[index % patterns.length];
    const refined = index >= patterns.length;
    const tier = refined ? Math.min(4, Math.ceil((index + 1) / 5)) : Math.ceil((index + 1) / 5);
    return {
      id: `${job.id}-${index + 1}`,
      job: job.id,
      baseName: base.name,
      name: refined ? `${base.name}·真解` : base.name,
      cost: refined && /费用/.test(base.upgrade) && base.cost > 0 ? base.cost - 1 : base.cost,
      type: base.type,
      rarity: refined ? (base.rarity === "普通" ? "精良" : base.rarity === "精良" ? "稀有" : "传说") : base.rarity,
      tier,
      art: arts[base.art],
      keyword: base.keyword,
      text: refined ? upgradedText(base) : base.text,
      combo: base.combo,
      upgrade: refined ? "已精研至真解" : base.upgrade,
      tags: [job.resource, base.keyword],
      refined,
    };
  });
}

export const PROFESSIONS = classBlueprints.map((job) => ({
  ...job,
  cards: makeCards(job),
  starterDeck: makeCards(job).slice(0, 12).map((card) => card.id),
}));

export const ALL_CARDS = PROFESSIONS.flatMap((job) => job.cards);

export const TREASURES = [
  { id: "moon_jade", name: "月华玉佩", art: "/ui/treasures/moon_jade.png", effect: "每场战斗首回合灵气 +1", firstTurnQi: 1 },
  { id: "wolf_tooth", name: "狼牙剑坠", art: "/ui/treasures/wolf_tooth.png", effect: "每场战斗第一张攻击牌伤害 +3", firstAttackDamage: 3 },
  { id: "bamboo_slip", name: "青竹残简", art: "/ui/treasures/bamboo_slip.png", effect: "每场战斗第一张法门牌额外抽 1 张", firstSkillDraw: 1 },
  { id: "spirit_lamp", name: "聚灵灯", art: "/ui/treasures/spirit_lamp.png", effect: "战斗胜利后恢复 4 点生命", battleHeal: 4 },
  { id: "market_token", name: "坊市木牌", art: "/ui/treasures/market_token.png", effect: "坊市交易价格减少 3 灵石", marketDiscount: 3 },
  { id: "paper_umbrella", name: "纸伞护符", art: "/ui/treasures/paper_umbrella.png", effect: "每场战斗开局获得 5 点护盾", startShield: 5 },
  { id: "medicine_satchel", name: "药囊", art: "/ui/treasures/medicine_satchel.png", effect: "战斗胜利后随机补充 1 件小物", battleConsumable: 1 },
  { id: "ember_bead", name: "余烬珠", art: "/ui/treasures/ember_bead.png", effect: "燃烧结算额外造成 1 点伤害", burnDamage: 1 },
  { id: "jade_abacus", name: "灵玉算盘", art: "/ui/treasures/jade_abacus.png", effect: "战斗胜利后额外获得 4 灵石", battleStones: 4 },
  { id: "cloud_seal", name: "行云印", art: "/ui/treasures/cloud_seal.png", effect: "获得时灵气上限 +1", maxQi: 1 },
  { id: "wind_chime", name: "听风铃", art: "/ui/treasures/wind_chime.png", effect: "每场战斗起手额外抽 1 张牌", firstTurnDraw: 1 },
];

export const MASTERY_MILESTONES = [
  { level: 25, name: "行囊传承", effect: "新局初始灵石 +4" },
  { level: 50, name: "真传术式", effect: "起始牌组的一张核心牌直接真解" },
  { level: 75, name: "本源初醒", effect: "每场战斗以 1 点职业资源开局" },
  { level: 100, name: "本命法宝", effect: "新局携带职业专属法宝" },
];

export const MASTERY_SIGNATURE_BY_JOB = {
  sword: "小五行剑阵",
  talisman: "阴火符",
  alchemy: "药炉温养",
  beast: "山君号令",
  artificer: "拆解回收",
  soul: "彼岸回响",
};

export const MASTERY_TREASURE_BY_JOB = {
  sword: "wolf_tooth",
  talisman: "ember_bead",
  alchemy: "medicine_satchel",
  beast: "wind_chime",
  artificer: "paper_umbrella",
  soul: "spirit_lamp",
};

export const BOSS_MOVE_PATTERNS = {
  1: [
    { name: "灯影试心", damage: 9, note: "序 · 以灯火试探你的防线" },
    { name: "第七灯障", damage: 5, shield: 12, note: "破 · 攻击并点亮护体灯障" },
    { name: "灯火噬命", damage: 16, weak: 1, note: "急 · 重击并施加 1 层虚弱" },
  ],
  2: [
    { name: "借名引路", damage: 10, drainQi: 1, note: "序 · 下一回合灵气 -1" },
    { name: "旧名镇魂", damage: 6, shield: 14, note: "破 · 攻击并以旧名护体" },
    { name: "替命燃烧", damage: 8, hits: 2, weak: 1, note: "急 · 两段攻击并施加虚弱" },
  ],
  3: [
    { name: "雷纹验骨", damage: 11, weak: 1, note: "序 · 震脉并施加虚弱" },
    { name: "三劫并落", damage: 6, hits: 3, note: "破 · 三段落雷，逐层击穿护盾" },
    { name: "阵雷齐鸣", damage: 21, shield: 8, note: "急 · 雷阵重击并重启阵壁" },
  ],
  4: [
    { name: "窃取清梦", damage: 11, drawPenalty: 1, note: "序 · 下一回合少抽 1 张牌" },
    { name: "黑莲合瓣", damage: 0, shield: 16, heal: 8, note: "破 · 获得护体并恢复生命" },
    { name: "万梦归莲", damage: 19, weak: 2, note: "急 · 梦魇重击并施加 2 层虚弱" },
  ],
  5: [
    { name: "天门问名", damage: 13, drainQi: 1, note: "序 · 下一回合灵气 -1" },
    { name: "删去一页", damage: 8, curse: true, shield: 10, note: "破 · 将心魔写入牌堆并获得护体" },
    { name: "天门定命", damage: 24, weak: 2, note: "急 · 最终裁定并施加 2 层虚弱" },
  ],
};

export const DECK_RECIPES = PROFESSIONS.flatMap((job) =>
  Array.from({ length: 18 }, (_, index) => {
    const core = job.cards.slice(index % 8, (index % 8) + 5);
    return {
      id: `${job.id}-build-${index + 1}`,
      job: job.id,
      name: `${job.prefixes[index % job.prefixes.length]}${["连携", "守御", "爆发", "循环", "秘仪", "逆转"][index % 6]}流`,
      cards: core.map((card) => card.id),
      focus: job.style.split(" · ")[index % 2],
    };
  })
);

export const CHAPTERS = [
  {
    id: 1,
    name: "雨入青岚",
    region: "青岚谷",
    level: "推荐 1 级",
    art: "/ui/bg_act1_valley.png",
    boss: "野狼妖影",
    summary: "外门试炼当夜，失踪多年的师姐从雨中送来一封染血的信。",
    status: "available",
  },
  {
    id: 2,
    name: "灯照玄阴",
    region: "玄阴山道",
    level: "推荐 8 级",
    art: "/ui/bg_act2_mountain.png",
    boss: "玄阴引路鬼",
    summary: "山道每隔七年便会多出一盏灯，而今年的灯上写着你的名字。",
    status: "locked",
  },
  {
    id: 3,
    name: "雷云问心",
    region: "筑基雷池",
    level: "推荐 16 级",
    art: "/ui/bg_act3_thunder.png",
    boss: "雷池守阵者",
    summary: "筑基雷劫不是天罚，而是一道被人篡改过的古老阵法。",
    status: "locked",
  },
  {
    id: 4,
    name: "黑莲照夜",
    region: "无灯城",
    level: "推荐 24 级",
    art: "/bg_dark_forge.png",
    boss: "黑莲教执灯人",
    summary: "城中无人做梦，所有人的影子却在午夜聚向同一座莲台。",
    status: "locked",
  },
  {
    id: 5,
    name: "天门无月",
    region: "太虚天门",
    level: "推荐 32 级",
    art: "/bg_secret_realm.png",
    boss: "守门真君",
    summary: "你终于抵达信中所说的天门，也终于知道师姐为何不愿回来。",
    status: "locked",
  },
];

export const STORY_SCENES = [
  {
    speaker: "沈砚秋",
    role: "失踪三年的内门师姐",
    text: "别点山门前的第七盏灯。它照见的不是路，是别人替你写好的命。",
    art: "/ui/bg_title_shrine.png",
  },
  {
    speaker: "陆观",
    role: "青岚谷守门人",
    text: "今夜参加试炼的人只有二十三个。可名册上，偏偏写了二十四个名字。",
    art: "/bg_soul_shrine.png",
  },
  {
    speaker: "你",
    role: "无名外门弟子",
    text: "最后一个名字，是我的。墨迹还没有干。",
    art: "/ui/bg_act1_valley.png",
  },
];

export const CHAPTER_STORIES = {
  1: STORY_SCENES,
  2: [
    { speaker: "纸灯童子", role: "玄阴山道的引路人", text: "灯上写着谁的名字，谁就必须替上一盏灯走完余下的路。", art: "/ui/bg_act2_mountain.png" },
    { speaker: "陆观", role: "守门人", text: "二十四年前的名册也多出过一个名字。那个人，后来成了你的师父。", art: "/bg_soul_shrine.png" },
    { speaker: "你", role: "循灯而行的外门弟子", text: "师姐不是失踪。她在沿着师父当年留下的路线，逐盏熄灯。", art: "/bg_spirit_rift.png" },
  ],
  3: [
    { speaker: "雷池守阵者", role: "被困阵中的旧日执念", text: "每一道筑基雷劫，都在替命册挑选一个能够承受改写的人。", art: "/ui/bg_act3_thunder.png" },
    { speaker: "沈砚秋", role: "隔着雷云传来的声音", text: "我没有让你来救我。我只想让你亲眼看看，青岚谷用什么换来了百年安稳。", art: "/bg_thunder_pool.png" },
    { speaker: "你", role: "即将筑基的修士", text: "若筑基本身就是一道锁，那我今日要破的便不是境界，而是这座阵。", art: "/ui/bg_act3_thunder.png" },
  ],
  4: [
    { speaker: "无灯城主", role: "没有影子的城主", text: "城里的人把梦交给黑莲，换来不再害怕的夜晚。你凭什么说他们错了？", art: "/bg_dark_forge.png" },
    { speaker: "沈砚秋", role: "黑莲教通缉的叛徒", text: "他们收走的不是噩梦，是人在命册之外做出选择的能力。", art: "/bg_market_stall.png" },
    { speaker: "你", role: "带着影子入城的人", text: "今夜之后，这座城可以继续害怕，但必须重新学会做梦。", art: "/bg_dark_forge.png" },
  ],
  5: [
    { speaker: "守门真君", role: "太虚天门的最后看守", text: "命册并非牢笼。没有它，凡人的一生连被天地记住的资格都没有。", art: "/bg_secret_realm.png" },
    { speaker: "沈砚秋", role: "命册缺页上的无名者", text: "修复它，我会从所有人的记忆里消失；焚毁它，天下修士都将失去既定前路。", art: "/bg_spirit_rift.png" },
    { speaker: "你", role: "执笔者", text: "我不替天下人选择去路。我只在命册最后写下：此后诸命，由己。", art: "/bg_secret_realm.png" },
  ],
};

export const CHAPTER_ROUTE_COPY = {
  1: {
    title: "雨入青岚",
    beats: ["血书把你引向雨亭。", "妖影与药香同时出现。", "山门前只剩一次整备。", "第七盏灯在雨中亮起。"],
    clue: "名册多出一人 · 第七盏灯 · 师姐的血书",
  },
  2: {
    title: "灯照玄阴",
    beats: ["纸灯童子提起旧日替灯人。", "阴魂与镇魂古龛分立两侧。", "鬼市中有人售卖旧名册。", "写着你名字的灯正在等候。"],
    clue: "替灯人 · 二十四年前的名册 · 师父的旧路",
  },
  3: {
    title: "雷云问心",
    beats: ["雷纹正在辨认你的血脉。", "洗雷池与问心石阶同时开启。", "守阵执念透露阵法用途。", "筑基雷劫化作最后一道锁。"],
    clue: "改写之阵 · 青岚百年安稳 · 筑基之锁",
  },
  4: {
    title: "黑莲照夜",
    beats: ["城门守卫没有影子。", "鬼市与梦坊藏着不同答案。", "黑莲台开始收拢全城影子。", "无灯城必须重新学会做梦。"],
    clue: "被收走的梦 · 黑莲契约 · 无影城主",
  },
  5: {
    title: "天门无月",
    beats: ["天门展示命册最初的用途。", "旧日看守与无名者各执一词。", "三种结局正在笔下成形。", "命册最后一页等待落笔。"],
    clue: "修复 · 焚毁 · 重写",
  },
};

export const ROUTE_ROWS = [
  [
    { id: "story", kind: "剧情", name: "雨亭来信", desc: "追查师姐留下的血书。", art: "/bg_soul_shrine.png" },
  ],
  [
    { id: "battle", kind: "战斗", name: "雾竹山径", desc: "妖影伏行，胜者可取一门新术。", art: "/ui/bg_act1_valley.png" },
    { id: "event", kind: "奇遇", name: "无名药圃", desc: "有人在荒废药圃里替你留了药。", art: "/bg_spirit_rift.png" },
  ],
  [
    { id: "elite", kind: "精英", name: "断碑前", desc: "碑上名字与你的血脉相连。", art: "/bg_dark_forge.png" },
    { id: "market", kind: "坊市", name: "灯下鬼市", desc: "用灵石交换卡牌、法宝和旧闻。", art: "/bg_market_stall.png" },
  ],
  [
    { id: "boss", kind: "首领", name: "第七盏灯", desc: "野狼妖影守着通往内门的石阶。", art: "/bg_thunder_pool.png" },
  ],
];

export const CHAPTER_ROUTES = {
  1: ROUTE_ROWS,
  2: [
    [{ id: "story", kind: "剧情", name: "替灯人旧亭", desc: "纸灯童子等着你接过一盏旧灯。", art: "/ui/bg_act2_mountain.png" }],
    [
      { id: "battle", kind: "战斗", name: "阴魂拦道", desc: "失去名字的山魂在灯后游荡。", art: "/bg_spirit_rift.png" },
      { id: "event", kind: "奇遇", name: "镇魂古龛", desc: "残符下压着师父当年的路引。", art: "/bg_soul_shrine.png" },
    ],
    [
      { id: "elite", kind: "精英", name: "断碑试剑台", desc: "碑上刻着二十四年前的试炼名单。", art: "/bg_dark_forge.png" },
      { id: "market", kind: "坊市", name: "山道鬼市", desc: "有人出售被撕去姓名的旧名册。", art: "/bg_market_stall.png" },
    ],
    [{ id: "boss", kind: "首领", name: "写名鬼灯", desc: "灯芯燃着你尚未走过的余生。", art: "/ui/bg_act2_mountain.png" }],
  ],
  3: [
    [{ id: "story", kind: "剧情", name: "雷纹验骨", desc: "雷池正在辨认你与旧阵的关系。", art: "/ui/bg_act3_thunder.png" }],
    [
      { id: "battle", kind: "战斗", name: "雷云压路", desc: "劫影从每一道旧雷痕中苏醒。", art: "/bg_thunder_pool.png" },
      { id: "event", kind: "奇遇", name: "洗雷池", desc: "以雷淬体，或借池水寻找阵眼。", art: "/bg_spirit_rift.png" },
    ],
    [
      { id: "elite", kind: "精英", name: "问心石阶", desc: "每一级石阶都会唤出一种悔意。", art: "/ui/bg_act3_thunder.png" },
      { id: "market", kind: "坊市", name: "云端散市", desc: "渡劫前的修士交换最后一件法器。", art: "/bg_market_stall.png" },
    ],
    [{ id: "boss", kind: "首领", name: "改命雷阵", desc: "守阵者不允许任何人带着疑问筑基。", art: "/bg_thunder_pool.png" }],
  ],
  4: [
    [{ id: "story", kind: "剧情", name: "无影城门", desc: "守卫要求你先交出自己的影子。", art: "/bg_dark_forge.png" }],
    [
      { id: "battle", kind: "战斗", name: "梦魇长街", desc: "居民遗弃的噩梦正在街上觅主。", art: "/bg_dark_forge.png" },
      { id: "event", kind: "奇遇", name: "失梦茶楼", desc: "一杯茶能让你看见别人失去的梦。", art: "/bg_soul_shrine.png" },
    ],
    [
      { id: "elite", kind: "精英", name: "黑莲梦坊", desc: "织梦师用影子缝补黑莲花瓣。", art: "/bg_spirit_rift.png" },
      { id: "market", kind: "坊市", name: "影子鬼市", desc: "这里能买到不属于自己的往事。", art: "/bg_market_stall.png" },
    ],
    [{ id: "boss", kind: "首领", name: "照夜莲台", desc: "城主在此保管全城人的恐惧。", art: "/bg_dark_forge.png" }],
  ],
  5: [
    [{ id: "story", kind: "剧情", name: "天门问名", desc: "门上没有你的名字，却认得你的血。", art: "/bg_secret_realm.png" }],
    [
      { id: "battle", kind: "战斗", name: "旧命回廊", desc: "所有未曾选择的道路化为敌影。", art: "/bg_secret_realm.png" },
      { id: "event", kind: "奇遇", name: "缺页书库", desc: "每一张缺页都对应一个被遗忘的人。", art: "/bg_soul_shrine.png" },
    ],
    [
      { id: "elite", kind: "精英", name: "执笔者之阶", desc: "旧日执笔者要求你证明自由并非混乱。", art: "/ui/bg_act3_thunder.png" },
      { id: "market", kind: "坊市", name: "无名人市集", desc: "不在命册中的人交换最后的遗物。", art: "/bg_market_stall.png" },
    ],
    [{ id: "boss", kind: "首领", name: "命册末页", desc: "守门真君等待你决定天下人的前路。", art: "/bg_secret_realm.png" }],
  ],
};

export const META_TALENTS = [
  { id: "meridian", name: "开脉", level: 2, max: 10, effect: "初始生命 +4", art: "/ui/insights/open_meridians.png" },
  { id: "mind", name: "守心", level: 1, max: 10, effect: "初始灵石 +2", art: "/ui/insights/guarded_mind.png" },
  { id: "edge", name: "藏锋", level: 0, max: 10, effect: "首场战斗初始资源 +1", art: "/ui/insights/hidden_edge_breath.png" },
];

export function getProfession(id) {
  return PROFESSIONS.find((job) => job.id === id) || PROFESSIONS[0];
}
