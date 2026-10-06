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
const MENU_ORDER = ['随笔', '时间线', '影集', '往期整理', '关于']

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
  const orphans = []
  // Notion 行序里最近一个入列的 Menu，作为 SubMenu 的默认父级
  let lastMenu = null
  if (menuPages && menuPages.length > 0) {
    menuPages.forEach(e => {
      const title = e.title || e.name || ''
      if (e.type === 'Menu') {
        if (title === '首页' || title === 'Home') {
          e.show = false
          return
        }
        e.show = true
        const sourceSlug = normalizeSourceSlug(e.slug)
        if (sourceSlug && pageHrefBySourceSlug.has(sourceSlug)) {
          e.href = pageHrefBySourceSlug.get(sourceSlug)
        }
        menus.push(e)
        lastMenu = e
        return
      }
      // SubMenu：跟随上游约定，挂在行序里紧邻其上的 Menu 行下
      e.show = true
      const sourceSlug = normalizeSourceSlug(e.slug)
      if (sourceSlug && pageHrefBySourceSlug.has(sourceSlug)) {
        e.href = pageHrefBySourceSlug.get(sourceSlug)
      }
      if (lastMenu) {
        if (lastMenu.subMenus) {
          lastMenu.subMenus.push(e)
        } else {
          lastMenu.subMenus = [e]
        }
      } else {
        orphans.push(e)
      }
    })

    menus.sort((a, b) => menuSortKey(a.title) - menuSortKey(b.title))

    // 前面没有任何 Menu 行的孤儿 SubMenu，兜底归入「往期整理」
    orphans.forEach(e => {
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
