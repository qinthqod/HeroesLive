extends SceneTree

const MainScript = preload("res://scripts/Main.gd")
const MANIFEST_PATH := "res://docs/image2_asset_manifest.json"

var failures: Array[String] = []


func _init() -> void:
	var manifest := _load_manifest()
	if manifest.is_empty():
		_finish()
		return
	var generated_count := _record_count(manifest.get("generated_assets", []))
	var planned_count := _record_count(manifest.get("planned_assets", []))
	var card_reuse := _card_art_reuse_groups()
	var enemy_reuse := _enemy_art_reuse_groups()
	print("Image-2 asset gap report")
	print("Generated records: %d" % generated_count)
	print("Planned prompts: %d" % planned_count)
	print("Card art reuse groups: %d" % card_reuse.size())
	for line in card_reuse:
		print("  " + line)
	print("Enemy art reuse groups: %d" % enemy_reuse.size())
	for line in enemy_reuse:
		print("  " + line)
	_finish()


func _load_manifest() -> Dictionary:
	if not FileAccess.file_exists(MANIFEST_PATH):
		failures.append("missing Image-2 asset manifest: " + MANIFEST_PATH)
		return {}
	var file := FileAccess.open(MANIFEST_PATH, FileAccess.READ)
	if file == null:
		failures.append("cannot read Image-2 asset manifest: " + MANIFEST_PATH)
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		failures.append("Image-2 asset manifest must be a JSON object.")
		return {}
	return parsed


func _record_count(value: Variant) -> int:
	return value.size() if typeof(value) == TYPE_ARRAY else 0


func _card_art_reuse_groups() -> Array[String]:
	var by_art := {}
	for card_id in MainScript.CARD_LIBRARY.keys():
		var card: Dictionary = MainScript.CARD_LIBRARY[card_id]
		if str(card.get("type", "")) == "curse":
			continue
		var art_path := _preferred_art_path(card)
		if art_path.is_empty():
			continue
		if not by_art.has(art_path):
			by_art[art_path] = []
		by_art[art_path].append("%s/%s" % [str(card_id), str(card.get("name", card_id))])
	return _reuse_lines(by_art)


func _enemy_art_reuse_groups() -> Array[String]:
	var by_art := {}
	for enemy in _all_enemy_records():
		var art_path := _preferred_art_path(enemy)
		if art_path.is_empty():
			continue
		if not by_art.has(art_path):
			by_art[art_path] = []
		by_art[art_path].append(str(enemy.get("name", "unknown")))
	return _reuse_lines(by_art)


func _all_enemy_records() -> Array[Dictionary]:
	var records: Array[Dictionary] = []
	for group in [
		MainScript.ENCOUNTERS,
		MainScript.SECOND_ACT_ENCOUNTERS,
		MainScript.THIRD_ACT_ENCOUNTERS,
		MainScript.ELITE_ENCOUNTERS,
		MainScript.SECOND_ACT_ELITE_ENCOUNTERS,
		MainScript.THIRD_ACT_ELITE_ENCOUNTERS
	]:
		for enemy in group:
			records.append(enemy)
	for boss in [MainScript.BOSS_ENCOUNTER, MainScript.SECOND_BOSS_ENCOUNTER, MainScript.THIRD_BOSS_ENCOUNTER]:
		records.append(boss)
	return records


func _preferred_art_path(data: Dictionary) -> String:
	var target_path := str(data.get("image2_target_art", ""))
	if not target_path.is_empty() and FileAccess.file_exists(target_path):
		return target_path
	return str(data.get("art", ""))


func _reuse_lines(by_art: Dictionary) -> Array[String]:
	var lines: Array[String] = []
	var paths := by_art.keys()
	paths.sort()
	for path in paths:
		var names: Array = by_art[path]
		if names.size() <= 1:
			continue
		lines.append("%s -> %s" % [str(path), "、".join(names)])
	return lines


func _finish() -> void:
	if failures.is_empty():
		print("Image-2 asset gap report passed.")
		quit(0)
		return
	push_error("Image-2 asset gap report failed with " + str(failures.size()) + " issue(s).")
	for failure in failures:
		push_error("- " + failure)
	quit(1)
