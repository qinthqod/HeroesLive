extends SceneTree

const REQUIRED_FILES := [
	"project.godot",
	"export_presets.cfg",
	"icon.svg",
	"icon.svg.import",
	"README.md",
	"scenes/Main.tscn",
	"scripts/Main.gd",
	"scripts/check_integrity.gd",
	"scripts/report_image2_gaps.gd",
	"scripts/export_image2_queue.gd",
	"scripts/export_image2_batch_prompts.gd",
	"scripts/export_delivery_status.gd",
	"scripts/import_image2_asset.gd",
	"scripts/check_package_manifest.gd",
	"scripts/run_checks.sh",
	"scripts/package_source.sh",
	"scripts/package_playable.sh",
	"scripts/serve_playable.py",
	"scripts/validate_web_playable.sh",
	"scripts/smoke_flow.gd",
	"scripts/smoke_seed_replay.gd",
	"scripts/smoke_defeat.gd",
	"scripts/smoke_victory.gd",
	"docs/image2_art_direction.md",
	"docs/image2_asset_manifest.json",
	"docs/image2_generation_queue.md",
	"docs/image2_batch_prompts.jsonl",
	"docs/image2_generation_attempts.md",
	"docs/ui_redesign_imagegen_direction.md",
	"docs/delivery_status.md"
]

const REQUIRED_DIRS := [
	"assets",
	"scenes",
	"scripts",
	"docs"
]

const REQUIRED_PACKAGE_ENTRIES := [
	"project.godot",
	"export_presets.cfg",
	"icon.svg",
	"icon.svg.import",
	"README.md",
	"assets",
	"scenes",
	"scripts",
	"docs"
]

var failures: Array[String] = []


func _init() -> void:
	_check_manifest()
	if failures.is_empty():
		print("Package manifest check passed.")
		quit(0)
	else:
		push_error("Package manifest check failed with " + str(failures.size()) + " issue(s).")
		for failure in failures:
			push_error("- " + failure)
		quit(1)


func _check_manifest() -> void:
	for file_path in REQUIRED_FILES:
		if not FileAccess.file_exists("res://" + file_path):
			failures.append("missing required file: " + file_path)
	for dir_path in REQUIRED_DIRS:
		if not DirAccess.dir_exists_absolute("res://" + dir_path):
			failures.append("missing required directory: " + dir_path)
	_check_asset_count()
	_check_package_script_entries()


func _check_asset_count() -> void:
	var dir := DirAccess.open("res://assets")
	if dir == null:
		failures.append("cannot open assets directory")
		return
	var image_count := 0
	dir.list_dir_begin()
	var file_name := dir.get_next()
	while not file_name.is_empty():
		if not dir.current_is_dir() and file_name.ends_with(".png"):
			image_count += 1
		file_name = dir.get_next()
	dir.list_dir_end()
	if image_count < 10:
		failures.append("assets directory has too few png files: " + str(image_count))


func _check_package_script_entries() -> void:
	var package_script := FileAccess.open("res://scripts/package_source.sh", FileAccess.READ)
	if package_script == null:
		failures.append("cannot read scripts/package_source.sh")
		return
	var content := package_script.get_as_text()
	for entry in REQUIRED_PACKAGE_ENTRIES:
		if not content.contains(entry):
			failures.append("package_source.sh does not include entry: " + entry)
	if not content.contains("BUILD_INFO.txt"):
		failures.append("package_source.sh does not add BUILD_INFO.txt")
	if not content.contains("scripts/export_delivery_status.gd"):
		failures.append("package_source.sh does not refresh delivery status")
	if not content.contains("scripts/package_playable.sh"):
		failures.append("package_source.sh does not include playable package script")
	_check_export_presets()
	_check_delivery_status_doc()


func _check_export_presets() -> void:
	var file := FileAccess.open("res://export_presets.cfg", FileAccess.READ)
	if file == null:
		failures.append("cannot read export_presets.cfg")
		return
	var content := file.get_as_text()
	for preset_name in ["name=\"Web\"", "platform=\"Web\"", "name=\"macOS\"", "platform=\"macOS\""]:
		if not content.contains(preset_name):
			failures.append("export_presets.cfg missing entry: " + preset_name)
	var playable_script := FileAccess.open("res://scripts/package_playable.sh", FileAccess.READ)
	if playable_script == null:
		failures.append("cannot read scripts/package_playable.sh")
		return
	var script_content := playable_script.get_as_text()
	for required_text in ["--export-release", "PRESET", "PLAYABLE_README.txt", "VALIDATE_WEB", "PLAY_QINGLAN.command", "PLAY_QINGLAN.bat", "serve_playable.py"]:
		if not script_content.contains(required_text):
			failures.append("package_playable.sh missing entry: " + required_text)
	var validation_script := FileAccess.open("res://scripts/validate_web_playable.sh", FileAccess.READ)
	if validation_script == null:
		failures.append("cannot read scripts/validate_web_playable.sh")
		return
	var validation_content := validation_script.get_as_text()
	for required_text in ["playwright", "chromium", "web-playable-validation.png", "index.pck"]:
		if not validation_content.contains(required_text):
			failures.append("validate_web_playable.sh missing entry: " + required_text)


func _check_delivery_status_doc() -> void:
	var file := FileAccess.open("res://docs/delivery_status.md", FileAccess.READ)
	if file == null:
		failures.append("cannot read docs/delivery_status.md")
		return
	var content := file.get_as_text()
	for section in ["Playable Scope", "Verification", "Image-2 Assets", "Missing Image-2 Targets", "Package", "IP Direction"]:
		if not content.contains(section):
			failures.append("delivery_status.md missing section: " + section)
