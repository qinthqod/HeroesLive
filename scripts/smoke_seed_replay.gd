extends SceneTree

const MAIN_SCENE := preload("res://scenes/Main.tscn")
const SAVE_FILES := ["qinglan_save.json", "qinglan_run.json"]

var failures: Array[String] = []
var saved_files := {}


func _init() -> void:
	_backup_user_files()
	await process_frame
	await _run_smoke()
	_restore_user_files()
	if failures.is_empty():
		print("Smoke seed replay passed.")
		quit(0)
	else:
		push_error("Smoke seed replay failed with " + str(failures.size()) + " issue(s).")
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
	var first := await _seed_replay_sample()
	var second := await _seed_replay_sample()
	_expect(str(first.get("mandates", [])) == str(second.get("mandates", [])), "same seed should replay mandate choices")
	_expect(str(first.get("lunar_omen", "")) == str(second.get("lunar_omen", "")), "same seed should replay lunar omen")
	_expect(str(first.get("map_nodes", [])) == str(second.get("map_nodes", [])), "same seed should replay opening map nodes")
	_expect(str(first.get("enemy", "")) == str(second.get("enemy", "")), "same seed should replay first encounter")
	_expect(str(first.get("opening_hand", [])) == str(second.get("opening_hand", [])), "same seed should replay opening hand")
	_expect(str(first.get("reward_cards", [])) == str(second.get("reward_cards", [])), "same seed should replay card rewards")
	_expect(str(first.get("reward_treasures", [])) == str(second.get("reward_treasures", [])), "same seed should replay treasure rewards")
	_expect(str(first.get("reward_consumables", [])) == str(second.get("reward_consumables", [])), "same seed should replay consumable rewards")
	_expect(str(first.get("reward_insights", [])) == str(second.get("reward_insights", [])), "same seed should replay insight rewards")


func _seed_replay_sample() -> Dictionary:
	var main = MAIN_SCENE.instantiate()
	root.add_child(main)
	await process_frame

	main.seed_override_text = "909090"
	main.selected_origin = "bamboo_sword"
	main.selected_difficulty = "normal"
	main._start_run()
	await process_frame
	var mandate_ids := _mandate_choice_ids(main)
	_choose_first_mandate(main)
	await process_frame
	var map_nodes := _map_node_types(main)
	main._start_encounter(false, false)
	await process_frame
	var enemy_name := str(main.enemy.get("name", ""))
	var opening_hand: Array[String] = main.hand.duplicate()
	main.hand.clear()
	main.hand.append("iron_sword")
	main.qi = 1
	main.enemy_hp = 1
	main.enemy_block = 0
	main._play_card(0)
	await process_frame
	var sample := {
		"mandates": mandate_ids,
		"lunar_omen": str(main.lunar_omen_id),
		"map_nodes": map_nodes,
		"enemy": enemy_name,
		"opening_hand": opening_hand,
		"reward_cards": main.reward_cards.duplicate(),
		"reward_treasures": main.reward_treasures.duplicate(),
		"reward_consumables": main.reward_consumables.duplicate(),
		"reward_insights": main.reward_insights.duplicate()
	}
	main.queue_free()
	await process_frame
	return sample


func _choose_first_mandate(main: Node) -> void:
	for option in main.choice_options:
		var option_data: Dictionary = option
		if str(option_data.get("kind", "")) == "choose_mandate":
			main._apply_choice(option_data)
			return
	failures.append("mandate choice should include a choose_mandate option")


func _mandate_choice_ids(main: Node) -> Array[String]:
	var ids: Array[String] = []
	for option in main.choice_options:
		var option_data: Dictionary = option
		if str(option_data.get("kind", "")) == "choose_mandate":
			ids.append(str(option_data.get("mandate_id", "")))
	return ids


func _map_node_types(main: Node) -> Array[String]:
	var types: Array[String] = []
	for node in main.pending_nodes:
		var node_data: Dictionary = node
		types.append(str(node_data.get("type", "")))
	return types


func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)
