# 最新版本与更新日志

> 当前主线：**4.10.2**（见根目录 `package.json`）

## 4.10.2 发布要点

本版本重点提升静态导出与 Cloudflare Pages 等平台的构建效率，并修复 Giscus 登录回跳后仍提示登录的问题。

### 构建性能优化

- 新增 Notion 页面正文的版本化构建缓存：正文缓存键会带上文章 `lastEditedDate`，未更新过的文章在下一次构建中可直接复用上次缓存。
- 构建开始时仍会重新拉取 Notion 数据库索引，确保新文章、隐藏文章、删除文章、slug 与更新时间可以及时生效。
- 构建清理策略改为只清理数据库索引、静态路径与当前构建 session 等临时缓存，默认保留版本化 `page_block` 正文缓存。
- `prefetchAllBlockMaps` 会优先检查版本化正文缓存；缓存命中时不再请求 Notion 页面正文。
- 单篇文章页、公告页和全文搜索读取正文缓存时统一使用版本化缓存键，避免预热缓存和页面渲染缓存不一致。
- 新增 `NOTION_BUILD_CACHE_PURGE_DATA=true`，需要彻底清理构建缓存时可手动开启。

### Giscus 评论修复

- 修复 Giscus OAuth 回跳后 `?giscus=...` 参数被页面容器过早清理的问题。
- 现在 Giscus 脚本会先消费 OAuth 回调 token 并写入 `localStorage`，再清理地址栏参数，避免登录后仍显示“登录后可以评论”。

### 适用场景

- Cloudflare Pages、Netlify、Vercel 或自托管 CI 中使用 `yarn build` / `yarn export`。
- 文章数量较多，但每次发布只修改少量 Notion 页面。
- 构建日志里频繁出现大量 `from:prefetch` / `getPage` 请求，或者部署时间主要消耗在 Notion 页面正文拉取。

### 使用说明

- Cloudflare Pages 请确保 Build cache 已开启，平台才能在下一次构建恢复 `.next/cache`。
- 正常情况下无需设置新环境变量。
- 如果怀疑构建缓存损坏，临时设置 `NOTION_BUILD_CACHE_PURGE_DATA=true` 后重新部署一次即可清空持久正文缓存。

### 验证

- `npx eslint lib\db\notion\getPostBlocks.js lib\build\prefetch.js lib\db\SiteDataApi.js pages\search\[keyword]\index.js pages\search\[keyword]\page\[page].js next.config.js`：通过。
- `node -e "require('./next.config.js')"`：通过。
- `git diff --check`：通过。

## 如何升级

- 站长升级：见 [版本升级指引](../update.md)。
- 构建性能与 Notion API 限流：见 [构建性能与 Notion API 限流](../deploy/build-tuning.md)。
- GitHub Release：[NotionNext Releases](https://github.com/notionnext-org/NotionNext/releases)。

## 历史版本全文

- [V4 历史](./v4-history.md)
- 源站：https://docs.tangly1024.com/article/latest
