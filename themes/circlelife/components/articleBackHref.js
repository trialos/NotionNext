/**
 * 解析文章「返回」目标（纯函数，便于单测）
 */
export function resolveArticleBackHref({
  referrer = '',
  currentPath = '',
  stored = '',
  origin = ''
} = {}) {
  const normalize = (ref, baseOrigin) => {
    if (!ref || typeof ref !== 'string') return ''
    try {
      const u = baseOrigin ? new URL(ref, baseOrigin) : new URL(ref)
      if (baseOrigin) {
        const o = new URL(baseOrigin)
        if (u.origin !== o.origin) return ''
      }
      const path = u.pathname + u.search
      if (!path) return ''
      return path
    } catch (_) {
      if (ref.startsWith('/')) return ref.split('#')[0]
      return ''
    }
  }

  let from = (stored && String(stored)) || ''
  if (!from) {
    from = normalize(referrer, origin || undefined)
  }
  if (!from) return '/'

  const cur = (currentPath || '').split('#')[0]
  if (from === cur || (cur && from.startsWith(cur + '?'))) {
    // 仅 query 不同仍视为同文则回首页；同 path 不同 search 可保留
  }
  if (cur && (from === cur || from.startsWith(cur + '#'))) return '/'

  return from || '/'
}
