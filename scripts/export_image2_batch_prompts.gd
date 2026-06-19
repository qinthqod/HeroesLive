extends SceneTree

const MainScript = preload("res://scripts/Main.gd")
const MANIFEST_PATH := "res://docs/image2_asset_manifest.json"
const OUTPUT_PATH := MainScript.IMAGE2_BATCH_PROMPTS_PATH
const PRIORITY_ORDER := ["high", "medium", "low"]

var failures: Array[String] = []


func _init() -> void:
	var manifest := _load_manifest()
	if manifest.is_empty():
		_finish()
		return
	var lines := _build_jsonl_lines(manifest)
	var file := FileAccess.open(OUTPUT_PATH, FileAccess.WRITE)
	if file == null:
		failures.append("cannot write Image-2 batch prompts: " + OUTPUT_PATH)
		_finish()
		return
	file.store_string("\n".join(lines) + "\n")
	print("Image-2 batch prompts exported: " + OUTPUT_PATH)
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


func _build_jsonl_lines(manifest: Dictionary) -> Array[String]:
	var planned: Array = manifest.get("planned_assets", [])
	var records := _sorted_records(planned)
	var lines: Array[String] = []
	for record in records:
		lines.append(JSON.stringify(_batch_record(manifest, record)))
	return lines


func _sorted_records(planned: Array) -> Array[Dictionary]:
	var records: Array[Dictionary] = []
	for item in planned:
		if typeof(item) == TYPE_DICTIONARY:
			records.append(item)
	records.sort_custom(func(a, b) -> bool:
		var priority_a := _priority_rank(str(a.get("priority", "")))
		var priority_b := _priority_rank(str(b.get("priority", "")))
		if priority_a != priority_b:
			return priority_a < priority_b
		return str(a.get("id", "")) < str(b.get("id", ""))
	)
	return records


func _priority_rank(priority: String) -> int:
	var index := PRIORITY_ORDER.find(priority)
	if index == -1:
		return 99
	return index


func _batch_record(manifest: Dictionary, record: Dictionary) -> Dictionary:
	var target_path := str(record.get("target_path", ""))
	var result := {
		"id": str(record.get("id", "unknown")),
		"name": str(record.get("name", record.get("id", "unknown"))),
		"kind": str(record.get("kind", "unknown")),
		"priority": str(record.get("priority", "unknown")),
		"target_path": target_path,
		"expected_filename": str(record.get("id", "unknown")) + ".png",
		"asset_file": "present" if FileAccess.file_exists(target_path) else "missing",
		"aspect_ratio": _aspect_ratio_for_record(record),
		"drop_in_status": _drop_in_status(record),
		"style_anchor": str(manifest.get("style_anchor", "")),
		"prompt": str(record.get("prompt", "")).strip_edges()
	}
	for key in ["card_id", "enemy_name", "node_type"]:
		if record.has(key):
			result[key] = str(record[key])
	return result


func _aspect_ratio_for_record(record: Dictionary) -> String:
	if str(record.get("kind", "")) == "event_background":
		return "16:9"
	return "2:3"


func _drop_in_status(record: Dictionary) -> String:
	var target_path := str(record.get("target_path", ""))
	if record.has("card_id") and MainScript.CARD_LIBRARY.has(str(record["card_id"])):
		var card: Dictionary = MainScript.CARD_LIBRARY[str(record["card_id"])]
		if str(card.get("image2_target_art", "")) == target_path:
			return "ready"
		return "manual_link_needed"
	if record.has("enemy_name"):
		var enemy := _enemy_by_name(str(record["enemy_name"]))
		if not enemy.is_empty() and str(enemy.get("image2_target_art", "")) == target_path:
			return "ready"
		return "manual_link_needed"
	if str(record.get("kind", "")) == "event_background" and record.has("node_type"):
		var node_target := _background_target_for_node_type(str(record["node_type"]))
		if not node_target.is_empty() and target_path == node_target:
			return "ready"
		return "manual_link_needed"
	return "manual_link_needed"


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


func _enemy_by_name(enemy_name: String) -> Dictionary:
	for group in [
		MainScript.ENCOUNTERS,
		MainScript.SECOND_ACT_ENCOUNTERS,
		MainScript.THIRD_ACT_ENCOUNTERS,
		MainScript.ELITE_ENCOUNTERS,
		MainScript.SECOND_ACT_ELITE_ENCOUNTERS,
		MainScript.THIRD_ACT_ELITE_ENCOUNTERS
	]:
		for enemy in group:
			if str(enemy.get("name", "")) == enemy_name:
				return enemy
	for boss in [MainScript.BOSS_ENCOUNTER, MainScript.SECOND_BOSS_ENCOUNTER, MainScript.THIRD_BOSS_ENCOUNTER]:
		if str(boss.get("name", "")) == enemy_name:
			return boss
	return {}


func _finish() -> void:
	if failures.is_empty():
		quit(0)
		return
	push_error("Image-2 batch prompt export failed with " + str(failures.size()) + " issue(s).")
	for failure in failures:
		push_error("- " + failure)
	quit(1)
