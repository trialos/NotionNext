import { useEffect, useState } from 'react'

const SHOW_AFTER = 400

/**
 * 全站返回顶部：内容区右槽 + 显隐动效
 */
export default function BackToTop({ label = '返回顶部' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        setVisible((window.scrollY || 0) > SHOW_AFTER)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      className={`cl-backtop ${visible ? 'is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <span className='cl-backtop-icon' aria-hidden='true'>
        ↑
      </span>
    </button>
  )
}
