import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useMemo } from 'react'
import CONFIG from '../config'
import { MenuItemDrop } from './MenuItemDrop'
import { normalizeNavLinks } from './navConfig'

export const MenuList = props => {
  const {
    customNav,
    customMenu,
    variant = 'stack',
    collapsed = false,
    wing = 'all',
    onNavigate
  } = props
  const { locale } = useGlobal()

  const { left, right, all } = useMemo(() => {
    let list = [
      {
        id: 1,
        icon: 'fas fa-search',
        name: locale?.NAV?.SEARCH || '搜索',
        href: '/search',
        show: siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG)
      },
      {
        id: 2,
        icon: 'fas fa-archive',
        name: locale?.NAV?.ARCHIVE || '时间线',
        href: '/archive',
        show: siteConfig('CIRCLELIFE_MENU_ARCHIVE', null, CONFIG)
      },
      {
        id: 3,
        icon: 'fas fa-folder',
        name: locale?.COMMON?.CATEGORY || '分类',
        href: '/category',
        show: siteConfig('CIRCLELIFE_MENU_CATEGORY', null, CONFIG)
      },
      {
        id: 4,
        icon: 'fas fa-tag',
        name: locale?.COMMON?.TAGS || '标签',
        href: '/tag',
        show: siteConfig('CIRCLELIFE_MENU_TAG', null, CONFIG)
      }
    ]
    if (customNav) list = list.concat(customNav)
    if (siteConfig('CUSTOM_MENU')) list = customMenu || []
    return normalizeNavLinks(list)
  }, [customNav, customMenu, locale])

  let showLinks = all
  if (wing === 'left') showLinks = left
  if (wing === 'right') showLinks = right
  if (wing === 'drawer') showLinks = all

  if (!showLinks?.length) return null

  if (variant === 'header' || variant === 'drawer') {
    const isDrawer = variant === 'drawer'
    return (
      <nav
        aria-label={
          isDrawer
            ? 'Mobile'
            : wing === 'left'
              ? 'Primary left'
              : wing === 'right'
                ? 'Primary right'
                : 'Main'
        }
        className={`cl-main-nav ${
          isDrawer ? 'cl-main-nav--drawer' : 'cl-main-nav--header'
        } ${collapsed ? 'cl-nav--collapsed' : 'cl-nav--expanded'}`}>
        <ul
          className={
            isDrawer
              ? 'cl-drawer-list'
              : 'flex items-center gap-0.5 sm:gap-1 overflow-visible py-0.5'
          }>
          {showLinks.map((link, index) => (
            <MenuItemDrop
              key={link.id ?? link.title ?? index}
              link={link}
              variant={isDrawer ? 'drawer' : 'inline'}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav className='w-full relative z-20'>
      <ul className='flex flex-wrap justify-center gap-2'>
        {all.map((link, index) => (
          <MenuItemDrop key={index} link={link} />
        ))}
      </ul>
    </nav>
  )
}
