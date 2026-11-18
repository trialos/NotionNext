/**
 * 浮动操作定位契约：回顶与目录药丸共用右缘、上下顺序固定。
 * 二者曾各算一套 right，在 768–1279 的平板档错位；音乐页还漏了宽壳覆写。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const readThemeFile = (...parts) =>
  fs.readFileSync(path.join(themeDir, ...parts), 'utf8')

const commonStyle = readThemeFile('styles', 'common.js')
const articleStyle = readThemeFile('styles', 'article.js')
const archiveStyle = readThemeFile('styles', 'archive.js')
const musicStyle = readThemeFile('styles', 'music.js')
const tokenStyle = readThemeFile('styles', 'tokens.js')

/** 取出某个选择器的第一条规则体 */
const ruleBodyOf = (css, selector) => {
  const m = css.match(
    new RegExp(
      selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'
    )
  )
  return m ? m[1] : null
}

describe('circlelife 浮动操作定位', () => {
  test('回顶与目录药丸共用 --cl-fab-right，不再各写一套 right', () => {
    const backtop = ruleBodyOf(commonStyle, '#theme-circlelife .cl-backtop')
    const fab = ruleBodyOf(articleStyle, '#theme-circlelife .cl-toc-fab')
    expect(backtop).toContain('right: var(--cl-fab-right)')
    expect(fab).toContain('right: var(--cl-fab-right)')
    expect(tokenStyle).toContain('--cl-fab-right: max(')
  })

  test('各页面不得再给两颗浮钮单独写死 right', () => {
    const rightValues = css =>
      [...css.matchAll(/right:\s*([^;\n]+)/g)].map(m => m[1].trim())
    expect(
      rightValues(ruleBodyOf(commonStyle, '#theme-circlelife .cl-backtop'))
    ).toEqual(['var(--cl-fab-right)'])
    expect(
      rightValues(ruleBodyOf(articleStyle, '#theme-circlelife .cl-toc-fab'))
    ).toEqual(['var(--cl-fab-right)'])
    expect(articleStyle + archiveStyle + musicStyle).not.toMatch(
      /\.cl-backtop\s*\{[^}]*right:/
    )
  })

  test('回顶在上、目录在下，各自保留安全区', () => {
    const backtop = ruleBodyOf(commonStyle, '#theme-circlelife .cl-backtop')
    const fab = ruleBodyOf(articleStyle, '#theme-circlelife .cl-toc-fab')
    expect(backtop).toContain(
      'bottom: calc(5.25rem + env(safe-area-inset-bottom, 0px))'
    )
    expect(fab).toContain(
      'bottom: calc(1.75rem + env(safe-area-inset-bottom, 0px))'
    )
  })

  test('文章 / 归档 / 音乐在宽屏各覆写同一变量，音乐不再吃 48rem 窄栏', () => {
    expect(articleStyle).toMatch(
      /#theme-circlelife\.cl-is-article \{\s*--cl-fab-right:/
    )
    expect(archiveStyle).toMatch(
      /#theme-circlelife\.cl-is-archive \{\s*--cl-fab-right:/
    )
    expect(musicStyle).toMatch(
      /#theme-circlelife\.cl-is-music \{\s*--cl-fab-right:/
    )
    expect(musicStyle).toMatch(/var\(--cl-wide-max\)/)
    expect(musicStyle).not.toMatch(/\.cl-is-music[\s\S]*48rem/)
  })

  test('手机档两颗浮钮都按视口贴边，不按内容 gutter 漂到画面中间', () => {
    expect(commonStyle).toMatch(
      /@media \(max-width: 767px\) \{[\s\S]*?#theme-circlelife \{\s*--cl-fab-right: max\(1\.1rem, env\(safe-area-inset-right, 0px\)\)/
    )
  })

  test('桌面各档覆写仍保留 safe-area-inset-right，目录药丸不丢安全区', () => {
    expect(tokenStyle).toMatch(
      /--cl-fab-right: max\([^;]*env\(safe-area-inset-right, 0px\)/
    )
    for (const [css, selector] of [
      [commonStyle, '#theme-circlelife.cl-has-sidebar'],
      [articleStyle, '#theme-circlelife.cl-is-article'],
      [archiveStyle, '#theme-circlelife.cl-is-archive'],
      [musicStyle, '#theme-circlelife.cl-is-music']
    ]) {
      expect(ruleBodyOf(css, selector)).toContain(
        'env(safe-area-inset-right, 0px)'
      )
    }
  })
})
