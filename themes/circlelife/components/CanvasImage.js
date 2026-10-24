import { useCallback, useEffect, useRef, useState } from 'react'

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
 * - **显存不增**：canvas 位图按**源图尺寸**分配（`naturalWidth × naturalHeight`），
 *   与 `<img>` 的解码纹理同口径。实测当前首页图片纹理约 17.4MB，改后基本不变。
 * - **清晰度不变**：位图是源图尺寸，由 CSS 拉伸到显示尺寸 —— 与 `<img>` 的
 *   行为完全一致（`<img>` 也是解码后按 CSS 盒缩放绘制）。
 * - **裁切等价**：见 `drawCover` —— 与 `object-fit: cover` + `object-position` 逐像素等价。
 * - 失去的：**原生懒加载**（改用 IntersectionObserver）、**srcset 自动选档**
 *   （改由 `Image` 对象的 `srcset`/`sizes` 属性承担，浏览器仍按同一规则选档）、
 *   **alt 语义**（canvas 没有 alt → 本站的图本来就是 `alt=''` 的装饰图，
 *   改用 `aria-hidden` 等价）。**页面级 preload 仍然命中**（同一 URL，命中缓存）。
 *
 * ## 用法
 *
 * ```jsx
 * <CanvasImage
 *   className='cl-home-album-cover'
 *   src={cover.src}
 *   srcSet={cover.srcSet}
 *   sizes={cover.sizes}
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
 * 在 canvas 上画出与 `object-fit: cover` + `object-position` 等价的画面。
 *
 * canvas 的位图尺寸 = 源图尺寸（与 img 解码纹理同口径，显存不增），
 * 所以「裁切」要按**目标盒**的比例在源图空间里算，再原样画到位图上，
 * 最后由 CSS 把位图拉伸到目标盒 —— 整条链路与 `<img>` 的渲染路径等价。
 */
export function drawCover(ctx, img, bitmapW, bitmapH, boxW, boxH, position) {
  const [posX, posY] = parseObjectPosition(position)
  const { sx, sy, sw, sh } = computeCoverRect(
    img.naturalWidth,
    img.naturalHeight,
    boxW,
    boxH,
    posX,
    posY
  )
  ctx.clearRect(0, 0, bitmapW, bitmapH)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, bitmapW, bitmapH)
}

/**
 * 把一张图加载并画进 canvas（**非 React 版本**）。
 *
 * 照片墙的卡片是 JS 直接建 DOM（没有 React 组件），所以核心逻辑抽成
 * 这个工具函数，React 版 `CanvasImage` 与照片墙共用同一套裁剪与加载逻辑。
 *
 * @param {HTMLCanvasElement} canvas 目标 canvas
 * @param {object} opts
 * @param {string} opts.src 主地址
 * @param {string} [opts.srcSet] 候选集（浏览器按 sizes 选档，与 <img> 一致）
 * @param {string} [opts.sizes] sizes 表达式
 * @param {string} [opts.position] object-position（取景焦点）
 * @param {string} [opts.fetchPriority] 优先级
 * @param {() => void} [opts.onReady] 画完后的回调
 * @returns {HTMLImageElement|null} 用于提前取消/复用的 Image 对象
 */
export function loadIntoCanvas(canvas, opts = {}) {
  if (!canvas || !opts.src) return null
  const {
    src,
    srcSet,
    sizes,
    position = 'center',
    fetchPriority,
    onReady
  } = opts

  const img = new Image()
  if (srcSet) img.srcset = srcSet
  if (sizes) img.sizes = sizes
  img.decoding = 'async'
  if (fetchPriority) img.fetchPriority = fetchPriority

  const paint = () => {
    if (!img.naturalWidth) return
    const box = canvas.getBoundingClientRect()
    const boxW = box.width || canvas.clientWidth
    const boxH = box.height || canvas.clientHeight
    if (!boxW || !boxH) return
    const bitmapW = img.naturalWidth
    const bitmapH = img.naturalHeight
    if (canvas.width !== bitmapW) canvas.width = bitmapW
    if (canvas.height !== bitmapH) canvas.height = bitmapH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCover(ctx, img, bitmapW, bitmapH, boxW, boxH, position)
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
  img.src = src
  return img
}

export default function CanvasImage({
  src,
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
    const box = canvas.getBoundingClientRect()
    const boxW = box.width || canvas.clientWidth
    const boxH = box.height || canvas.clientHeight
    if (!boxW || !boxH) return
    const bitmapW = img.naturalWidth
    const bitmapH = img.naturalHeight
    if (canvas.width !== bitmapW) canvas.width = bitmapW
    if (canvas.height !== bitmapH) canvas.height = bitmapH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCover(ctx, img, bitmapW, bitmapH, boxW, boxH, position)
    setReady(true)
    if (onReadyRef.current) onReadyRef.current(img)
  }, [position])

  // 加载：IntersectionObserver 负责懒加载（替代 <img loading="lazy">）；
  // eager 的那几张直接加载。
  useEffect(() => {
    if (typeof window === 'undefined' || !src) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const load = () => {
      if (imgRef.current) return
      const img = new Image()
      imgRef.current = img
      // srcset/sizes 交给浏览器按同一规则选档（与 <img> 完全一致）
      if (srcSet) img.srcset = srcSet
      if (sizes) img.sizes = sizes
      img.decoding = 'async'
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(paint).catch(paint)
        } else {
          paint()
        }
      }
      img.onerror = () => setReady(true)
      img.src = src
    }

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
  }, [src, srcSet, sizes, eager, rootMargin, paint])

  // 视口尺寸变化（影集段是 100vh，地址栏收起会改高度）→ 裁切比例要跟着重算
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let raf = 0
    const onResize = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        if (imgRef.current?.naturalWidth) paint()
      })
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [paint])

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
