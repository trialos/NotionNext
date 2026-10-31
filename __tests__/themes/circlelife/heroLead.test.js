/**
 * 序言导语契约测试（关于页）
 *
 * 关于页的 summary 做短题眼、description 做导语；导语不折叠/不内部滚动，
 * 宽度走共享的 --cl-hero-* token。影集阅读器的题眼/小序由
 * albumReaderData.test.js 单独覆盖。
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const aboutSource = readFile(
  'themes',
  'circlelife',
  'components',
  'InfiniteAboutGrid.js'
)
const layoutAboutSource = readFile(
  'themes',
  'circlelife',
  'components',
  'LayoutAbout.js'
)
const aboutPageSource = readFile('pages', 'about', 'index.js')
const aboutStyleSource = readFile('themes', 'circlelife', 'styles', 'about.js')
const tokenSource = readFile('themes', 'circlelife', 'styles', 'tokens.js')
const styleSource = readFile('themes', 'circlelife', 'style.js')
const siteDataApiSource = readFile('lib', 'db', 'SiteDataApi.js')

function ruleOf(css, selector) {
  const start = css.indexOf(selector)
  if (start < 0) return null
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  return null
}

describe('circlelife 序言导语', () => {
  test('关于页把 aboutDescription 透传到序言组件', () => {
    expect(aboutPageSource).toContain('props.aboutDescription')
    expect(aboutPageSource).toContain('singleAboutPage?.description')
    expect(layoutAboutSource).toContain(
      'description={props.aboutDescription}'
    )
  })

  test('description 仍在客户端字段白名单里', () => {
    expect(siteDataApiSource).toMatch(
      /CLIENT_POST_SUMMARY_FIELDS[\s\S]*?'description'/
    )
  })

  test('关于页序言在标题后条件渲染，且提示在导语之后', () => {
    const lead = "{heroLead && <p className='cl-about-hero-lead'>{heroLead}</p>}"
    expect(aboutSource).toContain("import { resolveHeroCopy } from './heroCopy'")
    expect(aboutSource).toContain(lead)

    const aboutH1 = aboutSource.indexOf(
      "<h1 className='cl-about-hero-summary'>"
    )
    const aboutLead = aboutSource.indexOf(lead)
    const aboutHint = aboutSource.indexOf('cl-about-hero-hint-text')
    expect(aboutH1).toBeGreaterThan(-1)
    expect(aboutLead).toBeGreaterThan(aboutH1)
    expect(aboutHint).toBeGreaterThan(aboutLead)
  })

  test('关于页序言：衬线、左对齐、朱砂短规线，宽度仍走序言 token', () => {
    const scoped = ruleOf(
      aboutStyleSource,
      '#theme-circlelife.cl-is-about .cl-about-hero-lead'
    )
    expect(scoped).not.toBeNull()
    expect(scoped).toContain('font-family: var(--cl-font-display)')
    expect(scoped).toContain('text-align: left')
    expect(scoped).toContain('color: var(--cl-text)')
    expect(scoped).toContain('width: fit-content')
    expect(scoped).toContain('var(--cl-hero-lead-measure)')
    expect(scoped).toContain('var(--cl-hero-gutter)')
    expect(scoped).not.toMatch(/max-height|line-clamp|text-overflow/)
    expect(scoped).not.toMatch(/overflow\s*:\s*(auto|scroll|hidden)/)

    const rule = ruleOf(
      aboutStyleSource,
      '#theme-circlelife.cl-is-about .cl-about-hero-lead::before'
    )
    expect(rule).not.toBeNull()
    expect(rule).toContain('background: var(--cl-accent)')
  })

  test('关于页导语走正文 token，且不折叠/不内部滚动', () => {
    const leadRule = ruleOf(aboutStyleSource, '.cl-about-hero-lead')
    expect(leadRule).not.toBeNull()
    expect(leadRule).toContain('font-family: var(--cl-font-body)')
    expect(leadRule).toContain('font-size: var(--cl-prose-size)')
    expect(leadRule).toContain('line-height: var(--cl-prose-leading)')
    expect(leadRule).toContain('width: min(var(--cl-hero-lead-measure)')
    expect(leadRule).toContain('var(--cl-hero-gutter)')
    expect(leadRule).toContain('max-width: 100%')
    expect(leadRule).toContain('color: var(--cl-muted)')
    expect(leadRule).toContain('white-space: pre-line')
    expect(leadRule).not.toMatch(/max-height/)
    expect(leadRule).not.toMatch(/line-clamp/)
    expect(leadRule).not.toMatch(/text-overflow/)
    expect(leadRule).not.toMatch(/overflow\s*:\s*(auto|scroll|hidden)/)
  })

  test('导语测量宽与幕布留白有单一 token 来源', () => {
    expect(tokenSource).toContain('--cl-hero-lead-measure: 36rem')
    expect(tokenSource).toContain('--cl-hero-gutter: 24px')

    const overlayRule = ruleOf(aboutStyleSource, '.cl-about-hero-overlay')
    expect(overlayRule).not.toBeNull()
    expect(overlayRule).toContain('padding: 0 var(--cl-hero-gutter)')
  })

  test('about.js 在 albumReader.js 之后注入', () => {
    const albumAt = styleSource.indexOf('${albumReaderStyle}')
    const aboutAt = styleSource.indexOf('${aboutStyle}')
    expect(albumAt).toBeGreaterThan(-1)
    expect(aboutAt).toBeGreaterThan(albumAt)
  })
})
