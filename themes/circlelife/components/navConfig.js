/** 桌面左翼 */
export const NAV_LEFT = ['随笔', '时间线', '影集']
/** 桌面右翼 */
export const NAV_RIGHT = ['往期整理', '关于']
/** 隐藏 */
export const NAV_HIDE = new Set(['首页', 'Home', 'home'])

export const ICON_FALLBACK = {
  首页: 'fas fa-home',
  随笔: 'fas fa-pen',
  时间线: 'fas fa-clock-rotate-left',
  往期整理: 'fas fa-archive',
  关于: 'fas fa-user',
  影集: 'fas fa-images',
  文章分类: 'fas fa-th',
  文章标签: 'fas fa-tag',
  分类: 'fas fa-th',
  标签: 'fas fa-tag',
  搜索: 'fas fa-search'
}

export function linkTitle(link) {
  return link?.name || link?.title || ''
}

export function normalizeNavLinks(links) {
  const list = (links || []).filter(
    l => l && l.show !== false && !NAV_HIDE.has(linkTitle(l))
  )
  const byTitle = new Map(list.map(l => [linkTitle(l), l]))

  // ensure 影集 placeholder
  if (!byTitle.has('影集')) {
    const album = {
      id: 'cl-album',
      title: '影集',
      name: '影集',
      href: '/album',
      icon: 'fas fa-images',
      show: true
    }
    list.push(album)
    byTitle.set('影集', album)
  }

  const pick = titles =>
    titles.map(t => byTitle.get(t)).filter(Boolean)

  const left = pick(NAV_LEFT)
  const right = pick(NAV_RIGHT)
  const used = new Set([...NAV_LEFT, ...NAV_RIGHT])
  const rest = list.filter(l => !used.has(linkTitle(l)))
  // extras go to right
  return { left, right: [...right, ...rest], all: [...left, ...right, ...rest] }
}
