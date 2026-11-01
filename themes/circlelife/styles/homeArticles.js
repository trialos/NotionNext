/**
 * Circle of Life — 首页下半部：精选文章章
 *
 * 形态（2026-11 v3 · 原生横向滑动）：
 * - **一窗一屏，原生横向换篇**：100svh 面板 + 原生横向轨道；
 *   一屏一篇，`scroll-snap-stop: always` 一次手势最多换一篇。
 * - 滚动、惯性、吸附全部交给浏览器；JS 不监听 wheel/touch、不写 transform。
 * - 图左文右（镜像影集段的文左图右）；图版 3:4；移动端图版满屏出血。
 * - 底部日期尺是可点击的时间轴：真实日距、当前篇高亮、桌面上一张/下一张。
 * - 图版 canvas 仍走 1024 档；位图生命周期由 HomeArticleCover 管理。
 */
export const homeArticlesStyle = `
  /* —— 首页精选文章章 (HomeArticleStage) —— */
  #theme-circlelife .cl-home-articles {
    position: relative;
    height: 100svh;
  }

  #theme-circlelife .cl-home-articles-panel {
    display: grid;
    /* 显式一列 minmax(0,1fr)：窄屏可滚轴/轨道的最小内容宽不能把栅格撑宽 */
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100svh;
    max-width: var(--cl-wide-max);
    margin-inline: auto;
    padding: var(--cl-home-section-pad) var(--cl-wide-pad)
      max(1rem, env(safe-area-inset-bottom));
    overflow: hidden;
  }

  /* 顶部：只有右侧一个出口（与影集段同形） */
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

  /* —— 横向轨道：滚动/吸附由浏览器负责 —— */
  #theme-circlelife .cl-home-articles-stage {
    min-width: 0;
    min-height: 0;
    grid-row: 2;
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
  #theme-circlelife .cl-home-article {
    flex: 0 0 100%;
    min-width: 0;
    height: 100%;
    display: grid;
    /* 图版贴左边缘 / 文字栏贴右边缘（margin-left:auto）→ 横向 footprint
       与影集段完全一致（@1440：48 → 1392），两段的空间感不再断崖。 */
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
  /* 图版是 canvas（不是 <img>）：canvas 的像素不进入 LCP 候选；
     裁剪与缩放由 canvas 自己按 object-fit:cover + 取景焦点完成。 */
  #theme-circlelife .cl-home-article-plate-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* 文字栏：贴右边缘 → 与影集段的「文字块在右」同位。
     ⚠️ 宽度必须写成**定值**（width: min(100%, 测量宽)），不能只写 max-width：
     只写 max-width 时 grid 项的宽度是 fit-content（且 margin-left:auto 会让
     stretch 失效）→ 摘要短的篇目收缩成窄块，标题左边缘随标题长度漂移。 */
  #theme-circlelife .cl-home-article-body {
    width: min(100%, var(--cl-home-article-measure));
    margin-left: auto;
  }

  /* 文字栏 */
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
    font-family: var(--cl-font-display);
    font-size: clamp(2.1rem, 3.4vw, 3.35rem);
    font-weight: 600;
    /* 1.28：与文章页 .cl-article-title 同值 —— 中英混排时不压行 */
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

  /* —— 底部：上一张 / 日期时间轴 / 下一张 —— */
  #theme-circlelife .cl-home-articles-foot {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    width: 100%;
    grid-row: 3;
  }
  #theme-circlelife .cl-home-articles-nav {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 44px;
    padding: 0.4rem 0.15rem;
    border: 0;
    background: none;
    cursor: pointer;
    font-family: var(--cl-font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    color: var(--cl-muted);
    white-space: nowrap;
    transition: color var(--cl-dur) var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-nav:hover:not(:disabled) {
    color: var(--cl-accent);
  }
  #theme-circlelife .cl-home-articles-nav:disabled {
    opacity: 0.25;
    cursor: default;
  }

  #theme-circlelife .cl-home-articles-ruler {
    display: flex;
    flex: 1 1 auto;
    align-items: flex-end;
    gap: 1rem;
    min-width: 0;
    width: 100%;
  }
  #theme-circlelife .cl-home-articles-ruler-axis {
    position: relative;
    flex: 1 1 auto;
    height: 24px;
    min-width: 0;
    border-top: 1px solid var(--cl-border-strong);
  }

  /* 刻度是可点击的时间轴按钮；视觉仍是细刻度，触控高度补到 44px */
  #theme-circlelife .cl-home-articles-tick {
    position: absolute;
    top: 0;
    left: var(--tick-x, 0%);
    width: 44px;
    height: 44px;
    margin-left: -22px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    color: var(--cl-faint);
    font-family: var(--cl-font-mono);
    font-size: 0.65rem;
    line-height: 1;
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
    text-align: left;
    transition: color var(--cl-home-switch) var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-tick i {
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 7px;
    background: var(--cl-border-strong);
    transform: translateX(-50%);
  }
  #theme-circlelife .cl-home-articles-tick span {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  #theme-circlelife .cl-home-articles-tick.is-first {
    margin-left: 0;
  }
  #theme-circlelife .cl-home-articles-tick.is-first i,
  #theme-circlelife .cl-home-articles-tick.is-first span {
    left: 0;
    transform: none;
  }
  #theme-circlelife .cl-home-articles-tick.is-last {
    margin-left: -44px;
  }
  #theme-circlelife .cl-home-articles-tick.is-last i {
    left: auto;
    right: 0;
    transform: none;
  }
  #theme-circlelife .cl-home-articles-tick.is-last span {
    left: auto;
    right: 0;
    transform: none;
  }
  #theme-circlelife .cl-home-articles-tick:hover {
    color: var(--cl-text);
  }
  #theme-circlelife .cl-home-articles-tick.is-active {
    color: var(--cl-text);
  }
  #theme-circlelife .cl-home-articles-tick.is-active i {
    width: 2px;
    background: var(--cl-accent);
  }
  #theme-circlelife .cl-home-articles-tick:focus-visible {
    outline: 2px solid var(--cl-accent);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* 游标：只在活动篇变化时移动，不做逐帧 scrub */
  #theme-circlelife .cl-home-articles-cursor {
    position: absolute;
    top: -1px;
    left: var(--cursor-x, 0%);
    width: 0;
    height: 0;
    pointer-events: none;
    transition: left var(--cl-home-switch) var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-cursor i {
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 18px;
    background: var(--cl-accent);
    transform: translateX(-50%);
  }

  #theme-circlelife .cl-home-articles-range {
    flex: 0 0 auto;
    padding-bottom: 1px;
    font-family: var(--cl-font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    color: var(--cl-faint);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    #theme-circlelife .cl-home-articles-rail {
      scroll-behavior: auto;
    }
    #theme-circlelife .cl-home-articles-cursor {
      transition: none;
    }
  }

  /* —— 移动端：单列，图版满屏出血（仍是 3:4，与桌面同构图） —— */
  @media (max-width: 1023px) {
    #theme-circlelife .cl-home-articles-rail {
      /* 轨道铺满视口；slide 内的文字再用 --cl-wide-pad 收回来 */
      width: 100vw;
      margin-inline: calc(-1 * var(--cl-wide-pad));
    }
    #theme-circlelife .cl-home-article {
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
      align-content: center;
      max-width: none;
    }
    /* 图版宽度随「可用高度」动态伸缩：宽 = 可用高度 × 3/4，
       再用 min(100vw,…) 兜住屏幕宽。--plate-w 由 JS 按文字块实际高度写入。 */
    #theme-circlelife .cl-home-article-plate {
      width: var(--plate-w, min(100vw, calc((100svh - 21rem) * 0.75)));
      justify-self: center;
      margin: 0;
    }
    #theme-circlelife .cl-home-article-body {
      width: 100%;
      margin-left: 0;
      padding-inline: var(--cl-wide-pad);
    }
    #theme-circlelife .cl-home-article-meta {
      margin-bottom: 0.9rem;
    }
    #theme-circlelife .cl-home-article-rule {
      margin: 1.1rem 0 0.9rem;
    }
    #theme-circlelife .cl-home-article-summary {
      font-size: 0.95rem;
      -webkit-line-clamp: 3;
    }
    /* 手机上点标题即进文章 → 「继续阅读」撤下（桌面端保留）。
       图版**不做成链接**：满屏大图点击区太大、容易误触。 */
    #theme-circlelife .cl-home-article-cta {
      display: none;
    }
    /* 手机上不重复导航胶囊里已有的「文章」入口 → 段内出口撤下 */
    #theme-circlelife .cl-home-articles-top {
      display: none;
    }
    /* 窄屏以滑动为主：上一张/下一张与月份跨度先让位给日期尺 */
    #theme-circlelife .cl-home-articles-nav,
    #theme-circlelife .cl-home-articles-range {
      display: none;
    }
    #theme-circlelife .cl-home-articles-ruler {
      gap: 0;
      width: 100%;
    }
    #theme-circlelife .cl-home-articles-ruler-axis {
      width: 100%;
    }
    #theme-circlelife .cl-home-articles-tick {
      font-size: 0.58rem;
      letter-spacing: 0.02em;
    }
    #theme-circlelife .cl-home-article-title {
      font-size: 1.7rem;
    }
  }

  /* —— 短屏手机：再压一档，保证一屏内完整可读 —— */
  @media (max-width: 1023px) and (max-height: 780px) {
    #theme-circlelife .cl-home-articles-panel {
      padding-top: calc(var(--cl-nav-band) + 0.5rem);
      padding-bottom: 0.6rem;
    }
    #theme-circlelife .cl-home-article-plate {
      width: var(--plate-w, min(100vw, calc((100svh - 18rem) * 0.75)));
    }
    #theme-circlelife .cl-home-article-title {
      font-size: 1.5rem;
    }
    #theme-circlelife .cl-home-article-meta {
      margin-bottom: 0.6rem;
    }
    #theme-circlelife .cl-home-article-rule {
      margin: 0.7rem 0 0.6rem;
    }
    #theme-circlelife .cl-home-article-summary {
      -webkit-line-clamp: 2;
    }
  }

  /* —— 极矮的窄屏：摘要先让位 —— */
  @media (max-width: 1023px) and (max-height: 620px) {
    #theme-circlelife .cl-home-article-summary {
      display: none;
    }
  }
`
