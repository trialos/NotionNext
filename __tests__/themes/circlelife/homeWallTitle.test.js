/**
 * 首页照片墙题字契约测试
 *
 * 背景：首页 8° 倾斜照片墙新增了「与我同行 / WITH CIRCLE OF LIFE」两行题字。
 * 题字是 position: fixed 的浮层，与照片墙同源（同一套 RAF 进度与呼吸）。
 * 这里守三类容易悄悄坏掉的东西：
 *
 * 1. 无障碍与 DOM 结构：题字必须在 aria-hidden 的画布层之外，
 *    中文是 h1、英文带 lang="en"、装饰细线 aria-hidden。
 * 2. 性能与依赖纪律：题字不得引入任何动画库（GSAP 等），
 *    不得新增第二套滚动/RAF 语义；入场必须是纯 CSS 关键帧。
 * 3. fixed 定位的前置条件：祖先链上出现 transform / filter / contain /
 *    will-change 会把 fixed 降级成相对定位，题字就会随页面滚走。
 *    这条靠静态扫描所有主题样式片段来守。
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const themeDir = path.join(rootDir, 'themes', 'circlelife')
const themeSource = readFile('themes', 'circlelife', 'components', 'HomeTiltWall.js')
const { homeStyle } = require('../../../themes/circlelife/styles/home')
const tiltProgress = require('../../../themes/circlelife/components/tiltProgress')

const stylesDir = path.join(themeDir, 'styles')
const styleFragments = fs
  .readdirSync(stylesDir)
  .filter(f => f.endsWith('.js'))
  .map(f => ({ file: f, css: fs.readFileSync(path.join(stylesDir, f), 'utf8') }))

/** 题字浮层的祖先链：这些元素一旦带上包含块属性，fixed 就会失效 */
const ANCESTOR_IDS = ['container-inner', 'container-wrapper']
const ANCESTOR_CLASSES = ['cl-home-tilt-track-wrapper', 'cl-home-tilt-section']

/** 会让祖先成为固定定位包含块的属性 */
const CONTAINING_BLOCK_PROPS = [
  'transform',
  'filter',
  'backdrop-filter',
  'perspective',
  'contain',
  'will-change',
  'translate',
  'rotate',
  'scale'
]
const CONTAINING_BLOCK_RE = new RegExp(
  `(^|;)\\s*(${CONTAINING_BLOCK_PROPS.join('|')})\\s*:`,
  'm'
)

/** 取选择器里最后一个 compound（目标元素），兼容后代/子代/兄弟选择器 */
const targetCompound = selector => {
  const parts = selector.trim().split(/[\s>+~]+/).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : ''
}

const idsOf = compound =>
  (compound.match(/#[A-Za-z0-9_-]+/g) || []).map(s => s.slice(1))
const classesOf = compound =>
  (compound.match(/\.[A-Za-z0-9_-]+/g) || []).map(s => s.slice(1))

/** 判断某个 compound 是否就是（或就是）某个祖先元素本身 */
const targetsAncestor = compound => {
  const ids = idsOf(compound)
  const classes = classesOf(compound)
  // #theme-circlelife 只认「自身」形态（不能带后代选择器，也不能是 .cl-home-tilt-* 子类）
  const isThemeRoot =
    ids.includes('theme-circlelife') &&
    !classes.some(c => c.startsWith('cl-home-tilt-'))
  const isAncestor =
    ids.some(id => ANCESTOR_IDS.includes(id)) ||
    classes.some(c => ANCESTOR_CLASSES.includes(c))
  return isThemeRoot || isAncestor
}

/** 抽出所有内层规则（@media 里的规则也会被正确抽出：正则不跨花括号） */
const extractRules = css => {
  const rules = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m
  while ((m = re.exec(css)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2] })
  }
  return rules
}

describe('circlelife 首页照片墙题字', () => {
  describe('DOM 与无障碍', () => {
    test('题字三行结构齐全，且在 aria-hidden 的画布层之外', () => {
      expect(themeSource).toContain('cl-home-tilt-title-zh')
      expect(themeSource).toContain('cl-home-tilt-title-rule')
      expect(themeSource).toContain('cl-home-tilt-title-en')

      // 画布层仍是装饰层（aria-hidden）
      expect(themeSource).toContain(
        "<div ref={panRef} className='cl-home-tilt-pan' aria-hidden='true'>"
      )

      // 题字不得被塞进画布层内（画布层的 JSX 只含 rotated 画布）
      const panBlock = themeSource.match(
        /<div ref=\{panRef\}[\s\S]*?<\/div>/
      )
      expect(panBlock).not.toBeNull()
      expect(panBlock[0]).not.toContain('cl-home-tilt-title')
    })

    test('中文行是 h1、英文行标 lang="en"、装饰细线 aria-hidden', () => {
      expect(themeSource).toContain("<h1 className='cl-home-tilt-title-zh'>")
      expect(themeSource).toContain(
        "<p className='cl-home-tilt-title-en' lang='en'>"
      )
      expect(themeSource).toContain(
        "<span className='cl-home-tilt-title-rule' aria-hidden='true'>"
      )
    })

    test('题字可被主题配置整体关掉，且仅首页出现', () => {
      expect(themeSource).toContain('CIRCLELIFE_HOME_WALL_TITLE')
      expect(themeSource).toContain('showWallTitle')
      // 挂载点：/page/[page] 同样有照片墙，但题字只在 '/'
      const themeIndex = readFile('themes', 'circlelife', 'index.js')
      expect(themeIndex).toContain('showWallTitle={router.pathname ===')
    })
  })

  describe('入场是纯 CSS 关键帧', () => {
    test('三组关键帧存在且只动 opacity / transform', () => {
      expect(homeStyle).toContain('@keyframes clWallTitleIn')
      expect(homeStyle).toContain('@keyframes clWallRuleIn')
      expect(homeStyle).toContain('@keyframes clWallSubIn')

      const title = homeStyle.match(
        /@keyframes clWallTitleIn \{([\s\S]*?)\n\s{6}\}/
      )
      expect(title).not.toBeNull()
      expect(title[1]).toContain('opacity')
      expect(title[1]).toContain('translate3d')

      const rule = homeStyle.match(/@keyframes clWallRuleIn \{([\s\S]*?)\n\s{6}\}/)
      expect(rule).not.toBeNull()
      expect(rule[1]).toContain('opacity')
      expect(rule[1]).toContain('scaleX')

      const sub = homeStyle.match(/@keyframes clWallSubIn \{([\s\S]*?)\n\s{6}\}/)
      expect(sub).not.toBeNull()
      expect(sub[1]).toContain('opacity')
      expect(sub[1]).toContain('translate3d')
    })

    test('入场关键帧只用 fill-mode: both（SSR 与客户端一致，无 hydration 不匹配）', () => {
      const animations = homeStyle.match(/animation:\s*clWall[^;]+;/g) || []
      expect(animations.length).toBe(3)
      animations.forEach(a => expect(a).toContain('both'))
    })

    test('主题不引入任何动画库（守护「零新增依赖」决策）', () => {
      const themeJsDir = path.join(themeDir, 'components')
      const files = fs
        .readdirSync(themeJsDir)
        .filter(f => f.endsWith('.js'))
        .map(f => fs.readFileSync(path.join(themeJsDir, f), 'utf8'))
      files.push(themeSource)
      files.push(readFile('themes', 'circlelife', 'index.js'))
      files.forEach(src => {
        expect(src).not.toMatch(/from\s+['"]gsap/)
        expect(src).not.toContain('ScrollTrigger')
      })
    })
  })

  describe('耦合变量与降级', () => {
    test('题字只用三个 CSS 变量承载动态，且都有静态兜底', () => {
      expect(themeSource).toContain('--cl-wall-common')
      expect(themeSource).toContain('--cl-wall-flow')
      expect(themeSource).toContain('--cl-wall-alpha')
      // 值未变则跳过写入：静止时不做无谓的样式失效
      expect(themeSource).toContain('setVarIfChanged')

      // 兜底值必须让题字在「JS 完全没跑」时也是静态可读的终态
      expect(homeStyle).toContain('--cl-wall-alpha, 1)')
      expect(homeStyle).toContain('--cl-wall-flow, 0px)')
      expect(homeStyle).toContain('--cl-wall-common, 0px)')
    })

    test('题字不参与文档流（fixed）→ 不引入布局位移', () => {
      expect(homeStyle).toMatch(
        /\.cl-home-tilt-title \{[^}]*position: fixed;/
      )
    })

    test('不改动物理墙参数：位移比例与缓动时间常数原封不动', () => {
      expect(tiltProgress.TRAVEL_RATIO).toBe(0.12)
      expect(tiltProgress.EASE_TAU_DESKTOP).toBe(120)
      expect(tiltProgress.EASE_TAU_NARROW).toBe(96)
    })

    // —— 退场冻结必须把题字一起带到淡出终态 ——
    // 背景：从文章返回首页时，滚动位置会被恢复到文章段（远在墙尾之下）。
    // 墙尾冻结分支若只更新平移层、不更新题字，--cl-wall-alpha 会冻结在 1
    // （满透明）→ 题字这个 fixed 浮层就盖在当前内容上（博主实测过，生产同 bug）。
    test('墙尾冻结时必须同步更新题字（alpha 不能冻结在满透明）', () => {
      const exitBlock = themeSource.match(
        /if \(scrollY >= cachedBottomLimit\) \{([\s\S]*?)\n      \}/
      )
      expect(exitBlock).not.toBeNull()
      // 冻结分支里要调用 applyTitleMotion（把 alpha 推到 0）
      expect(exitBlock[1]).toContain('applyTitleMotion()')
      // 且 currentProgress 被置为 1（alpha 由它派生）
      expect(exitBlock[1]).toContain('currentProgress = 1')
    })

    test('视口观察器不单信 IO 快照：越过墙尾一律算「不可见」', () => {
      // 恢复滚动时 IO 可能先拿恢复**之前**的旧矩形报一次「可见」、
      // 再报「不可见」，两次回调先后不保证 → 谁后到谁说了算，
      // 题字会停在满透明、回顶键也会一直藏着。这里用滚动位置兜底。
      const observerBlock = themeSource.match(
        /const viewObserver = new IntersectionObserver\(([\s\S]*?)\n    \)/
      )
      expect(observerBlock).not.toBeNull()
      expect(observerBlock[1]).toContain('scrolledPast')
      expect(observerBlock[1]).toContain('cachedBottomLimit')
      expect(observerBlock[1]).toContain('!scrolledPast')
    })
  })

  describe('fixed 定位的前置条件：祖先链不得含包含块属性', () => {
    test('主题样式里所有针对祖先的规则都不含 transform/filter/contain/will-change', () => {
      const offenders = []
      styleFragments.forEach(({ file, css }) => {
        extractRules(css).forEach(({ selector, body }) => {
          if (!body) return
          selector.split(',').forEach(sel => {
            const compound = targetCompound(sel)
            if (!compound) return
            if (!targetsAncestor(compound)) return
            const m = body.match(CONTAINING_BLOCK_RE)
            if (m) {
              offenders.push(`${file} :: ${sel.trim()} :: ${m[2]}`)
            }
          })
        })
      })
      expect(offenders).toEqual([])
    })

    test('题字自身不得加 contain / transform（否则 fixed 被降级）', () => {
      const titleRoot = homeStyle.match(
        /\.cl-home-tilt-title \{([\s\S]*?)\n\s{6}\}/
      )
      expect(titleRoot).not.toBeNull()
      expect(titleRoot[1]).not.toMatch(
        CONTAINING_BLOCK_RE
      )
    })
  })

  describe('令牌', () => {
    test('题字色与光晕走 token，不在样式里硬编码', () => {
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      expect(tokenStyle).toContain('--cl-wall-ink')
      expect(tokenStyle).toContain('--cl-wall-halo')
      expect(tokenStyle).toContain('--cl-wall-halo-sm')
      expect(homeStyle).toContain('var(--cl-wall-ink)')
      expect(homeStyle).toContain('var(--cl-wall-halo)')
      expect(homeStyle).toContain('var(--cl-wall-halo-sm)')
      // 细线用已定义的强调色（--cl-vermilion 并未定义，不可引用）
      expect(homeStyle).toContain('var(--cl-accent)')
      expect(homeStyle).not.toContain('--cl-vermilion')
    })

    test('题字不带遮罩：保持纸面与照片的纯净，暗纱方案不启用', () => {
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      // 设计取舍：曾试过给题字加暗纱（radial-gradient 背景）来让 axe 判定对比度，
      // 但它会把米色缝隙压成灰、并压暗墙上的亮部（银河），观感明显变差。
      // 故不启用：对比度靠 text-shadow 光晕保证（跨缝隙可读性已实测），
      // 代价是 axe 的 color-contrast 会多记 1 个节点（该项审计改动前已在失败，分数不变）
      expect(tokenStyle).not.toContain('--cl-wall-veil')
      expect(homeStyle).not.toContain('--cl-wall-veil')
      expect(homeStyle).not.toMatch(/background-image:\s*var\(--cl-wall/)
      // 题字根不得有底色/底图：必须是「浮在墙上」而非「贴一块板」
      const titleRoot = homeStyle.match(
        /\.cl-home-tilt-title \{([\s\S]*?)\n\s{6}\}/
      )
      expect(titleRoot).not.toBeNull()
      expect(titleRoot[1]).not.toContain('background-color')
      expect(titleRoot[1]).not.toContain('background-image')
    })
  })
})
