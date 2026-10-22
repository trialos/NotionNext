/**
 * 页签标题契约测试
 *
 * 背景：浏览器页签标题由共享的 components/SEO.js 独占产出。此前有三处不对：
 *   ① 首页页签 = 「Circle of Life | Long Story Short」（站点标题+站点描述），不是品牌串；
 *   ② 关于页页签 = 「Circle of Life | loading」—— /about 没有 post 属性，落到
 *      getSEOMeta 的 default 兜底分支拼出「| loading」，还把主题 LayoutAbout 自己
 *      渲染的「关于 | Circle of Life」覆盖掉（实测晚 7ms 落地）；
 *   ③ 归档页页签 = 「归档 | Circle of Life」（locale.NAV.ARCHIVE 写死），与导航项
 *      「文章」、页内刊头「全部文章」三处命名打架。
 *
 * 另有一条硬约束：标题取值必须走 props.NOTION_CONFIG → BLOG，
 * **不能走 siteConfig**（服务端读不到 Notion/主题配置，会让 SSR 与客户端算出的
 * 标题不一致，页签在 hydration 后闪一下）。
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const blogConfigSource = readFile('blog.config.js')
const seoSource = readFile('components', 'SEO.js')
const BLOG = require('../../../blog.config')

describe('circlelife 页签标题', () => {
  describe('配置项', () => {
    test('blog.config.js 提供 HOME_TITLE / ARCHIVE_TITLE', () => {
      expect(blogConfigSource).toContain('HOME_TITLE:')
      expect(blogConfigSource).toContain('ARCHIVE_TITLE:')
    })

    test('HOME_TITLE = 时光的弧线|Circle of Life', () => {
      expect(BLOG.HOME_TITLE).toBe('时光的弧线|Circle of Life')
    })

    test('ARCHIVE_TITLE = 文章（与导航项同名）', () => {
      expect(BLOG.ARCHIVE_TITLE).toBe('文章')
    })
  })

  describe('取值来源必须两端一致', () => {
    test('走 props.NOTION_CONFIG → BLOG，不用 siteConfig', () => {
      expect(seoSource).toContain(
        'const titleOverride = (key, NOTION_CONFIG) =>'
      )
      expect(seoSource).toContain('NOTION_CONFIG?.[key] || BLOG?.[key]')
      // siteConfig 在服务端读不到 Notion/主题配置，用它会导致 SSR 与客户端标题不一致
      expect(seoSource).not.toContain("siteConfig('HOME_TITLE'")
      expect(seoSource).not.toContain("siteConfig('ARCHIVE_TITLE'")
    })

    test('SEO.js 引入了 blog.config', () => {
      expect(seoSource).toContain("import BLOG from '@/blog.config'")
    })
  })

  describe('各路由标题', () => {
    test('首页用 HOME_TITLE 覆盖', () => {
      expect(seoSource).toContain("titleOverride('HOME_TITLE', NOTION_CONFIG)")
      // 覆盖未配置时仍退回「站点标题 | 站点描述」
      expect(seoSource).toContain(
        '`${siteInfo?.title} | ${siteInfo?.description}`'
      )
    })

    test('归档页用 ARCHIVE_TITLE 覆盖', () => {
      expect(seoSource).toContain(
        "titleOverride('ARCHIVE_TITLE', NOTION_CONFIG)"
      )
      expect(seoSource).toContain(
        '`${locale.NAV.ARCHIVE} | ${siteInfo?.title}`'
      )
    })

    test('关于页有独立分支，标题不再落到 loading', () => {
      expect(seoSource).toContain("case '/about':")
      // 关于页标题取 props.aboutTitle，与主题 LayoutAbout 同源
      expect(seoSource).toContain('props.aboutTitle || locale.NAV.ABOUT')
      // 描述取主题的 aboutSummary，避免 og:description 两条内容打架
      expect(seoSource).toContain('props.aboutSummary')
    })

    test('default 分支仍保留 loading 兜底（其它无 post 路由仍需要）', () => {
      expect(seoSource).toContain('`${siteInfo?.title} | loading`')
    })
  })
})
