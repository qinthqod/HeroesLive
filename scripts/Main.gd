extends Control

const MAX_HAND_SIZE := 7
const CARD_BACK_PATH := "res://assets/card_back_qinglan_trial.png"
const UI_FONT_PATH := "res://assets/fonts/SourceHanSansSC-QinglanSubset.otf"
const UI_FONT := preload(UI_FONT_PATH)
const QinglanVisuals := preload("res://scripts/ui/QinglanVisuals.gd")
const ATMOSPHERIC_BACKDROP_SHADER := preload("res://assets/shaders/atmospheric_backdrop.gdshader")
const IMAGE2_MANIFEST_PATH := "res://docs/image2_asset_manifest.json"
const IMAGE2_QUEUE_PATH := "res://docs/image2_generation_queue.md"
const IMAGE2_BATCH_PROMPTS_PATH := "res://docs/image2_batch_prompts.jsonl"
const IMAGE2_ATTEMPTS_PATH := "res://docs/image2_generation_attempts.md"
const ENEMY_WOLF_ART_PATH := "res://assets/enemy_wolf_shadow.png"
const ENEMY_ROGUE_CULTIVATOR_ART_PATH := "res://assets/enemy_rogue_cultivator.png"
const ENEMY_BLACK_CULT_DEACON_ART_PATH := "res://assets/enemy_black_cult_deacon.png"
const MARKET_BACKGROUND_TARGET_PATH := "res://assets/bg_market_stall.png"
const SPIRIT_RIFT_BACKGROUND_TARGET_PATH := "res://assets/bg_spirit_rift.png"
const SECRET_REALM_BACKGROUND_TARGET_PATH := "res://assets/bg_secret_realm.png"
const SOUL_SHRINE_BACKGROUND_TARGET_PATH := "res://assets/bg_soul_shrine.png"
const DARK_FORGE_BACKGROUND_TARGET_PATH := "res://assets/bg_dark_forge.png"
const THUNDER_POOL_BACKGROUND_TARGET_PATH := "res://assets/bg_thunder_pool.png"
const TITLE_BACKGROUND_PATH := "res://assets/ui/bg_title_shrine.png"
const ACT_BACKGROUND_PATHS := [
	"res://assets/ui/bg_act1_valley.png",
	"res://assets/ui/bg_act2_mountain.png",
	"res://assets/ui/bg_act3_thunder.png"
]
const PANEL_TEXTURE_PATH := "res://assets/ui/panel_lacquer_9patch.png"
const CARD_IRON_SWORD_ART_PATH := "res://assets/card_iron_sword.png"
const CARD_BODY_WARD_ART_PATH := "res://assets/card_body_ward.png"
const CARD_CLOUDSTEP_ART_PATH := "res://assets/card_cloudstep.png"
const CARD_BREATH_CYCLE_ART_PATH := "res://assets/card_breath_cycle.png"
const CARD_FIRE_TALISMAN_ART_PATH := "res://assets/card_fire_talisman.png"
const CARD_CLEAR_HEART_ART_PATH := "res://assets/card_clear_heart.png"
const CARD_SWORD_ARRAY_ART_PATH := "res://assets/card_sword_array.png"
const CARD_SPIRIT_STONE_ART_PATH := "res://assets/card_spirit_stone.png"
const CARD_BLOOD_ESCAPE_ART_PATH := "res://assets/card_blood_escape.png"
const CARD_FOUNDATION_SURGE_ART_PATH := "res://assets/card_foundation_surge.png"
const COLOR_BG := Color(0.025, 0.045, 0.052)
const COLOR_PANEL := Color(0.055, 0.095, 0.092, 0.94)
const COLOR_PANEL_EDGE := Color(0.59, 0.45, 0.20)
const COLOR_TEXT := Color(0.94, 0.89, 0.76)
const COLOR_MUTED := Color(0.59, 0.70, 0.65)
const COLOR_JADE := Color(0.29, 0.65, 0.57)
const COLOR_AMBER := Color(0.91, 0.64, 0.25)
const COLOR_CINNABAR := Color(0.72, 0.25, 0.20)
const COLOR_PARCHMENT := Color(0.83, 0.74, 0.58)
const COLOR_INK := Color(0.012, 0.026, 0.028)
const COLOR_JADE_EDGE := Color(0.38, 0.66, 0.53)
const COLOR_GOLD_FOCUS := Color(0.98, 0.73, 0.28)
const RARITY_COLORS := {
	"common": Color(0.50, 0.68, 0.60),
	"uncommon": Color(0.43, 0.74, 0.82),
	"rare": Color(0.86, 0.56, 0.36),
	"curse": Color(0.47, 0.30, 0.52)
}
const GROWTH_EFFECT_TAGS := {
	"attack_damage": "攻击增伤",
	"first_attack_damage": "首攻增伤",
	"burn_bonus": "燃烧层数",
	"burn_damage": "燃烧威力",
	"damage": "直接伤害",
	"edge_damage_bonus": "剑势增伤",
	"start_edge": "起手剑势",
	"gain_edge": "获得剑势",
	"first_skill_edge": "法门剑势",
	"first_turn_qi": "起手灵气",
	"max_qi": "灵气上限",
	"gain_qi": "临时灵气",
	"first_turn_draw": "起手抽牌",
	"first_skill_draw": "首法门抽牌",
	"draw": "抽牌",
	"start_block": "起手护盾",
	"block": "护盾",
	"heal": "恢复",
	"start_heal": "起手恢复",
	"max_hp": "生命上限",
	"battle_heal": "战后恢复",
	"self_damage_block": "反噬护盾",
	"cleanse_curse": "净心",
	"start_cleanse_curse": "开局净心",
	"cleanse_player_weak": "驱散虚弱",
	"start_cleanse_weak": "开局驱弱",
	"battle_stones": "战后灵石",
	"battle_reward_consumable": "战后小物",
	"gain_consumable": "获得小物",
	"first_consumable_draw": "小物抽牌",
	"consumable_bonus": "小物强化",
	"market_discount": "坊市折扣"
}
const GROWTH_ROLE_EFFECTS := {
	"输出": ["attack_damage", "first_attack_damage", "burn_bonus", "burn_damage", "damage", "edge_damage_bonus"],
	"剑势": ["start_edge", "gain_edge", "first_skill_edge"],
	"运转": ["first_turn_qi", "max_qi", "gain_qi", "first_turn_draw", "first_skill_draw", "draw"],
	"生存": ["start_block", "block", "heal", "start_heal", "max_hp", "battle_heal", "self_damage_block"],
	"净化": ["cleanse_curse", "start_cleanse_curse", "cleanse_player_weak", "start_cleanse_weak"],
	"资源": ["battle_stones", "battle_reward_consumable", "gain_consumable", "first_consumable_draw", "consumable_bonus", "market_discount"]
}
const STARTING_DECK := [
	"iron_sword", "iron_sword", "iron_sword",
	"body_ward", "body_ward",
	"cloudstep", "breath_cycle"
]
const MAX_CARD_UPGRADE := 1
const RUN_STEPS_TO_BOSS := 4
const BASE_MAX_HP := 72
const SAVE_PATH := "user://qinglan_save.json"
const RUN_SAVE_PATH := "user://qinglan_run.json"
const MAX_RUN_HISTORY := 6
const META_UNLOCKS := [
	{"points": 4, "card_id": "fire_talisman", "name": "火弹符"},
	{"points": 10, "card_id": "clear_heart", "name": "清心诀"},
	{"points": 18, "card_id": "spirit_stone", "name": "灵石催发"},
	{"points": 30, "card_id": "soul_guard", "name": "镇魂符"},
	{"points": 45, "card_id": "spark_blade", "name": "雷火连剑"},
	{"points": 65, "card_id": "thunder_body", "name": "雷纹护体"}
]
const ACHIEVEMENT_LIBRARY := [
	{"id": "first_battle", "name": "月下初胜", "desc": "赢得任意一场战斗。"},
	{"id": "elite_down", "name": "煞地破围", "desc": "击败任意精英敌人。"},
	{"id": "first_treasure", "name": "法器入囊", "desc": "获得任意一件法宝。"},
	{"id": "three_treasures", "name": "小有家底", "desc": "同一局试炼中拥有 3 件法宝。"},
	{"id": "cleanse_mind", "name": "斩却杂念", "desc": "从牌组中移除 1 张心魔杂念。"},
	{"id": "storm_reached", "name": "云上问劫", "desc": "进入第三幕筑基雷云。"},
	{"id": "third_act_elite", "name": "雷火破关", "desc": "击败第三幕任意精英敌人。"},
	{"id": "thunder_pool_tempered", "name": "雷池留痕", "desc": "完成任意一次洗雷池选择。"},
	{"id": "deep_meridians", "name": "根基浑厚", "desc": "同一局灵气上限达到 5。"},
	{"id": "spirit_hoard", "name": "灵石满袋", "desc": "同一局持有 40 灵石。"},
	{"id": "foundation_success", "name": "筑基初成", "desc": "渡过筑基雷劫并通关。"},
	{"id": "clean_foundation", "name": "无垢筑基", "desc": "通关时牌组中没有心魔杂念。"},
	{"id": "nightmare_clear", "name": "黑煞渡劫", "desc": "在黑煞劫下完成通关。"},
	{"id": "edge_strike", "name": "剑势成锋", "desc": "用至少 3 层剑势强化一次攻击。"},
	{"id": "first_run_mark", "name": "因缘留痕", "desc": "在事件中获得任意一枚本局印记。"},
	{"id": "first_interlude_oath", "name": "雷云立誓", "desc": "首次立下一项幕间誓约。"},
	{"id": "first_flawless_win", "name": "无伤破阵", "desc": "赢得一场未损失生命的战斗。"}
]
const ENDING_LIBRARY := [
	{
		"id": "foundation_moon",
		"name": "月下筑基",
		"condition": "完成任意流派通关。",
		"text": "雷云散去，青岚谷外的月色第一次照进你的丹田。外门弟子的名册上多出一行小字：筑基。"
	},
	{
		"id": "clean_foundation",
		"name": "无垢灵台",
		"condition": "通关时牌组中没有心魔杂念。",
		"text": "劫光洗尽杂念，灵台如新磨青玉。你没有把黑煞余毒带进筑基后的第一口吐纳。"
	},
	{
		"id": "nightmare_foundation",
		"name": "黑煞尽渡",
		"condition": "在黑煞劫难度下通关。",
		"text": "最重的煞气没有压垮你，反倒成了新境界的第一块磨刀石。此后山门再提黑煞二字，你只觉风声平常。"
	},
	{
		"id": "bamboo_sword_path",
		"name": "青竹留痕",
		"condition": "以青竹剑修通关。",
		"text": "你仍把那柄青竹剑背在身后。它不算名器，却记得你从第一式剑诀走到筑基的每一步。"
	},
	{
		"id": "talisman_roamer_path",
		"name": "符火行云",
		"condition": "以符箓散修通关。",
		"text": "旧符囊烧去大半，余灰在袖中仍有温度。你知道自己不必依附名门，也能把一张黄符写成天光。"
	},
	{
		"id": "spring_healer_path",
		"name": "灵泉续命",
		"condition": "以灵泉药修通关。",
		"text": "你把最后一滴月露收入瓶中。它救过你，也会救后来误入煞雾的外门弟子。"
	},
	{
		"id": "demon_tempered_path",
		"name": "心魔砺骨",
		"condition": "以心魔苦修通关。",
		"text": "你没有否认心魔，只是逼它一同走完雷劫。那道暗痕还在骨里，却再也不能替你出剑。"
	},
	{
		"id": "thunder_roamer_path",
		"name": "雷符问道",
		"condition": "以雷符行者通关。",
		"text": "阴雷子碎尽，掌心还留着细小雷纹。你在雷声中筑基，也终于听懂雷声之外的寂静。"
	}
]
const CHALLENGE_LIBRARY := [
	{"id": "first_foundation", "name": "初筑青岚", "desc": "完成任意一次筑基通关。"},
	{"id": "clean_foundation_trial", "name": "无垢试炼", "desc": "通关时牌组中没有心魔杂念。"},
	{"id": "mandate_fulfilled", "name": "持签筑基", "desc": "通关时完成本局试炼签。"},
	{"id": "all_mandates_mastered", "name": "四签归卷", "desc": "累计完成全部类型的试炼签。"},
	{"id": "nightmare_foundation_trial", "name": "黑煞问劫", "desc": "在黑煞劫下通关。"},
	{"id": "daily_foundation_trial", "name": "今日留名", "desc": "完成任意一次今日试炼通关。"},
	{"id": "duel_oath_clear", "name": "试剑破劫", "desc": "通关战绩中曾立下或完成试剑约束。"},
	{"id": "high_rank_foundation", "name": "甲等筑基", "desc": "通关并取得甲或甲上评阶。"},
	{"id": "three_win_streak", "name": "三连筑基", "desc": "连续完成 3 次筑基通关。"},
	{"id": "flawless_foundation", "name": "无伤连破", "desc": "同一局至少取得 3 次完胜并完成筑基。"},
	{"id": "double_oath_foundation", "name": "双誓筑基", "desc": "同一局带着 2 项幕间誓约完成筑基。"},
	{"id": "all_interlude_oaths", "name": "诸誓归云", "desc": "累计立下全部类型的幕间誓约。"},
	{"id": "five_origin_foundation", "name": "五脉同辉", "desc": "五个流派都至少通关一次。"},
	{"id": "all_origin_nightmare", "name": "五脉破煞", "desc": "五个流派都至少完成一次黑煞劫通关。"},
	{"id": "all_origin_grandmaster", "name": "诸脉宗师", "desc": "五个流派都至少取得一次甲等或甲上通关。"},
	{"id": "full_ending_scroll", "name": "结局全卷", "desc": "解锁全部结局卷轴。"}
]
const TRIAL_MANDATE_LIBRARY := {
	"elite_hunt": {
		"name": "破煞签",
		"desc": "击败 2 名精英敌人。",
		"kind": "elite",
		"target": 2,
		"reward": "获得一件随机法宝。"
	},
	"spirit_hoard": {
		"name": "聚灵签",
		"desc": "本局灵石持有数达到 30。",
		"kind": "spirit_stones",
		"target": 30,
		"reward": "灵气上限 +1，并获得 1 件随机消耗品。"
	},
	"spell_refine": {
		"name": "炼术签",
		"desc": "精研 3 张术法。",
		"kind": "upgrade",
		"target": 3,
		"reward": "获得灵石 x14，并恢复 8 点生命。"
	},
	"clear_mind": {
		"name": "净心签",
		"desc": "移除或净除 2 张心魔杂念。",
		"kind": "cleanse",
		"target": 2,
		"reward": "获得灵石 x10，并获得 1 份清神粉。"
	}
}
const BOUNTY_LIBRARY := {
	"battle_patrol": {
		"name": "巡山悬赏",
		"desc": "赢得 2 场普通或精英战斗。",
		"kind": "battle",
		"target": 2,
		"reward": "灵石 x10，并获得 1 件随机消耗品。"
	},
	"elite_warrant": {
		"name": "破煞悬赏",
		"desc": "击败 1 名精英敌人。",
		"kind": "elite",
		"target": 1,
		"reward": "灵石 x16。"
	},
	"spell_commission": {
		"name": "炼术委托",
		"desc": "精研 2 张术法。",
		"kind": "upgrade",
		"target": 2,
		"reward": "灵石 x8，并获得 1 件随机消耗品。"
	},
	"cleanse_warrant": {
		"name": "净心悬赏",
		"desc": "移除或净除 1 张心魔杂念。",
		"kind": "cleanse",
		"target": 1,
		"reward": "灵石 x12。"
	},
	"treasure_appraisal": {
		"name": "鉴宝委托",
		"desc": "获得 1 件法宝。",
		"kind": "gain_treasure",
		"target": 1,
		"reward": "灵石 x8，并恢复 8 点生命。"
	},
	"market_supply": {
		"name": "坊市采买",
		"desc": "在坊市购买 1 件消耗品。",
		"kind": "buy_consumable",
		"target": 1,
		"reward": "灵石 x8，并额外获得 1 件随机消耗品。"
	}
}
const LUNAR_OMEN_LIBRARY := {
	"new_moon": {
		"name": "新月潜行",
		"desc": "每场战斗第 1 回合额外抽 1 张牌。",
		"first_turn_draw": 1,
		"tone": "training"
	},
	"waxing_moon": {
		"name": "上弦盈灵",
		"desc": "每场战斗第 1 回合灵气 +1。",
		"first_turn_qi": 1,
		"tone": "market"
	},
	"frost_moon": {
		"name": "霜月护体",
		"desc": "每场战斗第 1 回合护盾 +4。",
		"start_block": 4,
		"tone": "rest"
	},
	"blood_moon": {
		"name": "血月争辉",
		"desc": "敌人招式伤害 +1；战斗胜利额外获得灵石 x3。",
		"enemy_damage_bonus": 1,
		"battle_stones": 3,
		"tone": "elite"
	},
	"eclipse_moon": {
		"name": "月蚀问心",
		"desc": "敌人生命 +6；奖励重掷价格 -2。",
		"enemy_hp_bonus": 6,
		"reroll_discount": 2,
		"tone": "event"
	}
}
const RUN_MARK_LIBRARY := {
	"ancient_jade": {"name": "玉简余辉", "desc": "你读过洞府残简，旧术法的光还停在指尖。"},
	"forbidden_mark": {"name": "破禁暗痕", "desc": "强破禁制留下暗痕，力量与心魔一同入身。"},
	"miasma_herb": {"name": "瘴草气息", "desc": "药畦深处的瘴气缠过经脉，也换来稀有灵草。"},
	"meridian_rift": {"name": "裂脉灵痕", "desc": "紊乱灵脉拓开经络，刺痛中多了一线容量。"},
	"star_vision": {"name": "秘境星图", "desc": "星图灼过神魂，之后每次抬头都像能看见路径。"},
	"moonwell_reflection": {"name": "月井倒影", "desc": "月井映出另一重自己，根骨增长，杂念也随之浮起。"},
	"shrine_shadow": {"name": "古龛阴影", "desc": "龛中法器认主，阴影也记住了你的名字。"},
	"yin_thunder": {"name": "阴雷火星", "desc": "残炉阴火铸入雷丸，袖中仍有细碎火星。"},
	"thunder_tempered": {"name": "雷池淬痕", "desc": "雷池洗过血肉与灵台，劫光留下可追溯的痕迹。"}
}
const INTERLUDE_OATH_LIBRARY := {
	"moon_guard_oath": {
		"name": "月誓守心",
		"desc": "幕间净除至多 1 张心魔杂念并恢复 10 生命；若无心魔，改得 1 份清神粉。",
		"tone": "rest",
		"heal": 10,
		"cleanse_curse": 1,
		"fallback_consumable": "clarity_powder"
	},
	"thunder_blade_oath": {
		"name": "雷誓试锋",
		"desc": "获得 1 张裂魂剑与 1 枚藏锋符，但下一战虚弱 +1。",
		"tone": "battle",
		"gain_card": "soul_sundering_sword",
		"gain_consumable": "edge_talisman",
		"next_weak": 1
	},
	"jade_body_oath": {
		"name": "玉骨盟约",
		"desc": "生命上限 +6，并恢复 14 生命。",
		"tone": "training",
		"max_hp": 6,
		"heal": 14
	},
	"market_pack_oath": {
		"name": "行囊盟约",
		"desc": "获得 14 灵石与 2 件随机消耗品。",
		"tone": "market",
		"spirit_stones": 14,
		"random_consumable": 2
	},
	"star_scroll_oath": {
		"name": "星卷誓",
		"desc": "随机精研 2 张术法；若已无可精研术法，改得 1 张随机术法。",
		"tone": "training",
		"upgrade_random": 2,
		"fallback_random_card": 1
	},
	"mirror_insight_oath": {
		"name": "明镜问心",
		"desc": "获得 1 项随机悟道，但下一战虚弱 +1；若已无可悟，改得 1 份清神粉。",
		"tone": "event",
		"random_insight": 1,
		"next_weak": 1,
		"fallback_consumable": "clarity_powder"
	}
}
const KEYWORD_LIBRARY := [
	{"name": "灵气", "desc": "每回合开始恢复到灵气上限，用来支付卡牌费用；吐纳、灵石和部分流派能临时提高本回合灵气。"},
	{"name": "护盾", "desc": "优先抵挡伤害；玩家护盾在回合开始重置，敌人的护体会保留到被击破。"},
	{"name": "意图", "desc": "敌人下一次行动预告，会显示伤害、护体、虚弱或心魔污染，玩家可以据此安排防御或爆发。"},
	{"name": "燃烧", "desc": "玩家回合开始时灼伤敌人，造成等同层数的伤害后层数减少 1；余烬珠和符火破境会强化燃烧路线。"},
	{"name": "虚弱", "desc": "下一次受到的伤害额外 +25%，触发后减少 1 层；敌人与玩家都可能被虚弱。"},
	{"name": "破绽", "desc": "敌人部分防御招式会露出破绽，下一次受到攻击时额外承受 3 点伤害，火弹符等牌还会追加收益。"},
	{"name": "剑势", "desc": "战斗内临时层数，下一张攻击牌每段伤害 +2；攻击后清空。适合配合多段攻击和低费过牌。"},
	{"name": "心魔杂念", "desc": "不可打出的污染牌，会堵住手牌；清心诀、镇魂符、事件和部分破境可以移除或压制它。"},
	{"name": "消耗", "desc": "打出后进入消耗区，本场战斗不再回到抽牌堆；通常代表强力但有限的爆发或保命牌。"},
	{"name": "法宝", "desc": "本局永久生效的小型被动，来自奖励、精英战、坊市或事件，可改变护盾、燃烧、经济和消耗品节奏。"},
	{"name": "悟道", "desc": "本局被动修行，多从精英战或中段推进获得，偏向灵气、抽牌、防御、符火或战后恢复。"},
	{"name": "破境", "desc": "击败非终局 Boss 后选择的幕间强化，决定后续两幕的成长方向。"},
	{"name": "幕间誓约", "desc": "击败非终局 Boss 并完成破境后出现的过幕选择，会给出一项即时成长或整备，同时可能附带下一战代价。"},
	{"name": "试炼签", "desc": "每局按种子自动抽取的整局目标，会追踪精英战、灵石持有、术法精研或净心次数；达成后立即获得一次小奖励。"},
	{"name": "悬赏令", "desc": "局内滚动短期目标，会追踪胜战、精英、精研、净心、获法宝或坊市采买；完成后立刻给赏金并刷新下一张悬赏。"},
	{"name": "月相异兆", "desc": "每局按种子确定的轻量规则变体，可能强化起手、提高敌势、增加战利品或降低奖励重掷价格。"},
	{"name": "本局印记", "desc": "重要事件选择留下的叙事记录，会写入任务札记、结算复盘和最近战绩，方便回看这局走过的路。"},
	{"name": "路线研判", "desc": "地图页会汇总当前可选节点、构筑短板、试炼签、悬赏和血线，给出优先路线与当前待办。"},
	{"name": "评阶", "desc": "结算按推进、战斗、成长、灵石、试炼签、悬赏、筑基和无垢等项目评分；任务札记会显示局中评阶预估。"},
	{"name": "连胜", "desc": "连续筑基通关会提高当前连胜并刷新最高连胜；失败会清空当前连胜，三连筑基会完成对应挑战。"},
	{"name": "完胜破阵", "desc": "一场战斗中没有损失生命并获胜即为完胜，护盾吸收伤害不影响完胜，反噬自伤会使本战失去完胜。"},
	{"name": "紧凑手牌", "desc": "设置页可切换手牌卡牌尺寸；紧凑模式适合小屏或后期手牌较多时使用。"},
	{"name": "重掷", "desc": "奖励页可花灵石重整当前奖励；坊市木牌会降低价格，适合寻找关键牌、法宝或应急物品。"}
]
const ORIGIN_LIBRARY := {
	"bamboo_sword": {
		"name": "青竹剑修",
		"desc": "均衡攻防。每场战斗开局获得 2 点护盾。",
		"deck": STARTING_DECK,
		"start_block": 2,
		"tone": "training"
	},
	"talisman_roamer": {
		"name": "符箓散修",
		"desc": "擅长燃烧与爆发。每场战斗第 1 回合额外获得 1 点灵气。",
		"deck": ["iron_sword", "iron_sword", "fire_talisman", "fire_talisman", "body_ward", "breath_cycle", "spirit_stone"],
		"first_turn_qi": 1,
		"tone": "market"
	},
	"spring_healer": {
		"name": "灵泉药修",
		"desc": "更稳健的恢复路线。生命上限 +8，每场战斗开局恢复 3 点生命。",
		"deck": ["iron_sword", "body_ward", "body_ward", "clear_heart", "clear_heart", "cloudstep", "breath_cycle"],
		"max_hp_bonus": 8,
		"start_heal": 3,
		"tone": "rest"
	},
	"demon_tempered": {
		"name": "心魔苦修",
		"desc": "高风险近战路线。生命上限 +6，所有攻击牌每段伤害 +2，但起始牌组混入心魔。",
		"deck": ["iron_sword", "iron_sword", "blood_escape", "clear_heart", "body_ward", "breath_cycle", "inner_demon"],
		"max_hp_bonus": 6,
		"attack_damage": 2,
		"tone": "elite"
	},
	"thunder_roamer": {
		"name": "雷符行者",
		"desc": "偏爆发与应急道具。开局携带 1 枚阴雷子，第 1 回合额外抽 1 张牌。",
		"deck": ["fire_talisman", "spark_blade", "body_ward", "cloudstep", "breath_cycle", "spirit_stone", "soul_guard"],
		"start_consumable": "thunder_seed",
		"first_turn_draw": 1,
		"tone": "battle"
	}
}
const DIFFICULTY_LIBRARY := {
	"normal": {
		"name": "凡阶试炼",
		"desc": "标准难度。适合熟悉流派与路线。",
		"hp_bonus": 0,
		"damage_bonus": 0,
		"block_bonus": 0,
		"cultivation_bonus": 0,
		"tone": "training"
	},
	"hard": {
		"name": "破雾劫",
		"desc": "敌人生命、伤害和护体小幅提高，结算修为 +30%。",
		"hp_bonus": 8,
		"damage_bonus": 1,
		"block_bonus": 2,
		"cultivation_bonus": 0.30,
		"tone": "battle"
	},
	"nightmare": {
		"name": "黑煞劫",
		"desc": "敌人生命、伤害和护体显著提高，结算修为 +60%。",
		"hp_bonus": 16,
		"damage_bonus": 2,
		"block_bonus": 4,
		"cultivation_bonus": 0.60,
		"tone": "elite"
	}
}

const CARD_LIBRARY := {
	"iron_sword": {
		"name": "青竹剑诀",
		"art": CARD_IRON_SWORD_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "造成 6 点伤害。",
		"damage": 6,
		"rarity": "common"
	},
	"body_ward": {
		"name": "护体灵光",
		"art": CARD_BODY_WARD_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 6 点护盾。",
		"block": 6,
		"rarity": "common"
	},
	"cloudstep": {
		"name": "御风步",
		"art": CARD_CLOUDSTEP_ART_PATH,
		"type": "skill",
		"cost": 0,
		"desc": "抽 1 张牌，获得 2 点护盾。",
		"draw": 1,
		"block": 2,
		"rarity": "common"
	},
	"breath_cycle": {
		"name": "吐纳术",
		"art": CARD_BREATH_CYCLE_ART_PATH,
		"type": "skill",
		"cost": 0,
		"desc": "本回合获得 1 点灵气。",
		"gain_qi": 1,
		"rarity": "common"
	},
	"fire_talisman": {
		"name": "火弹符",
		"art": CARD_FIRE_TALISMAN_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "造成 8 点伤害，施加 2 层燃烧。若敌人有破绽，额外造成 4 点。",
		"damage": 8,
		"burn": 2,
		"flaw_bonus": 4,
		"rarity": "common"
	},
	"clear_heart": {
		"name": "清心诀",
		"art": CARD_CLEAR_HEART_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "恢复 4 点生命，抽 1 张牌，驱散 1 层自身虚弱。",
		"heal": 4,
		"draw": 1,
		"cleanse_player_weak": 1,
		"rarity": "uncommon"
	},
	"sword_array": {
		"name": "小五行剑阵",
		"art": CARD_SWORD_ARRAY_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 14 点伤害，获得 4 点护盾，施加 1 层虚弱。",
		"damage": 14,
		"block": 4,
		"weak": 1,
		"rarity": "uncommon"
	},
	"spirit_stone": {
		"name": "灵石催发",
		"art": CARD_SPIRIT_STONE_ART_PATH,
		"type": "skill",
		"cost": 0,
		"desc": "获得 2 点灵气，抽 1 张牌。消耗。",
		"gain_qi": 2,
		"draw": 1,
		"exhaust": true,
		"rarity": "uncommon"
	},
	"blood_escape": {
		"name": "血遁秘术",
		"art": CARD_BLOOD_ESCAPE_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "失去 3 点生命，造成 16 点伤害。",
		"self_damage": 3,
		"damage": 16,
		"rarity": "rare",
		"min_act": 1
	},
	"foundation_surge": {
		"name": "筑基一击",
		"art": CARD_FOUNDATION_SURGE_ART_PATH,
		"type": "attack",
		"cost": 3,
		"desc": "造成 28 点伤害。",
		"damage": 28,
		"rarity": "rare",
		"min_act": 1
	},
	"spark_blade": {
		"name": "雷火连剑",
		"art": CARD_SWORD_ARRAY_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "造成 5 点伤害 2 次。",
		"damage": 5,
		"hits": 2,
		"rarity": "uncommon"
	},
	"yin_fire_charm": {
		"name": "阴火符",
		"art": CARD_FIRE_TALISMAN_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 12 点伤害，施加 4 层燃烧。",
		"damage": 12,
		"burn": 4,
		"rarity": "uncommon",
		"min_act": 1
	},
	"soul_guard": {
		"name": "镇魂符",
		"art": CARD_CLEAR_HEART_ART_PATH,
		"image2_target_art": "res://assets/card_soul_guard.png",
		"type": "skill",
		"cost": 1,
		"desc": "获得 7 点护盾，驱散 2 层自身虚弱。",
		"block": 7,
		"cleanse_player_weak": 2,
		"rarity": "uncommon"
	},
	"meridian_burst": {
		"name": "通脉诀",
		"art": CARD_BREATH_CYCLE_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 2 点灵气，抽 1 张牌。消耗。",
		"gain_qi": 2,
		"draw": 1,
		"exhaust": true,
		"rarity": "uncommon",
		"min_act": 1
	},
	"jade_body": {
		"name": "玉骨护身",
		"art": CARD_BODY_WARD_ART_PATH,
		"type": "skill",
		"cost": 2,
		"desc": "获得 16 点护盾。",
		"block": 16,
		"rarity": "rare",
		"min_act": 1
	},
	"altar_breaker": {
		"name": "破坛剑",
		"art": CARD_FOUNDATION_SURGE_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 18 点伤害，施加 1 层虚弱。",
		"damage": 18,
		"weak": 1,
		"rarity": "rare",
		"min_act": 1
	},
	"tribulation_sword": {
		"name": "引劫剑",
		"art": CARD_FOUNDATION_SURGE_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 10 点伤害 2 次。消耗。",
		"damage": 10,
		"hits": 2,
		"exhaust": true,
		"rarity": "rare",
		"min_act": 2
	},
	"thunder_body": {
		"name": "雷纹护体",
		"art": CARD_BODY_WARD_ART_PATH,
		"image2_target_art": "res://assets/card_thunder_body.png",
		"type": "skill",
		"cost": 2,
		"desc": "获得 12 点护盾，恢复 5 点生命，驱散 1 层自身虚弱。",
		"block": 12,
		"heal": 5,
		"cleanse_player_weak": 1,
		"rarity": "rare",
		"min_act": 2
	},
	"heaven_flame": {
		"name": "天火符",
		"art": CARD_FIRE_TALISMAN_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "造成 7 点伤害，施加 5 层燃烧。",
		"damage": 7,
		"burn": 5,
		"rarity": "uncommon",
		"min_act": 2
	},
	"wind_needle": {
		"name": "风针术",
		"art": CARD_CLOUDSTEP_ART_PATH,
		"type": "attack",
		"cost": 0,
		"desc": "造成 3 点伤害，抽 1 张牌。",
		"damage": 3,
		"draw": 1,
		"rarity": "common"
	},
	"spirit_screen": {
		"name": "灵息屏障",
		"art": CARD_BODY_WARD_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 5 点护盾，本回合获得 1 点灵气。",
		"block": 5,
		"gain_qi": 1,
		"rarity": "common"
	},
	"mind_seal": {
		"name": "镇心咒",
		"art": CARD_CLEAR_HEART_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 4 点护盾，抽 1 张牌，净除 1 张心魔杂念。",
		"block": 4,
		"draw": 1,
		"cleanse_curse": 1,
		"rarity": "uncommon"
	},
	"moon_recovery": {
		"name": "月露回春",
		"art": CARD_BREATH_CYCLE_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "恢复 7 点生命，获得 3 点护盾。",
		"heal": 7,
		"block": 3,
		"rarity": "uncommon",
		"min_act": 1
	},
	"thunder_seal": {
		"name": "雷印破煞",
		"art": CARD_FIRE_TALISMAN_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 14 点伤害，施加 2 层燃烧和 1 层虚弱。",
		"damage": 14,
		"burn": 2,
		"weak": 1,
		"rarity": "rare",
		"min_act": 2
	},
	"hidden_edge": {
		"name": "藏锋诀",
		"art": CARD_BREATH_CYCLE_ART_PATH,
		"type": "skill",
		"cost": 0,
		"desc": "获得 1 层剑势，抽 1 张牌。",
		"gain_edge": 1,
		"draw": 1,
		"rarity": "common"
	},
	"edge_guard": {
		"name": "锋芒护身",
		"art": CARD_BODY_WARD_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 5 点护盾，获得 2 层剑势。",
		"block": 5,
		"gain_edge": 2,
		"rarity": "uncommon"
	},
	"returning_cut": {
		"name": "回风剑",
		"art": CARD_CLOUDSTEP_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "获得 1 层剑势，造成 7 点伤害。",
		"gain_edge": 1,
		"damage": 7,
		"rarity": "uncommon"
	},
	"moon_chase_blade": {
		"name": "逐月连斩",
		"art": CARD_SWORD_ARRAY_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 6 点伤害 3 次。",
		"damage": 6,
		"hits": 3,
		"rarity": "rare",
		"min_act": 1
	},
	"moon_veil": {
		"name": "月影纱",
		"art": CARD_CLOUDSTEP_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 4 点护盾，获得 1 层剑势，抽 1 张牌。",
		"block": 4,
		"gain_edge": 1,
		"draw": 1,
		"rarity": "common"
	},
	"moon_mirror_mind": {
		"name": "明月照心",
		"art": CARD_CLEAR_HEART_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "恢复 5 点生命，抽 1 张牌，净除 1 张心魔杂念。",
		"heal": 5,
		"draw": 1,
		"cleanse_curse": 1,
		"rarity": "uncommon",
		"min_act": 1
	},
	"jade_moon_barrier": {
		"name": "玉月成璧",
		"art": CARD_BODY_WARD_ART_PATH,
		"type": "skill",
		"cost": 2,
		"desc": "获得 12 点护盾，恢复 4 点生命，抽 1 张牌。",
		"block": 12,
		"heal": 4,
		"draw": 1,
		"rarity": "rare",
		"min_act": 1
	},
	"soul_sundering_sword": {
		"name": "裂魂剑",
		"art": CARD_SWORD_ARRAY_ART_PATH,
		"type": "attack",
		"cost": 1,
		"desc": "获得 1 层剑势，造成 8 点伤害，施加 1 层虚弱。",
		"gain_edge": 1,
		"damage": 8,
		"weak": 1,
		"rarity": "uncommon",
		"min_act": 1
	},
	"starfire_lance": {
		"name": "星火贯月",
		"art": CARD_FIRE_TALISMAN_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 10 点伤害 2 次，施加 3 层燃烧。",
		"damage": 10,
		"hits": 2,
		"burn": 3,
		"rarity": "rare",
		"min_act": 2
	},
	"storm_cleansing_talisman": {
		"name": "雷洗清符",
		"art": CARD_CLEAR_HEART_ART_PATH,
		"type": "skill",
		"cost": 1,
		"desc": "获得 8 点护盾，抽 1 张牌，净除 2 张心魔杂念。",
		"block": 8,
		"draw": 1,
		"cleanse_curse": 2,
		"rarity": "rare",
		"min_act": 2
	},
	"spirit_marrow_surge": {
		"name": "灵髓回涌",
		"art": CARD_BREATH_CYCLE_ART_PATH,
		"type": "skill",
		"cost": 2,
		"desc": "本回合获得 3 点灵气，恢复 4 点生命。消耗。",
		"gain_qi": 3,
		"heal": 4,
		"exhaust": true,
		"rarity": "uncommon",
		"min_act": 1
	},
	"ember_sword_rain": {
		"name": "余烬剑雨",
		"art": CARD_SWORD_ARRAY_ART_PATH,
		"type": "attack",
		"cost": 2,
		"desc": "造成 4 点伤害 4 次，施加 2 层燃烧。",
		"damage": 4,
		"hits": 4,
		"burn": 2,
		"rarity": "rare",
		"min_act": 2
	},
	"eclipse_blade": {
		"name": "月蚀斩",
		"art": CARD_FOUNDATION_SURGE_ART_PATH,
		"image2_target_art": "res://assets/card_moon_eclipse_slash.png",
		"type": "attack",
		"cost": 2,
		"desc": "失去 2 点生命，造成 9 点伤害 2 次，施加 1 层虚弱。",
		"self_damage": 2,
		"damage": 9,
		"hits": 2,
		"weak": 1,
		"rarity": "rare",
		"min_act": 2
	},
	"inner_demon": {
		"name": "心魔杂念",
		"type": "curse",
		"cost": 0,
		"desc": "无法打出。占据手牌，回合结束时进入弃牌堆。",
		"unplayable": true,
		"rarity": "curse"
	}
}

const ENCOUNTERS := [
	{
		"name": "野狼妖影",
		"art": ENEMY_WOLF_ART_PATH,
		"max_hp": 34,
		"moves": [
			{"intent": "撕咬", "damage": 7},
			{"intent": "蓄势", "block": 5, "flaw": true},
			{"intent": "连扑", "damage": 4, "hits": 2}
		]
	},
	{
		"name": "落魄散修",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 42,
		"moves": [
			{"intent": "符箓轰击", "damage": 9},
			{"intent": "护身法器", "block": 8, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"},
			{"intent": "偷袭", "damage": 6, "hits": 2, "player_weak": 1}
		]
	},
	{
		"name": "黑煞教执事",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 58,
		"moves": [
			{"intent": "阴雷", "damage": 12, "player_weak": 1},
			{"intent": "黑雾护体", "block": 10, "flaw": true, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"},
			{"intent": "连环魂刺", "damage": 5, "hits": 3}
		]
	},
	{
		"name": "竹林傀儡",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 40,
		"moves": [
			{"intent": "木拳横扫", "damage": 8},
			{"intent": "符木硬壳", "block": 9, "flaw": true},
			{"intent": "裂符反震", "damage": 5, "player_weak": 1}
		]
	},
	{
		"name": "雾竹巡山妖",
		"art": ENEMY_WOLF_ART_PATH,
		"max_hp": 38,
		"moves": [
			{"intent": "雾中突袭", "damage": 5, "hits": 2},
			{"intent": "竹雾护身", "block": 8, "flaw": true},
			{"intent": "迷踪低吼", "damage": 7, "player_weak": 1}
		]
	}
]

const SECOND_ACT_ENCOUNTERS := [
	{
		"name": "玄阴灯侍",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 54,
		"moves": [
			{"intent": "灯火蚀魂", "damage": 10, "player_weak": 1},
			{"intent": "护灯结阵", "block": 12, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"},
			{"intent": "幽火连弹", "damage": 5, "hits": 3}
		]
	},
	{
		"name": "阴煞游魂",
		"art": ENEMY_WOLF_ART_PATH,
		"max_hp": 48,
		"moves": [
			{"intent": "穿心寒意", "damage": 11},
			{"intent": "聚阴成壳", "block": 14, "flaw": true},
			{"intent": "乱魂低语", "damage": 7, "player_weak": 1, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	},
	{
		"name": "黑坛巡夜使",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 64,
		"moves": [
			{"intent": "巡夜铁令", "damage": 13},
			{"intent": "黑坛护令", "block": 13, "flaw": true, "player_weak": 1},
			{"intent": "锁魂链", "damage": 6, "hits": 2, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"}
		]
	},
	{
		"name": "魂灯祭徒",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 58,
		"moves": [
			{"intent": "祭灯灼影", "damage": 12},
			{"intent": "添油护灯", "block": 15, "flaw": true},
			{"intent": "灯芯入梦", "damage": 8, "player_weak": 1, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"}
		]
	},
	{
		"name": "玄阴引路鬼",
		"art": ENEMY_WOLF_ART_PATH,
		"image2_target_art": "res://assets/enemy_xuanyin_guide.png",
		"max_hp": 60,
		"moves": [
			{"intent": "引魂冷爪", "damage": 9, "hits": 2},
			{"intent": "鬼灯遮路", "block": 16, "flaw": true, "player_weak": 1},
			{"intent": "错路回声", "damage": 10, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	}
]

const THIRD_ACT_ENCOUNTERS := [
	{
		"name": "雷云劫影",
		"art": ENEMY_WOLF_ART_PATH,
		"max_hp": 72,
		"moves": [
			{"intent": "劫雷掠影", "damage": 8, "hits": 2},
			{"intent": "云罡护身", "block": 18, "flaw": true},
			{"intent": "雷息乱脉", "damage": 14, "player_weak": 1}
		]
	},
	{
		"name": "心魔雷相",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 68,
		"moves": [
			{"intent": "照见杂念", "damage": 12, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"},
			{"intent": "雷相凝形", "block": 16, "player_weak": 1},
			{"intent": "三问道心", "damage": 6, "hits": 3}
		]
	},
	{
		"name": "天雷执符使",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 76,
		"moves": [
			{"intent": "执符召雷", "damage": 16},
			{"intent": "封脉雷印", "damage": 10, "player_weak": 2},
			{"intent": "雷符护坛", "block": 20, "flaw": true, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"}
		]
	},
	{
		"name": "雷纹执念",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 74,
		"moves": [
			{"intent": "执念化雷", "damage": 15},
			{"intent": "雷纹锁脉", "damage": 9, "player_weak": 1},
			{"intent": "旧念缠身", "block": 18, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	},
	{
		"name": "云雷铸兵",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 80,
		"moves": [
			{"intent": "雷锤试锋", "damage": 17},
			{"intent": "云铁成甲", "block": 24, "flaw": true},
			{"intent": "震脉余响", "damage": 8, "hits": 2, "player_weak": 1}
		]
	}
]

const BOSS_ENCOUNTER := {
	"name": "黑煞教执事",
	"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
	"max_hp": 70,
	"moves": [
		{"intent": "阴雷", "damage": 13, "player_weak": 1},
		{"intent": "黑雾护体", "block": 12, "flaw": true},
		{"intent": "连环魂刺", "damage": 5, "hits": 3},
		{"intent": "摄魂幡", "damage": 9, "block": 7, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
	]
}

const SECOND_BOSS_ENCOUNTER := {
	"name": "玄阴坛主",
	"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
	"max_hp": 92,
	"moves": [
		{"intent": "玄阴掌", "damage": 15, "player_weak": 1},
		{"intent": "祭坛引煞", "block": 16, "flaw": true, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"},
		{"intent": "魂灯齐燃", "damage": 7, "hits": 3, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"},
		{"intent": "阴火反噬", "damage": 12, "block": 10, "player_weak": 1}
	]
}

const THIRD_BOSS_ENCOUNTER := {
	"name": "筑基雷劫",
	"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
	"max_hp": 118,
	"moves": [
		{"intent": "一九雷落", "damage": 18, "player_weak": 1},
		{"intent": "雷云压顶", "block": 22, "flaw": true, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"},
		{"intent": "三雷连诛", "damage": 8, "hits": 3},
		{"intent": "问心天罚", "damage": 14, "block": 12, "player_weak": 1, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"}
	]
}

const ACT_LIBRARY := [
	{
		"name": "青岚谷",
		"boss_title": "黑煞教据点",
		"boss_desc": "第一幕 Boss。破阵后会深入玄阴山道。",
		"clear_log": "黑煞据点已破，山后玄阴祭坛露出真正的阴影。"
	},
	{
		"name": "玄阴山道",
		"boss_title": "玄阴祭坛",
		"boss_desc": "第二幕 Boss。破坛后会引来真正的筑基雷劫。",
		"clear_log": "玄阴祭坛崩塌，云端雷光照亮最后一道门槛。"
	},
	{
		"name": "筑基雷云",
		"boss_title": "筑基雷劫",
		"boss_desc": "终局遭遇。渡过雷劫，才算真正筑基。",
		"clear_log": "雷劫散去，青岚谷阴煞尽灭。"
	}
]

const ELITE_ENCOUNTERS := [
	{
		"name": "黑煞护法",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 66,
		"moves": [
			{"intent": "压阵阴雷", "damage": 14, "player_weak": 1},
			{"intent": "煞雾结界", "block": 14, "flaw": true, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"},
			{"intent": "三魂刺", "damage": 6, "hits": 3}
		]
	},
	{
		"name": "散修符师",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 60,
		"moves": [
			{"intent": "连珠符火", "damage": 7, "hits": 2},
			{"intent": "镇魂黄符", "damage": 8, "player_weak": 1, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"},
			{"intent": "法器护身", "block": 16}
		]
	},
	{
		"name": "洞府守禁残影",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 64,
		"moves": [
			{"intent": "禁纹灵刺", "damage": 8, "hits": 2},
			{"intent": "回光禁制", "block": 18, "flaw": true},
			{"intent": "封心残响", "damage": 10, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	}
]

const SECOND_ACT_ELITE_ENCOUNTERS := [
	{
		"name": "玄阴坛护灯长老",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 78,
		"moves": [
			{"intent": "长灯镇魂", "damage": 16, "player_weak": 1},
			{"intent": "三灯结界", "block": 18, "flaw": true, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"},
			{"intent": "魂火分燃", "damage": 6, "hits": 4}
		]
	},
	{
		"name": "山道煞兽",
		"art": ENEMY_WOLF_ART_PATH,
		"max_hp": 74,
		"moves": [
			{"intent": "裂骨扑杀", "damage": 9, "hits": 2},
			{"intent": "吞煞回护", "block": 20, "flaw": true},
			{"intent": "煞吼乱神", "damage": 12, "player_weak": 2}
		]
	},
	{
		"name": "玄阴炼符师",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 82,
		"moves": [
			{"intent": "阴符连爆", "damage": 7, "hits": 3},
			{"intent": "符甲压身", "block": 22, "flaw": true, "player_weak": 1},
			{"intent": "炼魂成墨", "damage": 13, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"}
		]
	}
]

const THIRD_ACT_ELITE_ENCOUNTERS := [
	{
		"name": "雷劫护法残魂",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 92,
		"moves": [
			{"intent": "残魂引雷", "damage": 18, "player_weak": 1},
			{"intent": "雷甲未散", "block": 24, "flaw": true},
			{"intent": "魂雷四裂", "damage": 7, "hits": 4, "add_status": "inner_demon", "status_amount": 1, "status_to": "discard"}
		]
	},
	{
		"name": "劫火化形兽",
		"art": ENEMY_WOLF_ART_PATH,
		"max_hp": 88,
		"moves": [
			{"intent": "焚骨扑杀", "damage": 10, "hits": 2},
			{"intent": "劫火成壳", "block": 22, "flaw": true, "player_weak": 1},
			{"intent": "吞火反噬", "damage": 17, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	},
	{
		"name": "问心劫使",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"max_hp": 96,
		"moves": [
			{"intent": "问心雷笔", "damage": 19, "player_weak": 1},
			{"intent": "雷书护命", "block": 26, "flaw": true},
			{"intent": "三劫同落", "damage": 8, "hits": 3, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	},
	{
		"name": "雷火判官",
		"art": ENEMY_ROGUE_CULTIVATOR_ART_PATH,
		"max_hp": 100,
		"moves": [
			{"intent": "判火连书", "damage": 9, "hits": 3},
			{"intent": "雷律镇身", "block": 28, "flaw": true, "player_weak": 1},
			{"intent": "罪符入梦", "damage": 16, "add_status": "inner_demon", "status_amount": 2, "status_to": "discard"}
		]
	},
	{
		"name": "雷池守阵者",
		"art": ENEMY_BLACK_CULT_DEACON_ART_PATH,
		"image2_target_art": "res://assets/enemy_thunder_pool_guardian.png",
		"max_hp": 104,
		"moves": [
			{"intent": "阵雷齐鸣", "damage": 8, "hits": 4},
			{"intent": "雷池结界", "block": 30, "flaw": true, "player_weak": 1},
			{"intent": "洗魂雷纹", "damage": 18, "add_status": "inner_demon", "status_amount": 1, "status_to": "draw"}
		]
	}
]

const MAP_NODE_LIBRARY := [
	{"type": "battle", "title": "妖影伏击", "desc": "进入一场普通战斗。胜利后获得灵石与术法选择。"},
	{"type": "elite", "title": "煞气重地", "desc": "挑战一场精英战。危险更高，胜利后更容易获得法宝。"},
	{"type": "event", "title": "废弃洞府", "desc": "冒险搜寻遗留机缘，可能获得牌、灵石或伤势。"},
	{"type": "herb_event", "title": "灵草药圃", "desc": "在月下药圃采集灵草，恢复、炼药或冒险深入。"},
	{"type": "spirit_rift", "title": "灵脉裂隙", "desc": "从紊乱灵脉中汲取灵气、灵石或术法，但会付出代价。"},
	{"type": "secret_realm", "title": "月隐秘境", "desc": "短暂开启的古旧秘境，可换取悟道、月井恢复或遗卷术法。"},
	{"type": "duel_trial", "title": "青石试剑台", "desc": "立下下一战试剑约束，提高敌人强度，胜利后获得额外奖励。"},
	{"type": "market", "title": "山脚坊市", "desc": "花费灵石购买低阶术法、法宝或应急小物。"},
	{"type": "rest", "title": "灵泉调息", "desc": "选择恢复、精研或整备消耗品，短暂稳住道心。"},
	{"type": "training", "title": "竹林参悟", "desc": "精简牌组或提升灵气上限。"}
]

const SECOND_ACT_MAP_NODE_LIBRARY := [
	{"type": "battle", "title": "阴魂拦道", "desc": "进入一场第二幕普通战斗。敌人更擅长虚弱与心魔污染。"},
	{"type": "elite", "title": "玄阴重地", "desc": "挑战一场第二幕精英战。危险更高，胜利后更容易获得法宝与悟道。"},
	{"type": "soul_shrine", "title": "镇魂古龛", "desc": "在残破古龛前镇压心魔、冒险悟道或夺取法器。"},
	{"type": "dark_forge", "title": "阴火残炉", "desc": "借残炉重淬术法、铸成阴雷，或取走炉炭换灵石。"},
	{"type": "duel_trial", "title": "断碑试剑台", "desc": "立下下一战试剑约束，提高敌人强度，胜利后获得额外奖励。"},
	{"type": "spirit_rift", "title": "玄阴灵脉", "desc": "从阴冷灵脉中夺取成长，可能换来虚弱或伤势。"},
	{"type": "secret_realm", "title": "阴月秘境", "desc": "玄阴山道偶然现出的秘境，可取悟道、月井或遗卷。"},
	{"type": "market", "title": "山道鬼市", "desc": "花费灵石购买术法、法宝或应急小物。"},
	{"type": "rest", "title": "寒泉调息", "desc": "选择恢复、精研或整备消耗品，短暂压住玄阴煞气。"},
	{"type": "training", "title": "断碑参悟", "desc": "精简牌组或提升灵气上限。"}
]

const THIRD_ACT_MAP_NODE_LIBRARY := [
	{"type": "battle", "title": "雷云压路", "desc": "进入一场终幕普通战斗。敌人会用高伤害与虚弱考验牌组厚度。"},
	{"type": "elite", "title": "劫火重地", "desc": "挑战一场终幕精英战。胜利后可获得高价值奖励。"},
	{"type": "thunder_pool", "title": "洗雷池", "desc": "借雷池淬体、引雷悟剑，或镇压心魔。"},
	{"type": "dark_forge", "title": "雷火残炉", "desc": "借雷火重淬术法、铸成阴雷，或取走炉炭换灵石。"},
	{"type": "duel_trial", "title": "雷痕试剑台", "desc": "立下下一战试剑约束，提高敌人强度，胜利后获得额外奖励。"},
	{"type": "spirit_rift", "title": "雷纹灵脉", "desc": "从雷纹灵脉中压榨最后成长，回报更高也更危险。"},
	{"type": "secret_realm", "title": "雷月秘境", "desc": "雷云中短暂显形的上古秘境，可在终幕前换取强力成长。"},
	{"type": "market", "title": "云端散市", "desc": "最后一批散修在雷云下交换术法、法宝和应急小物。"},
	{"type": "rest", "title": "避雷石台", "desc": "选择恢复、精研或整备消耗品，稳住即将破境的灵台。"},
	{"type": "training", "title": "问心石阶", "desc": "精简牌组、提升灵气上限或精研关键术法。"}
]

const TREASURE_LIBRARY := {
	"moon_jade": {
		"name": "月华玉佩",
		"desc": "每场战斗第 1 回合额外获得 1 点灵气。",
		"tone": "training",
		"first_turn_qi": 1
	},
	"wolf_tooth": {
		"name": "狼牙剑坠",
		"desc": "每场战斗第一张术法牌额外造成 3 点伤害。",
		"tone": "battle",
		"first_attack_damage": 3
	},
	"bamboo_slip": {
		"name": "青竹残简",
		"desc": "每场战斗第一张法门牌额外抽 1 张牌。",
		"tone": "rest",
		"first_skill_draw": 1
	},
	"spirit_lamp": {
		"name": "聚灵灯",
		"desc": "战斗胜利后恢复 4 点生命。",
		"tone": "market",
		"battle_heal": 4
	},
	"market_token": {
		"name": "坊市木牌",
		"desc": "在坊市购买术法时少花 3 灵石。",
		"tone": "event",
		"market_discount": 3
	},
	"paper_umbrella": {
		"name": "纸伞护符",
		"desc": "每场战斗第 1 回合获得 5 点护盾。",
		"tone": "rest",
		"start_block": 5
	},
	"medicine_satchel": {
		"name": "药囊",
		"desc": "战斗胜利后获得 1 件随机消耗品。",
		"tone": "market",
		"battle_reward_consumable": 1
	},
	"ember_bead": {
		"name": "余烬珠",
		"desc": "燃烧每回合额外造成 1 点威力。",
		"tone": "battle",
		"burn_damage": 1
	},
	"jade_abacus": {
		"name": "灵玉算盘",
		"desc": "战斗胜利后额外获得 4 灵石。",
		"tone": "event",
		"battle_stones": 4
	},
	"cloud_seal": {
		"name": "行云印",
		"desc": "获得时灵气上限 +1。",
		"tone": "training",
		"max_qi": 1
	},
	"wind_chime": {
		"name": "听风铃",
		"desc": "每场战斗第 1 回合额外抽 1 张牌。",
		"tone": "event",
		"first_turn_draw": 1
	},
	"cold_jade": {
		"name": "寒玉扣",
		"desc": "每场战斗开局驱散 1 层自身虚弱。",
		"tone": "rest",
		"start_cleanse_weak": 1
	},
	"blood_seal": {
		"name": "血纹护符",
		"desc": "每次牌造成自身反噬时，获得 4 点护盾。",
		"tone": "battle",
		"self_damage_block": 4
	},
	"traveling_gourd": {
		"name": "行脚葫芦",
		"desc": "战斗胜利后恢复 2 点生命，并获得 2 灵石。",
		"tone": "market",
		"battle_heal": 2,
		"battle_stones": 2
	},
	"paper_crane": {
		"name": "纸鹤符",
		"desc": "每场战斗第一次使用消耗品后抽 1 张牌。",
		"tone": "training",
		"first_consumable_draw": 1
	},
	"green_sword_tassel": {
		"name": "青锋剑穗",
		"desc": "每场战斗第 1 回合获得 2 层剑势。",
		"tone": "battle",
		"start_edge": 2
	},
	"whetstone": {
		"name": "砺剑石",
		"desc": "剑势强化攻击时，每层剑势额外提高 1 点威力。",
		"tone": "training",
		"edge_damage_bonus": 1
	},
	"hundred_pouch_cord": {
		"name": "百宝绳",
		"desc": "每场战斗第一次使用消耗品后抽 1 张牌；所有消耗品数值 +1。",
		"tone": "market",
		"first_consumable_draw": 1,
		"consumable_bonus": 1
	}
}

const CONSUMABLE_LIBRARY := {
	"mending_pill": {
		"name": "回春丹",
		"desc": "战斗中使用，恢复 12 点生命。",
		"tone": "rest",
		"heal": 12
	},
	"spirit_draught": {
		"name": "聚气散",
		"desc": "战斗中使用，本回合灵气 +2。",
		"tone": "training",
		"gain_qi": 2
	},
	"stone_skin_talisman": {
		"name": "石肤符",
		"desc": "战斗中使用，获得 10 点护盾。",
		"tone": "event",
		"block": 10
	},
	"thunder_seed": {
		"name": "阴雷子",
		"desc": "战斗中使用，对敌人造成 12 点伤害。",
		"tone": "battle",
		"damage": 12
	},
	"clarity_powder": {
		"name": "清神粉",
		"desc": "战斗中使用，驱散自身 2 层虚弱并抽 1 张牌。",
		"tone": "market",
		"cleanse_player_weak": 2,
		"draw": 1
	},
	"edge_talisman": {
		"name": "藏锋符",
		"desc": "战斗中使用，获得 3 层剑势。",
		"tone": "battle",
		"gain_edge": 3
	}
}

const INSIGHT_LIBRARY := {
	"open_meridians": {
		"name": "开脉小成",
		"desc": "立即灵气上限 +1。",
		"tone": "training",
		"max_qi": 1
	},
	"tempered_body": {
		"name": "淬体稳息",
		"desc": "生命上限 +8，并恢复 8 点生命。",
		"tone": "rest",
		"max_hp": 8,
		"heal": 8
	},
	"wind_sense": {
		"name": "听风辨息",
		"desc": "每场战斗第 1 回合额外抽 1 张牌。",
		"tone": "event",
		"first_turn_draw": 1
	},
	"guarded_mind": {
		"name": "守一心法",
		"desc": "每场战斗开局获得 4 点护盾，并驱散 1 层自身虚弱。",
		"tone": "market",
		"start_block": 4,
		"start_cleanse_weak": 1
	},
	"talisman_hand": {
		"name": "符手熟稔",
		"desc": "获得时随机取得 1 件消耗品；之后所有消耗品数值 +2。",
		"tone": "battle",
		"gain_consumable": 1,
		"consumable_bonus": 2
	},
	"hidden_edge_breath": {
		"name": "藏锋听息",
		"desc": "每场战斗第 1 回合获得 1 层剑势；每场战斗第一张法门牌额外获得 1 层剑势。",
		"tone": "battle",
		"start_edge": 1,
		"first_skill_edge": 1
	},
	"mirror_mind": {
		"name": "明镜照魔",
		"desc": "每场战斗第 1 回合开始时净除 1 张心魔杂念。",
		"tone": "event",
		"start_cleanse_curse": 1
	}
}

const BREAKTHROUGH_LIBRARY := {
	"sword_heart": {
		"name": "剑心初明",
		"desc": "之后所有攻击牌每段伤害 +1。",
		"tone": "battle",
		"attack_damage": 1
	},
	"ember_meridian": {
		"name": "符火入脉",
		"desc": "之后所有燃烧牌额外施加 1 层燃烧。",
		"tone": "market",
		"burn_bonus": 1
	},
	"jade_foundation": {
		"name": "玉骨奠基",
		"desc": "生命上限 +10，并恢复 10 点生命。",
		"tone": "rest",
		"max_hp": 10,
		"heal": 10
	},
	"open_sky_breath": {
		"name": "开天一息",
		"desc": "灵气上限 +1。",
		"tone": "training",
		"max_qi": 1
	},
	"mind_cleansing": {
		"name": "雷洗灵台",
		"desc": "移除至多 2 张心魔杂念，并获得 1 份清神粉。",
		"tone": "event",
		"cleanse_curse": 2,
		"gain_consumable": "clarity_powder"
	},
	"guarded_foundation": {
		"name": "固关守元",
		"desc": "之后每场战斗第 1 回合获得 6 点护盾。",
		"tone": "elite",
		"start_block": 6
	},
	"traveling_arsenal": {
		"name": "百炼行囊",
		"desc": "获得 2 件随机消耗品；之后所有消耗品数值 +1。",
		"tone": "market",
		"gain_consumable": 2,
		"consumable_bonus": 1
	}
}

var rng := RandomNumberGenerator.new()
var max_hp := BASE_MAX_HP
var player_hp := max_hp
var qi := 3
var max_qi := 3
var cultivation_points := 0
var victories := 0
var current_win_streak := 0
var best_win_streak := 0
var best_battles := 0
var best_run_score := 0
var achievements: Array[String] = []
var run_achievements: Array[String] = []
var unlocked_endings: Array[String] = []
var run_endings_unlocked: Array[String] = []
var completed_challenges: Array[String] = []
var run_challenges_completed: Array[String] = []
var completed_trial_mandates: Array[String] = []
var completed_interlude_oaths: Array[String] = []
var origin_records := {}
var run_history: Array[Dictionary] = []
var run_reward_awarded := false
var run_history_recorded := false
var last_cultivation_gained := 0
var shield := 0
var spirit_stones := 0
var run_seed := 0
var run_challenge_id := ""
var run_challenge_name := ""
var next_duel_trial: Dictionary = {}
var duel_trials_completed := 0
var flawless_wins := 0
var combat_hp_lost := false
var route_history: Array[String] = []
var run_marks: Array[String] = []
var interlude_oaths: Array[String] = []
var pending_interlude_oath_options: Array[String] = []
var trial_mandate_id := ""
var trial_mandate_options: Array[String] = []
var trial_mandate_progress := 0
var trial_mandate_completed := false
var active_bounty_id := ""
var active_bounty_progress := 0
var completed_bounty_count := 0
var lunar_omen_id := ""
var run_step := 0
var current_act := 0
var battles_won := 0
var combat_turn := 0
var in_title := false
var run_finished := false
var in_map := false
var in_choice := false
var pending_nodes: Array[Dictionary] = []
var choice_options: Array[Dictionary] = []
var choice_art_path := ""
var deck: Array[String] = []
var draw_pile: Array[String] = []
var discard_pile: Array[String] = []
var exhaust_pile: Array[String] = []
var hand: Array[String] = []
var encounter_index := 0
var current_is_boss := false
var current_is_elite := false
var enemy := {}
var enemy_hp := 0
var enemy_block := 0
var enemy_flawed := false
var enemy_burn := 0
var enemy_weak := 0
var player_weak := 0
var player_edge := 0
var next_combat_player_weak := 0
var enemy_move_index := 0
var in_reward := false
var reward_cards: Array[String] = []
var reward_treasures: Array[String] = []
var reward_consumables: Array[String] = []
var reward_insights: Array[String] = []
var reward_breakthroughs: Array[String] = []
var treasures: Array[String] = []
var consumables: Array[String] = []
var insights: Array[String] = []
var breakthroughs: Array[String] = []
var first_attack_played := false
var first_skill_played := false
var first_consumable_used := false
var log_lines: Array[String] = []
var card_back_texture: Texture2D
var texture_cache := {}
var active_pile_view := ""
var active_title_panel := ""
var selected_origin := "bamboo_sword"
var selected_difficulty := "normal"
var seed_override_text := ""
var show_decision_hints := true
var show_extended_log := false
var use_compact_hand := false

var scene_backdrop: TextureRect
var scene_scrim: ColorRect
var root_box: VBoxContainer
var status_shell: PanelContainer
var top_bar: Label
var status_bar: Label
var treasure_label: Label
var status_chip_box: HFlowContainer
var status_chip_labels := {}
var coach_tip_label: Label
var battlefield: HBoxContainer
var enemy_panel: PanelContainer
var enemy_art: TextureRect
var enemy_label: Label
var intent_label: Label
var intent_icon: TextureRect
var enemy_advice_label: Label
var player_hp_bar: ProgressBar
var enemy_hp_bar: ProgressBar
var pile_label: Label
var pile_panel: PanelContainer
var pile_buttons: GridContainer
var deck_back: TextureRect
var log_label: RichTextLabel
var pile_view_scrim: ColorRect
var pile_view_panel: PanelContainer
var pile_view_title: Label
var pile_view_art: TextureRect
var pile_view_list: RichTextLabel
var hand_box: HFlowContainer
var controls_box: HFlowContainer
var reward_context_label: Label
var reward_scroll: ScrollContainer
var reward_box: GridContainer
var map_context_label: Label
var map_box: HFlowContainer
var choice_scene_art: TextureRect
var mode_art_watermark: TextureRect
var choice_box: HFlowContainer
var title_box: VBoxContainer
var title_detail_box: VBoxContainer
var summary_box: VBoxContainer


func _ready() -> void:
	rng.randomize()
	_load_meta_progress()
	card_back_texture = _load_texture_from_path(CARD_BACK_PATH)
	_build_ui()
	get_viewport().size_changed.connect(_apply_responsive_layout)
	_apply_responsive_layout()
	_show_title()


func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return
	var key_event := event as InputEventKey
	if not key_event.pressed or key_event.echo:
		return
	var focused := get_viewport().gui_get_focus_owner()
	if focused is LineEdit or focused is TextEdit:
		return
	if _handle_shortcut_key(key_event.keycode):
		get_viewport().set_input_as_handled()


func _handle_shortcut_key(keycode: int) -> bool:
	match keycode:
		KEY_ESCAPE:
			if pile_view_panel != null and pile_view_panel.visible:
				_close_pile_view()
				return true
			if in_title and not active_title_panel.is_empty():
				_show_title()
				return true
			if not in_title and not run_finished:
				if _is_in_combat():
					_save_run_snapshot("combat")
				_show_title()
				return true
		KEY_ENTER, KEY_KP_ENTER:
			if in_title:
				_start_normal_run()
				return true
		KEY_P:
			if in_title:
				_start_quick_battle()
				return true
		KEY_SPACE:
			if _can_end_turn():
				_end_turn()
				return true
		KEY_J:
			if in_title:
				_show_title_detail("journal")
			elif not run_finished:
				_show_journal_view()
			else:
				return false
			return true
		KEY_G:
			if in_title:
				_show_title_detail("guide")
			elif not run_finished:
				_show_guide_view()
			else:
				return false
			return true
		KEY_K:
			if in_title:
				_show_title_detail("rules")
			elif not run_finished:
				_show_keywords_view()
			else:
				return false
			return true
		KEY_D:
			if not in_title and not run_finished:
				_show_pile_view("deck")
				return true
		KEY_L:
			if not in_title and not run_finished:
				_show_pile_view("log")
				return true
		KEY_H:
			_toggle_decision_hints()
			return true
		KEY_Q, KEY_W, KEY_E, KEY_R:
			if _try_use_consumable_shortcut(keycode):
				return true
		KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9:
			var shortcut_index := _number_shortcut_index(keycode)
			if _try_play_card_shortcut(shortcut_index):
				return true
			if _try_non_combat_number_shortcut(shortcut_index):
				return true
	return false


func _is_in_combat() -> bool:
	return not in_title and not run_finished and not in_reward and not in_map and not in_choice and not enemy.is_empty()


func _can_end_turn() -> bool:
	return _is_in_combat()


func _try_play_card_shortcut(hand_index: int) -> bool:
	if in_title or run_finished or in_reward or in_map or in_choice:
		return false
	if hand_index < 0 or hand_index >= hand.size():
		return false
	var card := _card_data(hand[hand_index])
	if card.get("unplayable", false):
		return false
	if qi < int(card.get("cost", 0)):
		return false
	_play_card(hand_index)
	return true


func _try_use_consumable_shortcut(keycode: int) -> bool:
	if not _is_in_combat():
		return false
	var keys := _consumable_shortcut_keys()
	var index := keys.find(keycode)
	if index < 0:
		return false
	var options := _combat_consumable_options()
	if index >= options.size():
		return false
	_use_consumable(options[index])
	return true


func _try_non_combat_number_shortcut(index: int) -> bool:
	if in_title or run_finished or index < 0:
		return false
	if in_choice:
		if index >= choice_options.size():
			return false
		var option := choice_options[index]
		if bool(option.get("disabled", false)):
			return false
		_apply_choice(option)
		return true
	if in_map:
		if run_step >= RUN_STEPS_TO_BOSS:
			if index == 0:
				_start_encounter(true, false)
				return true
			return false
		if index >= pending_nodes.size():
			return false
		_resolve_map_node(pending_nodes[index])
		return true
	if in_reward:
		var options := _reward_shortcut_options()
		if index >= options.size():
			return false
		_choose_reward_shortcut(options[index])
		return true
	return false


func _build_ui() -> void:
	var ui_theme := Theme.new()
	ui_theme.default_font = UI_FONT
	ui_theme.default_font_size = 16
	theme = ui_theme

	scene_backdrop = TextureRect.new()
	scene_backdrop.texture = _load_texture_from_path("res://assets/enemy_wolf_shadow.png")
	scene_backdrop.set_anchors_preset(Control.PRESET_FULL_RECT)
	scene_backdrop.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	scene_backdrop.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	scene_backdrop.modulate = Color(0.42, 0.56, 0.58, 0.34)
	var backdrop_material := ShaderMaterial.new()
	backdrop_material.shader = ATMOSPHERIC_BACKDROP_SHADER
	scene_backdrop.material = backdrop_material
	scene_backdrop.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(scene_backdrop)

	scene_scrim = ColorRect.new()
	scene_scrim.color = Color(0.012, 0.026, 0.030, 0.78)
	scene_scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scene_scrim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(scene_scrim)

	mode_art_watermark = TextureRect.new()
	mode_art_watermark.texture = card_back_texture
	mode_art_watermark.set_anchors_preset(Control.PRESET_CENTER_RIGHT)
	mode_art_watermark.position = Vector2(-230, -255)
	mode_art_watermark.size = Vector2(210, 315)
	mode_art_watermark.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	mode_art_watermark.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	mode_art_watermark.modulate = Color(0.52, 0.70, 0.62, 0.075)
	mode_art_watermark.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(mode_art_watermark)

	root_box = VBoxContainer.new()
	root_box.set_anchors_preset(Control.PRESET_FULL_RECT)
	root_box.add_theme_constant_override("separation", 8)
	root_box.offset_left = 24
	root_box.offset_top = 18
	root_box.offset_right = -24
	root_box.offset_bottom = -18
	add_child(root_box)

	status_shell = PanelContainer.new()
	status_shell.add_theme_stylebox_override("panel", QinglanVisuals.textured_panel(PANEL_TEXTURE_PATH))
	root_box.add_child(status_shell)

	var status_stack := VBoxContainer.new()
	status_stack.add_theme_constant_override("separation", 4)
	status_shell.add_child(status_stack)

	top_bar = Label.new()
	top_bar.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	top_bar.add_theme_font_size_override("font_size", 17)
	top_bar.add_theme_color_override("font_color", COLOR_TEXT)
	top_bar.add_theme_stylebox_override("normal", _panel_style(Color(0.06, 0.10, 0.085, 0.54), Color(0.24, 0.39, 0.32, 0.7), 3, 0))
	status_stack.add_child(top_bar)

	status_bar = Label.new()
	status_bar.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status_bar.add_theme_font_size_override("font_size", 1)
	status_bar.add_theme_color_override("font_color", Color(0.82, 0.91, 0.84))
	status_bar.visible = false
	status_stack.add_child(status_bar)

	status_chip_box = HFlowContainer.new()
	status_chip_box.alignment = FlowContainer.ALIGNMENT_BEGIN
	status_chip_box.add_theme_constant_override("h_separation", 7)
	status_chip_box.add_theme_constant_override("v_separation", 5)
	status_stack.add_child(status_chip_box)
	_add_status_chip("hp", "生命", "res://assets/ui/icons/hp.png", Color(0.69, 0.28, 0.22))
	_add_status_chip("qi", "灵气", "res://assets/ui/icons/qi.png", Color(0.31, 0.67, 0.62))
	_add_status_chip("shield", "护盾", "res://assets/ui/icons/shield.png", Color(0.41, 0.64, 0.55))
	_add_status_chip("edge", "剑势", "res://assets/ui/icons/edge.png", Color(0.80, 0.61, 0.25))
	_add_status_chip("stones", "灵石", "res://assets/ui/icons/stones.png", Color(0.54, 0.72, 0.66))
	_add_status_chip("items", "小物", "res://assets/ui/icons/items.png", Color(0.64, 0.52, 0.30))

	treasure_label = Label.new()
	treasure_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	treasure_label.add_theme_font_size_override("font_size", 14)
	treasure_label.add_theme_color_override("font_color", Color(0.79, 0.72, 0.49))
	status_stack.add_child(treasure_label)

	coach_tip_label = Label.new()
	coach_tip_label.visible = false
	coach_tip_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	coach_tip_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	coach_tip_label.custom_minimum_size = Vector2(820, 0)
	coach_tip_label.add_theme_font_size_override("font_size", 15)
	coach_tip_label.add_theme_color_override("font_color", Color(0.96, 0.80, 0.42))
	coach_tip_label.add_theme_stylebox_override("normal", _panel_style(Color(0.12, 0.075, 0.025, 0.94), Color(0.70, 0.47, 0.15), 4, 1))
	root_box.add_child(coach_tip_label)

	player_hp_bar = ProgressBar.new()
	player_hp_bar.custom_minimum_size = Vector2(0, 14)
	player_hp_bar.show_percentage = false
	player_hp_bar.add_theme_stylebox_override("background", _panel_style(Color(0.025, 0.04, 0.04, 0.90), Color(0.18, 0.28, 0.25), 2, 1))
	player_hp_bar.add_theme_stylebox_override("fill", _panel_style(Color(0.22, 0.64, 0.45, 0.98), Color(0.53, 0.86, 0.65), 2, 0))
	root_box.add_child(player_hp_bar)

	battlefield = HBoxContainer.new()
	battlefield.add_theme_constant_override("separation", 10)
	battlefield.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root_box.add_child(battlefield)

	enemy_panel = PanelContainer.new()
	enemy_panel.custom_minimum_size = Vector2(0, 252)
	enemy_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	enemy_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.012, 0.030, 0.031, 0.78), Color(0.62, 0.45, 0.19, 0.88), 5, 1))
	battlefield.add_child(enemy_panel)

	var enemy_box := HBoxContainer.new()
	enemy_box.add_theme_constant_override("separation", 16)
	enemy_panel.add_child(enemy_box)

	enemy_art = TextureRect.new()
	enemy_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	enemy_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	enemy_art.custom_minimum_size = Vector2(300, 252)
	enemy_art.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	enemy_art.size_flags_vertical = Control.SIZE_EXPAND_FILL
	enemy_box.add_child(enemy_art)

	var enemy_info_shell := PanelContainer.new()
	enemy_info_shell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	enemy_info_shell.add_theme_stylebox_override("panel", _panel_style(Color(0.028, 0.060, 0.052, 0.94), Color(0.36, 0.53, 0.39), 4, 1))
	enemy_box.add_child(enemy_info_shell)

	var enemy_info := VBoxContainer.new()
	enemy_info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	enemy_info.alignment = BoxContainer.ALIGNMENT_CENTER
	enemy_info.add_theme_constant_override("separation", 8)
	enemy_info_shell.add_child(enemy_info)

	enemy_label = Label.new()
	enemy_label.add_theme_font_size_override("font_size", 27)
	enemy_label.add_theme_color_override("font_color", COLOR_TEXT)
	enemy_info.add_child(enemy_label)

	enemy_hp_bar = ProgressBar.new()
	enemy_hp_bar.custom_minimum_size = Vector2(0, 16)
	enemy_hp_bar.show_percentage = false
	enemy_hp_bar.add_theme_stylebox_override("background", _panel_style(Color(0.04, 0.03, 0.03, 0.92), Color(0.28, 0.15, 0.12), 2, 1))
	enemy_hp_bar.add_theme_stylebox_override("fill", _panel_style(Color(0.63, 0.18, 0.15, 0.96), Color(0.91, 0.43, 0.25), 2, 0))
	enemy_info.add_child(enemy_hp_bar)

	var intent_shell := PanelContainer.new()
	intent_shell.add_theme_stylebox_override("panel", _panel_style(Color(0.17, 0.065, 0.025, 0.88), Color(0.68, 0.31, 0.12), 4, 1))
	enemy_info.add_child(intent_shell)

	var intent_row := HBoxContainer.new()
	intent_row.add_theme_constant_override("separation", 9)
	intent_shell.add_child(intent_row)

	intent_icon = TextureRect.new()
	intent_icon.custom_minimum_size = Vector2(34, 34)
	intent_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	intent_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	intent_icon.modulate = Color(0.96, 0.86, 0.64)
	intent_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	intent_row.add_child(intent_icon)

	intent_label = Label.new()
	intent_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	intent_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	intent_label.add_theme_font_size_override("font_size", 19)
	intent_label.add_theme_color_override("font_color", Color(0.98, 0.68, 0.30))
	intent_row.add_child(intent_label)

	enemy_advice_label = Label.new()
	enemy_advice_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	enemy_advice_label.add_theme_font_size_override("font_size", 15)
	enemy_advice_label.add_theme_color_override("font_color", Color(0.69, 0.82, 0.73))
	enemy_info.add_child(enemy_advice_label)

	pile_panel = PanelContainer.new()
	pile_panel.custom_minimum_size = Vector2(184, 252)
	pile_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.028, 0.070, 0.064, 0.97), COLOR_JADE_EDGE, 5, 2))
	battlefield.add_child(pile_panel)

	var pile_box := VBoxContainer.new()
	pile_box.alignment = BoxContainer.ALIGNMENT_CENTER
	pile_box.add_theme_constant_override("separation", 8)
	pile_panel.add_child(pile_box)

	deck_back = TextureRect.new()
	deck_back.texture = card_back_texture
	deck_back.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	deck_back.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	deck_back.custom_minimum_size = Vector2(92, 138)
	pile_box.add_child(deck_back)

	pile_label = Label.new()
	pile_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pile_label.add_theme_font_size_override("font_size", 16)
	pile_label.add_theme_color_override("font_color", COLOR_TEXT)
	pile_box.add_child(pile_label)

	pile_buttons = GridContainer.new()
	pile_buttons.columns = 2
	pile_buttons.add_theme_constant_override("h_separation", 6)
	pile_buttons.add_theme_constant_override("v_separation", 6)
	pile_box.add_child(pile_buttons)

	var deck_button := _make_small_pile_button("牌组", "查看完整牌组和构筑研判。")
	deck_button.pressed.connect(func() -> void: _show_pile_view("deck"))
	pile_buttons.add_child(deck_button)

	var draw_button := _make_small_pile_button("抽牌", "查看当前抽牌堆。")
	draw_button.pressed.connect(func() -> void: _show_pile_view("draw"))
	pile_buttons.add_child(draw_button)

	var discard_button := _make_small_pile_button("弃牌", "查看弃牌堆。")
	discard_button.pressed.connect(func() -> void: _show_pile_view("discard"))
	pile_buttons.add_child(discard_button)

	var exhaust_button := _make_small_pile_button("消耗", "查看本场战斗已经消耗的牌。")
	exhaust_button.pressed.connect(func() -> void: _show_pile_view("exhaust"))
	pile_buttons.add_child(exhaust_button)

	var treasures_button := _make_small_pile_button("法宝", "查看当前法宝效果。")
	treasures_button.pressed.connect(func() -> void: _show_pile_view("treasures"))
	pile_buttons.add_child(treasures_button)

	var insights_button := _make_small_pile_button("悟道", "查看当前悟道被动。")
	insights_button.pressed.connect(func() -> void: _show_pile_view("insights"))
	pile_buttons.add_child(insights_button)

	var breakthroughs_button := _make_small_pile_button("破境", "查看幕间突破效果。")
	breakthroughs_button.pressed.connect(func() -> void: _show_pile_view("breakthroughs"))
	pile_buttons.add_child(breakthroughs_button)

	var items_button := _make_small_pile_button("物品", "查看持有消耗品。")
	items_button.pressed.connect(func() -> void: _show_pile_view("items"))
	pile_buttons.add_child(items_button)

	var log_button := _make_small_pile_button("日志", "查看最近 40 条完整战斗与事件记录。")
	log_button.pressed.connect(func() -> void: _show_pile_view("log"))
	pile_buttons.add_child(log_button)

	log_label = RichTextLabel.new()
	log_label.custom_minimum_size = Vector2(0, 116)
	log_label.bbcode_enabled = true
	log_label.fit_content = true
	log_label.add_theme_stylebox_override("normal", _panel_style(Color(0.018, 0.046, 0.043, 0.92), Color(0.24, 0.44, 0.35), 4, 1))
	root_box.add_child(log_label)

	pile_view_scrim = ColorRect.new()
	pile_view_scrim.visible = false
	pile_view_scrim.color = Color(0.0, 0.0, 0.0, 0.58)
	pile_view_scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	pile_view_scrim.z_index = 39
	pile_view_scrim.mouse_filter = Control.MOUSE_FILTER_STOP
	pile_view_scrim.gui_input.connect(func(event: InputEvent) -> void:
		if event is InputEventMouseButton and event.pressed:
			_close_pile_view()
	)
	add_child(pile_view_scrim)

	pile_view_panel = PanelContainer.new()
	pile_view_panel.visible = false
	pile_view_panel.z_index = 40
	pile_view_panel.anchor_left = 0.12
	pile_view_panel.anchor_top = 0.12
	pile_view_panel.anchor_right = 0.88
	pile_view_panel.anchor_bottom = 0.84
	pile_view_panel.add_theme_stylebox_override("panel", QinglanVisuals.textured_panel(PANEL_TEXTURE_PATH))
	add_child(pile_view_panel)

	var pile_view_box := VBoxContainer.new()
	pile_view_box.add_theme_constant_override("separation", 8)
	pile_view_panel.add_child(pile_view_box)

	var pile_view_header := HBoxContainer.new()
	pile_view_header.add_theme_constant_override("separation", 10)
	pile_view_box.add_child(pile_view_header)

	pile_view_title = Label.new()
	pile_view_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pile_view_title.add_theme_font_size_override("font_size", 18)
	pile_view_title.add_theme_color_override("font_color", COLOR_TEXT)
	pile_view_header.add_child(pile_view_title)

	var close_pile_view := _make_small_pile_button("收起", "收起当前详情面板。")
	close_pile_view.pressed.connect(_close_pile_view)
	pile_view_header.add_child(close_pile_view)

	pile_view_art = TextureRect.new()
	pile_view_art.custom_minimum_size = Vector2(0, 72)
	pile_view_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	pile_view_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	pile_view_art.modulate = Color(0.74, 0.84, 0.76, 0.72)
	pile_view_box.add_child(pile_view_art)

	pile_view_list = RichTextLabel.new()
	pile_view_list.bbcode_enabled = true
	pile_view_list.fit_content = true
	pile_view_list.custom_minimum_size = Vector2(0, 96)
	pile_view_list.add_theme_color_override("default_color", COLOR_TEXT)
	pile_view_box.add_child(pile_view_list)

	title_box = VBoxContainer.new()
	title_box.alignment = BoxContainer.ALIGNMENT_CENTER
	title_box.custom_minimum_size = Vector2(0, 360)
	title_box.add_theme_constant_override("separation", 14)
	root_box.add_child(title_box)

	summary_box = VBoxContainer.new()
	summary_box.alignment = BoxContainer.ALIGNMENT_CENTER
	summary_box.custom_minimum_size = Vector2(0, 360)
	summary_box.add_theme_constant_override("separation", 14)
	root_box.add_child(summary_box)

	hand_box = HFlowContainer.new()
	hand_box.alignment = FlowContainer.ALIGNMENT_CENTER
	hand_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hand_box.add_theme_constant_override("h_separation", 12)
	hand_box.add_theme_constant_override("v_separation", 10)
	root_box.add_child(hand_box)

	reward_context_label = Label.new()
	reward_context_label.visible = false
	reward_context_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	reward_context_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	reward_context_label.custom_minimum_size = Vector2(820, 0)
	reward_context_label.add_theme_font_size_override("font_size", 15)
	reward_context_label.add_theme_color_override("font_color", Color(0.76, 0.78, 0.66))
	root_box.add_child(reward_context_label)

	reward_scroll = ScrollContainer.new()
	reward_scroll.custom_minimum_size = Vector2(0, 252)
	reward_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	root_box.add_child(reward_scroll)

	reward_box = GridContainer.new()
	reward_box.columns = 5
	reward_box.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	reward_box.add_theme_constant_override("h_separation", 10)
	reward_box.add_theme_constant_override("v_separation", 10)
	reward_scroll.add_child(reward_box)

	map_context_label = Label.new()
	map_context_label.visible = false
	map_context_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	map_context_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	map_context_label.custom_minimum_size = Vector2(820, 0)
	map_context_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	map_context_label.add_theme_font_size_override("font_size", 15)
	map_context_label.add_theme_color_override("font_color", Color(0.72, 0.78, 0.70))
	root_box.add_child(map_context_label)

	map_box = HFlowContainer.new()
	map_box.alignment = FlowContainer.ALIGNMENT_CENTER
	map_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	map_box.add_theme_constant_override("h_separation", 10)
	map_box.add_theme_constant_override("v_separation", 10)
	root_box.add_child(map_box)

	choice_scene_art = TextureRect.new()
	choice_scene_art.visible = false
	choice_scene_art.custom_minimum_size = Vector2(820, 156)
	choice_scene_art.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	choice_scene_art.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	choice_scene_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	choice_scene_art.modulate = Color(0.82, 0.90, 0.84, 0.82)
	choice_scene_art.add_theme_stylebox_override("normal", _panel_style(Color(0.012, 0.030, 0.031, 0.92), Color(0.46, 0.61, 0.46), 5, 2))
	root_box.add_child(choice_scene_art)

	choice_box = HFlowContainer.new()
	choice_box.alignment = FlowContainer.ALIGNMENT_CENTER
	choice_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	choice_box.add_theme_constant_override("h_separation", 10)
	choice_box.add_theme_constant_override("v_separation", 10)
	root_box.add_child(choice_box)

	controls_box = HFlowContainer.new()
	controls_box.alignment = FlowContainer.ALIGNMENT_CENTER
	controls_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	controls_box.add_theme_constant_override("h_separation", 10)
	controls_box.add_theme_constant_override("v_separation", 10)
	root_box.add_child(controls_box)


func _add_status_chip(id: String, title: String, icon_path: String, accent: Color) -> void:
	var chip := PanelContainer.new()
	chip.custom_minimum_size = Vector2(116, 34)
	chip.add_theme_stylebox_override("panel", _panel_style(Color(0.015, 0.038, 0.037, 0.92), accent, 3, 1))
	status_chip_box.add_child(chip)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	chip.add_child(row)

	var icon := TextureRect.new()
	icon.texture = _load_cached_texture(icon_path)
	icon.custom_minimum_size = Vector2(23, 23)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	icon.modulate = Color(0.92, 0.94, 0.84, 0.92)
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.add_child(icon)

	var label := Label.new()
	label.text = title + " 0"
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 13)
	label.add_theme_color_override("font_color", Color(0.91, 0.87, 0.72))
	row.add_child(label)
	status_chip_labels[id] = {"title": title, "label": label}


func _set_status_chip(id: String, value: String) -> void:
	if not status_chip_labels.has(id):
		return
	var chip_data: Dictionary = status_chip_labels[id]
	var label: Label = chip_data["label"]
	label.text = str(chip_data["title"]) + "  " + value


func _apply_responsive_layout(viewport_width_override: float = -1.0) -> void:
	if root_box == null:
		return
	var window_size := DisplayServer.window_get_size()
	var viewport_width := viewport_width_override if viewport_width_override > 0.0 else float(window_size.x)
	var viewport_height := float(window_size.y)
	if viewport_width <= 0.0 or viewport_height <= 0.0:
		var fallback_size := get_viewport_rect().size
		viewport_width = viewport_width_override if viewport_width_override > 0.0 else fallback_size.x
		viewport_height = fallback_size.y
	var narrow := viewport_width < 980.0
	var short_screen := _is_short_screen(viewport_height)
	var side_margin := 12.0 if narrow else 24.0
	root_box.offset_left = side_margin
	root_box.offset_right = -side_margin
	root_box.offset_top = 12.0 if narrow else 18.0
	root_box.offset_bottom = -12.0 if narrow else -18.0
	root_box.add_theme_constant_override("separation", 6 if narrow else 8)
	top_bar.add_theme_font_size_override("font_size", 14 if narrow else 17)
	status_bar.add_theme_font_size_override("font_size", 13 if narrow else 15)
	treasure_label.add_theme_font_size_override("font_size", 12 if narrow else 14)
	coach_tip_label.custom_minimum_size.x = 0
	reward_context_label.custom_minimum_size.x = 0
	map_context_label.custom_minimum_size.x = 0
	map_context_label.custom_minimum_size.y = 54.0 if narrow else 68.0
	choice_scene_art.custom_minimum_size.x = max(0.0, min(820.0, viewport_width - side_margin * 2.0))
	choice_scene_art.custom_minimum_size.y = 128.0 if narrow else 156.0
	reward_box.columns = 2 if narrow else 5
	battlefield.size_flags_vertical = Control.SIZE_SHRINK_CENTER if short_screen else Control.SIZE_EXPAND_FILL
	battlefield.custom_minimum_size.y = 224.0 if short_screen else 0.0
	hand_box.custom_minimum_size.y = 170.0 if short_screen else 0.0
	controls_box.custom_minimum_size.y = (92.0 if narrow else 44.0) if short_screen else 0.0
	enemy_panel.custom_minimum_size.y = 224.0 if short_screen else 252.0
	enemy_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	enemy_art.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	enemy_art.size_flags_vertical = Control.SIZE_EXPAND_FILL
	enemy_art.custom_minimum_size = Vector2(198, 200) if short_screen else Vector2(300, 252)
	enemy_label.add_theme_font_size_override("font_size", 22 if short_screen else 27)
	intent_label.add_theme_font_size_override("font_size", 16 if short_screen else 19)
	pile_panel.custom_minimum_size = Vector2(154, 224) if short_screen else Vector2(184, 252)
	pile_buttons.columns = 3 if short_screen else 2
	deck_back.visible = not short_screen
	deck_back.custom_minimum_size = Vector2(66, 99) if short_screen else Vector2(92, 138)


func _is_short_screen(viewport_height_override: float = -1.0) -> bool:
	var viewport_height := viewport_height_override
	if viewport_height <= 0.0:
		viewport_height = float(DisplayServer.window_get_size().y)
	if viewport_height <= 0.0:
		viewport_height = get_viewport_rect().size.y
	return viewport_height < 820.0


func _show_title() -> void:
	in_title = true
	run_finished = false
	active_title_panel = ""
	var title_viewport_width := get_viewport_rect().size.x
	var narrow_title := title_viewport_width > 0.0 and title_viewport_width < 1080.0
	_set_gameplay_visible(false)
	_clear_children(title_box)
	_clear_children(summary_box)
	title_box.visible = true
	summary_box.visible = false
	scene_backdrop.texture = _load_cached_texture(TITLE_BACKGROUND_PATH)
	scene_backdrop.modulate = Color(0.40, 0.54, 0.55, 0.46)
	scene_scrim.color = Color(0.008, 0.020, 0.024, 0.70)
	title_box.add_theme_constant_override("separation", 10)

	var main_frame := PanelContainer.new()
	main_frame.name = "TitleMainFrame"
	main_frame.custom_minimum_size = Vector2(0, 520)
	main_frame.add_theme_stylebox_override("panel", _panel_style(Color(0.012, 0.032, 0.034, 0.90), Color(0.42, 0.57, 0.42, 0.82), 5, 1))
	title_box.add_child(main_frame)

	var main_row := HBoxContainer.new()
	main_row.add_theme_constant_override("separation", 16)
	main_frame.add_child(main_row)

	var hero_copy := VBoxContainer.new()
	hero_copy.custom_minimum_size = Vector2(280 if narrow_title else 310, 0)
	hero_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hero_copy.add_theme_constant_override("separation", 12)
	main_row.add_child(hero_copy)

	var title_kicker := Label.new()
	title_kicker.text = "青岚谷 · 外门试炼"
	title_kicker.add_theme_font_size_override("font_size", 14)
	title_kicker.add_theme_color_override("font_color", Color(0.58, 0.76, 0.66))
	hero_copy.add_child(title_kicker)

	var title := Label.new()
	title.text = "青岚夜行"
	title.add_theme_font_size_override("font_size", 48 if narrow_title else 56)
	title.add_theme_color_override("font_color", Color(0.98, 0.82, 0.43))
	hero_copy.add_child(title)

	var title_rule := HSeparator.new()
	title_rule.add_theme_constant_override("separation", 1)
	title_rule.add_theme_stylebox_override("separator", _panel_style(Color(0.68, 0.46, 0.15, 0.75), Color(0.68, 0.46, 0.15, 0.75), 0, 0))
	hero_copy.add_child(title_rule)

	var subtitle := Label.new()
	subtitle.text = "月下入谷，抽牌成术\n在妖影与山门之间，寻一线筑基机缘。"
	subtitle.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	subtitle.add_theme_font_size_override("font_size", 16 if narrow_title else 18)
	subtitle.add_theme_color_override("font_color", Color(0.80, 0.86, 0.78))
	hero_copy.add_child(subtitle)

	var selected_path := Label.new()
	selected_path.text = "当前修行  ·  %s  /  %s" % [str(_origin_data()["name"]), str(_difficulty_data()["name"])]
	selected_path.add_theme_font_size_override("font_size", 14)
	selected_path.add_theme_color_override("font_color", Color(0.92, 0.73, 0.36))
	hero_copy.add_child(selected_path)

	var hero_spacer := Control.new()
	hero_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	hero_copy.add_child(hero_spacer)

	var start := _make_title_primary_button("开始试炼", "ENTER  开始完整三幕试炼")
	start.pressed.connect(_start_normal_run)
	hero_copy.add_child(start)

	var continue_run := _make_menu_button("继续试炼", COLOR_JADE, "继续最近一次自动存档。")
	continue_run.custom_minimum_size = Vector2(0, 48)
	continue_run.disabled = not _has_saved_run()
	continue_run.pressed.connect(_continue_saved_run)
	hero_copy.add_child(continue_run)

	var quick_battle := _make_menu_button("快速战斗  P", Color(0.70, 0.31, 0.20), "固定种子直接进入标准遭遇，快速体验核心牌局。")
	quick_battle.custom_minimum_size = Vector2(0, 44)
	quick_battle.add_theme_font_size_override("font_size", 16)
	quick_battle.pressed.connect(_start_quick_battle)
	hero_copy.add_child(quick_battle)

	var setup_shell := PanelContainer.new()
	setup_shell.custom_minimum_size = Vector2(0 if narrow_title else 500, 0)
	setup_shell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	setup_shell.add_theme_stylebox_override("panel", _panel_style(Color(0.025, 0.060, 0.055, 0.95), Color(0.35, 0.59, 0.46), 5, 1))
	main_row.add_child(setup_shell)

	var setup := VBoxContainer.new()
	setup.add_theme_constant_override("separation", 9)
	setup_shell.add_child(setup)

	var setup_title := Label.new()
	setup_title.text = "本轮试炼"
	setup_title.add_theme_font_size_override("font_size", 22)
	setup_title.add_theme_color_override("font_color", COLOR_PARCHMENT)
	setup.add_child(setup_title)

	var setup_hint := Label.new()
	setup_hint.text = "选择流派与劫数，确认这趟夜行的起手方向。"
	setup_hint.add_theme_font_size_override("font_size", 13)
	setup_hint.add_theme_color_override("font_color", COLOR_MUTED)
	setup.add_child(setup_hint)

	var origin_label := Label.new()
	origin_label.text = "选择流派"
	origin_label.add_theme_font_size_override("font_size", 15)
	origin_label.add_theme_color_override("font_color", Color(0.76, 0.86, 0.77))
	setup.add_child(origin_label)

	var origin_grid := GridContainer.new()
	origin_grid.columns = 3
	origin_grid.add_theme_constant_override("h_separation", 7)
	origin_grid.add_theme_constant_override("v_separation", 7)
	setup.add_child(origin_grid)
	for origin_id in ORIGIN_LIBRARY.keys():
		var origin_button_id := str(origin_id)
		var origin := _origin_data(origin_button_id)
		var origin_button := _make_title_select_button(str(origin["name"]), origin_button_id == selected_origin, _node_color(str(origin.get("tone", "training"))), str(origin["desc"]))
		origin_button.pressed.connect(func() -> void: _select_origin(origin_button_id))
		origin_grid.add_child(origin_button)

	var difficulty_label := Label.new()
	difficulty_label.text = "选择劫数"
	difficulty_label.add_theme_font_size_override("font_size", 15)
	difficulty_label.add_theme_color_override("font_color", Color(0.76, 0.86, 0.77))
	setup.add_child(difficulty_label)

	var difficulty_row := HBoxContainer.new()
	difficulty_row.add_theme_constant_override("separation", 7)
	setup.add_child(difficulty_row)
	for difficulty_id in DIFFICULTY_LIBRARY.keys():
		var difficulty_button_id := str(difficulty_id)
		var difficulty := _difficulty_data(difficulty_button_id)
		var difficulty_button := _make_title_select_button(str(difficulty["name"]), difficulty_button_id == selected_difficulty, _node_color(str(difficulty.get("tone", "training"))), str(difficulty["desc"]))
		difficulty_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		difficulty_button.pressed.connect(func() -> void: _select_difficulty(difficulty_button_id))
		difficulty_row.add_child(difficulty_button)

	var selection_summary := Label.new()
	selection_summary.text = "%s\n%s" % [_origin_summary_text(), _difficulty_summary_text()]
	selection_summary.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	selection_summary.custom_minimum_size = Vector2(0, 58)
	selection_summary.add_theme_font_size_override("font_size", 13)
	selection_summary.add_theme_color_override("font_color", Color(0.72, 0.82, 0.72))
	selection_summary.add_theme_stylebox_override("normal", _panel_style(Color(0.015, 0.038, 0.035, 0.86), Color(0.23, 0.42, 0.33), 3, 1))
	setup.add_child(selection_summary)

	var seed_label := Label.new()
	seed_label.text = "种子 / 复盘码"
	seed_label.add_theme_font_size_override("font_size", 14)
	seed_label.add_theme_color_override("font_color", COLOR_MUTED)
	setup.add_child(seed_label)

	var seed_input := LineEdit.new()
	seed_input.custom_minimum_size = Vector2(0, 40)
	seed_input.placeholder_text = "留空随机，或粘贴 QLN|..."
	seed_input.text = seed_override_text
	seed_input.tooltip_text = "输入数字种子，或粘贴最近战绩/结算页的 QLN 复盘码。"
	seed_input.add_theme_font_size_override("font_size", 14)
	seed_input.add_theme_color_override("font_color", COLOR_TEXT)
	seed_input.add_theme_color_override("font_placeholder_color", Color(0.46, 0.57, 0.51))
	seed_input.add_theme_stylebox_override("normal", _panel_style(Color(0.010, 0.028, 0.029, 0.96), Color(0.30, 0.49, 0.39), 3, 1))
	seed_input.add_theme_stylebox_override("focus", _panel_style(Color(0.018, 0.042, 0.040, 0.98), COLOR_GOLD_FOCUS, 3, 2))
	seed_input.text_changed.connect(func(new_text: String) -> void: seed_override_text = new_text.strip_edges())
	setup.add_child(seed_input)

	var recommended := _make_menu_button("采用推荐配置", Color(0.53, 0.68, 0.36), "使用青竹剑修、凡阶试炼、随机种子并开启决策提示。")
	recommended.custom_minimum_size = Vector2(0, 42)
	recommended.add_theme_font_size_override("font_size", 15)
	recommended.pressed.connect(_start_recommended_run)
	setup.add_child(recommended)

	var hero_art_shell := PanelContainer.new()
	hero_art_shell.custom_minimum_size = Vector2(270, 0)
	hero_art_shell.visible = not narrow_title
	hero_art_shell.add_theme_stylebox_override("panel", _panel_style(Color(0.010, 0.025, 0.027, 0.82), Color(0.70, 0.49, 0.18), 5, 2))
	main_row.add_child(hero_art_shell)

	var hero_art_stack := VBoxContainer.new()
	hero_art_stack.add_theme_constant_override("separation", 0)
	hero_art_shell.add_child(hero_art_stack)

	var hero_art := TextureRect.new()
	hero_art.texture = _load_cached_texture("res://assets/enemy_rogue_cultivator.png")
	hero_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	hero_art.size_flags_vertical = Control.SIZE_EXPAND_FILL
	hero_art.modulate = Color(0.92, 0.95, 0.88, 0.98)
	hero_art_stack.add_child(hero_art)

	var hero_caption := Label.new()
	hero_caption.text = "凡躯入夜 · 一念求道"
	hero_caption.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hero_caption.custom_minimum_size = Vector2(0, 42)
	hero_caption.add_theme_font_size_override("font_size", 14)
	hero_caption.add_theme_color_override("font_color", Color(0.92, 0.78, 0.45))
	hero_caption.add_theme_stylebox_override("normal", _panel_style(Color(0.055, 0.042, 0.025, 0.96), Color(0.52, 0.36, 0.13), 0, 0))
	hero_art_stack.add_child(hero_caption)

	var utility_shell := PanelContainer.new()
	utility_shell.name = "TitleUtilityShell"
	utility_shell.add_theme_stylebox_override("panel", _panel_style(Color(0.012, 0.035, 0.036, 0.94), Color(0.30, 0.51, 0.40), 5, 1))
	title_box.add_child(utility_shell)

	var utility_row := HBoxContainer.new()
	utility_row.alignment = BoxContainer.ALIGNMENT_CENTER
	utility_row.add_theme_constant_override("separation", 9)
	utility_shell.add_child(utility_row)
	var utility_specs: Array[Dictionary] = [
		{"text": "今日试炼", "id": "daily", "tone": Color(0.74, 0.53, 0.22)},
		{"text": "图鉴", "id": "archive", "tone": COLOR_JADE},
		{"text": "传承", "id": "legacy_hub", "tone": Color(0.43, 0.61, 0.75)},
		{"text": "战绩", "id": "records", "tone": Color(0.40, 0.66, 0.61)},
		{"text": "设置", "id": "settings", "tone": Color(0.52, 0.58, 0.58)}
	]
	for spec in utility_specs:
		var utility_id := str(spec["id"])
		var button := _make_menu_button(str(spec["text"]), spec["tone"])
		button.custom_minimum_size = Vector2(150, 40)
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.add_theme_font_size_override("font_size", 15)
		if utility_id == "daily":
			button.tooltip_text = _daily_challenge_preview_text()
			button.pressed.connect(_start_daily_challenge)
		elif utility_id == "settings":
			button.pressed.connect(func() -> void: _show_title_detail("settings"))
		else:
			button.pressed.connect(func() -> void: _show_title_category(utility_id))
		utility_row.add_child(button)

	var meta := Label.new()
	meta.name = "TitleMeta"
	meta.text = _meta_progress_text()
	meta.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	meta.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	meta.add_theme_font_size_override("font_size", 12)
	meta.add_theme_color_override("font_color", Color(0.56, 0.64, 0.54))
	title_box.add_child(meta)

	title_detail_box = VBoxContainer.new()
	title_detail_box.alignment = BoxContainer.ALIGNMENT_CENTER
	title_detail_box.custom_minimum_size = Vector2(860, 0)
	title_detail_box.add_theme_constant_override("separation", 8)
	title_box.add_child(title_detail_box)


func _make_title_primary_button(text: String, tooltip: String) -> Button:
	var button := Button.new()
	button.text = text
	button.tooltip_text = tooltip
	button.custom_minimum_size = Vector2(0, 68)
	button.add_theme_font_size_override("font_size", 23)
	button.add_theme_color_override("font_color", Color(0.10, 0.075, 0.025))
	button.add_theme_color_override("font_hover_color", Color(0.08, 0.055, 0.018))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.91, 0.61, 0.20, 0.98), Color(1.0, 0.82, 0.38), 5, 2))
	button.add_theme_stylebox_override("hover", _panel_style(Color(1.0, 0.72, 0.27, 1.0), Color(1.0, 0.91, 0.58), 5, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.77, 0.46, 0.13, 1.0), Color(0.96, 0.72, 0.28), 5, 2))
	button.add_theme_stylebox_override("focus", _panel_style(Color(0, 0, 0, 0), Color(1.0, 0.93, 0.65), 5, 2))
	_apply_button_motion(button, 1.022)
	return button


func _make_title_select_button(text: String, selected: bool, tone: Color, tooltip: String) -> Button:
	var button := Button.new()
	button.text = text
	button.tooltip_text = tooltip
	button.custom_minimum_size = Vector2(148, 42)
	button.add_theme_font_size_override("font_size", 14)
	button.add_theme_color_override("font_color", COLOR_TEXT)
	var bg := Color(0.045, 0.090, 0.080, 0.98)
	var border := tone
	if selected:
		bg = Color(0.12, 0.10, 0.045, 0.98)
		border = COLOR_GOLD_FOCUS
		button.add_theme_color_override("font_color", Color(1.0, 0.84, 0.48))
	button.add_theme_stylebox_override("normal", _panel_style(bg, border, 3, 2 if selected else 1))
	button.add_theme_stylebox_override("hover", _panel_style(bg.lightened(0.08), COLOR_GOLD_FOCUS, 3, 2))
	button.add_theme_stylebox_override("pressed", _panel_style(bg.darkened(0.08), border, 3, 2))
	button.add_theme_stylebox_override("focus", _panel_style(Color(0, 0, 0, 0), COLOR_GOLD_FOCUS, 3, 2))
	_apply_button_motion(button, 1.018)
	return button


func _show_title_category(category_id: String) -> void:
	if title_detail_box == null:
		return
	_set_title_hub_visible(false)
	_clear_children(title_detail_box)
	var category_shell := PanelContainer.new()
	category_shell.custom_minimum_size = Vector2(0, 190)
	category_shell.add_theme_stylebox_override("panel", _panel_style(Color(0.018, 0.046, 0.044, 0.98), Color(0.34, 0.55, 0.43), 4, 1))
	title_detail_box.add_child(category_shell)
	var category_stack := VBoxContainer.new()
	category_stack.add_theme_constant_override("separation", 12)
	category_shell.add_child(category_stack)
	var category_header := HBoxContainer.new()
	category_stack.add_child(category_header)
	var category_title := Label.new()
	category_title.text = "藏卷与记录"
	category_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	category_title.add_theme_font_size_override("font_size", 22)
	category_title.add_theme_color_override("font_color", COLOR_PARCHMENT)
	category_header.add_child(category_title)
	var back := _make_menu_button("返回主页面", COLOR_JADE)
	back.custom_minimum_size = Vector2(140, 38)
	back.add_theme_font_size_override("font_size", 14)
	back.pressed.connect(_show_title)
	category_header.add_child(back)
	var category_row := HFlowContainer.new()
	category_row.alignment = FlowContainer.ALIGNMENT_CENTER
	category_row.add_theme_constant_override("h_separation", 8)
	category_row.add_theme_constant_override("v_separation", 8)
	var category_art := TextureRect.new()
	category_art.texture = _load_cached_texture(_title_detail_art_path(category_id))
	category_art.custom_minimum_size = Vector2(0, 72)
	category_art.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	category_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	category_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	category_art.modulate = Color(0.72, 0.82, 0.74, 0.72)
	category_stack.add_child(category_art)
	category_stack.add_child(category_row)
	var entries: Array[Dictionary] = []
	match category_id:
		"archive":
			category_title.text = "图鉴与指南"
			entries = [
				{"text": "试玩指南", "panel": "quickstart"},
				{"text": "玩法说明", "panel": "rules"},
				{"text": "引导", "panel": "guide"},
				{"text": "图鉴总览", "panel": "codex"},
				{"text": "美术进度", "panel": "art_status"}
			]
		"legacy_hub":
			category_title.text = "传承藏卷"
			entries = [
				{"text": "传承", "panel": "legacy"},
				{"text": "成就", "panel": "achievements"},
				{"text": "挑战", "panel": "challenges"},
				{"text": "结局", "panel": "endings"},
				{"text": "流派志", "panel": "origin_log"}
			]
		"records":
			category_title.text = "战绩与札记"
			entries = [
				{"text": "最近战绩", "panel": "history"},
				{"text": "任务札记", "panel": "journal"},
				{"text": "平衡概览", "panel": "balance"}
			]
	for entry in entries:
		var panel_id := str(entry["panel"])
		var button := _make_menu_button(str(entry["text"]), COLOR_JADE)
		button.custom_minimum_size = Vector2(142, 38)
		button.add_theme_font_size_override("font_size", 14)
		button.pressed.connect(func() -> void: _show_title_detail(panel_id))
		category_row.add_child(button)


func _set_title_hub_visible(is_visible: bool) -> void:
	if title_box == null:
		return
	var main_frame := title_box.get_node_or_null("TitleMainFrame")
	var utility_shell := title_box.get_node_or_null("TitleUtilityShell")
	var meta := title_box.get_node_or_null("TitleMeta")
	if main_frame != null:
		main_frame.visible = is_visible
	if utility_shell != null:
		utility_shell.visible = is_visible
	if meta != null:
		meta.visible = is_visible


func _set_gameplay_visible(is_visible: bool) -> void:
	status_shell.visible = is_visible
	top_bar.visible = is_visible
	status_bar.visible = false
	treasure_label.visible = is_visible and (not treasures.is_empty() or not insights.is_empty() or not breakthroughs.is_empty() or not consumables.is_empty())
	status_chip_box.visible = is_visible
	coach_tip_label.visible = is_visible and show_decision_hints and not in_title and not run_finished
	player_hp_bar.visible = is_visible
	battlefield.visible = is_visible
	log_label.visible = is_visible
	if not is_visible:
		_close_pile_view()
	hand_box.visible = is_visible
	reward_context_label.visible = is_visible and in_reward
	reward_scroll.visible = is_visible
	map_context_label.visible = is_visible and in_map and not in_choice
	map_box.visible = is_visible
	choice_scene_art.visible = is_visible and in_choice and choice_scene_art.texture != null
	choice_box.visible = is_visible
	controls_box.visible = is_visible


func _start_run() -> void:
	in_title = false
	run_finished = false
	_set_gameplay_visible(true)
	_close_pile_view()
	_clear_children(title_box)
	_clear_children(summary_box)
	title_box.visible = false
	summary_box.visible = false
	max_hp = BASE_MAX_HP + int(_origin_data().get("max_hp_bonus", 0))
	player_hp = max_hp
	run_step = 0
	current_act = 0
	battles_won = 0
	combat_turn = 0
	run_reward_awarded = false
	run_history_recorded = false
	run_achievements.clear()
	run_endings_unlocked.clear()
	run_challenges_completed.clear()
	last_cultivation_gained = 0
	encounter_index = 0
	current_is_boss = false
	current_is_elite = false
	spirit_stones = 0
	run_seed = _configured_run_seed()
	rng.seed = run_seed
	lunar_omen_id = ""
	trial_mandate_options = _roll_trial_mandate_options()
	trial_mandate_id = ""
	trial_mandate_progress = 0
	trial_mandate_completed = false
	active_bounty_id = ""
	active_bounty_progress = 0
	completed_bounty_count = 0
	max_qi = 3
	qi = max_qi
	shield = 0
	log_lines.clear()
	deck.assign(_starting_deck_for_run())
	treasures.clear()
	consumables.clear()
	insights.clear()
	breakthroughs.clear()
	if _origin_data().has("start_consumable"):
		_gain_consumable(str(_origin_data()["start_consumable"]))
	reward_cards.clear()
	reward_treasures.clear()
	reward_consumables.clear()
	reward_insights.clear()
	reward_breakthroughs.clear()
	draw_pile.clear()
	discard_pile.clear()
	exhaust_pile.clear()
	hand.clear()
	enemy.clear()
	enemy_hp = 0
	enemy_block = 0
	enemy_flawed = false
	enemy_burn = 0
	enemy_weak = 0
	player_weak = 0
	player_edge = 0
	next_combat_player_weak = 0
	next_duel_trial.clear()
	duel_trials_completed = 0
	flawless_wins = 0
	combat_hp_lost = false
	route_history.clear()
	run_marks.clear()
	interlude_oaths.clear()
	pending_interlude_oath_options.clear()
	enemy_move_index = 0
	_log("外门弟子入谷试炼开始。以牌为术，以灵气为限。试炼种子：" + str(run_seed) + _challenge_log_suffix() + "。")
	_assign_lunar_omen()
	if _origin_data().has("start_consumable"):
		var start_consumable_id := str(_origin_data()["start_consumable"])
		if CONSUMABLE_LIBRARY.has(start_consumable_id):
			_log(_origin_data()["name"] + " 备好随身小物：" + str(CONSUMABLE_LIBRARY[start_consumable_id]["name"]) + "。")
	_assign_next_bounty()
	_show_trial_mandate_choices()


func _start_normal_run() -> void:
	_apply_share_code_from_seed_input()
	run_challenge_id = ""
	run_challenge_name = ""
	_start_run()


func _start_recommended_run() -> void:
	selected_origin = "bamboo_sword"
	selected_difficulty = "normal"
	seed_override_text = ""
	show_decision_hints = true
	_save_meta_progress()
	run_challenge_id = ""
	run_challenge_name = ""
	_start_run()


func _start_quick_battle() -> void:
	selected_origin = "bamboo_sword"
	selected_difficulty = "normal"
	seed_override_text = "424242"
	show_decision_hints = true
	_save_meta_progress()
	run_challenge_id = ""
	run_challenge_name = ""
	_start_run()
	if trial_mandate_options.is_empty():
		_assign_trial_mandate()
		_show_map_choices()
	else:
		_choose_trial_mandate(trial_mandate_options[0])
	_log("快速战斗：略过首段路线，直接进入标准遭遇。")
	_start_encounter(false, false)


func _start_daily_challenge() -> void:
	var challenge := _daily_challenge_data()
	run_challenge_id = str(challenge["id"])
	run_challenge_name = str(challenge["name"])
	seed_override_text = str(challenge["seed"])
	_start_run()


func _start_encounter(is_boss: bool = false, is_elite: bool = false) -> void:
	in_map = false
	in_choice = false
	in_reward = false
	current_is_boss = is_boss
	current_is_elite = is_elite
	pending_nodes.clear()
	choice_options.clear()
	if is_boss:
		enemy = _boss_encounter_for_act()
	elif is_elite:
		var elite_pool := _elite_encounters_for_act()
		enemy = elite_pool[encounter_index % elite_pool.size()].duplicate(true)
	else:
		var encounter_pool := _encounters_for_act()
		enemy = encounter_pool[encounter_index % encounter_pool.size()].duplicate(true)
	_apply_difficulty_to_enemy(enemy)
	_apply_lunar_omen_to_enemy(enemy)
	_apply_next_duel_trial_to_enemy(enemy)
	if not is_boss:
		encounter_index += 1
	enemy_hp = enemy["max_hp"]
	enemy_block = 0
	enemy_flawed = false
	enemy_burn = 0
	enemy_weak = 0
	player_weak = next_combat_player_weak
	next_combat_player_weak = 0
	enemy_move_index = 0
	combat_turn = 0
	combat_hp_lost = false
	first_attack_played = false
	first_skill_played = false
	first_consumable_used = false
	draw_pile.assign(deck)
	draw_pile = _shuffle_with_run_rng(draw_pile)
	discard_pile.clear()
	exhaust_pile.clear()
	hand.clear()
	shield = 0
	player_edge = 0
	_log(("精英遭遇：" if is_elite else "遭遇：") + enemy["name"] + "（" + _act_data()["name"] + " / " + _difficulty_data()["name"] + "）")
	if player_weak > 0:
		_log("瘴气未散，开战时自身虚弱 " + str(player_weak) + "。")
	_start_player_turn()


func _apply_difficulty_to_enemy(enemy_data: Dictionary) -> void:
	var difficulty := _difficulty_data()
	var hp_bonus := int(difficulty.get("hp_bonus", 0))
	var damage_bonus := int(difficulty.get("damage_bonus", 0))
	var block_bonus := int(difficulty.get("block_bonus", 0))
	if hp_bonus > 0:
		enemy_data["max_hp"] = int(enemy_data["max_hp"]) + hp_bonus
	if damage_bonus <= 0 and block_bonus <= 0:
		return
	for move in enemy_data["moves"]:
		if damage_bonus > 0 and move.has("damage"):
			move["damage"] = int(move["damage"]) + damage_bonus
		if block_bonus > 0 and move.has("block"):
			move["block"] = int(move["block"]) + block_bonus


func _apply_next_duel_trial_to_enemy(enemy_data: Dictionary) -> void:
	if next_duel_trial.is_empty():
		return
	var hp_bonus := int(next_duel_trial.get("hp_bonus", 0))
	var damage_bonus := int(next_duel_trial.get("damage_bonus", 0))
	var block_bonus := int(next_duel_trial.get("block_bonus", 0))
	if hp_bonus > 0:
		enemy_data["max_hp"] = int(enemy_data["max_hp"]) + hp_bonus
	for move in enemy_data["moves"]:
		if damage_bonus > 0 and move.has("damage"):
			move["damage"] = int(move["damage"]) + damage_bonus
		if block_bonus > 0 and move.has("block"):
			move["block"] = int(move["block"]) + block_bonus
	_log("试剑约束生效：" + str(next_duel_trial.get("name", "无名试剑")) + "，此战敌势更盛。")


func _apply_lunar_omen_to_enemy(enemy_data: Dictionary) -> void:
	var hp_bonus := _lunar_omen_value("enemy_hp_bonus")
	var damage_bonus := _lunar_omen_value("enemy_damage_bonus")
	if hp_bonus > 0:
		enemy_data["max_hp"] = int(enemy_data["max_hp"]) + hp_bonus
	if damage_bonus > 0:
		for move in enemy_data["moves"]:
			if move.has("damage"):
				move["damage"] = int(move["damage"]) + damage_bonus
	if hp_bonus > 0 or damage_bonus > 0:
		_log(_lunar_omen_name() + "笼罩此战，敌势有所变化。")


func _start_player_turn() -> void:
	combat_turn += 1
	_apply_enemy_burn()
	if enemy_hp <= 0:
		_win_encounter()
		return
	qi = max_qi
	if combat_turn == 1 and _treasure_value("first_turn_qi") > 0:
		var treasure_qi := _treasure_value("first_turn_qi")
		qi += treasure_qi
		_log("月华玉佩牵引月息，本回合灵气 +" + str(treasure_qi) + "。")
	if combat_turn == 1 and int(_origin_data().get("first_turn_qi", 0)) > 0:
		var origin_qi := int(_origin_data().get("first_turn_qi", 0))
		qi += origin_qi
		_log(_origin_data()["name"] + " 熟练催符，本回合灵气 +" + str(origin_qi) + "。")
	if combat_turn == 1 and _lunar_omen_value("first_turn_qi") > 0:
		var omen_qi := _lunar_omen_value("first_turn_qi")
		qi += omen_qi
		_log(_lunar_omen_name() + "映照灵台，本回合灵气 +" + str(omen_qi) + "。")
	shield = 0
	if combat_turn == 1 and int(_origin_data().get("start_block", 0)) > 0:
		var origin_block := int(_origin_data().get("start_block", 0))
		shield += origin_block
		_log(_origin_data()["name"] + " 起手稳剑，护盾 +" + str(origin_block) + "。")
	if combat_turn == 1 and _treasure_value("start_block") > 0:
		var treasure_block := _treasure_value("start_block")
		shield += treasure_block
		_log("纸伞护符轻展，护盾 +" + str(treasure_block) + "。")
	if combat_turn == 1 and _treasure_value("start_edge") > 0:
		var treasure_edge := _treasure_value("start_edge")
		player_edge += treasure_edge
		_log("青锋剑穗垂落腕间，剑势 +" + str(treasure_edge) + "。")
	if combat_turn == 1 and _insight_value("start_block") > 0:
		var insight_block := _insight_value("start_block")
		shield += insight_block
		_log("守一心法护住灵台，护盾 +" + str(insight_block) + "。")
	if combat_turn == 1 and _insight_value("start_edge") > 0:
		var insight_edge := _insight_value("start_edge")
		player_edge += insight_edge
		_log("藏锋听息蓄住一线锋芒，剑势 +" + str(insight_edge) + "。")
	if combat_turn == 1 and _breakthrough_value("start_block") > 0:
		var breakthrough_block := _breakthrough_value("start_block")
		shield += breakthrough_block
		_log("固关守元，起手护盾 +" + str(breakthrough_block) + "。")
	if combat_turn == 1 and _lunar_omen_value("start_block") > 0:
		var omen_block := _lunar_omen_value("start_block")
		shield += omen_block
		_log(_lunar_omen_name() + "凝成月幕，护盾 +" + str(omen_block) + "。")
	if combat_turn == 1 and _treasure_value("start_cleanse_weak") > 0 and player_weak > 0:
		var treasure_cleanse: int = min(player_weak, _treasure_value("start_cleanse_weak"))
		player_weak -= treasure_cleanse
		_log("寒玉扣沁凉入脉，驱散虚弱 " + str(treasure_cleanse) + "。")
	if combat_turn == 1 and _insight_value("start_cleanse_weak") > 0 and player_weak > 0:
		var cleanse: int = min(player_weak, _insight_value("start_cleanse_weak"))
		player_weak -= cleanse
		_log("守一心法沉定道心，驱散虚弱 " + str(cleanse) + "。")
	if combat_turn == 1 and _insight_value("start_cleanse_curse") > 0:
		var removed_curses := _cleanse_inner_demons(_insight_value("start_cleanse_curse"))
		if removed_curses > 0:
			_log("明镜照魔映破杂念，净除心魔杂念 x" + str(removed_curses) + "。")
	if combat_turn == 1 and int(_origin_data().get("start_heal", 0)) > 0:
		var origin_heal := int(_origin_data().get("start_heal", 0))
		player_hp = min(max_hp, player_hp + origin_heal)
		_log(_origin_data()["name"] + " 调息回元，生命 +" + str(origin_heal) + "。")
	var draw_amount := 5
	if combat_turn == 1 and int(_origin_data().get("first_turn_draw", 0)) > 0:
		var origin_draw := int(_origin_data().get("first_turn_draw", 0))
		draw_amount += origin_draw
		_log(_origin_data()["name"] + " 抢得先机，起手多抽 " + str(origin_draw) + " 张牌。")
	if combat_turn == 1 and _insight_value("first_turn_draw") > 0:
		draw_amount += _insight_value("first_turn_draw")
		_log("听风辨息，起手多抽 " + str(_insight_value("first_turn_draw")) + " 张牌。")
	if combat_turn == 1 and _treasure_value("first_turn_draw") > 0:
		draw_amount += _treasure_value("first_turn_draw")
		_log("听风铃清响，起手多抽 " + str(_treasure_value("first_turn_draw")) + " 张牌。")
	if combat_turn == 1 and _lunar_omen_value("first_turn_draw") > 0:
		draw_amount += _lunar_omen_value("first_turn_draw")
		_log(_lunar_omen_name() + "照亮牌路，起手多抽 " + str(_lunar_omen_value("first_turn_draw")) + " 张牌。")
	_draw_cards(draw_amount)
	_save_run_snapshot("combat")
	_refresh()


func _draw_cards(amount: int) -> void:
	for _i in amount:
		if hand.size() >= MAX_HAND_SIZE:
			return
		if draw_pile.is_empty():
			if discard_pile.is_empty():
				return
			draw_pile.assign(discard_pile)
			draw_pile = _shuffle_with_run_rng(draw_pile)
			discard_pile.clear()
			_log("弃牌堆洗回牌库。")
		hand.append(draw_pile.pop_back())


func _apply_enemy_burn() -> void:
	if enemy_burn <= 0:
		return
	var burn_damage := enemy_burn + _treasure_value("burn_damage")
	var absorbed: int = min(enemy_block, burn_damage)
	enemy_block -= absorbed
	enemy_hp = max(0, enemy_hp - (burn_damage - absorbed))
	_log("燃烧灼身，" + enemy["name"] + " 受到 " + str(burn_damage) + " 点燃烧威力。")
	enemy_burn = max(0, enemy_burn - 1)


func _add_status_cards(card_id: String, amount: int, destination: String) -> void:
	if not CARD_LIBRARY.has(card_id):
		return
	for _i in amount:
		match destination:
			"draw":
				draw_pile.append(card_id)
				draw_pile = _shuffle_with_run_rng(draw_pile)
			"hand":
				if hand.size() < MAX_HAND_SIZE:
					hand.append(card_id)
				else:
					discard_pile.append(card_id)
			_:
				discard_pile.append(card_id)
	var card: Dictionary = _card_data(card_id)
	_log("心魔侵扰，" + _pile_destination_name(destination) + "混入 " + card["name"] + " x" + str(amount) + "。")


func _play_card(hand_index: int) -> void:
	if in_reward or hand_index < 0 or hand_index >= hand.size():
		return
	var card_id := hand[hand_index]
	var card: Dictionary = _card_data(card_id)
	if card.get("unplayable", false):
		_log(card["name"] + " 盘踞心头，无法打出。")
		return
	var cost: int = card["cost"]
	if qi < cost:
		_log("灵气不足，无法施展 " + card["name"] + "。")
		return
	qi -= cost
	hand.remove_at(hand_index)
	_apply_card(card)
	if card.get("exhaust", false):
		exhaust_pile.append(card_id)
	else:
		discard_pile.append(card_id)
	if player_hp <= 0:
		_lose_run()
	elif enemy_hp <= 0:
		_win_encounter()
	else:
		_save_run_snapshot("combat")
		_refresh()


func _apply_card(card: Dictionary) -> void:
	var card_type := str(card.get("type", ""))
	if card.has("self_damage"):
		var self_damage := int(card["self_damage"])
		player_hp = max(0, player_hp - self_damage)
		if self_damage > 0:
			combat_hp_lost = true
		_log(card["name"] + " 反噬自身 " + str(card["self_damage"]) + " 点生命。")
		if _treasure_value("self_damage_block") > 0:
			var recoil_block := _treasure_value("self_damage_block")
			shield += recoil_block
			_log("血纹护符收束反噬，护盾 +" + str(recoil_block) + "。")
	if card.has("gain_qi"):
		qi += int(card["gain_qi"])
	if card.has("block"):
		shield += int(card["block"])
	if card.has("heal"):
		player_hp = min(max_hp, player_hp + int(card["heal"]))
	if card.has("gain_edge"):
		var edge_gain := int(card["gain_edge"])
		player_edge += edge_gain
		_log(card["name"] + " 蓄起剑势 +" + str(edge_gain) + "。")
	if card.has("damage"):
		var hits := int(card.get("hits", 1))
		var spent_edge := player_edge if card_type == "attack" else 0
		var edge_damage := 0
		if spent_edge > 0:
			edge_damage = spent_edge * (2 + _treasure_value("edge_damage_bonus"))
			player_edge = 0
			if spent_edge >= 3:
				_unlock_achievement("edge_strike")
			_log("剑势成锋，本张攻击每段威力 +" + str(edge_damage) + "。")
		var first_hit_bonus := 0
		if card_type == "attack" and not first_attack_played:
			first_attack_played = true
			if _treasure_value("first_attack_damage") > 0:
				first_hit_bonus = _treasure_value("first_attack_damage")
				_log("狼牙剑坠激起凶性，首张术法伤害 +" + str(first_hit_bonus) + "。")
		var total_power := 0
		for hit_index in hits:
			var damage := int(card["damage"]) + _breakthrough_value("attack_damage") + int(_origin_data().get("attack_damage", 0))
			damage += edge_damage
			if hit_index == 0:
				damage += first_hit_bonus
			if enemy_weak > 0:
				damage = int(ceil(float(damage) * 1.25))
				enemy_weak -= 1
				_log("敌人灵息紊乱，本次受击加重。")
			if enemy_flawed:
				damage += int(card.get("flaw_bonus", 0))
				enemy_flawed = false
			var absorbed: int = min(enemy_block, damage)
			enemy_block -= absorbed
			enemy_hp -= damage - absorbed
			enemy_hp = max(0, enemy_hp)
			total_power += damage
		var hit_text := " x" + str(hits) if hits > 1 else ""
		_log(card["name"] + " 造成 " + str(total_power) + " 点威力" + hit_text + "。")
	elif card_type == "attack" and not first_attack_played:
		first_attack_played = true
	if card.has("draw"):
		_draw_cards(int(card["draw"]))
	if card.has("burn"):
		var burn_amount := int(card["burn"]) + _breakthrough_value("burn_bonus")
		enemy_burn += burn_amount
		_log(card["name"] + " 点燃敌人，燃烧 +" + str(burn_amount) + "。")
	if card.has("weak"):
		enemy_weak += int(card["weak"])
		_log(card["name"] + " 扰乱敌人灵息，虚弱 +" + str(card["weak"]) + "。")
	if card.has("cleanse_player_weak") and player_weak > 0:
		player_weak = max(0, player_weak - int(card["cleanse_player_weak"]))
		_log(card["name"] + " 澄心定念，驱散自身虚弱。")
	if card.has("cleanse_curse"):
		var removed_curses := _cleanse_inner_demons(int(card["cleanse_curse"]))
		if removed_curses > 0:
			_log(card["name"] + " 镇住杂念，净除心魔杂念 x" + str(removed_curses) + "。")
		else:
			_log(card["name"] + " 灵光扫过，未见心魔杂念。")
	if card_type == "skill" and not first_skill_played:
		first_skill_played = true
		if _treasure_value("first_skill_draw") > 0:
			var skill_draw := _treasure_value("first_skill_draw")
			_draw_cards(skill_draw)
			_log("青竹残简自行翻页，首张法门额外抽 " + str(skill_draw) + " 张牌。")
		if _insight_value("first_skill_edge") > 0:
			var skill_edge := _insight_value("first_skill_edge")
			player_edge += skill_edge
			_log("藏锋听息随法门沉落，剑势 +" + str(skill_edge) + "。")


func _cleanse_inner_demons(amount: int) -> int:
	var removed := 0
	for _i in amount:
		if not _remove_one_inner_demon():
			break
		removed += 1
	if removed > 0:
		_unlock_achievement("cleanse_mind")
		_advance_trial_mandate("cleanse", removed)
		_advance_bounty("cleanse", removed)
	return removed


func _remove_one_inner_demon() -> bool:
	var removed := false
	if deck.has("inner_demon"):
		deck.erase("inner_demon")
		removed = true
	var combat_piles: Array[Array] = [hand, draw_pile, discard_pile, exhaust_pile]
	for pile in combat_piles:
		var index: int = pile.find("inner_demon")
		if index >= 0:
			pile.remove_at(index)
			removed = true
			break
	return removed


func _use_consumable(consumable_id: String) -> void:
	if not consumables.has(consumable_id) or not CONSUMABLE_LIBRARY.has(consumable_id):
		_refresh()
		return
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	consumables.erase(consumable_id)
	var bonus := _consumable_bonus_value()
	var effects: Array[String] = []
	if consumable.has("heal"):
		var heal_amount := int(consumable["heal"]) + bonus
		player_hp = min(max_hp, player_hp + heal_amount)
		effects.append("恢复 " + str(heal_amount))
	if consumable.has("gain_qi"):
		var gained_qi := int(consumable["gain_qi"]) + bonus
		qi += gained_qi
		effects.append("灵气 +" + str(gained_qi))
	if consumable.has("block"):
		var gained_block := int(consumable["block"]) + bonus
		shield += gained_block
		effects.append("护盾 +" + str(gained_block))
	if consumable.has("gain_edge"):
		var gained_edge := int(consumable["gain_edge"]) + bonus
		player_edge += gained_edge
		effects.append("剑势 +" + str(gained_edge))
	if consumable.has("cleanse_player_weak"):
		var before_weak := player_weak
		player_weak = max(0, player_weak - int(consumable["cleanse_player_weak"]) - bonus)
		effects.append("驱散虚弱 " + str(before_weak - player_weak))
	if consumable.has("draw"):
		_draw_cards(int(consumable["draw"]))
		effects.append("抽牌 " + str(consumable["draw"]))
	if consumable.has("damage"):
		var damage_result := _deal_consumable_damage(int(consumable["damage"]) + bonus)
		effects.append("威力 %d，破盾 %d，伤血 %d" % [
			int(damage_result["power"]),
			int(damage_result["blocked"]),
			int(damage_result["hp_loss"])
		])
	if not first_consumable_used:
		first_consumable_used = true
		if _treasure_value("first_consumable_draw") > 0:
			var consumable_draw := _treasure_value("first_consumable_draw")
			_draw_cards(consumable_draw)
			effects.append("纸鹤抽牌 " + str(consumable_draw))
	_log("使用消耗品：" + str(consumable["name"]) + "（" + "；".join(effects) + "）。")
	if enemy_hp <= 0:
		_win_encounter()
	else:
		_save_run_snapshot("combat")
		_refresh()


func _deal_consumable_damage(amount: int) -> Dictionary:
	var damage := amount
	var weak_used := 0
	if enemy_weak > 0:
		damage = int(ceil(float(damage) * 1.25))
		enemy_weak -= 1
		weak_used = 1
	var absorbed: int = min(enemy_block, damage)
	enemy_block -= absorbed
	enemy_hp = max(0, enemy_hp - (damage - absorbed))
	return {
		"power": damage,
		"blocked": absorbed,
		"hp_loss": damage - absorbed,
		"weak_used": weak_used
	}


func _grant_flawless_win_bonus() -> void:
	if combat_hp_lost:
		return
	flawless_wins += 1
	spirit_stones += 3
	_note_spirit_stones_changed()
	_unlock_achievement("first_flawless_win")
	_log("完胜破阵：本战未损生命，额外获得灵石 x3。")


func _end_turn() -> void:
	if not _can_end_turn():
		return
	discard_pile.append_array(hand)
	hand.clear()
	_enemy_turn()


func _enemy_turn() -> void:
	var move: Dictionary = enemy["moves"][enemy_move_index % enemy["moves"].size()]
	enemy_move_index += 1
	var action_details: Array[String] = []
	if move.has("block"):
		var block_gain := int(move["block"])
		enemy_block += block_gain
		action_details.append("护体 +" + str(block_gain))
	if move.get("flaw", false):
		enemy_flawed = true
		action_details.append("露出破绽")
	if move.has("damage"):
		var hits := int(move.get("hits", 1))
		var total_power := 0
		var total_blocked := 0
		var total_hp_loss := 0
		var weak_used := 0
		for _i in hits:
			var incoming := int(move["damage"])
			if player_weak > 0:
				incoming = int(ceil(float(incoming) * 1.25))
				player_weak -= 1
				weak_used += 1
			var blocked: int = min(shield, incoming)
			shield -= blocked
			var hp_loss := incoming - blocked
			player_hp -= hp_loss
			if hp_loss > 0:
				combat_hp_lost = true
			total_power += incoming
			total_blocked += blocked
			total_hp_loss += hp_loss
		action_details.append("威力 %d，挡下 %d，失血 %d" % [total_power, total_blocked, total_hp_loss])
		if weak_used > 0:
			action_details.append("消耗自身虚弱 " + str(weak_used))
	if move.has("player_weak"):
		var weak_gain := int(move["player_weak"])
		player_weak += weak_gain
		action_details.append("虚弱 +" + str(weak_gain))
	player_hp = max(0, player_hp)
	var detail_text := "（" + "；".join(action_details) + "）" if not action_details.is_empty() else ""
	_log(enemy["name"] + " 施展 " + move["intent"] + detail_text + "。")
	if move.has("add_status"):
		_add_status_cards(str(move["add_status"]), int(move.get("status_amount", 1)), str(move.get("status_to", "discard")))
	if player_hp <= 0:
		_lose_run()
	else:
		_start_player_turn()


func _win_encounter() -> void:
	battles_won += 1
	_unlock_achievement("first_battle")
	_advance_bounty("battle", 1)
	if current_is_elite:
		_unlock_achievement("elite_down")
		if current_act >= 2:
			_unlock_achievement("third_act_elite")
		_advance_trial_mandate("elite", 1)
		_advance_bounty("elite", 1)
	_log("击败 " + enemy["name"] + "。")
	var stones_gained := 6 + encounter_index * 3
	if current_is_elite:
		stones_gained += 8
	stones_gained += _treasure_value("battle_stones")
	stones_gained += _lunar_omen_value("battle_stones")
	spirit_stones += stones_gained
	_note_spirit_stones_changed()
	_log("缴获下品灵石 x" + str(stones_gained) + "。")
	_grant_flawless_win_bonus()
	if _treasure_value("battle_heal") > 0:
		var battle_heal := _treasure_value("battle_heal")
		player_hp = min(max_hp, player_hp + battle_heal)
		_log("随身法宝回照丹田，战后恢复 " + str(battle_heal) + " 点生命。")
	if _treasure_value("battle_reward_consumable") > 0:
		for _i in _treasure_value("battle_reward_consumable"):
			_gain_consumable(_random_consumable_id())
		_log("药囊中备物尚足，战后补得消耗品。")
	_grant_duel_trial_reward()
	if current_is_boss:
		if _is_final_act():
			_unlock_achievement("foundation_success")
			if not deck.has("inner_demon"):
				_unlock_achievement("clean_foundation")
			if selected_difficulty == "nightmare":
				_unlock_achievement("nightmare_clear")
			_log(str(_act_data()["clear_log"]))
			_show_run_summary("筑基成功", "你在雷云下守住道心，玄阴余煞与心魔杂念一并被劫光洗去。周身灵气归一，终于踏入筑基。", true)
		else:
			_complete_act_and_continue()
		return
	run_step += 1
	in_reward = true
	reward_cards = _roll_rewards()
	reward_treasures.clear()
	reward_consumables.clear()
	reward_insights.clear()
	if current_is_elite or _should_offer_treasure_reward():
		reward_treasures = _roll_treasure_rewards()
	if current_is_elite or _should_offer_consumable_reward():
		reward_consumables = _roll_consumable_rewards()
	if current_is_elite or _should_offer_insight_reward():
		reward_insights = _roll_insight_rewards()
	current_is_elite = false
	_save_run_snapshot("reward")
	_refresh()


func _grant_duel_trial_reward() -> void:
	if next_duel_trial.is_empty():
		return
	var reward := str(next_duel_trial.get("reward", "stones"))
	var trial_name := str(next_duel_trial.get("name", "试剑"))
	match reward:
		"upgrade":
			var upgraded_names := _upgrade_random_cards(2)
			if upgraded_names.is_empty():
				spirit_stones += 12
				_note_spirit_stones_changed()
				_log(trial_name + "兑现：无可精研术法，改得灵石 x12。")
			else:
				_log(trial_name + "兑现：精研 " + "、".join(upgraded_names) + "。")
		"treasure":
			var pool := _available_treasure_ids()
			if pool.is_empty():
				spirit_stones += 18
				_note_spirit_stones_changed()
				_log(trial_name + "兑现：法宝已尽，改得灵石 x18。")
			else:
				pool = _shuffle_with_run_rng(pool)
				var treasure := _gain_treasure(str(pool[0]))
				_log(trial_name + "兑现：夺得法宝：" + str(treasure["name"]) + "。")
		_:
			spirit_stones += 20
			_note_spirit_stones_changed()
			_log(trial_name + "兑现：额外获得灵石 x20。")
	next_duel_trial.clear()
	duel_trials_completed += 1


func _roll_rewards() -> Array[String]:
	var rewards: Array[String] = []
	var pool := _reward_card_pool()
	for _i in 3:
		if pool.is_empty():
			break
		var card_id := _pick_weighted_reward_card(pool)
		if card_id.is_empty():
			break
		rewards.append(card_id)
		pool.erase(card_id)
	return rewards


func _roll_treasure_rewards() -> Array[String]:
	var pool := _available_treasure_ids()
	pool = _shuffle_with_run_rng(pool)
	var rewards: Array[String] = []
	for i in min(2, pool.size()):
		rewards.append(pool[i])
	return rewards


func _roll_consumable_rewards() -> Array[String]:
	var pool := CONSUMABLE_LIBRARY.keys()
	pool = _shuffle_with_run_rng(pool)
	var rewards: Array[String] = []
	for i in min(1, pool.size()):
		rewards.append(str(pool[i]))
	return rewards


func _roll_insight_rewards() -> Array[String]:
	var pool: Array[String] = []
	for insight_id in INSIGHT_LIBRARY.keys():
		if not insights.has(str(insight_id)):
			pool.append(str(insight_id))
	pool = _shuffle_with_run_rng(pool)
	var rewards: Array[String] = []
	for i in min(1, pool.size()):
		rewards.append(pool[i])
	return rewards


func _roll_breakthrough_rewards() -> Array[String]:
	var pool := _available_breakthrough_ids()
	pool = _shuffle_with_run_rng(pool)
	var rewards: Array[String] = []
	for i in min(3, pool.size()):
		rewards.append(pool[i])
	return rewards


func _roll_interlude_oath_options() -> Array[String]:
	var pool: Array[String] = []
	for oath_id in INTERLUDE_OATH_LIBRARY.keys():
		if not interlude_oaths.has(str(oath_id)):
			pool.append(str(oath_id))
	pool = _shuffle_with_run_rng(pool)
	var options: Array[String] = []
	for i in min(3, pool.size()):
		options.append(pool[i])
	return options


func _available_treasure_ids() -> Array[String]:
	var pool: Array[String] = []
	for treasure_id in TREASURE_LIBRARY.keys():
		if not treasures.has(treasure_id):
			pool.append(treasure_id)
	return pool


func _should_offer_treasure_reward() -> bool:
	return battles_won % 2 == 1 and not _available_treasure_ids().is_empty()


func _should_offer_consumable_reward() -> bool:
	return battles_won % 2 == 0


func _should_offer_insight_reward() -> bool:
	return battles_won == 3 and not _available_insight_ids().is_empty()


func _available_insight_ids() -> Array[String]:
	var pool: Array[String] = []
	for insight_id in INSIGHT_LIBRARY.keys():
		if not insights.has(str(insight_id)):
			pool.append(str(insight_id))
	return pool


func _available_breakthrough_ids() -> Array[String]:
	var pool: Array[String] = []
	for breakthrough_id in BREAKTHROUGH_LIBRARY.keys():
		if not breakthroughs.has(str(breakthrough_id)):
			pool.append(str(breakthrough_id))
	return pool


func _choose_reward(card_id: String) -> void:
	deck.append(card_id)
	_log("获得新牌：" + _card_data(card_id)["name"])
	_show_map_choices()


func _choose_treasure(treasure_id: String) -> void:
	var treasure := _gain_treasure(treasure_id)
	if treasure.is_empty():
		_refresh()
		return
	_log("获得法宝：" + treasure["name"])
	_show_map_choices()


func _choose_consumable(consumable_id: String) -> void:
	_gain_consumable(consumable_id)
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	_log("获得消耗品：" + consumable["name"])
	_show_map_choices()


func _gain_consumable(consumable_id: String) -> void:
	if CONSUMABLE_LIBRARY.has(consumable_id):
		consumables.append(consumable_id)


func _gain_treasure(treasure_id: String) -> Dictionary:
	if not TREASURE_LIBRARY.has(treasure_id) or treasures.has(treasure_id):
		return {}
	treasures.append(treasure_id)
	var treasure: Dictionary = TREASURE_LIBRARY[treasure_id]
	if treasure.has("max_qi"):
		max_qi += int(treasure["max_qi"])
		qi = max_qi
	_advance_bounty("gain_treasure", 1)
	_check_treasure_achievements()
	_check_run_state_achievements()
	return treasure


func _choose_insight(insight_id: String) -> void:
	if not INSIGHT_LIBRARY.has(insight_id) or insights.has(insight_id):
		_refresh()
		return
	_gain_insight(insight_id)
	_show_map_choices()


func _choose_breakthrough(breakthrough_id: String) -> void:
	if not BREAKTHROUGH_LIBRARY.has(breakthrough_id) or breakthroughs.has(breakthrough_id):
		_refresh()
		return
	_gain_breakthrough(breakthrough_id)
	if not pending_interlude_oath_options.is_empty():
		_show_interlude_oath_choices()
	else:
		_show_map_choices()


func _reward_shortcut_options() -> Array[Dictionary]:
	var options: Array[Dictionary] = []
	for breakthrough_id in reward_breakthroughs:
		options.append({"kind": "breakthrough", "id": breakthrough_id})
	for card_id in reward_cards:
		options.append({"kind": "card", "id": card_id})
	for treasure_id in reward_treasures:
		options.append({"kind": "treasure", "id": treasure_id})
	for consumable_id in reward_consumables:
		options.append({"kind": "consumable", "id": consumable_id})
	for insight_id in reward_insights:
		options.append({"kind": "insight", "id": insight_id})
	return options


func _choose_reward_shortcut(option: Dictionary) -> void:
	match str(option.get("kind", "")):
		"breakthrough":
			_choose_breakthrough(str(option.get("id", "")))
		"card":
			_choose_reward(str(option.get("id", "")))
		"treasure":
			_choose_treasure(str(option.get("id", "")))
		"consumable":
			_choose_consumable(str(option.get("id", "")))
		"insight":
			_choose_insight(str(option.get("id", "")))


func _gain_insight(insight_id: String) -> void:
	if not INSIGHT_LIBRARY.has(insight_id) or insights.has(insight_id):
		return
	insights.append(insight_id)
	var insight: Dictionary = INSIGHT_LIBRARY[insight_id]
	if insight.has("max_qi"):
		max_qi += int(insight["max_qi"])
		qi = max_qi
	if insight.has("max_hp"):
		max_hp += int(insight["max_hp"])
	if insight.has("heal"):
		player_hp = min(max_hp, player_hp + int(insight["heal"]))
	if insight.has("gain_consumable"):
		for _i in int(insight["gain_consumable"]):
			_gain_consumable(_random_consumable_id())
	_log("悟道：" + str(insight["name"]) + "。")
	_check_run_state_achievements()


func _gain_breakthrough(breakthrough_id: String) -> void:
	if not BREAKTHROUGH_LIBRARY.has(breakthrough_id) or breakthroughs.has(breakthrough_id):
		return
	breakthroughs.append(breakthrough_id)
	var breakthrough: Dictionary = BREAKTHROUGH_LIBRARY[breakthrough_id]
	if breakthrough.has("max_qi"):
		max_qi += int(breakthrough["max_qi"])
		qi = max_qi
	if breakthrough.has("max_hp"):
		max_hp += int(breakthrough["max_hp"])
	if breakthrough.has("heal"):
		player_hp = min(max_hp, player_hp + int(breakthrough["heal"]))
	if breakthrough.has("cleanse_curse"):
		_cleanse_inner_demons(int(breakthrough["cleanse_curse"]))
	if breakthrough.has("gain_consumable"):
		if typeof(breakthrough["gain_consumable"]) == TYPE_STRING:
			_gain_consumable(str(breakthrough["gain_consumable"]))
		else:
			for _i in int(breakthrough["gain_consumable"]):
				_gain_consumable(_random_consumable_id())
	_log("破境：" + str(breakthrough["name"]) + "。")
	_check_run_state_achievements()


func _has_treasure(treasure_id: String) -> bool:
	return treasures.has(treasure_id)


func _treasure_value(key: String) -> int:
	var total := 0
	for treasure_id in treasures:
		var treasure: Dictionary = TREASURE_LIBRARY[treasure_id]
		total += int(treasure.get(key, 0))
	return total


func _breakthrough_value(key: String) -> int:
	var total := 0
	for breakthrough_id in breakthroughs:
		if not BREAKTHROUGH_LIBRARY.has(breakthrough_id):
			continue
		var breakthrough: Dictionary = BREAKTHROUGH_LIBRARY[breakthrough_id]
		total += int(breakthrough.get(key, 0))
	return total


func _consumable_bonus_value() -> int:
	return _treasure_value("consumable_bonus") + _insight_value("consumable_bonus") + _breakthrough_value("consumable_bonus")


func _select_origin(origin_id: String) -> void:
	if not ORIGIN_LIBRARY.has(origin_id):
		return
	selected_origin = origin_id
	_save_meta_progress()
	_show_title()


func _select_difficulty(difficulty_id: String) -> void:
	if not DIFFICULTY_LIBRARY.has(difficulty_id):
		return
	selected_difficulty = difficulty_id
	_save_meta_progress()
	_show_title()


func _origin_data(origin_id: String = "") -> Dictionary:
	var key := selected_origin if origin_id.is_empty() else origin_id
	if not ORIGIN_LIBRARY.has(key):
		key = "bamboo_sword"
	return ORIGIN_LIBRARY[key]


func _difficulty_data(difficulty_id: String = "") -> Dictionary:
	var key := selected_difficulty if difficulty_id.is_empty() else difficulty_id
	if not DIFFICULTY_LIBRARY.has(key):
		key = "normal"
	return DIFFICULTY_LIBRARY[key]


func _origin_summary_text() -> String:
	var origin := _origin_data()
	return str(origin["name"]) + "    " + str(origin["desc"])


func _difficulty_summary_text() -> String:
	var difficulty := _difficulty_data()
	return str(difficulty["name"]) + "    " + str(difficulty["desc"])


func _trial_mandate_ids() -> Array[String]:
	var ids: Array[String] = []
	for mandate_id in TRIAL_MANDATE_LIBRARY.keys():
		ids.append(str(mandate_id))
	ids.sort()
	return ids


func _trial_mandate_data() -> Dictionary:
	if TRIAL_MANDATE_LIBRARY.has(trial_mandate_id):
		return TRIAL_MANDATE_LIBRARY[trial_mandate_id]
	return {}


func _assign_trial_mandate() -> void:
	var ids := _trial_mandate_ids()
	if ids.is_empty():
		trial_mandate_id = ""
		trial_mandate_progress = 0
		trial_mandate_completed = true
		return
	trial_mandate_id = ids[rng.randi_range(0, ids.size() - 1)]
	trial_mandate_progress = 0
	trial_mandate_completed = false


func _roll_trial_mandate_options() -> Array[String]:
	var pool := _shuffle_with_run_rng(_trial_mandate_ids())
	var count = min(3, pool.size())
	var options: Array[String] = []
	for i in count:
		options.append(pool[i])
	return options


func _trial_mandate_choice_options() -> Array[Dictionary]:
	var ids := trial_mandate_options.duplicate()
	if ids.is_empty():
		ids = _trial_mandate_ids()
	var options: Array[Dictionary] = []
	for mandate_id in ids:
		if not TRIAL_MANDATE_LIBRARY.has(mandate_id):
			continue
		var mandate: Dictionary = TRIAL_MANDATE_LIBRARY[mandate_id]
		options.append({
			"kind": "choose_mandate",
			"mandate_id": mandate_id,
			"title": "立签：" + str(mandate["name"]),
			"desc": str(mandate["desc"]) + "\n奖励：" + str(mandate["reward"]),
			"tone": "training"
		})
	return options


func _trial_mandate_progress_text() -> String:
	var mandate := _trial_mandate_data()
	if mandate.is_empty():
		return "未立签"
	var target := int(mandate.get("target", 1))
	var state := "已完成" if trial_mandate_completed else "%d/%d" % [min(trial_mandate_progress, target), target]
	return "%s %s" % [str(mandate["name"]), state]


func _trial_mandate_detail_text() -> String:
	var mandate := _trial_mandate_data()
	if mandate.is_empty():
		return "尚未立下试炼签。"
	return "%s｜%s｜进度 %s｜奖励：%s" % [
		str(mandate["name"]),
		str(mandate["desc"]),
		_trial_mandate_progress_text(),
		str(mandate["reward"])
	]


func _trial_mandate_history_text() -> String:
	var mandate := _trial_mandate_data()
	if mandate.is_empty():
		return "无"
	var target := int(mandate.get("target", 1))
	var state := "完成" if trial_mandate_completed else "%d/%d" % [min(trial_mandate_progress, target), target]
	return "%s %s" % [str(mandate["name"]), state]


func _advance_trial_mandate(kind: String, amount: int) -> void:
	if amount <= 0:
		return
	_update_trial_mandate_progress(kind, trial_mandate_progress + amount)


func _note_spirit_stones_changed() -> void:
	_check_run_state_achievements()
	_update_trial_mandate_progress("spirit_stones", spirit_stones)


func _update_trial_mandate_progress(kind: String, value: int) -> void:
	if trial_mandate_completed:
		return
	var mandate := _trial_mandate_data()
	if mandate.is_empty() or str(mandate.get("kind", "")) != kind:
		return
	trial_mandate_progress = max(trial_mandate_progress, value)
	var target := int(mandate.get("target", 1))
	if trial_mandate_progress >= target:
		trial_mandate_progress = target
		_complete_trial_mandate()
	else:
		_log("试炼签进度：" + _trial_mandate_progress_text() + "。")


func _complete_trial_mandate() -> void:
	if trial_mandate_completed:
		return
	trial_mandate_completed = true
	var mandate := _trial_mandate_data()
	_record_completed_trial_mandate(trial_mandate_id)
	_log("试炼签达成：" + str(mandate.get("name", "无名签")) + "。")
	match trial_mandate_id:
		"elite_hunt":
			var pool := _available_treasure_ids()
			if pool.is_empty():
				spirit_stones += 12
				_note_spirit_stones_changed()
				_log("签奖励：法宝已尽，转化为灵石 x12。")
			else:
				var treasure_id := str(pool[rng.randi_range(0, pool.size() - 1)])
				var treasure := _gain_treasure(treasure_id)
				_log("签奖励：获得法宝：" + str(treasure.get("name", "未知法宝")) + "。")
		"spirit_hoard":
			max_qi += 1
			qi = max_qi
			_gain_consumable(_random_consumable_id())
			_check_run_state_achievements()
			_log("签奖励：灵气上限 +1，并获得 1 件随机消耗品。")
		"spell_refine":
			spirit_stones += 14
			player_hp = min(max_hp, player_hp + 8)
			_note_spirit_stones_changed()
			_log("签奖励：获得灵石 x14，并恢复 8 点生命。")
		"clear_mind":
			spirit_stones += 10
			_gain_consumable("clarity_powder")
			_note_spirit_stones_changed()
			_log("签奖励：获得灵石 x10 与清神粉。")
		_:
			spirit_stones += 8
			_note_spirit_stones_changed()
			_log("签奖励：获得灵石 x8。")


func _record_completed_trial_mandate(mandate_id: String) -> void:
	if mandate_id.is_empty() or not TRIAL_MANDATE_LIBRARY.has(mandate_id):
		return
	if completed_trial_mandates.has(mandate_id):
		return
	completed_trial_mandates.append(mandate_id)
	_save_meta_progress()


func _bounty_ids() -> Array[String]:
	var ids: Array[String] = []
	for bounty_id in BOUNTY_LIBRARY.keys():
		ids.append(str(bounty_id))
	ids.sort()
	return ids


func _bounty_data() -> Dictionary:
	if BOUNTY_LIBRARY.has(active_bounty_id):
		return BOUNTY_LIBRARY[active_bounty_id]
	return {}


func _assign_next_bounty() -> void:
	var ids := _available_bounty_ids()
	if ids.is_empty():
		active_bounty_id = ""
		active_bounty_progress = 0
		return
	active_bounty_id = ids[rng.randi_range(0, ids.size() - 1)]
	active_bounty_progress = 0
	var bounty := _bounty_data()
	if not bounty.is_empty():
		_log("接下悬赏：" + _bounty_detail_text())


func _available_bounty_ids() -> Array[String]:
	var ids := _bounty_ids()
	var filtered: Array[String] = []
	for bounty_id in ids:
		var bounty: Dictionary = BOUNTY_LIBRARY[bounty_id]
		match str(bounty.get("kind", "")):
			"cleanse":
				if _has_inner_demon_anywhere():
					filtered.append(bounty_id)
			"upgrade":
				if not _upgradable_card_options().is_empty():
					filtered.append(bounty_id)
			"gain_treasure":
				if not _available_treasure_ids().is_empty():
					filtered.append(bounty_id)
			_:
				filtered.append(bounty_id)
	return filtered if not filtered.is_empty() else ids


func _has_inner_demon_anywhere() -> bool:
	if deck.has("inner_demon"):
		return true
	for pile in [hand, draw_pile, discard_pile, exhaust_pile]:
		if pile.has("inner_demon"):
			return true
	return false


func _bounty_progress_text() -> String:
	var bounty := _bounty_data()
	if bounty.is_empty():
		return "无悬赏"
	var target := int(bounty.get("target", 1))
	return "%s %d/%d" % [str(bounty["name"]), min(active_bounty_progress, target), target]


func _bounty_detail_text() -> String:
	var bounty := _bounty_data()
	if bounty.is_empty():
		return "尚未接下悬赏。"
	return "%s｜%s｜进度 %s｜奖励：%s｜本局已结 %d" % [
		str(bounty["name"]),
		str(bounty["desc"]),
		_bounty_progress_text(),
		str(bounty["reward"]),
		completed_bounty_count
	]


func _advance_bounty(kind: String, amount: int) -> void:
	if amount <= 0 or active_bounty_id.is_empty():
		return
	var bounty := _bounty_data()
	if bounty.is_empty() or str(bounty.get("kind", "")) != kind:
		return
	active_bounty_progress += amount
	var target := int(bounty.get("target", 1))
	if active_bounty_progress >= target:
		_complete_bounty()
	else:
		_log("悬赏进度：" + _bounty_progress_text() + "。")


func _complete_bounty() -> void:
	var bounty_id := active_bounty_id
	var bounty := _bounty_data()
	if bounty.is_empty():
		active_bounty_id = ""
		active_bounty_progress = 0
		return
	completed_bounty_count += 1
	active_bounty_progress = int(bounty.get("target", 1))
	_log("悬赏完成：" + str(bounty["name"]) + "。")
	match bounty_id:
		"battle_patrol":
			spirit_stones += 10
			_gain_consumable(_random_consumable_id())
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x10，并获得 1 件随机消耗品。")
		"elite_warrant":
			spirit_stones += 16
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x16。")
		"spell_commission":
			spirit_stones += 8
			_gain_consumable(_random_consumable_id())
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x8，并获得 1 件随机消耗品。")
		"cleanse_warrant":
			spirit_stones += 12
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x12。")
		"treasure_appraisal":
			spirit_stones += 8
			player_hp = min(max_hp, player_hp + 8)
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x8，并恢复 8 点生命。")
		"market_supply":
			spirit_stones += 8
			_gain_consumable(_random_consumable_id())
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x8，并额外获得 1 件随机消耗品。")
		_:
			spirit_stones += 8
			_note_spirit_stones_changed()
			_log("悬赏赏金：灵石 x8。")
	if not run_finished:
		_assign_next_bounty()


func _lunar_omen_ids() -> Array[String]:
	var ids: Array[String] = []
	for omen_id in LUNAR_OMEN_LIBRARY.keys():
		ids.append(str(omen_id))
	ids.sort()
	return ids


func _assign_lunar_omen() -> void:
	var ids := _lunar_omen_ids()
	if ids.is_empty():
		lunar_omen_id = ""
		return
	lunar_omen_id = ids[abs(run_seed) % ids.size()]
	_log("月相异兆：" + _lunar_omen_detail_text())


func _lunar_omen_data() -> Dictionary:
	if LUNAR_OMEN_LIBRARY.has(lunar_omen_id):
		return LUNAR_OMEN_LIBRARY[lunar_omen_id]
	return {}


func _lunar_omen_name() -> String:
	var omen := _lunar_omen_data()
	return str(omen.get("name", "无月相")) if not omen.is_empty() else "无月相"


func _lunar_omen_detail_text() -> String:
	var omen := _lunar_omen_data()
	if omen.is_empty():
		return "无月相异兆。"
	return "%s｜%s" % [str(omen["name"]), str(omen["desc"])]


func _lunar_omen_value(key: String) -> int:
	var omen := _lunar_omen_data()
	return int(omen.get(key, 0)) if not omen.is_empty() else 0


func _new_run_seed() -> int:
	var ticks := Time.get_unix_time_from_system()
	var jitter := rng.randi_range(1000, 999999)
	return abs(int(ticks) * 1000 + jitter)


func _configured_run_seed() -> int:
	var parsed_seed := _parse_seed_text(seed_override_text)
	return parsed_seed if parsed_seed > 0 else _new_run_seed()


func _daily_challenge_data() -> Dictionary:
	var date := Time.get_date_dict_from_system()
	var year := int(date.get("year", 2026))
	var month := int(date.get("month", 1))
	var day := int(date.get("day", 1))
	var stamp := year * 10000 + month * 100 + day
	var seed := stamp * 97 + 137
	return {
		"id": "daily_" + str(stamp),
		"name": "今日试炼 %04d-%02d-%02d" % [year, month, day],
		"seed": seed
	}


func _daily_challenge_preview_text() -> String:
	var challenge := _daily_challenge_data()
	var omen := _lunar_omen_preview_for_seed(int(challenge["seed"]))
	return "%s：固定种子 %d｜预告月相 %s｜%s｜沿用当前流派与劫数，可用于今日复盘。" % [
		str(challenge["name"]),
		int(challenge["seed"]),
		omen,
		_daily_challenge_focus_text()
	]


func _lunar_omen_preview_for_seed(seed: int) -> String:
	var ids := _lunar_omen_ids()
	if ids.is_empty():
		return "无月相"
	var omen_id := ids[abs(seed) % ids.size()]
	var omen: Dictionary = LUNAR_OMEN_LIBRARY[omen_id]
	return str(omen["name"])


func _daily_challenge_focus_text() -> String:
	var origin := _origin_data(selected_origin)
	var difficulty := _difficulty_data(selected_difficulty)
	var pieces: Array[String] = []
	pieces.append("流派 " + str(origin["name"]))
	pieces.append("劫数 " + str(difficulty["name"]))
	if selected_difficulty == "nightmare":
		pieces.append("目标：黑煞通关/高评阶")
	elif selected_difficulty == "hard":
		pieces.append("目标：稳血通关并冲甲等")
	else:
		pieces.append("目标：补收集或尝试新流派")
	return "今日追踪 " + "｜".join(pieces)


func _challenge_log_suffix() -> String:
	return " / " + run_challenge_name if not run_challenge_name.is_empty() else ""


func _challenge_history_text() -> String:
	return run_challenge_name if not run_challenge_name.is_empty() else "普通试炼"


func _duel_trial_history_text() -> String:
	return str(next_duel_trial.get("name", "无")) if not next_duel_trial.is_empty() else "无"


func _parse_seed_text(text: String) -> int:
	var trimmed := text.strip_edges()
	if trimmed.is_empty():
		return 0
	var share_code := _parse_share_code_text(trimmed)
	if not share_code.is_empty():
		return max(1, int(share_code.get("S", 0)))
	for character in trimmed:
		if not String(character).is_valid_int():
			return 0
	return max(1, int(trimmed))


func _apply_share_code_from_seed_input() -> void:
	var share_code := _parse_share_code_text(seed_override_text)
	if share_code.is_empty():
		return
	var origin_id := str(share_code.get("O", ""))
	if ORIGIN_LIBRARY.has(origin_id):
		selected_origin = origin_id
	var difficulty_id := str(share_code.get("D", ""))
	if DIFFICULTY_LIBRARY.has(difficulty_id):
		selected_difficulty = difficulty_id
	var seed := int(share_code.get("S", 0))
	if seed > 0:
		seed_override_text = str(seed)
	_save_meta_progress()


func _parse_share_code_text(text: String) -> Dictionary:
	var trimmed := text.strip_edges()
	if trimmed.is_empty() or not trimmed.begins_with("QLN"):
		return {}
	var parsed: Dictionary = {}
	var parts := trimmed.split("|", false)
	if parts.is_empty() or str(parts[0]) != "QLN":
		return {}
	for i in range(1, parts.size()):
		var part := str(parts[i]).strip_edges()
		var separator := part.find("=")
		if separator <= 0:
			continue
		var key := part.substr(0, separator).strip_edges()
		var value := part.substr(separator + 1).strip_edges()
		if key.is_empty() or value.is_empty():
			continue
		parsed[key] = value
	if not parsed.has("S"):
		return {}
	var seed_text := str(parsed["S"])
	for character in seed_text:
		if not String(character).is_valid_int():
			return {}
	parsed["S"] = max(1, int(seed_text))
	return parsed


func _starting_deck_for_run() -> Array[String]:
	var cards: Array[String] = []
	var origin := _origin_data()
	cards.assign(origin["deck"])
	for unlock in META_UNLOCKS:
		if cultivation_points >= int(unlock["points"]):
			cards.append(str(unlock["card_id"]))
	return cards


func _award_cultivation(victory: bool) -> int:
	if run_reward_awarded:
		return 0
	run_reward_awarded = true
	var gained: int = max(1, battles_won * 2 + _total_progress())
	if victory:
		gained += 12
		victories += 1
		current_win_streak += 1
		best_win_streak = max(best_win_streak, current_win_streak)
	else:
		current_win_streak = 0
	var difficulty_bonus := float(_difficulty_data().get("cultivation_bonus", 0.0))
	if difficulty_bonus > 0.0:
		gained = int(ceil(float(gained) * (1.0 + difficulty_bonus)))
	cultivation_points += gained
	best_battles = max(best_battles, battles_won)
	_save_meta_progress()
	return gained


func _unlock_achievement(achievement_id: String) -> void:
	if achievements.has(achievement_id):
		return
	var achievement := _achievement_data(achievement_id)
	if achievement.is_empty():
		return
	achievements.append(achievement_id)
	run_achievements.append(achievement_id)
	_save_meta_progress()
	_log("成就解锁：" + str(achievement["name"]))


func _achievement_data(achievement_id: String) -> Dictionary:
	for achievement in ACHIEVEMENT_LIBRARY:
		if str(achievement["id"]) == achievement_id:
			return achievement
	return {}


func _ending_data(ending_id: String) -> Dictionary:
	for ending in ENDING_LIBRARY:
		if str(ending["id"]) == ending_id:
			return ending
	return {}


func _unlock_run_endings(victory: bool) -> void:
	run_endings_unlocked.clear()
	if not victory:
		return
	var ending_ids: Array[String] = ["foundation_moon"]
	match selected_origin:
		"bamboo_sword":
			ending_ids.append("bamboo_sword_path")
		"talisman_roamer":
			ending_ids.append("talisman_roamer_path")
		"spring_healer":
			ending_ids.append("spring_healer_path")
		"demon_tempered":
			ending_ids.append("demon_tempered_path")
		"thunder_roamer":
			ending_ids.append("thunder_roamer_path")
	if not deck.has("inner_demon"):
		ending_ids.append("clean_foundation")
	if selected_difficulty == "nightmare":
		ending_ids.append("nightmare_foundation")
	for ending_id in ending_ids:
		if unlocked_endings.has(ending_id):
			continue
		var ending := _ending_data(ending_id)
		if ending.is_empty():
			continue
		unlocked_endings.append(ending_id)
		run_endings_unlocked.append(ending_id)
		_log("结局解锁：" + str(ending["name"]))
	if not run_endings_unlocked.is_empty():
		_save_meta_progress()


func _challenge_data(challenge_id: String) -> Dictionary:
	for challenge in CHALLENGE_LIBRARY:
		if str(challenge["id"]) == challenge_id:
			return challenge
	return {}


func _unlock_challenge(challenge_id: String) -> void:
	if completed_challenges.has(challenge_id):
		return
	var challenge := _challenge_data(challenge_id)
	if challenge.is_empty():
		return
	completed_challenges.append(challenge_id)
	run_challenges_completed.append(challenge_id)
	_log("挑战完成：" + str(challenge["name"]))


func _record_completed_interlude_oath(oath_id: String) -> void:
	if not INTERLUDE_OATH_LIBRARY.has(oath_id) or completed_interlude_oaths.has(oath_id):
		return
	completed_interlude_oaths.append(oath_id)
	if completed_interlude_oaths.size() >= INTERLUDE_OATH_LIBRARY.size():
		_unlock_challenge("all_interlude_oaths")
	_save_meta_progress()


func _check_run_challenges(victory: bool) -> void:
	if not victory:
		return
	_unlock_challenge("first_foundation")
	if not deck.has("inner_demon"):
		_unlock_challenge("clean_foundation_trial")
	if trial_mandate_completed:
		_unlock_challenge("mandate_fulfilled")
	if completed_trial_mandates.size() >= TRIAL_MANDATE_LIBRARY.size():
		_unlock_challenge("all_mandates_mastered")
	if selected_difficulty == "nightmare":
		_unlock_challenge("nightmare_foundation_trial")
	if not run_challenge_id.is_empty():
		_unlock_challenge("daily_foundation_trial")
	if _duel_trial_was_relevant_this_run():
		_unlock_challenge("duel_oath_clear")
	if ["甲", "甲上"].has(_run_rank(_run_score(true), true)):
		_unlock_challenge("high_rank_foundation")
	if current_win_streak >= 3:
		_unlock_challenge("three_win_streak")
	if flawless_wins >= 3:
		_unlock_challenge("flawless_foundation")
	if interlude_oaths.size() >= 2:
		_unlock_challenge("double_oath_foundation")
	if completed_interlude_oaths.size() >= INTERLUDE_OATH_LIBRARY.size():
		_unlock_challenge("all_interlude_oaths")
	if _mastered_origin_count() >= ORIGIN_LIBRARY.size():
		_unlock_challenge("five_origin_foundation")
	if _nightmare_origin_count() >= ORIGIN_LIBRARY.size():
		_unlock_challenge("all_origin_nightmare")
	if _grandmaster_origin_count() >= ORIGIN_LIBRARY.size():
		_unlock_challenge("all_origin_grandmaster")
	if unlocked_endings.size() >= ENDING_LIBRARY.size():
		_unlock_challenge("full_ending_scroll")
	if not run_challenges_completed.is_empty():
		_save_meta_progress()


func _duel_trial_was_relevant_this_run() -> bool:
	return duel_trials_completed > 0


func _record_origin_mastery(victory: bool) -> void:
	var origin_id := selected_origin
	var record: Dictionary = origin_records.get(origin_id, {})
	var score := _run_score(victory)
	var rank := _run_rank(score, victory)
	record["runs"] = int(record.get("runs", 0)) + 1
	if victory:
		record["clears"] = int(record.get("clears", 0)) + 1
		if score >= int(record.get("best_score", -1)):
			record["best_score"] = score
			record["best_rank"] = rank
	record["best_progress"] = max(int(record.get("best_progress", 0)), _total_progress())
	record["best_battles"] = max(int(record.get("best_battles", 0)), battles_won)
	if _total_progress() >= int(record.get("best_seed_progress", -1)):
		record["best_seed_progress"] = _total_progress()
		record["best_seed"] = run_seed
		record["best_difficulty"] = str(_difficulty_data()["name"])
	record["last_seed"] = run_seed
	record["last_result"] = "通关" if victory else "失败"
	if victory and not deck.has("inner_demon"):
		record["clean_clear"] = true
	if victory and selected_difficulty == "nightmare":
		record["nightmare_clear"] = true
	if victory and ["甲", "甲上"].has(rank):
		record["high_rank_clear"] = true
	origin_records[origin_id] = record
	_save_meta_progress()


func _check_treasure_achievements() -> void:
	if not treasures.is_empty():
		_unlock_achievement("first_treasure")
	if treasures.size() >= 3:
		_unlock_achievement("three_treasures")


func _check_run_state_achievements() -> void:
	if current_act >= 2:
		_unlock_achievement("storm_reached")
	if max_qi >= 5:
		_unlock_achievement("deep_meridians")
	if spirit_stones >= 40:
		_unlock_achievement("spirit_hoard")


func _act_data(act_index: int = -1) -> Dictionary:
	var index := current_act if act_index < 0 else act_index
	index = clamp(index, 0, ACT_LIBRARY.size() - 1)
	return ACT_LIBRARY[index]


func _is_final_act() -> bool:
	return current_act >= ACT_LIBRARY.size() - 1


func _boss_encounter_for_act() -> Dictionary:
	return _boss_encounter_for_act_index(current_act)


func _boss_encounter_for_act_index(act_index: int) -> Dictionary:
	match act_index:
		0:
			return BOSS_ENCOUNTER.duplicate(true)
		1:
			return SECOND_BOSS_ENCOUNTER.duplicate(true)
		_:
			return THIRD_BOSS_ENCOUNTER.duplicate(true)


func _encounters_for_act() -> Array:
	return _encounters_for_act_index(current_act)


func _encounters_for_act_index(act_index: int) -> Array:
	match act_index:
		0:
			return ENCOUNTERS
		1:
			return SECOND_ACT_ENCOUNTERS
		_:
			return THIRD_ACT_ENCOUNTERS


func _elite_encounters_for_act() -> Array:
	return _elite_encounters_for_act_index(current_act)


func _elite_encounters_for_act_index(act_index: int) -> Array:
	match act_index:
		0:
			return ELITE_ENCOUNTERS
		1:
			return SECOND_ACT_ELITE_ENCOUNTERS
		_:
			return THIRD_ACT_ELITE_ENCOUNTERS


func _complete_act_and_continue() -> void:
	_log(str(_act_data()["clear_log"]))
	current_act = min(current_act + 1, ACT_LIBRARY.size() - 1)
	_check_run_state_achievements()
	run_step = 0
	current_is_boss = false
	current_is_elite = false
	in_reward = true
	reward_cards.clear()
	reward_treasures.clear()
	reward_consumables.clear()
	reward_insights.clear()
	reward_breakthroughs = _roll_breakthrough_rewards()
	pending_interlude_oath_options = _roll_interlude_oath_options()
	var heal_amount := 18
	player_hp = min(max_hp, player_hp + heal_amount)
	_log("幕间调息恢复 " + str(heal_amount) + " 点生命，雷光中浮现突破契机；破境后还需立下一项幕间誓约。")
	_save_run_snapshot("reward")
	_refresh()


func _total_progress() -> int:
	return current_act * RUN_STEPS_TO_BOSS + min(run_step, RUN_STEPS_TO_BOSS)


func _total_progress_goal() -> int:
	return ACT_LIBRARY.size() * RUN_STEPS_TO_BOSS


func _record_run_history(title_text: String, victory: bool) -> void:
	if run_history_recorded:
		return
	run_history_recorded = true
	var score := _run_score(victory)
	var entry := {
		"result": title_text,
		"victory": victory,
		"score": score,
		"rank": _run_rank(score, victory),
		"act": current_act + 1,
		"act_name": str(_act_data()["name"]),
		"origin": str(_origin_data()["name"]),
		"origin_title": _origin_mastery_title(origin_records.get(selected_origin, {})),
		"difficulty": str(_difficulty_data()["name"]),
		"win_streak": current_win_streak,
		"best_win_streak": best_win_streak,
		"lunar_omen": _lunar_omen_name(),
		"run_seed": run_seed,
		"share_code": _run_share_code_text(),
		"challenge": _challenge_history_text(),
		"challenge_id": run_challenge_id,
		"duel_trial": _duel_trial_history_text(),
		"duel_trials_completed": duel_trials_completed,
		"flawless_wins": flawless_wins,
		"run_marks": run_marks.duplicate(),
		"interlude_oaths": interlude_oaths.duplicate(),
		"trial_mandate": _trial_mandate_history_text(),
		"bounty": _bounty_progress_text(),
		"bounties_completed": completed_bounty_count,
		"battles_won": battles_won,
		"progress": _total_progress(),
		"deck_size": deck.size(),
		"treasure_count": treasures.size(),
		"insight_count": insights.size(),
		"breakthrough_count": breakthroughs.size(),
		"consumable_count": consumables.size(),
		"max_qi": max_qi,
		"hp": player_hp,
		"max_hp": max_hp,
		"spirit_stones": spirit_stones,
		"cultivation_gained": last_cultivation_gained,
		"run_recap": _run_recap_summary_text(),
		"deck_archetype": _deck_archetype_text(deck),
		"run_diagnosis": _run_diagnosis_text(victory),
		"route_plan": _next_route_plan_text(victory),
		"route_history": route_history.duplicate(),
		"next_run_suggestion": _next_run_suggestion_text(victory),
		"new_achievements": run_achievements.duplicate(),
		"new_endings": run_endings_unlocked.duplicate(),
		"new_challenges": run_challenges_completed.duplicate()
	}
	best_run_score = max(best_run_score, int(entry["score"]))
	run_history.push_front(entry)
	while run_history.size() > MAX_RUN_HISTORY:
		run_history.pop_back()
	_save_meta_progress()


func _load_meta_progress() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	cultivation_points = int(parsed.get("cultivation_points", 0))
	victories = int(parsed.get("victories", 0))
	current_win_streak = int(parsed.get("current_win_streak", 0))
	best_win_streak = int(parsed.get("best_win_streak", 0))
	best_battles = int(parsed.get("best_battles", 0))
	best_run_score = int(parsed.get("best_run_score", 0))
	achievements = _load_string_array(parsed.get("achievements", []))
	unlocked_endings = _load_string_array(parsed.get("unlocked_endings", []))
	completed_challenges = _load_string_array(parsed.get("completed_challenges", []))
	completed_trial_mandates = _load_string_array(parsed.get("completed_trial_mandates", []))
	completed_interlude_oaths = _load_string_array(parsed.get("completed_interlude_oaths", []))
	origin_records = _load_meta_dictionary(parsed.get("origin_records", {}))
	run_history = _load_history_array(parsed.get("run_history", []))
	selected_origin = str(parsed.get("selected_origin", selected_origin))
	selected_difficulty = str(parsed.get("selected_difficulty", selected_difficulty))
	show_decision_hints = bool(parsed.get("show_decision_hints", true))
	show_extended_log = bool(parsed.get("show_extended_log", false))
	use_compact_hand = bool(parsed.get("use_compact_hand", false))
	if not ORIGIN_LIBRARY.has(selected_origin):
		selected_origin = "bamboo_sword"
	if not DIFFICULTY_LIBRARY.has(selected_difficulty):
		selected_difficulty = "normal"


func _save_meta_progress() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		return
	var data := {
		"cultivation_points": cultivation_points,
		"victories": victories,
		"current_win_streak": current_win_streak,
		"best_win_streak": best_win_streak,
		"best_battles": best_battles,
		"best_run_score": best_run_score,
		"achievements": achievements,
		"unlocked_endings": unlocked_endings,
		"completed_challenges": completed_challenges,
		"completed_trial_mandates": completed_trial_mandates,
		"completed_interlude_oaths": completed_interlude_oaths,
		"origin_records": origin_records,
		"run_history": run_history,
		"selected_origin": selected_origin,
		"selected_difficulty": selected_difficulty,
		"show_decision_hints": show_decision_hints,
		"show_extended_log": show_extended_log,
		"use_compact_hand": use_compact_hand
	}
	file.store_string(JSON.stringify(data, "\t"))


func _has_saved_run() -> bool:
	return FileAccess.file_exists(RUN_SAVE_PATH)


func _save_run_snapshot(mode: String) -> void:
	if in_title or run_finished:
		return
	var file := FileAccess.open(RUN_SAVE_PATH, FileAccess.WRITE)
	if file == null:
		return
	var data := {
		"mode": mode,
		"selected_origin": selected_origin,
		"selected_difficulty": selected_difficulty,
		"lunar_omen_id": lunar_omen_id,
		"run_seed": run_seed,
		"run_challenge_id": run_challenge_id,
		"run_challenge_name": run_challenge_name,
		"share_code": _run_share_code_text(),
		"next_duel_trial": next_duel_trial,
		"duel_trials_completed": duel_trials_completed,
		"flawless_wins": flawless_wins,
		"combat_hp_lost": combat_hp_lost,
		"route_history": route_history,
		"run_marks": run_marks,
		"interlude_oaths": interlude_oaths,
		"pending_interlude_oath_options": pending_interlude_oath_options,
		"rng_state": rng.state,
		"trial_mandate_id": trial_mandate_id,
		"trial_mandate_options": trial_mandate_options,
		"trial_mandate_progress": trial_mandate_progress,
		"trial_mandate_completed": trial_mandate_completed,
		"active_bounty_id": active_bounty_id,
		"active_bounty_progress": active_bounty_progress,
		"completed_bounty_count": completed_bounty_count,
		"max_hp": max_hp,
		"player_hp": player_hp,
		"max_qi": max_qi,
		"spirit_stones": spirit_stones,
		"run_step": run_step,
		"current_act": current_act,
		"battles_won": battles_won,
		"encounter_index": encounter_index,
		"current_is_boss": current_is_boss,
		"current_is_elite": current_is_elite,
		"combat_turn": combat_turn,
		"qi": qi,
		"shield": shield,
		"enemy": enemy,
		"enemy_hp": enemy_hp,
		"enemy_block": enemy_block,
		"enemy_flawed": enemy_flawed,
		"enemy_burn": enemy_burn,
		"enemy_weak": enemy_weak,
		"enemy_move_index": enemy_move_index,
		"player_weak": player_weak,
		"player_edge": player_edge,
		"first_attack_played": first_attack_played,
		"first_skill_played": first_skill_played,
		"first_consumable_used": first_consumable_used,
		"next_combat_player_weak": next_combat_player_weak,
		"deck": deck,
		"draw_pile": draw_pile,
		"discard_pile": discard_pile,
		"exhaust_pile": exhaust_pile,
		"hand": hand,
		"treasures": treasures,
		"consumables": consumables,
		"insights": insights,
		"breakthroughs": breakthroughs,
		"pending_nodes": pending_nodes,
		"choice_options": choice_options,
		"choice_art_path": choice_art_path,
		"reward_cards": reward_cards,
		"reward_treasures": reward_treasures,
		"reward_consumables": reward_consumables,
		"reward_insights": reward_insights,
		"reward_breakthroughs": reward_breakthroughs,
		"log_lines": log_lines
	}
	file.store_string(JSON.stringify(data, "\t"))


func _continue_saved_run() -> void:
	var snapshot := _load_run_snapshot()
	if snapshot.is_empty():
		_show_title_detail("journal")
		return
	_restore_run_snapshot(snapshot)


func _load_run_snapshot() -> Dictionary:
	if not FileAccess.file_exists(RUN_SAVE_PATH):
		return {}
	var file := FileAccess.open(RUN_SAVE_PATH, FileAccess.READ)
	if file == null:
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return {}
	return parsed


func _restore_run_snapshot(snapshot: Dictionary) -> void:
	in_title = false
	run_finished = false
	_set_gameplay_visible(true)
	_close_pile_view()
	_clear_children(title_box)
	_clear_children(summary_box)
	title_box.visible = false
	summary_box.visible = false

	selected_origin = str(snapshot.get("selected_origin", selected_origin))
	selected_difficulty = str(snapshot.get("selected_difficulty", selected_difficulty))
	lunar_omen_id = str(snapshot.get("lunar_omen_id", ""))
	run_seed = int(snapshot.get("run_seed", 0))
	run_challenge_id = str(snapshot.get("run_challenge_id", ""))
	run_challenge_name = str(snapshot.get("run_challenge_name", ""))
	next_duel_trial = snapshot.get("next_duel_trial", {}) if typeof(snapshot.get("next_duel_trial", {})) == TYPE_DICTIONARY else {}
	duel_trials_completed = int(snapshot.get("duel_trials_completed", 0))
	flawless_wins = int(snapshot.get("flawless_wins", 0))
	combat_hp_lost = bool(snapshot.get("combat_hp_lost", false))
	route_history = _load_string_array(snapshot.get("route_history", []))
	run_marks = _load_string_array(snapshot.get("run_marks", []))
	interlude_oaths = _load_string_array(snapshot.get("interlude_oaths", []))
	pending_interlude_oath_options = _load_string_array(snapshot.get("pending_interlude_oath_options", []))
	if run_seed <= 0:
		run_seed = _new_run_seed()
	rng.seed = run_seed
	if snapshot.has("rng_state"):
		rng.state = int(snapshot["rng_state"])
	if lunar_omen_id.is_empty() or not LUNAR_OMEN_LIBRARY.has(lunar_omen_id):
		lunar_omen_id = _lunar_omen_ids()[abs(run_seed) % _lunar_omen_ids().size()] if not _lunar_omen_ids().is_empty() else ""
	trial_mandate_id = str(snapshot.get("trial_mandate_id", ""))
	trial_mandate_options = _load_string_array(snapshot.get("trial_mandate_options", []))
	if not trial_mandate_id.is_empty() and not TRIAL_MANDATE_LIBRARY.has(trial_mandate_id):
		trial_mandate_id = _trial_mandate_ids()[0]
	trial_mandate_progress = int(snapshot.get("trial_mandate_progress", 0))
	trial_mandate_completed = bool(snapshot.get("trial_mandate_completed", false))
	active_bounty_id = str(snapshot.get("active_bounty_id", ""))
	var restored_bounty_valid := BOUNTY_LIBRARY.has(active_bounty_id)
	if not restored_bounty_valid:
		_assign_next_bounty()
	active_bounty_progress = int(snapshot.get("active_bounty_progress", 0)) if restored_bounty_valid else 0
	completed_bounty_count = int(snapshot.get("completed_bounty_count", 0))
	max_hp = int(snapshot.get("max_hp", BASE_MAX_HP))
	player_hp = clamp(int(snapshot.get("player_hp", max_hp)), 1, max_hp)
	max_qi = int(snapshot.get("max_qi", 3))
	qi = max_qi
	shield = 0
	spirit_stones = int(snapshot.get("spirit_stones", 0))
	run_step = int(snapshot.get("run_step", 0))
	current_act = clamp(int(snapshot.get("current_act", 0)), 0, ACT_LIBRARY.size() - 1)
	battles_won = int(snapshot.get("battles_won", 0))
	encounter_index = int(snapshot.get("encounter_index", 0))
	current_is_boss = bool(snapshot.get("current_is_boss", false))
	current_is_elite = bool(snapshot.get("current_is_elite", false))
	combat_turn = int(snapshot.get("combat_turn", 0))
	qi = int(snapshot.get("qi", max_qi))
	shield = int(snapshot.get("shield", 0))
	enemy = snapshot.get("enemy", {}) if typeof(snapshot.get("enemy", {})) == TYPE_DICTIONARY else {}
	enemy_hp = int(snapshot.get("enemy_hp", int(enemy.get("max_hp", 0))))
	enemy_block = int(snapshot.get("enemy_block", 0))
	enemy_flawed = bool(snapshot.get("enemy_flawed", false))
	enemy_burn = int(snapshot.get("enemy_burn", 0))
	enemy_weak = int(snapshot.get("enemy_weak", 0))
	enemy_move_index = int(snapshot.get("enemy_move_index", 0))
	next_combat_player_weak = int(snapshot.get("next_combat_player_weak", 0))
	player_weak = int(snapshot.get("player_weak", 0))
	player_edge = int(snapshot.get("player_edge", 0))
	first_attack_played = bool(snapshot.get("first_attack_played", false))
	first_skill_played = bool(snapshot.get("first_skill_played", false))
	first_consumable_used = bool(snapshot.get("first_consumable_used", false))
	run_reward_awarded = false
	run_history_recorded = false
	last_cultivation_gained = 0
	run_achievements.clear()
	run_challenges_completed.clear()
	deck = _load_string_array(snapshot.get("deck", _starting_deck_for_run()))
	draw_pile = _load_string_array(snapshot.get("draw_pile", []))
	discard_pile = _load_string_array(snapshot.get("discard_pile", []))
	exhaust_pile = _load_string_array(snapshot.get("exhaust_pile", []))
	hand = _load_string_array(snapshot.get("hand", []))
	treasures = _load_string_array(snapshot.get("treasures", []))
	consumables = _load_string_array(snapshot.get("consumables", []))
	insights = _load_string_array(snapshot.get("insights", []))
	breakthroughs = _load_string_array(snapshot.get("breakthroughs", []))
	pending_nodes = _load_dictionary_array(snapshot.get("pending_nodes", []))
	choice_options = _load_dictionary_array(snapshot.get("choice_options", []))
	choice_art_path = str(snapshot.get("choice_art_path", ""))
	reward_cards = _load_string_array(snapshot.get("reward_cards", []))
	reward_treasures = _load_string_array(snapshot.get("reward_treasures", []))
	reward_consumables = _load_string_array(snapshot.get("reward_consumables", []))
	reward_insights = _load_string_array(snapshot.get("reward_insights", []))
	reward_breakthroughs = _load_string_array(snapshot.get("reward_breakthroughs", []))
	log_lines = _load_string_array(snapshot.get("log_lines", []))
	var mode := str(snapshot.get("mode", "map"))
	in_reward = mode == "reward"
	in_choice = mode == "choice" or mode == "mandate_choice"
	in_map = not in_reward and not in_choice and mode != "combat"
	if mode != "combat":
		combat_hp_lost = false
	if mode != "combat":
		enemy.clear()
		enemy_hp = 0
		enemy_block = 0
		enemy_flawed = false
		enemy_burn = 0
		enemy_weak = 0
		enemy_move_index = 0
		player_weak = 0
		player_edge = 0
		combat_turn = 0
		current_is_boss = false
		current_is_elite = false
		first_attack_played = false
		first_skill_played = false
		first_consumable_used = false
		draw_pile.clear()
		discard_pile.clear()
		exhaust_pile.clear()
		hand.clear()
	if mode == "mandate_choice" and choice_options.is_empty():
		choice_options = _trial_mandate_choice_options()
	if mode == "mandate_choice":
		choice_art_path = ""
	if in_choice and choice_options.is_empty():
		in_choice = false
		in_map = true
		choice_art_path = ""
	if in_map and pending_nodes.is_empty() and run_step < RUN_STEPS_TO_BOSS:
		pending_nodes = _roll_map_nodes()
	_log("已继续上次试炼。")
	_refresh()


func _clear_run_snapshot() -> void:
	if FileAccess.file_exists(RUN_SAVE_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(RUN_SAVE_PATH))


func _load_string_array(value: Variant) -> Array[String]:
	var result: Array[String] = []
	if typeof(value) != TYPE_ARRAY:
		return result
	for item in value:
		result.append(str(item))
	return result


func _load_dictionary_array(value: Variant) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	if typeof(value) != TYPE_ARRAY:
		return result
	for item in value:
		if typeof(item) == TYPE_DICTIONARY:
			result.append(item)
	return result


func _load_meta_dictionary(value: Variant) -> Dictionary:
	if typeof(value) == TYPE_DICTIONARY:
		return value
	return {}


func _load_history_array(value: Variant) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	if typeof(value) != TYPE_ARRAY:
		return result
	for item in value:
		if typeof(item) == TYPE_DICTIONARY:
			result.append(item)
		if result.size() >= MAX_RUN_HISTORY:
			break
	return result


func _reset_meta_progress() -> void:
	cultivation_points = 0
	victories = 0
	current_win_streak = 0
	best_win_streak = 0
	best_battles = 0
	best_run_score = 0
	achievements.clear()
	run_achievements.clear()
	unlocked_endings.clear()
	run_endings_unlocked.clear()
	completed_challenges.clear()
	run_challenges_completed.clear()
	completed_trial_mandates.clear()
	completed_interlude_oaths.clear()
	origin_records.clear()
	run_history.clear()
	last_cultivation_gained = 0
	run_reward_awarded = false
	run_history_recorded = false
	selected_origin = "bamboo_sword"
	selected_difficulty = "normal"
	run_challenge_id = ""
	run_challenge_name = ""
	show_decision_hints = true
	show_extended_log = false
	use_compact_hand = false
	_clear_run_snapshot()
	if FileAccess.file_exists(SAVE_PATH):
		var user_dir := DirAccess.open("user://")
		if user_dir != null:
			user_dir.remove("qinglan_save.json")
	_show_title()
	_show_title_detail("legacy")


func _show_title_detail(panel_id: String) -> void:
	active_title_panel = panel_id
	if title_detail_box == null:
		return
	_set_title_hub_visible(false)
	_clear_children(title_detail_box)
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 12)
	title_detail_box.add_child(header)
	var title := Label.new()
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 20)
	title.add_theme_color_override("font_color", Color(0.94, 0.78, 0.48))
	header.add_child(title)
	var back := _make_menu_button("返回主页面", COLOR_JADE)
	back.custom_minimum_size = Vector2(140, 40)
	back.add_theme_font_size_override("font_size", 14)
	back.pressed.connect(_show_title)
	header.add_child(back)

	var art_banner := TextureRect.new()
	art_banner.texture = _load_cached_texture(_title_detail_art_path(panel_id))
	art_banner.custom_minimum_size = Vector2(0, 96)
	art_banner.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	art_banner.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art_banner.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	art_banner.modulate = Color(0.76, 0.84, 0.76, 0.78)
	title_detail_box.add_child(art_banner)

	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(780, 330)
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_theme_stylebox_override("panel", QinglanVisuals.textured_panel(PANEL_TEXTURE_PATH))
	title_detail_box.add_child(scroll)

	var body := RichTextLabel.new()
	body.bbcode_enabled = false
	body.fit_content = true
	body.custom_minimum_size = Vector2(760, 0)
	body.add_theme_font_size_override("normal_font_size", 16)
	body.add_theme_color_override("default_color", COLOR_TEXT)
	scroll.add_child(body)

	match panel_id:
		"legacy":
			title.text = "传承玉册"
			body.text = _legacy_detail_text()
		"rules":
			title.text = "试炼要诀"
			body.text = _rules_detail_text()
		"quickstart":
			title.text = "试玩指南"
			body.text = _quickstart_detail_text()
		"guide":
			title.text = "入门引导"
			body.text = _guide_detail_text()
		"codex":
			title.text = "青岚图鉴"
			body.text = _codex_detail_text()
		"achievements":
			title.text = "试炼成就"
			body.text = _achievements_detail_text()
		"challenges":
			title.text = "挑战卷轴"
			body.text = _challenges_detail_text()
		"endings":
			title.text = "结局卷轴"
			body.text = _endings_detail_text()
		"origin_log":
			title.text = "流派志"
			body.text = _origin_log_detail_text()
		"history":
			title.text = "最近战绩"
			body.text = _history_detail_text()
			if not run_history.is_empty():
				var replay_button := _make_menu_button("复现最佳种子", Color(0.35, 0.22, 0.10), "把最近最佳战绩的种子填入标题页，用相同随机序列开始新试炼。")
				replay_button.custom_minimum_size = Vector2(220, 46)
				replay_button.pressed.connect(_use_best_history_seed)
				title_detail_box.add_child(replay_button)
		"journal":
			title.text = "任务札记"
			body.text = _journal_detail_text()
		"balance":
			title.text = "平衡概览"
			body.text = _balance_detail_text()
		"art_status":
			title.text = "Image-2 美术进度"
			body.text = _image2_art_status_text()
		"settings":
			title.text = "设置"
			body.text = _settings_detail_text()
			scroll.custom_minimum_size.y = 250
			var hints_button := _make_menu_button(_decision_hints_button_text(), Color(0.55, 0.58, 0.62), "切换地图节点预估、事件选择预估和敌情研判。")
			hints_button.custom_minimum_size = Vector2(260, 46)
			hints_button.pressed.connect(_toggle_decision_hints)
			title_detail_box.add_child(hints_button)
			var log_density_button := _make_menu_button(_log_density_button_text(), Color(0.52, 0.68, 0.66), "切换主界面日志显示最近 6 条或 10 条；完整日志面板仍保留最近 40 条。")
			log_density_button.custom_minimum_size = Vector2(260, 46)
			log_density_button.pressed.connect(_toggle_log_density)
			title_detail_box.add_child(log_density_button)
			var compact_hand_button := _make_menu_button(_compact_hand_button_text(), Color(0.50, 0.58, 0.72), "切换手牌卡牌尺寸；紧凑模式适合小屏或手牌较多时使用。")
			compact_hand_button.custom_minimum_size = Vector2(260, 46)
			compact_hand_button.pressed.connect(_toggle_compact_hand)
			title_detail_box.add_child(compact_hand_button)
			var abandon_button := _make_menu_button("放弃当前试炼", Color(0.70, 0.36, 0.29), "只清除未完成试炼的自动存档，不会重置修为、成就、结局、流派志或最近战绩。")
			abandon_button.custom_minimum_size = Vector2(260, 46)
			abandon_button.disabled = not _has_saved_run()
			abandon_button.pressed.connect(_abandon_saved_run)
			title_detail_box.add_child(abandon_button)
		_:
			title.text = ""
			body.text = ""


func _title_detail_art_path(panel_id: String) -> String:
	match panel_id:
		"archive", "codex", "rules", "quickstart", "guide", "art_status":
			return CARD_BACK_PATH
		"legacy_hub", "legacy", "achievements", "challenges", "origin_log":
			return CARD_FOUNDATION_SURGE_ART_PATH
		"endings":
			return ACT_BACKGROUND_PATHS[2]
		"records", "history", "journal", "balance":
			return CARD_SPIRIT_STONE_ART_PATH
		"settings":
			return TITLE_BACKGROUND_PATH
		_:
			return CARD_BREATH_CYCLE_ART_PATH


func _meta_progress_text() -> String:
	var summary := "传承修为 %d    通关 %d    连胜 %d/%d    最佳胜场 %d    最佳评阶 %s    流派通关 %d/%d    黑煞流派 %d/%d    甲等流派 %d/%d    成就 %d/%d    挑战 %d/%d    试炼签 %d/%d    誓约 %d/%d    结局 %d/%d" % [
		cultivation_points,
		victories,
		current_win_streak,
		best_win_streak,
		best_battles,
		_best_run_rank_text(),
		_mastered_origin_count(),
		ORIGIN_LIBRARY.size(),
		_nightmare_origin_count(),
		ORIGIN_LIBRARY.size(),
		_grandmaster_origin_count(),
		ORIGIN_LIBRARY.size(),
		achievements.size(),
		ACHIEVEMENT_LIBRARY.size(),
		completed_challenges.size(),
		CHALLENGE_LIBRARY.size(),
		completed_trial_mandates.size(),
		TRIAL_MANDATE_LIBRARY.size(),
		completed_interlude_oaths.size(),
		INTERLUDE_OATH_LIBRARY.size(),
		unlocked_endings.size(),
		ENDING_LIBRARY.size()
	]
	return "%s\n誓约卷缺口：%s\n%s" % [summary, _missing_interlude_oath_names_text(), _unlock_progress_text()]


func _unlock_progress_text() -> String:
	var unlocked: Array[String] = []
	var next_unlock := ""
	for unlock in META_UNLOCKS:
		if cultivation_points >= int(unlock["points"]):
			unlocked.append(str(unlock["name"]))
		elif next_unlock.is_empty():
			next_unlock = "下一解锁：" + str(unlock["name"]) + "（修为 " + str(unlock["points"]) + "）"
	var unlocked_text := "已解锁起始术法：" + ("、".join(unlocked) if not unlocked.is_empty() else "无")
	if not next_unlock.is_empty():
		return unlocked_text + "    " + next_unlock
	return unlocked_text + "    传承术法已全部解锁"


func _legacy_detail_text() -> String:
	var lines: Array[String] = [
		"累计修为会在每局结算后保存。胜场、推进进度和通关都会提高修为。",
		"当前流派：" + _origin_summary_text(),
		"当前劫数：" + _difficulty_summary_text(),
		"当前额外起始牌：" + _starting_unlock_names(),
		"传承进度：" + _legacy_next_unlock_text(),
		"连胜记录：当前 " + str(current_win_streak) + "｜最高 " + str(best_win_streak),
		"最佳评阶：" + _best_run_rank_text(),
		"推荐目标：" + _legacy_recommended_achievements_text(),
		"流派目标：" + _recommended_origin_goal_text(),
		"最佳战绩：" + _legacy_best_history_text(),
		"挑战进度：" + _challenge_progress_text(),
		"试炼签卷：" + _mandate_mastery_progress_text(),
		"流派称号：" + str(_grandmaster_origin_count()) + "/" + str(ORIGIN_LIBRARY.size()) + " 个流派达到甲等传人或更高",
		"结局进度：" + _ending_progress_text(),
		"已获成就：" + _achievement_names_text(),
		"解锁路径：" + _unlock_path_text()
	]
	return "\n".join(lines)


func _legacy_next_unlock_text() -> String:
	for unlock in META_UNLOCKS:
		var required := int(unlock["points"])
		if cultivation_points < required:
			return "%s 还需修为 %d（%d/%d）" % [
				str(unlock["name"]),
				required - cultivation_points,
				cultivation_points,
				required
			]
	return "传承术法已全部解锁，后续修为仍会记录在玉册中。"


func _settings_detail_text() -> String:
	return "\n".join([
		"决策提示：" + ("开启" if show_decision_hints else "关闭"),
		"开启时：地图节点、事件选项和敌情面板会显示收益、风险与当前状态建议，适合学习路线、复盘和调参。",
		"关闭时：保留基础描述、卡牌说明和日志，减少悬停文字与战斗面板信息密度。",
		"主界面日志：" + ("详细（最近 10 条）" if show_extended_log else "简略（最近 6 条）"),
		"详细日志适合复盘复杂回合；完整日志面板仍保留最近 40 条记录。",
		"手牌布局：" + ("紧凑（较小卡牌）" if use_compact_hand else "标准（完整卡牌）"),
		"紧凑手牌适合小屏或后期手牌较多时使用；奖励牌仍保持完整尺寸。",
		"快捷键 H 可随时切换决策提示；这些偏好会写入传承存档，重开游戏后仍会保留。",
		"当前试炼存档：" + _saved_run_summary_text(),
		"战斗中可用 Esc 保存当前战斗并返回标题，再用继续试炼回到同一场战斗。"
	])


func _saved_run_summary_text() -> String:
	var snapshot := _load_run_snapshot()
	if snapshot.is_empty():
		return "没有未完成试炼。"
	var mode := str(snapshot.get("mode", "map"))
	var mode_name := _run_snapshot_mode_name(mode)
	var act_index: int = clamp(int(snapshot.get("current_act", 0)), 0, ACT_LIBRARY.size() - 1)
	var act: Dictionary = ACT_LIBRARY[act_index]
	return "%s｜第%d幕 %s｜本幕进度 %d/%d｜战斗胜利 %d｜种子 %d｜复盘码 %s｜%s" % [
		mode_name,
		act_index + 1,
		str(act["name"]),
		int(snapshot.get("run_step", 0)),
		RUN_STEPS_TO_BOSS,
		int(snapshot.get("battles_won", 0)),
		int(snapshot.get("run_seed", 0)),
		str(snapshot.get("share_code", _run_share_code_from_snapshot(snapshot))),
		str(snapshot.get("run_challenge_name", "普通试炼")) if not str(snapshot.get("run_challenge_name", "")).is_empty() else "普通试炼"
	]


func _run_snapshot_mode_name(mode: String) -> String:
	match mode:
		"combat":
			return "战斗中"
		"reward":
			return "奖励选择"
		"choice":
			return "事件选择"
		"mandate_choice":
			return "试炼签选择"
		"map":
			return "路线选择"
		_:
			return mode


func _decision_hints_button_text() -> String:
	return "决策提示：" + ("开" if show_decision_hints else "关")


func _log_density_button_text() -> String:
	return "日志显示：" + ("详" if show_extended_log else "简")


func _compact_hand_button_text() -> String:
	return "手牌布局：" + ("紧" if use_compact_hand else "标")


func _abandon_saved_run() -> void:
	_clear_run_snapshot()
	if in_title:
		_show_title()
		_show_title_detail("settings")


func _toggle_decision_hints() -> void:
	show_decision_hints = not show_decision_hints
	_save_meta_progress()
	if in_title:
		_show_title_detail("settings")
	else:
		_refresh()


func _toggle_log_density() -> void:
	show_extended_log = not show_extended_log
	_save_meta_progress()
	if in_title:
		_show_title_detail("settings")
	else:
		_refresh()


func _toggle_compact_hand() -> void:
	use_compact_hand = not use_compact_hand
	_save_meta_progress()
	if in_title:
		_show_title_detail("settings")
	else:
		_refresh()


func _best_run_rank_text() -> String:
	if best_run_score <= 0:
		return "暂无"
	return "%s（%d）" % [_run_rank(best_run_score, true), best_run_score]


func _mastered_origin_count() -> int:
	var count := 0
	for origin_id in ORIGIN_LIBRARY.keys():
		var record: Dictionary = origin_records.get(str(origin_id), {})
		if int(record.get("clears", 0)) > 0:
			count += 1
	return count


func _nightmare_origin_count() -> int:
	var count := 0
	for origin_id in ORIGIN_LIBRARY.keys():
		var record: Dictionary = origin_records.get(str(origin_id), {})
		if bool(record.get("nightmare_clear", false)):
			count += 1
	return count


func _grandmaster_origin_count() -> int:
	var count := 0
	for origin_id in ORIGIN_LIBRARY.keys():
		var record: Dictionary = origin_records.get(str(origin_id), {})
		if bool(record.get("high_rank_clear", false)):
			count += 1
	return count


func _origin_mastery_title(record: Dictionary) -> String:
	if int(record.get("clears", 0)) <= 0:
		if int(record.get("runs", 0)) > 0:
			return "试炼门人"
		return "未入门"
	if bool(record.get("high_rank_clear", false)) and bool(record.get("nightmare_clear", false)) and bool(record.get("clean_clear", false)):
		return "宗师"
	if bool(record.get("high_rank_clear", false)):
		return "甲等传人"
	if bool(record.get("nightmare_clear", false)):
		return "破煞传人"
	if bool(record.get("clean_clear", false)):
		return "澄心传人"
	return "筑基传人"


func _recommended_origin_goal_text() -> String:
	for origin_id in ORIGIN_LIBRARY.keys():
		var record: Dictionary = origin_records.get(str(origin_id), {})
		if int(record.get("clears", 0)) <= 0:
			return "尝试以%s筑基，补齐流派结局。" % str(_origin_data(str(origin_id))["name"])
	for origin_id in ORIGIN_LIBRARY.keys():
		var record: Dictionary = origin_records.get(str(origin_id), {})
		if not bool(record.get("nightmare_clear", false)):
			return "尝试以%s完成黑煞劫通关。" % str(_origin_data(str(origin_id))["name"])
	for origin_id in ORIGIN_LIBRARY.keys():
		var record: Dictionary = origin_records.get(str(origin_id), {})
		if not bool(record.get("high_rank_clear", false)):
			return "尝试以%s冲刺甲等通关，补齐诸脉宗师。" % str(_origin_data(str(origin_id))["name"])
	return "五脉皆有甲等与黑煞记录，可冲无垢、甲上与今日试炼复现。"


func _origin_log_detail_text() -> String:
	var lines: Array[String] = [
		"流派通关 %d/%d｜黑煞通关 %d/%d｜甲等流派 %d/%d｜%s" % [
			_mastered_origin_count(),
			ORIGIN_LIBRARY.size(),
			_nightmare_origin_count(),
			ORIGIN_LIBRARY.size(),
			_grandmaster_origin_count(),
			ORIGIN_LIBRARY.size(),
			_recommended_origin_goal_text()
		]
	]
	var ids := ORIGIN_LIBRARY.keys()
	ids.sort()
	for origin_id in ids:
		var key := str(origin_id)
		var origin := _origin_data(key)
		var record: Dictionary = origin_records.get(key, {})
		lines.append("%s｜称号 %s｜游玩 %d｜通关 %d｜最佳进度 %d/%d｜最佳胜场 %d｜最佳评阶 %s｜最佳种子 %s｜最佳劫数 %s｜无垢 %s｜黑煞 %s｜甲等 %s｜最近 %s" % [
			str(origin["name"]),
			_origin_mastery_title(record),
			int(record.get("runs", 0)),
			int(record.get("clears", 0)),
			int(record.get("best_progress", 0)),
			_total_progress_goal(),
			int(record.get("best_battles", 0)),
			str(record.get("best_rank", "无")),
			str(record.get("best_seed", "无")),
			str(record.get("best_difficulty", "无")),
			"是" if bool(record.get("clean_clear", false)) else "否",
			"是" if bool(record.get("nightmare_clear", false)) else "否",
			"是" if bool(record.get("high_rank_clear", false)) else "否",
			str(record.get("last_result", "未尝试"))
		])
	return "\n".join(lines)


func _legacy_recommended_achievements_text() -> String:
	var names: Array[String] = []
	for achievement in ACHIEVEMENT_LIBRARY:
		var achievement_id := str(achievement["id"])
		if achievements.has(achievement_id):
			continue
		names.append(str(achievement["name"]) + "：" + str(achievement["desc"]))
		if names.size() >= 3:
			break
	return "、".join(names) if not names.is_empty() else "全部成就已达成。"


func _legacy_best_history_text() -> String:
	if run_history.is_empty():
		return "尚无战绩。完成或失败一局后会记录最佳推进。"
	var best_entry := _best_history_entry()
	return "%s｜%s｜%s｜总进度 %d/%d｜战斗 %d｜种子 %d｜复盘码 %s" % [
		str(best_entry.get("result", "试炼记录")),
		str(best_entry.get("origin", "未知流派")),
		str(best_entry.get("difficulty", "未知劫数")),
		int(best_entry.get("progress", 0)),
		_total_progress_goal(),
		int(best_entry.get("battles_won", 0)),
		int(best_entry.get("run_seed", 0)),
		str(best_entry.get("share_code", "QLN|S=" + str(int(best_entry.get("run_seed", 0)))))
	]


func _best_history_entry() -> Dictionary:
	if run_history.is_empty():
		return {}
	var best_entry: Dictionary = run_history[0]
	for entry in run_history:
		var entry_progress := int(entry.get("progress", 0))
		var best_progress := int(best_entry.get("progress", 0))
		if entry_progress > best_progress:
			best_entry = entry
		elif entry_progress == best_progress and bool(entry.get("victory", false)) and not bool(best_entry.get("victory", false)):
			best_entry = entry
	return best_entry


func _use_best_history_seed() -> void:
	var best_entry := _best_history_entry()
	var best_seed := int(best_entry.get("run_seed", 0))
	if best_seed <= 0:
		return
	seed_override_text = str(best_seed)
	_show_title()
	_show_title_detail("history")


func _rules_detail_text() -> String:
	var sections: Array[String] = [
		"【试炼结构】\n选择流派决定起始牌组和开战被动，选择劫数决定敌人强度与结算修为倍率。试炼分为 %d 幕，每幕选择路线推进 %d 步后挑战本幕 Boss；破开青岚谷与玄阴山道后会引来筑基雷劫，击败终幕 Boss 才算筑基成功。" % [ACT_LIBRARY.size(), RUN_STEPS_TO_BOSS],
		"【战斗】\n战斗中用灵气打出术法和法门，敌人意图会预告伤害、护体、虚弱或心魔污染。玩家要在输出、护盾、过牌、净化、剑势蓄爆和消耗品之间取舍；手牌上限为 %d，心魔杂念会占用手牌空间。" % MAX_HAND_SIZE,
		"【奖励与路线】\n奖励牌按稀有度和幕数加权，后续幕更容易出现珍品、后期术法和已精研术法；奖励页可花灵石重掷当前奖励。每局按种子确定 1 条月相异兆，随后抽取 1 条试炼签作为整局目标，并持续刷新悬赏令作为短期目标；这些目标与异兆会改变起手、敌势、灵石、精研、净心、获法宝或坊市采买等取舍。精英战更危险，但胜利必定出现法宝或悟道选择；普通推进到中段也可能悟出一门本局被动。",
		"【修行成长】\n击败非终局 Boss 后会进入幕间突破，从三种破境方向里选择一项局内永久强化。坊市可买牌、净心删牌、淘买法宝或购置消耗品；调息节点可选择大幅恢复、温养精研或整理消耗品；修炼节点可升级、删牌或提高灵气上限。",
		"【读局面】\n敌情面板会同时显示本回合意图、下一式预告、敌人威胁标签和行动计划。奖励页会显示奖励决策摘要，牌组页会给出补强优先级，任务札记会汇总当前待办、试炼签、悬赏、月相和路线轨迹；设置页可切换决策提示和主界面日志密度，完整日志仍保留最近 40 条记录。",
		"【操作】\nEnter 从标题页开始普通试炼；战斗中数字 1-7 打出对应手牌，Space 结束回合。J 打开任务札记，G 打开引导，K 打开关键词/规则，D 查看牌组，L 查看日志；Esc 收起面板或在非战斗选择状态返回标题。",
		"【关键词】\n" + _keywords_detail_text()
	]
	return "\n\n".join(sections)


func _quickstart_detail_text() -> String:
	var origin: Dictionary = ORIGIN_LIBRARY.get(selected_origin, ORIGIN_LIBRARY["bamboo_sword"])
	var sections: Array[String] = [
		"【三步开局】\n1. 第一次试玩可直接点“推荐开局”，自动使用青竹剑修、凡阶试炼、随机种子和决策提示；也可手动选择当前流派：%s。\n2. 熟悉后再打破雾劫、黑煞劫或粘贴复盘码。\n3. 开局试炼签优先选能自然完成的目标，不要为了目标牺牲血线。" % str(origin.get("name", "青竹剑修")),
		"【第一幕路线】\n血量低走调息/药圃；牌组厚或有心魔走坊市/修炼；状态稳再打精英。看到灵脉裂隙时，只有血线安全才强取灵气。",
		"【战斗读法】\n先看敌人意图和下一式，再决定本回合灵气：敌人攻击就护盾/回血，敌人护体或蓄势就补输出、燃烧或虚弱。剑势牌先蓄后打多段攻击。",
		"【奖励取舍】\n奖励页先看推荐度和牌组补强优先级。攻击少补主力攻击，防御少补护盾/恢复，过牌少找御风步/通脉诀，心魔多先净心。没有契合牌时可以跳过或重掷。",
		"【复盘目标】\n每局结束看构筑定位、关键短板和路线计划；失败不是坏事，最近战绩会记录种子、路线、短板和下局建议，可以复现最佳种子继续练。",
		"【美术状态】\n首批卡牌和敌人已有图；Image-2 计划图会在美术进度、图鉴和事件背景状态里标注。后续把成品 PNG 按 `docs/image2_batch_prompts.jsonl` 的 expected_filename 命名，再用 `--import-dir` 批量导入。"
	]
	return "\n\n".join(sections)


func _guide_detail_text() -> String:
	var sections: Array[String] = [
		"【第一局推荐】\n选择青竹剑修与凡阶试炼。青竹剑修攻防均衡，开局护盾能帮你观察敌人意图；凡阶试炼没有额外敌人修正，适合先熟悉路线、奖励和心魔污染。",
		"【战斗节奏】\n每回合先看敌人意图，再决定灵气怎么分配。敌人将攻击时优先留护盾或回血；敌人护体、露破绽或污染牌堆时，可以用攻击、燃烧、虚弱或净心牌抢节奏。剑势会强化下一张攻击，适合先蓄势再打多段牌。",
		"【路线选择】\n生命偏低时选调息或灵草药圃；牌组臃肿或有心魔时找坊市净心、竹林参悟或镇魂古龛；灵气吃紧时选灵脉裂隙、竹林参悟或开脉悟道；状态稳定时挑战精英，精英更危险，但法宝和悟道收益更高。",
		"【奖励取舍】\n不要每张牌都拿。先看奖励决策摘要和牌组补强优先级：伤害不足拿攻击，防御不足拿护盾/恢复，牌组变厚拿抽牌，心魔变多拿净除。奖励页可以重掷，灵石不够或奖励不适合时，调息跳过也是正确选择。",
		"【常见构筑】\n剑修爆发：攻击牌、多段伤害、剑势、剑心突破。符火灼烧：火弹符、阴火符、天火符、余烬珠、符火入脉。稳健筑基：护盾、恢复、清心、玉骨、调息节点。心魔苦修：高伤害反噬配净心手段，别让心魔堵满手牌。",
		"【复盘习惯】\n战斗中先读行动计划与下一式，再决定是否留护盾、抢斩杀或保留消耗品。局内用任务札记检查当前待办，复杂回合打开完整日志复盘；局外用最近战绩复现最佳种子，补齐结局、试炼签、流派通关和挑战卷轴。"
	]
	return "\n\n".join(sections)


func _keywords_detail_text() -> String:
	var lines: Array[String] = []
	for keyword in KEYWORD_LIBRARY:
		lines.append("%s｜%s" % [keyword["name"], keyword["desc"]])
	return "\n".join(lines)


func _full_log_text() -> String:
	if log_lines.is_empty():
		return "暂无日志。进入试炼后，战斗、事件、奖励和成就记录会显示在这里。"
	return "\n".join(log_lines)


func _balance_detail_text() -> String:
	var sections: Array[String] = [
		"【牌池】\n" + _balance_cards_text(),
		"【局内成长】\n" + _balance_progression_text(),
		"【敌人曲线】\n" + _balance_enemies_text(),
		"【奖励与经济】\n" + _balance_rewards_text(),
		"【路线结构】\n" + _balance_map_text()
	]
	return "\n\n".join(sections)


func _balance_cards_text() -> String:
	var all_counts := _empty_rarity_counts()
	var starting_ids: Array[String] = []
	var curse_count := 0
	for card_id in CARD_LIBRARY.keys():
		var rarity := str(CARD_LIBRARY[card_id].get("rarity", "common"))
		_increment_balance_count(all_counts, rarity)
		if rarity == "curse":
			curse_count += 1
		if STARTING_DECK.has(str(card_id)):
			starting_ids.append(str(card_id))
	var act_one_counts := _reward_card_counts_for_act(0)
	var lines: Array[String] = [
		"总卡牌 %d 张；基础起始牌 %d 种；心魔牌 %d 种。" % [CARD_LIBRARY.size(), starting_ids.size(), curse_count],
		"全牌池：" + _rarity_count_text(all_counts),
		"第1幕奖励池：%d 张｜%s｜权重 %s" % [_rarity_total(act_one_counts), _rarity_count_text(act_one_counts), _reward_weight_text_for_act(0)],
		"奖励池会排除基础起始牌与心魔牌；带有登场幕限制的牌只会在对应幕后进入奖励池。",
		"精研上限：每张牌最多 +%d；攻击、护盾、治疗、燃烧、虚弱、剑势和过牌牌会按已有升级规则提升。" % MAX_CARD_UPGRADE
	]
	for act_index in range(1, ACT_LIBRARY.size()):
		var counts := _reward_card_counts_for_act(act_index)
		lines.insert(lines.size() - 2, "第%d幕奖励池：%d 张｜%s｜权重 %s" % [
			act_index + 1,
			_rarity_total(counts),
			_rarity_count_text(counts),
			_reward_weight_text_for_act(act_index)
		])
	return "\n".join(lines)


func _balance_progression_text() -> String:
	var lines: Array[String] = [
		"起始流派 %d 个，覆盖攻防均衡、燃烧爆发、恢复续航、心魔高风险和消耗品爆发。" % ORIGIN_LIBRARY.size(),
		"法宝 %d 件；悟道 %d 门；破境 %d 项；消耗品 %d 种。" % [TREASURE_LIBRARY.size(), INSIGHT_LIBRARY.size(), BREAKTHROUGH_LIBRARY.size(), CONSUMABLE_LIBRARY.size()],
		"月相异兆 %d 条；悬赏令 %d 条；试炼签 %d 条；本局印记 %d 枚。" % [LUNAR_OMEN_LIBRARY.size(), BOUNTY_LIBRARY.size(), TRIAL_MANDATE_LIBRARY.size(), RUN_MARK_LIBRARY.size()],
		"单次奖励特殊项收束：法宝最多 2 件，悟道最多 1 门，消耗品最多 1 种。",
		"每次击败非终局 Boss 后出现 3 个未取得破境方向，必须选择 1 项再进入下一幕。",
		"精英战必定带出法宝选择，并可能出现悟道与消耗品；普通推进到中段也会触发一次悟道机会。",
		"传承解锁 %d 档额外起始牌；成就 %d 项；挑战 %d 项；结局 %d 卷；流派记录 %d 脉；战绩保留最近 %d 局。" % [META_UNLOCKS.size(), ACHIEVEMENT_LIBRARY.size(), CHALLENGE_LIBRARY.size(), ENDING_LIBRARY.size(), ORIGIN_LIBRARY.size(), MAX_RUN_HISTORY]
	]
	return "\n".join(lines)


func _balance_enemies_text() -> String:
	var lines: Array[String] = []
	for act_index in ACT_LIBRARY.size():
		lines.append(_enemy_balance_line("第%d幕 普通" % [act_index + 1], _encounters_for_act_index(act_index)))
		lines.append(_enemy_balance_line("第%d幕 精英" % [act_index + 1], _elite_encounters_for_act_index(act_index)))
		lines.append(_enemy_balance_line("第%d幕 Boss" % [act_index + 1], [_boss_encounter_for_act_index(act_index)]))
	lines.append("劫数修正：破雾劫 +8 生命 / +1 伤害 / +2 护体；黑煞劫 +16 生命 / +2 伤害 / +4 护体。")
	return "\n".join(lines)


func _balance_rewards_text() -> String:
	var lines: Array[String] = [
		"战斗胜利基础灵石：6 + 已胜战斗数 x3；精英战额外 +8；灵玉算盘额外 +4。",
		"奖励牌每次 3 张；奖励重掷基础价 6 灵石，坊市木牌后 4 灵石。",
		"奖励牌精研概率：第1幕 0%，第2幕 18%，第3幕 35%。",
		"坊市基础价：买牌 10，净心删牌 8，淘买法宝 18，买消耗品 7。",
		"坊市木牌折扣后：买牌 7，净心 6，法宝 15，消耗品 5。",
		"调息节点三选一：恢复 18 并压下虚弱；恢复 8 并精研 1 张牌；恢复 6 并获得随机消耗品。",
		"洞府、古龛、残炉和雷池事件会提供额外牌、灵石、消耗品、悟道、法宝或心魔风险，形成短期收益和牌组污染的取舍。"
	]
	return "\n".join(lines)


func _balance_map_text() -> String:
	var lines: Array[String] = [
		"每幕路线推进 %d 步后进入本幕 Boss；当前共 %d 幕。" % [RUN_STEPS_TO_BOSS, ACT_LIBRARY.size()]
	]
	for i in ACT_LIBRARY.size():
		var act: Dictionary = ACT_LIBRARY[i]
		var nodes := _map_nodes_for_act_index(i)
		lines.append("第%d幕 %s：%d 类节点｜%s" % [i + 1, act["name"], nodes.size(), _map_node_names_for_act(i)])
	return "\n".join(lines)


func _image2_art_status_text() -> String:
	var manifest := _load_image2_manifest()
	if manifest.is_empty():
		return "未读取到 Image-2 资产清单：" + IMAGE2_MANIFEST_PATH
	var generated: Array = manifest.get("generated_assets", []) if typeof(manifest.get("generated_assets", [])) == TYPE_ARRAY else []
	var planned: Array = manifest.get("planned_assets", []) if typeof(manifest.get("planned_assets", [])) == TYPE_ARRAY else []
	var generated_present := _image2_generated_present_count(generated)
	var planned_ready := _image2_planned_ready_count(planned)
	var queue_state := "已导出" if FileAccess.file_exists(IMAGE2_QUEUE_PATH) else "未导出"
	var lines: Array[String] = [
		"风格锚点：" + str(manifest.get("style_anchor", "未填写")),
		"已生成记录：%d 条｜文件可读：%d 条｜计划队列：%d 条｜已落地计划图：%d 条｜生成队列：%s" % [
			generated.size(),
			generated_present,
			planned.size(),
			planned_ready,
			queue_state
		],
		"自动接入：卡牌/敌人会优先读取 `image2_target_art`；关键事件选择页会优先读取对应 16:9 背景目标路径；路线节点图鉴会标注背景素材状态。",
		"",
		"【下一批优先级】"
	]
	lines.append_array(_image2_planned_lines(planned))
	lines.append("")
	lines.append("【缺失目标文件】")
	lines.append_array(_image2_missing_target_lines(planned))
	lines.append("")
	lines.append("【生成尝试日志】")
	lines.append_array(_image2_attempt_status_lines())
	lines.append("")
	lines.append("【当前复用缺口】")
	lines.append_array(_image2_reuse_gap_lines())
	lines.append("")
	lines.append("【已生成资产】")
	lines.append_array(_image2_generated_lines(generated))
	return "\n".join(lines)


func _load_image2_manifest() -> Dictionary:
	if not FileAccess.file_exists(IMAGE2_MANIFEST_PATH):
		return {}
	var file := FileAccess.open(IMAGE2_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return {}
	return parsed


func _image2_generated_present_count(records: Array) -> int:
	var count := 0
	for item in records:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		if FileAccess.file_exists(str(item.get("path", ""))):
			count += 1
	return count


func _image2_planned_ready_count(records: Array) -> int:
	var count := 0
	for item in records:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		if FileAccess.file_exists(str(item.get("target_path", ""))):
			count += 1
	return count


func _image2_planned_lines(records: Array) -> Array[String]:
	var lines: Array[String] = []
	var sorted := records.duplicate(true)
	sorted.sort_custom(func(a, b) -> bool:
		return _image2_priority_rank(str(a.get("priority", ""))) < _image2_priority_rank(str(b.get("priority", "")))
	)
	for item in sorted:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		var record: Dictionary = item
		var target_path := str(record.get("target_path", ""))
		lines.append("%s｜%s｜%s｜%s｜%s" % [
			_image2_priority_name(str(record.get("priority", ""))),
			str(record.get("name", record.get("id", "unknown"))),
			str(record.get("kind", "unknown")),
			"已落地" if FileAccess.file_exists(target_path) else "待生成",
			_image2_drop_in_text(record)
		])
	if lines.is_empty():
		lines.append("暂无计划资产。")
	return lines


func _image2_missing_target_lines(records: Array) -> Array[String]:
	var lines: Array[String] = []
	var sorted := records.duplicate(true)
	sorted.sort_custom(func(a, b) -> bool:
		return _image2_priority_rank(str(a.get("priority", ""))) < _image2_priority_rank(str(b.get("priority", "")))
	)
	for item in sorted:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		var record: Dictionary = item
		var target_path := str(record.get("target_path", ""))
		if target_path.is_empty() or FileAccess.file_exists(target_path):
			continue
		lines.append("%s｜%s｜%s" % [
			_image2_priority_name(str(record.get("priority", ""))),
			str(record.get("name", record.get("id", "unknown"))),
			target_path
		])
	if lines.is_empty():
		lines.append("缺失目标文件：无，计划素材已落地。")
	return lines


func _image2_attempt_status_lines() -> Array[String]:
	if not FileAccess.file_exists(IMAGE2_ATTEMPTS_PATH):
		return ["尝试日志：未建立。"]
	var file := FileAccess.open(IMAGE2_ATTEMPTS_PATH, FileAccess.READ)
	if file == null:
		return ["尝试日志：无法读取。"]
	var text := file.get_as_text()
	var attempt_count := 0
	var last_heading := ""
	for raw_line in text.split("\n"):
		var line := str(raw_line)
		if line.begins_with("## "):
			attempt_count += 1
			last_heading = line.substr(3)
	var lines: Array[String] = [
		"尝试日志：%d 次记录｜最近：%s" % [attempt_count, last_heading if not last_heading.is_empty() else "未记录"]
	]
	if text.contains("no import performed") or text.contains("no new filesystem artifact") or text.contains("未取得可导入源文件路径"):
		lines.append("最近阻碍：预览已生成，但未取得可导入源文件路径；拿到 PNG 后用导入脚本写入目标路径。")
	return lines


func _image2_generated_lines(records: Array) -> Array[String]:
	var lines: Array[String] = []
	for item in records:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		var record: Dictionary = item
		var path := str(record.get("path", ""))
		lines.append("%s｜%s｜%s｜%s" % [
			str(record.get("name", record.get("id", "unknown"))),
			str(record.get("kind", "unknown")),
			"文件可读" if FileAccess.file_exists(path) else "文件缺失",
			str(record.get("prompt_focus", ""))
		])
	if lines.is_empty():
		lines.append("暂无已生成记录。")
	return lines


func _image2_reuse_gap_lines() -> Array[String]:
	var lines: Array[String] = []
	var card_groups := _image2_card_reuse_groups()
	var enemy_groups := _image2_enemy_reuse_groups()
	lines.append("卡牌复用组：" + str(card_groups.size()))
	for line in card_groups.slice(0, min(4, card_groups.size())):
		lines.append("  " + line)
	lines.append("敌人复用组：" + str(enemy_groups.size()))
	for line in enemy_groups.slice(0, min(3, enemy_groups.size())):
		lines.append("  " + line)
	return lines


func _image2_card_reuse_groups() -> Array[String]:
	var by_art := {}
	for card_id in CARD_LIBRARY.keys():
		var card: Dictionary = CARD_LIBRARY[card_id]
		if str(card.get("type", "")) == "curse":
			continue
		var art_path := str(card.get("art", ""))
		if art_path.is_empty():
			continue
		if not by_art.has(art_path):
			by_art[art_path] = []
		by_art[art_path].append("%s/%s" % [str(card_id), str(card.get("name", card_id))])
	return _image2_reuse_lines(by_art)


func _image2_enemy_reuse_groups() -> Array[String]:
	var by_art := {}
	for enemy_data in _all_enemy_records():
		var art_path := str(enemy_data.get("art", ""))
		if art_path.is_empty():
			continue
		if not by_art.has(art_path):
			by_art[art_path] = []
		by_art[art_path].append(str(enemy_data.get("name", "unknown")))
	return _image2_reuse_lines(by_art)


func _image2_reuse_lines(by_art: Dictionary) -> Array[String]:
	var lines: Array[String] = []
	var paths := by_art.keys()
	paths.sort()
	for path in paths:
		var names: Array = by_art[path]
		if names.size() <= 1:
			continue
		lines.append("%s -> %s" % [str(path), "、".join(names)])
	return lines


func _image2_drop_in_text(record: Dictionary) -> String:
	var target_path := str(record.get("target_path", ""))
	if record.has("card_id") and CARD_LIBRARY.has(str(record["card_id"])):
		var card: Dictionary = CARD_LIBRARY[str(record["card_id"])]
		if str(card.get("image2_target_art", "")) == target_path:
			return "放入目标路径后卡牌自动替换"
	if record.has("enemy_name"):
		for enemy_data in _all_enemy_records():
			if str(enemy_data.get("name", "")) == str(record["enemy_name"]) and str(enemy_data.get("image2_target_art", "")) == target_path:
				return "放入目标路径后敌人自动替换"
	if str(record.get("kind", "")) == "event_background" and record.has("node_type"):
		var node_target := _map_node_background_target_path(str(record["node_type"]))
		if not node_target.is_empty() and target_path == node_target:
			return "放入目标路径后%s背景自动显示" % _map_node_type_name(str(record["node_type"]))
	return "需后续接入"


func _image2_priority_rank(priority: String) -> int:
	match priority:
		"high":
			return 0
		"medium":
			return 1
		"low":
			return 2
		_:
			return 3


func _image2_priority_name(priority: String) -> String:
	match priority:
		"high":
			return "高"
		"medium":
			return "中"
		"low":
			return "低"
		_:
			return "未分级"


func _all_enemy_records() -> Array[Dictionary]:
	var records: Array[Dictionary] = []
	for act_index in ACT_LIBRARY.size():
		for enemy_data in _encounters_for_act_index(act_index):
			records.append(enemy_data)
		for enemy_data in _elite_encounters_for_act_index(act_index):
			records.append(enemy_data)
		records.append(_boss_encounter_for_act_index(act_index))
	return records


func _empty_rarity_counts() -> Dictionary:
	return {
		"common": 0,
		"uncommon": 0,
		"rare": 0,
		"curse": 0
	}


func _increment_balance_count(counts: Dictionary, key: String) -> void:
	if not counts.has(key):
		counts[key] = 0
	counts[key] = int(counts[key]) + 1


func _reward_card_counts_for_act(act_index: int) -> Dictionary:
	var counts := _empty_rarity_counts()
	for card_id in CARD_LIBRARY.keys():
		var id := str(card_id)
		var card: Dictionary = CARD_LIBRARY[id]
		if STARTING_DECK.has(id):
			continue
		if str(card.get("rarity", "common")) == "curse":
			continue
		if act_index < int(card.get("min_act", 0)):
			continue
		_increment_balance_count(counts, str(card.get("rarity", "common")))
	return counts


func _rarity_count_text(counts: Dictionary) -> String:
	return "凡品 %d / 上品 %d / 珍品 %d / 心魔 %d" % [
		int(counts.get("common", 0)),
		int(counts.get("uncommon", 0)),
		int(counts.get("rare", 0)),
		int(counts.get("curse", 0))
	]


func _rarity_total(counts: Dictionary) -> int:
	return int(counts.get("common", 0)) + int(counts.get("uncommon", 0)) + int(counts.get("rare", 0)) + int(counts.get("curse", 0))


func _reward_weight_text_for_act(act_index: int) -> String:
	var common := 60
	var uncommon := 30
	var rare := 10
	if act_index == 1:
		common = 42
		uncommon = 38
		rare = 20
	elif act_index >= 2:
		common = 34
		uncommon = 36
		rare = 30
	return "凡品 %d / 上品 %d / 珍品 %d" % [common, uncommon, rare]


func _enemy_balance_line(group_name: String, enemies: Array) -> String:
	var min_hp := 9999
	var max_hp := 0
	var max_damage := 0
	var max_block := 0
	var weak_moves := 0
	var demon_moves := 0
	for enemy_data in enemies:
		var hp := int(enemy_data.get("max_hp", 0))
		min_hp = min(min_hp, hp)
		max_hp = max(max_hp, hp)
		for move in enemy_data.get("moves", []):
			var total_damage := int(move.get("damage", 0)) * int(move.get("hits", 1))
			max_damage = max(max_damage, total_damage)
			max_block = max(max_block, int(move.get("block", 0)))
			if int(move.get("player_weak", 0)) > 0:
				weak_moves += 1
			if str(move.get("add_status", "")) == "inner_demon":
				demon_moves += 1
	return "%s｜%d 名｜生命 %d-%d｜最高单招伤害 %d｜最高护体 %d｜虚弱招式 %d｜心魔招式 %d" % [
		group_name,
		enemies.size(),
		min_hp,
		max_hp,
		max_damage,
		max_block,
		weak_moves,
		demon_moves
	]


func _codex_detail_text() -> String:
	var sections: Array[String] = [
		"【卡牌】",
		_codex_cards_text(),
		"【法宝】",
		_codex_treasures_text(),
		"【悟道】",
		_codex_insights_text(),
		"【破境】",
		_codex_breakthroughs_text(),
		"【消耗品】",
		_codex_consumables_text(),
		"【敌人】",
		_codex_enemies_text(),
		"【流派】",
		_codex_origins_text(),
		"【劫数】",
		_codex_difficulties_text(),
		"【月相】",
		_codex_lunar_omens_text(),
		"【试炼签】",
		_codex_trial_mandates_text(),
		"【悬赏令】",
		_codex_bounties_text(),
		"【本局印记】",
		_codex_run_marks_text(),
		"【幕间誓约】",
		_codex_interlude_oaths_text(),
		"【路线节点】",
		_codex_map_nodes_text(),
		"【幕】",
		_codex_acts_text()
	]
	return "\n".join(sections)


func _codex_cards_text() -> String:
	var ids := CARD_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for card_id in ids:
		var card: Dictionary = _card_data(str(card_id))
		lines.append("%s｜%s｜%s｜%s｜灵气 %d｜%s｜%s｜%s" % [
			card["name"],
			_rarity_name(str(card.get("rarity", "common"))),
			_card_act_text(str(card_id)),
			_card_type_name(str(card["type"])),
			card["cost"],
			card["desc"],
			_card_upgrade_rule_text(str(card_id)),
			_image2_card_art_state_text(str(card_id))
		])
	return "\n".join(lines)


func _image2_card_art_state_text(card_id: String) -> String:
	var base_id := _base_card_id(card_id)
	if not CARD_LIBRARY.has(base_id):
		return "素材：未知"
	var card: Dictionary = CARD_LIBRARY[base_id]
	var target_path := str(card.get("image2_target_art", ""))
	if not target_path.is_empty():
		if FileAccess.file_exists(target_path):
			return "素材：Image-2 专属图"
		return "素材：Image-2 计划中"
	var art_path := str(card.get("art", ""))
	if art_path.is_empty():
		return "素材：无图"
	if _card_art_is_reused(art_path, base_id):
		return "素材：复用图"
	return "素材：首批图"


func _card_art_is_reused(art_path: String, own_card_id: String) -> bool:
	for other_id in CARD_LIBRARY.keys():
		var other_base_id := str(other_id)
		if other_base_id == own_card_id:
			continue
		var other: Dictionary = CARD_LIBRARY[other_base_id]
		if str(other.get("type", "")) == "curse":
			continue
		if str(other.get("art", "")) == art_path:
			return true
	return false


func _rarity_name(rarity: String) -> String:
	match rarity:
		"common":
			return "凡品"
		"uncommon":
			return "上品"
		"rare":
			return "珍品"
		"curse":
			return "心魔"
		_:
			return rarity


func _card_act_text(card_id: String) -> String:
	var min_act := int(CARD_LIBRARY[_base_card_id(card_id)].get("min_act", 0))
	return "第" + str(min_act + 1) + "幕起"


func _codex_treasures_text() -> String:
	var ids := TREASURE_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for treasure_id in ids:
		var treasure: Dictionary = TREASURE_LIBRARY[treasure_id]
		lines.append("%s｜倾向：%s｜定位：%s｜标签：%s｜%s" % [
			treasure["name"],
			_tone_name(str(treasure.get("tone", "event"))),
			_growth_role_text(treasure),
			_growth_effect_tags(treasure),
			treasure["desc"]
		])
	return "\n".join(lines)


func _codex_insights_text() -> String:
	var ids := INSIGHT_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for insight_id in ids:
		var insight: Dictionary = INSIGHT_LIBRARY[insight_id]
		lines.append("%s｜倾向：%s｜定位：%s｜标签：%s｜%s" % [
			insight["name"],
			_tone_name(str(insight.get("tone", "event"))),
			_growth_role_text(insight),
			_growth_effect_tags(insight),
			insight["desc"]
		])
	return "\n".join(lines)


func _codex_breakthroughs_text() -> String:
	var ids := BREAKTHROUGH_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for breakthrough_id in ids:
		var breakthrough: Dictionary = BREAKTHROUGH_LIBRARY[breakthrough_id]
		lines.append("%s｜倾向：%s｜定位：%s｜标签：%s｜%s" % [
			breakthrough["name"],
			_tone_name(str(breakthrough.get("tone", "event"))),
			_growth_role_text(breakthrough),
			_growth_effect_tags(breakthrough),
			breakthrough["desc"]
		])
	return "\n".join(lines)


func _codex_consumables_text() -> String:
	var ids := CONSUMABLE_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for consumable_id in ids:
		var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
		lines.append("%s｜倾向：%s｜定位：%s｜标签：%s｜%s" % [
			consumable["name"],
			_tone_name(str(consumable.get("tone", "event"))),
			_growth_role_text(consumable),
			_growth_effect_tags(consumable),
			consumable["desc"]
		])
	return "\n".join(lines)


func _tone_name(tone: String) -> String:
	match tone:
		"battle":
			return "攻伐"
		"rest":
			return "守成"
		"training":
			return "修炼"
		"market":
			return "资源"
		"elite":
			return "破境"
		"event":
			return "机缘"
		_:
			return tone


func _growth_role_text(data: Dictionary) -> String:
	var roles: Array[String] = []
	for role_name in GROWTH_ROLE_EFFECTS.keys():
		if _data_has_any_key(data, GROWTH_ROLE_EFFECTS[role_name]):
			roles.append(str(role_name))
	if roles.is_empty():
		roles.append("通用")
	return "、".join(roles)


func _growth_effect_tags(data: Dictionary) -> String:
	var tags: Array[String] = []
	for key in GROWTH_EFFECT_TAGS.keys():
		if data.has(str(key)):
			tags.append(str(GROWTH_EFFECT_TAGS[key]))
	return "、".join(tags) if not tags.is_empty() else "无特殊标签"


func _data_has_any_key(data: Dictionary, keys: Array) -> bool:
	for key in keys:
		if data.has(str(key)):
			return true
	return false


func _codex_enemies_text() -> String:
	var lines: Array[String] = []
	for act_index in ACT_LIBRARY.size():
		_append_enemy_codex_lines(lines, "第%d幕 普通" % [act_index + 1], _encounters_for_act_index(act_index))
		_append_enemy_codex_lines(lines, "第%d幕 精英" % [act_index + 1], _elite_encounters_for_act_index(act_index))
		_append_enemy_codex_lines(lines, "第%d幕 Boss" % [act_index + 1], [_boss_encounter_for_act_index(act_index)])
	return "\n".join(lines)


func _append_enemy_codex_lines(lines: Array[String], group_name: String, enemies: Array) -> void:
	for enemy_data in enemies:
		lines.append("%s｜%s｜生命 %d｜%s｜威胁：%s｜应对：%s｜招式：%s" % [
			group_name,
			enemy_data["name"],
			enemy_data["max_hp"],
			_image2_enemy_art_state_text(enemy_data),
			_enemy_codex_threat_text(enemy_data),
			_enemy_codex_counter_text(enemy_data),
			_enemy_codex_moves_text(enemy_data)
		])


func _image2_enemy_art_state_text(enemy_data: Dictionary) -> String:
	var target_path := str(enemy_data.get("image2_target_art", ""))
	if not target_path.is_empty():
		if FileAccess.file_exists(target_path):
			return "素材：Image-2 专属图"
		return "素材：Image-2 计划中"
	var art_path := str(enemy_data.get("art", ""))
	if art_path.is_empty():
		return "素材：无图"
	if _enemy_art_is_reused(art_path, str(enemy_data.get("name", ""))):
		return "素材：复用图"
	return "素材：首批图"


func _enemy_art_is_reused(art_path: String, own_name: String) -> bool:
	for other in _all_enemy_records():
		if str(other.get("name", "")) == own_name:
			continue
		if str(other.get("art", "")) == art_path:
			return true
	return false


func _enemy_codex_moves_text(enemy_data: Dictionary) -> String:
	var move_texts: Array[String] = []
	for move in enemy_data.get("moves", []):
		var move_data: Dictionary = move
		move_texts.append(_enemy_move_detail_text(move_data))
	return "；".join(move_texts)


func _enemy_move_detail_text(move_data: Dictionary) -> String:
	return _enemy_move_brief_text(move_data)


func _enemy_codex_threat_text(enemy_data: Dictionary) -> String:
	var tags: Array[String] = []
	var max_damage := 0
	var has_multi := false
	var has_block := false
	var has_flaw := false
	var has_weak := false
	var has_demon := false
	for move in enemy_data.get("moves", []):
		var move_data: Dictionary = move
		if move_data.has("damage"):
			var total_damage := int(move_data["damage"]) * int(move_data.get("hits", 1))
			max_damage = max(max_damage, total_damage)
			if int(move_data.get("hits", 1)) > 1:
				has_multi = true
		has_block = has_block or move_data.has("block")
		has_flaw = has_flaw or bool(move_data.get("flaw", false))
		has_weak = has_weak or int(move_data.get("player_weak", 0)) > 0
		has_demon = has_demon or str(move_data.get("add_status", "")) == "inner_demon"
	if max_damage >= 18:
		tags.append("高压伤害 " + str(max_damage))
	elif max_damage > 0:
		tags.append("伤害峰值 " + str(max_damage))
	if has_multi:
		tags.append("多段")
	if has_block:
		tags.append("护体" + ("露破绽" if has_flaw else ""))
	if has_weak:
		tags.append("虚弱")
	if has_demon:
		tags.append("心魔污染")
	return "、".join(tags) if not tags.is_empty() else "低压轮转"


func _enemy_codex_counter_text(enemy_data: Dictionary) -> String:
	var advice: Array[String] = []
	var threat := _enemy_codex_threat_text(enemy_data)
	if threat.contains("高压伤害") or threat.contains("多段"):
		advice.append("留护盾/恢复")
	if threat.contains("护体"):
		advice.append("趁破绽或提前压血")
	if threat.contains("虚弱"):
		advice.append("备清心/避免空盾")
	if threat.contains("心魔"):
		advice.append("带净心或删牌")
	if advice.is_empty():
		advice.append("按意图攻防转换")
	return "、".join(advice)


func _codex_origins_text() -> String:
	var ids := ORIGIN_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for origin_id in ids:
		var origin := _origin_data(str(origin_id))
		var deck_names := _card_names_from_ids(origin["deck"])
		lines.append("%s｜%s｜起始牌：%s" % [origin["name"], origin["desc"], deck_names])
	return "\n".join(lines)


func _codex_difficulties_text() -> String:
	var ids := DIFFICULTY_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for difficulty_id in ids:
		var difficulty := _difficulty_data(str(difficulty_id))
		lines.append("%s｜%s" % [difficulty["name"], difficulty["desc"]])
	return "\n".join(lines)


func _codex_lunar_omens_text() -> String:
	var ids := _lunar_omen_ids()
	var lines: Array[String] = []
	for omen_id in ids:
		var omen: Dictionary = LUNAR_OMEN_LIBRARY[omen_id]
		lines.append("%s｜%s｜倾向：%s" % [
			str(omen["name"]),
			str(omen["desc"]),
			_tone_name(str(omen.get("tone", "event")))
		])
	return "\n".join(lines)


func _codex_trial_mandates_text() -> String:
	var ids := TRIAL_MANDATE_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for mandate_id in ids:
		var mandate: Dictionary = TRIAL_MANDATE_LIBRARY[mandate_id]
		lines.append("%s｜目标：%s｜进度类型：%s｜达成：%s" % [
			str(mandate["name"]),
			str(mandate["desc"]),
			_progress_kind_name(str(mandate.get("kind", ""))),
			str(mandate["reward"])
		])
	return "\n".join(lines)


func _codex_bounties_text() -> String:
	var ids := BOUNTY_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for bounty_id in ids:
		var bounty: Dictionary = BOUNTY_LIBRARY[bounty_id]
		lines.append("%s｜目标：%s｜进度类型：%s｜赏金：%s" % [
			str(bounty["name"]),
			str(bounty["desc"]),
			_progress_kind_name(str(bounty.get("kind", ""))),
			str(bounty["reward"])
		])
	return "\n".join(lines)


func _codex_run_marks_text() -> String:
	var ids := RUN_MARK_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for mark_id in ids:
		var mark: Dictionary = RUN_MARK_LIBRARY[mark_id]
		lines.append("%s｜%s" % [str(mark["name"]), str(mark["desc"])])
	return "\n".join(lines)


func _codex_interlude_oaths_text() -> String:
	var ids := INTERLUDE_OATH_LIBRARY.keys()
	ids.sort()
	var lines: Array[String] = []
	for oath_id in ids:
		var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
		lines.append("%s｜%s｜倾向：%s｜%s" % [
			str(oath["name"]),
			_interlude_oath_collection_state_text(str(oath_id)),
			_tone_name(str(oath.get("tone", "event"))),
			str(oath["desc"])
		])
	return "\n".join(lines)


func _progress_kind_name(kind: String) -> String:
	match kind:
		"battle":
			return "胜战"
		"elite":
			return "精英"
		"spirit_stones":
			return "灵石"
		"upgrade":
			return "精研"
		"cleanse":
			return "净心"
		"gain_treasure":
			return "法宝"
		"buy_consumable":
			return "坊市采买"
		_:
			return kind


func _codex_map_nodes_text() -> String:
	var node_types: Array[String] = [
		"battle",
		"elite",
		"event",
		"herb_event",
		"spirit_rift",
		"secret_realm",
		"duel_trial",
		"soul_shrine",
		"dark_forge",
		"thunder_pool",
		"market",
		"rest",
		"training"
	]
	var lines: Array[String] = []
	for node_type in node_types:
		lines.append("%s｜出现：%s｜定位：%s｜%s｜收益/风险：%s" % [
			_map_node_type_name(node_type),
			_map_node_titles_for_type(node_type),
			_map_node_role_text(node_type),
			_image2_map_node_art_state_text(node_type),
			_map_node_reward_risk_text(node_type)
		])
	return "\n".join(lines)


func _map_node_titles_for_type(node_type: String) -> String:
	var titles: Array[String] = []
	var pools: Array = [MAP_NODE_LIBRARY, SECOND_ACT_MAP_NODE_LIBRARY, THIRD_ACT_MAP_NODE_LIBRARY]
	for pool in pools:
		for node in pool:
			if str(node.get("type", "")) != node_type:
				continue
			var title := str(node.get("title", ""))
			if not titles.has(title):
				titles.append(title)
	return "、".join(titles)


func _map_node_role_text(node_type: String) -> String:
	match node_type:
		"battle":
			return "基础战斗推进"
		"elite":
			return "高压成长点"
		"event":
			return "早期机缘取舍"
		"herb_event":
			return "恢复与净心组件"
		"spirit_rift":
			return "灵气和精研成长"
		"secret_realm":
			return "高价值秘境收益"
		"duel_trial":
			return "主动加压换奖励"
		"soul_shrine":
			return "第二幕心魔处理"
		"dark_forge":
			return "中后期精研与消耗品"
		"thunder_pool":
			return "终幕破境前整备"
		"market":
			return "灵石转化与删牌"
		"rest":
			return "恢复和保守整备"
		"training":
			return "牌组压缩与灵气"
		_:
			return "路线推进"


func _image2_map_node_art_state_text(node_type: String) -> String:
	var target_path := _map_node_background_target_path(node_type)
	if not target_path.is_empty():
		if FileAccess.file_exists(target_path):
			return "背景：Image-2 专属图"
		return "背景：Image-2 计划中"
	return "背景：暂无专属图计划"


func _map_node_background_target_path(node_type: String) -> String:
	match node_type:
		"spirit_rift":
			return SPIRIT_RIFT_BACKGROUND_TARGET_PATH
		"secret_realm":
			return SECRET_REALM_BACKGROUND_TARGET_PATH
		"soul_shrine":
			return SOUL_SHRINE_BACKGROUND_TARGET_PATH
		"dark_forge":
			return DARK_FORGE_BACKGROUND_TARGET_PATH
		"thunder_pool":
			return THUNDER_POOL_BACKGROUND_TARGET_PATH
		"market":
			return MARKET_BACKGROUND_TARGET_PATH
		_:
			return ""


func _map_node_reward_risk_text(node_type: String) -> String:
	match node_type:
		"battle":
			return "胜利得灵石与卡牌奖励，风险较低。"
		"elite":
			return "敌势更强，胜利更容易获得法宝、悟道和高价值奖励。"
		"event":
			return "可得灵石、术法和消耗品，强取会失血并可能混入心魔。"
		"herb_event":
			return "可恢复、获得清心组件或换取灵石，冒进会带下战虚弱。"
		"spirit_rift":
			return "可提高灵气上限、得灵石消耗品或精研，常伴随失血/虚弱。"
		"secret_realm":
			return "可取悟道、生命上限或当前幕术法，代价可能是失血、心魔或虚弱。"
		"duel_trial":
			return "强化下一战，胜利换灵石、精研或法宝；状态差时风险很高。"
		"soul_shrine":
			return "可净心恢复、借阴悟道或夺法宝，贪取会带虚弱/失血/心魔。"
		"dark_forge":
			return "可精研、取阴雷子或换灵石，通常伴随虚弱或灼伤。"
		"thunder_pool":
			return "可得终幕牌、生命上限或净心补牌，部分选择会失血并带虚弱。"
		"market":
			return "购买卡牌、法宝、消耗品或删牌，也可跑腿补灵石。"
		"rest":
			return "稳定恢复、驱散下战虚弱、随机精研或补消耗品。"
		"training":
			return "提高灵气上限、精研关键牌或忘却冗余/心魔牌。"
		_:
			return "选择后推进路线。"


func _codex_acts_text() -> String:
	var lines: Array[String] = []
	for i in ACT_LIBRARY.size():
		var act: Dictionary = ACT_LIBRARY[i]
		lines.append("第%d幕｜%s｜Boss：%s｜%s｜节点：%s" % [
			i + 1,
			act["name"],
			act["boss_title"],
			act["boss_desc"],
			_map_node_names_for_act(i)
		])
	return "\n".join(lines)


func _map_node_names_for_act(act_index: int) -> String:
	var names: Array[String] = []
	var nodes := _map_nodes_for_act_index(act_index)
	for node in nodes:
		names.append(str(node["title"]))
	return "、".join(names)


func _achievements_detail_text() -> String:
	var lines: Array[String] = [
		"已达成 %d/%d" % [achievements.size(), ACHIEVEMENT_LIBRARY.size()]
	]
	for achievement in ACHIEVEMENT_LIBRARY:
		var achievement_id := str(achievement["id"])
		var state := "已达成" if achievements.has(achievement_id) else "未达成"
		lines.append("%s｜%s｜%s｜%s" % [state, achievement["name"], achievement["desc"], _achievement_progress_hint(achievement_id)])
	return "\n".join(lines)


func _achievement_progress_hint(achievement_id: String) -> String:
	if achievements.has(achievement_id):
		return "进度：已收入玉册"
	match achievement_id:
		"first_battle":
			return _progress_hint("进度", battles_won, 1, "赢下任意一战")
		"elite_down":
			return "建议：选择精英节点并击败敌人"
		"first_treasure":
			return _progress_hint("本局法宝", treasures.size(), 1, "精英、坊市和事件更容易获得")
		"three_treasures":
			return _progress_hint("本局法宝", treasures.size(), 3, "多走精英、坊市或法宝事件")
		"cleanse_mind":
			return "建议：用清心诀、坊市净心、古龛或雷池移除心魔"
		"storm_reached":
			return _progress_hint("当前幕", current_act + 1, 3, "击败前两幕 Boss")
		"third_act_elite":
			return "建议：进入第三幕后选择劫火重地"
		"thunder_pool_tempered":
			return "建议：第三幕选择洗雷池并完成任意选项"
		"deep_meridians":
			return _progress_hint("灵气上限", max_qi, 5, "灵脉、修炼、法宝、悟道或破境可提升")
		"spirit_hoard":
			return _progress_hint("持有灵石", spirit_stones, 40, "悬赏、血月、坊市跑腿和事件可累积")
		"foundation_success":
			return _progress_hint("通关次数", victories, 1, "击败第三幕 Boss")
		"clean_foundation":
			return "建议：通关前保持牌组中没有心魔杂念"
		"nightmare_clear":
			return "建议：选择黑煞劫并完成通关"
		"edge_strike":
			return "建议：用竹息剑阵、雷火连剑等先叠到 3 层剑势再攻击"
		"first_run_mark":
			return _progress_hint("本局印记", run_marks.size(), 1, "洞府、秘境、雷池等关键选择会留下印记")
		"first_interlude_oath":
			return _progress_hint("本局誓约", interlude_oaths.size(), 1, "击败非终幕 Boss 后选择破境，再立幕间誓约")
		"first_flawless_win":
			return _progress_hint("本局完胜", flawless_wins, 1, "用护盾挡住伤害，避免反噬自伤并赢下一战")
		_:
			return "建议：继续试炼推进"


func _progress_hint(label: String, current: int, target: int, advice: String) -> String:
	var clamped: int = clamp(current, 0, target)
	return "%s：%d/%d｜%s" % [label, clamped, target, advice]


func _challenge_progress_text() -> String:
	return "已完成 %d/%d：%s" % [
		completed_challenges.size(),
		CHALLENGE_LIBRARY.size(),
		_challenge_names_from_ids(completed_challenges)
	]


func _mandate_mastery_progress_text() -> String:
	var mastered: Array[String] = []
	var missing: Array[String] = []
	for mandate_id in _trial_mandate_ids():
		var mandate: Dictionary = TRIAL_MANDATE_LIBRARY[mandate_id]
		var name := str(mandate["name"])
		if completed_trial_mandates.has(mandate_id):
			mastered.append(name)
		else:
			missing.append(name)
	var mastered_text := "已完成 " + ("、".join(mastered) if not mastered.is_empty() else "无")
	var missing_text := "待完成 " + ("、".join(missing) if not missing.is_empty() else "无")
	return "%d/%d｜%s｜%s" % [completed_trial_mandates.size(), TRIAL_MANDATE_LIBRARY.size(), mastered_text, missing_text]


func _interlude_oath_mastery_progress_text() -> String:
	var mastered: Array[String] = []
	var missing: Array[String] = []
	var oath_ids := INTERLUDE_OATH_LIBRARY.keys()
	oath_ids.sort()
	for oath_id in oath_ids:
		var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
		var name := str(oath["name"])
		if completed_interlude_oaths.has(str(oath_id)):
			mastered.append(name)
		else:
			missing.append(name)
	var mastered_text := "已立 " + ("、".join(mastered) if not mastered.is_empty() else "无")
	var missing_text := "待立 " + ("、".join(missing) if not missing.is_empty() else "无")
	return "%d/%d｜%s｜%s" % [completed_interlude_oaths.size(), INTERLUDE_OATH_LIBRARY.size(), mastered_text, missing_text]


func _interlude_oath_collection_state_text(oath_id: String) -> String:
	return "已收录" if completed_interlude_oaths.has(oath_id) else "未收录"


func _challenges_detail_text() -> String:
	var lines: Array[String] = [
		"已完成 %d/%d" % [completed_challenges.size(), CHALLENGE_LIBRARY.size()],
		"试炼签卷：" + _mandate_mastery_progress_text(),
		"幕间誓约卷：" + _interlude_oath_mastery_progress_text()
	]
	for challenge in CHALLENGE_LIBRARY:
		var challenge_id := str(challenge["id"])
		var state := "已完成" if completed_challenges.has(challenge_id) else "未完成"
		lines.append("%s｜%s｜%s｜%s" % [state, challenge["name"], challenge["desc"], _challenge_progress_hint(challenge_id)])
	return "\n".join(lines)


func _challenge_progress_hint(challenge_id: String) -> String:
	if completed_challenges.has(challenge_id):
		return "进度：已刻入挑战卷"
	match challenge_id:
		"first_foundation":
			return _progress_hint("通关次数", victories, 1, "完成任意一次筑基")
		"clean_foundation_trial":
			return "建议：少拿心魔收益，通关前优先净心/删牌"
		"mandate_fulfilled":
			return "建议：开局选更贴合流派的试炼签，并围绕它规划路线"
		"all_mandates_mastered":
			return _progress_hint("试炼签卷", completed_trial_mandates.size(), TRIAL_MANDATE_LIBRARY.size(), "缺口：" + _missing_trial_mandate_names_text())
		"nightmare_foundation_trial":
			return "建议：黑煞劫下优先稳血、删心魔和拿防御成长"
		"daily_foundation_trial":
			return "建议：从标题页进入今日试炼并通关"
		"duel_oath_clear":
			return "建议：本局立下试剑约束并带着记录通关"
		"high_rank_foundation":
			return "建议：提高胜战、成长、灵石、无垢和新收集项来冲甲等"
		"three_win_streak":
			return _progress_hint("当前连胜", current_win_streak, 3, "连续通关，失败会清空当前连胜")
		"flawless_foundation":
			return _progress_hint("本局完胜", flawless_wins, 3, "至少 3 场战斗不损生命并完成筑基")
		"double_oath_foundation":
			return _progress_hint("本局誓约", interlude_oaths.size(), 2, "击败前两幕 Boss，各立一次幕间誓约并通关")
		"all_interlude_oaths":
			return _progress_hint("誓约卷", completed_interlude_oaths.size(), INTERLUDE_OATH_LIBRARY.size(), "缺口：" + _missing_interlude_oath_names_text())
		"five_origin_foundation":
			return _progress_hint("流派通关", _mastered_origin_count(), ORIGIN_LIBRARY.size(), _recommended_origin_goal_text())
		"all_origin_nightmare":
			return _progress_hint("黑煞流派", _nightmare_origin_count(), ORIGIN_LIBRARY.size(), _recommended_origin_goal_text())
		"all_origin_grandmaster":
			return _progress_hint("甲等流派", _grandmaster_origin_count(), ORIGIN_LIBRARY.size(), _recommended_origin_goal_text())
		"full_ending_scroll":
			return _progress_hint("结局卷轴", unlocked_endings.size(), ENDING_LIBRARY.size(), "用不同流派、无垢和黑煞通关补齐")
		_:
			return "建议：继续挑战不同路线"


func _missing_trial_mandate_names_text() -> String:
	var missing: Array[String] = []
	for mandate_id in _trial_mandate_ids():
		if completed_trial_mandates.has(mandate_id):
			continue
		var mandate: Dictionary = TRIAL_MANDATE_LIBRARY[mandate_id]
		missing.append(str(mandate["name"]))
	return "无" if missing.is_empty() else "、".join(missing)


func _missing_interlude_oath_names_text() -> String:
	var missing: Array[String] = []
	var oath_ids := INTERLUDE_OATH_LIBRARY.keys()
	oath_ids.sort()
	for oath_id in oath_ids:
		if completed_interlude_oaths.has(str(oath_id)):
			continue
		var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
		missing.append(str(oath["name"]))
	return "无" if missing.is_empty() else "、".join(missing)


func _challenge_names_from_ids(value: Variant) -> String:
	var ids := _load_string_array(value)
	if ids.is_empty():
		return "无"
	var names: Array[String] = []
	for challenge_id in ids:
		var challenge := _challenge_data(challenge_id)
		if not challenge.is_empty():
			names.append(str(challenge["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _ending_progress_text() -> String:
	return "已解锁 %d/%d：%s" % [
		unlocked_endings.size(),
		ENDING_LIBRARY.size(),
		_unlocked_ending_names_text()
	]


func _endings_detail_text() -> String:
	var lines: Array[String] = [
		"已解锁 %d/%d" % [unlocked_endings.size(), ENDING_LIBRARY.size()]
	]
	for ending in ENDING_LIBRARY:
		var ending_id := str(ending["id"])
		var state := "已解锁" if unlocked_endings.has(ending_id) else "未解锁"
		var detail := str(ending["text"]) if unlocked_endings.has(ending_id) else str(ending["condition"]) + "｜" + _ending_unlock_hint(ending_id)
		lines.append("%s｜%s｜%s" % [state, ending["name"], detail])
	return "\n".join(lines)


func _ending_unlock_hint(ending_id: String) -> String:
	if unlocked_endings.has(ending_id):
		return "已收入结局卷"
	match ending_id:
		"foundation_moon":
			return _progress_hint("通关次数", victories, 1, "完成任意一次筑基")
		"clean_foundation":
			return "建议：通关前保持牌组中没有心魔杂念"
		"nightmare_foundation":
			return "建议：选择黑煞劫并完成通关"
		"bamboo_sword_path":
			return _origin_ending_hint("bamboo_sword")
		"talisman_roamer_path":
			return _origin_ending_hint("talisman_roamer")
		"spring_healer_path":
			return _origin_ending_hint("spring_healer")
		"demon_tempered_path":
			return _origin_ending_hint("demon_tempered")
		"thunder_roamer_path":
			return _origin_ending_hint("thunder_roamer")
		_:
			return "建议：尝试不同流派与劫数通关"


func _origin_ending_hint(origin_id: String) -> String:
	var origin := _origin_data(origin_id)
	var record: Dictionary = origin_records.get(origin_id, {})
	var clears := int(record.get("clears", 0))
	return _progress_hint(str(origin["name"]) + "通关", clears, 1, "以该流派完成筑基")


func _unlocked_ending_names_text() -> String:
	if unlocked_endings.is_empty():
		return "无"
	var names: Array[String] = []
	for ending_id in unlocked_endings:
		var ending := _ending_data(ending_id)
		if not ending.is_empty():
			names.append(str(ending["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _ending_names_from_ids(value: Variant) -> String:
	var ids := _load_string_array(value)
	if ids.is_empty():
		return "无"
	var names: Array[String] = []
	for ending_id in ids:
		var ending := _ending_data(ending_id)
		if not ending.is_empty():
			names.append(str(ending["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _history_detail_text() -> String:
	if run_history.is_empty():
		return "尚无战绩。完成或失败一局试炼后，这里会记录最近 %d 局。" % MAX_RUN_HISTORY
	var lines: Array[String] = [
		"最近 %d/%d 局" % [run_history.size(), MAX_RUN_HISTORY]
	]
	var index := 1
	for entry in run_history:
		lines.append("%d. %s｜%s｜评阶 %s %d分｜到达 第%d幕 %s｜%s（%s）｜%s｜连胜 %d/%d｜月相 %s｜种子 %d｜复盘码 %s｜试炼签 %s｜印记 %s｜誓约 %s｜悬赏 %s/已结 %d｜试剑 %s/%s｜战斗 %d｜总进度 %d/%d｜牌组 %d｜法宝 %d｜悟道 %d｜破境 %d｜消耗品 %d｜灵气 %d｜生命 %d/%d｜灵石 %d｜修为 +%d｜定位：%s｜短板：%s｜路线计划：%s｜复盘：%s｜路线：%s｜下局：%s｜新成就：%s｜新挑战：%s｜新结局：%s" % [
			index,
			str(entry.get("result", "试炼记录")),
			str(entry.get("challenge", "普通试炼")),
			str(entry.get("rank", "丁")),
			int(entry.get("score", 0)),
			int(entry.get("act", 1)),
			str(entry.get("act_name", "青岚谷")),
			str(entry.get("origin", "未知流派")),
			str(entry.get("origin_title", "未入门")),
			str(entry.get("difficulty", "未知劫数")),
			int(entry.get("win_streak", 0)),
			int(entry.get("best_win_streak", 0)),
			str(entry.get("lunar_omen", "无月相")),
			int(entry.get("run_seed", 0)),
			str(entry.get("share_code", "QLN|S=" + str(int(entry.get("run_seed", 0))))),
			str(entry.get("trial_mandate", "未记录")),
			_run_mark_value_text(entry.get("run_marks", [])),
			_interlude_oath_value_text(entry.get("interlude_oaths", [])),
			str(entry.get("bounty", "无悬赏")),
			int(entry.get("bounties_completed", 0)),
			str(entry.get("duel_trial", "无")),
			str(entry.get("duel_trials_completed", 0)),
			int(entry.get("battles_won", 0)),
			int(entry.get("progress", 0)),
			_total_progress_goal(),
			int(entry.get("deck_size", 0)),
			int(entry.get("treasure_count", 0)),
			int(entry.get("insight_count", 0)),
			int(entry.get("breakthrough_count", 0)),
			int(entry.get("consumable_count", 0)),
			int(entry.get("max_qi", 0)),
			int(entry.get("hp", 0)),
			int(entry.get("max_hp", 0)),
			int(entry.get("spirit_stones", 0)),
			int(entry.get("cultivation_gained", 0)),
			str(entry.get("deck_archetype", "未记录")),
			str(entry.get("run_diagnosis", "未记录")),
			str(entry.get("route_plan", "未记录")),
			str(entry.get("run_recap", "未记录")),
			_route_history_value_text(entry.get("route_history", [])),
			str(entry.get("next_run_suggestion", "下局建议：复盘路线与奖励取舍")),
			_history_achievement_names(entry.get("new_achievements", [])),
			_challenge_names_from_ids(entry.get("new_challenges", [])),
			_ending_names_from_ids(entry.get("new_endings", []))
		])
		index += 1
	return "\n".join(lines)


func _history_achievement_names(value: Variant) -> String:
	var ids := _load_string_array(value)
	if ids.is_empty():
		return "无"
	var names: Array[String] = []
	for achievement_id in ids:
		var achievement := _achievement_data(achievement_id)
		if not achievement.is_empty():
			names.append(str(achievement["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _run_route_tags() -> Array[String]:
	var profile := _deck_profile(deck)
	var tags: Array[String] = []
	if int(profile.get("edge", 0)) >= 2 or _treasure_value("start_edge") > 0 or _treasure_value("edge_damage_bonus") > 0:
		tags.append("剑势爆发")
	if int(profile.get("burn", 0)) >= 2 or _treasure_value("burn_damage") > 0 or _breakthrough_value("burn_bonus") > 0:
		tags.append("符火燃烧")
	if int(profile.get("weak", 0)) >= 2:
		tags.append("虚弱控制")
	if int(profile.get("defense", 0)) >= 5 or max_hp >= BASE_MAX_HP + 16:
		tags.append("稳健护体")
	if int(profile.get("draw", 0)) >= 3 or max_qi >= 5:
		tags.append("循环灵气")
	if consumables.size() >= 3 or _treasure_value("first_consumable_draw") > 0 or _consumable_bonus_value() > 0:
		tags.append("消耗品爆发")
	if not next_duel_trial.is_empty():
		tags.append("试剑约束")
	if deck.has("inner_demon") or int(profile.get("curse", 0)) > 0:
		tags.append("心魔未净")
	elif trial_mandate_id == "clear_mind" or achievements.has("cleanse_mind"):
		tags.append("净心路线")
	if tags.is_empty():
		tags.append("均衡筑基")
	return tags


func _run_route_tags_text() -> String:
	return "、".join(_run_route_tags())


func _run_growth_recap_text() -> String:
	var parts: Array[String] = []
	parts.append("法宝 " + str(treasures.size()))
	parts.append("悟道 " + str(insights.size()))
	parts.append("破境 " + str(breakthroughs.size()))
	parts.append("誓约 " + str(interlude_oaths.size()))
	parts.append("消耗品 " + str(consumables.size()))
	parts.append("灵气上限 " + str(max_qi))
	return "｜".join(parts)


func _route_history_text() -> String:
	return _route_history_value_text(route_history)


func _route_history_value_text(value: Variant) -> String:
	var entries := _load_string_array(value)
	if entries.is_empty():
		return "尚未选择路线节点"
	return " -> ".join(entries)


func _gain_run_mark(mark_id: String) -> void:
	if not RUN_MARK_LIBRARY.has(mark_id) or run_marks.has(mark_id):
		return
	run_marks.append(mark_id)
	_unlock_achievement("first_run_mark")
	var mark: Dictionary = RUN_MARK_LIBRARY[mark_id]
	_log("本局印记：" + str(mark["name"]) + "。")


func _run_mark_names_text() -> String:
	if run_marks.is_empty():
		return "无"
	var names: Array[String] = []
	for mark_id in run_marks:
		if RUN_MARK_LIBRARY.has(mark_id):
			names.append(str(RUN_MARK_LIBRARY[mark_id]["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _run_mark_detail_text() -> String:
	if run_marks.is_empty():
		return "暂无印记。重要事件选择会在这里留下本局痕迹。"
	var lines: Array[String] = []
	for mark_id in run_marks:
		if not RUN_MARK_LIBRARY.has(mark_id):
			continue
		var mark: Dictionary = RUN_MARK_LIBRARY[mark_id]
		lines.append("%s｜%s" % [str(mark["name"]), str(mark["desc"])])
	return "\n".join(lines)


func _run_mark_value_text(value: Variant) -> String:
	var ids := _load_string_array(value)
	if ids.is_empty():
		return "无"
	var names: Array[String] = []
	for mark_id in ids:
		if RUN_MARK_LIBRARY.has(mark_id):
			names.append(str(RUN_MARK_LIBRARY[mark_id]["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _interlude_oath_names_text() -> String:
	return _interlude_oath_value_text(interlude_oaths)


func _interlude_oath_value_text(value: Variant) -> String:
	var ids := _load_string_array(value)
	if ids.is_empty():
		return "无"
	var names: Array[String] = []
	for oath_id in ids:
		if INTERLUDE_OATH_LIBRARY.has(oath_id):
			names.append(str(INTERLUDE_OATH_LIBRARY[oath_id]["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _interlude_oath_detail_text() -> String:
	if interlude_oaths.is_empty():
		return "暂无幕间誓约。击败非终幕 Boss 并完成破境后，会在进入下一幕前选择一项誓约。"
	var lines: Array[String] = []
	for oath_id in interlude_oaths:
		if not INTERLUDE_OATH_LIBRARY.has(oath_id):
			continue
		var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
		lines.append("%s｜%s" % [str(oath["name"]), str(oath["desc"])])
	return "\n".join(lines)


func _flawless_run_text() -> String:
	var target := 3
	var state := "已达成挑战门槛" if flawless_wins >= target else "距挑战还差 " + str(target - flawless_wins)
	return "本局完胜 %d 场｜%s｜未损生命赢下一战可额外获得灵石。" % [flawless_wins, state]


func _run_recap_summary_text() -> String:
	return "%s｜%s｜%s｜%s｜印记 %d｜誓约 %d｜完胜 %d｜悬赏已结 %d" % [
		_run_route_tags_text(),
		_trial_mandate_history_text(),
		_lunar_omen_name(),
		_run_growth_recap_text(),
		run_marks.size(),
		interlude_oaths.size(),
		flawless_wins,
		completed_bounty_count
	]


func _run_recap_detail_text(victory: bool = false) -> String:
	var lines: Array[String] = [
		"核心路线：" + _run_route_tags_text(),
		"构筑定位：" + _deck_archetype_text(deck),
		"关键短板：" + _run_diagnosis_text(victory),
		"路线计划：" + _next_route_plan_text(victory),
		"路线轨迹：" + _route_history_text(),
		"本局印记：" + _run_mark_detail_text(),
		"幕间誓约：" + _interlude_oath_detail_text(),
		"完胜破阵：" + _flawless_run_text(),
		"成长结构：" + _run_growth_recap_text(),
		"渡劫准备：" + _boss_prep_text(),
		"月相异兆：" + _lunar_omen_detail_text(),
		"试炼签：" + _trial_mandate_detail_text(),
		"悬赏令：" + _bounty_detail_text(),
		"试剑约束：" + _duel_trial_history_text(),
		"流派称号：" + _origin_mastery_title(origin_records.get(selected_origin, {})),
		"牌组结论：" + _deck_analysis_text(deck).replace("\n", "｜"),
		_next_run_suggestion_text(victory),
		"局外收获：修为 +" + str(last_cultivation_gained) + "｜新成就 " + _run_achievement_names_text() + "｜新挑战 " + _challenge_names_from_ids(run_challenges_completed) + "｜新结局 " + _ending_names_from_ids(run_endings_unlocked)
	]
	return "\n".join(lines)


func _deck_archetype_text(cards: Array[String]) -> String:
	var profile := _deck_profile(cards)
	var archetypes: Array[String] = []
	if int(profile.get("edge", 0)) >= 2 or int(profile.get("multi_hit", 0)) >= 2:
		archetypes.append("剑势连段")
	if int(profile.get("burn", 0)) >= 2:
		archetypes.append("符火燃烧")
	if int(profile.get("weak", 0)) >= 2:
		archetypes.append("虚弱控场")
	if int(profile.get("defense", 0)) >= 5 or int(profile.get("heal", 0)) >= 2:
		archetypes.append("护体续航")
	if int(profile.get("draw", 0)) >= 3 or max_qi >= 5:
		archetypes.append("循环灵气")
	if consumables.size() >= 3 or _consumable_bonus_value() > 0:
		archetypes.append("小物爆发")
	if int(profile.get("curse", 0)) > 0:
		archetypes.append("心魔承压")
	if archetypes.is_empty():
		if int(profile.get("attack", 0)) > int(profile.get("skill", 0)):
			archetypes.append("朴素攻势")
		elif int(profile.get("skill", 0)) > int(profile.get("attack", 0)):
			archetypes.append("法门整备")
		else:
			archetypes.append("均衡筑基")
	return " + ".join(archetypes)


func _run_diagnosis_text(victory: bool) -> String:
	var profile := _deck_profile(deck)
	var issues: Array[String] = []
	if player_hp <= max(12, int(max_hp * 0.35)) and not victory:
		issues.append("血线过低")
	if int(profile.get("attack", 0)) <= 2 and deck.size() >= 8:
		issues.append("伤害密度低")
	if int(profile.get("defense", 0)) <= 2 and deck.size() >= 8:
		issues.append("防御/恢复薄")
	if int(profile.get("draw", 0)) <= 1 and deck.size() >= 12:
		issues.append("牌组偏厚且过牌少")
	if int(profile.get("curse", 0)) > 0:
		issues.append("心魔污染")
	if max_qi <= 3 and current_act >= 1:
		issues.append("灵气上限不足")
	if treasures.is_empty() and current_act >= 1:
		issues.append("法宝被动少")
	if completed_bounty_count <= 0:
		issues.append("悬赏收益未兑现")
	if not trial_mandate_completed:
		issues.append("试炼签未完成")
	if victory and issues.is_empty():
		issues.append("结构稳定，可冲更高劫数/评阶")
	elif issues.is_empty():
		issues.append("短板不明显，重点复盘路线与出牌节奏")
	return "、".join(issues)


func _next_route_plan_text(victory: bool) -> String:
	var profile := _deck_profile(deck)
	var nodes: Array[String] = []
	if int(profile.get("curse", 0)) > 0:
		nodes.append("坊市/镇魂古龛净心")
	if int(profile.get("attack", 0)) <= 2 and deck.size() >= 8:
		nodes.append("战斗/修炼补主力攻击")
	if int(profile.get("defense", 0)) <= 2 or player_hp <= max(14, int(max_hp * 0.4)):
		nodes.append("调息/药圃/秘境补续航")
	if int(profile.get("draw", 0)) <= 1 and deck.size() >= 12:
		nodes.append("修炼删牌或找过牌")
	if max_qi <= 3 and current_act >= 1:
		nodes.append("灵脉裂隙/修炼开灵气")
	if treasures.is_empty() and current_act >= 1:
		nodes.append("状态稳时打精英/试剑取法宝")
	if victory:
		if selected_difficulty != "nightmare":
			nodes.append("提高劫数验证构筑")
		if _mastered_origin_count() < ORIGIN_LIBRARY.size():
			nodes.append("换未通关流派补结局")
	if nodes.is_empty():
		nodes.append("延续当前核心，优先高价值成长节点")
	return " -> ".join(nodes.slice(0, min(4, nodes.size())))


func _next_run_suggestion_text(victory: bool) -> String:
	var profile := _deck_profile(deck)
	var tips: Array[String] = []
	if victory:
		if selected_difficulty == "normal":
			tips.append("可尝试破雾劫，提高敌人压力并获得更多修为")
		elif selected_difficulty == "hard":
			tips.append("可挑战黑煞劫，冲刺黑煞通关与更高评阶")
		if _mastered_origin_count() < ORIGIN_LIBRARY.size():
			tips.append("换一个未通关流派，补齐流派结局与五脉挑战")
		if not completed_challenges.has("clean_foundation_trial") and deck.has("inner_demon"):
			tips.append("下局优先净心，尝试无心魔筑基")
		if not completed_challenges.has("high_rank_foundation"):
			tips.append("围绕精英、试炼签和高价值成长冲甲等评阶")
	else:
		if _total_progress() < RUN_STEPS_TO_BOSS:
			tips.append("前期先稳血线，低血时优先调息/药圃，别过早贪高风险事件")
		if int(profile.get("attack", 0)) <= 2:
			tips.append("伤害密度偏低，奖励优先补攻击牌或剑心/剑势组件")
		if int(profile.get("defense", 0)) <= 2:
			tips.append("防御恢复偏少，优先拿护盾、恢复或玉骨类成长")
		if int(profile.get("draw", 0)) <= 1 and deck.size() >= 12:
			tips.append("牌组偏厚但过牌不足，优先找御风步、通脉诀或听风辨息")
		if deck.has("inner_demon"):
			tips.append("心魔拖慢循环，优先走坊市净心、镇魂古龛或净心牌")
		if max_qi <= 3 and current_act >= 1:
			tips.append("灵气上限偏低，中后期优先灵脉、修炼或开脉小成")
		if treasures.is_empty() and current_act >= 1:
			tips.append("局内被动不足，状态稳定时多考虑精英或法宝节点")
	if tips.is_empty():
		tips.append("沿用当前构筑思路，复盘路线轨迹和奖励取舍，寻找更高评阶")
	return "下局建议：" + "；".join(tips)


func _run_score(victory: bool) -> int:
	var score := 0
	score += _total_progress() * 12
	score += battles_won * 8
	score += treasures.size() * 6
	score += insights.size() * 8
	score += breakthroughs.size() * 10
	score += interlude_oaths.size() * 6
	score += max_qi * 5
	score += min(spirit_stones, 60)
	score += run_achievements.size() * 12
	score += run_endings_unlocked.size() * 18
	score += completed_bounty_count * 8
	score += flawless_wins * 4
	if trial_mandate_completed:
		score += 20
	if victory:
		score += 80
		if not deck.has("inner_demon"):
			score += 25
	var difficulty_bonus := float(_difficulty_data().get("cultivation_bonus", 0.0))
	if difficulty_bonus > 0.0:
		score = int(round(float(score) * (1.0 + difficulty_bonus)))
	return score


func _run_rank(score: int, victory: bool) -> String:
	if victory and score >= 360:
		return "甲上"
	if victory and score >= 300:
		return "甲"
	if score >= 240:
		return "乙上"
	if score >= 180:
		return "乙"
	if score >= 120:
		return "丙"
	return "丁"


func _run_score_detail_text(victory: bool) -> String:
	var score := _run_score(victory)
	var pieces: Array[String] = [
		"试炼评阶 %s（%d 分）" % [_run_rank(score, victory), score],
		"进度 +" + str(_total_progress() * 12),
		"战斗 +" + str(battles_won * 8),
		"成长 +" + str(treasures.size() * 6 + insights.size() * 8 + breakthroughs.size() * 10 + interlude_oaths.size() * 6 + max_qi * 5),
		"灵石 +" + str(min(spirit_stones, 60))
	]
	if trial_mandate_completed:
		pieces.append("试炼签 +20")
	if completed_bounty_count > 0:
		pieces.append("悬赏 +" + str(completed_bounty_count * 8))
	if flawless_wins > 0:
		pieces.append("完胜 +" + str(flawless_wins * 4))
	if victory:
		pieces.append("筑基 +80")
		if not deck.has("inner_demon"):
			pieces.append("无垢 +25")
	if not run_achievements.is_empty():
		pieces.append("新成就 +" + str(run_achievements.size() * 12))
	if not run_endings_unlocked.is_empty():
		pieces.append("新结局 +" + str(run_endings_unlocked.size() * 18))
	var difficulty_bonus := float(_difficulty_data().get("cultivation_bonus", 0.0))
	if difficulty_bonus > 0.0:
		pieces.append("劫数倍率 x%.1f" % (1.0 + difficulty_bonus))
	return "｜".join(pieces)


func _run_rank_projection_text() -> String:
	if in_title or run_finished:
		return "进入试炼后会根据推进、战斗、成长、灵石、试炼签、悬赏和结局收获预估本局评阶。"
	var current_score := _run_score(false)
	var clear_score := _run_score(true)
	var lines: Array[String] = [
		"当前约 %d 分，暂评 %s；若此构筑筑基约 %d 分，预计 %s。" % [
			current_score,
			_run_rank(current_score, false),
			clear_score,
			_run_rank(clear_score, true)
		],
		"提分方向：" + _rank_improvement_text(current_score, clear_score)
	]
	return "\n".join(lines)


func _rank_improvement_text(current_score: int, clear_score: int) -> String:
	var tips: Array[String] = []
	if not trial_mandate_completed:
		tips.append("完成试炼签 +20")
	if completed_bounty_count <= 0:
		tips.append("完成悬赏 +8 起")
	if treasures.size() + insights.size() + breakthroughs.size() < 3:
		tips.append("多拿法宝/悟道/破境")
	if spirit_stones < 30:
		tips.append("保留或赚取灵石")
	if battles_won < 5:
		tips.append("多赢战斗")
	if deck.has("inner_demon"):
		tips.append("净心冲无垢 +25")
	if clear_score < 300:
		tips.append("先稳定通关，筑基本身 +80")
	elif clear_score < 360:
		tips.append("冲甲上还需更多高价值成长")
	if tips.is_empty():
		tips.append("保持路线质量，优先安全通关")
	while tips.size() > 4:
		tips.pop_back()
	return "；".join(tips)


func _journal_detail_text() -> String:
	var lines: Array[String] = [
		"【主线】",
		_main_objective_text(),
		"",
		"【入门提示】",
		"标题页或战斗控制区的“引导/引导札”可查看第一局推荐、路线选择和构筑取舍。",
		"",
		"【当前试炼】",
		_current_run_objective_text(),
		"复盘码：" + _run_share_code_text(),
		"当前待办：" + _current_run_focus_text(),
		"月相异兆：" + _lunar_omen_detail_text(),
		"路线轨迹：" + _route_history_text(),
		"完胜破阵：" + _flawless_run_text(),
		"本局印记：" + _run_mark_detail_text(),
		"幕间誓约：" + _interlude_oath_detail_text(),
		"悬赏令：" + _bounty_detail_text(),
		"",
		"【牌组研判】",
		_deck_analysis_text(deck),
		"当前倾向：" + _run_route_tags_text(),
		"",
		"【渡劫准备】",
		_boss_prep_checklist_text(),
		"",
		"【评阶预估】",
		_run_rank_projection_text(),
		"",
		"【修行建议】",
		_run_advice_text(),
		"",
		"【传承目标】",
		_meta_objective_text()
	]
	return "\n".join(lines)


func _main_objective_text() -> String:
	return "穿过青岚谷、玄阴山道与筑基雷云，渡过最后雷劫，在煞气彻底反噬前筑基成功。"


func _current_run_objective_text() -> String:
	if in_title or run_finished:
		return "尚未进入试炼。选择流派与劫数后开始新一局。" + ("当前有未完成试炼，可从标题页继续。" if _has_saved_run() else "当前没有未完成试炼。")
	var act := _act_data()
	var next_step := "挑战 " + str(act["boss_title"]) if run_step >= RUN_STEPS_TO_BOSS else "继续选择路线节点"
	return "当前：%s｜第%d/%d幕 %s｜月相 %s｜种子 %d｜%s｜悬赏 %s｜完胜 %d｜总进度 %d/%d｜本幕进度 %d/%d｜下一步：%s｜战斗胜利 %d" % [
		_challenge_history_text(),
		current_act + 1,
		ACT_LIBRARY.size(),
		act["name"],
		_lunar_omen_name(),
		run_seed,
		_trial_mandate_detail_text(),
		_bounty_progress_text(),
		flawless_wins,
		_total_progress(),
		_total_progress_goal(),
		min(run_step, RUN_STEPS_TO_BOSS),
		RUN_STEPS_TO_BOSS,
		next_step,
		battles_won
	]


func _run_share_code_text() -> String:
	return _run_share_code_from_values(
		selected_origin,
		selected_difficulty,
		run_seed,
		lunar_omen_id,
		trial_mandate_id,
		active_bounty_id,
		run_challenge_id
	)


func _run_share_code_from_snapshot(snapshot: Dictionary) -> String:
	return _run_share_code_from_values(
		str(snapshot.get("selected_origin", selected_origin)),
		str(snapshot.get("selected_difficulty", selected_difficulty)),
		int(snapshot.get("run_seed", 0)),
		str(snapshot.get("lunar_omen_id", "")),
		str(snapshot.get("trial_mandate_id", "")),
		str(snapshot.get("active_bounty_id", "")),
		str(snapshot.get("run_challenge_id", ""))
	)


func _run_share_code_from_values(origin_id: String, difficulty_id: String, seed: int, omen_id: String, mandate_id: String, bounty_id: String, challenge_id: String) -> String:
	var parts: Array[String] = [
		"QLN",
		"O=" + _share_token(origin_id),
		"D=" + _share_token(difficulty_id),
		"S=" + str(seed),
		"M=" + _share_token(omen_id),
		"T=" + _share_token(mandate_id),
		"B=" + _share_token(bounty_id)
	]
	if not challenge_id.is_empty():
		parts.append("C=" + _share_token(challenge_id))
	return "|".join(parts)


func _share_token(value: String) -> String:
	return value if not value.is_empty() else "none"


func _current_run_focus_text() -> String:
	if in_title or run_finished:
		return "从标题页开始或继续一局试炼。"
	var focus: Array[String] = []
	if player_hp <= max(18, int(max_hp * 0.35)):
		focus.append("血线偏低，优先调息/药圃/恢复牌")
	if not trial_mandate_completed and not trial_mandate_id.is_empty():
		focus.append("推进试炼签：" + _trial_mandate_progress_text())
	if not active_bounty_id.is_empty():
		focus.append("顺手完成悬赏：" + _bounty_progress_text())
	if not next_duel_trial.is_empty():
		focus.append("下一战有试剑约束，先确认护盾和斩杀")
	if focus.size() < 3 and flawless_wins < 3:
		focus.append("本局完胜 " + str(flawless_wins) + "/3，护盾充足时可争取无伤破阵")
	if deck.has("inner_demon"):
		focus.append("牌组有心魔，寻找净心/删牌")
	if run_step >= RUN_STEPS_TO_BOSS:
		focus.append("本幕 Boss 已现，补足血线和消耗品后应战")
	elif focus.size() < 3:
		focus.append("选择下一处路线节点，优先补当前构筑短板")
	if focus.size() < 3 and consumables.is_empty():
		focus.append("没有消耗品，可在坊市/洞府/调息补应急资源")
	if focus.size() < 3 and treasures.is_empty() and current_act > 0:
		focus.append("缺少法宝，中后期可考虑精英或法宝事件")
	while focus.size() > 4:
		focus.pop_back()
	return "；".join(focus)


func _run_advice_text() -> String:
	if in_title or run_finished:
		return "传承修为会解锁额外起始牌；图鉴可查看所有卡牌、法宝、悟道、消耗品、敌人和幕节点。"
	var advice: Array[String] = []
	var profile := _deck_profile(deck)
	if player_hp <= max(18, int(max_hp * 0.35)):
		advice.append("生命偏低，优先考虑调息、回血牌或回春丹。")
	if deck.has("inner_demon"):
		advice.append("牌组含有心魔，坊市净心、竹林忘却或镇魂古龛都能清理。")
	if int(profile.get("attack", 0)) <= 2 and current_act > 0:
		advice.append("攻击牌偏少，后续 Boss 生命更高，优先拿伤害牌或剑心类突破。")
	if int(profile.get("skill", 0)) <= 2 and current_act > 0:
		advice.append("法门牌偏少，防御和循环不足，优先补护盾、过牌或恢复。")
	if int(profile.get("defense", 0)) <= 2 and current_act >= 1:
		advice.append("护体/恢复密度偏低，第二幕后容易被连击压低血线。")
	if int(profile.get("draw", 0)) <= 1 and deck.size() >= 12:
		advice.append("牌组变厚但过牌不足，御风步、通脉诀或听风辨息会更值钱。")
	if int(profile.get("edge", 0)) >= 2 and int(profile.get("attack", 0)) <= 3:
		advice.append("已有剑势来源，后续优先补多段或高效攻击，把锋芒转成实际伤害。")
	if int(profile.get("multi_hit", 0)) >= 2 and int(profile.get("edge", 0)) == 0:
		advice.append("多段攻击较多，藏锋诀、锋芒护身或青锋剑穗会显著提高爆发。")
	if max_qi <= 3 and current_act > 0:
		advice.append("后续幕灵气压力提高，通脉诀、吐纳周天或开脉小成都很有价值。")
	if not next_duel_trial.is_empty():
		advice.append("下一场战斗带有试剑约束：" + _duel_trial_history_text() + "，优先评估血线、护盾和斩杀能力。")
	if treasures.is_empty():
		advice.append("尚无法宝，精英战、法宝奖励或镇魂古龛都可能补强。")
	if insights.is_empty():
		advice.append("尚无悟道，精英战或中段推进能提供本局被动。")
	if consumables.is_empty():
		advice.append("没有消耗品，坊市、洞府、药圃或战斗奖励可补充应急资源。")
	if advice.is_empty():
		advice.append("状态尚稳，可以按当前构筑选择高价值战斗或精英节点。")
	return "\n".join(advice)


func _boss_prep_checklist_text() -> String:
	if in_title or run_finished:
		return "进入试炼后会根据血线、牌组、资源和试剑约束生成 Boss 前整备清单。"
	var lines: Array[String] = []
	for check in _boss_prep_checks():
		lines.append("%s｜%s｜%s" % [str(check["state"]), str(check["name"]), str(check["advice"])])
	return "\n".join(lines)


func _boss_prep_checks() -> Array[Dictionary]:
	var profile := _deck_profile(deck)
	var checks: Array[Dictionary] = []
	var hp_ratio := float(player_hp) / float(max(1, max_hp))
	if hp_ratio >= 0.65:
		checks.append(_boss_prep_check("血线", "稳", "生命 " + str(player_hp) + "/" + str(max_hp) + "，可以承受常规连击。"))
	elif hp_ratio >= 0.4:
		checks.append(_boss_prep_check("血线", "险", "生命 " + str(player_hp) + "/" + str(max_hp) + "，进 Boss 前最好补一次恢复。"))
	else:
		checks.append(_boss_prep_check("血线", "危", "生命 " + str(player_hp) + "/" + str(max_hp) + "，优先调息、药圃或回春丹。"))
	var attack_count := int(profile.get("attack", 0))
	if attack_count >= 4:
		checks.append(_boss_prep_check("伤害", "稳", "攻击牌 " + str(attack_count) + " 张，斩杀来源充足。"))
	elif attack_count >= 3:
		checks.append(_boss_prep_check("伤害", "可", "攻击牌 " + str(attack_count) + " 张，留意 Boss 护体回合。"))
	else:
		checks.append(_boss_prep_check("伤害", "险", "攻击牌偏少，优先补攻击牌、剑势或燃烧成长。"))
	var defense_count := int(profile.get("defense", 0))
	if defense_count >= 4:
		checks.append(_boss_prep_check("防御", "稳", "护盾/恢复密度足，适合拖过高压招式。"))
	elif defense_count >= 3:
		checks.append(_boss_prep_check("防御", "可", "防御牌 " + str(defense_count) + " 张，注意保留灵气应对连击。"))
	else:
		checks.append(_boss_prep_check("防御", "险", "防御偏薄，优先补护体、恢复或玉骨类成长。"))
	var draw_count := int(profile.get("draw", 0))
	if deck.size() < 12 or draw_count >= 2:
		checks.append(_boss_prep_check("循环", "稳", "牌组 " + str(deck.size()) + " 张，过牌来源 " + str(draw_count) + "。"))
	else:
		checks.append(_boss_prep_check("循环", "险", "牌组偏厚但过牌不足，优先补御风步、通脉诀或抽牌悟道。"))
	if max_qi >= 4 or current_act == 0:
		checks.append(_boss_prep_check("灵气", "稳", "灵气上限 " + str(max_qi) + "，足以支撑当前幕。"))
	else:
		checks.append(_boss_prep_check("灵气", "险", "灵气上限 " + str(max_qi) + "，第二幕后高费牌会更卡手。"))
	var curse_count := int(profile.get("curse", 0))
	if curse_count <= 0:
		checks.append(_boss_prep_check("心魔", "稳", "牌组无心魔杂念。"))
	elif curse_count == 1:
		checks.append(_boss_prep_check("心魔", "险", "仍有 1 张心魔，Boss 前能净心就净心。"))
	else:
		checks.append(_boss_prep_check("心魔", "危", "心魔 " + str(curse_count) + " 张，容易堵手，优先删牌或镇魂。"))
	if consumables.size() >= 2:
		checks.append(_boss_prep_check("小物", "稳", "消耗品 " + str(consumables.size()) + " 件，应急资源充足。"))
	elif consumables.size() == 1:
		checks.append(_boss_prep_check("小物", "可", "有 1 件消耗品，关键回合再用。"))
	else:
		checks.append(_boss_prep_check("小物", "险", "没有消耗品，坊市、调息或洞府可补应急。"))
	if next_duel_trial.is_empty():
		checks.append(_boss_prep_check("约束", "稳", "下一战没有试剑加压。"))
	else:
		checks.append(_boss_prep_check("约束", "危", "下一战带有 " + _duel_trial_history_text() + "，Boss 前务必确认血线和护盾。"))
	return checks


func _boss_prep_check(name: String, state: String, advice: String) -> Dictionary:
	return {"name": name, "state": state, "advice": advice}


func _meta_objective_text() -> String:
	var pieces: Array[String] = [
		"传承修为：" + str(cultivation_points) + "｜通关：" + str(victories) + "｜最佳胜场：" + str(best_battles) + "｜最佳评阶：" + _best_run_rank_text(),
		"流派通关：" + str(_mastered_origin_count()) + "/" + str(ORIGIN_LIBRARY.size()),
		"成就：" + str(achievements.size()) + "/" + str(ACHIEVEMENT_LIBRARY.size()),
		"挑战：" + str(completed_challenges.size()) + "/" + str(CHALLENGE_LIBRARY.size()),
		"幕间誓约：" + _interlude_oath_mastery_progress_text(),
		"结局：" + str(unlocked_endings.size()) + "/" + str(ENDING_LIBRARY.size()),
		"流派目标：" + _recommended_origin_goal_text(),
		_unlock_progress_text()
	]
	if not run_history.is_empty():
		var latest: Dictionary = run_history[0]
		pieces.append("最近一局：" + str(latest.get("result", "试炼记录")) + "，评阶 " + str(latest.get("rank", "丁")) + " " + str(latest.get("score", 0)) + "分，到达第" + str(latest.get("act", 1)) + "幕，总进度 " + str(latest.get("progress", 0)) + "/" + str(_total_progress_goal()) + "。")
	return "\n".join(pieces)


func _achievement_names_text() -> String:
	if achievements.is_empty():
		return "无"
	var names: Array[String] = []
	for achievement_id in achievements:
		var achievement := _achievement_data(achievement_id)
		if not achievement.is_empty():
			names.append(str(achievement["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _run_achievement_names_text() -> String:
	if run_achievements.is_empty():
		return "无"
	var names: Array[String] = []
	for achievement_id in run_achievements:
		var achievement := _achievement_data(achievement_id)
		if not achievement.is_empty():
			names.append(str(achievement["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _card_names_from_ids(card_ids: Array) -> String:
	var names: Array[String] = []
	for card_id in card_ids:
		names.append(_card_display_name(str(card_id)))
	return "、".join(names)


func _card_display_name(card_id: String) -> String:
	var card := _card_data(card_id)
	var badge := _card_upgrade_badge(card_id)
	return str(card["name"]) + ("（" + badge + "）" if not badge.is_empty() else "")


func _card_upgrade_badge(card_id: String) -> String:
	var level := _card_upgrade_level(card_id)
	return "精研 +" + str(level) if level > 0 else ""


func _card_upgrade_rule_text(card_id: String) -> String:
	var base_id := _base_card_id(card_id)
	if not CARD_LIBRARY.has(base_id) or _is_curse_card(base_id) or MAX_CARD_UPGRADE <= 0:
		return "不可精研"
	var base := _card_data(base_id)
	var upgraded := _card_data(_upgraded_card_id(base_id))
	var changes: Array[String] = []
	for key in ["cost", "damage", "block", "heal", "burn", "weak", "draw", "gain_edge", "cleanse_curse"]:
		if not base.has(key) and not upgraded.has(key):
			continue
		var before := int(base.get(key, 0))
		var after := int(upgraded.get(key, 0))
		if before == after:
			continue
		changes.append(_card_stat_name(key) + " " + str(before) + "->" + str(after))
	return "精研：" + ("、".join(changes) if not changes.is_empty() else "说明强化")


func _card_stat_name(key: String) -> String:
	match key:
		"cost":
			return "灵气"
		"damage":
			return "伤害"
		"block":
			return "护盾"
		"heal":
			return "治疗"
		"burn":
			return "燃烧"
		"weak":
			return "虚弱"
		"draw":
			return "抽牌"
		"gain_edge":
			return "剑势"
		"cleanse_curse":
			return "净心"
		_:
			return key


func _starting_unlock_names() -> String:
	var names: Array[String] = []
	for unlock in META_UNLOCKS:
		if cultivation_points >= int(unlock["points"]):
			names.append(str(unlock["name"]))
	return "、".join(names) if not names.is_empty() else "无"


func _starting_run_preview_text() -> String:
	var origin := _origin_data()
	var difficulty := _difficulty_data()
	var start_hp := BASE_MAX_HP + int(origin.get("max_hp_bonus", 0))
	var lines: Array[String] = [
		"开局预览：生命 %d/%d｜灵气上限 3｜流派被动：%s" % [start_hp, start_hp, origin["desc"]],
		"劫数修正：%s｜结算修为 %s" % [_difficulty_bonus_text(difficulty), _difficulty_cultivation_text(difficulty)],
		"流派打法：" + _origin_plan_text(selected_origin),
		"劫数备战：" + _difficulty_prep_text(selected_difficulty),
		"起始牌组：" + _format_card_name_counts(_starting_deck_for_run()),
		"传承追加：" + _starting_unlock_names()
	]
	if origin.has("start_consumable"):
		var consumable_id := str(origin["start_consumable"])
		if CONSUMABLE_LIBRARY.has(consumable_id):
			var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
			lines.append("开局小物：" + str(consumable["name"]) + "｜" + str(consumable["desc"]))
	return "\n".join(lines)


func _origin_plan_text(origin_id: String) -> String:
	match origin_id:
		"bamboo_sword":
			return "均衡开局，优先根据首批奖励决定剑势、护盾或循环方向。"
		"talisman_roamer":
			return "燃烧和灵气爆发起步，优先拿符火、过牌和燃烧强化。"
		"spring_healer":
			return "恢复续航稳定，适合多走精英/事件换成长，注意补输出。"
		"demon_tempered":
			return "攻击上限高但带心魔，优先净心、回血和低费攻击。"
		"thunder_roamer":
			return "小物与多段爆发开局，优先找消耗品强化、剑势和补牌。"
		_:
			return "按当前牌组短板选择奖励与路线。"


func _difficulty_prep_text(difficulty_id: String) -> String:
	match difficulty_id:
		"normal":
			return "适合熟悉流派；可优先尝试未解锁结局、试炼签和构筑路线。"
		"hard":
			return "敌人更硬，前两幕要补稳定伤害、护盾和恢复，避免牌组过厚。"
		"nightmare":
			return "敌势显著提高，优先保血、净心、压缩牌组，并谨慎接试剑约束。"
		_:
			return "先稳血线，再追求高价值成长。"


func _difficulty_bonus_text(difficulty: Dictionary) -> String:
	var pieces: Array[String] = []
	var hp_bonus := int(difficulty.get("hp_bonus", 0))
	var damage_bonus := int(difficulty.get("damage_bonus", 0))
	var block_bonus := int(difficulty.get("block_bonus", 0))
	if hp_bonus > 0:
		pieces.append("敌命 +" + str(hp_bonus))
	if damage_bonus > 0:
		pieces.append("敌伤 +" + str(damage_bonus))
	if block_bonus > 0:
		pieces.append("敌盾 +" + str(block_bonus))
	return "无" if pieces.is_empty() else "、".join(pieces)


func _difficulty_cultivation_text(difficulty: Dictionary) -> String:
	var bonus_percent := int(round(float(difficulty.get("cultivation_bonus", 0.0)) * 100.0))
	return "标准" if bonus_percent <= 0 else "+" + str(bonus_percent) + "%"


func _format_card_name_counts(card_ids: Array[String]) -> String:
	if card_ids.is_empty():
		return "无"
	var counts := {}
	for card_id in card_ids:
		counts[card_id] = int(counts.get(card_id, 0)) + 1
	var ids := counts.keys()
	ids.sort()
	var names: Array[String] = []
	for card_id in ids:
		var card: Dictionary = _card_data(str(card_id))
		names.append(_card_display_name(str(card_id)) + " x" + str(counts[card_id]))
	return "、".join(names)


func _unlock_path_text() -> String:
	var pieces: Array[String] = []
	for unlock in META_UNLOCKS:
		var state := "已解锁" if cultivation_points >= int(unlock["points"]) else "未解锁"
		pieces.append(str(unlock["name"]) + " 修为 " + str(unlock["points"]) + "（" + state + "）")
	return "；".join(pieces)


func _skip_reward() -> void:
	var heal_amount := 10
	player_hp = min(max_hp, player_hp + heal_amount)
	_log("你压下贪念，调息恢复 " + str(heal_amount) + " 点生命。")
	_show_map_choices()


func _reroll_rewards() -> void:
	var price := _reward_reroll_price()
	if not in_reward:
		return
	if spirit_stones < price:
		_log("灵石不足，无法请摊主重整奖励。")
		_refresh()
		return
	spirit_stones -= price
	var had_cards := not reward_cards.is_empty()
	var had_treasures := not reward_treasures.is_empty()
	var had_consumables := not reward_consumables.is_empty()
	var had_insights := not reward_insights.is_empty()
	reward_cards = _roll_rewards() if had_cards else []
	reward_treasures = _roll_treasure_rewards() if had_treasures else []
	reward_consumables = _roll_consumable_rewards() if had_consumables else []
	reward_insights = _roll_insight_rewards() if had_insights else []
	_log("花费 " + str(price) + " 灵石重整奖励。")
	_save_run_snapshot("reward")
	_refresh()


func _lose_run() -> void:
	_log("道心崩散，试炼失败。")
	hand.clear()
	_show_run_summary("试炼失败", "月色沉入谷底，伤势与杂念压过灵台。所幸性命尚存，下一次可走得更远。")


func _refresh() -> void:
	_refresh_mode_visibility()
	top_bar.text = "%s    幕 %d/%d %s    进度 %d/%d    月相 %s    种子 %d    %s    悬赏 %s" % [
		_challenge_history_text(),
		current_act + 1,
		ACT_LIBRARY.size(),
		_act_data()["name"],
		_total_progress(),
		_total_progress_goal(),
		_lunar_omen_name(),
		run_seed,
		_trial_mandate_progress_text(),
		_bounty_progress_text()
	]
	status_bar.text = "%s虚弱 %d    下战虚弱 %d    抽牌 %d    弃牌 %d    消耗 %d" % [
		("回合 %d    " % combat_turn) if _is_in_combat() else "",
		player_weak,
		next_combat_player_weak,
		draw_pile.size(),
		discard_pile.size(),
		exhaust_pile.size()
	]
	_set_status_chip("hp", "%d/%d" % [player_hp, max_hp])
	_set_status_chip("qi", "%d/%d" % [qi, max_qi])
	_set_status_chip("shield", str(shield))
	_set_status_chip("edge", str(player_edge))
	_set_status_chip("stones", str(spirit_stones))
	_set_status_chip("items", str(consumables.size()))
	treasure_label.text = "    ".join([
		_treasure_summary(),
		_insight_summary(),
		_breakthrough_summary(),
		_consumable_summary()
	])
	treasure_label.visible = not treasures.is_empty() or not insights.is_empty() or not breakthroughs.is_empty() or not consumables.is_empty()
	coach_tip_label.visible = show_decision_hints and not in_title and not run_finished
	coach_tip_label.text = _coach_tip_text() if coach_tip_label.visible else ""
	player_hp_bar.max_value = max_hp
	player_hp_bar.value = player_hp
	enemy_hp_bar.max_value = int(enemy.get("max_hp", 1))
	enemy_hp_bar.value = enemy_hp
	var art_path := _preferred_art_path(enemy)
	enemy_art.texture = _load_cached_texture(art_path) if not art_path.is_empty() else null
	enemy_art.visible = enemy_art.texture != null
	_refresh_scene_backdrop(art_path)
	enemy_label.text = "%s    生命 %d/%d    护体 %d%s%s%s" % [
		enemy.get("name", ""),
		enemy_hp,
		enemy.get("max_hp", 0),
		enemy_block,
		"    破绽" if enemy_flawed else "",
		"    燃烧 " + str(enemy_burn) if enemy_burn > 0 else "",
		"    虚弱 " + str(enemy_weak) if enemy_weak > 0 else ""
	]
	intent_label.text = _intent_text()
	intent_icon.texture = _load_cached_texture(_intent_icon_path())
	enemy_advice_label.visible = show_decision_hints and not _is_short_screen()
	enemy_advice_label.text = _enemy_advice_text() if show_decision_hints else ""
	enemy_advice_label.tooltip_text = _enemy_pattern_detail_text() + "\n" + _image2_enemy_art_state_text(enemy) if show_decision_hints else ""
	pile_label.text = "牌库 %d\n弃牌 %d\n手牌 %d" % [draw_pile.size(), discard_pile.size(), hand.size()]
	var visible_log_lines := 10 if show_extended_log else 6
	log_label.text = "[color=#b9c7bd]" + "\n".join(log_lines.slice(max(0, log_lines.size() - visible_log_lines))) + "[/color]"
	if pile_view_panel.visible:
		_refresh_pile_view()
	_refresh_hand()
	_refresh_rewards()
	_refresh_map()
	_refresh_choices()
	_refresh_controls()


func _refresh_scene_backdrop(enemy_art_path: String) -> void:
	if scene_backdrop == null or scene_scrim == null:
		return
	var path := enemy_art_path
	if in_choice:
		path = _choice_visual_art_path()
	elif in_reward:
		path = CARD_BACK_PATH
	elif in_map:
		path = _act_backdrop_art_path()
	elif path.is_empty():
		path = "res://assets/enemy_wolf_shadow.png"
	scene_backdrop.texture = _load_cached_texture(path)
	scene_backdrop.modulate = Color(0.62, 0.73, 0.70, 0.74)
	scene_scrim.color = Color(0.008, 0.020, 0.024, 0.58 if _is_in_combat() else 0.66)
	mode_art_watermark.visible = not _is_in_combat()
	mode_art_watermark.texture = _load_cached_texture(_mode_watermark_art_path())


func _act_backdrop_art_path() -> String:
	return str(ACT_BACKGROUND_PATHS[clamp(current_act, 0, ACT_BACKGROUND_PATHS.size() - 1)])


func _choice_visual_art_path() -> String:
	if not choice_art_path.is_empty() and FileAccess.file_exists(choice_art_path):
		return choice_art_path
	if choice_options.is_empty():
		return CARD_BACK_PATH
	var first_tone := str(choice_options[0].get("tone", "event"))
	return _tone_art_path(first_tone)


func _mode_watermark_art_path() -> String:
	if in_reward:
		return CARD_BACK_PATH
	if in_choice:
		return _choice_visual_art_path()
	if in_map:
		return _act_backdrop_art_path()
	return CARD_BACK_PATH


func _tone_art_path(tone: String) -> String:
	match tone:
		"battle", "elite":
			return CARD_IRON_SWORD_ART_PATH
		"rest":
			return CARD_BODY_WARD_ART_PATH
		"training":
			return CARD_BREATH_CYCLE_ART_PATH
		"market":
			return CARD_SPIRIT_STONE_ART_PATH
		_:
			return CARD_BACK_PATH


func _intent_icon_path() -> String:
	var move := _current_enemy_move()
	if move.has("damage"):
		return "res://assets/ui/icons/burn.png"
	if int(move.get("player_weak", 0)) > 0:
		return "res://assets/ui/icons/weak.png"
	if str(move.get("add_status", "")) == "inner_demon":
		return "res://assets/ui/icons/curse.png"
	if move.has("block"):
		return "res://assets/ui/icons/shield.png"
	return "res://assets/ui/icons/edge.png"


func _refresh_mode_visibility() -> void:
	var combat_visible := _is_in_combat()
	battlefield.visible = combat_visible
	hand_box.visible = combat_visible
	log_label.visible = combat_visible and not _is_short_screen()
	if not combat_visible:
		_close_pile_view()


func _coach_tip_text() -> String:
	if in_choice:
		return "试炼提示：先看每个选项标签和预估代价；低血时保守，牌组被心魔污染时优先净心。"
	if in_reward:
		return "试炼提示：奖励先补当前短板；不契合路线时可重掷或跳过，别把牌组拿厚。"
	if in_map:
		if run_step >= RUN_STEPS_TO_BOSS:
			return "试炼提示：Boss 前先看渡劫准备，血线、护盾、防御和心魔都稳再应战。"
		return "试炼提示：按路线研判选节点；状态差先恢复/净心，状态稳再用精英或试剑换高收益。"
	if _is_in_combat():
		var recommended_index := _recommended_hand_card_index()
		if recommended_index >= 0:
			var recommended_card_id := str(hand[recommended_index])
			return "试炼提示：结合敌人当前意图，推荐先打%s：%s" % [
				_card_display_name(recommended_card_id),
				_combat_card_recommendation_reason(recommended_card_id)
			]
		var move := _current_enemy_move()
		if move.has("damage"):
			return "试炼提示：敌人将造成伤害，先算护盾和血线；能斩杀再全力输出。"
		if move.has("block"):
			return "试炼提示：敌人要护体，适合蓄剑势、叠燃烧、过牌或准备下一回合爆发。"
		if move.has("add_status"):
			return "试炼提示：敌人会污染牌堆，能净心就净心，不能净心就尽快结束战斗。"
		return "试炼提示：先读行动计划与下一式，再分配灵气、消耗品和手牌。"
	return "试炼提示：查看任务札记确认当前目标，必要时用引导札复习路线和构筑取舍。"


func _show_pile_view(view_id: String) -> void:
	active_pile_view = view_id
	pile_view_scrim.visible = true
	pile_view_panel.visible = true
	_refresh_pile_view()


func _show_journal_view() -> void:
	active_pile_view = "journal"
	pile_view_scrim.visible = true
	pile_view_panel.visible = true
	_refresh_pile_view()


func _show_keywords_view() -> void:
	active_pile_view = "keywords"
	pile_view_scrim.visible = true
	pile_view_panel.visible = true
	_refresh_pile_view()


func _show_guide_view() -> void:
	active_pile_view = "guide"
	pile_view_scrim.visible = true
	pile_view_panel.visible = true
	_refresh_pile_view()


func _close_pile_view() -> void:
	active_pile_view = ""
	if pile_view_scrim != null:
		pile_view_scrim.visible = false
	if pile_view_panel != null:
		pile_view_panel.visible = false


func _refresh_pile_view() -> void:
	if active_pile_view.is_empty():
		return
	pile_view_art.texture = _load_cached_texture(_pile_view_art_path(active_pile_view))
	if active_pile_view == "journal":
		pile_view_title.text = "任务札记"
		pile_view_list.text = _journal_detail_text()
		return
	if active_pile_view == "keywords":
		pile_view_title.text = "关键词"
		pile_view_list.text = _keywords_detail_text()
		return
	if active_pile_view == "guide":
		pile_view_title.text = "入门引导"
		pile_view_list.text = _guide_detail_text()
		return
	if active_pile_view == "log":
		pile_view_title.text = "完整日志（%d）" % log_lines.size()
		pile_view_list.text = _full_log_text()
		return
	if _is_growth_view(active_pile_view):
		pile_view_title.text = "%s（%d）" % [_pile_view_name(active_pile_view), _growth_view_count(active_pile_view)]
		pile_view_list.text = _growth_detail_text(active_pile_view)
		return
	var cards := _pile_cards(active_pile_view)
	pile_view_title.text = "%s（%d）" % [_pile_view_name(active_pile_view), cards.size()]
	pile_view_list.text = _format_card_counts(cards)


func _pile_view_art_path(view_id: String) -> String:
	match view_id:
		"journal", "log":
			return CARD_SPIRIT_STONE_ART_PATH
		"keywords", "guide":
			return CARD_BACK_PATH
		"deck", "draw", "discard", "exhaust":
			return CARD_SWORD_ARRAY_ART_PATH
		"treasures":
			return "res://assets/ui/treasures/moon_jade.png"
		"insights":
			return "res://assets/ui/insights/open_meridians.png"
		"breakthroughs":
			return "res://assets/ui/breakthroughs/sword_heart.png"
		"items":
			return "res://assets/ui/consumables/mending_pill.png"
		_:
			return CARD_BACK_PATH


func _is_growth_view(view_id: String) -> bool:
	return ["treasures", "insights", "breakthroughs", "items"].has(view_id)


func _growth_view_count(view_id: String) -> int:
	match view_id:
		"treasures":
			return treasures.size()
		"insights":
			return insights.size()
		"breakthroughs":
			return breakthroughs.size()
		"items":
			return consumables.size()
		_:
			return 0


func _growth_detail_text(view_id: String) -> String:
	match view_id:
		"treasures":
			return _owned_treasure_detail_text()
		"insights":
			return _owned_insight_detail_text()
		"breakthroughs":
			return _owned_breakthrough_detail_text()
		"items":
			return _owned_consumable_detail_text()
		_:
			return ""


func _pile_cards(view_id: String) -> Array[String]:
	match view_id:
		"deck":
			return deck.duplicate()
		"draw":
			return draw_pile.duplicate()
		"discard":
			return discard_pile.duplicate()
		"exhaust":
			return exhaust_pile.duplicate()
		_:
			return []


func _pile_view_name(view_id: String) -> String:
	match view_id:
		"deck":
			return "完整牌组"
		"draw":
			return "抽牌堆"
		"discard":
			return "弃牌堆"
		"exhaust":
			return "消耗区"
		"treasures":
			return "法宝"
		"insights":
			return "悟道"
		"breakthroughs":
			return "破境"
		"items":
			return "消耗品"
		_:
			return "牌堆"


func _pile_destination_name(destination: String) -> String:
	match destination:
		"draw":
			return "抽牌堆"
		"hand":
			return "手牌"
		_:
			return "弃牌堆"


func _deck_profile(cards: Array[String]) -> Dictionary:
	var profile := {
		"total": cards.size(),
		"attack": 0,
		"skill": 0,
		"curse": 0,
		"defense": 0,
		"heal": 0,
		"draw": 0,
		"burn": 0,
		"weak": 0,
		"edge": 0,
		"multi_hit": 0,
		"exhaust": 0,
		"low_cost": 0,
		"high_cost": 0
	}
	for card_id in cards:
		var card: Dictionary = _card_data(str(card_id))
		var type_id := str(card.get("type", ""))
		if type_id == "attack":
			profile["attack"] = int(profile["attack"]) + 1
		elif type_id == "skill":
			profile["skill"] = int(profile["skill"]) + 1
		elif type_id == "curse":
			profile["curse"] = int(profile["curse"]) + 1
		if card.has("block") or card.has("heal") or card.has("cleanse_player_weak") or card.has("cleanse_curse"):
			profile["defense"] = int(profile["defense"]) + 1
		if card.has("heal"):
			profile["heal"] = int(profile["heal"]) + 1
		if card.has("draw"):
			profile["draw"] = int(profile["draw"]) + 1
		if card.has("burn"):
			profile["burn"] = int(profile["burn"]) + 1
		if card.has("weak"):
			profile["weak"] = int(profile["weak"]) + 1
		if card.has("gain_edge"):
			profile["edge"] = int(profile["edge"]) + 1
		if int(card.get("hits", 1)) > 1:
			profile["multi_hit"] = int(profile["multi_hit"]) + 1
		if card.get("exhaust", false):
			profile["exhaust"] = int(profile["exhaust"]) + 1
		if int(card.get("cost", 0)) <= 1:
			profile["low_cost"] = int(profile["low_cost"]) + 1
		if int(card.get("cost", 0)) >= 2:
			profile["high_cost"] = int(profile["high_cost"]) + 1
	return profile


func _deck_analysis_text(cards: Array[String]) -> String:
	var profile := _deck_profile(cards)
	if int(profile["total"]) <= 0:
		return "暂无牌组。"
	var tags: Array[String] = []
	if int(profile["attack"]) >= int(profile["skill"]) + 2:
		tags.append("攻势偏重")
	elif int(profile["skill"]) >= int(profile["attack"]) + 2:
		tags.append("法门偏重")
	else:
		tags.append("攻防均衡")
	if int(profile["burn"]) >= 2:
		tags.append("燃烧路线")
	if int(profile["weak"]) >= 2:
		tags.append("虚弱控制")
	if int(profile["edge"]) >= 2:
		tags.append("剑势连段")
	if int(profile["draw"]) >= 3:
		tags.append("循环顺畅")
	elif int(profile["total"]) >= 12 and int(profile["draw"]) <= 1:
		tags.append("过牌不足")
	if int(profile["defense"]) <= 2 and int(profile["total"]) >= 9:
		tags.append("防御偏薄")
	if int(profile["curse"]) > 0:
		tags.append("心魔污染")
	if int(profile["high_cost"]) >= 4 and max_qi <= 3:
		tags.append("灵气吃紧")
	var lines: Array[String] = [
		"牌组 %d 张｜攻击 %d｜法门 %d｜心魔 %d｜防御/恢复 %d｜过牌 %d｜燃烧 %d｜虚弱 %d｜剑势 %d｜消耗 %d" % [
			int(profile["total"]),
			int(profile["attack"]),
			int(profile["skill"]),
			int(profile["curse"]),
			int(profile["defense"]),
			int(profile["draw"]),
			int(profile["burn"]),
			int(profile["weak"]),
			int(profile["edge"]),
			int(profile["exhaust"])
		],
		"研判：" + ("、".join(tags) if not tags.is_empty() else "尚未成型"),
		"补强优先级：" + _deck_priority_text(cards)
	]
	return "\n".join(lines)


func _deck_detail_text(cards: Array[String]) -> String:
	if cards.is_empty():
		return "暂无牌组。"
	var sections: Array[String] = [
		_deck_analysis_text(cards),
		"费用曲线：" + _deck_cost_curve_text(cards),
		"稀有度：" + _deck_rarity_text(cards),
		"关键组件：" + _deck_key_components_text(cards),
		"管理建议：" + _deck_management_advice_text(cards)
	]
	return "\n".join(sections)


func _deck_cost_curve_text(cards: Array[String]) -> String:
	var costs := {
		"0": 0,
		"1": 0,
		"2": 0,
		"3+": 0
	}
	var total_cost := 0
	var playable_count := 0
	for card_id in cards:
		var card := _card_data(str(card_id))
		if str(card.get("type", "")) == "curse":
			continue
		var cost := int(card.get("cost", 0))
		playable_count += 1
		total_cost += cost
		if cost <= 0:
			costs["0"] = int(costs["0"]) + 1
		elif cost == 1:
			costs["1"] = int(costs["1"]) + 1
		elif cost == 2:
			costs["2"] = int(costs["2"]) + 1
		else:
			costs["3+"] = int(costs["3+"]) + 1
	var average := 0.0 if playable_count <= 0 else float(total_cost) / float(playable_count)
	return "0费 %d｜1费 %d｜2费 %d｜3费+ %d｜平均 %.1f" % [
		int(costs["0"]),
		int(costs["1"]),
		int(costs["2"]),
		int(costs["3+"]),
		average
	]


func _deck_rarity_text(cards: Array[String]) -> String:
	var counts := _empty_rarity_counts()
	for card_id in cards:
		var card := _card_data(str(card_id))
		_increment_balance_count(counts, str(card.get("rarity", "common")))
	return _rarity_count_text(counts)


func _deck_key_components_text(cards: Array[String]) -> String:
	var components: Array[String] = []
	var profile := _deck_profile(cards)
	if int(profile.get("multi_hit", 0)) > 0:
		components.append("多段 " + str(profile["multi_hit"]))
	if int(profile.get("edge", 0)) > 0:
		components.append("剑势源 " + str(profile["edge"]))
	if int(profile.get("burn", 0)) > 0:
		components.append("燃烧 " + str(profile["burn"]))
	if int(profile.get("weak", 0)) > 0:
		components.append("虚弱 " + str(profile["weak"]))
	if int(profile.get("draw", 0)) > 0:
		components.append("过牌 " + str(profile["draw"]))
	if int(profile.get("heal", 0)) > 0:
		components.append("恢复 " + str(profile["heal"]))
	if _deck_contains_effect(cards, "cleanse_curse"):
		components.append("净心")
	if _deck_contains_effect(cards, "gain_qi"):
		components.append("灵气牌")
	if int(profile.get("curse", 0)) > 0:
		components.append("心魔 " + str(profile["curse"]))
	return "、".join(components) if not components.is_empty() else "尚无明显组件"


func _deck_contains_effect(cards: Array[String], effect_key: String) -> bool:
	for card_id in cards:
		var card := _card_data(str(card_id))
		if card.has(effect_key):
			return true
	return false


func _deck_management_advice_text(cards: Array[String]) -> String:
	var advice: Array[String] = []
	var profile := _deck_profile(cards)
	if int(profile.get("curse", 0)) > 0:
		advice.append("优先净心：" + _card_names_for_effect(cards, "unplayable", 2))
	if int(profile.get("draw", 0)) <= 1 and cards.size() >= 12:
		advice.append("补过牌或删厚牌")
	if int(profile.get("defense", 0)) <= 2 and cards.size() >= 9:
		advice.append("补护盾/恢复")
	if int(profile.get("attack", 0)) <= 2 and current_act > 0:
		advice.append("补主力攻击")
	var removable := _removable_card_options()
	if not removable.is_empty():
		advice.append("可删候选：" + _format_card_name_counts(removable))
	var upgradable := _upgradable_card_options()
	if not upgradable.is_empty():
		advice.append("可精研候选：" + _format_card_name_counts(upgradable))
	return "；".join(advice) if not advice.is_empty() else "牌组结构健康，按当前路线补高价值组件。"


func _deck_priority_text(cards: Array[String]) -> String:
	var profile := _deck_profile(cards)
	var priorities: Array[String] = []
	if int(profile.get("curse", 0)) > 0:
		priorities.append("净心/删心魔")
	if int(profile.get("attack", 0)) <= 2 and cards.size() >= 8:
		priorities.append("主力攻击")
	if int(profile.get("defense", 0)) <= 2 and cards.size() >= 8:
		priorities.append("护盾/恢复")
	if int(profile.get("draw", 0)) <= 1 and cards.size() >= 10:
		priorities.append("过牌")
	if int(profile.get("high_cost", 0)) >= 3 and max_qi <= 3:
		priorities.append("灵气上限/临时灵气")
	if int(profile.get("multi_hit", 0)) > 0 and int(profile.get("edge", 0)) <= 1:
		priorities.append("剑势来源")
	if int(profile.get("burn", 0)) > 0 and _treasure_value("burn_damage") <= 0 and _breakthrough_value("burn_bonus") <= 0:
		priorities.append("燃烧强化")
	if consumables.size() > 0 and _consumable_bonus_value() <= 0 and _treasure_value("first_consumable_draw") <= 0:
		priorities.append("小物强化")
	while priorities.size() > 4:
		priorities.pop_back()
	return "、".join(priorities) if not priorities.is_empty() else "高价值稀有牌/法宝/破境"


func _card_names_for_effect(cards: Array[String], effect_key: String, limit: int) -> String:
	var names: Array[String] = []
	var seen := {}
	for card_id in cards:
		var key := str(card_id)
		if seen.has(key):
			continue
		seen[key] = true
		var card := _card_data(key)
		var has_effect := bool(card.get(effect_key, false)) if effect_key == "unplayable" else card.has(effect_key)
		if not has_effect:
			continue
		names.append(str(card["name"]))
		if names.size() >= limit:
			break
	return "、".join(names) if not names.is_empty() else "无"


func _format_card_counts(cards: Array[String]) -> String:
	if cards.is_empty():
		return "[color=#94a197]暂无卡牌[/color]"
	var counts := {}
	for card_id in cards:
		counts[card_id] = int(counts.get(card_id, 0)) + 1
	var keys := counts.keys()
	keys.sort()
	var lines: Array[String] = []
	for card_id in keys:
		var card: Dictionary = _card_data(str(card_id))
		lines.append("%s x%d    灵气 %d    %s    %s" % [
			_card_display_name(str(card_id)),
			counts[card_id],
			card["cost"],
			_card_type_name(str(card["type"])),
			card["desc"]
		])
	var body := "\n".join(lines)
	if active_pile_view == "deck":
		return _deck_detail_text(cards) + "\n\n" + body
	return body


func _refresh_hand() -> void:
	_clear_children(hand_box)
	var recommended_index := _recommended_hand_card_index()
	for i in hand.size():
		var card_id := hand[i]
		var card: Dictionary = _card_data(card_id)
		var button := _make_card_button(card_id, false)
		var disabled_reason := ""
		if card.get("unplayable", false):
			disabled_reason = "心魔牌不可打出。"
		elif qi < int(card["cost"]):
			disabled_reason = "灵气不足：需要 %d，当前 %d。" % [int(card["cost"]), qi]
		button.disabled = in_reward or not disabled_reason.is_empty()
		if not disabled_reason.is_empty():
			button.tooltip_text = disabled_reason + "\n\n" + button.tooltip_text
		else:
			button.tooltip_text = "快捷键 " + str(i + 1) + "。\n" + button.tooltip_text
		if i == recommended_index and disabled_reason.is_empty():
			button.text = "荐 " + button.text
			button.tooltip_text = "本回合推荐：%s\n\n%s" % [
				_combat_card_recommendation_reason(card_id),
				button.tooltip_text
			]
			button.add_theme_stylebox_override("normal", _panel_style(
				Color(0.20, 0.15, 0.065, 0.98),
				Color(0.98, 0.70, 0.22),
				5,
				4
			))
		var hand_index := i
		button.pressed.connect(func() -> void: _play_card(hand_index))
		hand_box.add_child(button)


func _reward_context_text() -> String:
	var kinds: Array[String] = []
	if not reward_breakthroughs.is_empty():
		kinds.append("破境")
	if not reward_cards.is_empty():
		kinds.append("术法")
	if not reward_treasures.is_empty():
		kinds.append("法宝")
	if not reward_consumables.is_empty():
		kinds.append("消耗品")
	if not reward_insights.is_empty():
		kinds.append("悟道")
	var advice := _run_advice_text().split("\n")
	var focus: Array[String] = []
	for line in advice:
		var text := str(line)
		if text.is_empty():
			continue
		focus.append(text)
		if focus.size() >= 2:
			break
	var reroll_text := "幕间破境不可重掷" if not reward_breakthroughs.is_empty() else ("可重掷，价格 %d，当前灵石 %d" % [_reward_reroll_price(), spirit_stones])
	return "奖励决策：本轮包含 %s｜当前短板：%s｜重掷：%s" % [
		"、".join(kinds) if not kinds.is_empty() else "无",
		"；".join(focus) if not focus.is_empty() else "状态稳定，可按路线组件选择",
		reroll_text
	]


func _refresh_rewards() -> void:
	_clear_children(reward_box)
	if not in_reward or (reward_cards.is_empty() and reward_treasures.is_empty() and reward_consumables.is_empty() and reward_insights.is_empty() and reward_breakthroughs.is_empty()):
		reward_context_label.visible = false
		reward_scroll.visible = false
		return
	reward_context_label.visible = true
	reward_context_label.text = _reward_context_text()
	reward_scroll.visible = true
	var reward_shortcut_index := 0
	var recommended_reward_index := _recommended_reward_option_index(_reward_shortcut_options())
	for breakthrough_id in reward_breakthroughs:
		var reward_breakthrough_id := breakthrough_id
		var breakthrough := _make_breakthrough_button(breakthrough_id)
		_apply_reward_recommendation_hint(breakthrough, "breakthrough", breakthrough_id, reward_shortcut_index, recommended_reward_index)
		_add_number_shortcut_hint(breakthrough, reward_shortcut_index)
		reward_shortcut_index += 1
		breakthrough.pressed.connect(func() -> void: _choose_breakthrough(reward_breakthrough_id))
		reward_box.add_child(breakthrough)
	for card_id in reward_cards:
		var reward_card_id := card_id
		var reward := _make_card_button(card_id, true)
		_apply_reward_recommendation_hint(reward, "card", card_id, reward_shortcut_index, recommended_reward_index)
		_add_number_shortcut_hint(reward, reward_shortcut_index)
		reward_shortcut_index += 1
		reward.pressed.connect(func() -> void: _choose_reward(reward_card_id))
		reward_box.add_child(reward)
	for treasure_id in reward_treasures:
		var reward_treasure_id := treasure_id
		var treasure := _make_treasure_button(treasure_id)
		_apply_reward_recommendation_hint(treasure, "treasure", treasure_id, reward_shortcut_index, recommended_reward_index)
		_add_number_shortcut_hint(treasure, reward_shortcut_index)
		reward_shortcut_index += 1
		treasure.pressed.connect(func() -> void: _choose_treasure(reward_treasure_id))
		reward_box.add_child(treasure)
	for consumable_id in reward_consumables:
		var reward_consumable_id := consumable_id
		var consumable := _make_consumable_button(consumable_id, true)
		_apply_reward_recommendation_hint(consumable, "consumable", consumable_id, reward_shortcut_index, recommended_reward_index)
		_add_number_shortcut_hint(consumable, reward_shortcut_index)
		reward_shortcut_index += 1
		consumable.pressed.connect(func() -> void: _choose_consumable(reward_consumable_id))
		reward_box.add_child(consumable)
	for insight_id in reward_insights:
		var reward_insight_id := insight_id
		var insight := _make_insight_button(insight_id)
		_apply_reward_recommendation_hint(insight, "insight", insight_id, reward_shortcut_index, recommended_reward_index)
		_add_number_shortcut_hint(insight, reward_shortcut_index)
		reward_shortcut_index += 1
		insight.pressed.connect(func() -> void: _choose_insight(reward_insight_id))
		reward_box.add_child(insight)
	if not reward_breakthroughs.is_empty():
		return
	var reroll := Button.new()
	var reroll_price := _reward_reroll_price()
	reroll.custom_minimum_size = Vector2(150, 220)
	reroll.text = "换一批\n\n花费 " + str(reroll_price) + "\n灵石"
	reroll.tooltip_text = "花费 %d 灵石重整当前奖励。坊市木牌可降低价格。" % reroll_price
	reroll.disabled = spirit_stones < reroll_price
	reroll.add_theme_stylebox_override("normal", _panel_style(Color(0.11, 0.13, 0.15, 0.98), Color(0.52, 0.68, 0.66), 10, 2))
	reroll.add_theme_stylebox_override("disabled", _panel_style(Color(0.08, 0.09, 0.09, 0.88), Color(0.25, 0.25, 0.22), 10, 2))
	reroll.add_theme_color_override("font_color", COLOR_TEXT)
	reroll.add_theme_color_override("font_disabled_color", COLOR_MUTED)
	reroll.pressed.connect(_reroll_rewards)
	reward_box.add_child(reroll)
	var skip := Button.new()
	skip.custom_minimum_size = Vector2(150, 220)
	skip.text = "调息\n\n恢复 10\n生命"
	skip.tooltip_text = "跳过当前奖励，恢复 10 点生命。"
	skip.add_theme_stylebox_override("normal", _panel_style(Color(0.11, 0.14, 0.13, 0.98), Color(0.50, 0.42, 0.25), 10, 2))
	skip.add_theme_color_override("font_color", COLOR_TEXT)
	skip.pressed.connect(_skip_reward)
	reward_box.add_child(skip)


func _refresh_map() -> void:
	_clear_children(map_box)
	if not in_map or in_choice:
		map_context_label.visible = false
		return
	map_context_label.visible = true
	map_context_label.text = _map_context_text()
	if run_step >= RUN_STEPS_TO_BOSS:
		var boss := _make_map_button(str(_act_data()["boss_title"]), str(_act_data()["boss_desc"]), Color(0.70, 0.36, 0.29), _map_node_art_path("boss"))
		_add_number_shortcut_hint(boss, 0)
		if show_decision_hints:
			boss.tooltip_text += "\n" + _map_node_preview_text({"type": "boss"})
		boss.pressed.connect(func() -> void: _start_encounter(true, false))
		map_box.add_child(boss)
		return
	for i in pending_nodes.size():
		var node: Dictionary = pending_nodes[i]
		var node_copy := node.duplicate(true)
		var button := _make_map_button(node_copy["title"], node_copy["desc"], _node_color(node_copy["type"]), _map_node_art_path(str(node_copy["type"])))
		_add_number_shortcut_hint(button, i)
		if show_decision_hints:
			button.tooltip_text += "\n" + _map_node_preview_text(node_copy)
		button.pressed.connect(func() -> void: _resolve_map_node(node_copy))
		map_box.add_child(button)


func _map_context_text() -> String:
	if run_step >= RUN_STEPS_TO_BOSS:
		return "路线研判：本幕 Boss 已现｜应战准备：%s｜当前待办：%s" % [
			_boss_prep_text(),
			_current_run_focus_text()
		]
	var available := _available_map_node_types_text()
	var recommendation := _recommended_map_route_text()
	var focus := _current_run_focus_text()
	return "路线研判：可选 %s｜优先：%s｜当前待办：%s" % [
		available,
		recommendation,
		focus
	]


func _available_map_node_types_text() -> String:
	if pending_nodes.is_empty():
		return "暂无路线"
	var names: Array[String] = []
	var seen := {}
	for node in pending_nodes:
		var type_name := _map_node_type_name(str(node.get("type", "")))
		if seen.has(type_name):
			continue
		seen[type_name] = true
		names.append(type_name)
	return "、".join(names)


func _recommended_map_route_text() -> String:
	if pending_nodes.is_empty():
		return "等待下一批路线"
	var best_node: Dictionary = pending_nodes[0]
	var best_score := -999
	var best_reasons: Array[String] = []
	for node in pending_nodes:
		var reasons: Array[String] = []
		var score := _map_node_recommendation_score(node, reasons)
		if score > best_score:
			best_score = score
			best_node = node
			best_reasons = reasons
	var title := str(best_node.get("title", _map_node_type_name(str(best_node.get("type", "")))))
	var reason_text := "稳健推进" if best_reasons.is_empty() else "、".join(best_reasons)
	return "%s（%s）" % [title, reason_text]


func _map_node_recommendation_score(node: Dictionary, reasons: Array[String]) -> int:
	var node_type := str(node.get("type", ""))
	var score: int = 0
	var profile: Dictionary = _deck_profile(deck)
	var low_hp: bool = player_hp <= max(18, int(max_hp * 0.35))
	var has_curse: bool = int(profile.get("curse", 0)) > 0
	var needs_attack: bool = int(profile.get("attack", 0)) <= 2 and deck.size() >= 8
	var needs_defense: bool = int(profile.get("defense", 0)) <= 2 and deck.size() >= 8
	var needs_draw: bool = int(profile.get("draw", 0)) <= 1 and deck.size() >= 10
	if low_hp and ["rest", "herb_event", "secret_realm", "soul_shrine"].has(node_type):
		score += 8
		reasons.append("稳血线")
	if has_curse and ["market", "training", "soul_shrine"].has(node_type):
		score += 7
		reasons.append("净心")
	if needs_attack and ["battle", "training", "event", "dark_forge", "thunder_pool"].has(node_type):
		score += 5
		reasons.append("补伤害")
	if needs_defense and ["rest", "herb_event", "training", "secret_realm"].has(node_type):
		score += 5
		reasons.append("补防御")
	if needs_draw and ["training", "spirit_rift", "secret_realm"].has(node_type):
		score += 4
		reasons.append("补循环")
	if consumables.is_empty() and ["market", "rest", "event", "herb_event", "spirit_rift"].has(node_type):
		score += 3
		reasons.append("补小物")
	if treasures.is_empty() and current_act > 0 and ["elite", "soul_shrine", "duel_trial", "market"].has(node_type):
		score += 4
		reasons.append("找法宝")
	if not next_duel_trial.is_empty() and ["rest", "herb_event", "market"].has(node_type):
		score += 5
		reasons.append("试剑前整备")
	if not trial_mandate_completed:
		var mandate := _trial_mandate_data()
		match str(mandate.get("kind", "")):
			"elite":
				if node_type == "elite" or node_type == "duel_trial":
					score += 6
					reasons.append("推进试炼签")
			"spirit_stones":
				if ["battle", "elite", "market", "event", "spirit_rift", "duel_trial"].has(node_type):
					score += 4
					reasons.append("攒灵石")
			"upgrade":
				if ["training", "rest", "spirit_rift", "thunder_pool"].has(node_type):
					score += 5
					reasons.append("找精研")
			"cleanse":
				if ["market", "training", "soul_shrine"].has(node_type):
					score += 5
					reasons.append("推进净心")
	if not active_bounty_id.is_empty():
		var bounty := _bounty_data()
		match str(bounty.get("kind", "")):
			"battle":
				if node_type == "battle" or node_type == "elite":
					score += 3
					reasons.append("顺手悬赏")
			"elite":
				if node_type == "elite":
					score += 6
					reasons.append("完成悬赏")
			"upgrade":
				if ["training", "rest", "spirit_rift", "thunder_pool"].has(node_type):
					score += 4
					reasons.append("顺手精研")
			"cleanse":
				if ["market", "training", "soul_shrine"].has(node_type):
					score += 4
					reasons.append("顺手净心")
			"gain_treasure":
				if ["elite", "soul_shrine", "duel_trial", "market"].has(node_type):
					score += 4
					reasons.append("顺手鉴宝")
			"buy_consumable":
				if node_type == "market":
					score += 6
					reasons.append("完成采买")
	if node_type == "elite":
		score += 2 if player_hp > int(max_hp * 0.55) else -3
	if node_type == "rest":
		score += 2 if low_hp else -1
	if node_type == "battle":
		score += 1
	while reasons.size() > 3:
		reasons.pop_back()
	return score


func _boss_prep_text() -> String:
	var prep: Array[String] = []
	for check in _boss_prep_checks():
		var state := str(check["state"])
		if state == "险" or state == "危":
			prep.append(str(check["name"]) + state)
	return "、".join(prep) if not prep.is_empty() else "状态可战，留意下一式与心魔污染"


func _refresh_choices() -> void:
	_refresh_choice_scene_art()
	_clear_children(choice_box)
	if not in_choice:
		return
	for i in choice_options.size():
		var option: Dictionary = choice_options[i]
		var option_copy := option.duplicate(true)
		var button := _make_choice_button(option_copy["title"], option_copy["desc"], _node_color(str(option_copy.get("tone", "event"))), _choice_tags_text(option_copy))
		_add_number_shortcut_hint(button, i)
		button.disabled = bool(option_copy.get("disabled", false))
		if show_decision_hints:
			button.tooltip_text += "\n" + _choice_preview_text(option_copy)
		if button.disabled:
			button.tooltip_text = "当前不可选。\n" + button.tooltip_text
		button.pressed.connect(func() -> void: _apply_choice(option_copy))
		choice_box.add_child(button)


func _refresh_choice_scene_art() -> void:
	if choice_scene_art == null:
		return
	choice_scene_art.texture = null
	if not in_choice:
		choice_scene_art.visible = false
		return
	var visual_path := _choice_visual_art_path()
	choice_scene_art.texture = _load_cached_texture(visual_path)
	choice_scene_art.visible = choice_scene_art.texture != null


func _map_node_preview_text(node: Dictionary) -> String:
	var node_type := str(node.get("type", ""))
	var pieces: Array[String] = []
	match node_type:
		"battle":
			pieces.append(_combat_node_preview(false, false))
		"elite":
			pieces.append(_combat_node_preview(false, true))
		"boss":
			pieces.append(_combat_node_preview(true, false))
		"event":
			pieces.append("收益：灵石/术法/消耗品，可冒险强取。")
			pieces.append(_map_low_hp_warning(8))
			pieces.append(_map_curse_warning())
		"herb_event":
			pieces.append("收益：恢复、清心诀或灵石。")
			pieces.append("适合低血线或需要净心组件时进入。")
		"spirit_rift":
			pieces.append("收益：灵气上限、灵石消耗品或随机精研。")
			pieces.append(_map_low_hp_warning(6))
			if max_qi <= 3 or int(_deck_profile(deck).get("high_cost", 0)) >= 3:
				pieces.append("契合：当前灵气压力较高。")
		"secret_realm":
			pieces.append("收益：悟道、生命上限恢复，或更偏当前幕的术法遗卷。")
			pieces.append("代价：失血、心魔或下战虚弱。")
			if _available_insight_ids().is_empty():
				pieces.append("提示：悟道池已尽，观星会转为灵石与消耗品。")
			pieces.append(_map_low_hp_warning(_secret_realm_hp_cost()))
		"duel_trial":
			pieces.append("收益：给下一战加压，胜利后获得灵石、精研或法宝。")
			if next_duel_trial.is_empty():
				pieces.append("适合状态稳定、想主动换取额外成长时选择。")
			else:
				pieces.append("当前已有试剑约束：" + _duel_trial_history_text())
		"soul_shrine":
			pieces.append("收益：净心恢复、悟道或法宝。")
			if deck.has("inner_demon"):
				pieces.append("契合：当前有心魔，镇魂静坐价值高。")
			else:
				pieces.append(_map_low_hp_warning(10))
		"dark_forge":
			pieces.append("收益：至多精研 2 张牌、阴雷子或灵石。")
			if not _upgradable_card_options().is_empty():
				pieces.append("可精研候选：" + _format_card_name_counts(_upgradable_card_options()))
			pieces.append(_map_low_hp_warning(6))
		"thunder_pool":
			pieces.append("收益：引劫剑、生命上限或净心/天火符。")
			if deck.has("inner_demon"):
				pieces.append("契合：可压下心魔并补终幕牌。")
			else:
				pieces.append(_map_low_hp_warning(8))
		"market":
			pieces.append("服务：买牌、净心删牌、淘买法宝、买消耗品。")
			pieces.append(_map_market_budget_text())
		"rest":
			pieces.append("收益：恢复、驱散下战虚弱、随机精研或消耗品。")
			pieces.append(_map_rest_need_text())
		"training":
			pieces.append("收益：灵气上限、精研或忘却牌。")
			pieces.append(_map_training_need_text())
		_:
			pieces.append("选择后推进路线。")
	return "预估：" + "；".join(_compact_preview_pieces(pieces))


func _combat_node_preview(is_boss: bool, is_elite: bool) -> String:
	var encounter_group := [_boss_encounter_for_act_index(current_act)] if is_boss else (_elite_encounters_for_act() if is_elite else _encounters_for_act())
	var profile := _enemy_group_preview(encounter_group)
	var pieces: Array[String] = []
	pieces.append("敌人池 " + str(encounter_group.size()) + " 名，最高招式威力约 " + str(int(profile["max_damage"])))
	if not next_duel_trial.is_empty():
		pieces.append("试剑约束：" + _duel_trial_history_text() + " 将强化此战")
	if int(profile["demon_moves"]) > 0:
		pieces.append("可能混入心魔")
	if int(profile["weak_moves"]) > 0:
		pieces.append("可能施加虚弱")
	if int(profile["max_block"]) >= 16:
		pieces.append("护体压力高")
	if is_boss:
		pieces.append("胜利后" + ("筑基成功" if current_act >= ACT_LIBRARY.size() - 1 else "进入幕间破境"))
	elif is_elite:
		pieces.append("胜利：更多灵石，必定更容易见法宝，并可能获得悟道/消耗品")
	else:
		pieces.append("胜利：灵石与 3 张术法奖励")
	if player_hp <= max(14, int(max_hp * 0.28)) and int(profile["max_damage"]) >= player_hp:
		pieces.append("谨慎：当前血线可能吃不住高威力招式")
	return "；".join(pieces)


func _enemy_group_preview(encounter_group: Array) -> Dictionary:
	var max_damage := 0
	var max_block := 0
	var weak_moves := 0
	var demon_moves := 0
	for enemy_data in encounter_group:
		var data: Dictionary = enemy_data
		for move in data.get("moves", []):
			var move_data: Dictionary = move
			max_damage = max(max_damage, int(move_data.get("damage", 0)) * int(move_data.get("hits", 1)))
			max_block = max(max_block, int(move_data.get("block", 0)))
			if int(move_data.get("player_weak", 0)) > 0:
				weak_moves += 1
			if str(move_data.get("add_status", "")) == "inner_demon":
				demon_moves += 1
	return {
		"max_damage": max_damage,
		"max_block": max_block,
		"weak_moves": weak_moves,
		"demon_moves": demon_moves
	}


func _map_low_hp_warning(loss: int) -> String:
	if player_hp <= loss + 8:
		return "谨慎：当前生命 " + str(player_hp) + "，失血选项会很危险"
	if player_hp <= max(18, int(max_hp * 0.35)):
		return "提示：血线偏低，优先选恢复或低风险收益"
	return ""


func _map_curse_warning() -> String:
	var curse_count := _deck_base_count("inner_demon")
	if curse_count > 0:
		return "谨慎：已有心魔 " + str(curse_count) + "，再污染会拖慢循环"
	if not _deck_contains_effect(deck, "cleanse_curse"):
		return "提示：牌组暂无净心牌，污染后需找事件/坊市处理"
	return ""


func _map_market_budget_text() -> String:
	var options: Array[String] = []
	if spirit_stones >= _market_card_price():
		options.append("可买牌")
	if spirit_stones >= _market_cleanse_price() and not _market_removable_options().is_empty():
		options.append("可净心/删牌")
	if spirit_stones >= _market_treasure_price() and not _available_treasure_ids().is_empty():
		options.append("可淘买法宝")
	if spirit_stones >= _market_consumable_price():
		options.append("可买消耗品")
	if options.is_empty():
		return "灵石 " + str(spirit_stones) + " 偏少，可能更适合跑腿赚 5。"
	return "灵石 " + str(spirit_stones) + "，当前" + "、".join(options) + "。"


func _map_rest_need_text() -> String:
	var needs: Array[String] = []
	if player_hp <= max(22, int(max_hp * 0.45)):
		needs.append("需要恢复")
	if next_combat_player_weak > 0:
		needs.append("需要驱散下战虚弱")
	if not _upgradable_card_options().is_empty():
		needs.append("可温养精研")
	if consumables.size() <= 1:
		needs.append("可补应急小物")
	return "契合：" + ("、".join(needs) if not needs.is_empty() else "血线稳定时可按构筑选择")


func _map_training_need_text() -> String:
	var needs: Array[String] = []
	if max_qi <= 3 or int(_deck_profile(deck).get("high_cost", 0)) >= 3:
		needs.append("提升灵气上限")
	if not _upgradable_card_options().is_empty():
		needs.append("精研关键牌")
	if deck.has("inner_demon") or deck.size() >= 13:
		needs.append("忘却污染/厚牌")
	return "契合：" + ("、".join(needs) if not needs.is_empty() else "稳定优化牌组")


func _choice_preview_text(option: Dictionary) -> String:
	var pieces: Array[String] = []
	var kind := str(option.get("kind", ""))
	if option.has("price"):
		pieces.append(_choice_price_preview(int(option["price"])))
	match kind:
		"choose_mandate":
			var mandate_id := str(option.get("mandate_id", ""))
			if TRIAL_MANDATE_LIBRARY.has(mandate_id):
				var mandate: Dictionary = TRIAL_MANDATE_LIBRARY[mandate_id]
				pieces.append("目标：" + str(mandate["desc"]))
				pieces.append("完成奖励：" + str(mandate["reward"]))
		"choose_interlude_oath":
			var oath_id := str(option.get("oath_id", ""))
			if INTERLUDE_OATH_LIBRARY.has(oath_id):
				pieces.append_array(_interlude_oath_preview_pieces(oath_id))
		"cave_safe":
			pieces.append(_choice_stones_preview(8))
			pieces.append("获得随机消耗品")
			pieces.append(_choice_mandate_stone_hint(8))
		"cave_jade":
			pieces.append("获得随机术法")
			pieces.append(_choice_deck_size_hint(1))
		"cave_forbidden":
			pieces.append(_choice_hp_loss_preview(8))
			pieces.append(_choice_stones_preview(18))
			pieces.append("获得随机术法")
			pieces.append(_choice_curse_preview())
			pieces.append(_choice_mandate_stone_hint(18))
		"herb_rest":
			pieces.append(_choice_heal_preview(12))
			pieces.append(_choice_weak_delta_preview(-1))
		"herb_deep":
			pieces.append(_choice_stones_preview(16))
			pieces.append(_choice_weak_delta_preview(1))
			pieces.append(_choice_mandate_stone_hint(16))
		"herb_refine":
			pieces.append(_choice_gain_card_preview("clear_heart"))
			pieces.append(_choice_consumable_preview("clarity_powder"))
		"rift_qi":
			pieces.append("灵气上限 %d -> %d" % [max_qi, max_qi + 1])
			pieces.append(_choice_hp_loss_preview(6))
			if max_qi <= 3 or int(_deck_profile(deck).get("high_cost", 0)) >= 3:
				pieces.append("契合：缓解高费压力")
		"rift_crystal":
			pieces.append(_choice_stones_preview(12))
			pieces.append(_choice_consumable_preview("spirit_draught"))
			pieces.append(_choice_weak_delta_preview(1))
			pieces.append(_choice_mandate_stone_hint(12))
		"rift_spell":
			pieces.append(_choice_upgrade_preview(1))
		"realm_stargaze":
			pieces.append(_choice_hp_loss_preview(_secret_realm_hp_cost()))
			if _available_insight_ids().is_empty():
				pieces.append(_choice_stones_preview(12 + current_act * 4))
				pieces.append("悟道已尽，改得随机消耗品")
			else:
				pieces.append("获得随机未掌握悟道")
		"realm_moonwell":
			pieces.append("生命上限 %d -> %d" % [max_hp, max_hp + 4 + current_act])
			pieces.append(_choice_heal_preview(12 + current_act * 4, max_hp + 4 + current_act))
			pieces.append(_choice_curse_preview())
		"realm_scroll":
			pieces.append(_choice_stones_preview(10 + current_act * 4))
			pieces.append("获得偏当前幕术法")
			pieces.append(_choice_weak_delta_preview(1))
		"duel_stones":
			pieces.append("下一战：敌命 +10，敌伤 +1")
			pieces.append(_choice_stones_preview(20))
			pieces.append(_choice_mandate_stone_hint(20))
		"duel_upgrade":
			pieces.append("下一战：敌命 +14，敌护体 +3")
			pieces.append(_choice_upgrade_preview(2))
		"duel_treasure":
			pieces.append("下一战：敌命 +18，敌伤 +1，敌护体 +3")
			pieces.append("胜利：随机未拥有法宝；若无则灵石 +18")
		"shrine_cleanse":
			if deck.has("inner_demon"):
				pieces.append("移除心魔：%d -> %d" % [_deck_base_count("inner_demon"), max(0, _deck_base_count("inner_demon") - 1)])
				pieces.append(_choice_heal_preview(10))
			else:
				pieces.append(_choice_heal_preview(14))
				pieces.append(_choice_weak_delta_preview(-1))
		"shrine_insight":
			pieces.append("获得随机未掌握悟道")
			pieces.append(_choice_weak_delta_preview(1))
			if _available_insight_ids().size() <= 1:
				pieces.append("提示：悟道池接近取尽")
		"shrine_treasure":
			pieces.append(_choice_hp_loss_preview(10))
			pieces.append("获得随机未拥有法宝")
			pieces.append(_choice_curse_preview())
		"forge_upgrade":
			pieces.append(_choice_upgrade_preview(2))
			if _upgradable_card_options().is_empty():
				pieces.append(_choice_stones_preview(8))
		"forge_thunder":
			pieces.append(_choice_consumable_preview("thunder_seed"))
			pieces.append("额外再获 1 枚阴雷子")
			pieces.append(_choice_weak_delta_preview(1))
		"forge_coal":
			pieces.append(_choice_stones_preview(16))
			pieces.append(_choice_hp_loss_preview(6))
			pieces.append(_choice_mandate_stone_hint(16))
		"thunder_pool_sword":
			pieces.append(_choice_hp_loss_preview(8))
			pieces.append(_choice_weak_delta_preview(1))
			pieces.append(_choice_gain_card_preview("tribulation_sword"))
		"thunder_pool_body":
			pieces.append("生命上限 %d -> %d" % [max_hp, max_hp + 6])
			pieces.append(_choice_heal_preview(12, max_hp + 6))
		"thunder_pool_mind":
			if deck.has("inner_demon"):
				pieces.append("移除心魔：%d -> %d" % [_deck_base_count("inner_demon"), max(0, _deck_base_count("inner_demon") - 1)])
				pieces.append(_choice_gain_card_preview("heaven_flame"))
			else:
				pieces.append(_choice_consumable_preview("clarity_powder"))
				pieces.append(_choice_weak_delta_preview(-1))
		"rest_deep":
			pieces.append(_choice_heal_preview(18))
			pieces.append(_choice_weak_delta_preview(-1))
		"rest_meditate":
			pieces.append(_choice_heal_preview(8))
			pieces.append(_choice_upgrade_preview(1))
			if _upgradable_card_options().is_empty():
				pieces.append("无可精研时改为总恢复 16")
		"rest_prepare":
			pieces.append(_choice_heal_preview(6))
			pieces.append("获得随机消耗品")
			pieces.append(_choice_weak_delta_preview(-1))
		"buy_card":
			pieces.append(_choice_gain_card_preview(str(option.get("card_id", ""))))
		"market_remove_card", "remove_card":
			pieces.append(_choice_remove_card_preview(str(option.get("card_id", ""))))
		"buy_treasure":
			pieces.append("获得随机未拥有法宝")
			if _available_treasure_ids().size() <= 1:
				pieces.append("提示：法宝池接近取尽")
		"buy_consumable":
			pieces.append(_choice_consumable_preview(str(option.get("consumable_id", ""))))
		"market_work":
			pieces.append(_choice_stones_preview(5))
			pieces.append(_choice_mandate_stone_hint(5))
		"gain_qi":
			pieces.append("灵气上限 %d -> %d" % [max_qi, max_qi + 1])
			if max_qi <= 3 or int(_deck_profile(deck).get("high_cost", 0)) >= 3:
				pieces.append("契合：缓解高费压力")
		"upgrade_card":
			pieces.append(_choice_upgrade_card_preview(str(option.get("card_id", ""))))
		_:
			pass
	pieces = _compact_preview_pieces(pieces)
	if pieces.is_empty():
		return "预估：当前状态下没有额外风险。"
	return "预估：" + "；".join(pieces)


func _choice_tags_text(option: Dictionary) -> String:
	var tags := _choice_tags(option)
	if tags.is_empty():
		return ""
	return "标签：" + "｜".join(tags)


func _choice_tags(option: Dictionary) -> Array[String]:
	var tags: Array[String] = []
	if bool(option.get("disabled", false)):
		tags.append("暂不可选")
	var kind := str(option.get("kind", ""))
	if option.has("price"):
		tags.append("花费")
		if spirit_stones < int(option["price"]):
			tags.append("灵石不足")
	match kind:
		"choose_mandate":
			tags.append("试炼目标")
		"choose_interlude_oath":
			tags.append("幕间誓约")
			var oath_id := str(option.get("oath_id", ""))
			if INTERLUDE_OATH_LIBRARY.has(oath_id):
				var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
				tags.append("已收录" if completed_interlude_oaths.has(oath_id) else "新誓约")
				if oath.has("cleanse_curse"):
					tags.append("净心")
				if oath.has("max_hp") or oath.has("heal"):
					tags.append("恢复")
				if oath.has("spirit_stones") or oath.has("random_consumable"):
					tags.append("整备")
				if oath.has("upgrade_random"):
					tags.append("精研")
				if oath.has("gain_card"):
					tags.append("术法")
				if oath.has("fallback_random_card"):
					tags.append("补牌")
				if oath.has("random_insight"):
					tags.append("悟道")
				if oath.has("next_weak"):
					tags.append("虚弱风险")
		"cave_safe":
			tags.append("低风险")
			tags.append("经济")
			tags.append("小物")
		"cave_jade":
			tags.append("术法")
			tags.append("扩牌")
		"cave_forbidden":
			tags.append("高风险")
			tags.append("经济")
			tags.append("心魔")
		"herb_rest":
			tags.append("恢复")
			tags.append("净化")
		"herb_deep":
			tags.append("经济")
			tags.append("虚弱风险")
		"herb_refine":
			tags.append("净心")
			tags.append("小物")
		"rift_qi":
			tags.append("灵气")
			tags.append("伤血")
		"rift_crystal":
			tags.append("经济")
			tags.append("小物")
			tags.append("虚弱风险")
		"rift_spell":
			tags.append("精研")
			tags.append("术法")
		"realm_stargaze":
			tags.append("悟道")
			tags.append("伤血")
		"realm_moonwell":
			tags.append("生命上限")
			tags.append("恢复")
			tags.append("心魔")
		"realm_scroll":
			tags.append("经济")
			tags.append("术法")
			tags.append("虚弱风险")
		"duel_stones":
			tags.append("试剑")
			tags.append("加压")
			tags.append("经济")
		"duel_upgrade":
			tags.append("试剑")
			tags.append("加压")
			tags.append("精研")
		"duel_treasure":
			tags.append("试剑")
			tags.append("高压")
			tags.append("法宝")
		"shrine_cleanse":
			tags.append("净心" if deck.has("inner_demon") else "恢复")
			tags.append("稳局")
		"shrine_insight":
			tags.append("悟道")
			tags.append("虚弱风险")
		"shrine_treasure":
			tags.append("法宝")
			tags.append("心魔")
			tags.append("伤血")
		"forge_upgrade":
			tags.append("精研")
		"forge_thunder":
			tags.append("小物")
			tags.append("虚弱风险")
		"forge_coal":
			tags.append("经济")
			tags.append("伤血")
		"thunder_pool_sword":
			tags.append("术法")
			tags.append("伤血")
			tags.append("虚弱风险")
		"thunder_pool_body":
			tags.append("生命上限")
			tags.append("恢复")
		"thunder_pool_mind":
			tags.append("净心" if deck.has("inner_demon") else "小物")
			tags.append("稳局")
		"rest_deep":
			tags.append("恢复")
			tags.append("稳局")
		"rest_meditate":
			tags.append("恢复")
			tags.append("精研")
		"rest_prepare":
			tags.append("恢复")
			tags.append("小物")
		"buy_card":
			tags.append("术法")
		"market_remove_card", "remove_card":
			tags.append("删牌")
			tags.append("净心" if str(option.get("card_id", "")) == "inner_demon" else "压缩")
		"buy_treasure":
			tags.append("法宝")
		"buy_consumable":
			tags.append("小物")
		"market_work":
			tags.append("低风险")
			tags.append("经济")
		"gain_qi":
			tags.append("灵气")
		"upgrade_card":
			tags.append("精研")
	return _compact_preview_pieces(tags)


func _compact_preview_pieces(pieces: Array[String]) -> Array[String]:
	var result: Array[String] = []
	for piece in pieces:
		if piece.strip_edges().is_empty():
			continue
		if result.has(piece):
			continue
		result.append(piece)
	return result


func _choice_price_preview(price: int) -> String:
	if spirit_stones >= price:
		return "灵石 %d -> %d" % [spirit_stones, spirit_stones - price]
	return "灵石不足，还差 %d" % [price - spirit_stones]


func _interlude_oath_preview_pieces(oath_id: String) -> Array[String]:
	var pieces: Array[String] = []
	if not INTERLUDE_OATH_LIBRARY.has(oath_id):
		return pieces
	var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
	if oath.has("cleanse_curse"):
		var removable := _inner_demon_count_all_piles()
		if removable > 0:
			pieces.append("净除心魔：%d -> %d" % [removable, max(0, removable - int(oath["cleanse_curse"]))])
		elif oath.has("fallback_consumable"):
			pieces.append(_choice_consumable_preview(str(oath["fallback_consumable"])))
	if oath.has("max_hp"):
		pieces.append("生命上限 %d -> %d" % [max_hp, max_hp + int(oath["max_hp"])])
	if oath.has("heal"):
		var target_max := max_hp + int(oath.get("max_hp", 0))
		pieces.append("生命 %d -> %d" % [player_hp, min(target_max, player_hp + int(oath["heal"]))])
	if oath.has("spirit_stones"):
		pieces.append(_choice_stones_preview(int(oath["spirit_stones"])))
	if oath.has("upgrade_random"):
		var upgradable_count := _upgradable_card_options().size()
		if upgradable_count > 0:
			pieces.append("随机精研 %d 张术法（可精研 %d 张）" % [min(int(oath["upgrade_random"]), upgradable_count), upgradable_count])
		elif oath.has("fallback_random_card"):
			pieces.append("无可精研术法，改得随机术法 x" + str(oath["fallback_random_card"]))
	if oath.has("gain_card"):
		pieces.append(_choice_gain_card_preview(str(oath["gain_card"])))
	if oath.has("fallback_random_card") and not oath.has("upgrade_random"):
		pieces.append("获得随机术法 x" + str(oath["fallback_random_card"]))
	if oath.has("gain_consumable"):
		pieces.append(_choice_consumable_preview(str(oath["gain_consumable"])))
	if oath.has("random_consumable"):
		pieces.append("获得随机消耗品 x" + str(oath["random_consumable"]))
	if oath.has("random_insight"):
		var available_insights := _available_insight_ids().size()
		pieces.append("获得随机悟道 x%d（未悟 %d 项）" % [min(int(oath["random_insight"]), available_insights), available_insights])
	if oath.has("next_weak"):
		pieces.append(_choice_weak_delta_preview(int(oath["next_weak"])))
	return pieces


func _choice_stones_preview(amount: int) -> String:
	return "灵石 %d -> %d" % [spirit_stones, spirit_stones + amount]


func _choice_mandate_stone_hint(amount: int) -> String:
	var mandate := _trial_mandate_data()
	if mandate.is_empty() or trial_mandate_completed or str(mandate.get("kind", "")) != "spirit_stones":
		return ""
	var target := int(mandate.get("target", 1))
	if spirit_stones < target and spirit_stones + amount >= target:
		return "可完成试炼签：" + str(mandate.get("name", "灵石目标"))
	return ""


func _choice_hp_loss_preview(amount: int) -> String:
	var after_hp = max(1, player_hp - amount)
	var text := "生命 %d -> %d" % [player_hp, after_hp]
	if player_hp - amount <= 0:
		text += "（会濒死保留 1 点）"
	elif after_hp <= max(10, int(max_hp * 0.25)):
		text += "（低血线谨慎）"
	return text


func _choice_heal_preview(amount: int, cap: int = -1) -> String:
	var target_max := max_hp if cap < 0 else cap
	return "生命 %d -> %d" % [player_hp, min(target_max, player_hp + amount)]


func _choice_weak_delta_preview(delta: int) -> String:
	if delta > 0:
		var after := next_combat_player_weak + delta
		var text := "下一战虚弱 %d -> %d" % [next_combat_player_weak, after]
		if after >= 2:
			text += "（会明显拖慢起手）"
		return text
	var after_reduce = max(0, next_combat_player_weak + delta)
	return "下一战虚弱 %d -> %d" % [next_combat_player_weak, after_reduce]


func _choice_curse_preview() -> String:
	var count := _deck_base_count("inner_demon")
	var text := "心魔 %d -> %d" % [count, count + 1]
	if count > 0:
		text += "（污染叠加）"
	if not _deck_contains_effect(deck, "cleanse_curse"):
		text += "｜牌组暂无净心牌"
	return text


func _choice_deck_size_hint(delta: int) -> String:
	var after := deck.size() + delta
	var text := "牌组 %d -> %d" % [deck.size(), after]
	if after >= 14 and int(_deck_profile(deck).get("draw", 0)) <= 1:
		text += "（牌组偏厚且过牌不足）"
	return text


func _choice_gain_card_preview(card_id: String) -> String:
	if card_id.is_empty():
		return "获得术法"
	var card := _card_data(card_id)
	return "获得：" + str(card["name"]) + "｜" + _reward_card_fit_text(card_id)


func _choice_consumable_preview(consumable_id: String) -> String:
	if not CONSUMABLE_LIBRARY.has(consumable_id):
		return "获得消耗品"
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	return "获得：" + str(consumable["name"]) + "｜" + _reward_consumable_fit_text(consumable)


func _choice_upgrade_preview(limit: int) -> String:
	var options := _upgradable_card_options()
	if options.is_empty():
		return "暂无可精研牌"
	return "可精研候选 %d 张，至多提升 %d 张：%s" % [options.size(), limit, _format_card_name_counts(options)]


func _choice_upgrade_card_preview(card_id: String) -> String:
	if card_id.is_empty():
		return "精研 1 张牌"
	return "精研：" + _card_display_name(card_id)


func _choice_remove_card_preview(card_id: String) -> String:
	if card_id.is_empty():
		return "移除 1 张牌"
	var card := _card_data(card_id)
	var remaining: int = max(0, _deck_base_count(_base_card_id(card_id)) - 1)
	var text := "移除：" + _card_display_name(card_id) + "｜同名剩余 " + str(remaining)
	if card_id == "inner_demon" or _base_card_id(card_id) == "inner_demon":
		text += "｜净心优先"
	elif deck.size() >= 13:
		text += "｜压缩牌组"
	return text


func _refresh_controls() -> void:
	_clear_children(controls_box)
	if in_reward or in_map or in_choice:
		_add_non_combat_controls()
		return
	_add_run_reference_controls()

	var consumable_options := _combat_consumable_options()
	for i in consumable_options.size():
		var consumable_id: String = consumable_options[i]
		var use_consumable_id := consumable_id
		var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
		var shortcut_label := _consumable_shortcut_label(i)
		var button_text := _consumable_button_text(consumable_id)
		var tooltip := str(consumable["desc"])
		if not shortcut_label.is_empty():
			button_text += " [" + shortcut_label + "]"
			tooltip += "\n快捷键 " + shortcut_label + "。"
		var consumable_button := _make_small_combat_button(button_text, _node_color(str(consumable.get("tone", "event"))), tooltip)
		consumable_button.pressed.connect(func() -> void: _use_consumable(use_consumable_id))
		controls_box.add_child(consumable_button)

	var end_turn := Button.new()
	end_turn.text = "结束回合  [Space]"
	end_turn.custom_minimum_size = Vector2(160, 48)
	end_turn.tooltip_text = "快捷键 Space。"
	end_turn.add_theme_font_size_override("font_size", 15)
	end_turn.add_theme_color_override("font_color", Color(0.12, 0.08, 0.03))
	end_turn.add_theme_stylebox_override("normal", _panel_style(Color(0.91, 0.62, 0.22, 0.98), Color(0.98, 0.82, 0.44), 3, 2))
	end_turn.add_theme_stylebox_override("hover", _panel_style(Color(0.98, 0.72, 0.28, 1.0), Color(1.0, 0.91, 0.64), 3, 3))
	end_turn.add_theme_stylebox_override("pressed", _panel_style(Color(0.73, 0.42, 0.12, 1.0), Color(0.96, 0.71, 0.28), 3, 2))
	end_turn.pressed.connect(_end_turn)
	controls_box.add_child(end_turn)

	var title := _make_small_combat_button("返回标题 [Esc]", Color(0.45, 0.60, 0.78), "保存当前战斗并返回标题页，可从标题页继续。快捷键 Esc。")
	title.pressed.connect(func() -> void:
		_save_run_snapshot("combat")
		_show_title()
	)
	controls_box.add_child(title)

	var restart := Button.new()
	restart.text = "重新试炼"
	restart.custom_minimum_size = Vector2(160, 48)
	restart.add_theme_font_size_override("font_size", 14)
	restart.add_theme_color_override("font_color", COLOR_TEXT)
	restart.add_theme_stylebox_override("normal", _panel_style(Color(0.12, 0.045, 0.04, 0.94), Color(0.57, 0.20, 0.16), 3, 2))
	restart.add_theme_stylebox_override("hover", _panel_style(Color(0.18, 0.06, 0.05, 0.98), Color(0.82, 0.34, 0.24), 3, 2))
	restart.pressed.connect(_start_run)
	controls_box.add_child(restart)


func _add_run_reference_controls() -> void:
	var journal := _make_small_combat_button("任务札记 [J]", Color(0.64, 0.58, 0.38), "查看当前目标、进度、构筑建议和传承目标。快捷键 J。")
	journal.pressed.connect(_show_journal_view)
	controls_box.add_child(journal)

	var guide := _make_small_combat_button("引导札 [G]", Color(0.50, 0.62, 0.40), "查看第一局推荐、战斗节奏、路线选择和构筑要点。快捷键 G。")
	guide.pressed.connect(_show_guide_view)
	controls_box.add_child(guide)

	var keywords := _make_small_combat_button("关键词 [K]", Color(0.52, 0.68, 0.66), "查看灵气、护盾、剑势、燃烧、虚弱、破绽等机制说明。快捷键 K。")
	keywords.pressed.connect(_show_keywords_view)
	controls_box.add_child(keywords)

	var hints := _make_small_combat_button(_decision_hints_button_text(), Color(0.55, 0.58, 0.62), "切换地图节点预估、事件选择预估和敌情研判。快捷键 H。")
	hints.pressed.connect(_toggle_decision_hints)
	controls_box.add_child(hints)


func _add_non_combat_controls() -> void:
	_add_run_reference_controls()
	if in_map or in_reward or in_choice:
		var title := _make_small_combat_button("返回标题 [Esc]", Color(0.45, 0.60, 0.78), "返回标题页；地图、奖励与事件选择状态已自动保存，可从标题页继续。快捷键 Esc。")
		title.pressed.connect(_show_title)
		controls_box.add_child(title)
	var restart := _make_small_combat_button("重新试炼", Color(0.70, 0.36, 0.29), "放弃当前试炼并立刻开始一局新试炼。")
	restart.pressed.connect(_start_run)
	controls_box.add_child(restart)


func _show_restart_controls() -> void:
	_clear_children(controls_box)
	var restart := Button.new()
	restart.text = "重新试炼"
	restart.custom_minimum_size = Vector2(180, 54)
	restart.pressed.connect(_start_run)
	controls_box.add_child(restart)

	var title := Button.new()
	title.text = "返回标题"
	title.custom_minimum_size = Vector2(180, 54)
	title.pressed.connect(_show_title)
	controls_box.add_child(title)


func _show_victory_controls() -> void:
	_show_run_summary("筑基成功", "你在雷云下守住道心，玄阴余煞与心魔杂念一并被劫光洗去。周身灵气归一，终于踏入筑基。", true)


func _show_run_summary(title_text: String, body_text: String, victory: bool = false) -> void:
	run_finished = true
	_clear_run_snapshot()
	last_cultivation_gained = _award_cultivation(victory)
	_unlock_run_endings(victory)
	_record_origin_mastery(victory)
	_check_run_challenges(victory)
	_record_run_history(title_text, victory)
	in_map = false
	in_choice = false
	in_reward = false
	reward_cards.clear()
	reward_treasures.clear()
	reward_consumables.clear()
	reward_insights.clear()
	reward_breakthroughs.clear()
	pending_interlude_oath_options.clear()
	choice_options.clear()
	pending_nodes.clear()
	hand.clear()
	_set_gameplay_visible(false)
	_close_pile_view()
	title_box.visible = false
	summary_box.visible = true
	_clear_children(summary_box)
	scene_backdrop.texture = _load_cached_texture(ACT_BACKGROUND_PATHS[2] if victory else CARD_BLOOD_ESCAPE_ART_PATH)
	scene_backdrop.modulate = Color(0.62, 0.72, 0.68, 0.70)
	scene_scrim.color = Color(0.008, 0.018, 0.021, 0.64)

	var summary_shell := PanelContainer.new()
	var narrow_summary := get_viewport_rect().size.x < 1080.0
	summary_shell.custom_minimum_size = Vector2(0, 570)
	summary_shell.add_theme_stylebox_override("panel", QinglanVisuals.textured_panel(PANEL_TEXTURE_PATH))
	summary_box.add_child(summary_shell)

	var summary_layout := VBoxContainer.new()
	summary_layout.add_theme_constant_override("separation", 10)
	summary_shell.add_child(summary_layout)

	var heading_row := HBoxContainer.new()
	heading_row.add_theme_constant_override("separation", 16)
	summary_layout.add_child(heading_row)

	var seal := TextureRect.new()
	seal.texture = _load_cached_texture("res://assets/ui/icons/treasure.png" if victory else "res://assets/ui/icons/curse.png")
	seal.custom_minimum_size = Vector2(72, 72)
	seal.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	seal.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	heading_row.add_child(seal)

	var heading_copy := VBoxContainer.new()
	heading_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	heading_row.add_child(heading_copy)
	var title := Label.new()
	title.text = title_text
	title.add_theme_font_size_override("font_size", 38)
	title.add_theme_color_override("font_color", Color(0.96, 0.78, 0.38) if victory else Color(0.84, 0.40, 0.32))
	heading_copy.add_child(title)
	var body := Label.new()
	body.text = body_text
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.add_theme_font_size_override("font_size", 16)
	body.add_theme_color_override("font_color", COLOR_TEXT)
	heading_copy.add_child(body)

	var rank_panel := PanelContainer.new()
	rank_panel.custom_minimum_size = Vector2(150, 72)
	rank_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.12, 0.09, 0.035, 0.94), COLOR_GOLD_FOCUS, 4, 2))
	heading_row.add_child(rank_panel)
	var rank_label := Label.new()
	rank_label.text = "试炼评阶\n%s  ·  %d" % [_run_rank(_run_score(victory), victory), _run_score(victory)]
	rank_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rank_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	rank_label.add_theme_font_size_override("font_size", 18)
	rank_label.add_theme_color_override("font_color", Color(1.0, 0.84, 0.48))
	rank_panel.add_child(rank_label)

	var stats_grid := GridContainer.new()
	stats_grid.columns = 3 if narrow_summary else 6
	stats_grid.add_theme_constant_override("h_separation", 7)
	stats_grid.add_theme_constant_override("v_separation", 7)
	summary_layout.add_child(stats_grid)
	_add_summary_stat(stats_grid, "战斗", str(battles_won), "res://assets/ui/icons/edge.png", narrow_summary)
	_add_summary_stat(stats_grid, "进度", "%d/%d" % [_total_progress(), _total_progress_goal()], "res://assets/ui/icons/treasure.png", narrow_summary)
	_add_summary_stat(stats_grid, "生命", "%d/%d" % [player_hp, max_hp], "res://assets/ui/icons/hp.png", narrow_summary)
	_add_summary_stat(stats_grid, "灵气", str(max_qi), "res://assets/ui/icons/qi.png", narrow_summary)
	_add_summary_stat(stats_grid, "灵石", str(spirit_stones), "res://assets/ui/icons/stones.png", narrow_summary)
	_add_summary_stat(stats_grid, "修为", "+" + str(last_cultivation_gained), "res://assets/ui/icons/items.png", narrow_summary)

	var detail_scroll := ScrollContainer.new()
	detail_scroll.custom_minimum_size = Vector2(0, 225 if narrow_summary else 310)
	detail_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	summary_layout.add_child(detail_scroll)

	var detail := RichTextLabel.new()
	detail.bbcode_enabled = true
	detail.fit_content = true
	detail.custom_minimum_size = Vector2(1060, 0)
	detail.add_theme_font_size_override("normal_font_size", 14)
	detail.add_theme_color_override("default_color", Color(0.80, 0.83, 0.72))
	detail.text = "[color=#e7cf91]修行记录[/color]\n%s｜第%d幕 %s｜%s｜%s｜种子 %d\n复盘码：%s\n\n[color=#8dc5ad]构筑研判[/color]\n%s\n\n[color=#d6bd7c]本局复盘[/color]\n%s\n\n[color=#e3bd58]评阶明细[/color]\n%s\n\n[color=#b7a9cc]传承收获[/color]\n累计修为 %d｜通关 %d｜连胜 %d/%d｜最佳胜场 %d\n%s\n新成就：%s（%d/%d）\n新挑战：%s（%d/%d）\n新结局：%s（%d/%d）" % [
		_challenge_history_text(),
		current_act + 1,
		str(_act_data()["name"]),
		str(_origin_data()["name"]),
		str(_difficulty_data()["name"]),
		run_seed,
		_run_share_code_text(),
		_deck_analysis_text(deck),
		_run_recap_detail_text(victory),
		_run_score_detail_text(victory),
		cultivation_points,
		victories,
		current_win_streak,
		best_win_streak,
		best_battles,
		_unlock_progress_text(),
		_run_achievement_names_text(),
		achievements.size(),
		ACHIEVEMENT_LIBRARY.size(),
		_challenge_names_from_ids(run_challenges_completed),
		completed_challenges.size(),
		CHALLENGE_LIBRARY.size(),
		_ending_names_from_ids(run_endings_unlocked),
		unlocked_endings.size(),
		ENDING_LIBRARY.size()
	]
	detail_scroll.add_child(detail)

	var buttons := HBoxContainer.new()
	buttons.alignment = BoxContainer.ALIGNMENT_CENTER
	buttons.add_theme_constant_override("separation", 12)
	summary_layout.add_child(buttons)

	var restart := _make_menu_button("重新试炼", Color(0.61, 0.72, 0.45))
	restart.pressed.connect(_start_run)
	buttons.add_child(restart)

	var title_button := _make_menu_button("返回标题", Color(0.45, 0.60, 0.78))
	title_button.pressed.connect(_show_title)
	buttons.add_child(title_button)


func _add_summary_stat(parent: GridContainer, title: String, value: String, icon_path: String, narrow: bool = false) -> void:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(138 if narrow else 158, 52 if narrow else 58)
	panel.add_theme_stylebox_override("panel", _panel_style(Color(0.015, 0.041, 0.040, 0.94), Color(0.31, 0.54, 0.43), 3, 1))
	parent.add_child(panel)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 7)
	panel.add_child(row)
	var icon := TextureRect.new()
	icon.texture = _load_cached_texture(icon_path)
	icon.custom_minimum_size = Vector2(32, 32)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	row.add_child(icon)
	var label := Label.new()
	label.text = title + "\n" + value
	label.add_theme_font_size_override("font_size", 13)
	label.add_theme_color_override("font_color", Color(0.91, 0.85, 0.68))
	row.add_child(label)


func _show_map_choices() -> void:
	in_reward = false
	in_map = true
	in_choice = false
	_check_run_state_achievements()
	_close_pile_view()
	reward_cards.clear()
	reward_treasures.clear()
	reward_consumables.clear()
	reward_insights.clear()
	reward_breakthroughs.clear()
	choice_options.clear()
	hand.clear()
	draw_pile.clear()
	discard_pile.clear()
	exhaust_pile.clear()
	shield = 0
	player_weak = 0
	qi = max_qi
	pending_nodes = _roll_map_nodes()
	if run_step >= RUN_STEPS_TO_BOSS:
		_log(str(_act_data()["boss_title"]) + "已现，前路只剩一战。")
	else:
		_log(str(_act_data()["name"]) + "岔路展开，选择下一处机缘。")
	_save_run_snapshot("map")
	_refresh()


func _show_trial_mandate_choices() -> void:
	var options := _trial_mandate_choice_options()
	if options.is_empty():
		_assign_trial_mandate()
		_log("本局试炼签：" + _trial_mandate_detail_text())
		_show_map_choices()
		return
	in_map = false
	in_reward = false
	in_choice = true
	choice_options = options
	pending_nodes.clear()
	_log("入谷前需择一枚试炼签，作为本局额外目标。")
	_save_run_snapshot("mandate_choice")
	_refresh()


func _roll_map_nodes() -> Array[Dictionary]:
	var pool := _shuffle_with_run_rng(_map_nodes_for_act().duplicate(true))
	var count = min(3, pool.size())
	var nodes: Array[Dictionary] = []
	for i in count:
		nodes.append(pool[i])
	return nodes


func _shuffle_with_run_rng(items: Array) -> Array:
	var shuffled := items.duplicate(true)
	for i in range(shuffled.size() - 1, 0, -1):
		var swap_index := rng.randi_range(0, i)
		var temp = shuffled[i]
		shuffled[i] = shuffled[swap_index]
		shuffled[swap_index] = temp
	return shuffled


func _map_nodes_for_act() -> Array:
	return _map_nodes_for_act_index(current_act)


func _map_nodes_for_act_index(act_index: int) -> Array:
	match act_index:
		0:
			return MAP_NODE_LIBRARY
		1:
			return SECOND_ACT_MAP_NODE_LIBRARY
		_:
			return THIRD_ACT_MAP_NODE_LIBRARY


func _resolve_map_node(node: Dictionary) -> void:
	_record_route_node(node)
	match node["type"]:
		"battle":
			_start_encounter(false, false)
		"elite":
			_start_encounter(false, true)
		"event":
			_show_cave_event_choices()
		"herb_event":
			_show_herb_event_choices()
		"spirit_rift":
			_show_spirit_rift_choices()
		"secret_realm":
			_show_secret_realm_choices()
		"duel_trial":
			_show_duel_trial_choices()
		"soul_shrine":
			_show_soul_shrine_choices()
		"dark_forge":
			_show_dark_forge_choices()
		"thunder_pool":
			_show_thunder_pool_choices()
		"market":
			_show_market_choices()
		"rest":
			_show_rest_choices()
		"training":
			_show_training_choices()


func _record_route_node(node: Dictionary) -> void:
	var act: Dictionary = _act_data()
	var title := str(node.get("title", node.get("type", "未知节点")))
	var type_name := _map_node_type_name(str(node.get("type", "")))
	var entry := "第%d幕 %s：%s（%s）" % [current_act + 1, str(act["name"]), title, type_name]
	route_history.append(entry)
	if route_history.size() > ACT_LIBRARY.size() * (RUN_STEPS_TO_BOSS + 2):
		route_history.pop_front()


func _map_node_type_name(node_type: String) -> String:
	match node_type:
		"battle":
			return "战斗"
		"elite":
			return "精英"
		"event":
			return "洞府"
		"herb_event":
			return "药圃"
		"spirit_rift":
			return "灵脉"
		"secret_realm":
			return "秘境"
		"duel_trial":
			return "试剑"
		"soul_shrine":
			return "古龛"
		"dark_forge":
			return "残炉"
		"thunder_pool":
			return "雷池"
		"market":
			return "坊市"
		"rest":
			return "调息"
		"training":
			return "修炼"
		_:
			return node_type


func _enter_choice_node(options: Array[Dictionary], log_message: String, art_path: String = "") -> void:
	in_map = false
	in_choice = true
	choice_options = options
	choice_art_path = art_path
	_log(log_message)
	_save_run_snapshot("choice")
	_refresh()


func _show_cave_event_choices() -> void:
	_enter_choice_node([
		{
			"kind": "cave_safe",
			"title": "谨慎搜寻",
			"desc": "获得 8 灵石与 1 件随机消耗品。无风险。",
			"tone": "event"
		},
		{
			"kind": "cave_jade",
			"title": "读取玉简",
			"desc": "获得 1 张随机术法。",
			"tone": "training"
		},
		{
			"kind": "cave_forbidden",
			"title": "强破禁制",
			"desc": "失去 8 生命，获得 18 灵石与 1 张术法，但牌组混入心魔。",
			"tone": "battle"
		}
	], "废弃洞府残留禁制，你要如何取宝？")


func _show_herb_event_choices() -> void:
	_enter_choice_node([
		{
			"kind": "herb_rest",
			"title": "采露调息",
			"desc": "恢复 12 生命，驱散 1 层虚弱。",
			"tone": "rest"
		},
		{
			"kind": "herb_deep",
			"title": "深入药畦",
			"desc": "获得 16 灵石，但下一战开始带 1 层虚弱。",
			"tone": "battle"
		},
		{
			"kind": "herb_refine",
			"title": "炼清心散",
			"desc": "获得 1 张清心诀与 1 份清神粉。",
			"tone": "training"
		}
	], "月下药圃灵露未干，草叶之间也藏着瘴气。")


func _show_spirit_rift_choices() -> void:
	_enter_choice_node([
		{
			"kind": "rift_qi",
			"title": "汲取灵息",
			"desc": "灵气上限 +1，但失去 6 生命。",
			"tone": "training"
		},
		{
			"kind": "rift_crystal",
			"title": "凝成灵晶",
			"desc": "获得 12 灵石与 1 份聚气散，但下一战虚弱 +1。",
			"tone": "market"
		},
		{
			"kind": "rift_spell",
			"title": "封存术法",
			"desc": "随机精研 1 张牌；若无可精研牌，获得 1 张随机术法。",
			"tone": "event"
		}
	], str(_act_data()["name"]) + "深处裂开一道灵脉，灵气紊乱却可强取。", SPIRIT_RIFT_BACKGROUND_TARGET_PATH)


func _show_secret_realm_choices() -> void:
	var hp_cost := _secret_realm_hp_cost()
	var heal_amount := 12 + current_act * 4
	var max_hp_gain := 4 + current_act
	var stone_gain := 10 + current_act * 4
	_enter_choice_node([
		{
			"kind": "realm_stargaze",
			"title": "观星悟道",
			"desc": "失去 " + str(hp_cost) + " 生命，获得 1 门随机未掌握悟道；若悟道已尽，改得灵石与消耗品。",
			"tone": "training",
			"disabled": player_hp <= hp_cost
		},
		{
			"kind": "realm_moonwell",
			"title": "饮月井水",
			"desc": "生命上限 +" + str(max_hp_gain) + "，恢复 " + str(heal_amount) + " 生命，但牌组混入 1 张心魔杂念。",
			"tone": "rest"
		},
		{
			"kind": "realm_scroll",
			"title": "取秘境遗卷",
			"desc": "获得 " + str(stone_gain) + " 灵石与 1 张更偏当前幕的术法，但下一战虚弱 +1。",
			"tone": "event"
		}
	], str(_act_data()["name"]) + "月光折成一扇门，门后秘境只会停留片刻。", SECRET_REALM_BACKGROUND_TARGET_PATH)


func _show_duel_trial_choices() -> void:
	_enter_choice_node([
		{
			"kind": "duel_stones",
			"title": "立约夺财",
			"desc": "下一场战斗敌人生命 +10、伤害 +1。胜利额外获得 20 灵石。",
			"tone": "battle",
			"disabled": not next_duel_trial.is_empty()
		},
		{
			"kind": "duel_upgrade",
			"title": "立约磨术",
			"desc": "下一场战斗敌人生命 +14、护体 +3。胜利随机精研至多 2 张牌。",
			"tone": "training",
			"disabled": not next_duel_trial.is_empty()
		},
		{
			"kind": "duel_treasure",
			"title": "立约夺器",
			"desc": "下一场战斗敌人生命 +18、伤害 +1、护体 +3。胜利获得 1 件随机法宝；若法宝已尽，改得灵石。",
			"tone": "elite",
			"disabled": _available_treasure_ids().is_empty() or not next_duel_trial.is_empty()
		}
	], "旧石台上剑痕纵横，可立下试剑约束，以更险一战换更厚回报。")


func _show_soul_shrine_choices() -> void:
	var has_curse := deck.has("inner_demon")
	var options: Array[Dictionary] = [
		{
			"kind": "shrine_cleanse",
			"title": "镇魂静坐",
			"desc": ("移除 1 张心魔杂念，恢复 10 生命。" if has_curse else "恢复 14 生命，并驱散下一战虚弱。"),
			"tone": "rest"
		},
		{
			"kind": "shrine_insight",
			"title": "借阴炼神",
			"desc": "获得 1 门随机未掌握悟道，但下一战虚弱 +1。",
			"tone": "training",
			"disabled": _available_insight_ids().is_empty()
		}
	]
	if not _available_treasure_ids().is_empty():
		options.append({
			"kind": "shrine_treasure",
			"title": "夺龛中法器",
			"desc": "失去 10 生命，获得 1 件随机法宝，牌组混入心魔。",
			"tone": "battle"
		})
	_enter_choice_node(options, "镇魂古龛残香未灭，阴影里像有旧修士低声诵经。", SOUL_SHRINE_BACKGROUND_TARGET_PATH)


func _show_dark_forge_choices() -> void:
	_enter_choice_node([
		{
			"kind": "forge_upgrade",
			"title": "重淬术法",
			"desc": "随机精研至多 2 张可升级牌。若无可升级牌，获得 8 灵石。",
			"tone": "training"
		},
		{
			"kind": "forge_thunder",
			"title": "铸成阴雷",
			"desc": "获得 2 枚阴雷子，但下一战虚弱 +1。",
			"tone": "battle"
		},
		{
			"kind": "forge_coal",
			"title": "取走炉炭",
			"desc": "获得 16 灵石，并受到 6 点灼伤。",
			"tone": "market"
		}
	], "阴火残炉仍有余温，炉壁上刻满失败的筑基符纹。", DARK_FORGE_BACKGROUND_TARGET_PATH)


func _show_thunder_pool_choices() -> void:
	var has_curse := deck.has("inner_demon")
	_enter_choice_node([
		{
			"kind": "thunder_pool_sword",
			"title": "引雷悟剑",
			"desc": "失去 8 生命，下一战虚弱 +1，获得 1 张引劫剑。",
			"tone": "battle"
		},
		{
			"kind": "thunder_pool_body",
			"title": "雷池淬体",
			"desc": "生命上限 +6，并恢复 12 生命。",
			"tone": "rest"
		},
		{
			"kind": "thunder_pool_mind",
			"title": "镇压余魔",
			"desc": ("移除 1 张心魔杂念，并获得 1 张天火符。" if has_curse else "获得 1 份清神粉，并驱散下一战虚弱。"),
			"tone": "training"
		}
	], "洗雷池水面悬着细碎电光，越靠近越能听见自己的心跳。", THUNDER_POOL_BACKGROUND_TARGET_PATH)


func _show_rest_choices() -> void:
	_enter_choice_node([
		{
			"kind": "rest_deep",
			"title": "静息回元",
			"desc": "恢复 18 生命，并驱散下一战 1 层虚弱。",
			"tone": "rest"
		},
		{
			"kind": "rest_meditate",
			"title": "温养术法",
			"desc": "恢复 8 生命，并随机精研 1 张可升级牌。若无可升级牌，额外恢复 8 生命。",
			"tone": "training"
		},
		{
			"kind": "rest_prepare",
			"title": "整理行囊",
			"desc": "恢复 6 生命，获得 1 件随机消耗品，并驱散下一战 1 层虚弱。",
			"tone": "market"
		}
	], str(_act_data()["name"]) + "有一处可暂避风雨的调息地。")


func _show_market_choices() -> void:
	var price := _market_card_price()
	var cleanse_price := _market_cleanse_price()
	var treasure_price := _market_treasure_price()
	var consumable_price := _market_consumable_price()
	var options: Array[Dictionary] = []
	for i in 3:
		var card_id := _random_reward_card()
		var card: Dictionary = _card_data(card_id)
		options.append({
			"kind": "buy_card",
			"card_id": card_id,
			"price": price,
			"title": "购买：" + card["name"],
			"desc": "花费 " + str(price) + " 灵石。\n" + card["desc"],
			"tone": "market",
			"disabled": spirit_stones < price
		})
	for card_id in _market_removable_options():
		var card: Dictionary = _card_data(card_id)
		options.append({
			"kind": "market_remove_card",
			"card_id": card_id,
			"price": cleanse_price,
			"title": "净心：" + card["name"],
			"desc": "花费 " + str(cleanse_price) + " 灵石，从牌组移除 1 张。\n优先清理心魔或臃肿牌组。",
			"tone": "event",
			"disabled": spirit_stones < cleanse_price
		})
	if not _available_treasure_ids().is_empty():
		options.append({
			"kind": "buy_treasure",
			"price": treasure_price,
			"title": "淘买法器",
			"desc": "花费 " + str(treasure_price) + " 灵石，获得 1 件随机未拥有法宝。",
			"tone": "market",
			"disabled": spirit_stones < treasure_price
		})
	var consumable_id := _random_consumable_id()
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	options.append({
		"kind": "buy_consumable",
		"consumable_id": consumable_id,
		"price": consumable_price,
		"title": "购置：" + consumable["name"],
		"desc": "花费 " + str(consumable_price) + " 灵石。\n" + consumable["desc"],
		"tone": "market",
		"disabled": spirit_stones < consumable_price
	})
	options.append({
		"kind": "market_work",
		"title": "替摊主跑腿",
		"desc": "不买牌，获得 5 灵石。",
		"tone": "rest"
	})
	_enter_choice_node(options, "山脚坊市人声嘈杂，低阶术法摆在摊前。", MARKET_BACKGROUND_TARGET_PATH)


func _show_training_choices() -> void:
	var options: Array[Dictionary] = [
		{
			"kind": "gain_qi",
			"title": "吐纳周天",
			"desc": "灵气上限 +1。",
			"tone": "training"
		}
	]
	for card_id in _upgradable_card_options():
		options.append({
			"kind": "upgrade_card",
			"card_id": card_id,
			"title": "精研：" + _card_display_name(card_id),
			"desc": "升级此牌，提升数值。",
			"tone": "market"
		})
	if deck.size() > 1:
		for card_id in _removable_card_options():
			options.append({
				"kind": "remove_card",
				"card_id": card_id,
				"title": "忘却：" + _card_display_name(card_id),
				"desc": "从牌组中移除 1 张此牌。",
				"tone": "event"
			})
	_enter_choice_node(options, "竹林清寂，适合稳固根基或忘却杂念。")


func _apply_choice(option: Dictionary) -> void:
	match option["kind"]:
		"choose_mandate":
			_choose_trial_mandate(str(option["mandate_id"]))
		"choose_interlude_oath":
			_choose_interlude_oath(str(option["oath_id"]))
		"cave_safe":
			_resolve_cave_safe()
		"cave_jade":
			_resolve_cave_jade()
		"cave_forbidden":
			_resolve_cave_forbidden()
		"herb_rest":
			_resolve_herb_rest()
		"herb_deep":
			_resolve_herb_deep()
		"herb_refine":
			_resolve_herb_refine()
		"rift_qi":
			_resolve_rift_qi()
		"rift_crystal":
			_resolve_rift_crystal()
		"rift_spell":
			_resolve_rift_spell()
		"realm_stargaze":
			_resolve_realm_stargaze()
		"realm_moonwell":
			_resolve_realm_moonwell()
		"realm_scroll":
			_resolve_realm_scroll()
		"duel_stones":
			_resolve_duel_trial(option)
		"duel_upgrade":
			_resolve_duel_trial(option)
		"duel_treasure":
			_resolve_duel_trial(option)
		"shrine_cleanse":
			_resolve_shrine_cleanse()
		"shrine_insight":
			_resolve_shrine_insight()
		"shrine_treasure":
			_resolve_shrine_treasure()
		"forge_upgrade":
			_resolve_forge_upgrade()
		"forge_thunder":
			_resolve_forge_thunder()
		"forge_coal":
			_resolve_forge_coal()
		"thunder_pool_sword":
			_resolve_thunder_pool_sword()
		"thunder_pool_body":
			_resolve_thunder_pool_body()
		"thunder_pool_mind":
			_resolve_thunder_pool_mind()
		"rest_deep":
			_resolve_rest_deep()
		"rest_meditate":
			_resolve_rest_meditate()
		"rest_prepare":
			_resolve_rest_prepare()
		"buy_card":
			_buy_market_card(str(option["card_id"]), int(option["price"]))
		"market_remove_card":
			_market_remove_card(str(option["card_id"]), int(option["price"]))
		"buy_treasure":
			_buy_market_treasure(int(option["price"]))
		"buy_consumable":
			_buy_market_consumable(str(option["consumable_id"]), int(option["price"]))
		"market_work":
			_market_work()
		"gain_qi":
			_gain_training_qi()
		"remove_card":
			_remove_training_card(str(option["card_id"]))
		"upgrade_card":
			_upgrade_training_card(str(option["card_id"]))


func _choose_trial_mandate(mandate_id: String) -> void:
	if not TRIAL_MANDATE_LIBRARY.has(mandate_id):
		return
	trial_mandate_id = mandate_id
	trial_mandate_options.clear()
	trial_mandate_progress = 0
	trial_mandate_completed = false
	_log("本局试炼签：" + _trial_mandate_detail_text())
	_show_map_choices()


func _show_interlude_oath_choices() -> void:
	var options: Array[Dictionary] = []
	for oath_id in pending_interlude_oath_options:
		if not INTERLUDE_OATH_LIBRARY.has(oath_id):
			continue
		var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
		options.append({
			"kind": "choose_interlude_oath",
			"oath_id": oath_id,
			"title": str(oath["name"]),
			"desc": str(oath["desc"]),
			"tone": str(oath.get("tone", "event"))
		})
	if options.is_empty():
		pending_interlude_oath_options.clear()
		_show_map_choices()
		return
	_enter_choice_node(options, "幕间雷云暂歇，你可以立下一项誓约，为下一幕定下行路之法。")


func _choose_interlude_oath(oath_id: String) -> void:
	if not INTERLUDE_OATH_LIBRARY.has(oath_id):
		_refresh()
		return
	var oath: Dictionary = INTERLUDE_OATH_LIBRARY[oath_id]
	if not interlude_oaths.has(oath_id):
		interlude_oaths.append(oath_id)
	_record_completed_interlude_oath(oath_id)
	_unlock_achievement("first_interlude_oath")
	pending_interlude_oath_options.clear()
	if oath.has("cleanse_curse"):
		var removed := _cleanse_inner_demons(int(oath["cleanse_curse"]))
		if removed <= 0 and oath.has("fallback_consumable"):
			_gain_consumable(str(oath["fallback_consumable"]))
	if oath.has("max_hp"):
		max_hp += int(oath["max_hp"])
	if oath.has("heal"):
		player_hp = min(max_hp, player_hp + int(oath["heal"]))
	if oath.has("spirit_stones"):
		spirit_stones += int(oath["spirit_stones"])
		_note_spirit_stones_changed()
	if oath.has("upgrade_random"):
		var upgraded_names := _upgrade_random_cards(int(oath["upgrade_random"]))
		if upgraded_names.is_empty() and oath.has("fallback_random_card"):
			for _i in int(oath["fallback_random_card"]):
				deck.append(_random_reward_card())
	if oath.has("gain_card"):
		deck.append(str(oath["gain_card"]))
	if oath.has("fallback_random_card") and not oath.has("upgrade_random"):
		for _i in int(oath["fallback_random_card"]):
			deck.append(_random_reward_card())
	if oath.has("gain_consumable"):
		_gain_consumable(str(oath["gain_consumable"]))
	if oath.has("random_consumable"):
		for _i in int(oath["random_consumable"]):
			_gain_consumable(_random_consumable_id())
	if oath.has("random_insight"):
		var insight_pool := _shuffle_with_run_rng(_available_insight_ids())
		var gained_insight := false
		for i in min(int(oath["random_insight"]), insight_pool.size()):
			_gain_insight(str(insight_pool[i]))
			gained_insight = true
		if not gained_insight and oath.has("fallback_consumable"):
			_gain_consumable(str(oath["fallback_consumable"]))
	if oath.has("next_weak"):
		next_combat_player_weak += int(oath["next_weak"])
	_log("幕间誓约：" + str(oath["name"]) + "。")
	_show_map_choices()


func _finish_choice_node() -> void:
	run_step += 1
	in_choice = false
	choice_options.clear()
	choice_art_path = ""
	_show_map_choices()


func _resolve_cave_safe() -> void:
	spirit_stones += 8
	_note_spirit_stones_changed()
	_gain_consumable(_random_consumable_id())
	_log("你谨慎搜寻，获得灵石 x8，并找到一件可用小物。")
	_finish_choice_node()


func _resolve_cave_jade() -> void:
	var found_card := _random_reward_card()
	deck.append(found_card)
	_gain_run_mark("ancient_jade")
	_log("残破玉简仍有灵光，领悟：" + _card_data(found_card)["name"] + "。")
	_finish_choice_node()


func _resolve_cave_forbidden() -> void:
	player_hp = max(1, player_hp - 8)
	spirit_stones += 18
	_note_spirit_stones_changed()
	var found_card := _random_reward_card()
	deck.append(found_card)
	deck.append("inner_demon")
	_gain_run_mark("forbidden_mark")
	_log("你强破禁制受伤 8 点，夺得灵石 x18，并领悟：" + _card_data(found_card)["name"] + "。心魔杂念也潜入牌组。")
	_finish_choice_node()


func _resolve_herb_rest() -> void:
	var heal_amount := 12
	player_hp = min(max_hp, player_hp + heal_amount)
	player_weak = max(0, player_weak - 1)
	next_combat_player_weak = max(0, next_combat_player_weak - 1)
	_log("灵露入口清凉，恢复 " + str(heal_amount) + " 点生命，并驱散些许虚弱。")
	_finish_choice_node()


func _resolve_herb_deep() -> void:
	spirit_stones += 16
	_note_spirit_stones_changed()
	next_combat_player_weak += 1
	_gain_run_mark("miasma_herb")
	_log("你深入药畦采得稀有灵草，获得灵石 x16，但瘴气缠身，下一战虚弱 +1。")
	_finish_choice_node()


func _resolve_herb_refine() -> void:
	deck.append("clear_heart")
	_gain_consumable("clarity_powder")
	_log("你借药圃灵草炼成清心散，领悟：清心诀，并留下 1 份清神粉。")
	_finish_choice_node()


func _resolve_rift_qi() -> void:
	max_qi += 1
	player_hp = max(1, player_hp - 6)
	_unlock_achievement("deep_meridians")
	_gain_run_mark("meridian_rift")
	_log("你强行汲取灵脉，灵气上限 +1，但经脉刺痛，失去 6 点生命。")
	_finish_choice_node()


func _resolve_rift_crystal() -> void:
	spirit_stones += 12
	_note_spirit_stones_changed()
	_gain_consumable("spirit_draught")
	next_combat_player_weak += 1
	_log("你将紊乱灵气凝成灵晶，获得灵石 x12 与聚气散，但下一战虚弱 +1。")
	_finish_choice_node()


func _resolve_rift_spell() -> void:
	var upgraded_names := _upgrade_random_cards(1)
	if upgraded_names.is_empty():
		var found_card := _random_reward_card()
		deck.append(found_card)
		_log("你把灵脉波纹封入玉简，领悟：" + _card_data(found_card)["name"] + "。")
	else:
		_log("你借灵脉洗炼术法，精研：" + "、".join(upgraded_names) + "。")
	_finish_choice_node()


func _secret_realm_hp_cost() -> int:
	return 7 + current_act * 3


func _resolve_realm_stargaze() -> void:
	var hp_cost := _secret_realm_hp_cost()
	if player_hp <= hp_cost:
		_log("血气不足，难以承受秘境星图反噬。")
		_refresh()
		return
	player_hp = max(1, player_hp - hp_cost)
	var insight_pool := _available_insight_ids()
	if insight_pool.is_empty():
		var stones := 12 + current_act * 4
		spirit_stones += stones
		_note_spirit_stones_changed()
		_gain_consumable(_random_consumable_id())
		_log("你观星悟道却无新法可得，转而收下灵石 x" + str(stones) + " 与一件秘境小物。")
	else:
		insight_pool = _shuffle_with_run_rng(insight_pool)
		_gain_insight(str(insight_pool[0]))
		_log("秘境星图灼痛神魂，失去 " + str(hp_cost) + " 点生命。")
	_gain_run_mark("star_vision")
	_finish_choice_node()


func _resolve_realm_moonwell() -> void:
	var max_hp_gain := 4 + current_act
	var heal_amount := 12 + current_act * 4
	max_hp += max_hp_gain
	player_hp = min(max_hp, player_hp + heal_amount)
	deck.append("inner_demon")
	_gain_run_mark("moonwell_reflection")
	_log("你饮下月井灵水，生命上限 +" + str(max_hp_gain) + "，恢复 " + str(heal_amount) + " 点生命，但井底倒影化作心魔杂念。")
	_finish_choice_node()


func _resolve_realm_scroll() -> void:
	var stones := 10 + current_act * 4
	spirit_stones += stones
	_note_spirit_stones_changed()
	next_combat_player_weak += 1
	var found_card := _random_realm_scroll_card()
	deck.append(found_card)
	_log("你取走秘境遗卷，获得灵石 x" + str(stones) + "，领悟：" + _card_data(found_card)["name"] + "；月痕缠身，下一战虚弱 +1。")
	_finish_choice_node()


func _random_realm_scroll_card() -> String:
	var pool: Array[String] = []
	for card_id in CARD_LIBRARY.keys():
		var card: Dictionary = CARD_LIBRARY[card_id]
		if _is_curse_card(str(card_id)):
			continue
		if STARTING_DECK.has(str(card_id)):
			continue
		if int(card.get("min_act", 0)) > current_act:
			continue
		if current_act > 0 and str(card.get("rarity", "common")) == "common":
			continue
		pool.append(str(card_id))
	if pool.is_empty():
		return _random_reward_card()
	pool = _shuffle_with_run_rng(pool)
	return _maybe_upgrade_reward_card(str(pool[0]))


func _resolve_duel_trial(option: Dictionary) -> void:
	if not next_duel_trial.is_empty():
		_log("已有试剑约束在身，需先完成下一场战斗。")
		_refresh()
		return
	var kind := str(option.get("kind", "duel_stones"))
	match kind:
		"duel_upgrade":
			next_duel_trial = {
				"kind": kind,
				"name": "磨术试剑",
				"hp_bonus": 14,
				"damage_bonus": 0,
				"block_bonus": 3,
				"reward": "upgrade"
			}
		"duel_treasure":
			next_duel_trial = {
				"kind": kind,
				"name": "夺器试剑",
				"hp_bonus": 18,
				"damage_bonus": 1,
				"block_bonus": 3,
				"reward": "treasure"
			}
		_:
			next_duel_trial = {
				"kind": "duel_stones",
				"name": "夺财试剑",
				"hp_bonus": 10,
				"damage_bonus": 1,
				"block_bonus": 0,
				"reward": "stones"
			}
	_log("你立下" + str(next_duel_trial["name"]) + "，下一场战斗敌势增强，胜后可取额外回报。")
	_finish_choice_node()


func _resolve_shrine_cleanse() -> void:
	if deck.has("inner_demon"):
		deck.erase("inner_demon")
		_unlock_achievement("cleanse_mind")
		_advance_trial_mandate("cleanse", 1)
		_advance_bounty("cleanse", 1)
		player_hp = min(max_hp, player_hp + 10)
		_log("你在古龛前镇住心魔，移除 1 张心魔杂念，并恢复 10 生命。")
	else:
		player_hp = min(max_hp, player_hp + 14)
		next_combat_player_weak = max(0, next_combat_player_weak - 1)
		_log("你静坐镇魂，恢复 14 生命，并压下些许玄阴煞气。")
	_finish_choice_node()


func _resolve_shrine_insight() -> void:
	var available := _available_insight_ids()
	if available.is_empty():
		_log("古龛已无新的悟道可取。")
		_refresh()
		return
	available.shuffle()
	_gain_insight(available[0])
	next_combat_player_weak += 1
	_log("你借阴气炼神，悟得一门心法，但下一战虚弱 +1。")
	_finish_choice_node()


func _resolve_shrine_treasure() -> void:
	var pool := _available_treasure_ids()
	if pool.is_empty():
		_log("龛中法器已经取尽。")
		_refresh()
		return
	player_hp = max(1, player_hp - 10)
	pool.shuffle()
	var treasure_id := pool[0]
	var treasure := _gain_treasure(treasure_id)
	deck.append("inner_demon")
	_gain_run_mark("shrine_shadow")
	_log("你夺走龛中法器：" + str(treasure["name"]) + "，失去 10 生命，心魔也随之入牌组。")
	_finish_choice_node()


func _resolve_forge_upgrade() -> void:
	var upgraded_names := _upgrade_random_cards(2)
	if upgraded_names.is_empty():
		spirit_stones += 8
		_note_spirit_stones_changed()
		_log("可淬之术已少，残炉只炼出灵石 x8。")
	else:
		_log("阴火重淬术法：" + "、".join(upgraded_names) + "。")
	_finish_choice_node()


func _resolve_forge_thunder() -> void:
	_gain_consumable("thunder_seed")
	_gain_consumable("thunder_seed")
	next_combat_player_weak += 1
	_gain_run_mark("yin_thunder")
	_log("你以阴火铸成 2 枚阴雷子，但煞气入体，下一战虚弱 +1。")
	_finish_choice_node()


func _resolve_forge_coal() -> void:
	spirit_stones += 16
	_note_spirit_stones_changed()
	player_hp = max(1, player_hp - 6)
	_log("你取走残炉阴炭，获得灵石 x16，但受灼伤 6 点。")
	_finish_choice_node()


func _resolve_thunder_pool_sword() -> void:
	_unlock_achievement("thunder_pool_tempered")
	player_hp = max(1, player_hp - 8)
	next_combat_player_weak += 1
	deck.append("tribulation_sword")
	_gain_run_mark("thunder_tempered")
	_log("你引雷入剑，失去 8 点生命，下一战虚弱 +1，领悟：引劫剑。")
	_finish_choice_node()


func _resolve_thunder_pool_body() -> void:
	_unlock_achievement("thunder_pool_tempered")
	max_hp += 6
	player_hp = min(max_hp, player_hp + 12)
	_gain_run_mark("thunder_tempered")
	_log("你以雷池淬体，生命上限 +6，并恢复 12 点生命。")
	_finish_choice_node()


func _resolve_thunder_pool_mind() -> void:
	_unlock_achievement("thunder_pool_tempered")
	var index := deck.find("inner_demon")
	if index >= 0:
		deck.remove_at(index)
		_unlock_achievement("cleanse_mind")
		_advance_trial_mandate("cleanse", 1)
		_advance_bounty("cleanse", 1)
		deck.append("heaven_flame")
		_gain_run_mark("thunder_tempered")
		_log("雷光照见杂念，你镇去 1 张心魔杂念，并领悟：天火符。")
	else:
		next_combat_player_weak = max(0, next_combat_player_weak - 1)
		_gain_consumable("clarity_powder")
		_gain_run_mark("thunder_tempered")
		_log("雷池洗净余浊，你获得 1 份清神粉，并驱散下一战虚弱。")
	_finish_choice_node()


func _resolve_rest_deep() -> void:
	var heal_amount := 18
	player_hp = min(max_hp, player_hp + heal_amount)
	next_combat_player_weak = max(0, next_combat_player_weak - 1)
	_log("你静息回元，恢复 " + str(heal_amount) + " 点生命，并压下下一战虚弱。")
	_finish_choice_node()


func _resolve_rest_meditate() -> void:
	var heal_amount := 8
	player_hp = min(max_hp, player_hp + heal_amount)
	var upgraded_names := _upgrade_random_cards(1)
	if upgraded_names.is_empty():
		player_hp = min(max_hp, player_hp + heal_amount)
		_log("你温养经脉，恢复 " + str(heal_amount * 2) + " 点生命；可精研的术法已不多。")
	else:
		_log("你温养术法，恢复 " + str(heal_amount) + " 点生命，并精研：" + "、".join(upgraded_names) + "。")
	_finish_choice_node()


func _resolve_rest_prepare() -> void:
	var heal_amount := 6
	player_hp = min(max_hp, player_hp + heal_amount)
	next_combat_player_weak = max(0, next_combat_player_weak - 1)
	_gain_consumable(_random_consumable_id())
	_log("你整理行囊，恢复 " + str(heal_amount) + " 点生命，压下下一战虚弱，并补得一件应急小物。")
	_finish_choice_node()


func _buy_market_card(card_id: String, price: int) -> void:
	if spirit_stones < price:
		_log("灵石不足，摊主只是笑而不语。")
		_refresh()
		return
	spirit_stones -= price
	deck.append(card_id)
	_log("在坊市花费 " + str(price) + " 灵石，购得：" + _card_data(card_id)["name"] + "。")
	_finish_choice_node()


func _market_remove_card(card_id: String, price: int) -> void:
	if spirit_stones < price:
		_log("灵石不足，净心摊位不肯开炉。")
		_refresh()
		return
	if not deck.has(card_id) or deck.size() <= 1:
		_log("这张牌已不在牌组中。")
		_refresh()
		return
	spirit_stones -= price
	deck.erase(card_id)
	if _base_card_id(card_id) == "inner_demon":
		_unlock_achievement("cleanse_mind")
		_advance_trial_mandate("cleanse", 1)
		_advance_bounty("cleanse", 1)
	_log("在坊市花费 " + str(price) + " 灵石净心，移除：" + _card_data(card_id)["name"] + "。")
	_finish_choice_node()


func _buy_market_treasure(price: int) -> void:
	if spirit_stones < price:
		_log("灵石不足，只能隔着摊位看看法器。")
		_refresh()
		return
	var pool := _available_treasure_ids()
	if pool.is_empty():
		_log("摊上已没有适合你的法宝。")
		_refresh()
		return
	spirit_stones -= price
	pool.shuffle()
	var treasure_id := pool[0]
	var treasure := _gain_treasure(treasure_id)
	_log("在坊市花费 " + str(price) + " 灵石淘得法宝：" + treasure["name"] + "。")
	_finish_choice_node()


func _buy_market_consumable(consumable_id: String, price: int) -> void:
	if spirit_stones < price:
		_log("灵石不足，摊主把药瓶收回了袖中。")
		_refresh()
		return
	if not CONSUMABLE_LIBRARY.has(consumable_id):
		_refresh()
		return
	spirit_stones -= price
	_gain_consumable(consumable_id)
	_advance_bounty("buy_consumable", 1)
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	_log("在坊市花费 " + str(price) + " 灵石购得消耗品：" + consumable["name"] + "。")
	_finish_choice_node()


func _market_work() -> void:
	spirit_stones += 5
	_note_spirit_stones_changed()
	_log("你替摊主跑腿，赚得灵石 x5。")
	_finish_choice_node()


func _gain_training_qi() -> void:
	max_qi += 1
	_check_run_state_achievements()
	_log("吐纳周天有所顿悟，灵气上限 +1。")
	_finish_choice_node()


func _remove_training_card(card_id: String) -> void:
	deck.erase(card_id)
	if _base_card_id(card_id) == "inner_demon":
		_unlock_achievement("cleanse_mind")
		_advance_trial_mandate("cleanse", 1)
		_advance_bounty("cleanse", 1)
	_log("竹林参悟，散去杂念，移除：" + _card_data(card_id)["name"] + "。")
	_finish_choice_node()


func _upgrade_random_cards(amount: int) -> Array[String]:
	var options := _upgradable_card_options()
	options.shuffle()
	var upgraded_names: Array[String] = []
	for i in min(amount, options.size()):
		var card_id := options[i]
		var index := deck.find(card_id)
		if index == -1:
			continue
		var upgraded := _upgraded_card_id(card_id)
		deck[index] = upgraded
		upgraded_names.append(str(_card_data(upgraded)["name"]))
	if not upgraded_names.is_empty():
		_advance_trial_mandate("upgrade", upgraded_names.size())
		_advance_bounty("upgrade", upgraded_names.size())
	return upgraded_names


func _upgrade_training_card(card_id: String) -> void:
	var index := deck.find(card_id)
	if index == -1:
		_log("这张牌已不在牌组中。")
		_refresh()
		return
	var upgraded := _upgraded_card_id(card_id)
	deck[index] = upgraded
	_advance_trial_mandate("upgrade", 1)
	_advance_bounty("upgrade", 1)
	_log("竹林参悟，精研术法：" + _card_data(upgraded)["name"] + "。")
	_finish_choice_node()


func _resolve_rest() -> void:
	_show_rest_choices()


func _intent_text() -> String:
	if enemy.is_empty():
		return ""
	var move := _current_enemy_move()
	if move.is_empty():
		return ""
	var pieces: Array[String] = ["意图：" + str(move["intent"])]
	if move.has("damage"):
		pieces.append("伤害 " + str(move["damage"]) + (" x" + str(move.get("hits", 1)) if int(move.get("hits", 1)) > 1 else ""))
		pieces.append(_incoming_damage_preview(move))
	if move.has("block"):
		pieces.append("护体 +" + str(move["block"]))
	if move.get("flaw", false):
		pieces.append("露出破绽")
	if move.has("player_weak"):
		pieces.append("虚弱 +" + str(move["player_weak"]))
	if move.has("add_status"):
		pieces.append(_card_data(str(move["add_status"]))["name"] + " x" + str(move.get("status_amount", 1)))
	var next_move := _next_enemy_move()
	if not next_move.is_empty():
		pieces.append("下一式：" + _enemy_move_brief_text(next_move))
	return "    ".join(pieces)


func _current_enemy_move() -> Dictionary:
	if enemy.is_empty():
		return {}
	var moves: Array = enemy.get("moves", [])
	if moves.is_empty():
		return {}
	return moves[enemy_move_index % moves.size()]


func _next_enemy_move() -> Dictionary:
	if enemy.is_empty():
		return {}
	var moves: Array = enemy.get("moves", [])
	if moves.size() <= 1:
		return {}
	return moves[(enemy_move_index + 1) % moves.size()]


func _enemy_move_brief_text(move_data: Dictionary) -> String:
	var pieces: Array[String] = [str(move_data.get("intent", "未知招式"))]
	if move_data.has("damage"):
		pieces.append("伤害 " + str(move_data["damage"]) + ("x" + str(move_data.get("hits", 1)) if int(move_data.get("hits", 1)) > 1 else ""))
	if move_data.has("block"):
		pieces.append("护体 " + str(move_data["block"]))
	if move_data.get("flaw", false):
		pieces.append("破绽")
	if int(move_data.get("player_weak", 0)) > 0:
		pieces.append("虚弱 " + str(move_data["player_weak"]))
	if move_data.has("add_status"):
		pieces.append(_card_data(str(move_data["add_status"]))["name"] + " " + str(move_data.get("status_amount", 1)))
	return "/".join(pieces)


func _incoming_damage_preview(move: Dictionary) -> String:
	var forecast := _incoming_damage_forecast(move)
	var pieces: Array[String] = ["预计失血 " + str(int(forecast["hp_loss"]))]
	if shield > 0:
		pieces.append("剩余护盾 " + str(int(forecast["shield_after"])))
	if player_weak > 0:
		pieces.append("虚弱后 " + str(int(forecast["weak_after"])))
	return " / ".join(pieces)


func _incoming_damage_forecast(move: Dictionary) -> Dictionary:
	var forecast_shield := shield
	var forecast_weak := player_weak
	var hp_loss := 0
	var hits := int(move.get("hits", 1))
	for _i in hits:
		var incoming := int(move["damage"])
		if forecast_weak > 0:
			incoming = int(ceil(float(incoming) * 1.25))
			forecast_weak -= 1
		var blocked: int = min(forecast_shield, incoming)
		forecast_shield -= blocked
		hp_loss += incoming - blocked
	return {
		"hp_loss": hp_loss,
		"shield_after": forecast_shield,
		"weak_after": forecast_weak
	}


func _enemy_advice_text() -> String:
	if enemy.is_empty() or in_map or in_choice or in_reward or run_finished:
		return ""
	var lines: Array[String] = [
		"敌情研判：" + _enemy_pattern_summary_text(),
		"行动计划：" + _combat_action_plan_text(),
		"本回合：" + _enemy_current_turn_advice_text()
	]
	var next_move := _next_enemy_move()
	if not next_move.is_empty():
		lines.append("下一式：" + _enemy_move_brief_text(next_move))
	return "\n".join(lines)


func _enemy_pattern_summary_text() -> String:
	var summary: Array[String] = []
	var max_damage := 0
	var has_block := false
	var has_flaw := false
	var has_weak := false
	var has_demon := false
	var has_multi := false
	for move in enemy.get("moves", []):
		var move_data: Dictionary = move
		if move_data.has("damage"):
			var total_damage := int(move_data["damage"]) * int(move_data.get("hits", 1))
			max_damage = max(max_damage, total_damage)
			if int(move_data.get("hits", 1)) > 1:
				has_multi = true
		if move_data.has("block"):
			has_block = true
		if move_data.get("flaw", false):
			has_flaw = true
		if int(move_data.get("player_weak", 0)) > 0:
			has_weak = true
		if str(move_data.get("add_status", "")) == "inner_demon":
			has_demon = true
	if max_damage > 0:
		summary.append("最高威力 " + str(max_damage))
	if has_multi:
		summary.append("多段压盾")
	if has_block:
		summary.append("会护体" + ("并露破绽" if has_flaw else ""))
	if has_weak:
		summary.append("会加虚弱")
	if has_demon:
		summary.append("会混入心魔")
	return "、".join(summary) if not summary.is_empty() else "招式朴素，按意图应对"


func _combat_action_plan_text() -> String:
	if enemy.is_empty():
		return "观察意图"
	var move: Dictionary = enemy["moves"][enemy_move_index % enemy["moves"].size()]
	var possible_damage := _playable_hand_damage_estimate()
	var effective_enemy_hp := enemy_hp + enemy_block
	if effective_enemy_hp > 0 and possible_damage >= effective_enemy_hp:
		return "手牌伤害足以斩杀，优先按灵气顺序打输出"
	if move.has("damage"):
		var forecast := _incoming_damage_forecast(move)
		var hp_loss := int(forecast["hp_loss"])
		if hp_loss >= player_hp:
			return "必须先防御或击杀，否则会败退"
		if hp_loss >= max(12, int(max_hp * 0.22)):
			return "先补护盾/恢复，再考虑输出"
		if hp_loss <= 0:
			return "护盾足够，优先输出或过牌"
	if move.has("block"):
		return "敌人将护体，趁破绽压血或保留高伤牌"
	if str(move.get("add_status", "")) == "inner_demon":
		return "准备净心或压缩牌组，避免污染滚大"
	if int(move.get("player_weak", 0)) > 0:
		return "注意虚弱，保留驱散或下回合护盾"
	return "按当前路线推进，保留关键资源"


func _enemy_current_turn_advice_text() -> String:
	if enemy.is_empty():
		return ""
	var move: Dictionary = enemy["moves"][enemy_move_index % enemy["moves"].size()]
	var advice: Array[String] = []
	var possible_damage := _playable_hand_damage_estimate()
	var effective_enemy_hp := enemy_hp + enemy_block
	if possible_damage >= effective_enemy_hp and effective_enemy_hp > 0:
		advice.append("手牌约可打出 " + str(possible_damage) + " 威力，可尝试斩杀")
	if move.has("damage"):
		var forecast := _incoming_damage_forecast(move)
		var hp_loss := int(forecast["hp_loss"])
		if hp_loss >= player_hp:
			advice.append("若不处理会败退，优先护盾/恢复/击杀")
		elif hp_loss >= max(12, int(max_hp * 0.22)):
			advice.append("预计失血偏高，先补护盾或削弱敌人")
		elif hp_loss <= 0:
			advice.append("当前护盾足够，可偏进攻")
		else:
			advice.append("可承受 " + str(hp_loss) + " 点失血，按血线取舍")
	if move.has("block"):
		if move.get("flaw", false):
			advice.append("敌将护体露破绽，保留攻击或火符吃破绽")
		else:
			advice.append("敌将叠护体，适合提前压血")
	if int(move.get("player_weak", 0)) > 0:
		if _hand_contains_effect("cleanse_player_weak"):
			advice.append("手牌可驱散虚弱，留意施放顺序")
		else:
			advice.append("下回合承伤会变高，避免空盾过牌")
	if str(move.get("add_status", "")) == "inner_demon":
		if _deck_contains_effect(deck, "cleanse_curse") or _hand_contains_effect("cleanse_curse"):
			advice.append("心魔将入牌堆，净心牌价值提高")
		else:
			advice.append("心魔污染将变厚，后续优先找净心/删牌")
	if advice.is_empty():
		advice.append("观察意图，保持灵气用于关键牌")
	return "；".join(advice)


func _enemy_pattern_detail_text() -> String:
	if enemy.is_empty():
		return ""
	var lines: Array[String] = ["敌情研判：" + _enemy_pattern_summary_text(), "招式循环："]
	for move in enemy.get("moves", []):
		var move_data: Dictionary = move
		lines.append("· " + _enemy_move_brief_text(move_data))
	return "\n".join(lines)


func _hand_contains_effect(effect_key: String) -> bool:
	for card_id in hand:
		var card := _card_data(str(card_id))
		if card.has(effect_key):
			return true
	return false


func _recommended_hand_card_index() -> int:
	if not _is_in_combat() or hand.is_empty():
		return -1
	var best_index := -1
	var best_score := -100000
	for i in hand.size():
		var card_id := str(hand[i])
		var card := _card_data(card_id)
		if card.get("unplayable", false) or qi < int(card.get("cost", 0)):
			continue
		var score := _combat_card_score(card_id, i)
		if score > best_score:
			best_score = score
			best_index = i
	return best_index


func _combat_card_score(card_id: String, hand_index: int = 0) -> int:
	var card := _card_data(card_id)
	var score := 0
	var cost := int(card.get("cost", 0))
	var move := _current_enemy_move()
	var effective_enemy_hp := enemy_hp + enemy_block
	var hits := int(card.get("hits", 1))
	var damage := int(card.get("damage", 0)) * hits
	var block := int(card.get("block", 0))
	var heal := int(card.get("heal", 0))
	if damage > 0:
		score += min(damage, effective_enemy_hp) * 3
		if damage >= effective_enemy_hp and effective_enemy_hp > 0:
			score += 200
	if move.has("damage"):
		var forecast := _incoming_damage_forecast(move)
		var hp_loss := int(forecast.get("hp_loss", 0))
		if hp_loss > 0:
			score += block * 4
			score += min(block, hp_loss) * 6
			score += min(heal, max(0, max_hp - player_hp)) * 5
			if block >= hp_loss:
				score += min(18, block * 2)
			if heal > 0:
				score += 10
			if int(card.get("weak", 0)) > 0:
				score += 22
			if player_hp <= hp_loss and damage < effective_enemy_hp and block <= 0 and heal <= 0:
				score -= 45
			elif damage <= 0 and block <= 0 and heal <= 0:
				score -= 8
		elif int(card.get("weak", 0)) > 0:
			score += 22
		if hp_loss <= 0 and block > 0:
			score += min(block, 4)
	if int(card.get("draw", 0)) > 0:
		score += int(card["draw"]) * 12
	if int(card.get("gain_qi", 0)) > 0:
		score += int(card["gain_qi"]) * 16
	if cost == 0:
		score += 7
	if card.has("cleanse_player_weak") and player_weak > 0:
		score += 35
	if card.has("cleanse_curse") and _inner_demon_count_all_piles() > 0:
		score += 38
	if int(card.get("self_damage", 0)) > 0:
		score -= int(card["self_damage"]) * (5 if player_hp <= int(max_hp * 0.35) else 2)
	score -= cost * 2
	score -= hand_index
	return score


func _combat_card_recommendation_reason(card_id: String) -> String:
	var card := _card_data(card_id)
	var move := _current_enemy_move()
	var effective_enemy_hp := enemy_hp + enemy_block
	var damage := int(card.get("damage", 0)) * int(card.get("hits", 1))
	if damage >= effective_enemy_hp and effective_enemy_hp > 0:
		return "伤害已进入斩杀线，可直接结束战斗。"
	if move.has("damage"):
		var forecast := _incoming_damage_forecast(move)
		var hp_loss := int(forecast.get("hp_loss", 0))
		if hp_loss > 0 and int(card.get("block", 0)) > 0:
			return "敌方攻击将穿盾，补足护盾可减少本回合失血。"
		if hp_loss > 0 and int(card.get("heal", 0)) > 0:
			return "本回合存在失血风险，恢复生命能稳住血线。"
		if int(card.get("weak", 0)) > 0:
			return "敌人正准备攻击，施加虚弱可降低承伤。"
	if card.has("cleanse_curse") and _inner_demon_count_all_piles() > 0:
		return "牌堆已有心魔，先净心能提高后续抽牌质量。"
	if card.has("cleanse_player_weak") and player_weak > 0:
		return "先驱散虚弱，避免后续承伤继续放大。"
	if int(card.get("gain_qi", 0)) > 0:
		return "零代价回灵，先打能扩展本回合的出牌空间。"
	if int(card.get("draw", 0)) > 0:
		return "先过牌再决策，更容易找到当前回合的关键牌。"
	if damage > 0:
		return "当前防线尚可，优先压低敌人生命。"
	return "它最贴合当前意图与资源，适合作为本回合起手。"


func _playable_hand_damage_estimate() -> int:
	var available_qi := qi
	var total_damage := 0
	var edge_bonus_per_hit := player_edge * (2 + _treasure_value("edge_damage_bonus"))
	var edge_spent := false
	for card_id in hand:
		var card := _card_data(str(card_id))
		if card.get("unplayable", false):
			continue
		var cost := int(card.get("cost", 0))
		if cost > available_qi:
			continue
		available_qi -= cost
		if card.has("gain_qi"):
			available_qi += int(card["gain_qi"])
		if not card.has("damage"):
			continue
		var hits := int(card.get("hits", 1))
		var per_hit := int(card["damage"]) + _breakthrough_value("attack_damage") + int(_origin_data().get("attack_damage", 0))
		if str(card.get("type", "")) == "attack" and not edge_spent:
			per_hit += edge_bonus_per_hit
			edge_spent = true
		total_damage += per_hit * hits
	return total_damage


func _log(message: String) -> void:
	log_lines.append("· " + message)
	if log_lines.size() > 40:
		log_lines.pop_front()


func _clear_children(node: Node) -> void:
	for child in node.get_children():
		node.remove_child(child)
		child.queue_free()


func _make_card_button(card_id: String, is_reward: bool) -> Button:
	var card: Dictionary = _card_data(card_id)
	var rarity := str(card.get("rarity", "common"))
	var rarity_color: Color = RARITY_COLORS.get(rarity, RARITY_COLORS["common"])
	var button := Button.new()
	button.custom_minimum_size = _card_button_size(is_reward)
	button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var upgrade_badge := _card_upgrade_badge(card_id)
	var meta_line := "灵气 %d    %s" % [card["cost"], _card_type_name(str(card["type"]))]
	if not upgrade_badge.is_empty():
		meta_line = upgrade_badge + "    " + meta_line
	# Keep semantic text for shortcuts/tests while the visible card is composed below.
	button.text = "%s\n%s\n\n%s" % [
		card["name"],
		meta_line,
		card["desc"]
	]
	var art_path := _preferred_art_path(card)
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_color_override("font_disabled_color", Color(1, 1, 1, 0))
	var card_bg := Color(0.085, 0.12, 0.105, 0.99)
	if str(card.get("type", "")) == "attack":
		card_bg = Color(0.15, 0.075, 0.055, 0.99)
	elif str(card.get("type", "")) == "skill":
		card_bg = Color(0.045, 0.13, 0.125, 0.99)
	elif str(card.get("type", "")) == "curse":
		card_bg = Color(0.12, 0.07, 0.13, 0.99)
	button.add_theme_stylebox_override("normal", _panel_style(card_bg, rarity_color, 5, 3))
	button.add_theme_stylebox_override("hover", _panel_style(card_bg.lightened(0.08), COLOR_GOLD_FOCUS, 5, 4))
	button.add_theme_stylebox_override("pressed", _panel_style(card_bg.darkened(0.10), rarity_color, 5, 3))
	button.add_theme_stylebox_override("disabled", _panel_style(Color(0.045, 0.055, 0.052, 0.92), Color(0.22, 0.24, 0.21), 5, 2))
	button.add_theme_stylebox_override("focus", _panel_style(Color(0, 0, 0, 0), COLOR_GOLD_FOCUS, 5, 2))
	button.tooltip_text = _card_tooltip_text(card_id, is_reward)
	_add_card_visual(button, card_id, art_path, rarity_color, is_reward)
	_apply_button_motion(button, 1.035)
	return button


func _add_card_visual(button: Button, card_id: String, art_path: String, rarity_color: Color, is_reward: bool) -> void:
	var card := _card_data(card_id)
	var short_card := _is_short_screen() and not is_reward
	var inset := MarginContainer.new()
	inset.name = "CardVisual"
	inset.mouse_filter = Control.MOUSE_FILTER_IGNORE
	inset.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	inset.add_theme_constant_override("margin_left", 7)
	inset.add_theme_constant_override("margin_right", 7)
	inset.add_theme_constant_override("margin_top", 7)
	inset.add_theme_constant_override("margin_bottom", 7)
	button.add_child(inset)

	var card_stack := VBoxContainer.new()
	card_stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card_stack.add_theme_constant_override("separation", 4)
	inset.add_child(card_stack)

	var header := HBoxContainer.new()
	header.mouse_filter = Control.MOUSE_FILTER_IGNORE
	header.add_theme_constant_override("separation", 5)
	card_stack.add_child(header)

	var cost_badge := Label.new()
	cost_badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cost_badge.text = str(card.get("cost", 0))
	cost_badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cost_badge.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	cost_badge.custom_minimum_size = Vector2(26, 26)
	cost_badge.add_theme_font_size_override("font_size", 16 if not short_card else 13)
	cost_badge.add_theme_color_override("font_color", Color(0.09, 0.08, 0.04))
	cost_badge.add_theme_stylebox_override("normal", _panel_style(Color(0.94, 0.72, 0.27, 1.0), Color(1.0, 0.87, 0.53), 3, 1))
	header.add_child(cost_badge)

	var name_label := Label.new()
	name_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	name_label.text = _card_display_name(card_id)
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	name_label.add_theme_font_size_override("font_size", 15 if not short_card else 12)
	name_label.add_theme_color_override("font_color", Color(0.98, 0.91, 0.72))
	header.add_child(name_label)

	var art_frame := PanelContainer.new()
	art_frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	art_frame.custom_minimum_size.y = 98 if is_reward else (72 if short_card else 104)
	art_frame.add_theme_stylebox_override("panel", _panel_style(Color(0.018, 0.035, 0.035, 0.95), rarity_color.darkened(0.12), 2, 1))
	card_stack.add_child(art_frame)

	var art := TextureRect.new()
	art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	art.texture = _load_cached_texture(art_path) if not art_path.is_empty() else card_back_texture
	art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	art_frame.add_child(art)

	var type_label := Label.new()
	type_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	type_label.text = _card_type_name(str(card.get("type", ""))) + ("  " + _card_upgrade_badge(card_id) if not _card_upgrade_badge(card_id).is_empty() else "")
	type_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	type_label.add_theme_font_size_override("font_size", 11 if short_card else 12)
	type_label.add_theme_color_override("font_color", rarity_color.lightened(0.18))
	card_stack.add_child(type_label)

	var desc_label := Label.new()
	desc_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	desc_label.text = str(card.get("desc", ""))
	desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc_label.vertical_alignment = VERTICAL_ALIGNMENT_TOP
	desc_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	desc_label.add_theme_font_size_override("font_size", 11 if short_card else 12)
	desc_label.add_theme_color_override("font_color", Color(0.90, 0.86, 0.72))
	card_stack.add_child(desc_label)


func _card_button_size(is_reward: bool, viewport_height_override: float = -1.0) -> Vector2:
	if is_reward:
		return Vector2(176, 220)
	if _is_short_screen(viewport_height_override):
		return Vector2(136, 170)
	return Vector2(140, 196) if use_compact_hand else Vector2(164, 214)


func _make_map_button(title: String, desc: String, border_color: Color, art_path: String = "") -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(230, 168)
	button.text = "%s\n\n%s" % [title, desc]
	button.tooltip_text = title + "\n" + desc
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.035, 0.075, 0.068, 0.98), border_color, 5, 2))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.09, 0.16, 0.13, 0.99), Color(0.97, 0.72, 0.28), 4, 4))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.035, 0.075, 0.065, 0.99), border_color, 4, 3))
	button.add_theme_stylebox_override("focus", _panel_style(Color(0, 0, 0, 0), COLOR_GOLD_FOCUS, 5, 2))
	_add_map_node_visual(button, title, desc, art_path, border_color)
	_apply_button_motion(button, 1.018)
	return button


func _add_map_node_visual(button: Button, title: String, desc: String, art_path: String, border_color: Color) -> void:
	var inset := MarginContainer.new()
	inset.mouse_filter = Control.MOUSE_FILTER_IGNORE
	inset.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	inset.add_theme_constant_override("margin_left", 7)
	inset.add_theme_constant_override("margin_right", 7)
	inset.add_theme_constant_override("margin_top", 7)
	inset.add_theme_constant_override("margin_bottom", 7)
	button.add_child(inset)

	var stack := VBoxContainer.new()
	stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stack.add_theme_constant_override("separation", 5)
	inset.add_child(stack)

	var art_frame := PanelContainer.new()
	art_frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	art_frame.custom_minimum_size = Vector2(0, 82)
	art_frame.add_theme_stylebox_override("panel", _panel_style(Color(0.008, 0.020, 0.022, 0.96), border_color.darkened(0.12), 3, 1))
	stack.add_child(art_frame)

	var art := TextureRect.new()
	art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	art.texture = _load_cached_texture(art_path) if not art_path.is_empty() else card_back_texture
	art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	art.modulate = Color(0.84, 0.90, 0.84, 0.92)
	art_frame.add_child(art)

	var title_label := Label.new()
	title_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	title_label.text = title
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 17)
	title_label.add_theme_color_override("font_color", Color(0.98, 0.86, 0.60))
	stack.add_child(title_label)

	var desc_label := Label.new()
	desc_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	desc_label.text = desc
	desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc_label.add_theme_font_size_override("font_size", 12)
	desc_label.add_theme_color_override("font_color", Color(0.79, 0.86, 0.77))
	stack.add_child(desc_label)


func _map_node_art_path(node_type: String) -> String:
	match node_type:
		"battle":
			return ENEMY_WOLF_ART_PATH
		"elite", "boss":
			return ENEMY_BLACK_CULT_DEACON_ART_PATH
		"event":
			return CARD_BACK_PATH
		"herb_event":
			return CARD_CLEAR_HEART_ART_PATH
		"spirit_rift", "market":
			return CARD_SPIRIT_STONE_ART_PATH
		"secret_realm", "training":
			return CARD_BREATH_CYCLE_ART_PATH
		"duel_trial":
			return CARD_IRON_SWORD_ART_PATH
		"soul_shrine":
			return CARD_CLEAR_HEART_ART_PATH
		"dark_forge":
			return CARD_FIRE_TALISMAN_ART_PATH
		"thunder_pool":
			return CARD_FOUNDATION_SURGE_ART_PATH
		"rest":
			return CARD_BODY_WARD_ART_PATH
		_:
			return CARD_BACK_PATH


func _make_choice_button(title: String, desc: String, border_color: Color, tags: String = "") -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(210, 168)
	var tag_line := "\n" + tags if not tags.is_empty() else ""
	button.text = "%s%s\n\n%s" % [title, tag_line, desc]
	button.tooltip_text = title + tag_line + "\n" + desc
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_color_override("font_disabled_color", Color(1, 1, 1, 0))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.06, 0.11, 0.10, 0.98), border_color, 4, 3))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.10, 0.17, 0.14, 0.99), Color(0.97, 0.72, 0.28), 4, 4))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.035, 0.075, 0.065, 0.99), border_color, 4, 3))
	button.add_theme_stylebox_override("disabled", _panel_style(Color(0.04, 0.05, 0.05, 0.90), Color(0.22, 0.23, 0.21), 4, 2))
	_add_choice_visual(button, title, desc, tags, border_color)
	_apply_button_motion(button, 1.018)
	return button


func _add_choice_visual(button: Button, title: String, desc: String, tags: String, border_color: Color) -> void:
	var inset := MarginContainer.new()
	inset.mouse_filter = Control.MOUSE_FILTER_IGNORE
	inset.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	inset.add_theme_constant_override("margin_left", 8)
	inset.add_theme_constant_override("margin_right", 8)
	inset.add_theme_constant_override("margin_top", 8)
	inset.add_theme_constant_override("margin_bottom", 8)
	button.add_child(inset)

	var stack := VBoxContainer.new()
	stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stack.add_theme_constant_override("separation", 4)
	inset.add_child(stack)

	var art_frame := PanelContainer.new()
	art_frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	art_frame.custom_minimum_size = Vector2(0, 50)
	art_frame.add_theme_stylebox_override("panel", _panel_style(Color(0.008, 0.020, 0.022, 0.95), border_color.darkened(0.12), 2, 1))
	stack.add_child(art_frame)

	var art := TextureRect.new()
	art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	art.texture = _load_cached_texture(_tone_art_path(_tone_from_color(border_color)))
	art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	art.modulate = Color(0.78, 0.88, 0.81, 0.88)
	art_frame.add_child(art)

	var title_label := Label.new()
	title_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	title_label.text = title
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 16)
	title_label.add_theme_color_override("font_color", Color(0.98, 0.87, 0.62))
	stack.add_child(title_label)

	if not tags.is_empty():
		var tag_label := Label.new()
		tag_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tag_label.text = tags
		tag_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		tag_label.add_theme_font_size_override("font_size", 11)
		tag_label.add_theme_color_override("font_color", border_color.lightened(0.22))
		stack.add_child(tag_label)

	var desc_label := Label.new()
	desc_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	desc_label.text = desc
	desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc_label.add_theme_font_size_override("font_size", 12)
	desc_label.add_theme_color_override("font_color", Color(0.82, 0.86, 0.76))
	stack.add_child(desc_label)


func _tone_from_color(color: Color) -> String:
	if color.r > color.g + 0.12:
		return "battle"
	if color.b > color.r + 0.10:
		return "training"
	if color.g > color.r + 0.12:
		return "rest"
	return "event"


func _make_treasure_button(treasure_id: String) -> Button:
	var treasure: Dictionary = TREASURE_LIBRARY[treasure_id]
	var button := Button.new()
	button.custom_minimum_size = Vector2(176, 220)
	button.text = "法宝\n%s\n\n%s" % [treasure["name"], treasure["desc"]]
	button.tooltip_text = "法宝：" + str(treasure["name"]) + "\n" + str(treasure["desc"]) + "\n" + _reward_growth_fit_text(treasure)
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.12, 0.12, 0.15, 0.98), _node_color(str(treasure.get("tone", "event"))), 12, 3))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.18, 0.17, 0.20, 0.98), Color(0.94, 0.78, 0.48), 12, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.08, 0.08, 0.10, 0.98), _node_color(str(treasure.get("tone", "event"))), 12, 3))
	_add_reward_item_visual(button, "法宝", str(treasure["name"]), str(treasure["desc"]), _reward_icon_path("treasures", treasure_id), _node_color(str(treasure.get("tone", "event"))))
	_apply_button_motion(button, 1.018)
	return button


func _make_consumable_button(consumable_id: String, is_reward: bool) -> Button:
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	var button := Button.new()
	button.custom_minimum_size = Vector2(176, 220) if is_reward else Vector2(152, 58)
	button.text = "消耗品\n%s\n\n%s" % [consumable["name"], consumable["desc"]]
	button.tooltip_text = "消耗品：" + str(consumable["name"]) + "\n" + str(consumable["desc"])
	if is_reward:
		button.tooltip_text += "\n" + _reward_consumable_fit_text(consumable)
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.12, 0.14, 0.15, 0.98), _node_color(str(consumable.get("tone", "event"))), 12, 3))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.17, 0.20, 0.19, 0.98), Color(0.94, 0.78, 0.48), 12, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.08, 0.09, 0.10, 0.98), _node_color(str(consumable.get("tone", "event"))), 12, 3))
	_add_reward_item_visual(button, "消耗品", str(consumable["name"]), str(consumable["desc"]), _reward_icon_path("consumables", consumable_id), _node_color(str(consumable.get("tone", "event"))), is_reward)
	_apply_button_motion(button, 1.018)
	return button


func _make_insight_button(insight_id: String) -> Button:
	var insight: Dictionary = INSIGHT_LIBRARY[insight_id]
	var button := Button.new()
	button.custom_minimum_size = Vector2(176, 220)
	button.text = "悟道\n%s\n\n%s" % [insight["name"], insight["desc"]]
	button.tooltip_text = "悟道：" + str(insight["name"]) + "\n" + str(insight["desc"]) + "\n" + _reward_growth_fit_text(insight)
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.12, 0.13, 0.16, 0.98), _node_color(str(insight.get("tone", "training"))), 12, 3))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.18, 0.18, 0.22, 0.98), Color(0.94, 0.78, 0.48), 12, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.08, 0.08, 0.11, 0.98), _node_color(str(insight.get("tone", "training"))), 12, 3))
	_add_reward_item_visual(button, "悟道", str(insight["name"]), str(insight["desc"]), _reward_icon_path("insights", insight_id), _node_color(str(insight.get("tone", "training"))))
	_apply_button_motion(button, 1.018)
	return button


func _make_breakthrough_button(breakthrough_id: String) -> Button:
	var breakthrough: Dictionary = BREAKTHROUGH_LIBRARY[breakthrough_id]
	var button := Button.new()
	button.custom_minimum_size = Vector2(176, 220)
	button.text = "破境\n%s\n\n%s" % [breakthrough["name"], breakthrough["desc"]]
	button.tooltip_text = "破境：" + str(breakthrough["name"]) + "\n" + str(breakthrough["desc"]) + "\n" + _reward_growth_fit_text(breakthrough)
	button.add_theme_font_size_override("font_size", 1)
	button.add_theme_color_override("font_color", Color(1, 1, 1, 0))
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.13, 0.11, 0.16, 0.98), _node_color(str(breakthrough.get("tone", "elite"))), 12, 3))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.19, 0.16, 0.22, 0.98), Color(0.94, 0.78, 0.48), 12, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.09, 0.08, 0.12, 0.98), _node_color(str(breakthrough.get("tone", "elite"))), 12, 3))
	_add_reward_item_visual(button, "破境", str(breakthrough["name"]), str(breakthrough["desc"]), _reward_icon_path("breakthroughs", breakthrough_id), _node_color(str(breakthrough.get("tone", "elite"))))
	_apply_button_motion(button, 1.018)
	return button


func _add_reward_item_visual(
	button: Button,
	category: String,
	title: String,
	desc: String,
	art_path: String,
	accent: Color,
	show_art: bool = true
) -> void:
	var inset := MarginContainer.new()
	inset.mouse_filter = Control.MOUSE_FILTER_IGNORE
	inset.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	inset.add_theme_constant_override("margin_left", 8)
	inset.add_theme_constant_override("margin_right", 8)
	inset.add_theme_constant_override("margin_top", 8)
	inset.add_theme_constant_override("margin_bottom", 8)
	button.add_child(inset)
	var stack := VBoxContainer.new()
	stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stack.add_theme_constant_override("separation", 4)
	inset.add_child(stack)
	var category_label := Label.new()
	category_label.text = category
	category_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	category_label.add_theme_font_size_override("font_size", 11)
	category_label.add_theme_color_override("font_color", accent.lightened(0.20))
	stack.add_child(category_label)
	if show_art:
		var art := TextureRect.new()
		art.mouse_filter = Control.MOUSE_FILTER_IGNORE
		art.texture = _load_cached_texture(art_path)
		art.custom_minimum_size = Vector2(0, 72)
		art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		art.modulate = Color(0.82, 0.88, 0.80, 0.88)
		stack.add_child(art)
	var title_label := Label.new()
	title_label.text = title
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 16)
	title_label.add_theme_color_override("font_color", Color(0.98, 0.87, 0.62))
	stack.add_child(title_label)
	var desc_label := Label.new()
	desc_label.text = desc
	desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc_label.add_theme_font_size_override("font_size", 11)
	desc_label.add_theme_color_override("font_color", Color(0.82, 0.84, 0.75))
	stack.add_child(desc_label)


func _reward_icon_path(family: String, id: String) -> String:
	return "res://assets/ui/%s/%s.png" % [family, id]


func _card_tooltip_text(card_id: String, is_reward: bool) -> String:
	var card: Dictionary = _card_data(card_id)
	var lines: Array[String] = [
		str(card["name"]),
		"%s｜%s｜灵气 %d｜%s" % [
			_rarity_name(str(card.get("rarity", "common"))),
			_card_type_name(str(card["type"])),
			int(card["cost"]),
			_card_act_text(card_id)
		],
		str(card["desc"])
	]
	if _card_upgrade_level(card_id) > 0:
		lines.append("已精研 +" + str(_card_upgrade_level(card_id)))
	else:
		lines.append(_card_upgrade_rule_text(card_id))
	if card.get("unplayable", false):
		lines.append("不可打出，会占用手牌。")
	if card.get("exhaust", false):
		lines.append("打出后本场战斗移入消耗区。")
	var art_state := _image2_card_art_state_text(card_id)
	if art_state.contains("Image-2"):
		lines.append(art_state)
	if is_reward:
		lines.append("选择后加入牌组。")
		lines.append(_reward_card_fit_text(card_id))
	elif not enemy.is_empty():
		lines.append(_card_dynamic_preview_text(card))
	return "\n".join(lines)


func _reward_card_fit_text(card_id: String) -> String:
	var card := _card_data(card_id)
	var profile := _deck_profile(deck)
	var fit: Array[String] = []
	var caution: Array[String] = []
	if str(card.get("type", "")) == "attack" and int(profile.get("attack", 0)) <= 2:
		fit.append("补足伤害")
	if (card.has("block") or card.has("heal")) and int(profile.get("defense", 0)) <= 2:
		fit.append("补足防御/恢复")
	if card.has("draw") and (int(profile.get("draw", 0)) <= 1 or deck.size() >= 12):
		fit.append("改善过牌")
	if card.has("cleanse_curse") and deck.has("inner_demon"):
		fit.append("清理心魔")
	if card.has("gain_qi") and (max_qi <= 3 or int(profile.get("high_cost", 0)) >= 3):
		fit.append("缓解灵气压力")
	if card.has("burn") and (int(profile.get("burn", 0)) > 0 or _treasure_value("burn_damage") > 0 or _breakthrough_value("burn_bonus") > 0):
		fit.append("强化燃烧路线")
	if card.has("weak") and int(profile.get("weak", 0)) > 0:
		fit.append("强化虚弱控制")
	if card.has("gain_edge") and int(profile.get("multi_hit", 0)) > 0:
		fit.append("为多段攻击蓄势")
	if int(card.get("hits", 1)) > 1 and (int(profile.get("edge", 0)) > 0 or _treasure_value("start_edge") > 0):
		fit.append("吃到剑势多段收益")
	if card.has("self_damage") and (_has_treasure("blood_seal") or selected_origin == "demon_tempered"):
		fit.append("适合反噬路线")
	if _deck_base_count(_base_card_id(card_id)) >= 2:
		caution.append("同名牌较多")
	if int(card.get("cost", 0)) >= 2 and max_qi <= 3 and int(profile.get("high_cost", 0)) >= 3:
		caution.append("高费压力")
	if str(card.get("type", "")) == "skill" and int(profile.get("skill", 0)) >= int(profile.get("attack", 0)) + 3:
		caution.append("法门已偏多")
	if fit.is_empty():
		fit.append("通用补强")
	var text := "契合：" + "、".join(fit)
	if not caution.is_empty():
		text += "｜谨慎：" + "、".join(caution)
	return text


func _recommended_reward_option_index(options: Array[Dictionary]) -> int:
	var best_index := -1
	var best_score := -9999
	for i in options.size():
		var option: Dictionary = options[i]
		var score := _reward_option_score(str(option.get("kind", "")), str(option.get("id", "")))
		if score > best_score:
			best_score = score
			best_index = i
	return best_index


func _apply_reward_recommendation_hint(button: Button, kind: String, reward_id: String, index: int, recommended_index: int) -> void:
	var score := _reward_option_score(kind, reward_id)
	var level := _reward_recommendation_level(score)
	button.tooltip_text += "\n推荐度：" + level + "｜" + _reward_recommendation_reason(kind, reward_id)
	if index == recommended_index:
		button.text = "荐 " + button.text
		button.tooltip_text += "\n当前奖励中优先查看。"


func _reward_recommendation_level(score: int) -> String:
	if score >= 32:
		return "高"
	if score >= 20:
		return "中"
	return "低"


func _reward_recommendation_reason(kind: String, reward_id: String) -> String:
	match kind:
		"card":
			return _reward_card_fit_text(reward_id)
		"treasure":
			if TREASURE_LIBRARY.has(reward_id):
				return _reward_growth_fit_text(TREASURE_LIBRARY[reward_id])
		"insight":
			if INSIGHT_LIBRARY.has(reward_id):
				return _reward_growth_fit_text(INSIGHT_LIBRARY[reward_id])
		"breakthrough":
			if BREAKTHROUGH_LIBRARY.has(reward_id):
				return _reward_growth_fit_text(BREAKTHROUGH_LIBRARY[reward_id])
		"consumable":
			if CONSUMABLE_LIBRARY.has(reward_id):
				return _reward_consumable_fit_text(CONSUMABLE_LIBRARY[reward_id])
	return "通用补强"


func _reward_option_score(kind: String, reward_id: String) -> int:
	match kind:
		"card":
			if not CARD_LIBRARY.has(_base_card_id(reward_id)):
				return 0
			return _reward_card_score(reward_id)
		"treasure":
			if TREASURE_LIBRARY.has(reward_id):
				return _reward_growth_score(TREASURE_LIBRARY[reward_id]) + 4
		"insight":
			if INSIGHT_LIBRARY.has(reward_id):
				return _reward_growth_score(INSIGHT_LIBRARY[reward_id]) + 6
		"breakthrough":
			if BREAKTHROUGH_LIBRARY.has(reward_id):
				return _reward_growth_score(BREAKTHROUGH_LIBRARY[reward_id]) + 10
		"consumable":
			if CONSUMABLE_LIBRARY.has(reward_id):
				return _reward_consumable_score(CONSUMABLE_LIBRARY[reward_id])
	return 0


func _reward_card_score(card_id: String) -> int:
	var card := _card_data(card_id)
	var profile := _deck_profile(deck)
	var score := 12
	match str(card.get("rarity", "common")):
		"rare":
			score += 8
		"uncommon":
			score += 4
	if _card_upgrade_level(card_id) > 0:
		score += 4
	if str(card.get("type", "")) == "attack" and int(profile.get("attack", 0)) <= 2:
		score += 10
	if (card.has("block") or card.has("heal")) and int(profile.get("defense", 0)) <= 2:
		score += 9
	if card.has("draw") and (int(profile.get("draw", 0)) <= 1 or deck.size() >= 12):
		score += 8
	if card.has("cleanse_curse") and deck.has("inner_demon"):
		score += 12
	if card.has("gain_qi") and (max_qi <= 3 or int(profile.get("high_cost", 0)) >= 3):
		score += 7
	if card.has("burn") and (int(profile.get("burn", 0)) > 0 or _treasure_value("burn_damage") > 0 or _breakthrough_value("burn_bonus") > 0):
		score += 7
	if card.has("weak") and int(profile.get("weak", 0)) > 0:
		score += 5
	if (card.has("gain_edge") and int(profile.get("multi_hit", 0)) > 0) or (int(card.get("hits", 1)) > 1 and int(profile.get("edge", 0)) > 0):
		score += 7
	if _deck_base_count(_base_card_id(card_id)) >= 2:
		score -= 5
	if int(card.get("cost", 0)) >= 2 and max_qi <= 3 and int(profile.get("high_cost", 0)) >= 3:
		score -= 6
	return score


func _reward_growth_score(data: Dictionary) -> int:
	var profile := _deck_profile(deck)
	var score := 14
	if data.has("max_qi") or data.has("first_turn_qi"):
		score += 10 if max_qi <= 3 or int(profile.get("high_cost", 0)) >= 3 else 5
	if data.has("heal") or data.has("max_hp") or data.has("battle_heal"):
		score += 9 if player_hp <= max(18, int(max_hp * 0.45)) or int(profile.get("defense", 0)) <= 2 else 4
	if data.has("start_block"):
		score += 6
	if data.has("first_turn_draw") or data.has("first_skill_draw") or data.has("draw"):
		score += 7
	if data.has("attack_damage") or data.has("first_attack_damage"):
		score += 7 if int(profile.get("attack", 0)) >= 3 else 4
	if data.has("burn_damage") or data.has("burn_bonus"):
		score += 8 if int(profile.get("burn", 0)) > 0 else 3
	if data.has("start_edge") or data.has("first_skill_edge") or data.has("edge_damage_bonus"):
		score += 8 if int(profile.get("edge", 0)) > 0 or int(profile.get("multi_hit", 0)) > 0 else 4
	if data.has("cleanse_curse") or data.has("start_cleanse_curse"):
		score += 10 if deck.has("inner_demon") else 3
	if data.has("battle_stones") or data.has("market_discount"):
		score += 4
	if data.has("battle_reward_consumable") or data.has("first_consumable_draw") or data.has("consumable_bonus") or data.has("gain_consumable"):
		score += 6 if consumables.size() > 0 else 3
	return score


func _reward_consumable_score(consumable: Dictionary) -> int:
	var score := 12
	if consumable.has("heal"):
		score += 9 if player_hp <= max(18, int(max_hp * 0.45)) else 3
	if consumable.has("block"):
		score += 5
	if consumable.has("gain_qi"):
		score += 6
	if consumable.has("damage"):
		score += 6
	if consumable.has("cleanse_player_weak"):
		score += 7 if player_weak > 0 or next_combat_player_weak > 0 else 3
	if consumable.has("draw"):
		score += 4
	if consumable.has("gain_edge"):
		score += 6 if int(_deck_profile(deck).get("multi_hit", 0)) > 0 else 3
	return score


func _reward_growth_fit_text(data: Dictionary) -> String:
	var profile := _deck_profile(deck)
	var fit: Array[String] = []
	if data.has("max_qi") or data.has("gain_qi") or data.has("first_turn_qi"):
		if max_qi <= 3 or int(profile.get("high_cost", 0)) >= 3:
			fit.append("缓解灵气压力")
		else:
			fit.append("提高上限")
	if data.has("battle_heal") or data.has("heal") or data.has("max_hp"):
		if player_hp <= max(18, int(max_hp * 0.45)) or int(profile.get("defense", 0)) <= 2:
			fit.append("提高续航")
		else:
			fit.append("稳固血线")
	if data.has("start_block"):
		fit.append("提高开局容错")
	if data.has("first_turn_draw") or data.has("first_skill_draw") or data.has("draw"):
		fit.append("改善起手/循环")
	if data.has("burn_damage") or data.has("burn_bonus"):
		fit.append("强化燃烧路线" if int(profile.get("burn", 0)) > 0 else "开启燃烧收益")
	if data.has("start_edge") or data.has("first_skill_edge") or data.has("edge_damage_bonus"):
		fit.append("强化剑势爆发" if int(profile.get("edge", 0)) > 0 or int(profile.get("multi_hit", 0)) > 0 else "提供剑势方向")
	if data.has("attack_damage") or data.has("first_attack_damage"):
		fit.append("强化攻击牌")
	if data.has("cleanse_curse") or data.has("start_cleanse_curse"):
		fit.append("清理心魔" if deck.has("inner_demon") else "保持无垢")
	if data.has("start_cleanse_weak") or data.has("cleanse_player_weak"):
		fit.append("对抗虚弱")
	if data.has("battle_stones") or data.has("market_discount"):
		fit.append("提高经济")
	if data.has("battle_reward_consumable") or data.has("first_consumable_draw") or data.has("consumable_bonus") or data.has("gain_consumable"):
		fit.append("强化消耗品路线")
	if data.has("self_damage_block"):
		fit.append("配合反噬牌" if _deck_contains_effect(deck, "self_damage") or selected_origin == "demon_tempered" else "提供反噬保险")
	return "契合：" + ("、".join(fit) if not fit.is_empty() else "通用成长")


func _reward_consumable_fit_text(consumable: Dictionary) -> String:
	var fit: Array[String] = []
	if consumable.has("heal"):
		fit.append("低血线救急" if player_hp <= max(18, int(max_hp * 0.45)) else "备用恢复")
	if consumable.has("block"):
		fit.append("挡关键回合")
	if consumable.has("gain_qi"):
		fit.append("爆发回合补灵气")
	if consumable.has("damage"):
		fit.append("补即刻伤害")
	if consumable.has("cleanse_player_weak"):
		fit.append("解除虚弱" if player_weak > 0 or next_combat_player_weak > 0 else "预防虚弱")
	if consumable.has("draw"):
		fit.append("补循环")
	if consumable.has("gain_edge"):
		fit.append("配合多段攻击" if int(_deck_profile(deck).get("multi_hit", 0)) > 0 else "临时蓄势")
	return "契合：" + ("、".join(fit) if not fit.is_empty() else "应急资源")


func _deck_base_count(base_id: String) -> int:
	var count := 0
	for card_id in deck:
		if _base_card_id(card_id) == base_id:
			count += 1
	return count


func _card_dynamic_preview_text(card: Dictionary) -> String:
	if card.get("unplayable", false):
		return "当前预估：不可打出。"
	var pieces: Array[String] = []
	var cost := int(card.get("cost", 0))
	pieces.append("灵气 " + str(qi) + " -> " + str(qi - cost + int(card.get("gain_qi", 0))))
	if card.has("self_damage"):
		pieces.append("生命 " + str(player_hp) + " -> " + str(max(0, player_hp - int(card["self_damage"]))))
		if _treasure_value("self_damage_block") > 0:
			pieces.append("反噬护盾 +" + str(_treasure_value("self_damage_block")))
	if card.has("damage"):
		var damage_result := _forecast_card_damage(card)
		pieces.append("威力 %d，破盾 %d，伤血 %d" % [
			int(damage_result["power"]),
			int(damage_result["blocked"]),
			int(damage_result["hp_loss"])
		])
		if int(damage_result["edge_spent"]) > 0:
			pieces.append("消耗剑势 " + str(damage_result["edge_spent"]))
		if int(damage_result["weak_used"]) > 0:
			pieces.append("消耗敌方虚弱 " + str(damage_result["weak_used"]))
	if card.has("block"):
		pieces.append("护盾 " + str(shield) + " -> " + str(shield + int(card["block"])))
	if card.has("heal"):
		pieces.append("生命 " + str(player_hp) + " -> " + str(min(max_hp, player_hp + int(card["heal"]))))
	if card.has("gain_edge"):
		var edge_after := player_edge + int(card["gain_edge"])
		if str(card.get("type", "")) == "attack":
			edge_after = 0
		pieces.append("剑势 " + str(player_edge) + " -> " + str(edge_after))
	if card.has("burn"):
		pieces.append("燃烧 " + str(enemy_burn) + " -> " + str(enemy_burn + int(card["burn"]) + _breakthrough_value("burn_bonus")))
	if card.has("weak"):
		pieces.append("敌虚弱 " + str(enemy_weak) + " -> " + str(enemy_weak + int(card["weak"])))
	if card.has("cleanse_player_weak") and player_weak > 0:
		pieces.append("自身虚弱 " + str(player_weak) + " -> " + str(max(0, player_weak - int(card["cleanse_player_weak"]))))
	if card.has("cleanse_curse"):
		var removable := _inner_demon_count_all_piles()
		pieces.append("可净心魔 " + str(min(removable, int(card["cleanse_curse"]))) + "/" + str(removable))
	if card.has("draw"):
		pieces.append("抽牌 " + str(card["draw"]))
	return "当前预估：" + ("；".join(pieces) if not pieces.is_empty() else "无即时数值变化")


func _forecast_card_damage(card: Dictionary) -> Dictionary:
	var hits := int(card.get("hits", 1))
	var forecast_block := enemy_block
	var forecast_hp := enemy_hp
	var forecast_weak := enemy_weak
	var forecast_flaw := enemy_flawed
	var gained_edge := int(card.get("gain_edge", 0))
	var spent_edge := player_edge + gained_edge if str(card.get("type", "")) == "attack" else 0
	var edge_damage := spent_edge * (2 + _treasure_value("edge_damage_bonus"))
	var first_hit_bonus := 0
	if str(card.get("type", "")) == "attack" and not first_attack_played and _treasure_value("first_attack_damage") > 0:
		first_hit_bonus = _treasure_value("first_attack_damage")
	var total_power := 0
	var total_blocked := 0
	var hp_loss := 0
	var weak_used := 0
	for hit_index in hits:
		var damage := int(card["damage"]) + _breakthrough_value("attack_damage") + int(_origin_data().get("attack_damage", 0)) + edge_damage
		if hit_index == 0:
			damage += first_hit_bonus
		if forecast_weak > 0:
			damage = int(ceil(float(damage) * 1.25))
			forecast_weak -= 1
			weak_used += 1
		if forecast_flaw:
			damage += int(card.get("flaw_bonus", 0))
			forecast_flaw = false
		var absorbed: int = min(forecast_block, damage)
		forecast_block -= absorbed
		total_blocked += absorbed
		var raw_hp_loss := damage - absorbed
		var actual_hp_loss: int = min(forecast_hp, raw_hp_loss)
		forecast_hp -= actual_hp_loss
		hp_loss += actual_hp_loss
		total_power += damage
	return {
		"power": total_power,
		"blocked": total_blocked,
		"hp_loss": hp_loss,
		"edge_spent": spent_edge,
		"weak_used": weak_used
	}


func _inner_demon_count_all_piles() -> int:
	var total := deck.count("inner_demon")
	total += hand.count("inner_demon")
	total += draw_pile.count("inner_demon")
	total += discard_pile.count("inner_demon")
	total += exhaust_pile.count("inner_demon")
	return total


func _make_small_pile_button(text: String, tooltip: String = "") -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(74, 32)
	button.tooltip_text = tooltip if not tooltip.is_empty() else text
	button.add_theme_font_size_override("font_size", 14)
	button.add_theme_color_override("font_color", COLOR_TEXT)
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.045, 0.095, 0.085, 0.96), Color(0.28, 0.50, 0.40), 3, 1))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.08, 0.15, 0.12, 0.98), Color(0.90, 0.65, 0.25), 3, 2))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.025, 0.065, 0.055, 0.98), Color(0.28, 0.50, 0.40), 3, 1))
	_apply_button_motion(button, 1.025)
	return button


func _make_small_combat_button(text: String, border_color: Color, tooltip: String = "") -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(132, 48)
	button.tooltip_text = tooltip if not tooltip.is_empty() else text
	button.add_theme_font_size_override("font_size", 14)
	button.add_theme_color_override("font_color", COLOR_TEXT)
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.045, 0.085, 0.078, 0.96), border_color, 3, 2))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.08, 0.14, 0.12, 0.98), Color(0.97, 0.72, 0.28), 3, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.025, 0.06, 0.052, 0.98), border_color, 3, 2))
	button.add_theme_stylebox_override("focus", _panel_style(Color(0, 0, 0, 0), COLOR_GOLD_FOCUS, 3, 2))
	_apply_button_motion(button, 1.022)
	return button


func _make_menu_button(text: String, border_color: Color, tooltip: String = "") -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(180, 54)
	button.tooltip_text = tooltip if not tooltip.is_empty() else text
	button.add_theme_font_size_override("font_size", 18)
	button.add_theme_color_override("font_color", COLOR_TEXT)
	button.add_theme_stylebox_override("normal", _panel_style(Color(0.045, 0.09, 0.082, 0.98), border_color, 4, 2))
	button.add_theme_stylebox_override("hover", _panel_style(Color(0.08, 0.15, 0.12, 0.99), Color(0.98, 0.73, 0.28), 4, 3))
	button.add_theme_stylebox_override("pressed", _panel_style(Color(0.025, 0.065, 0.055, 0.99), border_color, 4, 2))
	button.add_theme_stylebox_override("focus", _panel_style(Color(0, 0, 0, 0), COLOR_GOLD_FOCUS, 4, 2))
	_apply_button_motion(button, 1.022)
	return button


func _apply_button_motion(button: Button, hover_scale: float) -> void:
	button.focus_mode = Control.FOCUS_ALL
	button.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	button.mouse_entered.connect(_on_button_hover_enter.bind(button, hover_scale))
	button.mouse_exited.connect(_on_button_hover_exit.bind(button))
	button.button_down.connect(_on_button_press_motion.bind(button))
	button.button_up.connect(_on_button_release_motion.bind(button, hover_scale))


func _on_button_hover_enter(button: Button, hover_scale: float) -> void:
	if not is_instance_valid(button) or button.disabled:
		return
	button.pivot_offset = button.size * 0.5
	button.z_index = 5
	_tween_button_scale(button, Vector2.ONE * hover_scale, 0.10)


func _on_button_hover_exit(button: Button) -> void:
	if not is_instance_valid(button):
		return
	button.z_index = 0
	_tween_button_scale(button, Vector2.ONE, 0.12)


func _on_button_press_motion(button: Button) -> void:
	if not is_instance_valid(button) or button.disabled:
		return
	button.pivot_offset = button.size * 0.5
	_tween_button_scale(button, Vector2.ONE * 0.975, 0.06)


func _on_button_release_motion(button: Button, hover_scale: float) -> void:
	if not is_instance_valid(button) or button.disabled:
		return
	var target_scale := hover_scale if button.get_global_rect().has_point(get_viewport().get_mouse_position()) else 1.0
	_tween_button_scale(button, Vector2.ONE * target_scale, 0.08)


func _tween_button_scale(button: Button, target_scale: Vector2, duration: float) -> void:
	var tween := button.create_tween()
	tween.set_trans(Tween.TRANS_QUAD)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(button, "scale", target_scale, duration)


func _node_color(type_id: String) -> Color:
	match type_id:
		"battle":
			return Color(0.73, 0.37, 0.31)
		"elite":
			return Color(0.78, 0.32, 0.43)
		"event":
			return Color(0.58, 0.70, 0.48)
		"herb_event":
			return Color(0.38, 0.70, 0.46)
		"spirit_rift":
			return Color(0.48, 0.76, 0.70)
		"duel_trial":
			return Color(0.68, 0.52, 0.82)
		"soul_shrine":
			return Color(0.61, 0.48, 0.74)
		"dark_forge":
			return Color(0.72, 0.45, 0.34)
		"thunder_pool":
			return Color(0.58, 0.66, 0.92)
		"market":
			return Color(0.79, 0.62, 0.34)
		"rest":
			return Color(0.42, 0.70, 0.64)
		"training":
			return Color(0.45, 0.60, 0.78)
		_:
			return COLOR_PANEL_EDGE


func _random_reward_card() -> String:
	var pool := _reward_card_pool()
	var picked := _pick_weighted_reward_card(pool)
	if picked.is_empty():
		picked = "iron_sword"
	return _maybe_upgrade_reward_card(picked)


func _maybe_upgrade_reward_card(card_id: String) -> String:
	if _is_curse_card(card_id):
		return card_id
	if _card_upgrade_level(card_id) >= MAX_CARD_UPGRADE:
		return card_id
	var chance := 0
	if current_act == 1:
		chance = 18
	elif current_act >= 2:
		chance = 35
	if chance <= 0:
		return card_id
	return _upgraded_card_id(card_id) if rng.randi_range(1, 100) <= chance else card_id


func _reward_card_pool() -> Array[String]:
	var pool: Array[String] = []
	for card_id in CARD_LIBRARY.keys():
		var card: Dictionary = CARD_LIBRARY[card_id]
		if STARTING_DECK.has(str(card_id)):
			continue
		if _is_curse_card(str(card_id)):
			continue
		if current_act < int(card.get("min_act", 0)):
			continue
		pool.append(str(card_id))
	return pool


func _pick_weighted_reward_card(pool: Array[String]) -> String:
	if pool.is_empty():
		return ""
	var total_weight := 0
	var weights := {}
	for card_id in pool:
		var weight := _reward_card_weight(card_id)
		weights[card_id] = weight
		total_weight += weight
	if total_weight <= 0:
		return pool.pick_random()
	var roll := rng.randi_range(1, total_weight)
	var cumulative := 0
	for card_id in pool:
		cumulative += int(weights[card_id])
		if roll <= cumulative:
			return card_id
	return pool.back()


func _reward_card_weight(card_id: String) -> int:
	var card: Dictionary = CARD_LIBRARY[card_id]
	match str(card.get("rarity", "common")):
		"common":
			if current_act <= 0:
				return 60
			return 34 if current_act >= 2 else 42
		"uncommon":
			if current_act <= 0:
				return 30
			return 36 if current_act >= 2 else 38
		"rare":
			if current_act <= 0:
				return 10
			return 30 if current_act >= 2 else 20
		_:
			return 1


func _is_curse_card(card_id: String) -> bool:
	return str(_card_data(card_id).get("type", "")) == "curse"


func _market_card_price() -> int:
	var price := 10
	price -= _treasure_value("market_discount")
	return max(1, price)


func _market_cleanse_price() -> int:
	var price := 8
	if _treasure_value("market_discount") > 0:
		price -= 2
	return max(1, price)


func _market_treasure_price() -> int:
	var price := 18
	price -= _treasure_value("market_discount")
	return max(1, price)


func _market_consumable_price() -> int:
	var price := 7
	if _treasure_value("market_discount") > 0:
		price -= 2
	return max(1, price)


func _reward_reroll_price() -> int:
	var price := 6
	if _treasure_value("market_discount") > 0:
		price -= 2
	price -= _lunar_omen_value("reroll_discount")
	return max(1, price)


func _random_consumable_id() -> String:
	var pool: Array[String] = []
	for consumable_id in CONSUMABLE_LIBRARY.keys():
		pool.append(str(consumable_id))
	pool.sort()
	return pool[rng.randi_range(0, pool.size() - 1)]


func _market_removable_options() -> Array[String]:
	var options: Array[String] = []
	for card_id in deck:
		if _is_curse_card(card_id) and not options.has(card_id):
			options.append(card_id)
	for card_id in deck:
		if options.size() >= 3:
			break
		if not options.has(card_id):
			options.append(card_id)
	return options


func _treasure_summary() -> String:
	if treasures.is_empty():
		return "法宝：无"
	var names: Array[String] = []
	for treasure_id in treasures:
		var treasure: Dictionary = TREASURE_LIBRARY[treasure_id]
		names.append(str(treasure["name"]))
	return "法宝：" + "、".join(names)


func _insight_summary() -> String:
	if insights.is_empty():
		return "悟道：无"
	var names: Array[String] = []
	for insight_id in insights:
		var insight: Dictionary = INSIGHT_LIBRARY[insight_id]
		names.append(str(insight["name"]))
	return "悟道：" + "、".join(names)


func _breakthrough_summary() -> String:
	if breakthroughs.is_empty():
		return "破境：无"
	var names: Array[String] = []
	for breakthrough_id in breakthroughs:
		if not BREAKTHROUGH_LIBRARY.has(breakthrough_id):
			continue
		var breakthrough: Dictionary = BREAKTHROUGH_LIBRARY[breakthrough_id]
		names.append(str(breakthrough["name"]))
	return "破境：" + "、".join(names)


func _owned_treasure_detail_text() -> String:
	if treasures.is_empty():
		return "暂无法宝。"
	var lines: Array[String] = []
	for treasure_id in treasures:
		if not TREASURE_LIBRARY.has(treasure_id):
			continue
		var treasure: Dictionary = TREASURE_LIBRARY[treasure_id]
		lines.append("%s｜%s｜%s" % [treasure["name"], treasure["desc"], _reward_growth_fit_text(treasure)])
	return "\n".join(lines)


func _owned_insight_detail_text() -> String:
	if insights.is_empty():
		return "暂无悟道。"
	var lines: Array[String] = []
	for insight_id in insights:
		if not INSIGHT_LIBRARY.has(insight_id):
			continue
		var insight: Dictionary = INSIGHT_LIBRARY[insight_id]
		lines.append("%s｜%s｜%s" % [insight["name"], insight["desc"], _reward_growth_fit_text(insight)])
	return "\n".join(lines)


func _owned_breakthrough_detail_text() -> String:
	if breakthroughs.is_empty():
		return "暂无破境。"
	var lines: Array[String] = []
	for breakthrough_id in breakthroughs:
		if not BREAKTHROUGH_LIBRARY.has(breakthrough_id):
			continue
		var breakthrough: Dictionary = BREAKTHROUGH_LIBRARY[breakthrough_id]
		lines.append("%s｜%s｜%s" % [breakthrough["name"], breakthrough["desc"], _reward_growth_fit_text(breakthrough)])
	return "\n".join(lines)


func _owned_consumable_detail_text() -> String:
	if consumables.is_empty():
		return "暂无消耗品。"
	var counts := {}
	for consumable_id in consumables:
		counts[consumable_id] = int(counts.get(consumable_id, 0)) + 1
	var ids := counts.keys()
	ids.sort()
	var lines: Array[String] = []
	for consumable_id in ids:
		if not CONSUMABLE_LIBRARY.has(str(consumable_id)):
			continue
		var consumable: Dictionary = CONSUMABLE_LIBRARY[str(consumable_id)]
		lines.append("%s x%d｜%s｜%s" % [consumable["name"], int(counts[consumable_id]), consumable["desc"], _reward_consumable_fit_text(consumable)])
	return "\n".join(lines)


func _insight_value(key: String) -> int:
	var total := 0
	for insight_id in insights:
		var insight: Dictionary = INSIGHT_LIBRARY[insight_id]
		total += int(insight.get(key, 0))
	return total


func _consumable_summary() -> String:
	if consumables.is_empty():
		return "消耗品：无"
	return "消耗品：" + _format_consumable_counts(consumables)


func _format_consumable_counts(items: Array[String]) -> String:
	var counts := {}
	for consumable_id in items:
		counts[consumable_id] = int(counts.get(consumable_id, 0)) + 1
	var keys := counts.keys()
	keys.sort()
	var names: Array[String] = []
	for consumable_id in keys:
		var consumable: Dictionary = CONSUMABLE_LIBRARY[str(consumable_id)]
		names.append(str(consumable["name"]) + " x" + str(counts[consumable_id]))
	return "、".join(names)


func _combat_consumable_options() -> Array[String]:
	var options: Array[String] = []
	for consumable_id in consumables:
		if not options.has(consumable_id):
			options.append(consumable_id)
	return options


func _number_shortcut_index(keycode: int) -> int:
	if keycode < KEY_1 or keycode > KEY_9:
		return -1
	return keycode - KEY_1


func _number_shortcut_label(index: int) -> String:
	if index < 0 or index >= 9:
		return ""
	return str(index + 1)


func _add_number_shortcut_hint(button: Button, index: int) -> void:
	var label := _number_shortcut_label(index)
	if label.is_empty():
		return
	button.text = "[" + label + "] " + button.text
	button.tooltip_text = "快捷键 " + label + "。\n" + button.tooltip_text


func _consumable_shortcut_keys() -> Array[int]:
	return [KEY_Q, KEY_W, KEY_E, KEY_R]


func _consumable_shortcut_label(index: int) -> String:
	var labels := ["Q", "W", "E", "R"]
	if index < 0 or index >= labels.size():
		return ""
	return labels[index]


func _consumable_button_text(consumable_id: String) -> String:
	var consumable: Dictionary = CONSUMABLE_LIBRARY[consumable_id]
	return str(consumable["name"]) + " x" + str(consumables.count(consumable_id))


func _remove_low_value_card() -> String:
	var removable: Array[String] = []
	for card_id in deck:
		if STARTING_DECK.has(card_id):
			removable.append(card_id)
	if removable.is_empty():
		removable.assign(deck)
	var removed: String = removable.pick_random()
	deck.erase(removed)
	return removed


func _removable_card_options() -> Array[String]:
	var seen := {}
	var options: Array[String] = []
	for card_id in deck:
		if seen.has(card_id):
			continue
		seen[card_id] = true
		options.append(card_id)
		if options.size() >= 3:
			break
	return options


func _upgradable_card_options() -> Array[String]:
	var seen := {}
	var options: Array[String] = []
	for card_id in deck:
		if _is_curse_card(card_id):
			continue
		if _card_upgrade_level(card_id) >= MAX_CARD_UPGRADE:
			continue
		if seen.has(card_id):
			continue
		seen[card_id] = true
		options.append(card_id)
		if options.size() >= 3:
			break
	return options


func _card_data(card_id: String) -> Dictionary:
	var base_id := _base_card_id(card_id)
	var data: Dictionary = CARD_LIBRARY[base_id].duplicate(true)
	if str(data.get("type", "")) == "curse":
		return data
	var upgrade_level := _card_upgrade_level(card_id)
	if upgrade_level <= 0:
		return data
	data["name"] = str(data["name"]) + "+"
	if data.has("damage"):
		data["damage"] = int(data["damage"]) + 4 * upgrade_level
	if data.has("block"):
		data["block"] = int(data["block"]) + 3 * upgrade_level
	if data.has("heal"):
		data["heal"] = int(data["heal"]) + 3 * upgrade_level
	if data.has("burn"):
		data["burn"] = int(data["burn"]) + upgrade_level
	if data.has("weak"):
		data["weak"] = int(data["weak"]) + upgrade_level
	if data.has("gain_edge"):
		data["gain_edge"] = int(data["gain_edge"]) + upgrade_level
	if data.has("cleanse_curse"):
		data["cleanse_curse"] = int(data["cleanse_curse"]) + upgrade_level
	if data.has("draw") and upgrade_level > 0 and int(data["cost"]) > 0:
		data["cost"] = max(0, int(data["cost"]) - 1)
	data["desc"] = _build_card_desc(data)
	return data


func _base_card_id(card_id: String) -> String:
	return card_id.split("+")[0]


func _card_upgrade_level(card_id: String) -> int:
	return card_id.count("+")


func _upgraded_card_id(card_id: String) -> String:
	if _card_upgrade_level(card_id) >= MAX_CARD_UPGRADE:
		return card_id
	return _base_card_id(card_id) + "+"


func _build_card_desc(card: Dictionary) -> String:
	var parts: Array[String] = []
	if card.has("self_damage"):
		parts.append("失去 " + str(card["self_damage"]) + " 点生命")
	if card.has("gain_edge"):
		parts.append("获得 " + str(card["gain_edge"]) + " 层剑势")
	if card.has("damage"):
		var text := "造成 " + str(card["damage"]) + " 点伤害"
		if int(card.get("hits", 1)) > 1:
			text += " x" + str(card["hits"])
		if card.has("flaw_bonus"):
			text += "，破绽额外 +" + str(card["flaw_bonus"])
		parts.append(text)
	if card.has("block"):
		parts.append("获得 " + str(card["block"]) + " 点护盾")
	if card.has("heal"):
		parts.append("恢复 " + str(card["heal"]) + " 点生命")
	if card.has("burn"):
		parts.append("施加 " + str(card["burn"]) + " 层燃烧")
	if card.has("weak"):
		parts.append("施加 " + str(card["weak"]) + " 层虚弱")
	if card.has("cleanse_player_weak"):
		parts.append("驱散 " + str(card["cleanse_player_weak"]) + " 层自身虚弱")
	if card.has("cleanse_curse"):
		parts.append("净除 " + str(card["cleanse_curse"]) + " 张心魔杂念")
	if card.has("gain_qi"):
		parts.append("获得 " + str(card["gain_qi"]) + " 点灵气")
	if card.has("draw"):
		parts.append("抽 " + str(card["draw"]) + " 张牌")
	if card.get("exhaust", false):
		parts.append("消耗")
	return "，".join(parts) + "。"


func _panel_style(bg: Color, border: Color, radius: int, border_width: int) -> StyleBoxFlat:
	return QinglanVisuals.panel(bg, border, radius, border_width)


func _card_type_name(type_id: String) -> String:
	match type_id:
		"attack":
			return "术法"
		"skill":
			return "法门"
		"curse":
			return "心魔"
		_:
			return type_id


func _load_texture_from_path(path: String) -> Texture2D:
	var texture := ResourceLoader.load(path) as Texture2D
	if texture == null:
		_log("图片素材读取失败：" + path)
		return null
	return texture


func _load_cached_texture(path: String) -> Texture2D:
	if path.is_empty():
		return null
	if texture_cache.has(path):
		return texture_cache[path]
	var texture := _load_texture_from_path(path)
	if texture != null:
		texture_cache[path] = texture
	return texture


func _preferred_art_path(data: Dictionary) -> String:
	var target_path := str(data.get("image2_target_art", ""))
	if not target_path.is_empty() and FileAccess.file_exists(target_path):
		return target_path
	return str(data.get("art", ""))
