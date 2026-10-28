/**
 * @jest-environment node
 */
import {
  normalizePath,
  parseStored,
  resolveArticleBack
} from '@/themes/circlelife/components/articleBackHref'

describe('normalizePath', () => {
  it('把空值与根路径归一到 /', () => {
    expect(normalizePath()).toBe('/')
    expect(normalizePath('')).toBe('/')
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('///')).toBe('/')
  })

  it('去掉 hash 与末尾斜杠，保留查询串', () => {
    expect(normalizePath('/a/')).toBe('/a')
    expect(normalizePath('/a#h')).toBe('/a')
    expect(normalizePath('/a?x=1#h')).toBe('/a?x=1')
    expect(normalizePath('?x=1')).toBe('/?x=1')
    expect(normalizePath('/a/?x=1')).toBe('/a?x=1')
  })
})

describe('parseStored', () => {
  it('读取新快照并保留 y', () => {
    expect(parseStored('{"href":"/archive","y":151.5}')).toEqual({
      href: '/archive',
      y: 152
    })
  })

  it('兼容旧版裸字符串，y 归零', () => {
    expect(parseStored('/archive')).toEqual({ href: '/archive', y: 0 })
    expect(parseStored('{"href":"/archive","y":-3}')).toEqual({
      href: '/archive',
      y: 0
    })
  })

  it('拒绝站外与协议相对路径', () => {
    expect(parseStored('https://example.com/a')).toBe(null)
    expect(parseStored('//evil.com/a')).toBe(null)
    expect(parseStored('{"href":"//evil.com"}')).toBe(null)
  })
})

describe('resolveArticleBack', () => {
  const currentPath = '/article/foo'
  const departure = {
    from: '/archive',
    to: '/article/foo',
    y: 151,
    ts: Date.now()
  }

  it('本次离开记录优先于快照与兜底，并带上离开时的 y', () => {
    expect(
      resolveArticleBack({
        departure,
        storedRaw: '{"href":"/","y":2900}',
        lastList: '/tag/x',
        currentPath
      })
    ).toEqual({ href: '/archive', y: 151, fresh: true })
  })

  it('离开记录的目标不是当前文章时回退到快照', () => {
    expect(
      resolveArticleBack({
        departure: { ...departure, to: '/article/other' },
        storedRaw: '{"href":"/category/life","y":80}',
        lastList: '/tag/x',
        currentPath
      })
    ).toEqual({ href: '/category/life', y: 80, fresh: false })
  })

  it('离开记录的来源就是当前文章时视为无效', () => {
    expect(
      resolveArticleBack({
        departure: { ...departure, from: currentPath },
        storedRaw: '{"href":"/archive","y":151}',
        currentPath
      })
    ).toEqual({ href: '/archive', y: 151, fresh: false })
  })

  it('没有快照时使用最后一个列表页，位置回顶部', () => {
    expect(
      resolveArticleBack({ lastList: '/category/life', currentPath })
    ).toEqual({ href: '/category/life', y: 0, fresh: false })
  })

  it('兜底值等于当前文章时回首页顶部', () => {
    expect(resolveArticleBack({ lastList: currentPath, currentPath })).toEqual({
      href: '/',
      y: 0,
      fresh: false
    })
    expect(
      resolveArticleBack({
        storedRaw: JSON.stringify({ href: currentPath, y: 500 }),
        currentPath
      })
    ).toEqual({ href: '/', y: 0, fresh: false })
  })

  it('忽略非站内兜底', () => {
    expect(
      resolveArticleBack({
        lastList: 'https://example.com/category/life',
        currentPath
      })
    ).toEqual({ href: '/', y: 0, fresh: false })
  })

  it('什么都没记录时回首页顶部', () => {
    expect(resolveArticleBack({ currentPath })).toEqual({
      href: '/',
      y: 0,
      fresh: false
    })
  })
})
