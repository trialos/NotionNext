/**
 * 首页精选文章章的纯逻辑（篇位夹取 / 滑动条位置 / 日期格式 / 精选判定）
 *
 * 与影集段共用 Notion「精选」判定（homeAlbumData.js）；本文件只放文章章自己的纯函数。
 * 桌面 A「题名脊轨」与手机 M1「顶部滑动朱砂条」共用这里的实现。
 */

/** 精选判定：文章与影集在 Notion 里是同一张表，靠字段判断 */
export { isFeaturedEntry } from './homeAlbumData'

/**
 * 篇位夹到 [0, count-1]；空集合返回 0，非数字返回 0
 *
 * @param {number} index
 * @param {number} count
 * @returns {number}
 */
export function clampArticleIndex(index, count) {
  const n = Math.floor(Number(count))
  if (!Number.isFinite(n) || n <= 0) return 0
  const i = Math.round(Number(index))
  if (!Number.isFinite(i)) return 0
  return Math.min(n - 1, Math.max(0, i))
}

/**
 * 由轨道滚动量算出顶部朱砂条的连续位置（0..count-1）
 *
 * 一屏一篇：scrollLeft / 一屏宽 = 当前篇的浮点位置。条宽 = 一栏宽，
 * transform: translateX(calc(var(--pos) * 100%)) 即可与栏对齐。
 * 不做逐帧 transform 写入，只在被动 scroll 里 rAF 合帧后写一个 CSS 变量。
 *
 * @param {number} scrollLeft
 * @param {number} slideWidth
 * @param {number} count
 * @returns {number}
 */
export function resolveBarPos(scrollLeft, slideWidth, count) {
  const last = Math.max(0, Math.floor(Number(count)) - 1)
  const width = Number(slideWidth)
  if (!Number.isFinite(width) || width <= 0) return 0
  const left = Number(scrollLeft)
  if (!Number.isFinite(left) || left <= 0) return 0
  return Math.min(last, Math.max(0, left / width))
}

/**
 * 节点是否处于可见断点（display:none 时 clientWidth = 0）
 * 用于两个形态同挂时禁止隐藏形态写回 session / 绘制 canvas。
 *
 * @param {HTMLElement|null} node
 * @returns {boolean}
 */
export function isNodeVisible(node) {
  return Boolean(node && node.clientWidth > 0)
}

/** 轴上的日期标签：'2026-10-9' → '10·09' */
export function formatAxisDay(day) {
  const m =
    typeof day === 'string'
      ? day.trim().match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
      : null
  if (!m) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${pad(Number(m[1]))}·${pad(Number(m[2]))}`
}

/** 两位序号：0 → '01' */
export function formatArticleNo(index) {
  const i = Number(index)
  if (!Number.isFinite(i) || i < 0) return '01'
  return String(Math.floor(i) + 1).padStart(2, '0')
}
