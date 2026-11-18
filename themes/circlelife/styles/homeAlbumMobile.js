/**
 * 首页精选影集段 · 手机端 C 方案样式（对开书页）
 *
 * 桌面（≥1024）完全由 home.js 的 .cl-home-album 静态版承载，本文件默认隐藏手机组件。
 * ≤1023 隐藏静态版、显示本方案：100svh 面板 + 原生横向轨道，交互骨架对齐 homeArticles.js。
 *
 * 与文章段的有意差异（读起来是「书」）：
 * 1. 主封面是 4:5 带相纸边的印相（收进 gutter、圆角），不做 100vw 满幅出血。
 * 2. 题签卡压在印相下缘（负 margin、普通文档流，不碰 transform）。
 * 3. 底部是书页页码 tabs，不是文章段的时间刻度尺。
 *
 * 所有几何走 --cl-* token；不硬编码色值；不引入 transform / sticky / 动画库。
 */
export const homeAlbumMobileStyle = `
  /* 桌面默认：手机方案不渲染 */
  #theme-circlelife .cl-home-album-m { display: none; }

  @media (max-width: 1023px) {
    /* 手机：静态一大三小退场，C 方案接手 */
    #theme-circlelife .cl-home-album { display: none; }

    #theme-circlelife .cl-home-album-m {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr) auto;
      position: relative;
      height: 100svh;
      max-width: var(--cl-wide-max);
      margin-inline: auto;
      padding: var(--cl-home-section-pad) var(--cl-wide-pad)
        max(1rem, env(safe-area-inset-bottom));
      overflow: hidden;
    }

    #theme-circlelife .cl-home-album-m-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      grid-row: 1;
      padding-bottom: 0.9rem;
      border-bottom: 1px solid var(--cl-border);
    }
    #theme-circlelife .cl-home-album-m-kicker {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      color: var(--cl-muted);
    }
    /* 与文章段时间尺游标 / 桌面静态版眉题同一条 2px 朱砂位置线 */
    #theme-circlelife .cl-home-album-m-kicker::before {
      content: '';
      display: block;
      width: 2px;
      height: 0.95em;
      background: var(--cl-home-mark);
    }
    #theme-circlelife .cl-home-album-m-count {
      margin: 0;
      font-family: var(--cl-font-mono);
      font-size: 0.6875rem;
      letter-spacing: 0.08em;
      color: var(--cl-faint);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    #theme-circlelife .cl-home-album-m-stage {
      min-width: 0;
      min-height: 0;
      grid-row: 2;
    }
    #theme-circlelife .cl-home-album-m-viewport {
      height: 100%;
      outline: none;
    }
    #theme-circlelife .cl-home-album-m-viewport:focus-visible {
      outline: 2px solid var(--cl-accent);
      outline-offset: 6px;
    }
    #theme-circlelife .cl-home-album-m-rail {
      display: flex;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      overscroll-behavior-x: contain;
      scroll-behavior: smooth;
    }
    #theme-circlelife .cl-home-album-m-rail::-webkit-scrollbar { display: none; }

    #theme-circlelife .cl-home-album-m-slide {
      flex: 0 0 100%;
      min-width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }

    /* 带相纸边的 4:5 印相：宽度由 JS 按题签卡实测高度写入 --plate-w，
       CSS 的 min() 只是首帧兜底；矮屏自动收窄，卡片不压住页码。 */
    #theme-circlelife .cl-home-album-m-plate {
      margin: 0;
      width: var(
        --plate-w,
        min(
          calc(100vw - 2 * var(--cl-wide-pad)),
          calc((100svh - 16rem) * 0.8)
        )
      );
      max-width: 420px;
    }
    #theme-circlelife .cl-home-album-m-mat {
      padding: 8px;
      background: var(--cl-paper);
      border: 1px solid var(--cl-border);
    }
    #theme-circlelife .cl-home-album-m-cover {
      display: block;
      width: 100%;
      max-width: none;
      aspect-ratio: 4 / 5;
      background: var(--cl-paper-2);
    }

    /* 题签卡压在印相下缘：负 margin 轻微叠压，普通文档流、不碰 transform
       （首页题字 fixed 祖先链禁用包含块属性）。整张卡即链接，点标题即可进影集。
       只留朱砂页码签 + 一道细线 + 辑名，去掉张数/日期/CTA，尽量把高度让给印相。 */
    #theme-circlelife .cl-home-album-m-card {
      position: relative;
      display: block;
      width: calc(var(--plate-w, 100%) - 2rem);
      max-width: 30rem;
      margin: -2.2rem auto 0;
      padding: 1.35rem 1.2rem 1.15rem;
      background: var(--cl-surface);
      border: 1px solid var(--cl-border);
      color: inherit;
      text-decoration: none;
    }
    /* 书页页码 01/04：贴题签卡上缘的朱砂小签 */
    #theme-circlelife .cl-home-album-m-folio {
      position: absolute;
      top: -0.7rem;
      right: 0.9rem;
      padding: 0.15rem 0.5rem;
      background: var(--cl-accent);
      color: var(--cl-accent-ink);
      font-family: var(--cl-font-mono);
      font-size: 0.625rem;
      letter-spacing: 0.06em;
      font-variant-numeric: tabular-nums;
    }
    /* 细线在页码签与辑名之间，是卡片里唯一的装饰 */
    #theme-circlelife .cl-home-album-m-rule {
      display: block;
      width: 34px;
      height: 1px;
      background: var(--cl-accent);
      margin: 0 0 0.8rem;
    }
    #theme-circlelife .cl-home-album-m-name {
      margin: 0;
      font-family: var(--cl-font-display);
      font-size: 1.55rem;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.01em;
      text-wrap: balance;
      transition: color var(--cl-dur) var(--cl-ease);
    }
    #theme-circlelife .cl-home-album-m-card:hover .cl-home-album-m-name,
    #theme-circlelife .cl-home-album-m-card:focus-visible .cl-home-album-m-name {
      color: var(--cl-accent);
    }

    /* 底部书页页码 tabs：等宽可点，44px 触控高度；当前页朱砂描边 */
    #theme-circlelife .cl-home-album-m-foot {
      grid-row: 3;
      width: 100%;
    }
    #theme-circlelife .cl-home-album-m-tabs {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      height: 44px;
    }
    #theme-circlelife .cl-home-album-m-tab {
      min-width: 44px;
      height: 34px;
      padding: 0 0.5rem;
      border: 1px solid var(--cl-border);
      background: transparent;
      color: var(--cl-faint);
      font-family: var(--cl-font-mono);
      font-size: 0.6875rem;
      letter-spacing: 0.04em;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      transition: color var(--cl-home-switch) var(--cl-ease),
        border-color var(--cl-home-switch) var(--cl-ease);
    }
    #theme-circlelife .cl-home-album-m-tab.is-active {
      border-color: var(--cl-accent);
      color: var(--cl-accent);
    }
    #theme-circlelife .cl-home-album-m-tab:focus-visible {
      outline: 2px solid var(--cl-accent);
      outline-offset: 2px;
    }

    #theme-circlelife .cl-home-album-m a:focus-visible {
      outline: 2px solid var(--cl-accent);
      outline-offset: 5px;
      border-radius: 2px;
    }

    /* 回顶键：C 方案在视口内时隐藏（同文章段做法，避免压在页码上） */
    html:has(.cl-home-album-m) #theme-circlelife .cl-backtop.is-visible {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #theme-circlelife .cl-home-album-m-rail { scroll-behavior: auto; }
  }
`
