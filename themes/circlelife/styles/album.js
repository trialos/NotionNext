/**
 * Circle of Life — album：影集全量（书架/墨轴/snap/氛围光/卡堆/热区/灯箱/刊头）
 */
export const albumStyle = `
      /* —— Album: snap · glass · ambient · lightbox —— */
      #theme-circlelife.cl-is-album #container-inner,
      #theme-circlelife.cl-is-album #container-wrapper {
        max-width: none;
        width: 100%;
      }
      /* 画廊全屏：藏页脚，避免贴在 snap 下假底部 */
      html.cl-album-gallery-active,
      html.cl-album-gallery-active body {
        overflow: hidden !important;
        height: 100%;
        overscroll-behavior: none;
      }
      html.cl-album-gallery-active #theme-circlelife .cl-footer,
      html.cl-album-gallery-active .cl-footer {
        display: none !important;
      }
      html.cl-album-gallery-active #theme-circlelife {
        height: 100%;
        max-height: 100dvh;
        overflow: hidden;
      }
      html.cl-album-gallery-active #theme-circlelife #container-inner {
        overflow: hidden;
        min-height: 0;
      }
      #theme-circlelife.cl-is-album #container-inner {
        position: relative;
        z-index: 10;
      }
      #theme-circlelife .cl-album-page {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
      }
      #theme-circlelife .cl-album-empty {
        text-align: center;
        padding: 3.5rem 1.25rem 4rem;
        max-width: 28rem;
        margin: 0 auto;
      }
      #theme-circlelife .cl-album-howto {
        text-align: left;
        max-width: 22rem;
        margin: 1.5rem auto 0;
        padding: 1rem 1.15rem 1rem 1.75rem;
        border-radius: 12px;
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
        font-size: 0.88rem;
        line-height: 1.65;
        color: var(--cl-muted);
        list-style: disc;
      }
      #theme-circlelife .cl-album-howto li + li {
        margin-top: 0.35rem;
      }
      #theme-circlelife .cl-album-howto strong {
        color: var(--cl-text);
        font-weight: 600;
      }



      /* album shell + shelf + ink spine */
      #theme-circlelife .cl-album-shell {
        position: relative;
        width: 100%;
      }
      #theme-circlelife .cl-album-shell.is-shelf {
        max-width: 56rem;
        margin: 0 auto;
        padding: 1.25rem 1rem 3rem;
      }
      #theme-circlelife .cl-album-shelf-head {
        text-align: left;
        margin: 0 auto 1.85rem;
        max-width: 36rem;
        padding: 0 0.25rem;
      }
      #theme-circlelife .cl-album-shelf-mast {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3rem;
        padding: 0.15rem 0 0.15rem 0.85rem;
        border-left: 2px solid var(--cl-accent);
      }
      #theme-circlelife .cl-album-shelf-kicker {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--cl-faint);
        line-height: 1;
      }
      #theme-circlelife .cl-album-shelf-title {
        margin: 0;
        font-family: var(--cl-font-display);
        font-size: clamp(1.55rem, 3.4vw, 2rem);
        font-weight: 600;
        letter-spacing: -0.03em;
        color: var(--cl-text);
        line-height: 1.2;
      }
      #theme-circlelife .cl-album-shelf-desc {
        margin: 0.65rem 0 0 0.85rem;
        font-size: 0.88rem;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-album-shelf-grid {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem 0.85rem;
      }
      @media (min-width: 640px) {
        #theme-circlelife .cl-album-shelf-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem 1.1rem;
        }
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-album-shelf-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      #theme-circlelife .cl-album-shelf-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        border: 0;
        padding: 0;
        background: transparent;
        cursor: pointer;
        text-align: left;
        color: inherit;
        border-radius: 12px;
        transition: transform 0.2s var(--cl-ease);
      }
      #theme-circlelife .cl-album-shelf-card:hover {
        transform: translateY(-3px);
      }
      #theme-circlelife .cl-album-shelf-stack {
        position: relative;
        display: block;
        width: 100%;
        min-height: 9.5rem;
        height: clamp(9.5rem, 28vw, 13.5rem);
        margin: 0 auto;
      }
      #theme-circlelife .cl-album-shelf-shot {
        position: absolute;
        left: 50%;
        top: 50%;
        display: block;
        width: auto;
        height: auto;
        max-width: 78%;
        max-height: 92%;
        object-fit: contain;
        border-radius: 10px;
        background: transparent;
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--cl-text) 10%, transparent),
          0 10px 28px color-mix(in srgb, var(--cl-text) 12%, transparent);
        transform-origin: center center;
      }
      #theme-circlelife .cl-album-shelf-shot--0 {
        z-index: 3;
        transform: translate(-50%, -50%) rotate(-2deg);
      }
      #theme-circlelife .cl-album-shelf-shot--1 {
        z-index: 2;
        transform: translate(-58%, -54%) rotate(-8deg);
        opacity: 0.92;
      }
      #theme-circlelife .cl-album-shelf-shot--2 {
        z-index: 1;
        transform: translate(-40%, -48%) rotate(7deg);
        opacity: 0.88;
      }
      #theme-circlelife .cl-album-shelf-card:hover .cl-album-shelf-shot--0 {
        transform: translate(-50%, -52%) rotate(-1deg);
      }
      #theme-circlelife .cl-album-shelf-card:hover .cl-album-shelf-shot--1 {
        transform: translate(-62%, -56%) rotate(-10deg);
      }
      #theme-circlelife .cl-album-shelf-shot {
        transition: transform 0.25s var(--cl-ease), opacity 0.2s ease;
      }
      #theme-circlelife .cl-album-shelf-ph {
        position: absolute;
        inset: 12% 18%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        border: 1px dashed var(--cl-border);
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        color: var(--cl-faint);
        background: var(--cl-paper-2, var(--cl-surface));
      }
      #theme-circlelife .cl-album-shelf-meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding: 0.55rem 0.15rem 0.25rem;
      }
      #theme-circlelife .cl-album-shelf-name {
        font-family: var(--cl-font-display);
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--cl-text);
        line-height: 1.25;
      }
      #theme-circlelife .cl-album-shelf-count {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-ag-head-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.45rem;
        width: 100%;
        max-width: min(36rem, 100%);
      }
      #theme-circlelife .cl-album-back-shelf {
        border: 0;
        background: transparent;
        color: var(--cl-muted);
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        padding: 0.15rem 0;
        cursor: pointer;
        transition: color 0.15s ease;
      }
      #theme-circlelife .cl-album-back-shelf:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-album-rail {
        display: none;
      }
      @media (min-width: 960px) {
        #theme-circlelife .cl-album-shell.is-gallery .cl-album-rail {
          display: block;
          position: absolute;
          left: max(0.35rem, calc((100% - 72rem) / 2));
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 10rem;
          pointer-events: none;
        }
        #theme-circlelife .cl-album-rail-window {
          position: relative;
          height: 300px;
          overflow: hidden;
          pointer-events: auto;
          --cl-rail-x: 0.85rem;
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            #000 16%,
            #000 84%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            #000 16%,
            #000 84%,
            transparent 100%
          );
        }
        #theme-circlelife .cl-album-rail-spine {
          position: absolute;
          left: var(--cl-rail-x, 0.85rem);
          top: 0;
          bottom: 0;
          width: 1px;
          transform: translateX(-50%);
          background: color-mix(in srgb, var(--cl-text) 22%, transparent);
          z-index: 0;
        }
        #theme-circlelife .cl-album-rail-track {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          z-index: 1;
          transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
          will-change: transform;
        }
        #theme-circlelife .cl-album-rail-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          width: 100%;
          height: 44px;
          padding: 0 0.35rem 0 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          color: var(--cl-faint);
          text-align: left;
          opacity: 0.4;
          transition: color 0.25s ease, opacity 0.25s ease;
        }
        #theme-circlelife .cl-album-rail-item.is-near {
          opacity: 0.72;
          color: var(--cl-muted);
        }
        #theme-circlelife .cl-album-rail-item.is-far {
          opacity: 0.28;
        }
        #theme-circlelife .cl-album-rail-item.is-active {
          opacity: 1;
          color: var(--cl-text);
        }
        #theme-circlelife .cl-album-rail-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          flex: none;
          margin-left: calc(var(--cl-rail-x, 0.85rem) - 3.5px);
          background: color-mix(in srgb, var(--cl-text) 28%, transparent);
          box-shadow: 0 0 0 2px var(--cl-bg);
          transition:
            background 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }
        #theme-circlelife .cl-album-rail-item.is-active .cl-album-rail-dot {
          background: var(--cl-accent);
          transform: scale(1.25);
          box-shadow:
            0 0 0 2px var(--cl-bg),
            0 0 0 4px color-mix(in srgb, var(--cl-accent) 28%, transparent);
        }
        #theme-circlelife .cl-album-rail-text {
          font-family: var(--cl-font-display);
          font-size: 0.84rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        #theme-circlelife .cl-album-rail-item.is-active .cl-album-rail-text {
          font-weight: 600;
        }
      }

      #theme-circlelife .cl-album-snap {
        height: calc(100dvh - 3.25rem);
        max-height: calc(100dvh - 3.25rem);
        overflow-x: hidden;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        background: var(--cl-bg);
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-album-snap {
          height: calc(100dvh - 3.6rem);
          max-height: calc(100dvh - 3.6rem);
        }
      }
      #theme-circlelife .cl-album-section {
        box-sizing: border-box;
        min-height: 100%;
        height: 100%;
        scroll-snap-align: start;
        scroll-snap-stop: always;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0.5rem 0 0.85rem;
        position: relative;
        overflow: hidden;
      }
      #theme-circlelife .cl-album-snap-hint {
        text-align: center;
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        color: var(--cl-faint);
        margin: 0.45rem 0 0;
        flex-shrink: 0;
        position: relative;
        z-index: 2;
      }

      /* gallery shell */
      #theme-circlelife .cl-ag {
        position: static;
        z-index: 1;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        max-width: 72rem;
        margin: 0 auto;
        padding: 0 0.5rem;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-ag {
          padding: 0 1.25rem;
        }
      }

      /* full-section ambient blur glow */
      #theme-circlelife .cl-ag-ambient {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }
      #theme-circlelife .cl-ag-ambient-img {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 135%;
        height: 135%;
        max-width: none;
        object-fit: cover;
        transform: translate(-50%, -50%);
        filter: blur(58px) saturate(1.35) brightness(1.02);
        will-change: opacity;
        transition: opacity 1.15s ease;
      }
      /* 光层始终在 veil 下，交叉只改 opacity，结束不掉层级 */
      #theme-circlelife .cl-ag-ambient-img.is-front {
        opacity: 0.77;
        z-index: 1;
      }
      #theme-circlelife .cl-ag-ambient-img.is-entering {
        opacity: 0.77;
        z-index: 1;
      }
      #theme-circlelife .cl-ag-ambient-img.is-leaving {
        opacity: 0;
        z-index: 0;
      }
      #theme-circlelife .cl-ag-ambient-img.is-back {
        opacity: 0;
        z-index: 0;
      }
      .dark #theme-circlelife .cl-ag-ambient-img.is-front,
      .dark #theme-circlelife .cl-ag-ambient-img.is-entering {
        opacity: 0.64;
        filter: blur(62px) saturate(1.45) brightness(1.0);
      }
      .dark #theme-circlelife .cl-ag-ambient-img.is-leaving,
      .dark #theme-circlelife .cl-ag-ambient-img.is-back {
        opacity: 0;
        filter: blur(62px) saturate(1.45) brightness(1.0);
      }
      #theme-circlelife .cl-ag-ambient-veil {
        position: absolute;
        inset: 0;
        z-index: 2;
        background: color-mix(in srgb, var(--cl-bg) 36%, transparent);
        pointer-events: none;
      }
      .dark #theme-circlelife .cl-ag-ambient-veil {
        background: color-mix(in srgb, var(--cl-bg) 40%, transparent);
      }

      /* make ambient cover whole section: position ag ambient fixed to section */
      #theme-circlelife .cl-album-section {
        isolation: isolate;
      }
      #theme-circlelife .cl-ag-head,
      #theme-circlelife .cl-ag-stage,
      #theme-circlelife .cl-ag-countline,
      #theme-circlelife .cl-ag-caption,
      #theme-circlelife .cl-ag-dots {
        position: relative;
        z-index: 2;
      }

      #theme-circlelife .cl-ag-head {
        text-align: left;
        padding: 0.45rem 0.5rem 0.7rem 0.85rem;
        flex-shrink: 0;
        display: flex;
        justify-content: flex-start;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-ag-head {
          padding: 0.55rem 0.75rem 0.85rem 1.1rem;
        }
      }
      /* 杂志刊头：无厚卡片，左侧朱砂细条 + 字重 */
      /* 全站列表刊头（与影集 mast 同系） */
      #theme-circlelife .cl-page-mast {
        text-align: left;
        margin: 0 0 1.5rem;
        max-width: 40rem;
      }
      #theme-circlelife .cl-page-mast-inner {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3rem;
        padding: 0.15rem 0 0.15rem 0.85rem;
        border-left: 2px solid var(--cl-accent);
      }
      #theme-circlelife .cl-page-mast-kicker {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--cl-faint);
        line-height: 1;
      }
      #theme-circlelife .cl-page-mast-title {
        margin: 0;
        font-family: var(--cl-font-display);
        font-size: clamp(1.45rem, 3.2vw, 1.9rem);
        font-weight: 600;
        letter-spacing: -0.03em;
        color: var(--cl-text);
        line-height: 1.2;
      }
      #theme-circlelife .cl-page-mast-desc {
        margin: 0.55rem 0 0 0.85rem;
        font-size: 0.88rem;
        line-height: 1.55;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-page-mast--list {
        margin-bottom: 1.75rem;
      }

      #theme-circlelife .cl-ag-mast {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.28rem;
        max-width: min(94%, 26rem);
        padding: 0.15rem 0 0.15rem 0.85rem;
        border-left: 2px solid var(--cl-accent);
      }
      #theme-circlelife .cl-ag-mast-kicker {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--cl-faint);
        line-height: 1;
      }
      #theme-circlelife .cl-ag-mast-title {
        margin: 0;
        font-family: var(--cl-font-display);
        font-size: clamp(1.35rem, 3.4vw, 1.85rem);
        font-weight: 600;
        letter-spacing: -0.025em;
        line-height: 1.2;
        color: var(--cl-text);
      }

      #theme-circlelife .cl-ag-stage {
        position: relative;
        z-index: 2;
        flex: 1 1 auto;
        min-height: 12rem;
        height: clamp(16rem, 50dvh, 28rem);
        max-height: 56dvh;
        width: 100%;
        margin: 0 auto;
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        cursor: grab;
        overflow: visible;
        --ag-dx: 0px;
        --ag-rot: 0deg;
        --ag-shift: 0px;
        --ag-shift-far: 0px;
        --ag-grow-r: 0;
        --ag-grow-l: 0;
        --ag-fade-main: 1;
        --ag-dur: 0ms;
      }
      #theme-circlelife .cl-ag-stage:active {
        cursor: grabbing;
      }
      #theme-circlelife .cl-ag-stage.is-animating .cl-ag-card--main,
      #theme-circlelife .cl-ag-stage.is-animating .cl-ag-card--side,
      #theme-circlelife .cl-ag-stage.is-animating .cl-ag-card--far {
        transition:
          transform var(--ag-dur) cubic-bezier(0.22, 0.61, 0.36, 1),
          opacity var(--ag-dur) cubic-bezier(0.22, 0.61, 0.36, 1),
          filter var(--ag-dur) ease;
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-ag-stage {
          height: clamp(18rem, 54dvh, 32rem);
          max-height: 60dvh;
        }
      }

      /* glass float card — shrink-wrap image */
      #theme-circlelife .cl-ag-card {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        line-height: 0;
        display: block;
        width: fit-content;
        height: fit-content;
        max-width: min(88vw, 36rem);
        max-height: 100%;
        border-radius: 12px;
        overflow: hidden;
        transform-origin: center center;
        /* glass edge */
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--cl-text) 10%, transparent),
          inset 0 1px 0 color-mix(in srgb, #fff 55%, transparent),
          0 2px 4px color-mix(in srgb, var(--cl-text) 6%, transparent),
          0 18px 40px color-mix(in srgb, var(--cl-text) 14%, transparent);
      }
      .dark #theme-circlelife .cl-ag-card {
        box-shadow:
          0 0 0 1px color-mix(in srgb, #fff 14%, transparent),
          inset 0 1px 0 color-mix(in srgb, #fff 18%, transparent),
          0 2px 6px color-mix(in srgb, #000 35%, transparent),
          0 20px 48px color-mix(in srgb, #000 45%, transparent);
      }
      #theme-circlelife .cl-ag-card--main {
        z-index: 5;
        will-change: transform;
        opacity: 1;
        transform: translate3d(calc(-50% + var(--ag-dx, 0px)), -50%, 0)
          rotate(var(--ag-rot, 0deg));
      }
      #theme-circlelife .cl-ag-card--side {
        z-index: 3;
        max-width: min(36vw, 14rem);
        opacity: 0.78;
        filter: brightness(0.94);
        cursor: pointer;
      }
      #theme-circlelife .cl-ag-card--side:hover {
        opacity: 0.95;
        filter: brightness(1);
      }
      #theme-circlelife .cl-ag-card--left {
        transform: translate(
            calc(-50% - min(36vw, 15rem) + var(--ag-shift, 0px)),
            -50%
          )
          scale(0.86) rotate(-4deg);
      }
      #theme-circlelife .cl-ag-card--right {
        transform: translate(
            calc(-50% + min(36vw, 15rem) + var(--ag-shift, 0px)),
            -50%
          )
          scale(0.86) rotate(4deg);
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-ag-card--left {
          transform: translate(
              calc(-50% - min(30vw, 17.5rem) + var(--ag-shift, 0px)),
              -50%
            )
            scale(0.84) rotate(-5deg);
        }
        #theme-circlelife .cl-ag-card--right {
          transform: translate(
              calc(-50% + min(30vw, 17.5rem) + var(--ag-shift, 0px)),
              -50%
            )
            scale(0.84) rotate(5deg);
        }
      }
      #theme-circlelife .cl-ag-card--far {
        z-index: 1;
        max-width: min(26vw, 10rem);
        opacity: 0.38;
        filter: brightness(0.88);
        pointer-events: none;
      }
      #theme-circlelife .cl-ag-card--left2 {
        transform: translate(
            calc(-50% - min(56vw, 25rem) + var(--ag-shift-far, 0px)),
            -50%
          )
          scale(0.7) rotate(-8deg);
      }
      #theme-circlelife .cl-ag-card--right2 {
        transform: translate(
            calc(-50% + min(56vw, 25rem) + var(--ag-shift-far, 0px)),
            -50%
          )
          scale(0.7) rotate(8deg);
      }
      @media (max-width: 639px) {
        #theme-circlelife .cl-ag-card--far {
          display: none;
        }
        #theme-circlelife .cl-ag-card--left {
          transform: translate(
              calc(-50% - min(46vw, 9rem) + var(--ag-shift, 0px)),
              -50%
            )
            scale(0.78) rotate(-3deg);
          opacity: 0.55;
        }
        #theme-circlelife .cl-ag-card--right {
          transform: translate(
              calc(-50% + min(46vw, 9rem) + var(--ag-shift, 0px)),
              -50%
            )
            scale(0.78) rotate(3deg);
          opacity: 0.55;
        }
      }

      #theme-circlelife .cl-ag-img {
        display: block;
        width: auto;
        height: auto;
        max-width: min(88vw, 36rem);
        max-height: min(50dvh, 28rem);
        object-fit: contain;
        object-position: center;
        background: transparent;
        pointer-events: none;
        -webkit-user-drag: none;
        border-radius: 12px;
      }
      #theme-circlelife .cl-ag-img--main {
        max-width: min(88vw, 36rem);
        max-height: min(50dvh, 28rem);
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-ag-img--main {
          max-width: min(52vw, 38rem);
          max-height: min(54dvh, 32rem);
        }
        #theme-circlelife .cl-ag-card--main {
          max-width: min(52vw, 38rem);
        }
      }
      #theme-circlelife .cl-ag-card--side .cl-ag-img,
      #theme-circlelife .cl-ag-card--far .cl-ag-img {
        max-width: min(36vw, 14rem);
        max-height: min(38dvh, 16rem);
      }
      #theme-circlelife .cl-ag-card--far .cl-ag-img {
        max-width: min(26vw, 10rem);
        max-height: min(30dvh, 12rem);
      }
      /* kill lazy placeholder mat */
      #theme-circlelife .cl-ag-img.lazy-image-placeholder {
        min-width: 0 !important;
        min-height: 0 !important;
        background: transparent !important;
        opacity: 0.25;
      }
      #theme-circlelife .cl-ag-placeholder {
        width: min(70vw, 16rem);
        height: 10rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cl-faint);
        font-family: var(--cl-font-mono);
        font-size: 0.75rem;
        border-radius: 12px;
        border: 1px dashed var(--cl-border);
        line-height: 1.4;
      }

      #theme-circlelife .cl-ag-arrows { display: none !important; }
      /* album arrows removed — left/right hot zones */
      #theme-circlelife .cl-ag-arrow {
        pointer-events: auto;
        width: 2.4rem;
        height: 2.4rem;
        border-radius: 9999px;
        border: 1px solid color-mix(in srgb, var(--cl-border) 80%, transparent);
        background: color-mix(in srgb, var(--cl-surface) 78%, transparent);
        color: var(--cl-text);
        font-size: 1.35rem;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        transition:
          color 0.15s ease,
          border-color 0.15s ease,
          background 0.15s ease,
          transform 0.15s ease;
      }

      #theme-circlelife .cl-ag-arrows--no-left {
        justify-content: flex-end;
      }
      #theme-circlelife .cl-ag-arrow-spacer {
        width: 2.4rem;
        height: 2.4rem;
        pointer-events: none;
        visibility: hidden;
      }
      @media (min-width: 960px) {
        #theme-circlelife .cl-album-shell.is-gallery .cl-ag-arrow--prev {
          display: none;
        }
      }
      #theme-circlelife .cl-ag-arrow:hover {
        color: var(--cl-accent);
        border-color: var(--cl-accent);
        background: var(--cl-accent-soft, color-mix(in srgb, var(--cl-accent) 12%, var(--cl-surface)));
        transform: translateY(-1px);
      }

      #theme-circlelife .cl-ag-countline {
        text-align: center;
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        color: var(--cl-faint);
        padding: 0.55rem 0 0.15rem;
        flex-shrink: 0;
      }
      #theme-circlelife .cl-ag-caption {
        text-align: center;
        padding: 0.35rem 0.75rem 0.1rem;
        flex-shrink: 0;
      }
      #theme-circlelife .cl-ag-title {
        font-family: var(--cl-font-display);
        font-size: 1.15rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--cl-text);
        margin: 0 0 0.3rem;
        line-height: 1.3;
      }
      #theme-circlelife .cl-ag-cap {
        margin: 0 auto 0.35rem;
        max-width: 36em;
        font-size: 0.86rem;
        line-height: 1.55;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-ag-summary {
        margin: 0 auto 0.55rem;
        max-width: 34em;
        font-size: 0.9rem;
        line-height: 1.65;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-ag-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.45rem 0.85rem;
      }
      #theme-circlelife .cl-ag-date {
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        letter-spacing: 0.06em;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-ag-dots {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.38rem;
        padding: 0.4rem 0 0.1rem;
        flex-shrink: 0;
      }
      #theme-circlelife .cl-ag-dot {
        width: 6px;
        height: 6px;
        padding: 0;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong, var(--cl-border));
        background: transparent;
        cursor: pointer;
        transition:
          background 0.15s ease,
          border-color 0.15s ease,
          transform 0.15s ease;
      }
      #theme-circlelife .cl-ag-dot.is-active {
        background: var(--cl-accent);
        border-color: var(--cl-accent);
        transform: scale(1.25);
      }

      /* fullscreen immersive lightbox (portal on body) */
      .cl-ag-lb {
        position: fixed;
        inset: 0;
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: cl-ag-lb-in 0.2s ease;
      }
      @keyframes cl-ag-lb-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .cl-ag-lb-mask {
        position: absolute;
        inset: 0;
        border: 0;
        padding: 0;
        background: rgba(12, 10, 8, 0.88);
        cursor: pointer;
      }
      .dark .cl-ag-lb-mask {
        background: rgba(0, 0, 0, 0.92);
      }
      .cl-ag-lb-close {
        position: absolute;
        top: max(0.75rem, env(safe-area-inset-top));
        right: max(0.75rem, env(safe-area-inset-right));
        z-index: 3;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.08);
        color: #f5f0e4;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        transition: background 0.15s ease, border-color 0.15s ease;
      }
      .cl-ag-lb-close:hover {
        background: rgba(255, 255, 255, 0.16);
        border-color: rgba(255, 255, 255, 0.4);
      }
      .cl-ag-lb-nav {
        display: none !important;
        position: absolute;
        top: 50%;
        z-index: 3;
        transform: translateY(-50%);
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.08);
        color: #f5f0e4;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        transition: background 0.15s ease, transform 0.15s ease;
      }
      .cl-ag-lb-nav:hover {
        background: rgba(255, 255, 255, 0.16);
        transform: translateY(-50%) scale(1.04);
      }
      .cl-ag-lb-nav--prev {
        left: max(0.6rem, env(safe-area-inset-left));
      }
      .cl-ag-lb-nav--next {
        right: max(0.6rem, env(safe-area-inset-right));
      }
      .cl-ag-lb-stage {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width: min(96vw, 56rem);
        max-height: 92dvh;
        padding: 2.5rem 3.25rem 1.25rem;
        pointer-events: none;
              cursor: pointer;
}
      .cl-ag-lb-img {
        display: block;
        width: auto;
        height: auto;
        max-width: min(92vw, 52rem);
        max-height: min(78dvh, 40rem);
        object-fit: contain;
        border-radius: 6px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.45);
        pointer-events: auto;
      }
      .cl-ag-lb-meta {
        margin-top: 0.85rem;
        text-align: center;
        color: rgba(245, 240, 228, 0.88);
        pointer-events: none;
      }
      .cl-ag-lb-title {
        margin: 0 0 0.25rem;
        font-family: var(--cl-font-display, Georgia, serif);
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .cl-ag-lb-count {
        margin: 0;
        font-family: var(--cl-font-mono, ui-monospace, monospace);
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        opacity: 0.7;
      }
`
