/**
 * 文章封面取景契约（横幅焦点 + 首页单独封面）
 *
 * 背景（2026-10 实测）：
 *  · 同一张 Notion 封面要服务两处：文章页横幅是 3:1 长条（主用途）、
 *    首页精选图版是 3:4 竖框（次要）—— 一张图在两个宽高比里必然被裁成两种取景。
 *  · 站内裁切原本纯在 CSS 且焦点写死 center，Notion 自带的裁剪焦点被整个丢弃
 *    → 「在 Notion 里拖了头图却没反应」。
 *  · Notion 的裁剪焦点就在 v3 原始响应的 format.page_cover_position（0..1），
 *    语义与 CSS object-position 的 y 分量一致。
 *  · 一个焦点服务不了两个宽高比 → 首页另设「首页封面」列（3:4 成品图），
 *    横幅继续用页面封面，两处彻底解耦。
 */
import fs from 'fs'
import path from 'path'

// notion-utils 是 ESM 包，jest 的 transformIgnorePatterns 放行不了
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

const pagesIndexSource = readFile('pages', 'index.js')
const siteDataSource = readFile('lib', 'db', 'SiteDataApi.js')
const notionConfigSource = readFile('conf', 'notion.config.js')
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const stageSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeArticleStage.js'
)

const { default: getPageProperties } = require('../../../lib/db/notion/getPageProperties')

/** 造一个最小的 page block（getPageProperties 只用到这几个字段） */
const makeValue = (props = {}, format = {}) => ({
  id: 'page-id',
  properties: props,
  format,
  created_time: '2026-01-01T00:00:00.000Z',
  last_edited_time: '2026-01-01T00:00:00.000Z',
  content: []
})

describe('文章封面取景：Notion 裁剪焦点 + 首页单独封面', () => {
  describe('① Notion 自带的裁剪焦点（page_cover_position）', () => {
    test('从 value.format.page_cover_position 读出，缺省 0.5', async () => {
      const schema = {}
      const withPos = await getPageProperties(
        'page-id',
        makeValue({}, { page_cover_position: 0.6 }),
        schema,
        null,
        []
      )
      expect(withPos.pageCoverPosition).toBe(0.6)

      const withoutPos = await getPageProperties(
        'page-id',
        makeValue({}, {}),
        schema,
        null,
        []
      )
      expect(withoutPos.pageCoverPosition).toBe(0.5)
    })

    test('越界值夹到 [0,1]（脏数据不让它把取景推到框外）', async () => {
      const schema = {}
      const high = await getPageProperties(
        'page-id',
        makeValue({}, { page_cover_position: 1.8 }),
        schema,
        null,
        []
      )
      expect(high.pageCoverPosition).toBe(1)

      const low = await getPageProperties(
        'page-id',
        makeValue({}, { page_cover_position: -0.4 }),
        schema,
        null,
        []
      )
      expect(low.pageCoverPosition).toBe(0)
    })

    test('横幅与图版都按焦点定位（横幅用内联 objectPosition，图版用 canvas 的 position）', () => {
      // 文章页横幅：仍是 <img>，内联 objectPosition 覆盖样式里的 center
      expect(themeIndexSource).toContain('post.pageCoverPosition ?? 0.5')
      expect(themeIndexSource).toContain('objectPosition')
      // 首页图版：已改 canvas（不进 LCP 候选）→ 焦点改由 canvas 的 position 传入
      expect(stageSource).toContain('article.cover.pos ?? 0.5')
      expect(stageSource).toContain('position={`50% ${(article.cover.pos ?? 0.5) * 100}%`}')
      expect(stageSource).not.toContain('objectPosition')
    })
  })

  describe('② 首页单独封面（files 属性）', () => {
    // v3 的类型名是 'file'（官方 API 是 'files'）—— 实测：Notion DDL
    // ADD COLUMN "首页封面" FILES 建出来的列，其 schema type 是 "file"。
    const schema = { 'aBc~': { name: '首页封面', type: 'file' } }

    test('files 属性必须单独取地址（通用文本分支只能拿到文件名）', async () => {
      const src = 'https://prod-files-secure.s3.us-west-2.amazonaws.com/home.jpg'
      // v3 的一种形状：[[文件名, [类型, { url }]]]
      const props = await getPageProperties(
        'page-id',
        makeValue({ 'aBc~': [['home.jpg', ['file', { url: src }]]] }),
        schema,
        null,
        []
      )
      expect(props['首页封面']).toBeTruthy()
      // 必须过 Notion 代理（重新签名 + width 档位）：直链带 exp/sig 会过期
      expect(props['首页封面']).toContain(encodeURIComponent(src))
    })

    test('形状无关：attachment: 形式与官方 API 形状都能取到', async () => {
      const attached = await getPageProperties(
        'page-id',
        makeValue({ 'aBc~': [['attachment:abc-123:home.jpg']] }),
        schema,
        null,
        []
      )
      expect(attached['首页封面']).toContain(
        encodeURIComponent('attachment:abc-123:home.jpg')
      )

      const external = 'https://example.com/home.jpg'
      const official = await getPageProperties(
        'page-id',
        makeValue({
          'aBc~': [{ files: [{ name: 'home.jpg', type: 'external', external: { url: external } }] }]
        }),
        schema,
        null,
        []
      )
      expect(official['首页封面']).toContain(encodeURIComponent(external))
    })

    test('files 列为空时不产出地址（不得出现 undefined）', async () => {
      const props = await getPageProperties(
        'page-id',
        makeValue({ 'aBc~': [] }),
        schema,
        null,
        []
      )
      expect(props['首页封面']).toBe('')
    })

    test('官方 API 的类型名 files 同样被接住', async () => {
      const src = 'https://example.com/home.jpg'
      const props = await getPageProperties(
        'page-id',
        makeValue({
          'aBc~': [{ files: [{ name: 'home.jpg', type: 'external', external: { url: src } }] }]
        }),
        { 'aBc~': { name: '首页封面', type: 'files' } },
        null,
        []
      )
      expect(props['首页封面']).toContain(encodeURIComponent(src))
    })

    test('列名映射 + 客户端白名单都放行', () => {
      expect(notionConfigSource).toContain('homeCover:')
      expect(notionConfigSource).toContain('首页封面')
      expect(siteDataSource).toContain("'homeCover'")
      expect(siteDataSource).toContain("'首页封面'")
      expect(siteDataSource).toContain("'pageCoverPosition'")
    })
  })

  describe('③ 首页图版的图源优先级与焦点归属', () => {
    test('优先「首页封面」，否则回落页面封面', () => {
      expect(pagesIndexSource).toContain('p.homeCover')
      expect(pagesIndexSource).toContain('p.pageCover || p.pageCoverThumbnail')
      // 有独立封面时焦点归零（3:4 成品图居中），没有时才用 Notion 焦点
      expect(pagesIndexSource).toContain('fromHome ? 0.5 : (p.pageCoverPosition ?? 0.5)')
    })

    test('图版尺寸不变（3:4 盒 + 512/1024 两档）—— 首页流量不受影响', () => {
      expect(pagesIndexSource).toContain('widths: [512, 1024]')
      // 3:4 的比例声明在样式片段里（上传 1024×1365 成品图 → 盒内裁切无损）
      const homeArticlesStyle = readFile(
        'themes',
        'circlelife',
        'styles',
        'homeArticles.js'
      )
      expect(homeArticlesStyle).toContain('aspect-ratio: 3 / 4')
    })
  })
})
