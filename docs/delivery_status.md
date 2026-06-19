# Delivery Status

Project: 青岚夜行
Status date: generated from current workspace

## Playable Scope

- Three-act roguelike card run: 青岚谷 -> 玄阴山道 -> 筑基雷云.
- Five origins, three difficulties, seeded/daily runs, route nodes, events, shops, rest, training, interlude oaths, bounties, endings, achievements, run history, and structured post-run recap.
- First-run recommended start resets to the balanced origin, normal difficulty, random seed, and enabled decision hints.
- Web and desktop exports embed a subsetted Source Han Sans SC font for consistent Chinese UI rendering.
- Godot 4 single-player prototype; open with `/Applications/Godot.app/Contents/MacOS/Godot --path .`.

## Verification

- Full local gate: `bash scripts/run_checks.sh`.
- The gate refreshes Image-2 queues, validates data/assets/package manifest, and runs flow, seed replay, defeat, and victory smokes.
- Browser validation advances through title, mandate choice, and map screens, then compares rendered screenshots.

## Image-2 Assets

- Generated records: 14
- Planned records: 11
- Missing target files: 0
- Human queue: `docs/image2_generation_queue.md`.
- Batch JSONL: `docs/image2_batch_prompts.jsonl`.
- Batch import: `/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script scripts/import_image2_asset.gd -- --import-dir <directory>`.
- Auto-fit import for off-ratio outputs: add `--fit` before `<asset_id>` or before `--import-dir` to center-crop sources to 2:3 card/enemy art or 16:9 event backgrounds.

### Missing Image-2 Targets

- None.

## Package

- Source package command: `bash scripts/package_source.sh`.
- Playable Web package command: `bash scripts/package_playable.sh`.
- Web package includes macOS, Windows, and Linux launchers that start a local server and open the demo automatically.
- Playable Web browser validation covers 1280x720 and 960x720 title/mandate/map/route-result/quick-combat flows, including a card play, enemy action, and turn-two redraw: `bash scripts/validate_web_playable.sh <exports/playable/qinglan-night-web-*>` or `VALIDATE_WEB=1 bash scripts/package_playable.sh`.
- Optional macOS export command: `PRESET=macOS bash scripts/package_playable.sh`.
- Output directory: `exports/builds/`.
- Package includes project files, assets, scenes, scripts, docs, import metadata, and `BUILD_INFO.txt`.
- Chinese UI font: subsetted Source Han Sans SC under the SIL Open Font License; license text is included at `assets/fonts/OFL.txt`.

## IP Direction

- Use generic early-stage cultivation fantasy atmosphere.
- Avoid protected character likenesses, canon place names, plot beats, logos, readable watermarks, or direct adaptation of specific source material.
