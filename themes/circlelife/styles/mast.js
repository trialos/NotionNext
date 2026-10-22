/**
 * Circle of Life — mast：全站刊头排版唯一真源（归档 / 影集两页共用）
 *
 * 背景：此前归档页（.cl-page-mast--archive，styles/archive.js）与影集页
 * （.cl-album-stack-mast，styles/album.js）各手写了一份刊头 CSS，靠人工
 * 调成一致，页面级容器几何却从未统一 —— 两页刊头的屏幕坐标一直对不齐。
 * 现把刊头排版收敛到本片段，影集页改用现成的 PageMast 组件渲染，
 * 两页 DOM 与 CSS 同构，位置基准统一走 --cl-mast-top。
 *
 * 竖线强调色由 --cl-mast-rule 决定：归档暖金、影集朱砂 —— 刻意不合并
 * （设计文档 §2.2c）。注意影集侧必须用 var(--cl-vermilion, #b93a2b)：
 * 全仓并未定义 --cl-vermilion，靠 fallback 生效；严禁别名到 --cl-accent，
 * 否则深色模式下（--cl-accent = 琥珀 #e0a33e）红竖线会被静默变成琥珀色。
 */
export const mastStyle = `
  /* —— 全站刊头（归档 / 影集共用）—— */
  #theme-circlelife .cl-page-mast--section {
    margin: 0 0 1.35rem;
    padding: 0.15rem 0 0.15rem 0.85rem;
    border-left: 2px solid var(--cl-mast-rule, var(--cl-accent));
  }
  #theme-circlelife .cl-page-mast--section .cl-page-mast-inner {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  #theme-circlelife .cl-page-mast--section .cl-page-mast-kicker {
    margin: 0;
    font-family: var(--cl-font-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--cl-muted);
    line-height: 1;
  }
  #theme-circlelife .cl-page-mast--section .cl-page-mast-title {
    margin: 0;
    font-family: var(--cl-font-display);
    font-size: clamp(1.75rem, 3.6vw, 2.4rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.2;
    color: var(--cl-text);
    text-wrap: balance;
  }

  /* 竖线强调色：两页各一，按设计文档刻意不合并 */
  #theme-circlelife .cl-page-mast--archive {
    --cl-mast-rule: var(--cl-gold);
  }
  #theme-circlelife .cl-page-mast--album {
    --cl-mast-rule: var(--cl-vermilion, #b93a2b);
  }
`
