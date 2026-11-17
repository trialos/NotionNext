import { useEffect, useRef, useState } from 'react'

/**
 * 文章阅读进度：固定在视口顶边的「书口线」
 *
 * 与悬浮胶囊彻底解耦 —— 胶囊让位／归位都不影响这条线，所以阅读时它始终在，
 * 不会出现「往回看一行，进度条就没了」。
 *
 * 形态（styles/header.js 的 cl-read-progress 段）：
 *   · 上边 2px = 朱砂填充，头部 28px 渐隐收笔（墨迹未干，而非平头色带）
 *   · 下边 1px = 纸边细轨（印刷里细/粗双线的秩序感）
 *   · 左右内缩 24px、进度为 0 时整体不显示
 *
 * 性能：滚动中几乎每帧都要重算，所以**不**走 React state ——
 * 只往容器写一个 --cl-progress 变量（填充用 clip-path 派生，不触发布局）。
 * aria-valuenow 仍降频到 200ms 一次：读屏能拿到进度，又不拖累滚动。
 */
export default function ReadingProgress({ targetSelector = '#article-wrapper' }) {
  const rootRef = useRef(null)
  const lastAriaAt = useRef(0)
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf = 0
    const applyProgress = pct => {
      const p = Math.max(0, Math.min(1, pct / 100))
      if (rootRef.current) {
        rootRef.current.style.setProperty('--cl-progress', p.toFixed(4))
      }
      const now = Date.now()
      if (now - lastAriaAt.current > 200) {
        lastAriaAt.current = now
        setValue(Math.round(p * 100))
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
        // 短文章：越过正文顶部一小段即视为读完
        applyProgress(rect.top < viewH * 0.35 ? 100 : 0)
        return
      }
      const scrolled = -rect.top
      applyProgress((scrolled / total) * 100)
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
      ref={rootRef}
      className='cl-read-progress'
      role='progressbar'
      aria-label='阅读进度'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}>
      <span className='cl-read-progress-fill' aria-hidden='true' />
      <span className='cl-read-progress-track' aria-hidden='true' />
    </div>
  )
}
