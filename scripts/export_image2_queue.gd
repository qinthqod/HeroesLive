extends SceneTree

const MainScript = preload("res://scripts/Main.gd")
const MANIFEST_PATH := "res://docs/image2_asset_manifest.json"
const QUEUE_PATH := "res://docs/image2_generation_queue.md"
const PRIORITY_ORDER := ["high", "medium", "low"]

var failures: Array[String] = []


func _init() -> void:
	var manifest := _load_manifest()
	if manifest.is_empty():
		_finish()
		return
	var content := _build_queue_markdown(manifest)
	var file := FileAccess.open(QUEUE_PATH, FileAccess.WRITE)
	if file == null:
		failures.append("cannot write Image-2 generation queue: " + QUEUE_PATH)
		_finish()
		return
	file.store_string(content)
	print("Image-2 generation queue exported: " + QUEUE_PATH)
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


func _build_queue_markdown(manifest: Dictionary) -> String:
	var planned: Array = manifest.get("planned_assets", [])
	var lines: Array[String] = [
		"# Image-2 Generation Queue",
		"",
		"Source: `docs/image2_asset_manifest.json`",
		"",
		"Style anchor: " + str(manifest.get("style_anchor", "")),
		"",
		"Production rules:",
		"- Card and enemy art must be vertical 2:3 PNG files unless the asset type says otherwise.",
		"- Save each finished PNG exactly to its `target_path`; linked cards and enemies will prefer that file automatically when it exists.",
		"- Keep the design generic to early-stage cultivation fantasy; avoid protected canon names, likenesses, places, logos, readable text, and watermarks.",
		"- Preserve small-card readability: one clear focal subject, restrained background detail, and strong silhouette.",
		""
	]
	for priority in PRIORITY_ORDER:
		var records := _planned_for_priority(planned, priority)
		if records.is_empty():
			continue
		lines.append("## Priority: " + priority)
		lines.append("")
		for record in records:
			_append_record(lines, record)
	var uncategorized := _planned_without_known_priority(planned)
	if not uncategorized.is_empty():
		lines.append("## Priority: uncategorized")
		lines.append("")
		for record in uncategorized:
			_append_record(lines, record)
	return "\n".join(lines) + "\n"


func _planned_for_priority(planned: Array, priority: String) -> Array[Dictionary]:
	var records: Array[Dictionary] = []
	for item in planned:
		if typeof(item) == TYPE_DICTIONARY and str(item.get("priority", "")) == priority:
			records.append(item)
	return records


func _planned_without_known_priority(planned: Array) -> Array[Dictionary]:
	var records: Array[Dictionary] = []
	for item in planned:
		if typeof(item) == TYPE_DICTIONARY and not PRIORITY_ORDER.has(str(item.get("priority", ""))):
			records.append(item)
	return records


func _append_record(lines: Array[String], record: Dictionary) -> void:
	lines.append("### " + str(record.get("name", record.get("id", "unknown"))))
	lines.append("")
	lines.append("- id: `" + str(record.get("id", "unknown")) + "`")
	lines.append("- kind: `" + str(record.get("kind", "unknown")) + "`")
	var target_path := str(record.get("target_path", ""))
	lines.append("- target_path: `" + target_path + "`")
	lines.append("- asset file: " + ("present" if FileAccess.file_exists(target_path) else "missing"))
	lines.append("- drop-in status: " + _drop_in_status(record))
	lines.append("")
	lines.append("```text")
	lines.append(str(record.get("prompt", "")).strip_edges())
	lines.append("```")
	lines.append("")


func _drop_in_status(record: Dictionary) -> String:
	var target_path := str(record.get("target_path", ""))
	if record.has("card_id") and MainScript.CARD_LIBRARY.has(str(record["card_id"])):
		var card: Dictionary = MainScript.CARD_LIBRARY[str(record["card_id"])]
		if str(card.get("image2_target_art", "")) == target_path:
			return "ready; this card will prefer the PNG once it exists."
		return "manual link needed; card target path is not wired yet."
	if record.has("enemy_name"):
		var enemy := _enemy_by_name(str(record["enemy_name"]))
		if not enemy.is_empty() and str(enemy.get("image2_target_art", "")) == target_path:
			return "ready; this enemy will prefer the PNG once it exists."
		return "manual link needed; enemy target path is not wired yet."
	if str(record.get("kind", "")) == "event_background" and record.has("node_type"):
		var node_target := _background_target_for_node_type(str(record["node_type"]))
		if not node_target.is_empty() and target_path == node_target:
			return "ready; %s choice scenes will show this background once the PNG exists." % str(record["node_type"])
		return "manual link needed; event background target path is not wired yet."
	return "not a combat portrait; connect manually where the related UI view is implemented."


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
	push_error("Image-2 generation queue export failed with " + str(failures.size()) + " issue(s).")
	for failure in failures:
		push_error("- " + failure)
	quit(1)
