/**
 * 页脚锁头契约：stack 版式（弧标 + 中文/英文两行），整块居中；
 * row 版式已删除，抽屉品牌（compact + hideEn）保持原样。
 * 中轴微调只允许作用于页脚，且必须收敛到 footer 专属 CSS 变量。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const { headerStyle } = require('../../../themes/circlelife/styles/header')
const { commonStyle } = require('../../../themes/circlelife/styles/common')

const readThemeFile = (...parts) =>
  fs.readFileSync(path.join(themeDir, ...parts), 'utf8')

describe('circlelife 页脚品牌锁头', () => {
  const footerSource = readThemeFile('components', 'Footer.js')
  const lockupSource = readThemeFile('components', 'BrandLockup.js')
  const headerSource = readThemeFile('components', 'Header.js')
  const indexSource = readThemeFile('index.js')
  const commonStyleSource = commonStyle

  test('页脚使用 stack 锁头，并在下方挂社交通道', () => {
    expect(footerSource).toMatch(/<BrandLockup\s+href='\/'\s*\/>/)
    expect(footerSource).toContain('<FooterSocial')
  })

  test('row 变式（基线对齐 / 横排）已彻底删除', () => {
    expect(lockupSource).not.toContain('cl-lockup--row')
    expect(lockupSource).not.toContain('cl-lockup-row-text')
    expect(lockupSource).not.toContain('items-baseline')
    expect(lockupSource).not.toContain("layout = 'stack'")
    expect(headerStyle).not.toMatch(/--row/)
  })

  test('stack 版式保留中文衬线 / 英文等宽两行的原版式', () => {
    expect(lockupSource).toContain('cl-lockup-text flex min-w-0 flex-col leading-none')
    expect(lockupSource).toContain('cl-lockup inline-flex items-center gap-2.5')
    expect(headerStyle).toMatch(/\.cl-lockup-en \{[^}]*margin-top: 0\.22rem;/)
    expect(headerStyle).toMatch(/\.cl-lockup-cn \{[^}]*padding-top: 0\.08em;/)
  })

  test('抽屉品牌保持 compact + hideEn 的小号单行', () => {
    expect(headerSource).toContain('<BrandLockup compact href={null} hideEn />')
  })

  test('页脚中轴微调只作用于页脚，并收敛为一个实测变量', () => {
    expect(commonStyleSource).toContain('--cl-footer-mark-shift')
    expect(commonStyleSource).not.toContain('--cl-footer-text-shift')
    expect(commonStyleSource).toMatch(
      /\.cl-footer \.cl-lockup-mark \{[^}]*top: var\(--cl-footer-mark-shift\)/
    )
    expect(commonStyleSource).toContain('实测文字字形并集中心比弧标盒心低约 2px')
  })

  test('页脚品牌适度放大，抽屉品牌不受影响', () => {
    expect(commonStyleSource).toMatch(
      /\.cl-footer \.cl-lockup-cn \{[^}]*font-size: 1\.15rem;/
    )
    expect(commonStyleSource).toMatch(
      /\.cl-footer \.cl-lockup-en \{[^}]*font-size: 0\.66rem;/
    )
    expect(commonStyleSource).toMatch(
      /\.cl-footer \.cl-lockup-mark \{[^}]*width: 2\.25rem;/
    )
  })

  test('页脚底部留出 iPhone home indicator 安全区', () => {
    expect(commonStyleSource).toMatch(
      /padding-bottom: calc\(1\.75rem \+ env\(safe-area-inset-bottom, 0px\)\);/
    )
  })

  test('页脚进入视口时回顶与移动目录药丸让位', () => {
    expect(commonStyleSource).toMatch(
      /\.cl-footer-inview \.cl-backtop\.is-visible/
    )
    expect(commonStyleSource).toMatch(/\.cl-footer-inview \.cl-toc-fab/)
    expect(indexSource).toContain('IntersectionObserver')
    expect(indexSource).toContain("classList.toggle('cl-footer-inview'")
    expect(footerSource).toContain('footerRef')
  })
})
