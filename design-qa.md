# Web Design QA

- Source visual truth: `assets/ui/web_combat_reference.png`
- Implementation screenshots:
  - `/tmp/qinglan-web-title.png`
  - `/tmp/qinglan-web-combat.png`
  - `/tmp/qinglan-web-combat-960.png`
- Combined comparison: `/tmp/qinglan-web-comparison.png`
- Viewports: 1280×720 and 960×720
- States: title setup, route map, combat, card play/enemy turn, reward selection

## Full-view comparison evidence

The implementation follows the selected reference composition: edge-mounted player resources, a dominant open battlefield, centered enemy and intent, slim run progression, five foreground cards and one isolated amber end-turn action. A dedicated rain-soaked shrine environment now supplies the moon, wet stone, lanterns, bamboo and mountain depth shown by the reference.

The interface avoids the previous equal-weight dashboard framing. Content is embedded into the scene using restrained rails, typography and material accents rather than nested panels.

## Focused region comparison evidence

- The player rail preserves portrait, life, qi, shield, sword edge, stones and three consumables without stealing battlefield width.
- Enemy health and intent stay above the subject and remain readable over the moonlit scene.
- The five-card hand keeps cost, name, art, type and rule text readable; hover raises and enlarges the selected card.
- The 960×720 capture keeps all cards, resources, progress nodes, utility links and the end-turn action inside the viewport.
- Title setup, map nodes, event choices, reward cards and overlays use the same jade, parchment, lacquer and amber visual system.

## Required fidelity surfaces

- Fonts and typography: Source Han Sans SC is used for body UI; Kai-style display typography supplies the cultivation-fantasy titles. Hierarchy and line lengths remain readable at both tested widths.
- Spacing and layout rhythm: battlefield negative space is preserved, cards form a controlled fan, and edge rails align to a consistent inset.
- Colors and visual tokens: ink navy, pine green, oxidized jade, parchment, cinnabar and lantern amber match the selected reference.
- Image quality and asset fidelity: the combat environment, cards, enemies, event scenes, icons and reward art all use raster assets. No placeholder rectangles, emoji or code-drawn illustrations are visible.
- Copy and content: all labels and descriptions are game-specific and decision-oriented.
- Icons: resource and consumable icons share the existing painted raster family.
- States and interactions: origin selection, route choice, event choice, card play, qi spending, damage, shield/healing effects, enemy turn, reward selection, keyboard shortcuts and overlays are implemented.
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

## Follow-up polish

- P3: add bespoke transparent enemy cutouts for every encounter during a future final-illustration pass.
- P3: add sound, hit particles and short transition animations.
- P3: move the complete long-tail Godot content library into typed Web data modules.

final result: passed
