import { ARCHIVE_ALL } from './archiveFilter'

/**
 * 归档深链：/archive?category=<名字>&tag=<名字>
 * 只做「名字 ↔ facets key / query」的纯映射，筛选事实仍由 LayoutArchive 的 state 承担。
 */

function readName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function readArchiveQuery(query) {
  return {
    categoryName: readName(query?.category),
    tagName: readName(query?.tag)
  }
}

export function resolveArchiveKeys(facets, { categoryName, tagName } = {}) {
  const categoryKey = categoryName
    ? facets?.categories?.find(item => item.name === categoryName)?.key ||
      ARCHIVE_ALL
    : ARCHIVE_ALL
  const tagKey = tagName
    ? facets?.scopes
        ?.get(categoryKey)
        ?.tags?.find(item => item.name === tagName)?.key || ARCHIVE_ALL
    : ARCHIVE_ALL
  return { categoryKey, tagKey }
}

export function buildArchiveQuery(facets, categoryKey, tagKey) {
  const categoryName =
    categoryKey === ARCHIVE_ALL
      ? ''
      : facets?.categories?.find(item => item.key === categoryKey)?.name || ''
  const tagName =
    tagKey === ARCHIVE_ALL
      ? ''
      : facets?.scopes
          ?.get(categoryKey)
          ?.tags?.find(item => item.key === tagKey)?.name || ''
  const query = {}
  if (categoryName) query.category = categoryName
  if (tagName) query.tag = tagName
  return query
}

/**
 * 一次解析 URL：得到筛选 key，并把无法识别的参数标出来（交给调用方静默清理）。
 * 无效分类/标签会回落 ARCHIVE_ALL，避免地址、筛选与状态条三者不一致。
 */
export function resolveArchiveSelection(facets, query) {
  const { categoryName, tagName } = readArchiveQuery(query)
  const { categoryKey, tagKey } = resolveArchiveKeys(facets, {
    categoryName,
    tagName
  })
  const cleaned = buildArchiveQuery(facets, categoryKey, tagKey)
  const needsCleanup =
    (categoryName !== '' && cleaned.category !== categoryName) ||
    (tagName !== '' && cleaned.tag !== tagName)
  return { categoryKey, tagKey, cleaned, needsCleanup }
}
