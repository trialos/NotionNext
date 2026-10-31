import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAlbumUI } from './albumContext'
import { isAlbumPath } from './albumRoute'
import { linkTitle } from './navConfig'

const stripPath = p =>
  (p || '')
    .split(/[?#]/)[0]
    .replace(/^\/(?:zh-CN|zh-HK|zh-TW|en)(?=\/|$)/, '')
    .replace(/\/$/, '') || '/'

/**
 * 全屏抽屉菜单条目：编号、当前页高亮、子菜单展开
 */
export const MenuItemDrop = ({ link, onNavigate, index = 0 }) => {
  const router = useRouter()
  const albumUI = useAlbumUI()
  const [show, setShow] = useState(false)
  const hasSubMenu = link?.subMenus?.length > 0
  const drawerIndex = String(index + 1).padStart(2, '0')
  const isCurrent =
    !hasSubMenu &&
    router?.isReady !== false &&
    stripPath(router?.asPath) === stripPath(link?.href)
  const label = linkTitle(link)

  const handleAlbumNavClick = e => {
    if (!isAlbumPath(link?.href)) return false
    const path = (router?.asPath || '').split('?')[0].replace(/\/$/, '')
    const onAlbum = path === '/album'
    if (onAlbum) {
      // 已在影集页：打开目录抽屉，不再重进路由
      const openAlbumIndex = albumUI?.openAlbumIndex
      if (openAlbumIndex) {
        e.preventDefault()
        e.stopPropagation?.()
        openAlbumIndex()
        onNavigate?.()
        return true
      }
    } else {
      // 未在影集页：强制以纯净路径 '/album' 进站，切断遗留 query
      e.preventDefault()
      e.stopPropagation?.()
      onNavigate?.()
      router.push('/album')
      return true
    }
    return false
  }

  if (link?.show === false) return null

  return (
    <li className='cl-drawer-item'>
      {!hasSubMenu ? (
        <SmartLink
          href={link?.href}
          target={link?.target}
          className={`cl-drawer-link ${isCurrent ? 'is-current' : ''}`}
          onClick={e => {
            if (handleAlbumNavClick(e)) return
            onNavigate?.(e)
          }}>
          <span className='cl-drawer-num' aria-hidden='true'>
            {drawerIndex}
          </span>
          <span className='cl-drawer-title'>{label}</span>
        </SmartLink>
      ) : (
        <div className='cl-drawer-group'>
          <button
            type='button'
            className={`cl-drawer-link cl-drawer-toggle ${isCurrent ? 'is-current' : ''}`}
            aria-expanded={show}
            onClick={() => setShow(value => !value)}>
            <span className='cl-drawer-num' aria-hidden='true'>
              {drawerIndex}
            </span>
            <span className='cl-drawer-title'>{label}</span>
            <span
              className={`cl-drawer-toggle-ico ${show ? 'is-open' : ''}`}
              aria-hidden='true'>
              {show ? '×' : '+'}
            </span>
          </button>
          {show ? (
            <ul className='cl-drawer-sub'>
              {link.subMenus.map((sub, i) => (
                <li key={i}>
                  <SmartLink
                    href={sub.href}
                    target={link?.target}
                    className='cl-drawer-sublink'
                    onClick={onNavigate}>
                    {sub.title || sub.name}
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
