extends SceneTree

const MAIN_SCENE := preload("res://scenes/Main.tscn")
const SAVE_FILES := ["qinglan_save.json", "qinglan_run.json"]

var failures: Array[String] = []
var saved_files := {}
var main: Node


func _init() -> void:
	_backup_user_files()
	await process_frame
	await _run_smoke()
	_restore_user_files()
	if failures.is_empty():
		print("Smoke flow passed.")
		quit(0)
	else:
		push_error("Smoke flow failed with " + str(failures.size()) + " issue(s).")
		for failure in failures:
			push_error("- " + failure)
		quit(1)


func _backup_user_files() -> void:
	for file_name in SAVE_FILES:
		var path: String = "user://" + file_name
		if FileAccess.file_exists(path):
			var file := FileAccess.open(path, FileAccess.READ)
			saved_files[file_name] = file.get_as_text() if file != null else ""
		else:
			saved_files[file_name] = null


func _restore_user_files() -> void:
	var user_dir := DirAccess.open("user://")
	for file_name in SAVE_FILES:
		var path: String = "user://" + file_name
		var content = saved_files.get(file_name)
		if content == null:
			if user_dir != null and FileAccess.file_exists(path):
				user_dir.remove(file_name)
		else:
			var file := FileAccess.open(path, FileAccess.WRITE)
			if file != null:
				file.store_string(str(content))


func _run_smoke() -> void:
	main = MAIN_SCENE.instantiate()
	root.add_child(main)
	await process_frame

	var daily: Dictionary = main._daily_challenge_data()
	_expect(main._daily_challenge_preview_text().contains("预告月相"), "daily challenge preview should show lunar omen preview")
	_expect(main._daily_challenge_preview_text().contains("今日追踪"), "daily challenge preview should show tracking focus")
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "normal"
	main._start_daily_challenge()
	await process_frame
	_expect(main.in_choice, "daily challenge should enter mandate choice state")
	_expect(not main.title_box.visible, "mandate choice should not reserve the title layout")
	_expect(not main.battlefield.visible, "mandate choice should hide the combat battlefield")
	_expect(main.choice_box.get_child_count() > 0, "mandate choice should render clickable options")
	_expect(str(main.top_bar.text).contains("幕 1/3"), "primary status should show act progress")
	_expect(not str(main.top_bar.text).contains("生命"), "primary status should not mix in combat resources")
	_expect(main.status_chip_box.get_child_count() >= 6, "illustrated status chips should show player resources")
	_expect(str(main.status_chip_labels["hp"]["label"].text).contains("/"), "life status chip should show current and maximum life")
	_expect(str(main.treasure_label.text).count("\n") == 0, "growth summary should stay on one compact line")
	_expect(main.run_seed == int(daily["seed"]), "daily challenge should use today's fixed seed")
	_expect(str(main.run_challenge_id) == str(daily["id"]), "daily challenge should set challenge id")
	_expect(main.choice_options.size() > 0, "daily challenge should offer mandate choices")
	var daily_snapshot: Dictionary = main._load_run_snapshot()
	_expect(str(daily_snapshot.get("run_challenge_id", "")) == str(daily["id"]), "daily challenge snapshot should store challenge id")
	_expect(str(daily_snapshot.get("mode", "")) == "mandate_choice", "daily challenge snapshot should store mandate choice mode")
	_expect(str(daily_snapshot.get("lunar_omen_id", "")) != "", "daily challenge snapshot should store lunar omen")
	_expect(str(daily_snapshot.get("active_bounty_id", "")) != "", "daily challenge snapshot should store active bounty")
	main._restore_run_snapshot(daily_snapshot)
	await process_frame
	_expect(main.in_choice, "restored mandate snapshot should return to mandate choice state")
	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should choose first mandate")
	await process_frame
	_expect(main.in_map, "number shortcut mandate choice should enter map state")
	_expect(not main.battlefield.visible, "map should hide the combat battlefield")
	_expect(main.map_box.get_child_count() > 0, "map should render clickable route nodes")
	_expect(main.map_context_label.visible, "map context label should be visible on map")
	_expect(str(main.map_context_label.text).contains("路线研判"), "map context should summarize route decision")
	_expect(str(main.map_context_label.text).contains("优先"), "map context should recommend a route")
	_expect(str(main.map_context_label.text).contains("当前待办"), "map context should include current focus")
	main._apply_responsive_layout(900.0)
	_expect(main.reward_box.columns == 2, "narrow layout should use two reward columns")
	_expect(main.root_box.offset_left == 12.0, "narrow layout should reduce side margins")
	_expect(main.choice_scene_art.custom_minimum_size.x <= 876.0, "narrow layout should keep choice art inside the viewport")
	main._apply_responsive_layout(1280.0)
	_expect(main.reward_box.columns == 5, "wide layout should show the full reward row without wrapping primary actions")

	main._show_title()
	await process_frame
	_expect(main._has_saved_run(), "title should have a saved daily run before abandon")
	_expect(main._settings_detail_text().contains("当前试炼存档："), "settings should summarize saved run state")
	_expect(main._settings_detail_text().contains("今日试炼"), "settings should include saved challenge name")
	_expect(main._settings_detail_text().contains("主界面日志"), "settings should include log density preference")
	_expect(main._settings_detail_text().contains("手牌布局"), "settings should include hand layout preference")
	_expect(main._image2_art_status_text().contains("已生成记录"), "art status should summarize generated Image-2 assets")
	_expect(main._image2_art_status_text().contains("下一批优先级"), "art status should show planned Image-2 queue")
	_expect(main._image2_art_status_text().contains("缺失目标文件"), "art status should show missing Image-2 target files")
	_expect(main._image2_art_status_text().contains("生成尝试日志"), "art status should show Image-2 generation attempt log")
	_expect(main._image2_art_status_text().contains("最近阻碍"), "art status should summarize the latest Image-2 import blocker")
	_expect(main._image2_art_status_text().contains("坊市背景自动显示"), "art status should show market background drop-in state")
	_expect(main._image2_art_status_text().contains("雷池背景自动显示"), "art status should show thunder pool background drop-in state")
	_expect(main._image2_map_node_art_state_text("thunder_pool") == "背景：Image-2 专属图", "thunder pool should use the imported production background")
	_expect(main._image2_art_status_text().contains("路线节点图鉴"), "art status should mention map-node background state")
	main._show_title_detail("art_status")
	await process_frame
	_expect(main.active_title_panel == "art_status", "title should open Image-2 art status panel")
	var extended_log_before: bool = main.show_extended_log
	main._toggle_log_density()
	_expect(main.show_extended_log != extended_log_before, "log density toggle should change preference")
	_expect(main._settings_detail_text().contains("最近 10 条"), "settings should show detailed log density")
	main._toggle_log_density()
	var compact_before: bool = main.use_compact_hand
	var standard_card_size: Vector2 = main._card_button_size(false)
	main._toggle_compact_hand()
	_expect(main.use_compact_hand != compact_before, "compact hand toggle should change preference")
	_expect(main._settings_detail_text().contains("紧凑"), "settings should show compact hand layout")
	_expect(main._card_button_size(false).x < standard_card_size.x, "compact hand should reduce hand card width")
	main._toggle_compact_hand()
	main._abandon_saved_run()
	await process_frame
	_expect(not main._has_saved_run(), "abandon saved run should clear only active run save")
	_expect(main._settings_detail_text().contains("没有未完成试炼"), "settings should show no active run after abandon")
	_expect(main._card_tooltip_text("iron_sword+", true).contains("已精研 +1"), "upgraded card tooltip should show upgrade level")
	_expect(main._card_tooltip_text("soul_guard", true).contains("素材：Image-2 专属图"), "imported Image-2 card tooltip should show dedicated art state")
	_expect(main._image2_card_art_state_text("iron_sword") == "素材：首批图", "first-batch card art should be identified")
	_expect(main._image2_card_art_state_text("soul_guard") == "素材：Image-2 专属图", "imported card art should be identified")
	_expect(main._codex_cards_text().contains("精研："), "codex should document card upgrade rules")
	_expect(main._codex_cards_text().contains("素材：Image-2 专属图"), "card codex should show dedicated Image-2 art state")
	_expect(main._codex_cards_text().contains("素材：复用图"), "card codex should show reused art state")
	_expect(main._codex_cards_text().contains("雷洗清符"), "codex should include late-game cleanse card")
	_expect(main._codex_cards_text().contains("灵髓回涌"), "codex should include mid-game qi recovery card")
	_expect(main._codex_cards_text().contains("余烬剑雨"), "codex should include late-game burn multi-hit card")
	_expect(main._codex_treasures_text().contains("定位："), "treasure codex should show strategic role")
	_expect(main._codex_treasures_text().contains("起手灵气"), "treasure codex should tag first-turn qi")
	_expect(main._codex_treasures_text().contains("首攻增伤"), "treasure codex should tag first attack bonus")
	_expect(main._codex_treasures_text().contains("首法门抽牌"), "treasure codex should tag first skill draw")
	_expect(main._codex_treasures_text().contains("坊市折扣"), "treasure codex should tag market discounts")
	_expect(main._choice_tags_text({"kind": "cave_forbidden"}).contains("高风险"), "choice tags should identify risky event choices")
	_expect(main._choice_tags_text({"kind": "rest_meditate"}).contains("精研"), "choice tags should identify upgrade choices")
	var tagged_choice: Button = main._make_choice_button("试选", "描述", Color.WHITE, main._choice_tags_text({"kind": "market_work"}))
	_expect(str(tagged_choice.text).contains("标签："), "choice button body should include decision tags")
	tagged_choice.free()
	main.in_title = false
	main.in_map = true
	main.spirit_stones = 99
	main._show_market_choices()
	await process_frame
	_expect(main.in_choice, "market should enter choice state")
	_expect(main.choice_art_path == main.MARKET_BACKGROUND_TARGET_PATH, "market choice should carry Image-2 background target path")
	_expect(str(main._load_run_snapshot().get("choice_art_path", "")) == main.MARKET_BACKGROUND_TARGET_PATH, "market snapshot should store choice background path")
	if not FileAccess.file_exists(main.MARKET_BACKGROUND_TARGET_PATH):
		_expect(main.choice_scene_art.texture != null, "missing market background should use a real fallback art texture")
	main._finish_choice_node()
	await process_frame
	_expect(main.choice_art_path.is_empty(), "finished choice node should clear choice background path")
	main._show_spirit_rift_choices()
	await process_frame
	_expect(main.choice_art_path == main.SPIRIT_RIFT_BACKGROUND_TARGET_PATH, "spirit rift choice should carry Image-2 background target path")
	main._finish_choice_node()
	await process_frame
	main._show_secret_realm_choices()
	await process_frame
	_expect(main.choice_art_path == main.SECRET_REALM_BACKGROUND_TARGET_PATH, "secret realm choice should carry Image-2 background target path")
	main._finish_choice_node()
	await process_frame
	main._show_soul_shrine_choices()
	await process_frame
	_expect(main.choice_art_path == main.SOUL_SHRINE_BACKGROUND_TARGET_PATH, "soul shrine choice should carry Image-2 background target path")
	main._finish_choice_node()
	await process_frame
	main._show_dark_forge_choices()
	await process_frame
	_expect(main.choice_art_path == main.DARK_FORGE_BACKGROUND_TARGET_PATH, "dark forge choice should carry Image-2 background target path")
	main._finish_choice_node()
	await process_frame
	main._show_thunder_pool_choices()
	await process_frame
	_expect(main.choice_art_path == main.THUNDER_POOL_BACKGROUND_TARGET_PATH, "thunder pool choice should carry Image-2 background target path")
	main._finish_choice_node()
	await process_frame
	main._show_title()
	await process_frame
	_expect(main._codex_insights_text().contains("标签："), "insight codex should show effect tags")
	_expect(main._codex_insights_text().contains("明镜照魔"), "insight codex should include start-of-combat cleanse insight")
	_expect(main._codex_breakthroughs_text().contains("倾向："), "breakthrough codex should show tone")
	_expect(main._codex_consumables_text().contains("定位："), "consumable codex should show strategic role")
	_expect(main._codex_cards_text().contains("星火贯月"), "codex should include late-game route cards")
	_expect(main._codex_enemies_text().contains("威胁："), "enemy codex should show threat tags")
	_expect(main._codex_enemies_text().contains("应对："), "enemy codex should show counter advice")
	_expect(main._codex_enemies_text().contains("素材：Image-2 专属图"), "enemy codex should show dedicated Image-2 art state")
	_expect(main._codex_enemies_text().contains("素材：复用图"), "enemy codex should show reused enemy art state")
	_expect(main._codex_enemies_text().contains("雾竹巡山妖"), "enemy codex should include new first-act route enemy")
	_expect(main._codex_enemies_text().contains("雷火判官"), "enemy codex should include late-game elite enemy")
	_expect(main._codex_enemies_text().contains("玄阴引路鬼"), "enemy codex should include second-act route enemy")
	_expect(main._codex_enemies_text().contains("雷池守阵者"), "enemy codex should include late-game guardian elite")
	_expect(main._codex_detail_text().contains("【悬赏令】"), "codex should include bounty reference section")
	_expect(main._codex_trial_mandates_text().contains("破煞签"), "codex should document trial mandates")
	_expect(main._codex_bounties_text().contains("巡山悬赏"), "codex should document rolling bounties")
	_expect(main._codex_run_marks_text().contains("月井倒影"), "codex should document run marks")
	_expect(main._codex_detail_text().contains("【幕间誓约】"), "codex should include interlude oath reference section")
	_expect(main._codex_interlude_oaths_text().contains("月誓守心"), "codex should document interlude oaths")
	_expect(main._codex_interlude_oaths_text().contains("星卷誓"), "codex should document upgrade interlude oath")
	_expect(main._codex_interlude_oaths_text().contains("明镜问心"), "codex should document insight interlude oath")
	main.deck.clear()
	main.deck.append("iron_sword")
	main.deck.append("body_ward")
	_expect(str(main._interlude_oath_preview_pieces("star_scroll_oath")).contains("随机精研"), "upgrade oath preview should explain random upgrades")
	_expect(main._choice_tags_text({"kind": "choose_interlude_oath", "oath_id": "mirror_insight_oath"}).contains("悟道"), "insight oath tags should include insight route")
	_expect(main._codex_interlude_oaths_text().contains("未收录"), "codex should show missing interlude oath collection state")
	main.completed_interlude_oaths.append("moon_guard_oath")
	_expect(main._codex_interlude_oaths_text().contains("已收录"), "codex should show mastered interlude oath collection state")
	main.completed_interlude_oaths.clear()
	_expect(main._codex_detail_text().contains("【路线节点】"), "codex should include map node reference section")
	_expect(main._codex_map_nodes_text().contains("洗雷池"), "codex should document late-game map nodes")
	_expect(main._codex_map_nodes_text().contains("主动加压换奖励"), "map node codex should explain duel trial role")
	_expect(main._codex_map_nodes_text().contains("背景：Image-2 专属图"), "map node codex should show imported production background state")
	_expect(main._codex_treasures_text().contains("百宝绳"), "treasure codex should include consumable-route treasure")
	_expect(main._codex_breakthroughs_text().contains("百炼行囊"), "breakthrough codex should include consumable-route breakthrough")
	_expect(main._rules_detail_text().contains("【读局面】"), "rules detail should explain board-reading helpers")
	_expect(main._rules_detail_text().contains("奖励决策摘要"), "rules detail should mention reward decision summary")
	_expect(main._keywords_detail_text().contains("路线研判"), "keywords should document route analysis")
	_expect(main._keywords_detail_text().contains("评阶"), "keywords should document run rank")
	_expect(main._keywords_detail_text().contains("连胜"), "keywords should document win streak")
	_expect(main._keywords_detail_text().contains("完胜破阵"), "keywords should document flawless wins")
	_expect(main._keywords_detail_text().contains("紧凑手牌"), "keywords should document compact hand setting")
	_expect(main._keywords_detail_text().contains("幕间誓约"), "keywords should document interlude oaths")
	_expect(main._quickstart_detail_text().contains("三步开局"), "quickstart should explain first-run setup")
	_expect(main._quickstart_detail_text().contains("第一幕路线"), "quickstart should explain first-act route choices")
	_expect(main._quickstart_detail_text().contains("expected_filename"), "quickstart should mention Image-2 batch filenames")
	main._show_title_detail("quickstart")
	await process_frame
	_expect(main.active_title_panel == "quickstart", "title should open quickstart panel")
	_expect(main._guide_detail_text().contains("补强优先级"), "guide detail should mention deck improvement priorities")
	_expect(main._guide_detail_text().contains("行动计划"), "guide detail should mention combat action plan")
	_expect(main._achievements_detail_text().contains("建议："), "achievement detail should include next-step hints")
	_expect(main._achievements_detail_text().contains("雷云立誓"), "achievement detail should include interlude oath achievement")
	_expect(main._challenges_detail_text().contains("缺口："), "challenge detail should include missing mandate progress")
	_expect(main._challenges_detail_text().contains("流派通关"), "challenge detail should include origin progress")
	_expect(main._challenges_detail_text().contains("双誓筑基"), "challenge detail should include double-oath challenge")
	_expect(main._challenges_detail_text().contains("诸誓归云"), "challenge detail should include all-oaths challenge")
	_expect(main._challenges_detail_text().contains("幕间誓约卷"), "challenge detail should include oath mastery progress")
	_expect(main._meta_progress_text().contains("誓约"), "meta progress should include oath mastery count")
	_expect(main._meta_progress_text().contains("誓约卷缺口"), "meta progress should list missing interlude oaths")
	_expect(main._endings_detail_text().contains("建议："), "ending detail should include unlock hints")
	_expect(main._endings_detail_text().contains("通关：0/1"), "ending detail should include origin ending progress")
	_expect(main._starting_run_preview_text().contains("流派打法"), "starting preview should include origin plan")
	_expect(main._starting_run_preview_text().contains("劫数备战"), "starting preview should include difficulty prep")
	_expect(main._deck_analysis_text(main.deck).contains("补强优先级"), "deck analysis should include improvement priorities")
	main.selected_origin = "demon_tempered"
	main.selected_difficulty = "nightmare"
	main.seed_override_text = "QLN|O=thunder_roamer|D=hard|S=909090"
	main.show_decision_hints = false
	main._start_recommended_run()
	await process_frame
	_expect(main.in_choice, "recommended start should enter mandate choice")
	_expect(main.selected_origin == "bamboo_sword", "recommended start should use bamboo sword origin")
	_expect(main.selected_difficulty == "normal", "recommended start should use normal difficulty")
	_expect(main.seed_override_text.is_empty(), "recommended start should clear seed/share-code override")
	_expect(main.show_decision_hints, "recommended start should enable decision hints")
	main._show_title()
	await process_frame
	main._abandon_saved_run()
	await process_frame
	_expect(main._handle_shortcut_key(KEY_P), "P shortcut should start a quick battle from title")
	await process_frame
	_expect(main._is_in_combat(), "quick battle should enter a standard combat")
	_expect(main.selected_origin == "bamboo_sword", "quick battle should use bamboo sword origin")
	_expect(main.selected_difficulty == "normal", "quick battle should use normal difficulty")
	_expect(main.run_seed == 424242, "quick battle should use a deterministic validation seed")
	_expect(not main.trial_mandate_id.is_empty(), "quick battle should select a trial mandate")
	_expect(main.hand.size() > 0, "quick battle should draw an opening hand")
	_expect(main.enemy_art.visible, "quick battle should show enemy art")
	_expect(main.battlefield.visible, "quick battle should show the battlefield")
	_expect(main._is_short_screen(720.0), "720p combat should use the short-screen layout")
	var short_screen_card_size: Vector2 = main._card_button_size(false, 720.0)
	_expect(short_screen_card_size.y <= 170.0, "short-screen combat should keep hand cards within the polished compact-height budget")
	_expect(short_screen_card_size.y >= 170.0, "short-screen combat should preserve enough card height for readable rules text")
	_expect(main.hand[2] == "body_ward", "quick battle should keep a deterministic third-card defense play")
	_expect(str(main.status_bar.text).contains("回合 1"), "combat status should show the current turn")
	_expect(main._recommended_hand_card_index() == 2, "quick battle should recommend the third-card defense play")
	_expect(main._combat_card_recommendation_reason("body_ward").contains("穿盾"), "defense recommendation should explain incoming shield break")
	_expect(main._coach_tip_text().contains("护体灵光"), "combat coach should name the recommended card")
	var recommended_hand_buttons := 0
	for child in main.hand_box.get_children():
		if child is Button and str(child.text).begins_with("荐 "):
			recommended_hand_buttons += 1
	_expect(recommended_hand_buttons == 1, "combat hand should show exactly one recommendation badge")
	var quick_battle_hp: int = main.player_hp
	var quick_battle_shield: int = main.shield
	_expect(main._handle_shortcut_key(KEY_3), "quick battle should play the third hand card")
	await process_frame
	_expect(main.shield == quick_battle_shield + 6, "quick battle defense card should add six shield")
	_expect(main.qi == main.max_qi - 1, "quick battle defense card should spend one qi")
	_expect(main._recommended_hand_card_index() >= 0, "combat recommendation should recalculate after a card is played")
	_expect(str(main.hand[main._recommended_hand_card_index()]) != "body_ward", "played defense card should not remain recommended")
	_expect(main._handle_shortcut_key(KEY_SPACE), "quick battle should end the first turn")
	await process_frame
	_expect(main.combat_turn == 2, "quick battle should advance to turn two")
	_expect(main.player_hp == quick_battle_hp, "quick battle opening defense should fully absorb the first enemy attack")
	_expect(main.shield == 0, "new player turn should clear prior-turn shield")
	_expect(str(main.status_bar.text).contains("回合 2"), "combat status should update after enemy action")
	main._show_title()
	await process_frame
	main._abandon_saved_run()
	await process_frame
	main.seed_override_text = "QLN|O=thunder_roamer|D=hard|S=909090|M=new_moon|T=elite_hunt|B=battle_patrol"
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "normal"
	main._apply_share_code_from_seed_input()
	_expect(main.selected_origin == "thunder_roamer", "share code should apply origin")
	_expect(main.selected_difficulty == "hard", "share code should apply difficulty")
	_expect(main.seed_override_text == "909090", "share code should normalize seed input")
	_expect(main._parse_seed_text("QLN|O=bamboo_sword|D=normal|S=424242") == 424242, "seed parser should read QLN share codes")
	main.seed_override_text = "424242"
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "normal"
	_expect(main._handle_shortcut_key(KEY_ENTER), "Enter shortcut should start a normal run from title")
	await process_frame
	_expect(main.in_choice, "new run should enter mandate choice state")
	_expect(str(main.run_challenge_id) == "", "normal run should clear challenge id")
	var first_mandate_options := _mandate_choice_ids()
	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should choose normal mandate")
	await process_frame
	_expect(main.in_map, "choosing normal mandate should enter map state")
	_expect(main.pending_nodes.size() > 0, "new run should roll map nodes")
	_expect(main.coach_tip_label.visible, "coach tip should be visible on map when hints are enabled")
	_expect(str(main.coach_tip_label.text).contains("路线研判"), "map coach tip should mention route analysis")
	main._toggle_decision_hints()
	_expect(not main.coach_tip_label.visible, "coach tip should hide when decision hints are disabled")
	main._toggle_decision_hints()
	_expect(main.coach_tip_label.visible, "coach tip should return when decision hints are enabled")
	_expect(main._run_share_code_text().contains("QLN|O=bamboo_sword|D=normal|S=424242"), "run share code should include origin difficulty and seed")
	_expect(str(main.lunar_omen_id) != "", "new run should assign a lunar omen")
	_expect(main._current_run_objective_text().contains("月相"), "current run objective should include lunar omen")
	_expect(main._codex_lunar_omens_text().contains("新月潜行"), "codex should document lunar omens")
	_expect(str(main.active_bounty_id) != "", "new run should assign an active bounty")
	_expect(main._current_run_objective_text().contains("悬赏"), "current run objective should include bounty")
	_expect(main._journal_detail_text().contains("悬赏令"), "journal should include bounty detail")
	_expect(main._journal_detail_text().contains("复盘码：QLN"), "journal should include run share code")
	_expect(main._journal_detail_text().contains("当前待办"), "journal should include current run focus")
	_expect(main._journal_detail_text().contains("完胜破阵"), "journal should include flawless win progress")
	_expect(main._journal_detail_text().contains("【渡劫准备】"), "journal should include boss prep checklist")
	_expect(main._boss_prep_checklist_text().contains("血线"), "boss prep checklist should include hp readiness")
	_expect(main._boss_prep_checklist_text().contains("小物"), "boss prep checklist should include consumable readiness")
	var hp_before_prep_check: int = main.player_hp
	var consumables_before_prep_check: Array[String] = main.consumables.duplicate()
	main.player_hp = 10
	main.consumables.clear()
	_expect(main._boss_prep_text().contains("血线危"), "boss prep summary should flag dangerous hp")
	main.player_hp = hp_before_prep_check
	main.consumables.clear()
	for consumable_id in consumables_before_prep_check:
		main.consumables.append(consumable_id)
	_expect(main._journal_detail_text().contains("【评阶预估】"), "journal should include rank projection section")
	_expect(main._journal_detail_text().contains("提分方向"), "rank projection should include improvement advice")
	_expect(main._current_run_focus_text().contains("试炼签"), "run focus should include mandate progress")
	_expect(main._current_run_focus_text().contains("悬赏"), "run focus should include bounty progress")
	var first_map_nodes := _map_node_types()
	var map_snapshot: Dictionary = main._load_run_snapshot()
	_expect(str(map_snapshot.get("share_code", "")).contains("QLN|O=bamboo_sword|D=normal|S=424242"), "run snapshot should store share code")
	_expect(main._saved_run_summary_text().contains("复盘码 QLN"), "saved run summary should show share code")

	main._show_title()
	await process_frame
	main.seed_override_text = "424242"
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "normal"
	_expect(main._handle_shortcut_key(KEY_ENTER), "Enter shortcut should start a replay run from title")
	await process_frame
	_expect(str(_mandate_choice_ids()) == str(first_mandate_options), "same seed should reproduce mandate choices")
	_choose_first_mandate()
	await process_frame
	_expect(str(_map_node_types()) == str(first_map_nodes), "same seed should reproduce opening map nodes")
	_expect(main._handle_shortcut_key(KEY_J), "J shortcut should open journal view during run")
	await process_frame
	_expect(str(main.active_pile_view) == "journal", "J shortcut should select journal view")
	_expect(main._handle_shortcut_key(KEY_ESCAPE), "Esc shortcut should close pile view")
	await process_frame
	_expect(str(main.active_pile_view) == "", "Esc shortcut should clear active pile view")

	var route_node := {"type": "event", "title": "废弃洞府", "desc": "测试路线轨迹。"}
	main._resolve_map_node(route_node)
	await process_frame
	_expect(main.in_choice, "cave event should enter choice state")
	_expect(str(main.coach_tip_label.text).contains("选项标签"), "choice coach tip should mention option tags")
	_expect(main.choice_options.size() == 3, "cave event should expose three options")
	_expect(main.route_history.size() == 1, "resolving map node should record route history")
	_expect(main._route_history_text().contains("废弃洞府"), "route history text should include chosen node")

	var choice_snapshot: Dictionary = main._load_run_snapshot()
	_expect(str(choice_snapshot.get("mode", "")) == "choice", "choice state should save mode=choice")
	_expect(choice_snapshot.has("choice_options"), "choice snapshot should store choice_options")
	_expect(_snapshot_string_array(choice_snapshot.get("route_history", [])).size() == 1, "choice snapshot should store route history")

	main._restore_run_snapshot(choice_snapshot)
	await process_frame
	_expect(main.in_choice, "restored choice snapshot should return to choice state")
	_expect(main.choice_options.size() == 3, "restored choice snapshot should keep options")
	_expect(main._route_history_text().contains("废弃洞府"), "restored choice snapshot should keep route history")

	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should choose first event option")
	await process_frame
	_expect(main.in_map, "number shortcut event choice should return to map")
	_expect(main.run_step == 1, "number shortcut event choice should advance run_step")
	main._start_encounter(false, false)
	await process_frame
	_expect(main._is_in_combat(), "manual encounter should enter combat")
	_expect(str(main.coach_tip_label.text).contains("敌人"), "combat coach tip should mention enemy action")
	main.enemy_hp = 1
	main.enemy_block = 0
	main.hand.clear()
	main.hand.append("iron_sword")
	main.qi = 1
	main._play_card(0)
	await process_frame
	_expect(main.in_reward, "winning manual encounter should enter reward")
	_expect(str(main.coach_tip_label.text).contains("奖励"), "reward coach tip should mention rewards")
	main._skip_reward()
	await process_frame
	_expect(main.in_map, "skipping reward should return to map")

	main._show_secret_realm_choices()
	await process_frame
	_expect(main.in_choice, "secret realm should enter choice state")
	_expect(main.choice_options.size() == 3, "secret realm should expose three options")
	var max_hp_before_realm: int = main.max_hp
	var deck_size_before_realm: int = main.deck.size()
	_expect(main._handle_shortcut_key(KEY_2), "number shortcut should choose second secret realm option")
	await process_frame
	_expect(main.in_map, "finishing secret realm should return to map")
	_expect(main.max_hp > max_hp_before_realm, "moonwell realm choice should increase max hp")
	_expect(main.deck.size() == deck_size_before_realm + 1, "moonwell realm choice should add a curse card")
	_expect(main.run_marks.has("moonwell_reflection"), "moonwell realm choice should add a run mark")
	_expect(main._journal_detail_text().contains("本局印记"), "journal should include run marks")
	_expect(main._run_recap_detail_text(false).contains("月井倒影"), "run recap should include run mark names")
	var mark_snapshot: Dictionary = main._load_run_snapshot()
	_expect(_snapshot_string_array(mark_snapshot.get("run_marks", [])).has("moonwell_reflection"), "map snapshot should store run marks")

	main._show_duel_trial_choices()
	await process_frame
	_expect(main.in_choice, "duel trial should enter choice state")
	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should choose first duel trial option")
	await process_frame
	_expect(main.in_map, "choosing duel trial should return to map")
	_expect(not main.next_duel_trial.is_empty(), "duel trial should set next combat modifier")
	var duel_snapshot: Dictionary = main._load_run_snapshot()
	_expect(duel_snapshot.has("next_duel_trial"), "duel trial snapshot should store modifier")

	main.lunar_omen_id = "new_moon"
	main._gain_insight("mirror_mind")
	main._start_encounter(false, false)
	await process_frame
	_expect(not main.enemy.is_empty(), "normal encounter should create an enemy")
	_expect(not main.deck.has("inner_demon"), "start-of-combat cleanse insight should remove deck curse")
	_expect(main.hand.size() >= 6, "new moon lunar omen should draw an extra opening card")
	_expect(main._intent_text().contains("下一式："), "intent text should preview next enemy move")
	_expect(main._enemy_advice_text().contains("下一式："), "enemy advice should preview next enemy move")
	_expect(main._enemy_advice_text().contains("行动计划："), "enemy advice should include a concise action plan")
	_expect(main.enemy_advice_label.tooltip_text.contains("素材："), "enemy advice tooltip should include enemy art state")
	var combat_snapshot: Dictionary = main._load_run_snapshot()
	_expect(str(combat_snapshot.get("mode", "")) == "combat", "combat start should save mode=combat")
	_expect(str(combat_snapshot.get("lunar_omen_id", "")) == "new_moon", "combat snapshot should store lunar omen")
	_expect(not combat_snapshot.get("enemy", {}).is_empty(), "combat snapshot should store enemy")
	_expect(_load_string_count(combat_snapshot.get("hand", [])) > 0, "combat snapshot should store hand")
	main.hand.clear()
	main.hand.append("body_ward")
	main.qi = 1
	main._play_card(0)
	await process_frame
	var card_snapshot: Dictionary = main._load_run_snapshot()
	_expect(str(card_snapshot.get("mode", "")) == "combat", "playing a nonlethal card should keep combat snapshot")
	_expect(int(card_snapshot.get("shield", 0)) > 0, "combat snapshot should store shield after playing block")
	_expect(_snapshot_string_array(card_snapshot.get("discard_pile", [])).has("body_ward"), "combat snapshot should store discard pile")
	main._restore_run_snapshot(card_snapshot)
	await process_frame
	_expect(not main.in_map and not main.in_choice and not main.in_reward, "restored combat should not enter non-combat states")
	_expect(not main.enemy.is_empty(), "restored combat should keep enemy")
	_expect(main.shield > 0, "restored combat should keep shield")
	_expect(main.discard_pile.has("body_ward"), "restored combat should keep discard pile")
	main.consumables.clear()
	main.consumables.append("spirit_draught")
	var qi_before_consumable: int = main.qi
	_expect(main._handle_shortcut_key(KEY_Q), "Q shortcut should use first consumable")
	await process_frame
	_expect(not main.consumables.has("spirit_draught"), "Q shortcut should consume first item")
	_expect(main.qi > qi_before_consumable, "Q shortcut should apply consumable effect")
	main.treasures.append("hundred_pouch_cord")
	main.player_hp = max(1, main.player_hp - 20)
	main.consumables.append("mending_pill")
	var hp_before_bonus_consumable: int = main.player_hp
	main._use_consumable("mending_pill")
	await process_frame
	_expect(main.player_hp == min(main.max_hp, hp_before_bonus_consumable + 13), "consumable-route treasure should increase consumable values")
	_expect(main._run_route_tags_text().contains("消耗品爆发"), "run route tags should recognize consumable route bonuses")
	var consumables_before_arsenal: int = main.consumables.size()
	main._gain_breakthrough("traveling_arsenal")
	_expect(main.consumables.size() == consumables_before_arsenal + 2, "consumable-route breakthrough should grant two consumables")
	_expect(main._consumable_bonus_value() >= 2, "consumable-route growth bonuses should stack")
	_expect(main._owned_treasure_detail_text().contains("契合："), "owned treasure detail should include fit text")
	_expect(main._owned_breakthrough_detail_text().contains("契合："), "owned breakthrough detail should include fit text")
	_expect(main._owned_consumable_detail_text().contains("契合："), "owned consumable detail should include fit text")
	var hints_before: bool = main.show_decision_hints
	_expect(main._handle_shortcut_key(KEY_H), "H shortcut should toggle decision hints")
	await process_frame
	_expect(main.show_decision_hints != hints_before, "H shortcut should change decision hint state")
	_expect(main._handle_shortcut_key(KEY_ESCAPE), "Esc shortcut should save combat and return to title")
	await process_frame
	_expect(main.in_title, "Esc during combat should return to title")
	_expect(main._has_saved_run(), "Esc during combat should keep active run save")
	main._continue_saved_run()
	await process_frame
	_expect(not main.in_map and not main.in_choice and not main.in_reward, "continuing after combat Esc should restore combat")
	_expect(main.discard_pile.has("body_ward"), "continuing after combat Esc should keep combat piles")

	main.hand.clear()
	main.hand.append("iron_sword")
	main.qi = 1
	_expect(main._handle_shortcut_key(KEY_D), "D shortcut should open deck view during combat")
	_expect(str(main.active_pile_view) == "deck", "D shortcut should select deck view")
	_expect(main._handle_shortcut_key(KEY_ESCAPE), "Esc shortcut should close deck view")
	main.hand.clear()
	main.hand.append("body_ward")
	main.qi = 1
	var before_turn: int = main.combat_turn
	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should play first hand card")
	await process_frame
	_expect(main.hand.is_empty(), "number shortcut should remove played card from hand")
	main._handle_shortcut_key(KEY_SPACE)
	await process_frame
	_expect(main.combat_turn > before_turn, "Space shortcut should end turn and start next player turn")
	main.hand.clear()
	main.hand.append("iron_sword")
	main.qi = 1
	main.enemy_hp = 1
	main.enemy_block = 0
	main.active_bounty_id = "battle_patrol"
	main.active_bounty_progress = 1
	var bounties_before_win: int = main.completed_bounty_count
	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should play lethal first hand card")
	await process_frame
	_expect(main.in_reward, "winning a normal encounter should enter reward state")
	_expect(main.next_duel_trial.is_empty(), "winning duel-modified combat should clear modifier")
	_expect(main.completed_bounty_count == bounties_before_win + 1, "winning should complete battle bounty")
	_expect(str(main.active_bounty_id) != "", "completed bounty should roll an active bounty")
	_expect(main.active_bounty_progress == 0, "new active bounty should reset progress")
	_expect(main.spirit_stones >= 10, "completed bounty should grant stones")
	_expect(main.reward_cards.size() > 0, "reward state should offer card rewards")
	_expect(main.reward_context_label.visible, "reward context label should be visible in reward state")
	_expect(str(main.reward_context_label.text).contains("奖励决策"), "reward context should summarize reward decision")
	_expect(str(main.reward_context_label.text).contains("重掷"), "reward context should include reroll guidance")
	var reward_has_recommendation := false
	var reward_has_recommended_badge := false
	for child in main.reward_box.get_children():
		if child is Button:
			if str(child.tooltip_text).contains("推荐度："):
				reward_has_recommendation = true
			if str(child.text).contains("荐"):
				reward_has_recommended_badge = true
	_expect(reward_has_recommendation, "reward buttons should show recommendation level")
	_expect(reward_has_recommended_badge, "one reward button should show recommended badge")

	var reward_snapshot: Dictionary = main._load_run_snapshot()
	_expect(str(reward_snapshot.get("mode", "")) == "reward", "reward state should save mode=reward")
	_expect(int(reward_snapshot.get("completed_bounty_count", 0)) >= bounties_before_win + 1, "reward snapshot should store completed bounty count")
	_expect(_snapshot_string_array(reward_snapshot.get("run_marks", [])).has("moonwell_reflection"), "reward snapshot should keep run marks")

	var shortcut_reward_card: String = main.reward_cards[0]
	_expect(main._handle_shortcut_key(KEY_1), "number shortcut should choose first reward card")
	await process_frame
	_expect(main.in_map, "number shortcut reward choice should return to map")
	_expect(main.deck.has(shortcut_reward_card), "number shortcut reward choice should add selected card")
	_expect(main.run_step >= 2, "choosing reward should preserve advanced run progress")


func _choose_first_mandate() -> void:
	for option in main.choice_options:
		var option_data: Dictionary = option
		if str(option_data.get("kind", "")) == "choose_mandate":
			main._apply_choice(option_data)
			return
	failures.append("mandate choice should include a choose_mandate option")


func _mandate_choice_ids() -> Array[String]:
	var ids: Array[String] = []
	for option in main.choice_options:
		var option_data: Dictionary = option
		if str(option_data.get("kind", "")) == "choose_mandate":
			ids.append(str(option_data.get("mandate_id", "")))
	return ids


func _map_node_types() -> Array[String]:
	var types: Array[String] = []
	for node in main.pending_nodes:
		var node_data: Dictionary = node
		types.append(str(node_data.get("type", "")))
	return types


func _snapshot_string_array(value: Variant) -> Array[String]:
	var result: Array[String] = []
	if typeof(value) != TYPE_ARRAY:
		return result
	for item in value:
		result.append(str(item))
	return result


func _load_string_count(value: Variant) -> int:
	return _snapshot_string_array(value).size()


func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
