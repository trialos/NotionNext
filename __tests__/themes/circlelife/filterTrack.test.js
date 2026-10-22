/**
 * 分类轨道（filterTrack）契约测试
 *
 * 背景：此前归档页（.cl-archive-cats，styles/archive.js）与影集页
 * （.cl-album-stack-tag，styles/album.js）各写各的分类栏，形态与逻辑都不一样
 * （衬线轨道 vs 圆角胶囊、计数贴右上角 vs 行内小字、有无底部细横线、
 * 有无右端时间跨度）。博主要求两页「逻辑一样、计数在标签右上角」。
 * 两份实现必然继续漂移，故收敛到 styles/filterTrack.js + components/FilterTrack.js。
 *
 * 本测试把「共用一份样式」与「计数在右上角」固化成断言，防止以后再各写各的。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')

const {
  filterTrackStyle
} = require('../../../themes/circlelife/styles/filterTrack')
const { archiveStyle } = require('../../../themes/circlelife/styles/archive')
const { albumStyle } = require('../../../themes/circlelife/styles/album')

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

describe('circlelife 分类轨道（归档 / 影集共用）', () => {
  describe('共享样式唯一真源', () => {
    test('filterTrack.js 承载轨道全部规则', () => {
      expect(typeof filterTrackStyle).toBe('string')
      expect(filterTrackStyle.length).toBeGreaterThan(0)
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
      // 计数是等宽小字，且数字等宽防抖
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
  })

  describe('重复实现已消除', () => {
    test('archive.js 不再自带分类栏规则', () => {
      expect(archiveStyle).not.toContain('cl-archive-cats')
      expect(archiveStyle).not.toContain('cl-archive-cat__count')
      // 旧的行高 token 已由 --cl-cat-underline 承接
      expect(archiveStyle).not.toContain('--cl-archive-underline')
    })

    test('album.js 不再自带胶囊标签栏规则', () => {
      expect(albumStyle).not.toContain('cl-album-stack-tags')
      expect(albumStyle).not.toContain('cl-album-stack-tag')
    })
  })

  describe('组件层同构', () => {
    test('归档页与影集页都使用共享 FilterTrack 组件', () => {
      const archiveIndex = readThemeFile('components', 'ArchiveIndex.js')
      const shelf = readThemeFile('components', 'AlbumShelfStack.js')
      expect(archiveIndex).toContain("from './FilterTrack'")
      expect(archiveIndex).toContain('<FilterTrack')
      expect(shelf).toContain("from './FilterTrack'")
      expect(shelf).toContain('<FilterTrack')
      expect(shelf).not.toContain('cl-album-stack-tag')
    })

    test('计数补零到两位（归档 30/14/01，影集 06/02/01/02）', () => {
      const filterTrack = readThemeFile('components', 'FilterTrack.js')
      expect(filterTrack).toContain("padStart(2, '0')")
      expect(filterTrack).toContain('export function formatCount')
    })

    test('影集每辑标题上方的 PROJECT 已改为 ALBUM', () => {
      const shelf = readThemeFile('components', 'AlbumShelfStack.js')
      expect(shelf).toContain('ALBUM ·')
      expect(shelf).not.toContain('PROJECT ·')
    })

    test('影集时间跨度用 publishDate + formatDateFmt（与归档同口径）', () => {
      const shelf = readThemeFile('components', 'AlbumShelfStack.js')
      expect(shelf).toContain("from '@/lib/utils/formatDate'")
      expect(shelf).toContain("formatDateFmt(ts, 'yyyy-MM')")
      expect(shelf).toContain('publishDate')
      // 缺 publishDate 的影集不计入范围
      expect(shelf).toContain('.filter(Boolean)')
    })
  })
})
