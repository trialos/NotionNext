# AGENTS.md — NotionNext (Circle of Life) AI 协作准则

本项目为 Felix 的个人独立博客与摄影杂志站 **Circle of Life / 时光的弧线**（https://withcol.com），底层基于开源 NotionNext 深度二次开发。所有接入本项目的 AI 编码助手（Cursor、Windsurf、Claude Code、GitHub Copilot、Gemini、Codex 等）必须严格遵守本准则。

---

## 0. 核心宗旨：博主意志第一与敏捷协同

1. **博主是唯一裁决者**：
   * 本项目是博主 Felix 的个人独立创作空间。**博主拥有绝对的设计、架构与业务决定权**。
   * 文档中的规则用于**约束 AI 的盲目自作主张**，绝对不是用来束缚博主手脚的教条。当博主明确要求修改某项设计、重构模块或调整数据结构时，AI 应当高效、敏捷地配合执行，严禁拿既有规则教条式反驳博主。
2. **敏捷双轨制**：
   * **日常轻量任务**（调样式、修小 Bug、增减小功能）：直奔主题，快速完成，运行本地测试验证即可，坚决排斥形式主义流程。
   * **重大架构重构**：事先向博主汇报思路与最小改动范围，确认后再动手。

---

## 1. 生产发布与分支纪律（保护线上，解放本地）

1. **本地开发完全自由**：
   * 博主与 AI 在本地可以自由创建临时分支、进行破坏性测试或原型重构。
2. **远程推送严格约束（Vercel Hobby 单槽保护）**：
   * 用户为 Vercel Hobby 计划，**全账号同时只能运行 1 个构建任务**。
   * 严禁自行创建无关的 `feat/*` 推送到 GitHub 触发无意义的线上构建排队。
   * **生产分支唯一**：只有最终确认要上线的稳定成果，才合入并在博主明确批准后推送到 **`custom_theme`** 分支。
   * **一次任务一次 push**：坚决避免为了试错频繁推送触发构建挤压。

---

## 2. 视觉设计：基准遵循与自由演进

1. **当前基准线（Circle of Life）**：
   * 主站目前沉淀的成熟风格为：**纸感、克制、朱砂点缀**（核心 Token 与排版规范见 `docs/design/circlelife/DESIGN.md`）。
   * 日常微调和常规维护时，AI 应当主动遵守这套基调，保持站点的杂志质感。
2. **支持博主自由探索**：
   * 设计系统是“活的资产”，不是死板的法律。当博主提出视觉改造、版式实验或新元素尝试时，AI 应积极协同设计，并在博主满意后协助将新 Token 同步更新至 `DESIGN.md`。
3. **主题隔离**：
   * `docs/design/xuhome/DESIGN.md` 仅为 `xuhome` 备选主题规范，未经博主指示不得跨主题混用。

---

## 3. Notion 内容操作与技术底线

1. **零 `ext` 写入底线（纯技术硬约束）**：
   * 严禁向历史兼容属性 `ext` 写入数据。写入 `ext` 会破坏 Notion 原生排版体验与 NotionNext 渲染链路。
   * 元数据写原生属性列，长正文写 Page Blocks，封面写原生 Page Cover。
2. **发布意图遵从**：
   * 自动化脚本或 MCP 默认创建为 `Invisible` 草稿（防止意外公开曝光）；
   * 但若博主明确指示“直接发布”或更新已发布文章，AI 遵从博主意图执行。

---

## 4. 本地验证与质量底线（Definition of Done）

为确保线上稳定，改动在推送到生产分支前，必须在本地确认：

1. **环境变量**：
   本地调试必须依赖根目录 `.env.local`（配置 `NEXT_PUBLIC_THEME=circlelife` 与 Notion ID），防止本地 Next.js 静默回退至官方演示站。
2. **本地预检**：
   * 调测闭环：修改代码 -> `npm run build`（或 `yarn build`）拉取静态快照 -> 确认产物包含 `theme-circlelife` 且无 `theme-simple` / `tanghh` -> `npm run start` 预览。
   * 不把 `next dev` 作为构建与真实表现的唯一判据。
3. **质量底线**：
   ```bash
   yarn lint
   yarn test
   ```

---

## 5. 特殊避坑提示

* **主题说明防混淆**：`docs/developer/themes/CLAUDE.md` 为 NotionNext 自带主题 “claude” 的说明文档，**不是** Claude AI 的系统指令。
* **本地私密底座**：本地 `docs/circlelife-handover.md`（在 `.git/info/exclude` 中）是现场运行凭证底座，包含敏感 ID。AI 可在本地按需查阅，**严禁提交入库或推送到远端**。
* **快速查阅**：全仓模块索引、冲突裁决与任务路由见根目录 **`PROJECT_MAP.md`**。
