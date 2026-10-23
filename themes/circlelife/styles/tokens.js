/**
 * Circle of Life — tokens：:root 设计变量（.dark 覆盖）+ 主题根基础
 * 字体改由 LayoutBase 的 <Head> preconnect + stylesheet 加载（原 @import 串行阻塞渲染）
 */
export const tokenStyle = `
      /* tokens 在 :root 一份：body 上的 portal（抽屉/子菜单/灯箱/手机目录）直接继承 */
      :root {
        color-scheme: light;
        --cl-bg: #f5f0e4;
        --cl-surface: #fcfaf4;
        --cl-paper-2: #eae1cf;
        --cl-paper-3: #dbceb4;
        --cl-text: #20190f;
        --cl-muted: #57493a;
        --cl-faint: #948574;
        --cl-border: rgba(32, 25, 15, 0.11);
        --cl-border-strong: rgba(32, 25, 15, 0.2);
        --cl-accent: #b24a33;
        --cl-accent-press: #97402b;
        --cl-accent-soft: #f0e0d6;
        --cl-accent-ink: #fcfaf4;
        /* 暖金辅助强调：深浅模式共用一套值，暗底上通过阴影与描边区分层次 */
        --cl-gold: #c4a47c;
        --cl-gold-ink: #ffffff;
        --cl-gold-shadow: rgba(196, 164, 124, 0.4);
        --cl-radius: 10px;
        --cl-radius-sm: 6px;
        --cl-shadow-sm: none;
        --cl-shadow-md: none;
        --cl-font-display: 'Newsreader', 'Noto Serif SC', 'Songti SC', 'STSong', 'Songti TC', 'HiraMinProN-W3', serif;
        --cl-font-body: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
        --cl-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        --cl-media-radius: 10px;
        --cl-media-ratio: 4 / 3;
        --cl-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
        --cl-dur: 0.28s;
        /* 导航带几何（全站唯一真源）：悬浮胶囊顶边 / 胶囊实高 / 带底边。
           所有需要让开导航栏的浮层一律由 --cl-nav-band 推导，禁止再写死像素 */
        --cl-nav-top: max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.65rem));
        --cl-nav-height: 2.5rem;
        --cl-nav-band: calc(var(--cl-nav-top) + var(--cl-nav-height));
        /* 胶囊圆角半径：border-radius:9999px 的体育场形，半径 = 实高/2。
           阅读进度基座线两端各内缩此值，端点正好落在胶囊底弧与平直段的切点上，
           线段与圆弧相切 → 完全收在胶囊轮廓内。calc() 引用 --cl-nav-height，
           在计算值时才展开，会自动跟随 ≤1023px 的高度覆盖，禁止在媒体查询里重复声明 */
        --cl-pill-radius: calc(var(--cl-nav-height) / 2);
        /* 宽屏页面容器（归档等大屏模块共用）：最大宽 / 流动 gutter / 双栏间距 */
        --cl-wide-max: 112.5rem;
        --cl-wide-pad: clamp(1rem, 3vw, 3rem);
        --cl-wide-gap: clamp(2rem, 3.5vw, 4rem);
        /* 刊头顶部基准（归档 / 影集两页共用）：距视口顶部的固定值。
           桌面 88px = 导航带 60px + 28px（14-28-14 节奏的中段值）；
           ≤1023px 收到 83.2px，与移动端导航带 72px 对齐。
           两页刊头必须落在同一条基线上，禁止再在页面样式里各写各的顶部数值 */
        --cl-mast-top: max(5.5rem, calc(env(safe-area-inset-top, 0px) + 4.8rem));
        /* —— 文章正文排版 token（--cl-prose-*）：正文节奏的唯一真源 —— */
        --cl-prose-size: 1.06rem; /* 正文字号（约 17px；行宽由 --cl-prose-measure 控制） */
        --cl-prose-leading: 1.85; /* 正文行高 */
        --cl-prose-indent: 2em; /* 首行缩进 */
        --cl-prose-gap: 0.5em; /* 段间距（与缩进叠加的呼吸量） */
        --cl-prose-h1: 1.6rem; /* 文内 H1/H2/H3 衬线阶梯 */
        --cl-prose-h2: 1.28rem;
        --cl-prose-h3: 1.1rem;
        --cl-prose-h1-gap: 2.6em; /* 标题前置大留白（章节呼吸） */
        --cl-prose-h2-gap: 2.4em;
        --cl-prose-h3-gap: 2em;
        --cl-prose-block-gap: 1.5em; /* 引用/callout/代码/分割线上下距 */
        --cl-prose-media-gap: 1.6em; /* 图片上下距 */
        --cl-prose-caption-size: 0.8rem; /* 图注字号 */
        --cl-prose-code-size: 0.85em; /* 代码块字号 */
        --cl-prose-code-leading: 1.7; /* 代码块行高 */
        --cl-prose-measure: 60rem; /* 正文列测量宽（宽屏阅读，约 56 个中文字符/行） */
        /* —— 全屏文章壳 token（--cl-article-*）：与影集/归档同构的宽页面 —— */
        --cl-article-shell: 88rem; /* 宽容器：轨 15rem + 距 3rem + 正文列（测量宽封顶） */
        --cl-article-rail: 15rem; /* TOC 细轨宽 */
        --cl-article-gap: 3rem; /* 轨-正文列间距 */
        --cl-article-pad: clamp(1rem, 3vw, 2.5rem); /* 宽容器左右 gutter */
        --cl-article-cover-h: clamp(280px, 42vh, 480px); /* 全出血封面高 */
        --cl-article-cover-scrim-h: 22%; /* 封面顶部极轻压暗区高度：保证浅色头图上导航胶囊仍读得清 */
        --cl-article-cover-scrim: rgba(20, 16, 12, 0.26); /* 顶部压暗色（明暗模式同值；暗底上无可感影响） */
        /* 封面底边溶解：用遮罩让照片像素自己透明掉、露出封面容器（= 页面底色），
           而不是盖一层色纱。盖纱时那片区域是"照片+色纱"（读作一块黑边），
           遮罩时那片区域就是页面本身的底色（照片真正化进去，没有黑边实体）。
           停靠点 = 照片保持原样的比例，其后逐级溶解。
           浅色：照片 55% 原样 + 底部 45% 溶入纸色。色标与原七级渐隐曲线逐点对应
           （区域% → 封面% = 55 + 区域% × 0.45，遮罩 α = 1 − 覆盖层 α），
           改用遮罩后浅色观感逐像素不变 */
        --cl-article-cover-mask: linear-gradient(
          to bottom,
          #000 0,
          #000 55%,
          #000 62%,
          rgba(0, 0, 0, 0.86) 71%,
          rgba(0, 0, 0, 0.62) 81%,
          rgba(0, 0, 0, 0.34) 89%,
          rgba(0, 0, 0, 0.12) 95.5%,
          transparent 100%
        );
        /* 卡片回退形态：照片 45% 原样 + 底部 55% 溶入卡片 surface（沿用旧渐隐的 55% 区） */
        --cl-article-cover-mask-card: linear-gradient(
          to bottom,
          #000 0,
          #000 45%,
          transparent 100%
        );
        /* —— 首页照片墙题字（--cl-wall-*）：与照片墙同源的漂移与呼吸 —— */
        /* 题字本体：奶白（取纸色，浅色模式与纸同源）。照片墙是「米色缝隙 + 深色照片」
           交替的混合表面，奶白字在深色照片上最干净；跨过米色缝隙时靠下方暗色光晕兜底 */
        --cl-wall-ink: #f5f0e4;
        /* 暗色光晕：题字跨在米色缝隙上时的可读性兜底。明暗模式同值 ——
           暗色模式下墙面本身已是近黑，暗光晕不可见亦无害；亮色照片上则提供边缘对比。
           第一层是零偏移的紧贴描边：米色缝隙上的字靠它咬出清晰轮廓，
           否则奶白字与米色纸同色、只剩模糊的晕，字会读作「化掉」 */
        --cl-wall-halo: 0 0 2px rgba(16, 12, 8, 0.9), 0 1px 3px rgba(16, 12, 8, 0.6),
          0 0 12px rgba(16, 12, 8, 0.45), 0 0 28px rgba(16, 12, 8, 0.35);
        /* 英文副题字号小，光晕必须更紧，否则糊成一团 */
        --cl-wall-halo-sm: 0 0 2px rgba(16, 12, 8, 0.95), 0 1px 3px rgba(16, 12, 8, 0.7),
          0 0 8px rgba(16, 12, 8, 0.5);
        /* —— 首页三段共通语言（照片墙 → 精选文章 → 精选影集）——
           同一副骨架 + 同一条换档曲线 + 同一条朱砂位置线 + 同一段垂直节奏，
           三段才读成同一部连续放映的胶片，而不是三块各自为政的版块。 */
        /* 换档曲线：文章段游标滑动、影集段换页、题字退场共用同一时长 */
        --cl-home-switch: 240ms;
        /* 「位置标记」统一色：2px 朱砂竖线（文章时间尺的游标 / 影集取景框的竖线） */
        --cl-home-mark: var(--cl-accent);
        /* 章节之间的统一间距（照片墙→文章、文章→影集两处一致） */
        --cl-home-section-gap: clamp(3.5rem, 8vw, 7rem);
        /* 章节间距的最终值：至少让开固定导航胶囊（窄屏导航带更高） */
        --cl-home-section-pad: max(var(--cl-nav-band), var(--cl-home-section-gap));
        /* —— 首页精选影集段（移动端：封面照片铺底）——
           照片上的文字不能用 --cl-bg / --cl-text（它们随明暗模式反转，
           压在照片上会有一半读不出来）→ 这里给固定浅色，明暗模式同值 */
        --cl-home-album-ink: #f5f0e4;
        /* 照片底部压暗：保证浅色文字始终压在暗底上（明暗同值） */
        --cl-home-album-scrim: rgba(14, 11, 8, 0.78);
        /* —— 首页精选影集段 · 取景框 ——
           框里只画当前影集的名字（R14），框高决定推进区间与换挡位置：
           3 槽 = 42vh（两端同构）。 */
        --cl-home-album-window: 42vh;
        /* 焦点线：焦点标题中心所在的视口高度（明暗同值，纯几何） */
        --cl-home-album-focus-line: 44vh;
        /* 换挡时长：当前影集名的交叉淡入 + 封面溶解（同一个值，两处同步）。
           ⚠️ 必须短于换挡的最小间隔（JS 的 ALBUM_FOCUS_MIN_MS = 250ms）：
           否则上一次淡入还没结束就换挡，垫底的那张封面仍是半透明的，
           会被藏起来的封面「透」出来（闪一下）。 */
        --cl-home-album-switch: var(--cl-home-switch);
        /* —— 首页精选文章章（一窗一屏）——
           图版在桌面与移动端同为 3:4，只是宽度不同 → 同一张图在两端
           是同一个构图（换比例会让主体在手机与电脑上被切得不一样）。 */
        --cl-home-article-plate: min(clamp(240px, 33vw, 480px), 54svh); /* 桌面图版宽（与影集封面同宽；再受窗口高度约束） */
        --cl-home-article-plate-sm: 242px; /* 移动端图版宽（比例仍 3:4） */
        --cl-home-article-measure: 620px; /* 摘要测量宽（文字栏贴右边缘） */
        --cl-home-article-title: 54px; /* 标题字号（1440 基准；实际用 clamp） */
        --cl-home-article-focus: 45%; /* 视口焦点线（判定当前篇） */
        --cl-home-article-switch: var(--cl-home-switch);
      }

      /* ≤1023px：胶囊内嵌 2.35rem 汉堡按钮，导航带随之变高。
         --cl-nav-band 在计算值时才展开，会自动跟随本覆盖，无需重复声明 */
      @media (max-width: 1023px) {
        :root {
          --cl-nav-height: 3.25rem;
          /* 刊头基准同步收窄（与影集页原值逐档等价） */
          --cl-mast-top: max(5.2rem, calc(env(safe-area-inset-top, 0px) + 4.5rem));
        }
      }

      .dark {
        color-scheme: dark;
        --cl-bg: #14110e;
        --cl-surface: #1a1612;
        --cl-paper-2: #1c1814;
        --cl-paper-3: #261f18;
        --cl-text: #f0e9dc;
        --cl-muted: #c2b7a4;
        --cl-faint: #8c8170;
        --cl-border: rgba(240, 233, 220, 0.12);
        --cl-border-strong: rgba(240, 233, 220, 0.22);
        --cl-accent: #e0a33e;
        --cl-accent-press: #c98a26;
        --cl-accent-soft: #3a2e18;
        --cl-accent-ink: #14110e;
        /* 深色模式的目标色是近黑 #14110e，照片要跨越的亮度差远大于浅色模式。
           若沿用浅色的长溶解（45%），照片中下段会被整片压黑 —— 读作"照片被切断"，
           而且照片的可用范围被吃掉一大半。故深色单独给一版短溶解：
           照片 80% 保持原样、底部 20% 溶入页面底色，黑边只剩底缘一道细溶解。
           卡片回退形态沿用 --cl-article-cover-mask-card，不受此覆盖影响 */
        --cl-article-cover-mask: linear-gradient(
          to bottom,
          #000 0,
          #000 80%,
          rgba(0, 0, 0, 0.55) 87%,
          rgba(0, 0, 0, 0.22) 93.5%,
          transparent 100%
        );
        /* 深色模式下整面照片墙已是近黑（缝隙 = --cl-bg #14110e），
           奶白字原生可读，暗纱既不可见也不需要 → 关闭，只保留字色 */
        --cl-wall-ink: #f0e9dc;
      }

      html:has(#theme-circlelife),
      html:has(#theme-circlelife) body {
        background-color: var(--cl-bg);
      }
      #theme-circlelife {
        background-color: var(--cl-bg);
        color: var(--cl-text);
        font-family: var(--cl-font-body);
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
      }

      #theme-circlelife a {
        color: inherit;
        text-decoration: none;
      }

      /* 键盘焦点可见：主题根与 body 上的移动目录 portal 一并覆盖 */
      :where(#theme-circlelife, .cl-toc-drawer-root) :focus-visible {
        outline: 2px solid var(--cl-accent);
        outline-offset: 2px;
      }

      /* 全局减少动效：过渡/动画压到瞬时，平滑滚动改即时 */
      @media (prefers-reduced-motion: reduce) {
        html,
        #theme-circlelife,
        #theme-circlelife *,
        .cl-toc-drawer-root,
        .cl-toc-drawer-root * {
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
`
