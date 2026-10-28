import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { resolveArticleBack } from './articleBackHref'
import {
  clearDeparture,
  readDepartureRecord,
  setBackIntent
} from './ListScrollMemory'

/**
 * 文章返回：回到这一次进入文章前的页面，并恢复离开时的滚动位置
 */
export default function ArticleBack({ className = '', postId = '' }) {
  const router = useRouter()
  const targetRef = useRef({ href: '/', y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = postId ? `cl-article-from:${postId}` : 'cl-article-from'
    const currentPath = window.location.pathname + window.location.search
    const departure = readDepartureRecord(currentPath)

    let storedRaw = ''
    try {
      storedRaw = sessionStorage.getItem(key) || ''
    } catch (_) {}

    let lastList = ''
    try {
      lastList = sessionStorage.getItem('cl-list-last') || ''
    } catch (_) {}

    const next = resolveArticleBack({
      departure,
      storedRaw,
      lastList,
      currentPath
    })

    if (next.fresh) {
      // 本次到达有明确来源：刷新本篇快照，再消费这条一次性离开记录
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ href: next.href, y: next.y, ts: Date.now() })
        )
      } catch (_) {}
      clearDeparture()
    }

    targetRef.current = { href: next.href, y: next.y }
  }, [postId, router.asPath])

  const go = () => {
    const target = targetRef.current || { href: '/', y: 0 }
    setBackIntent(target.href, target.y)
    router.push(target.href || '/', undefined, { scroll: false })
  }

  return (
    <button
      type='button'
      className={`cl-article-back ${className}`.trim()}
      onClick={go}
    >
      ← 返回
    </button>
  )
}
