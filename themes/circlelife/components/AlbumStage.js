import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CONFIG from '../config'
import AuthorBadge from './AuthorBadge'
import { buildAlbumDecks } from './albumUtils'

const AXIS = { H: 'h', V: 'v' }
const THRESH_RATIO = 0.22
const MAX_DRAG = 140

/**
 * 影集舞台：左右换图 · 上下换辑 · 中间主卡层叠
 */
export default function AlbumStage({ pages }) {
  const decks = useMemo(() => buildAlbumDecks(pages), [pages])
  const [albumIndex, setAlbumIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [drag, setDrag] = useState({ x: 0, y: 0, axis: null, active: false })
  const [expanded, setExpanded] = useState(false)
  const startRef = useRef(null)
  const stageRef = useRef(null)

  const albumCount = decks.length
  const safeAlbum = albumCount ? Math.min(albumIndex, albumCount - 1) : 0
  const album = decks[safeAlbum]
  const photos = album?.photos || []
  const photoCount = photos.length
  const safePhoto = photoCount ? Math.min(photoIndex, photoCount - 1) : 0
  const current = photos[safePhoto]

  // reset photo when album changes
  useEffect(() => {
    setPhotoIndex(0)
    setExpanded(false)
  }, [safeAlbum])

  const goPhoto = useCallback(
    delta => {
      if (photoCount <= 1) return
      setPhotoIndex(i => (i + delta + photoCount) % photoCount)
    },
    [photoCount]
  )

  const goAlbum = useCallback(
    delta => {
      if (albumCount <= 1) return
      setAlbumIndex(i => {
        const n = i + delta
        if (n < 0) return 0
        if (n >= albumCount) return albumCount - 1
        return n
      })
    },
    [albumCount]
  )

  // keyboard
  useEffect(() => {
    const onKey = e => {
      if (expanded && e.key === 'Escape') {
        setExpanded(false)
        return
      }
      if (e.key === 'ArrowLeft') goPhoto(-1)
      if (e.key === 'ArrowRight') goPhoto(1)
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goAlbum(-1)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goAlbum(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPhoto, goAlbum, expanded])

  const onPointerDown = e => {
    if (expanded) return
    const t = e.target
    if (t.closest?.('button, a, .cl-album-rail, .cl-album-dots')) return
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      pid: e.pointerId
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
    setDrag({ x: 0, y: 0, axis: null, active: true })
  }

  const onPointerMove = e => {
    if (!startRef.current || !drag.active) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    let axis = drag.axis
    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      axis = Math.abs(dx) > Math.abs(dy) ? AXIS.H : AXIS.V
    }
    const x = axis === AXIS.H ? Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx)) : 0
    const y = axis === AXIS.V ? Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dy)) : 0
    setDrag({ x, y, axis, active: true })
  }

  const endDrag = () => {
    if (!startRef.current) return
    const { x, y, axis } = drag
    const w = stageRef.current?.clientWidth || 320
    const th = w * THRESH_RATIO
    if (axis === AXIS.H) {
      if (x <= -th) goPhoto(1)
      else if (x >= th) goPhoto(-1)
    } else if (axis === AXIS.V) {
      if (y <= -th) goAlbum(1)
      else if (y >= th) goAlbum(-1)
    }
    startRef.current = null
    setDrag({ x: 0, y: 0, axis: null, active: false })
  }

  const emptyHint = siteConfig(
    'CIRCLELIFE_ALBUM_EMPTY_HINT',
    '在 Notion 新增 type 为 Photo 的条目，并填写封面与描述。',
    CONFIG
  )

  if (!albumCount) {
    return (
      <div className='cl-album-empty'>
        <p className='cl-kicker mb-3'>影集 · FILM</p>
        <h1 className='cl-article-title !mb-3'>还没有影像</h1>
        <p className='cl-post-summary mx-auto max-w-md'>{emptyHint}</p>
        <ul className='cl-album-howto'>
          <li>type 选 <strong>Photo</strong></li>
          <li>status 为 Published</li>
          <li>正文里插入多张图片（左右滑切换）</li>
          <li>封面可选；有封面会作为第一张</li>
          <li>summary 写描述；「专辑」「作者」可选</li>
        </ul>
      </div>
    )
  }

  // stack indices relative to current
  const stack = [-2, -1, 0, 1, 2]
    .map(offset => {
      if (!photoCount) return null
      const idx = safePhoto + offset
      if (idx < 0 || idx >= photoCount) return null
      return { offset, photo: photos[idx], idx }
    })
    .filter(Boolean)

  const dragRot = drag.axis === AXIS.H ? drag.x * 0.04 : 0
  const dragStyle =
    drag.active && drag.axis === AXIS.H
      ? {
          transform: `translate3d(${drag.x}px, ${drag.y * 0.15}px, 0) rotate(${dragRot}deg)`
        }
      : drag.active && drag.axis === AXIS.V
        ? {
            transform: `translate3d(0, ${drag.y}px, 0) scale(${1 - Math.abs(drag.y) / 800})`
          }
        : undefined

  return (
    <div className='cl-album'>
      <header className='cl-album-head'>
        <div className='cl-kicker'>影集 · FILM</div>
        <div className='cl-album-head-meta'>
          <span className='cl-album-name'>{album.name}</span>
          <span className='cl-album-count'>
            {String(safePhoto + 1).padStart(2, '0')} /{' '}
            {String(photoCount).padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* album rail (vertical albums) */}
      {albumCount > 1 ? (
        <div className='cl-album-rail' role='tablist' aria-label='专辑'>
          {decks.map((d, i) => (
            <button
              key={d.name}
              type='button'
              role='tab'
              aria-selected={i === safeAlbum}
              className={`cl-album-rail-item ${i === safeAlbum ? 'is-active' : ''}`}
              onClick={() => setAlbumIndex(i)}>
              {d.name}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={stageRef}
        className={`cl-album-stage ${drag.active ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          if (drag.active) endDrag()
        }}>
        <div
          className={`cl-album-stack ${
            drag.axis === AXIS.V && drag.active ? 'is-album-drag' : ''
          }`}
          style={
            drag.axis === AXIS.V && drag.active
              ? { transform: `translateY(${drag.y * 0.35}px)` }
              : undefined
          }>
          {stack.map(({ offset, photo, idx }) => {
            const isMain = offset === 0
            const depth = Math.abs(offset)
            const side = offset < 0 ? -1 : offset > 0 ? 1 : 0
            const baseX = side * (18 + depth * 10)
            const baseScale = isMain ? 1 : 1 - depth * 0.045
            const baseY = isMain ? 0 : 8 + depth * 4
            const z = 10 - depth
            const style = isMain
              ? {
                  zIndex: z,
                  ...dragStyle,
                  transition: drag.active ? 'none' : undefined
                }
              : {
                  zIndex: z,
                  transform: `translate3d(${baseX}px, ${baseY}px, 0) scale(${baseScale})`,
                  opacity: 1 - depth * 0.18
                }
            return (
              <div
                key={photo.id || idx}
                className={`cl-album-card ${isMain ? 'is-main' : 'is-back'} ${
                  (photo.cover || photo.url) ? 'has-cover' : ''
                }`}
                style={style}
                onClick={e => {
                  if (!isMain) return
                  if (Math.abs(drag.x) > 4 || Math.abs(drag.y) > 4) return
                  e.stopPropagation()
                  setExpanded(true)
                }}>
                <div className='cl-album-card-frame'>
                  {(photo.cover || photo.url) ? (
                    <LazyImage
                      src={photo.cover || photo.url}
                      alt={photo.title || ''}
                      className='cl-album-card-img'
                    />
                  ) : (
                    <div className='cl-album-card-placeholder'>
                      <span>{photo.title || '无封面'}</span>
                    </div>
                  )}
                  <div className='cl-album-card-shade' />
                </div>
              </div>
            )
          })}
        </div>

        {/* desktop chevrons */}
        {photoCount > 1 ? (
          <div className='cl-album-nav-btns'>
            <button
              type='button'
              className='cl-album-nav-btn'
              aria-label='上一张'
              onClick={() => goPhoto(-1)}>
              ‹
            </button>
            <button
              type='button'
              className='cl-album-nav-btn'
              aria-label='下一张'
              onClick={() => goPhoto(1)}>
              ›
            </button>
          </div>
        ) : null}
      </div>

      {current ? (
        <div className='cl-album-caption'>
          {current.title ? (
            <h2 className='cl-album-title'>{current.title}</h2>
          ) : null}
          {current.summary ? (
            <p className='cl-album-summary'>{current.summary}</p>
          ) : null}
          <div className='cl-album-meta'>
            {current.author?.name ? (
              <AuthorBadge author={current.author} size={20} />
            ) : null}
            {current.date ? (
              <span className='cl-album-date'>{current.date}</span>
            ) : null}
          </div>
        </div>
      ) : null}

      {photoCount > 1 ? (
        <div className='cl-album-dots' role='tablist' aria-label='本辑影像'>
          {photos.map((p, i) => (
            <button
              key={p.id || i}
              type='button'
              role='tab'
              aria-selected={i === safePhoto}
              className={`cl-album-dot ${i === safePhoto ? 'is-active' : ''}`}
              onClick={() => setPhotoIndex(i)}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
      ) : null}

      <p className='cl-album-hint'>
        左右滑换图 · 上下滑换辑
        <span className='cl-album-hint-desk'> · 键盘 ←→↑↓</span>
      </p>

      {expanded && current ? (
        <div className='cl-album-lightbox' role='dialog' aria-modal='true'>
          <button
            type='button'
            className='cl-album-lightbox-mask'
            aria-label='关闭'
            onClick={() => setExpanded(false)}
          />
          <div className='cl-album-lightbox-panel'>
            <button
              type='button'
              className='cl-icon-btn cl-album-lightbox-close'
              aria-label='关闭'
              onClick={() => setExpanded(false)}>
              <i className='fas fa-times' />
            </button>
            {(current.cover || current.url) ? (
              <LazyImage
                src={current.cover}
                alt={current.title || ''}
                className='cl-album-lightbox-img'
              />
            ) : null}
            <div className='cl-album-lightbox-body'>
              {current.title ? (
                <h2 className='cl-album-title'>{current.title}</h2>
              ) : null}
              {current.summary ? (
                <p className='cl-album-summary'>{current.summary}</p>
              ) : null}
              <div className='cl-album-meta'>
                {current.author?.name ? (
                  <AuthorBadge author={current.author} size={22} />
                ) : null}
                {current.date ? (
                  <span className='cl-album-date'>{current.date}</span>
                ) : null}
              </div>
              {photoCount > 1 ? (
                <div className='cl-album-lightbox-nav'>
                  <button
                    type='button'
                    className='cl-album-nav-btn'
                    onClick={() => goPhoto(-1)}>
                    ‹
                  </button>
                  <span className='cl-album-count'>
                    {safePhoto + 1} / {photoCount}
                  </span>
                  <button
                    type='button'
                    className='cl-album-nav-btn'
                    onClick={() => goPhoto(1)}>
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
