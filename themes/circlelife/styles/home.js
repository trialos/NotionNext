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
      }
      #theme-circlelife .cl-deck-stage {
        position: relative;
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
        display: inline;
        background-image: linear-gradient(var(--cl-accent), var(--cl-accent));
        background-position: 0 100%;
        background-repeat: no-repeat;
        background-size: 0 1px;
        font-family: var(--cl-font-display);
        font-size: clamp(1.3rem, 3.2vw, 1.7rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.3;
        color: var(--cl-text);
        transition: background-size 0.2s var(--cl-ease), color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-latest-title:hover {
        color: var(--cl-accent);
        background-size: 100% 1px;
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

      /* —— Home filmstrip（影集胶片横条）—— */
      #theme-circlelife .cl-film {
        margin-bottom: 1.75rem;
      }
      #theme-circlelife .cl-film-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        margin: 0 0 0.9rem;
      }
      #theme-circlelife .cl-film-kicker {
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        color: var(--cl-faint);
        margin: 0;
      }
      #theme-circlelife .cl-film-all {
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        color: var(--cl-muted);
        text-decoration: none;
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-film-all:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-film-strip {
        display: flex;
        gap: 0.75rem;
        /* 全出血：破开正文窄栏贴到屏幕两侧；首帧与正文列左缘对齐 */
        margin-inline: calc(50% - 50vw);
        padding-inline: max(1rem, calc((100vw - 48rem) / 2 + 1.5rem));
        scroll-padding-inline: max(1rem, calc((100vw - 48rem) / 2 + 1.5rem));
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        overscroll-behavior-x: contain;
        touch-action: pan-x pan-y;
        scrollbar-width: none;
        cursor: grab;
      }
      #theme-circlelife .cl-film-strip::-webkit-scrollbar {
        display: none;
      }
      #theme-circlelife .cl-film-strip.is-dragging {
        cursor: grabbing;
        user-select: none;
      }
      #theme-circlelife .cl-film-frame {
        flex: none;
        width: clamp(16rem, 62vw, 24rem);
        scroll-snap-align: start;
        text-decoration: none;
      }
      #theme-circlelife .cl-film-img-wrap {
        display: block;
        aspect-ratio: 3 / 2;
        border-radius: var(--cl-radius);
        overflow: hidden;
        background: var(--cl-paper-2);
      }
      #theme-circlelife .cl-film-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s var(--cl-ease);
      }
      #theme-circlelife .cl-film-frame:hover .cl-film-img {
        transform: scale(1.03);
      }
      #theme-circlelife .cl-film-frame img {
        -webkit-user-drag: none;
      }
      #theme-circlelife .cl-film-caption {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-top: 0.5rem;
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        letter-spacing: 0.06em;
        color: var(--cl-muted);
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-film-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #theme-circlelife .cl-film-date {
        flex: none;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-film-frame:hover .cl-film-caption {
        color: var(--cl-text);
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
`
