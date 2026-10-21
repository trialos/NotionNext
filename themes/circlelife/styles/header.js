/**
 * Circle of Life — 居中悬浮胶囊导航栏 + 全屏杂志折叠大菜单（含完整子菜单） + 阅读进度 + 搜索弹窗
 */
export const headerStyle = `
      /* ==========================================================================
         1. 悬浮胶囊导航体系 (Centered Floating Pill Navbar)
         彻底脱离普通文档流，严格水平居中，不随滚动发生高宽形变，零回流零抖动
         ========================================================================== */
      .cl-floating-header {
        position: fixed;
        top: var(--cl-nav-top);
        left: 0;
        right: 0;
        z-index: 60;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
      }

      /* 非全屏沉浸页（归档列表等）提供顶部避让空间，防止被悬浮胶囊遮挡。
         全屏文章页（cl-is-article）除外：封面全出血直铺视口顶，导航浮于图上；
         无封面文章的避让由文章壳 --no-cover 规则自持 */
      #theme-circlelife:not(.cl-is-home):not(.cl-is-album):not(.cl-is-about):not(.cl-is-article) #container-inner {
        padding-top: max(4.5rem, calc(env(safe-area-inset-top, 0px) + 4rem));
      }

      /* 悬浮胶囊母体 (Pill Capsule) — 水平绝对居中 */
      .cl-floating-pill {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        /* globals.css 有裸 nav{flex-wrap:wrap}，会让菜单项过多时折行、把导航带撑破；
           min-height 与 --cl-nav-height 配对，保证影集浮层推导出的净空恒等于胶囊实高 */
        flex-wrap: nowrap;
        min-height: var(--cl-nav-height);
        gap: clamp(0.75rem, 1.8vw, 1.25rem);
        padding: 0.38rem 1.25rem;
        border-radius: 9999px;
        background: rgba(30, 30, 30, 0.88);
        backdrop-filter: blur(24px) saturate(1.2);
        -webkit-backdrop-filter: blur(24px) saturate(1.2);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32);
        white-space: nowrap;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        /* 阅读进度基座线的定位容器（不加 overflow，避免裁剪父级就地下拉 .cl-pill-sub） */
        position: relative;
      }

      :root:not(.dark) .cl-floating-pill {
        background: rgba(250, 246, 238, 0.92);
        border-color: rgba(32, 25, 15, 0.12);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
      }

      /* 窄屏滚动中把毛玻璃降档：24px → 8px，并用更实的底色补回可读性。
         桌面端不挂滚动监听，is-scrolling 不会出现 */
      @media (max-width: 1023px) {
        .cl-floating-pill.is-scrolling {
          background: rgba(30, 30, 30, 0.94);
          backdrop-filter: blur(8px) saturate(1.05);
          -webkit-backdrop-filter: blur(8px) saturate(1.05);
        }
        :root:not(.dark) .cl-floating-pill.is-scrolling {
          background: rgba(250, 246, 238, 0.97);
        }
      }

      /* 平板与手机端拉长横幅 (对标设计截图) */
      @media (max-width: 1023px) {
        .cl-floating-pill {
          width: min(calc(100vw - 2.25rem), 400px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 0.5rem 0.35rem 0.95rem;
          gap: 0;
        }
      }

      /* Logo 链接 */
      .cl-floating-pill-logo-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-decoration: none;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .cl-floating-pill-logo-link:hover {
        opacity: 0.85;
        transform: scale(1.06);
      }

      /* 手机端正中品牌标识: 严格对标 circlelife-DESIGN.md 与 BrandLockup 规范 */
      .cl-floating-pill-brand-text {
        font-family: var(--cl-font-display, 'Noto Serif SC', 'Songti SC', serif);
        font-size: 0.96rem;
        font-weight: 500;
        letter-spacing: 0.04em;
        color: var(--cl-text);
        user-select: none;
      }
      @media (min-width: 1024px) {
        .cl-floating-pill-brand-text {
          display: none !important;
        }
      }

      /* 桌面端主导航项由 Notion 菜单派生 */
      .cl-floating-pill-nav {
        display: none;
        align-items: center;
        gap: clamp(0.85rem, 1.8vw, 1.45rem);
        padding-left: 0.35rem;
        padding-right: 0.35rem;
      }
      @media (min-width: 1024px) {
        .cl-floating-pill-nav {
          display: inline-flex;
        }
      }

      .cl-floating-pill-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--cl-muted);
        font-family: var(--cl-font-display, inherit);
        font-size: 0.92rem;
        font-weight: 500;
        text-decoration: none;
        letter-spacing: 0.02em;
        white-space: nowrap;
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
        transition: color 0.15s ease;
      }
      .cl-floating-pill-link:hover,
      .cl-floating-pill-link.is-open,
      .cl-floating-pill-link[aria-current='page'] {
        color: var(--cl-gold);
      }

      /* 父级菜单项的下拉指示符 */
      .cl-pill-caret {
        font-size: 0.58em;
        line-height: 1;
        opacity: 0.6;
        transition: transform 0.2s var(--cl-ease);
      }
      .cl-floating-pill-link.is-open .cl-pill-caret {
        transform: rotate(180deg);
      }

      /* 父级菜单就地下拉：暖金薄描边的毛玻璃浮层 */
      .cl-pill-item {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .cl-pill-sub {
        position: absolute;
        top: calc(100% + 0.72rem);
        left: 50%;
        transform: translate(-50%, -6px);
        min-width: 9.5rem;
        padding: 0.4rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--cl-gold) 32%, transparent);
        background: color-mix(in srgb, var(--cl-surface) 92%, transparent);
        backdrop-filter: blur(20px) saturate(1.15);
        -webkit-backdrop-filter: blur(20px) saturate(1.15);
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.18s var(--cl-ease), transform 0.22s var(--cl-ease),
          visibility 0s linear 0.18s;
        z-index: 5;
      }
      .cl-pill-sub.is-open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translate(-50%, 0);
        transition-delay: 0s;
      }
      .cl-pill-sub::before {
        /* 覆盖按钮与浮层之间的间隙，避免 hover 移动时闪断 */
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: -0.72rem;
        height: 0.72rem;
      }
      .cl-pill-sub-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }
      .cl-pill-sublink {
        display: block;
        padding: 0.5rem 0.7rem;
        border-radius: 9px;
        color: var(--cl-text);
        font-size: 0.86rem;
        line-height: 1.35;
        white-space: nowrap;
        text-decoration: none;
        transition: color 0.15s ease, background 0.15s ease;
      }
      .cl-pill-sublink:hover,
      .cl-pill-sublink:focus-visible {
        color: var(--cl-gold);
        background: color-mix(in srgb, var(--cl-gold) 14%, transparent);
      }

      /* 移动端内置右端纯图标暖金胶囊按钮 */
      .cl-pill-menu-btn--mobile {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.35rem;
        height: 2.35rem;
        padding: 0;
        border-radius: 9999px;
        border: 0;
        background: var(--cl-gold);
        color: var(--cl-gold-ink);
        font-size: 0.88rem;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease;
        box-shadow: 0 2px 10px var(--cl-gold-shadow);
      }
      .cl-pill-menu-btn--mobile:active {
        transform: scale(0.94);
      }
      @media (min-width: 1024px) {
        .cl-pill-menu-btn--mobile {
          display: none !important;
        }
      }

      /* PC 桌面端独立悬浮右上角暖金纯图标胶囊按钮 */
      .cl-floating-desktop-menu-btn {
        position: fixed;
        top: var(--cl-nav-top);
        right: max(1.5rem, calc(env(safe-area-inset-right, 0px) + 1.25rem));
        z-index: 60;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.44rem 1.05rem;
        border-radius: 9999px;
        border: 0;
        background: var(--cl-gold);
        color: var(--cl-gold-ink);
        font-size: 0.95rem;
        line-height: 1;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 4px 18px var(--cl-gold-shadow);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease, box-shadow 0.2s ease;
      }
      .cl-floating-desktop-menu-btn:hover {
        transform: scale(1.06);
        filter: brightness(1.08);
        box-shadow: 0 6px 22px color-mix(in srgb, var(--cl-gold) 55%, transparent);
      }
      .cl-floating-desktop-menu-btn:active {
        transform: scale(0.96);
      }
      @media (max-width: 1023px) {
        .cl-floating-desktop-menu-btn {
          display: none !important;
        }
      }

      /* 键盘高对比度 Focus 焦点环 (Vercel Guidelines) */
      .cl-floating-pill-link:focus-visible,
      .cl-pill-sublink:focus-visible,
      .cl-pill-menu-btn--mobile:focus-visible,
      .cl-floating-desktop-menu-btn:focus-visible,
      .cl-drawer-link:focus-visible,
      .cl-drawer-sublink:focus-visible,
      .cl-fullscreen-top-btn:focus-visible,
      .cl-fullscreen-close:focus-visible {
        outline: 2px solid var(--cl-gold) !important;
        outline-offset: 3px !important;
      }

      /* ==========================================================================
         1.5 通用图标按钮与品牌锁定
         Header 抽屉、MobileToc、SearchInput、BrandLockup 共用。
         刻意使用裸类名（不加 #theme-circlelife 前缀）：抽屉按钮同时带
         .cl-fullscreen-top-btn，同特异性下由文件后方规则覆盖为 2.65rem，
         若在此提高特异性会把它缩回 2.15rem，造成抽屉顶栏按钮变小。
         ========================================================================== */
      .cl-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.15rem;
        height: 2.15rem;
        padding: 0;
        border-radius: 9999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--cl-muted);
        line-height: 1;
        cursor: pointer;
        touch-action: manipulation;
        transition:
          color 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          transform 0.15s var(--cl-ease);
      }
      .cl-icon-btn i {
        font-size: 0.92rem;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .cl-icon-btn:hover {
        color: var(--cl-accent);
        border-color: var(--cl-border);
        background: var(--cl-accent-soft);
      }

      /* 品牌锁定：中文衬线比例 + 英文等宽字距，防止抽屉顶栏品牌走形 */
      .cl-lockup-mark {
        display: block;
        flex: none;
      }
      .cl-lockup-cn {
        font-family: var(--cl-font-display);
        font-size: 1.02rem;
        line-height: 1.35;
        padding-top: 0.08em;
        padding-bottom: 0.06em;
      }
      .cl-lockup-en {
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.16em;
        margin-top: 0.22rem;
        line-height: 1.2;
      }

      /* ==========================================================================
         2. 约 95% 覆盖率悬浮圆角大画卷框体 (95% Floating Framed Drawer)
         ========================================================================== */
      .cl-fullscreen-root {
        position: fixed;
        inset: 0;
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        visibility: hidden;
        padding: clamp(0.75rem, 2.5vw, 1.75rem);
        transition: visibility 0s linear 0.32s;
      }
      .cl-fullscreen-root.is-open {
        pointer-events: auto;
        visibility: visible;
        transition-delay: 0s;
      }

      /* 背景全屏毛玻璃暗膜蒙层 */
      .cl-fullscreen-mask {
        position: absolute;
        inset: 0;
        border: 0;
        background: rgba(0, 0, 0, 0.64);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        opacity: 0;
        transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
      }
      .cl-fullscreen-root.is-open .cl-fullscreen-mask {
        opacity: 1;
      }

      /* 约 95% 悬浮圆角大画卷框体（比全屏小一圈，零溢出免滚动） */
      .cl-fullscreen-panel {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: calc(100vw - clamp(1.5rem, 5vw, 3.5rem));
        height: 100%;
        max-height: calc(100dvh - clamp(1.5rem, 5vh, 3.5rem));
        border-radius: clamp(18px, 2vw, 26px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: rgba(22, 20, 19, 0.95);
        backdrop-filter: blur(32px) saturate(1.2);
        -webkit-backdrop-filter: blur(32px) saturate(1.2);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
        color: #f2efe9;
        overscroll-behavior: contain;
        padding: clamp(1.25rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 3.5rem);
        opacity: 0;
        transform: scale(0.96) translateY(8px);
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        overflow-y: auto;
        scrollbar-width: none;
      }
      .cl-fullscreen-panel::-webkit-scrollbar {
        display: none;
      }
      :root:not(.dark) .cl-fullscreen-panel {
        background: rgba(248, 245, 238, 0.96);
        border-color: rgba(32, 25, 15, 0.1);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.14);
        color: #1f1d1a;
      }
      .cl-fullscreen-root.is-open .cl-fullscreen-panel {
        opacity: 1;
        transform: scale(1) translateY(0);
      }



      /* 顶栏操作 */
      .cl-fullscreen-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        flex: none;
      }
      .cl-fullscreen-topbar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .cl-fullscreen-top-btn,
      .cl-fullscreen-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.65rem;
        height: 2.65rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: #cfcac2;
        font-size: 1.05rem;
        cursor: pointer;
        touch-action: manipulation;
        transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
      }
      :root:not(.dark) .cl-fullscreen-top-btn,
      :root:not(.dark) .cl-fullscreen-close {
        border-color: rgba(0, 0, 0, 0.1);
        background: rgba(0, 0, 0, 0.05);
        color: #333;
      }
      .cl-fullscreen-top-btn:hover,
      .cl-fullscreen-close:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.15);
        transform: scale(1.05);
      }
      :root:not(.dark) .cl-fullscreen-top-btn:hover,
      :root:not(.dark) .cl-fullscreen-close:hover {
        color: #000;
        background: rgba(0, 0, 0, 0.12);
      }

      /* ==========================================================================
         3. 杂志主导航与二级子菜单 (数字列严格左对齐排布)
         ========================================================================== */
      .cl-fullscreen-nav-body {
        margin: 0;
        padding: clamp(1rem, 3.5vh, 2.5rem) 0 1.5rem 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        scrollbar-width: none;
      }
      .cl-fullscreen-nav-body::-webkit-scrollbar {
        display: none;
      }
      .cl-drawer-list {
        list-style: none;
        margin: 0;
        padding: 0 clamp(0.5rem, 2vw, 2rem);
        width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: clamp(1rem, 2.5vh, 2.2rem);
      }
      .cl-drawer-item {
        margin: 0;
        padding: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
      .cl-drawer-group {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }
      .cl-drawer-link {
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        width: 100%;
        padding: 0.15rem 0;
        border: 0;
        background: transparent;
        color: #8c8983;
        text-decoration: none;
        text-align: left;
        cursor: pointer;
        transition: color 0.18s ease, transform 0.18s ease;
      }
      :root:not(.dark) .cl-drawer-link {
        color: #8c8983;
      }
      .cl-drawer-link:hover,
      .cl-drawer-link.is-current {
        color: #ffffff;
        transform: translateX(6px);
      }
      :root:not(.dark) .cl-drawer-link:hover,
      :root:not(.dark) .cl-drawer-link.is-current {
        color: #1a1917;
      }

      /* 左上角小数字角标 (Top-Left Floating Index) */
      .cl-drawer-num {
        font-family: var(--cl-font-mono, monospace);
        font-size: clamp(0.72rem, 1.1vw, 0.92rem);
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum";
        opacity: 0.45;
        letter-spacing: 0.04em;
        line-height: 1;
        margin-top: 0.22em; /* 贴齐大文字顶部 cap-height */
        margin-right: clamp(0.5rem, 1.2vw, 0.85rem);
        flex: none;
      }

      /* 全域大标题：大号艺术字体扩充版面 */
      .cl-drawer-title {
        font-family: var(--cl-font-display, inherit);
        font-size: clamp(2.2rem, 5.2vw, 4rem);
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: -0.02em;
        flex: 1;
        text-align: left;
      }

      /* 右侧极简折叠展开符号：+ / × */
      .cl-drawer-toggle-ico {
        margin-left: auto;
        font-family: var(--cl-font-mono, system-ui, sans-serif);
        font-size: clamp(1.4rem, 2.5vw, 2.2rem);
        font-weight: 300;
        line-height: 1;
        opacity: 0.55;
        align-self: center;
        padding-left: 1rem;
        transition: transform 0.25s var(--cl-ease), opacity 0.2s ease;
      }
      .cl-drawer-link:hover .cl-drawer-toggle-ico {
        opacity: 1;
      }

      /* 二级子菜单列表 (纯净极简垂直排列) */
      .cl-drawer-sub {
        list-style: none;
        margin: clamp(0.6rem, 1.5vh, 1.1rem) 0 0 calc(2ch + clamp(0.5rem, 1.2vw, 0.85rem));
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: clamp(0.5rem, 1.2vh, 0.85rem);
      }
      .cl-drawer-sublink {
        display: inline-block;
        color: #a09d96;
        font-family: var(--cl-font-display, inherit);
        font-size: clamp(1.15rem, 2.2vw, 1.6rem);
        font-weight: 600;
        line-height: 1.25;
        text-decoration: none;
        text-align: left;
        transition: color 0.15s ease, transform 0.15s ease;
      }
      :root:not(.dark) .cl-drawer-sublink {
        color: #6d6961;
      }
      .cl-drawer-sublink:hover {
        color: var(--cl-gold);
        transform: translateX(4px);
      }

      /* 逐条交错浮现动画 */
      @keyframes cl-fullscreen-slide-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .cl-fullscreen-root.is-open .cl-drawer-item {
        animation: cl-fullscreen-slide-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(1) { animation-delay: 0.05s; }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(2) { animation-delay: 0.09s; }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(3) { animation-delay: 0.13s; }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(4) { animation-delay: 0.17s; }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(5) { animation-delay: 0.21s; }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(6) { animation-delay: 0.25s; }
      .cl-fullscreen-root.is-open .cl-drawer-item:nth-child(7) { animation-delay: 0.29s; }

      /* 移动端抽屉菜单自适应：尺寸与间距交给下面的 ≤1023 块统一处理，
         这里只保留容器级的内边距、圆角与角标尺寸 */
      @media (max-width: 767px) {
        .cl-fullscreen-root {
          padding: 0.65rem;
        }
        .cl-fullscreen-panel {
          max-width: calc(100vw - 1.3rem);
          max-height: calc(100dvh - 1.3rem);
          border-radius: 18px;
          padding: 1.25rem 1.25rem;
        }
        .cl-fullscreen-nav-body {
          margin: 0;
          padding-top: clamp(0.75rem, 2.5vh, 1.5rem);
          padding-bottom: 1rem;
          align-items: stretch;
        }
        .cl-drawer-list {
          width: 100%;
          padding: 0;
        }
        .cl-drawer-num {
          font-size: clamp(0.75rem, 3.2vw, 0.9rem);
          margin-right: 0.65rem;
          margin-top: 0.18em;
        }
        .cl-drawer-toggle-ico {
          font-size: 1.5rem;
        }
        .cl-drawer-sub {
          margin-top: 0.5rem;
          margin-left: calc(2ch + 0.65rem);
          gap: 0.5rem;
        }
      }

      /* ==========================================================================
         3.1 手机与平板（≤1023px）：与桌面同一套版面密度
         实测问题：桌面靠 clamp 上限 4rem=64px 自然撑满（列表占 76%），
         手机被压到 28px、6 条只占 42%，底部空 408px。
         这里放大字号并加大间距，再用 auto 外边距把整块垂直居中。
         注意：不能用 justify-content: center —— 内容溢出时它会把首项顶出
         可视区且滚不到；auto 外边距在溢出时会塌缩为 0，自动退回顶部对齐。
         ========================================================================== */
      @media (max-width: 1023px) {
        .cl-drawer-title {
          font-size: clamp(2.1rem, 9.6vw, 2.6rem) !important;
          line-height: 1.14;
        }
        .cl-drawer-list {
          gap: clamp(0.9rem, 2.6vh, 1.5rem);
        }
        /* 垂直居中要加在「nav-body 的直接弹性子项」上：
           MenuList 的结构是 nav-body > .cl-main-nav > .cl-drawer-list，
           加在 list 上不会吸收剩余空间（实测 margin 仍为 0） */
        .cl-fullscreen-nav-body > .cl-main-nav {
          margin-block: auto;
          width: 100%;
        }
        .cl-drawer-sublink {
          font-size: clamp(1.05rem, 4.2vw, 1.4rem);
        }
      }

      /* ==========================================================================
         4. 阅读进度条 (Reading Progress Bar) — 嵌入胶囊底边的基座线
         旧形态为视口顶部全宽细线，与悬浮胶囊分离；现改为胶囊内 absolute 底边，
         随胶囊宽度自适应（桌面窄胶囊 / 移动宽胶囊），朱砂自左向右填充

         几何：胶囊是 border-radius:9999px 的体育场形，底边 = 中间平直段 + 两端圆弧，
         圆弧与平直段的切点距左右边缘各恰为半径 R。故基座线两端各内缩 R
         (--cl-pill-radius = 胶囊实高/2)，线段正好落在平直段上、与圆弧相切，
         100% 收在胶囊轮廓内（胶囊无 overflow:hidden，会裁掉父级就地下拉 .cl-pill-sub，
         因此不能靠 overflow 裁切，必须靠内缩）。再上移 1px 贴住 1px 描边的内缘。
         ========================================================================== */
      .cl-read-progress {
        position: absolute;
        left: var(--cl-pill-radius);
        right: var(--cl-pill-radius);
        bottom: 1px;
        height: 2px;
        z-index: 1;
        pointer-events: none;
        background: color-mix(in srgb, var(--cl-border) 70%, transparent);
        /* 2px 高的轨道：两端自然收成半圆；朱砂填充也被 overflow 裁在同一形状内 */
        border-radius: 9999px;
        overflow: hidden;
      }
      .cl-read-progress-bar {
        height: 100%;
        width: 100%;
        transform-origin: left center;
        transform: scaleX(0);
        background: var(--cl-accent);
        will-change: transform;
      }

      /* ==========================================================================
         5. 全局搜索浮层 (Search Overlay)
         ========================================================================== */
      .cl-search-overlay {
        position: fixed;
        inset: 0;
        z-index: 250;
      }
      .cl-search-overlay-mask {
        position: absolute;
        inset: 0;
        border: 0;
        background: color-mix(in srgb, var(--cl-bg) 28%, transparent);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .cl-search-panel {
        position: relative;
        z-index: 1;
        width: min(36rem, calc(100% - 1.5rem));
        margin: 12vh auto 0;
        border: 1px solid var(--cl-border);
        border-radius: 14px;
        background: color-mix(in srgb, var(--cl-surface) 88%, transparent);
        backdrop-filter: blur(18px) saturate(1.1);
        -webkit-backdrop-filter: blur(18px) saturate(1.1);
        box-shadow: 0 18px 50px color-mix(in srgb, var(--cl-text) 12%, transparent);
        overflow: hidden;
      }
      .cl-search-panel-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.85rem 0.9rem;
        border-bottom: 1px solid var(--cl-border);
        color: var(--cl-faint);
      }
      .cl-search-panel-row input {
        flex: 1;
        min-width: 0;
        border: 0;
        background: transparent;
        color: var(--cl-text);
        font: inherit;
        font-size: 1rem;
      }
      .cl-search-panel-row input:focus-visible,
      .cl-search-close:focus-visible,
      .cl-search-overlay-mask:focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 2px;
      }
      .cl-search-close {
        border: 0;
        background: transparent;
        color: var(--cl-muted);
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        cursor: pointer;
      }
      .cl-search-results {
        list-style: none;
        margin: 0;
        padding: 0.35rem 0 0.5rem;
        max-height: min(52vh, 24rem);
        overflow: auto;
      }
      .cl-search-results a {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding: 0.65rem 1rem;
        color: var(--cl-text);
      }
      .cl-search-results a:hover {
        background: color-mix(in srgb, var(--cl-accent) 8%, transparent);
      }
      .cl-search-kind {
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.08em;
        color: var(--cl-accent);
      }
      .cl-search-hit {
        font-family: var(--cl-font-display);
        font-size: 1.05rem;
      }
      .cl-search-sum,
      .cl-search-empty {
        font-size: 0.82rem;
        line-height: 1.45;
        color: var(--cl-muted);
      }
      .cl-search-empty {
        padding: 0.9rem 1rem 1rem;
      }

      /* ==========================================================================
         6. 系统 Reduced Motion 响应
         ========================================================================== */
      @media (prefers-reduced-motion: reduce) {
        .cl-floating-pill,
        .cl-pill-menu-btn,
        .cl-pill-sub,
        .cl-fullscreen-panel,
        .cl-fullscreen-mask,
        .cl-drawer-item,
        .cl-drawer-link,
        .cl-drawer-sublink,
        .cl-search-overlay,
        .cl-search-overlay * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* ==========================================================================
         7. 不支持 backdrop-filter 时的实色降级
         低端 Android / 老版 Firefox 上毛玻璃会完全失效，
         退化为不透明背景，保证文字对比度与可读性
         ========================================================================== */
      @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
        .cl-floating-pill {
          background: rgba(28, 26, 24, 0.97);
        }
        :root:not(.dark) .cl-floating-pill {
          background: rgba(250, 246, 238, 0.99);
        }
        .cl-pill-sub {
          background: var(--cl-surface);
        }
        .cl-fullscreen-mask {
          background: rgba(0, 0, 0, 0.88);
        }
        .cl-fullscreen-panel {
          background: #16120f;
        }
        :root:not(.dark) .cl-fullscreen-panel {
          background: #f8f5ee;
        }
      }
`
