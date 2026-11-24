import fs from 'fs'
import path from 'path'

const read = relative =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8')

describe('circlelife 字体自托管', () => {
  const theme = read('themes/circlelife/index.js')
  const css = read('public/fonts/fonts.css')

  test('全局唯一字体入口是本地 CSS，且不再引用 Google Fonts', () => {
    expect(
      theme.match(/<link rel='stylesheet' href='\/fonts\/fonts\.css' \/>/g)
    ).toHaveLength(1)
    expect(theme).not.toContain('fonts.googleapis.com')
    expect(theme).not.toContain('fonts.gstatic.com')
  })

  test('四个字体族与 tokens.js 的字体栈一致', () => {
    const tokens = read('themes/circlelife/styles/tokens.js')
    for (const family of [
      'Hanken Grotesk',
      'JetBrains Mono',
      'Newsreader',
      'Noto Serif SC'
    ]) {
      expect(css).toContain(`font-family: '${family}'`)
      expect(tokens).toContain(`'${family}'`)
    }
  })

  test('CSS 引用的字体文件都存在，字重覆盖并保留字体交换', () => {
    const sources = [...css.matchAll(/url\('(\/fonts\/[^']+)'\)/g)].map(
      match => match[1]
    )
    expect(sources).toHaveLength(5)
    for (const source of sources) {
      expect(
        fs.existsSync(path.resolve(process.cwd(), 'public', source.slice(1)))
      ).toBe(true)
    }
    expect(css).toContain('font-weight: 400 600')
    expect(css).toContain('font-weight: 500 700')
    expect(css.match(/font-display: swap/g)).toHaveLength(5)
  })

  test('首屏中文字体极小子集：16KB 文件 + unicode-range 与完整字体互补', () => {
    // 极小子集文件存在且远小于完整字体（16KB vs 508KB）
    const critical = fs.statSync(
      path.resolve(process.cwd(), 'public/fonts/notoserifsc-critical.woff2')
    ).size
    const full = fs.statSync(
      path.resolve(process.cwd(), 'public/fonts/notoserifsc-subset.woff2')
    ).size
    expect(critical).toBeLessThan(30 * 1024)
    expect(critical).toBeLessThan(full / 10)

    // 两个 @font-face 都用 Noto Serif SC 族 + 各自 unicode-range
    expect(css.match(/font-family: 'Noto Serif SC'/g)).toHaveLength(2)
    expect(css).toContain('/fonts/notoserifsc-critical.woff2')
    expect(css.match(/unicode-range:/g)).toHaveLength(2)

    // 首屏 19 个汉字都落在极小子集的 unicode-range 里
    const criticalBlock = css.slice(
      css.indexOf('notoserifsc-critical.woff2'),
      css.indexOf('notoserifsc-critical.woff2') + 700
    )
    for (const ch of '与我同行时光的弧线首页文章影集音乐关于') {
      const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
      expect(criticalBlock).toContain(`U+${cp}`)
    }
  })
})
