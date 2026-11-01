/**
 * 首页精选影集段契约测试（01 接触印相）
 *
 * 数据：只显示 Notion「精选」勾选的影集，上限 4 辑，**不补齐**；0 辑整段隐藏。
 * 版面：右 480 主封面 + 左 620 索引，与文章段的「图 480 左 / 文 620 右」镜像；
 *      1 辑居中、2–3 辑索引靠上、4 辑索引均分主封面高度。
 *
 * 这里守五类容易悄悄坏掉的东西：
 *
 * 1. 数据拆分纯函数 buildAlbumView（0–4 辑 / 空值过滤）
 * 2. 数据层不补齐、只截断勾选；上限默认 4
 * 3. 组件纯静态：无 hooks、无 scroll 监听、无 sticky / JS 换挡
 * 4. 标题层级：首页已有 h1（照片墙题字），本段必须是 h2
 * 5. Notion 数据链路：checkbox 解析 → 白名单不被剥掉 → featured 映射
 */
import fs from 'fs'
import path from 'path'
import { TextDecoder, TextEncoder } from 'util'
import { createElement } from 'react'

// jest 的 node 环境不一定暴露 TextEncoder；react-dom/server 需要它
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
const { renderToStaticMarkup } = require('react-dom/server')

// notion-utils / notion-client 是 ESM 包，jest 的 transformIgnorePatterns 放行不了
// （与既有测试套件一致的约束：不改动 jest.config.js）。
// 这里用与真实实现同语义的桩替换，只为能真正跑一遍 getPageProperties 的解析分支。
jest.mock('notion-utils', () => {
  const getTextContent = val => {
    if (!Array.isArray(val)) return val
    return val
      .map(el => {
        if (!el) return ''
        if (typeof el === 'string') return el
        if (Array.isArray(el)) return getTextContent(el)
        return el.plain_text || ''
      })
      .join('')
  }
  return {
    __esModule: true,
    getTextContent,
    getDateValue: () => ({ start_date: null, end_date: null, time_zone: null }),
    idToUuid: id => id
  }
})

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: { getUsers: jest.fn(async () => ({})) },
  notionAPI: { getUsers: jest.fn(async () => ({})) }
}))

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const {
  buildAlbumView,
  isFeaturedAlbum,
  isFeaturedEntry
} = require('../../../themes/circlelife/components/homeAlbumData')
const { homeStyle } = require('../../../themes/circlelife/styles/home')
const HomeAlbumShowcase =
  require('../../../themes/circlelife/components/HomeAlbumShowcase').default

const showcaseSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeAlbumShowcase.js'
)
const dataSource = readFile(
  'themes',
  'circlelife',
  'components',
  'homeAlbumData.js'
)
const pagesIndexSource = readFile('pages', 'index.js')
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const themeConfigSource = readFile('themes', 'circlelife', 'config.js')
const tokensSource = readFile('themes', 'circlelife', 'styles', 'tokens.js')
const siteDataSource = readFile('lib', 'db', 'SiteDataApi.js')
const notionConfigSource = readFile('conf', 'notion.config.js')

/** 新增样式块（首页精选影集段）的 CSS 片段 */
const ALBUM_STYLE_MARKER = '/* —— 首页精选影集段'
const albumStyleStart = homeStyle.indexOf(ALBUM_STYLE_MARKER)
const albumStyle = albumStyleStart >= 0 ? homeStyle.slice(albumStyleStart) : ''

/** 移动端断点下的样式片段（≤1023px 媒体查询到最后） */
const mobileStyle = albumStyle.includes('@media (max-width: 1023px)')
  ? albumStyle.slice(albumStyle.indexOf('@media (max-width: 1023px)'))
  : ''

/** 会破坏包含块的属性（本段不应出现） */
const CONTAINING_BLOCK_RE =
  /(^|;)\s*(transform|filter|backdrop-filter|perspective|contain|will-change)\s*:/

const albums = [
  { id: 'a', name: '崂山道士', count: 11, date: '2026-3-31', href: '/a' },
  { id: 'b', name: '在思绪中漂泊', count: 12, date: '2025-11-13', href: '/b' },
  { id: 'c', name: '重逢吴哥窟', count: 9, date: '2025-9-29', href: '/c' },
  { id: 'd', name: '巧合', count: 11, date: '2025-7-28', href: '/d' }
]

const renderAlbums = list =>
  renderToStaticMarkup(createElement(HomeAlbumShowcase, { albums: list }))

describe('circlelife 首页精选影集段（01 接触印相）', () => {
  describe('buildAlbumView（纯数据拆分）', () => {
    test('0 辑：没有主封面，也不再渲染索引', () => {
      expect(buildAlbumView([])).toEqual({
        hero: null,
        rest: [],
        total: 0,
        count: 0
      })
      expect(buildAlbumView()).toEqual({
        hero: null,
        rest: [],
        total: 0,
        count: 0
      })
    })

    test('1 辑：只有主封面，索引为空', () => {
      const view = buildAlbumView([albums[0]])
      expect(view.hero).toBe(albums[0])
      expect(view.rest).toEqual([])
      expect(view.count).toBe(1)
      expect(view.total).toBe(11)
    })

    test('4 辑：第一项为主封面，其余 3 项进索引，张数求和', () => {
      const view = buildAlbumView(albums)
      expect(view.hero).toBe(albums[0])
      expect(view.rest).toEqual(albums.slice(1))
      expect(view.count).toBe(4)
      expect(view.total).toBe(43)
    })

    test('空值被过滤，不破坏主封面/索引', () => {
      const view = buildAlbumView([null, albums[0], undefined, albums[1]])
      expect(view.hero).toBe(albums[0])
      expect(view.rest).toEqual([albums[1]])
      expect(view.count).toBe(2)
    })
  })

  describe('渲染契约（0–4 辑 DOM）', () => {
    test('0 辑不渲染', () => {
      expect(renderAlbums([])).toBe('')
    })

    test('1 辑：主封面居中，无索引', () => {
      const html = renderAlbums([albums[0]])
      expect(html).toContain('data-count="1"')
      expect(html).toContain('aria-label="精选影集"')
      expect(html).toContain('cl-home-album-hero')
      expect(html).toContain('崂山道士')
      expect(html).not.toContain('<ol')
      expect(html.match(/<a /g) || []).toHaveLength(1)
      expect(html.match(/<h2/g) || []).toHaveLength(1)
      expect(html).toMatch(/cl-home-album-count[^>]*>01/)
    })

    test('2 辑：1 行索引 + 2 个链接，序号从 02 起', () => {
      const html = renderAlbums(albums.slice(0, 2))
      expect(html).toContain('data-count="2"')
      expect(html).toContain('<ol class="cl-home-album-index" start="2">')
      expect(html.match(/<li>/g) || []).toHaveLength(1)
      expect(html.match(/<a /g) || []).toHaveLength(2)
      expect(html.match(/<h2/g) || []).toHaveLength(2)
      expect(html).toContain('02')
    })

    test('4 辑：主封面 + 3 行索引，4 个链接，总数 43', () => {
      const html = renderAlbums(albums)
      expect(html).toContain('data-count="4"')
      expect(html.match(/<li>/g) || []).toHaveLength(3)
      expect(html.match(/<a /g) || []).toHaveLength(4)
      expect(html.match(/<h2/g) || []).toHaveLength(4)
      ;['崂山道士', '在思绪中漂泊', '重逢吴哥窟', '巧合'].forEach(name => {
        expect(html).toContain(name)
      })
      expect(html).toContain('43')
      expect(html.indexOf('崂山道士')).toBeLessThan(
        html.indexOf('在思绪中漂泊')
      )
    })

    test('装饰件不出声、无 summary、标题层级 h1→h2', () => {
      const html = renderAlbums(albums)
      expect(html).toContain('aria-hidden="true"')
      expect(html).not.toContain('summary')
      expect(html).not.toContain('<h1')
      expect(html).not.toContain('<h3')
    })
  })

  describe('精选判定（兼容 Checkbox 与 Select 降级形态）', () => {
    test('布尔值（Notion Checkbox 解析结果）', () => {
      expect(isFeaturedEntry({ featured: true })).toBe(true)
      expect(isFeaturedEntry({ featured: false })).toBe(false)
    })

    test('Select / MultiSelect 降级形态（数组或字符串）', () => {
      expect(isFeaturedEntry({ featured: ['精选'] })).toBe(true)
      expect(isFeaturedEntry({ featured: ['日常'] })).toBe(false)
      expect(isFeaturedEntry({ featured: '精选' })).toBe(true)
      expect(isFeaturedEntry({ featured: '日常' })).toBe(false)
    })

    test('列不存在 / 非法值 → 视为未标记（不报错）', () => {
      expect(isFeaturedEntry({})).toBe(false)
      expect(isFeaturedEntry(null)).toBe(false)
      expect(isFeaturedEntry({ featured: undefined })).toBe(false)
    })

    test('isFeaturedAlbum 与 isFeaturedEntry 同语义', () => {
      expect(isFeaturedAlbum).toBe(isFeaturedEntry)
      expect(isFeaturedAlbum({ featured: true })).toBe(true)
    })
  })

  describe('数据层：只显示勾选、上限 4、不补齐', () => {
    test('排序口径 = 勾选 → 日期倒序 → 截断上限；没有任何补齐分支', () => {
      expect(pagesIndexSource).toContain('.filter(isFeaturedAlbum)')
      expect(pagesIndexSource).toContain('.sort(byDateDesc)')
      expect(pagesIndexSource).toContain('.slice(0, homeAlbumCount)')
      expect(pagesIndexSource).not.toContain('restPages')
      expect(pagesIndexSource).not.toContain(
        '[...featuredPages, ...restPages]'
      )
    })

    test('上限沿用 CIRCLELIFE_HOME_ALBUM_COUNT，硬上限 4', () => {
      expect(pagesIndexSource).toContain('HOME_ALBUM_LIMIT = 4')
      expect(pagesIndexSource).toContain('CIRCLELIFE_HOME_ALBUM_COUNT')
      expect(pagesIndexSource).toMatch(/Math\.min\(\s*HOME_ALBUM_LIMIT,/)
      expect(pagesIndexSource).toMatch(
        /siteConfig\(\s*'CIRCLELIFE_HOME_ALBUM_COUNT',\s*HOME_ALBUM_LIMIT/
      )
      expect(themeConfigSource).toMatch(/CIRCLELIFE_HOME_ALBUM_COUNT:\s*4/)
      expect(themeConfigSource).toContain('CIRCLELIFE_HOME_ALBUM_SHOWCASE')
      expect(themeConfigSource).toContain('CIRCLELIFE_ALBUM_FETCH_BATCH')
    })

    test('0 勾选 → homeAlbums 为空；主题只在有数据时挂载组件', () => {
      expect(pagesIndexSource).toContain('props.homeAlbums = homeAlbums')
      expect(themeIndexSource).toContain('props.homeAlbums.length > 0')
      expect(showcaseSource).toContain('if (!albums.length) return null')
    })

    test('homeAlbums 只下发封面 + 张数/日期，不下发正文图数组/摘要', () => {
      expect(pagesIndexSource).not.toContain('props.photoDecks')
      expect(pagesIndexSource).toContain('props.homeAlbums')
      const albumBlock = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const homeAlbums = []'),
        pagesIndexSource.indexOf('props.homeAlbums = homeAlbums')
      )
      expect(albumBlock).toContain(
        'cover: { src: buildSizedSource(cover.url, 1024) }'
      )
      expect(albumBlock).not.toContain('summary')
      expect(albumBlock).not.toContain('srcSet')
      expect(albumBlock).not.toContain('featured:')
      expect(pagesIndexSource).not.toMatch(/images\s*:\s*images/)
    })
  })

  describe('组件：纯静态 01 接触印相', () => {
    test('没有 hooks / 监听 / 滚动驱动', () => {
      ;[
        'useState',
        'useEffect',
        'useRef',
        'useCallback',
        'addEventListener',
        'requestAnimationFrame',
        'IntersectionObserver',
        'setTimeout',
        'position: sticky'
      ].forEach(token => {
        expect(showcaseSource).not.toContain(token)
      })
    })

    test('不引入动画库；组件只依赖 CanvasImage 与数据拆分', () => {
      expect(showcaseSource).not.toMatch(/from\s+['"]gsap/)
      expect(showcaseSource).not.toContain('ScrollTrigger')
      expect(showcaseSource).not.toMatch(/from\s+['"]framer-motion/)
      expect(showcaseSource).not.toMatch(/from\s+['"]animejs/)
      expect(showcaseSource).not.toMatch(/from\s+['"]lenis/)
      const pkg = JSON.parse(readFile('package.json'))
      const deps = Object.keys(pkg.dependencies || {})
      expect(deps).not.toContain('framer-motion')
      expect(deps).not.toContain('animejs')
      expect(deps).not.toContain('@studio-freight/lenis')
    })

    test('section 用 aria-label 命名、data-count 驱动少辑排版', () => {
      expect(showcaseSource).toContain("className='cl-home-album'")
      expect(showcaseSource).toContain('data-count={count}')
      expect(showcaseSource).toContain("aria-label='精选影集'")
      expect(showcaseSource).not.toContain('<h1')
      expect(showcaseSource).not.toContain('<h3')
      expect(showcaseSource).not.toContain('<header')
    })

    test('眉题 + 计数：精选影集 / NN 辑 · MM 张', () => {
      expect(showcaseSource).toContain(
        "className='cl-home-album-kicker'>精选影集</p>"
      )
      expect(showcaseSource).toContain('{pad(count)} 辑 · {total} 张')
      expect(showcaseSource).toContain('String(n).padStart(2')
    })

    test('主封面是一个链接：封面 + 序号/张数/日期 + h2 + CTA', () => {
      expect(showcaseSource).toContain("className='cl-home-album-hero'")
      expect(showcaseSource).toContain('href={hero.href}')
      expect(showcaseSource).toContain("className='cl-home-album-cover'")
      expect(showcaseSource).toContain('cl-home-album-hero-name')
      expect(showcaseSource).toContain("className='cl-home-album-cta'")
      // CTA 是 span，不是第二个链接
      expect(showcaseSource).toContain(
        "<span className='cl-home-album-cta'>"
      )
      expect(showcaseSource).toContain('<h2')
    })

    test('索引 02–04：每辑一个链接，行内含缩略图、序号、h2、右缘箭头', () => {
      expect(showcaseSource).toContain("className='cl-home-album-index'")
      expect(showcaseSource).toContain('start={2}')
      expect(showcaseSource).toContain('rest.map')
      expect(showcaseSource).toContain("className='cl-home-album-row'")
      expect(showcaseSource).toContain('href={album.href}')
      expect(showcaseSource).toContain("className='cl-home-album-thumb'")
      expect(showcaseSource).toContain('cl-home-album-row-name')
      expect(showcaseSource).toContain("className='cl-home-album-arrow'")
      expect(showcaseSource).toContain("aria-hidden='true'")
      expect(showcaseSource).toContain('rest.length > 0')
    })

    test('封面仍走 CanvasImage，不恢复 srcSet / eager', () => {
      expect(showcaseSource).toContain("from './CanvasImage'")
      expect(showcaseSource).toContain("position='center'")
      expect(showcaseSource).not.toContain('srcSet=')
      expect(showcaseSource).not.toContain('sizes=')
      expect(showcaseSource).not.toContain('eager=')
    })

    test('空 summary 不占位；没有「当前项」语义（aria-current 已下线）', () => {
      expect(showcaseSource).not.toContain('summary')
      expect(showcaseSource).not.toContain('aria-current')
    })
  })

  describe('样式：480 / 620 镜像 + 1–4 辑退化', () => {
    test('影集段存在，token 只在段内（索引列复用文章文字栏宽）', () => {
      expect(albumStyle.length).toBeGreaterThan(0)
      expect(albumStyle).toContain('--cl-home-album-hero-w: 480px;')
      expect(albumStyle).toContain(
        '--cl-home-album-index-w: var(--cl-home-article-measure);'
      )
      expect(albumStyle).toContain(
        '--cl-home-album-thumb-w: clamp(96px, 8vw, 128px);'
      )
    })

    test('主体是 620 / 480 两列，贴左右缘，主封面在第 2 列', () => {
      expect(albumStyle).toContain(
        'minmax(0, var(--cl-home-album-index-w))'
      )
      expect(albumStyle).toContain(
        'minmax(0, var(--cl-home-album-hero-w))'
      )
      expect(albumStyle).toMatch(
        /\.cl-home-album-body \{[^}]*justify-content: space-between;/
      )
      expect(albumStyle).toMatch(
        /\.cl-home-album-hero \{[^}]*grid-column: 2;/
      )
      expect(albumStyle).toMatch(
        /\.cl-home-album-index \{[^}]*grid-column: 1;/
      )
    })

    test('4:5 封面 + 直角纪律：用 media radius，不加白框/阴影', () => {
      expect(albumStyle).toContain('aspect-ratio: 4 / 5;')
      expect(albumStyle).toContain(
        'border-radius: var(--cl-media-radius);'
      )
      expect(albumStyle).not.toContain('box-shadow')
    })

    test('4 辑索引均分主封面高度；2–3 辑自然高度靠上；1 辑居中', () => {
      expect(albumStyle).toMatch(
        /\.cl-home-album-index \{[^}]*grid-auto-rows: 1fr;/
      )
      expect(albumStyle).toContain(
        "#theme-circlelife .cl-home-album[data-count='2'] .cl-home-album-index"
      )
      expect(albumStyle).toContain(
        "#theme-circlelife .cl-home-album[data-count='3'] .cl-home-album-index"
      )
      const twoThree = albumStyle.slice(
        albumStyle.indexOf("[data-count='2']")
      )
      expect(twoThree).toContain('grid-auto-rows: auto;')
      expect(twoThree).toContain('align-content: start;')
      expect(albumStyle).toContain(
        "#theme-circlelife .cl-home-album[data-count='1'] .cl-home-album-body"
      )
      expect(albumStyle).toContain(
        'grid-template-columns: minmax(0, var(--cl-home-album-hero-w));'
      )
      expect(albumStyle).toContain('justify-content: center;')
    })

    test('手机：主封面 100vw 满幅出血、方角；索引自然高度', () => {
      expect(mobileStyle).toContain('width: 100vw;')
      expect(mobileStyle).toContain(
        'margin-inline: calc(-1 * var(--cl-wide-pad));'
      )
      expect(mobileStyle).toContain('border-radius: 0;')
      expect(mobileStyle).toMatch(
        /\.cl-home-album-row \{[^}]*clamp\(96px, 34vw, 128px\)/
      )
      expect(mobileStyle).toMatch(
        /\.cl-home-album-index \{[^}]*grid-auto-rows: auto;/
      )
    })

    test('hover / focus 只动颜色（箭头 2px 位移是唯一 transform）', () => {
      expect(albumStyle).toContain('color: var(--cl-accent);')
      expect(albumStyle).toContain('outline: 2px solid var(--cl-accent);')
      const transforms = albumStyle.match(/transform\s*:/g) || []
      expect(transforms).toHaveLength(1)
      expect(albumStyle).toContain('transform: translateX(2px);')
      expect(albumStyle).not.toContain('scale(')
    })

    test('没有 sticky / will-change / mask-image / 包含块属性 / 动画', () => {
      expect(albumStyle).not.toContain('position: sticky')
      expect(albumStyle).not.toContain('will-change')
      expect(albumStyle).not.toContain('mask-image')
      expect(albumStyle).not.toContain('@keyframes')
      expect(albumStyle).not.toContain('animation:')
      const sectionRule = albumStyle.match(
        /#theme-circlelife \.cl-home-album \{([\s\S]*?)\n      \}/
      )
      expect(sectionRule).not.toBeNull()
      expect(sectionRule[1]).not.toMatch(CONTAINING_BLOCK_RE)
    })

    test('新增样式不硬编码色值，一律走 --cl-* token', () => {
      expect(albumStyle).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(albumStyle).toContain('var(--cl-accent)')
      expect(albumStyle).toContain('var(--cl-muted)')
      expect(albumStyle).not.toContain('--cl-vermilion')
    })

    test('旧的取景框 / sticky / 回顶压制全部下线', () => {
      ;[
        '--cl-home-album-step',
        '--cl-home-album-sweep',
        '--cl-home-album-window',
        '--cl-home-album-focus',
        '--cl-home-album-ink',
        '--cl-home-album-scrim',
        '--cl-home-album-switch',
        'cl-home-album-active',
        'cl-home-album-viewport',
        'cl-home-album-panel',
        'cl-home-album-stage',
        'cl-home-album-reel'
      ].forEach(token => {
        expect(albumStyle).not.toContain(token)
        expect(showcaseSource).not.toContain(token)
      })
      expect(tokensSource).not.toContain('--cl-home-album-ink')
      expect(tokensSource).not.toContain('--cl-home-album-scrim')
      expect(tokensSource).not.toContain('--cl-home-album-window')
      expect(tokensSource).not.toContain('--cl-home-album-focus-line')
      expect(tokensSource).not.toContain('--cl-home-album-switch')
      // 回顶键在首页（含影集段）纯 CSS 压制，不再靠 JS 状态类
      expect(homeStyle).not.toContain('cl-home-album-active')
      expect(homeStyle).toContain(
        'html:has(.cl-home-album) #theme-circlelife .cl-backtop.is-visible'
      )
      expect(homeStyle).toContain('html.cl-home-hero-active')
      expect(homeStyle).toContain('html.cl-home-article-active')
    })
  })

  describe('接入与配置', () => {
    test('挂在照片墙与文章段之后，且只在首页、有数据时渲染', () => {
      const wallAt = themeIndexSource.indexOf('<HomeTiltWall')
      const articleAt = themeIndexSource.indexOf('<HomeArticleStage')
      const albumAt = themeIndexSource.indexOf('<HomeAlbumShowcase')
      expect(wallAt).toBeGreaterThan(-1)
      expect(articleAt).toBeGreaterThan(wallAt)
      expect(albumAt).toBeGreaterThan(articleAt)
      expect(themeIndexSource).toContain("router.pathname === '/'")
      expect(themeIndexSource).toContain('CIRCLELIFE_HOME_ALBUM_SHOWCASE')
      expect(themeIndexSource).toMatch(
        /<HomeAlbumShowcase albums=\{props\.homeAlbums\} \/>/
      )
    })

    test('数据模块已改名，页面不再引用旧的焦点数学', () => {
      expect(dataSource).toContain('export function buildAlbumView')
      expect(dataSource).toContain('export const isFeaturedAlbum')
      expect(pagesIndexSource).toContain('components/homeAlbumData')
      expect(pagesIndexSource).not.toContain('homeAlbumFocus')
      expect(showcaseSource).toContain("from './homeAlbumData'")
    })
  })

  describe('Notion 数据链路', () => {
    test('属性名映射新增 featured → 精选', () => {
      expect(notionConfigSource).toContain('featured')
      expect(notionConfigSource).toContain("'精选'")
    })

    test('getPageProperties 支持 checkbox 并产出真正的布尔值', async () => {
      const { default: getPageProperties } = require('../../../lib/db/notion/getPageProperties')
      const value = {
        properties: { 'hOG~': [['Yes']] },
        created_time: '2026-01-01T00:00:00.000Z',
        last_edited_time: '2026-01-01T00:00:00.000Z',
        format: {},
        content: []
      }
      const schema = { 'hOG~': { name: '精选', type: 'checkbox' } }
      const props = await getPageProperties('page-id', value, schema, null, [])
      expect(props['精选']).toBe(true)
      expect(props.featured).toBe(true)
    })

    test('未勾选的 checkbox 必须是 false（不能是 truthy 字符串）', async () => {
      const { default: getPageProperties } = require('../../../lib/db/notion/getPageProperties')
      const value = {
        properties: { 'hOG~': [['No']] },
        created_time: '2026-01-01T00:00:00.000Z',
        last_edited_time: '2026-01-01T00:00:00.000Z',
        format: {},
        content: []
      }
      const schema = { 'hOG~': { name: '精选', type: 'checkbox' } }
      const props = await getPageProperties('page-id', value, schema, null, [])
      expect(props['精选']).toBe(false)
      expect(props.featured).toBeFalsy()
    })

    test('白名单含 featured / 精选（否则字段会被静默剥掉）', () => {
      const block = siteDataSource.match(
        /CLIENT_POST_SUMMARY_FIELDS\s*=\s*\[([\s\S]*?)\]/
      )
      expect(block).not.toBeNull()
      expect(block[1]).toContain("'featured'")
      expect(block[1]).toContain("'精选'")
    })
  })
})
