/**
 * 解析文章「返回」目标（纯函数，便于单测）
 *
 * 来源优先级：本次离开记录 → 本篇已有快照 → 会话内最后一个列表页 → 首页。
 * 每次真正从站内链接进入文章时，离开记录会把「这一次」的来源与滚动位置
 * 刷新进快照；刷新 / 直接打开没有离开记录，保留已有快照，不用兜底值覆盖。
 *
 * 不使用 document.referrer：它指向整个文档最后一次完整加载时的页面，
 * SPA 内导航不更新它，会导致同标签页里所有文章的返回都指向同一个旧页面。
 */

function isInternalPath(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
  )
}

export function normalizePath(value = '') {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return '/'
  const withoutHash = raw.split('#')[0]
  if (!withoutHash) return '/'
  const [pathname, search = ''] = withoutHash.split('?')
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return search ? `${normalized}?${search}` : normalized
}

export function isSamePath(a, b) {
  return normalizePath(a) === normalizePath(b)
}

export function parseStored(raw) {
  if (!raw) return null
  let value = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch (_) {
      value = raw
    }
  }
  if (typeof value === 'string') {
    return isInternalPath(value) ? { href: normalizePath(value), y: 0 } : null
  }
  if (!value || typeof value !== 'object') return null
  if (!isInternalPath(value.href)) return null
  const y = Number(value.y)
  return {
    href: normalizePath(value.href),
    y: Number.isFinite(y) && y > 0 ? Math.round(y) : 0
  }
}

export function resolveArticleBack({
  departure = null,
  storedRaw = '',
  lastList = '',
  currentPath = ''
} = {}) {
  const current = normalizePath(currentPath)

  if (departure && departure.to && isInternalPath(departure.from)) {
    if (normalizePath(departure.to) === current) {
      const from = normalizePath(departure.from)
      if (!isSamePath(from, current)) {
        const y = Number(departure.y)
        return {
          href: from,
          y: Number.isFinite(y) && y > 0 ? Math.round(y) : 0,
          fresh: true
        }
      }
    }
  }

  const stored = parseStored(storedRaw)
  if (stored && !isSamePath(stored.href, current)) {
    return { href: stored.href, y: stored.y, fresh: false }
  }

  if (isInternalPath(lastList)) {
    const href = normalizePath(lastList)
    if (!isSamePath(href, current)) {
      return { href, y: 0, fresh: false }
    }
  }

  return { href: '/', y: 0, fresh: false }
}
