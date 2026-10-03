import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CONFIG from '../config'

function coverOf(post) {
  return post?.pageCoverThumbnail || post?.pageCover || ''
}

/**
 * 首页报头：叠层抽牌 + 可选封面背景
 */
export default function LatestCard({ post, posts }) {
  const enabled = siteConfig('CIRCLELIFE_HOME_LATEST_CARD', true, CONFIG)
  const max = Number(siteConfig('CIRCLELIFE_HERO_COUNT', 5, CONFIG)) || 5
  const autoMs = Number(siteConfig('CIRCLELIFE_HERO_AUTO_MS', 6000, CONFIG)) || 0
  const useCover = siteConfig('CIRCLELIFE_HERO_COVER', true, CONFIG)

  const slides = useMemo(() => {
    const list = (
      Array.isArray(posts) && posts.length ? posts : post ? [post] : []
    )
      .filter(p => p?.href && p?.title)
      .slice(0, Math.max(1, max))
    return list
  }, [posts, post, max])

  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState('')
  const [paused, setPaused] = useState(false)
  const busyRef = useRef(false)
  const indexRef = useRef(0)
  const count = slides.length
  const current = slides[index] || slides[0]
  const nextSlide = count > 1 ? slides[(index + 1) % count] : null

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const advance = useCallback(
    (deltaOrIndex, isAbsolute = false) => {
      if (count <= 1 || busyRef.current) return
      const cur = indexRef.current
      const nextIndex = isAbsolute
        ? ((deltaOrIndex % count) + count) % count
        : (((cur + deltaOrIndex) % count) + count) % count
      if (nextIndex === cur) return

      let direction = 1
      if (!isAbsolute) {
        direction = deltaOrIndex >= 0 ? 1 : -1
      } else if (cur === count - 1 && nextIndex === 0) {
        direction = 1
      } else if (cur === 0 && nextIndex === count - 1) {
        direction = -1
      } else {
        direction = nextIndex > cur ? 1 : -1
      }

      busyRef.current = true
      setAnim(direction > 0 ? 'out-next' : 'out-prev')
      window.setTimeout(() => {
        indexRef.current = nextIndex
        setIndex(nextIndex)
        setAnim('')
        busyRef.current = false
      }, 340)
    },
    [count]
  )

  useEffect(() => {
    if (count <= 1 || autoMs <= 0 || paused) return undefined
    const t = window.setInterval(() => advance(1), autoMs)
    return () => window.clearInterval(t)
  }, [count, autoMs, advance, paused, index])

  if (!enabled || !current?.href) return null

  const cover = useCover ? coverOf(current) : ''

  const renderFace = (slide, faceClass) => {
    if (!slide) return null
    const c = useCover ? coverOf(slide) : ''
    const k =
      (slide.category && String(slide.category)) ||
      siteConfig('CIRCLELIFE_LATEST_KICKER', '最近', CONFIG)
    const d = slide.publishDay || slide.date?.start_date || ''
    return (
      <div className={`cl-deck-face ${faceClass} ${c ? 'has-cover' : ''}`}>
        {c ? (
          <div className='cl-deck-cover' aria-hidden='true'>
            <LazyImage src={c} alt='' className='cl-deck-cover-img' />
            <div className='cl-deck-cover-shade' />
          </div>
        ) : null}
        <div className='cl-deck-content'>
          <div className='cl-kicker cl-hero-kicker'>
            <span>{k}</span>
            {d ? <span className='cl-kicker-sep'>·</span> : null}
            {d ? <span>{d}</span> : null}
          </div>
          <SmartLink href={slide.href} className='cl-latest-title'>
            {slide.title}
          </SmartLink>
          {slide.summary ? (
            <p className='cl-latest-summary'>{slide.summary}</p>
          ) : null}
          {slide.category ? (
            <div className='cl-deck-chip-row'>
              <span className='cl-chip cl-chip--soft cl-chip--on-cover'>
                {slide.category}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <aside
      className={`cl-latest-card cl-hero cl-deck ${
        cover ? 'cl-deck--covered' : ''
      } ${anim ? `is-${anim}` : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='精选文章'>
      <div className='cl-deck-stage'>
        {count > 1 && nextSlide ? (
          <div className='cl-deck-under' aria-hidden='true'>
            {renderFace(nextSlide, 'cl-deck-face--under')}
          </div>
        ) : null}
        <div className='cl-deck-top'>
          {renderFace(current, 'cl-deck-face--top')}
        </div>
      </div>

      <div className='cl-hero-toolbar cl-deck-toolbar'>
        <span className='cl-hero-count' aria-live='polite'>
          {count > 1 ? `${index + 1} / ${count}` : '\u00a0'}
        </span>
        {count > 1 ? (
          <div className='cl-hero-controls'>
            <button
              type='button'
              className='cl-hero-nav'
              aria-label='上一篇'
              onClick={() => advance(-1)}>
              ‹
            </button>
            <button
              type='button'
              className='cl-hero-nav'
              aria-label='下一篇'
              onClick={() => advance(1)}>
              ›
            </button>
          </div>
        ) : null}
      </div>

      {count > 1 ? (
        <div
          className='cl-hero-dots cl-deck-dots'
          role='tablist'
          aria-label='幻灯片'>
          {slides.map((s, i) => (
            <button
              key={s.id || s.href || i}
              type='button'
              role='tab'
              aria-selected={i === index}
              className={`cl-hero-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => advance(i, true)}
              aria-label={`第 ${i + 1} 篇`}
            />
          ))}
        </div>
      ) : null}
    </aside>
  )
}
