# 用户教程静态网站

教程已通过 **VitePress** 接入本仓库，可部署到 Cloudflare Pages（或其它静态托管）。

## 本地命令

| 命令 | 作用 |
| --- | --- |
| `yarn docs:site:dev` | 本地开发预览 |
| `yarn docs:site:build` | 构建静态站 → `.vitepress/dist` |
| `yarn docs:site:preview` | 预览构建结果 |

## Cloudflare Pages

详见 **[cloudflare-pages-docs.md](./deploy/cloudflare-pages-docs.md)**。

- **组织仓库（推荐）**：GitHub Actions 部署，无需 Cloudflare「连接 Git」  
- **个人仓库**：也可在 CF 控制台直连 Git 构建  

构建命令：`yarn docs:site:build` · 输出：`.vitepress/dist`

## 发布范围

- `docs/user-guide/**` — 主教程  
- `docs/themes/*.md`（中文，排除 `*.en.md`）  
- `docs/DOCUMENTATION_POLICY.md`、`docs/index.md`  

开发者文档（`ARCHITECTURE.md`、`GETTING_STARTED.md` 等）在 `srcExclude` 中排除，不进入静态站。

## 配置位置

- `.vitepress/config.mts` — 导航、侧栏、`srcExclude`  
- `docs/index.md` — 站点首页  
