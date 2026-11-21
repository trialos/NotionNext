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
  test('微字 token 保持手机 0.75rem、桌面 0.8125rem，不随操作文字放大', () => {
    expect(tokenStyle).toContain('--cl-article-micro: 0.75rem')
    expect(tokenStyle).toMatch(
      /@media \(min-width: 1024px\)[\s\S]*?--cl-article-micro: 0\.8125rem/
    )
  })

  test('元信息与 TOC 条目仍统一走 micro token', () => {
    const selectors = [
      '.cl-article-meta',
      '.cl-meta-category',
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

  test('操作文字 token 独立：手机 0.9375rem（15px），桌面 1rem（16px）', () => {
    expect(tokenStyle).toContain('--cl-article-action: 0.9375rem')
    expect(tokenStyle).toMatch(
      /@media \(min-width: 1024px\)[\s\S]*?--cl-article-action: 1rem/
    )
  })

  test('返回与微信原文走 action token：黑体、字重 400 不变、正文色', () => {
    expect(articleStyle).toMatch(
      /#theme-circlelife \.cl-article-back,\s*#theme-circlelife \.cl-article-origin \{[^}]*font-size: var\(--cl-article-action\)/
    )
    expect(articleStyle).toMatch(
      /#theme-circlelife \.cl-article-back,\s*#theme-circlelife \.cl-article-origin \{[\s\S]*?font-family: var\(--cl-font-body\)[\s\S]*?font-weight: 400[\s\S]*?color: var\(--cl-text\)/
    )
    expect(articleStyle).not.toMatch(
      /#theme-circlelife \.cl-article-back[^{]*\{[^}]*font-size: var\(--cl-article-micro\)/
    )
  })

  test('操作文字命中区：手机 44px，桌面 36px', () => {
    expect(articleStyle).toMatch(
      /#theme-circlelife \.cl-article-back,\s*#theme-circlelife \.cl-article-origin \{[^}]*min-height: 2\.75rem/
    )
    expect(articleStyle).toMatch(
      /@media \(min-width: 1024px\) \{[\s\S]*?min-height: 2\.25rem/
    )
    expect(articleStyle).toMatch(/\.cl-article-top-row \{[^}]*display: flex;/)
    expect(articleStyle).toMatch(
      /\.cl-article-back \{[^}]*padding: 0\.35rem 0;/
    )
    expect(articleStyle).toMatch(
      /\.cl-article-origin \{[^}]*padding-block: 0\.35rem;/
    )
  })

  test('悬停才长出 1px 细线，默认态不加底色与边框', () => {
    expect(articleStyle).toMatch(
      /#theme-circlelife \.cl-article-back::after,\s*#theme-circlelife \.cl-article-origin::after \{[^}]*height: 1px/
    )
    expect(articleStyle).toMatch(
      /#theme-circlelife \.cl-article-back:hover::after,\s*#theme-circlelife \.cl-article-origin:hover::after \{[^}]*transform: scaleX\(1\)/
    )
  })

  test('侧栏「目录」标题单独放大，目录条目不受影响', () => {
    expect(articleStyle).toMatch(
      /#theme-circlelife\.cl-is-article \.cl-article-rail > \.cl-sidebar-title,[\s\S]*?font-size: 0\.8125rem/
    )
    expect(articleStyle).toMatch(
      /#theme-circlelife\.cl-article-card-mode \.cl-toc-card--desktop > \.cl-sidebar-title/
    )
  })

  test('正文仍走 --cl-prose-size，不随操作文字放大', () => {
    expect(articleStyle).toContain('font-size: var(--cl-prose-size)')
  })
})
