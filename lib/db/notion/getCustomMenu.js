function normalizeSourceSlug(slug) {
  if (typeof slug !== 'string') {
    return ''
  }

  const normalized = slug.trim()
  if (
    !normalized ||
    normalized === '#' ||
    /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(normalized)
  ) {
    return ''
  }

  return normalized.replace(/^\/+|\/+$/g, '')
}

export function getSourcePageSlugs(collectionData) {
  return new Map(
    collectionData
      .filter(page => page?.type === 'Page' && page?.slug)
      .map(page => [page.id, page.slug])
  )
}

function getPageHrefBySourceSlug(collectionData, sourcePageSlugs) {
  const pageHrefBySourceSlug = new Map()
  const ambiguousSlugs = new Set()

  collectionData.forEach(page => {
    const isDirectlyRoutable =
      page?.status === 'Published' || page?.status === 'Invisible'
    if (page?.type !== 'Page' || !isDirectlyRoutable || !page?.href) {
      return
    }

    const sourceSlug = normalizeSourceSlug(sourcePageSlugs?.get(page.id))
    if (!sourceSlug || ambiguousSlugs.has(sourceSlug)) {
      return
    }

    const existingHref = pageHrefBySourceSlug.get(sourceSlug)
    if (existingHref && existingHref !== page.href) {
      pageHrefBySourceSlug.delete(sourceSlug)
      ambiguousSlugs.add(sourceSlug)
      return
    }

    pageHrefBySourceSlug.set(sourceSlug, page.href)
  })

  return pageHrefBySourceSlug
}

/** 顶栏期望顺序（未列出的 Menu 排在后面，保持相对序） */
const MENU_ORDER = ['首页', '随笔', '时间线', '往期整理', '关于']

function menuSortKey(title) {
  const i = MENU_ORDER.indexOf(title)
  return i === -1 ? MENU_ORDER.length + 1 : i
}

function findArchiveParent(menus) {
  return (
    menus.find(m => m?.title === '往期整理') ||
    menus.find(m => normalizeSourceSlug(m?.slug) === '') ||
    menus[menus.length - 1]
  )
}

export function getCustomMenu({ collectionData, sourcePageSlugs }) {
  const pageHrefBySourceSlug = getPageHrefBySourceSlug(
    collectionData,
    sourcePageSlugs
  )
  const menuPages = collectionData.filter(
    post =>
      post.status === 'Published' &&
      (post?.type === 'Menu' || post?.type === 'SubMenu')
  )
  const menus = []
  if (menuPages && menuPages.length > 0) {
    // 先挂所有一级 Menu，再挂 SubMenu，避免库内行序把子项挂错父级
    menuPages
      .filter(e => e.type === 'Menu')
      .forEach(e => {
        e.show = true
        const sourceSlug = normalizeSourceSlug(e.slug)
        if (sourceSlug && pageHrefBySourceSlug.has(sourceSlug)) {
          e.href = pageHrefBySourceSlug.get(sourceSlug)
        }
        menus.push(e)
      })

    menus.sort((a, b) => menuSortKey(a.title) - menuSortKey(b.title))

    menuPages
      .filter(e => e.type === 'SubMenu')
      .forEach(e => {
        e.show = true
        const sourceSlug = normalizeSourceSlug(e.slug)
        if (sourceSlug && pageHrefBySourceSlug.has(sourceSlug)) {
          e.href = pageHrefBySourceSlug.get(sourceSlug)
        }
        // 分类/标签固定归入「往期整理」
        const parentMenu = findArchiveParent(menus)
        if (parentMenu) {
          if (parentMenu.subMenus) {
            parentMenu.subMenus.push(e)
          } else {
            parentMenu.subMenus = [e]
          }
        }
      })
  }
  return menus
}
