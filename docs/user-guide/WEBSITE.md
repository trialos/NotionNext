# 用户教程静态网站（规划）

`docs/user-guide/` 中的 Markdown 计划通过静态站点生成器发布为可浏览网站，用于逐步替换 [docs.tangly1024.com](https://docs.tangly1024.com/about)。

## 推荐方案

| 方案 | 说明 |
| --- | --- |
| **VitePress** | 轻量、适合 `docs/**/*.md`，侧边栏可手写于 `.vitepress/config.ts` |
| **Nextra** | 与 Next.js 同栈，适合与 NotionNext 主站同仓 monorepo 部署 |
| **继续 Gitbook 主题** | 与当前线上一致，需单独构建流水线 |

## 建议目录映射

```
docs/user-guide/README.md     → 站点首页 / 导航
docs/user-guide/*.md          → 用户教程页面
docs/themes/*.md              → 「主题参数」分区
docs/DOCUMENTATION_POLICY.md  → 「维护说明」页
```

## 实施清单（后续 PR）

- [ ] 选定生成器并在 `package.json` 增加 `docs:dev` / `docs:build`
- [ ] 配置侧边栏与搜索
- [ ] CI 部署到 `docs.notionnext.org` 或子路径（由维护者决定）
- [ ] 根目录 `README.md` 与 Vercel 部署页环境变量说明指向新文档站

当前阶段：**以 GitHub 上 Markdown 为准**，可直接在 IDE 或 GitHub 网页阅读。
