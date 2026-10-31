/**
 * 影集目录抽屉版面契约
 *
 * 抽屉是 620px 宽的独立浮层，刊头与列表都必须撑满抽屉、共用同一组内边距。
 * 曾经把全站内容列的 `max-width: var(--cl-wide-max)` + `margin: 0 auto`
 * 搬进抽屉：auto 外边距让刊头在交叉轴收缩成内容宽，整块被推到抽屉中间，
 * 关闭按钮浮在标题旁而不是贴右缘。这里把该几何锁死。
 */
const {
  albumReaderStyle
} = require('../../../themes/circlelife/styles/albumReader')

const desktopStart = albumReaderStyle.lastIndexOf('@media (min-width: 1024px)')
const reducedStart = albumReaderStyle.indexOf(
  '@media (prefers-reduced-motion: reduce)'
)
const desktop = albumReaderStyle.slice(desktopStart, reducedStart)

const ruleOf = (css, selector) => {
  const start = css.indexOf(selector)
  if (start < 0) return ''
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    else if (css[i] === '}') {
      depth -= 1
      if (depth === 0) return css.slice(open, i + 1)
    }
  }
  return ''
}

describe('影集目录抽屉版面', () => {
  test('刊头与列表撑满抽屉，不套用全站内容列宽', () => {
    const head = ruleOf(desktop, '#indexOverlay .overlay-head')
    const list = ruleOf(desktop, '#indexOverlay .index-list')
    expect(head).not.toBe('')
    expect(list).not.toBe('')
    expect(head).not.toContain('max-width')
    expect(head).not.toContain('margin: 0 auto')
    expect(list).not.toContain('max-width')
    expect(list).not.toContain('margin: 0 auto')
  })

  test('刊头与列表共用抽屉内边距', () => {
    const head = ruleOf(desktop, '#indexOverlay .overlay-head')
    const list = ruleOf(desktop, '#indexOverlay .index-list')
    expect(head).toContain('var(--cl-wide-pad)')
    expect(list).toContain('var(--cl-wide-pad)')
  })
})
