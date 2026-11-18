/**
 * 首页精选文章章契约测试
 *
 * 桌面（>1023px）A「题名脊轨」：单篇舞台 + 四栏题名轴，悬停切换、无横向滑轨。
 * 手机（≤1023px）M1：原生横向轨道 + 四栏题名轴 + 顶部滑动朱砂条（由滚动量驱动）。
 * 两形态同挂，靠 ≤1023px 断点二选一；共用 session 篇位与纯函数。
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const {
  clampArticleIndex,
  resolveBarPos,
  formatArticleNo,
  formatAxisDay,
  isNodeVisible,
  isFeaturedEntry
} = require('../../../themes/circlelife/components/homeArticleFocus')

const desktopSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeArticleStage.js'
)
const mobileSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeArticleStageMobile.js'
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
const styleIndexSource = readFile('themes', 'circlelife', 'style.js')
const pagesIndexSource = readFile('pages', 'index.js')
const configSource = readFile('themes', 'circlelife', 'config.js')
const { homeArticlesStyle } = require('../../../themes/circlelife/styles/homeArticles')
const { homeArticleMobileStyle } = require('../../../themes/circlelife/styles/homeArticleMobile')
const homeStyleSource = readFile('themes', 'circlelife', 'styles', 'home.js')

const STYLE_FRAGMENTS = [
  ['styles/common.js', 'commonStyle'],
  ['styles/header.js', 'headerStyle'],
  ['styles/home.js', 'homeStyle'],
  ['styles/homeArticles.js', 'homeArticlesStyle'],
  ['styles/homeArticleMobile.js', 'homeArticleMobileStyle'],
  ['styles/mast.js', 'mastStyle'],
  ['styles/article.js', 'articleStyle'],
  ['styles/archive.js', 'archiveStyle']
]

/** 会造包含块 / 破坏 fixed 的属性 */
const CONTAINING_BLOCK_RE =
  /(^|;)\s*(transform|filter|backdrop-filter|perspective|contain|will-change)\s*:/

describe('circlelife 首页精选文章章（桌面 A / 手机 M1）', () => {
  describe('纯函数', () => {
    test('篇位夹取：越界 / 空集合 / 非数字', () => {
      expect(clampArticleIndex(2, 4)).toBe(2)
      expect(clampArticleIndex(-1, 4)).toBe(0)
      expect(clampArticleIndex(9, 4)).toBe(3)
      expect(clampArticleIndex(NaN, 4)).toBe(0)
      expect(clampArticleIndex(0, 0)).toBe(0)
      expect(clampArticleIndex(1.6, 4)).toBe(2)
    })

    test('朱砂条位置：一屏宽推进 0→1→…；夹在 [0,count-1]', () => {
      expect(resolveBarPos(0, 400, 4)).toBe(0)
      expect(resolveBarPos(400, 400, 4)).toBe(1)
      expect(resolveBarPos(600, 400, 4)).toBe(1.5)
      expect(resolveBarPos(-100, 400, 4)).toBe(0)
      expect(resolveBarPos(9999, 400, 4)).toBe(3)
      expect(resolveBarPos(100, 0, 4)).toBe(0)
      expect(resolveBarPos(NaN, 400, 4)).toBe(0)
      expect(resolveBarPos(100, 400, 0)).toBe(0)
    })

    test('日期与序号格式', () => {
      expect(formatAxisDay('2026-10-9')).toBe('10·09')
      expect(formatAxisDay('bad')).toBe('')
      expect(formatArticleNo(0)).toBe('01')
      expect(formatArticleNo(3)).toBe('04')
      expect(formatArticleNo(NaN)).toBe('01')
    })

    test('隐藏形态不视为可见（clientWidth=0）', () => {
      expect(isNodeVisible(null)).toBe(false)
      expect(isNodeVisible({ clientWidth: 0 })).toBe(false)
      expect(isNodeVisible({ clientWidth: 390 })).toBe(true)
    })

    test('精选判定（与影集共用）', () => {
      expect(isFeaturedEntry({ featured: true })).toBe(true)
      expect(isFeaturedEntry({ 精选: true })).toBe(true)
      expect(isFeaturedEntry({ featured: ['精选'] })).toBe(true)
      expect(isFeaturedEntry({})).toBe(false)
      expect(isFeaturedEntry(null)).toBe(false)
    })
  })

  describe('桌面 A：悬停题名轴（无滑轨）', () => {
    test('悬停/焦点/点按切换 + 移出淡回第 1 篇', () => {
      expect(desktopSource).toContain('onMouseEnter={() => goTo(index)}')
      expect(desktopSource).toContain('onFocus={() => goTo(index)}')
      expect(desktopSource).toContain('onClick={() => goTo(index)}')
      expect(desktopSource).toContain('onMouseLeave={onMouseLeave}')
      expect(desktopSource).toContain('goTo(0)')
      // 焦点仍在段内时不复位
      expect(desktopSource).toContain('section.contains(document.activeElement)')
    })

    test('桌面没有横向滑轨：rail / 滚动驱动只出现在手机组件', () => {
      expect(desktopSource).not.toContain('cl-home-articles-rail')
      expect(desktopSource).not.toContain("addEventListener('scroll'")
      expect(desktopSource).not.toContain('resolveBarPos')
      expect(desktopSource).toContain('cl-home-articles-stage')
      expect(mobileSource).toContain('cl-home-articles-rail')
      expect(homeArticlesStyle).toContain(
        '.cl-home-articles:not(.cl-home-articles-m)'
      )
    })

    test('四栏题名轴：编号 + 完整标题 + 日期；选中左缘朱砂竖线 + 右移 3px', () => {
      expect(desktopSource).toContain("aria-label='精选文章题名轴'")
      expect(desktopSource).toContain('cl-home-articles-axis-no')
      expect(desktopSource).toContain('cl-home-articles-axis-title')
      expect(desktopSource).toContain('cl-home-articles-axis-date')
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-axis-item::before \{[^}]*width: 2px;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-axis-item\.is-active::before \{[^}]*transform: scaleY\(1\);/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-axis-item\.is-active\s+\.cl-home-articles-axis-title \{[^}]*translateX\(3px\)/
      )
      expect(homeArticlesStyle).toContain('var(--cl-accent-soft)')
    })

    test('舞台交叉淡入只动 opacity / visibility；隐藏篇 aria-hidden', () => {
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article \{[\s\S]*?opacity: 0;[\s\S]*?visibility: hidden;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article\.is-active \{[\s\S]*?opacity: 1;/
      )
      expect(desktopSource).toContain(
        "aria-hidden={index === activeIndex ? undefined : 'true'}"
      )
      expect(desktopSource).toContain('aria-current={index === activeIndex')
    })

    test('键盘 / aria-live / session 记忆 / 回顶键隐藏', () => {
      ;["event.key === 'ArrowLeft'", "event.key === 'ArrowRight'", "event.key === 'Home'", "event.key === 'End'"].forEach(
        key => expect(desktopSource).toContain(key)
      )
      expect(desktopSource).toContain("aria-live='polite'")
      expect(desktopSource).toContain('sessionStorage')
      expect(desktopSource).toContain("'cl-home-article-index-v2'")
      expect(desktopSource).toContain('cl-home-article-active')
      expect(homeStyleSource).toContain(
        'html.cl-home-article-active #theme-circlelife .cl-backtop.is-visible'
      )
    })

    test('显式 persist：只在 goTo 落盘；restore 只读；隐藏形态不写', () => {
      expect(desktopSource).toContain('const persist = useCallback')
      expect(desktopSource).toContain('persist(next)')
      expect(desktopSource).toContain('isNodeVisible(sectionRef.current)')
      expect(desktopSource).toContain('restore()')
      // 不做「active 变化 + 首帧跳过」的 effect（影集段踩过的隐藏态吞帧坑）
      expect(desktopSource).not.toContain('didWriteRef')
      expect(desktopSource).not.toContain('didRestoreRef')
    })

    test('图版继续走 HomeArticleCover（1024，无 2048）', () => {
      expect(desktopSource).toContain("from './HomeArticleCover'")
      expect(desktopSource).toContain('coverRefs')
      expect(desktopSource).toContain("arm('high')")
      expect(desktopSource).toContain('prefetch()')
      expect(desktopSource).toContain('release()')
      expect(desktopSource).not.toContain('CanvasImage')
      expect(desktopSource).toContain("className='cl-home-article-plate-img'")
      expect(desktopSource).toContain(
        'position={`50% ${(article.cover.pos ?? 0.5) * 100}%`}'
      )
      expect(coverSource).toContain('ARTICLE_COVER_TIER = 1024')
      expect(coverSource).not.toContain('2048')
    })
  })

  describe('手机 M1：顶部滑动朱砂条', () => {
    test('原生横向轨道 + scroll-snap，不劫持 wheel/touch', () => {
      expect(mobileSource).toContain('cl-home-articles-rail')
      expect(mobileSource).toContain('IntersectionObserver')
      expect(mobileSource).toContain('scrollTo(')
      expect(mobileSource).toContain('data-index')
      expect(homeArticlesStyle).toContain('scroll-snap-type: x mandatory')
      expect(homeArticlesStyle).toContain('scroll-snap-stop: always')
      expect(homeArticlesStyle).toContain('overscroll-behavior-x: contain')
      expect(mobileSource).not.toContain("addEventListener('wheel'")
      expect(mobileSource).not.toContain("addEventListener('touchmove'")
      expect(mobileSource).not.toContain('window.scrollY')
    })

    test('朱砂条由 scrollLeft 连续驱动：被动 scroll + rAF，只写 CSS 变量', () => {
      expect(mobileSource).toContain('resolveBarPos')
      expect(mobileSource).toContain('syncBar')
      expect(mobileSource).toContain("addEventListener('scroll', scheduleBar, { passive: true })")
      expect(mobileSource).toContain('requestAnimationFrame')
      expect(mobileSource).toContain("bar.style.setProperty(\n      '--bar-pos'")
      // 滚动只同步条：不量测布局、不 setState；布局重算只在 resize/load/fonts
      expect(mobileSource).toContain('scheduleLayout')
      expect(mobileSource).not.toContain("addEventListener('scroll', scheduleLayout")
      expect(mobileSource).not.toContain("setProperty('--cl-ha-pos'")
      expect(mobileSource).not.toContain('setInterval')
    })

    test('条与栏等宽、两端齐平；栏数由 inline 变量注入', () => {
      expect(homeArticleMobileStyle).toContain(
        'width: calc(100% / var(--cl-home-article-cols, 4))'
      )
      expect(homeArticleMobileStyle).toContain(
        'transform: translateX(calc(var(--bar-pos, 0) * 100%))'
      )
      expect(mobileSource).toContain("'--cl-home-article-cols': count")
      // 手机不再画左缘竖线
      expect(homeArticleMobileStyle).toMatch(
        /\.cl-home-articles-m \.cl-home-articles-axis-item::before \{[^}]*display: none;/
      )
    })

    test('点按切篇 + 标题两行截断 + 淡朱砂底色', () => {
      expect(mobileSource).toContain('onClick={() => goTo(index)}')
      expect(homeArticleMobileStyle).toMatch(
        /\.cl-home-articles-m \.cl-home-articles-axis-title \{[^}]*-webkit-line-clamp: 2;/
      )
      expect(homeArticlesStyle).toContain('var(--cl-accent-soft)')
      expect(mobileSource).toContain('cl-home-articles-axis-no')
    })

    test('恢复 / 转屏重对齐 / 显式 persist（goTo + IO），无首帧守卫坑', () => {
      expect(mobileSource).toContain('const persist = useCallback')
      expect(mobileSource).toContain('persist(next)')
      expect(mobileSource).toContain('persist(index)')
      expect(mobileSource).not.toContain('didWriteRef')
      expect(mobileSource).not.toContain('didRestoreRef')
      expect(mobileSource).toContain(
        'sessionStorage.getItem(ARTICLE_INDEX_KEY)'
      )
      expect(mobileSource).toContain(
        'sessionStorage.setItem(ARTICLE_INDEX_KEY'
      )
      expect(mobileSource).toContain("rail.style.scrollBehavior = 'auto'")
      expect(mobileSource).toContain('railWidthRef')
      expect(mobileSource).toContain('wasVisibleRef')
      expect(mobileSource).toContain('isNodeVisible(sectionRef.current)')
    })

    test('键盘 / aria-live 与桌面一致', () => {
      ;["event.key === 'ArrowLeft'", "event.key === 'ArrowRight'", "event.key === 'Home'", "event.key === 'End'"].forEach(
        key => expect(mobileSource).toContain(key)
      )
      expect(mobileSource).toContain("aria-live='polite'")
      expect(mobileSource).toContain("aria-roledescription='carousel'")
    })
  })

  describe('几何、排版与两形态接入', () => {
    test('fixed 祖先链不得带 transform/filter/contain/will-change', () => {
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

    test('桌面图版受舞台高度约束，不溢出压到题名轴', () => {
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles-stage \{[^}]*overflow: hidden;/
      )
      expect(homeArticlesStyle).toContain('calc(100% - 2.5rem)')
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-articles:not\(\.cl-home-articles-m\)\s+\.cl-home-article-plate \{[^}]*align-items: flex-start;/
      )
      expect(homeArticlesStyle).toContain(
        'grid-template-columns: auto minmax(0, 1fr)'
      )
    })

    test('桌面图轴留气隙，文章段到影集段间距收紧', () => {
      expect(homeArticlesStyle).toContain(
        'margin-top: calc(var(--cl-home-section-pad) - 3rem)'
      )
      expect(homeArticlesStyle).toContain('+ .cl-home-articles-m')
    })

    test('图版 3:4 + canvas 铺满框 + 文字定宽贴右', () => {
      expect(homeArticlesStyle).toContain('aspect-ratio: 3 / 4')
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-plate-img \{[^}]*position: absolute;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-plate-img \{[^}]*width: 100%;/
      )
      expect(homeArticlesStyle).toMatch(
        /\.cl-home-article-body \{[^}]*width: min\(100%, var\(--cl-home-article-measure\)\);/
      )
    })

    test('断点二选一：桌面隐藏手机形态，手机隐藏桌面形态', () => {
      expect(homeArticlesStyle).toMatch(
        /@media \(min-width: 1024px\)[\s\S]*\.cl-home-articles-m \{[\s\S]*display: none;/
      )
      expect(homeArticleMobileStyle).toMatch(
        /@media \(max-width: 1023px\)[\s\S]*\.cl-home-articles:not\(\.cl-home-articles-m\) \{[\s\S]*display: none;/
      )
    })

    test('短屏档收图版/标题/摘要', () => {
      expect(homeArticleMobileStyle).toContain(
        '@media (max-width: 1023px) and (max-height: 780px)'
      )
      expect(homeArticleMobileStyle).toContain(
        '@media (max-width: 1023px) and (max-height: 620px)'
      )
    })

    test('新增样式不硬编码色值，一律走 --cl-* token', () => {
      ;[homeArticlesStyle, homeArticleMobileStyle].forEach(css => {
        expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      })
      expect(homeArticlesStyle).toContain('var(--cl-accent)')
      expect(homeArticlesStyle).toContain('var(--cl-text)')
      expect(homeArticlesStyle).toContain('var(--cl-muted)')
      expect(homeArticlesStyle).not.toContain('--cl-vermilion')
    })

    test('两形态同挂；样式在文章段之后、影集手机样式之前注入', () => {
      expect(themeIndexSource).toContain('<HomeArticleStage articles=')
      expect(themeIndexSource).toContain('<HomeArticleStageMobile articles=')
      expect(
        themeIndexSource.indexOf('<HomeArticleStage articles=')
      ).toBeLessThan(themeIndexSource.indexOf('<HomeArticleStageMobile'))
      expect(styleIndexSource).toContain('homeArticleMobileStyle')
      expect(
        styleIndexSource.indexOf('homeArticlesStyle')
      ).toBeLessThan(styleIndexSource.indexOf('homeArticleMobileStyle'))
      expect(
        styleIndexSource.indexOf('homeArticleMobileStyle')
      ).toBeLessThan(styleIndexSource.indexOf('homeAlbumMobileStyle'))
    })

    test('首页仍渲染文章段；旧抽牌/近期段不回归', () => {
      expect(themeIndexSource).toContain('HomeArticleStage')
      expect(themeIndexSource).not.toContain('LatestCard')
      expect(themeIndexSource).not.toContain('HomeRecent')
      expect(desktopSource).not.toContain('totalLabel')
      expect(desktopSource).not.toContain('postCount')
    })

    test('不引入动画库 / scroll 劫持', () => {
      ;[desktopSource, mobileSource, focusSource, coverSource].forEach(src => {
        expect(src).not.toMatch(/from\s+['"]gsap/)
        expect(src).not.toContain('ScrollTrigger')
        expect(src).not.toMatch(/from\s+['"]framer-motion/)
        expect(src).not.toMatch(/from\s+['"]animejs/)
        expect(src).not.toMatch(/from\s+['"]lenis/)
      })
    })
  })

  describe('数据链路：硬上限 4 篇', () => {
    test('config 默认 4，pages 用 Math.min 夹到 4', () => {
      expect(configSource).toContain('CIRCLELIFE_HOME_ARTICLE_COUNT: 4')
      expect(pagesIndexSource).toContain('HOME_ARTICLE_LIMIT = 4')
      const block = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const homeArticleCount'),
        pagesIndexSource.indexOf('const allPostPages')
      )
      expect(block).toContain('Math.min(')
      expect(block).toContain('HOME_ARTICLE_LIMIT')
      expect(block).not.toContain("CIRCLELIFE_HOME_ARTICLE_COUNT', 6")
    })

    test('构建期产出 homeArticles（只取勾选）', () => {
      expect(pagesIndexSource).toContain('props.homeArticles')
      expect(pagesIndexSource).toContain('isFeaturedEntry')
      const block = pagesIndexSource.slice(
        pagesIndexSource.indexOf('const featuredPosts'),
        pagesIndexSource.indexOf('props.homeArticles =')
      )
      expect(block).toContain('.filter(isFeaturedEntry)')
      expect(block).toContain('.sort(byDateDesc)')
      expect(block).toContain('.slice(0, homeArticleCount)')
      expect(pagesIndexSource).toContain('widths: [512, 1024]')
      expect(pagesIndexSource).not.toContain('widths: [1024, 2048]')
    })
  })
})
