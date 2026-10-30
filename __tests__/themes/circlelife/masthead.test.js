/**
 * 刊头（mast）几何契约测试
 *
 * 背景：文章板块（/archive）与影集板块（/album）的刊头此前各写各的：
 *   · 归档侧 styles/archive.js 手写 .cl-page-mast--archive 全套排版
 *   · 影集侧 styles/album.js 手写 .cl-album-stack-mast / -kicker / -main-title
 * 两份靠人工调成一致，页面级容器几何却从未统一 —— 1440 视口下两页刊头
 * 竖线差 11.2px、眉题纵向差 16px（移动端纵向差 20.8px），切页明显跳位。
 *
 * 现已收敛为唯一真源 styles/mast.js + 几何 token --cl-mast-top，
 * 本测试把「两页同基线 + 不再各写各的」固化成断言，防止以后再漂移。
 * 这些全是纯 CSS 几何，没有任何自动化能兜住，故在此兜底。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')

const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
const { mastStyle } = require('../../../themes/circlelife/styles/mast')
const { archiveStyle } = require('../../../themes/circlelife/styles/archive')
const { albumStyle } = require('../../../themes/circlelife/styles/album')
const { headerStyle } = require('../../../themes/circlelife/styles/header')

const readThemeFile = (...parts) =>
  fs.readFileSync(path.join(themeDir, ...parts), 'utf8')

/** 取出某个选择器的第一条规则体（含嵌套 {} 的安全截取） */
const ruleBodyOf = (css, selector) => {
  const m = css.match(
    new RegExp(
      selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'
    )
  )
  return m ? m[1] : null
}

describe('circlelife 刊头统一（归档 / 影集）', () => {
  describe('几何基准 token', () => {
    test('--cl-mast-top 存在且为影集页原值（桌面 88px）', () => {
      expect(tokenStyle).toContain(
        '--cl-mast-top: max(5.5rem, calc(env(safe-area-inset-top, 0px) + 4.8rem));'
      )
    })

    test('≤1023px 有同步覆盖（83.2px），与 --cl-nav-height 同断点', () => {
      expect(tokenStyle).toContain(
        '--cl-mast-top: max(5.2rem, calc(env(safe-area-inset-top, 0px) + 4.5rem));'
      )
      // 覆盖必须落在 ≤1023px 的 :root 块内，不能另起断点导致两页不同步
      const overrideBlock = tokenStyle.match(
        /@media \(max-width: 1023px\) \{\s*:root \{([\s\S]*?)\}\s*\}/
      )
      expect(overrideBlock).not.toBeNull()
      expect(overrideBlock[1]).toContain('--cl-mast-top')
    })
  })

  describe('两页容器共用同一基准', () => {
    test('归档页容器用 --cl-mast-top + --cl-wide-pad', () => {
      const body = ruleBodyOf(
        archiveStyle,
        '#theme-circlelife .cl-archive-page'
      )
      expect(body).not.toBeNull()
      expect(body).toContain('var(--cl-mast-top)')
      expect(body).toContain('var(--cl-wide-pad)')
      // 旧的写死顶部间距必须消失，否则又变成两段凑数
      expect(body).not.toMatch(/padding:\s*2rem\s+var\(--cl-wide-pad\)/)
    })

    test('影集页容器用 --cl-mast-top + --cl-wide-pad + --cl-wide-max', () => {
      const bodies = [
        ...albumStyle.matchAll(/\.cl-album-stack-root\s*\{([^}]*)\}/g)
      ].map(m => m[1])
      // 基础规则 + ≤1023 + ≤767 三条
      expect(bodies.length).toBe(3)
      bodies.forEach(body => {
        expect(body).toContain('var(--cl-mast-top)')
        expect(body).toContain('var(--cl-wide-pad)')
      })
      expect(bodies[0]).toContain('max-width: var(--cl-wide-max)')
    })

    test('影集页不再写死 1720px / 2rem 边距', () => {
      expect(albumStyle).not.toContain('1720px')
      const bodies = [
        ...albumStyle.matchAll(/\.cl-album-stack-root\s*\{([^}]*)\}/g)
      ].map(m => m[1])
      bodies.forEach(body => {
        expect(body).not.toMatch(/padding:[^;]*\b2rem\b/)
        expect(body).not.toMatch(/padding:[^;]*\b1\.5rem\b/)
        expect(body).not.toMatch(/padding:[^;]*\b1rem\b/)
      })
    })

    test('归档与音乐页都退出了 #container-inner 的通用导航避让（否则会叠出 72px）', () => {
      // 这两页的顶部间距由模块自持（刊头基线统一走 --cl-mast-top），
      // 通用避让再加一层就会让刊头跳位
      expect(headerStyle).toMatch(
        /:not\(\.cl-is-archive\):not\(\.cl-is-music\)\s*#container-inner/
      )
    })
  })

  describe('刊头排版唯一真源', () => {
    test('mast.js 承载共享排版', () => {
      expect(mastStyle).toContain('.cl-page-mast--section')
      expect(mastStyle).toContain('--cl-mast-rule')
      expect(mastStyle).toContain('font-weight: 500')
      expect(mastStyle).toContain('clamp(1.75rem, 3.6vw, 2.4rem)')
      expect(mastStyle).toContain('letter-spacing: 0.18em')
    })

    test('归档 / 影集的竖线强调色各自独立（设计文档要求不合并）', () => {
      expect(mastStyle).toContain('.cl-page-mast--archive')
      expect(mastStyle).toContain('.cl-page-mast--album')
      const archiveRule = ruleBodyOf(
        mastStyle,
        '#theme-circlelife .cl-page-mast--archive'
      )
      const albumRule = ruleBodyOf(
        mastStyle,
        '#theme-circlelife .cl-page-mast--album'
      )
      expect(archiveRule).toContain('var(--cl-gold)')
      expect(albumRule).toContain('var(--cl-vermilion, #b93a2b)')
      // 归档金线与影集朱砂不得合并成同一个值
      expect(archiveRule).not.toBe(albumRule)
    })

    test('深色模式陷阱：影集竖线不得走 --cl-accent（深色下是琥珀）', () => {
      const albumRule = ruleBodyOf(
        mastStyle,
        '#theme-circlelife .cl-page-mast--album'
      )
      expect(albumRule).not.toContain('--cl-accent')
      // 全仓未定义 --cl-vermilion，靠 fallback 生效；不得把它别名到 --cl-accent
      const tokens = require('../../../themes/circlelife/styles/tokens')
      expect(tokens.tokenStyle).not.toMatch(/--cl-vermilion\s*:/)
    })

    test('归档 / 影集两侧都不再重复实现刊头排版', () => {
      expect(archiveStyle).not.toContain(
        '.cl-page-mast--archive .cl-page-mast-kicker'
      )
      expect(archiveStyle).not.toContain(
        '.cl-page-mast--archive .cl-page-mast-title'
      )
      expect(albumStyle).not.toContain('cl-album-stack-mast')
      expect(albumStyle).not.toContain('cl-album-stack-kicker')
      expect(albumStyle).not.toContain('cl-album-stack-main-title')
    })
  })

  describe('组件层同构', () => {
    test('影集书架改用 PageMast 渲染刊头', () => {
      const shelf = readThemeFile('components', 'AlbumShelfStack.js')
      expect(shelf).toContain("from './PageMast'")
      expect(shelf).toContain('cl-page-mast--section cl-page-mast--album')
      expect(shelf).not.toContain('cl-album-stack-main-title')
    })

    test('归档刊头挂上 section 变体', () => {
      const index = readThemeFile('index.js')
      expect(index).toContain('cl-page-mast--section cl-page-mast--archive')
    })

    test('三页刊头：轨迹三题 + 各自的书签句', () => {
      const shelf = readThemeFile('components', 'AlbumShelfStack.js')
      expect(shelf).toContain('ALBUM · 影集')
      expect(shelf).toContain('影的轨迹')
      expect(shelf).toContain('影像于我是空间的书签')
      const index = readThemeFile('index.js')
      expect(index).toContain('ARTICLE · 时间线与脉络')
      expect(index).toContain('心的轨迹')
      expect(index).toContain('文字于我是心的位置')
      const music = readThemeFile('components', 'music', 'MusicShelf.js')
      expect(music).toContain("title='声的轨迹'")
      expect(music).toContain("description='声音于我是时间的书签。'")
    })
  })
})
