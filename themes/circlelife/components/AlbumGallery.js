import LazyImage from '@/components/LazyImage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import AuthorBadge from './AuthorBadge'

const THRESH = 0.2
const TAP_MAX = 10
const OUT_MS = 280
const IN_MS = 320
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

/**
 * 单辑横向循环翻卡 + 玻璃浮层 + 模糊光晕 + 全屏灯箱
 * albumName = Notion 页面标题
 */
export default function AlbumGallery({ albumName, photos }) {
  const n = photos?.length || 0
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [glowSrc, setGlowSrc] = useState('')
  const [glowOn, setGlowOn] = useState(false)
  const [portalReady, setPortalReady] = useState(false)

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
  const busyRef = useRef(false)
  const activeRef = useRef(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      activeRef.current = true
      return undefined
    }
    const io = new IntersectionObserver(
      entries => {
        activeRef.current = entries.some(
          e => e.isIntersecting && e.intersectionRatio >= 0.4
        )
      },
      { threshold: [0.35, 0.55, 0.75] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const cardWidth = () =>
    mainRef.current?.offsetWidth ||
    Math.min(stageRef.current?.clientWidth || 320, 360)

  const applyTransform = (x, withTransition, duration = OUT_MS) => {
    const el = mainRef.current
    if (!el) return
    const rot = x * 0.035
    el.style.transition = withTransition
      ? `transform ${duration}ms ${EASE}, opacity ${duration}ms ${EASE}`
      : 'none'
    el.style.opacity = Math.abs(x) > cardWidth() * 0.7 ? '0.35' : '1'
    el.style.transform = `translate3d(calc(-50% + ${x}px), -50%, 0) rotate(${rot}deg)`
  }

  const resetMain = () => {
    const el = mainRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.opacity = '1'
    el.style.transform = 'translate3d(-50%, -50%, 0) rotate(0deg)'
  }

  /** dir: +1 下一张（向左飞出）, -1 上一张 */
  const animateTo = useCallback(
    dir => {
      if (n <= 1 || busyRef.current) return
      busyRef.current = true
      const w = cardWidth()
      const outX = dir > 0 ? -w * 1.05 : w * 1.05
      const inX = dir > 0 ? w * 0.42 : -w * 0.42

      applyTransform(outX, true, OUT_MS)
      window.setTimeout(() => {
        setIndex(i => (i + dir + n) % n)
        // 入场起始位
        applyTransform(inX, false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            applyTransform(0, true, IN_MS)
            window.setTimeout(() => {
              resetMain()
              busyRef.current = false
            }, IN_MS + 20)
          })
        })
      }, OUT_MS)
    },
    [n]
  )

  const go = useCallback(
    dir => {
      if (n <= 1) return
      if (expanded) {
        setIndex(i => (i + dir + n) % n)
        return
      }
      animateTo(dir)
    },
    [n, expanded, animateTo]
  )

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
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        d.active = false
        d.locked = 'v'
        applyTransform(0, true, 200)
        try {
          e.currentTarget.releasePointerCapture(d.pid)
        } catch (_) {}
        return
      }
      d.locked = 'h'
    }
    if (d.locked !== 'h') return
    if (e.cancelable) e.preventDefault()
    const maxX = Math.max(120, cardWidth() * 0.75)
    const x = Math.max(-maxX, Math.min(maxX, dx))
    d.x = x
    if (Math.abs(x) > TAP_MAX) d.moved = true
    applyTransform(x, false)
  }

  const onPointerUp = () => {
    const d = dragRef.current
    if (!d.active) {
      d.active = false
      return
    }
    const x = d.x
    const moved = d.moved
    const w = cardWidth()
    const th = Math.max(48, w * THRESH)
    d.active = false
    d.locked = null

    if (n > 1 && x <= -th) {
      // 继续沿当前位移飞出再换页
      busyRef.current = true
      applyTransform(-w * 1.05, true, OUT_MS)
      window.setTimeout(() => {
        setIndex(i => (i + 1) % n)
        applyTransform(w * 0.42, false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            applyTransform(0, true, IN_MS)
            window.setTimeout(() => {
              resetMain()
              busyRef.current = false
            }, IN_MS + 20)
          })
        })
      }, OUT_MS)
    } else if (n > 1 && x >= th) {
      busyRef.current = true
      applyTransform(w * 1.05, true, OUT_MS)
      window.setTimeout(() => {
        setIndex(i => (i - 1 + n) % n)
        applyTransform(-w * 0.42, false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            applyTransform(0, true, IN_MS)
            window.setTimeout(() => {
              resetMain()
              busyRef.current = false
            }, IN_MS + 20)
          })
        })
      }, OUT_MS)
    } else {
      applyTransform(0, true, 220)
      if (!moved && Math.abs(x) <= TAP_MAX) {
        setExpanded(true)
      }
    }
    d.x = 0
    d.moved = false
  }

  // 光晕跟随当前图
  useEffect(() => {
    if (!n) return
    const safe = ((index % n) + n) % n
    const url = photos[safe]?.url || photos[safe]?.cover || ''
    if (!url) {
      setGlowOn(false)
      return
    }
    setGlowOn(false)
    const t = window.setTimeout(() => {
      setGlowSrc(url)
      setGlowOn(true)
    }, 40)
    return () => window.clearTimeout(t)
  }, [index, n, photos])

  // 灯箱 body 锁滚
  useEffect(() => {
    if (!expanded) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [expanded])

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
  const next2 = n > 2 ? photos[(safe + 2) % n] : null
  const caption = current.caption || ''
  const pageTitle = albumName || current.title || ''
  const showCaptionTitle =
    current.title && current.title.trim() && current.title.trim() !== pageTitle

  const lightbox =
    expanded && portalReady
      ? createPortal(
          <div className='cl-ag-lb' role='dialog' aria-modal='true'>
            <button
              type='button'
              className='cl-ag-lb-mask'
              aria-label='关闭'
              onClick={() => setExpanded(false)}
            />
            <button
              type='button'
              className='cl-ag-lb-close'
              aria-label='关闭'
              onClick={() => setExpanded(false)}>
              <i className='fas fa-times' />
            </button>
            {n > 1 ? (
              <>
                <button
                  type='button'
                  className='cl-ag-lb-nav cl-ag-lb-nav--prev'
                  aria-label='上一张'
                  onClick={() => go(-1)}>
                  ‹
                </button>
                <button
                  type='button'
                  className='cl-ag-lb-nav cl-ag-lb-nav--next'
                  aria-label='下一张'
                  onClick={() => go(1)}>
                  ›
                </button>
              </>
            ) : null}
            <div className='cl-ag-lb-stage'>
              <img
                src={current.url || current.cover}
                alt={pageTitle || ''}
                className='cl-ag-lb-img'
                draggable={false}
              />
              <div className='cl-ag-lb-meta'>
                {pageTitle ? <p className='cl-ag-lb-title'>{pageTitle}</p> : null}
                <p className='cl-ag-lb-count'>
                  {String(safe + 1).padStart(2, '0')} /{' '}
                  {String(n).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className='cl-ag' ref={rootRef}>
      {/* 整辑区域模糊光晕 */}
      <div className={`cl-ag-ambient${glowOn && glowSrc ? ' is-on' : ''}`} aria-hidden>
        {glowSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={glowSrc} alt='' className='cl-ag-ambient-img' />
        ) : null}
        <div className='cl-ag-ambient-veil' />
      </div>

      <header className='cl-ag-head'>
        <div className='cl-kicker cl-ag-kicker'>
          影集 · {pageTitle || '未命名'}
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
          <div className='cl-ag-card cl-ag-card--far cl-ag-card--left2' aria-hidden>
            <LazyImage
              src={prev2.url || prev2.cover}
              alt=''
              className='cl-ag-img'
              priority={false}
            />
          </div>
        ) : null}
        {next2 ? (
          <div className='cl-ag-card cl-ag-card--far cl-ag-card--right2' aria-hidden>
            <LazyImage
              src={next2.url || next2.cover}
              alt=''
              className='cl-ag-img'
              priority={false}
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
          aria-label={pageTitle || '照片'}>
          {current.url || current.cover ? (
            <LazyImage
              key={current.id || safe}
              src={current.url || current.cover}
              alt={pageTitle || ''}
              className='cl-ag-img cl-ag-img--main'
              priority
            />
          ) : (
            <div className='cl-ag-placeholder'>无图</div>
          )}
        </div>

        {n > 1 ? (
          <div className='cl-ag-arrows'>
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

      {/* 计数在图下 */}
      <div className='cl-ag-countline' aria-live='polite'>
        {String(safe + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
      </div>

      <div className='cl-ag-caption'>
        {showCaptionTitle ? (
          <h3 className='cl-ag-title'>{current.title}</h3>
        ) : null}
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
              onClick={() => {
                if (busyRef.current || i === safe) return
                const dir = i > safe ? 1 : -1
                // 远跳直接切 + 短 fade，避免多圈动画
                busyRef.current = true
                applyTransform(dir > 0 ? -40 : 40, true, 160)
                window.setTimeout(() => {
                  setIndex(i)
                  resetMain()
                  busyRef.current = false
                }, 160)
              }}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
      ) : null}

      {lightbox}
    </div>
  )
}
