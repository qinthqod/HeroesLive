# 青岚夜行

月下修仙题材的单机 Roguelike 卡牌游戏。当前主视觉版本使用 React + Vite 重建，选择流派，在三幕路线中通过战斗、事件、坊市与奖励成长，最终渡过筑基雷劫。原 Godot 原型仍保留作规则与内容参考。

当前 Web 开发遵循 [游戏设计执行准则](docs/game_design_principles.md)，并持续从 Godot 原型迁移真实牌堆循环、稀有度奖励、精研、路线研判与构筑诊断规则。

## 运行 Web 版

```bash
cd web
npm install
npm run dev
```

浏览器打开终端显示的本地地址。生产构建：

```bash
cd web
npm run build
```

构建结果输出到 `exports/web/`。

## 运行 Godot 原型

使用 Godot 4 打开本目录，或直接运行：

```bash
/Applications/Godot.app/Contents/MacOS/Godot --path .
```

## 校验

一键顺序校验会启动主场景、检查数据、图像资源与交付清单，并跑流程、种子复现、失败结算和通关烟测：

```bash
bash scripts/run_checks.sh
```

如果 Godot 不在默认路径：

```bash
GODOT_BIN=/path/to/Godot bash scripts/run_checks.sh
```

## 打包

生成可交付源码包：

```bash
bash scripts/package_source.sh
```

脚本默认先跑完整校验，刷新 `docs/delivery_status.md`，再在 `exports/builds/` 下生成 zip。快速打包可跳过校验：

```bash
SKIP_CHECKS=1 bash scripts/package_source.sh
```

生成 Web 可试玩包：

```bash
bash scripts/package_playable.sh
```

脚本默认使用 `export_presets.cfg` 的 `Web` 预设，输出到 `exports/builds/qinglan-night-web-*.zip`。可用 `PRESET=macOS bash scripts/package_playable.sh` 生成 macOS 导出包。

Web 包内置跨平台启动器。解压后，macOS 双击 `PLAY_QINGLAN.command`，Windows 双击 `PLAY_QINGLAN.bat`，Linux 运行 `./PLAY_QINGLAN.sh`；启动器会自动选择可用端口、开启本地服务并打开浏览器。

导出后可用真实浏览器验收 Web 包：

```bash
bash scripts/validate_web_playable.sh exports/playable/qinglan-night-web-*
```

验收脚本会启动本地 HTTP 服务、用 Chromium/Chrome 打开 `index.html`，在 `1280x720` 与 `960x720` 两种视口推进标题页、试炼签、地图、首个路线结果和快速战斗；快速战斗还会打出护盾牌并结束回合，验证敌人行动与第二回合重抽。截图保存到 `exports/validation/`，脚本会比较画面差异、交互区/手牌区内容活跃度和右边缘裁切。也可以在导出时一并执行：`VALIDATE_WEB=1 bash scripts/package_playable.sh`。

## 操作

- `Enter`：标题页开始普通试炼。
- `P`：标题页用固定种子与推荐配置直接进入一场标准战斗，适合快速试玩核心牌局。
- 标题页“推荐开局”：一键使用青竹剑修、凡阶试炼、随机种子和开启状态的决策提示。
- 标题页“试玩指南”：查看第一局推荐、路线选择、战斗读法、奖励取舍和 Image-2 素材导入提示。
- 标题页“种子/复盘码”：可输入纯数字种子，或粘贴结算/战绩中的 `QLN|...` 复盘码自动套用流派、劫数和种子。
- 局内顶部“试炼提示”会随地图、选项、战斗和奖励阶段切换，可用 `H` 或设置页关闭。
- `1-7`：战斗中打出对应手牌。
- `1-9`：地图、事件、奖励界面中选择对应编号项目。
- `Q` / `W` / `E` / `R`：战斗中使用前四个不同消耗品。
- `Space`：战斗中结束回合。
- `J` / `G` / `K`：打开任务札记、引导、关键词/规则。
- `D` / `L`：查看牌组、日志。
- `H`：切换决策提示。
- `Esc`：收起面板，或保存当前战斗/选择状态并返回标题。

## 当前内容

- 三幕流程：青岚谷、玄阴山道、筑基雷云。
- 五个流派、三档劫数、种子月相异兆、开局三选一试炼签、滚动悬赏令、本局印记、今日试炼月相预告、可复现种子、局内/结算/历史复盘码、当前待办、路线研判、完胜破阵追踪、渡劫准备清单、局中评阶预估、路线轨迹、奖励复盘、构筑定位、关键短板诊断与下局路线计划。
- 战斗牌组、月相主题牌、后期路线牌、后期净心/灵气回涌/燃烧多段补强牌、奖励重掷、奖励推荐度、试剑台风险挑战、法宝、悟道、起手净心悟道、破境、恢复/战斗/经济/精研/悟道型幕间誓约、消耗品与小物爆发路线。
- 战斗中自动存档，可继续到当前敌人、手牌、抽弃牌堆、护盾与回合状态。
- 设置页可查看当前局内存档概况，切换决策提示、主界面日志密度与紧凑手牌布局，并单独放弃未完成试炼，不影响传承进度。
- 精研牌会在手牌、奖励、牌组列表、tooltip 和图鉴中显示等级与强化变化。
- 地图事件、秘境、坊市、调息、修炼、各幕普通/精英战、第一幕雾竹巡山遭遇、后期守阵遭遇、Boss 与终局结算。
- 传承修为、连胜/最高连胜、三连筑基与无伤连破挑战、成就目标提示、挑战卷轴进度、试炼签收集、幕间誓约卷、结局卷轴提示、流派称号、流派志、最近战绩、试玩指南、任务札记、地图路线研判、敌情行动计划、奖励决策摘要、牌组补强优先级、敌人/卡牌/规则/路线节点图鉴与设置。
- 图片素材通过 Godot 导入资源加载，源码包包含 PNG 与必要的 `.import` 文件，校验脚本会检查素材可作为纹理加载并符合 2:3 竖图比例。
- Web 与桌面导出内置精简的 Source Han Sans SC 中文字体，授权文本位于 `assets/fonts/OFL.txt`。
- Image-2 素材清单记录已生成素材、复用策略和下一批中后期牌/敌人/界面背景提示词，完整性检查会验证清单结构、素材路径和卡牌/敌人引用。
- Image-2 生成队列可由 `scripts/export_image2_queue.gd` 从清单导出到 `docs/image2_generation_queue.md`，机器可读批量提示词可由 `scripts/export_image2_batch_prompts.gd` 导出到 `docs/image2_batch_prompts.jsonl`；中后期牌、新敌人和关键事件背景已接入目标路径，成品 PNG 放入对应 `assets/` 路径后会自动优先显示。
- Image-2 成品图可用 `scripts/import_image2_asset.gd -- <asset_id> <source_image>` 按清单导入；`--missing` 会列出仍缺失的目标文件；`--import-dir <directory>` 会按优先级批量导入命名为 `<asset_id>.png/webp/jpg/jpeg` 的成品图；`--fit <asset_id> <source_image>` 或 `--fit --import-dir <directory>` 可把偏比例出图居中裁成卡牌 2:3 或背景 16:9 后导入。脚本会校验目标路径和比例，保存项目 PNG，写回素材清单并刷新生成队列的 present/missing 状态。
- 标题页“美术进度”可直接查看 Image-2 已生成记录、计划队列、当前复用缺口和放图即替换状态，卡牌/敌人/路线节点图鉴与计划资产 tooltip 会标注首批图、复用图、事件背景或 Image-2 计划状态，方便边玩边跟进素材生产。
