export const ARCHIVE_ALL = '__all__'
export const ARCHIVE_UNCATEGORIZED = '__uncategorized__'

const CATEGORY_PREFIX = 'cat:'
const TAG_PREFIX = 'tag:'

function normalizeName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function categoryKeyOf(post) {
  const name = normalizeName(post?.category)
  return name ? `${CATEGORY_PREFIX}${name}` : ARCHIVE_UNCATEGORIZED
}

export function tagKeyOf(name) {
  const normalized = normalizeName(name)
  return normalized ? `${TAG_PREFIX}${normalized}` : ''
}

export function normalizePostTags(post) {
  if (!Array.isArray(post?.tagItems)) return []
  const names = new Set()
  post.tagItems.forEach(item => {
    const name = normalizeName(item?.name)
    if (name) names.add(name)
  })
  return [...names]
}

function forEachPost(archivePosts, callback) {
  if (!archivePosts || typeof archivePosts !== 'object') return 0
  let total = 0
  Object.values(archivePosts).forEach(posts => {
    if (!Array.isArray(posts)) return
    posts.forEach(post => {
      if (!post) return
      total++
      callback(post)
    })
  })
  return total
}

function compareTagFacets(a, b) {
  return b.count - a.count || a.name.localeCompare(b.name, 'zh-CN')
}

function toTagFacets(tagCounts) {
  return [...tagCounts.entries()]
    .map(([name, count]) => ({ key: tagKeyOf(name), name, count }))
    .sort(compareTagFacets)
}

function compareCategoryFacets(a, b) {
  if (b.count !== a.count) return b.count - a.count
  if (a.key === ARCHIVE_UNCATEGORIZED) return 1
  if (b.key === ARCHIVE_UNCATEGORIZED) return -1
  return a.name.localeCompare(b.name, 'zh-CN') || a.key.localeCompare(b.key)
}

export function buildArchiveFacets(archivePosts) {
  const categoryCounts = new Map()
  const scopePostCounts = new Map()
  const scopeTagCounts = new Map()

  const incrementScopePostCount = key => {
    scopePostCounts.set(key, (scopePostCounts.get(key) || 0) + 1)
  }

  const incrementTagCount = (scopeKey, name) => {
    let counts = scopeTagCounts.get(scopeKey)
    if (!counts) {
      counts = new Map()
      scopeTagCounts.set(scopeKey, counts)
    }
    counts.set(name, (counts.get(name) || 0) + 1)
  }

  const totalCount = forEachPost(archivePosts, post => {
    const categoryKey = categoryKeyOf(post)
    const categoryName =
      categoryKey === ARCHIVE_UNCATEGORIZED ? '' : normalizeName(post.category)
    const category = categoryCounts.get(categoryKey)
    if (category) {
      category.count++
    } else {
      categoryCounts.set(categoryKey, {
        key: categoryKey,
        name: categoryName,
        count: 1
      })
    }

    incrementScopePostCount(ARCHIVE_ALL)
    incrementScopePostCount(categoryKey)
    normalizePostTags(post).forEach(name => {
      incrementTagCount(ARCHIVE_ALL, name)
      incrementTagCount(categoryKey, name)
    })
  })

  const scopes = new Map()
  scopes.set(ARCHIVE_ALL, {
    postCount: scopePostCounts.get(ARCHIVE_ALL) || 0,
    tags: toTagFacets(scopeTagCounts.get(ARCHIVE_ALL) || new Map())
  })

  const categories = [
    { key: ARCHIVE_ALL, name: '', count: totalCount },
    ...[...categoryCounts.values()].sort(compareCategoryFacets)
  ]

  categories.forEach(category => {
    if (category.key === ARCHIVE_ALL) return
    scopes.set(category.key, {
      postCount: scopePostCounts.get(category.key) || 0,
      tags: toTagFacets(scopeTagCounts.get(category.key) || new Map())
    })
  })

  return { totalCount, categories, scopes }
}

export function filterArchivePosts(
  archivePosts,
  categoryKey = ARCHIVE_ALL,
  tagKey = ARCHIVE_ALL
) {
  const filtered = {}
  if (!archivePosts || typeof archivePosts !== 'object') return filtered

  Object.entries(archivePosts).forEach(([archiveTitle, posts]) => {
    if (!Array.isArray(posts)) return
    const matched = posts.filter(post => {
      if (!post) return false
      if (categoryKey !== ARCHIVE_ALL && categoryKeyOf(post) !== categoryKey) {
        return false
      }
      if (tagKey !== ARCHIVE_ALL) {
        return normalizePostTags(post).some(name => tagKeyOf(name) === tagKey)
      }
      return true
    })
    if (matched.length > 0) {
      filtered[archiveTitle] = matched
    }
  })

  return filtered
}
