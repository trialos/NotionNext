/**
 * Circle of Life — 首页下半部：精选文章章
 *
 * 形态（2026-10 落地 · 博主定稿）：
 * - **一窗一屏，滚动换篇**：章节 = 钉住的窗口（sticky, 100svh）+ 一段滚动行程；
 *   用户往下滚时**不推动任何东西**，只推进「当前是第几篇」→ 底部时间轴上的
 *   游标从旧滑到新，文章交叉淡入淡出。6 篇只滚半屏就走完（不是一篇一屏的 6 屏）。
 * - 章节内**不设标题**，只留右上角「全部文章 N 篇 →」一个出口。
 * - **图左文右**（镜像影集段的文左图右）+ **图文整组居中**。
 * - 图版统一 3:4 直角框（与影集展架的直角画册同一纪律），桌面与移动端
 *   **同比例**，只是尺寸不同 → 同一张图在手机和电脑上是同一个构图。
 * - 时间轴：刻度按 publishDay 的真实日距比例分布（真尺子，不是等距装饰）；
 *   游标每帧只写一个 CSS 变量（transform 合成，不触发布局）。
 */
export const homeArticlesStyle = `
  /* —— 首页精选文章章 (HomeArticleStage) —— */
  #theme-circlelife .cl-home-articles {
    /* 每篇占多少视口高度的滚动行程 */
    --cl-home-article-step: 10vh;
    /* 章节总行程 = (篇数 − 1) × 步距 */
    --cl-home-article-sweep: calc(
      (var(--cl-home-article-count, 6) - 1) * var(--cl-home-article-step)
    );
    position: relative;
    /* 章节 = 一窗 + 行程：窗口钉住，滚过行程即换篇 */
    height: calc(100svh + var(--cl-home-article-sweep));
  }

  /* 钉住的窗口：一屏之内的一切 */
  #theme-circlelife .cl-home-articles-panel {
    position: sticky;
    top: 0;
    height: 100svh;
    display: grid;
    /* 显式一列 minmax(0,1fr)：否则标尺（窄屏是 520px 的可滚轴）的最小内容宽
       会把栅格列撑到 520px，窄屏下整块面板溢出屏幕（标题与出口被推出屏外）。 */
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr) auto;
    max-width: var(--cl-wide-max);
    margin-inline: auto;
    /* 章节间距与影集段统一，且至少让开固定导航胶囊 */
    padding: var(--cl-home-section-pad) var(--cl-wide-pad) 1rem;
    overflow: hidden;
  }

  /* 顶部：只有右侧一个出口（与影集段同形） */
  #theme-circlelife .cl-home-articles-top {
    display: flex;
    justify-content: flex-end;
    /* 章节退场时面板整体上移，这个出口会从固定导航胶囊底下穿过 →
       退场即淡出，不留「半截字压在胶囊上」的瞬间。 */
    transition: opacity 0.22s var(--cl-ease);
  }
  #theme-circlelife .cl-home-articles-panel.is-released .cl-home-articles-top {
    opacity: 0;
  }

  /* —— 段头出口：两段共用同一个类（精选文章 / 精选影集）——
     同一副骨架的前提：两段的段头长得一模一样，只有右侧一个链接。 */
  #theme-circlelife .cl-home-sec-link {
    font-family: var(--cl-font-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: var(--cl-muted);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--cl-dur) var(--cl-ease);
  }
  #theme-circlelife .cl-home-sec-link:hover {
    color: var(--cl-accent);
  }

  /* 文章层：全部叠在同一格里，靠 opacity 交叉淡入换篇 */
  #theme-circlelife .cl-home-articles-stage {
    position: relative;
    min-height: 0;
  }
  #theme-circlelife .cl-home-article {
    position: absolute;
    inset: 0;
    display: grid;
    /* 图版贴左边缘 / 文字栏贴右边缘（margin-left:auto）→ 横向 footprint
       与影集段完全一致（@1440：48 → 1392），两段的空间感不再断崖。 */
    grid-template-columns: var(--cl-home-article-plate) minmax(0, 1fr);
    gap: var(--cl-wide-gap);
    align-items: center;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity var(--cl-home-switch) var(--cl-ease),
      visibility 0s linear var(--cl-home-switch);
  }
  /* 上一档：留在下面淡出，避免新一档凭空出现 */
  #theme-circlelife .cl-home-article.is-prev {
    opacity: 0;
    visibility: visible;
    z-index: 1;
    transition: opacity var(--cl-home-switch) var(--cl-ease),
      visibility 0s;
  }
  #theme-circlelife .cl-home-article.is-active {
    opacity: 1;
    visibility: visible;
    z-index: 2;
    pointer-events: auto;
    transition: opacity var(--cl-home-switch) var(--cl-ease),
      visibility 0s;
  }

  /* 图版：3:4 直角框。img 必须绝对定位 —— 否则 height:100% 的子元素
     会把 aspect-ratio 顶掉（框被内容撑成方形，构图在两端就不一致了） */
  #theme-circlelife .cl-home-article-plate {
    margin: 0;
  }
  #theme-circlelife .cl-home-article-plate-frame {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--cl-paper-2);
  }
  #theme-circlelife .cl-home-article-plate-frame img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
  /* 图版下面不再重复「分类 · 日期」——文字区的 meta 行已经有一份。
     （博主指出重复：图版题注与文章 meta 是同一组信息，摆两遍是噪音。） */

  /* 文字栏：贴右边缘 → 与影集段的「文字块在右」同位，图与文之间留出一段大气隙，
     两段的横向 footprint 完全一致。

     ⚠️ 宽度必须写成**定值**（width: min(100%, 测量宽)），不能只写 max-width：
     只写 max-width 时，grid 项的宽度是 fit-content（且 margin-left:auto 会让
     stretch 失效）→ 摘要短的篇目收缩成窄块，margin-left:auto 把整块顶到右缘，
     **标题左边缘随标题长度漂移**。实测 @1440：《罪与罚》观后感左缘 1000、
     谈孤独 1077，其余四篇 762 —— 同一段里两篇明显右飘。
     定宽后六篇左边缘完全一致（桌面同为 762 = 右缘 1382 − 620）。 */
  #theme-circlelife .cl-home-article-body {
    width: min(100%, var(--cl-home-article-measure));
    margin-left: auto;
  }

  /* 文字栏 */
  #theme-circlelife .cl-home-article-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.4rem;
    font-family: var(--cl-font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.13em;
    color: var(--cl-muted);
  }
  #theme-circlelife .cl-home-article-meta .is-accent {
    color: var(--cl-accent);
  }
  #theme-circlelife .cl-home-article-title {
    margin: 0;
    font-family: var(--cl-font-display);
    font-size: clamp(2.1rem, 3.4vw, 3.35rem);
    font-weight: 600;
    /* 1.28：与文章页 .cl-article-title 同值 —— 1.16 在中英混排时会压行
       （思源宋体的字面高度大于西文行盒） */
    line-height: 1.28;
    letter-spacing: -0.025em;
    color: var(--cl-text);
    text-wrap: balance;
  }
  #theme-circlelife .cl-home-article-title a {
    transition: color 0.15s var(--cl-ease);
  }
  #theme-circlelife .cl-home-article-title a:hover {
    color: var(--cl-accent);
  }
  #theme-circlelife .cl-home-article-rule {
    display: block;
    width: 44px;
    height: 1px;
    background: var(--cl-accent);
    margin: 1.85rem 0 1.6rem;
  }
  #theme-circlelife .cl-home-article-summary {
    margin: 0;
    max-width: var(--cl-home-article-measure);
    color: var(--cl-muted);
    font-size: 1.06rem;
    line-height: 1.85;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  #theme-circlelife .cl-home-article-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 2.2rem;
    font-size: 0.95rem;
    color: var(--cl-text);
  }
  #theme-circlelife .cl-home-article-cta-bar {
    display: block;
    width: 26px;
    height: 1px;
    background: var(--cl-accent);
    transition: width 0.25s var(--cl-ease);
  }
  #theme-circlelife .cl-home-article-cta:hover .cl-home-article-cta-bar {
    width: 40px;
  }

  /* —— 时间轴（窗口底部）——
     刻度按真实日距分布；游标随滚动连续移动，文章随之换档。 */
  #theme-circlelife .cl-home-articles-ruler {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    /* 满内容宽（与影集段 body 同宽）→ 两段的横向骨架一致 */
    width: 100%;
  }
  #theme-circlelife .cl-home-articles-ruler-scroll {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }
  #theme-circlelife .cl-home-articles-ruler-scroll::-webkit-scrollbar {
    display: none;
  }
  #theme-circlelife .cl-home-articles-ruler-axis {
    position: relative;
    height: 24px;
    min-width: 100%;
    border-top: 1px solid var(--cl-border-strong);
  }
  #theme-circlelife .cl-home-articles-tick {
    position: absolute;
    top: 0;
    left: var(--tick-x, 0%);
    width: 0;
  }
  #theme-circlelife .cl-home-articles-tick i {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 7px;
    background: var(--cl-border-strong);
    transform: translateX(-50%);
  }
  #theme-circlelife .cl-home-articles-tick span {
    position: absolute;
    left: 0;
    top: 12px;
    transform: translateX(-50%);
    font-family: var(--cl-font-mono);
    font-size: 0.65rem;
    line-height: 1;
    letter-spacing: 0.06em;
    color: var(--cl-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    transition: color var(--cl-home-switch) var(--cl-ease);
  }
  /* 端点标签贴边，避免半个标签跑出轴外。
     DOM 里最旧的排在最前（= 轴的最左端），最新的排在最后（= 最右端）。
     用显式的 is-first / is-last 标记：游标也是轴的子元素，
     靠 :first-child / :last-child 会选错对象。 */
  #theme-circlelife .cl-home-articles-tick.is-first i {
    transform: translateX(0);
  }
  #theme-circlelife .cl-home-articles-tick.is-first span {
    transform: translateX(0);
  }
  #theme-circlelife .cl-home-articles-tick.is-last span {
    transform: translateX(-100%);
  }
  #theme-circlelife .cl-home-articles-tick.is-active span {
    color: var(--cl-text);
  }
  /* 游标：随滚动连续移动（每帧只写一个 CSS 变量） */
  #theme-circlelife .cl-home-articles-cursor {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    transform: translateX(var(--cursor-x, 0px));
    transition: transform var(--cl-home-switch) var(--cl-ease);
    will-change: transform;
  }
  #theme-circlelife .cl-home-articles-cursor i {
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 18px;
    background: var(--cl-accent);
    transform: translateX(-50%);
  }
  #theme-circlelife .cl-home-articles-range {
    font-family: var(--cl-font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    color: var(--cl-faint);
    white-space: nowrap;
    padding-bottom: 1px;
  }

  /* —— 移动端：单列，图版在上（仍是 3:4，与桌面同构图） —— */
  @media (max-width: 1023px) {
    #theme-circlelife .cl-home-article {
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
      align-content: center;
      max-width: none;
    }
    /* 图版宽度随「可用高度」动态伸缩：宽 = (可用高度) × 3/4，
       再用 min(100%, …) 兜住屏幕宽 —— 高的手机铺满，矮的窗口自动收，
       但比例恒为 3:4（与桌面是同一个构图）。
       --plate-w 由 JS 按「文字块实际高度」算好后写入（纯 CSS 的 svh 公式
       算不准：标题行数、摘要行数都会变）。这里只是 JS 算不出来时的兜底。 */
    #theme-circlelife .cl-home-article-plate {
      width: var(--plate-w, min(100%, calc((100svh - 21rem) * 0.75)));
    }
    #theme-circlelife .cl-home-article-meta {
      margin-bottom: 0.9rem;
    }
    #theme-circlelife .cl-home-article-rule {
      margin: 1.1rem 0 0.9rem;
    }
    #theme-circlelife .cl-home-article-summary {
      font-size: 0.95rem;
      -webkit-line-clamp: 3;
    }
    #theme-circlelife .cl-home-article-cta {
      margin-top: 1rem;
    }
    #theme-circlelife .cl-home-articles-panel {
      padding-bottom: 0.85rem;
    }
    /* 窄屏不能沿用「整组宽度」限宽（那是桌面值，会把面板撑破屏幕）→
       标尺宽度回到容器宽。 */
    #theme-circlelife .cl-home-articles-ruler {
      max-width: none;
      width: 100%;
    }
    /* 时间轴铺满屏幕宽：刻度按真实日距比例落在轴内，
       不再固定 520px 让右侧溢出屏外。 */
    #theme-circlelife .cl-home-articles-ruler-axis {
      width: 100%;
    }
    /* 轴变窄 → 日期标签跟着收一号，避免相邻刻度的标签挤在一起 */
    #theme-circlelife .cl-home-articles-tick span {
      font-size: 0.58rem;
      letter-spacing: 0.02em;
    }
    #theme-circlelife .cl-home-articles-range {
      display: none;
    }
    /* 窄屏标题收到与文章页同量级（clamp 下限 2.1rem 对长中文标题太重） */
    #theme-circlelife .cl-home-article-title {
      font-size: 1.7rem;
    }
  }

  /* —— 短屏手机（窗口很矮 / 横屏）：再压一档 ——
     窄屏的内容总高（导航带 + 顶部出口 + 图版 + 标题 + 摘要 + CTA + 时间轴）
     在 844 高刚好装下，在 700 上下就会溢出 → 摘要与 CTA 被时间轴压住。
     这里按视口高度再收一档，保证一屏内完整可读。 */
  @media (max-width: 1023px) and (max-height: 780px) {
    #theme-circlelife .cl-home-articles-panel {
      padding-top: calc(var(--cl-nav-band) + 0.5rem);
      padding-bottom: 0.6rem;
    }
    #theme-circlelife .cl-home-article-plate {
      width: var(--plate-w, min(100%, calc((100svh - 18rem) * 0.75)));
    }
    #theme-circlelife .cl-home-article-title {
      font-size: 1.5rem;
    }
    #theme-circlelife .cl-home-article-meta {
      margin-bottom: 0.6rem;
    }
    #theme-circlelife .cl-home-article-rule {
      margin: 0.7rem 0 0.6rem;
    }
    #theme-circlelife .cl-home-article-summary {
      -webkit-line-clamp: 2;
    }
    #theme-circlelife .cl-home-article-cta {
      margin-top: 0.8rem;
    }
  }

  /* —— 极矮的窄屏：摘要先让位 ——
     摘要文章页里本来就有，窗口实在装不下时它是唯一该让路的元素；
     让出它，图版才能继续长大，标题与「继续阅读」也不会被时间轴压住。 */
  @media (max-width: 1023px) and (max-height: 620px) {
    #theme-circlelife .cl-home-article-summary {
      display: none;
    }
  }
`
