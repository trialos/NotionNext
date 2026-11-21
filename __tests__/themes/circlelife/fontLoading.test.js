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
    expect(sources).toHaveLength(4)
    for (const source of sources) {
      expect(
        fs.existsSync(path.resolve(process.cwd(), 'public', source.slice(1)))
      ).toBe(true)
    }
    expect(css).toContain('font-weight: 400 600')
    expect(css).toContain('font-weight: 500 700')
    expect(css.match(/font-display: swap/g)).toHaveLength(4)
  })
})
