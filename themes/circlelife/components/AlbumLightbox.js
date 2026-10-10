import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * 全屏灯箱：左/中/右透明按钮（前页/关闭/后页），Esc/←/→ 键盘。
 * 打开时焦点进关闭，Tab 只在灯箱内循环。portal 到 body。
 */
export default function AlbumLightbox({
  title,
  photo,
  index,
  total,
  onClose,
  onGo
}) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const [portalReady, setPortalReady] = useState(false)
  const label = title || '照片'

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!portalReady) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus())
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (total > 1) onGo(-1)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (total > 1) onGo(1)
        return
      }
      if (e.key !== 'Tab') return
      const root = dialogRef.current
      if (!root) return
      const items = [...root.querySelectorAll('button:not([disabled])')]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [portalReady, onClose, onGo, total])

  if (!portalReady) return null

  return createPortal(
    <div
      ref={dialogRef}
      className='cl-ag-lb'
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}>
      <button
        type='button'
        className='cl-ag-lb-mask'
        aria-label='关闭'
        tabIndex={-1}
        onClick={onClose}
      />
      <button
        ref={closeRef}
        type='button'
        className='cl-ag-lb-close'
        aria-label='关闭'
        onClick={onClose}>
        <i className='fas fa-times' aria-hidden='true' />
      </button>
      <div className='cl-ag-lb-stage'>
        <div className='cl-ag-lb-frame'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url || photo.cover}
            alt={label}
            className='cl-ag-lb-img'
            draggable={false}
          />
          <div className='cl-ag-lb-zones'>
            <button
              type='button'
              className='cl-ag-lb-zone'
              aria-label='上一张'
              disabled={total <= 1}
              onClick={() => onGo(-1)}
            />
            <button
              type='button'
              className='cl-ag-lb-zone'
              aria-label='关闭'
              onClick={onClose}
            />
            <button
              type='button'
              className='cl-ag-lb-zone'
              aria-label='下一张'
              disabled={total <= 1}
              onClick={() => onGo(1)}
            />
          </div>
        </div>
        <div className='cl-ag-lb-meta'>
          <p id={titleId} className='cl-ag-lb-title'>
            {label}
          </p>
          <p className='cl-ag-lb-count'>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
