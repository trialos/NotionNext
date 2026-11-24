import { POST_URL_PREFIX } from '@/conf/post.config'

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

/** 文章详情页首段前缀，取自 conf/post.config.js 的 POST_URL_PREFIX 真源。
 *  支持 'article/%year%/%month%/%day%' 这类模板，只取首段做字面匹配。
 *  空前缀（/<slug>）不做映射，避免把 /about 等其他页面误判为文章。
 *  Notion CONFIG 覆盖前缀时站点实际路径会变，此时需同步配置来源。 */
const ARTICLE_SEGMENT = String(POST_URL_PREFIX || '')
  .replace(/^\/+/, '')
  .split('/')[0]
  .replace(/\/+$/, '')
const articlePrefix = ARTICLE_SEGMENT ? `/${ARTICLE_SEGMENT}` : ''
const isArticleDetailPath = p =>
  Boolean(articlePrefix) &&
  (p === articlePrefix || p.startsWith(`${articlePrefix}/`))

/**
 * 导航项是否为当前页：详情页归入所属导航。
 * - 子路径型（/music/album/xxx → /music）：前缀匹配
 * - 文章详情（/article/<slug> → /archive）：路径不同源，显式映射
 * '#'、外链不参与判定；首页只精确匹配 '/'。
 */
export function isCurrentNavPath(asPath, href) {
  if (!href || href.startsWith('#') || href.endsWith('/#')) return false
  if (/^https?:\/\//i.test(href)) return false
  const target = stripNavPath(href)
  const current = stripNavPath(asPath)
  if (target === '/') return current === '/'
  if (current === target || current.startsWith(`${target}/`)) return true
  return target === '/archive' && isArticleDetailPath(current)
}
