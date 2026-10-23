/**
 * 首页精选影集段的纯逻辑（焦点进度算法 + 精选判定，便于单测）
 *
 * 关键约束：滚动路径上零布局读取。
 *
 * 影集页的 STACK 模式（AlbumShelfStack）在每帧对每个条目调用
 * getBoundingClientRect()（6~14 次/帧的强制布局读取）。本段改为
 * 「测量一次 + 纯数值比较」：段的几何在 mount / resize / 字体就绪后各测一次，
 * 滚动时只读 window.scrollY。
 *
 * R14 形态：左列是一只「取景框」——固定高度，框里只画当前影集的名字。
 *   - 滚动只决定「当前是第几辑」，不位移任何东西（文字层整段滚动纹丝不动）
 *   - 焦点推进均匀分布在整段行程里（进度 0→1 均分）
 *   - 换挡 = 名字交叉淡入（CSS 走 opacity 过渡，不触发布局）
 */

/** 焦点线在视口中的位置（比例）：0.42 = 视口 42% 高度处 */
export const FOCUS_LINE_RATIO = 0.42

/**
 * 焦点进度：0（第一辑）→ 1（最后一辑）
 *
 * @param {number} scrollY 当前滚动量
 * @param {number} sweepStart 焦点开始推进的滚动位置（目录轨道开始 sticky 的位置）
 * @param {number} sweepLength 焦点推进走完的总滚动距离
 * @returns {number} 0 ~ 1
 */
export function computeFocusProgress(scrollY, sweepStart, sweepLength) {
  if (!Number.isFinite(sweepLength) || sweepLength <= 0) return 0
  const y = Number.isFinite(scrollY) ? scrollY : 0
  const s = Number.isFinite(sweepStart) ? sweepStart : 0
  const p = (y - s) / sweepLength
  return Math.min(1, Math.max(0, p))
}

/**
 * 影集段滚轴的手感参数
 *
 * 借鉴开源里程表 / 老虎机转轮的做法（MIT）：
 * - 21st.dev Odometer（移植自 Starbase）：轮子位置是**离散档位**，
 *   档位之间的滑行交给 CSS transition（默认 cubic-bezier(0.2,0.85,0.25,1)，
 *   不过冲 → 到位即止），改值时从当前位置接着走
 * - sloteffect：格高 = 1em，父级 line-height ≥ 1.15
 */

/**
 * 强调 / 封面两次切换的最小间隔（ms）
 *
 * 滚轴连续跟手后，一甩就能掠过好几个名字；封面若逐个跟手会频闪。
 * 限速到 250ms（≤4 次/秒）→ 换页读得清，又不至于迟钝。
 */
export const ALBUM_FOCUS_MIN_MS = 250

/**
 * 焦点推进区间
 *
 * 推进区间 = 「主 sticky 元件的钉住区间」裁掉尾部的一段驻留。
 *   - 起点 = 主元件开始钉住（移动端 = 照片满屏；桌面端 = 左列轨道到焦点线）
 *   - 尾部驻留 = 钉住区间的最后一段不推进焦点
 *     （否则最后一张刚切上来画面就开始退场，溶解动画都跑不完）
 *
 * @param {number} pinStart 主 sticky 元件开始钉住的滚动位置
 * @param {number} pinEnd 主 sticky 元件被释放的滚动位置
 * @param {number} tailRatio 尾部驻留占钉住区间的比例（0.25 = 留 1/4）
 * @returns {{ start: number, length: number }}
 */
export function computeSweepWindow(pinStart, pinEnd, tailRatio = 0.25) {
  if (!Number.isFinite(pinStart) || !Number.isFinite(pinEnd)) {
    return { start: 0, length: 0 }
  }
  const span = Math.max(0, pinEnd - pinStart)
  const ratio = Number.isFinite(tailRatio)
    ? Math.min(0.9, Math.max(0, tailRatio))
    : 0
  return { start: pinStart, length: Math.max(0, span - span * ratio) }
}

/**
 * 焦点推进的滚动窗口长度：目录轨道 sticky 生效 → 整段离开视口。
 *
 * 用它（而不是「段体超出视口的高度」）做分母，焦点才会均匀铺满整个钉住窗口，
 * 而不是在前几百像素里匆匆走完、剩下大半程一动不动。
 *
 * @param {number} sweepStart 目录轨道开始 sticky 的滚动位置
 * @param {number} sweepEnd 整段离开视口顶部的滚动位置
 * @returns {number}
 */
export function computeSweepLength(sweepStart, sweepEnd) {
  if (!Number.isFinite(sweepStart) || !Number.isFinite(sweepEnd)) return 0
  return Math.max(0, sweepEnd - sweepStart)
}

/**
 * 影集是否被标记为「精选」。
 *
 * 主路径是 Notion 的 Checkbox 属性（解析后为真正的布尔值）。
 * 同时兼容 Select/MultiSelect 降级形态（数组或字符串），以便博主
 * 临时改用选项列时无需改代码。
 *
 * @param {object} page Notion 页面属性对象
 * @returns {boolean}
 */
export function isFeaturedAlbum(page) {
  if (!page) return false
  const raw = page.featured
  if (typeof raw === 'boolean') return raw
  if (Array.isArray(raw)) {
    return raw.some(v => v === '精选' || v === 'Featured' || v === '__YES__')
  }
  if (typeof raw === 'string') {
    return raw === '精选' || raw === 'Featured' || raw === '__YES__' || raw === 'true'
  }
  return false
}

