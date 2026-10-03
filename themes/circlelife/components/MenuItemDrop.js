import SmartLink from '@/components/SmartLink'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const HOVER_CLOSE_MS = 120

const ICON_FALLBACK = {
  首页: 'fas fa-home',
  随笔: 'fas fa-pen',
  时间线: 'fas fa-clock-rotate-left',
  往期整理: 'fas fa-archive',
  关于: 'fas fa-user',
  文章分类: 'fas fa-th',
  文章标签: 'fas fa-tag',
  分类: 'fas fa-th',
  标签: 'fas fa-tag',
  搜索: 'fas fa-search',
  Archive: 'fas fa-archive',
  Category: 'fas fa-folder',
  Tags: 'fas fa-tag',
  Search: 'fas fa-search'
}

function resolveIcon(link) {
  const raw = (link?.icon || '').trim()
  if (raw) {
    // Notion sometimes stores "fas fa-home" or just "fa-home"
    if (raw.includes('fa-')) return raw.startsWith('fa') ? raw : `fas ${raw}`
    return raw
  }
  const title = link?.name || link?.title || ''
  return ICON_FALLBACK[title] || 'fas fa-circle'
}

function linkLabel(link) {
  return link?.name || link?.title || ''
}

/**
 * 支持下拉二级的菜单
 * header 顶栏（inline）子菜单 portal + fixed；collapsed 时仅图标 + 悬停出字
 */
export const MenuItemDrop = ({
  link,
  variant = 'default',
  collapsed = false
}) => {
  const [show, changeShow] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const hasSubMenu = link?.subMenus?.length > 0
  const isInline = variant === 'inline'
  const iconClass = resolveIcon(link)
  const label = linkLabel(link)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const openMenu = useCallback(() => {
    clearCloseTimer()
    changeShow(true)
  }, [clearCloseTimer])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => changeShow(false), HOVER_CLOSE_MS)
  }, [clearCloseTimer])

  useEffect(() => {
    return () => clearCloseTimer()
  }, [clearCloseTimer])

  useEffect(() => {
    if (!show || !isInline || !hasSubMenu || !triggerRef.current) return

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.left
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, { passive: true })
      window.removeEventListener('resize', updatePosition)
    }
  }, [show, isInline, hasSubMenu])

  if (link?.show === false) {
    return null
  }

  const itemShell = isInline ? 'relative flex-shrink-0' : 'cursor-pointer'

  const linkBox = isInline
    ? `rounded-md cl-nav-link no-underline flex items-center whitespace-nowrap ${
        collapsed
          ? 'cl-nav-link--icon px-2 py-1.5 justify-center gap-0'
          : 'px-2 py-1.5 gap-1.5'
      }`
    : 'rounded px-2 md:pl-0 md:mr-3 my-4 md:pr-3 text-[var(--cl-text)] no-underline md:border-r border-gray-light'

  const labelEl =
    isInline && collapsed ? (
      <span className='cl-nav-tip' role='tooltip'>
        {label}
      </span>
    ) : (
      <span className='cl-nav-text'>{label}</span>
    )

  const chevron =
    hasSubMenu && !collapsed ? (
      <i
        className={`ml-1 fas fa-chevron-down text-[0.65em] duration-300 transition-transform ${
          show ? 'rotate-180' : ''
        }`}
      />
    ) : hasSubMenu && collapsed ? (
      <i
        className={`cl-nav-chevron fas fa-caret-down text-[0.55em] opacity-70 ${
          show ? 'opacity-100' : ''
        }`}
      />
    ) : null

  const innerContent = (
    <>
      <i className={`${iconClass} cl-nav-ico`} aria-hidden='true' />
      {labelEl}
      {chevron}
    </>
  )

  const subMenuList = hasSubMenu ? (
    <ul
      className={
        isInline
          ? `cl-card min-w-[10rem] py-1 border border-[var(--cl-border)] bg-[var(--cl-surface)] transition-all duration-200 ${
              show
                ? 'visible opacity-100'
                : 'hidden pointer-events-none opacity-0'
            }`
          : `${
              show
                ? 'visible opacity-100'
                : 'hidden pointer-events-none opacity-0'
            } absolute z-30 transition-all duration-200 left-0 top-12 block border bg-[var(--cl-surface)] border-[var(--cl-border)] dark:bg-black`
      }
      style={
        isInline && show
          ? {
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              zIndex: 50
            }
          : undefined
      }
      onMouseEnter={isInline ? openMenu : undefined}
      onMouseLeave={isInline ? scheduleClose : undefined}>
      {link.subMenus.map((sLink, index) => (
        <li
          key={index}
          className={`border-b text-[var(--cl-text)] hover:bg-[var(--cl-accent-soft)] tracking-widest transition-all duration-200 border-[var(--cl-border)] py-3 pr-6 pl-3 ${
            isInline ? 'border-0 hover:bg-[var(--cl-accent-soft)]' : ''
          }`}>
          <SmartLink href={sLink.href} target={link?.target}>
            <span className='text-sm text-nowrap font-extralight'>
              {sLink?.icon ? <i className={sLink.icon}> &nbsp; </i> : null}
              {sLink.title || sLink.name}
            </span>
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
            aria-label={label}>
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
