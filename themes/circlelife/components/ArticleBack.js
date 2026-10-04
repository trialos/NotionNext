import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { resolveArticleBackHref } from './articleBackHref'

/**
 * 文章返回：回到进文前页面（不受目录 # 历史影响）
 */
export default function ArticleBack({ className = '', postId = '' }) {
  const router = useRouter()
  const targetRef = useRef('/')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = postId ? `cl-article-from:${postId}` : 'cl-article-from'
    let stored = ''
    try {
      stored = sessionStorage.getItem(key) || ''
    } catch (_) {}

    const href = resolveArticleBackHref({
      referrer: document.referrer,
      currentPath: window.location.pathname + window.location.search,
      stored,
      origin: window.location.origin
    })

    if (!stored && href && href !== '/') {
      try {
        sessionStorage.setItem(key, href)
      } catch (_) {}
    }
    // 首次且无 stored：把解析结果写入，避免刷新丢 referrer
    if (!stored) {
      try {
        sessionStorage.setItem(key, href || '/')
      } catch (_) {}
    }

    targetRef.current = href || '/'
  }, [postId, router.asPath])

  const go = () => {
    router.push(targetRef.current || '/')
  }

  return (
    <button
      type='button'
      className={`cl-article-back ${className}`.trim()}
      onClick={go}>
      ← 返回
    </button>
  )
}
