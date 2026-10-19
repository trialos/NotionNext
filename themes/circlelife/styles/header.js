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
        top: max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.65rem));
        left: 0;
        right: 0;
        z-index: 60;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
      }

      /* 非全屏沉浸页（文章详情、归档列表等）提供顶部避让空间，防止被悬浮胶囊遮挡 */
      #theme-circlelife:not(.cl-is-home):not(.cl-is-album):not(.cl-is-about) #container-inner {
        padding-top: max(4.5rem, calc(env(safe-area-inset-top, 0px) + 4rem));
      }

      /* 悬浮胶囊母体 (Pill Capsule) — 水平绝对居中 */
      .cl-floating-pill {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
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
      }

      :root:not(.dark) .cl-floating-pill {
        background: rgba(250, 246, 238, 0.92);
        border-color: rgba(32, 25, 15, 0.12);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
      }

      /* 手机端拉长横幅 (对标设计截图) */
      @media (max-width: 767px) {
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
        color: #e5e2dc;
        user-select: none;
      }
      :root:not(.dark) .cl-floating-pill-brand-text {
        color: #20190f;
      }
      @media (min-width: 768px) {
        .cl-floating-pill-brand-text {
          display: none !important;
        }
      }

      /* PC 桌面端 4 个主导航项：首页、随笔、相册、关于 */
      .cl-floating-pill-nav {
        display: none;
        align-items: center;
        gap: clamp(0.85rem, 1.8vw, 1.45rem);
        padding-left: 0.35rem;
        padding-right: 0.35rem;
      }
      @media (min-width: 768px) {
        .cl-floating-pill-nav {
          display: inline-flex;
        }
      }

      .cl-floating-pill-link {
        color: #cfcac2;
        font-family: var(--cl-font-display, inherit);
        font-size: 0.92rem;
        font-weight: 500;
        text-decoration: none;
        letter-spacing: 0.02em;
        white-space: nowrap;
        transition: color 0.15s ease;
      }
      :root:not(.dark) .cl-floating-pill-link {
        color: #55524c;
      }
      .cl-floating-pill-link:hover {
        color: #ffffff;
      }
      :root:not(.dark) .cl-floating-pill-link:hover {
        color: #1a1917;
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
        background: #c4a47c;
        color: #ffffff;
        font-size: 0.88rem;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease;
        box-shadow: 0 2px 10px rgba(196, 164, 124, 0.35);
      }
      .cl-pill-menu-btn--mobile:active {
        transform: scale(0.94);
      }
      @media (min-width: 768px) {
        .cl-pill-menu-btn--mobile {
          display: none !important;
        }
      }

      /* PC 桌面端独立悬浮右上角暖金纯图标胶囊按钮 */
      .cl-floating-desktop-menu-btn {
        position: fixed;
        top: max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.65rem));
        right: max(1.5rem, calc(env(safe-area-inset-right, 0px) + 1.25rem));
        z-index: 60;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.44rem 1.05rem;
        border-radius: 9999px;
        border: 0;
        background: #c4a47c;
        color: #ffffff;
        font-size: 0.95rem;
        line-height: 1;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 4px 18px rgba(196, 164, 124, 0.4);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease, box-shadow 0.2s ease;
      }
      .cl-floating-desktop-menu-btn:hover {
        transform: scale(1.06);
        filter: brightness(1.08);
        box-shadow: 0 6px 22px rgba(196, 164, 124, 0.55);
      }
      .cl-floating-desktop-menu-btn:active {
        transform: scale(0.96);
      }
      @media (max-width: 767px) {
        .cl-floating-desktop-menu-btn {
          display: none !important;
        }
      }

      /* 键盘高对比度 Focus 焦点环 (Vercel Guidelines) */
      .cl-floating-pill-link:focus-visible,
      .cl-pill-menu-btn--mobile:focus-visible,
      .cl-floating-desktop-menu-btn:focus-visible,
      .cl-drawer-link:focus-visible,
      .cl-drawer-sublink:focus-visible,
      .cl-fullscreen-top-btn:focus-visible,
      .cl-fullscreen-close:focus-visible {
        outline: 2px solid var(--cl-accent, #c4a47c) !important;
        outline-offset: 3px !important;
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
        color: var(--cl-accent, #c4a47c);
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

      /* 移动端抽屉菜单自适应：顶部上靠对齐与视口高度/宽度弹性缩放 */
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
          justify-content: flex-start;
        }
        .cl-drawer-list {
          width: 100%;
          padding: 0;
          gap: clamp(0.75rem, 2.2vh, 1.35rem);
        }
        .cl-drawer-title {
          font-size: clamp(1.75rem, 6.8vw, 2.4rem) !important;
          line-height: 1.12;
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
        .cl-drawer-sublink {
          font-size: clamp(1rem, 4vw, 1.25rem);
        }
      }

      /* ==========================================================================
         4. 阅读进度条 (Reading Progress Bar)
         ========================================================================== */
      .cl-read-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        z-index: 70;
        pointer-events: none;
        background: color-mix(in srgb, var(--cl-border) 70%, transparent);
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
`
