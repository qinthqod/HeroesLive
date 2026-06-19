# Image-2 Generation Queue

Source: `docs/image2_asset_manifest.json`

Style anchor: 凡人修仙早期小人物冒险；半写实东方奇幻卡牌插画；低饱和玉青、朱砂、旧金、夜蓝；克制墨色边缘；避免直接复刻具体受版权保护的人物、地名和剧情。

Production rules:
- Card and enemy art must be vertical 2:3 PNG files unless the asset type says otherwise.
- Save each finished PNG exactly to its `target_path`; linked cards and enemies will prefer that file automatically when it exists.
- Keep the design generic to early-stage cultivation fantasy; avoid protected canon names, likenesses, places, logos, readable text, and watermarks.
- Preserve small-card readability: one clear focal subject, restrained background detail, and strong silhouette.

## Priority: high

### 镇魂符

- id: `card_soul_guard`
- kind: `card`
- target_path: `res://assets/card_soul_guard.png`
- asset file: present
- drop-in status: ready; this card will prefer the PNG once it exists.

```text
Use case: stylized-concept
Asset type: roguelike deckbuilder card illustration
Primary request: 镇魂符，低阶修士以旧黄符镇住心魔杂念
Scene/backdrop: dim cultivation chamber, scattered talisman ash and cracked jade slip glow
Subject: cinnabar talisman suppressing dark ink-like intrusive thoughts, no monster body
Style: semi-realistic Chinese fantasy card art, restrained ink-wash edges, painterly lighting, clear silhouette, low-saturation jade cyan, cinnabar red, aged gold, night blue
Composition: vertical 2:3 card art, centered talisman, readable at small card size
Avoid: readable text, logo, watermark, modern items, excessive divine grandeur
```

### 雷纹护体

- id: `card_thunder_body`
- kind: `card`
- target_path: `res://assets/card_thunder_body.png`
- asset file: present
- drop-in status: ready; this card will prefer the PNG once it exists.

```text
Use case: stylized-concept
Asset type: roguelike deckbuilder card illustration
Primary request: 雷纹护体，筑基雷云前的护身法门
Scene/backdrop: storm-lit stone platform under dark clouds
Subject: low-rank cultivator silhouette guarded by thin blue-white thunder patterns on a humble robe
Style: semi-realistic Chinese fantasy card art, restrained ink-wash edges, painterly lighting, clear silhouette, low-saturation jade cyan, cinnabar red, aged gold, night blue
Composition: vertical 2:3 card art, centered defensive aura, strong silhouette
Avoid: sci-fi electricity, modern armor, readable text, logo, watermark, godlike scale
```

### 雷池守阵者

- id: `enemy_thunder_pool_guardian`
- kind: `enemy`
- target_path: `res://assets/enemy_thunder_pool_guardian.png`
- asset file: present
- drop-in status: ready; this enemy will prefer the PNG once it exists.

```text
Use case: stylized-concept
Asset type: enemy portrait for a roguelike deckbuilder
Primary request: 雷池守阵者，终幕高护体守阵敌人
Scene/backdrop: cracked thunder pool formation, wet stone, storm clouds
Subject: stern formation guardian silhouette in worn ritual armor, thunder talismans orbiting close to body
Style: semi-realistic Chinese fantasy enemy portrait, restrained ink-wash edges, painterly lighting, jade cyan and night blue
Composition: vertical 2:3 enemy portrait, full body centered, readable at mobile size
Avoid: named canon character likeness, modern armor, sci-fi tech, text, logo, watermark
```

### 洗雷池背景

- id: `ui_thunder_pool_background`
- kind: `event_background`
- target_path: `res://assets/bg_thunder_pool.png`
- asset file: present
- drop-in status: ready; thunder_pool choice scenes will show this background once the PNG exists.

```text
Use case: stylized-concept
Asset type: event choice background for a roguelike deckbuilder
Primary request: 洗雷池选择背景，用于引雷悟剑、雷池淬体或镇压余魔
Scene/backdrop: cracked ritual pool under low storm clouds, wet dark stone, thin blue-white lightning crawling over shallow water
Subject: dangerous but small-scale thunder tempering pool, old formation stones and talismans around the edges
Style: semi-realistic Chinese fantasy interface background, painterly storm light, restrained ink edges, jade cyan, night blue, aged gold
Composition: 16:9 horizontal background, pool forms a quiet center with UI-safe space, lightning and stones frame the edges
Avoid: readable text, logo, watermark, sci-fi electricity, godlike scale, modern armor, giant heavenly tribulation spectacle
```

## Priority: medium

### 月蚀斩

- id: `card_moon_eclipse_slash`
- kind: `card`
- target_path: `res://assets/card_moon_eclipse_slash.png`
- asset file: present
- drop-in status: ready; this card will prefer the PNG once it exists.

```text
Use case: stylized-concept
Asset type: roguelike deckbuilder card illustration
Primary request: 月蚀斩，高风险多段剑光在暗月下划开煞雾
Scene/backdrop: night valley with eclipsed moon and low black mist
Subject: three restrained jade-cyan sword arcs cutting through dark spiritual fog
Style: semi-realistic Chinese fantasy card art, restrained ink-wash edges, painterly lighting, clear silhouette
Composition: vertical 2:3, diagonal motion but uncluttered, no characters required
Avoid: gore, modern effects, readable text, logo, watermark, giant celestial spectacle
```

### 玄阴引路鬼

- id: `enemy_xuanyin_guide`
- kind: `enemy`
- target_path: `res://assets/enemy_xuanyin_guide.png`
- asset file: present
- drop-in status: ready; this enemy will prefer the PNG once it exists.

```text
Use case: stylized-concept
Asset type: enemy portrait for a roguelike deckbuilder
Primary request: 玄阴引路鬼，中期以错路回声污染牌组的阴冷敌人
Scene/backdrop: narrow mountain path, ghost lantern glow, cold fog
Subject: tattered guide-like shade holding a dim lantern, face indistinct, posture misleading rather than monstrous
Style: semi-realistic Chinese fantasy enemy portrait, restrained ink edges, low saturation jade cyan and night blue
Composition: vertical 2:3, centered silhouette, clear lantern focal point
Avoid: horror gore, comedy, modern clothing, text, logo, watermark
```

### 山脚坊市背景

- id: `ui_market_background`
- kind: `event_background`
- target_path: `res://assets/bg_market_stall.png`
- asset file: present
- drop-in status: ready; market choice scenes will show this background once the PNG exists.

```text
Use case: stylized-concept
Asset type: event choice background for a roguelike deckbuilder
Primary request: 山脚坊市购牌选择背景，用于玩家购买术法和小物
Scene/backdrop: early-stage xianxia roadside market at dusk, humble stalls with talismans, jade slips, herb bottles, and low-grade spirit stones
Subject: grounded market stall close-up with clear empty center for UI cards
Style: semi-realistic Chinese fantasy interface background, painterly texture, restrained details, jade cyan, cinnabar red, aged gold, night blue
Composition: 16:9 horizontal background, props around edges, calm center
Avoid: readable text, logo, watermark, modern shop signs, luxury palace market, crowded characters, neon lighting
```

### 灵脉裂隙背景

- id: `ui_spirit_rift_background`
- kind: `event_background`
- target_path: `res://assets/bg_spirit_rift.png`
- asset file: present
- drop-in status: ready; spirit_rift choice scenes will show this background once the PNG exists.

```text
Use case: stylized-concept
Asset type: event choice background for a roguelike deckbuilder
Primary request: 灵脉裂隙选择背景，用于玩家强取灵气、凝晶或封存术法
Scene/backdrop: cracked mountain floor at night, unstable jade-cyan spiritual veins leaking mist and small stone fragments
Subject: glowing rift in the earth with humble talisman stakes around it, no large character focus
Style: semi-realistic Chinese fantasy interface background, painterly texture, restrained ink edges, low-saturation jade cyan, aged gold, night blue
Composition: 16:9 horizontal background, visual energy along left and right edges, calm empty center for UI cards
Avoid: readable text, logo, watermark, sci-fi reactor, modern equipment, huge cosmic portal, crowded figures
```

### 月隐秘境背景

- id: `ui_secret_realm_background`
- kind: `event_background`
- target_path: `res://assets/bg_secret_realm.png`
- asset file: present
- drop-in status: ready; secret_realm choice scenes will show this background once the PNG exists.

```text
Use case: stylized-concept
Asset type: event choice background for a roguelike deckbuilder
Primary request: 月隐秘境选择背景，用于观星悟道、饮月井水或取秘境遗卷
Scene/backdrop: temporary moonlit doorway in a quiet valley, old stone steps, shallow moonwell reflection, drifting paper seals
Subject: ancient small-scale secret realm entrance with a faint lunar shimmer, grounded and worn rather than divine
Style: semi-realistic Chinese fantasy interface background, restrained ink-wash edges, painterly moonlight, jade cyan, aged gold, night blue
Composition: 16:9 horizontal background, doorway and props around edges, clear empty center for UI choices
Avoid: readable text, logo, watermark, palace grandeur, named canon location, giant celestial spectacle, crowded characters
```

### 镇魂古龛背景

- id: `ui_soul_shrine_background`
- kind: `event_background`
- target_path: `res://assets/bg_soul_shrine.png`
- asset file: present
- drop-in status: ready; soul_shrine choice scenes will show this background once the PNG exists.

```text
Use case: stylized-concept
Asset type: event choice background for a roguelike deckbuilder
Primary request: 镇魂古龛选择背景，用于净心、悟道或夺取法器
Scene/backdrop: ruined roadside shrine inside a cold mountain alcove, old incense ash, cracked talismans, dim lantern glow
Subject: small worn soul-calming shrine with shadowy ink wisps held back by cinnabar seals, no ghost face or readable writing
Style: semi-realistic Chinese fantasy interface background, restrained ink edges, painterly low light, cinnabar red, jade cyan, aged gold, night blue
Composition: 16:9 horizontal background, shrine slightly off-center, calm empty center for UI cards
Avoid: readable text, logo, watermark, horror gore, comedy, modern objects, protected canon place or character likeness
```

### 阴火残炉背景

- id: `ui_dark_forge_background`
- kind: `event_background`
- target_path: `res://assets/bg_dark_forge.png`
- asset file: present
- drop-in status: ready; dark_forge choice scenes will show this background once the PNG exists.

```text
Use case: stylized-concept
Asset type: event choice background for a roguelike deckbuilder
Primary request: 阴火残炉选择背景，用于重淬术法、铸成阴雷或取走炉炭
Scene/backdrop: abandoned low-grade alchemy forge in a cave, cracked furnace, dull blue-black flame, scattered failed talisman scraps
Subject: worn furnace and ritual tools with restrained firelight, grounded early-cultivation workshop feeling
Style: semi-realistic Chinese fantasy interface background, painterly texture, restrained ink-wash edges, cinnabar ember, jade cyan, aged gold, night blue
Composition: 16:9 horizontal background, furnace and tools near edges, clear empty center for UI choices
Avoid: readable text, logo, watermark, modern foundry, sci-fi machinery, luxury workshop, excessive flames
```
