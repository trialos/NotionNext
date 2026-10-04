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

      /* —— Article cover band —— */
      #theme-circlelife .cl-article-card {
        padding: 0;
      }
      #theme-circlelife .cl-article-cover {
        position: relative;
        height: 180px;
        overflow: hidden;
        border-radius: var(--cl-radius) var(--cl-radius) 0 0;
        background: var(--cl-paper-2);
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-article-cover {
          height: 200px;
        }
      }
      @media (max-width: 640px) {
        #theme-circlelife .cl-article-cover {
          height: 150px;
        }
      }
      #theme-circlelife .cl-article-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
      }
      #theme-circlelife .cl-article-cover-fade {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 55%;
        pointer-events: none;
        background: linear-gradient(
          180deg,
          transparent 0%,
          color-mix(in srgb, var(--cl-surface) 55%, transparent) 55%,
          var(--cl-surface) 100%
        );
      }
      #theme-circlelife .cl-article-inner {
        position: relative;
        z-index: 1;
      }
      #theme-circlelife .cl-article-card .cl-article-hero {
        margin-top: 0;
      }

      /* —— Article —— */
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
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap {
        font-family: var(--cl-font-body);
        font-size: 1.02rem;
        line-height: 1.85;
        color: var(--cl-text);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion {
        color: var(--cl-text);
        font-size: inherit;
        line-height: inherit;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-page-content-inner {
        padding: 0 !important;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap h1,
      #theme-circlelife #article-wrapper.cl-prose-wrap h2,
      #theme-circlelife #article-wrapper.cl-prose-wrap h3,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h {
        font-family: var(--cl-font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
        margin-top: 1.6em;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link {
        color: var(--cl-accent) !important;
        border-bottom: 1px solid color-mix(in srgb, var(--cl-accent) 30%, transparent);
        transition: border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link:hover {
        border-bottom-color: var(--cl-accent);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-quote {
        border-left: 2px solid var(--cl-accent);
        padding-left: 1rem;
        margin: 1.25em 0;
        color: var(--cl-muted);
        font-family: var(--cl-font-display);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-code,
      #theme-circlelife #article-wrapper.cl-prose-wrap code {
        background: var(--cl-paper-2) !important;
        border-radius: var(--cl-radius-sm);
        border: 1px solid var(--cl-border);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-callout {
        border: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-paper-2) 45%, var(--cl-surface));
        border-radius: var(--cl-radius-sm);
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
      /* mobile TOC fab + drawer */
      #theme-circlelife .cl-toc-fab {
        display: none;
      }
      @media (max-width: 767px) {
        #theme-circlelife .cl-toc-fab {
          display: inline-flex;
          position: fixed;
          right: 1rem;
          bottom: 5.25rem;
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
        padding: 0.85rem 1rem 1.5rem;
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
