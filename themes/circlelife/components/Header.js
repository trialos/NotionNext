import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CONFIG from '../config'
import { ArcMark, BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'
import SearchOverlay from './SearchOverlay'
import ReadingProgress from './ReadingProgress'

/**
 * 悬浮胶囊导航栏 + 全屏杂志折叠大菜单 (Floating Pill Navbar + Fullscreen Magazine Drawer)
 * 1. 彻底固定悬浮 (position: fixed) 且严格水平居中 (left: 50%, -50%)，不随滚动发生高宽形变
 * 2. 胶囊结构：左侧 Logo + 中间 4 个主导航项（首页、随笔、相册、关于） + 右侧驼色“≡ 菜单”按钮
 * 3. 手机端一体化胶囊：左侧 Logo，右侧驼色“≡ 菜单”按钮，完美自适应
 * 4. 全屏覆盖折叠大菜单：完整接入 MenuList，100% 恢复 Notion 配置的所有二级子菜单与手风琴展开体验
 */
export const Header = props => {
  const { post } = props
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const drawerPanelRef = useRef(null)
  const hamburgerRef = useRef(null)
  const showProgress = Boolean(post) && post?.type !== 'Page'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus trap 与 ESC 键退出处理
  useEffect(() => {
    if (!drawerOpen) return undefined
    const prevOverflow = document.body.style.overflow
    const prevTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

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

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouch
      window.removeEventListener('keydown', onKey)
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
      className='cl-icon-btn cl-fullscreen-top-btn'
      onClick={openSearch}
      aria-label='搜索'
      title='搜索'>
      <i className='fas fa-search' aria-hidden='true' />
    </button>
  ) : null

  const darkModeButton = (
    <button
      type='button'
      className='cl-icon-btn cl-fullscreen-top-btn'
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? '切换至浅色模式' : '切换至深色模式'}
      title={isDarkMode ? '浅色' : '深色'}>
      <i
        className={`${isDarkMode ? 'fas fa-sun' : 'fas fa-moon'} cl-theme-switch-ico`}
        aria-hidden='true'
      />
    </button>
  )

  // 全屏覆盖式折叠大菜单 (Portal 到 document.body)
  const drawer = !mounted
    ? null
    : createPortal(
      <div
        className={`cl-fullscreen-root ${drawerOpen ? 'is-open' : ''}`}
        aria-hidden={!drawerOpen}>
        <button
          type='button'
          className='cl-fullscreen-mask'
          aria-label='关闭菜单'
          tabIndex={drawerOpen ? 0 : -1}
          onClick={closeDrawer}
        />
        <div
          ref={drawerPanelRef}
          className='cl-fullscreen-panel'
          role='dialog'
          aria-modal='true'
          tabIndex={-1}
          aria-label='全屏站点菜单'>
          {/* 顶栏操作区 */}
          <div className='cl-fullscreen-topbar'>
            <SmartLink
              href='/'
              className='cl-fullscreen-brand'
              aria-label='返回首页'
              onClick={closeDrawer}>
              <BrandLockup compact href={null} hideEn />
            </SmartLink>

            <div className='cl-fullscreen-topbar-actions'>
              {searchButton}
              {darkModeButton}
              <button
                type='button'
                className='cl-icon-btn cl-fullscreen-close'
                aria-label='关闭菜单'
                onClick={closeDrawer}>
                <i className='fas fa-times' aria-hidden='true' />
              </button>
            </div>
          </div>

          {/* 核心大号艺术字体主导航（完整接入 MenuList，支持所有自定义菜单及二级子菜单展开） */}
          <div className='cl-fullscreen-nav-body'>
            <MenuList
              {...props}
              variant='drawer'
              wing='drawer'
              onNavigate={closeDrawer}
            />
          </div>
        </div>
      </div>,
      document.body
    )

  return (
    <>
      {showProgress ? <ReadingProgress /> : null}

      {/* 固定悬浮母层 (脱离文档流，严格水平居中) */}
      <aside className='cl-floating-header' aria-label='悬浮顶栏'>
        {/* 正中悬浮胶囊 */}
        <nav className='cl-floating-pill' aria-label='主导航'>
          {/* 左侧 Logo: 圆环 ArcMark */}
          <SmartLink
            href='/'
            className='cl-floating-pill-logo-link'
            aria-label='时光的弧线 - 返回首页'>
            <ArcMark size={24} className='cl-floating-pill-logo' />
          </SmartLink>

          {/* 手机端中间品牌标识: 时光的弧线 (仅移动端视口展示) */}
          <span className='cl-floating-pill-brand-text' translate='no'>
            时光的弧线
          </span>

          {/* 桌面端 4 个主导航：首页、随笔、相册、关于 */}
          <div className='cl-floating-pill-nav'>
            <SmartLink href='/' className='cl-floating-pill-link'>
              首页
            </SmartLink>
            <SmartLink href='/archive' className='cl-floating-pill-link'>
              随笔
            </SmartLink>
            <SmartLink href='/album' className='cl-floating-pill-link'>
              相册
            </SmartLink>
            <SmartLink href='/about' className='cl-floating-pill-link'>
              关于
            </SmartLink>
          </div>

          {/* 移动端内置右端暖金纯图标按钮 (仅移动端视口展示) */}
          <button
            type='button'
            onClick={() => setDrawerOpen(true)}
            className='cl-pill-menu-btn cl-pill-menu-btn--mobile'
            aria-label='打开全站菜单'
            aria-expanded={drawerOpen}>
            <i className='fas fa-bars cl-pill-menu-icon' aria-hidden='true' />
          </button>
        </nav>
      </aside>

      {/* PC 桌面端独立悬浮右上角暖金纯图标按钮 (仅桌面端视口展示) */}
      <button
        type='button'
        ref={hamburgerRef}
        onClick={() => setDrawerOpen(true)}
        className='cl-floating-desktop-menu-btn'
        aria-label='打开全站菜单'
        aria-expanded={drawerOpen}>
        <i className='fas fa-bars cl-desktop-menu-icon' aria-hidden='true' />
      </button>

      {drawer}

      <SearchOverlay
        open={searchOpen}
        items={props.searchIndex || []}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}
