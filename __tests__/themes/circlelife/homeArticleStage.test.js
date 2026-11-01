/**
 * 首页精选文章章（原生横向滑动）契约测试
 *
 * 守住：
 * 1. 日期尺真实日距 / 同日错开 / 非法日期降级
 * 2. 精选数据链路与 512/1024 取图
 * 3. 原生横向 scroll-snap：无 sticky 行程、无逐帧 scrub、无 wheel/touch 劫持
 * 4. 日期点击 / 上一张/下一张 / 键盘 / 活动篇 aria
 * 5. 图版继续走 HomeArticleCover（1024、无 2048）
 * 6. 移动端满屏出血、短屏、BackToTop、reduced-motion
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const {
  RULER_MIN_GAP,
  computeRulerPositions,
  formatMonthRange,
  formatRulerDay,
  parsePublishDay
} = require('../../../themes/circlelife/components/homeArticleFocus')
const {
  isFeaturedEntry
} = require('../../../themes/circlelife/components/homeAlbumFocus')

const stageSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeArticleStage.js'
)
const focusSource = readFile(
  'themes',
  'circlelife',
  'components',
  'homeArticleFocus.js'
)
const coverSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeArticleCover.js'
)
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const pagesIndexSource = readFile('pages', 'index.js')
const { homeArticlesStyle } = require('../../../themes/circlelife/styles/homeArticles')
const homeStyleSource = readFile('themes', 'circlelife', 'styles', 'home.js')

/** 会造包含块 / 破坏 fixed 的属性 */
const CONTAINING_BLOCK_RE =
  /(^|;)\s*(transform|filter|backdrop-filter|perspective|contain|will-change)\s*:/

const STYLE_FRAGMENTS = [
  ['styles/common.js', 'commonStyle'],
  ['styles/header.js', 'headerStyle'],
  ['styles/home.js', 'homeStyle'],
  ['styles/homeArticles.js', 'homeArticlesStyle'],
  ['styles/mast.js', 'mastStyle'],
  ['styles/article.js', 'articleStyle'],
  ['styles/archive.js', 'archiveStyle']
]

describe('circlelife 首页精选文章章（原生横向滑动）', () => {
  describe('刻度位置（纯函数 · 真实日距比例）', () => {
    test('RULER_MIN_GAP 存在且为正（同日刻度靠它错开）', () => {
      expect(RULER_MIN_GAP).toBeGreaterThan(0)
    })

    test('空数组 / 非数组 → 空结果', () => {
      expect(computeRulerPositions([])).toEqual([])
      expect(computeRulerPositions(null)).toEqual([])
      expect(computeRulerPositions(undefined)).toEqual([])
    })

    test('单条 → 落在轴中点', () => {
      const pos = computeRulerPositions(['2026-10-22'], { width: 1000 })
      expect(pos).toHaveLength(1)
      expect(pos[0]).toBeCloseTo(0.5, 5)
    })

    test('按真实日距比例分布（不是等距装饰）', () => {
      const pos = computeRulerPositions(
        ['2026-10-22', '2026-10-15', '2026-10-11'],
        { width: 1000 }
      )
      expect(pos[0]).toBeCloseTo(1, 5)
      expect(pos[1]).toBeCloseTo(4 / 11, 4)
      expect(pos[2]).toBeCloseTo(0, 5)
    })

    test('同日两篇 → relax pass 保证相邻间距 ≥ minGap', () => {
      const pos = computeRulerPositions(
        ['2026-10-09', '2026-10-09'],
        { width: 1000, minGap: 56 }
      )
      expect(Math.abs(pos[1] - pos[0]) * 1000).toBeGreaterThanOrEqual(55.999)
    })

    test('全部同一比例 / 非法日期 / 非法宽度都不产生 NaN，且夹在 [0,1]', () => {
      const allSame = computeRulerPositions(
        ['2026-10-09', '2026-10-09', '2026-10-09'],
        { width: 900, minGap: 56 }
      )
      allSame.forEach(p => expect(Number.isFinite(p)).toBe(true))
      for (let i = 1; i < allSame.length; i++) {
        expect((allSame[i] - allSame[i - 1]) * 900).toBeGreaterThanOrEqual(55.999)
      }

      const invalid = computeRulerPositions(
        ['2026-10-22', 'not-a-date', '2026-10-11'],
        { width: 1000 }
      )
      invalid.forEach(p => {
        expect(Number.isFinite(p)).toBe(true)
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
      })

      const noWidth = computeRulerPositions(['2026-10-22', '2026-10-11'], {
        width: 0
      })
      noWidth.forEach(p => expect(Number.isFinite(p)).toBe(true))
    })

    test('输入顺序由旧到新 → 左旧右新，不倒挂', () => {
      const pos = computeRulerPositions(
        [
          '2026-10-15',
          '2026-10-18',
          '2026-10-20',
          '2026-10-26',
          '2026-10-27',
          '2026-10-28'
        ],
        { width: 358, minGap: RULER_MIN_GAP }
      )
      expect(pos[0]).toBeCloseTo(0, 5)
      expect(pos[pos.length - 1]).toBeCloseTo(1, 5)
      for (let i = 1; i < pos.length; i++) {
        expect(pos[i]).toBeGreaterThanOrEqual(pos[i - 1])
      }
    })
  })

  describe('日期格式（不补零）', () => {
    test('publishDay 解析不补零', () => {
      expect(parsePublishDay('2026-10-9')).toBe(Date.UTC(2026, 9, 9))
      expect(parsePublishDay('2026-10-09')).toBe(Date.UTC(2026, 9, 9))
      expect(parsePublishDay('2026/10/09')).toBeNull()
      expect(parsePublishDay('2026-13-45')).toBeNull()
    })

    test('日期标签与月份跨度', () => {
      expect(formatRulerDay('2026-10-9')).toBe('10·09')
      expect(formatRulerDay('bad')).toBe('')
      expect(formatMonthRange(['2026-10-22', '2026-08-07'])).toBe(
        '2026 · 08 — 10'
      )
      expect(formatMonthRange(['2025-12-20', '2026-10-22'])).toBe(
        '2025-12 — 2026-10'
      )
    })
  })

  describe('精选判定（文章与影集共用）', () => {
    test('布尔值 / 原始列名 / Select 降级', () => {
      expect(isFeaturedEntry({ featured: true })).toBe(true)
      expect(isFeaturedEntry({ featured: false })).toBe(false)
      expect(isFeaturedEntry({ 精选: true })).toBe(true)
      expect(isFeaturedEntry({ featured: ['精选'] })).toBe(true)
      expect(isFeaturedEntry({ featured: 'Featured' })).toBe(true)
      expect(isFeaturedEntry({})).toBe(false)
      expect(isFeaturedEntry(null)).toBe(false)
    })
  })

  describe('原生横向轮播结构', () => {
    test('原生 rail + scroll-snap；不劫持 wheel/touch、不读 window.scrollY', () => {
      expect(stageSource).toContain('cl-home-articles-rail')
      expect(stageSource).toContain('IntersectionObserver')
      expect(stageSource).toContain('scrollTo(')
      expect(stageSource).toContain('data-index')
      expect(stageSource).toContain('requestAnimationFrame')
      expect(stageSource).not.toContain("addEventListener('scroll'")
      expect(stageSource).not.toContain("addEventListener('wheel'")
      expect(stageSource).not.toContain("addEventListener('touchmove'")
      expect(stageSource).not.toContain('window.scrollY')
      expect(homeArticlesStyle).toContain('scroll-snap-type: x mandatory')
      expect(homeArticlesStyle).toContain('scroll-snap-stop: always')
      expect(homeArticlesStyle).toContain('overscroll-behavior-x: contain')
    })

    test('没有 sticky 轨道 / 行程 / 逐帧 scrub 状态机', () => {
      expect(homeArticlesStyle).not.toContain('position: sticky')
      expect(homeArticlesStyle).not.toContain('--cl-home-article-sweep')
      expect(homeArticlesStyle).not.toContain('--cl-home-article-step')
      expect(homeArticlesStyle).not.toContain('--cl-home-article-shift')
      expect(stageSource).not.toContain('computeScrubPosition')
      expect(stageSource).not.toContain('interpolateRulerFraction')
      expect(stageSource).not.toContain('computeCoverPlan')
      expect(stageSource).not.toContain('writeScrub')
      expect(stageSource).not.toContain('setInterval')
      expect(stageSource).not.toContain('setTimeout')
      expect(stageSource).not.toContain("setProperty('--cl-ha-pos'")
    })

    test('一窗一屏：100svh 面板 + 三行，日期尺在第三行', () => {
      expect(homeArticlesStyle).toContain('height: 100svh')
      expect(homeArticlesStyle).toMatch(
        /grid-template-rows: auto minmax\(0, 1fr\) auto;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-top \{[^}]*grid-row: 1;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-stage \{[^}]*grid-row: 2;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-foot \{[^}]*grid-row: 3;/
      )
    })

    test('日期尺可点击 + 上一张/下一张 + 键盘 + 状态广播', () => {
      expect(stageSource).toContain('cl-home-articles-tick')
      expect(stageSource).toContain('onClick={() => goTo(index)}')
      expect(stageSource).toContain("aria-label='上一张文章'")
      expect(stageSource).toContain("aria-label='下一张文章'")
      expect(stageSource).toContain("event.key === 'ArrowLeft'")
      expect(stageSource).toContain("event.key === 'ArrowRight'")
      expect(stageSource).toContain("event.key === 'Home'")
      expect(stageSource).toContain("event.key === 'End'")
      expect(stageSource).toContain("aria-live='polite'")
      expect(stageSource).toContain('aria-roledescription')
      expect(stageSource).toContain("aria-current={index === activeIndex")
      expect(stageSource).toContain('sessionStorage')
      expect(stageSource).toContain("'cl-home-article-index'")
      expect(stageSource).toContain('cl-home-article-active')
    })

    test('从文章返回恢复当前篇：先读 session，再写，首帧不冲掉旧值', () => {
      expect(stageSource).toContain(
        'sessionStorage.getItem(ARTICLE_INDEX_KEY)'
      )
      expect(stageSource).toContain(
        'sessionStorage.setItem(ARTICLE_INDEX_KEY'
      )
      expect(stageSource).toContain('didRestoreRef')
      expect(stageSource).toContain('didWriteRef')
      // 恢复必须是瞬时定位：临时关掉轨道的 smooth
      expect(stageSource).toMatch(/rail\.scrollLeft = target \* rail\.clientWidth/)
      expect(stageSource).toContain("rail.style.scrollBehavior = 'auto'")
    })

    test('跨多篇瞬时定位，邻篇保留平滑；转屏按篇位重算偏移', () => {
      // 平滑滚过 3–5 篇会让活动篇/canvas 槽位一路抖过去 → 长跳直接瞬移
      expect(stageSource).toContain('Math.abs(next - current) > 1')
      expect(stageSource).toContain('rail.scrollLeft = next * slide')
      // 宽度变化（转屏/缩放）时不能把当前篇留在半路
      expect(stageSource).toContain('railWidthRef')
      expect(stageSource).toContain('rail.scrollLeft = activeRef.current * railW')
    })

    test('图版继续走 HomeArticleCover（1024，无 2048）', () => {
      expect(stageSource).toContain("from './HomeArticleCover'")
      expect(stageSource).toContain('HomeArticleCover')
      expect(stageSource).toContain('coverRefs')
      expect(stageSource).toContain("arm('high')")
      expect(stageSource).toContain('prefetch()')
      expect(stageSource).toContain('release()')
      expect(stageSource).not.toContain('CanvasImage')
      expect(stageSource).not.toContain('eager=')
      expect(stageSource).not.toContain('srcSet=')
      expect(stageSource).not.toContain('2048')
      expect(coverSource).toContain('ARTICLE_COVER_TIER = 1024')
      expect(coverSource).not.toContain('2048')
      expect(stageSource).toContain("className='cl-home-article-plate-img'")
      expect(stageSource).toContain(
        'position={`50% ${(article.cover.pos ?? 0.5) * 100}%`}'
      )
    })

    test('BackToTop 跟随章节 + reduced-motion 关闭平滑', () => {
      expect(stageSource).toContain('cl-home-article-active')
      // 状态类必须真的接到回顶键的隐藏规则上（否则只是挂了个空类）
      expect(homeStyleSource).toContain(
        'html.cl-home-article-active #theme-circlelife .cl-backtop.is-visible'
      )
      expect(stageSource).toContain(
        "matchMedia('(prefers-reduced-motion: reduce)')"
      )
      expect(homeArticlesStyle).toContain(
        '@media (prefers-reduced-motion: reduce)'
      )
      expect(homeArticlesStyle).toContain('scroll-behavior: auto')
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-cursor \{[^}]*transition: left/
      )
    })
  })

  describe('几何、排版与移动端', () => {
    test('fixed 标尺祖先链不得带 transform/filter/contain/will-change', () => {
      const ancestorTargets = ['container-inner', 'container-wrapper']
      const offenders = []
      STYLE_FRAGMENTS.forEach(([file, exportName]) => {
        const mod = require(`../../../themes/circlelife/${file}`)
        const css = mod[exportName] || ''
        const re = /([^{}]+)\{([^{}]*)\}/g
        let m
        while ((m = re.exec(css)) !== null) {
          const selector = m[1].trim()
          const body = m[2]
          selector.split(',').forEach(sel => {
            const ids = (sel.match(/#[A-Za-z0-9_-]+/g) || []).map(s =>
              s.slice(1)
            )
            const classes = (sel.match(/\.[A-Za-z0-9_-]+/g) || []).map(s =>
              s.slice(1)
            )
            const isAncestor = ids.some(id => ancestorTargets.includes(id))
            const isSectionRoot = classes.includes('cl-home-articles')
            if (!isAncestor && !isSectionRoot) return
            const hit = body.match(CONTAINING_BLOCK_RE)
            if (hit) offenders.push(`${file} :: ${sel.trim()} :: ${hit[2]}`)
          })
        }
      })
      expect(offenders).toEqual([])
    })

    test('新增样式不硬编码色值，一律走 --cl-* token', () => {
      expect(homeArticlesStyle).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(homeArticlesStyle).toContain('var(--cl-accent)')
      expect(homeArticlesStyle).toContain('var(--cl-text)')
      expect(homeArticlesStyle).toContain('var(--cl-muted)')
      expect(homeArticlesStyle).not.toContain('--cl-vermilion')
    })

    test('图版 3:4 + canvas 铺满框 + 图左文右 / 文字定宽贴右', () => {
      expect(homeArticlesStyle).toContain('aspect-ratio: 3 / 4')
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-plate-img \{[^}]*position: absolute;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-plate-img \{[^}]*width: 100%;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-plate-img \{[^}]*height: 100%;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-body \{[^}]*width: min\(100%, var\(--cl-home-article-measure\)\);/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article \{[^}]*grid-template-columns: var\(--cl-home-article-plate\) minmax\(0, 1fr\);/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article \{[^}]*scroll-snap-align: start;/
      )
    })

    test('移动端：满屏出血 + 文字 padding + 隐藏出口/导航/范围/CTA', () => {
      const start = homeArticlesStyle.indexOf('@media (max-width: 1023px) {')
      expect(start).toBeGreaterThan(-1)
      const mobile = homeArticlesStyle.slice(start, start + 4000)
      expect(mobile).toMatch(
        /\.cl-home-articles-rail \{[^}]*width: 100vw;/
      )
      expect(mobile).toMatch(
        /\.cl-home-articles-rail \{[^}]*margin-inline: calc\(-1 \* var\(--cl-wide-pad\)\);/
      )
      expect(mobile).toMatch(
        /\.cl-home-article-plate \{[^}]*width: var\(--plate-w, min\(100vw/
      )
      expect(mobile).toMatch(
        /\.cl-home-article-body \{[^}]*padding-inline: var\(--cl-wide-pad\);/
      )
      expect(mobile).toMatch(
        /\.cl-home-articles-top \{[^}]*display: none;/
      )
      expect(mobile).toMatch(
        /\.cl-home-article-cta \{[^}]*display: none;/
      )
      expect(mobile).toMatch(
        /\.cl-home-articles-nav,[\s\S]*?\.cl-home-articles-range \{[^}]*display: none;/
      )
    })

    test('短屏档收图版/标题/摘要', () => {
      expect(homeArticlesStyle).toContain(
        '@media (max-width: 1023px) and (max-height: 780px)'
      )
      expect(homeArticlesStyle).toContain(
        '@media (max-width: 1023px) and (max-height: 620px)'
      )
    })

    test('标题是 h2 + SmartLink；图版不是链接', () => {
      expect(stageSource).toContain("<h2 className='cl-home-article-title'>")
      expect(stageSource).toContain('<SmartLink href={article.href}>')
      expect(stageSource).toContain("className='cl-home-article-plate-img'")
      expect(stageSource).not.toMatch(
        /cl-home-article-plate[\s\S]{0,400}SmartLink/
      )
    })
  })

  describe('数据链路与退役护栏', () => {
    test('构建期产出 homeArticles（只取勾选）', () => {
      expect(pagesIndexSource).toContain('props.homeArticles')
      expect(pagesIndexSource).toContain('isFeaturedEntry')
      const block = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const featuredPosts'),
        pagesIndexSource.indexOf('props.homeArticles =')
      )
      expect(block).toContain('.filter(isFeaturedEntry)')
      expect(pagesIndexSource).toContain('widths: [512, 1024]')
      expect(pagesIndexSource).not.toContain('widths: [1024, 2048]')
      expect(pagesIndexSource).toContain(
        "sizes: '(max-width: 1023px) 100vw, 420px'"
      )
    })

    test('首页仍渲染 HomeArticleStage；旧抽牌/近期段不回归', () => {
      expect(themeIndexSource).toContain('HomeArticleStage')
      expect(themeIndexSource).not.toContain('LatestCard')
      expect(themeIndexSource).not.toContain('HomeRecent')
      expect(stageSource).not.toContain('totalLabel')
      expect(stageSource).not.toContain('postCount')
    })

    test('不引入动画库 / scroll 劫持', () => {
      ;[stageSource, focusSource, coverSource].forEach(src => {
        expect(src).not.toMatch(/from\s+['"]gsap/)
        expect(src).not.toContain('ScrollTrigger')
        expect(src).not.toMatch(/from\s+['"]framer-motion/)
        expect(src).not.toMatch(/from\s+['"]animejs/)
        expect(src).not.toMatch(/from\s+['"]lenis/)
      })
    })
  })
})
