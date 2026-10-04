import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { uuidToId } from 'notion-utils'

/**
 * 手机目录：右下浮钮 + 半屏抽屉
 */
export default function MobileToc({ toc }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!toc || toc.length <= 2) return null

  const jump = id => {
    const el =
      document.getElementById(id) ||
      document.querySelector(`.notion-h[data-id="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.location.hash = id
    }
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
                return (
                  <li key={id}>
                    <button
                      type='button'
                      className='cl-toc-drawer-item'
                      style={{
                        paddingLeft: `${0.75 + (item.indentLevel || 0) * 0.75}rem`
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
