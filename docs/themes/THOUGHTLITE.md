# ThoughtLite（NotionNext 移植中）

中文 | 任务计划：[THOUGHTLITE_MIGRATION_PLAN.zh-CN.md](./THOUGHTLITE_MIGRATION_PLAN.zh-CN.md)

## 上游参考

- 源码：[tuyuritio/astro-theme-thought-lite](https://github.com/tuyuritio/astro-theme-thought-lite)（Astro + Svelte，**GPL-3.0**）
- 预览：[thought-lite.ttio.workers.dev](https://thought-lite.ttio.workers.dev/)
- 需求跟踪：[notionnext-org/NotionNext#3987](https://github.com/notionnext-org/NotionNext/issues/3987)

## 当前状态

- 工作分支：**`feat/theme-thoughtlite`**
- 主题目录：**`themes/thoughtlite/`** — 已接入 **ThoughtLite 取向** 的顶栏、CSS 变量主题色、首页 **Latest 卡片**、**按日发布日时间线**、文章页 **卡片式标题区 + 正文 prose 包裹**、侧栏 **仅文章页显示**（可配置）、评论区 **SSR 关闭** 等；仍可按计划继续微调像素级对齐上游 Astro 版。
- 主题切换面板：已在 **`conf/themeSwitch.manifest.js`** 注册 **`thoughtlite`**；预览资源为 **`public/images/themes-preview/thoughtlite.png`** 与 **`.webp`**（当前由 `endspace` 预览图复制占位，合并前请替换为真实截图并可运行 `yarn perf:compress-theme-previews` 重生成 webp）。

## 本地试用

```bash
# .env.local 或环境变量
NEXT_PUBLIC_THEME=thoughtlite
```

或使用 `?theme=thoughtlite`（需主题已在构建扫描列表中）。

## 许可证说明

合并正式版前请阅读迁移计划 **§0**（GPL 与 MIT 兼容性），并在 PR 中写明结论。
