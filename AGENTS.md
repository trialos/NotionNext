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

## 2. 视觉设计与私有知识库自动探测机制（强制执行，无需博主提醒）

1. **自动探测与全域路由（零心智负担）**：
   * AI 在执行任何涉及 UI、样式、排版、组件交互、页面优化或主题逻辑的任务时，**必须主动自动探测同级私有知识库**（探测路径：`../withcol-private` 或 `withcol-private/`）：
     - **若私有库存在（本地环境）**：AI **必须在动手前自动查阅** `withcol-private/docs/design-system/circlelife-DESIGN.md`（纸感视觉 Token、色值、排版标准）与 `withcol-private/docs/architecture/circlelife-THEME-ARCH.md`（展墙算法与交互架构），以此为最高权威基准。博主无需每次手动提醒；
     - **若私有库不存在（开源外部环境）**：回退至本仓库既有的默认代码实现与开源通用规范执行。
2. **支持博主自由演进与回写沉淀**：
   * 设计系统是“活的资产”。当博主提出视觉改造、版式实验或新元素尝试时，AI 应敏捷配合；在博主确认满意后，协助将沉淀的新 Token 同步回写至私有库的 `circlelife-DESIGN.md` 中。
3. **防外泄红线**：
   * 即使读取了私有库文档，**严禁**将私有凭据、敏感 ID 或私密设计资产逆向写入本公开仓库的文档或代码中。
4. **主题隔离**：
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
4. **Notion 数据拉取（构建期）**：
   * 本机访问 `app.notion.com/api/v3` 会被 Cloudflare 拦（403）→ 构建日志出现 `[API<<--异常]: FetchError 403 Forbidden` → 站点回退到「oops」占位页 → 报 `.prev` 序列化错误（退出码 1）。**绕过**：构建时加环境变量 `API_BASE_URL=https://www.notion.so/api/v3`（`blog.config.js` 读该变量；**不要**改仓库默认值，Vercel 侧不受影响）。
   * 失败构建会把占位数据写进 `.next/cache/notion/data/`（`global_data_*` / `site_*` / `build_static_paths_all_pages_*` 四个小文件）→ 之后即使网络恢复也会持续命中坏缓存、构建永远失败 → 需先删掉这几个文件再重建。

---

## 5. 特殊避坑提示

* **主题说明防混淆**：`docs/developer/themes/CLAUDE.md` 为 NotionNext 自带主题 “claude” 的说明文档，**不是** Claude AI 的系统指令。
* **私密凭据隔离**：本地生产凭据底座已安全隔离至私有库 `../withcol-private/docs/secrets/handover.local.md`（或受 `.git/info/exclude` 保护）。AI 可在本地按需查阅，**严禁提交入库或推送到远端**。
* **快速查阅**：全仓模块索引、冲突裁决与任务路由见根目录 **`PROJECT_MAP.md`**。
