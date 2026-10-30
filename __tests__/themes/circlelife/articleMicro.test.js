import fs from 'fs'
import path from 'path'

const readThemeFile = (...parts) =>
  fs.readFileSync(
    path.join(path.resolve(process.cwd(), 'themes/circlelife'), ...parts),
    'utf8'
  )

const articleStyle = readThemeFile('styles', 'article.js')
const tokenStyle = readThemeFile('styles', 'tokens.js')

describe('文章页微字可读性', () => {
  test('微字 token：手机 0.75rem，桌面 0.8125rem', () => {
    expect(tokenStyle).toContain('--cl-article-micro: 0.75rem')
    expect(tokenStyle).toMatch(
      /@media \(min-width: 1024px\)[\s\S]*?--cl-article-micro: 0\.8125rem/
    )
  })

  test('元信息 / 返回 / 微信原文 / TOC 统一走 micro token', () => {
    const selectors = [
      '.cl-article-meta',
      '.cl-meta-category',
      '.cl-article-back',
      '.cl-article-origin',
      '.cl-toc-item',
      '.cl-toc-item--h2',
      '.cl-toc-item--h3',
      '.cl-toc-drawer-title'
    ]
    for (const selector of selectors) {
      expect(articleStyle).toMatch(
        new RegExp(
          `\\${selector} \\{[^}]*font-size: var\\(--cl-article-micro\\)`
        )
      )
    }
    expect(articleStyle).toMatch(
      /\.cl-toc-item--h1 \{[^}]*font-size: calc\(var\(--cl-article-micro\) \+ 0\.0625rem\)/
    )
  })

  test('正文仍走 --cl-prose-size，不随微字放大', () => {
    expect(articleStyle).toContain('font-size: var(--cl-prose-size)')
  })

  test('标题行同一行承载返回与微信原文，触控高度 ≥24px', () => {
    expect(articleStyle).toMatch(/\.cl-article-top-row \{[^}]*display: flex;/)
    expect(articleStyle).toMatch(/\.cl-article-back \{[^}]*padding: 0\.35rem 0;/)
    expect(articleStyle).toMatch(
      /\.cl-article-origin \{[^}]*padding-block: 0\.35rem;/
    )
    expect(articleStyle).toMatch(
      /\.cl-article-origin \{[^}]*color: var\(--cl-muted\)/
    )
  })
})
