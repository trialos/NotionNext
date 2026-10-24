import { useCallback, useEffect, useRef, useState } from 'react'
import { buildSizedSource, computeTargetPixelWidth } from './imageSrcset'

/**
 * CanvasImage —— 用 canvas 承载图片的等价物
 *
 * ## 为什么需要它
 *
 * **Chrome 的 LCP（最大内容绘制）候选包含**：文本块、`<img>`、SVG `<image>`、
 * `<video>` 首帧，以及**带背景图的元素**。也就是说 —— **只要一张照片被画在
 * DOM 元素上并且出现在视口里，它就会成为 LCP 候选**。
 *
 * 而 **滚动不算「用户输入」**，所以 LCP 在整段滚动里会持续被更新：长滚动页上，
 * 用户滚到哪张更大的图，哪张图就成为新的 LCP。实测本站首页：首屏 LCP 548ms
 * （很好），滚到影集段后被那张 100vh 的全屏封面顶到 **27s**。
 *
 * 逐条实测过的「假解法」（都无效）：
 * - `opacity: 0` 的 `<img>` → **仍是候选**（Chrome 照样记录它绘制了）
 * - 背景画在 `::before` 伪元素上 → 宿主元素**仍**是候选
 * - 把 `<img>` 缩到 1×1 → 画面就没了；而且背景图的**自然尺寸**决定候选面积
 * - 给首屏容器加背景图占位 → 背景被内部内容遮住 → **不可见就不算候选**
 *
 * **唯一有效的豁免是 canvas**：canvas 的像素不是「元素内容」，本身不产生 LCP
 * 候选；而用来绘制的 `Image` 对象**没有插入 DOM**，同样不是候选。
 *
 * ## 代价（实测，不是估算）
 *
 * - **显存不增**：位图按**显示尺寸 × DPR**分配（上限 = 源图自然尺寸），
 *   与 `<img>` 在显示分辨率上的解码纹理同口径。实测当前首页图片纹理约 17.4MB。
 * - **清晰度不变**：位图是显示分辨率，由 CSS 拉伸到显示尺寸 —— 与 `<img>`
 *   的行为完全一致（`<img>` 也是解码后按 CSS 盒缩放绘制）。
 * - **裁切等价**：见 `drawCover` —— 与 `object-fit: cover` + `object-position` 逐像素等价。
 * - 失去的：**原生懒加载**（改用 IntersectionObserver）、**srcset 自动选档**
 *   （**故意不用**：Notion 代理在 srcset 选档路径下返回「预裁切小图」，
 *   见 `imageSrcset.js` 的 `buildSizedSource` 注释 → 首页一律直连 width URL）、
 *   **alt 语义**（canvas 没有 alt → 本站的图本来就是 `alt=''` 的装饰图，
 *   改用 `aria-hidden` 等价）。**页面级 preload 仍然命中**（同一 URL，命中缓存）。
 *
 * ## 取盒铁律（2026-10 踩过的坑）
 *
 * **不可用 `getBoundingClientRect()` 取盒**：照片墙的祖先链有
 * `rotate(8deg) scale(1.15)` → gBCR 返回的是**变换后的外接框（AABB）**，
 * 不是布局盒 → 裁切比例按外接框算 → 非方形卡片被额外裁掉 7%~14%
 * （方形卡无影响 → 表现为「有的照片被裁剪了」）。一律用 `measureBox()`。
 *
 * ## 用法
 *
 * ```jsx
 * <CanvasImage
 *   className='cl-home-album-cover'
 *   src={cover.src}
 *   position={`50% ${Math.round((cover.pos ?? 0.5) * 100)}%`}
 *   eager={index === 0}
 * />
 * ```
 */

/** 解析 CSS `object-position`（如 `50% 30%` / `center`）→ [posX, posY]，取值 0~1 */
export function parseObjectPosition(position) {
  if (!position) return [0.5, 0.5]
  const parts = String(position)
    .trim()
    .split(/\s+/)
  const toRatio = token => {
    if (!token) return 0.5
    if (token === 'left' || token === 'top') return 0
    if (token === 'right' || token === 'bottom') return 1
    if (token === 'center') return 0.5
    if (token.endsWith('%')) return Math.min(1, Math.max(0, parseFloat(token) / 100))
    const n = parseFloat(token)
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5
  }
  const x = toRatio(parts[0])
  const y = parts.length > 1 ? toRatio(parts[1]) : toRatio(parts[0])
  return [x, y]
}

/**
 * 按 `object-fit: cover` 的规则，把源图的可见矩形算出来。
 *
 * 与浏览器的一致性：cover = 保持比例放大到**覆盖**目标盒，超出部分按
 * `object-position` 裁掉。返回值是源图坐标系里的矩形（sx, sy, sw, sh）。
 */
export function computeCoverRect(srcW, srcH, boxW, boxH, posX = 0.5, posY = 0.5) {
  if (!srcW || !srcH || !boxW || !boxH) {
    return { sx: 0, sy: 0, sw: srcW || 0, sh: srcH || 0 }
  }
  const scale = Math.max(boxW / srcW, boxH / srcH)
  const visibleW = boxW / scale
  const visibleH = boxH / scale
  const sx = (srcW - visibleW) * posX
  const sy = (srcH - visibleH) * posY
  return { sx, sy, sw: visibleW, sh: visibleH }
}

/**
 * 取「布局盒」（CSS 像素，不含祖先 transform 的影响）。
 *
 * ⚠️ **不可用 `getBoundingClientRect()`**：照片墙祖先链有 rotate(8deg) scale(1.15)，
 * gBCR 返回变换后的外接框 → 裁切比例按外接框算 → 非方形卡片被多裁 7%~14%。
 * `clientWidth/clientHeight` 是布局尺寸，旋转与缩放都不影响它。
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {{ w: number, h: number }}
 */
export function measureBox(canvas) {
  if (!canvas) return { w: 0, h: 0 }
  return {
    w: canvas.clientWidth || canvas.offsetWidth || 0,
    h: canvas.clientHeight || canvas.offsetHeight || 0
  }
}

/** 设备像素比（SSR / 老浏览器兜底 1） */
export function getDpr() {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * 位图尺寸 = 显示尺寸 × DPR，且**不超过源图自然尺寸**（不放大位图）。
 *
 * 位图不再等于源图尺寸：源图可能是 768×1024 的原图，而显示只要 440×656
 * → 按显示尺寸分配，显存与显示分辨率同口径；同时源图小于显示时也不浪费显存。
 *
 * @returns {{ w: number, h: number }}
 */
export function computeBitmapSize(boxW, boxH, dpr, srcW, srcH) {
  const ratio = Number(dpr) > 0 ? Number(dpr) : 1
  let w = Math.max(1, Math.round((boxW || 0) * ratio))
  let h = Math.max(1, Math.round((boxH || 0) * ratio))
  if (srcW > 0 && srcH > 0) {
    if (w > srcW) {
      const k = srcW / w
      w = srcW
      h = Math.max(1, Math.round(h * k))
    }
    if (h > srcH) {
      const k = srcH / h
      h = srcH
      w = Math.max(1, Math.round(w * k))
    }
  }
  return { w, h }
}

/**
 * 在 canvas 上画出与 `object-fit: cover` + `object-position` 等价的画面。
 *
 * 裁切在**源图坐标系**里算（`computeCoverRect`），再把可见矩形画进
 * 目标位图（dstW × dstH）—— 位图的宽高比等于目标盒，可见矩形因此**等比铺满**，
 * 不会出现二次变形。
 */
export function drawCover(ctx, img, dstW, dstH, boxW, boxH, position) {
  const [posX, posY] = parseObjectPosition(position)
  const { sx, sy, sw, sh } = computeCoverRect(
    img.naturalWidth,
    img.naturalHeight,
    boxW,
    boxH,
    posX,
    posY
  )
  ctx.clearRect(0, 0, dstW, dstH)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dstW, dstH)
}

/**
 * 把一张图加载并画进 canvas（**非 React 版本**）。
 *
 * 照片墙的卡片是 JS 直接建 DOM（没有 React 组件），所以核心逻辑抽成
 * 这个工具函数，React 版 `CanvasImage` 与照片墙共用同一套裁剪与加载逻辑。
 *
 * @param {HTMLCanvasElement} canvas 目标 canvas
 * @param {object} opts
 * @param {string} opts.src 主地址（Notion 反代地址会按 targetPx 重写 width 档位）
 * @param {number} [opts.targetPx] 目标像素宽度（盒宽 × DPR）→ 选 Notion 的 width 档位
 * @param {string} [opts.position] object-position（取景焦点）
 * @param {string} [opts.fetchPriority] 优先级
 * @param {() => void} [opts.onReady] 画完后的回调
 * @returns {HTMLImageElement|null} 用于提前取消/复用的 Image 对象
 */
export function loadIntoCanvas(canvas, opts = {}) {
  if (!canvas || !opts.src) return null
  const {
    src,
    targetPx,
    position = 'center',
    fetchPriority,
    onReady
  } = opts

  const img = new Image()
  img.decoding = 'async'
  if (fetchPriority) img.fetchPriority = fetchPriority

  const paint = () => {
    if (!img.naturalWidth) return
    const { w: boxW, h: boxH } = measureBox(canvas)
    if (!boxW || !boxH) return
    const { w: dstW, h: dstH } = computeBitmapSize(
      boxW,
      boxH,
      getDpr(),
      img.naturalWidth,
      img.naturalHeight
    )
    if (canvas.width !== dstW) canvas.width = dstW
    if (canvas.height !== dstH) canvas.height = dstH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCover(ctx, img, dstW, dstH, boxW, boxH, position)
    if (onReady) onReady(img)
  }

  img.onload = () => {
    if (typeof img.decode === 'function') {
      img.decode().then(paint).catch(paint)
    } else {
      paint()
    }
  }
  img.onerror = () => {
    if (onReady) onReady(img)
  }
  // ⚠️ 只用 src，不用 srcset/sizes：Notion 代理在 srcset 选档路径下返回
  // 「预裁切小图」（同一 URL 直连才是未裁切原图）→ 见 imageSrcset.js 的说明。
  img.src = buildSizedSource(src, targetPx)

  // 盒变了就重绘（<img> 的 cover 裁切由浏览器实时跟随，canvas 必须自己跟）
  observeBox(canvas, paint)
  return img
}

/** canvas 上挂的 ResizeObserver 句柄（回收时用） */
const CANVAS_OBSERVER = '__clCanvasObserver'

/**
 * 观察 canvas 的布局盒，尺寸变化时重绘。
 * @param {HTMLCanvasElement} canvas
 * @param {() => void} repaint
 */
function observeBox(canvas, repaint) {
  if (typeof window === 'undefined') return
  if (typeof ResizeObserver === 'undefined') return
  disconnectObserver(canvas)
  let raf = 0
  const observer = new ResizeObserver(() => {
    if (raf) return
    raf = window.requestAnimationFrame(() => {
      raf = 0
      repaint()
    })
  })
  observer.observe(canvas)
  canvas[CANVAS_OBSERVER] = observer
}

/** 断开 canvas 上挂的观察器（不碰位图） */
function disconnectObserver(canvas) {
  if (!canvas) return
  const observer = canvas[CANVAS_OBSERVER]
  if (observer) {
    observer.disconnect()
    canvas[CANVAS_OBSERVER] = null
  }
}

/**
 * 回收 canvas：断开观察器 + 位图置零（把 width/height 归 0 → 浏览器立刻释放纹理）。
 * @param {HTMLCanvasElement} canvas
 */
export function releaseCanvas(canvas) {
  if (!canvas) return
  disconnectObserver(canvas)
  canvas.width = 0
  canvas.height = 0
}

export default function CanvasImage({
  src,
  /**
   * `srcSet` / `sizes`：**canvas 路径故意不用**（保留在签名里只为兼容旧调用方）。
   * 原因（2026-10 实测）：Notion 图片代理在 srcset 选档路径下对**同一个 URL**
   * 返回「预裁切小图」，直连 src 才是未裁切原图 → 走 srcset 等于照片先被裁一道，
   * canvas 再裁一道 = 双重裁切（观感上就是「图片被放大了」）。
   * 取图档位改由本组件按「盒宽 × DPR」自己算（见 imageSrcset.js）。
   */
  srcSet,
  sizes,
  position = 'center',
  className,
  style,
  eager = false,
  rootMargin = '300px',
  ariaLabel,
  onReady,
  ...rest
}) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [ready, setReady] = useState(false)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.naturalWidth) return
    const { w: boxW, h: boxH } = measureBox(canvas)
    if (!boxW || !boxH) return
    const { w: dstW, h: dstH } = computeBitmapSize(
      boxW,
      boxH,
      getDpr(),
      img.naturalWidth,
      img.naturalHeight
    )
    if (canvas.width !== dstW) canvas.width = dstW
    if (canvas.height !== dstH) canvas.height = dstH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCover(ctx, img, dstW, dstH, boxW, boxH, position)
    setReady(true)
    if (onReadyRef.current) onReadyRef.current(img)
  }, [position])

  /**
   * 取图并绘制。
   * ⚠️ 盒为 0（元素还不可见，例如移动端下隐藏的桌面封面）→ **不取图**：
   * 否则会按最小档白下一份看不见的图（实测：移动端多出两条 256 档请求）。
   * 盒出现后由 ResizeObserver / resize 再触发。
   */
  const load = useCallback(() => {
    if (imgRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const { w: boxW } = measureBox(canvas)
    if (!boxW) return
    const img = new Image()
    imgRef.current = img
    img.decoding = 'async'
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(paint).catch(paint)
      } else {
        paint()
      }
    }
    img.onerror = () => setReady(true)
    // ⚠️ 只用 src，不用 srcset/sizes：Notion 代理在 srcset 选档路径下返回
    // 「预裁切小图」（同一 URL 直连才是未裁切原图）→ 见 imageSrcset.js 的说明。
    // 档位按「盒宽 × DPR」自己算，写进 width 参数。
    const targetPx = computeTargetPixelWidth(boxW, getDpr())
    img.src = buildSizedSource(src, targetPx)
  }, [src, paint])

  /** 盒变了：还没取图就取图，已取图就重绘 */
  const sync = useCallback(() => {
    if (!imgRef.current) {
      load()
      return
    }
    paint()
  }, [load, paint])

  // 加载：IntersectionObserver 负责懒加载（替代 <img loading="lazy">）；
  // eager 的那几张直接加载。
  useEffect(() => {
    if (typeof window === 'undefined' || !src) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined

    if (eager || typeof IntersectionObserver === 'undefined') {
      load()
      return undefined
    }

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          load()
          io.disconnect()
        }
      },
      { rootMargin }
    )
    io.observe(canvas)
    return () => io.disconnect()
  }, [src, eager, rootMargin, load])

  // 盒变了就重绘（<img> 的 cover 裁切由浏览器实时跟随，canvas 必须自己跟）：
  // 影集段是 100vh（地址栏收放会改高度）、文章图版宽度由 JS 写 --plate-w。
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    observeBox(canvas, sync)
    return () => disconnectObserver(canvas)
  }, [sync])

  // 视口尺寸变化（影集段是 100vh，地址栏收起会改高度）→ 裁切比例要跟着重算
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let raf = 0
    const onResize = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        sync()
      })
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [sync])

  return (
    <canvas
      ref={canvasRef}
      className={`${className || ''}${ready ? ' is-loaded' : ''}`.trim()}
      style={style}
      /* canvas 没有 alt：装饰图用 aria-hidden（等价于 alt=''）；
         有语义的图用 role="img" + aria-label 保留。 */
      {...(ariaLabel
        ? { role: 'img', 'aria-label': ariaLabel }
        : { 'aria-hidden': 'true' })}
      {...rest}
    />
  )
}
