/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

/**
 * Circle of Life — 贴近封面工具 theme-ink 的纸感
 * 含影集预留钩子（.cl-media-*），无 Geo
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
        --cl-border: rgba(32, 25, 15, 0.12);
        --cl-border-strong: rgba(32, 25, 15, 0.24);
        --cl-accent: #b24a33;
        --cl-accent-press: #97402b;
        --cl-accent-soft: #ebdacd;
        --cl-accent-ink: #fcfaf4;
        --cl-radius: 12px;
        --cl-radius-sm: 8px;
        --cl-shadow-sm: 0 1px 2px rgba(32, 25, 15, 0.04);
        --cl-shadow-md: 0 8px 24px rgba(32, 25, 15, 0.06);
        --cl-font-display: 'Newsreader', 'Noto Serif SC', 'Songti SC', serif;
        --cl-font-body: 'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif;
        --cl-font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, monospace;
        --cl-media-radius: 12px;
        --cl-media-ratio: 4 / 3;

        background-color: var(--cl-bg);
        color: var(--cl-text);
        font-family: var(--cl-font-body);
        -webkit-font-smoothing: antialiased;
      }

      .dark #theme-circlelife {
        --cl-bg: #14110e;
        --cl-surface: #1e1a15;
        --cl-paper-2: #1c1814;
        --cl-paper-3: #261f18;
        --cl-text: #f0e9dc;
        --cl-muted: #c2b7a4;
        --cl-faint: #8c8170;
        --cl-border: rgba(240, 233, 220, 0.12);
        --cl-border-strong: rgba(240, 233, 220, 0.24);
        --cl-accent: #e0a33e;
        --cl-accent-press: #c98a26;
        --cl-accent-soft: #3a2e18;
        --cl-accent-ink: #14110e;
        --cl-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
        --cl-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.28);
      }

      #theme-circlelife a {
        color: inherit;
        text-decoration: none;
      }

      /* —— Header —— */
      #theme-circlelife .cl-header {
        background-color: color-mix(in srgb, var(--cl-bg) 86%, transparent);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--cl-border);
      }

      #theme-circlelife .cl-header-inner {
        margin: 0 auto;
        max-width: 48rem;
        display: flex;
        align-items: center;
        gap: 0.75rem 1rem;
        padding: 0.85rem 1rem;
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
        gap: 0.2rem;
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
        font-weight: 500;
        white-space: nowrap;
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
        border: 1.5px solid transparent;
        background: transparent;
        cursor: pointer;
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

      /* —— Type helpers —— */
      #theme-circlelife .cl-kicker {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
        font-family: var(--cl-font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: none;
        color: var(--cl-accent);
        margin-bottom: 0.65rem;
      }
      #theme-circlelife .cl-kicker-sep {
        color: var(--cl-faint);
        letter-spacing: 0;
      }

      #theme-circlelife .cl-meta,
      #theme-circlelife .cl-timeline-day-label,
      #theme-circlelife .cl-sidebar-title {
        font-family: var(--cl-font-mono);
        letter-spacing: 0.04em;
      }

      #theme-circlelife .cl-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.15rem 0.15rem;
        font-size: 0.75rem;
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
        padding: 0.2rem 0.65rem;
        border-radius: 9999px;
        border: 1.5px solid var(--cl-border-strong);
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.04em;
        color: var(--cl-muted);
        background: transparent;
        transition:
          border-color 0.15s ease,
          color 0.15s ease,
          background 0.15s ease;
        flex-shrink: 0;
      }
      #theme-circlelife .cl-chip--soft {
        border-color: var(--cl-border);
        background: color-mix(in srgb, var(--cl-paper-2) 55%, transparent);
      }
      #theme-circlelife .cl-chip:hover {
        border-color: var(--cl-accent);
        color: var(--cl-accent);
        background: var(--cl-accent-soft);
      }

      /* —— Home masthead / latest —— */
      #theme-circlelife .cl-latest-card {
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius);
        box-shadow: var(--cl-shadow-sm);
        padding: 1.35rem 1.4rem 1.25rem;
        margin-bottom: 2.25rem;
      }
      #theme-circlelife .cl-latest-title {
        display: block;
        font-family: var(--cl-font-display);
        font-size: clamp(1.35rem, 3.2vw, 1.75rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.3;
        color: var(--cl-text);
        margin: 0 0 0.55rem;
      }
      #theme-circlelife .cl-latest-title:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-latest-summary {
        margin: 0;
        font-size: 0.9375rem;
        line-height: 1.7;
        color: var(--cl-muted);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      #theme-circlelife .cl-latest-meta {
        margin-top: 1rem;
        padding-top: 0.85rem;
        border-top: 1px solid var(--cl-border);
      }

      /* —— Timeline —— */
      #theme-circlelife .cl-timeline {
        padding-bottom: 2rem;
      }
      #theme-circlelife .cl-timeline-day {
        margin-bottom: 2.75rem;
      }
      #theme-circlelife .cl-timeline-day-label {
        font-size: 0.72rem;
        font-weight: 500;
        color: var(--cl-faint);
        margin: 0 0 1.1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-timeline-rail {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      #theme-circlelife .cl-timeline-item {
        position: relative;
        padding: 0 0 1.35rem 1.15rem;
      }
      #theme-circlelife .cl-timeline-item:last-child {
        padding-bottom: 0;
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
        opacity: 0.8;
      }

      #theme-circlelife .cl-timeline-post-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.45rem 0.65rem;
      }

      #theme-circlelife .cl-post-title {
        font-family: var(--cl-font-display);
        font-size: 1.0625rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1.4;
        color: var(--cl-text);
      }
      #theme-circlelife .cl-post-title:hover {
        color: var(--cl-accent);
      }
      #theme-circlelife .cl-post-summary {
        margin: 0.4rem 0 0;
        font-size: 0.875rem;
        line-height: 1.65;
        color: var(--cl-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      #theme-circlelife .cl-list-post {
        padding: 1.15rem 0;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-list-post:last-child {
        border-bottom: 0;
      }

      /* —— Cards / TOC —— */
      #theme-circlelife .cl-card {
        background: var(--cl-surface);
        border: 1px solid var(--cl-border);
        border-radius: var(--cl-radius);
        box-shadow: var(--cl-shadow-sm);
      }
      #theme-circlelife .cl-sidebar-title,
      #theme-circlelife .cl-toc-card h3 {
        border-bottom: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-bg) 70%, var(--cl-surface));
        padding: 0.7rem 1rem;
        margin: 0;
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        color: var(--cl-muted);
      }

      /* —— Article —— */
      #theme-circlelife .cl-article-hero {
        margin-bottom: 1.5rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-article-title {
        font-family: var(--cl-font-display);
        font-size: clamp(1.65rem, 4vw, 2.15rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.25;
        color: var(--cl-text);
        margin: 0 0 0.75rem;
      }
      #theme-circlelife .cl-article-meta {
        margin-top: 0.15rem;
      }

      #theme-circlelife #article-wrapper.cl-prose-wrap {
        font-family: var(--cl-font-body);
        font-size: 1.02rem;
        line-height: 1.8;
        color: var(--cl-text);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion {
        color: var(--cl-text);
        font-size: inherit;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap h1,
      #theme-circlelife #article-wrapper.cl-prose-wrap h2,
      #theme-circlelife #article-wrapper.cl-prose-wrap h3 {
        font-family: var(--cl-font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-link {
        color: var(--cl-accent) !important;
        border-bottom: 1px solid color-mix(in srgb, var(--cl-accent) 35%, transparent);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-quote {
        border-left: 3px solid var(--cl-accent);
        padding-left: 1rem;
        color: var(--cl-muted);
        font-family: var(--cl-font-display);
      }
      #theme-circlelife #article-wrapper.cl-prose-wrap .notion-code,
      #theme-circlelife #article-wrapper.cl-prose-wrap code {
        background: var(--cl-paper-2) !important;
        border-radius: var(--cl-radius-sm);
      }

      /* —— Footer —— */
      #theme-circlelife .cl-footer {
        border-top: 1px solid var(--cl-border);
        background: color-mix(in srgb, var(--cl-bg) 88%, var(--cl-paper-2));
      }

      #theme-circlelife .cl-page-hero {
        margin-bottom: 1.75rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--cl-border);
      }
      #theme-circlelife .cl-page-hero h1 {
        font-family: var(--cl-font-display);
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin: 0;
      }

      /* —— Archive rail —— */
      #theme-circlelife .cl-archive-item {
        position: relative;
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

      /* —— Pager —— */
      #theme-circlelife .cl-pager {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.45rem 0.95rem;
        border-radius: 9999px;
        border: 1.5px solid var(--cl-border-strong);
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--cl-text);
        background: transparent;
        transition:
          border-color 0.15s ease,
          color 0.15s ease,
          background 0.15s ease;
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

      /* —— Media hooks（影集预留） —— */
      #theme-circlelife .cl-media-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
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
        box-shadow: var(--cl-shadow-sm);
      }
      #theme-circlelife .cl-media-card--sm {
        width: 5.5rem;
        height: 5.5rem;
        flex-shrink: 0;
        aspect-ratio: 1;
      }
      #theme-circlelife .cl-media-caption {
        font-family: var(--cl-font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.06em;
        color: var(--cl-faint);
        margin-top: 0.4rem;
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
