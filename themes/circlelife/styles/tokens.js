/**
 * Circle of Life — tokens：:root 设计变量（.dark 覆盖）+ 主题根基础
 * 字体改由 LayoutBase 的 <Head> preconnect + stylesheet 加载（原 @import 串行阻塞渲染）
 */
export const tokenStyle = `
      /* tokens 在 :root 一份：body 上的 portal（抽屉/子菜单/灯箱/手机目录）直接继承 */
      :root {
        color-scheme: light;
        --cl-bg: #f5f0e4;
        --cl-surface: #fcfaf4;
        --cl-paper-2: #eae1cf;
        --cl-paper-3: #dbceb4;
        --cl-text: #20190f;
        --cl-muted: #57493a;
        --cl-faint: #948574;
        --cl-border: rgba(32, 25, 15, 0.11);
        --cl-border-strong: rgba(32, 25, 15, 0.2);
        --cl-accent: #b24a33;
        --cl-accent-press: #97402b;
        --cl-accent-soft: #f0e0d6;
        --cl-accent-ink: #fcfaf4;
        --cl-radius: 10px;
        --cl-radius-sm: 6px;
        --cl-shadow-sm: none;
        --cl-shadow-md: none;
        --cl-font-display: 'Newsreader', 'Noto Serif SC', 'Songti SC', serif;
        --cl-font-body: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
        --cl-font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, monospace;
        --cl-media-radius: 10px;
        --cl-media-ratio: 4 / 3;
        --cl-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
        --cl-dur: 0.28s;
      }

      .dark {
        color-scheme: dark;
        --cl-bg: #14110e;
        --cl-surface: #1a1612;
        --cl-paper-2: #1c1814;
        --cl-paper-3: #261f18;
        --cl-text: #f0e9dc;
        --cl-muted: #c2b7a4;
        --cl-faint: #8c8170;
        --cl-border: rgba(240, 233, 220, 0.12);
        --cl-border-strong: rgba(240, 233, 220, 0.22);
        --cl-accent: #e0a33e;
        --cl-accent-press: #c98a26;
        --cl-accent-soft: #3a2e18;
        --cl-accent-ink: #14110e;
      }

      #theme-circlelife {
        background-color: var(--cl-bg);
        color: var(--cl-text);
        font-family: var(--cl-font-body);
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
      }

      #theme-circlelife a {
        color: inherit;
        text-decoration: none;
      }

      /* 键盘焦点可见：主题根与 body 上的 portal（抽屉/子菜单）一并覆盖 */
      :where(#theme-circlelife, .cl-drawer-root, .cl-toc-drawer-root, .cl-submenu)
        :focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 2px;
      }

      /* 全局减少动效：过渡/动画压到瞬时，平滑滚动改即时 */
      @media (prefers-reduced-motion: reduce) {
        html,
        #theme-circlelife,
        #theme-circlelife *,
        .cl-drawer-root,
        .cl-drawer-root *,
        .cl-toc-drawer-root,
        .cl-toc-drawer-root *,
        .cl-submenu,
        .cl-submenu * {
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
`
