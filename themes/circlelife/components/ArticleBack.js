import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

function sameOriginPath(ref) {
  if (!ref || typeof window === 'undefined') return ''
  try {
    const u = new URL(ref, window.location.origin)
    if (u.origin !== window.location.origin) return ''
    const path = u.pathname + u.search
    // 忽略仅 hash 或当前文章路径
    if (!path || path === window.location.pathname + window.location.search) return ''
    return path
  } catch (_) {
    return ''
  }
}

/**
 * 文章返回：回到进文前页面（不受目录 # 历史影响）
 */
export default function ArticleBack({ className = '', postId = '' }) {
  const router = useRouter()
  const targetRef = useRef('/')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = postId ? `cl-article-from:${postId}` : 'cl-article-from'
    let from = ''
    try {
      from = sessionStorage.getItem(key) || ''
    } catch (_) {}
    if (!from) {
      from = sameOriginPath(document.referrer) || '/'
      try {
        sessionStorage.setItem(key, from)
      } catch (_) {}
    }
    // 若来源仍是当前文（刷新），回首页
    const cur = window.location.pathname
    if (from === cur || from.startsWith(cur + '#')) from = '/'
    targetRef.current = from || '/'
  }, [postId, router.asPath])

  const go = () => {
    const href = targetRef.current || '/'
    router.push(href)
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
