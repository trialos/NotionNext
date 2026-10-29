/**
 * Circle of Life — about：关于页 2D 无限视差平铺网格专属样式
 */
export const aboutStyle = `
  /* —— 关于页：视口严格锁定与无缝视差画布 ——
     手势策略按指针类型收口：粗指针（手机）保留 pinch-zoom 与纵向滚动，
     细指针（桌面）才彻底接管手势，避免桌面端画布被浏览器手势打断 */
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
    overscroll-behavior: auto;
    -webkit-overflow-scrolling: auto !important;
    touch-action: pan-y pinch-zoom;
  }

  #theme-circlelife.cl-is-about {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden !important;
    overscroll-behavior: auto;
    touch-action: pan-y pinch-zoom;
  }

  #theme-circlelife.cl-is-about #container-inner,
  #theme-circlelife.cl-is-about #container-wrapper {
    max-width: none;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
    touch-action: pan-y pinch-zoom;
  }

  /* 桌面端（鼠标/触控板）才由画布完全接管手势 */
  @media (pointer: fine) {
    html.cl-about-locked,
    body.cl-about-locked,
    #theme-circlelife.cl-is-about,
    #theme-circlelife.cl-is-about #container-inner,
    #theme-circlelife.cl-is-about #container-wrapper {
      overscroll-behavior: none !important;
      touch-action: none !important;
    }
  }

  /* 画布与舞台是拖拽面，必须由脚本接管手势（这层不分指针类型） */
  .cl-about-stage {
    touch-action: none !important;
    overscroll-behavior: none !important;
  }

  /* 画布区域：拦截默认滚动穿透与拉伸，严格隔离渲染上下文 */
  #cl-about-canvas {
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    contain: strict;
  }

  /* 抓取手型 */
  body.cursor-grabbing,
  body.cursor-grabbing #cl-about-canvas {
    cursor: grabbing !important;
  }

  /* 摄影瀑布展墙容器：全景 2D 硬件加速环境 */
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

  /* 瀑布流单列（切断各列重排传染，避免 paint 隔离造成层剪裁与额外图层开销） */
  .cl-about-column {
    position: relative;
    height: 100%;
    overflow: visible;
    contain: layout;
  }

  /* 列流动轨道（GPU 加速与独立复合层） */
  .cl-about-col-track {
    display: flex;
    flex-direction: column;
    will-change: transform;
    transform: translateZ(0);
  }

  /* 循环周期单元集（精准 28px 间隙，严禁重叠） */
  .cl-about-col-set {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding-bottom: 28px;
  }

  /* 镜像集 Set B：离屏非关键渲染跳过（初始加载时跳过 50% DOM 渲染开销） */
  .cl-about-col-set-b {
    content-visibility: auto;
    contain-intrinsic-size: auto 3000px;
  }

  @media (max-width: 767px) {
    .cl-about-col-set {
      gap: 18px;
      padding-bottom: 18px;
    }
  }

  /* 直角单项卡片：精简图层，由父级列轨道统一步伐硬件加速，杜绝过度隔离导致的 Layerize 瓶颈 */
  .cl-about-item {
    position: relative;
    width: 100%;
    break-inside: avoid;
    white-space: normal;
    background: transparent !important;
    cursor: grab;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
  }

  /* 悬停智能提层 (Hover Lift)：原生 CSS 鼠标悬停支持（零 JS 闭包与事件绑定泄漏） */
  @media (hover: hover) and (pointer: fine) {
    .cl-about-item:hover {
      z-index: 9999 !important;
      transform: translateY(-4px) scale(1.02);
    }
    .cl-about-item:hover .item-image {
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.32);
    }
    .dark .cl-about-item:hover .item-image {
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.8);
    }
  }

  .cl-about-item .item-wrapper {
    background: transparent !important;
  }

  /* 图片容器：固定比例视窗，优雅纸质骨架底色，未加载前占据确定空间（零 CLS） */
  .cl-about-item .item-image {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: color-mix(in srgb, var(--cl-border, #e5e0d8) 35%, var(--cl-surface, #fff)) !important;
    border: none !important;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.12);
    transition: box-shadow 0.35s ease;
  }

  .dark .cl-about-item .item-image {
    background-color: rgba(255, 255, 255, 0.06) !important;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.45);
  }

  .cl-about-item .item-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    pointer-events: none;
    background: transparent !important;
    opacity: 0;
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .cl-about-item .item-image img.is-loaded {
    opacity: 1;
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

  /* —— Hero 序言独立幕布与毛玻璃暗膜层（解耦幕布式，零重载原位降落） —— */
  .cl-about-hero-backdrop {
    position: absolute;
    inset: 0;
    pointer-events: auto;
    z-index: 20;
    background-color: rgba(247, 245, 240, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    opacity: 1;
    visibility: visible;
    will-change: opacity, visibility;
    contain: strict;
    transition:
      opacity 0.5s ease,
      visibility 0.5s ease;
  }

  .dark .cl-about-hero-backdrop {
    background-color: rgba(18, 18, 18, 0.78);
  }

  .cl-about-hero-backdrop.is-closed {
    opacity: 0;
    pointer-events: none !important;
    visibility: hidden;
  }

  .cl-about-hero-overlay {
    position: absolute;
    inset: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 var(--cl-hero-gutter);
    text-align: center;
    box-sizing: border-box;
    transform: translate3d(0, 0, 0);
    opacity: 1;
    visibility: visible;
    will-change: transform, opacity, visibility;
    contain: layout paint style;
    pointer-events: auto;
    transition:
      transform 0.58s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.45s ease,
      visibility 0.58s ease;
    touch-action: pan-y;
  }

  .cl-about-hero-overlay.is-closed {
    transform: translate3d(0, -100%, 0);
    opacity: 0;
    pointer-events: none !important;
    visibility: hidden;
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

  /* 序言长导语：正文级字号，不折叠、不内部滚动；宽度由 token 单点控制 */
  .cl-about-hero-lead {
    width: min(var(--cl-hero-lead-measure), calc(100vw - var(--cl-hero-gutter) * 2));
    max-width: 100%;
    margin: 1.1rem 0 0;
    font-family: var(--cl-font-body);
    font-size: var(--cl-prose-size);
    font-weight: 400;
    line-height: var(--cl-prose-leading);
    color: var(--cl-muted);
    text-align: center;
    text-wrap: pretty;
    overflow-wrap: break-word;
    white-space: pre-line;
    user-select: none;
    -webkit-user-select: none;
  }

  /* 纯粹极简文字指引（可点击快速收起幕布进入画廊） */
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
    opacity: 0.85;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 6px 14px;
    border-radius: 9999px;
    transition: opacity 0.3s ease, transform 0.25s ease, color 0.25s ease;
    pointer-events: auto;
  }

  .cl-about-hero-hint-text:hover {
    opacity: 1;
    color: var(--cl-vermilion, #b93a2b);
    transform: translateY(2px);
  }

  .dark .cl-about-hero-hint-text {
    color: rgba(255, 255, 255, 0.65);
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

  /* —— 极简「序言」朱砂徽标胶囊（原位唤出序言幕布） —— */
  .cl-about-prologue-btn {
    position: fixed;
    bottom: calc(28px + env(safe-area-inset-bottom, 0px));
    right: calc(28px + env(safe-area-inset-right, 0px));
    z-index: 50;
    height: 36px;
    padding: 0 14px 0 10px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: color-mix(in srgb, var(--cl-surface, #fff) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--cl-border, rgba(0, 0, 0, 0.08));
    color: var(--cl-text, #23201d);
    font-family: var(--cl-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation !important;
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px);
    transition:
      opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.25s ease,
      color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .dark .cl-about-prologue-btn {
    background: color-mix(in srgb, #202020 85%, transparent);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }

  .cl-about-prologue-btn.is-visible {
    opacity: 0.92;
    pointer-events: auto !important;
    transform: translateY(0);
  }

  .cl-about-prologue-btn:hover {
    opacity: 1;
    color: var(--cl-vermilion, #b93a2b);
    border-color: color-mix(in srgb, var(--cl-vermilion) 35%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .cl-about-prologue-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--cl-vermilion, #b93a2b);
    animation: cl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .cl-about-prologue-text {
    font-weight: 500;
  }

  @media (max-width: 767px) {
    .cl-about-prologue-btn {
      bottom: calc(20px + env(safe-area-inset-bottom, 16px));
      right: calc(18px + env(safe-area-inset-right, 0px));
      height: 34px;
      padding: 0 12px 0 8px;
      font-size: 10px;
    }
  }

  /* 键盘焦点可见：与影集/文章页统一走朱砂强调。
     tokens.js 的全局规则用的是 :where()（特异性为 0），会被本页高特异性选择器盖掉，
     因此这里显式补一条，确保关于页 Tab 遍历时始终有可见焦点环 */
  #theme-circlelife.cl-is-about button:focus-visible,
  #theme-circlelife.cl-is-about a:focus-visible:not(.cl-skip-link),
  #theme-circlelife.cl-is-about [tabindex]:focus-visible {
    outline: 2px solid var(--cl-accent, #b24a33);
    outline-offset: 3px;
  }

  /* 画布本身是整屏元素，焦点环改为内嵌，避免在视口外缘出现一圈粗线 */
  #theme-circlelife.cl-is-about .cl-about-stage:focus-visible {
    outline: 2px solid var(--cl-accent, #b24a33);
    outline-offset: -3px;
  }
`

