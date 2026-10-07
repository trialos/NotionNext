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

      /* —— Home wheel（影集弧形转筒）—— */
      #theme-circlelife .cl-wheel {
        margin-bottom: 1.75rem;
      }
      #theme-circlelife .cl-wheel-head {
        position: relative;
        z-index: 300; /* 永远压过转筒卡片（卡片 zIndex ≤200），防「全部影集」被边缘叠卡遮挡误触 */
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 0.75rem;
        margin: 0 0 0.6rem;
      }
      #theme-circlelife .cl-wheel-mast {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3rem;
        padding-left: 0.85rem;
        border-left: 2px solid var(--cl-accent);
      }
      #theme-circlelife .cl-wheel-kicker {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--cl-faint);
        line-height: 1;
      }
      #theme-circlelife .cl-wheel-title {
        font-family: var(--cl-font-display);
        font-size: clamp(1.2rem, 2.6vw, 1.5rem);
        font-weight: 600;
        letter-spacing: -0.03em;
        color: var(--cl-text);
        line-height: 1.2;
        margin: 0;
        text-wrap: balance;
      }
      #theme-circlelife .cl-wheel-head-actions {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
      }
      #theme-circlelife .cl-wheel-pause {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border: 0;
        border-radius: 9999px;
        background: color-mix(in srgb, var(--cl-text) 7%, transparent);
        color: var(--cl-muted);
        cursor: pointer;
        transition:
          background 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-wheel-pause:hover {
        color: var(--cl-text);
        background: color-mix(in srgb, var(--cl-text) 12%, transparent);
      }
      #theme-circlelife .cl-wheel-pause i {
        font-size: 0.7rem;
      }
      #theme-circlelife .cl-wheel-all {
        font-family: var(--cl-font-mono);
        font-size: 0.78rem;
        letter-spacing: 0.06em;
        color: var(--cl-muted);
        text-decoration: none;
        padding: 0.5rem 0.75rem;
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-wheel-all:hover {
        color: var(--cl-accent);
      }
      /* 转筒舞台：卡片位姿全由 rAF 内联 transform 驱动 */
      #theme-circlelife .cl-wheel-viewport {
        position: relative;
        height: clamp(15rem, 32vw, 19rem);
        outline: none;
        touch-action: pan-y;
      }
      #theme-circlelife .cl-wheel-viewport:focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 4px;
        border-radius: var(--cl-radius);
      }
      #theme-circlelife .cl-wheel-stage {
        position: absolute;
        inset: 0;
      }
      #theme-circlelife .cl-wheel-card {
        position: absolute;
        left: 50%;
        top: 50%;
        width: clamp(11rem, 24vw, 15rem);
        text-decoration: none;
        will-change: transform;
        cursor: pointer;
      }
      #theme-circlelife .cl-wheel-viewport.is-dragging {
        cursor: grabbing;
        user-select: none;
      }
      #theme-circlelife .cl-wheel-viewport.is-dragging .cl-wheel-card {
        pointer-events: none;
      }
      #theme-circlelife .cl-wheel-stack {
        position: relative;
        display: block;
        width: 100%;
        height: clamp(9.5rem, 20vw, 11.5rem);
      }
      /* 叠卡位姿/阴影照抄影集书架（原比例 contain，永不裁切） */
      #theme-circlelife .cl-wheel-shot {
        position: absolute;
        left: 50%;
        top: 50%;
        width: auto;
        height: auto;
        max-width: 78%;
        max-height: 92%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--cl-text) 10%, transparent),
          0 10px 28px color-mix(in srgb, var(--cl-text) 12%, transparent);
        transform-origin: center center;
        transition:
          transform 0.25s var(--cl-ease),
          opacity 0.2s ease;
      }
      html.dark #theme-circlelife .cl-wheel-shot {
        box-shadow:
          0 0 0 1px color-mix(in srgb, #fff 14%, transparent),
          0 10px 28px rgba(0, 0, 0, 0.5);
      }
      #theme-circlelife .cl-wheel-shot--0 {
        transform: translate(-50%, -50%) rotate(-2deg);
      }
      #theme-circlelife .cl-wheel-shot--1 {
        transform: translate(-58%, -54%) rotate(-8deg);
        opacity: 0.92;
      }
      #theme-circlelife .cl-wheel-shot--2 {
        transform: translate(-40%, -48%) rotate(7deg);
        opacity: 0.88;
      }
      #theme-circlelife .cl-wheel-card:hover .cl-wheel-shot--0 {
        transform: translate(-50%, -52%) rotate(-1deg);
      }
      #theme-circlelife .cl-wheel-card:hover .cl-wheel-shot--1 {
        transform: translate(-62%, -56%) rotate(-10deg);
      }
      #theme-circlelife .cl-wheel-card img {
        -webkit-user-drag: none;
      }
      #theme-circlelife .cl-wheel-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.55rem 0.15rem 0;
        text-align: left;
      }
      #theme-circlelife .cl-wheel-name {
        font-family: var(--cl-font-display);
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.25;
        color: var(--cl-text);
        text-wrap: balance;
      }
      #theme-circlelife .cl-wheel-meta-line {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        color: var(--cl-faint);
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
