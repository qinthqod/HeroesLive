extends SceneTree

const MainScript = preload("res://scripts/Main.gd")

var failures: Array[String] = []


func _init() -> void:
	_check_all()
	if failures.is_empty():
		print("Integrity check passed.")
		quit(0)
	else:
		push_error("Integrity check failed with " + str(failures.size()) + " issue(s).")
		for failure in failures:
			push_error("- " + failure)
		quit(1)


func _check_all() -> void:
	_check_visual_assets()
	_check_image2_manifest()
	_check_card_library()
	_check_meta_unlocks()
	_check_origins()
	_check_enemy_groups()
	_check_map_nodes()
	_check_growth_libraries()
	_check_consumables()
	_check_trials()
	_check_bounties()
	_check_lunar_omens()
	_check_run_marks()
	_check_interlude_oaths()
	_check_challenges()
	_check_balance_safety()


func _fail(message: String) -> void:
	failures.append(message)


func _check_required(data: Dictionary, id: String, library_name: String, keys: Array[String]) -> void:
	for key in keys:
		if not data.has(key):
			_fail("%s '%s' missing key '%s'." % [library_name, id, key])


func _check_visual_assets() -> void:
	_check_art_asset("card back", "deck", MainScript.CARD_BACK_PATH, 2, 3)
	_check_ui_font()


func _check_ui_font() -> void:
	if not FileAccess.file_exists(MainScript.UI_FONT_PATH):
		_fail("UI font is missing: " + MainScript.UI_FONT_PATH)
		return
	var font := ResourceLoader.load(MainScript.UI_FONT_PATH) as Font
	if font == null:
		_fail("UI font cannot be loaded: " + MainScript.UI_FONT_PATH)
		return
	for character in "青岚夜行试炼筑基灵气护盾剑势心魔":
		if not font.has_char(character.unicode_at(0)):
			_fail("UI font is missing required glyph: " + character)


func _check_art_asset(library_name: String, id: String, path: String, expected_width_ratio: int = 0, expected_height_ratio: int = 0) -> void:
	if path.is_empty():
		_fail("%s '%s' has empty art path." % [library_name, id])
		return
	if not FileAccess.file_exists(path):
		_fail("%s '%s' art path missing: %s." % [library_name, id, path])
		return
	var texture := ResourceLoader.load(path) as Texture2D
	if texture == null:
		_fail("%s '%s' art cannot be loaded as a texture: %s." % [library_name, id, path])
		return
	var image := texture.get_image()
	if image == null:
		_fail("%s '%s' art texture has no image data: %s." % [library_name, id, path])
		return
	if image.get_width() <= 0 or image.get_height() <= 0:
		_fail("%s '%s' art has invalid dimensions: %s." % [library_name, id, path])
		return
	if expected_width_ratio > 0 and expected_height_ratio > 0:
		var expected := float(expected_width_ratio) / float(expected_height_ratio)
		var actual := float(image.get_width()) / float(image.get_height())
		if abs(actual - expected) > 0.08:
			_fail("%s '%s' art aspect ratio %.2f does not match expected %d:%d." % [library_name, id, actual, expected_width_ratio, expected_height_ratio])


func _check_image2_manifest() -> void:
	var path := "res://docs/image2_asset_manifest.json"
	if not FileAccess.file_exists(path):
		_fail("Image-2 asset manifest is missing: " + path)
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("Image-2 asset manifest cannot be opened: " + path)
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		_fail("Image-2 asset manifest must be a JSON object.")
		return
	_check_required(parsed, "image2_manifest", "Image-2 manifest", ["schema_version", "style_anchor", "generated_assets", "planned_assets"])
	if str(parsed.get("style_anchor", "")).is_empty():
		_fail("Image-2 asset manifest has an empty style anchor.")
	var generated: Variant = parsed.get("generated_assets", [])
	var planned: Variant = parsed.get("planned_assets", [])
	if typeof(generated) != TYPE_ARRAY or generated.size() < 10:
		_fail("Image-2 asset manifest needs at least 10 generated asset records.")
	if typeof(planned) != TYPE_ARRAY or planned.size() < 5:
		_fail("Image-2 asset manifest needs at least 5 planned asset prompts.")
	if typeof(generated) == TYPE_ARRAY:
		for item in generated:
			if typeof(item) == TYPE_DICTIONARY:
				_check_image2_asset_record(item, true)
			else:
				_fail("Image-2 generated asset record must be an object.")
	if typeof(planned) == TYPE_ARRAY:
		for item in planned:
			if typeof(item) == TYPE_DICTIONARY:
				_check_image2_asset_record(item, false)
			else:
				_fail("Image-2 planned asset record must be an object.")
		_check_image2_generation_queue(planned)
		_check_image2_batch_prompts(planned)
		_check_image2_generation_attempts(planned)


func _check_image2_asset_record(record: Dictionary, generated: bool) -> void:
	_check_required(record, str(record.get("id", "unknown")), "Image-2 asset record", ["id", "kind", "name"])
	if generated:
		_check_required(record, str(record.get("id", "unknown")), "Image-2 generated asset", ["path", "status", "prompt_focus"])
		var path := str(record.get("path", ""))
		if not path.is_empty():
			_check_art_asset("Image-2 generated asset", str(record.get("id", "unknown")), path, 0, 0)
	else:
		_check_required(record, str(record.get("id", "unknown")), "Image-2 planned asset", ["priority", "target_path", "prompt"])
		var target_path := str(record.get("target_path", ""))
		var prompt := str(record.get("prompt", ""))
		for required_phrase in ["Use case:", "Asset type:", "Primary request:", "Avoid:"]:
			if not prompt.contains(required_phrase):
				_fail("Image-2 planned asset '%s' prompt missing '%s'." % [str(record.get("id", "unknown")), required_phrase])
		if record.has("card_id") and MainScript.CARD_LIBRARY.has(str(record["card_id"])):
			var card: Dictionary = MainScript.CARD_LIBRARY[str(record["card_id"])]
			if str(card.get("image2_target_art", "")) != target_path:
				_fail("Image-2 planned asset '%s' target path is not wired to card '%s'." % [str(record.get("id", "unknown")), str(record["card_id"])])
		if record.has("enemy_name"):
			var enemy := _enemy_record(str(record["enemy_name"]))
			if not enemy.is_empty() and str(enemy.get("image2_target_art", "")) != target_path:
				_fail("Image-2 planned asset '%s' target path is not wired to enemy '%s'." % [str(record.get("id", "unknown")), str(record["enemy_name"])])
		if str(record.get("kind", "")) == "event_background":
			if not record.has("node_type"):
				_fail("Image-2 planned event background '%s' missing node_type." % str(record.get("id", "unknown")))
			else:
				var expected_background_path := _background_target_for_node_type(str(record["node_type"]))
				if expected_background_path.is_empty():
					_fail("Image-2 planned event background '%s' has unsupported node_type '%s'." % [str(record.get("id", "unknown")), str(record["node_type"])])
				elif target_path != expected_background_path:
					_fail("Image-2 planned event background '%s' target path is not wired to node '%s'." % [str(record.get("id", "unknown")), str(record["node_type"])])
			if FileAccess.file_exists(target_path):
				_check_art_asset("Image-2 event background", str(record.get("id", "unknown")), target_path, 16, 9)
	if record.has("card_id") and not MainScript.CARD_LIBRARY.has(str(record["card_id"])):
		_fail("Image-2 asset '%s' references missing card '%s'." % [str(record.get("id", "unknown")), str(record["card_id"])])
	if record.has("enemy_name") and not _enemy_name_exists(str(record["enemy_name"])):
		_fail("Image-2 asset '%s' references missing enemy '%s'." % [str(record.get("id", "unknown")), str(record["enemy_name"])])


func _background_target_for_node_type(node_type: String) -> String:
	match node_type:
		"spirit_rift":
			return MainScript.SPIRIT_RIFT_BACKGROUND_TARGET_PATH
		"secret_realm":
			return MainScript.SECRET_REALM_BACKGROUND_TARGET_PATH
		"soul_shrine":
			return MainScript.SOUL_SHRINE_BACKGROUND_TARGET_PATH
		"dark_forge":
			return MainScript.DARK_FORGE_BACKGROUND_TARGET_PATH
		"thunder_pool":
			return MainScript.THUNDER_POOL_BACKGROUND_TARGET_PATH
		"market":
			return MainScript.MARKET_BACKGROUND_TARGET_PATH
		_:
			return ""


func _check_image2_generation_queue(planned: Array) -> void:
	var path := "res://docs/image2_generation_queue.md"
	if not FileAccess.file_exists(path):
		_fail("Image-2 generation queue is missing: " + path)
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("Image-2 generation queue cannot be opened: " + path)
		return
	var content := file.get_as_text()
	if not content.contains("Image-2 Generation Queue"):
		_fail("Image-2 generation queue missing title.")
	for record in planned:
		if typeof(record) != TYPE_DICTIONARY:
			continue
		for key in ["id", "target_path"]:
			var value := str(record.get(key, ""))
			if not value.is_empty() and not content.contains(value):
				_fail("Image-2 generation queue missing %s '%s'." % [key, value])


func _check_image2_batch_prompts(planned: Array) -> void:
	var path := MainScript.IMAGE2_BATCH_PROMPTS_PATH
	if not FileAccess.file_exists(path):
		_fail("Image-2 batch prompts file is missing: " + path)
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("Image-2 batch prompts file cannot be opened: " + path)
		return
	var lines := file.get_as_text().split("\n", false)
	var expected_ids: Array[String] = []
	for record in planned:
		if typeof(record) == TYPE_DICTIONARY:
			expected_ids.append(str(record.get("id", "")))
	if lines.size() != expected_ids.size():
		_fail("Image-2 batch prompts line count %d does not match planned asset count %d." % [lines.size(), expected_ids.size()])
	var seen_ids: Array[String] = []
	for raw_line in lines:
		var line := str(raw_line).strip_edges()
		if line.is_empty():
			continue
		var parsed = JSON.parse_string(line)
		if typeof(parsed) != TYPE_DICTIONARY:
			_fail("Image-2 batch prompts line is not a JSON object.")
			continue
		for key in ["id", "kind", "priority", "target_path", "expected_filename", "aspect_ratio", "prompt"]:
			if not parsed.has(key):
				_fail("Image-2 batch prompt '%s' missing key '%s'." % [str(parsed.get("id", "unknown")), key])
		var id := str(parsed.get("id", ""))
		seen_ids.append(id)
		if not expected_ids.has(id):
			_fail("Image-2 batch prompts include unexpected id '%s'." % id)
		if str(parsed.get("expected_filename", "")) != id + ".png":
			_fail("Image-2 batch prompt '%s' has unexpected expected_filename." % id)
		if not ["2:3", "16:9"].has(str(parsed.get("aspect_ratio", ""))):
			_fail("Image-2 batch prompt '%s' has unsupported aspect ratio." % id)
	for id in expected_ids:
		if not seen_ids.has(id):
			_fail("Image-2 batch prompts missing id '%s'." % id)


func _check_image2_generation_attempts(planned: Array) -> void:
	var path := MainScript.IMAGE2_ATTEMPTS_PATH
	if not FileAccess.file_exists(path):
		_fail("Image-2 generation attempts log is missing: " + path)
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_fail("Image-2 generation attempts log cannot be opened: " + path)
		return
	var content := file.get_as_text()
	if not content.contains("Image-2 Generation Attempts"):
		_fail("Image-2 generation attempts log missing title.")
	if not content.contains("## "):
		_fail("Image-2 generation attempts log needs at least one dated attempt.")
	var planned_ids: Array[String] = []
	for record in planned:
		if typeof(record) == TYPE_DICTIONARY:
			planned_ids.append(str(record.get("id", "")))
	if planned_ids.has("card_soul_guard") and not content.contains("card_soul_guard"):
		_fail("Image-2 generation attempts log should mention the current high-priority card_soul_guard attempt.")
	if planned_ids.has("card_soul_guard") and not (content.contains("no import performed") or content.contains("未取得可导入源文件路径")):
		_fail("Image-2 generation attempts log should record why card_soul_guard has not been imported yet.")


func _enemy_name_exists(enemy_name: String) -> bool:
	return not _enemy_record(enemy_name).is_empty()


func _enemy_record(enemy_name: String) -> Dictionary:
	for group in [MainScript.ENCOUNTERS, MainScript.SECOND_ACT_ENCOUNTERS, MainScript.THIRD_ACT_ENCOUNTERS, MainScript.ELITE_ENCOUNTERS, MainScript.SECOND_ACT_ELITE_ENCOUNTERS, MainScript.THIRD_ACT_ELITE_ENCOUNTERS]:
		for enemy in group:
			if str(enemy.get("name", "")) == enemy_name:
				return enemy
	for boss in [MainScript.BOSS_ENCOUNTER, MainScript.SECOND_BOSS_ENCOUNTER, MainScript.THIRD_BOSS_ENCOUNTER]:
		if str(boss.get("name", "")) == enemy_name:
			return boss
	return {}


func _check_card_library() -> void:
	for card_id in MainScript.CARD_LIBRARY.keys():
		var card: Dictionary = MainScript.CARD_LIBRARY[card_id]
		_check_required(card, str(card_id), "card", ["name", "type", "cost", "desc", "rarity"])
		if str(card.get("type", "")) != "curse" and not card.has("art"):
			_fail("card '%s' is playable but has no art path." % card_id)
		if not MainScript.RARITY_COLORS.has(str(card.get("rarity", ""))):
			_fail("card '%s' has unknown rarity '%s'." % [card_id, str(card.get("rarity", ""))])
		if not ["attack", "skill", "curse"].has(str(card.get("type", ""))):
			_fail("card '%s' has unknown type '%s'." % [card_id, str(card.get("type", ""))])
		if int(card.get("cost", -1)) < 0:
			_fail("card '%s' has negative or missing cost." % card_id)
		if card.has("art"):
			_check_art_asset("card", str(card_id), str(card["art"]), 2, 3)
		_check_optional_image2_target("card", str(card_id), card)
		for numeric_key in ["damage", "block", "heal", "draw", "burn", "weak", "hits", "gain_qi", "gain_edge", "cleanse_curse", "cleanse_player_weak", "self_damage"]:
			if card.has(numeric_key) and int(card[numeric_key]) < 0:
				_fail("card '%s' has negative '%s'." % [card_id, numeric_key])
	for card_id in MainScript.STARTING_DECK:
		if not MainScript.CARD_LIBRARY.has(str(card_id)):
			_fail("STARTING_DECK references missing card '%s'." % str(card_id))


func _check_meta_unlocks() -> void:
	var last_points := -1
	for unlock in MainScript.META_UNLOCKS:
		var unlock_data: Dictionary = unlock
		_check_required(unlock_data, str(unlock_data.get("name", "unknown")), "meta unlock", ["points", "card_id", "name"])
		if int(unlock_data.get("points", 0)) <= last_points:
			_fail("META_UNLOCKS points are not strictly increasing at '%s'." % str(unlock_data.get("name", "unknown")))
		last_points = int(unlock_data.get("points", 0))
		if not MainScript.CARD_LIBRARY.has(str(unlock_data.get("card_id", ""))):
			_fail("META_UNLOCKS references missing card '%s'." % str(unlock_data.get("card_id", "")))


func _check_origins() -> void:
	for origin_id in MainScript.ORIGIN_LIBRARY.keys():
		var origin: Dictionary = MainScript.ORIGIN_LIBRARY[origin_id]
		_check_required(origin, str(origin_id), "origin", ["name", "desc", "deck", "tone"])
		for card_id in origin.get("deck", []):
			if not MainScript.CARD_LIBRARY.has(str(card_id)):
				_fail("origin '%s' references missing card '%s'." % [origin_id, str(card_id)])
		if origin.has("start_consumable") and not MainScript.CONSUMABLE_LIBRARY.has(str(origin["start_consumable"])):
			_fail("origin '%s' references missing consumable '%s'." % [origin_id, str(origin["start_consumable"])])


func _check_enemy_groups() -> void:
	for group in [
		["ENCOUNTERS", MainScript.ENCOUNTERS],
		["SECOND_ACT_ENCOUNTERS", MainScript.SECOND_ACT_ENCOUNTERS],
		["THIRD_ACT_ENCOUNTERS", MainScript.THIRD_ACT_ENCOUNTERS],
		["ELITE_ENCOUNTERS", MainScript.ELITE_ENCOUNTERS],
		["SECOND_ACT_ELITE_ENCOUNTERS", MainScript.SECOND_ACT_ELITE_ENCOUNTERS],
		["THIRD_ACT_ELITE_ENCOUNTERS", MainScript.THIRD_ACT_ELITE_ENCOUNTERS],
		["BOSS_ENCOUNTER", [MainScript.BOSS_ENCOUNTER]],
		["SECOND_BOSS_ENCOUNTER", [MainScript.SECOND_BOSS_ENCOUNTER]],
		["THIRD_BOSS_ENCOUNTER", [MainScript.THIRD_BOSS_ENCOUNTER]]
	]:
		_check_enemy_group(str(group[0]), group[1])


func _check_enemy_group(group_name: String, enemies: Array) -> void:
	if enemies.is_empty():
		_fail(group_name + " is empty.")
	for enemy in enemies:
		var enemy_data: Dictionary = enemy
		_check_required(enemy_data, str(enemy_data.get("name", "unknown")), group_name, ["name", "max_hp", "moves"])
		if not enemy_data.has("art"):
			_fail("%s enemy '%s' has no art path." % [group_name, str(enemy_data.get("name", "unknown"))])
		if int(enemy_data.get("max_hp", 0)) <= 0:
			_fail("%s enemy '%s' has invalid max_hp." % [group_name, str(enemy_data.get("name", "unknown"))])
		if enemy_data.has("art"):
			_check_art_asset(group_name + " enemy", str(enemy_data.get("name", "unknown")), str(enemy_data["art"]), 2, 3)
		_check_optional_image2_target(group_name + " enemy", str(enemy_data.get("name", "unknown")), enemy_data)
		var moves: Array = enemy_data.get("moves", [])
		if moves.is_empty():
			_fail("%s enemy '%s' has no moves." % [group_name, str(enemy_data.get("name", "unknown"))])
		for move in moves:
			_check_enemy_move(group_name, str(enemy_data.get("name", "unknown")), move)


func _check_enemy_move(group_name: String, enemy_name: String, move: Dictionary) -> void:
	if not move.has("intent"):
		_fail("%s enemy '%s' has a move without intent." % [group_name, enemy_name])
	if not (move.has("damage") or move.has("block") or move.has("player_weak") or move.has("add_status")):
		_fail("%s enemy '%s' move '%s' has no effect." % [group_name, enemy_name, str(move.get("intent", "unknown"))])
	if move.has("add_status") and not MainScript.CARD_LIBRARY.has(str(move["add_status"])):
		_fail("%s enemy '%s' move '%s' adds missing card '%s'." % [group_name, enemy_name, str(move.get("intent", "unknown")), str(move["add_status"])])
	if move.has("status_to") and not ["draw", "hand", "discard"].has(str(move["status_to"])):
		_fail("%s enemy '%s' move '%s' has invalid status_to '%s'." % [group_name, enemy_name, str(move.get("intent", "unknown")), str(move["status_to"])])
	for numeric_key in ["damage", "block", "hits", "player_weak", "status_amount"]:
		if move.has(numeric_key) and int(move[numeric_key]) <= 0:
			_fail("%s enemy '%s' move '%s' has invalid '%s'." % [group_name, enemy_name, str(move.get("intent", "unknown")), numeric_key])


func _check_optional_image2_target(library_name: String, id: String, data: Dictionary) -> void:
	if not data.has("image2_target_art"):
		return
	var target_path := str(data.get("image2_target_art", ""))
	if target_path.is_empty():
		_fail("%s '%s' has empty Image-2 target art path." % [library_name, id])
		return
	if not target_path.begins_with("res://assets/") or not target_path.ends_with(".png"):
		_fail("%s '%s' Image-2 target art path must be an assets PNG: %s." % [library_name, id, target_path])
	if FileAccess.file_exists(target_path):
		_check_art_asset(library_name + " Image-2 target", id, target_path, 2, 3)


func _check_map_nodes() -> void:
	var allowed_types := {
		"battle": true,
		"elite": true,
		"event": true,
		"herb_event": true,
		"spirit_rift": true,
		"secret_realm": true,
		"duel_trial": true,
		"market": true,
		"rest": true,
		"training": true,
		"soul_shrine": true,
		"dark_forge": true,
		"thunder_pool": true
	}
	for group in [
		["MAP_NODE_LIBRARY", MainScript.MAP_NODE_LIBRARY],
		["SECOND_ACT_MAP_NODE_LIBRARY", MainScript.SECOND_ACT_MAP_NODE_LIBRARY],
		["THIRD_ACT_MAP_NODE_LIBRARY", MainScript.THIRD_ACT_MAP_NODE_LIBRARY]
	]:
		for node in group[1]:
			var node_data: Dictionary = node
			_check_required(node_data, str(node_data.get("title", "unknown")), str(group[0]), ["type", "title", "desc"])
			if not allowed_types.has(str(node_data.get("type", ""))):
				_fail("%s node '%s' has unsupported type '%s'." % [str(group[0]), str(node_data.get("title", "unknown")), str(node_data.get("type", ""))])


func _check_growth_libraries() -> void:
	for treasure_id in MainScript.TREASURE_LIBRARY.keys():
		var treasure: Dictionary = MainScript.TREASURE_LIBRARY[treasure_id]
		_check_required(treasure, str(treasure_id), "treasure", ["name", "desc", "tone"])
		_check_growth_effect_keys("treasure", str(treasure_id), treasure)
	for insight_id in MainScript.INSIGHT_LIBRARY.keys():
		var insight: Dictionary = MainScript.INSIGHT_LIBRARY[insight_id]
		_check_required(insight, str(insight_id), "insight", ["name", "desc", "tone"])
		_check_growth_effect_keys("insight", str(insight_id), insight)
	for breakthrough_id in MainScript.BREAKTHROUGH_LIBRARY.keys():
		var breakthrough: Dictionary = MainScript.BREAKTHROUGH_LIBRARY[breakthrough_id]
		_check_required(breakthrough, str(breakthrough_id), "breakthrough", ["name", "desc", "tone"])
		_check_growth_effect_keys("breakthrough", str(breakthrough_id), breakthrough)


func _check_consumables() -> void:
	for consumable_id in MainScript.CONSUMABLE_LIBRARY.keys():
		var consumable: Dictionary = MainScript.CONSUMABLE_LIBRARY[consumable_id]
		_check_required(consumable, str(consumable_id), "consumable", ["name", "desc", "tone"])
		_check_growth_effect_keys("consumable", str(consumable_id), consumable)
		var has_effect := false
		for effect_key in ["heal", "gain_qi", "block", "damage", "cleanse_player_weak", "draw", "gain_edge"]:
			if consumable.has(effect_key):
				has_effect = true
				if int(consumable[effect_key]) <= 0:
					_fail("consumable '%s' has invalid '%s'." % [consumable_id, effect_key])
		if not has_effect:
			_fail("consumable '%s' has no effect." % consumable_id)


func _check_growth_effect_keys(library_name: String, id: String, data: Dictionary) -> void:
	for key in data.keys():
		var key_text := str(key)
		if ["name", "desc", "tone"].has(key_text):
			continue
		if not MainScript.GROWTH_EFFECT_TAGS.has(key_text):
			_fail("%s '%s' has unknown growth effect key '%s'." % [library_name, id, key_text])
			continue
		if key_text == "gain_consumable":
			_check_gain_consumable_value(library_name, id, data[key])
		elif int(data[key]) <= 0:
			_fail("%s '%s' has invalid growth effect '%s'." % [library_name, id, key_text])


func _check_gain_consumable_value(library_name: String, id: String, value) -> void:
	if typeof(value) == TYPE_STRING:
		if not MainScript.CONSUMABLE_LIBRARY.has(str(value)):
			_fail("%s '%s' references missing consumable '%s'." % [library_name, id, str(value)])
	elif int(value) <= 0:
		_fail("%s '%s' has invalid growth effect 'gain_consumable'." % [library_name, id])


func _check_trials() -> void:
	for mandate_id in MainScript.TRIAL_MANDATE_LIBRARY.keys():
		var mandate: Dictionary = MainScript.TRIAL_MANDATE_LIBRARY[mandate_id]
		_check_required(mandate, str(mandate_id), "trial mandate", ["name", "desc", "kind", "target", "reward"])
		if not ["elite", "spirit_stones", "upgrade", "cleanse"].has(str(mandate.get("kind", ""))):
			_fail("trial mandate '%s' has unknown kind '%s'." % [mandate_id, str(mandate.get("kind", ""))])
		if int(mandate.get("target", 0)) <= 0:
			_fail("trial mandate '%s' has invalid target." % mandate_id)


func _check_bounties() -> void:
	for bounty_id in MainScript.BOUNTY_LIBRARY.keys():
		var bounty: Dictionary = MainScript.BOUNTY_LIBRARY[bounty_id]
		_check_required(bounty, str(bounty_id), "bounty", ["name", "desc", "kind", "target", "reward"])
		if not ["battle", "elite", "upgrade", "cleanse", "gain_treasure", "buy_consumable"].has(str(bounty.get("kind", ""))):
			_fail("bounty '%s' has unknown kind '%s'." % [bounty_id, str(bounty.get("kind", ""))])
		if int(bounty.get("target", 0)) <= 0:
			_fail("bounty '%s' has invalid target." % bounty_id)


func _check_lunar_omens() -> void:
	if MainScript.LUNAR_OMEN_LIBRARY.size() < 4:
		_fail("LUNAR_OMEN_LIBRARY has too few omens.")
	for omen_id in MainScript.LUNAR_OMEN_LIBRARY.keys():
		var omen: Dictionary = MainScript.LUNAR_OMEN_LIBRARY[omen_id]
		_check_required(omen, str(omen_id), "lunar omen", ["name", "desc", "tone"])
		var has_effect := false
		for effect_key in ["first_turn_draw", "first_turn_qi", "start_block", "enemy_damage_bonus", "enemy_hp_bonus", "battle_stones", "reroll_discount"]:
			if omen.has(effect_key):
				has_effect = true
				if int(omen[effect_key]) <= 0:
					_fail("lunar omen '%s' has invalid '%s'." % [omen_id, effect_key])
		if not has_effect:
			_fail("lunar omen '%s' has no effect." % omen_id)


func _check_run_marks() -> void:
	if MainScript.RUN_MARK_LIBRARY.size() < 6:
		_fail("RUN_MARK_LIBRARY has too few marks.")
	for mark_id in MainScript.RUN_MARK_LIBRARY.keys():
		var mark: Dictionary = MainScript.RUN_MARK_LIBRARY[mark_id]
		_check_required(mark, str(mark_id), "run mark", ["name", "desc"])
		if str(mark.get("name", "")).is_empty() or str(mark.get("desc", "")).is_empty():
			_fail("run mark '%s' has empty text." % mark_id)


func _check_interlude_oaths() -> void:
	if MainScript.INTERLUDE_OATH_LIBRARY.size() < 6:
		_fail("INTERLUDE_OATH_LIBRARY has too few oaths.")
	for oath_id in MainScript.INTERLUDE_OATH_LIBRARY.keys():
		var oath: Dictionary = MainScript.INTERLUDE_OATH_LIBRARY[oath_id]
		_check_required(oath, str(oath_id), "interlude oath", ["name", "desc", "tone"])
		var has_effect := false
		for effect_key in ["heal", "cleanse_curse", "max_hp", "spirit_stones", "next_weak", "random_consumable", "upgrade_random", "fallback_random_card", "random_insight"]:
			if oath.has(effect_key):
				has_effect = true
				if int(oath[effect_key]) <= 0:
					_fail("interlude oath '%s' has invalid '%s'." % [oath_id, effect_key])
		if oath.has("gain_card"):
			has_effect = true
			if not MainScript.CARD_LIBRARY.has(str(oath["gain_card"])):
				_fail("interlude oath '%s' references missing card '%s'." % [oath_id, str(oath["gain_card"])])
		for consumable_key in ["gain_consumable", "fallback_consumable"]:
			if oath.has(consumable_key):
				has_effect = true
				if not MainScript.CONSUMABLE_LIBRARY.has(str(oath[consumable_key])):
					_fail("interlude oath '%s' references missing consumable '%s'." % [oath_id, str(oath[consumable_key])])
		if not has_effect:
			_fail("interlude oath '%s' has no effect." % oath_id)


func _check_challenges() -> void:
	var seen := {}
	for challenge in MainScript.CHALLENGE_LIBRARY:
		var challenge_data: Dictionary = challenge
		_check_required(challenge_data, str(challenge_data.get("id", "unknown")), "challenge", ["id", "name", "desc"])
		var challenge_id := str(challenge_data.get("id", ""))
		if seen.has(challenge_id):
			_fail("challenge '%s' is duplicated." % challenge_id)
		seen[challenge_id] = true


func _check_balance_safety() -> void:
	_check_reward_pool_safety()
	_check_map_pool_safety()
	_check_growth_pool_safety()


func _check_reward_pool_safety() -> void:
	for act_index in MainScript.ACT_LIBRARY.size():
		var pool := _reward_card_pool_for_act(act_index)
		if pool.size() < 10:
			_fail("act %d reward pool has too few cards: %d." % [act_index + 1, pool.size()])
		var attack_count := 0
		var skill_count := 0
		var rare_count := 0
		var has_damage := false
		var has_defense := false
		var has_cycle := false
		var has_cleanse := false
		for card_id in pool:
			var card: Dictionary = MainScript.CARD_LIBRARY[card_id]
			var type_id := str(card.get("type", ""))
			if type_id == "attack":
				attack_count += 1
			elif type_id == "skill":
				skill_count += 1
			if str(card.get("rarity", "")) == "rare":
				rare_count += 1
			has_damage = has_damage or card.has("damage")
			has_defense = has_defense or card.has("block") or card.has("heal")
			has_cycle = has_cycle or card.has("draw") or card.has("gain_qi")
			has_cleanse = has_cleanse or card.has("cleanse_curse") or card.has("cleanse_player_weak")
		if attack_count < 4:
			_fail("act %d reward pool has too few attack cards: %d." % [act_index + 1, attack_count])
		if skill_count < 4:
			_fail("act %d reward pool has too few skill cards: %d." % [act_index + 1, skill_count])
		if act_index >= 1 and rare_count < 3:
			_fail("act %d reward pool has too few rare cards: %d." % [act_index + 1, rare_count])
		if not has_damage:
			_fail("act %d reward pool has no damage card." % [act_index + 1])
		if not has_defense:
			_fail("act %d reward pool has no defense/heal card." % [act_index + 1])
		if not has_cycle:
			_fail("act %d reward pool has no draw/qi card." % [act_index + 1])
		if not has_cleanse:
			_fail("act %d reward pool has no cleanse card." % [act_index + 1])


func _reward_card_pool_for_act(act_index: int) -> Array[String]:
	var pool: Array[String] = []
	for card_id in MainScript.CARD_LIBRARY.keys():
		var id := str(card_id)
		var card: Dictionary = MainScript.CARD_LIBRARY[id]
		if MainScript.STARTING_DECK.has(id):
			continue
		if str(card.get("rarity", "common")) == "curse":
			continue
		if act_index < int(card.get("min_act", 0)):
			continue
		pool.append(id)
	return pool


func _check_map_pool_safety() -> void:
	var required_by_act := [
		["battle", "elite", "event", "herb_event", "spirit_rift", "duel_trial", "market", "rest", "training"],
		["battle", "elite", "soul_shrine", "dark_forge", "spirit_rift", "duel_trial", "market", "rest", "training"],
		["battle", "elite", "thunder_pool", "dark_forge", "spirit_rift", "duel_trial", "market", "rest", "training"]
	]
	for act_index in MainScript.ACT_LIBRARY.size():
		var nodes := _map_nodes_for_act(act_index)
		if nodes.size() < 8:
			_fail("act %d map has too few node types: %d." % [act_index + 1, nodes.size()])
		var present := {}
		for node in nodes:
			var node_data: Dictionary = node
			present[str(node_data.get("type", ""))] = true
		for type_id in required_by_act[min(act_index, required_by_act.size() - 1)]:
			if not present.has(str(type_id)):
				_fail("act %d map is missing required node type '%s'." % [act_index + 1, str(type_id)])


func _map_nodes_for_act(act_index: int) -> Array:
	match act_index:
		0:
			return MainScript.MAP_NODE_LIBRARY
		1:
			return MainScript.SECOND_ACT_MAP_NODE_LIBRARY
		_:
			return MainScript.THIRD_ACT_MAP_NODE_LIBRARY


func _check_growth_pool_safety() -> void:
	if MainScript.TREASURE_LIBRARY.size() < 12:
		_fail("treasure pool is too small: %d." % MainScript.TREASURE_LIBRARY.size())
	if MainScript.INSIGHT_LIBRARY.size() < 5:
		_fail("insight pool is too small: %d." % MainScript.INSIGHT_LIBRARY.size())
	if MainScript.BREAKTHROUGH_LIBRARY.size() < 6:
		_fail("breakthrough pool is too small: %d." % MainScript.BREAKTHROUGH_LIBRARY.size())
	if MainScript.CONSUMABLE_LIBRARY.size() < 5:
		_fail("consumable pool is too small: %d." % MainScript.CONSUMABLE_LIBRARY.size())
	if MainScript.META_UNLOCKS.size() < 5:
		_fail("meta unlock track is too short: %d." % MainScript.META_UNLOCKS.size())
	if MainScript.CHALLENGE_LIBRARY.size() < 6:
		_fail("challenge library is too small: %d." % MainScript.CHALLENGE_LIBRARY.size())
