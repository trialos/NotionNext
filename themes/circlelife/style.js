/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

/**
 * Circle of Life — 抽牌报头 + 细条顶栏 + 封面映射
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

      /* —— Header —— */
      #theme-circlelife .cl-header {
        background-color: color-mix(in srgb, var(--cl-bg) 90%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid transparent;
        transition:
          border-color var(--cl-dur) var(--cl-ease),
          background-color var(--cl-dur) var(--cl-ease),
          box-shadow var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-header.is-scrolled {
        border-bottom-color: var(--cl-border);
        background-color: color-mix(in srgb, var(--cl-bg) 96%, transparent);
      }
      #theme-circlelife .cl-header-inner {
        margin: 0 auto;
        max-width: 48rem;
        display: flex;
        align-items: center;
        gap: 0.75rem 1rem;
        padding: 0.9rem 1rem;
        min-height: 3.75rem;
        transition:
          padding var(--cl-dur) var(--cl-ease),
          min-height var(--cl-dur) var(--cl-ease),
          gap var(--cl-dur) var(--cl-ease);
      }
      #theme-circlelife .cl-header.is-scrolled .cl-header-inner {
        padding-top: 0.35rem;
        padding-bottom: 0.35rem;
        min-height: 2.85rem;
        gap: 0.5rem 0.65rem;
      }
      #theme-circlelife .cl-lockup--collapsed .cl-lockup-en {
        letter-spacing: 0.14em;
      }
      #theme-circlelife .cl-nav-link--icon {
        position: relative;
        min-width: 2rem;
        min-height: 2rem;
      }
      #theme-circlelife .cl-nav-link--icon .cl-nav-ico {
        font-size: 0.92rem;
        width: 1.1em;
        text-align: center;
      }
      #theme-circlelife .cl-nav-link--icon .cl-nav-text {
        display: none;
      }
      #theme-circlelife .cl-nav-tip {
        position: absolute;
        left: 50%;
        top: calc(100% + 6px);
        transform: translateX(-50%) translateY(-2px);
        padding: 0.28rem 0.55rem;
        border-radius: var(--cl-radius-sm);
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
        color: var(--cl-text);
        font-size: 0.72rem;
        font-family: var(--cl-font-body);
        letter-spacing: 0.02em;
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
      #theme-circlelife .cl-header.is-scrolled .cl-nav-link:not(.cl-nav-link--icon) .cl-nav-text {
        /* when collapsed class not applied yet */
      }
      #theme-circlelife .cl-nav--collapsed .cl-nav-chevron {
        margin-left: 0.15rem;
      }
      #theme-circlelife .cl-header-nav {
        overflow-x: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      #theme-circlelife .cl-header-nav::-webkit-scrollbar {
        display: none;
      }
      #theme-circlelife .cl-header-actions {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: 0.15rem;
      }
      #theme-circlelife .cl-brand:hover {
        opacity: 0.86;
      }
      #theme-circlelife .cl-lockup-cn {
        font-family: var(--cl-font-display);
      }
      #theme-circlelife .cl-lockup-en {
        font-family: var(--cl-font-mono);
      }
      #theme-circlelife .cl-nav-link {
        color: var(--cl-muted);
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        transition: color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-nav-link:hover {
        color: var(--cl-text);
      }
      #theme-circlelife .cl-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.15rem;
        height: 2.15rem;
        border-radius: 9999px;
        color: var(--cl-muted);
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        transition:
          background 0.15s var(--cl-ease),
          color 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-icon-btn:hover {
        color: var(--cl-text);
        background: var(--cl-accent-soft);
        border-color: var(--cl-border);
      }
      #theme-circlelife .cl-backtop {
        border: 1px solid var(--cl-border);
        background: var(--cl-surface);
      }

      /* —— Type —— */
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

      /* —— Hero deck (抽牌) —— */
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
        perspective: 1200px;
      }
      #theme-circlelife .cl-deck-under,
      #theme-circlelife .cl-deck-top {
        position: absolute;
        inset: 0;
      }
      #theme-circlelife .cl-deck-under {
        z-index: 0;
        transform: translateY(10px) scale(0.975);
        opacity: 0.72;
        filter: saturate(0.92);
      }
      #theme-circlelife .cl-deck-top {
        z-index: 1;
        transform-origin: 70% 100%;
        transition:
          transform 0.34s var(--cl-ease),
          opacity 0.34s var(--cl-ease),
          filter 0.34s var(--cl-ease);
      }
      #theme-circlelife .cl-deck.is-out-next .cl-deck-top {
        transform: translateX(18%) rotate(4deg) translateY(-6px);
        opacity: 0;
        filter: blur(0.4px);
      }
      #theme-circlelife .cl-deck.is-out-prev .cl-deck-top {
        transform: translateX(-18%) rotate(-4deg) translateY(-6px);
        opacity: 0;
        filter: blur(0.4px);
      }
      #theme-circlelife .cl-deck.is-out-next .cl-deck-under,
      #theme-circlelife .cl-deck.is-out-prev .cl-deck-under {
        transform: translateY(0) scale(1);
        opacity: 1;
        transition:
          transform 0.34s var(--cl-ease),
          opacity 0.34s var(--cl-ease);
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
        background:
          linear-gradient(
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
      #theme-circlelife .cl-hero-toolbar,
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
      #theme-circlelife .cl-hero-meta,
      #theme-circlelife .cl-latest-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }
      #theme-circlelife .cl-hero-dots,
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
      #theme-circlelife .cl-toc-card h3,
      #theme-circlelife .cl-sidebar-title {
        border-bottom: 1px solid var(--cl-border);
        background: transparent;
        padding: 0.65rem 0.9rem;
        margin: 0;
        font-size: 0.68rem;
        letter-spacing: 0.12em;
        color: var(--cl-faint);
      }

      /* —— TOC —— */
      #theme-circlelife .cl-toc-scroll {
        max-height: 22rem;
      }
      #theme-circlelife .cl-toc-nav {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        padding: 0.25rem 0 0.5rem;
      }
      #theme-circlelife .cl-toc-item {
        display: block;
        padding: 0.35rem 0.55rem 0.35rem 0.6rem;
        border-left: 2px solid transparent;
        font-size: 0.8rem;
        line-height: 1.4;
        color: var(--cl-muted);
        transition:
          color 0.15s var(--cl-ease),
          border-color 0.15s var(--cl-ease),
          background 0.15s var(--cl-ease);
      }
      #theme-circlelife .cl-toc-item:hover {
        color: var(--cl-text);
        background: color-mix(in srgb, var(--cl-paper-2) 35%, transparent);
      }
      #theme-circlelife .cl-toc-item.is-active {
        color: var(--cl-accent);
        border-left-color: var(--cl-accent);
        font-weight: 500;
        background: var(--cl-accent-soft);
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

      /* —— Footer —— */
      #theme-circlelife .cl-footer {
        border-top: 1px solid var(--cl-border);
        background: transparent;
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
