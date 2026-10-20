/**
 * 首页倾斜照片墙的列内取图分配（纯函数，便于单测）
 *
 * 背景：早期实现按 `idx % colCount` 做「跨列步进」，把循环拼接的 pool 逐项分给各列。
 * 由于每列与下一列的下标只差 1，相邻两列会在同一循环序列里天然共享约一半图片，
 * 叠加奇偶列反向滚动后，共享图经常同屏对齐，观感就是「两列一模一样」。
 *
 * 这里改为「连续分块」：第 c 列从 c × slots 起连续取 slots 张（越界绕回）。
 * 相邻列集合互不重叠，且同一索引位上的图天然不同。
 * 再对每列做一次「同行去撞」校正，处理 N 能被 slots 整除时的周期性重合。
 */

/** 每列内容高度相对视口的覆盖倍数：略超一屏，让循环接缝落在屏外 */
export const SLOTS_COVERAGE_RATIO = 1.25
/** 单列张数上限，避免小视口 + 高卡片时列内序列过长 */
export const MAX_SLOTS_PER_COLUMN = 10

const cardKey = card => {
  if (!card) return ''
  if (typeof card === 'string') return card
  return String(card.id ?? card.src ?? card.url ?? '')
}

/**
 * 推导每列张数
 * @param {object} params
 * @param {number} params.viewportHeight 视口高度
 * @param {number} params.itemHeight 单张卡片高度（含列间距）
 * @param {number} params.count 唯一图片数量
 * @returns {number} 每列张数，1 ~ min(10, count)
 */
export function computeSlotsPerColumn({
  viewportHeight = 0,
  itemHeight = 0,
  count = 0
} = {}) {
  const total = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
  if (!total) return 0

  // 注意：这里**不能**用图片数量钳制张数。图片少时若每列只放 N 张，
  // 列内容会短于一屏，循环位移一往上走底部就露白。宁可列内重复也要填满。
  const maxSlots = MAX_SLOTS_PER_COLUMN
  const vh =
    Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 0
  const ih = Number.isFinite(itemHeight) && itemHeight > 0 ? itemHeight : 0

  // 尺寸未知时给一个保守下限，避免算出 0
  if (!vh || !ih) return Math.min(2, maxSlots)

  const needed = Math.ceil((vh * SLOTS_COVERAGE_RATIO) / ih)
  return Math.min(maxSlots, Math.max(2, needed))
}

/** 从 start 起连续取 count 张（越界绕回） */
function pickRange(list, start, count) {
  const out = []
  const len = list.length
  for (let i = 0; i < count; i++) {
    out.push(list[(start + i) % len])
  }
  return out
}

/** 两列在相同索引位是否出现同一张图 */
function hasIndexCollision(prev, candidate) {
  const len = Math.min(prev.length, candidate.length)
  for (let i = 0; i < len; i++) {
    if (cardKey(prev[i]) === cardKey(candidate[i])) return true
  }
  return false
}

/**
 * 连续分块 + 同行去撞
 *
 * @param {Array} cards 保持传入顺序（即 Notion 上传次序，不做洗牌）
 * @param {object} options
 * @param {number} options.colCount 列数
 * @param {number} options.slots 每列张数
 * @returns {Array<Array>} 长度 = colCount，每项长度 = slots（图片不足时按绕回重复）
 */
export function buildColumnBuckets(cards, { colCount = 0, slots = 0 } = {}) {
  const list = Array.isArray(cards) ? cards.filter(Boolean) : []
  const total = list.length
  const cols =
    Number.isFinite(colCount) && colCount > 0 ? Math.floor(colCount) : 0
  if (!total || !cols) return []

  // 列内张数不按图片数量封顶：图片少时必须允许列内循环重复，
  // 否则列内容短于一屏，底部会露白（`pickRange` 已在越界处绕回）
  const per = Number.isFinite(slots) && slots > 0 ? Math.floor(slots) : 1

  const columns = []
  for (let c = 0; c < cols; c++) {
    const baseStart = (c * per) % total
    let chosen = null

    for (let attempt = 0; attempt < total; attempt++) {
      const candidate = pickRange(list, (baseStart + attempt) % total, per)
      if (!chosen) chosen = candidate
      const collides = columns.some(prev => hasIndexCollision(prev, candidate))
      if (!collides) {
        chosen = candidate
        break
      }
    }

    columns.push(chosen)
  }

  return columns
}

export default buildColumnBuckets
