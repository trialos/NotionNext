/**
 * 归档按「整月」分页的纯切片逻辑。
 *
 * 归档在 filterArchivePosts 之后仍是「月份 → 文章数组」的对象，
 * 排好序的月份 keys 是分页的天然单位：只按月份下标切片、不拆月份，
 * 因此不会出现同一个月横跨两页的断裂。
 *
 * 页码只做展示层状态，不写入 URL / sessionStorage，
 * 由 LayoutArchive 直接消费，避免与筛选深链、记忆逻辑耦合。
 */
export function paginateArchiveMonths(keys, page, monthsPerPage) {
  const list = Array.isArray(keys) ? keys : []
  const perPage = Math.max(1, Math.floor(monthsPerPage) || 1)
  const totalPage = Math.max(1, Math.ceil(list.length / perPage))
  const requested = Math.floor(page) || 1
  const safePage = Math.min(Math.max(requested, 1), totalPage)
  const start = (safePage - 1) * perPage
  return {
    totalPage,
    safePage,
    months: list.slice(start, start + perPage)
  }
}
