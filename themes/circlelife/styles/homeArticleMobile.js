/**
 * Circle of Life — 精选文章章 · 手机 M1（≤1023px）
 *
 * 单列一屏一篇的原生横向轨道 + 四栏题名轴。朱砂条从左缘竖线改为顶部横条，
 * 与栏等宽、两端齐平，由 rail.scrollLeft 连续驱动（--bar-pos，0..count-1），
 * 松手由原生 scroll-snap 吸附。选中栏保留淡朱砂底色与题名/编号转朱砂。
 */
export const homeArticleMobileStyle = `
  @media (max-width: 1023px) {
    #theme-circlelife .cl-home-articles:not(.cl-home-articles-m) {
      display: none;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-articles-rail {
      width: 100vw;
      margin-inline: calc(-1 * var(--cl-wide-pad));
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article {
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
      align-content: center;
      max-width: none;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-plate {
      width: var(--plate-w, min(100vw, calc((100svh - 21rem) * 0.75)));
      justify-self: center;
      margin: 0;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-body {
      width: 100%;
      margin-left: 0;
      padding-inline: var(--cl-wide-pad);
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-meta {
      margin-bottom: 0.9rem;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-rule {
      margin: 1.1rem 0 0.9rem;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-summary {
      font-size: 0.95rem;
      -webkit-line-clamp: 3;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-cta {
      display: none;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-articles-top {
      display: none;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-article-title {
      font-size: 1.7rem;
    }

    /* —— 顶部滑动朱砂条：与栏等宽、两端齐平，连续跟随滚动 —— */
    #theme-circlelife .cl-home-articles-m .cl-home-articles-axis {
      /* 竖线改为顶部：取消桌面每栏的左缘竖线与右分隔 */
      border-top: 1px solid var(--cl-border-strong);
    }
    #theme-circlelife .cl-home-articles-m .cl-home-articles-axis-item {
      min-height: 4.5rem;
      padding: 0.8rem 0.5rem 0.6rem;
      border-right: 0;
      gap: 0.35rem;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-articles-axis-item::before {
      display: none;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-articles-axis-title {
      font-size: 0.8rem;
      -webkit-line-clamp: 2;
      line-height: 1.4;
    }
    #theme-circlelife .cl-home-articles-m .cl-home-articles-axis-no {
      font-size: 0.625rem;
    }
    /* 条宽 = 100% / 栏数，由 --cl-home-article-cols 决定；left 由 --bar-pos 连续推进 */
    #theme-circlelife .cl-home-articles-m .cl-home-articles-axis-bar {
      position: absolute;
      top: -1px;
      left: 0;
      width: calc(100% / var(--cl-home-article-cols, 4));
      height: 2px;
      background: var(--cl-accent);
      transform: translateX(calc(var(--bar-pos, 0) * 100%));
      pointer-events: none;
      z-index: 2;
    }

    /* 短屏手机：再压一档，保证一屏内完整可读 */
    @media (max-width: 1023px) and (max-height: 780px) {
      #theme-circlelife .cl-home-articles-m .cl-home-articles-panel {
        padding-top: calc(var(--cl-nav-band) + 0.5rem);
        padding-bottom: 0.6rem;
      }
      #theme-circlelife .cl-home-articles-m .cl-home-article-plate {
        width: var(--plate-w, min(100vw, calc((100svh - 18rem) * 0.75)));
      }
      #theme-circlelife .cl-home-articles-m .cl-home-article-title {
        font-size: 1.5rem;
      }
      #theme-circlelife .cl-home-articles-m .cl-home-article-meta {
        margin-bottom: 0.6rem;
      }
      #theme-circlelife .cl-home-articles-m .cl-home-article-rule {
        margin: 0.7rem 0 0.6rem;
      }
      #theme-circlelife .cl-home-articles-m .cl-home-article-summary {
        -webkit-line-clamp: 2;
      }
    }

    @media (max-width: 1023px) and (max-height: 620px) {
      #theme-circlelife .cl-home-articles-m .cl-home-article-summary {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #theme-circlelife .cl-home-articles-m .cl-home-articles-axis-bar {
        transition: none;
      }
    }
  }
`
