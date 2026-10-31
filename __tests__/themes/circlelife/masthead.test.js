/**
 * 刊头（mast）契约测试
 *
 * 归档 / 音乐页使用共享 PageMast；影集目录抽屉也复用同一个 PageMast，
 * 文案沿用旧影集页的「影的轨迹 / 影于我是空间的书签」。
 * 影集页自身是全屏阅读器，不再有旧书架版心和 --cl-mast-top 页面容器。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')

const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
const { mastStyle } = require('../../../themes/circlelife/styles/mast')
const { archiveStyle } = require('../../../themes/circlelife/styles/archive')
const {
  albumReaderStyle
} = require('../../../themes/circlelife/styles/albumReader')
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

describe('circlelife 刊头统一', () => {
  test('--cl-mast-top 仍由归档 / 音乐等内容页共用', () => {
    expect(tokenStyle).toContain(
      '--cl-mast-top: max(5.5rem, calc(env(safe-area-inset-top, 0px) + 4.8rem));'
    )
    expect(tokenStyle).toContain(
      '--cl-mast-top: max(5.2rem, calc(env(safe-area-inset-top, 0px) + 4.5rem));'
    )
    expect(tokenStyle).toMatch(
      /@media \(max-width: 1023px\) \{\s*:root \{[\s\S]*?--cl-mast-top/
    )
  })

  test('归档页容器用 --cl-mast-top + --cl-wide-pad', () => {
    const body = ruleBodyOf(archiveStyle, '#theme-circlelife .cl-archive-page')
    expect(body).not.toBeNull()
    expect(body).toContain('var(--cl-mast-top)')
    expect(body).toContain('var(--cl-wide-pad)')
    expect(body).not.toMatch(/padding:\s*2rem\s+var\(--cl-wide-pad\)/)
  })

  test('归档与音乐页退出 #container-inner 的通用导航避让', () => {
    expect(headerStyle).toMatch(
      /:not\(\.cl-is-archive\):not\(\.cl-is-music\)\s*#container-inner/
    )
  })

  test('mast.js 承载共享排版，归档金线与影集朱砂各自独立', () => {
    expect(mastStyle).toContain('.cl-page-mast--section')
    expect(mastStyle).toContain('--cl-mast-rule')
    expect(mastStyle).toContain('font-weight: 500')
    expect(mastStyle).toContain('clamp(1.75rem, 3.6vw, 2.4rem)')
    expect(mastStyle).toContain('letter-spacing: 0.18em')

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
    expect(archiveRule).not.toBe(albumRule)
  })

  test('深色影集朱砂是独立的深红，不别名到 --cl-accent', () => {
    const albumRule = ruleBodyOf(
      mastStyle,
      '#theme-circlelife .cl-page-mast--album'
    )
    expect(albumRule).not.toContain('--cl-accent')
    expect(tokenStyle).not.toMatch(/--cl-vermilion\s*:/)
    expect(albumReaderStyle).toContain('--cl-vermilion: #8f3424')
  })

  test('归档页不再重复实现刊头排版', () => {
    expect(archiveStyle).not.toContain(
      '.cl-page-mast--archive .cl-page-mast-kicker'
    )
    expect(archiveStyle).not.toContain(
      '.cl-page-mast--archive .cl-page-mast-title'
    )
  })

  test('影集目录抽屉改用 PageMast 渲染旧影集刊头', () => {
    const reader = readThemeFile('components', 'AlbumReader.js')
    expect(reader).toContain("from './PageMast'")
    expect(reader).toContain('cl-page-mast--section cl-page-mast--album')
    expect(reader).toContain('影的轨迹')
    expect(reader).toContain('影于我是空间的书签')
  })

  test('归档刊头挂上 section 变体', () => {
    const index = readThemeFile('index.js')
    expect(index).toContain('cl-page-mast--section cl-page-mast--archive')
  })

  test('三页刊头：轨迹三题 + 各自的书签句', () => {
    const reader = readThemeFile('components', 'AlbumReader.js')
    expect(reader).toContain('ALBUM · 影集')
    expect(reader).toContain('影的轨迹')
    expect(reader).toContain('影于我是空间的书签')
    const index = readThemeFile('index.js')
    expect(index).toContain('ARTICLE · 时间线与脉络')
    expect(index).toContain('心的轨迹')
    expect(index).toContain('文字于我是心的位置')
    const music = readThemeFile('components', 'music', 'MusicShelf.js')
    expect(music).toContain("title='声的轨迹'")
    expect(music).toContain("description='声音于我是时间的书签。'")
  })
})
