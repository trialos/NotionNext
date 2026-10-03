import LazyImage from '@/components/LazyImage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import AuthorBadge from './AuthorBadge'

const THRESH = 0.2
const TAP_MAX = 10
const OUT_MS = 300
const IN_MS = 320
const GLOW_MS = 1100
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

/**
 * 单辑：整叠跟手翻卡 + 双层柔光晕 + 玻璃浮层 + 全屏灯箱
 */
export default function AlbumGallery({ albumName, photos }) {
  const n = photos?.length || 0
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  /** 双层交叉淡化：底淡出 + 顶淡入，总亮度近似恒定，避免末尾闪一下 */
  const [glowBase, setGlowBase] = useState('')
  const [glowTop, setGlowTop] = useState('')
  const [glowPhase, setGlowPhase] = useState('idle') // idle | cross

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
  const stageRef = useRef(null)
  const busyRef = useRef(false)
  const activeRef = useRef(false)
  const glowTimer = useRef(0)

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

  const cardWidth = () => {
    const stage = stageRef.current
    if (!stage) return 320
    const main = stage.querySelector('.cl-ag-card--main')
    return main?.offsetWidth || Math.min(stage.clientWidth * 0.7, 360)
  }

  /** 整叠位移：主卡 + 侧/远卡用 CSS 变量一起动 */
  const setStack = (x, withTransition, duration = OUT_MS) => {
    const stage = stageRef.current
    if (!stage) return
    // 只做平移/微旋，不做 scale 放大缩小，避免「先缩后弹」
    stage.style.setProperty('--ag-dx', `${x}px`)
    stage.style.setProperty('--ag-rot', `${x * 0.022}deg`)
    stage.style.setProperty('--ag-shift', `${x * 0.42}px`)
    stage.style.setProperty('--ag-shift-far', `${x * 0.26}px`)
    stage.style.setProperty('--ag-grow-r', '0')
    stage.style.setProperty('--ag-grow-l', '0')
    stage.style.setProperty('--ag-fade-main', '1')
    if (withTransition) {
      stage.classList.add('is-animating')
      stage.style.setProperty('--ag-dur', `${duration}ms`)
    } else {
      stage.classList.remove('is-animating')
      stage.style.setProperty('--ag-dur', '0ms')
    }
  }

  const resetStack = () => {
    const stage = stageRef.current
    if (!stage) return
    stage.classList.remove('is-animating')
    stage.style.setProperty('--ag-dur', '0ms')
    stage.style.setProperty('--ag-dx', '0px')
    stage.style.setProperty('--ag-rot', '0deg')
    stage.style.setProperty('--ag-shift', '0px')
    stage.style.setProperty('--ag-shift-far', '0px')
    stage.style.setProperty('--ag-grow-r', '0')
    stage.style.setProperty('--ag-grow-l', '0')
    stage.style.setProperty('--ag-fade-main', '1')
  }

  const commitFlip = useCallback(
    dir => {
      if (n <= 1 || busyRef.current) return
      busyRef.current = true
      const w = cardWidth()
      const outX = dir > 0 ? -w * 0.92 : w * 0.92
      setStack(outX, true, OUT_MS)
      window.setTimeout(() => {
        setIndex(i => (i + dir + n) % n)
        // 新主图从对侧入场，侧卡也跟着归位
        const inX = dir > 0 ? w * 0.18 : -w * 0.18
        setStack(inX, false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setStack(0, true, IN_MS)
            window.setTimeout(() => {
              resetStack()
              busyRef.current = false
            }, IN_MS + 30)
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
      commitFlip(dir)
    },
    [n, expanded, commitFlip]
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
    setStack(0, false)
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
        setStack(0, true, 220)
        try {
          e.currentTarget.releasePointerCapture(d.pid)
        } catch (_) {}
        return
      }
      d.locked = 'h'
    }
    if (d.locked !== 'h') return
    if (e.cancelable) e.preventDefault()
    const maxX = Math.max(130, cardWidth() * 0.8)
    const x = Math.max(-maxX, Math.min(maxX, dx))
    d.x = x
    if (Math.abs(x) > TAP_MAX) d.moved = true
    setStack(x, false)
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
      commitFlip(1)
    } else if (n > 1 && x >= th) {
      commitFlip(-1)
    } else {
      setStack(0, true, 240)
      if (!moved && Math.abs(x) <= TAP_MAX) setExpanded(true)
    }
    d.x = 0
    d.moved = false
  }

  // 交叉淡化光晕（总亮度不叠高、结尾不压暗闪）
  useEffect(() => {
    if (!n) return undefined
    const safe = ((index % n) + n) % n
    const url = photos[safe]?.url || photos[safe]?.cover || ''
    if (!url) return undefined

    if (!glowBase) {
      setGlowBase(url)
      setGlowPhase('idle')
      return undefined
    }
    if (url === glowBase && glowPhase === 'idle') return undefined
    // 快速连翻：直接改 top 目标，延长交叉
    window.clearTimeout(glowTimer.current)
    setGlowTop(url)
    setGlowPhase('cross')
    glowTimer.current = window.setTimeout(() => {
      setGlowBase(url)
      setGlowTop('')
      setGlowPhase('idle')
    }, GLOW_MS)
    return () => {
      window.clearTimeout(glowTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, n, photos])

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
      <div
        className={`cl-ag-ambient${glowPhase === 'cross' ? ' is-cross' : ''}`}
        aria-hidden>
        {glowBase ? (
          <img
            src={glowBase}
            alt=''
            className={`cl-ag-ambient-img is-base${
              glowPhase === 'cross' ? ' is-out' : ''
            }`}
          />
        ) : null}
        {glowTop ? (
          <img src={glowTop} alt='' className='cl-ag-ambient-img is-top is-in' />
        ) : null}
        <div className='cl-ag-ambient-veil' />
      </div>

      <header className='cl-ag-head'>
        <div className='cl-ag-mast'>
          <span className='cl-ag-mast-kicker'>影集</span>
          <h2 className='cl-ag-mast-title'>{pageTitle || '未命名'}</h2>
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
            <LazyImage src={prev2.url || prev2.cover} alt='' className='cl-ag-img' />
          </div>
        ) : null}
        {next2 ? (
          <div className='cl-ag-card cl-ag-card--far cl-ag-card--right2' aria-hidden>
            <LazyImage src={next2.url || next2.cover} alt='' className='cl-ag-img' />
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
            <LazyImage src={prev.url || prev.cover} alt='' className='cl-ag-img' />
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
            <LazyImage src={next.url || next.cover} alt='' className='cl-ag-img' />
          </button>
        ) : null}

        <div
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
                // 点远点：短向动画后直达
                busyRef.current = true
                setStack(dir > 0 ? -48 : 48, true, 180)
                window.setTimeout(() => {
                  setIndex(i)
                  resetStack()
                  busyRef.current = false
                }, 180)
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
