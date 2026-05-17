# Cloudflare Pages 部署文档站（VitePress）

本仓库教程通过 **VitePress** 构建为静态站，适合 **Cloudflare Pages + Git** 自动发布（例如 `notionnext.tangly1024.com`）。

> 与 `yarn export` 博客静态站不同：文档站**不**需要 `NOTION_PAGE_ID`，只读取 `docs/` 下 Markdown。

## 本地预览

```bash
yarn
yarn docs:site:dev
```

浏览器打开终端提示的地址（通常 `http://localhost:5173`）。

## 本地构建

```bash
yarn docs:site:build
yarn docs:site:preview
```

产物目录：**`.vitepress/dist`**

## Cloudflare Pages（连接 Git）

| 配置项 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 框架预设 | **无** |
| 构建命令 | `yarn install && yarn docs:site:build` |
| 构建输出目录 | **`.vitepress/dist`** |
| Node 版本 | `20`（环境变量 `NODE_VERSION=20` 可选） |

### 自定义域

Pages 项目 → **自定义域** → 添加 `notionnext.tangly1024.com`（DNS 需在 Cloudflare）。

### 自动更新

- 修改 `docs/user-guide/**` 等并 **push `main`** → Pages 自动构建新版教程。
- **无需**在 Notion 里改内容，也**无需** `yarn export`。

### 仅文档变更时构建（可选）

在 Pages **构建监视路径** 中填写：

```text
docs/**
.vitepress/**
package.json
yarn.lock
scripts/generate-theme-user-docs.mjs
```

## 发布范围

包含（见 `.vitepress/config.mts` 的 `srcExclude`）：

- `docs/user-guide/**` — 站长教程  
- `docs/themes/*.md`（中文主题长文，不含 `*.en.md`）  
- `docs/DOCUMENTATION_POLICY.md`、`docs/README.md`  

不包含：架构/贡献流程英文副本、`GETTING_STARTED` 等开发者文档（仍在 GitHub 仓库内阅读）。

## 相关

- [WEBSITE.md](../WEBSITE.md) — 站点规划  
- [cloudflare-pages.md](./cloudflare-pages.md) — NotionNext **博客**静态导出（`yarn export`）
