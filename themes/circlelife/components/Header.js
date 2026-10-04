import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import CONFIG from '../config'
import { useAlbumUI } from './albumContext'
import { BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'
import ReadingProgress from './ReadingProgress'

/**
 * 桌面：左 | 中品牌 | 右（疏朗 + 轻聚拢）
 * 手机：中品牌 + 汉堡；抽屉 portal 到 body
 */
export const Header = props => {
  const { post, customMenu, customNav } = props
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const showProgress = Boolean(post) && post?.type !== 'Page'
  // 影集画廊的滚动根由 AlbumStage 经 Context 注册；null 时回退 window 滚动
  const { scrollRoot } = useAlbumUI() || {}

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const readY = () => {
      if (scrollRoot) return scrollRoot.scrollTop || 0
      return window.scrollY || document.documentElement.scrollTop || 0
    }
    const onScroll = () => {
      const y = readY()
      setScrolled(prev => {
        if (!prev && y > 28) return true
        if (prev && y < 10) return false
        return prev
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    if (scrollRoot) {
      scrollRoot.addEventListener('scroll', onScroll, { passive: true })
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollRoot) {
        scrollRoot.removeEventListener('scroll', onScroll)
      }
    }
  }, [scrollRoot])

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

  const actions = (mobile = false) => (
    <div className={`cl-header-actions ${mobile ? 'cl-header-actions--mobile' : ''}`}>
      {siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) && (
        <button
          type='button'
          className='cl-icon-btn'
          onClick={openSearch}
          aria-label='Search'
          title='搜索'>
          <i className='fas fa-search' />
        </button>
      )}
      <button
        type='button'
        className='cl-icon-btn'
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
        title={isDarkMode ? '浅色' : '深色'}>
        <span className='cl-icon-btn-glyph' aria-hidden='true'>
          {isDarkMode ? '☀' : '☾'}
        </span>
      </button>
      {mobile ? (
        <button
          type='button'
          className='cl-icon-btn cl-hamburger'
          aria-label={drawerOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(v => !v)}>
          <i className={`fas ${drawerOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
      ) : null}
    </div>
  )

  const drawer = !mounted
    ? null
    : createPortal(
      <div
        className={`cl-drawer-root ${drawerOpen ? 'is-open' : ''}`}
        aria-hidden={!drawerOpen}>
        <button
          type='button'
          className='cl-drawer-mask'
          aria-label='关闭菜单'
          tabIndex={drawerOpen ? 0 : -1}
          onClick={closeDrawer}
        />
        <div
          className='cl-drawer-panel'
          role='dialog'
          aria-modal='true'
          aria-label='站点菜单'>
          <div className='cl-drawer-head'>
            <div className='cl-drawer-brand'>
              <span className='cl-drawer-eyebrow'>导航</span>
              <span className='cl-drawer-title'>菜单</span>
            </div>
            <button
              type='button'
              className='cl-icon-btn cl-drawer-close'
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
          <p className='cl-drawer-foot'>Circle of Life</p>
        </div>
      </div>,
      document.body
    )

  return (
    <header
      className={`cl-header sticky top-0 z-40 w-full ${
        scrolled ? 'is-scrolled' : ''
      } ${showProgress ? 'cl-header--reading' : ''} ${
        drawerOpen ? 'is-drawer-open' : ''
      }`}>
      <div className='cl-header-inner cl-header-inner--desktop'>
        <div
          className={`cl-header-wing cl-header-wing--left ${
            scrolled ? 'is-gathered' : ''
          }`}>
          <MenuList {...props} variant='header' wing='left' collapsed={scrolled} />
        </div>

        <div className='cl-header-center'>
          <BrandLockup compact href='/' collapsed={scrolled} />
        </div>

        <div
          className={`cl-header-wing cl-header-wing--right ${
            scrolled ? 'is-gathered' : ''
          }`}>
          <MenuList {...props} variant='header' wing='right' collapsed={scrolled} />
          {actions(false)}
        </div>
      </div>

      <div className='cl-header-inner cl-header-inner--mobile'>
        <div className='cl-header-mobile-side cl-header-mobile-side--left' aria-hidden='true' />
        <div className='cl-header-center'>
          <BrandLockup compact href='/' collapsed={scrolled} />
        </div>
        <div className='cl-header-mobile-side cl-header-mobile-side--right'>
          {actions(true)}
        </div>
      </div>

      {showProgress ? <ReadingProgress /> : null}
      {drawer}
    </header>
  )
}
