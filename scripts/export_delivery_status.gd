extends SceneTree

const MainScript = preload("res://scripts/Main.gd")
const OUTPUT_PATH := "res://docs/delivery_status.md"
const MANIFEST_PATH := "res://docs/image2_asset_manifest.json"

var failures: Array[String] = []


func _init() -> void:
	var content := _build_status_markdown()
	var file := FileAccess.open(OUTPUT_PATH, FileAccess.WRITE)
	if file == null:
		failures.append("cannot write delivery status: " + OUTPUT_PATH)
		_finish()
		return
	file.store_string(content)
	print("Delivery status exported: " + OUTPUT_PATH)
	_finish()


func _build_status_markdown() -> String:
	var manifest := _load_manifest()
	var generated: Array = manifest.get("generated_assets", []) if typeof(manifest.get("generated_assets", [])) == TYPE_ARRAY else []
	var planned: Array = manifest.get("planned_assets", []) if typeof(manifest.get("planned_assets", [])) == TYPE_ARRAY else []
	var lines: Array[String] = [
		"# Delivery Status",
		"",
		"Project: 青岚夜行",
		"Status date: generated from current workspace",
		"",
		"## Playable Scope",
		"",
		"- Three-act roguelike card run: 青岚谷 -> 玄阴山道 -> 筑基雷云.",
		"- Five origins, three difficulties, seeded/daily runs, route nodes, events, shops, rest, training, interlude oaths, bounties, endings, achievements, run history, and structured post-run recap.",
		"- First-run recommended start resets to the balanced origin, normal difficulty, random seed, and enabled decision hints.",
		"- Web and desktop exports embed a subsetted Source Han Sans SC font for consistent Chinese UI rendering.",
		"- Godot 4 single-player prototype; open with `/Applications/Godot.app/Contents/MacOS/Godot --path .`.",
		"",
		"## Verification",
		"",
		"- Full local gate: `bash scripts/run_checks.sh`.",
		"- The gate refreshes Image-2 queues, validates data/assets/package manifest, and runs flow, seed replay, defeat, and victory smokes.",
		"- Browser validation advances through title, mandate choice, and map screens, then compares rendered screenshots.",
		"",
		"## Image-2 Assets",
		"",
		"- Generated records: %d" % generated.size(),
		"- Planned records: %d" % planned.size(),
		"- Missing target files: %d" % _missing_records(planned).size(),
		"- Human queue: `docs/image2_generation_queue.md`.",
		"- Batch JSONL: `docs/image2_batch_prompts.jsonl`.",
		"- Batch import: `/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script scripts/import_image2_asset.gd -- --import-dir <directory>`.",
		"- Auto-fit import for off-ratio outputs: add `--fit` before `<asset_id>` or before `--import-dir` to center-crop sources to 2:3 card/enemy art or 16:9 event backgrounds.",
		"",
		"### Missing Image-2 Targets",
		""
	]
	for record in _missing_records(planned):
		lines.append("- %s [%s/%s] -> `%s`" % [
			str(record.get("id", "unknown")),
			str(record.get("priority", "unknown")),
			str(record.get("kind", "unknown")),
			str(record.get("target_path", ""))
		])
	if _missing_records(planned).is_empty():
		lines.append("- None.")
	lines.append_array([
		"",
		"## Package",
		"",
		"- Source package command: `bash scripts/package_source.sh`.",
		"- Playable Web package command: `bash scripts/package_playable.sh`.",
		"- Web package includes macOS, Windows, and Linux launchers that start a local server and open the demo automatically.",
		"- Playable Web browser validation covers 1280x720 and 960x720 title/mandate/map/route-result/quick-combat flows, including a card play, enemy action, and turn-two redraw: `bash scripts/validate_web_playable.sh <exports/playable/qinglan-night-web-*>` or `VALIDATE_WEB=1 bash scripts/package_playable.sh`.",
		"- Optional macOS export command: `PRESET=macOS bash scripts/package_playable.sh`.",
		"- Output directory: `exports/builds/`.",
		"- Package includes project files, assets, scenes, scripts, docs, import metadata, and `BUILD_INFO.txt`.",
		"- Chinese UI font: subsetted Source Han Sans SC under the SIL Open Font License; license text is included at `assets/fonts/OFL.txt`.",
		"",
		"## IP Direction",
		"",
		"- Use generic early-stage cultivation fantasy atmosphere.",
		"- Avoid protected character likenesses, canon place names, plot beats, logos, readable watermarks, or direct adaptation of specific source material."
	])
	return "\n".join(lines) + "\n"


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


func _missing_records(planned: Array) -> Array[Dictionary]:
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
		var rank_a := _priority_rank(str(a.get("priority", "")))
		var rank_b := _priority_rank(str(b.get("priority", "")))
		if rank_a != rank_b:
			return rank_a < rank_b
		return str(a.get("id", "")) < str(b.get("id", ""))
	)
	return records


func _priority_rank(priority: String) -> int:
	match priority:
		"high":
			return 0
		"medium":
			return 1
		"low":
			return 2
		_:
			return 3


func _finish() -> void:
	if failures.is_empty():
		quit(0)
		return
	push_error("Delivery status export failed with " + str(failures.size()) + " issue(s).")
	for failure in failures:
		push_error("- " + failure)
	quit(1)
