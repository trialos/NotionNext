import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { uuidToId } from 'notion-utils'

/**
 * 手机目录：右下浮钮 + 半屏抽屉（防穿透）
 */
export default function MobileToc({ toc }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    const prevTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    const onKey = e => {
      if (e.key === 'Escape') setOpen(false)
    }

    // iOS: 阻止抽屉外 touchmove 带动背后页面
    const onTouchMove = e => {
      const panel = panelRef.current
      if (!panel) {
        e.preventDefault()
        return
      }
      if (panel.contains(e.target)) {
        // 面板顶/底边界继续向外滑时也拦住
        const el = panel
        const atTop = el.scrollTop <= 0
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
        const touch = e.touches[0]
        if (!touch || !onTouchMove._y) {
          onTouchMove._y = touch?.clientY
          return
        }
        const dy = touch.clientY - onTouchMove._y
        onTouchMove._y = touch.clientY
        if ((atTop && dy > 0) || (atBottom && dy < 0)) {
          e.preventDefault()
        }
        return
      }
      e.preventDefault()
    }
    onTouchMove._y = 0

    window.addEventListener('keydown', onKey)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouch
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [open])

  if (!toc || toc.length <= 2) return null

  const jump = id => {
    const el =
      document.getElementById(id) ||
      document.querySelector(`.notion-h[data-id="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.location.hash = id
    setOpen(false)
  }

  const btn = (
    <button
      type='button'
      className='cl-toc-fab'
      aria-label='目录'
      onClick={() => setOpen(true)}>
      目录
    </button>
  )

  const drawer =
    mounted &&
    createPortal(
      <div
        className={`cl-toc-drawer-root ${open ? 'is-open' : ''}`}
        aria-hidden={!open}>
        <button
          type='button'
          className='cl-toc-drawer-mask'
          aria-label='关闭目录'
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <div
          ref={panelRef}
          className='cl-toc-drawer-panel'
          role='dialog'
          aria-modal='true'
          aria-label='文章目录'>
          <div className='cl-toc-drawer-head'>
            <span className='cl-toc-drawer-title'>目录</span>
            <button
              type='button'
              className='cl-icon-btn'
              aria-label='关闭'
              onClick={() => setOpen(false)}>
              <i className='fas fa-times' />
            </button>
          </div>
          <nav className='cl-toc-drawer-nav'>
            <ul className='cl-toc-drawer-list'>
              {toc.map(item => {
                const id = uuidToId(item.id)
                const level = item.indentLevel || 0
                const levelClass =
                  level <= 0
                    ? 'cl-toc-drawer-item--h1'
                    : level === 1
                      ? 'cl-toc-drawer-item--h2'
                      : 'cl-toc-drawer-item--h3'
                return (
                  <li key={id}>
                    <button
                      type='button'
                      className={`cl-toc-drawer-item ${levelClass}`}
                      style={{
                        paddingLeft: `${0.75 + level * 0.75}rem`
                      }}
                      onClick={() => jump(id)}>
                      {item.text}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>,
      document.body
    )

  return (
    <>
      {btn}
      {drawer}
    </>
  )
}
