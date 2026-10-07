import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useRef } from 'react'
import CONFIG from '../config'

/**
 * 首页影集胶片横条：最新几辑的全出血横滑条
 * 合规要点：帧是真链接（键盘可达）、拖拽仅为增强（原生滚动始终可用）、
 * 图片带 alt 且容器定比防抖动、字幕长名截断
 */
export default function HomeFilmstrip({ decks = [] }) {
  const stripRef = useRef(null)
  const dragRef = useRef(null) // { x, left }
  const movedRef = useRef(false)

  const list = decks.slice(
    0,
    siteConfig('CIRCLELIFE_HOME_FILM_COUNT', 6, CONFIG)
  )
  if (!list.length) return null

  // 桌面指针拖拽（仅鼠标；触屏走原生滚动）：6px 阈值区分点击
  const onPointerDown = e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    dragRef.current = { x: e.clientX, left: stripRef.current.scrollLeft }
  }
  const onPointerMove = e => {
    const d = dragRef.current
    if (!d || e.pointerType !== 'mouse') return
    const dx = e.clientX - d.x
    if (!movedRef.current && Math.abs(dx) < 6) return
    if (!movedRef.current) {
      movedRef.current = true
      stripRef.current.classList.add('is-dragging')
    }
    stripRef.current.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    dragRef.current = null
    // is-dragging 留到 click 捕获后再摘，防止松手即触发链接
    if (!movedRef.current) stripRef.current?.classList.remove('is-dragging')
  }
  const onClickCapture = e => {
    if (!movedRef.current) return
    e.preventDefault()
    e.stopPropagation()
    movedRef.current = false
    stripRef.current?.classList.remove('is-dragging')
  }

  return (
    <section className='cl-film'>
      <div className='cl-film-head'>
        <h2 className='cl-film-kicker'>影集 · FILM</h2>
        <SmartLink href='/album' className='cl-film-all' aria-label='查看全部影集'>
          全部影集 →
        </SmartLink>
      </div>
      <div
        ref={stripRef}
        className='cl-film-strip'
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}>
        {list.map(deck => (
          <SmartLink
            key={deck.id}
            href={`/album?view=gallery&deck=${deck.id}`}
            className='cl-film-frame'
            aria-label={`打开影集：${deck.name}`}>
            <span className='cl-film-img-wrap'>
              <LazyImage
                src={deck.cover}
                alt={`${deck.name} 封面`}
                className='cl-film-img'
              />
            </span>
            <span className='cl-film-caption'>
              <span className='cl-film-name'>{deck.name}</span>
              <span className='cl-film-date'>{deck.date}</span>
            </span>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}
