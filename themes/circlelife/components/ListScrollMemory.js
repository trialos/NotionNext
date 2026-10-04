import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * 列表滚动位置记忆（返回文章时恢复）
 *
 * 上半部是纯函数核心（可单测），下半部是挂在 LayoutBase 的组件：
 * 1. 捕获阶段记录「点同源链接时的 scrollY → 目标页」，覆盖时间线/归档/
 *    分类/标签/首页抽牌全部入口，列表组件零侵入
 * 2. ArticleBack 设置一次性「返回意图」后，落页恢复到记录位置
 *    （无记录则回顶）；普通导航不设意图，永不触发恢复
 *
 * 结构：cl-list-scroll = { [destPath]: { y, ts } }，LRU 上限 8 条；
 * cl-back-restore = 返回意图标记。
 */
export const SCROLL_MAP_KEY = 'cl-list-scroll'
export const BACK_INTENT_KEY = 'cl-back-restore'
export const SCROLL_MAP_LIMIT = 8

export function readScrollMap(json) {
  if (!json) return {}
  try {
    const obj = JSON.parse(json)
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
    return obj
  } catch (_) {
    return {}
  }
}

export function updateScrollMap(map, dest, y, ts, limit = SCROLL_MAP_LIMIT) {
  if (!dest || !Number.isFinite(y)) return map
  const next = { ...map, [dest]: { y: Math.round(y), ts } }
  const entries = Object.entries(next)
  if (entries.length > limit) {
    entries.sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0))
    for (let i = 0; i < entries.length - limit; i++) delete next[entries[i][0]]
  }
  return next
}

export function pickScroll(map, dest) {
  const hit = dest ? map[dest] : null
  return hit && Number.isFinite(hit.y) ? hit.y : null
}

function safeGet(key) {
  try {
    return sessionStorage.getItem(key)
  } catch (_) {
    return null
  }
}

function safeSet(key, value) {
  try {
    sessionStorage.setItem(key, value)
  } catch (_) {}
}

export function rememberScroll(dest, y) {
  if (typeof sessionStorage === 'undefined') return
  const map = updateScrollMap(
    readScrollMap(safeGet(SCROLL_MAP_KEY)),
    dest,
    y,
    Date.now()
  )
  safeSet(SCROLL_MAP_KEY, JSON.stringify(map))
}

export function peekScroll(dest) {
  if (typeof sessionStorage === 'undefined') return null
  return pickScroll(readScrollMap(safeGet(SCROLL_MAP_KEY)), dest)
}

export function setBackIntent() {
  if (typeof sessionStorage === 'undefined') return
  safeSet(BACK_INTENT_KEY, String(Date.now()))
}

export function consumeBackIntent() {
  if (typeof sessionStorage === 'undefined') return false
  const v = safeGet(BACK_INTENT_KEY)
  if (!v) return false
  try {
    sessionStorage.removeItem(BACK_INTENT_KEY)
  } catch (_) {}
  return true
}

const REALIGN_DELAYS = [400, 900]
const REALIGN_TOLERANCE = 40

export default function ListScrollMemory() {
  const router = useRouter()

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const onClick = e => {
      if (e.defaultPrevented) return
      if (e.button != null && e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target?.closest?.('a[href]')
      if (!a || a.target === '_blank') return
      let u
      try {
        u = new URL(a.href, window.location.origin)
      } catch (_) {
        return
      }
      if (u.origin !== window.location.origin) return
      // 按「当前页」路径记账：返回到哪一页就按哪一页查找；
      // 记目标页路径会让恢复查找永远落空
      rememberScroll(
        window.location.pathname + window.location.search,
        window.scrollY || 0
      )
    }
    document.addEventListener('click', onClick, { capture: true })
    return () =>
      document.removeEventListener('click', onClick, { capture: true })
  }, [])

  useEffect(() => {
    const path = (router.asPath || '').split('#')[0]
    if (!path || path === '/album' || path.startsWith('/album?')) {
      return undefined
    }
    if (!consumeBackIntent()) return undefined
    const recorded = peekScroll(path)
    const y = recorded == null ? 0 : recorded

    let cancelled = false
    let interacted = false
    const markInteracted = () => {
      interacted = true
    }
    window.addEventListener('wheel', markInteracted, { passive: true })
    window.addEventListener('touchstart', markInteracted, { passive: true })
    window.addEventListener('keydown', markInteracted)

    const scrollToY = () => window.scrollTo(0, y)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!cancelled) scrollToY()
      })
    })
    const timers = REALIGN_DELAYS.map(d =>
      window.setTimeout(() => {
        if (cancelled || interacted) return
        if (Math.abs((window.scrollY || 0) - y) > REALIGN_TOLERANCE) {
          scrollToY()
        }
      }, d)
    )

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      timers.forEach(t => window.clearTimeout(t))
      window.removeEventListener('wheel', markInteracted)
      window.removeEventListener('touchstart', markInteracted)
      window.removeEventListener('keydown', markInteracted)
    }
  }, [router.asPath])

  return null
}
