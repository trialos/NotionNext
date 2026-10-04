import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * 全屏灯箱：左/中/右三分区（前页/关闭/后页），Esc/←/→ 键盘，
 * 挂载期间锁 body 滚动。portal 到 body，onGo 由父级 go 提供（含单图守卫）。
 */
export default function AlbumLightbox({
  title,
  photo,
  index,
  total,
  onClose,
  onGo
}) {
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onGo(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        onGo(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onGo])

  if (!portalReady) return null

  return createPortal(
    <div className='cl-ag-lb' role='dialog' aria-modal='true'>
      <button
        type='button'
        className='cl-ag-lb-mask'
        aria-label='关闭'
        onClick={onClose}
      />
      <button
        type='button'
        className='cl-ag-lb-close'
        aria-label='关闭'
        onClick={onClose}>
        <i className='fas fa-times' />
      </button>
      <div
        className='cl-ag-lb-stage'
        onClick={e => {
          const stage = e.currentTarget
          const rect = stage.getBoundingClientRect()
          const rel = (e.clientX - rect.left) / rect.width
          if (rel < 0.33) {
            if (total > 1) onGo(-1)
          } else if (rel > 0.67) {
            if (total > 1) onGo(1)
          } else {
            onClose()
          }
        }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url || photo.cover}
          alt={title || ''}
          className='cl-ag-lb-img'
          draggable={false}
        />
        <div className='cl-ag-lb-meta'>
          {title ? <p className='cl-ag-lb-title'>{title}</p> : null}
          <p className='cl-ag-lb-count'>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
