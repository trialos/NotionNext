/**
 * 首页精选文章章的纯逻辑（刻度位置 / 焦点判定 / 近三月窗口 / 精选判定）
 *
 * 与影集段的 homeAlbumFocus.js 同构：把易错的算术抽成纯函数，便于单测。
 *
 * 关键约束：
 * - 滚动路径零布局读取：刻度位置只在 mount / resize 时算一次；
 * - 不写任何 transform（iPhone 逐帧合成纪律）；
 * - publishDay 不补零（实测 '2026-10-9'），不能直接 new Date(str)。
 */

/** 两刻度最小间距（px）—— 同日或过近的刻度靠它错开 */
export const RULER_MIN_GAP = 56

/** 视口焦点线（比例）：0.45 = 视口 45% 高度处 */
export const FOCUS_LINE_RATIO = 0.45

/**
 * 解析 publishDay → UTC 毫秒时间戳
 *
 * publishDay 来自 formatDate，月份/日期都可能不补零（'2026-10-9'），
 * 且不同引擎对 '2026-10-9' 的解析不一致 → 必须手工拆分量。
 *
 * @param {string} day
 * @returns {number|null} 无效返回 null
 */
export function parsePublishDay(day) {
  if (typeof day !== 'string') return null
  const m = day.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const date = Number(m[3])
  if (!month || !date) return null
  const ts = Date.UTC(year, month - 1, date)
  const dt = new Date(ts)
  // 溢出校验：'2026-13-45' 会被 Date 自动进位成 2027-02-14
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== date
  ) {
    return null
  }
  return ts
}

/**
 * 时间标尺的刻度位置（0..1）
 *
 * 位置按**真实日距**比例分布（不是等距装饰）→ 标尺是一把真尺子。
 * 同日 / 过近的刻度用 relax pass 错开，保证相邻间距 ≥ minGap；
 * 整体再等比压缩到轴宽内，不越界、不重叠。
 *
 * @param {string[]} days 各篇文章的 publishDay
 * @param {{width?: number, minGap?: number}} [options]
 * @returns {number[]} 每个刻度的 0..1 位置
 */
export function computeRulerPositions(days, options = {}) {
  const list = Array.isArray(days) ? days : []
  const n = list.length
  if (!n) return []

  const { width = 0, minGap = RULER_MIN_GAP } = options
  const parsed = list.map(parsePublishDay)
  const valid = parsed.filter(v => v !== null)
  const min = valid.length ? Math.min(...valid) : 0
  const max = valid.length ? Math.max(...valid) : 0
  const span = max - min

  // 基准位置：真实日距比例。
  // 全部同日（或全部无日期）→ 全部落在同一点上，交给 relax pass 错开，
  // 这样「同日」在尺子上读起来仍是同一时刻，而不是被摊到两端。
  const base = parsed.map(v => (span > 0 && v !== null ? (v - min) / span : 0.5))

  const w = Number(width)
  if (!Number.isFinite(w) || w <= 0) return base

  const gap = Number.isFinite(Number(minGap)) ? Math.max(0, Number(minGap)) : 0
  const px = base.map(b => b * w)

  // relax：按位置升序处理，保证相邻间距 ≥ minGap（顺序无关：
  // DOM 里最新的排在最前，不能假设输入是升序）
  const order = base
    .map((b, i) => i)
    .sort((a, b) => base[a] - base[b] || a - b)
  for (let k = 1; k < order.length; k++) {
    const i = order[k]
    const prev = order[k - 1]
    if (px[i] - px[prev] < gap) px[i] = px[prev] + gap
  }

  // 溢出则等比压缩回轴宽内（保持相对次序与首尾关系）
  const lo = Math.min(...px)
  const hi = Math.max(...px)
  const total = hi - lo
  if (total > w) {
    const scale = w / total
    for (let i = 0; i < n; i++) px[i] = (px[i] - lo) * scale
  } else if (lo < 0) {
    for (let i = 0; i < n; i++) px[i] -= lo
  }

  return px.map(p => Math.min(1, Math.max(0, p / w)))
}

/**
 * 焦点线落在哪一篇（entries = [{ top, height }]，文档坐标）
 *
 * 边界（焦点线正好压在两篇之间）时取**索引较大**的那一篇，
 * 与向下滚动的方向一致。
 *
 * @param {{top:number,height:number}[]} entries
 * @param {number} focusY
 * @returns {number}
 */
export function pickCurrentIndex(entries, focusY) {
  if (!Array.isArray(entries) || !entries.length) return 0
  const y = Number(focusY)
  if (!Number.isFinite(y)) return 0

  for (let i = 0; i < entries.length; i++) {
    const top = Number(entries[i]?.top)
    const height = Number(entries[i]?.height)
    if (!Number.isFinite(top) || !Number.isFinite(height)) continue
    if (y >= top && y < top + height) return i
  }

  // 落在缝隙里：取最后一个起点不超过 y 的
  let prev = -1
  for (let i = 0; i < entries.length; i++) {
    const top = Number(entries[i]?.top)
    if (Number.isFinite(top) && top <= y) prev = i
  }
  return prev >= 0 ? prev : 0
}

/**
 * 条目是否被标记为「精选」—— 与影集段共用同一份判定（影集与文章在
 * Notion 里是同一张表，靠 type 区分），此处转出便于文章章直接引用。
 */
export { isFeaturedEntry } from './homeAlbumFocus'

/** 标尺上的日期标签：'2026-10-9' → '10·09' */
export function formatRulerDay(day) {
  const m = typeof day === 'string' ? day.trim().match(/^\d{4}-(\d{1,2})-(\d{1,2})$/) : null
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
