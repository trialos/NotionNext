import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { normalizePath } from './articleBackHref'

/**
 * 文章返回位置记忆
 *
 * 1. 捕获阶段记录「点同源链接离开当前页」时的来源、目标与 scrollY
 *    （cl-departure，单条，后一次覆盖前一次，TTL 60s）
 * 2. 文章页挂载时读取这条记录，把「本次来源 + 位置」写进按文章的快照
 * 3. ArticleBack 点返回时写一次性 intent（href + y）；落页消费 intent，
 *    只在目标页恢复到离开时的位置；普通导航不设 intent，永不触发恢复
 *
 * 结构：cl-departure = { from, to, y, ts }；cl-back-restore = { href, y, ts }。
 */

export const DEPARTURE_KEY = 'cl-departure'
export const BACK_INTENT_KEY = 'cl-back-restore'
export const DEPARTURE_TTL = 60000
export const INTENT_TTL = 60000

function cleanY(value) {
  const y = Number(value)
  return Number.isFinite(y) && y > 0 ? Math.round(y) : 0
}

function isInternalPath(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
  )
}

function readJson(raw) {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    return value && typeof value === 'object' ? value : null
  } catch (_) {
    return null
  }
}

function isFresh(ts, now, ttl) {
  const stamp = Number(ts)
  return Number.isFinite(stamp) && stamp <= now + 1000 && now - stamp <= ttl
}

export function makeDeparture({ from, to, y, ts } = {}) {
  if (typeof from !== 'string' || typeof to !== 'string') return null
  if (!from || !to) return null
  const fromPath = normalizePath(from)
  const toPath = normalizePath(to)
  if (!isInternalPath(fromPath) || !isInternalPath(toPath)) return null
  if (fromPath === toPath) return null
  const stamp = Number(ts)
  return {
    from: fromPath,
    to: toPath,
    y: cleanY(y),
    ts: Number.isFinite(stamp) ? stamp : Date.now()
  }
}

export function readDeparture(
  json,
  currentPath,
  now = Date.now(),
  ttl = DEPARTURE_TTL
) {
  const value = readJson(json)
  if (!value) return null
  if (!isFresh(value.ts, now, ttl)) return null
  const record = makeDeparture(value)
  if (!record) return null
  if (normalizePath(currentPath) !== record.to) return null
  return record
}

export function makeIntent({ href, y, ts } = {}) {
  if (!isInternalPath(href)) return null
  const stamp = Number(ts)
  return {
    href: normalizePath(href),
    y: cleanY(y),
    ts: Number.isFinite(stamp) ? stamp : Date.now()
  }
}

export function matchIntent(
  json,
  currentPath,
  now = Date.now(),
  ttl = INTENT_TTL
) {
  const value = readJson(json)
  if (!value) return null
  if (!isFresh(value.ts, now, ttl)) return null
  const intent = makeIntent(value)
  if (!intent) return null
  if (normalizePath(currentPath) !== intent.href) return null
  return intent.y
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

function safeRemove(key) {
  try {
    sessionStorage.removeItem(key)
  } catch (_) {}
}

export function recordDeparture(from, to, y) {
  if (typeof sessionStorage === 'undefined') return
  const record = makeDeparture({ from, to, y, ts: Date.now() })
  if (!record) return
  safeSet(DEPARTURE_KEY, JSON.stringify(record))
}

export function readDepartureRecord(currentPath) {
  if (typeof sessionStorage === 'undefined') return null
  return readDeparture(safeGet(DEPARTURE_KEY), currentPath)
}

export function clearDeparture() {
  if (typeof sessionStorage === 'undefined') return
  safeRemove(DEPARTURE_KEY)
}

export function setBackIntent(href, y) {
  if (typeof sessionStorage === 'undefined') return
  const intent = makeIntent({ href, y, ts: Date.now() })
  if (!intent) return
  safeSet(BACK_INTENT_KEY, JSON.stringify(intent))
}

export function consumeBackIntent(currentPath) {
  if (typeof sessionStorage === 'undefined') return null
  const raw = safeGet(BACK_INTENT_KEY)
  if (!raw) return null
  safeRemove(BACK_INTENT_KEY)
  return matchIntent(raw, currentPath)
}

const REALIGN_DELAYS = [400, 900]
const REALIGN_TOLERANCE = 40

export default function ListScrollMemory() {
  const router = useRouter()

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    // 旧版路径级滚动地图：只清理，不再读写
    safeRemove('cl-list-scroll')
    const onClick = e => {
      if (e.defaultPrevented) return
      if (e.button != null && e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target?.closest?.('a[href]')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      let u
      try {
        u = new URL(a.href, window.location.origin)
      } catch (_) {
        return
      }
      if (u.origin !== window.location.origin) return
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return
      recordDeparture(
        window.location.pathname + window.location.search,
        u.pathname + u.search,
        window.scrollY || 0
      )
    }
    document.addEventListener('click', onClick, { capture: true })
    return () =>
      document.removeEventListener('click', onClick, { capture: true })
  }, [])

  useEffect(() => {
    const currentPath = normalizePath(router.asPath || '')
    const y = consumeBackIntent(currentPath)
    if (y == null) return undefined
    // 影集页的滚动由影集自身管理，但返回意图必须在这里消费掉
    if (currentPath === '/album' || currentPath.startsWith('/album?')) {
      return undefined
    }

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
