import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useMemo } from 'react'
import CONFIG from '../config'
import { MenuItemDrop } from './MenuItemDrop'
import { normalizeNavLinks, linkTitle } from './navConfig'

/**
 * 全屏抽屉主导航：顺序严格跟随 Notion 菜单行序
 */
export const MenuList = props => {
  const { customNav, customMenu, onNavigate } = props
  const { locale } = useGlobal()

  const all = useMemo(() => {
    let list = [
      {
        id: 1,
        name: locale?.NAV?.SEARCH || '搜索',
        href: '/search',
        show: siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG)
      },
      {
        id: 2,
        name: locale?.NAV?.ARCHIVE || '时间线',
        href: '/archive',
        show: siteConfig('CIRCLELIFE_MENU_ARCHIVE', null, CONFIG)
      },
      {
        id: 3,
        name: locale?.COMMON?.CATEGORY || '分类',
        href: '/category',
        show: siteConfig('CIRCLELIFE_MENU_CATEGORY', null, CONFIG)
      },
      {
        id: 4,
        name: locale?.COMMON?.TAGS || '标签',
        href: '/tag',
        show: siteConfig('CIRCLELIFE_MENU_TAG', null, CONFIG)
      }
    ]
    if (customNav) list = list.concat(customNav)
    if (siteConfig('CUSTOM_MENU')) list = customMenu || []
    return normalizeNavLinks(list).all
  }, [customNav, customMenu, locale])

  const hasHome = all.some(
    link => linkTitle(link) === '首页' || linkTitle(link) === 'Home'
  )
  const showLinks = hasHome
    ? all
    : [
        {
          id: 'cl-home',
          title: locale?.NAV?.INDEX || '首页',
          name: locale?.NAV?.INDEX || '首页',
          href: '/',
          show: true
        },
        ...all
      ]

  return (
    <nav aria-label='主导航' className='cl-main-nav'>
      <ul className='cl-drawer-list'>
        {showLinks.map((link, index) => (
          <MenuItemDrop
            key={link.id ?? link.title ?? index}
            link={link}
            index={index}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  )
}
