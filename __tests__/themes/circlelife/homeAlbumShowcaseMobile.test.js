/**
 * 首页精选影集段 · 手机端 C 方案（对开书页）契约测试
 *
 * 博主定稿（2026-11-18，验收后由 A 方案改选 C）：
 * 1. 交互骨架与文章段同构：横向 snap 轨道、可点书页 tabs、sessionStorage 记住辑、
 *    键盘、aria-live；隐藏态不写 session、宽度变正重对齐（双形态共存边界）。
 * 2. 视觉是「书」：带相纸边的 4:5 印相 + 整卡链接（点标题即进影集）+
 *    朱砂页码签 01/04 + 一道细线 + 辑名；无 CTA / 张数 / 年份；不做 100vw 出血。
 * 3. 底部书页 tabs 等宽可点，不是文章段时间刻度尺；接触印相条已撤，
 *    数据层不再多带 frames。
 *
 * 桌面静态版（HomeAlbumShowcase.js）的「无 hooks」契约不在此处：它保持不变，
 * 由 homeAlbumShowcase.test.js 继续守；本文件只守手机组件与双形态挂载。
 */
import fs from 'fs'
import path from 'path'
import { TextDecoder, TextEncoder } from 'util'
import { createElement } from 'react'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
const { renderToStaticMarkup } = require('react-dom/server')

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const HomeAlbumShowcaseMobile =
  require('../../../themes/circlelife/components/HomeAlbumShowcaseMobile').default
const mobileSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeAlbumShowcaseMobile.js'
)
const pagesIndexSource = readFile('pages', 'index.js')
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const styleIndexSource = readFile('themes', 'circlelife', 'style.js')
const { homeAlbumMobileStyle } = require('../../../themes/circlelife/styles/homeAlbumMobile')

const render = list =>
  renderToStaticMarkup(
    createElement(HomeAlbumShowcaseMobile, { albums: list })
  )

const albums = [
  {
    id: 'a',
    name: '崂山道士',
    href: '/album?deck=a',
    count: 11,
    date: '2026-3-31',
    cover: { src: '/a.jpg' }
  },
  {
    id: 'b',
    name: '在思绪中漂泊',
    href: '/album?deck=b',
    count: 12,
    date: '2025-11-13',
    cover: { src: '/b.jpg' }
  }
]

describe('circlelife 首页精选影集 · 手机端 C 方案（对开书页）', () => {
  describe('渲染契约（0–2 辑 DOM）', () => {
    test('0 辑不渲染', () => {
      expect(render([])).toBe('')
    })

    test('section 有 aria-label、data-count，标题是 h2（首页 h1 归照片墙）', () => {
      const html = render(albums)
      expect(html).toContain('aria-label="精选影集"')
      expect(html).toContain('data-count="2"')
      expect(html).toContain('<h2')
      expect(html).not.toContain('<h1')
    })

    test('每辑一个 slide：印相 + 整卡链接 + 页码 + 一道细线 + 辑名', () => {
      const html = render(albums)
      expect((html.match(/cl-home-album-m-slide/g) || []).length).toBe(2)
      expect(html).toContain('cl-home-album-m-mat')
      expect(html).toContain('cl-home-album-m-cover')
      expect(html).toContain('cl-home-album-m-card')
      expect(html).toContain('01 / 02')
      expect(html).toContain('/album?deck=a')
      // 每张卡就是一个 <a>，点标题/卡片任意处都能进影集
      expect(html).toContain(
        'class="cl-home-album-m-card" href="/album?deck=a"'
      )
    })

    test('卡片简化：无 CTA、无张数/年份，只有页码签 + 细线 + 标题', () => {
      const html = render(albums)
      expect(html).not.toContain('翻开影集')
      expect(html).not.toContain('cl-home-album-m-cta')
      expect(html).not.toContain('cl-home-album-m-meta')
      expect(html).not.toContain('11 张')
      expect(html).not.toContain('2026-3-31')
      expect(mobileSource).not.toContain('albumMeta')
    })

    test('回到章页的入口只带 deck，不带 view=gallery', () => {
      const html = render(albums)
      expect(html).not.toContain('view=gallery')
    })

    test('接触印相条已撤：不渲染 frames / contact / frame', () => {
      const html = render(albums)
      expect(html).not.toContain('cl-home-album-m-contact')
      expect(html).not.toContain('cl-home-album-m-frame')
      expect(mobileSource).not.toContain('contactFrames')
      expect(mobileSource).not.toContain('album.frames')
    })
  })

  describe('确认①：交互骨架与文章段同构', () => {
    test('有 hooks：横向轨道、活动辑状态、sessionStorage 记忆、键盘、aria-live', () => {
      ;[
        'useState',
        'useEffect',
        'useRef',
        'useCallback',
        'cl-home-album-m-rail',
        'addEventListener',
        'IntersectionObserver',
        'sessionStorage',
        'onKeyDown',
        'aria-live'
      ].forEach(token => expect(mobileSource).toContain(token))
    })

    test('书页 tabs 等宽可点、当前页朱砂描边（不是时间刻度尺）', () => {
      expect(mobileSource).toContain('cl-home-album-m-tab')
      expect(mobileSource).toContain('onClick={() => goTo(index)}')
      expect(homeAlbumMobileStyle).toContain('cl-home-album-m-tabs')
      expect(homeAlbumMobileStyle).toContain('min-width: 44px;')
      expect(homeAlbumMobileStyle).toContain('.cl-home-album-m-tab.is-active')
      // A 方案的刻度尺语汇全部下线
      expect(mobileSource).not.toContain('computeRulerFraction')
      expect(mobileSource).not.toContain('ruler-axis')
      expect(homeAlbumMobileStyle).not.toContain('cl-home-album-m-cursor')
    })

    test('键盘 ←/→/Home/End 与 reduced-motion', () => {
      ;['ArrowLeft', 'ArrowRight', "'Home'", "'End'"].forEach(key => {
        expect(mobileSource).toContain(key)
      })
      expect(mobileSource).toContain('prefers-reduced-motion')
      expect(homeAlbumMobileStyle).toContain('prefers-reduced-motion')
    })

    test('滚动路径无 scroll/wheel/touchmove 劫持、无 sticky、无动画库', () => {
      expect(mobileSource).not.toContain("'scroll'")
      expect(mobileSource).not.toContain("'wheel'")
      expect(mobileSource).not.toContain("'touchmove'")
      expect(mobileSource).not.toMatch(/from\s+['"]gsap/)
      expect(mobileSource).not.toContain('ScrollTrigger')
      expect(homeAlbumMobileStyle).not.toContain('position: sticky')
      expect(homeAlbumMobileStyle).not.toContain('@keyframes')
    })

    test('图版宽度只在布局节点变化时算（resize / load / fonts），不进入滚动路径', () => {
      expect(mobileSource).toContain('resize')
      expect(mobileSource).toContain('load')
      expect(mobileSource).toContain('fonts')
      expect(mobileSource).toContain('--plate-w')
      expect(mobileSource).toContain('getBoundingClientRect')
    })

    test('卡片变矮后图版预算放大：系数 0.8、上限吃满 gutter', () => {
      expect(mobileSource).toContain('(available - cardH + 24) * 0.8')
      expect(mobileSource).toContain('containerW - 32')
    })

    test('持久化只在真实交互处（goTo / IO）显式写，隐藏态不写', () => {
      // 审计修复：不再用「active 变化 + 首帧跳过」effect（隐藏态会让守卫永不消费，
      // 切回手机后第一次真实滑动反被吞）。改为显式 persist，两个来源都调用。
      expect(mobileSource).not.toContain('didWriteRef')
      expect(mobileSource).not.toContain('didRestoreRef')
      const persistBlock = mobileSource.slice(
        mobileSource.indexOf('const persist = useCallback'),
        mobileSource.indexOf('// 图版宽度只在布局节点变化时算')
      )
      expect(persistBlock).toContain('!rail.clientWidth')
      expect(persistBlock).toContain('sessionStorage.setItem')
      // goTo 与 IO 两个真实变更点都落盘
      expect((mobileSource.match(/persist\(/g) || []).length).toBeGreaterThanOrEqual(2)
      // restore effect 只读不写
      const restoreBlock = mobileSource.slice(
        mobileSource.indexOf('从影集/其它页返回首页时恢复当前辑'),
        mobileSource.indexOf('// 原生横向轨道 → 活动辑')
      )
      expect(restoreBlock).toContain('sessionStorage.getItem')
      expect(restoreBlock).not.toContain('setItem')
    })

    test('宽度变正时按 activeIndex 重对齐轨道', () => {
      expect(mobileSource).toContain('railWidthRef')
      const layout = mobileSource.slice(
        mobileSource.indexOf('railWidthRef.current !== railW'),
        mobileSource.indexOf('const slides = rail.querySelectorAll')
      )
      expect(layout).toContain('activeRef.current * railW')
    })
  })

  describe('确认②：对开书页视觉（题签卡叠压 + 带边相纸）', () => {
    test('题签卡压在印相下缘：负 margin、普通文档流、不碰 transform', () => {
      expect(homeAlbumMobileStyle).toContain('margin: -2.2rem auto 0;')
      expect(homeAlbumMobileStyle).toContain('position: relative;')
      expect(homeAlbumMobileStyle).not.toMatch(/cl-home-album-m-card[\s\S]{0,200}transform\s*:/)
      // 卡片与相纸共用 --plate-w 基准，比相纸窄 2rem
      expect(homeAlbumMobileStyle).toContain('width: calc(var(--plate-w, 100%) - 2rem);')
    })

    test('朱砂页码签 01/04 贴在题签卡上缘', () => {
      expect(homeAlbumMobileStyle).toContain('cl-home-album-m-folio')
      expect(homeAlbumMobileStyle).toContain('background: var(--cl-accent);')
      expect(mobileSource).toContain('{pad(index + 1)} / {pad(count)}')
    })

    test('相纸收进 gutter、圆角走 token；不做 100vw 满幅出血', () => {
      expect(homeAlbumMobileStyle).toContain(
        'padding: var(--cl-home-section-pad) var(--cl-wide-pad)'
      )
      expect(homeAlbumMobileStyle).toContain('var(--cl-paper)')
      expect(homeAlbumMobileStyle).toContain('4 / 5')
      const plateBlock = homeAlbumMobileStyle.slice(
        homeAlbumMobileStyle.indexOf('.cl-home-album-m-plate'),
        homeAlbumMobileStyle.indexOf('.cl-home-album-m-mat')
      )
      expect(plateBlock).not.toContain('width: 100vw')
      expect(plateBlock).not.toContain('margin-inline: calc(-1')
    })

    test('数据层不再多带 frames：只下发封面 + 张数/日期', () => {
      const block = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const homeAlbums = []'),
        pagesIndexSource.indexOf('props.homeAlbums = homeAlbums')
      )
      expect(block).toContain(
        'cover: { src: buildSizedSource(cover.url, 1024) }'
      )
      expect(block).not.toContain('frames:')
      expect(block).not.toContain('images: images')
    })

    test('桌面静态版在手机隐藏，手机方案在桌面隐藏（断点二选一）', () => {
      expect(homeAlbumMobileStyle).toContain(
        '#theme-circlelife .cl-home-album-m { display: none; }'
      )
      expect(homeAlbumMobileStyle).toMatch(
        /@media \(max-width: 1023px\)[\s\S]*\.cl-home-album \{ display: none; \}/
      )
    })
  })

  describe('接入与样式注入', () => {
    test('两个形态同挂、kind 由 CSS 决定；样式在文章段之后注入', () => {
      expect(themeIndexSource).toContain('<HomeAlbumShowcaseMobile')
      expect(themeIndexSource).toContain('<HomeAlbumShowcase albums=')
      expect(themeIndexSource.indexOf('<HomeAlbumShowcase albums=')).toBeLessThan(
        themeIndexSource.indexOf('<HomeAlbumShowcaseMobile')
      )
      expect(styleIndexSource).toContain('homeAlbumMobileStyle')
      expect(styleIndexSource.indexOf('homeArticlesStyle')).toBeLessThan(
        styleIndexSource.indexOf('homeAlbumMobileStyle')
      )
    })

    test('样式不硬编码色值，一律走 --cl-* token', () => {
      expect(homeAlbumMobileStyle).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(homeAlbumMobileStyle).toContain('var(--cl-accent)')
    })
  })
})
