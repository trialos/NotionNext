import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useState } from 'react'
import CONFIG from '../config'
import { BrandLockup } from './BrandLockup'
import { MenuList } from './MenuList'
import ReadingProgress from './ReadingProgress'

/**
 * 顶栏：迟滞收起 + 可选文章阅读进度
 */
export const Header = props => {
  const { post } = props
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [scrolled, setScrolled] = useState(false)
  const showProgress = Boolean(post) && post?.type !== 'Page'

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      setScrolled(prev => {
        if (!prev && y > 28) return true
        if (prev && y < 10) return false
        return prev
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openSearch = () => {
    window.location.href = '/search'
  }

  return (
    <header
      className={`cl-header sticky top-0 z-40 w-full ${
        scrolled ? 'is-scrolled' : ''
      } ${showProgress ? 'cl-header--reading' : ''}`}>
      <div className='cl-header-inner'>
        <BrandLockup compact href='/' collapsed={scrolled} />
        <div className='cl-header-nav min-w-0 flex-1'>
          <MenuList {...props} variant='header' collapsed={scrolled} />
        </div>
        <div className='cl-header-actions'>
          {siteConfig('CIRCLELIFE_MENU_SEARCH', null, CONFIG) && (
            <button
              type='button'
              className='cl-icon-btn'
              onClick={openSearch}
              aria-label='Search'
              title='搜索'>
              <i className='fas fa-search text-sm' />
            </button>
          )}
          <button
            type='button'
            className='cl-icon-btn'
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
            title={isDarkMode ? '浅色' : '深色'}>
            <span className='text-base leading-none'>
              {isDarkMode ? '☀' : '☾'}
            </span>
          </button>
        </div>
      </div>
      {showProgress ? <ReadingProgress /> : null}
    </header>
  )
}
