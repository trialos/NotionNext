# NotionNext 文档导航

中文 | [English](./README.en.md)

本目录用于帮助开源贡献者和新开发者快速理解项目并安全协作。

## 仓库与组织

主仓库现由 GitHub 组织 **[notionnext-org](https://github.com/notionnext-org)** 管理（canonical：`https://github.com/notionnext-org/NotionNext`），已从个人账号迁移以便长期治理。**欢迎加入组织**参与协作（以组织内说明为准）。若在迁移前已克隆本地仓库，建议执行：

```bash
git remote set-url origin https://github.com/notionnext-org/NotionNext.git
```

详见 [贡献指南（中文）](../CONTRIBUTING.zh-CN.md#仓库与组织) / [Contributing (English)](../CONTRIBUTING.md#repository-and-organization)。

> **使用说明（站长 / 部署者）**：自 2026 年起，部署教程以 **[`docs/user-guide/`](./user-guide/README.md)** 在本仓库内持续维护，并逐步替代仅托管在 Notion 的 [docs.tangly1024.com](https://docs.tangly1024.com/about)。  
> **维护文档**：策略 [DOCUMENTATION_POLICY.md](./DOCUMENTATION_POLICY.md) · 工作流 [MAINTENANCE_WORKFLOW.md](./user-guide/MAINTENANCE_WORKFLOW.md)

## 用户使用说明（中文）

| 主题 | 文档 |
| --- | --- |
| 目录与维护策略 | [user-guide/README.md](./user-guide/README.md) · [DOCUMENTATION_POLICY.md](./DOCUMENTATION_POLICY.md) |
| 完整索引 | [ARTICLE_INDEX.md](./user-guide/ARTICLE_INDEX.md)（官方文档对照表） |
| 介绍 / 部署 / 配置 / 升级 | [user-guide/README.md](./user-guide/README.md) |
| 4.9.x 参考 · 全主题说明 | [reference/features.md](./user-guide/reference/features.md) · [themes/README.md](./user-guide/themes/README.md)（25 篇） |
| 部署专题 / 评论 / 统计 / 插件 | [deploy/](./user-guide/deploy/) · [comments/](./user-guide/comments/) · [analytics/](./user-guide/analytics/) · [plugins/](./user-guide/plugins/) |
| Proxio · HEO · ThoughtLite | [proxio.md](./user-guide/themes/proxio.md) · [heo.md](./user-guide/themes/heo.md) · [THOUGHTLITE.md](./themes/THOUGHTLITE.md) |
| 迁移状态 | [MIGRATION_STATUS.md](./user-guide/MIGRATION_STATUS.md)（核心栏目已完成） |

## 文档入口（中英双语）

| 主题 | 中文 | English |
| --- | --- | --- |
| 快速上手 | [GETTING_STARTED.md](./GETTING_STARTED.md) | [GETTING_STARTED.en.md](./GETTING_STARTED.en.md) |
| 架构总览 | [ARCHITECTURE.md](./ARCHITECTURE.md) | [ARCHITECTURE.en.md](./ARCHITECTURE.en.md) |
| 目录与模块说明 | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | [PROJECT_STRUCTURE.en.md](./PROJECT_STRUCTURE.en.md) |
| 配置体系说明 | [CONFIGURATION.md](./CONFIGURATION.md) | [CONFIGURATION.en.md](./CONFIGURATION.en.md) |
| 提交与 PR 规范 | [CONTRIBUTION_WORKFLOW.md](./CONTRIBUTION_WORKFLOW.md) | [CONTRIBUTION_WORKFLOW.en.md](./CONTRIBUTION_WORKFLOW.en.md) |
| 维护与变更尺度 | [MAINTENANCE_PHILOSOPHY.zh-CN.md](./MAINTENANCE_PHILOSOPHY.zh-CN.md) | [MAINTENANCE_PHILOSOPHY.en.md](./MAINTENANCE_PHILOSOPHY.en.md) |
| 主题迁移指南 | [THEME_MIGRATION_GUIDE.zh-CN.md](./THEME_MIGRATION_GUIDE.zh-CN.md) | [THEME_MIGRATION_GUIDE.md](./THEME_MIGRATION_GUIDE.md) |
| 社区官网能力扩展路线 | [COMMUNITY_SITE_ROADMAP.md](./COMMUNITY_SITE_ROADMAP.md) | — |

## 主题文档

- [Themes Documentation](./themes/README.md)
- [Proxio 顶栏导航](./user-guide/themes/proxio.md#右上角导航定制)
- [ThoughtLite Theme](./themes/THOUGHTLITE.md)
- [Claude Theme](./themes/CLAUDE.md)
- [Endspace Theme](./themes/ENDSPACE.md)
- [Fuwari Theme](./themes/FUWARI.md)

## 文档目标

- 降低新贡献者的接入门槛
- 统一项目协作流程，减少重复沟通
- 避免个性化配置误提交导致冲突
- 让 PR 评审聚焦业务代码而非环境差异

