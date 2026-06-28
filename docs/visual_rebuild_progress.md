# Visual Rebuild Progress

## Foundation

- Added `QinglanVisuals.gd` as the shared lacquer/jade/parchment style source.
- Added `atmospheric_backdrop.gdshader` for ink grading, vignette and restrained rain over real raster artwork.
- Existing card, card-back and enemy PNGs are now used as visual layers instead of leaving major screens as text-only panels.
- Added a real ornamental nine-patch lacquer texture for shared status and information surfaces.
- Added a ten-piece raster icon set derived from the game's approved artwork for life, qi, shield, sword edge, spirit stones, items and combat statuses.

## Rebuilt Surfaces

- Title and run setup: cinematic three-column composition, grouped secondary destinations, real character illustration.
- Combat: atmospheric scene treatment, readable card artwork, layered enemy presentation and interaction motion.
- Route map: every node now has a real art thumbnail, material frame and readable title/description hierarchy.
- Event choice: full-width real-art scene banner plus illustrated option cards.
- Rewards: full illustrated card row with reroll and rest actions kept in the same viewport.
- Status HUD: replaced the long numeric sentence with illustrated resource chips while retaining the underlying text state for accessibility and automated checks.
- Scene package: title, three act backgrounds and six event backgrounds now have project-local 16:9 raster composites and Godot import metadata.
- Growth rewards: added 38 project-local illustrated icons covering every current treasure, consumable, insight and breakthrough.
- Run summary: replaced the vertically stacked text report with an illustrated result scroll, rank plaque, resource tiles and a scrollable detailed recap.
- Title detail pages: added contextual art banners and ornamental scroll surfaces for guide, codex, legacy, records and settings content.
- Core late-run art: added dedicated illustrations for 镇魂符、雷纹护体、月蚀斩、玄阴引路鬼 and 雷池守阵者; card and enemy surfaces now prefer these assets automatically.
- Imagegen expansion pass: added project-bound art for 第七盏灯、无影城主、月蚀司命、命册缺页、逐月月潮斩 and 月海渡口; chapter 1/4/6 bosses, boss preludes, chapter 6 route/story/event nodes and moon/fate themed cards now use these dedicated assets instead of fallback reuse.
- Career card art pass: added six project-bound imagegen cards for 玄雷敕令、腐脉毒雾、阴阳大还丹、山海盟誓、天工开物 and 百鬼夜行; the talisman/alchemy/beast/artificer/soul capstone loops now have dedicated card illustrations instead of reusing generic sword, shield or moon art.
- Class selection pass: upgraded the profession page into a true pre-run planning surface. It now derives a starter-deck summary, opening resource loop, signature card, mastery treasure and three build-recipe entry points from live game data, with PC/mobile smoke coverage to prevent the setup screen from regressing into a plain class list.
- Chapter casefile pass: upgraded chapter selection from static cards into a pre-run story dossier. The selected chapter now previews investigation progress, four route beats, boss lore/weakness and enemy pressure from live chapter data, helping the start flow feel like opening a storybook instead of choosing a level tile.
- Build atlas pass: upgraded the collection build tab with a live "next recipe" tracker. It now surfaces the closest incomplete build, missing component type/rarity/keyword hints, completion progress and PC/mobile smoke coverage, turning the Codex from a passive checklist into a long-term deckbuilding objective.
- Pile/detail overlay: moved deck inspection into a centered lacquer scroll with scene artwork, click-outside dismissal and a full-screen dimming scrim.
- Responsive pass: verified combat and result screens at both 1280×720 and 960×720 without clipped controls or overlapping content.

## Remaining Production Asset Pass

- Replace project-local composite paintings with final art-director-approved paintings only when a later illustration pass calls for it; the live layouts no longer depend on placeholders.
- Expand dedicated art coverage for secondary cards and minor enemies that intentionally share the same visual family.
- Continue optional P3 polish on combat-log density and ultra-wide viewport composition.

The layout and component hooks already accept these assets; replacing fallback artwork should not require another structural rewrite.
