/**
 * Circle of Life — home
 *
 * 首页：倾斜照片墙（HomeTiltWall）+ 题字、精选影集（01 接触印相）；
 * 列表页仍在用的时间线 / 卡片形态。精选文章章在 styles/homeArticles.js
 * （一窗一屏 + 时间标尺）；抽牌（LatestCard）已随首页改版下线。
 */
export const homeStyle = `
      /* —— Timeline —— */
      #theme-circlelife .cl-timeline {
        padding-bottom: 1.5rem;
        /* 跳锚（#posts-wrapper 等）时首行不被顶部导航胶囊压住 */
        scroll-margin-top: calc(var(--cl-nav-band) + 1rem);
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
        font-family: var(--cl-font-display-system);
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

      /* 卡片是 canvas（不是 <img>）：canvas 的像素不进入 LCP 候选，
         照片墙深处那些更大的卡片就不会把首页 LCP 顶到十几秒。
         裁剪由 drawCover 按 object-fit:cover 完成（见 CanvasImage.js）。
         ⚠️ canvas 上**不能**留 object-fit：位图已经被 drawCover 裁过一道，
         浏览器再按 cover 裁一次 = 第二刀（照片边缘被切掉）。 */
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

      #theme-circlelife .cl-home-tilt-item canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0 !important;
        opacity: 0;
        transition: opacity 0.4s ease-out;
      }

      #theme-circlelife .cl-home-tilt-item canvas.is-loaded,
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
          font-size: clamp(3.1rem, 9vw, 3.9rem);
          letter-spacing: 0.12em;
          padding-left: 0.12em;
        }
        #theme-circlelife .cl-home-tilt-title-en {
          font-size: clamp(0.72rem, 3vw, 0.82rem);
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

      /* —— 首页精选影集段 (HomeAlbumShowcase) · PC 悬停预览 ——
         保留「左索引 620 / 右主视觉 480」两栏框架与左右贴缘的空间感。
         左侧 4 辑纯文字编号列表：悬停/聚焦高亮并切换右侧；
         右侧是手机端 C 方案同款卡片（带边相纸 + 题签卡叠压），
         四张叠放交叉淡入，整卡可点。手机端由 homeAlbumMobile.js 接管。 */
      #theme-circlelife .cl-home-album {
        --cl-home-album-hero-w: 480px;
        --cl-home-album-index-w: var(--cl-home-article-measure);
        max-width: var(--cl-wide-max);
        margin: var(--cl-home-section-pad) auto 0;
        padding-inline: var(--cl-wide-pad);
      }
      #theme-circlelife .cl-home-album-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 0.9rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-home-album-kicker {
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.75rem;
        letter-spacing: 0.16em;
        color: var(--cl-muted);
      }
      /* 眉题左侧的 2px 朱砂短线：与文章时间尺的游标同一条「位置标记」语汇 */
      #theme-circlelife .cl-home-album-kicker::before {
        content: '';
        display: block;
        width: 2px;
        height: 0.95em;
        background: var(--cl-home-mark);
      }
      #theme-circlelife .cl-home-album-count {
        margin: 0;
        font-family: var(--cl-font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.08em;
        color: var(--cl-faint);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      #theme-circlelife .cl-home-album-body {
        display: grid;
        grid-template-columns:
          minmax(0, var(--cl-home-album-index-w))
          minmax(0, var(--cl-home-album-hero-w));
        justify-content: space-between;
        gap: var(--cl-wide-gap);
        align-items: stretch;
        margin-top: clamp(1.5rem, 2.5vw, 2rem);
        /* 段底与页脚分隔线之间留呼吸，避免题签卡下缘贴线 */
        padding-bottom: clamp(1.25rem, 2.5vw, 2.25rem);
      }

      /* 左：4 行纯文字索引，均分右侧主视觉高度 */
      #theme-circlelife .cl-home-album-index {
        grid-column: 1;
        grid-row: 1;
        display: grid;
        grid-auto-rows: 1fr;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      #theme-circlelife .cl-home-album-index > li {
        border-top: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-home-album-index > li:last-child {
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-home-album-row {
        position: relative;
        display: grid;
        grid-template-columns: 2.6rem minmax(0, 1fr) auto;
        align-items: center;
        gap: 1.1rem;
        height: 100%;
        padding: 0.7rem 1rem;
        color: inherit;
        text-decoration: none;
      }
      /* 书脊竖线：一条独立细线，从中点向上下展开（scaleY 不碰祖先链，
         不会给首页题字的 fixed 造包含块）。未选中收拢为 0。 */
      #theme-circlelife .cl-home-album-row::before {
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
      #theme-circlelife .cl-home-album-row.is-active::before,
      #theme-circlelife .cl-home-album-row:hover::before,
      #theme-circlelife .cl-home-album-row:focus-visible::before {
        transform: scaleY(1);
      }
      #theme-circlelife .cl-home-album-idx {
        font-family: var(--cl-font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.08em;
        color: var(--cl-faint);
        font-variant-numeric: tabular-nums;
        transition: color var(--cl-home-switch) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-name {
        margin: 0;
        font-family: var(--cl-font-display-system);
        font-weight: 500;
        letter-spacing: -0.01em;
        /* 过渡只动颜色与 transform（不碰字重/字号 → 不触发布局） */
        transition: color var(--cl-home-switch) var(--cl-ease),
          transform var(--cl-home-switch) var(--cl-ease);
        text-wrap: balance;
      }
      /* 借鉴导航的「淡 → 强调」：未选中淡黑、选中朱砂并轻微右移 */
      #theme-circlelife .cl-home-album-row-name {
        font-size: clamp(1.25rem, 1.55vw, 1.6rem);
        line-height: 1.2;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-home-album-arrow {
        font-family: var(--cl-font-display);
        font-size: 1rem;
        line-height: 1;
        color: var(--cl-faint);
        transition: color var(--cl-home-switch) var(--cl-ease),
          transform var(--cl-home-switch) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-row.is-active .cl-home-album-idx,
      #theme-circlelife .cl-home-album-row:hover .cl-home-album-idx,
      #theme-circlelife .cl-home-album-row:focus-visible .cl-home-album-idx,
      #theme-circlelife .cl-home-album-row.is-active .cl-home-album-name,
      #theme-circlelife .cl-home-album-row:hover .cl-home-album-name,
      #theme-circlelife .cl-home-album-row:focus-visible .cl-home-album-name,
      #theme-circlelife .cl-home-album-row.is-active .cl-home-album-arrow,
      #theme-circlelife .cl-home-album-row:hover .cl-home-album-arrow,
      #theme-circlelife .cl-home-album-row:focus-visible .cl-home-album-arrow {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-home-album-row.is-active .cl-home-album-row-name,
      #theme-circlelife .cl-home-album-row:hover .cl-home-album-row-name,
      #theme-circlelife .cl-home-album-row:focus-visible .cl-home-album-row-name {
        transform: translateX(3px);
      }
      #theme-circlelife .cl-home-album-row.is-active .cl-home-album-arrow,
      #theme-circlelife .cl-home-album-row:hover .cl-home-album-arrow,
      #theme-circlelife .cl-home-album-row:focus-visible .cl-home-album-arrow {
        transform: translateX(2px);
      }

      /* 右：4 张 C 方案卡片叠放同一格，只动 opacity 交叉淡入 */
      #theme-circlelife .cl-home-album-showcase {
        grid-column: 2;
        grid-row: 1;
        display: grid;
        width: 100%;
        max-width: var(--cl-home-album-hero-w);
        margin-left: auto;
      }
      #theme-circlelife .cl-home-album-card {
        grid-column: 1;
        grid-row: 1;
        display: block;
        color: inherit;
        text-decoration: none;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity var(--cl-home-switch) var(--cl-ease),
          visibility 0s linear var(--cl-home-switch);
      }
      #theme-circlelife .cl-home-album-card.is-active {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transition: opacity var(--cl-home-switch) var(--cl-ease),
          visibility 0s;
      }
      #theme-circlelife .cl-home-album-plate {
        margin: 0;
      }
      #theme-circlelife .cl-home-album-mat {
        padding: 10px;
        background: var(--cl-paper);
        border: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-home-album-cover {
        display: block;
        width: 100%;
        max-width: none;
        aspect-ratio: 4 / 5;
        background: var(--cl-paper-2);
      }
      /* 题签卡压在印相下缘：负 margin 叠压，普通文档流、不碰 transform */
      #theme-circlelife .cl-home-album-caption {
        position: relative;
        width: calc(100% - 3rem);
        max-width: 30rem;
        margin: -2.6rem auto 0;
        padding: 1.55rem 1.45rem 1.35rem;
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-home-album-folio {
        position: absolute;
        top: -0.7rem;
        right: 1rem;
        padding: 0.15rem 0.5rem;
        background: var(--cl-accent);
        color: var(--cl-accent-ink);
        font-family: var(--cl-font-mono);
        font-size: 0.625rem;
        letter-spacing: 0.06em;
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-home-album-rule {
        display: block;
        width: 34px;
        height: 1px;
        background: var(--cl-accent);
        margin: 0 0 0.85rem;
      }
      #theme-circlelife .cl-home-album-hero-name {
        font-size: clamp(1.6rem, 2.1vw, 2.1rem);
        line-height: 1.15;
      }
      #theme-circlelife .cl-home-album-card:hover .cl-home-album-hero-name,
      #theme-circlelife .cl-home-album-card:focus-visible .cl-home-album-hero-name {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-home-album a:focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 5px;
        border-radius: 2px;
      }
      /* 减少动效：全局只压 duration 不压 delay，这里把卡片 visibility 的
         240ms 延迟清零，避免透明卡片仍滞留无障碍树。 */
      @media (prefers-reduced-motion: reduce) {
        #theme-circlelife .cl-home-album-card,
        #theme-circlelife .cl-home-album-card.is-active {
          transition-delay: 0s;
        }
      }
      /* 少辑退化：1–3 辑时索引行自然高度、靠上，不被拉成很高的空行 */
      #theme-circlelife .cl-home-album[data-count='1'] .cl-home-album-index,
      #theme-circlelife .cl-home-album[data-count='2'] .cl-home-album-index,
      #theme-circlelife .cl-home-album[data-count='3'] .cl-home-album-index {
        grid-auto-rows: auto;
        align-content: start;
      }

      /* 回顶按钮：首页三段（照片墙 / 精选文章 / 精选影集）内隐藏，离开后重新出现。
         影集段是首页最后一段：用 :has(.cl-home-album) 标记「这是首页」，
         纯 CSS 压制回顶键（不再引入 JS 状态类/观察器）；其它页面没有影集段，
         回顶键照常工作。页脚进入视口时仍由 .cl-footer-inview 负责隐去。
         状态类挂在 <html> 上，故选择器必须带上 #theme-circlelife：
         html.cl-x（0,1,1）+ #theme-circlelife（1,0,0）+ .cl-backtop.is-visible（0,2,0）
         = (1,3,1)，稳压 common.js 的 #theme-circlelife .cl-backtop.is-visible（1,2,0）。
         隐藏态沿用 common.js 里 .cl-backtop 的既有过渡
         （visibility 0s linear 0.28s）→ 先淡出再隐藏，不突兀；
         visibility: hidden 同时保证不可 Tab 聚焦。 */
      html:has(.cl-home-album) #theme-circlelife .cl-backtop.is-visible,
      html.cl-home-hero-active #theme-circlelife .cl-backtop.is-visible,
      html.cl-home-article-active #theme-circlelife .cl-backtop.is-visible {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
`