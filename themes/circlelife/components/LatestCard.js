import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CONFIG from '../config'

/**
 * 首页报头轮播：最新 N 篇可切换（淡入 + 圆点/箭头）
 */
export default function LatestCard({ post, posts }) {
  const enabled = siteConfig('CIRCLELIFE_HOME_LATEST_CARD', true, CONFIG)
  const max = Number(siteConfig('CIRCLELIFE_HERO_COUNT', 5, CONFIG)) || 5
  const autoMs = Number(siteConfig('CIRCLELIFE_HERO_AUTO_MS', 6000, CONFIG)) || 0

  const slides = useMemo(() => {
    const list = (Array.isArray(posts) && posts.length ? posts : post ? [post] : [])
      .filter(p => p?.href && p?.title)
      .slice(0, Math.max(1, max))
    return list
  }, [posts, post, max])

  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const current = slides[index] || slides[0]

  const go = useCallback(
    next => {
      if (count <= 1) return
      setFade(false)
      window.setTimeout(() => {
        setIndex(i => {
          const n = typeof next === 'number' ? next : next(i)
          return ((n % count) + count) % count
        })
        setFade(true)
      }, 160)
    },
    [count]
  )

  useEffect(() => {
    if (count <= 1 || autoMs <= 0 || paused) return undefined
    const t = window.setInterval(() => go(i => i + 1), autoMs)
    return () => window.clearInterval(t)
  }, [count, autoMs, go, index, paused])

  if (!enabled || !current?.href) return null

  const kicker =
    (current.category && String(current.category)) ||
    siteConfig('CIRCLELIFE_LATEST_KICKER', '最近', CONFIG)
  const day = current.publishDay || current.date?.start_date || ''

  return (
    <aside
      className='cl-latest-card cl-hero'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='精选文章'>
      <div className='cl-hero-toolbar'>
        <div className='cl-kicker cl-hero-kicker'>
          <span>{kicker}</span>
          {day ? <span className='cl-kicker-sep'>·</span> : null}
          {day ? <span>{day}</span> : null}
        </div>
        {count > 1 ? (
          <div className='cl-hero-controls'>
            <button
              type='button'
              className='cl-hero-nav'
              aria-label='上一篇'
              onClick={() => go(i => i - 1)}>
              ‹
            </button>
            <span className='cl-hero-count'>
              {index + 1}/{count}
            </span>
            <button
              type='button'
              className='cl-hero-nav'
              aria-label='下一篇'
              onClick={() => go(i => i + 1)}>
              ›
            </button>
          </div>
        ) : null}
      </div>

      <div
        className={`cl-hero-body ${fade ? 'is-in' : 'is-out'}`}
        key={current.id || current.href}>
        <SmartLink href={current.href} className='cl-latest-title'>
          {current.title}
        </SmartLink>
        {current.summary ? (
          <p className='cl-latest-summary'>{current.summary}</p>
        ) : null}
      </div>

      <div className='cl-latest-meta cl-hero-meta'>
        {current.category ? (
          <SmartLink
            href={`/category/${current.category}`}
            className='cl-chip cl-chip--soft'>
            {current.category}
          </SmartLink>
        ) : (
          <span />
        )}
        {count > 1 ? (
          <div className='cl-hero-dots' role='tablist' aria-label='幻灯片'>
            {slides.map((s, i) => (
              <button
                key={s.id || s.href || i}
                type='button'
                role='tab'
                aria-selected={i === index}
                className={`cl-hero-dot ${i === index ? 'is-active' : ''}`}
                onClick={() => go(i)}
                aria-label={`第 ${i + 1} 篇`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
