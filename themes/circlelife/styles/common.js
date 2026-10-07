/**
 * Circle of Life — common：通用小组件 + 回顶 + 页脚/归档/分页 + media hooks
 */
export const commonStyle = `
      /* 全出血元素（如首页胶片条）的横向护栏：内容可破窄栏，但不得撑出页面 */
      #theme-circlelife #container-wrapper {
        overflow-x: clip;
      }
      /* author badge */
      #theme-circlelife .cl-author-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        overflow: hidden;
        flex: none;
        border: 1px solid var(--cl-border);
        background: var(--cl-paper-2);
      }
      #theme-circlelife .cl-author-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      #theme-circlelife .cl-author-initial {
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        color: var(--cl-muted);
        line-height: 1;
      }
      #theme-circlelife .cl-author-name {
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
      }
      #theme-circlelife .cl-deck-author {
        margin-right: 0.35rem;
      }
      #theme-circlelife .cl-deck-chip-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.35rem;
      }

      #theme-circlelife .cl-kicker {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        color: var(--cl-accent);
        margin: 0;
      }
      #theme-circlelife .cl-kicker-sep {
        color: var(--cl-faint);
        letter-spacing: 0;
      }
      #theme-circlelife .cl-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.03em;
        font-variant-numeric: tabular-nums;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-meta a:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-meta-muted {
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-dot {
        margin: 0 0.35rem;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.18rem 0.6rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong);
        font-family: var(--cl-font-mono);
        font-size: 0.66rem;
        letter-spacing: 0.04em;
        color: var(--cl-muted);
        background: transparent;
        transition:
          border-color 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease);
        flex-shrink: 0;
      }
      #theme-circlelife .cl-chip--soft {
        border-color: var(--cl-border);
        background: color-mix(in srgb, var(--cl-paper-2) 40%, transparent);
      }
      #theme-circlelife .cl-chip:hover {
        border-color: var(--cl-accent);
        color: var(--cl-accent);
        background: var(--cl-accent-soft);
      }
      /* back to top */
      #theme-circlelife .cl-backtop {
        position: fixed;
        z-index: 30;
        /* 无侧栏：内容右 gutter（max-w-3xl≈48rem） */
        right: max(1rem, calc((100vw - 48rem) / 2 + 0.5rem));
        bottom: calc(1.75rem + env(safe-area-inset-bottom, 0px));
        width: 2.65rem;
        height: 2.65rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong, var(--cl-border));
        background: var(--cl-surface);
        color: var(--cl-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        /* visibility 同步控制：隐藏态不可 Tab 聚焦；延迟到淡出结束再隐藏 */
        visibility: hidden;
        pointer-events: none;
        transform: translateY(10px);
        transition:
          opacity 0.28s var(--cl-ease),
          transform 0.28s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease),
          box-shadow 0.15s var(--cl-ease),
          right 0.28s var(--cl-ease),
          visibility 0s linear 0.28s;
        box-shadow: 0 1px 0 color-mix(in srgb, var(--cl-text) 4%, transparent);
      }
      /* 有目录侧栏：贴 TOC 左缘（max-w-5xl + w-64） */
      @media (min-width: 768px) {
        #theme-circlelife.cl-has-sidebar .cl-backtop {
          right: max(1rem, calc((100vw - 64rem) / 2 + 16rem));
        }
        #theme-circlelife.cl-is-album .cl-backtop {
          right: 1.25rem;
        }
      }
      @media (max-width: 767px) {
        #theme-circlelife .cl-backtop {
          right: max(1.1rem, env(safe-area-inset-right, 0px));
        }
      }
      #theme-circlelife .cl-backtop.is-visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
        transition-delay: 0s;
      }
      #theme-circlelife .cl-backtop:hover {
        color: var(--cl-accent);
        border-color: var(--cl-accent);
        background: var(--cl-accent-soft);
        transform: translateY(-3px);
      }
      #theme-circlelife .cl-backtop-icon {
        font-size: 1.15rem;
        font-weight: 600;
        line-height: 1;
        font-family: var(--cl-font-body);
      }

/* —— Footer —— */
      #theme-circlelife .cl-footer {
        border-top: 1px solid var(--cl-border);
        background: transparent;
        padding-top: 1.75rem;
        padding-bottom: 1.75rem;
      }
      #theme-circlelife .cl-footer .cl-lockup--row {
        min-height: 1.75rem;
      }

      #theme-circlelife .cl-page-hero {
        margin-bottom: 1.5rem;
        padding-bottom: 0.9rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-page-hero h1 {
        font-family: var(--cl-font-display);
        font-size: 1.45rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin: 0;
      }

      #theme-circlelife .cl-archive-item {
        position: relative;
      }
      #theme-circlelife .cl-archive-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.7em;
        width: 5px;
        height: 5px;
        margin-left: -3px;
        border-radius: 9999px;
        background: var(--cl-accent);
        opacity: 0.55;
      }

      /* 档案页脚式翻页：hairline 细线 + mono 三段式（与文章页「← 返回」同语言） */
      #theme-circlelife .cl-pager-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 0.9rem;
        border-top: 1px solid var(--cl-border);
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.06em;
      }
      #theme-circlelife .cl-pager-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 3.6rem;
        padding: 0.5rem 0.25rem;
        color: var(--cl-muted);
        text-decoration: none;
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-pager-link:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-pager-pos {
        flex: none;
        color: var(--cl-faint);
        white-space: nowrap;
      }
      #theme-circlelife .cl-pager-pos-cur {
        color: var(--cl-text);
      }
      #theme-circlelife .cl-pager-link.is-disabled {
        color: var(--cl-faint);
        opacity: 0.55;
        pointer-events: none;
      }
      /* 首页「全部文章」单链接复用翻页条视觉 */
      #theme-circlelife .cl-recent-more {
        color: var(--cl-muted);
        text-decoration: none;
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-recent-more:hover {
        color: var(--cl-accent);
      }
      /* 加载更多（BlogListScroll）：真实按钮，键盘可达 */
      #theme-circlelife .cl-load-more {
        display: block;
        border: 0;
        background: transparent;
        cursor: pointer;
        font-family: var(--cl-font-body);
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-load-more:hover:not(:disabled) {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-load-more:disabled {
        cursor: default;
        opacity: 0.7;
      }
      /* type=search 的原生清除钮与自定义清除按钮重复 */
      #theme-circlelife
        input[type='search']::-webkit-search-cancel-button {
        -webkit-appearance: none;
        appearance: none;
      }
      /* 归档月份锚点：跳转时给吸顶栏留出空间 */
      #theme-circlelife .cl-archive-section {
        scroll-margin-top: 5rem;
      }
      /* media hooks reserved */
      #theme-circlelife .cl-media-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
      }
      @media (max-width: 640px) {
        #theme-circlelife .cl-media-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      #theme-circlelife .cl-media-card {
        display: block;
        overflow: hidden;
        border-radius: var(--cl-media-radius);
        border: 1px solid var(--cl-border);
        background: var(--cl-paper-2);
        aspect-ratio: var(--cl-media-ratio);
      }
      #theme-circlelife .cl-media-card--sm {
        width: 5.25rem;
        height: 5.25rem;
        flex-shrink: 0;
        aspect-ratio: 1;
      }

      #theme-circlelife .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      #theme-circlelife .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
`
