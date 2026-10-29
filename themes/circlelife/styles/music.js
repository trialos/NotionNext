/**
 * Circle of Life — music：唱片展架 / 专辑页 D2 / 音乐手记
 *
 * 量值来自已定稿的静态原型 design/music-shelf-concept.html（展架 A · 专辑页 D2 · 墨蓝）。
 * 几何全部收在 .cl-music-page 顶部这一组 --cl-music-* token 里，断点里只改 token，
 * 不在各处重复写像素（与归档/影集同一纪律）。
 *
 * 强调色 --cl-music 定义在 styles/tokens.js（浅 #2e4a5a / 深 #8fa9b8）；
 * 焦点环仍用全站朱砂 --cl-accent —— 焦点是「可操作」而不是「这是音乐」。
 */
export const musicStyle = `
      /* —— 页面外壳：宽屏容器 + 自持顶部间距（刊头基线全站统一走 --cl-mast-top）—— */
      #theme-circlelife .cl-music-page {
        /* 小标签唯一字号源：表头、序号、时长、外链、事实行都走它。
           原型里这些是 8–9px 的装饰性小字，落到中文页面上就是"好看但读不动" */
        --cl-music-micro: 0.75rem;
        /* 正文级小字（描述、摘要）：不得低于 micro，桌面比 micro 再大一档 */
        --cl-music-body: 0.8125rem;
        /* 间距阶梯：重复出现的像素值走 token，一次性数值仍写在规则里 */
        --cl-music-space-xs: 4px;
        --cl-music-space-sm: 8px;
        --cl-music-space-md: 12px;
        --cl-music-space-lg: 16px;
        --cl-music-space-xl: 20px;
        --cl-music-space-2xl: 24px;
        --cl-music-grid-cols: 2;
        --cl-music-grid-gap: 18px 14px;
        --cl-music-band-cols: 4;
        --cl-music-track-cover: 40px;
        --cl-music-track-cols: var(--cl-music-track-cover) 24px minmax(0, 1fr) 84px 34px 70px;
        --cl-music-track-gap: 6px;
        --cl-music-track-pad: 9px;
        --cl-music-hero-cover: 240px;
        --cl-music-hero-gap: 16px;
        --cl-music-hero-title: 2rem;
        --cl-music-note-cover: 56px;
        --cl-music-note-title: 1.9rem;
        --cl-music-sleeve-mark: 0.85rem;
        --cl-music-section-gap: 16px;
        width: 100%;
        max-width: var(--cl-wide-max);
        min-width: 0;
        margin-inline: auto;
        padding: var(--cl-mast-top) var(--cl-wide-pad) 0;
      }

      /* —— 封面框：比例由框决定，图/占位一律绝对铺满 —— */
      #theme-circlelife .cl-music-card-cover,
      #theme-circlelife .cl-music-hero-cover,
      #theme-circlelife .cl-music-track-cover,
      #theme-circlelife .cl-music-note-cover {
        position: relative;
        display: block;
        overflow: hidden;
        aspect-ratio: 1 / 1;
        background: var(--cl-paper-2);
        border: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-music-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* 占位唱片的套面配色：这是设计件，纸色体系里没有对应色，故成组定义在本模块内 */
      #theme-circlelife .cl-music-sleeve {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: var(--cl-music-sleeve-bg, #1f2a30);
        color: var(--cl-music-sleeve-fg, #f0e9dc);
      }
      #theme-circlelife .cl-music-sleeve-mark {
        font-family: var(--cl-font-display);
        font-size: var(--cl-music-sleeve-mark);
        line-height: 1;
      }
      #theme-circlelife .cl-music-sleeve--ink {
        --cl-music-sleeve-bg: #1f2a30;
        --cl-music-sleeve-fg: #f0e9dc;
      }
      #theme-circlelife .cl-music-sleeve--plum {
        --cl-music-sleeve-bg: #4a3038;
        --cl-music-sleeve-fg: #f0e2e6;
      }
      #theme-circlelife .cl-music-sleeve--rust {
        --cl-music-sleeve-bg: #5a3a2e;
        --cl-music-sleeve-fg: #f3e8dc;
      }
      #theme-circlelife .cl-music-sleeve--olive {
        --cl-music-sleeve-bg: #3f4636;
        --cl-music-sleeve-fg: #eef0e4;
      }
      #theme-circlelife .cl-music-sleeve--sand {
        --cl-music-sleeve-bg: #c9b99e;
        --cl-music-sleeve-fg: #20190f;
      }

      /* —— 展架 A：唱片墙 —— */
      #theme-circlelife .cl-music-grid {
        display: grid;
        grid-template-columns: repeat(var(--cl-music-grid-cols), minmax(0, 1fr));
        gap: var(--cl-music-grid-gap);
        padding-top: var(--cl-music-space-xl);
      }
      #theme-circlelife .cl-music-card-title {
        margin: var(--cl-music-space-sm) 0 3px;
        font-family: var(--cl-font-display);
        font-size: 0.92rem;
        font-weight: 600;
        line-height: 1.35;
        letter-spacing: -0.01em;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-music-card-title a {
        color: inherit;
      }
      #theme-circlelife .cl-music-card-meta {
        margin: 0;
        font-size: var(--cl-music-micro);
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-card-foot {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: var(--cl-music-space-xs);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-kind {
        text-transform: uppercase;
      }
      #theme-circlelife .cl-music-kind--album {
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-kind--single,
      #theme-circlelife .cl-music-kind--playlist {
        color: var(--cl-music);
      }

      /* —— 年份带：年度歌单单独一排，卡面只写年份 —— */
      #theme-circlelife .cl-music-band {
        margin-top: 22px;
      }
      #theme-circlelife .cl-music-band-head {
        display: flex;
        align-items: baseline;
        gap: 10px;
        margin: 0 0 10px;
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-band-title {
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-band-grid {
        display: grid;
        grid-template-columns: repeat(var(--cl-music-band-cols), minmax(0, 1fr));
        gap: var(--cl-music-grid-gap);
      }
      #theme-circlelife .cl-music-card--year .cl-music-card-title {
        margin-top: 6px;
        font-family: var(--cl-font-mono);
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.04em;
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-music-mark {
        display: inline-flex;
        align-items: center;
        gap: var(--cl-music-space-xs);
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-mark::before {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--cl-music);
      }

      /* 网易云外链：卡片脚靠 margin-left:auto 顶到右端，曲目行由 .cl-music-ncm--icon 复位 */
      /* 文字形态 = 真按钮：朱砂（全站的"可点"色），和墨蓝的模块色分工。
         曲目行那个图标形态另算：十二条朱砂箭头会把曲目表变成红灯区，
         它保持安静色、悬停才亮。 */
      #theme-circlelife .cl-music-ncm {
        margin-left: auto;
        /* 触控热区：文字形态本身高不过 18px，靠上下 padding 补到 24px 以上。
           用 padding 而不是 min-height —— 行内盒加纵向 padding 不改文字基线，
           条目页页脚那行「← 唱片」与「曲目同步于…」的基线仍然对齐（Δ=0）。 */
        padding-block: var(--cl-music-space-xs);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.04em;
        color: var(--cl-accent);
        white-space: nowrap;
        transition: color var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-music-ncm:hover {
        color: var(--cl-accent-press);
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      #theme-circlelife .cl-music-ncm--icon {
        margin-left: 0;
        padding-block: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.9rem;
        /* 触控目标 ≥44px：图标本身只有两字符宽，热区靠这里补足 */
        min-height: 2.75rem;
        /* 曲目行的箭头保持安静色，悬停才亮成朱砂（十二条常亮会盖过曲目名） */
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-ncm--icon:hover {
        color: var(--cl-accent);
        text-decoration: none;
      }

      #theme-circlelife .cl-music-empty,
      #theme-circlelife .cl-music-tracks-empty {
        margin: var(--cl-music-space-xl) 0 0;
        padding: 1.4rem 1rem;
        border: 1px dashed var(--cl-border-strong);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.04em;
        line-height: 1.7;
        color: var(--cl-muted);
        text-align: center;
      }
      #theme-circlelife .cl-music-empty code {
        color: var(--cl-music);
      }

      /* —— 专辑页 D2：大封面 hero —— */
      #theme-circlelife .cl-music-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--cl-music-hero-gap);
        align-items: center;
      }
      #theme-circlelife .cl-music-hero-cover {
        width: var(--cl-music-hero-cover);
        max-width: 100%;
      }
      #theme-circlelife .cl-music-hero-main {
        min-width: 0;
      }
      #theme-circlelife .cl-music-back {
        display: inline-block;
        /* 触控热区同外链：文字形态本体 20px 高，补到 24px 以上（不改基线） */
        padding-block: var(--cl-music-space-xs);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.08em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-back:hover {
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-kicker {
        margin: 10px 0 0;
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        font-weight: 500;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--cl-music);
        line-height: 1;
      }
      #theme-circlelife .cl-music-title {
        margin: 10px 0 0;
        font-family: var(--cl-font-display);
        font-size: var(--cl-music-hero-title);
        font-weight: 600;
        line-height: 1.15;
        letter-spacing: -0.03em;
        color: var(--cl-text);
        text-wrap: balance;
      }
      #theme-circlelife .cl-music-meta {
        margin: var(--cl-music-space-sm) 0 0;
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.04em;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-desc {
        margin: var(--cl-music-space-md) 0 0;
        max-width: 46ch;
        font-size: var(--cl-music-body);
        line-height: 1.75;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-album-desc {
        margin: 10px 0 0;
        max-width: 52ch;
        font-size: var(--cl-music-body);
        line-height: 1.8;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-facts {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cl-music-space-xs) 14px;
        margin-top: var(--cl-music-space-md);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-actions {
        margin-top: 14px;
      }
      #theme-circlelife .cl-music-actions .cl-music-ncm {
        margin-left: 0;
        font-size: var(--cl-music-micro);
      }

      /* 专辑手记条：一行式，把最新的专辑手记挂在 hero 与曲目表之间 */
      #theme-circlelife .cl-music-note-strip {
        display: flex;
        align-items: flex-start;
        gap: var(--cl-music-space-sm);
        margin-top: var(--cl-music-section-gap);
        padding: var(--cl-music-space-md);
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
        flex-wrap: wrap;
      }
      #theme-circlelife .cl-music-note-strip .cl-music-kicker {
        margin: 2px 0 0;
        white-space: nowrap;
      }
      #theme-circlelife .cl-music-note-strip-main {
        flex: 1 1 12rem;
        min-width: 0;
      }
      #theme-circlelife .cl-music-note-strip-title {
        margin: 0 0 var(--cl-music-space-xs);
        font-family: var(--cl-font-display);
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.35;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-music-note-strip-title a {
        color: inherit;
      }
      #theme-circlelife .cl-music-note-strip-title a:hover {
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-note-strip-text {
        margin: 0;
        font-size: var(--cl-music-body);
        line-height: 1.7;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-note-strip-cta {
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-music);
        white-space: nowrap;
      }

      /* —— 曲目表：真 table（列头是 th，屏幕阅读器能读到列语境）——
         视觉仍是网格：表格元素转 block，行做 grid，列宽走同一组 token */
      #theme-circlelife .cl-music-track-table {
        display: block;
        width: 100%;
        border-collapse: collapse;
      }
      #theme-circlelife .cl-music-track-table thead,
      #theme-circlelife .cl-music-track-table tbody {
        display: block;
      }
      #theme-circlelife .cl-music-track-head,
      #theme-circlelife .cl-music-track {
        display: grid;
        grid-template-columns: var(--cl-music-track-cols);
        gap: var(--cl-music-track-gap);
        align-items: center;
      }
      #theme-circlelife .cl-music-track-head th {
        margin: 0;
        padding: 0;
        font-weight: inherit;
        text-align: left;
      }
      #theme-circlelife .cl-music-track-head {
        padding-bottom: var(--cl-music-space-sm);
        border-bottom: 1px solid var(--cl-border-strong);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-track {
        padding: var(--cl-music-track-pad) 0;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-music-track-cover {
        width: var(--cl-music-track-cover);
        height: var(--cl-music-track-cover);
      }
      #theme-circlelife .cl-music-track-no {
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        color: var(--cl-faint);
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-music-track-title {
        min-width: 0;
        font-family: var(--cl-font-display);
        font-size: 0.88rem;
        color: var(--cl-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #theme-circlelife .cl-music-track-title a {
        color: inherit;
      }
      #theme-circlelife .cl-music-track-title a:hover {
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-track-artist {
        font-size: var(--cl-music-micro);
        color: var(--cl-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #theme-circlelife .cl-music-track-dur {
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        color: var(--cl-faint);
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      #theme-circlelife .cl-music-track-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--cl-music-track-gap);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
      }
      #theme-circlelife .cl-music-track-note {
        color: var(--cl-music);
        white-space: nowrap;
      }
      #theme-circlelife .cl-music-track-note:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      #theme-circlelife .cl-music-truncated {
        margin: 10px 0 0;
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.04em;
        color: var(--cl-faint);
      }
      /* 条目页页脚：左「← 唱片」右「曲目同步于…」，与手记页页脚同构 */
      #theme-circlelife .cl-music-foot {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--cl-music-space-sm);
        flex-wrap: wrap;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-music-synced {
        margin: var(--cl-music-space-md) 0 0;
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }

      /* —— 手记页 —— */
      #theme-circlelife .cl-music-note-wrap {
        max-width: var(--cl-prose-measure);
        margin: 0 auto;
        padding-bottom: 4rem;
      }
      #theme-circlelife .cl-music-note-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: var(--cl-music-space-xl);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-note-top a {
        color: inherit;
      }
      #theme-circlelife .cl-music-note-top a:hover,
      #theme-circlelife .cl-music-note-meta a:hover,
      #theme-circlelife .cl-music-note-bottom a:hover {
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-note-head {
        display: flex;
        align-items: center;
        gap: var(--cl-music-space-md);
        padding-left: var(--cl-music-space-md);
        border-left: 2px solid var(--cl-music);
      }
      #theme-circlelife .cl-music-note-cover {
        width: var(--cl-music-note-cover);
        height: var(--cl-music-note-cover);
        flex: none;
      }
      #theme-circlelife .cl-music-note-context {
        min-width: 0;
      }
      #theme-circlelife .cl-music-note-context .cl-music-kicker {
        margin-top: 0;
      }
      #theme-circlelife .cl-music-note-song {
        margin: var(--cl-music-space-xs) 0 2px;
        font-family: var(--cl-font-display);
        font-size: 1rem;
        line-height: 1.25;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-music-note-song a {
        color: inherit;
      }
      #theme-circlelife .cl-music-note-song a:hover {
        color: var(--cl-music);
      }
      #theme-circlelife .cl-music-note-meta {
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.04em;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-music-note-meta .cl-music-ncm {
        margin-left: var(--cl-music-space-sm);
      }
      #theme-circlelife .cl-music-note-title {
        margin: var(--cl-music-space-2xl) 0 10px;
        font-family: var(--cl-font-display);
        font-size: var(--cl-music-note-title);
        font-weight: 600;
        line-height: 1.2;
        letter-spacing: -0.03em;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-music-note-sub {
        margin: 0 0 var(--cl-music-space-2xl);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.08em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-note-bottom {
        display: flex;
        flex-direction: column;
        gap: var(--cl-music-space-sm);
        margin-top: 36px;
        padding-top: 18px;
        border-top: 1px solid var(--cl-border);
        font-family: var(--cl-font-mono);
        font-size: var(--cl-music-micro);
        letter-spacing: 0.04em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-music-note-bottom .cl-music-ncm {
        margin-left: 0;
        align-self: flex-start;
      }

      /* —— 焦点环：全站朱砂，不散落模块色 —— */
      #theme-circlelife .cl-music-page a:focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 3px;
      }

      /* —— ≥768px：桌面量值（原型 1440 一版）—— */
      @media (min-width: 768px) {
        #theme-circlelife .cl-music-page {
          --cl-music-micro: 0.8125rem;
          --cl-music-body: 0.875rem;
          --cl-music-grid-cols: 4;
          --cl-music-grid-gap: 20px 22px;
          --cl-music-band-cols: 6;
          --cl-music-track-cover: 44px;
          --cl-music-track-cols: var(--cl-music-track-cover) 32px minmax(0, 1fr) 150px 52px 110px;
          --cl-music-track-gap: 10px;
          --cl-music-track-pad: 10px;
          --cl-music-hero-cover: 420px;
          --cl-music-hero-gap: 44px;
          --cl-music-hero-title: 3.2rem;
          --cl-music-note-cover: 72px;
          --cl-music-note-title: 2.8rem;
          --cl-music-sleeve-mark: 1.15rem;
          --cl-music-section-gap: 24px;
        }
        #theme-circlelife .cl-music-hero {
          grid-template-columns: var(--cl-music-hero-cover) minmax(0, 1fr);
        }
        #theme-circlelife .cl-music-card-title {
          font-size: 1.02rem;
        }
        #theme-circlelife .cl-music-card-foot {
          gap: var(--cl-music-space-sm);
        }
        #theme-circlelife .cl-music-note-strip {
          gap: 14px;
          padding: 14px var(--cl-music-space-lg);
          flex-wrap: nowrap;
        }
        #theme-circlelife .cl-music-note-strip-cta {
          margin-left: auto;
        }
        #theme-circlelife .cl-music-track-title {
          font-size: 1rem;
        }
        #theme-circlelife .cl-music-note-head {
          gap: 18px;
          padding-left: var(--cl-music-space-lg);
        }
        #theme-circlelife .cl-music-note-song {
          font-size: 1.2rem;
        }
        #theme-circlelife .cl-music-note-title {
          margin-top: 34px;
        }
        #theme-circlelife .cl-music-note-sub {
          margin-bottom: 30px;
        }
        #theme-circlelife .cl-music-note-bottom {
          flex-direction: row;
          justify-content: space-between;
        }
        #theme-circlelife .cl-music-note-bottom .cl-music-ncm {
          align-self: auto;
        }
      }

      /* —— ≥1280px：唱片墙满五列 —— */
      @media (min-width: 1280px) {
        #theme-circlelife .cl-music-page {
          --cl-music-grid-cols: 5;
          --cl-music-band-cols: 8;
        }
      }
`
