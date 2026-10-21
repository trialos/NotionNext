import { useEffect, useRef, useState } from 'react'

/**
 * 文章阅读进度：嵌入悬浮胶囊导航底边的基座线，transform scaleX
 *
 * 性能：滚动中几乎每帧都要重算进度，所以**不**走 React state —— 直接用 ref 写
 * 内联 transform，避开每帧一次的重渲染与 style diff。
 * aria-valuenow 降频到 200ms 一次：读屏软件仍能拿到进度，又不拖累滚动。
 * 轨道自身的初始 transform: scaleX(0) 由 CSS 提供，故此处不设 style prop
 * （一旦 React 接管 style，重渲染会把命令式写入的 transform 冲掉）。
 */
export default function ReadingProgress({ targetSelector = '#article-wrapper' }) {
  const barRef = useRef(null)
  const lastAriaAt = useRef(0)
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf = 0
    const applyProgress = pct => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${pct / 100})`
      }
      const now = Date.now()
      if (now - lastAriaAt.current > 200) {
        lastAriaAt.current = now
        setValue(Math.round(pct))
      }
    }
    const measure = () => {
      raf = 0
      const el = document.querySelector(targetSelector)
      if (!el) {
        applyProgress(0)
        return
      }
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const total = rect.height - viewH
      if (total <= 8) {
        // short article: fully read once past top a bit
        applyProgress(rect.top < viewH * 0.35 ? 100 : 0)
        return
      }
      const scrolled = -rect.top
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
      applyProgress(pct)
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [targetSelector])

  return (
    <div
      className='cl-read-progress'
      role='progressbar'
      aria-label='阅读进度'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}>
      <div className='cl-read-progress-bar' ref={barRef} />
    </div>
  )
}
