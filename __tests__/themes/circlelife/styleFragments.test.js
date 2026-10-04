/**
 * style.js 与 styles/ 片段的契约测试
 *
 * 背景：拆分 style.js 时出现过导出名不匹配（tokens.js 导出 tokensStyle，
 * style.js 引用 tokenStyle），webpack 仅报 warning 不阻断构建，undefined
 * 被字符串化拼进 CSS 顶部导致全站 token 失效。本测试让这类事故在
 * Jest 阶段爆掉。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const styleSource = fs.readFileSync(path.join(themeDir, 'style.js'), 'utf8')

// style.js 声明的全部片段引用：import { X } from './styles/Y'
const refs = [...styleSource.matchAll(/import \{ (\w+) \} from '\.\/styles\/(\w+)'/g)].map(
  m => ({ exportName: m[1], file: m[2] })
)

describe('circlelife styles fragments', () => {
  test('style.js 至少引用六个样式片段', () => {
    expect(refs.length).toBeGreaterThanOrEqual(6)
  })

  test.each(refs.map(r => [`${r.file}.js 导出 ${r.exportName}`, r]))(
    '%s',
    (_label, { exportName, file }) => {
      const mod = require(`../../../themes/circlelife/styles/${file}`)
      const frag = mod[exportName]
      expect(typeof frag).toBe('string')
      expect(frag.length).toBeGreaterThan(0)
      expect(frag).toContain('{')
    }
  )

  test('拼接后的 CSS 不含 undefined 且括号平衡', () => {
    const joined = refs
      .map(({ exportName, file }) => {
        const mod = require(`../../../themes/circlelife/styles/${file}`)
        return mod[exportName]
      })
      .join('\n')
    expect(joined).not.toMatch(/\bundefined\b/)
    let balance = 0
    for (const ch of joined) {
      if (ch === '{') balance++
      if (ch === '}') balance--
    }
    expect(balance).toBe(0)
  })
})
