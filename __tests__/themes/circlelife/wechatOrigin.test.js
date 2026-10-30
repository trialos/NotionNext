import fs from 'fs'
import path from 'path'
import { resolveWechatOrigin } from '@/themes/circlelife/components/wechatOrigin'

const readThemeFile = (...parts) =>
  fs.readFileSync(
    path.join(path.resolve(process.cwd(), 'themes/circlelife'), ...parts),
    'utf8'
  )

describe('文章「微信原文」链接', () => {
  test('接受 http(s)，去掉首尾空白', () => {
    expect(
      resolveWechatOrigin({ 微信原文: '  https://mp.weixin.qq.com/s/abc  ' })
    ).toBe('https://mp.weixin.qq.com/s/abc')
  })

  test('空值 / 非 http(s) / 非字符串一律返回空', () => {
    expect(resolveWechatOrigin({})).toBe('')
    expect(resolveWechatOrigin({ 微信原文: '' })).toBe('')
    expect(resolveWechatOrigin({ 微信原文: '   ' })).toBe('')
    expect(resolveWechatOrigin({ 微信原文: 'javascript:alert(1)' })).toBe('')
    expect(resolveWechatOrigin({ 微信原文: 'mp.weixin.qq.com/s/abc' })).toBe('')
    expect(resolveWechatOrigin({ 微信原文: { href: 'https://x.com' } })).toBe('')
    expect(resolveWechatOrigin(null)).toBe('')
  })

  test('兼容映射后的 wechatOrigin 键', () => {
    expect(resolveWechatOrigin({ wechatOrigin: 'https://mp.weixin.qq.com/s/x' })).toBe(
      'https://mp.weixin.qq.com/s/x'
    )
  })

  test('LayoutSlug 只通过 resolver 渲染，并带安全外链属性', () => {
    const source = readThemeFile('index.js')
    expect(source).toContain('resolveWechatOrigin(post)')
    expect(source).toContain('cl-article-origin')
    expect(source).toContain("target='_blank'")
    expect(source).toContain("rel='noopener noreferrer'")
  })

  test('微信原文在标题区，底部返回行只保留返回', () => {
    const source = readThemeFile('index.js')
    const articleStyle = readThemeFile('styles', 'article.js')
    expect(source).toContain('cl-article-top-row')
    expect((source.match(/cl-article-origin/g) || [])).toHaveLength(1)
    expect(source.indexOf('cl-article-top-row')).toBeLessThan(
      source.indexOf('cl-article-origin')
    )
    expect(source.indexOf('cl-article-origin')).toBeLessThan(
      source.indexOf('cl-article-back-row')
    )
    expect(articleStyle).toMatch(
      /\.cl-article-top-row \{[^}]*justify-content: space-between;/
    )
    expect(articleStyle).toMatch(
      /\.cl-article-origin \{[^}]*padding-block: 0\.35rem;/
    )
  })
})
