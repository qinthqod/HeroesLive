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
    { name: "火弹符", cost: 1, type: "术法", rarity: "普通", keyword: "燃烧", text: "造成 7 点伤害，施加 2 层燃烧。", combo: "敌人已有虚弱时额外造成 4 点伤害。", upgrade: "燃烧 2 → 4", art: 1 },
    { name: "镇魂符", cost: 1, type: "法门", rarity: "精良", keyword: "净心", text: "获得 7 点护盾，驱散 2 层虚弱。", combo: "若成功驱散，抽 1 张牌。", upgrade: "护盾 7 → 11", art: 6 },
    { name: "缚影法印", cost: 1, type: "术法", rarity: "普通", keyword: "符印", text: "附着 2 枚符印，施加 1 层虚弱。", combo: "敌人行动后，每枚符印造成 2 点伤害。", upgrade: "符印 2 → 3", art: 6 },
    { name: "赤篆连书", cost: 0, type: "法门", rarity: "普通", keyword: "运转", text: "抽 1 张牌；下一张术法牌费用 -1。", combo: "若实际抽到术法牌，获得 1 点灵气。", upgrade: "抽牌 1 → 2", art: 7 },
    { name: "阴火符", cost: 2, type: "术法", rarity: "精良", keyword: "燃烧", text: "造成 12 点伤害，施加 4 层燃烧。", combo: "引爆 1 枚符印，立即结算一次燃烧。", upgrade: "费用 2 → 1", art: 1 },
    { name: "玄雷敕令", cost: 2, type: "术法", rarity: "稀有", keyword: "引爆", text: "引爆全部符印，每枚造成 6 点伤害。", combo: "引爆至少 3 枚时，抽 2 张牌。", upgrade: "每枚伤害 6 → 8", art: 9 },
    { name: "净坛真言", cost: 1, type: "法门", rarity: "精良", keyword: "净心", text: "净除 1 张心魔，获得 5 点护盾。", combo: "无心魔可净除时，改为获得 2 点灵气。", upgrade: "净除数量 1 → 2", art: 2 },
    { name: "雷火连符", cost: 1, type: "术法", rarity: "精良", keyword: "连携", text: "造成 5 点伤害 2 次。", combo: "包含本牌，本回合每打出一张术法牌，追加 1 次。", upgrade: "每段伤害 5 → 7", art: 4 },
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
    { name: "无常索命", cost: 2, type: "攻击", rarity: "精良", keyword: "献祭", text: "造成 16 点伤害，优先弃掉 1 张心魔，否则弃掉最右侧手牌。", combo: "弃掉心魔时额外造成 10 点伤害。", upgrade: "伤害 16 → 22", art: 10 },
    { name: "渡厄咒", cost: 1, type: "法门", rarity: "精良", keyword: "净心", text: "净除 1 张心魔，恢复 6 点生命。", combo: "每盏魂灯使恢复 +2。", upgrade: "净除数量 1 → 2", art: 2 },
    { name: "借命灯", cost: 0, type: "法门", rarity: "精良", keyword: "反噬", text: "失去 3 点生命，获得 2 点灵气并抽 1 张牌。", combo: "拥有魂灯时不再自伤。", upgrade: "抽牌 1 → 2", art: 7 },
    { name: "黄泉引路", cost: 2, type: "术法", rarity: "稀有", keyword: "召回", text: "将弃牌堆最近的 2 张牌加入手牌。", combo: "每召回一张术法，点亮 1 盏魂灯。", upgrade: "费用 2 → 1", art: 6 },
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
  starterDeck: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6].map((index) => `${job.id}-${index + 1}`),
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
  6: [
    { name: "潮声问路", damage: 14, drawPenalty: 1, note: "序 · 月潮遮蔽来路，下一回合少抽 1 张牌" },
    { name: "沉月成壁", damage: 5, shield: 18, note: "破 · 月影沉入归墟，攻击并获得 18 点护体" },
    { name: "万途溺海", damage: 9, hits: 3, weak: 1, note: "急 · 三段潮击并施加 1 层虚弱" },
  ],
};

export const BOSS_PHASES = {
  1: {
    threshold: 0.5,
    name: "灯芯噬主",
    line: "第七盏灯熄灭外壳，露出以历代试炼者命火编成的灯芯。",
    shield: 8,
    moves: [
      { name: "旧火认主", damage: 11, weak: 1, note: "二相·序 · 命火辨认你的气息并施加虚弱" },
      { name: "七灯同燃", damage: 7, hits: 2, note: "二相·破 · 两段灯火追击，逐层烧穿护盾" },
      { name: "替灯夺命", damage: 19, drainQi: 1, note: "二相·急 · 重击并压低下一回合灵气" },
    ],
  },
  2: {
    threshold: 0.5,
    name: "旧名反噬",
    line: "鬼灯裂开，二十四年前被抹去的旧名从灯油中一一浮现。",
    shield: 10,
    moves: [
      { name: "百名索债", damage: 12, drainQi: 1, note: "二相·序 · 旧名缠身，下一回合灵气 -1" },
      { name: "灯骨重书", damage: 7, shield: 16, note: "二相·破 · 攻击并以灯骨重写护体" },
      { name: "余生尽燃", damage: 10, hits: 2, weak: 2, note: "二相·急 · 两段燃命并施加 2 层虚弱" },
    ],
  },
  3: {
    threshold: 0.5,
    name: "阵眼真身",
    line: "守阵者的甲胄被雷火击碎，阵眼中显出被困百年的第一位替灯人。",
    shield: 12,
    moves: [
      { name: "阵眼锁脉", damage: 12, weak: 2, note: "二相·序 · 雷纹锁脉并施加 2 层虚弱" },
      { name: "五雷贯阵", damage: 5, hits: 4, note: "二相·破 · 四段雷击连续拆解护盾" },
      { name: "以身覆劫", damage: 23, shield: 12, note: "二相·急 · 阵眼重击并重建雷壁" },
    ],
  },
  4: {
    threshold: 0.5,
    name: "万梦醒转",
    line: "黑莲被撕开一道缝，全城被收走的噩梦同时在城主体内醒来。",
    shield: 10,
    moves: [
      { name: "噩梦归巢", damage: 13, drawPenalty: 1, note: "二相·序 · 梦潮回涌，下一回合少抽 1 张牌" },
      { name: "千影缝身", damage: 6, shield: 18, heal: 6, note: "二相·破 · 攻击、护体并恢复生命" },
      { name: "满城惊醒", damage: 22, weak: 2, note: "二相·急 · 全城噩梦爆发并施加 2 层虚弱" },
    ],
  },
  5: {
    threshold: 0.5,
    name: "执笔真君",
    line: "守门人的法相褪去，真正握笔的人从命册背面走了出来。",
    shield: 14,
    moves: [
      { name: "倒写因果", damage: 14, drainQi: 1, note: "二相·序 · 倒写灵脉，下一回合灵气 -1" },
      { name: "抹去此刻", damage: 9, curse: true, shield: 14, note: "二相·破 · 写入心魔并获得 14 点护体" },
      { name: "诸命归笔", damage: 27, weak: 2, note: "二相·急 · 执笔裁定并施加 2 层虚弱" },
    ],
  },
  6: {
    threshold: 0.55,
    name: "月蚀开眼",
    line: "归墟海面倒悬的月亮睁开眼睛，所有未曾选择的道路开始要求一个结局。",
    shield: 16,
    moves: [
      { name: "无月潮汐", damage: 15, drawPenalty: 1, note: "二相·序 · 无月潮卷走一张下回合手牌" },
      { name: "沉没万象", damage: 8, curse: true, shield: 20, note: "二相·破 · 未行之路化为心魔并筑起潮壁" },
      { name: "众生回望", damage: 10, hits: 3, drainQi: 1, note: "二相·急 · 三段回望并压低下一回合灵气" },
    ],
  },
};

export const BOSS_CHOICE_RESPONSES = {
  1: {
    留下回信: {
      line: "第七盏灯读出了雨亭回信。远处一盏无名灯亮起，替你挡住扑来的旧火。",
      playerShield: 6,
      effect: "沈砚秋的回信化为 6 点护盾",
    },
    抹去暗号: {
      line: "灯芯找不到被抹去的归谷暗号，追索旧路的火焰因此缺了一角。",
      bossShieldDelta: -4,
      effect: "暗号断路，首领转相护体 -4",
    },
  },
  2: {
    替灯偿愿: {
      line: "纸灯童子的余愿越过玄阴山，在你身前结成一圈不再替命的暖光。",
      playerShield: 7,
      effect: "被偿还的余愿化为 7 点护盾",
    },
    拒绝替命: {
      line: "你拒绝接过任何人的余生，鬼灯失去可供燃烧的新名字，灯骨骤然暗淡。",
      bossShieldDelta: -5,
      effect: "替命契约失效，首领转相护体 -5",
    },
  },
  3: {
    公示雷阵: {
      line: "雷阵真相已传遍青岚谷，众人的质问沿阵纹回响，震裂守阵者的雷壁。",
      bossShieldDelta: -6,
      effect: "公开的真相击穿阵壁，首领转相护体 -6",
    },
    释放残魂: {
      line: "被释放的残魂逐一报出姓名，百道微光环绕你，替你承受阵眼反噬。",
      playerShield: 8,
      effect: "百年残魂守望，获得 8 点护盾",
    },
  },
  4: {
    守望首夜: {
      line: "无灯城民没有再次沉睡。他们彻夜点起的微火穿过梦境，护住你的清醒。",
      playerShield: 9,
      effect: "全城守夜的微火化为 9 点护盾",
    },
    强断契约: {
      line: "黑莲契约早已被你斩断，城主体内的梦茧无法闭合，莲甲片片剥落。",
      bossShieldDelta: -6,
      effect: "断契余势撕开莲甲，首领转相护体 -6",
    },
  },
  5: {
    保留罪证: {
      line: "纸背罪证在命火中显形，历代被删去的名字同时指认真正的执笔者。",
      bossShieldDelta: -7,
      effect: "罪证揭露真身，首领转相护体 -7",
    },
    焚去执笔者: {
      line: "天门已不再承认执笔者的姓名。无主的命火回到你身边，结成护心屏障。",
      playerShield: 10,
      effect: "无主命火归还，获得 10 点护盾",
    },
  },
  6: {
    承担遗憾: {
      line: "你承认每次选择都会留下遗憾。未行之路不再索命，只在身后汇成月色。",
      playerShield: 12,
      effect: "被承认的遗憾化为 12 点护盾",
    },
    索回万途: {
      line: "万途已经被你索回，月蚀司命无法再独占任何结局，归墟潮壁随之崩塌。",
      bossShieldDelta: -8,
      effect: "万途夺权，首领转相护体 -8",
    },
  },
};

export function resolveBossChoiceResponse(chapter, choices = []) {
  const responses = BOSS_CHOICE_RESPONSES[chapter] || {};
  const choice = [...choices].reverse().find((value) => responses[value]);
  return choice ? { choice, ...responses[choice] } : null;
}

export const CHAPTER_BOSS_PRELUDES = {
  1: {
    eyebrow: "首领前夜 · 山门石阶",
    name: "第七盏灯等候点燃",
    art: "/ui/bg_act1_valley.png",
    setting: "雨势忽然停了。二十三盏弟子灯依次熄灭，唯独山门最高处那一盏，正用与你相同的命火呼吸。",
    beats: [
      { speaker: "陆观", text: "别看灯罩。它会把你最想救回的人映在里面，然后问你愿不愿意替她留下。" },
      { speaker: "第七盏灯", text: "名册从未写错。它只是比你更早知道，谁会为了另一个人走进火里。" },
      { speaker: "你", text: "若一条路只能靠替人赴死维持，那写错的不是名字，是这座山门。" },
    ],
  },
  2: {
    eyebrow: "首领前夜 · 玄阴灯冢",
    name: "旧名在灯油中苏醒",
    art: "/ui/bg_act2_mountain.png",
    setting: "整条山道的鬼灯同时转向你。灯油里浮起二十四年前的名字，最后一个正缓慢长成你的笔迹。",
    beats: [
      { speaker: "纸灯童子", text: "我替每一盏灯记得它原来的主人，可他们走完别人的余生后，就没人记得自己了。" },
      { speaker: "写名鬼灯", text: "人只要继续活着，替谁活又有什么分别？名字不过是让牺牲显得体面。" },
      { speaker: "你", text: "余生不是空路，不能因为前人没走完，就把后来者钉在同一个终点。" },
    ],
  },
  3: {
    eyebrow: "首领前夜 · 雷池阵眼",
    name: "百年安稳开始崩裂",
    art: "/ui/bg_act3_thunder.png",
    setting: "雷云压到触手可及。每一道阵纹都亮着一个被删去的姓名，而守阵者站在所有姓名中央。",
    beats: [
      { speaker: "沈砚秋", text: "这座阵不是为了挡雷，是为了让所有人相信，牺牲少数便能换来永远安稳。" },
      { speaker: "雷池守阵者", text: "谷中百年无人流离、无人受劫。若真相会毁掉这一切，你仍要让他们知道吗？" },
      { speaker: "你", text: "用不知道换来的安稳，只是把恐惧藏进下一代人的雷劫。" },
    ],
  },
  4: {
    eyebrow: "首领前夜 · 照夜莲台",
    name: "全城的噩梦一同回家",
    art: "/bg_dark_forge.png",
    setting: "黑莲每合拢一片花瓣，城中便少一声哭泣。莲台之下，无数影子却在替主人无声尖叫。",
    beats: [
      { speaker: "茶楼女童", text: "城主说没有噩梦的人才会幸福。可我已经想不起，自己为什么想画一片海。" },
      { speaker: "无影城主", text: "我只是替他们收走无法承受的东西。自由若只带来痛苦，失去它又有何妨？" },
      { speaker: "你", text: "害怕、后悔和想离开，都不该由另一个人替他们保管。" },
    ],
  },
  5: {
    eyebrow: "首领前夜 · 命册末页",
    name: "真正的执笔者走出纸背",
    art: "/bg_secret_realm.png",
    setting: "天门之后没有仙境，只有一张铺满天地的旧纸。众生的道路被墨线牵引，汇向守门真君手中的笔。",
    beats: [
      { speaker: "沈砚秋", text: "走到这里才发现，所谓天命不过是有人比所有人更早拿到了笔。" },
      { speaker: "守门真君", text: "没有命册，选择会制造战争、背叛与无数悔恨。你真愿意把这些还给众生？" },
      { speaker: "你", text: "代替所有人活得正确，不是慈悲。那只是把天下变成你一个人的人生。" },
    ],
  },
  6: {
    eyebrow: "首领前夜 · 倒悬月宫",
    name: "所有未行之路要求结局",
    art: "/bg_spirit_rift.png",
    setting: "归墟海面升到天空，倒悬之月从潮水里睁眼。每个人未曾选择的人生都站在月光中，等待取代现实。",
    beats: [
      { speaker: "归墟摆渡使", text: "司命替众生收容遗憾太久，久到那些可能忘了自己从未真正发生。" },
      { speaker: "月蚀司命", text: "你归还自由，却把后悔也归还给他们。既然众生承受不起，我便再次替他们只留一条路。" },
      { speaker: "你", text: "自由从来不是拥有所有道路，而是亲自走过一条，并承认其他道路已经远去。" },
    ],
  },
};

export function resolveBossPrelude(chapter, choices = []) {
  const prelude = CHAPTER_BOSS_PRELUDES[chapter];
  const response = resolveBossChoiceResponse(chapter, choices);
  if (!prelude) return null;
  return {
    ...prelude,
    choice: response?.choice || "",
    beats: response
      ? [...prelude.beats, { speaker: ENCOUNTER_ENEMIES[chapter]?.[3]?.name || "首领", text: response.line }]
      : prelude.beats,
  };
}

export const ENCOUNTER_ENEMIES = {
  1: {
    1: { name: "野狼妖影", hp: 34, max: 34, art: "/enemy_wolf_shadow.png", archetype: "伏击者", trait: "闻血追猎", counter: "它会先试探、再蓄势扑杀；趁蓄势回合进攻，或为扑杀预留护盾。" },
    2: { name: "雾竹巡山妖", hp: 48, max: 48, art: "/enemy_rogue_cultivator.png", archetype: "破盾者", trait: "竹刃连环", counter: "连击擅长拆散薄盾。集中护盾抵挡连斩，并在其藏身时扩大输出。" },
    3: { name: "第七盏灯", hp: 72, max: 72, art: "/enemy_black_cult_deacon.png", archetype: "守灯人", trait: "灯火试心", counter: "灯障回合会累积护体；提前铺设持续伤害，重击前保留防御。" },
  },
  2: {
    1: { name: "玄阴灯侍", hp: 42, max: 42, art: "/enemy_xuanyin_guide.png", archetype: "夺气者", trait: "借名引路", counter: "它会削减下一回合灵气。优先用低费牌运转，夺气前不要留下昂贵手牌。" },
    2: { name: "断碑护灯长老", hp: 60, max: 60, art: "/enemy_black_cult_deacon.png", archetype: "镇魂者", trait: "旧名成碑", counter: "长老以护体拖延，再用旧名压制灵气。护体形成前爆发，或准备破盾与持续伤害。" },
    3: { name: "写名鬼灯", hp: 84, max: 84, art: "/enemy_xuanyin_guide.png", archetype: "替命灯", trait: "名字即燃料", counter: "灵气压制与双段攻击交替出现。保留低费防御，避免被虚弱后的连击击穿。" },
  },
  3: {
    1: { name: "雷云劫影", hp: 50, max: 50, art: "/enemy_thunder_pool_guardian.png", archetype: "连击者", trait: "雷痕导引", counter: "先以雷痕施加虚弱，再落下双雷。虚弱回合优先护体，完整护盾比零散防御更可靠。" },
    2: { name: "问心劫使", hp: 70, max: 70, art: "/enemy_black_cult_deacon.png", archetype: "节奏考官", trait: "三问雷罚", counter: "三段雷罚专破护盾，阵壁回合则是输出窗口。用减伤或恢复跨过连续落雷。" },
    3: { name: "雷池守阵者", hp: 100, max: 100, art: "/enemy_thunder_pool_guardian.png", archetype: "阵眼", trait: "三劫并落", counter: "虚弱、三段雷击与阵壁构成固定循环。读清下一式，在阵雷齐鸣前建立完整防线。" },
  },
  4: {
    1: { name: "失梦游魂", hp: 56, max: 56, art: "/enemy_xuanyin_guide.png", archetype: "窃牌者", trait: "吞食清梦", counter: "窃梦会让下回合少抽一张。当前回合尽量完成联动，不要把关键组件寄望于下一次抽牌。" },
    2: { name: "黑莲织梦师", hp: 78, max: 78, art: "/enemy_black_cult_deacon.png", archetype: "回复者", trait: "梦茧回生", counter: "梦茧同时护体与恢复。用燃烧、丹毒或高额爆发阻止它反复拉长战斗。" },
    3: { name: "无影城主", hp: 112, max: 112, art: "/enemy_black_cult_deacon.png", archetype: "梦境领主", trait: "万梦归莲", counter: "少抽牌会打乱组合，黑莲合瓣又会恢复。保留抽牌与持续伤害手段，避免陷入消耗战。" },
  },
  5: {
    1: { name: "旧命残影", hp: 64, max: 64, art: "/enemy_rogue_cultivator.png", archetype: "改写者", trait: "未行之路", counter: "残影会把命册缺页写入牌堆。尽快结束战斗，或准备净心与额外抽牌降低污染。" },
    2: { name: "执笔者遗念", hp: 88, max: 88, art: "/enemy_xuanyin_guide.png", archetype: "封锁者", trait: "删名断章", counter: "它交替削减灵气、污染牌堆并施加虚弱。低费循环和净心是稳定突破口。" },
    3: { name: "守门真君", hp: 128, max: 128, art: "/enemy_thunder_pool_guardian.png", archetype: "命册执笔", trait: "天门定命", counter: "最终考验同时覆盖灵气、牌堆与生命。不要只依赖单一爆发回合，准备可持续的完整构筑。" },
  },
  6: {
    1: { name: "逐月溺魂", hp: 72, max: 72, art: "/enemy_xuanyin_guide.png", archetype: "追忆者", trait: "未行之潮", counter: "它会削减抽牌并把未选择的道路化为攻击。当前回合尽量完成联动，不要过度依赖下一手。" },
    2: { name: "归墟摆渡使", hp: 98, max: 98, art: "/enemy_black_cult_deacon.png", archetype: "渡劫者", trait: "借命行舟", counter: "摆渡使以护体拖延，再用多段潮击收割。持续伤害和集中爆发能阻止它反复沉舟再起。" },
    3: { name: "月蚀司命", hp: 148, max: 148, art: "/enemy_thunder_pool_guardian.png", archetype: "归墟天官", trait: "万途求终", counter: "首相削减抽牌并积累潮壁；半血后月蚀开眼，心魔与多段潮击同时出现。保留净心、抽牌和完整防线。" },
  },
};

export const ENCOUNTER_PRELUDES = {
  1: {
    1: {
      eyebrow: "普通遭遇 · 雾竹山径",
      title: "雨里传来第二个人的脚步",
      setting: "竹叶没有动，泥水里却多出一串与你并行的爪印。野狼妖影伏在雾后，脖颈挂着一枚外门弟子的旧名牌。",
      beats: [
        { speaker: "陆观", text: "它扑杀前会先压低身体。看见它伏身，就别把最后一道护体浪费在进攻上。" },
        { speaker: "野狼妖影", text: "名……册……回去……" },
      ],
      lesson: "教学压力 · 识别蓄势回合，在爆发前建立护盾。",
    },
    2: {
      eyebrow: "精英遭遇 · 断碑前",
      title: "雾竹巡山妖拔出两柄旧剑",
      setting: "断碑旁散落着历代试炼者的剑穗。巡山妖每斩下一根，碑上的第二十四个名字便清晰一分。",
      beats: [
        { speaker: "雾竹巡山妖", text: "守山者不问名字。留下命牌，或者留下命。" },
        { speaker: "你", text: "双刃会拆散薄盾。我要么一次守稳，要么在它藏入竹雾前结束战斗。" },
      ],
      lesson: "组合考核 · 虚弱与双段攻击会连续拆盾。",
    },
  },
  2: {
    1: {
      eyebrow: "普通遭遇 · 阴魂山道",
      title: "灯绳先缠住了你的影子",
      setting: "玄阴灯侍没有脸，灯罩中却映着你的姓名。每当它摇灯，体内灵气便像被另一段人生借走。",
      beats: [
        { speaker: "纸灯童子", text: "它会先借走一口气，再用灯火照名。留几张低费术法，别让昂贵手牌困住自己。" },
        { speaker: "玄阴灯侍", text: "借名一程，余生自会归还。" },
      ],
      lesson: "教学压力 · 灵气被压制时依靠低费循环。",
    },
    2: {
      eyebrow: "精英遭遇 · 断碑试剑台",
      title: "长老从被凿去的名字中起身",
      setting: "护灯长老将旧名写成石墙，碑后传来无数人走完陌生余生时留下的脚步声。",
      beats: [
        { speaker: "断碑护灯长老", text: "名字既已入灯，后来者便该替前人走完。规矩不能因一人不愿就停。" },
        { speaker: "你", text: "它会在夺气后筑墙。我要在护体成形前爆发，或用持续伤害穿过旧名。" },
      ],
      lesson: "组合考核 · 夺气、护体与重击形成三拍压力。",
    },
  },
  3: {
    1: {
      eyebrow: "普通遭遇 · 雷云压路",
      title: "雷痕从你的旧伤里亮起",
      setting: "劫影没有魂魄，只有一遍遍失败的筑基姿势。它抬手时，你皮肤下的雷纹也随之发亮。",
      beats: [
        { speaker: "沈砚秋", text: "第一道雷只是留下标记，第二道才沿着标记追来。虚弱时先守，不要逞强抢那一点伤害。" },
        { speaker: "雷云劫影", text: "承雷者……归阵。" },
      ],
      lesson: "教学压力 · 虚弱之后将接续多段雷击。",
    },
    2: {
      eyebrow: "精英遭遇 · 问心石阶",
      title: "三道问题化作三重雷罚",
      setting: "问心劫使每登一级石阶，便从你记忆里取出一种悔意。雷云按照答案的迟疑程度逐层压下。",
      beats: [
        { speaker: "问心劫使", text: "若牺牲你能换青岚百年无灾，你为何仍不肯点头？" },
        { speaker: "你", text: "三段雷罚专破零散护盾。它重启阵壁时，才是我重新夺回节奏的窗口。" },
      ],
      lesson: "组合考核 · 虚弱、三段雷罚与阵壁循环。",
    },
  },
  4: {
    1: {
      eyebrow: "普通遭遇 · 梦魇长街",
      title: "一场被丢弃的噩梦认出了你",
      setting: "失梦游魂沿街舔食每扇窗的梦边。它经过的地方，人们醒来时会忘记一件本想在明日完成的事。",
      beats: [
        { speaker: "茶楼女童", text: "它偷走梦以后，你下一次醒来会少想起一点东西。重要的联动，最好这一回合就做完。" },
        { speaker: "失梦游魂", text: "不做梦……便不会失去。" },
      ],
      lesson: "教学压力 · 少抽牌会打断跨回合组合。",
    },
    2: {
      eyebrow: "精英遭遇 · 黑莲梦坊",
      title: "织梦师用影线缝住出口",
      setting: "黑莲织梦师身后悬着全城的梦茧。每受一次重创，它便从茧中抽回一段生命，重新缝入自身。",
      beats: [
        { speaker: "黑莲织梦师", text: "噩梦被收走以后，他们睡得多安稳。你为何非要把痛苦还给他们？" },
        { speaker: "你", text: "梦茧会同时护体和恢复。持续伤害或集中爆发，不能让它反复把战斗缝回原点。" },
      ],
      lesson: "组合考核 · 抽牌削减、回复与双段收线。",
    },
  },
  5: {
    1: {
      eyebrow: "普通遭遇 · 旧命回廊",
      title: "你没有选择的人生挡住去路",
      setting: "旧命残影拥有与你相同的脸，却穿着另一种道途的法衣。它手里的缺页正准备塞入你的牌堆。",
      beats: [
        { speaker: "沈砚秋", text: "那不是另一个你，只是命册拿遗憾拼出的诱饵。越拖延，它写进牌堆的缺页越多。" },
        { speaker: "旧命残影", text: "若当初选我，你早已不必走到这里。" },
      ],
      lesson: "教学压力 · 尽快结束战斗，或准备净心处理污染。",
    },
    2: {
      eyebrow: "精英遭遇 · 执笔者之阶",
      title: "遗念同时删去你的气与名字",
      setting: "执笔者遗念翻动三张命册：一张削去灵气，一张写入心魔，最后一张把迟疑改写成虚弱。",
      beats: [
        { speaker: "执笔者遗念", text: "自由不过是让众生亲手制造错误。命册替他们省去了失败。" },
        { speaker: "你", text: "这是复合封锁。低费循环保证行动，净心保证牌堆，不能把胜负押在单一爆发上。" },
      ],
      lesson: "组合考核 · 灵气压制、污染与虚弱轮替。",
    },
  },
  6: {
    1: {
      eyebrow: "普通遭遇 · 逐月潮滩",
      title: "后悔从潮水里长出人的形状",
      setting: "逐月溺魂不断变成你熟悉的人，又在靠近前恢复陌生面孔。它只会说出生者最常想起的那句“如果”。",
      beats: [
        { speaker: "归墟摆渡使", text: "月潮会卷走你下一回合的一张手牌。别把必须完成的联动留给一个不确定的明日。" },
        { speaker: "逐月溺魂", text: "如果那天……你走了另一条路。" },
      ],
      lesson: "教学压力 · 抽牌削减迫使本回合完成核心循环。",
    },
    2: {
      eyebrow: "精英遭遇 · 归墟摆渡台",
      title: "老船夫把万千余生压入船底",
      setting: "摆渡使每撑一次篙，沉没的可能便在船底筑成潮壁。海中伸出的手同时从三面抓向渡船。",
      beats: [
        { speaker: "归墟摆渡使", text: "我沉掉的每条路，都曾可能毁掉一个人。你凭什么断定，归还它们便是慈悲？" },
        { speaker: "你", text: "潮壁拖延，多段潮击收割。必须用持续伤害阻止重建，再为连击保留完整防线。" },
      ],
      lesson: "组合考核 · 护体拖延、持续伤害检验与多段收割。",
    },
  },
};

export function resolveEncounterPrelude(chapter, stage) {
  const prelude = ENCOUNTER_PRELUDES[chapter]?.[stage];
  const enemy = ENCOUNTER_ENEMIES[chapter]?.[stage];
  return prelude && enemy ? { ...prelude, enemy } : null;
}

export const BATTLE_AFTERMATHS = {
  1: {
    1: {
      title: "妖影倒下后，名牌仍在发热",
      narration: "野狼形体散入雨雾，泥地却留下一个外门弟子跪守山门的旧影。它并非闯入者，而是被留在试炼中的守灯人。",
      finalWords: "第二十四人……不是第一次。",
      rewardSource: "从断裂名牌与妖影残留的试炼记忆中凝成",
    },
    2: {
      title: "双剑折断，断碑露出新刻痕",
      narration: "巡山妖失去竹雾掩护后恢复片刻清醒。它用最后一截剑锋，替你圈出了碑上反复被凿除的位置。",
      finalWords: "山门从来知道，多出来的是谁。",
      rewardSource: "由两柄旧剑与历代巡山术式重组而成",
    },
  },
  2: {
    1: {
      title: "无面灯侍想起了自己的名字",
      narration: "灯罩碎裂时，一张被灯油泡烂的路引落在地上。上面不是你的姓名，而是二十四年前失踪的第一位替灯人。",
      finalWords: "我借走的……原来一直是自己。",
      rewardSource: "从熄灭灯绳与未尽余生中析出",
    },
    2: {
      title: "旧名石墙从中间裂开",
      narration: "长老背后的断碑倒下，露出师父曾试图熄灭全部鬼灯的次序。山门旧案第一次拥有完整的起点。",
      finalWords: "规矩若停，旧名便会回来索债。",
      rewardSource: "由镇魂碑文与护灯禁术残页凝成",
    },
  },
  3: {
    1: {
      title: "劫影消散，只剩一次失败的选择",
      narration: "雷火没有留下尸骸，只在石面烧出一个反复举手又放下的人影。阵法复制的不是修士，而是他们屈服的瞬间。",
      finalWords: "接受安排……便不会再痛。",
      rewardSource: "从残余雷痕与失败筑基法中淬出",
    },
    2: {
      title: "第三问之后，石阶不再出声",
      narration: "劫使的面具裂成三片，每片背面都写着同一句答案：牺牲少数是因为他们从未被允许回答。",
      finalWords: "若所有人都知道，青岚还会选择安稳吗？",
      rewardSource: "由三重雷罚与问心阵理推演而成",
    },
  },
  4: {
    1: {
      title: "游魂吐出一枚没有画完的梦",
      narration: "噩梦散去后，长街上浮现一片歪斜海岸。那是茶楼女童被黑莲收走前，最后一次想象城外的模样。",
      finalWords: "我只是……替他们保管害怕。",
      rewardSource: "从归还的梦片与游魂本能中化出",
    },
    2: {
      title: "梦茧破裂，全城影子同时坠地",
      narration: "织梦师的针线断开，数百段噩梦沿街寻找主人。黑莲并未吞噬痛苦，只把它缝成维持契约的养料。",
      finalWords: "他们醒来以后，会恨你把梦还回去。",
      rewardSource: "由断裂影线与黑莲织梦术拆解而成",
    },
  },
  5: {
    1: {
      title: "另一个你没有化作灰烬",
      narration: "旧命残影退回缺页，只留下它曾走过的完整记忆。未行之路不会消失，但也没有资格取代已经发生的人生。",
      finalWords: "别忘了，我也曾可能是真的。",
      rewardSource: "从未选道途与命册缺页的缝隙中取得",
    },
    2: {
      title: "三张命册同时失去墨色",
      narration: "执笔者遗念倒下后，封锁灵气、污染牌堆与改写意志的规则显出同源笔迹——真正执笔者从未离开天门。",
      finalWords: "笔还在纸背。你击败的只是一个念头。",
      rewardSource: "由褪色墨律与旧执笔传承重写而成",
    },
  },
  6: {
    1: {
      title: "溺魂变回一段无人走过的月光",
      narration: "它最后一次化成沈砚秋留在青岚谷的模样，却没有再向你伸手。可能被看见之后，终于承认自己并非现实。",
      finalWords: "请替我记得……然后继续走。",
      rewardSource: "从退潮月光与未行记忆中凝结",
    },
    2: {
      title: "摆渡船沉下去，船夫留在岸上",
      narration: "万千被压入船底的余生随潮散开。摆渡使第一次不再替司命划船，而是亲眼看着每条道路回到选择者面前。",
      finalWords: "若他们再次后悔，这一次便由他们自己渡。",
      rewardSource: "由沉月船骨与归墟渡法重铸而成",
    },
  },
};

export function resolveBattleAftermath(chapter, stage) {
  const aftermath = BATTLE_AFTERMATHS[chapter]?.[stage];
  const enemy = ENCOUNTER_ENEMIES[chapter]?.[stage];
  return aftermath && enemy ? { ...aftermath, enemy } : null;
}

export const ENCOUNTER_MOVE_PATTERNS = {
  1: {
    1: [
      { name: "嗅雨寻隙", damage: 7, note: "试探 · 直接攻击，观察你的防线" },
      { name: "伏身蓄爪", damage: 0, shield: 6, note: "蓄势 · 获得 6 点护体，下一式将扑杀" },
      { name: "裂喉扑杀", damage: 12, note: "爆发 · 蓄势后的强力攻击" },
    ],
    2: [
      { name: "竹刃点穴", damage: 6, weak: 1, note: "起手 · 攻击并施加 1 层虚弱" },
      { name: "雾中连斩", damage: 5, hits: 2, note: "连击 · 两段攻击，逐段消耗护盾" },
      { name: "借竹藏形", damage: 3, shield: 9, note: "转守 · 轻击并获得 9 点护体" },
    ],
  },
  2: {
    1: [
      { name: "灯绳缚气", damage: 6, drainQi: 1, note: "夺气 · 下一回合灵气 -1" },
      { name: "引魂灯障", damage: 0, shield: 8, note: "守势 · 获得 8 点护体" },
      { name: "照名灼魂", damage: 11, note: "追击 · 灯火锁定名字后发动重击" },
    ],
    2: [
      { name: "断碑压名", damage: 8, drainQi: 1, note: "压制 · 下一回合灵气 -1" },
      { name: "旧讳成墙", damage: 4, shield: 12, note: "固守 · 攻击并获得 12 点护体" },
      { name: "百名镇魂", damage: 14, weak: 1, note: "裁定 · 重击并施加 1 层虚弱" },
    ],
  },
  3: {
    1: [
      { name: "雷痕蚀脉", damage: 7, weak: 1, note: "导雷 · 攻击并施加 1 层虚弱" },
      { name: "双雷循痕", damage: 6, hits: 2, note: "落雷 · 两段攻击追随雷痕" },
      { name: "云隙回电", damage: 5, shield: 8, note: "回流 · 攻击并获得 8 点护体" },
    ],
    2: [
      { name: "一问守心", damage: 8, weak: 1, note: "初问 · 攻击并施加虚弱" },
      { name: "二问承雷", damage: 5, hits: 3, note: "再问 · 三段雷罚，逐层击穿护盾" },
      { name: "三问破妄", damage: 8, shield: 13, note: "终问 · 攻击并重启 13 点阵壁" },
    ],
  },
  4: {
    1: [
      { name: "舔食梦边", damage: 8, drawPenalty: 1, note: "窃梦 · 下一回合少抽 1 张牌" },
      { name: "空梦游荡", damage: 4, shield: 8, note: "游荡 · 轻击并获得 8 点护体" },
      { name: "惊醒撕魂", damage: 14, note: "惊醒 · 趁手牌不足发动重击" },
    ],
    2: [
      { name: "影线缝心", damage: 9, drawPenalty: 1, note: "缝梦 · 下一回合少抽 1 张牌" },
      { name: "黑莲结茧", damage: 0, shield: 14, heal: 6, note: "回生 · 获得 14 点护体并恢复 6 点生命" },
      { name: "百梦穿针", damage: 7, hits: 2, weak: 1, note: "收线 · 两段攻击并施加虚弱" },
    ],
  },
  5: {
    1: [
      { name: "照见旧路", damage: 9, note: "映照 · 以你未选择的道路发动攻击" },
      { name: "补写缺页", damage: 5, curse: true, note: "污染 · 将一张命册缺页写入弃牌堆" },
      { name: "万路归一", damage: 16, weak: 1, note: "收束 · 重击并施加 1 层虚弱" },
    ],
    2: [
      { name: "墨锁灵台", damage: 9, drainQi: 1, note: "封锁 · 下一回合灵气 -1" },
      { name: "删去一行", damage: 6, curse: true, shield: 10, note: "改写 · 写入命册缺页并获得 10 点护体" },
      { name: "断章落款", damage: 17, weak: 2, note: "落款 · 重击并施加 2 层虚弱" },
    ],
  },
  6: {
    1: [
      { name: "拾取旧影", damage: 10, drawPenalty: 1, note: "追忆 · 下一回合少抽 1 张牌" },
      { name: "潮下藏身", damage: 5, shield: 10, note: "潜潮 · 轻击并获得 10 点护体" },
      { name: "未路扑杀", damage: 18, note: "决意 · 以一条未曾选择的道路发动重击" },
    ],
    2: [
      { name: "舟灯借命", damage: 11, drainQi: 1, note: "借命 · 下一回合灵气 -1" },
      { name: "沉舟作盾", damage: 6, shield: 16, heal: 5, note: "回航 · 攻击、护体并恢复生命" },
      { name: "三渡归墟", damage: 7, hits: 3, weak: 1, note: "送行 · 三段潮击并施加虚弱" },
    ],
  },
};

function fiveCardCombinations() {
  const combinations = [];
  for (let first = 0; first < 6; first += 1) {
    for (let second = first + 1; second < 7; second += 1) {
      for (let third = second + 1; third < 8; third += 1) {
        for (let fourth = third + 1; fourth < 9; fourth += 1) {
          for (let fifth = fourth + 1; fifth < 10; fifth += 1) {
            combinations.push([first, second, third, fourth, fifth]);
          }
        }
      }
    }
  }
  return combinations;
}

const RECIPE_ARCHETYPES = ["连携", "守御", "爆发", "循环", "秘仪", "逆转"];
const RECIPE_RANKS = [
  { name: "入门", note: "核心明确，适合初次尝试" },
  { name: "进阶", note: "需要围绕职业资源安排出牌顺序" },
  { name: "真传", note: "依赖多段联动与真解术法" },
];
const FIVE_CARD_COMBINATIONS = fiveCardCombinations();

function buildDeckRecipes(job) {
  return Array.from({ length: 18 }, (_, index) => {
    const rank = Math.floor(index / 6);
    const combinationIndex = Math.round(index * (FIVE_CARD_COMBINATIONS.length - 1) / 17);
    const baseSlots = FIVE_CARD_COMBINATIONS[combinationIndex];
    const cards = baseSlots.map((slot, cardIndex) => {
      const useRefined = (slot + index + cardIndex) % 5 < rank + 1;
      return job.cards[slot + (useRefined ? 10 : 0)];
    });
    const keywords = [...new Set(cards.map((card) => card.keyword))];
    return {
      id: `${job.id}-build-${index + 1}`,
      job: job.id,
      name: `${job.prefixes[index % job.prefixes.length]}${RECIPE_ARCHETYPES[index % RECIPE_ARCHETYPES.length]}流`,
      cards: cards.map((card) => card.id),
      focus: job.style.split(" · ")[index % 2],
      rank: RECIPE_RANKS[rank].name,
      rankNote: RECIPE_RANKS[rank].note,
      keywords,
      strategy: `先以「${keywords[0]}」建立节奏，再用「${keywords[1] || keywords[0]}」承接，最终围绕「${keywords.at(-1)}」完成收束。`,
    };
  });
}

export const DECK_RECIPES = PROFESSIONS.flatMap(buildDeckRecipes);

export const CHAPTERS = [
  {
    id: 1,
    name: "雨入青岚",
    region: "青岚谷",
    level: "推荐 1 级",
    art: "/ui/bg_act1_valley.png",
    boss: "第七盏灯",
    summary: "外门试炼当夜，失踪多年的师姐从雨中送来一封染血的信。",
    status: "available",
  },
  {
    id: 2,
    name: "灯照玄阴",
    region: "玄阴山道",
    level: "推荐 8 级",
    art: "/ui/bg_act2_mountain.png",
    boss: "写名鬼灯",
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
    boss: "无影城主",
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
  {
    id: 6,
    name: "月沉归墟",
    region: "归墟月海",
    level: "推荐 40 级",
    art: "/bg_spirit_rift.png",
    boss: "月蚀司命",
    summary: "命册不再替众生决定道路后，被删去的万千可能却化作月潮，从归墟倒灌人间。",
    status: "locked",
  },
];

export const CHAPTER_TRANSITIONS = {
  1: { eyebrow: "下一卷 · 灯照玄阴", title: "雨停以后，一盏写着你名字的灯顺流而来。", text: "第七盏灯熄灭时，灯芯吐出一枚玄阴山路引。沈砚秋没有现身，只在背面写道：师父当年也来过这里。", speaker: "沈砚秋留下的第二封信", hook: "沿旧路追查替灯人与师父失踪真相" },
  2: { eyebrow: "下一卷 · 雷云问心", title: "所有旧名都指向同一座筑基雷池。", text: "鬼灯熄灭后，二十四个名字化作雷纹爬上你的手臂。师父失败的熄灯次序，原来只是破阵法的前半段。", speaker: "纸灯童子交出的旧路引", hook: "进入雷池，证明筑基雷劫是一座改命阵" },
  3: { eyebrow: "下一卷 · 黑莲照夜", title: "雷阵崩裂，远方却有一座城失去了梦。", text: "第一替灯人的残魂散去前，指向一朵在夜色中盛开的黑莲。它正把命册之外的想象，从所有人心中逐一收走。", speaker: "沈砚秋抄下的最后一个名字", hook: "赶往无灯城，阻止黑莲收拢众生的选择" },
  4: { eyebrow: "下一卷 · 天门无月", title: "黑莲花心藏着一页从天门撕下的旧纸。", text: "无影城主承认，收梦契约只是命册规则在人间的倒影。真正握笔的人仍站在太虚天门后，等待你交还所有名字。", speaker: "城主恢复的第一场噩梦", hook: "抵达太虚天门，决定命册应记录还是支配" },
  5: { eyebrow: "终卷 · 月沉归墟", title: "命册放开万途，未行之路却开始倒灌人间。", text: "自由并没有让遗憾消失。每一条被舍弃的可能都沉入归墟月海，如今它们要回来取代真正发生的人生。", speaker: "新命册出现的第一道裂痕", hook: "前往归墟，承担自由之后最后的代价" },
  6: { eyebrow: "主线第一部 · 已结卷", title: "归墟仍在，但月潮不会再替任何人选择。", text: "青岚谷、玄阴山、无灯城与天门都开始学习一种更困难的生活：允许错误、承认遗憾，也不把自己的道路交给别人书写。", speaker: "《青岚夜行·命册残卷》", hook: "重返章节补全调查宗卷、人物后记与职业构筑" },
};

export const CHAPTER_HOME_STATES = {
  1: { kicker: "主线第一卷 · 青岚谷", title: "命册有缺，\n此夜无归。", text: "师姐留下的血书正在褪色。第七盏灯亮起之前，你必须进入青岚谷。" },
  2: { kicker: "主线第二卷 · 玄阴山道", title: "旧灯照名，\n余生问路。", text: "写着你名字的鬼灯已经点亮。沿师父留下的旧路，查清谁在让后来者替前人活下去。" },
  3: { kicker: "主线第三卷 · 筑基雷池", title: "雷云问心，\n安稳有价。", text: "二十四个旧名化作你手臂上的雷纹。青岚谷百年无灾的代价，正在雷池等待回答。" },
  4: { kicker: "主线第四卷 · 无灯城", title: "黑莲照夜，\n万梦无声。", text: "一座没有噩梦的城市正在失去想象明日的能力。找回影子，也找回选择的权利。" },
  5: { kicker: "主线第五卷 · 太虚天门", title: "天门无月，\n谁人执笔？", text: "命册最初只为无名者记录归途，如今却替所有人决定未来。真正握笔的人就在门后。" },
  6: { kicker: "主线终卷 · 归墟月海", title: "万途归海，\n此生何择。", text: "自由放开了所有道路，也放回了所有遗憾。阻止未行之路吞没真正发生的人生。" },
  complete: { kicker: "主线第一部 · 命册残卷", title: "月潮已退，\n人间自择。", text: "主线已经结卷。重返旧路补全调查宗卷、人物后记与六门道途，让每一次选择留下不同答案。" },
};

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
  {
    speaker: "沈砚秋",
    role: "藏在血书背面的留声",
    text: "若陆观说他从未见过我，便问他左手为何少了半截小指。那是替我熄第一盏灯时留下的。",
    art: "/bg_spirit_rift.png",
  },
  {
    speaker: "陆观",
    role: "终于收起伞的守门人",
    text: "雨亭之后没有回头路。你若仍要追她，先记住：山里最像人的东西，往往最早忘了自己的名字。",
    art: "/bg_soul_shrine.png",
  },
];

export const CHAPTER_STORIES = {
  1: STORY_SCENES,
  2: [
    { speaker: "纸灯童子", role: "玄阴山道的引路人", text: "灯上写着谁的名字，谁就必须替上一盏灯走完余下的路。", art: "/ui/bg_act2_mountain.png" },
    { speaker: "陆观", role: "守门人", text: "二十四年前的名册也多出过一个名字。那个人，后来成了你的师父。", art: "/bg_soul_shrine.png" },
    { speaker: "你", role: "循灯而行的外门弟子", text: "师姐不是失踪。她在沿着师父当年留下的路线，逐盏熄灯。", art: "/bg_spirit_rift.png" },
    { speaker: "纸灯童子", role: "从未长大的替灯人", text: "你师父熄到第六盏便停了。他说最后一盏里关着的不是鬼，是青岚谷不敢承认的旧账。", art: "/ui/bg_act2_mountain.png" },
    { speaker: "你", role: "提灯上山的人", text: "那便把灯给我。我不替谁走余生，只借它照清是谁在写名字。", art: "/bg_soul_shrine.png" },
  ],
  3: [
    { speaker: "雷池守阵者", role: "被困阵中的旧日执念", text: "每一道筑基雷劫，都在替命册挑选一个能够承受改写的人。", art: "/ui/bg_act3_thunder.png" },
    { speaker: "沈砚秋", role: "隔着雷云传来的声音", text: "我没有让你来救我。我只想让你亲眼看看，青岚谷用什么换来了百年安稳。", art: "/bg_thunder_pool.png" },
    { speaker: "你", role: "即将筑基的修士", text: "若筑基本身就是一道锁，那我今日要破的便不是境界，而是这座阵。", art: "/ui/bg_act3_thunder.png" },
    { speaker: "第一替灯人", role: "阵眼深处的残魂", text: "破阵会放回被改写的劫数，守阵则要继续献上后来者。你们口中的安稳，从来有人替你们受着。", art: "/bg_spirit_rift.png" },
    { speaker: "沈砚秋", role: "在阵外等待的人", text: "别替青岚谷赎罪。让每一个知道真相的人，自己决定还要不要住在这份安稳里。", art: "/bg_thunder_pool.png" },
  ],
  4: [
    { speaker: "无灯城主", role: "没有影子的城主", text: "城里的人把梦交给黑莲，换来不再害怕的夜晚。你凭什么说他们错了？", art: "/bg_dark_forge.png" },
    { speaker: "沈砚秋", role: "黑莲教通缉的叛徒", text: "他们收走的不是噩梦，是人在命册之外做出选择的能力。", art: "/bg_market_stall.png" },
    { speaker: "你", role: "带着影子入城的人", text: "今夜之后，这座城可以继续害怕，但必须重新学会做梦。", art: "/bg_dark_forge.png" },
    { speaker: "茶楼女童", role: "第一个重新做梦的人", text: "我梦见城外有海。城主说无灯城外什么都没有，可我的影子一直朝那个方向走。", art: "/bg_soul_shrine.png" },
    { speaker: "无灯城主", role: "黑莲契约的第一个签名者", text: "若你真要归还梦境，就先答应我：当他们再次害怕时，你不能转身说这是自由应付的代价。", art: "/bg_dark_forge.png" },
  ],
  5: [
    { speaker: "守门真君", role: "太虚天门的最后看守", text: "命册并非牢笼。没有它，凡人的一生连被天地记住的资格都没有。", art: "/bg_secret_realm.png" },
    { speaker: "沈砚秋", role: "命册缺页上的无名者", text: "修复它，我会从所有人的记忆里消失；焚毁它，天下修士都将失去既定前路。", art: "/bg_spirit_rift.png" },
    { speaker: "你", role: "执笔者", text: "我不替天下人选择去路。我只在命册最后写下：此后诸命，由己。", art: "/bg_secret_realm.png" },
    { speaker: "初代执笔者", role: "藏在纸背的旧声", text: "我们最初只想记住死者。后来有人发现，被写下的未来比被记住的过去更容易统治。", art: "/bg_soul_shrine.png" },
    { speaker: "沈砚秋", role: "站在门外的无名者", text: "落笔吧。无论你选哪一种，我都要亲眼看着你承担它，而不是把代价交给下一页的人。", art: "/bg_spirit_rift.png" },
  ],
  6: [
    { speaker: "沈砚秋", role: "新命册的第一位守页人", text: "天门之后，所有人都开始梦见自己没走过的路。昨夜起，那些路开始从梦里爬出来。", art: "/bg_spirit_rift.png" },
    { speaker: "归墟摆渡使", role: "在月海上等候千年的船夫", text: "命册替众生舍弃的可能，都沉在归墟。如今你放开了闸，它们自然要回来讨一个名字。", art: "/bg_secret_realm.png" },
    { speaker: "你", role: "不再握笔的执笔者", text: "自由不是让所有可能同时发生。人可以后悔，却仍要承认自己真正走过的那一条路。", art: "/ui/bg_act3_thunder.png" },
    { speaker: "月蚀司命", role: "归墟中最后一位旧天官", text: "既然选择必然舍弃，你所谓的自由与命册有何不同？至少旧册替他们承担了后悔。", art: "/bg_dark_forge.png" },
    { speaker: "沈砚秋", role: "与你并肩走到月海尽头的人", text: "不同在于，这一次没有人替别人落笔。走吧，把归墟还给那些愿意回望、也愿意继续走的人。", art: "/bg_spirit_rift.png" },
  ],
};

export const CHAPTER_STORY_CHOICES = {
  1: {
    1: [
      { label: "追问第二十四人的身份", value: "相信守门人", consequence: "获得 6 灵石；陆观会公开旧名册", effect: { stones: 6 } },
      { label: "隐瞒师姐来信", value: "隐瞒血书", consequence: "获得 1 份清神粉；独自保守血书", effect: { consumables: { clarity: 1 } } },
    ],
    3: [
      { label: "在雨亭留下回信", value: "留下回信", consequence: "恢复 8 生命；让沈砚秋知道你仍在追赶", effect: { heal: 8 } },
      { label: "抹去归谷暗号", value: "抹去暗号", consequence: "灵石 +10；下一名敌人获得 5 护体", effect: { stones: 10, enemyShield: 5 } },
    ],
  },
  2: {
    1: [
      { label: "接过写有自己名字的灯", value: "接受引灯", consequence: "失去 6 生命；获得一张净心术法", effect: { hpLoss: 6, addKeywordCard: "净心" } },
      { label: "先寻找师父留下的旧灯", value: "追查旧案", consequence: "获得 10 灵石；优先调查师父旧路", effect: { stones: 10 } },
    ],
    3: [
      { label: "替童子补完余生", value: "替灯偿愿", consequence: "恢复 10 生命；清神粉 +1", effect: { heal: 10, consumables: { clarity: 1 } } },
      { label: "拒绝替任何人走路", value: "拒绝替命", consequence: "灵气上限 +1；失去 8 生命", effect: { maxQi: 1, hpLoss: 8 } },
    ],
  },
  3: {
    1: [
      { label: "借雷劫强行破阵", value: "破阵", consequence: "本局灵气上限 +1", effect: { maxQi: 1 } },
      { label: "先寻找沈砚秋的阵眼", value: "寻人", consequence: "恢复 14 生命", effect: { heal: 14 } },
    ],
    3: [
      { label: "公开阵法真相", value: "公示雷阵", consequence: "获得 14 灵石；下一战敌人护体 +8", effect: { stones: 14, enemyShield: 8 } },
      { label: "先救出阵中残魂", value: "释放残魂", consequence: "精研一张基础牌；失去 6 生命", effect: { refineOne: true, hpLoss: 6 } },
    ],
  },
  4: {
    1: [
      { label: "唤醒城中人的噩梦", value: "归还梦境", consequence: "获得阴雷子与清神粉", effect: { consumables: { thunder: 1, clarity: 1 } } },
      { label: "夺取黑莲保存的影子", value: "夺回影子", consequence: "获得 16 灵石", effect: { stones: 16 } },
    ],
    3: [
      { label: "答应陪城民度过首夜", value: "守望首夜", consequence: "恢复 12 生命；石肤符 +1", effect: { heal: 12, consumables: { skin: 1 } } },
      { label: "立刻斩断黑莲契约", value: "强断契约", consequence: "精研一张基础牌；下一战敌人护体 +10", effect: { refineOne: true, enemyShield: 10 } },
    ],
  },
  5: {
    1: [
      { label: "让命册保留所有旧名", value: "修复命册", consequence: "生命完全恢复", effect: { fullHeal: true } },
      { label: "在最后一页写下新的规则", value: "重写命册", consequence: "牌组中可精研术法全部化为真解", effect: { refineAll: true } },
    ],
    3: [
      { label: "保留纸背的罪证", value: "保留罪证", consequence: "获得 20 灵石；将一份清神粉带入末战", effect: { stones: 20, consumables: { clarity: 1 } } },
      { label: "焚去执笔者的姓名", value: "焚去执笔者", consequence: "灵气上限 +1；失去 10 生命", effect: { maxQi: 1, hpLoss: 10 } },
    ],
  },
  6: {
    1: [
      { label: "让未行之路回到梦中", value: "安放可能", consequence: "恢复 12 生命；清神粉 +1", effect: { heal: 12, consumables: { clarity: 1 } } },
      { label: "把所有可能刻成新卷", value: "收录可能", consequence: "获得一张稀有职业牌；失去 8 生命", effect: { addRarityCard: "稀有", hpLoss: 8 } },
    ],
    3: [
      { label: "承认选择必然带来遗憾", value: "承担遗憾", consequence: "精研一张基础牌；恢复 6 生命", effect: { refineOne: true, heal: 6 } },
      { label: "要求司命归还所有道路", value: "索回万途", consequence: "灵气上限 +1；末战敌人护体 +12", effect: { maxQi: 1, enemyShield: 12 } },
    ],
  },
};

export const CHAPTER_EPILOGUES = {
  1: [
    { id: "rain_reply", choice: "留下回信", title: "雨亭有信，归人未归。", text: "三日后，雨亭石缝里多了一行新字：我看见了。继续走，不必等我。陆观从此每夜替你留一盏不写姓名的灯。", character: "沈砚秋 / 陆观" },
    { id: "rain_erased", choice: "抹去暗号", title: "暗号已去，追兵失路。", text: "沈砚秋再没有回应雨亭。你保住了她的行踪，也第一次明白：保护一个人，有时意味着接受她暂时不会回头。", character: "沈砚秋" },
  ],
  2: [
    { id: "lantern_farewell", choice: "替灯偿愿", title: "童子长大了一夜。", text: "纸灯童子听完师父未说出口的告别，终于在天亮前长成白发老人。他把空灯交给你，说余生虽短，至少如今属于自己。", character: "纸灯童子" },
    { id: "lantern_refusal", choice: "拒绝替命", title: "旧灯无人再接。", text: "你把写着自己名字的灯留在旧亭。后来每个上山的人都能看见它，却再没有谁被迫接过前人的余生。", character: "替灯人" },
  ],
  3: [
    { id: "thunder_truth", choice: "公示雷阵", title: "青岚谷第一次听见雷声。", text: "真相公开后，有人离谷，有人留下修补旧阵。安稳不再理所当然，却第一次成为所有人共同作出的选择。", character: "青岚谷众人" },
    { id: "thunder_souls", choice: "释放残魂", title: "雷池多了许多名字。", text: "阵中残魂散去前，各自说出被夺走的姓名。沈砚秋将它们逐一抄下，答应往后不再让任何牺牲只剩一个数字。", character: "第一替灯人" },
  ],
  4: [
    { id: "dream_vigil", choice: "守望首夜", title: "无灯城彻夜未眠。", text: "噩梦归来的第一夜，你和城民围坐到天明。恐惧没有吞没城市，反而让许多人第一次开口讲出自己真正想离开的理由。", character: "无灯城众人" },
    { id: "dream_severed", choice: "强断契约", title: "黑莲一夜凋尽。", text: "契约被强行斩断，城中哭声持续了七日。第八日，茶楼女童在城门画下一片海——那是无灯城第一幅没人规定该画什么的画。", character: "茶楼女童" },
  ],
  5: [
    { id: "fate_evidence", choice: "保留罪证", title: "纸背仍有旧墨。", text: "你把历代执笔者的罪证留在命册背面。后来每一位守页人接任前，都必须先读完那些被删去的名字。", character: "新命册守页人" },
    { id: "fate_burned", choice: "焚去执笔者", title: "天门不再记得主人。", text: "执笔者的姓名化为灰烬，天门从此只认来路，不认权位。沈砚秋笑你烧得太干净，却亲手把第一捧灰撒向人间。", character: "沈砚秋" },
  ],
  6: [
    { id: "moon_regret", choice: "承担遗憾", title: "月海留下可以回望的岸。", text: "归墟没有消失。人们偶尔仍会梦见未行之路，但醒来后能够带着遗憾继续生活。沈砚秋在渡口立下一块无字碑，纪念所有没有发生的人生。", character: "沈砚秋 / 归墟摆渡使" },
    { id: "moon_all_paths", choice: "索回万途", title: "万途归来，众生自择。", text: "你要求司命归还所有可能，却也关闭了让可能冒充现实的月门。从此每个人都能想象另一条路，但必须亲自决定何时放下它。", character: "月蚀司命" },
  ],
};

export const CHAPTER_ROUTE_COPY = {
  1: {
    title: "雨入青岚",
    beats: ["血书把你引向雨亭。", "妖影与药香同时出现。", "山门前只剩一次整备。", "第七盏灯在雨中亮起。"],
    clue: "名册多出一人 · 第七盏灯 · 师姐的血书",
    storyConsequence: "陆观将坦白沈砚秋离开山门的旧案",
    bossConsequence: "第七盏灯会认出你的命火与雨亭选择",
  },
  2: {
    title: "灯照玄阴",
    beats: ["纸灯童子提起旧日替灯人。", "阴魂与镇魂古龛分立两侧。", "鬼市中有人售卖旧名册。", "写着你名字的灯正在等候。"],
    clue: "替灯人 · 二十四年前的名册 · 师父的旧路",
    storyConsequence: "纸灯童子将说出师父未完成的告别",
    bossConsequence: "写名鬼灯会以你对替命的态度重写转相",
  },
  3: {
    title: "雷云问心",
    beats: ["雷纹正在辨认你的血脉。", "洗雷池与问心石阶同时开启。", "守阵执念透露阵法用途。", "筑基雷劫化作最后一道锁。"],
    clue: "改写之阵 · 青岚百年安稳 · 筑基之锁",
    storyConsequence: "第一替灯人的姓名将重新进入阵碑",
    bossConsequence: "守阵者会回应你如何处置雷阵真相",
  },
  4: {
    title: "黑莲照夜",
    beats: ["城门守卫没有影子。", "鬼市与梦坊藏着不同答案。", "黑莲台开始收拢全城影子。", "无灯城必须重新学会做梦。"],
    clue: "被收走的梦 · 黑莲契约 · 无影城主",
    storyConsequence: "第一道归来的影子将揭开城民真实愿望",
    bossConsequence: "无影城主会借全城噩梦回应你的选择",
  },
  5: {
    title: "天门无月",
    beats: ["天门展示命册最初的用途。", "旧日看守与无名者各执一词。", "三种结局正在笔下成形。", "命册最后一页等待落笔。"],
    clue: "修复 · 焚毁 · 重写",
    storyConsequence: "命册第一行将揭示记录与支配的分界",
    bossConsequence: "真正执笔者会依据罪证与姓名现身",
  },
  6: {
    title: "月沉归墟",
    beats: ["未行之路从梦中倒灌。", "逐月溺魂与月海遗舟同时出现。", "摆渡使守着归墟最深处的旧约。", "倒悬之月睁开了眼睛。"],
    clue: "未行之路 · 归墟旧约 · 自由之后的责任",
    storyConsequence: "沈砚秋未曾拥有的人生将在月海显形",
    bossConsequence: "月蚀司命会回应你如何面对遗憾与万途",
  },
};

export const CHAPTER_INVESTIGATIONS = {
  1: {
    objective: "查明名册为何多出第二十四人",
    opening: "血书警告：不可点亮山门前的第七盏灯。",
    routes: [
      { story: "雨亭石缝里留着沈砚秋新近刻下的归谷暗号。" },
      { battle: "妖影骨中嵌着山门名牌，它曾是试炼弟子。", event: "药圃药签写着第二十四人的脉象，与你完全相同。" },
      { elite: "断碑上的末名被反复凿去，又被鲜血重新写回。", market: "鬼市旧册证明今年名额原本只有二十三席。" },
      { boss: "第七盏灯以你的命火为芯，野狼妖影只是守灯人。" },
    ],
    conclusion: "多出的名字不是误记，而是命册提前写下的替灯人。",
  },
  2: {
    objective: "追查师父与替灯人的旧案",
    opening: "写名鬼灯会让后来者替前一盏灯走完余生。",
    routes: [
      { story: "旧亭梁上刻着师父二十四年前留下的熄灯次序。" },
      { battle: "无名山魂都曾是未能走完余生的替灯人。", event: "镇魂残符背面藏着师父交给陆观的路引。" },
      { elite: "试剑碑保留了师父被改写前的本名。", market: "被撕去姓名的旧册仍残留青岚谷掌门印。" },
      { boss: "鬼灯中的名字由山门主动写入，并非天命自然生成。" },
    ],
    conclusion: "师父曾试图熄灯，沈砚秋正在完成他失败的旧路。",
  },
  3: {
    objective: "证明筑基雷劫是一座改命阵",
    opening: "雷池会挑选能够承受命册改写的人。",
    routes: [
      { story: "雷纹只对历代替灯人的血脉产生回应。" },
      { battle: "劫影体内没有魂魄，只有被阵法复制的失败选择。", event: "洗雷池倒映出沈砚秋藏在阵眼中的破阵手势。" },
      { elite: "问心石阶以悔意为阵材，逼迫修士接受既定道路。", market: "散市法器都刻有同一枚太虚天门阵印。" },
      { boss: "守阵者承认青岚百年安稳来自不断改写弟子命数。" },
    ],
    conclusion: "筑基雷劫既是境界考验，也是筛选新执笔者的锁。",
  },
  4: {
    objective: "查明黑莲为何收走全城梦境",
    opening: "黑莲契约让居民不再恐惧，也不再拥有命册外的选择。",
    routes: [
      { story: "城门守卫交出的影子仍在反复梦见逃离无灯城。" },
      { battle: "街上梦魇由被强行割除的恐惧凝成。", event: "茶汤中的童年属于城主，他也曾被迫签下契约。" },
      { elite: "梦坊用居民影子缝补黑莲，维持契约不被察觉。", market: "鬼市交易的往事都来自不愿继续沉睡的人。" },
      { boss: "黑莲并未消灭痛苦，只把所有选择权集中到城主手中。" },
    ],
    conclusion: "失去噩梦的代价不是安宁，而是再也无法想象另一种明日。",
  },
  5: {
    objective: "决定命册应当记录还是支配众生",
    opening: "命册最初用于记住无名者，后来才被改造成既定前路。",
    routes: [
      { story: "天门承认你的血脉来自第一位反抗命册的执笔者。" },
      { battle: "旧命回廊里的敌影都是你未选择的人生。", event: "缺页书库证明被删去的人仍会在他人记忆中留下空洞。" },
      { elite: "旧执笔者害怕自由带来混乱，却从未让众生参与选择。", market: "无名者的遗物证明记录可以存在，而不必成为命令。" },
      { boss: "守门真君承认命册能够被重写，只是不愿交出执笔权。" },
    ],
    conclusion: "命册可以保存来路，但不应替任何人决定去处。",
  },
  6: {
    objective: "阻止未行之路吞没真实发生的人生",
    opening: "命册放开的万千可能正在归墟月海凝成一场倒灌人间的月潮。",
    routes: [
      { story: "摆渡使承认归墟收容的是所有被命册主动舍弃的未来。" },
      { battle: "逐月溺魂只会重复生者最后悔没有选择的那条路。", event: "月海遗舟保存着沈砚秋本可回到青岚谷的另一种人生。" },
      { elite: "归墟摆渡使曾奉命把危险的可能永远沉入海底。", market: "月下浮市的货物来自已经消失、却仍被人怀念的未来。" },
      { boss: "月蚀司命并非要毁灭自由，而是试图替众生再次承担选择后的遗憾。" },
    ],
    conclusion: "自由并不保证无悔；它要求每个人承认自己的选择，也允许人带着遗憾继续前行。",
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
  6: [
    [{ id: "story", kind: "剧情", name: "月海渡口", desc: "摆渡使要你先说出此生最后悔没有走的路。", art: "/bg_spirit_rift.png" }],
    [
      { id: "battle", kind: "战斗", name: "逐月潮滩", desc: "未行之路从潮水中长出人的形状。", art: "/bg_secret_realm.png" },
      { id: "event", kind: "奇遇", name: "月海遗舟", desc: "一艘空船载着沈砚秋本可拥有的人生。", art: "/bg_soul_shrine.png" },
    ],
    [
      { id: "elite", kind: "精英", name: "归墟摆渡台", desc: "老船夫要求你证明选择不是另一种残酷。", art: "/bg_dark_forge.png" },
      { id: "market", kind: "坊市", name: "月下浮市", desc: "这里出售已经消失、却仍被人怀念的未来。", art: "/bg_market_stall.png" },
    ],
    [{ id: "boss", kind: "首领", name: "倒悬月宫", desc: "月蚀司命要把所有道路重新收回唯一的天命。", art: "/bg_spirit_rift.png" }],
  ],
};

export const CHAPTER_EVENTS = {
  1: {
    eyebrow: "山中机缘",
    name: "月隐古龛",
    description: "残香在雨里燃着。神龛下压着一枚裂开的青玉，黑雾不敢靠近半步。",
    art: "/bg_soul_shrine.png",
    options: [
      { id: "trace", label: "触摸龛后剑痕", title: "精良职业牌 · 生命 -4", detail: "以血辨认沈砚秋留下的术式，带回一门与你道途相合的术法。", tone: "冒险构筑", effect: { cardRarity: "精良", hpLoss: 4 }, revealsClue: true },
      { id: "rest", label: "借残香静息", title: "恢复 12 点生命", detail: "放慢脚步梳理血书与名册的矛盾，不承担后续战斗代价。", tone: "稳健生存", effect: { heal: 12 }, revealsClue: true },
      { id: "jade", label: "揭符取走青玉", title: "灵石 +18 · 敌方护体 +5", detail: "立即获得资粮，但镇龛黑雾会依附下一名敌人。", tone: "高收益代价", effect: { stones: 18, enemyShield: 5 }, revealsClue: true },
      { id: "leave", label: "不惊动残香", title: "无收益 · 无风险", detail: "保住当前状态，但无法查证药圃与血书留下的证据。", tone: "谨慎离开", effect: {}, revealsClue: false },
    ],
  },
  2: {
    eyebrow: "玄阴异闻",
    name: "镇魂古龛",
    description: "每张残符都写着一个被鬼灯替换过的名字，师父的名字也在其中。",
    art: "/ui/bg_act2_mountain.png",
    options: [
      { id: "burn-name", label: "焚去自己的纸名", title: "净除心魔或恢复 6 · 清神粉 +1 · 生命 -4", detail: "有心魔时烧去一张；无心魔时，镇魂余火会转为恢复。", tone: "净心换血", effect: { removeCurse: 1, curseFallbackHeal: 6, consumables: { clarity: 1 }, hpLoss: 4 }, revealsClue: true },
      { id: "old-route", label: "沿师父路引前行", title: "稀有职业牌 · 生命 -6", detail: "循着二十四年前的险路参悟旧术，代价会立刻落在身上。", tone: "冒险构筑", effect: { cardRarity: "稀有", hpLoss: 6 }, revealsClue: true },
      { id: "lamp-oil", label: "取走鬼灯余油", title: "灵石 +20 · 敌方护体 +8", detail: "鬼市愿为灯油付出高价，失去镇压的阴魂会追到下一战。", tone: "高收益代价", effect: { stones: 20, enemyShield: 8 }, revealsClue: true },
      { id: "leave", label: "替残符重新压石", title: "无收益 · 无风险", detail: "不触碰旧案，也无法确认师父当年的路引。", tone: "谨慎离开", effect: {}, revealsClue: false },
    ],
  },
  3: {
    eyebrow: "雷云异闻",
    name: "洗雷池",
    description: "池中雷水倒映的不是现在，而是每一次你本可做出不同选择的时刻。",
    art: "/bg_thunder_pool.png",
    options: [
      { id: "draw-thunder", label: "引雷贯通经脉", title: "灵气上限 +1 · 生命 -10", detail: "灵气上限已满时改为聚气散 +2，确保雷洗不会落空。", tone: "长期爆发", effect: { maxQi: 1, maxQiFallbackConsumables: { spirit: 2 }, hpLoss: 10 }, revealsClue: true },
      { id: "temper", label: "在雷水中推演真解", title: "精研一张基础牌 · 恢复 6", detail: "无可精研术法时改为获得 12 灵石，不增加牌组厚度。", tone: "核心强化", effect: { refine: 1, refineFallbackStones: 12, heal: 6 }, revealsClue: true },
      { id: "calm-remnant", label: "镇压池底余念", title: "净除心魔或恢复 6 · 聚气散 +1", detail: "无心魔时将镇压之力转为恢复，稳定下一段路线。", tone: "循环净化", effect: { removeCurse: 1, curseFallbackHeal: 6, consumables: { spirit: 1 } }, revealsClue: true },
      { id: "leave", label: "绕开翻涌雷水", title: "无收益 · 无风险", detail: "保存血线，但看不到沈砚秋藏在阵眼中的手势。", tone: "谨慎离开", effect: {}, revealsClue: false },
    ],
  },
  4: {
    eyebrow: "无灯异闻",
    name: "失梦茶楼",
    description: "茶汤里漂着一段陌生童年。店主说，那是城主抵押在这里的梦。",
    art: "/bg_dark_forge.png",
    options: [
      { id: "drink-dream", label: "饮下城主的童年", title: "稀有职业牌 · 生命 -8", detail: "从陌生记忆中学会一门秘术，也承受那段恐惧留下的伤口。", tone: "记忆换术", effect: { cardRarity: "稀有", hpLoss: 8 }, revealsClue: true },
      { id: "return-dream", label: "把梦送回原主", title: "恢复 6 · 清神粉与阴雷子各 +1", detail: "不夺取记忆的力量，但得到居民留下的两件应急小物。", tone: "救助回报", effect: { heal: 6, consumables: { clarity: 1, thunder: 1 } }, revealsClue: true },
      { id: "sell-shadow", label: "抵押自己的一段影子", title: "灵石 +24 · 敌方护体 +10", detail: "影子鬼市立即付款，黑莲却会用它加固下一名追兵。", tone: "高收益代价", effect: { stones: 24, enemyShield: 10 }, revealsClue: true },
      { id: "leave", label: "不饮无主之梦", title: "无收益 · 无风险", detail: "保持清醒，也错过城主签下契约的真正原因。", tone: "谨慎离开", effect: {}, revealsClue: false },
    ],
  },
  5: {
    eyebrow: "天门异闻",
    name: "缺页书库",
    description: "书架上每个空位都在低声念诵一个无人记得的名字。",
    art: "/bg_secret_realm.png",
    options: [
      { id: "read-page", label: "读完属于自己的缺页", title: "精研一张基础牌 · 生命 -8", detail: "无可精研术法时改为获得 16 灵石，阅读不会毫无所得。", tone: "真相换力", effect: { refine: 1, refineFallbackStones: 16, hpLoss: 8 }, revealsClue: true },
      { id: "copy-rule", label: "抄录最初的记名法", title: "灵气上限 +1 · 敌方护体 +8", detail: "灵气上限已满时改为聚气散 +2，旧日规则仍会追来。", tone: "权能代价", effect: { maxQi: 1, maxQiFallbackConsumables: { spirit: 2 }, enemyShield: 8 }, revealsClue: true },
      { id: "take-relic", label: "取走无名者遗物", title: "传说职业牌 · 生命 -12", detail: "遗物承载一门完整传承，却要求你分担无名者被遗忘的痛苦。", tone: "终局豪赌", effect: { cardRarity: "传说", hpLoss: 12 }, revealsClue: true },
      { id: "leave", label: "合上仍在低语的书", title: "无收益 · 无风险", detail: "不惊动守门真君，也无法证明记录与支配并非同一件事。", tone: "谨慎离开", effect: {}, revealsClue: false },
    ],
  },
  6: {
    eyebrow: "归墟异闻",
    name: "月海遗舟",
    description: "船舱里摆着两套餐具、一封没有寄出的家书，以及沈砚秋从未穿过的青岚内门衣。",
    art: "/bg_spirit_rift.png",
    options: [
      { id: "read-letter", label: "读完未寄出的家书", title: "稀有职业牌 · 生命 -8", detail: "从另一种人生里带回一门术法，也承受那份从未发生的离别。", tone: "遗憾换术", effect: { cardRarity: "稀有", hpLoss: 8 }, revealsClue: true },
      { id: "moor-boat", label: "把遗舟系回渡口", title: "恢复 14 · 清神粉 +1", detail: "让这段可能停在可以被看见的地方，而不是继续追逐生者。", tone: "安放旧路", effect: { heal: 14, consumables: { clarity: 1 } }, revealsClue: true },
      { id: "take-moon-keel", label: "拆下沉月龙骨", title: "灵石 +28 · 敌方护体 +12", detail: "浮市愿付高价收购，失去船骨的月潮会依附最终首领。", tone: "高收益代价", effect: { stones: 28, enemyShield: 12 }, revealsClue: true },
      { id: "leave", label: "让遗舟继续漂流", title: "无收益 · 无风险", detail: "不触碰沈砚秋未曾拥有的人生，也无法确认归墟为何保存这些可能。", tone: "谨慎离开", effect: {}, revealsClue: false },
    ],
  },
};

export const CHAPTER_ROUTE_STORIES = {
  1: {
    eyebrow: "途中剧情 · 雨亭",
    name: "血书背面的旧伤",
    description: "陆观按住左手残指，终于承认三年前曾替沈砚秋熄灭第一盏灯，也亲手放她离开山门。",
    art: "/bg_soul_shrine.png",
    options: [
      { id: "trust-lu", label: "听完陆观的旧案", title: "恢复 10 点生命", detail: "在雨亭暂歇，也确认沈砚秋并非孤身背叛山门。", tone: "人物信任", effect: { heal: 10 }, revealsClue: true },
      { id: "take-token", label: "取走他的守门令", title: "灵石 +12 · 敌方护体 +5", detail: "守门令能换取资粮，但失去令牌的山门禁制会落到下一名追兵身上。", tone: "信物换资粮", effect: { stones: 12, enemyShield: 5 }, revealsClue: true },
    ],
  },
  2: {
    eyebrow: "途中剧情 · 旧亭",
    name: "纸灯童子的第七年",
    description: "童子每七年才醒一次。他已经等了你师父四次，却仍把那句“我会回来”当成今天刚听见的话。",
    art: "/ui/bg_act2_mountain.png",
    options: [
      { id: "finish-message", label: "替师父说完告别", title: "恢复 12 点生命", detail: "童子终于放下旧灯，也把熄灯次序完整告诉你。", tone: "偿还旧诺", effect: { heal: 12 }, revealsClue: true },
      { id: "borrow-flame", label: "借走一缕旧灯火", title: "清神粉 +1 · 生命 -4", detail: "灯火能烧去纸名，也会带走一小段属于你的寿数。", tone: "净心代价", effect: { consumables: { clarity: 1 }, hpLoss: 4 }, revealsClue: true },
    ],
  },
  3: {
    eyebrow: "途中剧情 · 雷纹",
    name: "第一替灯人的姓名",
    description: "阵眼没有留下英雄名讳，只有一句反复被雷火擦去的话：我也曾以为，牺牲我便能结束牺牲。",
    art: "/bg_thunder_pool.png",
    options: [
      { id: "carve-name", label: "把无名者刻回阵碑", title: "精研一张基础牌 · 生命 -6", detail: "以自身雷痕补全姓名，也从旧阵裂口中悟出一门真解。", tone: "记名换力", effect: { refine: 1, hpLoss: 6 }, revealsClue: true },
      { id: "break-tablet", label: "击碎替灯阵碑", title: "灵气上限 +1 · 敌方护体 +8", detail: "阵法不再能借碑续转，但残余雷壁会依附下一名守阵者。", tone: "破阵代价", effect: { maxQi: 1, enemyShield: 8 }, revealsClue: true },
    ],
  },
  4: {
    eyebrow: "途中剧情 · 城门",
    name: "第一个归来的影子",
    description: "守卫的影子从城墙上剥落，指着城外。它不会说话，却在地上写下一句：我替他害怕了二十年。",
    art: "/bg_dark_forge.png",
    options: [
      { id: "return-shadow", label: "把影子还给守卫", title: "恢复 8 · 石肤符 +1", detail: "守卫第一次因恐惧发抖，也第一次真心为你打开城门。", tone: "归还感受", effect: { heal: 8, consumables: { skin: 1 } }, revealsClue: true },
      { id: "follow-shadow", label: "跟随影子潜入梦坊", title: "稀有职业牌 · 生命 -6", detail: "影子教会你绕过黑莲耳目，也让一段陌生噩梦留在体内。", tone: "潜行换术", effect: { cardRarity: "稀有", hpLoss: 6 }, revealsClue: true },
    ],
  },
  5: {
    eyebrow: "途中剧情 · 天门",
    name: "命册的第一行字",
    description: "第一行并非天条，只是一个凡人写下的愿望：愿所有无人收殓者，至少有名字可以回家。",
    art: "/bg_secret_realm.png",
    options: [
      { id: "preserve-first-line", label: "保留最初的愿望", title: "恢复 14 点生命", detail: "你保留命册记录来路的能力，但拒绝让它继续命令未来。", tone: "守住初衷", effect: { heal: 14 }, revealsClue: true },
      { id: "copy-first-line", label: "将第一行抄入自己的卷册", title: "传说职业牌 · 生命 -10", detail: "把记名权带入自身道途，也承担所有无名者留下的重量。", tone: "传承豪赌", effect: { cardRarity: "传说", hpLoss: 10 }, revealsClue: true },
    ],
  },
  6: {
    eyebrow: "途中剧情 · 月海",
    name: "沈砚秋没有回谷的人生",
    description: "月潮映出她留在无灯城、成为一名普通医者的未来。那里的她不认识你，却过着平静而完整的一生。",
    art: "/bg_spirit_rift.png",
    options: [
      { id: "bless-other-life", label: "向那段人生道别", title: "恢复 14 · 清神粉 +1", detail: "承认未发生的人生也值得被祝福，然后让它安静沉回月海。", tone: "安放遗憾", effect: { heal: 14, consumables: { clarity: 1 } }, revealsClue: true },
      { id: "take-remedy", label: "记下另一个她的药方", title: "稀有职业牌 · 生命 -8", detail: "带回从未存在过的医术，也承受两个沈砚秋互相遗忘的痛楚。", tone: "可能换术", effect: { cardRarity: "稀有", hpLoss: 8 }, revealsClue: true },
    ],
  },
};

export const CHAPTER_MARKETS = {
  1: {
    eyebrow: "青岚坊市",
    name: "灯下鬼市",
    description: "外门弟子在雨棚下交换便宜术法与来路不明的旧物。",
    stall: "外门散卷",
    stockNote: "偏向低费与基础运转",
    bias: "low-cost",
    cardPrice: 0,
    removeCost: 7,
    refineCost: 13,
    treasureCost: 18,
    special: { id: "duplicate", label: "旧卷回收", title: "寄卖一张重复牌", detail: "移除牌组中第一张重复术法并获得 6 灵石。", cost: "重复牌 → 6 灵石" },
  },
  2: {
    eyebrow: "玄阴鬼市",
    name: "山道鬼市",
    description: "摊主不问活人姓名，只收镇魂符、旧路引和未散的执念。",
    stall: "镇魂残卷",
    stockNote: "偏向防护、恢复与净心",
    bias: "defense",
    cardPrice: 1,
    removeCost: 4,
    refineCost: 12,
    treasureCost: 17,
    special: { id: "purge", label: "无名火盆", title: "免费净除一张心魔", detail: "若牌组中没有心魔，则改为获得 1 份清神粉。", cost: "本次免费" },
  },
  3: {
    eyebrow: "雷云散市",
    name: "云端散市",
    description: "渡劫前的修士出售最后一件法器，也高价收购能承受雷洗的术法。",
    stall: "渡劫秘卷",
    stockNote: "偏向高费爆发与真解",
    bias: "power",
    cardPrice: 2,
    removeCost: 9,
    refineCost: 8,
    treasureCost: 20,
    special: { id: "thunder-refine", label: "借炉引雷", title: "生命 -6 · 免费精研一张", detail: "若已无可精研术法，则改为获得 12 灵石。", cost: "6 生命" },
  },
  4: {
    eyebrow: "无灯暗市",
    name: "影子鬼市",
    description: "这里出售不属于自己的往事，价格取决于你还剩多少影子。",
    stall: "失梦术卷",
    stockNote: "偏向过牌、复制与稀有术法",
    bias: "cycle",
    cardPrice: 1,
    removeCost: 6,
    refineCost: 11,
    treasureCost: 19,
    special: { id: "shadow", label: "典当一段影子", title: "生命 -8 · 灵石 +14", detail: "只可交易一次；不会降低生命上限。", cost: "8 生命 → 14 灵石" },
  },
  5: {
    eyebrow: "天门遗市",
    name: "无名人市集",
    description: "不在命册中的人交换最后遗物，只留下能够改变结局的传承。",
    stall: "无名传承",
    stockNote: "偏向稀有、传说与真解",
    bias: "legacy",
    cardPrice: 3,
    removeCost: 5,
    refineCost: 7,
    treasureCost: 22,
    special: { id: "rewrite", label: "交换一页命数", title: "8 灵石 · 精研一张基础牌", detail: "若已无可精研术法，则返还费用并获得 1 份聚气散。", cost: "8 灵石" },
  },
  6: {
    eyebrow: "归墟浮市",
    name: "月下浮市",
    description: "摊位随潮汐出现，只出售那些在另一种人生里本该属于你的东西。",
    stall: "未行秘卷",
    stockNote: "偏向净心、抽牌与终局循环",
    bias: "afterlife",
    cardPrice: 3,
    removeCost: 4,
    refineCost: 8,
    treasureCost: 24,
    special: { id: "moon-debt", label: "偿还一段未行之路", title: "忘却一张牌 · 恢复 16 生命", detail: "从牌组中忘却最高费用的非心魔牌；若牌组过薄则改为获得清神粉。", cost: "一张术法" },
  },
};

export const META_TALENTS = [
  { id: "meridian", name: "开脉", level: 2, max: 10, effect: "初始生命 +4", art: "/ui/insights/open_meridians.png" },
  { id: "mind", name: "守心", level: 1, max: 10, effect: "初始灵石 +2", art: "/ui/insights/guarded_mind.png" },
  { id: "edge", name: "藏锋", level: 0, max: 10, effect: "首场战斗初始资源 +1", art: "/ui/insights/hidden_edge_breath.png" },
];

export function getProfession(id) {
  return PROFESSIONS.find((job) => job.id === id) || PROFESSIONS[0];
}
