import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useState } from 'react'
import CONFIG from '../config'
import { BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'
import ReadingProgress from './ReadingProgress'

/**
 * 桌面：左 | 中品牌 | 右，下滚聚拢
 * 手机：中品牌 + 汉堡抽屉
 */
export const Header = props => {
  const { post, customMenu, customNav } = props
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const showProgress = Boolean(post) && post?.type !== 'Page'

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      setScrolled(prev => {
        if (!prev && y > 28) return true
        if (prev && y < 10) return false
        return prev
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  const openSearch = () => {
    window.location.href = '/search'
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <header
      className={`cl-header sticky top-0 z-40 w-full ${
        scrolled ? 'is-scrolled' : ''
      } ${showProgress ? 'cl-header--reading' : ''} ${
        drawerOpen ? 'is-drawer-open' : ''
      }`}>
      {/* Desktop axis */}
      <div className='cl-header-inner cl-header-inner--desktop'>
        <div className={`cl-header-wing cl-header-wing--left ${scrolled ? 'is-gathered' : ''}`}>
          <MenuList
            {...props}
            variant='header'
            wing='left'
            collapsed={scrolled}
          />
        </div>

        <div className='cl-header-center'>
          <BrandLockup compact href='/' collapsed={scrolled} />
        </div>

        <div className={`cl-header-wing cl-header-wing--right ${scrolled ? 'is-gathered' : ''}`}>
          <MenuList
            {...props}
            variant='header'
            wing='right'
            collapsed={scrolled}
          />
          <div className='cl-header-actions'>
            {siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) && (
              <button
                type='button'
                className='cl-icon-btn'
                onClick={openSearch}
                aria-label='Search'
                title='搜索'>
                <i className='fas fa-search text-sm' />
              </button>
            )}
            <button
              type='button'
              className='cl-icon-btn'
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
              title={isDarkMode ? '浅色' : '深色'}>
              <span className='text-base leading-none'>
                {isDarkMode ? '☀' : '☾'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bar */}
      <div className='cl-header-inner cl-header-inner--mobile'>
        <div className='cl-header-mobile-spacer' aria-hidden='true' />
        <div className='cl-header-center'>
          <BrandLockup compact href='/' collapsed={false} />
        </div>
        <div className='cl-header-actions cl-header-actions--mobile'>
          {siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) && (
            <button
              type='button'
              className='cl-icon-btn'
              onClick={openSearch}
              aria-label='Search'
              title='搜索'>
              <i className='fas fa-search text-sm' />
            </button>
          )}
          <button
            type='button'
            className='cl-icon-btn'
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
            title={isDarkMode ? '浅色' : '深色'}>
            <span className='text-base leading-none'>
              {isDarkMode ? '☀' : '☾'}
            </span>
          </button>
          <button
            type='button'
            className='cl-icon-btn cl-hamburger'
            aria-label={drawerOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(v => !v)}>
            <i className={`fas ${drawerOpen ? 'fa-times' : 'fa-bars'} text-sm`} />
          </button>
        </div>
      </div>

      {showProgress ? <ReadingProgress /> : null}

      {/* Mobile drawer */}
      <div
        className={`cl-drawer-root ${drawerOpen ? 'is-open' : ''}`}
        aria-hidden={!drawerOpen}>
        <button
          type='button'
          className='cl-drawer-mask'
          aria-label='关闭菜单'
          onClick={closeDrawer}
        />
        <div className='cl-drawer-panel' role='dialog' aria-modal='true'>
          <div className='cl-drawer-head'>
            <span className='cl-kicker'>菜单</span>
            <button
              type='button'
              className='cl-icon-btn'
              aria-label='关闭'
              onClick={closeDrawer}>
              <i className='fas fa-times' />
            </button>
          </div>
          <MenuList
            customMenu={customMenu}
            customNav={customNav}
            variant='drawer'
            wing='drawer'
            onNavigate={closeDrawer}
          />
        </div>
      </div>
    </header>
  )
}
