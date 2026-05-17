# NotionNext 文档（`docs/`）

中文 | [English](./README.en.md)

| | |
| --- | --- |
| **在线阅读（推荐）** | [https://notionnext.tangly1024.com](https://notionnext.tangly1024.com) |
| **本目录（GitHub）** | [notionnext-org/NotionNext/tree/main/docs](https://github.com/notionnext-org/NotionNext/tree/main/docs) |

---

## 如何维护在线文档（快速上手）

1. **改内容**：编辑 [`user-guide/`](./user-guide/) 下对应 `.md`（站长教程主体）。  
2. **本地预览**：仓库根目录执行 `yarn` → `yarn docs:site:dev`。  
3. **提交**：向 `main` 提 PR；合并后自动发布到 [notionnext.tangly1024.com](https://notionnext.tangly1024.com)。  
4. **单页入口**：在线文档每页底部 **「在 GitHub 上维护此页」** 链到本文件在 GitHub 的编辑地址。

更完整的步骤、目录秩序与 PR 检查清单 → [user-guide/MAINTENANCE_WORKFLOW.md](./user-guide/MAINTENANCE_WORKFLOW.md)  
策略说明 → [DOCUMENTATION_POLICY.md](./DOCUMENTATION_POLICY.md)

### 改主题说明时

- 站长向：[`user-guide/themes/<主题id>.md`](./user-guide/themes/)（25 篇）  
- 刷新配置表：`node scripts/generate-theme-user-docs.mjs`（`proxio` / `heo` 仅更新配置表段落）  
- 开发者长篇：`themes/CLAUDE.md` 等（部分不进入静态站，见下方「发布范围」）

---

## 文档站部署原理

在线站 **不是** `yarn export` 博客，而是 **VitePress** 把本目录下部分 Markdown 编译为静态 HTML。

```text
GitHub 仓库 docs/user-guide/*.md 等
        │
        ▼  push main（变更 docs/** 或 .vitepress/**）
GitHub Actions：yarn docs:site:build
        │
        ▼  产物 .vitepress/dist
Cloudflare Pages → notionnext.tangly1024.com
```

- **不需要** `NOTION_PAGE_ID`。  
- 组织仓库部署：GitHub Actions + Cloudflare API Token（见 [user-guide/deploy/cloudflare-pages-docs.md](./user-guide/deploy/cloudflare-pages-docs.md)）。  
- 配置入口：仓库根目录 [`.vitepress/config.mts`](../.vitepress/config.mts)。

---

## `docs/` 目录结构

| 路径 | 用途 | 是否进入在线站 |
| --- | --- | --- |
| [`user-guide/`](./user-guide/) | 部署、配置、主题、评论等**站长教程** | 是（主体） |
| [`user-guide/reference/`](./user-guide/reference/) | 4.9.x 配置索引、Notion 4.x | 是 |
| [`user-guide/themes/`](./user-guide/themes/) | 25 个主题说明 | 是 |
| [`DOCUMENTATION_POLICY.md`](./DOCUMENTATION_POLICY.md) | 文档维护策略 | 是 |
| [`index.md`](./index.md) | VitePress 站点首页 | 是 |
| [`themes/`](./themes/) | 主题开发者长文、存根 | 部分（排除易构建失败的 CLAUDE 等长文） |
| `GETTING_STARTED.md`、`ARCHITECTURE.md` 等 | **开发者**接入与架构 | 否（仅 GitHub 阅读） |
| [`README.md`](./README.md) | **本文件**，维护与目录说明 | 否（GitHub 浏览用） |

在线站导航入口：[user-guide/README.md](./user-guide/README.md) · 官方 slug 对照：[ARTICLE_INDEX.md](./user-guide/ARTICLE_INDEX.md)

---

## 用户使用说明（索引）

| 主题 | 文档 |
| --- | --- |
| 快速开始 | [user-guide/intro.md](./user-guide/intro.md) |
| 部署 / 配置 / 升级 | [user-guide/deploy-vercel.md](./user-guide/deploy-vercel.md) · [config-site.md](./user-guide/config-site.md) |
| 25 个主题 | [user-guide/themes/README.md](./user-guide/themes/README.md) |
| 参与维护 | [user-guide/maintain-docs.md](./user-guide/maintain-docs.md) |

---

## 开发者文档（中英）

| 主题 | 中文 | English |
| --- | --- | --- |
| 快速上手 | [GETTING_STARTED.md](./GETTING_STARTED.md) | [GETTING_STARTED.en.md](./GETTING_STARTED.en.md) |
| 架构总览 | [ARCHITECTURE.md](./ARCHITECTURE.md) | [ARCHITECTURE.en.md](./ARCHITECTURE.en.md) |
| 配置体系 | [CONFIGURATION.md](./CONFIGURATION.md) | [CONFIGURATION.en.md](./CONFIGURATION.en.md) |
| 贡献流程 | [CONTRIBUTION_WORKFLOW.md](./CONTRIBUTION_WORKFLOW.md) | [CONTRIBUTION_WORKFLOW.en.md](./CONTRIBUTION_WORKFLOW.en.md) |
| 主题迁移 | [THEME_MIGRATION_GUIDE.zh-CN.md](./THEME_MIGRATION_GUIDE.zh-CN.md) | [THEME_MIGRATION_GUIDE.md](./THEME_MIGRATION_GUIDE.md) |

---

## 仓库与组织

主仓库：[notionnext-org/NotionNext](https://github.com/notionnext-org/NotionNext)。克隆后建议：

```bash
git remote set-url origin https://github.com/notionnext-org/NotionNext.git
```

详见 [CONTRIBUTING.zh-CN.md](../CONTRIBUTING.zh-CN.md)。
