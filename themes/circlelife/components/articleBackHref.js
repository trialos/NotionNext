/**
 * 解析文章「返回」目标（纯函数，便于单测）
 *
 * 来源优先级：per-post stored → 会话内最后一个列表页（cl-list-last）→ 首页。
 * 不使用 document.referrer：它指向整个文档最后一次完整加载时的页面，
 * SPA 内导航不更新它，会导致同标签页里所有文章的返回都指向同一个旧页面。
 */
export function resolveArticleBackHref({
  stored = '',
  currentPath = '',
  lastList = ''
} = {}) {
  let from = (stored && String(stored)) || ''
  if (!from && typeof lastList === 'string' && lastList.startsWith('/')) {
    from = lastList
  }
  if (!from) return '/'

  const cur = (currentPath || '').split('#')[0]
  if (cur && (from === cur || from.startsWith(cur + '#'))) return '/'

  return from
}
