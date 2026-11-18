/**
 * @jest-environment node
 */
import fs from 'fs'
import path from 'path'
import * as navConfig from '@/themes/circlelife/components/navConfig'
import {
  isCurrentNavPath,
  linkTitle,
  normalizeNavLinks
} from '@/themes/circlelife/components/navConfig'

const readSource = (...parts) =>
  fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8')

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

describe('isCurrentNavPath', () => {
  test('音乐详情页归入 /music 导航，邻接路径不误命中', () => {
    expect(isCurrentNavPath('/music', '/music')).toBe(true)
    expect(isCurrentNavPath('/music/album/xxx', '/music')).toBe(true)
    expect(isCurrentNavPath('/music/note/xxx', '/music')).toBe(true)
    expect(isCurrentNavPath('/music?from=home', '/music')).toBe(true)
    expect(isCurrentNavPath('/musicology', '/music')).toBe(false)
    expect(isCurrentNavPath('/archive', '/music')).toBe(false)
  })

  test('首页只精确匹配，占位符与外链不高亮', () => {
    expect(isCurrentNavPath('/', '/')).toBe(true)
    expect(isCurrentNavPath('/music', '/')).toBe(false)
    expect(isCurrentNavPath('/', '#/')).toBe(false)
    expect(isCurrentNavPath('/music', '#')).toBe(false)
    expect(isCurrentNavPath('/music', '/music/#')).toBe(false)
    expect(isCurrentNavPath('/music', 'https://music.163.com/#/album')).toBe(
      false
    )
  })

  test('影集带 deck 查询参数时仍高亮影集导航', () => {
    expect(isCurrentNavPath('/album?deck=xxx', '/album')).toBe(true)
    expect(isCurrentNavPath('/album?deck=xxx&chapter=true', '/album')).toBe(
      true
    )
    expect(isCurrentNavPath('/album', '/music')).toBe(false)
  })

  test('归一化语言前缀与尾斜杠后再判定', () => {
    expect(isCurrentNavPath('/zh-CN/music/album/xxx', '/music/')).toBe(true)
    expect(isCurrentNavPath('/en/', '/')).toBe(true)
  })
})

describe('导航高亮判定保持单一来源', () => {
  test('胶囊与抽屉都调用 isCurrentNavPath', () => {
    const header = readSource('themes', 'circlelife', 'components', 'Header.js')
    const drawer = readSource(
      'themes',
      'circlelife',
      'components',
      'MenuItemDrop.js'
    )

    expect(header).toContain('isCurrentNavPath(')
    expect(drawer).toContain('isCurrentNavPath(')
    expect(drawer).not.toContain('stripPath(')
  })
})
