/**
 * 分类轨道（filterTrack）契约测试
 *
 * 影集页的旧书架已退役，FilterTrack 现在只由归档页使用。
 * 样式仍收敛在 styles/filterTrack.js，本测试继续守住计数位置与归档侧的唯一真源。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')

const {
  filterTrackStyle
} = require('../../../themes/circlelife/styles/filterTrack')
const { archiveStyle } = require('../../../themes/circlelife/styles/archive')

const readThemeFile = (...parts) =>
  fs.readFileSync(path.join(themeDir, ...parts), 'utf8')

/** 取出一条 CSS 规则体（含嵌套 {} 的安全截取） */
const ruleBodyOf = (css, selector) => {
  const m = css.match(
    new RegExp(
      selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'
    )
  )
  return m ? m[1] : null
}

describe('circlelife 分类轨道（归档）', () => {
  test('filterTrack.js 承载轨道全部规则', () => {
    expect(typeof filterTrackStyle).toBe('string')
    expect(filterTrackStyle).toContain('.cl-cat-track')
    expect(filterTrackStyle).toContain('.cl-cat-track__row')
    expect(filterTrackStyle).toContain('.cl-cat-track__items')
    expect(filterTrackStyle).toContain('.cl-cat-track__item')
    expect(filterTrackStyle).toContain('.cl-cat-track__count')
    expect(filterTrackStyle).toContain('.cl-cat-track__range')
  })

  test('计数贴标签右上角（两条关键属性不可动）', () => {
    const item = ruleBodyOf(
      filterTrackStyle,
      '#theme-circlelife .cl-cat-track__item'
    )
    expect(item).not.toBeNull()
    expect(item).toContain('align-items: flex-start')
    const count = ruleBodyOf(
      filterTrackStyle,
      '#theme-circlelife .cl-cat-track__count'
    )
    expect(count).not.toBeNull()
    expect(count).toContain('margin-top: 0.02rem')
    expect(count).toContain('font-family: var(--cl-font-mono)')
    expect(count).toContain('font-variant-numeric: tabular-nums')
  })

  test('激活态：朱砂色 + 底部下划线，由 aria-pressed 驱动', () => {
    expect(filterTrackStyle).toContain("[aria-pressed='true']")
    expect(filterTrackStyle).toContain('--cl-cat-underline: 2px')
    expect(filterTrackStyle).toContain('color: var(--cl-accent)')
    expect(filterTrackStyle).toContain('transform: scaleX(1)')
  })

  test('底部细横线 + 窄屏横向滚动与右缘渐隐 + ≥1024px 时间跨度', () => {
    const track = ruleBodyOf(
      filterTrackStyle,
      '#theme-circlelife .cl-cat-track'
    )
    expect(track).not.toBeNull()
    expect(track).toContain('border-bottom: 1px solid var(--cl-border)')
    const items = ruleBodyOf(
      filterTrackStyle,
      '#theme-circlelife .cl-cat-track__items'
    )
    expect(items).toContain('overflow-x: auto')
    expect(filterTrackStyle).toContain('@media (max-width: 767px)')
    expect(filterTrackStyle).toContain('@media (min-width: 1024px)')
  })

  test('archive.js 不再自带分类栏规则', () => {
    expect(archiveStyle).not.toContain('cl-archive-cats')
    expect(archiveStyle).not.toContain('cl-archive-cat__count')
    expect(archiveStyle).not.toContain('--cl-archive-underline')
  })

  test('归档页使用共享 FilterTrack，计数补零到两位', () => {
    const archiveIndex = readThemeFile('components', 'ArchiveIndex.js')
    expect(archiveIndex).toContain("from './FilterTrack'")
    expect(archiveIndex).toContain('<FilterTrack')
    const filterTrack = readThemeFile('components', 'FilterTrack.js')
    expect(filterTrack).toContain("padStart(2, '0')")
    expect(filterTrack).toContain('export function formatCount')
  })
})
