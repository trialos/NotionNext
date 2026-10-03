/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

/**
 * Circle of Life — 疏朗顶栏 + 全站回顶 + 抽屉 portal
 */
const Style = () => {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@500&family=Newsreader:ital,wght@0,500;0,600;1,500&family=Noto+Sans+SC:wght@400;500&family=Noto+Serif+SC:wght@500;600&display=swap');

      #theme-circlelife {
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
        --cl-radius: 10px;
        --cl-radius-sm: 6px;
        --cl-shadow-sm: none;
        --cl-shadow-md: none;
        --cl-font-display: 'Newsreader', 'Noto Serif SC', 'Songti SC', serif;
        --cl-font-body: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
        --cl-font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, monospace;
        --cl-media-radius: 10px;
        --cl-media-ratio: 4 / 3;
        --cl-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
        --cl-dur: 0.28s;

        background-color: var(--cl-bg);
        color: var(--cl-text);
        font-family: var(--cl-font-body);
        -webkit-font-smoothing: antialiased;
      }

      .dark #theme-circlelife {
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
      }

      #theme-circlelife a {
        color: inherit;
        text-decoration: none;
      }

      /* —— Header：中轴桌面 + 手机汉堡 —— */
      #theme-circlelife .cl-header {
        position: sticky;
        top: 0;
        background-color: color-mix(in srgb, var(--cl-bg) 92%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid transparent;
        transition:
          border-color var(--cl-dur) var(--cl-ease),
          background-color var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-header.is-scrolled {
        border-bottom-color: var(--cl-border);
        background-color: color-mix(in srgb, var(--cl-bg) 97%, transparent);
      }
      #theme-circlelife .cl-header-inner {
        margin: 0 auto;
        width: 100%;
        max-width: min(72rem, 100%);
        display: flex;
        align-items: center;
        padding: 0.8rem clamp(1.25rem, 3vw, 2.25rem);
        min-height: 3.5rem;
        gap: 1rem;
        box-sizing: border-box;
        transition:
          padding 0.28s var(--cl-ease),
          min-height 0.28s var(--cl-ease),
          gap 0.28s var(--cl-ease);
      }
      #theme-circlelife .cl-header.is-scrolled .cl-header-inner {
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
        min-height: 2.65rem;
      }

      /* desktop three-column */
      #theme-circlelife .cl-header-inner--desktop {
        display: none;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-header-inner--desktop {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          column-gap: clamp(1.25rem, 2.5vw, 2rem);
        }
        #theme-circlelife .cl-header-inner--mobile {
          display: none !important;
        }
      }
      #theme-circlelife .cl-header-inner--mobile {
        display: flex;
        justify-content: space-between;
      }
      #theme-circlelife .cl-header-mobile-spacer {
        width: 5.5rem;
        flex: none;
      }

      #theme-circlelife .cl-header-center {
        display: flex;
        justify-content: center;
        justify-self: center;
        z-index: 2;
      }
      #theme-circlelife .cl-header-wing {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        min-width: 0;
        transition: gap 0.32s var(--cl-ease);
      }
      #theme-circlelife .cl-header-wing--left {
        justify-content: flex-end;
        justify-self: stretch;
        padding-right: 0.25rem;
      }
      #theme-circlelife .cl-header-wing--right {
        justify-content: flex-start;
        justify-self: stretch;
        gap: 0.85rem;
        padding-left: 0.25rem;
      }
      /* 收起：略紧凑，不硬拽贴 logo */
      #theme-circlelife .cl-header.is-scrolled .cl-header-wing--left.is-gathered {
        gap: 0.35rem;
      }
      #theme-circlelife .cl-header.is-scrolled .cl-header-wing--right.is-gathered {
        gap: 0.65rem;
      }
      #theme-circlelife .cl-header-wing--right .cl-main-nav {
        margin-right: 0.15rem;
      }

      #theme-circlelife .cl-header-actions {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        height: 2.25rem;
      }
      #theme-circlelife .cl-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.15rem;
        height: 2.15rem;
        padding: 0;
        border-radius: 9999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--cl-muted);
        line-height: 1;
        cursor: pointer;
        transition:
          color 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          transform 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-icon-btn i,
      #theme-circlelife .cl-icon-btn-glyph {
        font-size: 0.92rem;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #theme-circlelife .cl-icon-btn:hover {
        color: var(--cl-accent);
        border-color: var(--cl-border);
        background: var(--cl-accent-soft);
      }
      #theme-circlelife .cl-header.is-scrolled .cl-icon-btn,
      #theme-circlelife .cl-header.is-scrolled .cl-header-actions {
        height: 2rem;
      }
      #theme-circlelife .cl-header.is-scrolled .cl-icon-btn {
        width: 2rem;
        height: 2rem;
      }

      /* lockup — no clip on Chinese */
      #theme-circlelife .cl-brand:hover {
        opacity: 0.86;
      }
      #theme-circlelife .cl-lockup-cn {
        font-family: var(--cl-font-display);
        font-size: 1.02rem;
        line-height: 1.35;
        padding-top: 0.08em;
        padding-bottom: 0.06em;
        opacity: 1;
        /* never overflow:hidden — was clipping 时光的弧线 */
      }
      #theme-circlelife .cl-lockup-en {
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.16em;
        margin-top: 0.22rem;
        line-height: 1.2;
        transition: margin 0.22s var(--cl-ease), opacity 0.2s var(--cl-ease), font-size 0.22s var(--cl-ease);
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-cn {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-en {
        margin-top: 0;
        font-size: 0.58rem;
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-text {
        position: relative;
      }
            #theme-circlelife .cl-lockup--row {
        align-items: center;
      }
      #theme-circlelife .cl-lockup--row .cl-lockup-mark {
        display: block;
      }
      #theme-circlelife .cl-lockup-row-text {
        align-items: center;
        line-height: 1;
      }
      #theme-circlelife .cl-lockup--row .cl-lockup-cn--row {
        font-size: 0.95rem;
        line-height: 1;
        padding: 0;
        display: inline-flex;
        align-items: center;
      }
      #theme-circlelife .cl-lockup--row .cl-lockup-en--row {
        margin-top: 0;
        font-size: 0.58rem;
        line-height: 1;
        letter-spacing: 0.14em;
        display: inline-flex;
        align-items: center;
        transform: translateY(0.5px);
      }
      #theme-circlelife .cl-lockup-sep {
        color: var(--cl-accent);
        font-size: 0.85rem;
        line-height: 1;
        opacity: 0.95;
        transform: translateY(-0.5px);
      }

      #theme-circlelife .cl-nav-link {
        position: relative;
        color: var(--cl-muted);
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        transition:
          color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          padding 0.2s var(--cl-ease);
      }
      #theme-circlelife .cl-nav-link:hover {
        color: var(--cl-text);
        background: color-mix(in srgb, var(--cl-accent-soft) 55%, transparent);
      }
      #theme-circlelife .cl-nav-ico {
        font-size: 0.78rem;
        opacity: 0.85;
        width: 0.95em;
        text-align: center;
      }
      #theme-circlelife .cl-nav-text {
        display: inline-block;
        max-width: 6.5rem;
        opacity: 1;
        transition: opacity 0.18s var(--cl-ease), max-width 0.28s var(--cl-ease);
      }
      #theme-circlelife .cl-nav-link--icon {
        min-width: 1.85rem;
        min-height: 1.85rem;
        justify-content: center;
        padding-left: 0.4rem;
        padding-right: 0.4rem;
      }
      #theme-circlelife .cl-nav-link--icon .cl-nav-text,
      #theme-circlelife .cl-nav-link--icon .cl-nav-chevron {
        opacity: 0;
        max-width: 0;
        margin: 0;
        overflow: hidden;
        pointer-events: none;
      }
      #theme-circlelife .cl-nav-link--icon .cl-nav-ico {
        font-size: 0.9rem;
        opacity: 1;
      }
      #theme-circlelife .cl-nav-tip {
        position: absolute;
        left: 50%;
        top: calc(100% + 6px);
        transform: translateX(-50%) translateY(-2px);
        padding: 0.22rem 0.48rem;
        border-radius: var(--cl-radius-sm);
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
        color: var(--cl-text);
        font-size: 0.68rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s var(--cl-ease), transform 0.15s var(--cl-ease);
        z-index: 60;
      }
      #theme-circlelife .cl-nav-link--icon:hover .cl-nav-tip,
      #theme-circlelife .cl-nav-link--icon:focus-within .cl-nav-tip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      #theme-circlelife .cl-nav-link--text .cl-nav-tip {
        display: none;
      }

      /* reading progress */
      #theme-circlelife .cl-read-progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        pointer-events: none;
        background: color-mix(in srgb, var(--cl-border) 70%, transparent);
        overflow: hidden;
      }
      #theme-circlelife .cl-read-progress-bar {
        height: 100%;
        width: 100%;
        transform-origin: left center;
        transform: scaleX(0);
        background: var(--cl-accent);
        will-change: transform;
      }

      /* mobile drawer */
      .cl-drawer-root,
      .cl-drawer-root {
        position: fixed;
        inset: 0;
        z-index: 200;
        pointer-events: none;
        visibility: hidden;
      }
      .cl-drawer-root.is-open {
        pointer-events: auto;
        visibility: visible;
      }
      .cl-drawer-mask {
        position: absolute;
        inset: 0;
        border: 0;
        background: color-mix(in srgb, var(--cl-text) 35%, transparent);
        opacity: 0;
        transition: opacity 0.25s var(--cl-ease);
        cursor: pointer;
      }
      .cl-drawer-root.is-open .cl-drawer-mask {
        opacity: 1;
      }
      .cl-drawer-panel {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: min(20rem, 88vw);
        background: var(--cl-surface);
        border-left: 1px solid var(--cl-border);
        padding: 1rem 1.1rem 2rem;
        transform: translateX(104%);
        transition: transform 0.28s var(--cl-ease);
        overflow-y: auto;
        box-shadow: none;
      }
      .cl-drawer-root.is-open .cl-drawer-panel {
        transform: translateX(0);
      }
      .cl-drawer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px solid var(--cl-border);
      }
      .cl-drawer-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .cl-drawer-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 0.5rem;
        border: 0;
        background: transparent;
        color: var(--cl-text);
        font-size: 1rem;
        font-weight: 500;
        text-align: left;
        border-radius: var(--cl-radius-sm);
        cursor: pointer;
      }
      .cl-drawer-link:hover {
        background: color-mix(in srgb, var(--cl-accent-soft) 50%, transparent);
      }
      .cl-drawer-chevron {
        margin-left: auto;
        font-size: 0.7rem;
        opacity: 0.55;
        transition: transform 0.2s var(--cl-ease);
      }
      .cl-drawer-chevron.is-open {
        transform: rotate(180deg);
      }
      .cl-drawer-sub {
        list-style: none;
        margin: 0 0 0.35rem 1.85rem;
        padding: 0;
      }
      .cl-drawer-sublink {
        display: block;
        padding: 0.45rem 0.35rem;
        color: var(--cl-muted);
        font-size: 0.9rem;
      }

      
      /* portal drawer lives on body — duplicate tokens */
      .cl-drawer-root {
        --cl-bg: #f5f0e4;
        --cl-surface: #fcfaf4;
        --cl-text: #20190f;
        --cl-muted: #57493a;
        --cl-faint: #948574;
        --cl-border: rgba(32, 25, 15, 0.11);
        --cl-accent: #b24a33;
        --cl-accent-soft: #f0e0d6;
        --cl-radius-sm: 6px;
        --cl-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
        --cl-font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, monospace;
        font-family: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
      }
      html.dark .cl-drawer-root {
        --cl-bg: #14110e;
        --cl-surface: #1a1612;
        --cl-text: #f0e9dc;
        --cl-muted: #c2b7a4;
        --cl-faint: #8c8170;
        --cl-border: rgba(240, 233, 220, 0.12);
        --cl-accent: #e0a33e;
        --cl-accent-soft: #3a2e18;
      }

      /* author badge */
      #theme-circlelife .cl-author-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        overflow: hidden;
        flex: none;
        border: 1px solid var(--cl-border);
        background: var(--cl-paper-2);
      }
      #theme-circlelife .cl-author-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      #theme-circlelife .cl-author-initial {
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        color: var(--cl-muted);
        line-height: 1;
      }
      #theme-circlelife .cl-author-name {
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
      }
      #theme-circlelife .cl-deck-author {
        margin-right: 0.35rem;
      }
      #theme-circlelife .cl-deck-chip-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.35rem;
      }

      #theme-circlelife .cl-kicker {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--cl-font-mono);
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        color: var(--cl-accent);
        margin: 0;
      }
      #theme-circlelife .cl-kicker-sep {
        color: var(--cl-faint);
        letter-spacing: 0;
      }
      #theme-circlelife .cl-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.03em;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-meta a:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-meta-muted {
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-dot {
        margin: 0 0.35rem;
        color: var(--cl-faint);
      }
      #theme-circlelife .cl-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.18rem 0.6rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong);
        font-family: var(--cl-font-mono);
        font-size: 0.66rem;
        letter-spacing: 0.04em;
        color: var(--cl-muted);
        background: transparent;
        transition:
          border-color 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease);
        flex-shrink: 0;
      }
      #theme-circlelife .cl-chip--soft {
        border-color: var(--cl-border);
        background: color-mix(in srgb, var(--cl-paper-2) 40%, transparent);
      }
      #theme-circlelife .cl-chip:hover {
        border-color: var(--cl-accent);
        color: var(--cl-accent);
        background: var(--cl-accent-soft);
      }

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
      #theme-circlelife .cl-deck-outgoing.is-fly-next {
        transform: translateX(22%) rotate(5deg) translateY(-8px);
        opacity: 0;
        filter: blur(0.3px);
      }
      #theme-circlelife .cl-deck-outgoing.is-fly-prev {
        transform: translateX(-22%) rotate(-5deg) translateY(-8px);
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
      }
      #theme-circlelife .cl-hero-nav {
        width: 1.75rem;
        height: 1.75rem;
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

      /* —— TOC 细轨墨线 —— */
      #theme-circlelife .cl-toc {
        padding-left: 0.35rem;
        padding-right: 0.5rem;
      }
      #theme-circlelife .cl-toc-scroll {
        max-height: min(60vh, 22rem);
      }
      #theme-circlelife .cl-toc-nav {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding: 0.2rem 0 0.55rem 0.15rem;
        margin-left: 0.35rem;
        border-left: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-toc-item {
        position: relative;
        display: block;
        padding: 0.32rem 0.45rem 0.32rem 0.85rem;
        margin-left: -1px;
        border-left: 2px solid transparent;
        font-size: 0.78rem;
        line-height: 1.45;
        color: var(--cl-muted);
        background: transparent;
        transition: color 0.15s var(--cl-ease), border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-toc-item:hover {
        color: var(--cl-text);
        background: transparent;
      }
      #theme-circlelife .cl-toc-item.is-active {
        color: var(--cl-text);
        border-left-color: var(--cl-accent);
        font-weight: 500;
        background: transparent;
      }
      #theme-circlelife .cl-toc-item.is-active::before {
        content: '';
        position: absolute;
        left: -3.5px;
        top: 50%;
        width: 5px;
        height: 5px;
        border-radius: 9999px;
        background: var(--cl-accent);
        transform: translateY(-50%);
      }
      #theme-circlelife .cl-toc-item-text {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* —— Article cover band —— */
      #theme-circlelife .cl-article-card {
        padding: 0;
      }
      #theme-circlelife .cl-article-cover {
        position: relative;
        height: 180px;
        overflow: hidden;
        border-radius: var(--cl-radius) var(--cl-radius) 0 0;
        background: var(--cl-paper-2);
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-article-cover {
          height: 200px;
        }
      }
      @media (max-width: 640px) {
        #theme-circlelife .cl-article-cover {
          height: 150px;
        }
      }
      #theme-circlelife .cl-article-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
      }
      #theme-circlelife .cl-article-cover-fade {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 55%;
        pointer-events: none;
        background: linear-gradient(
          180deg,
          transparent 0%,
          color-mix(in srgb, var(--cl-surface) 55%, transparent) 55%,
          var(--cl-surface) 100%
        );
      }
      #theme-circlelife .cl-article-inner {
        position: relative;
        z-index: 1;
      }
      #theme-circlelife .cl-article-card .cl-article-hero {
        margin-top: 0;
      }

      /* —— Article —— */
      #theme-circlelife .cl-article-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem 0.15rem;
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        color: var(--cl-muted);
      }
      #theme-circlelife .cl-meta-author {
        color: var(--cl-text);
        font-weight: 500;
      }
      #theme-circlelife .cl-meta-category {
        margin-left: 0.15rem;
        font-family: var(--cl-font-body);
        font-size: 0.72rem;
        letter-spacing: 0.02em;
        text-transform: none;
      }
      #theme-circlelife .cl-article-meta .cl-dot {
        color: var(--cl-faint);
        margin: 0 0.15rem;
      }

      #theme-circlelife .cl-article-hero {
        margin-bottom: 1.35rem;
        padding-bottom: 1.1rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-article-title {
        font-family: var(--cl-font-display);
        font-size: clamp(1.55rem, 3.8vw, 2.05rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.28;
        color: var(--cl-text);
        margin: 0 0 0.7rem;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap {
        font-family: var(--cl-font-body);
        font-size: 1.02rem;
        line-height: 1.85;
        color: var(--cl-text);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion {
        color: var(--cl-text);
        font-size: inherit;
        line-height: inherit;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-page-content-inner {
        padding: 0 !important;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap h1,
      #theme-circlelife #article-wrapper.cl-prose-wrap h2,
      #theme-circlelife #article-wrapper.cl-prose-wrap h3,
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-h {
        font-family: var(--cl-font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
        margin-top: 1.6em;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link {
        color: var(--cl-accent) !important;
        border-bottom: 1px solid color-mix(in srgb, var(--cl-accent) 30%, transparent);
        transition: border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link:hover {
        border-bottom-color: var(--cl-accent);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-quote {
        border-left: 2px solid var(--cl-accent);
        padding-left: 1rem;
        margin: 1.25em 0;
        color: var(--cl-muted);
        font-family: var(--cl-font-display);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-code,
      #theme-circlelife #article-wrapper.cl-prose-wrap code {
        background: var(--cl-paper-2) !important;
        border-radius: var(--cl-radius-sm);
        border: 1px solid var(--cl-border);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-callout {
        border: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-paper-2) 45%, var(--cl-surface));
        border-radius: var(--cl-radius-sm);
      }

      
      /* desktop dropdown submenu (portal) */
      #theme-circlelife .cl-submenu,
      .cl-submenu {
        list-style: none;
        margin: 0;
        padding: 0.4rem 0;
        min-width: 11rem;
        border-radius: var(--cl-radius, 10px);
        border: 1px solid var(--cl-border, rgba(32, 25, 15, 0.13));
        background: var(--cl-surface, #fcfaf4) !important;
        color: var(--cl-text, #20190f);
        box-shadow: 0 8px 24px color-mix(in srgb, var(--cl-text, #20190f) 8%, transparent);
        z-index: 120;
      }
      html.dark .cl-submenu,
      .dark .cl-submenu {
        background: #1a1612 !important;
        border-color: rgba(240, 233, 220, 0.14);
        color: #f0e9dc;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
      }
      #theme-circlelife .cl-submenu-item,
      .cl-submenu-item {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      #theme-circlelife .cl-submenu-link,
      .cl-submenu-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1rem;
        color: inherit;
        font-size: 0.86rem;
        font-weight: 400;
        letter-spacing: 0.02em;
        text-decoration: none;
        transition: background 0.15s ease, color 0.15s ease;
      }
      #theme-circlelife .cl-submenu-link:hover,
      .cl-submenu-link:hover {
        background: var(--cl-accent-soft, #f0e0d6);
        color: var(--cl-accent, #b24a33);
      }
      html.dark .cl-submenu-link:hover,
      .dark .cl-submenu-link:hover {
        background: #3a2e18;
        color: #e0a33e;
      }
      .cl-submenu-ico {
        opacity: 0.7;
        font-size: 0.75rem;
      }

      /* back to top — content right gutter */
      #theme-circlelife .cl-backtop {
        position: fixed;
        z-index: 30;
        right: max(1rem, calc((100vw - 64rem) / 2 + 0.35rem));
        bottom: 1.75rem;
        width: 2.65rem;
        height: 2.65rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong, var(--cl-border));
        background: var(--cl-surface);
        color: var(--cl-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transform: translateY(10px);
        transition:
          opacity 0.28s var(--cl-ease),
          transform 0.28s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease),
          box-shadow 0.15s var(--cl-ease);
        box-shadow: 0 1px 0 color-mix(in srgb, var(--cl-text) 4%, transparent);
      }
      @media (max-width: 1024px) {
        #theme-circlelife .cl-backtop {
          right: 1.1rem;
        }
      }
      #theme-circlelife .cl-backtop.is-visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }
      #theme-circlelife .cl-backtop:hover {
        color: var(--cl-accent);
        border-color: var(--cl-accent);
        background: var(--cl-accent-soft);
        transform: translateY(-3px);
      }
      #theme-circlelife .cl-backtop-icon {
        font-size: 1.15rem;
        font-weight: 600;
        line-height: 1;
        font-family: var(--cl-font-body);
      }

/* —— Footer —— */
      #theme-circlelife .cl-footer {
        border-top: 1px solid var(--cl-border);
        background: transparent;
        padding-top: 1.75rem;
        padding-bottom: 1.75rem;
      }
      #theme-circlelife .cl-footer .cl-lockup--row {
        min-height: 1.75rem;
      }

      #theme-circlelife .cl-page-hero {
        margin-bottom: 1.5rem;
        padding-bottom: 0.9rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-page-hero h1 {
        font-family: var(--cl-font-display);
        font-size: 1.45rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin: 0;
      }

      #theme-circlelife .cl-archive-item {
        position: relative;
      }
      #theme-circlelife .cl-archive-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.7em;
        width: 5px;
        height: 5px;
        margin-left: -3px;
        border-radius: 9999px;
        background: var(--cl-accent);
        opacity: 0.55;
      }

      #theme-circlelife .cl-pager {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.9rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border-strong);
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--cl-text);
        background: transparent;
        transition:
          border-color 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-pager:hover:not(.cl-pager--disabled) {
        border-color: var(--cl-accent);
        color: var(--cl-accent);
        background: var(--cl-accent-soft);
      }
      #theme-circlelife .cl-pager--disabled {
        visibility: hidden;
        pointer-events: none;
      }

      
      /* —— Album: full-page snap + looping film cards —— */
      #theme-circlelife.cl-is-album #container-inner,
      #theme-circlelife.cl-is-album #container-wrapper {
        max-width: none;
        width: 100%;
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
        padding: 1rem 1.15rem;
        border-radius: 12px;
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
        font-size: 0.88rem;
        line-height: 1.65;
        color: var(--cl-muted);
        list-style: disc;
        padding-left: 1.75rem;
      }
      #theme-circlelife .cl-album-howto li + li {
        margin-top: 0.35rem;
      }
      #theme-circlelife .cl-album-howto strong {
        color: var(--cl-text);
        font-weight: 600;
      }

      /* vertical snap scroller: one album per screen */
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
        padding: 0.65rem 0 1rem;
        position: relative;
      }
      #theme-circlelife .cl-album-snap-hint {
        text-align: center;
        font-family: var(--cl-font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        color: var(--cl-faint);
        margin: 0.55rem 0 0;
        flex-shrink: 0;
      }

      /* —— single-album gallery —— */
      #theme-circlelife .cl-ag {
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
      #theme-circlelife .cl-ag-head {
        text-align: center;
        padding: 0.15rem 0.5rem 0.55rem;
        flex-shrink: 0;
      }
      #theme-circlelife .cl-ag-head-row {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      #theme-circlelife .cl-ag-album-name {
        font-family: var(--cl-font-display);
        font-size: clamp(1.35rem, 3.2vw, 1.85rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--cl-text);
        margin: 0;
        line-height: 1.2;
      }
      #theme-circlelife .cl-ag-count {
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        color: var(--cl-faint);
      }

      #theme-circlelife .cl-ag-stage {
        position: relative;
        flex: 1 1 auto;
        min-height: 12rem;
        height: clamp(16rem, 52dvh, 28rem);
        max-height: 58dvh;
        width: 100%;
        margin: 0 auto;
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        cursor: grab;
        overflow: visible;
      }
      #theme-circlelife .cl-ag-stage:active {
        cursor: grabbing;
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-ag-stage {
          height: clamp(18rem, 56dvh, 32rem);
          max-height: 62dvh;
        }
      }

      /* photo IS the card — no paper frame / white mat */
      #theme-circlelife .cl-ag-card {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        border-radius: 4px;
        overflow: hidden;
        box-shadow:
          0 1px 2px color-mix(in srgb, var(--cl-text) 6%, transparent),
          0 14px 36px color-mix(in srgb, var(--cl-text) 12%, transparent);
        transform-origin: center center;
        display: block;
        line-height: 0;
      }
      #theme-circlelife .cl-ag-card--main {
        z-index: 5;
        width: min(86vw, 28rem);
        max-height: 100%;
        transform: translate(-50%, -50%);
        will-change: transform;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-ag-card--main {
          width: min(62vw, 34rem);
        }
      }
      @media (min-width: 1100px) {
        #theme-circlelife .cl-ag-card--main {
          width: min(48vw, 38rem);
        }
      }
      #theme-circlelife .cl-ag-card--side {
        z-index: 3;
        width: min(42vw, 14rem);
        max-height: 78%;
        opacity: 0.72;
        filter: brightness(0.92);
        cursor: pointer;
        transition:
          transform 0.35s var(--cl-ease, ease),
          opacity 0.25s ease;
      }
      #theme-circlelife .cl-ag-card--side:hover {
        opacity: 0.9;
        filter: brightness(1);
      }
      #theme-circlelife .cl-ag-card--left {
        transform: translate(calc(-50% - min(38vw, 15.5rem)), -50%) scale(0.86)
          rotate(-4deg);
      }
      #theme-circlelife .cl-ag-card--right {
        transform: translate(calc(-50% + min(38vw, 15.5rem)), -50%) scale(0.86)
          rotate(4deg);
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-ag-card--left {
          transform: translate(calc(-50% - min(32vw, 18rem)), -50%) scale(0.84)
            rotate(-5deg);
        }
        #theme-circlelife .cl-ag-card--right {
          transform: translate(calc(-50% + min(32vw, 18rem)), -50%) scale(0.84)
            rotate(5deg);
        }
      }
      #theme-circlelife .cl-ag-card--far {
        z-index: 1;
        width: min(28vw, 10rem);
        max-height: 58%;
        opacity: 0.35;
        filter: brightness(0.85);
        pointer-events: none;
      }
      #theme-circlelife .cl-ag-card--left2 {
        transform: translate(calc(-50% - min(58vw, 26rem)), -50%) scale(0.7)
          rotate(-8deg);
      }
      #theme-circlelife .cl-ag-card--right2 {
        transform: translate(calc(-50% + min(58vw, 26rem)), -50%) scale(0.7)
          rotate(8deg);
      }
      @media (max-width: 639px) {
        #theme-circlelife .cl-ag-card--far {
          display: none;
        }
        #theme-circlelife .cl-ag-card--left {
          transform: translate(calc(-50% - min(48vw, 9.5rem)), -50%) scale(0.78)
            rotate(-3deg);
          opacity: 0.55;
        }
        #theme-circlelife .cl-ag-card--right {
          transform: translate(calc(-50% + min(48vw, 9.5rem)), -50%) scale(0.78)
            rotate(3deg);
          opacity: 0.55;
        }
      }

      #theme-circlelife .cl-ag-img {
        display: block;
        width: 100%;
        height: auto;
        max-height: inherit;
        object-fit: contain;
        object-position: center;
        background: transparent;
        pointer-events: none;
        -webkit-user-drag: none;
      }
      #theme-circlelife .cl-ag-img--main {
        max-height: min(52dvh, 28rem);
        width: 100%;
        height: auto;
      }
      @media (min-width: 900px) {
        #theme-circlelife .cl-ag-img--main {
          max-height: min(56dvh, 32rem);
        }
      }
      #theme-circlelife .cl-ag-card--side .cl-ag-img,
      #theme-circlelife .cl-ag-card--far .cl-ag-img {
        max-height: min(40dvh, 18rem);
        width: 100%;
      }
      #theme-circlelife .cl-ag-placeholder {
        width: min(70vw, 20rem);
        height: 12rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cl-paper-2, var(--cl-surface));
        color: var(--cl-faint);
        font-family: var(--cl-font-mono);
        font-size: 0.75rem;
        border-radius: 4px;
        border: 1px dashed var(--cl-border);
        line-height: 1.4;
      }

      #theme-circlelife .cl-ag-arrows {
        position: absolute;
        inset: 0;
        z-index: 8;
        display: none;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
        padding: 0 0.25rem;
      }
      @media (min-width: 768px) {
        #theme-circlelife .cl-ag-arrows {
          display: flex;
          padding: 0 0.5rem;
        }
      }
      #theme-circlelife .cl-ag-arrow {
        pointer-events: auto;
        width: 2.4rem;
        height: 2.4rem;
        border-radius: 9999px;
        border: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-surface) 92%, transparent);
        color: var(--cl-text);
        font-size: 1.35rem;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(6px);
        transition:
          color 0.15s ease,
          border-color 0.15s ease,
          background 0.15s ease,
          transform 0.15s ease;
      }
      #theme-circlelife .cl-ag-arrow:hover {
        color: var(--cl-accent);
        border-color: var(--cl-accent);
        background: var(--cl-accent-soft, color-mix(in srgb, var(--cl-accent) 12%, var(--cl-surface)));
        transform: translateY(-1px);
      }

      #theme-circlelife .cl-ag-caption {
        text-align: center;
        padding: 0.65rem 0.75rem 0.15rem;
        flex-shrink: 0;
      }
      #theme-circlelife .cl-ag-title {
        font-family: var(--cl-font-display);
        font-size: 1.2rem;
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
        padding: 0.45rem 0 0.1rem;
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

      #theme-circlelife .cl-ag-lightbox {
        position: fixed;
        inset: 0;
        z-index: 180;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      #theme-circlelife .cl-ag-lightbox-mask {
        position: absolute;
        inset: 0;
        border: 0;
        background: color-mix(in srgb, var(--cl-text) 48%, transparent);
        cursor: pointer;
      }
      #theme-circlelife .cl-ag-lightbox-panel {
        position: relative;
        z-index: 1;
        width: min(100%, 40rem);
        max-height: min(92dvh, 48rem);
        overflow: auto;
        border-radius: 12px;
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
        box-shadow: 0 18px 48px color-mix(in srgb, var(--cl-text) 22%, transparent);
      }
      #theme-circlelife .cl-ag-lightbox-close {
        position: absolute;
        top: 0.65rem;
        right: 0.65rem;
        z-index: 2;
        background: var(--cl-surface);
      }
      #theme-circlelife .cl-ag-lightbox-img {
        width: 100%;
        max-height: 72dvh;
        height: auto;
        object-fit: contain;
        display: block;
        background: color-mix(in srgb, var(--cl-text) 4%, var(--cl-surface));
      }
      #theme-circlelife .cl-ag-lightbox-body {
        padding: 1rem 1.15rem 1.25rem;
        text-align: center;
      }
      #theme-circlelife .cl-ag-lightbox-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.85rem;
        margin-top: 0.85rem;
      }

      /* media hooks reserved */
      #theme-circlelife .cl-media-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
      }
      @media (max-width: 640px) {
        #theme-circlelife .cl-media-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      #theme-circlelife .cl-media-card {
        display: block;
        overflow: hidden;
        border-radius: var(--cl-media-radius);
        border: 1px solid var(--cl-border);
        background: var(--cl-paper-2);
        aspect-ratio: var(--cl-media-ratio);
      }
      #theme-circlelife .cl-media-card--sm {
        width: 5.25rem;
        height: 5.25rem;
        flex-shrink: 0;
        aspect-ratio: 1;
      }

      #theme-circlelife .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      #theme-circlelife .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      ${themeConsoleStyle('circlelife', CONFIG)}
    `}</style>
  )
}

export { Style }
