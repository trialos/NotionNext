/**
 * 首页精选文章章 + 收尾「近期」段 的契约测试
 *
 * 背景：首页下半部从「抽牌小卡 + 窄栏时间线」改成全屏章节 ——
 * 精选文章一文一屏（底部时间标尺）+ 近期段单栏排版。
 *
 * 这里守九类容易悄悄坏掉的东西：
 *
 * 1. 刻度算法纯函数：真实日距比例、同日错开、端点夹紧、非法日期降级
 * 2. 焦点判定：边界取后一篇、空数组不炸
 * 3. 近三月窗口：基准是「最新一篇」而不是墙上时钟，max 截断生效
 * 4. 精选判定：checkbox / 原始列名 / Select 降级形态
 * 5. 性能纪律：不引动画库、不写 transform、不加常驻 scroll 监听
 * 6. 几何纪律：fixed 标尺的祖先链不得带 transform/filter/contain/will-change
 * 7. 令牌纪律：新增样式不硬编码色值
 * 8. 标题层级：章标题 h2、单篇标题 h3（首页 h1 已被照片墙题字占用）
 * 9. 退役护栏：抽牌与首页窄栏时间线不得回到首页
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
  parsePublishDay,
  pickCurrentIndex
} = require('../../../themes/circlelife/components/homeArticleFocus')
const { isFeaturedEntry } = require('../../../themes/circlelife/components/homeAlbumFocus')

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
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const pagesIndexSource = readFile('pages', 'index.js')
const { homeArticlesStyle } = require('../../../themes/circlelife/styles/homeArticles')

/** 会造包含块 / 破坏 fixed 的属性 */
const CONTAINING_BLOCK_RE =
  /(^|;)\s*(transform|filter|backdrop-filter|perspective|contain|will-change)\s*:/

/** 主题全部样式片段（祖先链扫描用） */
const STYLE_FRAGMENTS = [
  ['styles/common.js', 'commonStyle'],
  ['styles/header.js', 'headerStyle'],
  ['styles/home.js', 'homeStyle'],
  ['styles/homeArticles.js', 'homeArticlesStyle'],
  ['styles/mast.js', 'mastStyle'],
  ['styles/article.js', 'articleStyle'],
  ['styles/archive.js', 'archiveStyle']
]

describe('circlelife 首页精选文章章', () => {
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
      // 10-11 → 10-22 共 11 天：位置自最早一篇量起，10-15 距最早 4 天 → 4/11
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
      const gapPx = Math.abs(pos[1] - pos[0]) * 1000
      expect(gapPx).toBeGreaterThanOrEqual(56 - 0.001)
    })

    test('全部同一比例（无日距）→ 退化为均匀分布，不重叠', () => {
      const pos = computeRulerPositions(
        ['2026-10-09', '2026-10-09', '2026-10-09'],
        { width: 900, minGap: 56 }
      )
      expect(pos).toHaveLength(3)
      expect(pos[0]).toBeLessThan(pos[1])
      expect(pos[1]).toBeLessThan(pos[2])
      for (let i = 1; i < pos.length; i++) {
        expect((pos[i] - pos[i - 1]) * 900).toBeGreaterThanOrEqual(56 - 0.001)
      }
    })

    test('端点夹紧在 [0,1] 内，且顺序稳定（不倒挂）', () => {
      // 输入是「最新在前」（DOM 顺序）→ 位置自左（最旧）到右（最新）递增
      const pos = computeRulerPositions(
        [
          '2026-10-22',
          '2026-10-20',
          '2026-10-18',
          '2026-10-17',
          '2026-10-15',
          '2026-10-11'
        ],
        { width: 1344, minGap: RULER_MIN_GAP }
      )
      pos.forEach(p => {
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
      })
      // 最新的在轴的最右端，最旧的在最左端
      expect(pos[0]).toBeCloseTo(1, 5)
      expect(pos[pos.length - 1]).toBeCloseTo(0, 5)
      // 相对次序不倒挂
      for (let i = 1; i < pos.length; i++) {
        expect(pos[i]).toBeLessThanOrEqual(pos[i - 1])
      }
    })

    test('非法日期降级（不产生 NaN）', () => {
      const pos = computeRulerPositions(
        ['2026-10-22', 'not-a-date', '2026-10-11'],
        { width: 1000 }
      )
      pos.forEach(p => {
        expect(Number.isFinite(p)).toBe(true)
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
      })
    })

    test('宽度非法 → 退回比例位置（不崩）', () => {
      const pos = computeRulerPositions(['2026-10-22', '2026-10-11'], {
        width: 0
      })
      expect(pos).toHaveLength(2)
      pos.forEach(p => expect(Number.isFinite(p)).toBe(true))
    })
  })

  describe('publishDay 解析（不补零）', () => {
    test('不补零的日期也能解析到同一个 UTC 零点', () => {
      expect(parsePublishDay('2026-10-9')).toBe(
        Date.UTC(2026, 9, 9)
      )
      expect(parsePublishDay('2026-10-09')).toBe(
        Date.UTC(2026, 9, 9)
      )
      expect(parsePublishDay('2026-10-9')).toBe(parsePublishDay('2026-10-09'))
    })

    test('非法输入 → null（不抛错）', () => {
      expect(parsePublishDay('')).toBeNull()
      expect(parsePublishDay(null)).toBeNull()
      expect(parsePublishDay(undefined)).toBeNull()
      expect(parsePublishDay('2026/10/09')).toBeNull()
      expect(parsePublishDay('2026-13-45')).toBeNull()
    })

    test('日期标签与月份跨度', () => {
      expect(formatRulerDay('2026-10-9')).toBe('10·09')
      expect(formatRulerDay('2026-10-22')).toBe('10·22')
      expect(formatRulerDay('bad')).toBe('')
      expect(formatMonthRange(['2026-10-22', '2026-08-07'])).toBe('2026 · 08 — 10')
      expect(formatMonthRange(['2025-12-20', '2026-10-22'])).toBe(
        '2025-12 — 2026-10'
      )
      expect(formatMonthRange([])).toBe('')
    })
  })

  describe('当前篇判定', () => {
    const entries = [
      { top: 0, height: 100 },
      { top: 100, height: 100 },
      { top: 200, height: 100 }
    ]

    test('命中中间一篇', () => {
      expect(pickCurrentIndex(entries, 150)).toBe(1)
      expect(pickCurrentIndex(entries, 0)).toBe(0)
      expect(pickCurrentIndex(entries, 250)).toBe(2)
    })

    test('边界取后一篇（与向下滚动同向）', () => {
      expect(pickCurrentIndex(entries, 100)).toBe(1)
    })

    test('空数组 / 非法焦点 → 0（不炸）', () => {
      expect(pickCurrentIndex([], 10)).toBe(0)
      expect(pickCurrentIndex(null, 10)).toBe(0)
      expect(pickCurrentIndex(entries, NaN)).toBe(0)
    })
  })

  describe('精选判定（文章与影集共用）', () => {
    test('布尔值（Notion Checkbox 解析结果）', () => {
      expect(isFeaturedEntry({ featured: true })).toBe(true)
      expect(isFeaturedEntry({ featured: false })).toBe(false)
    })

    test('原始列名「精选」也能识别（未走映射时）', () => {
      expect(isFeaturedEntry({ 精选: true })).toBe(true)
      expect(isFeaturedEntry({ 精选: false })).toBe(false)
    })

    test('Select / MultiSelect 降级形态', () => {
      expect(isFeaturedEntry({ featured: ['精选'] })).toBe(true)
      expect(isFeaturedEntry({ featured: ['日常'] })).toBe(false)
      expect(isFeaturedEntry({ featured: 'Featured' })).toBe(true)
    })

    test('列不存在 / 非法值 → 视为未标记', () => {
      expect(isFeaturedEntry({})).toBe(false)
      expect(isFeaturedEntry(null)).toBe(false)
    })
  })

  describe('性能与依赖纪律', () => {
    test('不引入任何动画库', () => {
      ;[stageSource, focusSource].forEach(src => {
        expect(src).not.toMatch(/from\s+['"]gsap/)
        expect(src).not.toContain('ScrollTrigger')
        expect(src).not.toMatch(/from\s+['"]framer-motion/)
        expect(src).not.toMatch(/from\s+['"]animejs/)
        expect(src).not.toMatch(/from\s+['"]lenis/)
      })
    })

    test('不写任何 transform 到样式上（游标只写 CSS 变量）', () => {
      ;[stageSource, focusSource].forEach(src => {
        expect(src).not.toContain('style.transform')
        expect(src).not.toContain('translate3d')
        expect(src).not.toContain('translateY(')
      })
      // 游标：每帧只写一个 CSS 变量，位移交给 CSS 的 transform（合成层，不触发布局）
      expect(stageSource).toContain("setProperty('--cursor-x'")
    })

    test('滚动监听是 rAF 节流 + 只读 scrollY（零布局读取）', () => {
      expect(stageSource).toContain('requestAnimationFrame')
      expect(stageSource).toContain(
        "addEventListener('scroll', onScroll, { passive: true })"
      )
      expect(stageSource).toContain("removeEventListener('scroll', onScroll)")
      // 滚动回调（apply）里不得读布局 —— 几何全是预算好的
      const apply = stageSource.match(/const apply = \(\) => \{([\s\S]*?)\n    \}/)
      expect(apply).not.toBeNull()
      expect(apply[1]).not.toContain('getBoundingClientRect')
      expect(apply[1]).not.toContain('offsetHeight')
      expect(apply[1]).not.toContain('offsetTop')
      expect(apply[1]).not.toContain('getComputedStyle')
      expect(apply[1]).toContain('window.scrollY')
    })

    test('刻度位置只在 mount / resize 测一次（滚动路径零布局读取）', () => {
      expect(stageSource).toContain('clientWidth')
      expect(stageSource).toContain("addEventListener('resize'")
      expect(stageSource).toContain("removeEventListener('resize'")
    })

    test('换篇用纯 CSS 透明度交叉淡入（无 JS 动画）', () => {
      // 关键帧入场已下线（不再有「一篇一屏」的逐屏入场），
      // 换篇只靠 opacity 过渡 + visibility 延迟；时长走全站共用的
      // --cl-home-switch（与影集段同一道曲线）
      expect(homeArticlesStyle).toContain(
        'transition: opacity var(--cl-home-switch) var(--cl-ease)'
      )
      expect(homeArticlesStyle).toContain('visibility 0s linear var(--cl-home-switch)')
      expect(stageSource).not.toContain('<Transition')
      expect(stageSource).not.toContain('requestAnimationFrame(() =>')
    })
  })

  describe('几何与令牌纪律', () => {
    test('fixed 标尺的祖先链不得带 transform/filter/contain/will-change', () => {
      // 祖先链：#theme-circlelife → #container-inner → #container-wrapper
      //          → .cl-home-articles（标尺挂在章节内部）
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
            const ids = (sel.match(/#[A-Za-z0-9_-]+/g) || []).map(s => s.slice(1))
            const classes = (sel.match(/\.[A-Za-z0-9_-]+/g) || []).map(s => s.slice(1))
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
      // --cl-vermilion 并未在 tokens.js 定义，禁用
      expect(homeArticlesStyle).not.toContain('--cl-vermilion')
    })

    test('图版用 3:4 直角框，桌面与移动端同比例（构图一致）', () => {
      expect(homeArticlesStyle).toContain('aspect-ratio: 3 / 4')
      expect(homeArticlesStyle).toContain('object-fit: cover')
      // img 必须绝对定位，否则 height:100% 会把 aspect-ratio 顶掉
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-plate-frame img \{[^}]*position: absolute;/
      )
    })

    test('一窗一屏：窗口钉住 + 一段滚动行程（不是一篇一屏）', () => {
      expect(homeArticlesStyle).toContain('--cl-home-article-step: 10vh')
      expect(homeArticlesStyle).toContain(
        'height: calc(100svh + var(--cl-home-article-sweep))'
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-panel \{[^}]*position: sticky;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-panel \{[^}]*height: 100svh;/
      )
      // 行程 = (篇数 − 1) × 步距
      expect(homeArticlesStyle).toContain(
        '(var(--cl-home-article-count, 6) - 1) * var(--cl-home-article-step)'
      )
    })

    test('章节内不设标题，只留右上角「全部文章 N 篇 →」', () => {
      expect(stageSource).not.toContain('cl-home-articles-kicker')
      expect(stageSource).not.toContain("className='cl-home-articles-title'")
      expect(stageSource).toContain("className='cl-home-sec-link'")
      expect(stageSource).toContain('全部文章')
      expect(stageSource).toContain("aria-label='精选文章'")
    })

    test('文章层全部叠在一格里，靠 opacity 换篇', () => {
      expect(stageSource).toContain("className='cl-home-articles-stage'")
      expect(stageSource).toContain("' is-active'")
      expect(stageSource).toContain("' is-prev'")
    })

    test('不引入 scroll-snap / 自动轮播（自由滚动）', () => {
      expect(homeArticlesStyle).not.toContain('scroll-snap')
      expect(stageSource).not.toContain('setInterval')
      expect(stageSource).not.toContain('setTimeout')
    })
  })

  describe('结构与标题层级', () => {
    test('文章标题是 h2（首页 h1 已被照片墙题字占用，章节不再有 h2 标题）', () => {
      expect(stageSource).toContain("<h2 className='cl-home-article-title'")
      expect(stageSource).not.toContain('<h3 className=')
      expect(stageSource).toContain("aria-label='精选文章'")
    })

    test('图文整组居中（整组贴左会在右侧留一大块空白）', () => {
      // 改版后：图版贴左边缘、文字栏贴右边缘（margin-left:auto），
      // 横向 footprint 与影集段一致 —— 不再靠「限宽居中」收窄
      expect(homeArticlesStyle).not.toContain('--cl-home-article-spread')
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-body \{[^}]*margin-left: auto;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-body \{[^}]*max-width: var\(--cl-home-article-measure\);/
      )
      // 栅格：图版列 + 文字列，列间距走全站宽容器的间距 token
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article \{[^}]*grid-template-columns: var\(--cl-home-article-plate\) minmax\(0, 1fr\);/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article \{[^}]*gap: var\(--cl-wide-gap\);/
      )
      // 时间轴满内容宽（与影集段 body 同宽）
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-ruler \{[^}]*width: 100%;/
      )
    })

    test('段头只留右上角一个出口，且与影集段共用同一个链接类', () => {
      expect(stageSource).toContain("className='cl-home-sec-link'")
      expect(stageSource).not.toContain('cl-home-articles-all')
      expect(stageSource).not.toContain('cl-home-articles-kicker')
      expect(stageSource).not.toContain('cl-home-articles-title')
      // 共享类必须真的定义在样式里（否则两段长得不一样）
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-sec-link \{[^}]*font-family: var\(--cl-font-mono\);/
      )
    })

    test('章节间距与影集段统一（同一个 token）', () => {
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      expect(tokenStyle).toContain('--cl-home-section-gap:')
      expect(tokenStyle).toContain('--cl-home-section-pad:')
      // 文章段：窗口上内边距用统一值
      expect(homeArticlesStyle).toContain(
        'padding: var(--cl-home-section-pad) var(--cl-wide-pad) 1rem'
      )
      // 影集段：章节外边距用同一个统一值
      const { homeStyle } = require('../../../themes/circlelife/styles/home')
      expect(homeStyle).toContain('margin-block: var(--cl-home-section-pad)')
    })

    test('首页不再有「近期」段（博主判定冗余，已下线）', () => {
      expect(themeIndexSource).not.toContain('HomeRecent')
      expect(themeIndexSource).not.toContain('homeRecent')
      expect(homeArticlesStyle).not.toContain('cl-home-recent')
      expect(() =>
        readFile('themes', 'circlelife', 'components', 'HomeRecent.js')
      ).toThrow()
    })

    test('时间轴是刻度 + 游标（读数，不是控件）', () => {
      expect(stageSource).toContain("className='cl-home-articles-cursor'")
      expect(stageSource).toContain('cl-home-articles-tick')
      expect(stageSource).toContain("aria-hidden='true'")
      expect(homeArticlesStyle).toContain('will-change: transform')
    })

    test('图版是装饰图（alt 空），标题在文字里', () => {
      expect(stageSource).toMatch(/<img[\s\S]{0,220}alt=''/)
    })
  })

  describe('退役护栏', () => {
    test('首页不再引用抽牌组件', () => {
      expect(themeIndexSource).not.toContain('LatestCard')
      expect(() =>
        readFile('themes', 'circlelife', 'components', 'LatestCard.js')
      ).toThrow()
    })

    test('首页分支不再渲染窄栏时间线', () => {
      // 组件本身保留（/page/[page]、/category/*、/tag/* 仍在用），
      // 但首页不得再渲染 BlogListPage / BlogListScroll
      const homeBranch = themeIndexSource.slice(
        themeIndexSource.indexOf('const LayoutPostList'),
        themeIndexSource.indexOf('const LayoutSlug')
      )
      expect(homeBranch).toContain('!isHome &&')
      expect(homeBranch).toContain('HomeArticleStage')
      expect(homeBranch).not.toContain('HomeRecent')
      const listBlock = homeBranch.slice(
        homeBranch.indexOf('{!isHome && ('),
        homeBranch.indexOf('{!isHome && (') + 700
      )
      expect(listBlock).toContain('BlogListPage')
      expect(listBlock).toContain('BlogListScroll')
    })

    test('抽牌样式已从 home.js 移除', () => {
      const { homeStyle } = require('../../../themes/circlelife/styles/home')
      expect(homeStyle).not.toContain('cl-latest-card')
      expect(homeStyle).not.toContain('cl-deck')
      expect(homeStyle).not.toContain('cl-hero-dot')
    })

    test('HomeTimeline 组件仍在（列表页仍需要）', () => {
      expect(() =>
        readFile('themes', 'circlelife', 'components', 'HomeTimeline.js')
      ).not.toThrow()
    })
  })

  describe('数据链路', () => {
    test('构建期产出 homeArticles', () => {
      expect(pagesIndexSource).toContain('props.homeArticles')
      expect(pagesIndexSource).toContain('isFeaturedEntry')
      expect(pagesIndexSource).not.toContain('props.homeRecent')
    })

    test('精选文章只取勾选的（不补齐）', () => {
      const block = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const featuredPosts'),
        pagesIndexSource.indexOf('props.homeArticles =')
      )
      expect(block).toContain('.filter(isFeaturedEntry)')
      // 没有「未勾选的最新文章」参与拼接 → 不做补齐
      expect(block).not.toContain('restPosts')
      expect(block).not.toContain('rest')
    })

    test('图版只用 512 / 1024 两档（不拉 2048 档）', () => {
      expect(pagesIndexSource).toContain('widths: [512, 1024]')
      expect(pagesIndexSource).not.toContain('widths: [1024, 2048]')
    })

    test('Notion「精选」勾选链路仍然完整（列名映射 + 白名单）', () => {
      const siteDataSource = readFile('lib', 'db', 'SiteDataApi.js')
      const notionConfigSource = readFile('conf', 'notion.config.js')
      expect(siteDataSource).toContain("'featured'")
      expect(notionConfigSource).toContain("featured:")
    })
  })
})
