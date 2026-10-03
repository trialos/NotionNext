import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'

/**
 * Circle of Life 顶栏：品牌锁头 + 菜单 + 搜索 / 深浅色
 */
export const Header = props => {
  const { isDarkMode, toggleDarkMode } = useGlobal()

  const openSearch = () => {
    window.location.href = '/search'
  }

  return (
    <header className='cl-header sticky top-0 z-40 w-full'>
      <div className='mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 overflow-visible'>
        <BrandLockup compact href='/' />

        <div className='min-w-0 flex-1'>
          <MenuList {...props} variant='header' />
        </div>

        <div className='flex flex-shrink-0 items-center gap-1'>
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
