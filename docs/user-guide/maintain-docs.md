# 参与维护在线文档

在线文档站：[https://notionnext.tangly1024.com](https://notionnext.tangly1024.com)

源码与 GitHub 上的 Markdown **一一对应**；改仓库 → 合并 `main` → 自动发布。

## 改当前这一页

任意教程页底部有 **「在 GitHub 上维护此页」**，直达该文件的编辑界面。

## 浏览 / 克隆文档目录

- [docs 目录（GitHub）](https://github.com/notionnext-org/NotionNext/tree/main/docs)
- [docs/README.md（维护总说明）](https://github.com/notionnext-org/NotionNext/blob/main/docs/README.md)
- [user-guide/（站长教程）](https://github.com/notionnext-org/NotionNext/tree/main/docs/user-guide)

## 推荐流程（贡献者）

1. Fork [notionnext-org/NotionNext](https://github.com/notionnext-org/NotionNext) 或具备组织仓库写权限。  
2. 编辑 `docs/user-guide/**/*.md`（主题配置表可运行 `node scripts/generate-theme-user-docs.mjs`）。  
3. 本地预览：`yarn docs:site:dev`。  
4. 提交 PR，合并 **`main`** 后由 GitHub Actions 部署到 Cloudflare Pages。  

详细检查清单：[MAINTENANCE_WORKFLOW.md](./MAINTENANCE_WORKFLOW.md) · 策略：[DOCUMENTATION_POLICY.md](../DOCUMENTATION_POLICY.md)

## 部署原理（简述）

```text
push main（docs/ 或 .vitepress/ 等路径变更）
    → GitHub Actions: yarn docs:site:build
    → 上传 .vitepress/dist
    → Cloudflare Pages（notionnext.tangly1024.com）
```

组织仓库使用 **API Token 部署**，不依赖 Cloudflare「连接 Git」。详见 [cloudflare-pages-docs.md](./deploy/cloudflare-pages-docs.md)。

## 与旧版在线手册

[docs.tangly1024.com](https://docs.tangly1024.com/about) 为历史 Notion 托管；**以本仓库 `docs/user-guide/` 与 notionnext.tangly1024.com 为准**。
