/**
 * Circle of Life — about：关于页 2D 无限视差平铺网格专属样式
 */
export const aboutStyle = `
  /* —— 关于页：视口严格锁定与无缝视差画布（彻底禁止移动端橡皮筋露底与外部网页滚动） —— */
  html.cl-about-locked,
  body.cl-about-locked {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    overflow: hidden !important;
    overscroll-behavior: none !important;
    -webkit-overflow-scrolling: auto !important;
    touch-action: none !important;
  }

  #theme-circlelife.cl-is-about {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden !important;
    overscroll-behavior: none !important;
    touch-action: none !important;
  }

  #theme-circlelife.cl-is-about #container-inner,
  #theme-circlelife.cl-is-about #container-wrapper {
    max-width: none;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
    touch-action: none;
  }

  /* 顶栏浮于画廊之上，带有纸质磨砂质感 */
  #theme-circlelife.cl-is-about .cl-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    background: color-mix(in srgb, var(--cl-bg) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--cl-border);
    transition:
      background-color 0.28s var(--cl-ease, cubic-bezier(0.16, 1, 0.3, 1)),
      border-color 0.28s var(--cl-ease, cubic-bezier(0.16, 1, 0.3, 1)),
      box-shadow 0.28s var(--cl-ease, cubic-bezier(0.16, 1, 0.3, 1));
  }

  #theme-circlelife.cl-is-about .cl-header.is-scrolled {
    background: color-mix(in srgb, var(--cl-bg) 95%, transparent);
    border-bottom-color: color-mix(in srgb, var(--cl-border) 60%, transparent);
    box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
  }

  .cl-about-stage {
    touch-action: none !important;
    overscroll-behavior: none !important;
  }

  /* 画布区域：拦截默认滚动穿透与拉伸，启用 3D 空间透视 */
  #cl-about-canvas {
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    perspective: 1400px;
    perspective-origin: 50% 50%;
  }

  /* 抓取手型 */
  body.cursor-grabbing,
  body.cursor-grabbing #cl-about-canvas {
    cursor: grabbing !important;
  }

  /* 3D 摄影瀑布展墙容器：全景空间透视环境 */
  .cl-about-masonry-wall {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    gap: 32px;
    padding: 0 40px;
    box-sizing: border-box;
    transform-style: preserve-3d;
    will-change: transform;
    pointer-events: auto;
  }

  @media (max-width: 1439px) {
    .cl-about-masonry-wall {
      gap: 24px;
      padding: 0 24px;
    }
  }

  @media (max-width: 767px) {
    .cl-about-masonry-wall {
      gap: 14px;
      padding: 0 14px;
    }
  }

  /* 瀑布流单列（2D 硬件加速，避免层级 3D 嵌套过深） */
  .cl-about-column {
    position: relative;
    height: 100%;
    overflow: visible;
  }

  /* 列流动轨道 */
  .cl-about-col-track {
    display: flex;
    flex-direction: column;
    will-change: transform;
  }

  /* 循环周期单元集（精准 28px 间隙，严禁重叠） */
  .cl-about-col-set {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding-bottom: 28px;
  }

  @media (max-width: 767px) {
    .cl-about-col-set {
      gap: 18px;
      padding-bottom: 18px;
    }
  }

  /* 直角单项卡片：启用 3D 变换环境与独立渲染隔离 */
  .cl-about-item {
    position: relative;
    width: 100%;
    contain: paint layout;
    will-change: transform;
    transform-style: preserve-3d;
    white-space: normal;
    background: transparent !important;
    cursor: grab;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
  }

  /* 悬停智能提层 (Hover Lift)：瞬间置顶破壁遮挡 */
  .cl-about-item.is-hovered {
    z-index: 9999 !important;
    transform: translateZ(50px) scale(1.02);
  }

  .cl-about-item .item-wrapper {
    will-change: transform;
    transform-style: preserve-3d;
    background: transparent !important;
  }

  /* 图片容器：紧密包裹照片，无多余白边或脱节线框 */
  .cl-about-item .item-image {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: transparent !important;
    border: none !important;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.12);
    transition: box-shadow 0.35s ease;
  }

  .cl-about-item.is-hovered .item-image {
    box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.32);
  }

  .dark .cl-about-item .item-image {
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.45);
  }

  .dark .cl-about-item.is-hovered .item-image {
    box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.8);
  }

  .cl-about-item .item-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    pointer-events: none;
    will-change: transform;
    background: transparent !important;
  }

  /* 纯透明科技/克制题注 */
  .cl-about-item small.cl-about-caption {
    width: 100%;
    display: block;
    margin-top: 10px;
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    line-height: 1.35;
    letter-spacing: 0.02em;
    color: var(--cl-muted, #716b64);
    background: transparent;
  }

  .dark .cl-about-item small.cl-about-caption {
    color: rgba(255, 255, 255, 0.65);
  }

  .cl-about-item small.cl-about-caption .caption-title {
    font-weight: 500;
    color: var(--cl-text, #23201d);
    margin-bottom: 2px;
  }

  .dark .cl-about-item small.cl-about-caption .caption-title {
    color: rgba(255, 255, 255, 0.92);
  }

  /* 文字分行滑入揭示动画 (SplitText 动效还原) */
  .cl-about-item small.cl-about-caption .line-mask {
    overflow: hidden;
    display: block;
    transition: transform 1.8s cubic-bezier(0.6, 0.14, 0, 1);
  }

  .cl-about-item small.cl-about-caption .line {
    display: block;
    transition: transform 1.8s cubic-bezier(0.6, 0.14, 0, 1);
  }

  .cl-about-item small.cl-about-caption:not(.visible) .line-mask {
    transform: translateY(100%);
  }

  .cl-about-item small.cl-about-caption:not(.visible) .line {
    transform: translateY(110%);
  }

  @media (max-width: 767px) {
    .cl-about-item small.cl-about-caption {
      margin-top: 6px;
      font-size: 9px;
      line-height: 1.25;
    }
  }

  /* —— Hero 序言封面与沉浸式过渡层（静态滤镜 + 纯 GPU Opacity 驱动，彻底消除 iOS Safari 重算掉帧） —— */
  .cl-about-hero-backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    will-change: opacity, visibility;
    background-color: rgba(247, 245, 240, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .dark .cl-about-hero-backdrop {
    background-color: rgba(18, 18, 18, 0.78);
  }

  .cl-about-hero-overlay {
    position: absolute;
    inset: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    text-align: center;
    box-sizing: border-box;
    will-change: transform, opacity;
    touch-action: none !important;
    overscroll-behavior: none !important;
  }

  .cl-about-hero-inner {
    max-width: 840px;
    display: flex;
    flex-direction: column;
    align-items: center;
    touch-action: none !important;
  }

  .cl-about-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--cl-muted, #716b64);
    margin-bottom: 24px;
    padding: 4px 12px;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--cl-surface, #fff) 80%, transparent);
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.08));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .cl-about-hero-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--cl-vermilion, #b93a2b);
    animation: cl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .cl-about-hero-summary {
    font-family: var(--cl-font-serif, 'Noto Serif SC', Georgia, serif);
    font-size: clamp(1.35rem, 3.2vw, 2.25rem);
    font-weight: 400;
    line-height: 1.68;
    letter-spacing: 0.02em;
    color: var(--cl-text, #23201d);
    margin: 0;
    text-wrap: balance;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none !important;
  }

  .dark .cl-about-hero-summary {
    color: rgba(255, 255, 255, 0.94);
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.45);
  }

  /* 纯粹极简文字指引（无胶囊边框、无色块背景，克制自然） */
  .cl-about-hero-hint-text {
    margin-top: 36px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--cl-muted, #716b64);
    opacity: 0.75;
    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .dark .cl-about-hero-hint-text {
    color: rgba(255, 255, 255, 0.55);
  }

  .cl-about-hero-hint-arrow {
    width: 13px;
    height: 13px;
    opacity: 0.7;
    animation: cl-hero-chevron 2.2s ease-in-out infinite;
  }

  @keyframes cl-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }

  @keyframes cl-hero-chevron {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50% { transform: translateY(4px); opacity: 0.95; }
  }

  /* —— 极简返回顶部 / 回到序言按钮 —— */
  .cl-about-back-top {
    position: fixed;
    bottom: calc(28px + env(safe-area-inset-bottom, 0px));
    right: calc(28px + env(safe-area-inset-right, 0px));
    z-index: 50;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--cl-surface, #fff) 85%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.08));
    color: var(--cl-muted, #716b64);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    outline: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation !important;
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px);
    transition:
      opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.25s ease,
      color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .dark .cl-about-back-top {
    background: color-mix(in srgb, #202020 85%, transparent);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.65);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }

  .cl-about-back-top.is-visible {
    opacity: 0.92;
    pointer-events: auto !important;
    transform: translateY(0);
  }

  .cl-about-back-top:hover {
    opacity: 1;
    color: var(--cl-vermilion, #b93a2b);
    border-color: color-mix(in srgb, var(--cl-vermilion) 35%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .cl-about-back-top svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    transition: transform 0.25s ease;
    pointer-events: none;
  }

  .cl-about-back-top:hover svg {
    transform: translateY(-1px);
  }

  @media (max-width: 767px) {
    .cl-about-back-top {
      bottom: calc(20px + env(safe-area-inset-bottom, 16px));
      right: calc(18px + env(safe-area-inset-right, 0px));
      width: 38px;
      height: 38px;
    }
  }
`

