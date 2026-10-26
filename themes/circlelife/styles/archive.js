/**
 * Circle of Life — archive：归档页刊头、分类轨道、标签索引与编辑部式时间线
 */
export const archiveStyle = `
      #theme-circlelife .cl-archive-page {
        --cl-archive-date-col: 3.4rem;
        width: 100%;
        max-width: var(--cl-wide-max);
        min-width: 0;
        margin-inline: auto;
        /* 顶部间距自持（--cl-mast-top）：与影集页刊头落在同一条基线上，
           两页刊头切页不跳位。归档页已退出 #container-inner 的通用导航避让 */
        padding: var(--cl-mast-top) var(--cl-wide-pad) 0;
      }

      /* —— Archive mast：排版统一走 styles/mast.js 的 cl-page-mast--section，
             此处只保留归档专属的暖金竖线（styles/mast.js 内已声明） —— */

      /* —— 分类轨道（Category track）——
             形态与影集页标签栏完全一致，样式统一走 styles/filterTrack.js 的
             .cl-cat-track*（唯一真源），此处不再重复实现。 —— */

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
        /* 手机默认：标签索引收成窄条（面板隐藏、窄条显示）。
           博主 2026-10 要求「手机端默认收缩」；显式展开时才由 JS 挂 .is-expanded，
           服务端与客户端输出一致，不存在 hydration 不匹配。 */
        #theme-circlelife .cl-archive-tagindex .cl-archive-tagindex__panel {
          display: none;
        }
        #theme-circlelife .cl-archive-tagindex .cl-archive-tagbar {
          display: block;
        }
        #theme-circlelife .cl-archive-tagindex.is-expanded
          .cl-archive-tagindex__panel {
          display: block;
        }
        #theme-circlelife .cl-archive-tagindex.is-expanded .cl-archive-tagbar {
          display: none;
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
