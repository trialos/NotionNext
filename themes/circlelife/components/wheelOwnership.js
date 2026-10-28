/**
 * 展墙滚轮接管判定（纯判定，便于单测）
 *
 * 背景：影集页与关于页的照片墙都是自研虚拟滚动（RAF + transform），
 * 必须在 wheel 事件里 preventDefault 才能接管滚动。一旦无条件 preventDefault，
 * 页面上所有滚轮事件都会被吞掉——包括发生在浮层原生滚动容器里的那些，
 * 表现为「影集目录滚不动，滚轮全喂给了背景照片墙」。
 *
 * 语义：谁拥有滚轮，取决于指针落在哪。
 *   · 指针落在原生滚动容器内（影集目录列表 / 顶栏全屏大菜单 / 搜索结果）
 *     → 交还浏览器原生滚动，展墙不得插手。
 *   · 其余（展墙自身画布、顶栏导航胶囊这类不含滚动容器的浮层）
 *     → 展墙照常接管，保持既有手感。
 */

/** 浏览器认定为「用户可用滚轮滚动」的 overflow-y 取值 */
const SCROLLABLE_OVERFLOW = ['auto', 'scroll', 'overlay']

/**
 * 判定一次滚轮事件是否应由展墙接管
 *
 * @param {EventTarget|null} target 滚轮事件的目标元素
 * @param {Element|null} stageEl 展墙舞台元素（内部没有原生滚动容器）
 * @returns {boolean} true = 展墙接管；false = 交还浏览器原生滚动
 */
export function shouldWallOwnWheel(target, stageEl) {
  if (!target) return true

  // 展墙自身区域：内部没有原生滚动容器，直接接管。
  // 这一步同时省掉了逐层回溯——RAF 每帧都在改 transform，样式树是脏的，
  // 每次滚轮事件做十几次 getComputedStyle 会强制触发样式重算。
  if (stageEl && typeof stageEl.contains === 'function' && stageEl.contains(target)) {
    return true
  }

  let el = target
  // 必须停在 body / html 之前：全站 html { overflow-x: hidden } 按 CSS 规范
  // 会让 overflow-y 的计算值变成 auto，根滚动容器一旦被误判，展墙将彻底失去滚轮。
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.nodeType === 1) {
      const overflowY = window.getComputedStyle(el).overflowY
      if (SCROLLABLE_OVERFLOW.includes(overflowY)) return false
    }
    el = el.parentElement
  }

  return true
}

export default shouldWallOwnWheel
