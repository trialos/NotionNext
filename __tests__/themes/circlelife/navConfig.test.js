/**
 * @jest-environment node
 */
import * as navConfig from '@/themes/circlelife/components/navConfig'
import {
  linkTitle,
  normalizeNavLinks
} from '@/themes/circlelife/components/navConfig'

const makeLink = (name, href, extra = {}) => ({
  name,
  title: name,
  href,
  show: true,
  ...extra
})

describe('normalizeNavLinks', () => {
  test('preserves Notion row order for archive and about', () => {
    const links = [
      makeLink('首页', '/'),
      makeLink('文章', '/archive'),
      makeLink('关于', '/about'),
      makeLink('影集', '/album')
    ]

    expect(normalizeNavLinks(links).all.map(linkTitle)).toEqual([
      '文章',
      '关于',
      '影集'
    ])
  })

  test('does not reorder when the archive menu is named 时间线', () => {
    const links = [
      makeLink('首页', '/'),
      makeLink('时间线', '/archive'),
      makeLink('关于', '/about'),
      makeLink('影集', '/album')
    ]

    expect(normalizeNavLinks(links).all.map(linkTitle)).toEqual([
      '时间线',
      '关于',
      '影集'
    ])
  })

  test('filters hidden and show:false items without changing order', () => {
    const links = [
      makeLink('首页', '/'),
      makeLink('影集', '/album'),
      makeLink('隐藏', '/hidden', { show: false }),
      makeLink('文章', '/archive'),
      makeLink('关于', '/about')
    ]

    expect(normalizeNavLinks(links).all.map(linkTitle)).toEqual([
      '影集',
      '文章',
      '关于'
    ])
  })

  test('appends the album fallback only when it is missing', () => {
    const withoutAlbum = normalizeNavLinks([
      makeLink('文章', '/archive'),
      makeLink('关于', '/about')
    ]).all
    expect(withoutAlbum.map(linkTitle)).toEqual(['文章', '关于', '影集'])

    const withAlbum = normalizeNavLinks([
      makeLink('文章', '/archive'),
      makeLink('影集', '/album'),
      makeLink('关于', '/about')
    ]).all
    expect(withAlbum.map(linkTitle)).toEqual(['文章', '影集', '关于'])
  })

  test('keeps subMenus untouched', () => {
    const subMenus = [{ name: '子菜单', href: '/sub' }]
    const parent = makeLink('随笔', '/essay', { subMenus })

    const all = normalizeNavLinks([parent]).all
    expect(all[0]).toBe(parent)
    expect(all[0].subMenus).toBe(subMenus)
  })

  test('removes the old wing and icon exports', () => {
    expect(navConfig.NAV_LEFT).toBeUndefined()
    expect(navConfig.NAV_RIGHT).toBeUndefined()
    expect(navConfig.ICON_FALLBACK).toBeUndefined()
  })
})
