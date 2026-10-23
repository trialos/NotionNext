/**
 * 页脚品牌锁头（弧标 · 中文 · 英文）对齐契约
 *
 * 背景：row 变体（页脚锁头）继承了 stack 变体（抽屉顶部品牌）的纵向版式参数：
 *   · 英文的 margin-top: 0.22rem —— stack 时英文在中文下方，往下挪一点才好看
 *   · 中文的上下不对称 padding —— stack 时用来撑开两行
 * 横排时这两条纯属噪音：英文被压低 1.75px、中文被顶偏 0.16px，
 * 三个元素不在同一条基线上（博主实测「都歪的」）。
 *
 * 博主定稿：**基线对齐** —— 中文与英文共用一条基线（更杂志化），
 * 弧标单独居中（仍由外层的 items-center 承担）。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const { headerStyle } = require('../../../themes/circlelife/styles/header')

const readThemeFile = (...parts) =>
  fs.readFileSync(path.join(themeDir, ...parts), 'utf8')

describe('circlelife 页脚品牌锁头对齐', () => {
  const lockupSource = readThemeFile('components', 'BrandLockup.js')

  test('row 变体走基线对齐；弧标仍由外层 items-center 单独居中', () => {
    expect(lockupSource).toContain('cl-lockup-row-text inline-flex items-baseline')
    expect(lockupSource).toContain('cl-lockup inline-flex items-center')
  })

  test('row 变体不得继承 stack 变体的纵向版式残留', () => {
    expect(headerStyle).toMatch(/\.cl-lockup-cn--row \{[^}]*padding-top: 0;/)
    expect(headerStyle).toMatch(/\.cl-lockup-cn--row \{[^}]*padding-bottom: 0;/)
    expect(headerStyle).toMatch(/\.cl-lockup-en--row \{[^}]*margin-top: 0;/)
  })

  test('stack 变体（抽屉顶部品牌）保持原版式，不受 row 覆盖影响', () => {
    // stack 的英文要靠 margin-top 往下挪 —— 它不在 --row 变体里
    expect(headerStyle).toMatch(/\.cl-lockup-en \{[^}]*margin-top: 0\.22rem;/)
    expect(headerStyle).toMatch(/\.cl-lockup-cn \{[^}]*padding-top: 0\.08em;/)
  })
})
