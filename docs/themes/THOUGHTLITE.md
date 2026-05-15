# ThoughtLite（NotionNext 移植中）

中文 | 任务计划：[THOUGHTLITE_MIGRATION_PLAN.zh-CN.md](./THOUGHTLITE_MIGRATION_PLAN.zh-CN.md)

## 上游参考

- 源码：[tuyuritio/astro-theme-thought-lite](https://github.com/tuyuritio/astro-theme-thought-lite)（Astro + Svelte，**GPL-3.0**）
- 预览：[thought-lite.ttio.workers.dev](https://thought-lite.ttio.workers.dev/)
- 需求跟踪：[notionnext-org/NotionNext#3987](https://github.com/notionnext-org/NotionNext/issues/3987)

## 当前状态

- 工作分支：**`feat/theme-thoughtlite`**
- 主题目录：**`themes/thoughtlite/`** — 基于 `themes/example` 的**可运行骨架**（配置前缀 `THOUGHTLITE_*`），用于先跑通 NotionNext 数据流；**视觉尚未对齐**上游 ThoughtLite。

## 本地试用

```bash
# .env.local 或环境变量
NEXT_PUBLIC_THEME=thoughtlite
```

或使用 `?theme=thoughtlite`（需主题已在构建扫描列表中）。

## 许可证说明

合并正式版前请阅读迁移计划 **§0**（GPL 与 MIT 兼容性），并在 PR 中写明结论。
