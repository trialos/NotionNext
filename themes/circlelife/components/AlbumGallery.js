import LazyImage from '@/components/LazyImage'
import { useCallback, useEffect, useRef, useState } from 'react'
import AuthorBadge from './AuthorBadge'

const THRESH = 0.22
const MAX_X = 260
const TAP_MAX = 10

/**
 * 单辑横向循环翻卡（pointer ref 跟手，本辑内循环）
 */
export default function AlbumGallery({ albumName, photos }) {
  const n = photos?.length || 0
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [tick, setTick] = useState(0)
  const dragRef = useRef({
    active: false,
    locked: null,
    x: 0,
    startX: 0,
    startY: 0,
    moved: false,
    pid: null
  })
  const rootRef = useRef(null)
  const mainRef = useRef(null)
  const stageRef = useRef(null)
  const idxRef = useRef(0)
  const busyRef = useRef(false)
  const activeRef = useRef(false)

  useEffect(() => {
    idxRef.current = index
  }, [index])

  // 仅当前分辑在视口时响应左右键 / 避免多辑同时改 index
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      activeRef.current = true
      return
    }
    const io = new IntersectionObserver(
      entries => {
        const hit = entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.45)
        activeRef.current = hit
      },
      { threshold: [0.35, 0.55, 0.75] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const go = useCallback(
    delta => {
      if (n <= 1 || busyRef.current) return
      setIndex(i => (i + delta + n) % n)
    },
    [n]
  )

  const applyTransform = (x, withTransition) => {
    const el = mainRef.current
    if (!el) return
    const rot = x * 0.04
    el.style.transition = withTransition
      ? 'transform 0.34s cubic-bezier(0.22, 0.61, 0.36, 1)'
      : 'none'
    // 保留 CSS 居中 translate(-50%, -50%)
    el.style.transform = `translate3d(calc(-50% + ${x}px), -50%, 0) rotate(${rot}deg)`
  }

  const finishSwipe = (dir, width) => {
    busyRef.current = true
    const out = dir > 0 ? -width * 0.92 : width * 0.92
    applyTransform(out, true)
    window.setTimeout(() => {
      go(dir)
      applyTransform(0, false)
      busyRef.current = false
      setTick(t => t + 1)
    }, 210)
  }

  const onPointerDown = e => {
    if (expanded || busyRef.current) return
    if (e.button != null && e.button !== 0) return
    if (e.target.closest?.('button, a, .cl-ag-arrows')) return
    dragRef.current = {
      active: true,
      locked: null,
      x: 0,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pid: e.pointerId
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
    applyTransform(0, false)
  }

  const onPointerMove = e => {
    const d = dragRef.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (!d.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      // 纵向意图：交给分辑 snap，取消横拖
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        d.active = false
        d.locked = 'v'
        applyTransform(0, true)
        try {
          e.currentTarget.releasePointerCapture(d.pid)
        } catch (_) {}
        return
      }
      d.locked = 'h'
    }

    if (d.locked !== 'h') return
    if (e.cancelable) e.preventDefault()
    let x = dx
    x = Math.max(-MAX_X, Math.min(MAX_X, x))
    d.x = x
    if (Math.abs(x) > TAP_MAX) d.moved = true
    applyTransform(x, false)
  }

  const onPointerUp = e => {
    const d = dragRef.current
    if (!d.active) {
      d.active = false
      return
    }
    const x = d.x
    const moved = d.moved
    const w = stageRef.current?.clientWidth || e.currentTarget?.clientWidth || 320
    const th = Math.max(52, w * THRESH)
    d.active = false
    d.locked = null

    if (n > 1 && x <= -th) {
      finishSwipe(1, w)
    } else if (n > 1 && x >= th) {
      finishSwipe(-1, w)
    } else {
      applyTransform(0, true)
      // 轻点打开灯箱
      if (!moved && Math.abs(x) <= TAP_MAX) {
        setExpanded(true)
      }
    }
    d.x = 0
    d.moved = false
  }

  useEffect(() => {
    applyTransform(0, false)
  }, [index, tick])

  // 灯箱 Esc；仅当前可见分辑响应左右键
  useEffect(() => {
    const onKey = e => {
      if (expanded) {
        if (e.key === 'Escape') setExpanded(false)
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          go(-1)
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          go(1)
        }
        return
      }
      if (!activeRef.current) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, go])

  if (!n) return null

  const safe = ((index % n) + n) % n
  const current = photos[safe]
  const prev = photos[(safe - 1 + n) % n]
  const next = photos[(safe + 1) % n]
  const prev2 = n > 2 ? photos[(safe - 2 + n) % n] : null
  const next2 = n > 2 ? photos[(safe + 2 + n) % n] : null
  const caption = current.caption || ''

  return (
    <div className='cl-ag' ref={rootRef}>
      <header className='cl-ag-head'>
        <div className='cl-kicker'>影集 · FILM</div>
        <div className='cl-ag-head-row'>
          <h2 className='cl-ag-album-name'>{albumName}</h2>
          <span className='cl-ag-count'>
            {String(safe + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
        </div>
      </header>

      <div
        ref={stageRef}
        className='cl-ag-stage'
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}>
        {prev2 ? (
          <div
            className='cl-ag-card cl-ag-card--far cl-ag-card--left2'
            aria-hidden>
            <LazyImage
              src={prev2.url || prev2.cover}
              alt=''
              className='cl-ag-img'
            />
          </div>
        ) : null}
        {next2 ? (
          <div
            className='cl-ag-card cl-ag-card--far cl-ag-card--right2'
            aria-hidden>
            <LazyImage
              src={next2.url || next2.cover}
              alt=''
              className='cl-ag-img'
            />
          </div>
        ) : null}

        {n > 1 ? (
          <button
            type='button'
            className='cl-ag-card cl-ag-card--side cl-ag-card--left'
            aria-label='上一张'
            onClick={e => {
              e.stopPropagation()
              go(-1)
            }}>
            <LazyImage
              src={prev.url || prev.cover}
              alt=''
              className='cl-ag-img'
            />
          </button>
        ) : null}

        {n > 1 ? (
          <button
            type='button'
            className='cl-ag-card cl-ag-card--side cl-ag-card--right'
            aria-label='下一张'
            onClick={e => {
              e.stopPropagation()
              go(1)
            }}>
            <LazyImage
              src={next.url || next.cover}
              alt=''
              className='cl-ag-img'
            />
          </button>
        ) : null}

        <div
          ref={mainRef}
          className='cl-ag-card cl-ag-card--main'
          role='img'
          aria-label={current.title || '照片'}>
          {current.url || current.cover ? (
            <LazyImage
              src={current.url || current.cover}
              alt={current.title || ''}
              className='cl-ag-img cl-ag-img--main'
            />
          ) : (
            <div className='cl-ag-placeholder'>无图</div>
          )}
        </div>

        {n > 1 ? (
          <div className='cl-ag-arrows' aria-hidden={false}>
            <button
              type='button'
              className='cl-ag-arrow'
              aria-label='上一张'
              onClick={e => {
                e.stopPropagation()
                go(-1)
              }}>
              ‹
            </button>
            <button
              type='button'
              className='cl-ag-arrow'
              aria-label='下一张'
              onClick={e => {
                e.stopPropagation()
                go(1)
              }}>
              ›
            </button>
          </div>
        ) : null}
      </div>

      <div className='cl-ag-caption'>
        {current.title ? <h3 className='cl-ag-title'>{current.title}</h3> : null}
        {caption ? <p className='cl-ag-cap'>{caption}</p> : null}
        {current.summary ? (
          <p className='cl-ag-summary'>{current.summary}</p>
        ) : null}
        <div className='cl-ag-meta'>
          {current.author?.name ? (
            <AuthorBadge author={current.author} size={20} />
          ) : null}
          {current.date ? (
            <span className='cl-ag-date'>{current.date}</span>
          ) : null}
        </div>
      </div>

      {n > 1 ? (
        <div className='cl-ag-dots' role='tablist' aria-label='照片序号'>
          {photos.map((p, i) => (
            <button
              key={p.id || i}
              type='button'
              role='tab'
              aria-selected={i === safe}
              className={`cl-ag-dot ${i === safe ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
      ) : null}

      {expanded ? (
        <div className='cl-ag-lightbox' role='dialog' aria-modal='true'>
          <button
            type='button'
            className='cl-ag-lightbox-mask'
            aria-label='关闭'
            onClick={() => setExpanded(false)}
          />
          <div className='cl-ag-lightbox-panel'>
            <button
              type='button'
              className='cl-icon-btn cl-ag-lightbox-close'
              onClick={() => setExpanded(false)}
              aria-label='关闭'>
              <i className='fas fa-times' />
            </button>
            <LazyImage
              src={current.url || current.cover}
              alt={current.title || ''}
              className='cl-ag-lightbox-img'
            />
            <div className='cl-ag-lightbox-body'>
              {current.title ? (
                <h3 className='cl-ag-title'>{current.title}</h3>
              ) : null}
              {caption ? <p className='cl-ag-cap'>{caption}</p> : null}
              {current.summary ? (
                <p className='cl-ag-summary'>{current.summary}</p>
              ) : null}
              {n > 1 ? (
                <div className='cl-ag-lightbox-nav'>
                  <button
                    type='button'
                    className='cl-ag-arrow'
                    aria-label='上一张'
                    onClick={() => go(-1)}>
                    ‹
                  </button>
                  <span className='cl-ag-count'>
                    {String(safe + 1).padStart(2, '0')} /{' '}
                    {String(n).padStart(2, '0')}
                  </span>
                  <button
                    type='button'
                    className='cl-ag-arrow'
                    aria-label='下一张'
                    onClick={() => go(1)}>
                    ›
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
