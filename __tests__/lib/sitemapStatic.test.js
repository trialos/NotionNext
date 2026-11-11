import {
  dedupeSitemapUrls,
  isCategorySlug
} from '@/lib/utils/sitemap.xml'

describe('静态 sitemap 生成器', () => {
  test('isCategorySlug 识别已退役的分类地址', () => {
    expect(isCategorySlug('category')).toBe(true)
    expect(isCategorySlug('/category')).toBe(true)
    expect(isCategorySlug('category/随笔')).toBe(true)
    expect(isCategorySlug('/category/人机协作')).toBe(true)

    expect(isCategorySlug('archive')).toBe(false)
    expect(isCategorySlug('article/abc')).toBe(false)
    expect(isCategorySlug('categories')).toBe(false)
    expect(isCategorySlug(undefined)).toBe(false)
  })

  test('dedupeSitemapUrls 按 loc 保留第一条，丢掉空地址', () => {
    const urls = [
      { loc: 'https://example.com/archive', priority: 1.0 },
      { loc: 'https://example.com/about' },
      { loc: 'https://example.com/archive', priority: 0.5 },
      { loc: '' },
      { loc: 'https://example.com/about' }
    ]
    expect(dedupeSitemapUrls(urls)).toEqual([
      { loc: 'https://example.com/archive', priority: 1.0 },
      { loc: 'https://example.com/about' }
    ])
  })

  test('空输入返回空数组', () => {
    expect(dedupeSitemapUrls()).toEqual([])
    expect(dedupeSitemapUrls([])).toEqual([])
  })
})
