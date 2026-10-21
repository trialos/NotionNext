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
