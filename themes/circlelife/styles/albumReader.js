/**
 * Circle of Life — 影集阅读器（章页 / 单张 / 左目录 / 当前辑缩略）
 *
 * 纸面在深色模式下压成米灰，不反成黑底；站点胶囊与页脚在影集页隐藏，
 * 只保留右上角菜单按钮。阅读器铺满视口，内部自己管理滚动。
 */
export const albumReaderStyle = `
  /* 全屏影集阅读器独占：.reader/.overlay/.thumb/.index-* 等裸类名只在本模块
     使用，站点其它组件没有同名规则；新增控件优先 reader-* / nav-*。 */
  /* ==========================================================================
     站点壳：影集页只留右上角菜单按钮
     ========================================================================== */
  #theme-circlelife.cl-is-album .cl-floating-header {
    display: none !important;
  }
  #theme-circlelife.cl-is-album .cl-footer {
    display: none !important;
  }
  #theme-circlelife.cl-is-album .cl-backtop {
    display: none !important;
  }

  /* 桌面那颗独立菜单按钮在手机端也显示出来，成为阅读器右上角的暖金圆钮 */
  #theme-circlelife.cl-is-album .cl-floating-desktop-menu-btn {
    display: inline-flex !important;
    top: calc(env(safe-area-inset-top, 0px) + 10px);
    right: 14px;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 9999px;
    background: var(--cl-gold);
    color: var(--cl-gold-ink);
    font-size: 0.9rem;
    z-index: 60;
    box-shadow: 0 6px 18px -8px var(--cl-gold-shadow);
  }
  @media (min-width: 1024px) {
    #theme-circlelife.cl-is-album .cl-floating-desktop-menu-btn {
      top: calc(env(safe-area-inset-top, 0px) + 16px);
      right: 28px;
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }

  /* 全屏高度链：Header aside 和 Footer 已隐藏，内容直接铺满 */
  html.cl-album-reader-active,
  html.cl-album-reader-active body {
    height: 100%;
    overflow: hidden;
  }
  #theme-circlelife.cl-is-album {
    /* min-h-screen 是 100vh（大视口），会把页面撑到 iOS Safari 底栏下面；
       svh 取浏览器栏展开时的小视口，页面和底部控件始终在工具栏上方 */
    min-height: 0;
    height: 100vh;
    height: 100svh;
    max-height: 100svh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--cl-bg);
  }
  #theme-circlelife.cl-is-album > #container-inner,
  #theme-circlelife.cl-is-album #container-wrapper,
  #theme-circlelife.cl-is-album #main-content,
  #theme-circlelife.cl-is-album #main-content > *,
  #theme-circlelife.cl-is-album .cl-album-reader-page,
  #theme-circlelife.cl-is-album .cl-album-reader {
    flex: 1 1 auto;
    height: 100% !important;
    min-height: 0;
    max-height: 100%;
    width: 100%;
    max-width: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  #theme-circlelife.cl-is-album .cl-album-reader-page,
  #theme-circlelife.cl-is-album .cl-album-reader {
    position: relative;
  }

  /* ==========================================================================
     阅读器 token：深色米灰纸，浅色沿用站点纸色
     ========================================================================== */
  #theme-circlelife.cl-is-album {
    --cl-ease-damp: cubic-bezier(0.16, 1, 0.3, 1);
    --cl-scrim: rgba(24, 19, 14, 0.3);
    --cl-vermilion: var(--cl-accent);
  }
  .dark #theme-circlelife.cl-is-album {
    color-scheme: light;
    --cl-bg: #b9b0a0;
    --cl-surface: #c3b9a9;
    --cl-paper-2: #ada394;
    --cl-text: #241f18;
    --cl-muted: #463c30;
    --cl-faint: #4e4437;
    --cl-border: rgba(36, 31, 24, 0.14);
    --cl-border-strong: rgba(36, 31, 24, 0.26);
    --cl-accent: #6d3425;
    --cl-vermilion: #8f3424;
    --cl-gold: #af8a5e;
    --cl-gold-ink: #241f18;
    --cl-gold-shadow: rgba(84, 63, 38, 0.35);
    --cl-scrim: rgba(20, 16, 12, 0.32);
  }

  /* ==========================================================================
     阅读页
     ========================================================================== */
  .reader {
    --album-safe-top: env(safe-area-inset-top, 0px);
    --album-safe-bottom: env(safe-area-inset-bottom, 0px);
    --album-bar: calc(56px + var(--album-safe-top));
    --album-foot: calc(176px + var(--album-safe-bottom));
    --index-nudge: 10px;
    position: absolute;
    inset: 0;
    background: var(--cl-bg);
    color: var(--cl-text);
  }
  .reader-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--album-bar);
    z-index: 6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--album-safe-top) 58px 0;
    background: var(--cl-bg);
    color: var(--cl-muted);
  }
  .reader-center {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
  .reader-center button {
    appearance: none;
    border: 0;
    background: transparent;
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 2px;
    color: var(--cl-muted);
    font-family: var(--cl-font-display);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.1em;
    line-height: 1;
    cursor: pointer;
    transition: color 0.15s ease;
  }
  .reader-center button:hover,
  .reader-center button:active { color: var(--cl-accent); }
  .reader-center button:disabled { cursor: default; opacity: 0.5; }
  .nav-album {
    max-width: 8.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 2px 0;
    font-family: var(--cl-font-display);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    line-height: 1.5;
    color: var(--cl-text);
  }
  .nav-sep {
    display: block;
    width: 1px;
    height: 11px;
    background: var(--cl-border-strong);
    flex: none;
    transition: width 0.3s var(--cl-ease), height 0.3s var(--cl-ease), background 0.3s var(--cl-ease);
  }
  .nav-sep.is-bar {
    width: 26px;
    height: 1px;
    background: var(--cl-muted);
  }
  .reader.is-thumbs .reader-top {
    z-index: 30;
    background: transparent;
    -webkit-backdrop-filter: blur(14px) saturate(1.02);
    backdrop-filter: blur(14px) saturate(1.02);
  }
  .reader.is-index .reader-top {
    z-index: 30;
    background: transparent;
    pointer-events: none;
  }

  .reader-count {
    font-family: var(--cl-font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    color: var(--cl-muted);
    font-variant-numeric: tabular-nums;
  }
  .reader.is-index .reader-count { visibility: hidden; }

  /* 目录 | 缩略 移到下方正中；页数在顶栏 */
  .reader-nav {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 6;
    height: calc(56px + var(--album-safe-bottom) + 10px);
    padding-bottom: calc(var(--album-safe-bottom) + 10px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cl-bg);
    pointer-events: none;
  }
  .reader-nav .reader-center { pointer-events: auto; }
  .reader-nav .reader-center button {
    min-height: 44px;
    font-size: 14px;
    letter-spacing: 0.1em;
  }
  .reader-nav .nav-album {
    max-width: 10rem;
    font-size: 14px;
    letter-spacing: 0.08em;
    line-height: 1.5;
  }
  .reader.is-thumbs .reader-nav {
    z-index: 30;
    background: transparent;
    -webkit-backdrop-filter: blur(14px) saturate(1.02);
    backdrop-filter: blur(14px) saturate(1.02);
  }
  .reader.is-index .reader-nav {
    visibility: hidden;
    pointer-events: none;
  }

  .reader-stage {
    position: absolute;
    top: var(--album-bar);
    bottom: var(--album-foot);
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--cl-bg);
  }
  .photo-frame {
    position: relative;
    flex: none;
    overflow: hidden;
    background: var(--cl-bg);
    transition: transform 820ms var(--cl-ease-damp);
  }
  .reader.is-index-photo .photo-frame {
    transform: translateX(var(--index-nudge));
    transition-delay: 60ms;
  }
  .photo-frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .photo-frame.is-loaded img { opacity: 1; }

  /* 章页：纸面从下往上盖住旧图，换框后再向上退开 */
  .chapter-panel {
    position: absolute;
    inset: 0;
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    background: var(--cl-bg);
    text-align: center;
    transform: translateY(100%);
    transition: transform 900ms var(--cl-ease-damp);
    pointer-events: none;
  }
  .chapter-panel.is-covering { transform: translateY(0); }
  .chapter-panel.is-revealing {
    transition-duration: 900ms;
    transform: translateY(-100%);
  }
  .chapter-inner {
    width: 100%;
    max-width: 44rem;
    margin: 0 auto;
    text-align: center;
    transform: translateY(24px);
    opacity: 0;
    transition: transform 900ms var(--cl-ease-damp) 90ms, opacity 520ms ease 90ms;
  }
  .chapter-panel.is-covering .chapter-inner {
    transform: translateY(0);
    opacity: 1;
  }
  .chapter-panel.is-revealing .chapter-inner {
    transform: translateY(24px);
    opacity: 0;
    transition: transform 560ms var(--cl-ease) 0s, opacity 340ms ease 0s;
  }
  .chapter-rule {
    display: block;
    width: 26px;
    height: 2px;
    margin: 0 auto 18px;
    background: var(--cl-vermilion);
  }
  .chapter-kicker {
    margin: 0 0 10px;
    font-family: var(--cl-font-mono);
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--cl-faint);
  }
  .chapter-title {
    margin: 0 0 10px;
    font-family: var(--cl-font-display);
    font-size: 30px;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.2;
    color: var(--cl-text);
    text-wrap: balance;
  }
  .chapter-intro {
    max-width: 36rem;
    margin: 0 auto 14px;
    font-family: var(--cl-font-display);
    font-size: 13px;
    line-height: 1.75;
    letter-spacing: 0.01em;
    color: var(--cl-muted);
    text-wrap: balance;
  }
  .chapter-meta {
    margin: 0;
    font-family: var(--cl-font-mono);
    font-size: 9.5px;
    letter-spacing: 0.04em;
    color: var(--cl-faint);
    font-variant-numeric: tabular-nums;
  }
  button.chapter-enter {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 26px;
    padding: 0;
    border: 0;
    background: transparent;
    font-family: var(--cl-font-mono);
    font-size: 9.5px;
    letter-spacing: 0.08em;
    color: var(--cl-faint);
    cursor: pointer;
    pointer-events: auto;
    transition: color 0.15s ease;
  }
  button.chapter-enter:hover { color: var(--cl-accent); }

  .tap-zone {
    position: absolute;
    top: var(--album-bar);
    bottom: var(--album-foot);
    width: 50%;
    z-index: 4;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .tap-prev { left: 0; }
  .tap-next { right: 0; }

  .reader-foot {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--album-foot);
    min-height: var(--album-foot);
    z-index: 6;
    display: flex;
    flex-direction: column;
    padding: 14px 18px max(18px, calc(env(safe-area-inset-bottom, 0px) + 12px));
    background: var(--cl-bg);
    transition: opacity 0.25s ease;
  }
  .reader-foot.is-dim { opacity: 0; }
  .foot-caption {
    margin: 0;
    max-width: 100%;
    padding-left: 10px;
    border-left: 2px solid var(--cl-vermilion);
    color: var(--cl-muted);
    font-family: var(--cl-font-display);
    font-size: 11.5px;
    line-height: 1.65;
    letter-spacing: 0.01em;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  .foot-caption[hidden] { display: none; }

  .toast {
    position: absolute;
    left: 50%;
    bottom: 120px;
    z-index: 40;
    padding: 8px 12px;
    border: 1px solid var(--cl-border-strong);
    background: var(--cl-surface);
    color: var(--cl-muted);
    font-family: var(--cl-font-mono);
    font-size: 9.5px;
    line-height: 1.4;
    letter-spacing: 0.03em;
    white-space: nowrap;
    opacity: 0;
    transform: translate(-50%, 6px);
    pointer-events: none;
    transition: opacity 0.2s, transform 0.22s var(--cl-ease);
  }
  .toast.is-on { opacity: 1; transform: translate(-50%, 0); }

  .reader-empty {
    text-align: center;
    color: var(--cl-muted);
  }
  .reader-empty h1 {
    margin: 0;
    font-family: var(--cl-font-display);
    font-size: 2rem;
    font-weight: 600;
    color: var(--cl-text);
  }

  /* ==========================================================================
     覆盖层 / 目录抽屉 / 缩略纸
     ========================================================================== */
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: none;
    overflow-y: auto;
    background: var(--cl-bg);
    color: var(--cl-text);
    overscroll-behavior: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .overlay::-webkit-scrollbar { width: 0; height: 0; display: none; }
  .overlay.is-open { display: block; }

  .index-scrim {
    position: absolute;
    inset: 0;
    z-index: 19;
    background: var(--cl-scrim);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.52s ease, visibility 0s linear 0.52s;
  }
  .index-scrim.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity 0.52s ease;
  }

  #indexOverlay {
    right: auto;
    width: min(80%, 330px);
    border-right: 1px solid var(--cl-border-strong);
    visibility: hidden;
    transform: translateX(-100%);
    transition: transform 820ms var(--cl-ease-damp);
  }
  #indexOverlay.is-open {
    visibility: visible;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  #indexOverlay .overlay-head {
    position: relative;
    top: auto;
    flex: none;
  }
  #indexOverlay .index-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  #indexOverlay .index-list::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
  #indexOverlay .index-foot {
    flex: none;
    margin: 0;
    padding: 14px 18px calc(26px + var(--album-safe-bottom));
    border-top: 1px solid var(--cl-border);
    background: var(--cl-bg);
    font-size: 13px;
    letter-spacing: 0.04em;
    gap: 10px 18px;
  }
  #indexOverlay .index-foot a { padding: 4px 0; }
  #indexOverlay.is-rising { transform: translateX(0); }
  #indexOverlay.is-closing {
    transform: translateX(-100%);
    transition-duration: 700ms;
    pointer-events: none;
  }

  #thumbsOverlay {
    /* 站点已要求 color-mix（header/mast 同源），不再保留浅色硬编码兜底，
       否则旧浏览器在深色下会闪一张亮纸 */
    background: color-mix(in srgb, var(--cl-bg) 88%, transparent);
    -webkit-backdrop-filter: blur(8px) saturate(1.02);
    backdrop-filter: blur(8px) saturate(1.02);
    visibility: hidden;
    transform: translateY(100%);
    transition: transform 620ms var(--cl-ease);
  }
  #thumbsOverlay.is-open { visibility: visible; }
  #thumbsOverlay.is-rising { transform: translateY(0); }

  .overlay-head {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: calc(22px + env(safe-area-inset-top, 0px)) 18px 12px;
    background: var(--cl-bg);
  }
  /* 目录抽屉刊头：沿用整站 PageMast（朱砂竖线 + 眉题 + 大标题），
     去掉旧的 CIRCLE OF LIFE / 目录 / 合集计数。 */
  .index-mast-head {
    align-items: flex-start;
    gap: 12px;
  }
  .index-mast-head .cl-page-mast {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }
  .index-mast-head .cl-page-mast-desc {
    margin: 8px 0 0;
    font-family: var(--cl-font-display);
    font-size: 12.5px;
    line-height: 1.7;
    letter-spacing: 0.01em;
    color: var(--cl-muted);
  }
  .index-mast-head .overlay-close {
    margin-top: -4px;
  }
  @media (min-width: 1024px) {
    .index-mast-head .cl-page-mast-desc { font-size: 13.5px; }
  }

  .overlay-close {
    appearance: none;
    border: 0;
    background: transparent;
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 24px;
    line-height: 30px;
    color: var(--cl-muted);
    cursor: pointer;
    flex: none;
  }
  .overlay-close:hover { color: var(--cl-accent); }

  .index-list { padding: 0 18px; }
  .index-year {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 20px 0 5px;
    font-family: var(--cl-font-mono);
    font-size: 9.5px;
    letter-spacing: 0.16em;
    color: var(--cl-faint);
  }
  .index-year::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--cl-border);
  }
  .index-row {
    position: relative;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    align-items: start;
    gap: 9px;
    width: calc(100% + 20px);
    margin-left: -10px;
    padding: 10px;
    border: 0;
    border-bottom: 1px solid var(--cl-border);
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }
  .index-row:hover { background: var(--cl-paper-2); }
  .index-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 9px;
    bottom: 9px;
    width: 2px;
    background: var(--cl-vermilion);
    opacity: 0;
  }
  .index-row.is-current::before { opacity: 1; }
  .index-row.is-current .index-title { color: var(--cl-accent); }
  .index-no {
    padding-top: 3px;
    font-family: var(--cl-font-mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    color: var(--cl-faint);
    font-variant-numeric: tabular-nums;
  }
  .index-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .index-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--cl-font-display);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.35;
  }
  .index-tagline {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--cl-font-display);
    font-size: 12px;
    line-height: 1.5;
    color: var(--cl-muted);
  }
  .index-meta {
    padding-top: 3px;
    font-family: var(--cl-font-mono);
    font-size: 9px;
    letter-spacing: 0.03em;
    color: var(--cl-faint);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .index-foot {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin: 26px 18px 30px;
    padding-top: 14px;
    border-top: 1px solid var(--cl-border);
    font-family: var(--cl-font-mono);
    font-size: 9px;
    letter-spacing: 0.06em;
    color: var(--cl-faint);
  }
  .index-foot a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .index-foot a:hover { color: var(--cl-accent); }

  .thumbs-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: start;
    column-gap: 18px;
    row-gap: 26px;
    padding: calc(var(--album-bar) + 20px) 16px calc(90px + var(--album-safe-bottom));
  }
  .thumb {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--cl-paper-2);
    cursor: pointer;
    position: relative;
    min-height: 80px;
  }
  .thumb.is-loaded { min-height: 0; }
  .thumbs-grid.is-entering .thumb {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.36s ease, transform 0.42s var(--cl-ease);
    transition-delay: var(--stagger, 0ms);
  }
  .thumbs-grid.is-entering .thumb.is-current {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .thumbs-grid.is-entering.is-revealed .thumb {
    opacity: 1;
    transform: none;
  }
  .thumb img {
    display: block;
    width: 100%;
    height: auto;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .thumb.is-loaded img { opacity: 1; }
  .thumb.is-current::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid var(--cl-vermilion);
    pointer-events: none;
  }

  /* ==========================================================================
     桌面形态
     ========================================================================== */
  @media (min-width: 1024px) {
    .reader {
      --album-bar: calc(72px + var(--album-safe-top));
      --album-foot: 140px;
      --index-nudge: 20px;
    }
    .reader-top { padding-left: 92px; padding-right: 92px; }
    .reader-center { gap: 14px; }
    .reader-center button {
      min-height: 44px;
      font-size: 15px;
      letter-spacing: 0.12em;
    }
    .nav-album {
      max-width: 18rem;
      font-size: 15px;
      letter-spacing: 0.1em;
    }
    .nav-sep { height: 12px; }
    .nav-sep.is-bar { width: 40px; height: 1px; }

    .reader-nav {
      height: calc(64px + var(--album-safe-bottom));
    }
    .reader-nav .reader-center { gap: 14px; }
    .reader-nav .reader-center button {
      font-size: 15px;
      letter-spacing: 0.12em;
    }
    .reader-nav .nav-album {
      max-width: 18rem;
      font-size: 15px;
      letter-spacing: 0.1em;
    }
    .reader-count { font-size: 12px; letter-spacing: 0.16em; }

    .reader-foot {
      padding: 18px 48px 22px;
    }
    .foot-caption {
      width: 100%;
      max-width: 52rem;
      margin: 0 auto;
      font-size: 13px;
      line-height: 1.75;
    }

    .chapter-panel { padding: 0 var(--cl-wide-pad); }
    .chapter-inner { max-width: 52rem; }
    .chapter-rule { width: 32px; margin-bottom: 22px; }
    .chapter-kicker { font-size: 10px; letter-spacing: 0.18em; }
    .chapter-title { font-size: clamp(2.6rem, 4.4vw, 4rem); }
    .chapter-intro {
      max-width: 42rem;
      margin: 0 auto 16px;
      font-size: 17px;
      line-height: 1.8;
    }
    .chapter-meta { font-size: 11px; }
    button.chapter-enter { margin-top: 32px; font-size: 10px; }

    #indexOverlay { width: min(44%, 620px); }
    #indexOverlay .overlay-head {
      padding: calc(44px + env(safe-area-inset-top, 0px)) var(--cl-wide-pad) 18px;
    }
    #indexOverlay .index-list {
      padding: 0 var(--cl-wide-pad);
    }
    .index-year { margin: 26px 0 6px; font-size: 10.5px; }
    .index-row { padding: 14px 12px; }
    .index-no,
    .index-meta { font-size: 10px; }
    .index-title { font-size: 24px; }
    .index-tagline { font-size: 14px; }
    #indexOverlay .index-foot {
      padding: 16px var(--cl-wide-pad) calc(28px + var(--album-safe-bottom));
      font-size: 14px;
      letter-spacing: 0.05em;
    }

    .thumbs-grid {
      grid-template-columns: repeat(auto-fill, 120px);
      justify-content: center;
      column-gap: 24px;
      row-gap: 32px;
      padding: calc(var(--album-bar) + 24px) var(--cl-wide-pad) calc(92px + var(--album-safe-bottom));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reader *,
    .reader *::before,
    .reader *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0ms !important;
    }
  }
`
