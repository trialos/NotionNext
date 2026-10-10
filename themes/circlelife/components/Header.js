import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CONFIG from '../config'
import { useAlbumUI } from './albumContext'
import { BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'
import SearchOverlay from './SearchOverlay'
import ReadingProgress from './ReadingProgress'

/**
 * 桌面：左 | 中品牌 | 右（疏朗 + 轻聚拢）
 * 手机：汉堡左 | 品牌中 | 搜索右（明暗切换收进全屏菜单）；菜单 portal 到 body
 */
export const Header = props => {
  const { post, customMenu, customNav } = props
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const drawerPanelRef = useRef(null)
  const hamburgerRef = useRef(null)
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
    const prevOverflow = document.body.style.overflow
    const prevTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    // 焦点管理：打开聚焦面板，Tab 循环限制在抽屉内，关闭归还汉堡按钮
    drawerPanelRef.current?.focus({ preventScroll: true })
    const onKey = e => {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const panel = drawerPanelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    // iOS：overflow:hidden 挡不住触屏惯性滚动，菜单外及面板到边一律拦截
    let lastTouchY = 0
    const onTouchMove = e => {
      const panel = drawerPanelRef.current
      if (!panel || !panel.contains(e.target)) {
        e.preventDefault()
        return
      }
      const touch = e.touches[0]
      if (!touch) return
      const dy = touch.clientY - lastTouchY
      lastTouchY = touch.clientY
      const atTop = panel.scrollTop <= 0
      const atBottom =
        panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1
      if ((atTop && dy > 0) || (atBottom && dy < 0)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouch
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('touchmove', onTouchMove)
      hamburgerRef.current?.focus?.({ preventScroll: true })
    }
  }, [drawerOpen])

  const openSearch = () => {
    setDrawerOpen(false)
    setSearchOpen(true)
  }

  const closeDrawer = () => setDrawerOpen(false)

  const searchButton = siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) ? (
    <button
      type='button'
      className='cl-icon-btn'
      onClick={openSearch}
      aria-label='Search'
      title='搜索'>
      <i className='fas fa-search' />
    </button>
  ) : null

  const darkModeButton = (
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
  )

  // 手机顶栏只留搜索；明暗切换收进全屏菜单
  const actions = (mobile = false) => (
    <div className={`cl-header-actions ${mobile ? 'cl-header-actions--mobile' : ''}`}>
      {searchButton}
      {!mobile && darkModeButton}
    </div>
  )

  const hamburger = (
    <button
      type='button'
      ref={hamburgerRef}
      className='cl-icon-btn cl-hamburger'
      aria-label={drawerOpen ? '关闭菜单' : '打开菜单'}
      aria-expanded={drawerOpen}
      onClick={() => setDrawerOpen(true)}>
      <i className='fas fa-bars' />
    </button>
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
          ref={drawerPanelRef}
          className='cl-drawer-panel'
          role='dialog'
          aria-modal='true'
          tabIndex={-1}
          aria-label='站点菜单'>
          <div className='cl-drawer-head'>
            <button
              type='button'
              className='cl-icon-btn cl-drawer-close'
              aria-label='关闭'
              onClick={closeDrawer}>
              <i className='fas fa-times' />
            </button>
            <SmartLink
              href='/'
              className='cl-drawer-brand'
              aria-label='时光的弧线'
              onClick={closeDrawer}>
              <BrandLockup compact href={null} hideEn />
            </SmartLink>
            <div className='cl-drawer-head-actions'>
              {darkModeButton}
              {searchButton}
            </div>
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
        <div className='cl-header-mobile-side cl-header-mobile-side--left'>
          {hamburger}
        </div>
        <div className='cl-header-center'>
          <BrandLockup compact href='/' collapsed={scrolled} />
        </div>
        <div className='cl-header-mobile-side cl-header-mobile-side--right'>
          {searchButton}
        </div>
      </div>

      {showProgress ? <ReadingProgress /> : null}
      {drawer}
      <SearchOverlay
        open={searchOpen}
        items={props.searchIndex || []}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  )
}
