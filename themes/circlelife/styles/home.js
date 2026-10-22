/**
 * Circle of Life — home：Hero 抽牌 + Timeline + Cards + deck 触控补充
 */
export const homeStyle = `
      /* —— Hero deck (抽牌 · outgoing 克隆) —— */
      #theme-circlelife .cl-latest-card,
      #theme-circlelife .cl-hero,
      #theme-circlelife .cl-deck {
        position: relative;
        margin-bottom: 1.75rem;
        border: none;
        background: transparent;
        box-shadow: none;
        padding: 0;
        /* 翻页 DOM 变化不参与滚动锚定：防止卡片半露时自动翻页带动页面跳动 */
        overflow-anchor: none;
      }
      #theme-circlelife .cl-deck-stage {
        position: relative;
        z-index: 1;
        min-height: 11.5rem;
      }
      #theme-circlelife .cl-deck-under,
      #theme-circlelife .cl-deck-current,
      #theme-circlelife .cl-deck-outgoing {
        position: absolute;
        inset: 0;
      }
      #theme-circlelife .cl-deck-under {
        z-index: 0;
        transform: translateY(8px) scale(0.978);
        opacity: 0.7;
        pointer-events: none;
        /* under never animates up/down on flip */
        transition: none;
      }
      #theme-circlelife .cl-deck-current {
        z-index: 1;
      }
      #theme-circlelife .cl-deck.is-swap-instant .cl-deck-current,
      #theme-circlelife .cl-deck.is-swap-instant .cl-deck-current * {
        transition: none !important;
      }
      #theme-circlelife .cl-deck-outgoing {
        z-index: 2;
        pointer-events: none;
        transform-origin: 70% 100%;
        transition:
          transform 0.34s var(--cl-ease),
          opacity 0.34s var(--cl-ease),
          filter 0.34s var(--cl-ease);
      }
      /* next：左滑飞出；prev：右滑飞出 */
      #theme-circlelife .cl-deck-outgoing.is-fly-next {
        transform: translateX(-22%) rotate(-5deg) translateY(-8px);
        opacity: 0;
        filter: blur(0.3px);
      }
      #theme-circlelife .cl-deck-outgoing.is-fly-prev {
        transform: translateX(22%) rotate(5deg) translateY(-8px);
        opacity: 0;
        filter: blur(0.3px);
      }
      #theme-circlelife .cl-deck-face {
        position: relative;
        height: 100%;
        min-height: 11.5rem;
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius);
        background: var(--cl-surface);
        overflow: hidden;
        box-shadow: 0 1px 0 color-mix(in srgb, var(--cl-text) 4%, transparent);
      }
      #theme-circlelife .cl-deck-face--under {
        box-shadow: none;
      }
      #theme-circlelife .cl-deck-cover {
        position: absolute;
        inset: 0;
        z-index: 0;
      }
      #theme-circlelife .cl-deck-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
      }
      #theme-circlelife .cl-deck-cover-shade {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(
            180deg,
            color-mix(in srgb, var(--cl-surface) 18%, transparent) 0%,
            color-mix(in srgb, var(--cl-surface) 55%, transparent) 42%,
            color-mix(in srgb, var(--cl-surface) 92%, transparent) 78%,
            var(--cl-surface) 100%
          ),
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--cl-surface) 35%, transparent) 0%,
            transparent 40%
          );
      }
      .dark #theme-circlelife .cl-deck-cover-shade {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--cl-surface) 30%, transparent) 0%,
          color-mix(in srgb, var(--cl-surface) 70%, transparent) 50%,
          var(--cl-surface) 100%
        );
      }
      #theme-circlelife .cl-deck-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 11.5rem;
        padding: 1.05rem 1.15rem 1.15rem;
        gap: 0.35rem;
      }
      #theme-circlelife .cl-deck-face.has-cover .cl-latest-title {
        text-shadow: 0 1px 0 color-mix(in srgb, var(--cl-surface) 40%, transparent);
      }
      #theme-circlelife .cl-deck-toolbar {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.65rem;
        gap: 0.5rem;
      }
      #theme-circlelife .cl-hero-controls {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        color: var(--cl-faint);
        letter-spacing: 0.06em;
      }
      #theme-circlelife .cl-hero-count {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        color: var(--cl-faint);
        letter-spacing: 0.08em;
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-hero-nav {
        position: relative;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border);
        background: transparent;
        color: var(--cl-muted);
        cursor: pointer;
        line-height: 1;
        font-size: 1.1rem;
        transition:
          color 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease);
      }
      /* 视觉 36px 圆钮，热区扩到 44px */
      #theme-circlelife .cl-hero-nav::after {
        content: '';
        position: absolute;
        inset: -0.25rem;
        border-radius: 9999px;
      }
      #theme-circlelife .cl-hero-nav:hover {
        color: var(--cl-accent);
        border-color: var(--cl-accent);
        background: var(--cl-accent-soft);
      }
      #theme-circlelife .cl-latest-title {
        align-self: flex-start;
        display: -webkit-box;
        width: fit-content;
        max-width: 100%;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        background-image: none;
        font-family: var(--cl-font-display);
        font-size: clamp(1.3rem, 3.2vw, 1.7rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.3;
        color: var(--cl-text);
        text-decoration: underline;
        text-decoration-color: transparent;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.18em;
        transition: color 0.15s var(--cl-ease), text-decoration-color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-latest-title:hover {
        color: var(--cl-accent);
        text-decoration-color: var(--cl-accent);
      }
      #theme-circlelife .cl-latest-summary {
        margin: 0.15rem 0 0;
        font-size: 0.88rem;
        line-height: 1.6;
        color: var(--cl-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        max-width: 36em;
      }
      #theme-circlelife .cl-deck-chip-row {
        margin-top: 0.35rem;
      }
      #theme-circlelife .cl-chip--on-cover {
        backdrop-filter: blur(4px);
      }
      #theme-circlelife .cl-deck-dots {
        position: relative;
        z-index: 3;
        display: flex;
        justify-content: center;
        gap: 0.4rem;
        margin-top: 0.55rem;
      }
      #theme-circlelife .cl-hero-dot {
        position: relative;
        width: 6px;
        height: 6px;
        padding: 0;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong);
        background: transparent;
        cursor: pointer;
        transition:
          background 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          transform 0.15s var(--cl-ease);
      }
      /* 圆点视觉 6px 不变，伪元素扩出 24px 触控热区 */
      #theme-circlelife .cl-hero-dot::after {
        content: '';
        position: absolute;
        inset: -9px;
        border-radius: 9999px;
      }
      #theme-circlelife .cl-hero-dot.is-active {
        background: var(--cl-accent);
        border-color: var(--cl-accent);
        transform: scale(1.2);
      }
      @media (max-width: 640px) {
        #theme-circlelife .cl-deck-stage,
        #theme-circlelife .cl-deck-face,
        #theme-circlelife .cl-deck-content {
          min-height: 10.25rem;
        }
      }

      /* —— Timeline —— */
      #theme-circlelife .cl-timeline {
        padding-bottom: 1.5rem;
      }
      #theme-circlelife .cl-timeline-day {
        margin-bottom: 2.4rem;
      }
      #theme-circlelife .cl-timeline-day-label,
      #theme-circlelife .cl-sidebar-title {
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        color: var(--cl-faint);
        margin: 0 0 0.95rem;
        padding-bottom: 0.45rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-timeline-rail {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      #theme-circlelife .cl-timeline-item {
        position: relative;
        padding: 0 0 1.2rem 1.1rem;
      }
      #theme-circlelife .cl-timeline-item:last-child {
        padding-bottom: 0;
      }
      #theme-circlelife .cl-timeline-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.55em;
        width: 5px;
        height: 5px;
        border-radius: 9999px;
        background: var(--cl-accent);
        opacity: 0.75;
        transition: transform 0.15s var(--cl-ease), opacity 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-timeline-item:hover::before {
        transform: scale(1.35);
        opacity: 1;
      }
      #theme-circlelife .cl-timeline-post-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.4rem 0.6rem;
      }
      #theme-circlelife .cl-post-title {
        font-family: var(--cl-font-display);
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1.4;
        color: var(--cl-text);
        background-image: linear-gradient(var(--cl-accent), var(--cl-accent));
        background-position: 0 100%;
        background-repeat: no-repeat;
        background-size: 0 1px;
        transition:
          color 0.15s var(--cl-ease),
          background-size 0.2s var(--cl-ease);
      }
      #theme-circlelife .cl-post-title:hover {
        color: var(--cl-accent);
        background-size: 100% 1px;
      }
      #theme-circlelife .cl-post-summary {
        margin: 0.35rem 0 0;
        font-size: 0.86rem;
        line-height: 1.65;
        color: var(--cl-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      #theme-circlelife .cl-list-post {
        padding: 1.05rem 0;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-list-post:last-child {
        border-bottom: 0;
      }

      /* —— Cards —— */
      #theme-circlelife .cl-card {
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius);
        box-shadow: none;
      }
      #theme-circlelife .cl-toc-card {
        background: transparent;
        border: 1px solid var(--cl-border);
        box-shadow: none;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-sidebar-sticky {
          top: max(5.5rem, calc(50vh - 11rem));
          align-self: flex-start;
        }
      }
      @media (max-width: 767px) {
        #theme-circlelife .cl-toc-card--desktop {
          display: none !important;
        }
      }
      #theme-circlelife .cl-toc-card h3,
      #theme-circlelife .cl-sidebar-title {
        border-bottom: none;
        background: transparent;
        padding: 0.7rem 0.85rem 0.35rem;
        margin: 0;
        font-family: var(--cl-font-mono);
        font-size: 0.66rem;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: none;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-deck-stage {
        touch-action: pan-y;
        cursor: grab;
        user-select: none;
      }
      #theme-circlelife .cl-deck-stage:active {
        cursor: grabbing;
      }

      /* —— 首页 8° 倾斜交错流光照片墙 (HomeTiltWall) —— */
      /* 首页容器本身已是全宽，无需 100vw + 负 margin 的满屏 hack（会带出横向滚动条） */
      /* 区块随页面滚走（不 sticky）：去掉粘连子树后 iOS 合成压力最小，
         与参考站 moment.priority.vision 的 .home-wrapper（3 屏）同构。
         240vh 提供约 2.4 屏的浏览时长，避免「一拉就到底」 */
      #theme-circlelife .cl-home-tilt-track-wrapper {
        position: relative;
        width: 100%;
        height: 240vh;
        background: var(--cl-bg);
      }

      #theme-circlelife .cl-home-tilt-section {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: var(--cl-bg);
        user-select: none;
      }

      /* 完全滚出视口后释放光栅纹理：画布在 DPR3 下是数十 MB 级的大图层，
         离屏仍持有会让下方文章滚动持续背着显存压力。wrapper 同为纸色，不会闪白 */
      #theme-circlelife .cl-home-tilt-section.is-offscreen {
        visibility: hidden;
      }

      /* 平移层：尺寸等于视口，每帧只写 translate。
         把 rotate/scale 留给内层静态变换后，大图层不再每帧重写变换串 */
      #theme-circlelife .cl-home-tilt-pan {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      /* 仅在滚动期间临时提升图层：停手 150ms 后归还，避免常驻大纹理 */
      #theme-circlelife .cl-home-tilt-section.is-flowing .cl-home-tilt-pan,
      #theme-circlelife .cl-home-tilt-section.is-flowing .cl-home-tilt-track {
        will-change: transform;
      }

      /* 母画卷：rotate + scale 静态化，缩放档位由 --cl-tilt-scale 注入（仅 resize 时更新）。
         高度必须高于 section（240vh），否则区块上下会露出底色 */
      #theme-circlelife .cl-home-tilt-rotated {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-origin: center center;
        transform: translate(-50%, -50%) rotate(8deg) scale(var(--cl-tilt-scale, 1.08));
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        width: 150vw;
        height: 260vh;
        pointer-events: none;
      }

      @media (max-width: 1024px) {
        #theme-circlelife .cl-home-tilt-rotated {
          gap: 18px;
        }
      }

      @media (max-width: 767px) {
        #theme-circlelife .cl-home-tilt-rotated {
          gap: 12px;
        }
      }

      #theme-circlelife .cl-home-tilt-col {
        position: relative;
        flex: 0 0 auto;
        width: clamp(220px, 20vw, 360px);
        height: 100%;
        overflow: visible;
        contain: layout;
      }

      @media (max-width: 1180px) {
        #theme-circlelife .cl-home-tilt-col {
          width: clamp(200px, 26vw, 300px);
        }
      }

      @media (max-width: 767px) {
        #theme-circlelife .cl-home-tilt-col {
          width: clamp(125px, 34vw, 150px);
        }
      }

      /* 不声明常驻 will-change，也不使用 translate3d：
         与参考站一致，避免每条列都常驻一个接近 4096 纹理上限的图层 */
      #theme-circlelife .cl-home-tilt-track {
        display: flex;
        flex-direction: column;
        transform: translateY(0);
      }

      #theme-circlelife .cl-home-tilt-set {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 24px;
      }

      @media (max-width: 1024px) {
        #theme-circlelife .cl-home-tilt-set {
          gap: 18px;
          padding-bottom: 18px;
        }
      }

      @media (max-width: 767px) {
        #theme-circlelife .cl-home-tilt-set {
          gap: 12px;
          padding-bottom: 12px;
        }
      }

      /* 直角卡片：纯净无框、无阴影、无圆角、间隙即背景底色
         注意：严禁在密集卡片子项上声明 contain: paint / translateZ(0)，
         否则每个卡片都会生成独立合成层，触发 Layerize 长任务 */
      #theme-circlelife .cl-home-tilt-item {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background-color: color-mix(in srgb, var(--cl-border, #e5e0d8) 35%, var(--cl-surface, #fff));
      }

      #theme-circlelife .cl-home-tilt-item img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        border-radius: 0 !important;
        opacity: 0;
        transition: opacity 0.4s ease-out;
      }

      #theme-circlelife .cl-home-tilt-item img.is-loaded {
        opacity: 1;
      }

      /* 顶部与底部的微弱过渡渐变，让它与 Header / 下方模块柔和自然交融 */
      #theme-circlelife .cl-home-tilt-fade-top {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--cl-bg) 85%, transparent) 0%,
          color-mix(in srgb, var(--cl-bg) 30%, transparent) 60%,
          transparent 100%
        );
      }

      #theme-circlelife .cl-home-tilt-fade-bottom {
        background: linear-gradient(
          0deg,
          var(--cl-bg) 0%,
          color-mix(in srgb, var(--cl-bg) 60%, transparent) 50%,
          transparent 100%
        );
      }

      /* —— 同行题字：与照片墙同源的漂移与呼吸 ——
         题字不是压在照片上的 UI，而是照片墙水流里的一个声部：
         继承画布漂移（--cl-wall-common）与滚动位移（--cl-wall-flow），
         两行之间再给一点差速形成纵深；墙尾由 --cl-wall-alpha 淡出。

         关键约束（勿改）：
         1. 题字是 position: fixed 的浮层 → 整条祖先链上不得出现
            transform / filter / backdrop-filter / perspective / contain /
            will-change，否则 fixed 会被降级成相对该祖先定位而随页面滚走。
            祖先链：#theme-circlelife → #container-inner → #container-wrapper
                   → .cl-home-tilt-track-wrapper → .cl-home-tilt-section
            （overflow: hidden 不会裁剪 fixed 后代；visibility: hidden 会继承，
              正好用于 .is-offscreen 退场闸门）
         2. 题字不得成为任何 position: fixed 元素的祖先（会给后代造包含块）。
         3. 退场淡出与光晕类效果必须浅色 + 深色两种模式分别验证。 */
      #theme-circlelife .cl-home-tilt-title {
        position: fixed;
        left: 0;
        right: 0;
        top: 46vh;
        z-index: 20;
        pointer-events: none; /* 装饰层，绝不拦截点击 */
        text-align: center;
      }

      #theme-circlelife .cl-home-tilt-title-zh {
        margin: 0;
        padding-left: 0.16em; /* 抵消末字后字距造成的视觉左偏 */
        font-family: var(--cl-font-display);
        font-weight: 500;
        font-size: clamp(2.6rem, 7.2vw, 5.25rem);
        line-height: 1.06;
        letter-spacing: 0.16em;
        color: var(--cl-wall-ink);
        text-shadow: var(--cl-wall-halo);
        opacity: var(--cl-wall-alpha, 1);
        transform: translate3d(
          0,
          calc(var(--cl-wall-common, 0px) + var(--cl-wall-flow, 0px) * 0.62),
          0
        );
        will-change: transform;
      }

      #theme-circlelife .cl-home-tilt-title-zh > span {
        display: inline-block;
        animation: clWallTitleIn 1.05s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
      }

      #theme-circlelife .cl-home-tilt-title-rule {
        display: block;
        width: 2.75rem;
        height: 1px;
        margin: 1.1rem auto;
        background: var(--cl-accent);
        opacity: var(--cl-wall-alpha, 1);
        transform: translate3d(
          0,
          calc(var(--cl-wall-common, 0px) + var(--cl-wall-flow, 0px) * 0.5),
          0
        );
        will-change: transform;
      }

      #theme-circlelife .cl-home-tilt-title-rule > span {
        display: block;
        width: 100%;
        height: 100%;
        background: inherit;
        transform-origin: center center;
        animation: clWallRuleIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
      }

      #theme-circlelife .cl-home-tilt-title-en {
        margin: 0;
        padding-left: 0.34em;
        font-family: var(--cl-font-mono);
        font-weight: 500;
        font-size: clamp(0.7rem, 1.15vw, 0.86rem);
        line-height: 1.4;
        letter-spacing: 0.34em;
        text-transform: uppercase;
        color: var(--cl-wall-ink);
        text-shadow: var(--cl-wall-halo-sm);
        opacity: calc(0.9 * var(--cl-wall-alpha, 1));
        transform: translate3d(
          0,
          calc(var(--cl-wall-common, 0px) + var(--cl-wall-flow, 0px) * 0.38),
          0
        );
        will-change: transform;
      }

      #theme-circlelife .cl-home-tilt-title-en > span {
        display: inline-block;
        animation: clWallSubIn 1.05s cubic-bezier(0.16, 1, 0.3, 1) 0.62s both;
      }

      @media (max-width: 767px) {
        #theme-circlelife .cl-home-tilt-title-zh {
          letter-spacing: 0.12em;
          padding-left: 0.12em;
        }
        #theme-circlelife .cl-home-tilt-title-en {
          font-size: 0.64rem;
          letter-spacing: 0.24em;
          padding-left: 0.24em;
        }
      }

      /* 入场：纯 CSS 关键帧（服务端与客户端输出完全一致 → 无 hydration 不匹配），
         只作用在内层 span；外层行元素的 transform 留给滚动漂移，两者永不互相覆盖。
         曲线用 expo-out，不用回弹/果冻（设计规范排斥夸张弹跳） */
      @keyframes clWallTitleIn {
        from {
          opacity: 0;
          transform: translate3d(0, 0.9em, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @keyframes clWallRuleIn {
        from {
          opacity: 0;
          transform: scaleX(0);
        }
        to {
          opacity: 1;
          transform: scaleX(1);
        }
      }

      @keyframes clWallSubIn {
        from {
          opacity: 0;
          transform: translate3d(0, 0.7em, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }
`
