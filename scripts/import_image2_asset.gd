extends SceneTree

const MANIFEST_PATH := "res://docs/image2_asset_manifest.json"
const QUEUE_PATH := "res://docs/image2_generation_queue.md"
const MainScript = preload("res://scripts/Main.gd")
const PRIORITY_ORDER := ["high", "medium", "low"]

var failures: Array[String] = []


func _init() -> void:
	var args := OS.get_cmdline_user_args()
	var manifest := _load_manifest()
	if manifest.is_empty():
		_finish()
		return
	if args.size() == 1 and str(args[0]) == "--list":
		_print_importable_assets(manifest)
		_finish()
		return
	if args.size() == 1 and str(args[0]) == "--missing":
		_print_missing_assets(manifest)
		_finish()
		return
	if args.size() == 1 and str(args[0]) == "--self-test-fit":
		_self_test_fit()
		_finish()
		return
	if args.size() == 2 and str(args[0]) == "--import-dir":
		_import_directory(manifest, str(args[1]), false)
		_finish()
		return
	if args.size() == 3 and str(args[0]) == "--fit" and str(args[1]) == "--import-dir":
		_import_directory(manifest, str(args[2]), true)
		_finish()
		return
	if args.size() == 3 and str(args[0]) == "--fit":
		var fit_record := _planned_record_by_id(manifest, str(args[1]))
		if fit_record.is_empty():
			failures.append("unknown Image-2 planned asset id: " + str(args[1]))
			_finish()
			return
		_import_asset(manifest, fit_record, str(args[2]), true)
		_finish()
		return
	if args.size() != 2:
		failures.append("usage: Godot --headless --path . --script scripts/import_image2_asset.gd -- <asset_id> <source_image_path>")
		failures.append("use --fit <asset_id> <source_image_path> to center-crop a valid PNG to the expected 2:3 or 16:9 ratio before import.")
		failures.append("use --list to show importable Image-2 asset ids.")
		failures.append("use --missing to show planned assets whose target PNG is not present.")
		failures.append("use --import-dir <directory> to import files named <asset_id>.png/webp/jpg/jpeg in priority order.")
		failures.append("use --fit --import-dir <directory> to batch import and center-crop sources to the expected ratio.")
		_finish()
		return
	var record := _planned_record_by_id(manifest, str(args[0]))
	if record.is_empty():
		failures.append("unknown Image-2 planned asset id: " + str(args[0]))
		_finish()
		return
	_import_asset(manifest, record, str(args[1]), false)
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


func _planned_record_by_id(manifest: Dictionary, asset_id: String) -> Dictionary:
	var planned: Variant = manifest.get("planned_assets", [])
	if typeof(planned) != TYPE_ARRAY:
		return {}
	for item in planned:
		if typeof(item) == TYPE_DICTIONARY and str(item.get("id", "")) == asset_id:
			return item
	return {}


func _print_importable_assets(manifest: Dictionary) -> void:
	var planned: Variant = manifest.get("planned_assets", [])
	if typeof(planned) != TYPE_ARRAY:
		print("No planned Image-2 assets.")
		return
	for item in planned:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		print("%s -> %s" % [str(item.get("id", "unknown")), str(item.get("target_path", ""))])


func _print_missing_assets(manifest: Dictionary) -> void:
	var planned: Variant = manifest.get("planned_assets", [])
	if typeof(planned) != TYPE_ARRAY:
		print("No planned Image-2 assets.")
		return
	var missing := _missing_planned_records(planned)
	if missing.is_empty():
		print("No missing Image-2 planned assets.")
		return
	for record in missing:
		print("%s [%s/%s] -> %s" % [
			str(record.get("id", "unknown")),
			str(record.get("priority", "unknown")),
			str(record.get("kind", "unknown")),
			str(record.get("target_path", ""))
		])


func _missing_planned_records(planned: Array) -> Array[Dictionary]:
	var records: Array[Dictionary] = []
	for item in planned:
		if typeof(item) != TYPE_DICTIONARY:
			continue
		var record: Dictionary = item
		var target_path := str(record.get("target_path", ""))
		if target_path.is_empty() or FileAccess.file_exists(target_path):
			continue
		records.append(record)
	records.sort_custom(func(a, b) -> bool:
		return _priority_rank(str(a.get("priority", ""))) < _priority_rank(str(b.get("priority", "")))
	)
	return records


func _priority_rank(priority: String) -> int:
	var index := PRIORITY_ORDER.find(priority)
	if index == -1:
		return 99
	return index


func _import_directory(manifest: Dictionary, source_dir: String, fit_to_expected_ratio: bool) -> void:
	var directory := DirAccess.open(source_dir)
	if directory == null:
		failures.append("cannot open Image-2 source directory: " + source_dir)
		return
	var planned: Variant = manifest.get("planned_assets", [])
	if typeof(planned) != TYPE_ARRAY:
		failures.append("Image-2 planned_assets must be an array.")
		return
	var imported := 0
	for record in _missing_planned_records(planned):
		var source_path := _source_image_for_record(source_dir, record)
		if source_path.is_empty():
			print("Missing source for Image-2 asset: " + str(record.get("id", "unknown")))
			continue
		_import_asset(manifest, record, source_path, fit_to_expected_ratio)
		if not failures.is_empty():
			return
		imported += 1
	print("Imported Image-2 assets from directory: " + str(imported))


func _source_image_for_record(source_dir: String, record: Dictionary) -> String:
	var asset_id := str(record.get("id", ""))
	for extension in ["png", "webp", "jpg", "jpeg"]:
		var path := _join_path(source_dir, asset_id + "." + extension)
		if FileAccess.file_exists(path):
			return path
	return ""


func _join_path(base: String, filename: String) -> String:
	if base.ends_with("/") or base.ends_with("\\"):
		return base + filename
	return base + "/" + filename


func _import_asset(manifest: Dictionary, record: Dictionary, source_path: String, fit_to_expected_ratio: bool) -> void:
	if not FileAccess.file_exists(source_path):
		failures.append("source image does not exist: " + source_path)
		return
	var target_path := str(record.get("target_path", ""))
	if target_path.is_empty():
		failures.append("planned asset has empty target_path: " + str(record.get("id", "unknown")))
		return
	if not target_path.begins_with("res://assets/") or not target_path.ends_with(".png"):
		failures.append("target_path must be a PNG under res://assets/: " + target_path)
		return
	var image := Image.new()
	var load_error := image.load(source_path)
	if load_error != OK:
		failures.append("cannot load source image: " + source_path)
		return
	if image.get_width() <= 0 or image.get_height() <= 0:
		failures.append("source image has invalid dimensions: " + source_path)
		return
	if fit_to_expected_ratio:
		image = _fit_image_to_expected_aspect(record, image)
	else:
		_check_aspect_ratio(record, image)
		if not failures.is_empty():
			return
	var save_error := image.save_png(target_path)
	if save_error != OK:
		failures.append("cannot save imported PNG: " + target_path)
		return
	_mark_asset_generated(manifest, record, source_path)
	_save_manifest(manifest)
	_write_generation_queue(manifest)
	if not failures.is_empty():
		return
	print("Imported Image-2 asset: %s -> %s" % [str(record.get("id", "unknown")), target_path])


func _check_aspect_ratio(record: Dictionary, image: Image) -> void:
	var expected := _expected_aspect_ratio(record)
	var expected_label := _expected_aspect_label(record)
	var actual := float(image.get_width()) / float(image.get_height())
	if abs(actual - expected) > 0.08:
		failures.append("source image aspect ratio %.2f does not match expected %s for '%s'." % [
			actual,
			expected_label,
			str(record.get("id", "unknown"))
		])


func _expected_aspect_ratio(record: Dictionary) -> float:
	return 16.0 / 9.0 if str(record.get("kind", "")) == "event_background" else 2.0 / 3.0


func _expected_aspect_label(record: Dictionary) -> String:
	return "16:9" if str(record.get("kind", "")) == "event_background" else "2:3"


func _fit_image_to_expected_aspect(record: Dictionary, image: Image) -> Image:
	var expected := _expected_aspect_ratio(record)
	var width := image.get_width()
	var height := image.get_height()
	var actual := float(width) / float(height)
	var crop_x := 0
	var crop_y := 0
	var crop_width := width
	var crop_height := height
	if actual > expected:
		crop_width = int(round(float(height) * expected))
		crop_x = int(floor(float(width - crop_width) * 0.5))
	else:
		crop_height = int(round(float(width) / expected))
		crop_y = int(floor(float(height - crop_height) * 0.5))
	crop_width = clamp(crop_width, 1, width)
	crop_height = clamp(crop_height, 1, height)
	crop_x = clamp(crop_x, 0, width - crop_width)
	crop_y = clamp(crop_y, 0, height - crop_height)
	return image.get_region(Rect2i(crop_x, crop_y, crop_width, crop_height))


func _self_test_fit() -> void:
	var card_image := Image.create(1024, 1024, false, Image.FORMAT_RGBA8)
	card_image.fill(Color(0.1, 0.2, 0.3, 1.0))
	var card_fit := _fit_image_to_expected_aspect({"kind": "card"}, card_image)
	_assert_fit_ratio("card", card_fit, 2.0 / 3.0)
	var background_image := Image.create(1000, 1000, false, Image.FORMAT_RGBA8)
	background_image.fill(Color(0.2, 0.1, 0.3, 1.0))
	var background_fit := _fit_image_to_expected_aspect({"kind": "event_background"}, background_image)
	_assert_fit_ratio("event_background", background_fit, 16.0 / 9.0)
	if failures.is_empty():
		print("Image-2 import fit self-test passed.")


func _assert_fit_ratio(label: String, image: Image, expected: float) -> void:
	var actual := float(image.get_width()) / float(image.get_height())
	if abs(actual - expected) > 0.01:
		failures.append("fit self-test failed for %s: %.3f" % [label, actual])


func _mark_asset_generated(manifest: Dictionary, record: Dictionary, source_path: String) -> void:
	var generated: Variant = manifest.get("generated_assets", [])
	if typeof(generated) != TYPE_ARRAY:
		generated = []
	var generated_record := _generated_record_from_planned(record, source_path)
	var replaced := false
	for i in generated.size():
		if typeof(generated[i]) == TYPE_DICTIONARY and str(generated[i].get("id", "")) == str(record.get("id", "")):
			generated[i] = generated_record
			replaced = true
			break
	if not replaced:
		generated.append(generated_record)
	manifest["generated_assets"] = generated
	var planned: Variant = manifest.get("planned_assets", [])
	if typeof(planned) == TYPE_ARRAY:
		for i in planned.size():
			if typeof(planned[i]) == TYPE_DICTIONARY and str(planned[i].get("id", "")) == str(record.get("id", "")):
				var planned_record: Dictionary = planned[i]
				planned_record["status"] = "generated"
				planned_record["imported_path"] = str(record.get("target_path", ""))
				planned[i] = planned_record
				break
		manifest["planned_assets"] = planned


func _generated_record_from_planned(record: Dictionary, source_path: String) -> Dictionary:
	var result := {
		"id": str(record.get("id", "unknown")),
		"kind": str(record.get("kind", "unknown")),
		"name": str(record.get("name", record.get("id", "unknown"))),
		"path": str(record.get("target_path", "")),
		"status": "generated",
		"prompt_focus": _prompt_focus_from_record(record),
		"source_import": source_path
	}
	for key in ["card_id", "enemy_name", "node_type"]:
		if record.has(key):
			result[key] = str(record[key])
	return result


func _prompt_focus_from_record(record: Dictionary) -> String:
	var prompt := str(record.get("prompt", ""))
	for line in prompt.split("\n"):
		if line.begins_with("Primary request:"):
			return line.trim_prefix("Primary request:").strip_edges()
	return str(record.get("name", record.get("id", "unknown")))


func _save_manifest(manifest: Dictionary) -> void:
	var file := FileAccess.open(MANIFEST_PATH, FileAccess.WRITE)
	if file == null:
		failures.append("cannot write Image-2 asset manifest: " + MANIFEST_PATH)
		return
	file.store_string(JSON.stringify(manifest, "\t"))


func _write_generation_queue(manifest: Dictionary) -> void:
	var file := FileAccess.open(QUEUE_PATH, FileAccess.WRITE)
	if file == null:
		failures.append("cannot write Image-2 generation queue: " + QUEUE_PATH)
		return
	file.store_string(_build_queue_markdown(manifest))


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
		for planned_record in records:
			_append_queue_record(lines, planned_record)
	var uncategorized := _planned_without_known_priority(planned)
	if not uncategorized.is_empty():
		lines.append("## Priority: uncategorized")
		lines.append("")
		for planned_record in uncategorized:
			_append_queue_record(lines, planned_record)
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


func _append_queue_record(lines: Array[String], record: Dictionary) -> void:
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
	push_error("Image-2 asset import failed with " + str(failures.size()) + " issue(s).")
	for failure in failures:
		push_error("- " + failure)
	quit(1)
