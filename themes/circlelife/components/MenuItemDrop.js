import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import { useAlbumUI } from './albumContext'
import { isAlbumPath } from './albumRoute'
import { ICON_FALLBACK, linkTitle } from './navConfig'

const HOVER_CLOSE_MS = 120

// SSR 下退回 useEffect，避免 useLayoutEffect 服务端告警
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function resolveIcon(link) {
  const raw = (link?.icon || '').trim()
  if (raw) {
    if (raw.includes('fa-')) return raw.startsWith('fa') ? raw : `fas ${raw}`
    return raw
  }
  const title = linkTitle(link)
  return ICON_FALLBACK[title] || 'fas fa-circle'
}

export const MenuItemDrop = ({
  link,
  variant = 'default',
  collapsed = false,
  onNavigate,
  index = 0
}) => {
  const router = useRouter()
  const albumUI = useAlbumUI()
  const [show, changeShow] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const hasSubMenu = link?.subMenus?.length > 0
  const isInline = variant === 'inline'
  const isDrawer = variant === 'drawer'
  // Moment 风格：抽屉菜单项编号（01、02…）
  const drawerIndex = String(index + 1).padStart(2, '0')
  // 当前页高亮：比对去语言前缀、去查询参数后的路径
  const stripPath = p =>
    (p || '')
      .split(/[?#]/)[0]
      .replace(/^\/(?:zh-CN|zh-HK|zh-TW|en)(?=\/|$)/, '')
      .replace(/\/$/, '') || '/'
  const isCurrent =
    isDrawer &&
    !hasSubMenu &&
    router?.isReady !== false &&
    stripPath(router?.asPath) === stripPath(link?.href)
  const iconClass = resolveIcon(link)
  const label = linkTitle(link)

  const handleAlbumNavClick = useCallback(
    e => {
      if (!isAlbumPath(link?.href)) return false
      const path = (router?.asPath || '').split('?')[0].replace(/\/$/, '')
      const onAlbum = path === '/album'
      if (!onAlbum) return false
      // 已在影集页：画廊→书架；书架保持。Context 未就绪则退回普通导航
      const goShelf = albumUI?.goShelf
      if (!goShelf) return false
      e.preventDefault()
      e.stopPropagation?.()
      goShelf()
      onNavigate?.()
      return true
    },
    [link?.href, router?.asPath, onNavigate, albumUI]
  )

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const openMenu = useCallback(() => {
    clearCloseTimer()
    // 事件处理器先于 paint 执行：先定位再显示，首帧就不在 (0,0)
    if (isInline && hasSubMenu && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left })
    }
    changeShow(true)
  }, [clearCloseTimer, isInline, hasSubMenu])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => changeShow(false), HOVER_CLOSE_MS)
  }, [clearCloseTimer])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  // 键盘（Enter）开启也走这里；layout effect 保证 paint 前定位到位
  useIsomorphicLayoutEffect(() => {
    if (!show || !isInline || !hasSubMenu || !triggerRef.current) return
    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left })
    }
    updatePosition()
    // 影集页滚动发生在内部容器（.cl-album-snap），window 不发 scroll，需一并监听
    const scrollParents = []
    let node = triggerRef.current.parentElement
    while (node && node !== document.body) {
      const overflowY = window.getComputedStyle(node).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll') {
        scrollParents.push(node)
      }
      node = node.parentElement
    }
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition)
    scrollParents.forEach(el =>
      el.addEventListener('scroll', updatePosition, { passive: true })
    )
    const onKey = e => {
      if (e.key === 'Escape') changeShow(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
      scrollParents.forEach(el =>
        el.removeEventListener('scroll', updatePosition)
      )
      window.removeEventListener('keydown', onKey)
    }
  }, [show, isInline, hasSubMenu])

  if (link?.show === false) return null

  if (isDrawer) {
    return (
      <li className='cl-drawer-item'>
        {!hasSubMenu ? (
          <SmartLink
            href={link?.href}
            target={link?.target}
            className={`cl-drawer-link ${isCurrent ? 'is-current' : ''}`}
            data-index={drawerIndex}
            onClick={e => {
              if (handleAlbumNavClick(e)) return
              onNavigate?.(e)
            }}>
            <i className={`${iconClass} cl-nav-ico`} aria-hidden='true' />
            <span>{label}</span>
          </SmartLink>
        ) : (
          <div className='cl-drawer-group'>
            <button
              type='button'
              className={`cl-drawer-link cl-drawer-toggle ${isCurrent ? 'is-current' : ''}`}
              data-index={drawerIndex}
              aria-expanded={show}
              onClick={() => changeShow(v => !v)}>
              <i className={`${iconClass} cl-nav-ico`} aria-hidden='true' />
              <span>{label}</span>
              <i
                className={`fas fa-chevron-down cl-drawer-chevron ${
                  show ? 'is-open' : ''
                }`}
              />
            </button>
            {show ? (
              <ul className='cl-drawer-sub'>
                {link.subMenus.map((s, i) => (
                  <li key={i}>
                    <SmartLink
                      href={s.href}
                      target={link?.target}
                      className='cl-drawer-sublink'
                      onClick={onNavigate}>
                      {s.title || s.name}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </li>
    )
  }

  const itemShell = isInline ? 'relative flex-shrink-0' : 'cursor-pointer'
  const linkBox = isInline
    ? `rounded-md cl-nav-link no-underline inline-flex items-center whitespace-nowrap px-2 py-1.5 gap-1.5 ${
        collapsed ? 'cl-nav-link--icon' : 'cl-nav-link--text'
      }`
    : 'rounded px-2 md:pl-0 md:mr-3 my-4 md:pr-3 text-[var(--cl-text)] no-underline md:border-r border-gray-light'

  const innerContent = (
    <>
      <i className={`${iconClass} cl-nav-ico`} aria-hidden='true' />
      <span className='cl-nav-text'>{label}</span>
      {hasSubMenu ? (
        <i
          className={`cl-nav-chevron fas fa-chevron-down text-[0.65em] duration-300 transition-transform ${
            show ? 'rotate-180' : ''
          }`}
        />
      ) : null}
      {isInline ? (
        <span className='cl-nav-tip' role='tooltip'>
          {label}
        </span>
      ) : null}
    </>
  )

  const subMenuList = hasSubMenu ? (
    <ul
      className={
        isInline
          ? `cl-submenu min-w-[11rem] py-1.5 transition-opacity duration-200 ${
              show ? 'visible opacity-100' : 'hidden pointer-events-none opacity-0'
            }`
          : `${
              show ? 'visible opacity-100' : 'hidden pointer-events-none opacity-0'
            } absolute z-30 transition-opacity duration-200 left-0 top-12 block border bg-[var(--cl-surface)] border-[var(--cl-border)]`
      }
      style={
        isInline && show
          ? { position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 50 }
          : undefined
      }
      onMouseEnter={isInline ? openMenu : undefined}
      onMouseLeave={isInline ? scheduleClose : undefined}>
      {link.subMenus.map((sLink, index) => (
        <li
          key={index}
          className='cl-submenu-item'>
          <SmartLink href={sLink.href} target={link?.target} className='cl-submenu-link'>
            {sLink?.icon ? <i className={`${sLink.icon} cl-submenu-ico`} /> : null}
            <span>{sLink.title || sLink.name}</span>
          </SmartLink>
        </li>
      ))}
    </ul>
  ) : null

  return (
    <li
      ref={isInline ? triggerRef : undefined}
      className={itemShell}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}>
      {!hasSubMenu && (
        <div className={linkBox} title={collapsed ? label : undefined}>
          <SmartLink
            href={link?.href}
            target={link?.target}
            className='cl-nav-hit inline-flex items-center gap-1.5'
            aria-label={label}
            onClick={e => {
              if (handleAlbumNavClick(e)) return
            }}>
            {innerContent}
          </SmartLink>
        </div>
      )}

      {hasSubMenu && (
        <div
          className={`${linkBox} cursor-pointer`}
          title={collapsed ? label : undefined}
          role='button'
          tabIndex={0}
          aria-haspopup='true'
          aria-expanded={show}
          aria-label={label}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              changeShow(v => !v)
            }
          }}>
          {innerContent}
        </div>
      )}

      {subMenuList &&
        (isInline && typeof document !== 'undefined'
          ? createPortal(subMenuList, document.body)
          : subMenuList)}
    </li>
  )
}
