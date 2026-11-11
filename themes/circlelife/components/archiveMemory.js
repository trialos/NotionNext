/**
 * 归档筛选记忆（sessionStorage，按标签页）
 *
 * 语义：
 *   - 只记「本标签页最近一次显式选择的筛选」，用 query 形状 { category, tag } 存；
 *   - 关闭标签页即忘（不做跨会话记忆）；
 *   - 存储不可用（隐私模式/被禁用）时静默降级，不影响页面。
 */
export const ARCHIVE_MEMORY_KEY = 'cl-archive-filter'

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
