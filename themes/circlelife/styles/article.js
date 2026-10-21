/**
 * Circle of Life — article：TOC 细轨 + 文章封面/正文 + 文章返回 + 手机目录 fab/抽屉
 */
export const articleStyle = `
      /* —— TOC 细轨墨线 —— */
      #theme-circlelife .cl-toc {
        padding-left: 0.35rem;
        padding-right: 0.5rem;
      }
      #theme-circlelife .cl-toc-scroll {
        max-height: min(58vh, 22rem);
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--cl-text) 28%, transparent) transparent;
      }
      #theme-circlelife .cl-toc-scroll::-webkit-scrollbar {
        width: 5px;
        height: 0;
      }
      #theme-circlelife .cl-toc-scroll::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--cl-text) 28%, transparent);
        border-radius: 9999px;
      }
      #theme-circlelife .cl-toc-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      #theme-circlelife .cl-toc-nav {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.25rem 0 0.55rem 0.55rem;
        margin-left: 0.45rem;
        border-left: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-toc-cursor {
        position: absolute;
        left: -3.5px;
        top: 0;
        width: 6px;
        height: 12px;
        margin-top: 0;
        border-radius: 9999px;
        background: var(--cl-accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--cl-accent) 22%, transparent);
        transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
        pointer-events: none;
        z-index: 2;
      }
      #theme-circlelife .cl-toc-item {
        position: relative;
        display: block;
        padding: 0.34rem 0.45rem 0.34rem 0.75rem;
        margin-left: 0;
        border-left: 0;
        font-size: 0.78rem;
        line-height: 1.45;
        color: var(--cl-muted);
        background: transparent;
        transition:
          color 0.18s var(--cl-ease),
          transform 0.22s var(--cl-ease),
          opacity 0.18s var(--cl-ease);
      }
      #theme-circlelife .cl-toc-item:hover {
        color: var(--cl-text);
        transform: translateX(3px);
      }
      #theme-circlelife .cl-toc-item.is-active {
        color: var(--cl-text);
        font-weight: 600;
        transform: translateX(5px);
        background: transparent;
      }
      #theme-circlelife .cl-toc-item--h1 {
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-toc-item--h2 {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-toc-item--h2::before {
        content: '';
        position: absolute;
        left: 0.2rem;
        top: 0.55em;
        width: 0.45rem;
        height: 1px;
        background: color-mix(in srgb, var(--cl-text) 28%, transparent);
      }
      #theme-circlelife .cl-toc-item--h3 {
        font-size: 0.74rem;
        font-weight: 400;
        color: var(--cl-faint);
        opacity: 0.95;
      }
      #theme-circlelife .cl-toc-item--h3::before {
        content: '';
        position: absolute;
        left: 0.35rem;
        top: 0.6em;
        width: 0.35rem;
        height: 1px;
        background: color-mix(in srgb, var(--cl-text) 18%, transparent);
      }
      #theme-circlelife .cl-toc-item--h1.is-active {
        color: var(--cl-text);
      }
      #theme-circlelife .cl-toc-item--h2.is-active,
      #theme-circlelife .cl-toc-item--h3.is-active {
        color: var(--cl-text);
        opacity: 1;
      }
      #theme-circlelife .cl-toc-item-text {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* —— Article cover band：全屏形态全出血 / 回退卡片形态保留旧几何 —— */
      #theme-circlelife .cl-article-card {
        padding: 0;
      }
      #theme-circlelife .cl-article-cover {
        position: relative;
        height: var(--cl-article-cover-h);
        overflow: hidden;
        border-radius: 0;
        /* 容器底色 = 页面底色：遮罩让图片像素透明后透出的就是它，
           若用 paper-2 会在溶解区留下一条可见色带 */
        background: var(--cl-bg);
      }
      @media (max-width: 767px) {
        #theme-circlelife .cl-article-cover {
          height: 200px;
        }
      }
      #theme-circlelife .cl-article-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
        /* 底边溶解：遮罩让照片像素自己透明、露出封面容器（= 页面底色）。
           与「盖一层色纱」的区别：纱是盖在照片上的实体，遮罩是照片真的没了。
           mask-size / mask-repeat 必须显式写全，漏写会让遮罩平铺 */
        -webkit-mask-image: var(--cl-article-cover-mask);
        mask-image: var(--cl-article-cover-mask);
        -webkit-mask-size: 100% 100%;
        mask-size: 100% 100%;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
      }
      /* 顶部极轻压暗：全出血形态下导航胶囊浮在图上，浅色头图时胶囊会与背景糊在一起，
         压一层极淡暗膜保证胶囊边界与文字始终可辨。只作用于全屏形态（卡片回退不渲染该节点） */
      #theme-circlelife .cl-article-cover-scrim {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: var(--cl-article-cover-scrim-h);
        pointer-events: none;
        background: linear-gradient(
          180deg,
          var(--cl-article-cover-scrim) 0%,
          color-mix(in srgb, var(--cl-article-cover-scrim) 42%, transparent) 58%,
          transparent 100%
        );
      }
      /* 回退形态（CIRCLELIFE_ARTICLE_CARD=true）：旧卡片封面几何与 surface 渐隐 */
      #theme-circlelife .cl-article--card .cl-article-cover {
        border-radius: var(--cl-radius) var(--cl-radius) 0 0;
        height: 180px;
        /* 卡片形态的溶解终点是卡片自身底色 */
        background: var(--cl-surface);
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-article--card .cl-article-cover {
          height: 200px;
        }
      }
      @media (max-width: 640px) {
        #theme-circlelife .cl-article--card .cl-article-cover {
          height: 150px;
        }
      }
      #theme-circlelife .cl-article--card .cl-article-cover-img {
        -webkit-mask-image: var(--cl-article-cover-mask-card);
        mask-image: var(--cl-article-cover-mask-card);
      }

      /* —— 全屏文章壳：宽容器 + TOC 细轨（≥1280px 双栏，与归档宽屏同构） —— */
      #theme-circlelife .cl-article-shell {
        width: 100%;
        max-width: var(--cl-article-shell);
        margin-inline: auto;
        /* 全出血版面：gutter 兜底避让刘海/圆角安全区（横屏 notch） */
        padding-left: max(var(--cl-article-pad), env(safe-area-inset-left, 0px));
        padding-right: max(var(--cl-article-pad), env(safe-area-inset-right, 0px));
      }
      /* 无封面文章：壳顶让开悬浮胶囊导航带 */
      #theme-circlelife .cl-article-shell--no-cover {
        padding-top: calc(var(--cl-nav-band) + 1.25rem);
      }
      #theme-circlelife .cl-article-shell--toc {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
      }
      #theme-circlelife .cl-article-rail {
        display: none;
      }
      @media (min-width: 1280px) {
        #theme-circlelife .cl-article-shell--toc {
          grid-template-columns: var(--cl-article-rail) minmax(0, 1fr);
          column-gap: var(--cl-article-gap);
          align-items: start;
        }
        #theme-circlelife .cl-article-rail {
          display: block;
          position: sticky;
          top: calc(var(--cl-nav-band) + 1.5rem);
          align-self: start;
          max-height: calc(100vh - var(--cl-nav-band) - 3rem);
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          /* 与加高后的封面 + hero 标题对齐 */
          padding-top: 3rem;
        }
      }
      #theme-circlelife .cl-article-main {
        min-width: 0;
        /* 宽壳内正文列以舒适测量宽封顶，剩余纸面即杂志页的留白边际 */
        max-width: var(--cl-prose-measure);
      }
      #theme-circlelife .cl-article-inner {
        position: relative;
        z-index: 1;
        padding: 1.5rem 0 0.5rem;
      }
      /* 回退形态：旧卡片内距 */
      #theme-circlelife .cl-article--card .cl-article-inner {
        padding: 1.5rem 1.25rem;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-article--card .cl-article-inner {
          padding: 2.25rem 2rem;
        }
      }
      #theme-circlelife .cl-article-card .cl-article-hero {
        margin-top: 0;
      }

      /* 回顶按钮：全屏文章贴宽容器内容右缘（与归档 cl-is-archive 同款推导） */
      @media (min-width: 768px) {
        #theme-circlelife.cl-is-article .cl-backtop {
          right: max(
            calc(var(--cl-article-pad) + 0.5rem),
            calc(
              (100vw - var(--cl-article-shell)) / 2 + var(--cl-article-pad) + 0.5rem
            )
          );
        }
      }

      /* —— Article：正文排版体系（纸感杂志 · 克制） —— */
      /* 目录/锚点跳转目标：跳转定位给吸顶栏留出空间 */
      #theme-circlelife .notion-h {
        scroll-margin-top: 5rem;
      }
      #theme-circlelife .cl-article-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem 0.15rem;
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-meta-author {
        color: var(--cl-text);
        font-weight: 500;
      }
      #theme-circlelife .cl-meta-category {
        margin-left: 0.15rem;
        font-family: var(--cl-font-body);
        font-size: 0.72rem;
        letter-spacing: 0.02em;
        text-transform: none;
      }
      #theme-circlelife .cl-article-meta .cl-dot {
        color: var(--cl-faint);
        margin: 0 0.15rem;
      }

      #theme-circlelife .cl-article-hero {
        margin-bottom: 1.35rem;
        padding-bottom: 1.1rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-article-title {
        font-family: var(--cl-font-display);
        font-size: clamp(1.55rem, 3.8vw, 2.05rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.28;
        color: var(--cl-text);
        margin: 0 0 0.7rem;
        text-wrap: balance;
      }

      /* —— 正文容器：字号/行高/字族走 --cl-prose-* token —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap {
        font-family: var(--cl-font-body);
        font-size: var(--cl-prose-size);
        line-height: var(--cl-prose-leading);
        color: var(--cl-text);
        contain: layout;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion {
        color: var(--cl-text);
        font-size: inherit;
        line-height: inherit;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-page-content-inner {
        padding: 0 !important;
      }
      /* 渲染路径优化：对深层长文 Notion Block 启用 content-visibility 跳过离屏布局排版，加速首次 Layout 与 Commit */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-page-content-inner > *:nth-child(n + 15),
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-page-content > *:nth-child(n + 15) {
        content-visibility: auto;
        contain-intrinsic-size: auto 60px;
      }

      /* —— 标题阶梯：衬线 + 前置大留白 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap h1,
      #theme-circlelife #article-wrapper.cl-prose-wrap h2,
      #theme-circlelife #article-wrapper.cl-prose-wrap h3,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h {
        font-family: var(--cl-font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1.4;
        color: var(--cl-text);
        padding: 0;
        text-wrap: balance;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h1 {
        font-size: var(--cl-prose-h1);
        margin: var(--cl-prose-h1-gap) 0 0.8em;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h2 {
        font-size: var(--cl-prose-h2);
        margin: var(--cl-prose-h2-gap) 0 0.7em;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h3 {
        font-size: var(--cl-prose-h3);
        margin: var(--cl-prose-h3-gap) 0 0.6em;
      }
      /* 内容开头的标题不吃前置留白 */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h1:first-child,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h2:first-child,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h3:first-child {
        margin-top: 0;
      }

      /* —— 段落节奏：首行缩进 2em + 段间 0.5em —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-text {
        padding: 0;
        margin: 0 0 var(--cl-prose-gap);
        text-indent: var(--cl-prose-indent);
      }
      /* 免缩进：仅限块内片段上下文（引用/callout/折叠/多列）；顶层正文段一律缩进 */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-column-list .notion-text,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-quote .notion-text,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-callout .notion-text,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-toggle .notion-text {
        text-indent: 0;
      }
      /* 开关 CIRCLELIFE_PROSE_INDENT=false：回到纯段距模式 */
      #theme-circlelife #article-wrapper.cl-prose-wrap.cl-indent-off .notion-text {
        text-indent: 0;
      }

      /* —— 链接：朱砂细下划线 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link {
        color: var(--cl-accent) !important;
        opacity: 1;
        border-bottom: 1px solid color-mix(in srgb, var(--cl-accent) 30%, transparent);
        transition: border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link:hover {
        border-bottom-color: var(--cl-accent);
      }

      /* —— 引用块：衬线 + 3px 朱砂左线 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-quote {
        border-left: 3px solid var(--cl-accent);
        padding: 0.1em 0 0.1em 1rem;
        margin: var(--cl-prose-block-gap) 0;
        font-size: 1em;
        font-family: var(--cl-font-display);
        color: var(--cl-text);
      }

      /* —— callout：纸底轻框 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-callout {
        border: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-paper-2) 45%, var(--cl-surface));
        border-radius: var(--cl-radius-sm);
        padding: 0.85em 1em;
        margin: var(--cl-prose-block-gap) 0;
      }

      /* —— 代码块：等宽 + 纸二底 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-code {
        font-family: var(--cl-font-mono);
        font-size: var(--cl-prose-code-size);
        line-height: var(--cl-prose-code-leading);
        background: var(--cl-paper-2) !important;
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius-sm);
        padding: 1em 1.1em;
        margin: var(--cl-prose-block-gap) 0;
      }
      /* 代码块内层 code 不吃行内样式 */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-code code {
        background: transparent;
        border: 0;
        border-radius: 0;
        padding: 0;
        font-size: inherit;
        font-family: inherit;
        color: inherit;
      }
      /* 行内代码 */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-inline-code {
        font-family: var(--cl-font-mono);
        font-size: 0.88em;
        color: var(--cl-text);
        background: var(--cl-paper-2);
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius-sm);
        padding: 0.1em 0.35em;
      }

      /* —— 列表：行距收敛、标记弱化 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-list {
        margin: 0 0 var(--cl-prose-gap);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-list li {
        padding: 0.3em 0;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-list li::marker {
        color: var(--cl-faint);
      }

      /* —— 图片：圆角 + 上下呼吸 + 图注居中 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-asset-wrapper {
        margin: var(--cl-prose-media-gap) 0;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-image {
        border-radius: var(--cl-media-radius);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-asset-caption {
        font-size: var(--cl-prose-caption-size);
        line-height: 1.6;
        color: var(--cl-muted);
        text-align: center;
        padding: 0.6em 0 0;
      }

      /* —— 分割线：居中短线 + 大留白 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-hr {
        border: 0;
        padding: 0;
        background: var(--cl-border-strong);
        height: 1px;
        width: 3rem;
        margin: 2.4em auto;
      }

      /* —— 表格：细线克制 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-simple-table {
        border: 1px solid var(--cl-border);
        border-collapse: collapse;
        font-size: 0.95em;
        margin: var(--cl-prose-block-gap) 0;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-simple-table td,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-simple-table th {
        border: 1px solid var(--cl-border);
        padding: 0.5em 0.75em;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-simple-table-header-cell,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-simple-table-header-row td {
        background: color-mix(in srgb, var(--cl-paper-2) 55%, var(--cl-surface));
        font-weight: 600;
      }

      /* —— 书签卡片 / 折叠块：轻描边 —— */
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-bookmark {
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius-sm);
        background: var(--cl-surface);
        padding: 0.9em 1em;
        margin: var(--cl-prose-block-gap) 0;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-toggle {
        padding: 0.3em 0;
        margin: 0 0 var(--cl-prose-gap);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-toggle > summary {
        cursor: pointer;
      }
      /* article back */
      #theme-circlelife .cl-article-back {
        border: 0;
        background: transparent;
        color: var(--cl-muted);
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        padding: 0.2rem 0;
        cursor: pointer;
        transition: color 0.15s ease;
      }
      #theme-circlelife .cl-article-back:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-article-back--top {
        margin-bottom: 0.75rem;
      }
      #theme-circlelife .cl-article-back-row {
        margin-top: 1.5rem;
        padding-top: 0.85rem;
        border-top: 1px solid var(--cl-border);
      }
      /* mobile/tablet TOC fab + drawer */
      #theme-circlelife .cl-toc-fab {
        display: none;
        position: fixed;
        right: max(1rem, env(safe-area-inset-right, 0px));
        bottom: calc(5.25rem + env(safe-area-inset-bottom, 0px));
        z-index: 35;
        align-items: center;
        justify-content: center;
        min-height: 2.6rem;
        padding: 0.45rem 0.95rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong);
        background: var(--cl-surface);
        color: var(--cl-text);
        font-size: 0.82rem;
        font-weight: 600;
        box-shadow: 0 6px 20px color-mix(in srgb, var(--cl-text) 12%, transparent);
        cursor: pointer;
      }
      /* 回退卡片形态：仅手机显示 fab（桌面侧栏已有目录） */
      @media (max-width: 767px) {
        #theme-circlelife .cl-toc-fab {
          display: inline-flex;
        }
      }
      /* 全屏形态：平板档 768–1279 也显示 fab（细轨仅 ≥1280） */
      @media (min-width: 768px) and (max-width: 1279px) {
        #theme-circlelife:not(.cl-article-card-mode) .cl-toc-fab {
          display: inline-flex;
        }
      }
      .cl-toc-drawer-root {
        position: fixed;
        inset: 0;
        z-index: 210;
        pointer-events: none;
        visibility: hidden;
        font-family: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
        color: var(--cl-text);
      }
      .cl-toc-drawer-root.is-open {
        pointer-events: auto;
        visibility: visible;
      }
      .cl-toc-drawer-mask {
        position: absolute;
        inset: 0;
        border: 0;
        background: color-mix(in srgb, var(--cl-text) 40%, transparent);
        opacity: 0;
        transition: opacity 0.25s ease;
        cursor: pointer;
      }
      .cl-toc-drawer-root.is-open .cl-toc-drawer-mask {
        opacity: 1;
      }
      .cl-toc-drawer-panel {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        max-height: min(72vh, 32rem);
        background: var(--cl-bg);
        border-radius: 16px 16px 0 0;
        border-top: 1px solid var(--cl-border);
        padding: 0.85rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
        transform: translateY(105%);
        transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        overflow: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        box-shadow: 0 -12px 40px color-mix(in srgb, var(--cl-text) 12%, transparent);
      }
      .cl-toc-drawer-root.is-open .cl-toc-drawer-panel {
        transform: translateY(0);
      }
      .cl-toc-drawer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.65rem;
        padding-bottom: 0.55rem;
        border-bottom: 1px solid var(--cl-border);
      }
      .cl-toc-drawer-title {
        font-family: var(--cl-font-mono, ui-monospace, monospace);
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        color: var(--cl-faint);
      }
      .cl-toc-drawer-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .cl-toc-drawer-item {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        background: transparent;
        color: var(--cl-text);
        font-size: 0.95rem;
        line-height: 1.45;
        padding: 0.7rem 0.35rem;
        border-radius: 8px;
        cursor: pointer;
      }
      .cl-toc-drawer-item:hover,
      .cl-toc-drawer-item:active {
        background: color-mix(in srgb, var(--cl-accent-soft) 70%, transparent);
      }
      .cl-toc-drawer-item--h1 {
        font-weight: 600;
        font-size: 1rem;
        color: var(--cl-text);
      }
      .cl-toc-drawer-item--h2 {
        font-weight: 500;
        font-size: 0.92rem;
        color: var(--cl-muted);
        border-left: 2px solid color-mix(in srgb, var(--cl-text) 16%, transparent);
      }
      .cl-toc-drawer-item--h3 {
        font-weight: 400;
        font-size: 0.88rem;
        color: var(--cl-faint);
        border-left: 2px solid color-mix(in srgb, var(--cl-text) 10%, transparent);
      }
`
