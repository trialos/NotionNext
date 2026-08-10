# XuHome — NotionNext 新粗野主义博客主题

一款为 [NotionNext](https://github.com/tangly1024/NotionNext) 设计的新粗野主义主题，厚边框、偏移阴影、粗体排版，干净利落。

## 特性

- **新粗野主义设计** — 厚边框、偏移阴影、粗体排版
- **粘性导航栏** — 桌面端下拉菜单 + 移动端汉堡菜单（支持子菜单展开/折叠）
- **打字机 Hero** — 可配置的打字机动画，支持多段文字轮播
- **背景图** — 可调节遮罩透明度
- **深色/浅色模式** — 导航栏切换按钮
- **侧边栏** — 搜索、分类、标签、公告、站点运行时长、最新文章
- **静态导入** — 无首屏白屏问题
- **响应式** — 移动端折叠菜单

## 快速开始

```bash
cp -r xuhome /你的NotionNext目录/themes/
```

在 `blog.config.js` 中设置：

```js
THEME: 'xuhome'
```

或通过环境变量：

```bash
NEXT_PUBLIC_THEME=xuhome
```

然后 `yarn dev`。

## 配置项

编辑 `themes/xuhome/config.js`：

| 键 | 默认值 | 说明 |
|-----|--------|------|
| `XUHOME_BG_IMAGE` | `/bg.webp` | 背景图路径 |
| `XUHOME_HERO_ENABLE` | `true` | 是否显示 Hero 区 |
| `XUHOME_HERO_TITLE` | `''` | Hero 标题（空则用站点标题） |
| `XUHOME_HERO_BIO` | `''` | Hero 简介（空则用站点简介） |
| `XUHOME_HERO_TEXTS` | `['Hello.', ...]` | 打字机文字数组 |
| `XUHOME_HERO_TITLE_COLOR` | `#0284c7` | Hero 标题颜色 |
| `XUHOME_HERO_BIO_COLOR` | `#475569` | Hero 简介颜色 |
| `XUHOME_HERO_TYPE_SPEED` | `80` | 打字速度（毫秒/字） |
| `XUHOME_HERO_DELETE_SPEED` | `40` | 删除速度（毫秒/字） |
| `XUHOME_HERO_TYPE_PAUSE` | `2000` | 打字完成后停留（毫秒） |
| `XUHOME_SIDEBAR` | `true` | 是否显示侧边栏 |
| `XUHOME_UPTIME_ENABLE` | `true` | 是否显示运行时长 |
| `XUHOME_UPTIME_TITLE` | `'Running'` | 运行时长标题 |
| `XUHOME_UPTIME_SINCE` | `'2024-01-01'` | 建站日期 |
| `XUHOME_MENU_ARCHIVE` | `true` | 显示归档链接 |
| `XUHOME_MENU_TAG` | `true` | 显示标签链接 |
| `XUHOME_MENU_SEARCH` | `true` | 显示搜索链接 |

## Notion 配置中心

在 Notion「配置中心」添加行：

| 配置名 | 配置值 | 示例 |
|--------|--------|------|
| `XUHOME_HERO_TITLE` | 你的标题 | `晓蓝` |
| `XUHOME_HERO_BIO` | 你的简介 | `Hi` |
| `XUHOME_HERO_TEXTS` | 竖线分隔 | `Hello\|Welcome\|Enjoy` |
| `XUHOME_HERO_TITLE_COLOR` | 十六进制颜色 | `#0284c7` |
| `XUHOME_HERO_BIO_COLOR` | 十六进制颜色 | `#475569` |
| `XUHOME_UPTIME_SINCE` | 日期字符串 | `2024-01-01` |

## 配色

| 用途 | 色值 |
|------|------|
| 主蓝 | `#0284c7` |
| 悬停蓝 | `#0ea5e9` |
| 黄强调 | `#fde68a` |
| 浅色底 | `#faf8f5` |
| 深色底 | `#0f172a` |
| 卡片 | `#ffffff` / `#1e293b` |

## 许可证

MIT
