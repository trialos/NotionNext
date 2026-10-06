/**
 * Circle of Life — header：中轴导航 + 阅读进度 + 汉堡抽屉 portal + 桌面子菜单 portal
 */
export const headerStyle = `
      /* —— Header：中轴桌面 + 手机汉堡 —— */
      #theme-circlelife .cl-header {
        position: sticky;
        top: 0;
        background-color: color-mix(in srgb, var(--cl-bg) 48%, transparent);
        backdrop-filter: blur(16px) saturate(1.12);
        -webkit-backdrop-filter: blur(16px) saturate(1.12);
        border-bottom: 1px solid transparent;
        transition:
          border-color var(--cl-dur) var(--cl-ease),
          background-color var(--cl-dur) var(--cl-ease),
          backdrop-filter var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-header.is-scrolled {
        border-bottom-color: color-mix(in srgb, var(--cl-border) 55%, transparent);
        background-color: color-mix(in srgb, var(--cl-bg) 62%, transparent);
      }
      /* 影集页：更高透，靠模糊保可读 */
      #theme-circlelife.cl-is-album .cl-header {
        background-color: color-mix(in srgb, var(--cl-bg) 28%, transparent);
        backdrop-filter: blur(18px) saturate(1.18);
        -webkit-backdrop-filter: blur(18px) saturate(1.18);
      }
      #theme-circlelife.cl-is-album .cl-header.is-scrolled {
        background-color: color-mix(in srgb, var(--cl-bg) 42%, transparent);
        border-bottom-color: color-mix(in srgb, var(--cl-border) 40%, transparent);
      }
      #theme-circlelife .cl-header-inner {
        margin: 0 auto;
        width: 100%;
        max-width: min(72rem, 100%);
        display: flex;
        align-items: center;
        padding: 0.8rem clamp(1.25rem, 3vw, 2.25rem);
        min-height: 3.5rem;
        gap: 1rem;
        box-sizing: border-box;
        transition:
          padding 0.28s var(--cl-ease),
          min-height 0.28s var(--cl-ease),
          gap 0.28s var(--cl-ease);
      }
      #theme-circlelife .cl-header.is-scrolled .cl-header-inner {
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
        min-height: 2.65rem;
      }

      /* desktop three-column */
      #theme-circlelife .cl-header-inner--desktop {
        display: none;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-header-inner--desktop {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          column-gap: clamp(1.25rem, 2.5vw, 2rem);
        }
        #theme-circlelife .cl-header-inner--mobile {
          display: none !important;
        }
      }
      #theme-circlelife .cl-header-inner--mobile {
        display: grid;
        grid-template-columns: minmax(4.5rem, 1fr) auto minmax(4.5rem, 1fr);
        align-items: center;
        column-gap: 0.35rem;
      }
      #theme-circlelife .cl-header-mobile-side {
        display: flex;
        align-items: center;
        min-width: 0;
      }
      #theme-circlelife .cl-header-mobile-side--left {
        justify-content: flex-start;
      }
      #theme-circlelife .cl-header-mobile-side--right {
        justify-content: flex-end;
      }
      #theme-circlelife .cl-header-actions--mobile {
        gap: 0.1rem;
      }
      /* 手机展开：logo 双行；上滑收起：单行英文（BrandLockup collapsed） */
      #theme-circlelife .cl-header-inner--mobile .cl-header-center {
        justify-self: center;
      }

      #theme-circlelife .cl-header-center {
        display: flex;
        justify-content: center;
        justify-self: center;
        z-index: 2;
      }
      #theme-circlelife .cl-header-wing {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        min-width: 0;
        transition: gap 0.32s var(--cl-ease);
      }
      #theme-circlelife .cl-header-wing--left {
        justify-content: flex-end;
        justify-self: stretch;
        padding-right: 0.25rem;
      }
      #theme-circlelife .cl-header-wing--right {
        justify-content: flex-start;
        justify-self: stretch;
        gap: 0.85rem;
        padding-left: 0.25rem;
      }
      /* 收起：略紧凑，不硬拽贴 logo */
      #theme-circlelife .cl-header.is-scrolled .cl-header-wing--left.is-gathered {
        gap: 0.35rem;
      }
      #theme-circlelife .cl-header.is-scrolled .cl-header-wing--right.is-gathered {
        gap: 0.65rem;
      }
      #theme-circlelife .cl-header-wing--right .cl-main-nav {
        margin-right: 0.15rem;
      }

      #theme-circlelife .cl-header-actions {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        height: 2.25rem;
      }
      #theme-circlelife .cl-icon-btn {
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
        transition:
          color 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          transform 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-icon-btn i,
      #theme-circlelife .cl-icon-btn-glyph {
        font-size: 0.92rem;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #theme-circlelife .cl-icon-btn:hover {
        color: var(--cl-accent);
        border-color: var(--cl-border);
        background: var(--cl-accent-soft);
      }
      #theme-circlelife .cl-header.is-scrolled .cl-icon-btn,
      #theme-circlelife .cl-header.is-scrolled .cl-header-actions {
        height: 2rem;
      }
      #theme-circlelife .cl-header.is-scrolled .cl-icon-btn {
        width: 2rem;
        height: 2rem;
      }

      /* lockup — no clip on Chinese */
      #theme-circlelife .cl-brand:hover {
        opacity: 0.86;
      }
      #theme-circlelife .cl-lockup-cn {
        font-family: var(--cl-font-display);
        font-size: 1.02rem;
        line-height: 1.35;
        padding-top: 0.08em;
        padding-bottom: 0.06em;
        opacity: 1;
        /* never overflow:hidden — was clipping 时光的弧线 */
      }
      #theme-circlelife .cl-lockup-en {
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.16em;
        margin-top: 0.22rem;
        line-height: 1.2;
        transition: margin 0.22s var(--cl-ease), opacity 0.2s var(--cl-ease), font-size 0.22s var(--cl-ease);
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-cn {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-en {
        margin-top: 0;
        font-size: 0.58rem;
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-text {
        position: relative;
      }
            #theme-circlelife .cl-lockup--row {
        align-items: center;
      }
      #theme-circlelife .cl-lockup--row .cl-lockup-mark {
        display: block;
      }
      #theme-circlelife .cl-lockup-row-text {
        align-items: center;
        line-height: 1;
      }
      #theme-circlelife .cl-lockup--row .cl-lockup-cn--row {
        font-size: 0.95rem;
        line-height: 1;
        padding: 0;
        display: inline-flex;
        align-items: center;
      }
      #theme-circlelife .cl-lockup--row .cl-lockup-en--row {
        margin-top: 0;
        font-size: 0.58rem;
        line-height: 1;
        letter-spacing: 0.14em;
        display: inline-flex;
        align-items: center;
        transform: translateY(0.5px);
      }
      #theme-circlelife .cl-lockup-sep {
        color: var(--cl-accent);
        font-size: 0.85rem;
        line-height: 1;
        opacity: 0.95;
        transform: translateY(-0.5px);
      }

      #theme-circlelife .cl-nav-link {
        position: relative;
        color: var(--cl-muted);
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        transition:
          color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          padding 0.2s var(--cl-ease);
      }
      #theme-circlelife .cl-nav-link:hover {
        color: var(--cl-text);
        background: color-mix(in srgb, var(--cl-accent-soft) 55%, transparent);
      }
      #theme-circlelife .cl-nav-ico {
        font-size: 0.78rem;
        opacity: 0.85;
        width: 0.95em;
        text-align: center;
      }
      #theme-circlelife .cl-nav-text {
        display: inline-block;
        max-width: 6.5rem;
        opacity: 1;
        transition: opacity 0.18s var(--cl-ease), max-width 0.28s var(--cl-ease);
      }
      #theme-circlelife .cl-nav-link--icon {
        min-width: 1.85rem;
        min-height: 1.85rem;
        justify-content: center;
        padding-left: 0.4rem;
        padding-right: 0.4rem;
      }
      #theme-circlelife .cl-nav-link--icon .cl-nav-text,
      #theme-circlelife .cl-nav-link--icon .cl-nav-chevron {
        opacity: 0;
        max-width: 0;
        margin: 0;
        overflow: hidden;
        pointer-events: none;
      }
      #theme-circlelife .cl-nav-link--icon .cl-nav-ico {
        font-size: 0.9rem;
        opacity: 1;
      }
      #theme-circlelife .cl-nav-tip {
        position: absolute;
        left: 50%;
        top: calc(100% + 6px);
        transform: translateX(-50%) translateY(-2px);
        padding: 0.22rem 0.48rem;
        border-radius: var(--cl-radius-sm);
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
        color: var(--cl-text);
        font-size: 0.68rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s var(--cl-ease), transform 0.15s var(--cl-ease);
        z-index: 60;
      }
      #theme-circlelife .cl-nav-link--icon:hover .cl-nav-tip,
      #theme-circlelife .cl-nav-link--icon:focus-within .cl-nav-tip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      #theme-circlelife .cl-nav-link--text .cl-nav-tip {
        display: none;
      }

      /* reading progress */
      #theme-circlelife .cl-read-progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        pointer-events: none;
        background: color-mix(in srgb, var(--cl-border) 70%, transparent);
        overflow: hidden;
      }
      #theme-circlelife .cl-read-progress-bar {
        height: 100%;
        width: 100%;
        transform-origin: left center;
        transform: scaleX(0);
        background: var(--cl-accent);
        will-change: transform;
      }


      /* mobile fullscreen menu — portal on body, tokens inherit from :root */
      .cl-drawer-root {
        position: fixed;
        inset: 0;
        z-index: 200;
        pointer-events: none;
        visibility: hidden;
        transition: visibility 0s linear 0.32s;
        font-family: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
        color: var(--cl-text);
      }
      .cl-drawer-root.is-open {
        pointer-events: auto;
        visibility: visible;
        transition-delay: 0s;
      }
      .cl-drawer-mask {
        position: absolute;
        inset: 0;
        border: 0;
        background: color-mix(in srgb, var(--cl-text) 18%, transparent);
        opacity: 0;
        transition: opacity 0.28s var(--cl-ease);
        cursor: pointer;
      }
      .cl-drawer-root.is-open .cl-drawer-mask {
        opacity: 1;
      }
      html.dark .cl-drawer-mask {
        background: color-mix(in srgb, #000 45%, transparent);
      }
      @media (prefers-reduced-motion: reduce) {
        .cl-drawer-mask,
        .cl-drawer-panel,
        .cl-toc-drawer-mask,
        .cl-toc-drawer-panel {
          transition-duration: 0.01ms !important;
        }
      }
      .cl-drawer-panel {
        position: absolute;
        inset: 0.5rem;
        display: flex;
        flex-direction: column;
        background: var(--cl-bg);
        border-radius: 24px;
        padding: 0.85rem 1rem 1.4rem;
        opacity: 0;
        transform: scale(0.965);
        transform-origin: top center;
        transition: opacity 0.26s var(--cl-ease), transform 0.32s var(--cl-ease);
        overflow-y: auto;
        box-shadow: 0 18px 60px color-mix(in srgb, var(--cl-text) 14%, transparent);
      }
      html.dark .cl-drawer-panel {
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
      }
      .cl-drawer-root.is-open .cl-drawer-panel {
        opacity: 1;
        transform: scale(1);
      }
      .cl-drawer-head {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        column-gap: 0.5rem;
        flex: none;
      }
      .cl-drawer-close {
        justify-self: start;
        color: var(--cl-muted) !important;
        flex: none;
      }
      .cl-drawer-brand {
        justify-self: center;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }
      .cl-drawer-head-actions {
        justify-self: end;
        display: inline-flex;
        align-items: center;
        gap: 0.1rem;
      }
      /* 菜单块用 auto margin 垂直居中；内容超高时 margin 归零、从顶部正常滚动 */
      .cl-drawer-panel .cl-main-nav--drawer {
        margin: auto 0;
      }
      .cl-drawer-list {
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
      }
      .cl-drawer-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.8rem 0.6rem;
        border: 0;
        background: transparent;
        color: var(--cl-text);
        font-family: var(--cl-font-display);
        font-size: 1.4rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-align: center;
        border-radius: 12px;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .cl-drawer-link .cl-nav-ico {
        display: none;
      }
      .cl-drawer-link:hover,
      .cl-drawer-link:active {
        background: color-mix(in srgb, var(--cl-accent-soft) 70%, transparent);
        color: var(--cl-text);
      }
      .cl-drawer-chevron {
        font-size: 0.7rem;
        color: var(--cl-faint);
        transition: transform 0.2s var(--cl-ease);
      }
      .cl-drawer-chevron.is-open {
        transform: rotate(180deg);
      }
      .cl-drawer-sub {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .cl-drawer-sublink {
        display: block;
        padding: 0.5rem 0.65rem;
        color: var(--cl-muted);
        font-size: 0.98rem;
        text-decoration: none;
      }
      .cl-drawer-sublink:hover {
        color: var(--cl-accent);
      }
      .cl-drawer-foot {
        flex: none;
        margin: 1.4rem 0 0;
        padding-top: 0.85rem;
        border-top: 1px solid color-mix(in srgb, var(--cl-border) 60%, transparent);
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--cl-faint);
        text-align: center;
      }
      /* desktop dropdown submenu (portal on body) */
      .cl-submenu {
        list-style: none;
        margin: 0;
        padding: 0.4rem 0;
        min-width: 11rem;
        border-radius: var(--cl-radius);
        border: 1px solid var(--cl-border);
        background: var(--cl-surface) !important;
        color: var(--cl-text);
        box-shadow: 0 8px 24px color-mix(in srgb, var(--cl-text) 8%, transparent);
        z-index: 120;
      }
      .dark .cl-submenu {
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
      }
      .cl-submenu-item {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .cl-submenu-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1rem;
        color: inherit;
        font-size: 0.86rem;
        font-weight: 400;
        letter-spacing: 0.02em;
        text-decoration: none;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .cl-submenu-link:hover {
        background: var(--cl-accent-soft);
        color: var(--cl-accent);
      }
      .cl-submenu-ico {
        opacity: 0.7;
        font-size: 0.75rem;
      }
`
