/** 首页由 Header/抽屉统一补到最前，不参与 Notion 菜单行序 */
const NAV_HIDE = new Set(['首页', 'Home', 'home'])

export function linkTitle(link) {
  return link?.name || link?.title || ''
}

export function normalizeNavLinks(links) {
  const all = (links || []).filter(
    l => l && l.show !== false && !NAV_HIDE.has(linkTitle(l))
  )

  if (!all.some(l => linkTitle(l) === '影集')) {
    all.push({
      id: 'cl-album',
      title: '影集',
      name: '影集',
      href: '/album',
      show: true
    })
  }

  return { all }
}

/** 归一化路径：去 query/hash、语言前缀与尾斜杠 */
const stripNavPath = p =>
  (p || '')
    .split(/[?#]/)[0]
    .replace(/^\/(?:zh-CN|zh-HK|zh-TW|en)(?=\/|$)/, '')
    .replace(/\/$/, '') || '/'

/**
 * 导航项是否为当前页：详情页（如 /music/album/xxx）归入父级导航 /music。
 * '#'、外链不参与判定；首页只精确匹配 '/'。
 */
export function isCurrentNavPath(asPath, href) {
  if (!href || href.startsWith('#') || href.endsWith('/#')) return false
  if (/^https?:\/\//i.test(href)) return false
  const target = stripNavPath(href)
  const current = stripNavPath(asPath)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}
