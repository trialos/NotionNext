/**
 * Circle of Life — filterTrack：全站分类轨道样式唯一真源（归档分类栏 / 影集标签栏共用）
 *
 * 背景：归档页（.cl-archive-cats，styles/archive.js）与影集页（.cl-album-stack-tags，
 * styles/album.js）此前各写各的分类栏，形态与逻辑都不一样（衬线轨道 vs 圆角胶囊、
 * 计数贴右上角 vs 行内小字、有无底部细横线、有无右端时间跨度）。博主要求两页
 * 「逻辑一样、计数在标签右上角」——两份实现必然继续漂移，故收敛到本片段。
 *
 * 计数贴右上角的关键是这两个属性，改动时不要动：
 *   .cl-cat-track__item  { align-items: flex-start }  ← 计数与标题顶对齐
 *   .cl-cat-track__count { margin-top: 0.02rem }       ← 计数再抬一点点
 *
 * 竖线/文字颜色一律走 --cl-accent（朱砂），两页一致；不引入页面专属变体。
 */
export const filterTrackStyle = `
  /* —— 全站分类轨道（归档 / 影集共用）—— */
  #theme-circlelife .cl-cat-track {
    --cl-cat-underline: 2px;
    min-width: 0;
    margin: 0 0 0.85rem;
    border-bottom: 1px solid var(--cl-border);
  }
  #theme-circlelife .cl-cat-track__row {
    display: flex;
    align-items: stretch;
    gap: 1.5rem;
    min-width: 0;
  }
  #theme-circlelife .cl-cat-track__items {
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
  #theme-circlelife .cl-cat-track__items::-webkit-scrollbar {
    display: none;
  }
  #theme-circlelife .cl-cat-track__item {
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
  #theme-circlelife .cl-cat-track__item:hover,
  #theme-circlelife .cl-cat-track__item[aria-pressed='true'] {
    color: var(--cl-accent);
  }
  /* 激活指示：底部 2px 朱砂短线，由左向右展开 */
  #theme-circlelife .cl-cat-track__item::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--cl-cat-underline);
    background: var(--cl-accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.2s var(--cl-ease);
  }
  #theme-circlelife .cl-cat-track__item[aria-pressed='true']::after {
    transform: scaleX(1);
  }
  /* 计数：小号等宽数字，贴在标签右上角 */
  #theme-circlelife .cl-cat-track__count {
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
    .cl-cat-track__item[aria-pressed='true']
    .cl-cat-track__count {
    color: var(--cl-accent);
  }
  /* 右端时间跨度（≥1024px 才显示） */
  #theme-circlelife .cl-cat-track__range {
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
  @media (min-width: 1024px) {
    #theme-circlelife .cl-cat-track__range {
      display: inline-flex;
    }
  }
  /* 窄屏：轨道横向滚动，右缘渐隐提示还有内容 */
  @media (max-width: 767px) {
    #theme-circlelife .cl-cat-track {
      position: relative;
    }
    #theme-circlelife .cl-cat-track::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 1px;
      width: 1.35rem;
      pointer-events: none;
      background: linear-gradient(to right, transparent, var(--cl-bg));
    }
    #theme-circlelife .cl-cat-track__items {
      padding-right: 1.35rem;
    }
  }
`
