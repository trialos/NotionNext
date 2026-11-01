import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'
import {
  computeBitmapSize,
  drawCover,
  getDpr,
  measureBox,
  releaseCanvas
} from './CanvasImage'
import { buildSizedSource } from './imageSrcset'

/**
 * 首页文章图版的位图槽
 *
 * 只负责「当前篇/下一篇」的 canvas 位图；不控制整篇文章的透明度/位移
 * （那是 HomeArticleStage 的合成层叠化）。位图生命周期对齐头图：
 * - 固定 1024 档，不按 DPR 去拉更高的档位；
 * - 共享 decoded cache（当前 ±2 共 5 条工作集），别的槽释放 canvas；
 * - arm 只在图片已解码/解码完成/盒子变化时绘制，**不逐帧绘制**；
 * - prefetch 只解码不绘制，支持反向滚动；
 * - release 把 canvas 位图归零，DOM 节点留给外层 figure。
 */

export const ARTICLE_COVER_TIER = 1024
export const COVER_SETTLE_MS = 120
// 当前 ±1 绘制 + ±2 预取 = 5 条工作集；少一条会在反向滑回时丢掉邻篇
const MAX_DECODED = 5
const decoded = new Map()
const pending = new Map()
// 卸载清理后，仍在路上的请求不能再把图片写回缓存
let cacheEpoch = 0

export function coverUrl(src) {
  if (!src) return ''
  return buildSizedSource(src, ARTICLE_COVER_TIER)
}

export function clearCoverCache() {
  cacheEpoch += 1
  decoded.clear()
  pending.clear()
}

function touchDecoded(url, img) {
  decoded.delete(url)
  decoded.set(url, img)
  while (decoded.size > MAX_DECODED) {
    const oldest = decoded.keys().next().value
    decoded.delete(oldest)
  }
  return img
}

function loadCover(url, priority) {
  if (!url) return Promise.resolve(null)
  if (decoded.has(url)) {
    return Promise.resolve(touchDecoded(url, decoded.get(url)))
  }
  if (pending.has(url)) return pending.get(url)

  const epoch = cacheEpoch
  const promise = new Promise(resolve => {
    const img = new Image()
    img.decoding = 'async'
    if (priority) {
      try {
        img.fetchPriority = priority
      } catch {
        // 老 Safari 不支持 fetchPriority，忽略
      }
    }
    // 清理后重开的新请求可能已占住同一个 url，不能误删它的 pending
    const forget = () => {
      if (pending.get(url) === promise) pending.delete(url)
    }
    const settle = () => {
      forget()
      if (epoch !== cacheEpoch || !img.naturalWidth) {
        resolve(null)
        return
      }
      const done = () => {
        if (epoch !== cacheEpoch) {
          resolve(null)
          return
        }
        resolve(touchDecoded(url, img))
      }
      if (typeof img.decode === 'function') {
        img.decode().then(done).catch(done)
      } else {
        done()
      }
    }
    img.onload = settle
    img.onerror = () => {
      forget()
      resolve(null)
    }
    img.src = url
  })
  pending.set(url, promise)
  return promise
}

const HomeArticleCover = forwardRef(function HomeArticleCover(
  { src, position = 'center', className = 'cl-home-article-plate-img' },
  ref
) {
  const canvasRef = useRef(null)
  const liveRef = useRef(false)
  const imgRef = useRef(null)
  const boxRef = useRef({ w: 0, h: 0 })
  const paintedKeyRef = useRef('')
  const settleRef = useRef(0)
  const boxRafRef = useRef(0)
  const positionRef = useRef(position)
  positionRef.current = position

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    const box = boxRef.current
    if (!canvas || !img || !box.w || !box.h || !liveRef.current) return
    const key = `${img.src}|${box.w}x${box.h}|${getDpr()}|${positionRef.current}`
    if (paintedKeyRef.current === key) return
    const { w, h } = computeBitmapSize(
      box.w,
      box.h,
      getDpr(),
      img.naturalWidth,
      img.naturalHeight
    )
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCover(ctx, img, w, h, box.w, box.h, positionRef.current)
    paintedKeyRef.current = key
  }, [])

  const syncBox = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    boxRef.current = measureBox(canvas)
    if (liveRef.current) paint()
  }, [paint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const schedule = () => {
      if (boxRafRef.current) return
      boxRafRef.current = window.requestAnimationFrame(() => {
        boxRafRef.current = 0
        syncBox()
      })
    }
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(schedule)
    observer?.observe(canvas)
    schedule()
    return () => {
      observer?.disconnect()
      if (boxRafRef.current) {
        window.cancelAnimationFrame(boxRafRef.current)
        boxRafRef.current = 0
      }
    }
  }, [syncBox])

  useEffect(() => {
    const canvas = canvasRef.current
    return () => {
      liveRef.current = false
      if (settleRef.current) {
        window.clearTimeout(settleRef.current)
        settleRef.current = 0
      }
      if (canvas) releaseCanvas(canvas)
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      arm(priority = 'auto') {
        liveRef.current = true
        const url = coverUrl(src)
        if (!url) return
        const cached = decoded.get(url)
        if (cached) {
          imgRef.current = cached
          paint()
          return
        }
        if (settleRef.current) {
          window.clearTimeout(settleRef.current)
          settleRef.current = 0
        }
        if (pending.has(url)) {
          pending.get(url).then(img => {
            if (!img || !liveRef.current) return
            imgRef.current = img
            paint()
          })
          return
        }
        settleRef.current = window.setTimeout(() => {
          settleRef.current = 0
          loadCover(url, priority).then(img => {
            if (!img || !liveRef.current) return
            imgRef.current = img
            paint()
          })
        }, COVER_SETTLE_MS)
      },
      prefetch() {
        const url = coverUrl(src)
        if (!url) return
        if (decoded.has(url) || pending.has(url)) return
        loadCover(url, 'low')
      },
      release() {
        liveRef.current = false
        if (settleRef.current) {
          window.clearTimeout(settleRef.current)
          settleRef.current = 0
        }
        imgRef.current = null
        paintedKeyRef.current = ''
        const canvas = canvasRef.current
        if (canvas) releaseCanvas(canvas)
      }
    }),
    [paint, src]
  )

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden='true'
    />
  )
})

export default HomeArticleCover
