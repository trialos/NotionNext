import { useEffect, useRef, useState } from 'react'

/**
 * 清爽轻量影集快速切辑器 (AlbumDeckNav)
 * 替代原全屏重型抽屉：
 * 1. 位于博客全站顶栏下方，采用清亮优雅的微标胶囊 [ 影集目录 (6) ▾ ]
 * 2. 点击轻量展开毛玻璃浮层面板，不遮挡画廊主体与全站顶栏
 * 3. 支持快速切辑与一键返回展架总览
 */
export default function AlbumDeckNav({
  decks = [],
  activeDeckIndex = 0,
  onBack,
  onSelect,
  isScrolled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navRef = useRef(null)

  // ESC 键与点击外部快捷收起
  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = e => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    const onClickOutside = e => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onClickOutside)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onClickOutside)
    }
  }, [isOpen])

  if (!decks?.length) return null

  const currentDeck = decks[activeDeckIndex] || decks[0]
  const isCollapsed = isScrolled && !isOpen && !isHovered

  return (
    <div ref={navRef} className='cl-album-deck-nav-root'>
      {/* 灵动触发胶囊（下拉滚动时文字自动收缩，悬浮展开） */}
      <button
        type='button'
        onClick={() => setIsOpen(prev => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`cl-album-deck-nav-btn ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}
        aria-label='展开影集目录'
        aria-expanded={isOpen}
        title={isCollapsed ? `影集目录 (${decks.length})` : '展开影集目录'}>
        <svg
          aria-hidden='true'
          className='cl-album-deck-nav-icon'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <rect x='3' y='3' width='7' height='7' />
          <rect x='14' y='3' width='7' height='7' />
          <rect x='14' y='14' width='7' height='7' />
          <rect x='3' y='14' width='7' height='7' />
        </svg>
        <span className='cl-album-deck-nav-label-wrap'>
          <span className='cl-album-deck-nav-label'>影集目录</span>
        </span>
        <span className='cl-album-deck-nav-badge'>{decks.length}</span>
        <svg
          aria-hidden='true'
          className={`cl-album-deck-nav-arrow ${isOpen ? 'is-open' : ''}`}
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <polyline points='18 15 12 9 6 15' />
        </svg>
      </button>

      {/* 清亮浮动下拉面板 */}
      {isOpen && (
        <div className='cl-album-deck-popover' role='menu' aria-label='影集列表'>
          <div className='cl-album-deck-popover-head'>
            <span className='cl-album-deck-popover-current'>
              当前：{currentDeck?.name}
            </span>
            <button
              type='button'
              onClick={() => {
                setIsOpen(false)
                onBack?.()
              }}
              className='cl-album-deck-popover-back'>
              <span>返回展架</span>
            </button>
          </div>

          <div className='cl-album-deck-popover-list'>
            {decks.map((deck, i) => {
              const isActive = i === activeDeckIndex
              const firstPhoto = deck.photos?.[0]
              const thumbSrc = firstPhoto?.cover || firstPhoto?.url || ''
              const count = deck.photos?.length || 0

              return (
                <button
                  key={deck.id || deck.name || i}
                  type='button'
                  onClick={() => {
                    setIsOpen(false)
                    onSelect?.(i)
                  }}
                  className={`cl-album-deck-popover-item ${isActive ? 'is-active' : ''}`}
                  role='menuitem'>
                  <div className='cl-album-deck-popover-thumb'>
                    {thumbSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbSrc}
                        alt={deck.name}
                        width='38'
                        height='38'
                        decoding='async'
                        loading='lazy'
                        className='cl-album-deck-popover-img'
                      />
                    ) : (
                      <span className='cl-album-deck-popover-ph'>影</span>
                    )}
                  </div>
                  <div className='cl-album-deck-popover-info'>
                    <span className='cl-album-deck-popover-name'>{deck.name}</span>
                    <span className='cl-album-deck-popover-count'>{count}张照片</span>
                  </div>
                  {isActive && <span className='cl-album-deck-popover-dot' />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
