import { useEffect, useMemo, useRef } from 'react'

const ITEM = 44

/**
 * 左侧墨线轴：无底板，竖线+节点+辑名，当前居中，上下渐隐
 */
export default function AlbumRail({ decks, activeIndex, onSelect }) {
  const trackRef = useRef(null)
  const n = decks?.length || 0

  const offset = useMemo(() => {
    if (n <= 1) return 0
    const mid = 150
    return mid - ITEM / 2 - activeIndex * ITEM
  }, [activeIndex, n])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.style.transform = `translate3d(0, ${offset}px, 0)`
  }, [offset])

  if (n <= 1) return null

  return (
    <aside className='cl-album-rail' aria-label='影集导航'>
      <div className='cl-album-rail-window'>
        <div className='cl-album-rail-spine' aria-hidden />
        <div className='cl-album-rail-track' ref={trackRef}>
          {decks.map((d, i) => {
            const dist = Math.abs(i - activeIndex)
            const cls = [
              'cl-album-rail-item',
              i === activeIndex ? 'is-active' : '',
              dist === 1 ? 'is-near' : '',
              dist >= 2 ? 'is-far' : ''
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={d.id || d.name || i}
                type='button'
                className={cls}
                onClick={() => onSelect?.(i)}
                aria-current={i === activeIndex ? 'true' : undefined}
                title={d.name}>
                <span className='cl-album-rail-dot' aria-hidden />
                <span className='cl-album-rail-text'>{d.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
