import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useState } from 'react'
import CONFIG from '../config'
import { BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'

/**
 * 顶栏：锁头 + 菜单；滚动后压缩高度
 */
export const Header = props => {
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openSearch = () => {
    window.location.href = '/search'
  }

  return (
    <header className={`cl-header sticky top-0 z-40 w-full ${scrolled ? 'is-scrolled' : ''}`}>
      <div className='cl-header-inner'>
        <BrandLockup compact href='/' />
        <div className='cl-header-nav min-w-0 flex-1'>
          <MenuList {...props} variant='header' />
        </div>
        <div className='cl-header-actions'>
          {siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) && (
            <button
              type='button'
              className='cl-icon-btn'
              onClick={openSearch}
              aria-label='Search'>
              <i className='fas fa-search text-sm' />
            </button>
          )}
          <button
            type='button'
            className='cl-icon-btn'
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}>
            <span className='text-base leading-none'>
              {isDarkMode ? '☀' : '☾'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
