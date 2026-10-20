/**
 * 首页倾斜照片墙的滚动进度计算（纯函数，便于单测）
 *
 * 关键约束：进度必须相对照片墙自身的文档顶部计算。
 * 早期实现直接用绝对 scrollY 当分子，只要墙上方的布局发生变化
 * （公告、刊头、跳转锚点等），动画就会整体超前、与滚动脱节。
 */

/**
 * @param {object} params
 * @param {number} params.scrollY 当前页面滚动量（绝对）
 * @param {number} params.top 照片墙轨道在文档中的绝对顶部
 * @param {number} params.wallHeight 照片墙轨道总高度
 * @param {number} params.viewportHeight 当前视口高度
 * @param {boolean} [params.pinned] 是否为粘性钉住结构
 *   true  （旧行为）：区块高于视口、靠 sticky 钉住，有效行程 = 墙高 − 视口高
 *   false（当前实现）：区块整屏、随页面滚走，有效行程 = 墙高（滚完一块即结束）
 * @returns {number} 0 ~ 1 的进度
 */
export function computeTiltProgress({
  scrollY = 0,
  top = 0,
  wallHeight = 0,
  viewportHeight = 0,
  pinned = true
} = {}) {
  const y = Number.isFinite(scrollY) ? scrollY : 0
  const start = Number.isFinite(top) ? top : 0
  const wall = Number.isFinite(wallHeight) ? wallHeight : 0
  const viewport = Number.isFinite(viewportHeight) ? viewportHeight : 0

  // 非钉住结构：整块从顶部滚出即完成，行程等于区块自身高度
  const span = pinned ? wall - viewport : wall

  // 行程过小（墙高不超过视口 / 高度缺失）：退化为二元状态，
  // 避免除以 1 造成刚进入轨道就跳到终态
  if (span <= 1) {
    return y > start ? 1 : 0
  }

  const progress = (y - start) / span
  if (!Number.isFinite(progress)) return 0
  return Math.min(1, Math.max(0, progress))
}

/**
 * 列位移比例：整段行程内单列移动「行程 × 0.12」像素。
 *
 * 取值对齐参考站 moment.priority.vision 的实测结果：
 * 该站滚动 300px 时列位移仅 36px（0.12），相邻列反向对流后
 * 相对速度约 0.24 倍滚动量，观感是「几乎不跟手、只轻微漂移」。
 * 我们此前是 0.48（相对 0.96），下拉时画面转动量是它的 4 倍，
 * 也是移动端掉帧的主要来源之一。
 *
 * 用比例而非固定像素：区块高度变化时（不同视口 / 改高度）手感保持一致。
 */
export const TRAVEL_RATIO = 0.12

/** 指数平滑时间常数（毫秒）：越小越跟手 */
export const EASE_TAU_NARROW = 96
export const EASE_TAU_DESKTOP = 120

/**
 * 位移量 = 行程 × 比例
 * @param {number} span 有效行程（钉住结构为「墙高 − 视口高」，整屏结构为「墙高」）
 * @param {number} [ratio]
 * @returns {number}
 */
export function computeTiltTravel(span, ratio = TRAVEL_RATIO) {
  const s = Number.isFinite(span) && span > 0 ? span : 0
  const r = Number.isFinite(ratio) && ratio > 0 ? ratio : TRAVEL_RATIO
  return s * r
}

/**
 * 帧率无关的指数平滑：alpha = 1 - e^(-dt / tau)
 *
 * 固定系数（如每帧 ×0.12）会让 120Hz 收敛快一倍、掉到 30fps 慢一倍，
 * 表现成「有的机器拖尾、有的机器发紧」。这里按真实经过时间推进。
 *
 * @param {number} current 当前值
 * @param {number} target 目标值
 * @param {number} dtMs 距上一帧的毫秒数
 * @param {number} tauMs 时间常数
 * @returns {number}
 */
export function easeTiltProgress(current, target, dtMs, tauMs) {
  const c = Number.isFinite(current) ? current : 0
  const t = Number.isFinite(target) ? target : c
  const tau = Number.isFinite(tauMs) && tauMs > 0 ? tauMs : EASE_TAU_DESKTOP
  const dt = Number.isFinite(dtMs) && dtMs > 0 ? Math.min(64, dtMs) : 16.7

  const alpha = 1 - Math.exp(-dt / tau)
  const next = c + (t - c) * alpha

  // 足够接近时直接吸附，避免无限逼近产生尾数抖动
  return Math.abs(t - next) < 0.0005 ? t : next
}

export default computeTiltProgress
