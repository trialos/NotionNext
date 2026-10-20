/**
 * Circle of Life — album：影集全新样式体系（书架 V2 / 快切条 / 瀑布展墙 / 全屏灯箱）
 */
export const albumStyle = `
  /* —— 画廊全屏态与视口锁定 —— */
  #theme-circlelife.cl-is-album #container-inner,
  #theme-circlelife.cl-is-album #container-wrapper {
    max-width: none;
    width: 100%;
  }

  #theme-circlelife.cl-is-album {
    background-color: var(--cl-bg);
  }

  #theme-circlelife .cl-album-page {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
    min-height: 100dvh;
    background-color: var(--cl-bg);
  }

  /* 画廊态：全屏固定，隐藏默认页脚，顶栏与快切条浮于瀑布之上 */
  html.cl-album-gallery-active,
  html.cl-album-gallery-active body {
    overflow: hidden !important;
    height: 100% !important;
    touch-action: none !important;
  }

  @media (pointer: fine) {
    html.cl-album-gallery-active,
    html.cl-album-gallery-active body {
      overscroll-behavior: none;
    }
  }

  html.cl-album-gallery-active #theme-circlelife .cl-footer,
  html.cl-album-gallery-active .cl-footer {
    display: none !important;
  }

  html.cl-album-gallery-active #theme-circlelife {
    position: relative;
    height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  html.cl-album-gallery-active #theme-circlelife > #container-inner,
  html.cl-album-gallery-active #theme-circlelife #container-wrapper,
  html.cl-album-gallery-active #theme-circlelife #container-wrapper > div,
  html.cl-album-gallery-active #theme-circlelife #container-wrapper > div > div,
  html.cl-album-gallery-active #theme-circlelife .cl-album-page,
  html.cl-album-gallery-active #theme-circlelife .cl-album-shell.is-gallery,
  html.cl-album-gallery-active #theme-circlelife .cl-album-stage {
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


  /* —— 影集空状态 —— */
  #theme-circlelife .cl-album-empty {
    text-align: center;
    padding: 4.5rem 1.25rem 5rem;
    max-width: 28rem;
    margin: 0 auto;
  }

  #theme-circlelife .cl-album-howto {
    text-align: left;
    max-width: 24rem;
    margin: 1.75rem auto 0;
    padding: 1.15rem 1.25rem 1.15rem 1.85rem;
    border-radius: 12px;
    border: 1px solid var(--cl-border);
    background: var(--cl-surface);
    font-size: 0.88rem;
    line-height: 1.68;
    color: var(--cl-muted);
    list-style: disc;
  }

  #theme-circlelife .cl-album-howto li + li {
    margin-top: 0.35rem;
  }

  #theme-circlelife .cl-album-howto strong {
    color: var(--cl-text);
    font-weight: 600;
  }

  /* —— 影集先锋艺术展架 (AlbumShelfStack) —— */
  .cl-album-stack-root {
    max-width: 1720px;
    margin: 0 auto;
    padding: max(5.5rem, calc(env(safe-area-inset-top, 0px) + 4.8rem)) 2rem 7rem;
    box-sizing: border-box;
    position: relative;
  }

  @media (max-width: 1023px) {
    .cl-album-stack-root {
      padding: max(5.2rem, calc(env(safe-area-inset-top, 0px) + 4.5rem)) 1.5rem 6rem;
    }
  }

  @media (max-width: 767px) {
    .cl-album-stack-root {
      padding: max(5.2rem, calc(env(safe-area-inset-top, 0px) + 4.5rem)) 1rem 5rem;
    }
  }

  .cl-album-stack-head {
    margin-bottom: 3.5rem;
  }

  .cl-album-stack-mast {
    padding: 0.15rem 0 0.15rem 0.85rem;
    border-left: 2px solid var(--cl-vermilion, #b93a2b);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cl-album-stack-kicker {
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--cl-muted, #716b64);
    line-height: 1;
  }

  .cl-album-stack-main-title {
    margin: 0;
    font-family: var(--cl-font-display, 'Hanken Grotesk', sans-serif);
    font-size: clamp(1.75rem, 3.6vw, 2.4rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    color: var(--cl-text, #23201d);
    line-height: 1.2;
    text-wrap: balance;
  }

  /* 动态 Notion「专辑」分类标签 */
  .cl-album-stack-tags {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 1.5rem;
    padding-left: 0.85rem;
  }

  .cl-album-stack-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 9999px;
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.08));
    background: transparent;
    color: var(--cl-muted, #716b64);
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.04em;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  .cl-album-stack-tag:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 2px;
  }

  .cl-album-stack-tag:hover {
    color: var(--cl-text, #23201d);
    border-color: color-mix(in srgb, var(--cl-text) 30%, transparent);
  }

  .dark .cl-album-stack-tag:hover {
    color: rgba(255, 255, 255, 0.95);
  }

  .cl-album-stack-tag.is-active {
    background: var(--cl-text, #23201d) !important;
    border-color: var(--cl-text, #23201d) !important;
    color: var(--cl-bg, #fff) !important;
  }

  .dark .cl-album-stack-tag.is-active {
    background: rgba(255, 255, 255, 0.92) !important;
    color: #121212 !important;
  }

  .cl-album-stack-tag-count {
    opacity: 0.7;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
  }



  /* STACK 先锋架构：「左侧定点锚定 · 右侧照片滚轮」 */
  .cl-shelf-stack-container {
    display: grid;
    grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
    gap: clamp(24px, 3.5vw, 48px);
    align-items: start;
    position: relative;
    width: 100%;
    margin-top: 1.5rem;
  }

  /* 精准点击热区交互光标 */
  .cl-clickable-target {
    cursor: pointer !important;
  }

  /* 彻底消除所有照片容器的白框与背景残留，直面自然纸面底色 */
  .cl-shelf-wheel-cover-wrap,
  .cl-shelf-wheel-cover,
  .cl-shelf-wheel-cover-img,
  .cl-shelf-wheel-aside-card,
  .cl-shelf-wheel-aside-img,
  .cl-album-stack-grid-card,
  .cl-album-stack-grid-img-wrap,
  .cl-album-stack-grid-img {
    background: transparent !important;
    border: none !important;
  }

  button.cl-shelf-wheel-cover,
  button.cl-shelf-wheel-aside-card,
  button.cl-album-stack-grid-card,
  button.cl-shelf-mobile-hud-inner {
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    text-align: inherit;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  button.cl-shelf-wheel-cover:focus-visible,
  button.cl-shelf-wheel-aside-card:focus-visible,
  button.cl-album-stack-grid-card:focus-visible,
  button.cl-shelf-mobile-hud-inner:focus-visible,
  .cl-album-item:focus-visible,
  .cl-about-hero-hint-text:focus-visible,
  .cl-album-deck-popover-back:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b) !important;
    outline-offset: 4px !important;
    border-radius: 4px;
  }

  /* 左侧定点信息区：固定在视口中 */
  .cl-shelf-pinned-col {
    position: sticky;
    top: 36vh;
    transform: translateY(-20%);
    display: flex;
    flex-direction: column;
    user-select: none;
    z-index: 10;
    padding-right: 16px;
  }

  .cl-shelf-pinned-panel {
    display: flex;
    flex-direction: column;
  }

  /* 切换当前项时的轻盈淡入动画 (纯透明度过渡，0 物理位移杜绝 CLS) */
  .cl-shelf-pinned-inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: cl-pinned-fade 0.25s ease both;
  }

  @keyframes cl-pinned-fade {
    from {
      opacity: 0.7;
    }
    to {
      opacity: 1;
    }
  }

  .cl-shelf-pinned-mast {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cl-shelf-pinned-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cl-vermilion, #b93a2b);
    flex-shrink: 0;
  }

  .cl-shelf-pinned-kicker {
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
    color: var(--cl-muted, #716b64);
  }

  .cl-shelf-pinned-title {
    margin: 0;
    font-family: var(--cl-font-display, 'Hanken Grotesk', sans-serif);
    font-size: clamp(1.75rem, 2.5vw, 2.4rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    color: var(--cl-text, #23201d);
    line-height: 1.25;
    text-wrap: balance;
    display: inline-block;
  }

  .cl-shelf-pinned-title-btn {
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    text-align: inherit;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.25s ease;
  }

  .cl-shelf-pinned-title-btn:hover {
    color: var(--cl-vermilion, #b93a2b);
  }

  .cl-shelf-pinned-title-btn:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .dark .cl-shelf-pinned-title-btn {
    color: rgba(255, 255, 255, 0.95);
  }

  .dark .cl-shelf-pinned-title-btn:hover {
    color: var(--cl-vermilion, #b93a2b);
  }

  .cl-shelf-pinned-desc {
    margin: 0;
    font-family: var(--cl-font-serif, 'Noto Serif SC', serif);
    font-size: 14px;
    line-height: 1.7;
    color: var(--cl-muted, #716b64);
    cursor: pointer;
    transition: color 0.25s ease;
  }

  .cl-shelf-pinned-desc:hover {
    color: var(--cl-text, #23201d);
  }

  .dark .cl-shelf-pinned-desc {
    color: rgba(255, 255, 255, 0.65);
  }

  .dark .cl-shelf-pinned-desc:hover {
    color: rgba(255, 255, 255, 0.92);
  }

  .cl-shelf-pinned-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    letter-spacing: 0.06em;
    color: var(--cl-muted, #716b64);
    opacity: 0.85;
    padding-top: 4px;
  }

  .cl-shelf-pinned-count {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .cl-shelf-pinned-sep {
    opacity: 0.4;
  }

  .cl-shelf-pinned-date {
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .cl-shelf-pinned-enter-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 8px 20px;
    width: fit-content;
    border-radius: 9999px;
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.1));
    background: transparent;
    color: var(--cl-text, #23201d);
    font-family: var(--cl-font-display, 'Hanken Grotesk', sans-serif);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
  }

  .cl-shelf-pinned-enter-btn:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 2px;
  }

  .cl-shelf-pinned-enter-btn:hover {
    border-color: var(--cl-vermilion, #b93a2b);
    color: var(--cl-vermilion, #b93a2b);
    transform: translateX(4px);
  }

  .dark .cl-shelf-pinned-enter-btn {
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  /* 右侧中轴照片滚轮区 (Photo Wheel Stage) */
  .cl-shelf-wheel-col {
    display: flex;
    flex-direction: column;
    gap: 130px; /* 先锋艺术展架纵向流动间距 */
    padding: 40px 0 200px;
    min-width: 0;
  }

  .cl-shelf-wheel-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    contain: layout;
    transition: opacity 0.4s ease;
  }

  /* 非当前激活项微降明度，凝聚视觉焦点于中央激活项 */
  .cl-shelf-wheel-item:not(.is-active) {
    opacity: 0.72;
  }

  .cl-shelf-wheel-stage {
    display: flex;
    align-items: center;
    gap: 28px;
    min-width: 0;
    contain: layout;
  }

  /* 中央主封面图 */
  .cl-shelf-wheel-cover-wrap {
    flex: 0 1 auto;
    max-width: 100%;
    min-width: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .cl-shelf-wheel-cover {
    position: relative;
    display: block;
    width: 100%;
    max-width: 100%;
    cursor: pointer;
    overflow: hidden;
    contain: layout;
    background: transparent !important;
  }

  .dark .cl-shelf-wheel-cover {
    background: transparent !important;
  }

  .cl-shelf-wheel-cover-img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 520px;
    object-fit: contain; /* 坚决不裁剪 */
    border-radius: 0 !important; /* 彻底去除圆角，还原艺术摄影直角展架质感 */
    border: none !important;
    outline: none !important;
    box-shadow: none !important; /* 彻底去除边框与阴影，还原纯粹底片与纸面质感 */
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    display: block;
    background: transparent !important;
  }

  .dark .cl-shelf-wheel-cover-img {
    box-shadow: none !important;
  }

  .cl-shelf-wheel-cover:hover .cl-shelf-wheel-cover-img,
  .cl-shelf-wheel-item.is-active .cl-shelf-wheel-cover-img {
    transform: scale(1.02);
    box-shadow: none !important;
  }

  .dark .cl-shelf-wheel-item.is-active .cl-shelf-wheel-cover-img {
    box-shadow: none !important;
  }

  /* 右侧同辑伴随照片容器 */
  .cl-shelf-wheel-aside-wrap {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .cl-shelf-wheel-aside-row {
    display: flex;
    align-items: center;
    gap: 18px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 12px 6px;
  }

  .cl-shelf-wheel-aside-row::-webkit-scrollbar {
    display: none;
  }

  /* 伴随照片卡片：激活时优雅横向铺展 */
  .cl-shelf-wheel-aside-card {
    flex: 0 0 auto;
    width: 180px;
    aspect-ratio: 4 / 3;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateX(36px);
    transition:
      opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
    cursor: pointer;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background-color: color-mix(in srgb, var(--cl-surface, #fff) 88%, rgba(0, 0, 0, 0.05));
  }

  .dark .cl-shelf-wheel-aside-card {
    background-color: rgba(255, 255, 255, 0.03);
  }

  .cl-shelf-wheel-item.is-active .cl-shelf-wheel-aside-card {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  .cl-shelf-wheel-aside-img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* 坚决不裁剪 */
    border-radius: 0 !important; /* 彻底去除圆角 */
    border: none !important;
    outline: none !important;
    box-shadow: none !important; /* 彻底去除边框与阴影 */
    display: block;
    background: transparent !important;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dark .cl-shelf-wheel-aside-img {
    box-shadow: none !important;
  }

  .cl-shelf-wheel-aside-card:hover .cl-shelf-wheel-aside-img {
    transform: scale(1.04) translateY(-2px);
  }

  /* 移动端专属定点中轴 HUD（桌面端隐藏） */
  .cl-shelf-mobile-sticky-hud {
    display: none;
  }

  /* 桌面端隐藏移动端专属刊头 */
  .cl-shelf-mobile-head {
    display: none;
  }

  /* —— 移动端/平板先锋艺术展架排版 (对齐全局 1024 导航断点：吸顶定点中轴 HUD + 滚轮流转) —— */
  @media (max-width: 1023px) {
    .cl-shelf-stack-container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      margin-top: 0.5rem;
      position: relative;
      width: 100%;
    }

    .cl-shelf-pinned-col {
      display: none;
    }

    /* 移动/平板专属吸顶定点中轴 HUD (对齐导航栏高质感透明毛玻璃材质) */
    .cl-shelf-mobile-sticky-hud {
      display: block;
      position: sticky;
      top: 52px; /* 紧贴顶部站点导航栏下方 */
      z-index: 28;
      width: calc(100% + 3rem);
      margin: 0 -1.5rem; /* 平板端伸展横贯至视口两侧边缘 */
      padding: 12px 1.5rem 14px;
      box-sizing: border-box;
      background-color: color-mix(in srgb, var(--cl-bg) 48%, transparent);
      backdrop-filter: blur(16px) saturate(1.12);
      -webkit-backdrop-filter: blur(16px) saturate(1.12);
      border-bottom: 1px solid color-mix(in srgb, var(--cl-border) 45%, transparent);
      transition: background-color var(--cl-dur, 0.3s) var(--cl-ease, ease);
    }

    .dark .cl-shelf-mobile-sticky-hud {
      background-color: color-mix(in srgb, var(--cl-bg) 58%, transparent);
      border-bottom-color: color-mix(in srgb, var(--cl-border) 50%, transparent);
    }

    @keyframes clHudCrossFade {
      0% {
        opacity: 0.25;
        transform: translateY(-3px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cl-shelf-mobile-hud-inner {
      animation: clHudCrossFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cl-shelf-mobile-hud-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .cl-shelf-mobile-hud-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .cl-shelf-mobile-hud-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--cl-vermilion, #b93a2b);
      flex-shrink: 0;
      animation: clPulse 2.5s infinite ease-in-out;
    }

    .cl-shelf-mobile-hud-index {
      font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
      font-size: 11px;
      font-weight: 500;
      color: var(--cl-muted, #716b64);
      letter-spacing: 0.06em;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .cl-shelf-mobile-hud-name {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--cl-text);
      line-height: 1.3;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cl-shelf-mobile-hud-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 9999px;
      background: rgba(185, 58, 43, 0.08);
      color: var(--cl-vermilion, #b93a2b);
      font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .dark .cl-shelf-mobile-hud-badge {
      background: rgba(224, 90, 71, 0.15);
      color: #ff7d6b;
    }

    .cl-shelf-mobile-hud-desc {
      font-size: 11.5px;
      line-height: 1.45;
      color: var(--cl-muted, #716b64);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.85;
      padding-left: 14px;
    }

    .cl-shelf-wheel-col {
      padding: 24px 0 100px;
      gap: 56px;
    }

    .cl-shelf-wheel-item {
      display: flex;
      flex-direction: column;
      gap: 0;
      opacity: 0.82;
      transition: opacity 0.35s ease;
    }

    .cl-shelf-wheel-item.is-active {
      opacity: 1;
    }

    /* 移动端照片舞台：主封面 + 向右自然伴随图 */
    .cl-shelf-wheel-stage {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      position: relative;
      overflow: hidden;
      padding: 0;
      background: transparent !important;
      border: none !important;
      outline: none !important;
    }

    .cl-shelf-wheel-cover-wrap {
      flex: 0 1 auto;
      width: 100%;
      max-width: 100%;
      display: flex;
      justify-content: center;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .cl-shelf-wheel-cover {
      width: auto;
      max-width: 100%;
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      border: none !important;
      box-shadow: none !important;
      contain: layout;
      background: transparent !important;
    }

    .dark .cl-shelf-wheel-cover {
      background: transparent !important;
    }

    .cl-shelf-wheel-cover-img {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 480px; /* 平板/大屏手机拥有更大画幅，绝不截断 */
      object-fit: contain;
      border-radius: 0 !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important; /* 彻底移除阴影暗边 */
      display: block;
      background: transparent !important;
    }

    .cl-shelf-wheel-aside-wrap {
      flex: 0 0 42%;
      max-width: 42%;
      overflow: visible;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .cl-shelf-wheel-aside-row {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: visible;
      padding: 0;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .cl-shelf-wheel-aside-card {
      flex: 0 0 100%;
      aspect-ratio: 4 / 3;
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translateX(18px);
      transition:
        opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      border: none !important;
      box-shadow: none !important;
    }

    .cl-shelf-wheel-item.is-active .cl-shelf-wheel-aside-card {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }

    .cl-shelf-wheel-aside-img {
      width: 100%;
      height: 100%;
      max-height: 280px;
      object-fit: contain;
      border-radius: 0 !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important; /* 彻底移除阴影暗边 */
      display: block;
      background: transparent !important;
    }
  }

  /* 手机端进一步微调图片高度与 HUD 边距 */
  @media (max-width: 767px) {
    .cl-shelf-mobile-sticky-hud {
      width: calc(100% + 2rem);
      margin: 0 -1rem;
      padding: 10px 1.25rem 12px;
    }

    .cl-shelf-wheel-cover-img {
      max-height: 380px;
    }
  }

  /* —— GRID 网格画册模式（至多 4 列紧凑节奏排版，紧凑标题与张数聚合） —— */
  .cl-album-stack-grid-view {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px 20px;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding-bottom: 90px;
    box-sizing: border-box;
  }

  @media (max-width: 1099px) {
    .cl-album-stack-grid-view {
      grid-template-columns: repeat(3, 1fr);
      gap: 20px 16px;
    }
  }

  @media (max-width: 767px) {
    .cl-album-stack-grid-view {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 10px;
      padding-bottom: 70px;
    }

    .cl-album-stack-grid-info {
      padding: 6px 0 0;
      gap: 2px;
    }

    .cl-album-stack-grid-title {
      font-size: 0.88rem;
      line-height: 1.3;
    }

    .cl-album-stack-grid-count {
      font-size: 10px;
    }
  }

  @media (min-width: 540px) and (max-width: 767px) {
    .cl-album-stack-grid-view {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px 12px;
    }
  }

  .cl-album-stack-grid-card {
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
    cursor: pointer;
    background: transparent !important;
    border: none !important;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  .cl-album-stack-grid-card:hover {
    transform: translateY(-3px);
  }

  .cl-album-stack-grid-img-wrap {
    width: 100%;
    aspect-ratio: 3 / 4;
    position: relative;
    overflow: hidden;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .cl-album-stack-grid-img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    object-position: center bottom;
    border-radius: 0 !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    transition: transform 0.25s ease;
  }

  .dark .cl-album-stack-grid-img {
    box-shadow: none !important;
  }

  .cl-album-stack-grid-card:hover .cl-album-stack-grid-img {
    transform: scale(1.02);
    box-shadow: none !important;
  }

  .cl-album-stack-grid-info {
    padding: 8px 0 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    width: 100%;
  }

  .cl-album-stack-grid-title {
    margin: 0;
    font-family: var(--cl-font-display, sans-serif);
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--cl-text);
    text-align: left;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }

  .cl-album-stack-grid-count {
    font-family: var(--cl-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
    color: var(--cl-muted);
  }

  /* —— 底部浮动视图切换胶囊 [ 堆叠 | 网格 ] —— */
  .cl-album-mode-capsule-wrap {
    position: fixed;
    bottom: max(28px, calc(env(safe-area-inset-bottom, 0px) + 16px));
    left: 50%;
    transform: translateX(-50%) translateY(0);
    z-index: 50;
    pointer-events: none;
    transition:
      opacity 0.3s ease,
      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* 触底遇 Footer 时自动避让隐退，彻底杜绝遮挡底部文字 */
  .cl-album-mode-capsule-wrap.is-hidden-footer {
    opacity: 0;
    transform: translateX(-50%) translateY(calc(24px + env(safe-area-inset-bottom, 0px)));
    pointer-events: none !important;
  }

  .cl-album-mode-capsule {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--cl-bg) 55%, transparent);
    backdrop-filter: blur(16px) saturate(1.12);
    -webkit-backdrop-filter: blur(16px) saturate(1.12);
    border: 1px solid color-mix(in srgb, var(--cl-border) 60%, transparent);
    box-shadow: 0 10px 32px -4px rgba(0, 0, 0, 0.12);
    pointer-events: auto;
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }

  .dark .cl-album-mode-capsule {
    background: color-mix(in srgb, var(--cl-bg) 65%, transparent);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 32px -4px rgba(0, 0, 0, 0.55);
  }

  .cl-album-mode-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 18px;
    border-radius: 9999px;
    border: none;
    background: transparent;
    font-family: var(--cl-font-display, 'Hanken Grotesk', sans-serif);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    color: var(--cl-muted, #716b64);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
  }

  .cl-album-mode-btn:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 2px;
  }

  .dark .cl-album-mode-btn {
    color: rgba(255, 255, 255, 0.65);
  }

  .cl-album-mode-btn:hover {
    color: var(--cl-text, #23201d);
  }

  .dark .cl-album-mode-btn:hover {
    color: rgba(255, 255, 255, 0.95);
  }

  .cl-album-mode-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--cl-vermilion, #b93a2b);
    opacity: 0;
    transform: scale(0.6);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .cl-album-mode-btn.is-active {
    background: var(--cl-text, #23201d) !important;
    color: var(--cl-bg, #fff) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  }

  .cl-album-mode-btn.is-active .cl-album-mode-dot {
    opacity: 1;
    transform: scale(1);
  }

  .dark .cl-album-mode-btn.is-active {
    background: rgba(255, 255, 255, 0.92) !important;
    color: #121212 !important;
  }

  /* —— 清爽轻量影集快速切辑器 (AlbumDeckNav) —— */
  /* 右下角灵动影集目录定位 (安全区响应式) */
  .cl-album-deck-nav-root {
    position: fixed;
    bottom: max(28px, calc(env(safe-area-inset-bottom) + 16px));
    right: max(24px, calc(env(safe-area-inset-right) + 12px));
    z-index: 50;
  }

  @media (max-width: 767px) {
    .cl-album-deck-nav-root {
      bottom: max(24px, calc(env(safe-area-inset-bottom) + 12px));
      right: max(16px, calc(env(safe-area-inset-right) + 8px));
    }
  }

  .cl-album-deck-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 9999px;
    background-color: color-mix(in srgb, var(--cl-bg) 58%, transparent);
    backdrop-filter: blur(16px) saturate(1.12);
    -webkit-backdrop-filter: blur(16px) saturate(1.12);
    border: 1px solid color-mix(in srgb, var(--cl-border) 60%, transparent);
    box-shadow: 0 6px 24px -4px rgba(0, 0, 0, 0.14);
    color: var(--cl-text, #23201d);
    font-family: var(--cl-font-display, 'Hanken Grotesk', sans-serif);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.25s ease,
      border-color 0.2s ease,
      padding 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cl-album-deck-nav-btn::before {
    content: '';
    position: absolute;
    inset: -6px;
  }

  .cl-album-deck-nav-btn:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 2px;
  }

  .cl-album-deck-nav-btn:hover {
    transform: translateY(-2px) scale(1.03);
    border-color: var(--cl-vermilion, #b93a2b);
    color: var(--cl-vermilion, #b93a2b);
    box-shadow: 0 10px 28px rgba(185, 58, 43, 0.2);
  }

  .dark .cl-album-deck-nav-btn {
    background-color: color-mix(in srgb, var(--cl-bg) 65%, transparent);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 6px 24px -4px rgba(0, 0, 0, 0.6);
    color: rgba(255, 255, 255, 0.92);
  }

  .cl-album-deck-nav-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  /* 下拉滚动动态折叠文字微动效 */
  .cl-album-deck-nav-label-wrap {
    display: inline-flex;
    overflow: hidden;
    max-width: 80px;
    opacity: 1;
    white-space: nowrap;
    transition:
      max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.25s ease;
  }

  .cl-album-deck-nav-btn.is-collapsed .cl-album-deck-nav-label-wrap {
    max-width: 0;
    opacity: 0;
  }

  .cl-album-deck-nav-btn.is-collapsed {
    padding: 7px 10px;
    gap: 5px;
  }

  .cl-album-deck-nav-btn.is-collapsed .cl-album-deck-nav-arrow {
    display: none;
  }

  .cl-album-deck-nav-label {
    letter-spacing: 0.02em;
  }

  .cl-album-deck-nav-badge {
    padding: 1px 6px;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--cl-vermilion, #b93a2b) 12%, transparent);
    font-family: var(--cl-font-mono, monospace);
    font-size: 10px;
    font-weight: 600;
    color: var(--cl-vermilion, #b93a2b);
  }

  .dark .cl-album-deck-nav-badge {
    background: rgba(224, 90, 71, 0.2);
    color: #ff7d6b;
  }

  .cl-album-deck-nav-arrow {
    transition: transform 0.25s ease;
  }

  .cl-album-deck-nav-btn.is-open .cl-album-deck-nav-arrow {
    transform: rotate(180deg);
  }

  /* 浮动下拉面板：从右下角优雅向上展开 (Bottom-Up) */
  .cl-album-deck-popover {
    position: absolute;
    bottom: calc(100% + 12px);
    right: 0;
    left: auto;
    top: auto;
    width: 290px;
    max-height: 420px;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    background: color-mix(in srgb, var(--cl-surface, #fff) 92%, transparent);
    backdrop-filter: blur(24px) saturate(1.15);
    -webkit-backdrop-filter: blur(24px) saturate(1.15);
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.08));
    box-shadow: 0 20px 48px -10px rgba(0, 0, 0, 0.22);
    overflow: hidden;
    overscroll-behavior: contain;
    animation: cl-popover-up 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
    transform-origin: bottom right;
  }

  .dark .cl-album-deck-popover {
    background: color-mix(in srgb, #181716 92%, transparent);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 48px -10px rgba(0, 0, 0, 0.7);
  }

  @keyframes cl-popover-up {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .cl-album-deck-popover-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--cl-border, rgba(0, 0, 0, 0.06));
    font-size: 11px;
  }

  .dark .cl-album-deck-popover-head {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .cl-album-deck-popover-current {
    font-family: var(--cl-font-display, sans-serif);
    color: var(--cl-muted, #716b64);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 170px;
  }

  .cl-album-deck-popover-back {
    border: none;
    background: transparent;
    color: var(--cl-vermilion, #b93a2b);
    font-family: var(--cl-font-mono, monospace);
    font-size: 11px;
    cursor: pointer;
    padding: 2px 4px;
    transition: opacity 0.2s ease;
  }

  .cl-album-deck-popover-back:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .cl-album-deck-popover-list {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cl-album-deck-popover-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 8px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.2s ease, color 0.2s ease;
    width: 100%;
  }

  .cl-album-deck-popover-item:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: -2px;
  }

  .cl-album-deck-popover-item:hover {
    background: color-mix(in srgb, var(--cl-text) 5%, transparent);
  }

  .dark .cl-album-deck-popover-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .cl-album-deck-popover-item.is-active {
    background: color-mix(in srgb, var(--cl-vermilion) 10%, transparent);
  }

  .dark .cl-album-deck-popover-item.is-active {
    background: color-mix(in srgb, var(--cl-vermilion) 16%, transparent);
  }

  .cl-album-deck-popover-thumb {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    overflow: hidden;
    background: color-mix(in srgb, var(--cl-border) 40%, transparent);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cl-album-deck-popover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cl-album-deck-popover-ph {
    font-size: 10px;
    color: var(--cl-muted);
  }

  .cl-album-deck-popover-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .cl-album-deck-popover-name {
    font-family: var(--cl-font-display, sans-serif);
    font-size: 12px;
    font-weight: 500;
    color: var(--cl-text, #23201d);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dark .cl-album-deck-popover-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .cl-album-deck-popover-item.is-active .cl-album-deck-popover-name,
  .cl-album-deck-popover-item:hover .cl-album-deck-popover-name {
    color: var(--cl-vermilion, #b93a2b);
  }

  .cl-album-deck-popover-count {
    font-family: var(--cl-font-mono, monospace);
    font-size: 10px;
    color: var(--cl-muted, #716b64);
  }

  .cl-album-deck-popover-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--cl-vermilion, #b93a2b);
    flex-shrink: 0;
  }

  /* —— 瀑布展墙特化 (AlbumInfiniteWall) —— */
  .cl-album-stage {
    touch-action: none !important;
    overscroll-behavior: none !important;
  }

  .cl-album-canvas {
    box-sizing: border-box;
  }

  /* 彻底消除首排图片顶部荒漠空白：将瀑布展墙绝对定位起点紧凑贴合顶栏与顶部居中胶囊，保持 14px 垂直对称间距 */
  .cl-album-masonry-wall {
    top: 56px !important;
  }

  /* 影集展墙完结区域：独立界限，严格隔离在所有照片下方 */
  .cl-album-wall-end {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 50px 0 140px;
    pointer-events: auto;
    z-index: 10;
    box-sizing: border-box;
  }

  .cl-album-end-boundary {
    display: flex;
    align-items: center;
    gap: 14px;
    width: min(85vw, 440px);
    margin-bottom: 2px;
  }

  .cl-album-end-line {
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--cl-border) 75%, transparent);
  }

  .cl-album-end-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cl-vermilion, #b93a2b);
    animation: cl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .cl-album-end-count {
    margin: 0;
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--cl-muted, #716b64);
  }

  .dark .cl-album-end-count {
    color: rgba(255, 255, 255, 0.6);
  }

  .cl-album-end-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    padding: 8px 22px;
    border-radius: 9999px;
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.1));
    background: color-mix(in srgb, var(--cl-surface, #fff) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    color: var(--cl-text, #23201d);
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
  }

  .dark .cl-album-end-back-btn {
    background: color-mix(in srgb, #202020 88%, transparent);
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .cl-album-end-back-btn:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 2px;
  }

  .cl-album-end-back-btn:hover {
    border-color: var(--cl-vermilion, #b93a2b);
    color: var(--cl-vermilion, #b93a2b);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* 顶部居中当前影集胶囊按钮（绝对锚定在画廊舞台内部，严格以顶栏底边为原点，保持 14px-28px-14px 垂直对称） */
  .cl-album-prologue-top-btn,
  .cl-album-prologue-center-btn {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    z-index: 35;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 28px;
    min-height: 28px;
    line-height: 26px;
    padding: 0 14px;
    box-sizing: border-box;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--cl-bg) 55%, transparent);
    backdrop-filter: blur(16px) saturate(1.12);
    -webkit-backdrop-filter: blur(16px) saturate(1.12);
    border: 1px solid color-mix(in srgb, var(--cl-border) 45%, transparent);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    color: var(--cl-text, #23201d);
    font-family: var(--cl-font-display, 'Hanken Grotesk', sans-serif);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    opacity: 1;
    pointer-events: auto;
    transition:
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .cl-album-prologue-top-btn::before,
  .cl-album-prologue-center-btn::before {
    content: '';
    position: absolute;
    inset: -8px;
  }

  .cl-album-prologue-top-btn:focus-visible,
  .cl-album-prologue-center-btn:focus-visible {
    outline: 2px solid var(--cl-vermilion, #b93a2b);
    outline-offset: 2px;
  }

  /* 顶栏收缩时，Hero 按钮阴影联动强化（随舞台自然上浮，无需硬编码 top） */
  .cl-album-prologue-top-btn.is-scrolled,
  .cl-album-prologue-center-btn.is-scrolled {
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
  }

  .cl-album-prologue-top-btn.is-active,
  .cl-album-prologue-center-btn.is-active {
    background: color-mix(in srgb, var(--cl-surface, #fff) 90%, transparent);
    border-color: var(--cl-vermilion, #b93a2b);
    color: var(--cl-vermilion, #b93a2b);
    box-shadow: 0 4px 20px rgba(185, 58, 43, 0.16);
  }

  .dark .cl-album-prologue-top-btn,
  .dark .cl-album-prologue-center-btn {
    background: color-mix(in srgb, var(--cl-bg) 65%, transparent);
    border-color: color-mix(in srgb, var(--cl-border) 45%, transparent);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.92);
  }

  .dark .cl-album-prologue-top-btn.is-active,
  .dark .cl-album-prologue-center-btn.is-active {
    background: color-mix(in srgb, #222 90%, transparent);
    border-color: var(--cl-vermilion, #b93a2b);
    color: #ff7d6b;
  }

  .cl-album-prologue-top-btn:hover,
  .cl-album-prologue-center-btn:hover {
    border-color: var(--cl-vermilion, #b93a2b);
    color: var(--cl-vermilion, #b93a2b);
    transform: translateX(-50%) translateY(1px);
    box-shadow: 0 6px 24px rgba(185, 58, 43, 0.16);
  }

  @media (max-width: 767px) {
    .cl-album-prologue-top-btn,
    .cl-album-prologue-center-btn {
      top: 14px;
      max-width: 60vw;
      height: 28px;
      min-height: 28px;
      line-height: 26px;
      padding: 0 12px;
      font-size: 11px;
      box-sizing: border-box;
    }

    .cl-album-prologue-top-btn .cl-album-prologue-title,
    .cl-album-prologue-center-btn .cl-album-prologue-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cl-album-prologue-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cl-vermilion, #b93a2b);
    animation: cl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .cl-album-prologue-title {
    white-space: nowrap;
  }

  .cl-album-hero-meta {
    margin-top: 14px;
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    letter-spacing: 0.12em;
    font-variant-numeric: tabular-nums;
    color: var(--cl-muted, #716b64);
  }

  .dark .cl-album-hero-meta {
    color: rgba(255, 255, 255, 0.65);
  }

  /* —— 全屏灯箱 (AlbumLightbox) —— */
  .cl-ag-lb {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    overscroll-behavior: contain;
    animation: cl-ag-lb-in 0.25s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    [class*="cl-album"],
    [class*="cl-shelf"],
    [class*="cl-album"] *,
    [class*="cl-shelf"] *,
    .cl-ag-lb,
    .cl-ag-lb * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  .cl-ag-lb :focus-visible {
    outline: 2px solid #f5f0e4;
    outline-offset: 2px;
  }

  @keyframes cl-ag-lb-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }

  .cl-ag-lb-mask {
    position: absolute;
    inset: 0;
    border: 0;
    padding: 0;
    background: rgba(12, 10, 8, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    cursor: pointer;
  }

  .dark .cl-ag-lb-mask {
    background: rgba(0, 0, 0, 0.92);
  }

  .cl-ag-lb-close {
    position: absolute;
    top: max(1.25rem, env(safe-area-inset-top));
    right: max(1.25rem, env(safe-area-inset-right));
    z-index: 10;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.08);
    color: #f5f0e4;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }

  .cl-ag-lb-close:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.45);
    transform: scale(1.05);
  }

  .cl-ag-lb-stage {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: min(96vw, 64rem);
    max-height: 92dvh;
    padding: 2rem 2.5rem 1rem;
    pointer-events: none;
    box-sizing: border-box;
  }

  .cl-ag-lb-frame {
    position: relative;
    pointer-events: auto;
  }

  .cl-ag-lb-zones {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
  }

  .cl-ag-lb-zone {
    flex: 1 1 0;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  .cl-ag-lb-zone:disabled {
    cursor: default;
  }

  .cl-ag-lb-img {
    display: block;
    width: auto;
    height: auto;
    max-width: min(92vw, 60rem);
    max-height: min(78dvh, 46rem);
    object-fit: contain;
    border-radius: 0 !important;
    box-shadow: 0 16px 54px rgba(0, 0, 0, 0.55);
    pointer-events: none;
  }

  .cl-ag-lb-meta {
    margin-top: 1rem;
    text-align: center;
    color: rgba(245, 240, 228, 0.92);
    pointer-events: none;
  }

  .cl-ag-lb-title {
    margin: 0 0 0.25rem;
    font-family: var(--cl-font-display, Georgia, serif);
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: pre-line;
  }

  .cl-ag-lb-count {
    margin: 0;
    font-family: var(--cl-font-mono, ui-monospace, monospace);
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    opacity: 0.75;
  }
`
