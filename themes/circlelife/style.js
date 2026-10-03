/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

/**
 * Circle of Life：封面工具 theme-ink 气质
 * 仅作用于 #theme-circlelife；无 Geo 几何背景。
 */
const Style = () => {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@500&family=Newsreader:ital,wght@0,500;0,600;1,500&family=Noto+Sans+SC:wght@400;500&family=Noto+Serif+SC:wght@500;600&display=swap');

      #theme-circlelife {
        /* 墨弧 Ink — 与 xhs_wx_onepass theme-ink 对齐 */
        --cl-bg: #f5f0e4;
        --cl-surface: #fcfaf4;
        --cl-paper-2: #eae1cf;
        --cl-text: #20190f;
        --cl-muted: #57493a;
        --cl-faint: #948574;
        --cl-border: rgba(32, 25, 15, 0.13);
        --cl-border-strong: rgba(32, 25, 15, 0.26);
        --cl-accent: #b24a33;
        --cl-accent-press: #97402b;
        --cl-accent-soft: #ebdacd;
        --cl-accent-ink: #fcfaf4;
        --cl-radius: 10px;
        --cl-font-display: 'Newsreader', 'Noto Serif SC', 'Songti SC', serif;
        --cl-font-body: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
        --cl-font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, monospace;

        background-color: var(--cl-bg);
        color: var(--cl-text);
        font-family: var(--cl-font-body);
      }

      .dark #theme-circlelife {
        /* 弱 dusk：阅读向暗色，不作默认壳 */
        --cl-bg: #14110e;
        --cl-surface: #1e1a15;
        --cl-paper-2: #1c1814;
        --cl-text: #f0e9dc;
        --cl-muted: #c2b7a4;
        --cl-faint: #8c8170;
        --cl-border: rgba(240, 233, 220, 0.12);
        --cl-border-strong: rgba(240, 233, 220, 0.24);
        --cl-accent: #e0a33e;
        --cl-accent-press: #c98a26;
        --cl-accent-soft: #3a2e18;
        --cl-accent-ink: #14110e;
      }

      #theme-circlelife a {
        color: inherit;
      }

      #theme-circlelife .cl-header {
        background-color: color-mix(in srgb, var(--cl-bg) 88%, transparent);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--cl-border);
        overflow: visible;
      }

      #theme-circlelife .cl-brand:hover {
        opacity: 0.88;
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
        font-family: var(--cl-font-body);
        transition: color 0.15s ease;
      }

      #theme-circlelife .cl-nav-link:hover {
        color: var(--cl-text);
      }

      #theme-circlelife .cl-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 9999px;
        color: var(--cl-muted);
        border: 1px solid transparent;
        transition:
          background 0.15s ease,
          color 0.15s ease,
          border-color 0.15s ease;
      }

      #theme-circlelife .cl-icon-btn:hover {
        color: var(--cl-text);
        background: var(--cl-accent-soft);
        border-color: var(--cl-border);
      }

      #theme-circlelife .cl-meta,
      #theme-circlelife .cl-timeline-day-label,
      #theme-circlelife time,
      #theme-circlelife .cl-archive-item > span:first-child {
        font-family: var(--cl-font-mono);
        letter-spacing: 0.02em;
      }

      #theme-circlelife .cl-timeline {
        padding-bottom: 3rem;
      }

      #theme-circlelife .cl-timeline-day {
        margin-bottom: 2.5rem;
      }

      #theme-circlelife .cl-timeline-day-label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--cl-muted);
        margin: 0 0 1rem;
        padding-bottom: 0.35rem;
        border-bottom: 1px solid var(--cl-border);
        text-transform: none;
      }

      #theme-circlelife .cl-timeline-rail {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      #theme-circlelife .cl-timeline-item {
        position: relative;
        padding-left: 1.1rem;
        margin-bottom: 0.35rem;
      }

      #theme-circlelife .cl-timeline-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.55em;
        width: 6px;
        height: 6px;
        border-radius: 9999px;
        background: var(--cl-accent);
        opacity: 0.75;
      }

      #theme-circlelife .cl-card {
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius);
      }

      #theme-circlelife .cl-latest-card {
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius);
        padding: 1.25rem 1.35rem;
        margin-bottom: 2rem;
      }

      #theme-circlelife .cl-latest-card h3 {
        font-family: var(--cl-font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      #theme-circlelife #article-wrapper.cl-prose-wrap {
        font-family: var(--cl-font-body);
        line-height: 1.75;
        color: var(--cl-text);
      }

      #theme-circlelife #article-wrapper.cl-prose-wrap .notion {
        color: var(--cl-text);
      }

      #theme-circlelife #article-wrapper.cl-prose-wrap h1,
      #theme-circlelife #article-wrapper.cl-prose-wrap h2,
      #theme-circlelife #article-wrapper.cl-prose-wrap h3 {
        font-family: var(--cl-font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      #theme-circlelife .cl-article-hero {
        margin-bottom: 1.75rem;
      }

      #theme-circlelife .cl-article-title {
        font-family: var(--cl-font-display);
        font-size: clamp(1.75rem, 4vw, 2.25rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.25;
        color: var(--cl-text);
        margin: 0 0 0.75rem;
      }

      #theme-circlelife .cl-footer {
        border-top: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-bg) 92%, var(--cl-paper-2));
        color: var(--cl-muted);
      }

      #theme-circlelife .cl-page-hero {
        margin-bottom: 2rem;
      }

      #theme-circlelife .cl-page-hero h1 {
        font-family: var(--cl-font-display);
      }

      #theme-circlelife .cl-archive-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.7em;
        width: 6px;
        height: 6px;
        margin-left: -3.5px;
        border-radius: 9999px;
        background: var(--cl-accent);
        opacity: 0.55;
      }

      #theme-circlelife .cl-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.75rem;
        border-radius: 9999px;
        border: 1.5px solid var(--cl-border-strong);
        font-size: 0.8125rem;
        color: var(--cl-muted);
        background: transparent;
        transition:
          border-color 0.15s ease,
          color 0.15s ease,
          background 0.15s ease;
      }

      #theme-circlelife .cl-chip:hover {
        border-color: var(--cl-accent);
        color: var(--cl-accent);
        background: var(--cl-accent-soft);
      }

      #theme-circlelife .cl-pager {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.9rem;
        border-radius: 9999px;
        border: 1.5px solid var(--cl-border-strong);
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--cl-text);
        background: transparent;
        transition:
          border-color 0.15s ease,
          color 0.15s ease;
      }

      #theme-circlelife .cl-pager:hover:not(.cl-pager--disabled) {
        border-color: var(--cl-accent);
        color: var(--cl-accent);
      }

      #theme-circlelife .cl-pager--disabled {
        visibility: hidden;
        pointer-events: none;
      }

      #theme-circlelife .cl-timeline-post a,
      #theme-circlelife .cl-latest-card a {
        transition: color 0.15s ease;
      }

      #theme-circlelife .notion-link {
        color: var(--cl-accent) !important;
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
