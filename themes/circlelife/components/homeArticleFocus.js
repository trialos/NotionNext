/**
 * 首页精选文章章的纯逻辑（等距刻度 / 日期格式 / 精选判定）
 *
 * 与影集段共用 Notion「精选」判定（homeAlbumData.js）；
 * 本文件只放文章章自己的刻度 / 日期纯函数。
 *
 * 关键约束：
 * - 刻度只做等距示意：第 0 篇在左端、最后一篇在右端；
 * - 模块内不写任何 transform（iPhone 逐帧合成纪律）。
 */

/**
 * 等距刻度位置（0..1）
 *
 * 只表达「第几篇」，不再按真实日距拉伸；单篇居中。
 *
 * @param {number} index
 * @param {number} count
 * @returns {number}
 */
export function computeRulerFraction(index, count) {
  const n = Math.floor(Number(count))
  if (!Number.isFinite(n) || n <= 1) return 0.5
  const i = Number(index)
  if (!Number.isFinite(i)) return 0
  return Math.min(1, Math.max(0, i / (n - 1)))
}

/**
 * 条目是否被标记为「精选」—— 与影集段共用同一份判定（影集与文章在
 * Notion 里是同一张表，靠 type 区分），此处转出便于文章章直接引用。
 */
export { isFeaturedEntry } from './homeAlbumData'

/** 标尺上的日期标签：'2026-10-9' → '10·09' */
export function formatRulerDay(day) {
  const m =
    typeof day === 'string'
      ? day.trim().match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
      : null
  if (!m) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${pad(Number(m[1]))}·${pad(Number(m[2]))}`
}

/**
 * 月份跨度：同年 '2026 · 08 — 10'，跨年 '2025-12 — 2026-10'
 *
 * @param {string[]} days
 * @returns {string}
 */
export function formatMonthRange(days) {
  const parsed = (Array.isArray(days) ? days : [])
    .map(day => {
      const m = String(day || '').match(/^(\d{4})-(\d{1,2})/)
      return m ? { year: Number(m[1]), month: Number(m[2]) } : null
    })
    .filter(Boolean)
  if (!parsed.length) return ''
  const pad = n => String(n).padStart(2, '0')
  // 跨年时按「年 + 月」的完整元组取首尾，不能把不同年的月份混在一起比
  const sorted = [...parsed].sort(
    (a, b) => a.year - b.year || a.month - b.month
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (first.year !== last.year) {
    return `${first.year}-${pad(first.month)} — ${last.year}-${pad(last.month)}`
  }
  if (first.month === last.month) return `${first.year} · ${pad(first.month)}`
  return `${first.year} · ${pad(first.month)} — ${pad(last.month)}`
}
