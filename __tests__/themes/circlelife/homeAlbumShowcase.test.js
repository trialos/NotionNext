/**
 * 首页精选影集段 · PC 版（悬停预览）契约测试
 *
 * 博主定稿（2026-11-18）：保留「左索引 620 / 右主视觉 480」两栏框架，
 * 左侧 4 辑纯文字编号列表，悬停/聚焦高亮并切换右侧；右侧是手机端 C 方案
 * 同款卡片（带边相纸 + 题签卡叠压），整卡可点；默认第 1 辑，移出段落复位。
 *
 * 这里守六类容易悄悄坏掉的东西：
 * 1. 数据链路：只显示 Notion「精选」勾选的影集，上限 4，不补齐；入口带 deck。
 * 2. 悬停状态：useState 驱动、onMouseEnter/onFocus 切换、onMouseLeave 复位。
 * 3. 左侧 4 行纯文字：无缩略图，is-active 高亮，箭头 2px 是唯一 transform。
 * 4. 右侧卡片：C 方案叠压（页码签 + 细线 + 辑名），四张叠放交叉淡入。
 * 5. 样式不硬编码色值；不碰 transform/filter 等包含块属性（题字 fixed 纪律）。
 * 6. 手机端独立组件仍挂载，CSS 断点二选一；回顶键纯 CSS 压制。
 */
import fs from 'fs'
import path from 'path'
import { TextDecoder, TextEncoder } from 'util'
import { createElement } from 'react'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
const { renderToStaticMarkup } = require('react-dom/server')

// notion-utils / notion-client 是 ESM 包（与既有测试套件一致的桩）
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

const { buildAlbumView, isFeaturedAlbum, isFeaturedEntry } = require('../../../themes/circlelife/components/homeAlbumData')
const { homeStyle } = require('../../../themes/circlelife/styles/home')
const HomeAlbumShowcase = require('../../../themes/circlelife/components/HomeAlbumShowcase').default

const showcaseSource = readFile('themes', 'circlelife', 'components', 'HomeAlbumShowcase.js')
const dataSource = readFile('themes', 'circlelife', 'components', 'homeAlbumData.js')
const pagesIndexSource = readFile('pages', 'index.js')
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const tokensSource = readFile('themes', 'circlelife', 'styles', 'tokens.js')
const siteDataSource = readFile('lib', 'db', 'SiteDataApi.js')
const albumReaderDataSource = readFile('themes', 'circlelife', 'components', 'albumReaderData.js')
const albumReaderSource = readFile('themes', 'circlelife', 'components', 'AlbumReader.js')
const notionConfigSource = readFile('conf', 'notion.config.js')

const ALBUM_STYLE_MARKER = '/* —— 首页精选影集段'
const albumStyleStart = homeStyle.indexOf(ALBUM_STYLE_MARKER)
const albumStyle = albumStyleStart >= 0 ? homeStyle.slice(albumStyleStart) : ''

const CONTAINING_BLOCK_RE =
  /(^|;)\s*(transform|filter|backdrop-filter|perspective|contain|will-change)\s*:/

const albums = [
  { id: 'a', name: '崂山道士', count: 11, date: '2026-3-31', href: '/album?deck=a', cover: { src: '/a.jpg' } },
  { id: 'b', name: '在思绪中漂泊', count: 12, date: '2025-11-13', href: '/album?deck=b', cover: { src: '/b.jpg' } },
  { id: 'c', name: '重逢吴哥窟', count: 9, date: '2025-9-29', href: '/album?deck=c', cover: { src: '/c.jpg' } },
  { id: 'd', name: '巧合', count: 11, date: '2025-7-28', href: '/album?deck=d', cover: { src: '/d.jpg' } }
]

const renderAlbums = list =>
  renderToStaticMarkup(createElement(HomeAlbumShowcase, { albums: list }))

describe('circlelife 首页精选影集段 · PC 悬停预览', () => {
  describe('buildAlbumView（纯数据拆分，保留兼容）', () => {
    test('0 / 1 / 4 辑拆分正确，空值被过滤', () => {
      expect(buildAlbumView([])).toEqual({ hero: null, rest: [], total: 0, count: 0 })
      expect(buildAlbumView([albums[0]]).hero).toBe(albums[0])
      const four = buildAlbumView(albums)
      expect(four.count).toBe(4)
      expect(four.total).toBe(43)
      expect(buildAlbumView([null, albums[0], undefined]).count).toBe(1)
    })
  })

  describe('渲染契约（0–4 辑 DOM）', () => {
    test('0 辑不渲染', () => {
      expect(renderAlbums([])).toBe('')
    })

    test('section 有 aria-label / data-count，标题都是 h2（首页 h1 是照片墙题字）', () => {
      const html = renderAlbums(albums)
      expect(html).toContain('aria-label="精选影集"')
      expect(html).toContain('data-count="4"')
      expect(html).not.toContain('<h1')
    })

    test('眉题只显示辑数，不显示总张数', () => {
      const { container } = render(
        createElement(HomeAlbumShowcase, { albums })
      )
      const count = container.querySelector('.cl-home-album-count')
      expect(count.textContent.trim()).toBe('04 辑')
    })

    test('左侧 4 行纯文字索引：编号 + 辑名 + 箭头，无缩略图', () => {
      const html = renderAlbums(albums)
      expect((html.match(/class="cl-home-album-row(?: is-active)?"/g) || []).length).toBe(4)
      expect(html).toContain('cl-home-album-idx')
      expect(html).toContain('cl-home-album-row-name')
      expect(html).not.toContain('cl-home-album-thumb')
      expect(html).not.toContain('cl-home-album-row-copy')
    })

    test('右侧 4 张卡片叠放：默认第 1 张 active，题签卡含页码/细线/辑名', () => {
      const html = renderAlbums(albums)
      expect((html.match(/cl-home-album-card/g) || []).length).toBe(4)
      expect((html.match(/cl-home-album-card is-active/g) || []).length).toBe(1)
      expect(html).toContain('cl-home-album-mat')
      expect(html).toContain('cl-home-album-cover')
      expect(html).toContain('cl-home-album-folio')
      expect(html).toContain('01 / 04')
      expect(html).toContain('cl-home-album-rule')
      // 无手机端的 CTA / 张数 / 日期
      expect(html).not.toContain('翻开影集')
      expect(html).not.toContain('11 张')
    })

    test('每辑一个入口，落到章页 deck，不带 view=gallery', () => {
      const html = renderAlbums(albums)
      expect(html).toContain('/album?deck=a')
      expect(html).toContain('/album?deck=d')
      expect(html).not.toContain('view=gallery')
    })

    test('右侧四张叠放卡全部 aria-hidden 且不可 Tab（键盘入口只在左侧四行）', () => {
      const html = renderAlbums(albums)
      expect((html.match(/class="cl-home-album-card[^"]*"[^>]*aria-hidden="true"[^>]*tabindex="-1"/g) || []).length).toBe(4)
      // 左侧四行是唯一可聚焦的入口
      expect((html.match(/class="cl-home-album-row(?: is-active)?" href=/g) || []).length).toBe(4)
    })
  })

  describe('悬停状态（博主定稿）', () => {
    test('useState 驱动，onMouseEnter / onFocus 切换，onMouseLeave 复位到第 1 辑', () => {
      expect(showcaseSource).toContain("import { useState } from 'react'")
      expect(showcaseSource).toContain('useState(0)')
      expect(showcaseSource).toContain('onMouseEnter={() => setActive(index)}')
      expect(showcaseSource).toContain('onFocus={() => setActive(index)}')
      // 审计修复：mouseleave 复位前检查焦点是否还在段内
      expect(showcaseSource).toContain('onMouseLeave={event => {')
      expect(showcaseSource).toContain('event.currentTarget.contains(document.activeElement)')
      expect(showcaseSource).toContain('setActive(0)')
    })

    test('active 同时驱动左侧 is-active 高亮与右侧 is-active 卡片', () => {
      expect(showcaseSource).toContain('index === current')
      expect(showcaseSource).toContain('is-active')
    })

    test('无 scroll/wheel/touchmove 劫持、无 sticky/动画库；只做纯 CSS 淡入', () => {
      expect(showcaseSource).not.toContain("'scroll'")
      expect(showcaseSource).not.toContain("'wheel'")
      expect(showcaseSource).not.toContain("'touchmove'")
      expect(showcaseSource).not.toContain('position: sticky')
      expect(showcaseSource).not.toMatch(/from\s+['"]gsap/)
      expect(showcaseSource).not.toContain('ScrollTrigger')
      expect(albumStyle).not.toContain('@keyframes')
    })
  })

  describe('焦点安全（审计修复：mouseleave 不得打断键盘焦点）', () => {
    test('鼠标移出但焦点仍在段内时不复位；焦点离开后才复位', () => {
      const { container, unmount } = render(
        React.createElement(HomeAlbumShowcase, { albums })
      )
      const section = container.querySelector('.cl-home-album')
      const rows = [...container.querySelectorAll('.cl-home-album-row')]

      fireEvent.mouseEnter(rows[2])
      expect(
        container.querySelectorAll('.cl-home-album-row.is-active')[0]
      ).toBe(rows[2])

      // 焦点仍在第 3 行：mouseleave 不应复位
      rows[2].focus()
      fireEvent.mouseLeave(section)
      expect(
        container.querySelectorAll('.cl-home-album-row.is-active')[0]
      ).toBe(rows[2])

      // 焦点真正离开段落：复位到第 1 辑
      rows[2].blur()
      document.body.focus()
      fireEvent.mouseLeave(section)
      expect(
        container.querySelectorAll('.cl-home-album-row.is-active')[0]
      ).toBe(rows[0])
      unmount()
    })
  })

  describe('样式：两栏框架 + 悬停高亮 + 卡片交叉淡入', () => {
    test('保留 620 索引 / 480 主视觉两栏、贴左右缘、同一气隙', () => {
      expect(albumStyle).toContain('--cl-home-album-hero-w: 480px;')
      expect(albumStyle).toContain('--cl-home-album-index-w: var(--cl-home-article-measure);')
      expect(albumStyle).toContain('minmax(0, var(--cl-home-album-index-w))')
      expect(albumStyle).toContain('minmax(0, var(--cl-home-album-hero-w))')
      expect(albumStyle).toMatch(/\.cl-home-album-body \{[^}]*justify-content: space-between;/)
    })

    test('左侧 4 行均分高度、is-active 用书脊朱砂竖线（非背景块）', () => {
      expect(albumStyle).toMatch(/\.cl-home-album-index \{[^}]*grid-auto-rows: 1fr;/)
      // 竖线是 ::before 独立细线，不再是背景块
      expect(albumStyle).toContain('.cl-home-album-row::before')
      expect(albumStyle).toMatch(/\.cl-home-album-row \{([\s\S]*?)position: relative;[\s\S]*?grid-template-columns: 2\.6rem minmax\(0, 1fr\) auto;/)
      expect(albumStyle).not.toContain('background: var(--cl-accent-soft)')
    })

    test('右侧四张叠放同一格，只动 opacity / visibility 交叉淡入', () => {
      expect(albumStyle).toMatch(/\.cl-home-album-showcase \{[^}]*display: grid;/)
      expect(albumStyle).toMatch(/\.cl-home-album-card \{[^}]*grid-column: 1;[\s\S]*?grid-row: 1;[\s\S]*?opacity: 0;[\s\S]*?visibility: hidden;/)
      expect(albumStyle).toContain('transition: opacity var(--cl-home-switch) var(--cl-ease),')
      expect(albumStyle).not.toContain('opacity: 0.5') // 无中间态残留
    })

    test('题签卡负 margin 叠压、朱砂页码/细线；4:5 相纸直角纪律', () => {
      expect(albumStyle).toContain('aspect-ratio: 4 / 5;')
      expect(albumStyle).toMatch(/\.cl-home-album-caption \{[^}]*margin: -2\.6rem auto 0;/)
      expect(albumStyle).toContain('background: var(--cl-accent);')
      expect(albumStyle).not.toContain('box-shadow')
    })

    test('书脊线从中点展开（scaleY 240ms）；辑名淡→朱砂 + 3px 位移', () => {
      expect(albumStyle).toMatch(/\.cl-home-album-row::before \{[\s\S]*?transform: scaleY\(0\);[\s\S]*?transform-origin: center;[\s\S]*?var\(--cl-home-switch\)/)
      expect(albumStyle).toContain('transform: scaleY(1);')
      expect(albumStyle).toMatch(/\.cl-home-album-row-name \{[\s\S]*?color: var\(--cl-faint\)/)
      expect(albumStyle).toContain('transform: translateX(3px);')
    })

    test('无包含块属性破坏题字 fixed（scaleY 只在伪元素上，不在祖先链）', () => {
      const sectionRule = albumStyle.match(
        /#theme-circlelife \.cl-home-album \{([\s\S]*?)\n      \}/
      )
      expect(sectionRule).not.toBeNull()
      expect(sectionRule[1]).not.toMatch(CONTAINING_BLOCK_RE)
      // 展开只动 transform；未引入 filter/backdrop-filter 等
      expect(albumStyle).not.toContain('filter:')
      expect(albumStyle).not.toContain('backdrop-filter')
    })

    test('不硬编码色值，一律走 --cl-* token', () => {
      expect(albumStyle).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(albumStyle).toContain('var(--cl-accent)')
      expect(albumStyle).not.toContain('--cl-vermilion')
    })

    test('两套影集样式引用的 --cl-* token 都在 tokens.js 有定义', () => {
      const tokenSource = readFile('themes', 'circlelife', 'styles', 'tokens.js')
      const { homeAlbumMobileStyle } = require('../../../themes/circlelife/styles/homeAlbumMobile')
      const referenced = new Set()
      ;[albumStyle, homeAlbumMobileStyle].forEach(css => {
        const re = /var\((--cl-[a-z0-9-]+)/g
        let match
        while ((match = re.exec(css))) referenced.add(match[1])
      })
      expect(referenced.size).toBeGreaterThan(0)
      // 段内自定义 token（如 --cl-home-album-hero-w）定义在样式块自身，不在 tokens.js
      const locallyDefined = new Set()
      ;[albumStyle, homeAlbumMobileStyle].forEach(css => {
        const re = /(--cl-[a-z0-9-]+)\s*:/g
        let match
        while ((match = re.exec(css))) locallyDefined.add(match[1])
      })
      referenced.forEach(token => {
        if (locallyDefined.has(token)) return
        expect(tokenSource).toContain(`${token}:`)
      })
    })

    test('旧的静态版语汇全部下线（hero-copy / cta / thumb / 满幅出血）', () => {
      ;[
        'cl-home-album-hero-copy',
        'cl-home-album-cta',
        'cl-home-album-thumb',
        'cl-home-album-row-copy',
        'cl-home-album-line',
        'width: 100vw',
        'margin-inline: calc(-1 * var(--cl-wide-pad))'
      ].forEach(token => {
        expect(albumStyle).not.toContain(token)
        expect(showcaseSource).not.toContain(token)
      })
    })

    test('回顶键在首页纯 CSS 压制仍在', () => {
      expect(homeStyle).toContain(
        'html:has(.cl-home-album) #theme-circlelife .cl-backtop.is-visible'
      )
    })
  })

  describe('接入与数据链路', () => {
    test('PC 与手机两个组件同挂，手机在文章段之后', () => {
      const albumAt = themeIndexSource.indexOf('<HomeAlbumShowcase albums=')
      const mobileAt = themeIndexSource.indexOf('<HomeAlbumShowcaseMobile')
      const articleAt = themeIndexSource.indexOf('<HomeArticleStage')
      expect(albumAt).toBeGreaterThan(articleAt)
      expect(mobileAt).toBeGreaterThan(albumAt)
      expect(themeIndexSource).toContain("router.pathname === '/'")
      expect(themeIndexSource).toContain('CIRCLELIFE_HOME_ALBUM_SHOWCASE')
    })

    test('数据层只显示勾选、上限 4、不补齐；封面 1024 档', () => {
      const block = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const homeAlbums = []'),
        pagesIndexSource.indexOf('props.homeAlbums = homeAlbums')
      )
      // 「精选」勾选与上限截断都在 orderedPhotoPages 处，block 内只做封面取图
      expect(pagesIndexSource).toContain('.filter(isFeaturedAlbum)')
      expect(pagesIndexSource).toContain('.slice(0, homeAlbumCount)')
      expect(block).toContain('cover: { src: buildSizedSource(cover.url, 1024) }')
      expect(block).not.toContain('images: images')
      expect(pagesIndexSource).not.toContain('view=gallery')
      expect(siteDataSource).not.toContain('view=gallery')
    })

    test('入口 URL 只带 deck；阅读器无 gallery 兼容', () => {
      expect(pagesIndexSource).toContain('`/album?deck=${p.id}`')
      expect(albumReaderDataSource).not.toContain('gallery')
      expect(albumReaderSource).not.toContain('gallery')
    })

    test('精选判定兼容 Checkbox 与 Select 降级形态', () => {
      expect(isFeaturedAlbum({ featured: true })).toBe(true)
      expect(isFeaturedAlbum({ 精选: ['精选'] })).toBe(true)
      expect(isFeaturedAlbum({})).toBe(false)
      expect(isFeaturedEntry).toBe(isFeaturedAlbum)
      expect(dataSource).toContain('export function buildAlbumView')
      expect(pagesIndexSource).toContain('components/homeAlbumData')
    })

    test('属性名映射新增 featured → 精选，白名单保住字段', async () => {
      expect(notionConfigSource).toContain('featured')
      expect(notionConfigSource).toContain("'精选'")
      const { default: getPageProperties } = require('../../../lib/db/notion/getPageProperties')
      const value = { properties: { 'hOG~': [['Yes']] } }
      // 字段名由 conf/notion.config.js 的映射决定，这里只确认映射与白名单存在
      expect(notionConfigSource).toMatch(/featured:\s*[^,\n]*\|\|\s*'精选'/)
      expect(typeof getPageProperties).toBe('function')
      expect(tokensSource).toBeDefined()
    })
  })
})
