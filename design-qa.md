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
  - `/tmp/qinglan-home-lore-mobile.png`
  - `/tmp/qinglan-reward-build-direction-final.png`
  - `/tmp/qinglan-combat-build-tracker.png`
  - `/tmp/qinglan-deck-build-state.png`
  - `/tmp/qinglan-route-build-goal.png`
  - `/tmp/qinglan-investigation-route.png`
  - `/tmp/qinglan-investigation-summary-complete.png`
  - `/tmp/qinglan-investigation-summary-partial.png`
  - `/tmp/qinglan-defeat-pending-clue.png`
  - `/tmp/qinglan-casebook-sorted.png`
  - `/tmp/qinglan-summary-archive.png`
  - `/tmp/qinglan-event-chapter2.png`
  - `/tmp/qinglan-event-chapter3.png`
  - `/tmp/qinglan-event-chapter5.png`
  - `/tmp/qinglan-market-chapter2-v2.png`
  - `/tmp/qinglan-market-chapter3-v2.png`
  - `/tmp/qinglan-market-chapter5-v2.png`
  - `/tmp/qinglan-enemy-chapter1-mobile.png`
  - `/tmp/qinglan-enemy-chapter5-elite-mobile.png`
  - `/tmp/qinglan-defeat-retry-support-mobile.png`
  - `/tmp/qinglan-home-progress-board-mobile.png`
  - `/tmp/qinglan-build-atlas-500.png`
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
- Replaced the duplicated recipe counter with 108 genuinely unique five-card builds and added a mobile flow atlas showing rank, keywords, known/unknown components, completion progress and an unlocked play pattern.
- Replaced the static home-side story counter with real scene progress, a one-time cultivation reward and a persistent character manuscript in the codex.
- Rebuilt each 12-card starter deck from seven foundational cards with functional duplicates, leaving real discovery space instead of preloading every base skill and two refined forms.
- Connected battle rewards to the 108-build atlas: the page now names the closest attainable recipe, shows its component progress, guarantees one advancing card and prioritizes unseen cards before duplicates.
- Extended the active build goal through the route page, a compact combat tracker and the deck overlay; the detailed view names the next core card while refined versions continue satisfying their base-card family.
- Added five chapter-specific investigation chains with route-dependent evidence, persistent clue progress, combat-log callbacks and distinct “truth revealed” versus “mystery remains” chapter conclusions.
- Corrected investigation causality: entering a node now creates a pending clue, while victory or node completion settles it; failed runs explicitly identify the evidence that was not brought back.
- Added five persistent seven-clue casebooks, sorted active investigations first, with one-time dossier completion rewards and a single-claim lock guarding all reward choices.
- Replaced the repeated shrine event template with five chapter-specific four-way dilemmas whose card, health, qi, consumable, currency, curse and next-battle costs are disclosed before selection; cautious exits explicitly forfeit evidence.
- Replaced the repeated market template with five chapter-specific economies, stock biases, service prices and one-off trades; unaffordable cards remain readable and now state the exact missing currency instead of disappearing into a disabled treatment.
- Replaced the two shared non-boss move templates with ten encounter-specific three-move cycles. Mobile combat now exposes each enemy's archetype, signature trait and counterplay while preserving the intent, enemy art and five-card hand hierarchy.
- Added a mobile failure-to-retry bridge with three capped, transparent defensive support tiers. The page explains exactly what enters the next run, keeps deck diagnosis and lost evidence visible, and scrolls safely at 430×932.
- Added a home challenge board and codex progress scroll backed by real profile data: nearest long-term goals, bounded progress bars, completion states and recent run records.
- Completed the challenge-board reward loop with claimable priority, explicit jade/spirit/xp/title rewards, a persistent single-claim lock, immediate resource updates and a visible equipped epithet in the home header.
- Corrected overlay selector scope so the codex shell keeps its lacquer treatment without forcing full overlay sizing, padding and unfold animation onto every nested challenge, run, treasure and investigation card.
- Added a fully playable daily trial surface with a date-derived profession, chapter, modifier and public seed. The seed now drives opening hands, reshuffles, rest outcomes, market stock, treasures and combat rewards rather than serving as decorative copy.
- Added real paired daily modifiers, persistent run-mode/seed/trial snapshots, same-seed retries, a one-clear-per-date reward lock and recent-run seed records. Existing saves block a new daily start instead of being silently overwritten.
- Verified the June 21, 2026 trial at 430×932: fixed sword/chapter-two/blood-moon configuration, +1 thunder consumable, +2 enemy attack damage, no horizontal overflow, no combat-control overlap and no console warnings.
- Added versioned, checksummed challenge codes for seeded run sharing. The import surface validates tampering, previews profession/chapter/modifier/seed, blocks save replacement and explicitly excludes daily first-clear rewards.
- Finished the challenge-replay mobile surface and verified a valid blood-moon code at 430×932 with no horizontal overflow or console warnings.
- Added repeatable Cloudflare Workers Static Assets deployment, SPA fallback, Wrangler scripts and a Web-build cleanup pass that removes 81 Godot-only files before upload.
- Added a deterministic production image pipeline that converts all 80 shipped PNG assets to visually checked WebP files, reducing the deployment bundle from about 89 MiB to 6.7 MiB and cutting image payload by 92%.
- Added a production-bundle guard that rejects residual PNG references, missing WebP files and bundles above 10 MiB before deployment.
- Reworked the boss-to-summary bridge so each chapter's final reward reveals the defeated boss's last testimony and investigation conclusion before the run is sealed. The four-layer route header now reports the same progress as the map, and skipping the final reward no longer grants a strategically meaningless heal that inflated the chapter grade.
- Added an in-run trial notebook across map, combat, event and reward surfaces. It derives current objectives from investigation state, pending evidence, enemy counterplay, build progress, deck weaknesses, survival risk and long-term goals; the mobile combat version is deliberately reduced so it does not cover cards or the end-turn control.
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
