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
		print("Smoke victory passed.")
		quit(0)
	else:
		push_error("Smoke victory failed with " + str(failures.size()) + " issue(s).")
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

	main.seed_override_text = "777001"
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "nightmare"
	main.current_win_streak = 2
	main.best_win_streak = max(main.best_win_streak, 2)
	var streak_before: int = main.current_win_streak
	main._start_run()
	await process_frame
	_choose_first_mandate()
	await process_frame
	_seed_other_origin_nightmare_records()
	var selected_mandate_id := str(main.trial_mandate_id)
	main.completed_trial_mandates.clear()
	for mandate_id in main.TRIAL_MANDATE_LIBRARY.keys():
		var mandate_key := str(mandate_id)
		if mandate_key != selected_mandate_id:
			main.completed_trial_mandates.append(mandate_key)
	main.trial_mandate_completed = true
	main._record_completed_trial_mandate(selected_mandate_id)
	_expect(main.completed_trial_mandates.size() == main.TRIAL_MANDATE_LIBRARY.size(), "smoke setup should complete all mandate records")
	_expect(main.in_map, "new run should enter map state")
	main.route_history.append("第1幕 青岚谷：烟测路线（测试）")
	_expect(main._run_recap_detail_text(true).contains("路线轨迹"), "run recap should include route history section")
	_expect(main._run_recap_detail_text(true).contains("构筑定位："), "run recap should include deck archetype section")
	_expect(main._run_recap_detail_text(true).contains("关键短板："), "run recap should include run diagnosis section")
	_expect(main._run_recap_detail_text(true).contains("路线计划："), "run recap should include next route plan section")
	_expect(main._run_recap_detail_text(true).contains("下局建议："), "victory recap should include next-run suggestion")

	for expected_act in range(3):
		_expect(main.current_act == expected_act, "run should be in expected act " + str(expected_act + 1))
		main.run_step = main.RUN_STEPS_TO_BOSS
		main._start_encounter(true, false)
		await process_frame
		_expect(not main.enemy.is_empty(), "boss encounter should create an enemy in act " + str(expected_act + 1))
		_win_current_encounter()
		await process_frame
		if expected_act < 2:
			_expect(main.in_reward, "non-final boss should enter breakthrough reward")
			_expect(main.reward_breakthroughs.size() > 0, "non-final boss should offer breakthroughs")
			var breakthrough_id := str(main.reward_breakthroughs[0])
			main._choose_breakthrough(breakthrough_id)
			await process_frame
			_expect(main.current_act == expected_act + 1, "choosing breakthrough should advance to next act")
			_expect(main.in_choice, "choosing breakthrough should enter interlude oath choice")
			_expect(main.choice_options.size() > 0, "interlude oath choice should offer options")
			_expect(main._choice_tags_text(main.choice_options[0]).contains("幕间誓约"), "interlude oath option should show oath tag")
			var oath_tags: String = main._choice_tags_text(main.choice_options[0])
			_expect(oath_tags.contains("新誓约") or oath_tags.contains("已收录"), "interlude oath option should show collection tag")
			main._apply_choice(main.choice_options[0])
			await process_frame
			_expect(main.interlude_oaths.size() == expected_act + 1, "choosing oath should record interlude oath")
			_expect(main.achievements.has("first_interlude_oath"), "choosing oath should unlock first interlude oath achievement")
			if expected_act == 0:
				for oath_id in main.INTERLUDE_OATH_LIBRARY.keys():
					main._record_completed_interlude_oath(str(oath_id))
				_expect(main.completed_challenges.has("all_interlude_oaths"), "recording every oath should complete all-oaths challenge")
			_expect(main.in_map, "choosing oath should return to map")
			_expect(main._journal_detail_text().contains("幕间誓约"), "journal should include interlude oath section")
		else:
			_expect(main.run_finished, "final boss should finish the run")
			_expect(not main.summary_box.visible == false, "victory should show summary box")
			_expect(main.victories >= 1, "victory should increment victories")
			_expect(main.current_win_streak == streak_before + 1, "victory should increment current win streak")
			_expect(main.best_win_streak >= main.current_win_streak, "victory should update best win streak")
			_expect(main._meta_progress_text().contains("连胜"), "meta progress should show win streak")
			_expect(main.run_history.size() > 0, "victory should record run history")
			_expect(main.run_endings_unlocked.size() > 0 or main.unlocked_endings.size() > 0, "victory should unlock or retain endings")
			_expect(main.completed_challenges.has("first_foundation"), "victory should complete first foundation challenge")
			_expect(main.completed_challenges.has("mandate_fulfilled"), "victory with a completed mandate should complete mandate challenge")
			_expect(main.completed_challenges.has("all_mandates_mastered"), "victory after all mandates should complete all-mandates challenge")
			_expect(main.completed_challenges.has("nightmare_foundation_trial"), "nightmare victory should complete nightmare challenge")
			_expect(main.completed_challenges.has("three_win_streak"), "third consecutive victory should complete win-streak challenge")
			_expect(main.achievements.has("first_flawless_win"), "flawless combat should unlock flawless achievement")
			_expect(main.flawless_wins >= 3, "three boss wins without hp loss should count flawless wins")
			_expect(main.completed_challenges.has("flawless_foundation"), "victory with three flawless wins should complete flawless challenge")
			_expect(main._run_score_detail_text(true).contains("完胜 +"), "run score detail should include flawless score")
			_expect(main.completed_challenges.has("double_oath_foundation"), "victory with two interlude oaths should complete double-oath challenge")
			_expect(main.completed_challenges.has("all_interlude_oaths"), "victory should retain all-oaths challenge")
			_expect(main._challenges_detail_text().contains("三连筑基"), "challenge detail should list win-streak challenge")
			_expect(main._challenges_detail_text().contains("无伤连破"), "challenge detail should list flawless challenge")
			_expect(main.completed_challenges.has("all_origin_nightmare"), "all origin nightmare records should complete five-origin nightmare challenge")
			_expect(main.completed_challenges.has("all_origin_grandmaster"), "all origin high-rank records should complete grandmaster challenge")
			_expect(main._nightmare_origin_count() == main.ORIGIN_LIBRARY.size(), "nightmare origin counter should include every origin")
			_expect(main._grandmaster_origin_count() == main.ORIGIN_LIBRARY.size(), "grandmaster origin counter should include every origin")
			var current_record: Dictionary = main.origin_records.get(main.selected_origin, {})
			_expect(str(current_record.get("best_rank", "")) != "", "origin record should store best rank")
			_expect(bool(current_record.get("high_rank_clear", false)), "origin record should store high-rank clear")
			_expect(main._origin_log_detail_text().contains("称号"), "origin log should include mastery titles")
			var latest_history: Dictionary = main.run_history[0]
			_expect(int(latest_history.get("win_streak", 0)) == main.current_win_streak, "victory history should record current win streak")
			_expect(int(latest_history.get("best_win_streak", 0)) == main.best_win_streak, "victory history should record best win streak")
			_expect(int(latest_history.get("flawless_wins", 0)) == main.flawless_wins, "victory history should record flawless wins")
			_expect(latest_history.has("new_challenges"), "victory history should record new challenges")
			_expect(str(latest_history.get("origin_title", "")).length() > 0, "victory history should record origin title")
			_expect(str(latest_history.get("deck_archetype", "")).length() > 0, "victory history should record deck archetype")
			_expect(str(latest_history.get("run_diagnosis", "")).length() > 0, "victory history should record run diagnosis")
			_expect(str(latest_history.get("route_plan", "")).length() > 0, "victory history should record route plan")
			_expect(str(latest_history.get("share_code", "")).contains("QLN|O=bamboo_sword|D=nightmare|S=777001"), "victory history should record share code")
			_expect(main._history_detail_text().contains("复盘码 QLN"), "history detail should show share code")
			_expect(main._legacy_best_history_text().contains("复盘码 QLN"), "legacy best history should show share code")
			_expect(main._history_detail_text().contains("定位："), "history detail should show deck archetype")
			_expect(main._history_detail_text().contains("短板："), "history detail should show run diagnosis")
			_expect(main._history_detail_text().contains("路线计划："), "history detail should show route plan")
			_expect(_snapshot_string_array(latest_history.get("route_history", [])).has("第1幕 青岚谷：烟测路线（测试）"), "victory history should record route history")
			_expect(str(latest_history.get("next_run_suggestion", "")).begins_with("下局建议："), "victory history should record next-run suggestion")
			_expect(not FileAccess.file_exists(main.RUN_SAVE_PATH), "victory should clear active run save")


func _seed_other_origin_nightmare_records() -> void:
	for origin_id in main.ORIGIN_LIBRARY.keys():
		var key := str(origin_id)
		if key == main.selected_origin:
			continue
		main.origin_records[key] = {
			"runs": 1,
			"clears": 1,
			"best_progress": main._total_progress_goal(),
			"best_battles": 3,
			"best_seed": 9000,
			"best_seed_progress": main._total_progress_goal(),
			"best_difficulty": "黑煞劫",
			"last_seed": 9000,
			"last_result": "通关",
			"clean_clear": true,
			"nightmare_clear": true,
			"high_rank_clear": true,
			"best_rank": "甲",
			"best_score": 360
		}


func _win_current_encounter() -> void:
	main.hand.clear()
	main.hand.append("iron_sword")
	main.qi = 1
	main.enemy_hp = 1
	main.enemy_block = 0
	main._play_card(0)


func _choose_first_mandate() -> void:
	for option in main.choice_options:
		var option_data: Dictionary = option
		if str(option_data.get("kind", "")) == "choose_mandate":
			main._apply_choice(option_data)
			return
	failures.append("mandate choice should include a choose_mandate option")


func _snapshot_string_array(value: Variant) -> Array[String]:
	var result: Array[String] = []
	if typeof(value) != TYPE_ARRAY:
		return result
	for item in value:
		result.append(str(item))
	return result


func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
