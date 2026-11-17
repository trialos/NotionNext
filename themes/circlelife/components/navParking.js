/**
 * 悬浮胶囊的「滚动让位」判定（纯函数，便于单测）
 *
 * 背景：胶囊原先常驻，在首页照片墙、文章封面这类满幅内容上一直占着一条带。
 * 改成下滚让位后，手感必须避开已被废弃的「迟滞收起」，所以：
 *
 * · 只看**净位移**，不看速度，也不用定时器 —— 方向翻转即清零，
 *   避免「手指抖一下就复位 / 停一下才复位」这种猜心思的迟滞。
 * · 上滚阈值不对称，且分两档：一般页面 14px（导航是主操作，要灵敏）；
 *   文章阅读态 25% 视口（往回看一行不该把导航唤出来）。
 *
 * 语义边界：/about 是锁滚画布、/album 阅读器已隐藏整条头部且不滚动，二者不参与。
 * 阅读进度的显隐与此文件无关：它固定在视口顶边，不随胶囊进退。
 */

export const NAV_PARK = {
  /** 常驻区：滚动量没到这条线之前，永不退场（短页面也就永远不退） */
  REST_ZONE: 96,
  /** 下滚净位移阈值 */
  DOWN_TRAVEL: 36,
  /** 一般页面的上滚阈值：导航是主操作，回位要灵敏 */
  UP_SENSITIVE: 14,
  /** 阅读态上滚阈值 = 视口高度 × 该比例（桌面 ≈220px / 手机 ≈180px） */
  UP_READING_RATIO: 0.25,
  /** 阅读态上滚阈值的下限：矮窗口（横屏手机）不至于太容易被唤出 */
  UP_READING_MIN: 160
}

/**
 * 上滚归位需要累积多少净位移
 *
 * @param {object} params
 * @param {boolean} [params.reading] 是否处于文章正文阅读态
 * @param {number} [params.viewportHeight] 视口高度（阅读态按比例取阈值）
 * @returns {number} 像素
 */
export function computeUpThreshold({ reading = false, viewportHeight = 800 } = {}) {
  if (!reading) return NAV_PARK.UP_SENSITIVE
  const height = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0
  return Math.max(NAV_PARK.UP_READING_MIN, Math.round(height * NAV_PARK.UP_READING_RATIO))
}

/**
 * 推进一步让位状态机
 *
 * @param {object} params
 * @param {number} params.y 当前滚动量
 * @param {number} params.delta 本次滚动增量（正=下滚，负=上滚）
 * @param {number} params.down 已累积的下滚净位移
 * @param {number} params.up 已累积的上滚净位移
 * @param {boolean} params.parked 当前是否已让位
 * @param {boolean} [params.reading] 文章正文阅读态
 * @param {number} [params.viewportHeight] 视口高度
 * @returns {{parked:boolean, down:number, up:number, upThreshold:number}}
 */
export function resolveNavParking({
  y = 0,
  delta = 0,
  down = 0,
  up = 0,
  parked = false,
  reading = false,
  viewportHeight = 800
} = {}) {
  const upThreshold = computeUpThreshold({ reading, viewportHeight })

  // 常驻区：回到这条线以内一律展开，并把累计清零
  if (y <= NAV_PARK.REST_ZONE) {
    return { parked: false, down: 0, up: 0, upThreshold }
  }

  if (delta > 0) {
    const nextDown = down + delta
    return {
      parked: nextDown > NAV_PARK.DOWN_TRAVEL ? true : parked,
      down: nextDown,
      up: 0,
      upThreshold
    }
  }

  if (delta < 0) {
    const nextUp = up - delta
    return {
      parked: nextUp > upThreshold ? false : parked,
      down: 0,
      up: nextUp,
      upThreshold
    }
  }

  return { parked, down, up, upThreshold }
}

export default resolveNavParking
