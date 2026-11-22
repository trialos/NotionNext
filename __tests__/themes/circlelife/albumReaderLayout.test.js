/**
 * 影集目录抽屉版面契约
 *
 * 抽屉是 620px 宽的独立浮层，刊头与列表都必须撑满抽屉、共用同一组内边距。
 * 曾经把全站内容列的 `max-width: var(--cl-wide-max)` + `margin: 0 auto`
 * 搬进抽屉：auto 外边距让刊头在交叉轴收缩成内容宽，整块被推到抽屉中间，
 * 关闭按钮浮在标题旁而不是贴右缘。这里把该几何锁死。
 */
const fs = require('fs')
const path = require('path')
const {
  albumReaderStyle
} = require('../../../themes/circlelife/styles/albumReader')
const readerSource = fs.readFileSync(
  path.resolve(process.cwd(), 'themes/circlelife/components/AlbumReader.js'),
  'utf8'
)

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

describe('影集底部文字带按图注伸缩', () => {
  test('无图注时只留导航高度，有图注时恢复文字带', () => {
    expect(ruleOf(albumReaderStyle, '.reader {')).toContain(
      '--album-foot: calc(66px + var(--album-safe-bottom))'
    )
    expect(ruleOf(albumReaderStyle, '.reader.has-caption')).toContain(
      '--album-foot: calc(176px + var(--album-safe-bottom))'
    )
    expect(ruleOf(desktop, '.reader {')).toContain(
      '--album-foot: calc(64px + var(--album-safe-bottom))'
    )
    expect(ruleOf(desktop, '.reader.has-caption')).toContain(
      '--album-foot: 140px'
    )
  })

  test('舞台与点击区仍跟随底部变量，顶栏高度不动', () => {
    expect(ruleOf(albumReaderStyle, '.reader-stage')).toContain(
      'bottom: var(--album-foot)'
    )
    expect(ruleOf(albumReaderStyle, '.tap-zone')).toContain(
      'bottom: var(--album-foot)'
    )
    expect(ruleOf(albumReaderStyle, '.reader-foot')).toContain(
      'height: var(--album-foot)'
    )
    expect(ruleOf(albumReaderStyle, '.reader {')).toContain(
      '--album-bar: calc(56px + var(--album-safe-top))'
    )
    expect(ruleOf(desktop, '.reader {')).toContain(
      '--album-bar: calc(72px + var(--album-safe-top))'
    )
  })

  test('组件按图注有无切换状态类', () => {
    expect(readerSource).toContain("activePhoto?.caption ? 'has-caption' : ''")
  })
})

describe('影集大图按显示宽与 DPR 选档', () => {
  test('主图与预加载都走选档函数，不再写死 photo.src', () => {
    expect(readerSource).toContain(
      'selectReaderPhotoSrc(activePhoto, frameSize.w, dpr)'
    )
    expect(readerSource).toContain(
      'selectReaderPhotoSrc(photo, frameSize.w, dpr)'
    )
    expect(readerSource).toContain('src={displaySrc}')
    expect(readerSource).not.toContain('src={activePhoto.src}')
  })

  test('DPR 默认 1，由 resize 同步真实设备像素比', () => {
    expect(readerSource).toContain('useState(1)')
    expect(readerSource).toContain('window.devicePixelRatio')
    expect(readerSource).toContain("addEventListener('resize', syncDpr)")
  })
})
