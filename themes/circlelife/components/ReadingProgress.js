import { useEffect, useState } from 'react'

/**
 * 文章阅读进度：贴在顶栏底边，transform scaleX
 */
export default function ReadingProgress({ targetSelector = '#article-wrapper' }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = document.querySelector(targetSelector)
      if (!el) {
        setProgress(0)
        return
      }
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const total = rect.height - viewH
      if (total <= 8) {
        // short article: fully read once past top a bit
        setProgress(rect.top < viewH * 0.35 ? 100 : 0)
        return
      }
      const scrolled = -rect.top
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
      setProgress(pct)
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

  const value = Math.round(progress)

  return (
    <div
      className='cl-read-progress'
      role='progressbar'
      aria-label='阅读进度'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}>
      <div
        className='cl-read-progress-bar'
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}
