import LazyImage from '@/components/LazyImage'
import { useCallback, useEffect, useRef, useState } from 'react'
import AuthorBadge from './AuthorBadge'
import AlbumLightbox from './AlbumLightbox'
import { useAmbientGlow } from './albumGlow'
import { getCardWidth, useDeckGesture } from './albumGesture'

const OUT_MS = 300
const IN_MS = 320

/**
 * 单辑：整叠跟手翻卡 + 双层柔光晕 + 玻璃浮层 + 全屏灯箱
 * 手势在 albumGesture、氛围光在 albumGlow、灯箱在 AlbumLightbox；
 * 这里只留 index/翻卡时序（CSS 变量）与渲染编排。
 */
export default function AlbumGallery({
  albumName,
  photos,
  onBackToShelf
}) {
  const n = photos?.length || 0
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const busyRef = useRef(false)
  const activeRef = useRef(false)

  const safe = n ? ((index % n) + n) % n : 0
  const current = n ? photos[safe] : null
  const { glowA, glowB, frontSlot, crossOn } = useAmbientGlow(
    current?.url || current?.cover || ''
  )

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
      const w = getCardWidth(stageRef)
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

  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  } = useDeckGesture({
    stageRef,
    busyRef,
    count: n,
    disabled: expanded,
    setStack,
    onFlip: commitFlip,
    onCenterTap: () => setExpanded(true)
  })

  const closeLightbox = useCallback(() => {
    setExpanded(false)
    window.requestAnimationFrame(() => stageRef.current?.focus())
  }, [])

  // 灯箱开时键盘由 AlbumLightbox 接管，这里只管舞台态
  useEffect(() => {
    const onKey = e => {
      if (expanded) return
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

  const onStageKeyDown = e => {
    if (e.target !== e.currentTarget) return
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    setExpanded(true)
  }

  if (!n) return null

  const prev = photos[(safe - 1 + n) % n]
  const next = photos[(safe + 1) % n]
  const prev2 = n > 2 ? photos[(safe - 2 + n) % n] : null
  const next2 = n > 2 ? photos[(safe + 2) % n] : null
  const pageTitle = albumName || current.title || ''

  return (
    <div className='cl-ag' ref={rootRef}>
      <div className='cl-ag-ambient' aria-hidden>
        {glowA ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={glowA}
            alt=''
            className={
              'cl-ag-ambient-img ' +
              (frontSlot === 'a'
                ? crossOn
                  ? 'is-leaving'
                  : 'is-front'
                : crossOn
                  ? 'is-entering'
                  : 'is-back')
            }
          />
        ) : null}
        {glowB ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={glowB}
            alt=''
            className={
              'cl-ag-ambient-img ' +
              (frontSlot === 'b'
                ? crossOn
                  ? 'is-leaving'
                  : 'is-front'
                : crossOn
                  ? 'is-entering'
                  : 'is-back')
            }
          />
        ) : null}
        <div className='cl-ag-ambient-veil' />
      </div>

      <header className='cl-ag-head'>
        <div className='cl-ag-head-row'>
          {typeof onBackToShelf === 'function' ? (
            <button
              type='button'
              className='cl-album-back-shelf'
              onClick={onBackToShelf}>
              ← 全部影集
            </button>
          ) : null}
          <div className='cl-ag-mast-line'>
            <div className='cl-ag-mast'>
              <span className='cl-ag-mast-kicker'>影集</span>
              <h2 className='cl-ag-mast-title'>{pageTitle || '未命名'}</h2>
            </div>
            {current.author?.name ? (
              <div className='cl-ag-mast-author'>
                <AuthorBadge author={current.author} size={20} />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div
        ref={stageRef}
        className='cl-ag-stage'
        tabIndex={0}
        aria-label='查看大图'
        onKeyDown={onStageKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}>
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

        <div className='cl-ag-card cl-ag-card--main'>
          {current.url || current.cover ? (
            <LazyImage
              key={current.id || safe}
              src={current.url || current.cover}
              alt={pageTitle || '照片'}
              className='cl-ag-img cl-ag-img--main'
              priority
            />
          ) : (
            <div className='cl-ag-placeholder'>无图</div>
          )}
        </div>

      </div>

      <div className='cl-ag-countline' aria-live='polite'>
        {String(safe + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
      </div>

      {expanded ? (
        <AlbumLightbox
          title={pageTitle}
          photo={current}
          index={safe}
          total={n}
          onClose={closeLightbox}
          onGo={go}
        />
      ) : null}
    </div>
  )
}
