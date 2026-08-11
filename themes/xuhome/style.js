/* eslint-disable react/no-unknown-property */
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'
import CONFIG from './config'

const Style = () => {
  return (
    <style jsx global>{`
      #theme-xuhome {
        --xuhome-primary: #0284c7;
        --xuhome-primary-hover: #0ea5e9;
        --xuhome-accent: #fde68a;
        --xuhome-bg-light: #faf8f5;
        --xuhome-surface-light: #ffffff;
        --xuhome-text-light: #0f172a;
        --xuhome-muted-light: #475569;
        --xuhome-bg-dark: #0f172a;
        --xuhome-surface-dark: #1e293b;
        --xuhome-text-dark: #f1f5f9;
        --xuhome-muted-dark: #94a3b8;
        background-color: var(--xuhome-bg-light);
        color: var(--xuhome-text-light);
      }
      .dark #theme-xuhome {
        background-color: var(--xuhome-bg-dark);
        color: var(--xuhome-text-dark);
      }

      #theme-xuhome ::selection {
        background: var(--xuhome-accent);
        color: var(--xuhome-primary);
      }

      #theme-xuhome #article-wrapper,
      #theme-xuhome #notion-article {
        font-size: 1rem;
        line-height: 1.85;
      }

      #theme-xuhome #notion-article h1 {
        font-size: 1.75rem;
        font-weight: 800;
        margin: 1.5em 0 0.5em;
      }
      #theme-xuhome #notion-article h2 {
        font-size: 1.35rem;
        font-weight: 800;
        margin: 1.4em 0 0.4em;
        border-bottom: 3px solid var(--xuhome-primary);
        padding-bottom: 0.3em;
      }
      #theme-xuhome #notion-article h3 {
        font-size: 1.15rem;
        font-weight: 800;
        margin: 1.2em 0 0.3em;
      }

      #theme-xuhome #notion-article a {
        color: var(--xuhome-primary);
        font-weight: 700;
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }
      #theme-xuhome #notion-article a:hover {
        color: var(--xuhome-primary-hover);
      }

      #theme-xuhome #notion-article code {
        font-size: 0.875em;
        border-radius: 0.125rem;
        padding: 0.2em 0.4em;
        background: var(--xuhome-accent);
        color: var(--xuhome-primary);
        font-weight: 600;
        font-family:
          ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      }
      .dark #theme-xuhome #notion-article code {
        background: #334155;
        color: var(--xuhome-accent);
      }

      #theme-xuhome #notion-article pre {
        border-radius: 0.125rem;
        padding: 16px;
        overflow-x: auto;
        background: #f8fafc;
        border: 2px solid var(--xuhome-primary);
        font-size: 0.8125rem;
        line-height: 1.5;
      }
      .dark #theme-xuhome #notion-article pre {
        background: var(--xuhome-surface-dark);
      }

      #theme-xuhome #notion-article blockquote {
        border-left: 4px solid var(--xuhome-accent);
        padding: 0.5em 1em;
        margin: 1em 0;
        background: rgba(253, 230, 138, 0.1);
        font-weight: 500;
      }
      .dark #theme-xuhome #notion-article blockquote {
        background: rgba(253, 230, 138, 0.05);
      }

      #theme-xuhome #notion-article hr {
        border: none;
        height: 3px;
        background: var(--xuhome-primary);
        margin: 2em 0;
      }

      #theme-xuhome #notion-article table {
        border-spacing: 0;
        border-collapse: collapse;
      }
      #theme-xuhome #notion-article th,
      #theme-xuhome #notion-article td {
        padding: 8px 12px;
        border: 2px solid var(--xuhome-primary);
      }
      #theme-xuhome #notion-article th {
        font-weight: 800;
        background: var(--xuhome-accent);
        color: var(--xuhome-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .dark #theme-xuhome #notion-article th {
        background: #334155;
        color: var(--xuhome-accent);
        border-color: var(--xuhome-primary);
      }

      #theme-xuhome #notion-article img {
        max-width: 100%;
        border-radius: 0.125rem;
        border: 3px solid var(--xuhome-primary);
      }

      #theme-xuhome #notion-article .notion-bookmark {
        border: 2px solid var(--xuhome-primary);
        border-radius: 0.125rem;
        box-shadow: 4px 4px 0 0 var(--xuhome-primary);
      }
      .dark #theme-xuhome #notion-article .notion-bookmark {
        background: var(--xuhome-surface-dark);
      }
      #theme-xuhome #notion-article .notion-bookmark a {
        font-weight: 600;
        text-decoration: none;
      }

      #theme-xuhome ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      #theme-xuhome ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      #theme-xuhome ::-webkit-scrollbar-thumb {
        background: var(--xuhome-primary);
        border-radius: 0;
      }
      #theme-xuhome ::-webkit-scrollbar-thumb:hover {
        background: var(--xuhome-primary-hover);
      }
      .dark #theme-xuhome ::-webkit-scrollbar-track {
        background: var(--xuhome-surface-dark);
      }

      ${themeConsoleStyle('xuhome', CONFIG)}
    `}</style>
  )
}

export { Style }
