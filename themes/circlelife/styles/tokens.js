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
        /* 暖金辅助强调：深浅模式共用一套值，暗底上通过阴影与描边区分层次 */
        --cl-gold: #c4a47c;
        --cl-gold-ink: #ffffff;
        --cl-gold-shadow: rgba(196, 164, 124, 0.4);
        --cl-radius: 10px;
        --cl-radius-sm: 6px;
        --cl-shadow-sm: none;
        --cl-shadow-md: none;
        --cl-font-display: 'Newsreader', 'Noto Serif SC', 'Songti SC', 'STSong', 'Songti TC', 'HiraMinProN-W3', serif;
        --cl-font-body: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
        --cl-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        --cl-media-radius: 10px;
        --cl-media-ratio: 4 / 3;
        --cl-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
        --cl-dur: 0.28s;
        /* 导航带几何（全站唯一真源）：悬浮胶囊顶边 / 胶囊实高 / 带底边。
           所有需要让开导航栏的浮层一律由 --cl-nav-band 推导，禁止再写死像素 */
        --cl-nav-top: max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.65rem));
        --cl-nav-height: 2.5rem;
        --cl-nav-band: calc(var(--cl-nav-top) + var(--cl-nav-height));
        /* 宽屏页面容器（归档等大屏模块共用）：最大宽 / 流动 gutter / 双栏间距 */
        --cl-wide-max: 112.5rem;
        --cl-wide-pad: clamp(1rem, 3vw, 3rem);
        --cl-wide-gap: clamp(2rem, 3.5vw, 4rem);
        /* —— 文章正文排版 token（--cl-prose-*）：正文节奏的唯一真源 —— */
        --cl-prose-size: 1.06rem; /* 正文字号（约 17px；行宽由 --cl-prose-measure 控制） */
        --cl-prose-leading: 1.85; /* 正文行高 */
        --cl-prose-indent: 2em; /* 首行缩进 */
        --cl-prose-gap: 0.5em; /* 段间距（与缩进叠加的呼吸量） */
        --cl-prose-h1: 1.6rem; /* 文内 H1/H2/H3 衬线阶梯 */
        --cl-prose-h2: 1.28rem;
        --cl-prose-h3: 1.1rem;
        --cl-prose-h1-gap: 2.6em; /* 标题前置大留白（章节呼吸） */
        --cl-prose-h2-gap: 2.4em;
        --cl-prose-h3-gap: 2em;
        --cl-prose-block-gap: 1.5em; /* 引用/callout/代码/分割线上下距 */
        --cl-prose-media-gap: 1.6em; /* 图片上下距 */
        --cl-prose-caption-size: 0.8rem; /* 图注字号 */
        --cl-prose-code-size: 0.85em; /* 代码块字号 */
        --cl-prose-code-leading: 1.7; /* 代码块行高 */
        --cl-prose-measure: 60rem; /* 正文列测量宽（宽屏阅读，约 56 个中文字符/行） */
        /* —— 全屏文章壳 token（--cl-article-*）：与影集/归档同构的宽页面 —— */
        --cl-article-shell: 88rem; /* 宽容器：轨 15rem + 距 3rem + 正文列（测量宽封顶） */
        --cl-article-rail: 15rem; /* TOC 细轨宽 */
        --cl-article-gap: 3rem; /* 轨-正文列间距 */
        --cl-article-pad: clamp(1rem, 3vw, 2.5rem); /* 宽容器左右 gutter */
        --cl-article-cover-h: clamp(280px, 42vh, 480px); /* 全出血封面高 */
        --cl-article-cover-fade-h: 65%; /* 封面底部渐隐溶入纸面的区域占比 */
      }

      /* ≤1023px：胶囊内嵌 2.35rem 汉堡按钮，导航带随之变高。
         --cl-nav-band 在计算值时才展开，会自动跟随本覆盖，无需重复声明 */
      @media (max-width: 1023px) {
        :root {
          --cl-nav-height: 3.25rem;
        }
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

      html:has(#theme-circlelife),
      html:has(#theme-circlelife) body {
        background-color: var(--cl-bg);
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

      /* 键盘焦点可见：主题根与 body 上的移动目录 portal 一并覆盖 */
      :where(#theme-circlelife, .cl-toc-drawer-root) :focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 2px;
      }

      /* 全局减少动效：过渡/动画压到瞬时，平滑滚动改即时 */
      @media (prefers-reduced-motion: reduce) {
        html,
        #theme-circlelife,
        #theme-circlelife *,
        .cl-toc-drawer-root,
        .cl-toc-drawer-root * {
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
`
