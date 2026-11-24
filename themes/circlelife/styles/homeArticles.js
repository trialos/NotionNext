/**
 * Circle of Life — 首页下半部：精选文章章
 *
 * 桌面 >1023px（A「题名脊轨」）：单篇舞台 + 底部四栏题名轴，悬停切换、无横向滑轨。
 * 手机 ≤1023px（M1）的覆盖样式在 styles/homeArticleMobile.js，靠断点二选一。
 * 图版 canvas 仍走 1024 档；位图生命周期由 HomeArticleCover 管理。
 */
export const homeArticlesStyle = `
  /* —— 首页精选文章章 (HomeArticleStage / HomeArticleStageMobile) —— */
  #theme-circlelife .cl-home-articles {
    position: relative;
    height: 100svh;
  }

  #theme-circlelife .cl-home-articles-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100svh;
    max-width: var(--cl-wide-max);
    margin-inline: auto;
    padding: var(--cl-home-section-pad) var(--cl-wide-pad)
      max(1rem, env(safe-area-inset-bottom));
    overflow: hidden;
  }

  #theme-circlelife .cl-home-articles-top {
    display: flex;
    justify-content: flex-end;
    grid-row: 1;
  }

  #theme-circlelife .cl-home-sec-link {
    font-family: var(--cl-font-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: var(--cl-muted);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--cl-dur) var(--cl-ease);
  }
  #theme-circlelife .cl-home-sec-link:hover {
    color: var(--cl-accent);
  }

  #theme-circlelife .cl-home-articles-stage {
    min-width: 0;
    min-height: 0;
    grid-row: 2;
    position: relative;
    /* 桌面绝对叠放的图版不能被 3:4 比例撑出舞台压到题名轴上；
       手机横滑靠 rail 的 overflow-y:hidden 兜底，这里再统一裁一层。 */
    overflow: hidden;
  }
  #theme-circlelife .cl-home-articles-viewport {
    height: 100%;
    outline: none;
  }
  #theme-circlelife .cl-home-articles-viewport:focus-visible {
    outline: 2px solid var(--cl-accent);
    outline-offset: 6px;
  }
  #theme-circlelife .cl-home-articles-rail {
    display: flex;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  #theme-circlelife .cl-home-articles-rail::-webkit-scrollbar {
    display: none;
  }

  /* 单篇：桌面绝对定位叠放做交叉淡入；手机是轨道的 flex item（一屏一篇） */
  #theme-circlelife .cl-home-article {
    flex: 0 0 100%;
    min-width: 0;
    height: 100%;
    display: grid;
    grid-template-columns: var(--cl-home-article-plate) minmax(0, 1fr);
    gap: var(--cl-wide-gap);
    align-items: center;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  /* 图版：3:4 直角框。canvas 必须绝对定位铺满框 */
  #theme-circlelife .cl-home-article-plate {
    margin: 0;
  }
  #theme-circlelife .cl-home-article-plate-frame {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--cl-paper-2);
  }
  #theme-circlelife .cl-home-article-plate-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* 文字栏：贴右边缘 → 与影集段的「文字块在右」同位 */
  #theme-circlelife .cl-home-article-body {
    width: min(100%, var(--cl-home-article-measure));
    margin-left: auto;
  }
  #theme-circlelife .cl-home-article-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.4rem;
    font-family: var(--cl-font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.13em;
    color: var(--cl-muted);
  }
  #theme-circlelife .cl-home-article-meta .is-accent {
    color: var(--cl-accent);
  }
  #theme-circlelife .cl-home-article-title {
    margin: 0;
    font-family: var(--cl-font-display-system);
    font-size: clamp(2.1rem, 3.4vw, 3.35rem);
    font-weight: 600;
    line-height: 1.28;
    letter-spacing: -0.025em;
    color: var(--cl-text);
    text-wrap: balance;
  }
  #theme-circlelife .cl-home-article-title a {
    transition: color 0.15s var(--cl-ease);
  }
  #theme-circlelife .cl-home-article-title a:hover {
    color: var(--cl-accent);
  }
  #theme-circlelife .cl-home-article-rule {
    display: block;
    width: 44px;
    height: 1px;
    background: var(--cl-accent);
    margin: 1.85rem 0 1.6rem;
  }
  #theme-circlelife .cl-home-article-summary {
    margin: 0;
    max-width: var(--cl-home-article-measure);
    color: var(--cl-muted);
    font-size: 1.06rem;
    line-height: 1.85;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  #theme-circlelife .cl-home-article-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 2.2rem;
    font-size: 0.95rem;
    color: var(--cl-text);
  }
  #theme-circlelife .cl-home-article-cta-bar {
    display: block;
    width: 26px;
    height: 1px;
    background: var(--cl-accent);
    transition: width 0.25s var(--cl-ease);
  }
  #theme-circlelife .cl-home-article-cta:hover .cl-home-article-cta-bar {
    width: 40px;
  }

  /* —— 底部：四栏题名轴（桌面 A / 手机 M1 共用骨架） —— */
  #theme-circlelife .cl-home-articles-foot {
    width: 100%;
    grid-row: 3;
  }
  #theme-circlelife .cl-home-articles-axis {
    position: relative;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    width: 100%;
    border-top: 1px solid var(--cl-border-strong);
  }
  #theme-circlelife .cl-home-articles-axis-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    min-width: 0;
    min-height: 5.25rem;
    padding: 0.85rem 0.9rem 0.7rem;
    border: 0;
    border-right: 1px solid var(--cl-border);
    background: none;
    text-align: left;
    cursor: pointer;
    color: var(--cl-faint);
    transition: color var(--cl-home-switch) var(--cl-ease),
      background var(--cl-home-switch) var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-axis-item:last-child {
    border-right: 0;
  }
  /* 选中栏：左缘 2px 朱砂竖线从中点展开 + 极淡渐变底色 */
  #theme-circlelife .cl-home-articles-axis-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--cl-accent);
    transform: scaleY(0);
    transform-origin: center;
    transition: transform var(--cl-home-switch) var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-axis-item.is-active {
    color: var(--cl-accent);
    background: linear-gradient(
      180deg,
      var(--cl-accent-soft),
      transparent 70%
    );
  }
  #theme-circlelife .cl-home-articles-axis-item.is-active::before {
    transform: scaleY(1);
  }
  #theme-circlelife .cl-home-articles-axis-no {
    font-family: var(--cl-font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    font-variant-numeric: tabular-nums;
  }
  #theme-circlelife .cl-home-articles-axis-title {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: transform var(--cl-home-switch) var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-axis-item.is-active
    .cl-home-articles-axis-title {
    transform: translateX(3px);
  }
  #theme-circlelife .cl-home-articles-axis-date {
    font-family: var(--cl-font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
  }
  #theme-circlelife .cl-home-articles-axis-item:focus-visible {
    outline: 2px solid var(--cl-accent);
    outline-offset: -2px;
  }

  /* 桌面舞台：四篇绝对叠放，只动 opacity / visibility 的交叉淡入 */
  #theme-circlelife .cl-home-articles:not(.cl-home-articles-m)
    .cl-home-article {
    position: absolute;
    inset: 0;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity var(--cl-home-switch) var(--cl-ease),
      visibility 0s linear var(--cl-home-switch);
  }
  #theme-circlelife .cl-home-articles:not(.cl-home-articles-m)
    .cl-home-article.is-active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity var(--cl-home-switch) var(--cl-ease),
      visibility 0s;
  }
  @media (min-width: 1024px) {
    #theme-circlelife .cl-home-articles-m {
      display: none;
    }
    /* 桌面图版高度受舞台约束：矮屏时按高度反推宽度，仍是 3:4，
       不会按 54svh 的宽算出高过舞台的图版压到题名轴上。
       底部再留 2.5rem 气隙，让图不必贴着题名轴；图版靠顶对齐。 */
    #theme-circlelife .cl-home-articles:not(.cl-home-articles-m)
      .cl-home-article {
      grid-template-columns: auto minmax(0, 1fr);
    }
    #theme-circlelife .cl-home-articles:not(.cl-home-articles-m)
      .cl-home-article-plate {
      height: 100%;
      display: flex;
      align-items: flex-start;
    }
    #theme-circlelife .cl-home-articles:not(.cl-home-articles-m)
      .cl-home-article-plate-frame {
      height: min(
        calc(100% - 2.5rem),
        calc(var(--cl-home-article-plate) * 4 / 3)
      );
      width: auto;
      aspect-ratio: 3 / 4;
    }
    /* 文章段与影集段之间收紧：影集段自己的段距是全局 token，
       这里只针对紧跟文章段的那一处，用负 margin 吃掉一半，不动全局节奏。 */
    #theme-circlelife .cl-home-articles:not(.cl-home-articles-m)
      + .cl-home-articles-m
      + .cl-home-album {
      margin-top: calc(var(--cl-home-section-pad) - 3rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #theme-circlelife .cl-home-articles-rail {
      scroll-behavior: auto;
    }
    #theme-circlelife .cl-home-article,
    #theme-circlelife .cl-home-article.is-active,
    #theme-circlelife .cl-home-articles-axis-item,
    #theme-circlelife .cl-home-articles-axis-item::before,
    #theme-circlelife .cl-home-articles-axis-title {
      transition: none;
    }
  }
`
