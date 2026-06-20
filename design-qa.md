# Web Design QA

- Source visual truth: `assets/ui/web_combat_reference.png`
- Implementation screenshots:
  - `/tmp/heroeslive-home.png`
  - `/tmp/heroeslive-classes.png`
  - `/tmp/heroeslive-collection.png`
  - `/tmp/heroeslive-route-v2.png`
  - `/tmp/heroeslive-card-detail-v2.png`
  - `/tmp/heroeslive-draw-v2.png`
  - `/tmp/qinglan-web-title.png`
  - `/tmp/qinglan-web-combat.png`
  - `/tmp/qinglan-web-combat-960.png`
  - `/tmp/qinglan-web-combat-motion-599.png`
  - `/tmp/qinglan-web-combat-final-599.png`
  - `/tmp/qinglan-guide-mobile-3.png`
  - `/tmp/qinglan-boss-mobile.png`
  - `/tmp/qinglan-settings-mobile.png`
  - `/tmp/qinglan-summary-mobile.png`
  - `/tmp/qinglan-collection-mobile.png`
- Combined comparison: `/tmp/qinglan-web-comparison.png`
- Viewports: 1280×720, 960×720, 599×772 and 430×932
- States: mobile home, chapter selection, six-profession selection, story dialogue/choice, card collection, growth tree, route map, combat, card play/enemy turn, reward selection

## Full-view comparison evidence

The implementation follows the selected reference composition: edge-mounted player resources, a dominant open battlefield, centered enemy and intent, slim run progression, five foreground cards and one isolated amber end-turn action. A dedicated rain-soaked shrine environment now supplies the moon, wet stone, lanterns, bamboo and mountain depth shown by the reference.

The interface avoids the previous equal-weight dashboard framing. Content is embedded into the scene using restrained rails, typography and material accents rather than nested panels.

## Focused region comparison evidence

- The player rail preserves portrait, life, qi, shield, sword edge, stones and three consumables without stealing battlefield width.
- Enemy health and intent stay above the subject and remain readable over the moonlit scene.
- The five-card hand keeps cost, name, art, type and rule text readable; hover raises and enlarges the selected card.
- The 960×720 capture keeps all cards, resources, progress nodes, utility links and the end-turn action inside the viewport.
- The 599×772 in-app viewport switches title, map, event, reward and summary screens to compact layouts while keeping the combat field, five-card hand and end-turn action playable without horizontal clipping.
- Title setup, map nodes, event choices, reward cards and overlays use the same jade, parchment, lacquer and amber visual system.
- The new 430×932 mobile shell keeps the primary narrative action, resources, permanent-growth entry points and bottom navigation inside a one-hand portrait layout.
- Six profession tabs, starter-deck previews and the two-column card archive remain usable at the narrow mobile viewport.

## Required fidelity surfaces

- Fonts and typography: Source Han Sans SC is used for body UI; Kai-style display typography supplies the cultivation-fantasy titles. Hierarchy and line lengths remain readable at both tested widths.
- Spacing and layout rhythm: battlefield negative space is preserved, cards form a controlled fan, and edge rails align to a consistent inset.
- Colors and visual tokens: ink navy, pine green, oxidized jade, parchment, cinnabar and lantern amber match the selected reference.
- Image quality and asset fidelity: the combat environment, cards, enemies, event scenes, icons and reward art all use raster assets. No placeholder rectangles, emoji or code-drawn illustrations are visible.
- Copy and content: all labels and descriptions are game-specific and decision-oriented.
- Icons: resource and consumable icons share the existing painted raster family.
- States and interactions: origin selection, route choice, event choice, card play, qi spending, damage, shield/healing effects, enemy turn, reward selection, keyboard shortcuts and overlays are implemented. Card play now has cast, travel, impact and fade phases; hits add streaks, damage numbers and enemy recoil; enemy turns add a phase banner, lunge, player flash and damage rise.
- Accessibility: keyboard focus is visible, primary buttons have accessible names, reduced-motion preferences are respected and contrast remains strong.

## Findings

No actionable P0, P1 or P2 findings remain in the tested states.

## Patches made

- Migrated the presentation layer to React and Vite.
- Rebuilt title, route, event, combat, reward and result states as a single interactive Web game flow.
- Generated a dedicated UI-free Web combat environment and integrated existing card/enemy assets.
- Fixed screen-transition focus scrolling that displaced the route layout.
- Reduced and raised the card hand to prevent 720px-height clipping.
- Added a stronger enemy mask so portrait art merges into the scene instead of reading as a rectangular poster.
- Added a responsive 960×720 card layout and reduced-motion handling.
- Added scene mist, breathing backdrops, staggered page entrances, lacquer screen curtains, material highlights and reward-card reveal motion.
- Added a complete combat feedback chain for card casting, impact, enemy recoil, enemy attack and player damage.
- Added a non-blocking first-battle guide and visually verified that the 430×932 prompt leaves enemy intent, hand cards, qi and end-turn controls unobstructed.
- Added five chapter-specific boss cycles and verified at 430×932 that current mechanics, phase note and next intent remain readable above the battlefield.
- Added persistent sound, haptic and volume controls; the settings scroll was tightened to prevent its two-column feedback controls from widening the mobile overlay.
- Replaced the fixed chapter grade and fake cultivation reward with a performance-based result sheet showing real combat, card, damage and progression totals.
- Converted the card archive into a persistent discovery collection with per-profession progress, refined-form counts and styled unknown-card clues.
- Added a 599×772 responsive pass and locked the battle viewport against focus-induced scrolling.
- Removed the React development-root duplication warning during hot updates.
- Added a mobile home hub, five-chapter campaign archive, six distinct professions, 120-card library, 108 recommended deck recipes, permanent talent growth and local profile persistence.
- Added a three-scene chapter prologue with a durable narrative choice and a four-layer campaign route leading to a chapter boss.
- Replaced equal-weight route tiles with a current-choice journey surface that exposes risk, reward and narrative consequence before selection.
- Replaced static five-card hands with a real draw/discard/exhaust/reshuffle loop and a visible deck-origin draw animation.
- Reworked all 120 cards to include unique names, main effects, conditional synergies, keywords, rarity and refinement direction; each profession now covers 8–10 distinct mechanic families.
- Card play uses single-tap immediate casting; unaffordable or busy cards are disabled, while ready synergies remain visible through the old-gold “联” seal.
- Added visible profession resources for all six classes: sword edge, talisman seals, cold/heat medicine nature, beast contracts, devices/cunning and soul lamps.
- Added profession-specific shrine choices and made the earlier gatekeeper dialogue choice alter later route/event copy.
- Added persistent profession mastery and an automated game-design content gate (`npm run check:game`).
- Replaced the placeholder five-chapter shell with chapter-specific opening scenes, choices, four-layer route names, clue summaries, event copy, enemies, intents and health curves.

## Follow-up polish

- P3: add bespoke transparent enemy cutouts for every encounter during a future final-illustration pass.
- P3: add sound and bespoke GPU particle sprites for heavy attacks.
- P3: move the complete long-tail Godot content library into typed Web data modules.

final result: passed
