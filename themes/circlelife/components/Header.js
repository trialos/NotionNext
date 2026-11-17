import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/router'
import CONFIG from '../config'
import { ArcMark, BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'
import { linkTitle, normalizeNavLinks } from './navConfig'
import { resolveNavParking } from './navParking'
import SearchOverlay from './SearchOverlay'
import ReadingProgress from './ReadingProgress'

/**
 * 悬浮胶囊导航栏 + 全屏杂志折叠大菜单 (Floating Pill Navbar + Fullscreen Magazine Drawer)
 * 1. 固定悬浮 (position: fixed) 且严格水平居中，不随滚动发生高宽形变
 * 2. 胶囊结构：左侧弧标 + 中部主导航 + 右侧暖金「≡ 菜单」按钮
 * 3. 主导航不写死：由 Notion 自定义菜单经 navConfig 归一化后派生，
 *    父级项（只有子菜单、无落地页）就地下拉，叶子项直接跳转
 * 4. >= 1024px 走桌面形态；更窄屏幕收起为「弧标 + 品牌 + ≡」
 * 5. 全屏覆盖折叠大菜单：完整接入 MenuList，恢复 Notion 配置的所有二级子菜单
 * 6. 下滚让位、上滚归位（判定见 navParking.js）：仅位移 + 淡出，不改变高宽，
 *    也不改 --cl-nav-height —— 全站靠导航带推导的间距因此在退场期间保持稳定
 * 7. 阅读进度不放进胶囊：文章页固定一条顶边进度线（ReadingProgress），
 *    与胶囊进退完全解耦 —— 胶囊让位／归位都不会让进度消失或跳位
 */
export const Header = props => {
  const { post } = props
  const { isDarkMode, toggleDarkMode, locale } = useGlobal()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [canHover, setCanHover] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const drawerPanelRef = useRef(null)
  const hamburgerRef = useRef(null)
  const pillRef = useRef(null)
  const subCloseTimer = useRef(null)
  const drawerTriggerRef = useRef(null)
  const searchOpenRef = useRef(false)
  // 让位状态机的事实源：滚动监听与「取焦 / 路由」共用同一份，
  // 否则手动唤回后，下一帧滚动会按旧状态立刻把它按回去
  const parkRef = useRef({ lastY: 0, down: 0, up: 0, parked: false })
  const showProgress = Boolean(post) && post?.type !== 'Page'
  const homeLabel = locale?.NAV?.INDEX || '首页'
  const searchLabel = locale?.NAV?.SEARCH || '搜索'
  const menuLabel = locale?.NAV?.NAVIGATOR || '菜单'

  // 立即唤回胶囊：导航内取焦、路由变化都走这里。
  // 必须同步改写 parkRef，否则下一帧滚动判定还认为「已让位」，会把它按回去。
  // 刻意不动 lastY：虚拟滚动页（关于页）的 window.scrollY 恒为 0，
  // 在这儿拿它当基准，下一次播报就会被读成一次数千像素的大滚动、导航立刻飞走。
  const revealNav = useCallback(() => {
    const state = parkRef.current
    state.parked = false
    state.down = 0
    state.up = 0
    if (typeof document !== 'undefined') {
      document
        .getElementById('theme-circlelife')
        ?.classList.remove('cl-nav-parked')
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // 探测设备是否支持悬停，决定父级菜单用 hover 还是点击展开
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(hover: hover)')
    const sync = () => setCanHover(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])

  // 窄屏滚动时给胶囊毛玻璃降档：backdrop-filter 每帧重采样背景，是移动端掉帧的已知成本。
  // 桌面不挂监听，避免新增常态开销
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(max-width: 1023px)')
    let active = mq.matches
    let rafId = null
    let idleTimer = null

    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        setIsScrolling(true)
        if (idleTimer) clearTimeout(idleTimer)
        idleTimer = setTimeout(() => setIsScrolling(false), 200)
      })
    }

    const bind = () => {
      window.removeEventListener('scroll', onScroll)
      if (active) window.addEventListener('scroll', onScroll, { passive: true })
    }

    const onBreakpointChange = () => {
      active = mq.matches
      if (!active) {
        setIsScrolling(false)
        if (idleTimer) clearTimeout(idleTimer)
      }
      bind()
    }

    bind()
    mq.addEventListener?.('change', onBreakpointChange)

    return () => {
      mq.removeEventListener?.('change', onBreakpointChange)
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
      if (idleTimer) clearTimeout(idleTimer)
    }
  }, [])

  /**
   * 滚动让位
   *
   * 判定全部在 navParking.js（纯函数，单测覆盖），这里只负责读滚动量、切 class。
   * class 挂在主题根节点而不是胶囊上：桌面右上 ≡ 不在胶囊里，两者要同一拍退场。
   *
   * 生命周期（踩过的坑）：依赖里必须带 router.asPath，每次站内跳转都重绑监听。
   * 早期版本在影集页提前 return，于是「在影集页开一次抽屉」就会摘掉监听；
   * 之后跳到首页 / 音乐页时依赖没变、effect 不重跑，让位就永久失效。
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const state = parkRef.current
    state.lastY = window.scrollY || 0
    state.down = 0
    state.up = 0

    // 每次写入都重新取根节点：站内跳转后若根节点被替换，缓存的引用会写到已摘除的节点
    const getRoot = () => document.getElementById('theme-circlelife')
    // 抽屉 / 搜索 / 子菜单打开期间锁定为展开：否则关闭浮层时触发器已不在场
    const locked = Boolean(drawerOpen || searchOpen || openMenuId)

    const write = parked => {
      const root = getRoot()
      if (!root) return
      state.parked = parked
      if (root.classList.contains('cl-nav-parked') === parked) return
      root.classList.toggle('cl-nav-parked', parked)
    }

    let raf = 0
    // 虚拟滚动页（关于页的无限瀑布流）没有 window 滚动，位移由它自己播报过来；
    // pendingY 是这一帧要判定的位置，null 表示「读 window.scrollY」
    let pendingY = null

    const update = () => {
      raf = 0
      const root = getRoot()
      // 影集阅读器隐藏了整条头部、页面也不滚动：不参与让位
      if (!root || root.classList.contains('cl-is-album')) {
        write(false)
        return
      }

      const y =
        pendingY != null ? pendingY : Math.max(0, window.scrollY || 0)
      pendingY = null
      const delta = y - state.lastY
      state.lastY = y

      const next = resolveNavParking({
        y,
        delta,
        down: state.down,
        up: state.up,
        parked: state.parked,
        reading: showProgress,
        viewportHeight: window.innerHeight || 800
      })
      state.down = next.down
      state.up = next.up
      write(locked ? false : next.parked)
    }

    const schedule = y => {
      if (y != null) pendingY = y
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    const onScroll = () => schedule()

    // 虚拟滚动页的位移播报：关于页无限瀑布流通过 CustomEvent 上报展墙位移。
    // reset 表示这是显式跳变（开/关序言幕布），先把基准对齐，不让它被读成一次滚动。
    // 只在关于页响应：离开时的收尾播报（y=0）不能去改下一页的滚动基准。
    const onVirtualScroll = e => {
      if (!getRoot()?.classList.contains('cl-is-about')) return
      const detail = e?.detail
      if (!detail || typeof detail.y !== 'number') return
      if (detail.reset) {
        state.lastY = detail.y
        state.down = 0
        state.up = 0
      }
      schedule(detail.y)
    }

    const onResize = () => schedule(state.lastY)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('cl-virtual-scroll', onVirtualScroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('cl-virtual-scroll', onVirtualScroll)
      if (raf) window.cancelAnimationFrame(raf)
      getRoot()?.classList.remove('cl-nav-parked')
      state.parked = false
    }
  }, [drawerOpen, searchOpen, openMenuId, showProgress, router?.asPath])

  // 主导航来源：与全屏抽屉、navConfig 共用同一份归一化结果，避免两处菜单不一致
  const pillLinks = useMemo(() => {
    let list = []
    if (props.customNav) list = list.concat(props.customNav)
    if (siteConfig('CUSTOM_MENU')) list = props.customMenu || []
    // 搜索已有独立浮层入口，不重复占用胶囊位置
    const all = normalizeNavLinks(list).all.filter(
      link => link.href !== '/search' && linkTitle(link) !== searchLabel
    )
    const hasHome = all.some(link => linkTitle(link) === homeLabel)
    if (hasHome) return all
    return [
      {
        id: 'cl-pill-home',
        title: homeLabel,
        name: homeLabel,
        href: '/',
        show: true
      },
      ...all
    ]
  }, [props.customNav, props.customMenu, homeLabel, searchLabel])

  const isCurrent = href => {
    if (!href || href === '#' || href.endsWith('/#')) return false
    const path = href.split('?')[0].replace(/\/$/, '') || '/'
    const current = (router?.asPath || '/').split('?')[0].replace(/\/$/, '') || '/'
    if (path === '/') return current === '/'
    return current === path || current.startsWith(`${path}/`)
  }

  const clearSubTimer = () => {
    if (subCloseTimer.current) {
      clearTimeout(subCloseTimer.current)
      subCloseTimer.current = null
    }
  }

  const openSub = id => {
    clearSubTimer()
    setOpenMenuId(id)
  }

  // 留一点缓冲，避免指针从按钮移入浮层时闪断
  const scheduleCloseSub = () => {
    clearSubTimer()
    subCloseTimer.current = setTimeout(() => setOpenMenuId(null), 140)
  }

  // 仅有悬停能力的设备才走 hover 展开：触屏没有 hover，需要点击开合；
  // 桌面端若鼠标点击也做 toggle，会在 hover 刚展开时被点击立刻收起
  const handleTriggerClick = (e, key, isOpen) => {
    const keyboardTriggered = e.detail === 0
    if (canHover && !keyboardTriggered) return
    setOpenMenuId(isOpen ? null : key)
  }

  // 路由变化后收起下拉，并把胶囊唤回：新页面首屏不该是「导航不见了」
  useEffect(() => {
    setOpenMenuId(null)
    revealNav()
  }, [router?.asPath, revealNav])

  useEffect(() => () => clearSubTimer(), [])

  // 下拉打开时：点击空白处或按 Esc 收起
  useEffect(() => {
    if (!openMenuId) return undefined
    const onPointerDown = e => {
      if (pillRef.current?.contains(e.target)) return
      setOpenMenuId(null)
    }
    const onKey = e => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [openMenuId])

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
      // 转入搜索时不回焦，避免与搜索框的自动聚焦打架
      if (!searchOpenRef.current) {
        ;(drawerTriggerRef.current || hamburgerRef.current)?.focus?.({
          preventScroll: true
        })
      }
    }
  }, [drawerOpen])

  // 记住触发抽屉的元素，关闭后把焦点还给它（移动端没有 hamburgerRef）
  const openDrawer = e => {
    drawerTriggerRef.current = e?.currentTarget || null
    setDrawerOpen(true)
  }

  const openSearch = () => {
    // 先置位：抽屉 effect 的 cleanup 在本次 commit 里就会执行，
    // 若此处不提前标记，焦点会被抢回汉堡按钮、吃掉搜索框自动聚焦
    searchOpenRef.current = true
    setDrawerOpen(false)
    setSearchOpen(true)
  }

  const closeSearch = () => {
    searchOpenRef.current = false
    setSearchOpen(false)
  }

  const closeDrawer = () => setDrawerOpen(false)

  const searchButton = siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) ? (
    <button
      type='button'
      className='cl-icon-btn cl-fullscreen-top-btn'
      onClick={openSearch}
      aria-label={searchLabel}
      title={searchLabel}>
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
          aria-label={menuLabel}>
          {/* 顶栏操作区 */}
          <div className='cl-fullscreen-topbar'>
            <SmartLink
              href='/'
              className='cl-fullscreen-brand'
              aria-label={homeLabel}
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
            <MenuList {...props} onNavigate={closeDrawer} />
          </div>
        </div>
      </div>,
      document.body
    )

  return (
    <>
      {/* 固定悬浮母层 (脱离文档流，严格水平居中) */}
      <aside
        className='cl-floating-header'
        aria-label='悬浮顶栏'
        onFocusCapture={revealNav}>
        {/* 正中悬浮胶囊 */}
        <nav
          className={`cl-floating-pill ${isScrolling ? 'is-scrolling' : ''}`}
          aria-label='主导航'>
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

          {/* 桌面端主导航：由 Notion 自定义菜单派生，父级项就地下拉 */}
          <div className='cl-floating-pill-nav' ref={pillRef}>
            {pillLinks.map((link, index) => {
              const label = linkTitle(link)
              const subs = Array.isArray(link.subMenus)
                ? link.subMenus.filter(Boolean)
                : []
              const key = link.id ?? `${label}-${index}`

              // 叶子项：直接跳转
              if (!subs.length) {
                return (
                  <SmartLink
                    key={key}
                    href={link.href || '/'}
                    target={link.target}
                    className='cl-floating-pill-link'
                    aria-current={isCurrent(link.href) ? 'page' : undefined}>
                    {label}
                  </SmartLink>
                )
              }

              // 父级项：就地下拉。父级本身若只有 "#" 占位，点击只用于展开子菜单
              const open = openMenuId === key
              return (
                <div
                  key={key}
                  className='cl-pill-item'
                  onMouseEnter={canHover ? () => openSub(key) : undefined}
                  onMouseLeave={canHover ? scheduleCloseSub : undefined}>
                  <button
                    type='button'
                    className={`cl-floating-pill-link ${open ? 'is-open' : ''}`}
                    aria-haspopup='true'
                    aria-expanded={open}
                    onClick={e => handleTriggerClick(e, key, open)}>
                    {label}
                    <i
                      className='cl-pill-caret fas fa-chevron-down'
                      aria-hidden='true'
                    />
                  </button>
                  <div className={`cl-pill-sub ${open ? 'is-open' : ''}`}>
                    <ul className='cl-pill-sub-list'>
                      {subs.map((sub, subIndex) => (
                        <li key={sub.href ?? subIndex}>
                          <SmartLink
                            href={sub.href}
                            target={link.target}
                            className='cl-pill-sublink'
                            onClick={() => setOpenMenuId(null)}>
                            {sub.title || sub.name}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 移动端内置右端暖金纯图标按钮 (仅移动端视口展示) */}
          <button
            type='button'
            onClick={openDrawer}
            className='cl-pill-menu-btn cl-pill-menu-btn--mobile'
            aria-label={menuLabel}
            aria-expanded={drawerOpen}>
            <i className='fas fa-bars cl-pill-menu-icon' aria-hidden='true' />
          </button>

        </nav>
      </aside>

      {/* PC 桌面端独立悬浮右上角暖金纯图标按钮 (仅桌面端视口展示) */}
      <button
        type='button'
        ref={hamburgerRef}
        onClick={openDrawer}
        className='cl-floating-desktop-menu-btn'
        aria-label={menuLabel}
        aria-expanded={drawerOpen}>
        <i className='fas fa-bars cl-desktop-menu-icon' aria-hidden='true' />
      </button>

      {/* 阅读进度：固定在视口顶边，与胶囊的进退完全解耦。
          刻意放在胶囊外面 —— 胶囊让位时带 transform，会把 fixed 后代
          降级成相对它定位，线就会跟着退场。 */}
      {showProgress ? <ReadingProgress /> : null}

      {drawer}

      <SearchOverlay
        open={searchOpen}
        items={props.searchIndex || []}
        onClose={closeSearch}
      />
    </>
  )
}
