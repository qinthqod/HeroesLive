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
		print("Smoke defeat passed.")
		quit(0)
	else:
		push_error("Smoke defeat failed with " + str(failures.size()) + " issue(s).")
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

	var victories_before: int = main.victories
	var cultivation_before: int = main.cultivation_points
	var history_before: int = main.run_history.size()
	main.current_win_streak = 2
	main.best_win_streak = max(main.best_win_streak, 2)
	var best_streak_before: int = main.best_win_streak
	main.seed_override_text = "515151"
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "normal"
	main._start_run()
	await process_frame
	_choose_first_mandate()
	await process_frame
	_expect(main.in_map, "new run should enter map state")

	main._start_encounter(false, false)
	await process_frame
	_expect(not main.enemy.is_empty(), "normal encounter should create an enemy")
	_expect(main.hand.size() > 0, "normal encounter should draw a hand")

	main.player_hp = 1
	main.shield = 0
	main.player_weak = 0
	main.enemy["moves"] = [{"intent": "压测重击", "damage": 99}]
	main.enemy_move_index = 0
	main._end_turn()
	await process_frame

	_expect(main.run_finished, "lethal enemy turn should finish the run")
	_expect(main.summary_box.visible, "defeat should show summary box")
	_expect(not main.in_map and not main.in_reward and not main.in_choice, "defeat should clear active non-combat states")
	_expect(main.victories == victories_before, "defeat should not increment victories")
	_expect(main.current_win_streak == 0, "defeat should reset current win streak")
	_expect(main.best_win_streak == best_streak_before, "defeat should preserve best win streak")
	_expect(main.last_cultivation_gained > 0, "defeat should grant cultivation")
	_expect(main.cultivation_points > cultivation_before, "defeat should persist gained cultivation")
	_expect(main.run_endings_unlocked.is_empty(), "defeat should not unlock endings")
	_expect(main.run_challenges_completed.is_empty(), "defeat should not complete victory challenges")
	_expect(not FileAccess.file_exists(main.RUN_SAVE_PATH), "defeat should clear active run save")
	_expect(main.run_history.size() > 0, "defeat should record run history")
	_expect(main.run_history.size() >= min(history_before + 1, main.MAX_RUN_HISTORY), "defeat should append to recent run history")
	if main.run_history.size() > 0:
		var latest_history: Dictionary = main.run_history[0]
		_expect(str(latest_history.get("result", "")) == "试炼失败", "defeat history should record failure result")
		_expect(not bool(latest_history.get("victory", true)), "defeat history should mark victory=false")
		_expect(int(latest_history.get("win_streak", -1)) == 0, "defeat history should record reset win streak")
		_expect(int(latest_history.get("best_win_streak", 0)) == best_streak_before, "defeat history should record best win streak")
		_expect(int(latest_history.get("cultivation_gained", 0)) == main.last_cultivation_gained, "defeat history should record cultivation gained")
		_expect(str(latest_history.get("deck_archetype", "")).length() > 0, "defeat history should record deck archetype")
		_expect(str(latest_history.get("run_diagnosis", "")).length() > 0, "defeat history should record run diagnosis")
		_expect(str(latest_history.get("route_plan", "")).length() > 0, "defeat history should record route plan")
		_expect(str(latest_history.get("share_code", "")).contains("QLN|O=bamboo_sword|D=normal|S=515151"), "defeat history should record share code")
		_expect(main._history_detail_text().contains("复盘码 QLN"), "defeat history detail should show share code")
		_expect(main._run_recap_detail_text(false).contains("构筑定位："), "defeat recap should include deck archetype")
		_expect(main._run_recap_detail_text(false).contains("关键短板："), "defeat recap should include run diagnosis")
		_expect(main._run_recap_detail_text(false).contains("路线计划："), "defeat recap should include route plan")
		_expect(str(latest_history.get("next_run_suggestion", "")).begins_with("下局建议："), "defeat history should record next-run suggestion")
		_expect(main._run_recap_detail_text(false).contains("下局建议："), "defeat recap should include next-run suggestion")
		_expect(latest_history.has("new_endings"), "defeat history should record ending delta")
		_expect(latest_history.has("new_challenges"), "defeat history should record challenge delta")


func _choose_first_mandate() -> void:
	for option in main.choice_options:
		var option_data: Dictionary = option
		if str(option_data.get("kind", "")) == "choose_mandate":
			main._apply_choice(option_data)
			return
	failures.append("mandate choice should include a choose_mandate option")


func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
