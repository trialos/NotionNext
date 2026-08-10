# XuHome - Neubrutalist Blog Theme for NotionNext

A bold neubrutalist theme for [NotionNext](https://github.com/tangly1024/NotionNext), inspired by developer tool aesthetics with thick borders, offset shadows, and a clean reading experience.

## Features

- **Neubrutalist Design** — thick borders, offset shadows, bold typography
- **Sticky Navbar** — with desktop dropdown menus and mobile hamburger menu
- **Typewriter Hero** — configurable typing animation with multiple text strings
- **Background Image** — with semi-transparent overlay
- **Dark/Light Mode** — with toggle button
- **Sidebar** — search, categories, tags, announcement, site uptime, latest posts
- **Static Imports** — no hydration flash issues
- **Responsive** — mobile-friendly with collapsible menu and submenus

## Installation

1. Copy the `xuhome` folder into your NotionNext `themes/` directory
2. Set the theme in `blog.config.js`:

```js
THEME: 'xuhome'
```

Or via environment variable:

```bash
NEXT_PUBLIC_THEME=xuhome
```

3. Restart your dev server:

```bash
yarn dev
```

## Configuration

Edit `themes/xuhome/config.js`:

| Key | Default | Description |
|-----|---------|-------------|
| `XUHOME_BG_IMAGE` | `/bg.webp` | Background image URL |
| `XUHOME_HERO_ENABLE` | `true` | Show hero section |
| `XUHOME_HERO_TITLE` | `'晓蓝'` | Hero title (fallback if no texts) |
| `XUHOME_HERO_BIO` | `'Hi'` | Hero bio text |
| `XUHOME_HERO_TEXTS` | `['Hello', 'Welcome']` | Typewriter texts (pipe-separated) |
| `XUHOME_HERO_TITLE_COLOR` | `#0284c7` | Hero title color |
| `XUHOME_HERO_BIO_COLOR` | `#475569` | Hero bio color |
| `XUHOME_HERO_TYPE_SPEED` | `80` | Typing speed (ms) |
| `XUHOME_HERO_DELETE_SPEED` | `40` | Delete speed (ms) |
| `XUHOME_HERO_TYPE_PAUSE` | `2000` | Pause before deleting (ms) |
| `XUHOME_SIDEBAR` | `true` | Show sidebar |
| `XUHOME_UPTIME_ENABLE` | `true` | Show site running time |
| `XUHOME_UPTIME_TITLE` | `'Running'` | Uptime title |
| `XUHOME_UPTIME_SINCE` | `'2024-01-01'` | Site start date |
| `XUHOME_MENU_ARCHIVE` | `true` | Show archive link |
| `XUHOME_MENU_TAG` | `true` | Show tags link |
| `XUHOME_MENU_SEARCH` | `true` | Show search link |

## Notion Config

You can also set these in your Notion "配置中心" (Config Center):

| 配置名 | 配置值 | Example |
|--------|--------|---------|
| `XUHOME_HERO_TITLE` | Your hero title | `晓蓝` |
| `XUHOME_HERO_BIO` | Your bio text | `Hi` |
| `XUHOME_HERO_TEXTS` | Pipe-separated texts | `Hello|Welcome|Enjoy` |
| `XUHOME_HERO_TITLE_COLOR` | Hex color | `#0284c7` |
| `XUHOME_HERO_BIO_COLOR` | Hex color | `#475569` |
| `XUHOME_UPTIME_SINCE` | Date string | `2024-01-01` |

## Color Scheme

| Usage | Color | Value |
|-------|-------|-------|
| Primary | Sky Blue | `#0284c7` |
| Hover | Lighter Blue | `#0ea5e9` |
| Accent | Warm Yellow | `#fde68a` |
| Light BG | Warm Cream | `#faf8f5` |
| Dark BG | Slate | `#0f172a` |
| Cards | White / Slate-800 | `#ffffff` / `#1e293b` |

## License

MIT
