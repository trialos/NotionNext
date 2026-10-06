import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CONFIG from '../config'
import AuthorBadge from './AuthorBadge'
import { resolveAuthor } from './authors'

const FLIP_MS = 340

function coverOf(post) {
  return post?.pageCoverThumbnail || post?.pageCover || ''
}

/**
 * 首页报头：叠层抽牌
 * outgoing 克隆飞出卸载；current 原位替换；under 仅 peek 不参与抬起动画
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
  const [outgoing, setOutgoing] = useState(null) // { slide, dir: 1|-1 }
  const [swapInstant, setSwapInstant] = useState(false)
  const [paused, setPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const dragRef = useRef({ active: false, x: 0, startX: 0, moved: false })
  const stageDragRef = useRef(null)
  const busyRef = useRef(false)
  const indexRef = useRef(0)
  const count = slides.length
  const current = slides[index] || slides[0]
  const nextSlide = count > 1 ? slides[(index + 1) % count] : null

  useEffect(() => {
    indexRef.current = index
  }, [index])

  // 自动轮播的暂停条件：悬停/拖拽（paused）、页面后台、用户偏好减少动效
  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReducedMotion(mq.matches)
    onMq()
    mq.addEventListener?.('change', onMq)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      mq.removeEventListener?.('change', onMq)
    }
  }, [])

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

      const leaving = slides[cur]
      if (!leaving) return

      busyRef.current = true
      // 1) mount outgoing at rest  2) swap current under it  3) fly outgoing
      setOutgoing({ slide: leaving, dir: direction, flying: false })
      setSwapInstant(true)
      indexRef.current = nextIndex
      setIndex(nextIndex)

      window.requestAnimationFrame(() => {
        setOutgoing(o => (o ? { ...o, flying: true } : o))
        window.requestAnimationFrame(() => setSwapInstant(false))
      })

      window.setTimeout(() => {
        setOutgoing(null)
        busyRef.current = false
      }, FLIP_MS)
    },
    [count, slides]
  )

  useEffect(() => {
    if (count <= 1 || autoMs <= 0 || paused || pageHidden || reducedMotion)
      return undefined
    const t = window.setInterval(() => advance(1), autoMs)
    return () => window.clearInterval(t)
  }, [count, autoMs, advance, paused, pageHidden, reducedMotion, index])

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
            <LazyImage
              src={c}
              alt=''
              priority={
                faceClass.includes('current') && slide === slides[0]
              }
              className='cl-deck-cover-img'
            />
            <div className='cl-deck-cover-shade' />
          </div>
        ) : null}
        <div className='cl-deck-content'>
          <div className='cl-kicker cl-hero-kicker'>
            <span>{k}</span>
            {d ? <span className='cl-kicker-sep'>·</span> : null}
            {d ? <span>{d}</span> : null}
          </div>
          <SmartLink
            href={slide.href}
            className='cl-latest-title'
            tabIndex={faceClass.includes('outgoing') || faceClass.includes('under') ? -1 : undefined}
            onClick={e => {
              if (dragRef.current?.moved) {
                e.preventDefault()
              }
            }}>
            {slide.title}
          </SmartLink>
          {slide.summary ? (
            <p className='cl-latest-summary'>{slide.summary}</p>
          ) : null}
          <div className='cl-deck-chip-row'>
            {(() => {
              const a = resolveAuthor(slide)
              return a?.name ? (
                <AuthorBadge author={a} size={20} className='cl-deck-author' />
              ) : null
            })()}
            {slide.category ? (
              <span className='cl-chip cl-chip--soft cl-chip--on-cover'>
                {slide.category}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const outClass = !outgoing?.flying
    ? ''
    : outgoing.dir > 0
      ? 'is-fly-next'
      : 'is-fly-prev'


  const onHeroPointerDown = e => {
    if (count <= 1 || busyRef.current) return
    if (e.button != null && e.button !== 0) return
    if (e.target.closest?.('a, button')) return
    dragRef.current = {
      active: true,
      x: 0,
      startX: e.clientX,
      moved: false
    }
    setPaused(true)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
  }
  const onHeroPointerMove = e => {
    const d = dragRef.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    d.x = dx
    if (Math.abs(dx) > 10) d.moved = true
  }
  const onHeroPointerUp = () => {
    const d = dragRef.current
    if (!d.active) return
    d.active = false
    const dx = d.x
    setPaused(false)
    if (d.moved && Math.abs(dx) > 48) {
      advance(dx < 0 ? 1 : -1)
    }
    d.x = 0
    d.moved = false
  }

  return (
    <aside
      className={`cl-latest-card cl-hero cl-deck ${
        cover ? 'cl-deck--covered' : ''
      } ${swapInstant ? 'is-swap-instant' : ''} ${outgoing ? 'is-flipping' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='精选文章'>
      <div
        className='cl-deck-stage'
        onPointerDown={onHeroPointerDown}
        onPointerMove={onHeroPointerMove}
        onPointerUp={onHeroPointerUp}
        onPointerCancel={onHeroPointerUp}>
        {count > 1 && nextSlide ? (
          <div className='cl-deck-under' aria-hidden='true'>
            {renderFace(nextSlide, 'cl-deck-face--under')}
          </div>
        ) : null}

        <div className='cl-deck-current'>
          {renderFace(current, 'cl-deck-face--current')}
        </div>

        {outgoing?.slide ? (
          <div
            className={`cl-deck-outgoing ${outClass}`}
            aria-hidden='true'>
            {renderFace(outgoing.slide, 'cl-deck-face--outgoing')}
          </div>
        ) : null}
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
