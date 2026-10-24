/**
 * Circle of Life — home：Timeline + Cards
 *
 * 首页的「精选文章章」与收尾「近期」段已迁到 styles/homeArticles.js
 * （一文一屏 + 时间标尺 + 单栏排版），本片段只留列表页仍在用的
 * 时间线 / 卡片形态。抽牌（LatestCard）已随首页改版下线。
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

      /* —— 首页精选影集段 (HomeAlbumShowcase) ——
         形态参考 thereach.travel 的 Destination Discoverer：
         左列列表当滚动驱动源，右侧面板用纯 CSS position: sticky 钉住并整块换页。
         焦点表现 = 墨色弱化（非焦点 --cl-muted）+ 2px 朱砂竖线（焦点）。
         不采用参考站的「纸雾幽灵」：那需要 2 个 JS 驱动的遮罩节点，
         且非焦点文字对比度仅约 1.2:1。 */

      #theme-circlelife .cl-home-album {
        /* 推进区间驱动：段体与滚轴活动范围的高度由它算出来。
           它只决定「滚多少像素推进一辑」，与取景框高度解耦。
           19vh = 与移动端同值：换挡窗口 = 0.75 × 行程 → 每辑约 94px 的
           滚动距离（换挡窗口改跟右栏面板走之后，见下文 measure()）。 */
        --cl-home-album-step: 19vh;
        /* 取景框高度：框里只画当前影集名，框高决定换挡位置（两端同构） */
        --cl-home-album-window: 42vh;
        /* 焦点推进的总行程 = (条目数 - 1) × 间距
           —— 视觉间距与推进时长解耦：间距可紧凑，推进仍均匀铺满整段 */
        --cl-home-album-sweep: calc(
          (var(--cl-home-album-count, 4) - 1) * var(--cl-home-album-step)
        );
        /* 焦点线：焦点条目恒定停在这里（= 裁切窗口的正中） */
        --cl-home-album-focus: var(--cl-home-album-focus-line);
        /* 焦点竖线的颜色（朱砂）—— 与文章时间尺的游标同一条「位置标记」语汇 */
        --cl-home-album-rule: var(--cl-home-mark);
        max-width: var(--cl-wide-max);
        margin-inline: auto;
        /* 章节间距与精选文章段统一（照片墙→文章、文章→影集两处一致）。
           影集段是最后一段：底边不再叠一段空白，Footer 自带内边距 → 紧接而来。 */
        margin-top: var(--cl-home-section-pad);
        margin-bottom: 0;
        padding-inline: var(--cl-wide-pad);
      }

      /* 主体：左列目录 + 右侧 sticky 面板 */
      #theme-circlelife .cl-home-album-body {
        display: grid;
        grid-template-columns: minmax(220px, 26rem) minmax(0, 1fr);
        gap: var(--cl-wide-gap);
        align-items: start; /* ← 关键：右列必须 start，否则 grid 拉伸后 sticky 失效 */
        min-height: calc(100vh + var(--cl-home-album-sweep));
      }

      /* 滚轴活动范围：给 sticky 窗口一个足够高的包含块
         （窗口钉住多久，取决于它的包含块有多高）。
         桌面端 = 段体高（与 min-height 一致）；移动端另有一条公式。 */
      #theme-circlelife .cl-home-album-reel {
        display: block;
        height: calc(100vh + var(--cl-home-album-sweep));
      }
      /* 取景框：桌面与手机同构 —— 框固定不动，框里只画当前影集的名字。
         高度仍是 3 个槽位（决定推进区间与换挡位置，R11 起调好，别动）。
         ⚠️ 这里**不能**加 mask-image：带遮罩的祖先会变成「遮罩合成面」，
         移动端（尤其 iOS Safari）走不到 GPU 加速路径 → 每帧重新按遮罩合成。 */
      #theme-circlelife .cl-home-album-viewport {
        display: block;
        position: sticky;
        top: calc(
          var(--cl-home-album-focus) - var(--cl-home-album-window) / 2
        );
        height: var(--cl-home-album-window);
        /* clip 而非 hidden：hidden 的盒子仍可被程序化滚动 →
           键盘聚焦窗口外的条目时，浏览器会「把它滚进视野」，
           把内容偷偷挪动。clip 让窗口彻底不可滚动，焦点由 JS 自己接管。 */
        overflow: clip;
        z-index: 1;
      }
      /* 名字列表：R14 起不再平移 —— 整段滚动里文字层纹丝不动，
         零逐帧合成（这才是 iPhone 上「滑动像掉帧」的根源）。
         四个条目叠在同一个位置，靠 visibility/opacity 换挡。 */
      #theme-circlelife .cl-home-album-list {
        position: static;
        display: block;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      /* 每个条目铺满取景框、内容垂直居中 → 当前名字恒在焦点线上。
         非当前条目 opacity: 0 → 浏览器不绘制它（实测重绘 2.13ms vs
         visibility:hidden 的 2.08ms，一样便宜），但它仍留在无障碍树里、
         仍可 Tab 到（visibility:hidden 会把它整个踢出无障碍树）。
         换挡时文字层只需重画「一个字」（而不是三个带光晕的大字），
         这是 iPhone 上换挡不再卡顿的关键。 */
      #theme-circlelife .cl-home-album-entry {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity var(--cl-home-switch) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-entry.is-active {
        opacity: 1;
      }
      /* 键盘 Tab 到未选中的条目 → 把它显出来（否则焦点停在一个看不见的链接上） */
      #theme-circlelife .cl-home-album-entry:focus-within {
        opacity: 1;
      }
      #theme-circlelife .cl-home-album-entry:focus-within
        .cl-home-album-item-name {
        opacity: 1;
      }
      /* 移动端专用块：桌面隐藏（照片舞台 display:none → 不发起图片请求） */
      #theme-circlelife .cl-home-album-stage {
        display: none;
      }
      /* 移动端 CTA 住在取景框里，而取景框在桌面是可见的 → 桌面必须显式藏掉它，
         桌面自己的入口是右栏面板里的 .cl-home-album-enter（「进入影集 →」）。
         （CTA 以前挂在照片舞台里，桌面靠舞台 display:none 自动隐身。） */
      #theme-circlelife .cl-home-album-cta {
        display: none;
      }
      #theme-circlelife .cl-home-album-item {
        position: relative;
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
        padding-left: 0.85rem;
        color: var(--cl-muted);
        text-decoration: none;
        transition: color var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-item:hover {
        color: var(--cl-text);
      }
      #theme-circlelife .cl-home-album-item[aria-current='true'] {
        color: var(--cl-text);
      }
      #theme-circlelife .cl-home-album-item-name {
        margin: 0;
        font-family: var(--cl-font-display);
        font-size: clamp(1.5rem, 2.6vw, 2.25rem);
        font-weight: 400;
        letter-spacing: -0.02em;
        /* 行高收到 1em：转轮的格就是字形盒（开源里程表/老虎机的硬要求：
           格高 = 1em，父级 line-height ≥ 1.15），否则字在格中偏上、滚动时上下裁切 */
        line-height: 1;
        /* ⚠️ 过渡里**不能**带 font-weight（R11 实测）：
           字重是逐帧插值的 → 每个字宽都在变 → 每帧重排 + 重新光栅。
           实测（390×844，同一段 491ms 滚动）：
             带 font-weight 过渡：Layout 31 次 / 96.5ms，RasterTask 64.9ms
             去掉后：          Layout  5 次 /  1.6ms，RasterTask  6.6ms
           手机上这些数字还要再放大 3~5 倍 → 就是「滑动时卡顿」的来源。
           现在只有颜色做过渡（颜色不触发布局）→ 切换瞬间换字重，零逐帧重排。 */
        transition: color var(--cl-dur) var(--cl-ease),
          opacity var(--cl-dur) var(--cl-ease);
      }
      /* 焦点项不再加粗（R11）：加粗会换一套字形 → 文字层要重绘，
         而手机上的大字还带 4 层光晕（--cl-wall-halo）→ 每次换挡重画一遍，
         正是「滑动时像掉帧」的另一半开销。
         强调改成纯字色 + 透明度：焦点 = --cl-text / 不透明，
         非焦点 = --cl-muted + 0.58 透明度。
         ⚠️ 透明度也做过渡：iOS 上「瞬时改透明度」会当场重画文字层，
         做成过渡后它变成合成器动画（元素自己提层）→ 换挡不再重绘大字。 */
      /* 非焦点项弱化：两端一致 —— 当前影集被「聚焦」，
         没滚到的只由墨色 + 半透明托着。 */
      #theme-circlelife .cl-home-album-item:not([aria-current='true'])
        .cl-home-album-item-name {
        opacity: 0.58;
      }
      #theme-circlelife .cl-home-album-item-count {
        font-family: var(--cl-font-mono);
        font-size: 0.6875rem;
        font-variant-numeric: tabular-nums;
        color: var(--cl-faint);
        transition: color var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-item[aria-current='true']
        .cl-home-album-item-count {
        color: var(--cl-muted);
      }

      /* 焦点竖线：绝对定位，不参与布局 → 切换焦点零位移、零 CLS。
         贴在当前名字左边，是「当前这一辑」的位置标记（与字色强调分工：
         字色说「哪一个」，竖线说「在哪儿」）。 */
      #theme-circlelife .cl-home-album-item-rule {
        position: absolute;
        left: 0;
        top: 0.15em;
        bottom: 0.15em;
        width: 2px;
        background: var(--cl-home-album-rule);
        opacity: 0;
        transform: scaleY(0.35);
        transform-origin: center;
        /* 2px 的小元素 → 常驻 will-change：竖线的伸缩动画走合成器，
           不会连带把整层大字（带光晕）重绘一遍 */
        will-change: transform, opacity;
        transition: opacity var(--cl-dur) var(--cl-ease),
          transform var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-item[aria-current='true']
        .cl-home-album-item-rule {
        opacity: 1;
        transform: scaleY(1);
      }

      /* 右侧 sticky 面板 —— **沉到视口底**（不是把封面拉高）
         ⚠️ sticky 的 bottom 只「拦」不「拉」：元素的自然位置若已在视口底
         之上，约束不生效 → 必须先让自然位置落到栅格行底（align-self: end），
         bottom: 0 才拉得住（行高由左列轨道 100vh + 行程 决定）。
         面板底边 = 视口底 → 段底抵达视口底的同一刻面板释放、Footer 紧接
         → 段尾零白带；封面保持 4:5 自然尺寸（不被拉成竖长条）。 */
      #theme-circlelife .cl-home-album-panel {
        position: sticky;
        top: auto;
        bottom: 0;
        align-self: end;
        display: grid;
        grid-template-columns: minmax(240px, 30rem) minmax(0, 1fr);
        gap: clamp(1.5rem, 3vw, 3rem);
        align-items: start;
      }

      /* 面板文字块：换页时纯 CSS 淡入（只动 opacity，fill-mode: both → 无 hydration 不匹配） */
      #theme-circlelife .cl-home-album-panel-copy {
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
        animation: clHomeAlbumFade var(--cl-dur) var(--cl-ease) both;
      }
      @keyframes clHomeAlbumFade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      #theme-circlelife .cl-home-album-meta {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-family: var(--cl-font-mono);
        font-size: 0.6875rem;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.08em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-home-album-dot {
        color: var(--cl-faint);
      }
      /* 影集名只在左列出现（面板不重复）→ 中间面板不放标题 */
      #theme-circlelife .cl-home-album-summary {
        margin: 0;
        font-family: var(--cl-font-display);
        font-size: 0.95rem;
        line-height: 1.65;
        color: var(--cl-muted);
        display: -webkit-box;
        -webkit-line-clamp: 4;
        line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2lh; /* 预留高度：不同影集简介长度不同 → 「进入影集」不跳 */
      }
      #theme-circlelife .cl-home-album-enter {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.35rem;
        font-family: var(--cl-font-display);
        font-size: 0.95rem;
        color: var(--cl-accent);
        text-decoration: underline;
        text-underline-offset: 3px;
        text-decoration-thickness: 1px;
        transition: color var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-home-album-enter:hover {
        color: var(--cl-accent-press);
      }

      /* 封面图：全部封面叠在同一网格单元（焦点切换不改 src → 不闪白），
         定长 4/5 盒 + cover → 零 CLS
         4:5 的比例挂在 img 上（width:100% + aspect-ratio），盒子随轨道宽自适应 */
      #theme-circlelife .cl-home-album-figure {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        margin: 0;
        border-radius: var(--cl-media-radius);
        background: var(--cl-paper-2);
        overflow: hidden;
      }
      #theme-circlelife .cl-home-album-img {
        grid-area: 1 / 1;
        display: block;
        width: 100%;
        aspect-ratio: 4 / 5;
        object-fit: cover;
        z-index: 1;
      }
      /* 焦点封面置顶：新封面解码完成前，下层旧封面托底（无空白帧） */
      #theme-circlelife .cl-home-album-img.is-active {
        z-index: 2;
      }

      /* ≤1023px：移动端新形态 —— 封面照片满幅铺底 + 左列「密码锁」裁切窗口 */
      @media (max-width: 1023px) {
        #theme-circlelife .cl-home-album {
          /* 推进行程用的档距（与取景框高度解耦，推进仍均匀铺满整段）
             手机端 3 档 = 57vh，实际行程 0.75×57 = 42.75vh */
          --cl-home-album-step: 19vh;
          /* 焦点线：焦点标题中心所在的视口高度（与窗口正中重合） */
          --cl-home-album-focus: var(--cl-home-album-focus-line);
        }
        /* 段体：舞台与轨道同层，轨道用负 margin 拉到段顶叠在舞台上 */
        #theme-circlelife .cl-home-album-body {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-height: calc(100vh + var(--cl-home-album-sweep));
        }
        /* 满幅照片舞台：sticky 停住 —— 照片不动，标题从它上面滚过去。
           左右各 16px 的白边来自段自身的 padding-inline，
           用同值负 margin 抵消 → 照片真正铺满视口。
           ⚠️ 这里不能留 margin-bottom:-100vh：sticky 的约束算的是 margin box，
           负下边距会把 margin box 压成零高 → 底部约束失效 →
           照片在整段滚动里永不释放，会压住下面的文章段（抽牌 + 时间线）。
           「让轨道叠上来」的负偏移改由 .cl-home-album-reel 承担。 */
        #theme-circlelife .cl-home-album-stage {
          display: block; /* 桌面隐藏，这里启用 */
          position: sticky;
          top: 0;
          height: 100vh;
          margin-inline: calc(-1 * var(--cl-wide-pad)); /* 满幅：抵消段内边距 */
          z-index: 0;
          overflow: hidden;
          /* 封面没加载出来时也要保证白字有依托（近墨底） */
          background: var(--cl-text);
          /* 舞台整块钉住 → 提层后合成器只需挪动它（不逐帧重画）。
             封面各自提层（见下），所以这一层的纹理只有静态的遮罩，
             不会因为封面淡入而被反复重画。 */
          will-change: transform;
        }
        #theme-circlelife .cl-home-album-cover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
          /* iOS 关键：全屏图的淡入必须走合成器。
             不提升图层的话，WebKit 会在淡入的每一帧重画整张舞台
             （100vh × DPR3 ≈ 3.5M px）→ 滑动影集段时持续掉帧。
             常驻 will-change（而不是靠动画临时提升）：避免每次换挡都
             新建/销毁一个全屏纹理（十几 MB 的内存抖动）。 */
          will-change: opacity;
        }
        /* 只画「当前 + 上一档（溶解底图）」两张：其余封面被完全盖住，
           留着只是白白多合成两层全屏图（每帧 ~7M px 的填充率），
           还占着两份全屏纹理内存。 */
        #theme-circlelife .cl-home-album-cover.is-muted {
          visibility: hidden;
        }
        /* 溶解：当前焦点在上层淡入，上一档封面不透明垫底
           （z-index 由组件按「当前 / 上一档」内联给出）。
           时长压到 0.24s：比焦点换挡的最小间隔（250ms）短一点 →
           淡入一定在下一次换挡前结束，垫底那张始终是不透明的
           → 被藏起来的两张永远不会从缝里透出来。 */
        #theme-circlelife .cl-home-album-cover.is-active {
          animation: clHomeAlbumCoverIn var(--cl-home-switch) var(--cl-ease)
            both;
        }
        @keyframes clHomeAlbumCoverIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        /* 底部渐暗：浅色文字始终压在暗底上，不靠照片本身够暗。
           顶部也留一层薄纱 → 导航胶囊与上方的非焦点名在亮照片上仍读得清。 */
        #theme-circlelife .cl-home-album-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            var(--cl-home-album-scrim) 0%,
            color-mix(in srgb, var(--cl-home-album-scrim) 42%, transparent) 58%,
            color-mix(in srgb, var(--cl-home-album-scrim) 30%, transparent) 100%
          );
        }
        /* 滚轴的活动范围（移动端专用）：让滚轴与照片舞台在同一时刻释放。
           舞台的 sticky 底边在视口底（100vh），滚轴窗口的底边比它高；
           若两者共用同一个包含块，滚轴会多钉住近 300px ——
           那段时间照片已经退场，标题就悬在奶白纸上（白字读不出来）。
           这里的高度 = 焦点推进行程 + 焦点位 + 半窗高，
           使窗口的 sticky 结束点与舞台的释放点对齐。
           （窗口本身与轨道的规则两端共用，见 base 段。） */
        #theme-circlelife .cl-home-album-reel {
          height: calc(
            var(--cl-home-album-sweep) + var(--cl-home-album-focus) +
              var(--cl-home-album-window) / 2
          );
          /* 与舞台重叠：轨道从照片上方滚过去（舞台本身不再用负外边距，
             否则 sticky 的底部约束会失效 → 照片永不释放） */
          margin-top: -100vh;
        }
        /* 照片上的文字：固定浅色
           （--cl-bg / --cl-text 随明暗模式反转，压在照片上会读不出来）
           再叠一层暗色光晕：照片明暗不定时靠描边咬出轮廓
           （沿用照片墙题字 --cl-wall-halo 的同一套办法） */
        #theme-circlelife .cl-home-album-item-name,
        #theme-circlelife .cl-home-album-entry-meta,
        #theme-circlelife .cl-home-album-entry-summary {
          color: var(--cl-home-album-ink);
          text-shadow: var(--cl-wall-halo);
        }
        /* 移动端主角是影集名：放大（窗口里只留一圈，字要够大才读得清） */
        #theme-circlelife .cl-home-album-item-name {
          font-size: clamp(1.75rem, 8.5vw, 2.5rem);
          line-height: 1;
          text-wrap: balance;
        }
        /* 条目在移动端改为纵向 flex：名字在取景框里垂直居中
           注意纵向 flex 里 align-items 是水平轴 → 必须回到 flex-start，
           否则名字会被水平居中、整列跑到右边 */
        #theme-circlelife .cl-home-album-entry {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
        }
        /* 张数在 meta 行里，标题旁不再重复 */
        #theme-circlelife .cl-home-album-item-count {
          display: none;
        }
        /* 左列只留影集名：日期 / 张数 / 简介 / CTA 全部撤下
           （CTA 移到照片右下角，日期与张数在桌面的中间面板里仍在） */
        #theme-circlelife .cl-home-album-entry-meta,
        #theme-circlelife .cl-home-album-entry-summary {
          display: none;
        }
        #theme-circlelife .cl-home-album-enter {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--cl-font-display);
          font-size: 0.95rem;
          color: var(--cl-accent);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
          /* 照片明暗不定 → 靠描边咬出轮廓（与标题同一套光晕） */
          text-shadow: var(--cl-wall-halo);
        }
        /* 移动端 CTA：放在**影集名下面**（不再钉在照片右下角）。
           右下角实测与回顶键重叠（CTA x=342–424 / y=905–928，
           回顶键 x=380–422 / y=886–928）→ 经常点不到。
           ⚠️ 定位基准是**取景框**（.cl-home-album-viewport），不是照片舞台：
           辑名在取景框里垂直居中 → 名字中心 = 取景框的 50%，
           名字半高 = 字号/2（line-height:1）→ 下面这一格正好落位。
           与辑名同框 → 取景框 sticky 拉入/释放时两者一起动，永远不分离。 */
        #theme-circlelife .cl-home-album-cta {
          position: absolute;
          left: var(--cl-wide-pad);
          right: auto;
          top: calc(
            50% + clamp(0.875rem, 4.25vw, 1.25rem) + 0.6rem
          );
          bottom: auto;
          z-index: 3; /* 高于封面叠层（0/1/2） */
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--cl-font-display);
          font-size: 0.95rem;
          color: var(--cl-home-album-ink); /* 照片底部最暗处 → 固定浅色，明暗同值 */
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
          text-shadow: var(--cl-wall-halo);
          animation: clHomeAlbumFade 0.4s var(--cl-ease) both;
        }
        /* 悬停不改成 accent（照片上读不出来） */
        #theme-circlelife .cl-home-album-cta:hover {
          color: var(--cl-home-album-ink);
        }
        /* 焦点竖线压在照片上：同样补一层暗色光晕 */
        #theme-circlelife .cl-home-album-item-rule {
          box-shadow: var(--cl-wall-halo);
        }
        /* 桌面右列的面板与照片在移动端不出现（照片已铺底、CTA 已进窗口） */
        #theme-circlelife .cl-home-album-panel,
        #theme-circlelife .cl-home-album-figure {
          display: none;
        }
      }

      /* 回顶按钮：照片墙（Hero）与精选影集段内隐藏，进入文章列表后重新出现。
         状态类挂在 <html> 上，故选择器必须带上 #theme-circlelife：
         html.cl-x（0,1,1）+ #theme-circlelife（1,0,0）+ .cl-backtop.is-visible（0,2,0）
         = (1,3,1)，稳压 common.js 的 #theme-circlelife .cl-backtop.is-visible（1,2,0）。
         隐藏态沿用 common.js 里 .cl-backtop 的既有过渡
         （visibility 0s linear 0.28s）→ 先淡出再隐藏，不突兀；
         visibility: hidden 同时保证不可 Tab 聚焦。 */
      html.cl-home-hero-active #theme-circlelife .cl-backtop.is-visible,
      html.cl-home-album-active #theme-circlelife .cl-backtop.is-visible {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
`
