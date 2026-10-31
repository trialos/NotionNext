/**
 * Circle of Life — mast：全站刊头排版唯一真源
 *
 * 归档 / 音乐页和影集目录抽屉都使用 PageMast；抽屉内只借用排版，
 * 不参与内容页的 --cl-mast-top 几何链。
 *
 * 竖线强调色由 --cl-mast-rule 决定：归档暖金、影集朱砂 —— 刻意不合并。
 * 影集侧必须用 var(--cl-vermilion, #b93a2b)：全局 token 不定义它，
 * 影集模块在深色作用域单独给深红；严禁别名到 --cl-accent，
 * 否则深色模式下（--cl-accent = 琥珀 #e0a33e）红竖线会变成琥珀色。
 */
export const mastStyle = `
  /* —— 全站刊头（归档 / 音乐 / 影集抽屉共用）—— */
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

  /* 竖线强调色：三页各一，按设计文档刻意不合并 */
  #theme-circlelife .cl-page-mast--archive {
    --cl-mast-rule: var(--cl-gold);
  }
  #theme-circlelife .cl-page-mast--album {
    --cl-mast-rule: var(--cl-vermilion, #b93a2b);
  }
  #theme-circlelife .cl-page-mast--music {
    --cl-mast-rule: var(--cl-music);
  }

  /* 刊头右侧计数位已下线（音乐展架不再展示「N 张唱片 · M 篇手记」），
     刊头结构随之简化：inner 不再需要定位上下文。 */
`
