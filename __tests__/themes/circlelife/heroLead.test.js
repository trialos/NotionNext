/**
 * 序言导语契约测试
 *
 * 背景：关于页与影集序言共用 .cl-about-hero-summary。summary 必须继续做短题眼，
 * description 只做导语；导语不能折叠/内部滚动，宽度走 token。
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
const albumSource = readFile(
  'themes',
  'circlelife',
  'components',
  'AlbumInfiniteWall.js'
)
const albumUtilsSource = readFile(
  'themes',
  'circlelife',
  'components',
  'albumUtils.js'
)
const albumStageSource = readFile(
  'themes',
  'circlelife',
  'components',
  'AlbumStage.js'
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

  test('影集把 description 存在 deck 级并传给画廊', () => {
    expect(albumUtilsSource).not.toContain('p.summary || p.description')
    expect(albumUtilsSource).toContain('description: firstString(p.description)')
    expect(albumStageSource).toContain(
      "albumDescription={currentDeck?.description || ''}"
    )
  })

  test('影集 summary 为空时用影集名，徽标不重复影集名', () => {
    expect(albumSource).toContain('summary: albumSummary || albumName')
    expect(albumSource).toContain('showAlbumNameInBadge')
    expect(albumSource).toContain(
      "{showAlbumNameInBadge ? `影集 · ${albumName}` : '影集'}"
    )
  })

  test('description 仍在客户端字段白名单里', () => {
    expect(siteDataApiSource).toMatch(
      /CLIENT_POST_SUMMARY_FIELDS[\s\S]*?'description'/
    )
  })

  test('两个序言组件都在标题后条件渲染导语', () => {
    const lead = "{heroLead && <p className='cl-about-hero-lead'>{heroLead}</p>}"

    expect(aboutSource).toContain("import { resolveHeroCopy } from './heroCopy'")
    expect(albumSource).toContain("import { resolveHeroCopy } from './heroCopy'")
    expect(aboutSource).toContain(lead)
    expect(albumSource).toContain(lead)

    const aboutH1 = aboutSource.indexOf(
      "<h1 className='cl-about-hero-summary'>"
    )
    const aboutLead = aboutSource.indexOf(lead)
    const aboutHint = aboutSource.indexOf('cl-about-hero-hint-text')
    expect(aboutH1).toBeGreaterThan(-1)
    expect(aboutLead).toBeGreaterThan(aboutH1)
    expect(aboutHint).toBeGreaterThan(aboutLead)

    const albumH1 = albumSource.indexOf(
      "<h1 className='cl-about-hero-summary'>"
    )
    const albumLead = albumSource.indexOf(lead)
    const albumMeta = albumSource.indexOf('cl-album-hero-meta')
    expect(albumH1).toBeGreaterThan(-1)
    expect(albumLead).toBeGreaterThan(albumH1)
    expect(albumMeta).toBeGreaterThan(albumLead)
  })

  test('导语样式走正文 token，且不折叠/不内部滚动', () => {
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

  test('about.js 在 album.js 之后注入，共享类两页都生效', () => {
    const albumAt = styleSource.indexOf('${albumStyle}')
    const aboutAt = styleSource.indexOf('${aboutStyle}')
    expect(albumAt).toBeGreaterThan(-1)
    expect(aboutAt).toBeGreaterThan(albumAt)
  })
})
