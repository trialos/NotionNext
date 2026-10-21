/**
 * Circle of Life — archive：归档页刊头、分类轨道、标签索引与编辑部式时间线
 */
export const archiveStyle = `
      #theme-circlelife .cl-archive-page {
        --cl-archive-date-col: 3.4rem;
        --cl-archive-underline: 2px;
        width: 100%;
        max-width: var(--cl-wide-max);
        min-width: 0;
        margin-inline: auto;
        padding: 2rem var(--cl-wide-pad) 0;
      }

      /* —— Archive mast（结构对齐影集刊头，竖线固定暖金橙） —— */
      #theme-circlelife .cl-page-mast--archive {
        margin: 0 0 1.35rem;
        padding: 0.15rem 0 0.15rem 0.85rem;
        border-left: 2px solid var(--cl-gold);
      }
      #theme-circlelife .cl-page-mast--archive .cl-page-mast-inner {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      #theme-circlelife .cl-page-mast--archive .cl-page-mast-kicker {
        margin: 0;
        font-family: var(--cl-font-mono);
        font-size: 0.6875rem;
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--cl-muted);
        line-height: 1;
      }
      #theme-circlelife .cl-page-mast--archive .cl-page-mast-title {
        margin: 0;
        font-family: var(--cl-font-display);
        font-size: clamp(1.75rem, 3.6vw, 2.4rem);
        font-weight: 600;
        letter-spacing: -0.025em;
        line-height: 1.2;
        color: var(--cl-text);
        text-wrap: balance;
      }

      /* —— Category track —— */
      #theme-circlelife .cl-archive-cats {
        min-width: 0;
        margin: 0 0 0.85rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-archive-cats__row {
        display: flex;
        align-items: stretch;
        gap: 1.5rem;
        min-width: 0;
      }
      #theme-circlelife .cl-archive-cats__track {
        display: flex;
        flex: 1 1 auto;
        align-items: stretch;
        gap: clamp(1.1rem, 2.8vw, 1.9rem);
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        margin: 0 -0.35rem;
        padding: 0.25rem 0.35rem 0;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      #theme-circlelife .cl-archive-cats__range {
        display: none;
        flex: none;
        align-self: center;
        font-family: var(--cl-font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.06em;
        color: var(--cl-faint);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-archive-cats__track::-webkit-scrollbar {
        display: none;
      }
      #theme-circlelife .cl-archive-cat {
        position: relative;
        display: inline-flex;
        flex: 0 0 auto;
        align-items: flex-start;
        gap: 0.18rem;
        min-height: 2.5rem;
        padding: 0.3rem 0 0.72rem;
        border: 0;
        background: transparent;
        color: var(--cl-muted);
        font-family: var(--cl-font-display);
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: 1.2;
        cursor: pointer;
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-archive-cat:hover,
      #theme-circlelife .cl-archive-cat[aria-pressed='true'] {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-cat::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: var(--cl-archive-underline);
        background: var(--cl-accent);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.2s var(--cl-ease);
      }
      #theme-circlelife .cl-archive-cat[aria-pressed='true']::after {
        transform: scaleX(1);
      }
      #theme-circlelife .cl-archive-cat__count {
        margin-top: 0.02rem;
        font-family: var(--cl-font-mono);
        font-size: 0.6rem;
        font-weight: 500;
        line-height: 1;
        letter-spacing: 0;
        color: var(--cl-faint);
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife
        .cl-archive-cat[aria-pressed='true']
        .cl-archive-cat__count {
        color: var(--cl-accent);
      }

      /* —— Filter body / tag rail —— */
      #theme-circlelife .cl-archive-body {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 1.5rem;
        align-items: start;
      }
      #theme-circlelife .cl-archive-main {
        min-width: 0;
      }

      /* —— Tag index —— */
      #theme-circlelife .cl-archive-tagindex {
        margin: 0;
      }
      #theme-circlelife .cl-archive-tagindex__panel {
        padding: 0.85rem 0.95rem 0.55rem;
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius-sm);
        background: var(--cl-surface);
      }
      #theme-circlelife .cl-archive-tagindex__head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.15rem;
        padding-bottom: 0.55rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-archive-tagindex__title {
        min-width: 0;
        margin: 0;
        font-family: var(--cl-font-mono);
        font-size: 0.66rem;
        font-weight: 500;
        letter-spacing: 0.14em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-archive-tagindex__collapse {
        display: none;
        flex: none;
        margin-left: auto;
        padding: 0.45rem 0.1rem;
        border: 0;
        background: transparent;
        font-family: var(--cl-font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.04em;
        color: var(--cl-accent);
        cursor: pointer;
      }
      #theme-circlelife .cl-archive-taggrid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        column-gap: 2rem;
      }
      #theme-circlelife .cl-archive-tagrow {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        width: 100%;
        min-height: 2.75rem;
        padding: 0.35rem 0;
        border: 0;
        border-radius: 2px;
        background: transparent;
        text-align: left;
        cursor: pointer;
        color: var(--cl-muted);
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-archive-tagrow__dot {
        flex: none;
        width: 5px;
        height: 5px;
        border: 1px solid var(--cl-border-strong);
        border-radius: 9999px;
        background: transparent;
        transition:
          background 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-archive-tagrow__label {
        flex: none;
        max-width: 70%;
        font-family: var(--cl-font-body);
        font-size: 0.88rem;
        line-height: 1.35;
      }
      #theme-circlelife .cl-archive-tagrow__leader {
        flex: 1 1 auto;
        min-width: 0.75rem;
        border-bottom: 1px dotted var(--cl-border-strong);
        transform: translateY(0.15em);
        transition: border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-archive-tagrow__count {
        flex: none;
        font-family: var(--cl-font-mono);
        font-size: 0.66rem;
        letter-spacing: 0.02em;
        color: var(--cl-faint);
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-archive-tagrow:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-tagrow:hover .cl-archive-tagrow__dot {
        border-color: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-tagrow[aria-pressed='true'] {
        color: var(--cl-accent);
        font-weight: 600;
      }
      #theme-circlelife
        .cl-archive-tagrow[aria-pressed='true']
        .cl-archive-tagrow__dot {
        border-color: var(--cl-accent);
        background: var(--cl-accent);
      }
      #theme-circlelife
        .cl-archive-tagrow[aria-pressed='true']
        .cl-archive-tagrow__leader {
        border-bottom-color: color-mix(
          in srgb,
          var(--cl-accent) 45%,
          transparent
        );
      }
      #theme-circlelife
        .cl-archive-tagrow[aria-pressed='true']
        .cl-archive-tagrow__count {
        color: var(--cl-accent);
      }
      #theme-circlelife
        .cl-archive-tagrow--all
        .cl-archive-tagrow__label {
        color: var(--cl-text);
      }
      #theme-circlelife
        .cl-archive-tagrow--all[aria-pressed='true']
        .cl-archive-tagrow__label {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-taghint {
        padding: 0.55rem 0 0.25rem;
        font-family: var(--cl-font-mono);
        font-size: 0.66rem;
        color: var(--cl-faint);
      }

      /* Mobile collapsed index */
      #theme-circlelife .cl-archive-tagbar {
        display: none;
      }
      #theme-circlelife .cl-archive-tagbar__inner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 2.75rem;
        padding: 0.2rem 0.85rem;
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius-sm);
        background: var(--cl-surface);
      }
      #theme-circlelife .cl-archive-tagbar__label {
        flex: none;
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-archive-tagbar__value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-tagbar__actions {
        display: flex;
        flex: none;
        align-items: center;
        gap: 0.7rem;
        margin-left: auto;
      }
      #theme-circlelife .cl-archive-tagbar__actions button {
        min-height: 2.75rem;
        padding: 0.5rem 0.1rem;
        border: 0;
        background: transparent;
        font-family: var(--cl-font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.04em;
        color: var(--cl-accent);
        cursor: pointer;
      }
      #theme-circlelife .cl-archive-tagbar__actions button.is-muted {
        color: var(--cl-muted);
      }

      /* —— Stage status —— */
      #theme-circlelife .cl-archive-stage {
        min-width: 0;
      }
      #theme-circlelife .cl-archive-stage__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 0.6rem 0;
        border-top: 1px solid var(--cl-border);
        border-bottom: 1px solid var(--cl-border);
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.04em;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-archive-stage__label {
        min-width: 0;
      }
      #theme-circlelife .cl-archive-stage__label strong {
        font-weight: 500;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-archive-stage__count {
        flex: none;
        color: var(--cl-faint);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }

      /* —— Timeline —— */
      #theme-circlelife .cl-archive-section {
        scroll-margin-top: 5rem;
      }
      #theme-circlelife .cl-archive-section + .cl-archive-section {
        margin-top: 2.35rem;
      }
      #theme-circlelife .cl-archive-month {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        margin: 0 0 0.25rem;
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        font-weight: 500;
        letter-spacing: 0.12em;
        color: var(--cl-faint);
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-archive-month::before {
        content: '';
        flex: none;
        width: 5px;
        height: 5px;
        background: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-month::after {
        content: '';
        flex: 1 1 auto;
        height: 1px;
        margin-left: 0.15rem;
        background: var(--cl-border);
      }
      #theme-circlelife .cl-archive-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      #theme-circlelife .cl-archive-row {
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-archive-row:last-child {
        border-bottom: 0;
      }
      #theme-circlelife .cl-archive-entry {
        display: grid;
        grid-template-columns: var(--cl-archive-date-col) minmax(0, 1fr);
        column-gap: 0.8rem;
        row-gap: 0.28rem;
        align-items: start;
        padding: 0.95rem 0;
      }
      #theme-circlelife .cl-archive-date {
        grid-column: 1;
        grid-row: 1;
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        line-height: 1.5;
        color: var(--cl-faint);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-archive-title-wrap {
        grid-column: 2;
        grid-row: 1;
        min-width: 0;
        margin: 0;
      }
      #theme-circlelife .cl-archive-meta {
        display: flex;
        flex-wrap: wrap;
        grid-column: 2;
        grid-row: 2;
        align-items: center;
        gap: 0.3rem 0.6rem;
        min-width: 0;
      }
      #theme-circlelife .cl-archive-entry-cat {
        display: inline-flex;
        align-items: center;
        padding: 0.08rem 0.42rem;
        border: 1px solid var(--cl-border);
        border-radius: 2px;
        background: color-mix(in srgb, var(--cl-paper-2) 55%, transparent);
        font-family: var(--cl-font-mono);
        font-size: 0.6rem;
        letter-spacing: 0.02em;
        color: var(--cl-muted);
        white-space: nowrap;
      }
      #theme-circlelife .cl-archive-tag {
        max-width: 100%;
        font-family: var(--cl-font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.02em;
        color: var(--cl-faint);
        overflow-wrap: anywhere;
      }
      #theme-circlelife .cl-archive-tag.is-active {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-archive-empty {
        margin: 2rem 0;
        padding: 1.35rem 0;
        border-top: 1px solid var(--cl-border);
        border-bottom: 1px solid var(--cl-border);
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        color: var(--cl-faint);
        text-align: center;
      }

      @media (min-width: 768px) {
        #theme-circlelife .cl-archive-page {
          --cl-archive-date-col: 4.25rem;
        }
        #theme-circlelife .cl-archive-tagindex__panel {
          padding: 1.05rem 1.2rem 0.8rem;
        }
        #theme-circlelife .cl-archive-entry {
          grid-template-columns: var(--cl-archive-date-col) minmax(0, 1fr) auto;
          column-gap: 1rem;
          align-items: baseline;
        }
        #theme-circlelife .cl-archive-meta {
          grid-column: 3;
          grid-row: 1;
          max-width: 17rem;
          align-self: start;
          justify-content: flex-end;
        }
      }

      @media (min-width: 768px) and (max-width: 1279px) {
        #theme-circlelife .cl-archive-taggrid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (min-width: 1024px) {
        #theme-circlelife .cl-archive-cats__range {
          display: inline-flex;
        }
        #theme-circlelife .cl-archive-page {
          --cl-archive-date-col: 4.75rem;
        }
        #theme-circlelife .cl-archive-entry {
          padding: 1.05rem 0;
        }
        #theme-circlelife .cl-archive-main .cl-post-title {
          font-size: 1.08rem;
        }
        #theme-circlelife .cl-archive-meta {
          max-width: 20rem;
        }
      }

      @media (min-width: 1280px) {
        #theme-circlelife .cl-archive-body {
          grid-template-columns: minmax(17rem, 20rem) minmax(0, 1fr);
          column-gap: var(--cl-wide-gap);
        }
        #theme-circlelife .cl-archive-rail {
          position: sticky;
          top: calc(var(--cl-nav-band) + 1.5rem);
          align-self: start;
          min-width: 0;
        }
        #theme-circlelife .cl-archive-rail .cl-archive-tagindex__panel {
          max-height: calc(100vh - var(--cl-nav-band) - 4rem);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--cl-border-strong) transparent;
        }
        #theme-circlelife .cl-archive-taggrid {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      @media (max-width: 767px) {
        #theme-circlelife .cl-archive-cats {
          position: relative;
        }
        #theme-circlelife .cl-archive-cats::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 1px;
          width: 1.35rem;
          pointer-events: none;
          background: linear-gradient(to right, transparent, var(--cl-bg));
        }
        #theme-circlelife .cl-archive-cats__track {
          padding-right: 1.35rem;
        }
        #theme-circlelife .cl-archive-tagindex.is-collapsed
          .cl-archive-tagindex__panel {
          display: none;
        }
        #theme-circlelife .cl-archive-tagindex.is-collapsed
          .cl-archive-tagbar {
          display: block;
        }
        #theme-circlelife .cl-archive-tagindex__collapse {
          display: inline-flex;
        }
      }

      @media (max-width: 640px) {
        #theme-circlelife .cl-archive-stage__head {
          font-size: 0.64rem;
        }
      }

      /* 宽屏归档：返回顶部贴宽容器内容右缘，而不是按 48rem 旧列表宽度 */
      @media (min-width: 768px) {
        #theme-circlelife.cl-is-archive .cl-backtop {
          right: max(
            calc(var(--cl-wide-pad) + 0.5rem),
            calc(
              (100vw - var(--cl-wide-max)) / 2 + var(--cl-wide-pad) + 0.5rem
            )
          );
        }
      }
`
