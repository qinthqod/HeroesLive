# UI Redesign Direction

## ImageGen Workflow

- Tool: built-in ImageGen.
- Use case: `ui-mockup`.
- Options generated: three complete 16:9 combat-screen directions.
- Selected direction: moonlit mountain shrine in light rain, combining woodblock shapes, dark lacquer, jade, parchment and restrained lantern amber.
- Structural reference: the existing Qinglan Night combat screen; gameplay hierarchy and controls were preserved.

## Selected Visual Rules

- Use full-screen scene art as an atmospheric layer instead of an empty black background.
- Keep gameplay content on compact lacquer and jade surfaces with square, carved corners.
- Reserve amber for the primary action and recommended card.
- Use cinnabar for danger, enemy health and destructive actions.
- Use jade for navigation, utility controls and defensive cards.
- Give the enemy art a stable, prominent battlefield slot rather than a thumbnail.
- Keep all primary title actions in the first viewport.
- Differentiate attack, skill and curse cards through material color while preserving rarity borders.
- Maintain the same hierarchy at 1280x720 and 960x720 without clipping or horizontal overflow.

## Final ImageGen Prompt

```text
Use case: ui-mockup
Asset type: high-fidelity 16:9 desktop game combat screen
Primary request: redesign an original cultivation-fantasy roguelike deckbuilder while retaining top run status, center enemy battlefield, readable intent, compact utility tools, five-card hand and bottom actions
Scene/backdrop: moonlit mountain shrine courtyard during light rain, glowing paper lanterns reflected on wet stone, bamboo and distant cliffs
Style/medium: shippable stylized game UI, bold woodblock-print shapes mixed with lacquered shrine panels, enamel icons and painted card frames
Composition/framing: 1280x720 landscape, clear three-band hierarchy, large battlefield, stable readable cards and controls
Color palette: ink navy, moss green, lantern amber, lacquer red, pale parchment and silver rain
Constraints: original generic cultivation fantasy only; no protected franchise imagery or names; no nested panels; no glowing gradient orbs; no watermark; no overlap
```
