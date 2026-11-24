/**
 * 归档筛选记忆（sessionStorage，按标签页）
 *
 * 语义：
 *   - 只记「本标签页最近一次显式选择的筛选」，用 query 形状 { category, tag } 存；
 *   - 关闭标签页即忘（不做跨会话记忆）；
 *   - 存储不可用（隐私模式/被禁用）时静默降级，不影响页面。
 */
export const ARCHIVE_MEMORY_KEY = 'cl-archive-filter'
export const ARCHIVE_PAGE_KEY = 'cl-archive-page'

function readName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function usableStorage(storage) {
  return storage && typeof storage.getItem === 'function' ? storage : null
}

export function readArchiveMemory(storage) {
  try {
    const store = usableStorage(storage)
    if (!store) return null
    const raw = store.getItem(ARCHIVE_MEMORY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const category = readName(parsed?.category)
    const tag = readName(parsed?.tag)
    return category || tag ? { category, tag } : null
  } catch (_) {
    return null
  }
}

export function writeArchiveMemory(storage, query) {
  try {
    const store = usableStorage(storage)
    if (!store) return
    const category = readName(query?.category)
    const tag = readName(query?.tag)
    if (!category && !tag) {
      store.removeItem(ARCHIVE_MEMORY_KEY)
      return
    }
    store.setItem(ARCHIVE_MEMORY_KEY, JSON.stringify({ category, tag }))
  } catch (_) {
    // 存储不可用时视为「没有记忆」，不影响筛选
  }
}

/**
 * 归档页码记忆（sessionStorage，按标签页）
 *
 * 与筛选记忆分开存：筛选由 URL 深链承担，页码只用于「返回归档时回到原来那页」。
 * 存 { page, category, tag } —— category/tag 是当前生效的筛选签名，
 * 只有签名一致才恢复，避免带着别的筛选串页。
 */
function normalizePage(value) {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 0
}

export function readArchivePage(storage) {
  try {
    const store = usableStorage(storage)
    if (!store) return null
    const raw = store.getItem(ARCHIVE_PAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const page = normalizePage(parsed?.page)
    if (!page) return null
    return {
      page,
      category: readName(parsed?.category),
      tag: readName(parsed?.tag)
    }
  } catch (_) {
    return null
  }
}

export function writeArchivePage(storage, page, query) {
  try {
    const store = usableStorage(storage)
    if (!store) return
    const normalized = normalizePage(page)
    if (!normalized) {
      store.removeItem(ARCHIVE_PAGE_KEY)
      return
    }
    store.setItem(
      ARCHIVE_PAGE_KEY,
      JSON.stringify({
        page: normalized,
        category: readName(query?.category),
        tag: readName(query?.tag)
      })
    )
  } catch (_) {
    // 存储不可用时视为「没有页码记忆」，不影响分页
  }
}
