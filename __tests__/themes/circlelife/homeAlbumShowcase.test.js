/**
 * 首页精选影集段契约测试
 *
 * 背景：首页新增「精选影集」段 —— Notion「精选」勾选的影集优先展示，
 * 不足用最新影集补齐；左列列表当滚动驱动源，右侧面板用纯 CSS sticky 钉住
 * 并随焦点整块换页（形态参考 thereach.travel 的 Destination Discoverer）。
 *
 * 这里守五类容易悄悄坏掉的东西：
 *
 * 1. 焦点算法纯函数：边界、夹紧、空数组（滚动路径零布局读取的前提）
 * 2. 性能与依赖纪律：不引入动画库、滚动路径不读布局
 * 3. 几何纪律：section 及其祖先不得带 transform/filter/contain/will-change
 *    （会破坏 sticky 定位），新增样式不得硬编码色值
 * 4. 标题层级：首页已有 h1（照片墙题字），本段必须是 h2
 * 5. Notion 数据链路：checkbox 解析 → 白名单不被剥掉 → featured 映射
 */
import fs from 'fs'
import path from 'path'

// notion-utils / notion-client 是 ESM 包，jest 的 transformIgnorePatterns 放行不了
// （与既有测试套件一致的约束：不改动 jest.config.js）。
// 这里用与真实实现同语义的桩替换，只为能真正跑一遍 getPageProperties 的解析分支。
jest.mock('notion-utils', () => {
  const getTextContent = val => {
    if (!Array.isArray(val)) return val
    return val
      .map(el => {
        if (!el) return ''
        if (typeof el === 'string') return el
        if (Array.isArray(el)) return getTextContent(el)
        return el.plain_text || ''
      })
      .join('')
  }
  return {
    __esModule: true,
    getTextContent,
    getDateValue: () => ({ start_date: null, end_date: null, time_zone: null }),
    idToUuid: id => id
  }
})

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: { getUsers: jest.fn(async () => ({})) },
  notionAPI: { getUsers: jest.fn(async () => ({})) }
}))

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const {
  ALBUM_FOCUS_MIN_MS,
  computeFocusProgress,
  computeSweepLength,
  computeSweepWindow,
  isFeaturedAlbum
} = require('../../../themes/circlelife/components/homeAlbumFocus')
const { homeStyle } = require('../../../themes/circlelife/styles/home')

const showcaseSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeAlbumShowcase.js'
)
const focusSource = readFile(
  'themes',
  'circlelife',
  'components',
  'homeAlbumFocus.js'
)
const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const pagesIndexSource = readFile('pages', 'index.js')
const siteDataSource = readFile('lib', 'db', 'SiteDataApi.js')
const notionConfigSource = readFile('conf', 'notion.config.js')

/** 新增样式块（首页精选影集段）的 CSS 片段 */
const ALBUM_STYLE_MARKER = '/* —— 首页精选影集段'
const albumStyleStart = homeStyle.indexOf(ALBUM_STYLE_MARKER)
const albumStyle = albumStyleStart >= 0 ? homeStyle.slice(albumStyleStart) : ''

/** 会破坏 sticky / 造包含块的属性 */
const CONTAINING_BLOCK_RE = /(^|;)\s*(transform|filter|backdrop-filter|perspective|contain|will-change)\s*:/

/** 移动端断点下的样式片段（≤1023px 媒体查询到最后） */
const mobileStyle = albumStyle.includes('@media (max-width: 1023px)')
  ? albumStyle.slice(albumStyle.indexOf('@media (max-width: 1023px)'))
  : ''

describe('circlelife 首页精选影集段', () => {
  describe('焦点算法（纯函数 · 进度驱动）', () => {
    test('computeFocusProgress：行程内线性推进，两端夹紧', () => {
      expect(computeFocusProgress(0, 0, 100)).toBe(0)
      expect(computeFocusProgress(50, 0, 100)).toBe(0.5)
      expect(computeFocusProgress(100, 0, 100)).toBe(1)
      expect(computeFocusProgress(-50, 0, 100)).toBe(0)
      expect(computeFocusProgress(999, 0, 100)).toBe(1)
    })

    test('computeFocusProgress：起点偏移正确生效', () => {
      expect(computeFocusProgress(1000, 900, 200)).toBe(0.5)
      expect(computeFocusProgress(800, 900, 200)).toBe(0)
    })

    test('computeFocusProgress：行程非法时退化为 0（不产生 NaN）', () => {
      expect(computeFocusProgress(100, 0, 0)).toBe(0)
      expect(computeFocusProgress(100, 0, -5)).toBe(0)
      expect(computeFocusProgress(100, 0, NaN)).toBe(0)
    })

    test('computeSweepWindow：推进区间 = 钉住区间裁掉尾部驻留', () => {
      // 移动端实测：钉住区间 [2183, 2841]（658px）→ 留 1/4 → 行程 493.5
      const w = computeSweepWindow(2183, 2841, 0.25)
      expect(w.start).toBe(2183)
      expect(w.length).toBeCloseTo(493.5, 5)
      // 起点 = 钉住起点（照片满屏），不早于它 → 进段先看清第 1 张
      expect(w.start).toBe(2183)
      // 尾部留 1/4 → 最后一张在钉住区间里能停住 164px
      expect(2183 + w.length).toBeLessThan(2841 - 100)
      // 无尾部驻留时 = 整个钉住区间
      expect(computeSweepWindow(100, 700, 0).length).toBe(600)
      // 非法入参 / 倒挂 → 退化为 0 长度（不产生负进度）
      expect(computeSweepWindow(NaN, 700)).toEqual({ start: 0, length: 0 })
      expect(computeSweepWindow(700, 100)).toEqual({ start: 700, length: 0 })
      expect(computeSweepWindow(100, 100).length).toBe(0)
    })

    test('R14：滚轴数学下线（只显示当前名，不再有位移）', () => {
      // 连续跟手那套（computeReelOffset）随滚轴一起下线：
      // 名字不再跟着手指走 → 整段滚动里文字层纹丝不动（iPhone 不掉帧的关键）
      const focus = require('../../../themes/circlelife/components/homeAlbumFocus')
      expect(focus.computeReelOffset).toBeUndefined()
      expect(showcaseSource).not.toContain('computeReelOffset')
      expect(showcaseSource).not.toContain('style.transform')
      expect(showcaseSource).not.toContain('translate3d')
      // 档位版（离散位移）随滚轴一起下线
      expect(showcaseSource).not.toContain('computeTrackOffset')
    })

    test('强调 / 封面限速常量存在（快速滑动不频闪）', () => {
      expect(ALBUM_FOCUS_MIN_MS).toBe(250)
      // 旧的「档位间隔」常量随离散档位一起下线
      const focus = require('../../../themes/circlelife/components/homeAlbumFocus')
      expect(focus.ALBUM_NOTCH_MIN_MS).toBeUndefined()
    })

    test('computeSweepLength：焦点窗口 = 轨道 sticky → 整段离开视口', () => {
      expect(computeSweepLength(1000, 1704)).toBe(704)
      // 结束早于开始 → 退化为 0（不产生负进度）
      expect(computeSweepLength(1704, 1000)).toBe(0)
      expect(computeSweepLength(NaN, 1000)).toBe(0)
    })
  })

  describe('精选判定（兼容 Checkbox 与 Select 降级形态）', () => {
    test('布尔值（Notion Checkbox 解析结果）', () => {
      expect(isFeaturedAlbum({ featured: true })).toBe(true)
      expect(isFeaturedAlbum({ featured: false })).toBe(false)
    })

    test('Select / MultiSelect 降级形态（数组或字符串）', () => {
      expect(isFeaturedAlbum({ featured: ['精选'] })).toBe(true)
      expect(isFeaturedAlbum({ featured: ['日常'] })).toBe(false)
      expect(isFeaturedAlbum({ featured: '精选' })).toBe(true)
      expect(isFeaturedAlbum({ featured: '日常' })).toBe(false)
    })

    test('列不存在 / 非法值 → 视为未标记（不报错）', () => {
      expect(isFeaturedAlbum({})).toBe(false)
      expect(isFeaturedAlbum(null)).toBe(false)
      expect(isFeaturedAlbum({ featured: undefined })).toBe(false)
    })
  })

  describe('性能与依赖纪律', () => {
    test('新组件不引入任何动画库', () => {
      ;[showcaseSource, focusSource].forEach(src => {
        expect(src).not.toMatch(/from\s+['"]gsap/)
        expect(src).not.toContain('ScrollTrigger')
        expect(src).not.toMatch(/from\s+['"]framer-motion/)
        expect(src).not.toMatch(/from\s+['"]animejs/)
        expect(src).not.toMatch(/from\s+['"]lenis/)
      })
    })

    test('package.json 未新增动画类依赖', () => {
      const pkg = JSON.parse(readFile('package.json'))
      const deps = Object.keys(pkg.dependencies || {})
      expect(deps).not.toContain('framer-motion')
      expect(deps).not.toContain('animejs')
      expect(deps).not.toContain('lenis')
      expect(deps).not.toContain('@studio-freight/lenis')
    })

    test('滚动路径不读布局：几何只在测量阶段取一次', () => {
      // 焦点计算只允许依赖预计算的几何 + scrollY
      expect(showcaseSource).toContain('computeFocusProgress')
      // getBoundingClientRect 只允许出现在测量函数内（不在滚动回调里）
      const scrollHandler = showcaseSource.match(
        /const onScroll = \(\) => \{([\s\S]*?)\n      \}/
      )
      expect(scrollHandler).not.toBeNull()
      expect(scrollHandler[1]).not.toContain('getBoundingClientRect')
      expect(scrollHandler[1]).not.toContain('offsetHeight')
      expect(scrollHandler[1]).not.toContain('getComputedStyle')
    })

    test('滚动路径零 transform 写入（R14：文字层整段滚动纹丝不动）', () => {
      // R14 起不再有「每帧写一次位移」这回事 —— 名字不再跟着手指走，
      // iPhone 上滑动时文字层不产生任何逐帧合成 → 掉帧的根源被拿掉。
      expect(showcaseSource).not.toContain('style.transform')
      expect(showcaseSource).not.toContain('translate3d')
      expect(showcaseSource).not.toContain('writeOffset')
      const updateBlock = showcaseSource.match(
        /const updateScroll = \(\) => \{([\s\S]*?)\n    \}/
      )
      expect(updateBlock).not.toBeNull()
      expect(updateBlock[1]).not.toContain('style.transform')
      expect(updateBlock[1]).not.toContain('getBoundingClientRect')
      expect(updateBlock[1]).not.toContain('offsetHeight')
    })

    test('单名范式（R14）：换挡即换名字，限速防频闪，零常驻 RAF', () => {
      expect(showcaseSource).toContain('ALBUM_FOCUS_MIN_MS')
      // R8 的弹簧与限速随范式一起下线（不要惯性、不要抽动）
      expect(showcaseSource).not.toContain('ALBUM_DETENT_STIFFNESS')
      expect(showcaseSource).not.toContain('ALBUM_DETENT_DAMPING')
      expect(showcaseSource).not.toContain('easeTiltProgress')
      expect(showcaseSource).not.toContain('settleOffset')
      // 零常驻 RAF
      expect(showcaseSource).not.toContain('requestAnimationFrame(tick)')
      expect(showcaseSource).not.toContain('const tick =')
      // 离散档位模型下线：棘轮 / 补齐定时器 / 档位间隔都不该再有
      expect(showcaseSource).not.toContain('ratchetIndex')
      expect(showcaseSource).not.toContain('advanceNotch')
      expect(showcaseSource).not.toContain('Math.sign(wantedIndex')
      expect(showcaseSource).not.toContain('scheduleCatchUp')
      expect(showcaseSource).not.toContain('catchTimer')
      expect(showcaseSource).not.toContain('window.setInterval')
      expect(showcaseSource).not.toContain('ALBUM_NOTCH_MIN_MS')
      // 当前档 = 进度四舍五入到最近的一格（round(p × (n-1)））
      expect(showcaseSource).toContain('Math.round(p * (n - 1))')
      const updateBlock = showcaseSource.match(
        /const updateScroll = \(\) => \{([\s\S]*?)\n    \}/
      )
      expect(updateBlock[1]).toContain('syncFocus()')
      // 键盘聚焦 → 立刻换挡（不受限速）
      expect(showcaseSource).toContain('applyRef.current?.()')
    })

    test('段外零开销：IntersectionObserver 判定不可见时摘掉 scroll 监听', () => {
      expect(showcaseSource).toContain('IntersectionObserver')
      expect(showcaseSource).toContain('removeEventListener(\'scroll\'')
      expect(showcaseSource).toContain("addEventListener('scroll', onScroll, { passive: true })")
    })
  })

  describe('几何与令牌纪律', () => {
    test('section 及其祖先不得带 transform/filter/contain/will-change', () => {
      // 祖先链：#theme-circlelife → #container-inner → #container-wrapper
      const ancestorTargets = ['container-inner', 'container-wrapper']
      const rules = []
      const re = /([^{}]+)\{([^{}]*)\}/g
      let m
      while ((m = re.exec(albumStyle)) !== null) {
        rules.push({ selector: m[1].trim(), body: m[2] })
      }
      const offenders = []
      rules.forEach(({ selector, body }) => {
        selector.split(',').forEach(sel => {
          const ids = sel.match(/#[A-Za-z0-9_-]+/g) || []
          const classes = sel.match(/\.[A-Za-z0-9_-]+/g) || []
          const idNames = ids.map(s => s.slice(1))
          const classNames = classes.map(s => s.slice(1))
          // 只看「祖先本身」与「section 根」；后代（如 .cl-home-album-item-rule）不算
          const isAncestor = idNames.some(id => ancestorTargets.includes(id))
          const isSectionRoot = classNames.includes('cl-home-album')
          if (!isAncestor && !isSectionRoot) return
          const hit = body.match(CONTAINING_BLOCK_RE)
          if (hit) offenders.push(`${sel.trim()} :: ${hit[2]}`)
        })
      })
      expect(offenders).toEqual([])
    })

    test('新增样式不硬编码色值，一律走 --cl-* token', () => {
      expect(albumStyle).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(albumStyle).toContain('var(--cl-accent)')
      expect(albumStyle).toContain('var(--cl-text)')
      expect(albumStyle).toContain('var(--cl-muted)')
      // --cl-vermilion 并未在 tokens.js 定义，禁用
      expect(albumStyle).not.toContain('--cl-vermilion')
    })

    test('面板用纯 CSS sticky 钉住，底边落在视口底', () => {
      expect(albumStyle).toMatch(
        /\.cl-home-album-panel \{[^}]*position: sticky;/
      )
      // 钉在**底**（不是顶）：面板底边 = 视口底 → 段尾零白带，Footer 紧接
      expect(albumStyle).toMatch(
        /\.cl-home-album-panel \{[^}]*bottom: 0;/
      )
      // ⚠️ sticky 的 bottom 只拦不拉 → 必须先让自然位置落到栅格行底
      expect(albumStyle).toMatch(
        /\.cl-home-album-panel \{[^}]*align-self: end;/
      )
      // 顶距不再由 nav-band 决定（顶距是「视口高 − 面板高」，随内容走）
      expect(albumStyle).not.toMatch(
        /\.cl-home-album-panel \{[^}]*top: calc\(var\(--cl-nav-band\)/
      )
    })

    test('入场动效是纯 CSS 关键帧且只动 opacity', () => {
      expect(albumStyle).toContain('@keyframes clHomeAlbumFade')
      const fade = albumStyle.match(
        /@keyframes clHomeAlbumFade \{([\s\S]*?)\n\s{6}\}/
      )
      expect(fade).not.toBeNull()
      expect(fade[1]).toContain('opacity')
      expect(fade[1]).not.toContain('transform')
      // 不得用 headlessui <Transition>（服务端/客户端 class 不一致 → CLS 1.0）
      expect(showcaseSource).not.toContain('<Transition')
      expect(showcaseSource).not.toContain('from headlessui')
    })

    test('强调 = 字色 + 字重，焦点竖线标「当前这一辑」（R11 保留）', () => {
      // 竖线是位置标记，贴在当前名字左边（与字色强调分工）
      const rule = albumStyle.match(
        /\.cl-home-album-item-rule \{([\s\S]*?)\n\s{6}\}/
      )
      expect(rule).not.toBeNull()
      expect(rule[1]).toContain('position: absolute')
      expect(rule[1]).toContain('background: var(--cl-home-album-rule)')
      expect(showcaseSource).toContain("className='cl-home-album-item-rule'")
      // 聚焦框的两条横线仍然下线（那是多余的线元素）
      expect(albumStyle).not.toContain('.cl-home-album-viewport::before')
      expect(albumStyle).not.toContain('.cl-home-album-viewport::after')
      // 强调 = 焦点项字色 --cl-text；非焦点退到 --cl-muted + 透明度
      // （R11：不再加粗 —— 加粗会换字形 → 文字层连同光晕重绘，手机上掉帧）
      expect(albumStyle).not.toMatch(
        /\.cl-home-album-item\[aria-current='true'\]\s*\.cl-home-album-item-name \{[^}]*font-weight/
      )
      expect(albumStyle).toMatch(
        /\.cl-home-album-item:not\(\[aria-current='true'\]\)\s*\.cl-home-album-item-name \{[^}]*opacity: 0\.58/
      )
    })

    test('窗口不得带 mask-image（移动端每帧按遮罩合成 → 文字滚轴掉帧）', () => {
      // R11 实测：轨道每帧都在动，带遮罩的祖先会变成「遮罩合成面」，
      // 移动端走不到 GPU 加速路径 → 上下拉时文字滚轴像掉帧（背景照片不卡）。
      // R10 起窗口高 3 槽、槽距 14vh → 三个名字完整落在窗口内
      //（上下各余 42px）→ 遮罩的渐隐根本没盖到字，纯属白付合成成本。
      const win = albumStyle.match(
        /\.cl-home-album-viewport \{([\s\S]*?)\n\s{6}\}/
      )
      expect(win).not.toBeNull()
      expect(win[1]).not.toContain('mask-image')
      expect(win[1]).not.toContain('-webkit-mask-image')
      // 仍然要裁切（clip 不触发遮罩合成面）
      expect(win[1]).toContain('overflow: clip')
    })

    test('名字的过渡里不能带 font-weight（逐帧改变字宽 → 每帧重排，手机上卡顿）', () => {
      // R11 实测（390×844，同一段 491ms 滚动）：
      //   带 font-weight 过渡 → Layout 31 次 / 96.5ms，RasterTask 64.9ms
      //   去掉后              → Layout  5 次 /  1.6ms，RasterTask  6.6ms
      const nameRule = albumStyle.match(
        /#theme-circlelife \.cl-home-album-item-name \{([\s\S]*?)\n\s{6}\}/
      )
      expect(nameRule).not.toBeNull()
      expect(nameRule[1]).toContain('transition: color')
      expect(nameRule[1]).not.toContain('font-weight var(--cl-dur)')
      // 全主题都不能有「补间字重」：字重一变字宽就变 → 逐帧重排
      expect(albumStyle).not.toMatch(/transition:[^;]*font-weight/)
    })

    test('焦点竖线是 2px 小元素 → 常驻 will-change（动画走合成器，不重绘大字层）', () => {
      const rule = albumStyle.match(
        /\.cl-home-album-item-rule \{([\s\S]*?)\n\s{6}\}/
      )
      expect(rule).not.toBeNull()
      expect(rule[1]).toContain('will-change: transform, opacity')
      expect(rule[1]).toContain('width: 2px')
    })

    test('封面全部叠放、焦点切换不改 src（不闪白）', () => {
      // 组件渲染全部封面，只用 is-active 标记当前焦点
      expect(showcaseSource).toContain("album.id === active?.id ? 'is-active'")
      expect(showcaseSource).not.toContain('is-preload')
      // 焦点封面置顶：新封面解码完成前由下层旧封面托底
      expect(albumStyle).toContain('.cl-home-album-img.is-active')
      const activeRule = albumStyle.match(
        /\.cl-home-album-img\.is-active \{([\s\S]*?)\n\s{6}\}/
      )
      expect(activeRule).not.toBeNull()
      expect(activeRule[1]).toContain('z-index: 2')
      // 容器负责圆角与托底底色
      expect(albumStyle).toMatch(
        /\.cl-home-album-figure \{[^}]*background: var\(--cl-paper-2\)/
      )
    })
  })

  describe('移动端形态（R3：封面照片铺底 + 标题滚轴）', () => {
    test('移动端是满幅照片舞台（sticky 停住），不是底部停靠条', () => {
      expect(mobileStyle).not.toBe('')
      const stage = mobileStyle.match(
        /\.cl-home-album-stage \{([\s\S]*?)\n\s{8}\}/
      )
      expect(stage).not.toBeNull()
      // 桌面隐藏舞台（display:none → 不请求图片），移动端必须显式启用
      expect(stage[1]).toContain('display: block')
      expect(stage[1]).toContain('position: sticky')
      expect(stage[1]).toContain('top: 0')
      expect(stage[1]).toContain('height: 100vh')
      // 满幅：负 margin 抵消段自身的 padding-inline → 左右不再有 16px 白边
      expect(stage[1]).toContain(
        'margin-inline: calc(-1 * var(--cl-wide-pad))'
      )
      // ⚠️ 舞台不得再用 margin-bottom:-100vh 抵消占位：
      // sticky 的约束算 margin box，负下边距会把 margin box 压成零高 →
      // 底部约束失效 → 照片在整段滚动里永不释放，会压住下面的文章段。
      expect(stage[1]).not.toContain('margin-bottom: -100vh')
      // 舞台底色必须是「一定深」的值 → 封面加载失败时白字仍有依托
      expect(stage[1]).toContain('background: var(--cl-text)')
      // 旧的底部停靠条已下线
      expect(mobileStyle).not.toContain(
        'bottom: calc(env(safe-area-inset-bottom, 0px) + 5rem)'
      )
      expect(mobileStyle).not.toContain(
        'grid-template-columns: minmax(0, 1fr) 4.75rem'
      )
      // 桌面右列的面板与照片在移动端隐藏
      expect(mobileStyle).toMatch(
        /\.cl-home-album-panel,[\s\S]*?\.cl-home-album-figure \{\s*display: none;/
      )
    })

    test('左列 = 固定高度的裁切窗口（转轮）：sticky + overflow，不带遮罩', () => {
      const win = albumStyle.match(
        /\.cl-home-album-viewport \{([\s\S]*?)\n\s{6}\}/
      )
      expect(win).not.toBeNull()
      // 桌面与手机同构：窗口规则在 base 段（两端共用）
      expect(win[1]).toContain('display: block')
      expect(win[1]).toContain('position: sticky')
      expect(win[1]).toContain('height: var(--cl-home-album-window)')
      // clip（不是 hidden）：hidden 的盒子仍可被程序化滚动，
      // 键盘聚焦窗口外条目时浏览器会偷偷挪动滚轴内容
      expect(win[1]).toContain('overflow: clip')
      // 不带遮罩：R11 起名字完整落在窗口内（上下各余 42px），
      // 渐隐本就盖不到字；而带遮罩的移动层在手机上每帧按遮罩合成 → 掉帧
      expect(win[1]).not.toContain('mask-image')
      expect(win[1]).not.toContain('linear-gradient')
    })

    test('滚轴与照片舞台同时释放（活动范围单独圈定）', () => {
      // 外层 reel 限定 sticky 的活动范围：舞台的 sticky 底边在视口底，
      // 窗口的底边比它高 → 共用包含块会让滚轴多钉住近 300px，
      // 那段时间照片已退场、标题悬在奶白纸上（白字读不出来）
      expect(showcaseSource).toContain(
        "<div className='cl-home-album-reel'>"
      )
      const reel = mobileStyle.match(
        /\.cl-home-album-reel \{([\s\S]*?)\n\s{8}\}/
      )
      expect(reel).not.toBeNull()
      expect(reel[1]).toContain('height: calc(')
      expect(reel[1]).toContain('var(--cl-home-album-sweep)')
      expect(reel[1]).toContain('var(--cl-home-album-focus)')
      expect(reel[1]).toContain('var(--cl-home-album-window) / 2')
      // 与舞台重叠的负偏移由 reel 承担（舞台不能带负下边距）
      expect(reel[1]).toContain('margin-top: -100vh')
      // 桌面端 reel 是有高度的真实块（给 sticky 窗口一个够高的包含块）
      const deskReel = albumStyle.match(
        /\.cl-home-album-reel \{([\s\S]*?)\n\s{6}\}/
      )
      expect(deskReel).not.toBeNull()
      expect(deskReel[1]).toContain('display: block')
      expect(deskReel[1]).toContain('height: calc(100vh + var(--cl-home-album-sweep))')
    })

    test('名字列表不再平移（R14：零逐帧合成）', () => {
      // 列表在两端都是 static（sticky 交给取景框），且**没有** transform
      const deskList = albumStyle.match(
        /\.cl-home-album-list \{([\s\S]*?)\n\s{6}\}/
      )
      expect(deskList).not.toBeNull()
      expect(deskList[1]).toContain('position: static')
      expect(deskList[1]).not.toContain('transform')
      expect(deskList[1]).not.toContain('will-change: transform')
      // 四个条目叠在同一位置：非当前 visibility: hidden（完全不参与绘制）
      const entry = albumStyle.match(
        /\.cl-home-album-entry \{([\s\S]*?)\n\s{6}\}/
      )
      expect(entry).not.toBeNull()
      expect(entry[1]).toContain('position: absolute')
      expect(entry[1]).toContain('inset: 0')
      // opacity:0 而非 visibility:hidden —— 后者会把其余条目踢出无障碍树、
      // 也 Tab 不到；实测两者的重绘成本一样（2.13ms vs 2.08ms）
      expect(entry[1]).toContain('opacity: 0')
      expect(entry[1]).not.toContain('visibility: hidden')
      // 键盘聚焦到未选中的条目时把它显出来
      expect(albumStyle).toContain('.cl-home-album-entry:focus-within')
      // 当前档：可见 + 交叉淡入（时长走 token）
      const active = albumStyle.match(
        /\.cl-home-album-entry\.is-active \{([\s\S]*?)\n\s{6}\}/
      )
      expect(active).not.toBeNull()
      expect(active[1]).toContain('opacity: 1')
      // 交叉淡入的时长走 token（与封面溶解同源）
      expect(entry[1]).toContain('var(--cl-home-switch)')
    })

    test('封面切换是溶解：旧封面不透明垫底，新封面淡入', () => {
      expect(mobileStyle).toContain('.cl-home-album-cover.is-active')
      expect(mobileStyle).toContain('@keyframes clHomeAlbumCoverIn')
      const fade = mobileStyle.match(
        /@keyframes clHomeAlbumCoverIn \{([\s\S]*?)\n\s{8}\}/
      )
      expect(fade).not.toBeNull()
      expect(fade[1]).toContain('opacity: 0')
      expect(fade[1]).toContain('opacity: 1')
      // 组件按「当前 / 上一档」内联给出 z 序 → 旧封面垫底不透明
      expect(showcaseSource).toContain('zIndex:')
      expect(showcaseSource).toContain('prevActiveIndex')
      expect(showcaseSource).toContain('cl-home-album-cover')
    })

    test('iOS 合成纪律：封面提层 + 只画两张 + 淡入短于换挡间隔', () => {
      // 全屏图（100vh × DPR3 ≈ 3.5M px）：不提成层淡入 → WebKit 每帧重画整张舞台
      const cover = mobileStyle.match(
        /\.cl-home-album-cover \{([\s\S]*?)\n\s{8}\}/
      )
      expect(cover).not.toBeNull()
      expect(cover[1]).toContain('will-change: opacity')
      // 常驻提层（不靠动画临时提升）：避免每次换挡新建/销毁全屏纹理
      const active = mobileStyle.match(
        /\.cl-home-album-cover\.is-active \{([\s\S]*?)\n\s{8}\}/
      )
      expect(active).not.toBeNull()
      // 淡入走 token（与名字的交叉淡入同源），且必须短于换挡间隔（250ms）
      expect(active[1]).toContain('clHomeAlbumCoverIn var(--cl-home-switch)')
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      expect(tokenStyle).toContain('--cl-home-switch: 240ms')
      // 只画「当前 + 上一档」：其余封面被完全盖住，留着只是多合成两层全屏图
      expect(mobileStyle).toContain('.cl-home-album-cover.is-muted')
      expect(mobileStyle).toMatch(
        /\.cl-home-album-cover\.is-muted \{[^}]*visibility: hidden/
      )
      expect(showcaseSource).toContain('is-muted')
      // 舞台整块提层：合成器只挪动它，不逐帧重画
      const stage = mobileStyle.match(
        /\.cl-home-album-stage \{([\s\S]*?)\n\s{8}\}/
      )
      expect(stage[1]).toContain('will-change: transform')
      // CTA 不挂 key：换挡时不销毁重建这颗链接（滑动中的主线程开销）
      expect(showcaseSource).not.toContain(
        "key={active?.id}\n            className='cl-home-album-cta'"
      )
    })

    test('名字的透明度也做过渡（iOS：瞬时改透明度会当场重画文字层）', () => {
      const nameRule = albumStyle.match(
        /#theme-circlelife \.cl-home-album-item-name \{([\s\S]*?)\n\s{6}\}/
      )
      expect(nameRule).not.toBeNull()
      expect(nameRule[1]).toContain('transition: color')
      expect(nameRule[1]).toContain('opacity var(--cl-dur)')
    })

    test('底部渐暗 scrim：浅色文字始终压在暗底上', () => {
      expect(mobileStyle).toContain('.cl-home-album-scrim')
      const scrim = mobileStyle.match(
        /\.cl-home-album-scrim \{([\s\S]*?)\n\s{8}\}/
      )
      expect(scrim).not.toBeNull()
      expect(scrim[1]).toContain('position: absolute')
      expect(scrim[1]).toContain('var(--cl-home-album-scrim)')
      expect(scrim[1]).toContain('linear-gradient')
    })

    test('照片上的文字用固定浅色 token（--cl-bg/--cl-text 随明暗反转，压照片上会读不出来）', () => {
      expect(mobileStyle).toContain('var(--cl-home-album-ink)')
      // 移动端字色不得直接用 --cl-bg / --cl-text
      const inkRule = mobileStyle.match(
        /\.cl-home-album-item-name,([\s\S]*?)\{([\s\S]*?)\n\s{8}\}/
      )
      expect(inkRule).not.toBeNull()
      expect(inkRule[2]).toContain('var(--cl-home-album-ink)')
      expect(inkRule[2]).not.toContain('var(--cl-bg)')
      expect(inkRule[2]).not.toContain('var(--cl-text)')
      // token 必须真实存在
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      expect(tokenStyle).toContain('--cl-home-album-ink')
      expect(tokenStyle).toContain('--cl-home-album-scrim')
    })

    test('左列只留影集名：日期/张数/简介撤下，CTA 挪到照片右下角', () => {
      // 左列里不再渲染 meta / 摘要 / CTA
      expect(showcaseSource).not.toContain('cl-home-album-entry-summary')
      expect(showcaseSource).not.toContain('cl-home-album-entry-meta')
      expect(showcaseSource).not.toContain('cl-home-album-entry-detail')
      // 桌面隐藏照片舞台（不请求图片）
      expect(albumStyle).toMatch(
        /\.cl-home-album-stage \{\s*display: none;/
      )
      // 即便结构再变，移动端也必须显式把 meta / 摘要藏掉
      expect(mobileStyle).toMatch(
        /\.cl-home-album-entry-meta,[\s\S]*?\.cl-home-album-entry-summary \{\s*display: none;/
      )
    })

    test('移动端 CTA 与影集名同框（住在取景框里，桌面显式藏掉）', () => {
      // CTA 必须与辑名待在**同一个 sticky 框**（.cl-home-album-viewport）里。
      // ⚠️ 以前 CTA 挂在照片舞台（.cl-home-album-stage）上 —— 那是另一个
      // sticky 坐标系：取景框的 sticky 有「拉入」与「释放」两段，辑名在
      // 钉住之前/释放之后会上下移动，而舞台那层的坐标纹丝不动 →
      // CTA 与辑名分离（真踩过：还没钉住时 CTA 叠在辑名上）。
      expect(showcaseSource).toContain("className='cl-home-album-cta'")
      const viewportIdx = showcaseSource.indexOf(
        "className='cl-home-album-viewport'"
      )
      const ctaIdx = showcaseSource.indexOf("className='cl-home-album-cta'")
      expect(viewportIdx).toBeGreaterThan(-1)
      expect(ctaIdx).toBeGreaterThan(viewportIdx)
      // 仍在舞台里 = 还没挪进取景框
      const stageIdx = showcaseSource.indexOf("className='cl-home-album-stage'")
      const stageEnd = showcaseSource.indexOf('</div>', stageIdx)
      expect(ctaIdx).toBeGreaterThan(stageEnd)
      // 舞台不再整体 aria-hidden（CTA 要留在无障碍树里），
      // 装饰性的遮罩自己退出无障碍树
      expect(showcaseSource).not.toContain(
        "className='cl-home-album-stage' aria-hidden='true'"
      )
      expect(showcaseSource).toContain(
        "<div className='cl-home-album-scrim' aria-hidden='true' />"
      )
      // 桌面：取景框是可见的 → CTA 必须显式 display:none（桌面自己的入口
      // 是右栏面板里的 .cl-home-album-enter）
      expect(albumStyle).toMatch(
        /\.cl-home-album-cta \{\s*display: none;/
      )
      // 样式：纵坐标相对**取景框**（50% = 辑名中心）+ 名字半高 + 间距
      const cta = mobileStyle.match(
        /\.cl-home-album-cta \{([\s\S]*?)\n\s{8}\}/
      )
      expect(cta).not.toBeNull()
      expect(cta[1]).toContain('position: absolute')
      expect(cta[1]).toContain('left: var(--cl-wide-pad)')
      expect(cta[1]).toContain('right: auto')
      expect(cta[1]).toContain('bottom: auto')
      expect(cta[1]).toContain('50%')
      // 不再按焦点线绝对定位（那会与移动的辑名分离）
      expect(cta[1]).not.toContain('var(--cl-home-album-focus-line)')
      expect(cta[1]).not.toContain('right: var(--cl-wide-pad)')
      expect(cta[1]).not.toContain('bottom: calc(env(safe-area-inset-bottom')
      expect(cta[1]).toContain('z-index: 3')
      expect(cta[1]).toContain('var(--cl-home-album-ink)')
      expect(cta[1]).toContain('text-shadow: var(--cl-wall-halo)')
    })

    test('「进入影集」不用斜体（两端都不斜）', () => {
      expect(albumStyle).not.toMatch(
        /\.cl-home-album-enter \{[^}]*font-style: italic/
      )
      expect(mobileStyle).not.toMatch(
        /\.cl-home-album-enter \{[^}]*font-style: italic/
      )
      expect(mobileStyle).not.toMatch(
        /\.cl-home-album-cta \{[^}]*font-style: italic/
      )
      // 下划线保留（仍是链接的视觉暗示）
      expect(albumStyle).toMatch(
        /\.cl-home-album-enter \{[^}]*text-decoration: underline/
      )
    })

    test('段体为纵向 flex 且子项不按内容宽度收缩', () => {
      const body = mobileStyle.match(
        /\.cl-home-album-body \{([\s\S]*?)\n\s{8}\}/
      )
      expect(body).not.toBeNull()
      expect(body[1]).toContain('display: flex')
      expect(body[1]).toContain('flex-direction: column')
      expect(body[1]).toContain('align-items: stretch')
      expect(body[1]).not.toContain('align-items: start')
    })

    test('旧的静态卡片流与底部停靠条已彻底清除', () => {
      expect(albumStyle).not.toContain('.cl-home-album-entry-thumb')
      expect(showcaseSource).not.toContain('cl-home-album-entry-thumb')
      expect(showcaseSource).not.toContain('THUMB_SIZES')
    })
  })

  describe('几何口径（R14：取景框 + 换挡位置）', () => {
    test('桌面：取景框 42vh，推进驱动与框高解耦', () => {
      // 旧的「跑道 = 系数 × 26vh」写法已下线
      expect(albumStyle).not.toContain('--cl-home-album-runway')
      expect(albumStyle).toContain('--cl-home-album-step:')
      expect(albumStyle).toContain('--cl-home-album-sweep:')
      expect(albumStyle).toContain('var(--cl-home-album-sweep)')
      // R14 起不再有「名字间距」这回事（名字只画当前一个）→ 槽位 token 下线
      expect(albumStyle).not.toContain('--cl-home-album-slot')
      expect(albumStyle).toContain('--cl-home-album-window: 42vh')
      // 焦点线走 token（44vh），桌面与移动端同一口径
      expect(albumStyle).toContain('--cl-home-album-focus: var(--cl-home-album-focus-line)')
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      expect(tokenStyle).toContain('--cl-home-album-focus-line: 44vh')
      // tokens.js 里的兜底值与段内一致
      expect(tokenStyle).toContain('--cl-home-album-window: 42vh')
      expect(tokenStyle).not.toContain('--cl-home-album-slot')
    })

    test('名字号与间距同步收（小一号仍读作目录）', () => {
      expect(albumStyle).toContain('clamp(1.5rem, 2.6vw, 2.25rem)')
    })

    test('移动端几何自检：推进驱动 19vh + 取景框 42vh + 焦点线在框正中', () => {
      expect(mobileStyle).toContain('--cl-home-album-step: 19vh')
      expect(mobileStyle).toContain(
        '--cl-home-album-focus: var(--cl-home-album-focus-line)'
      )
      // 两端同构：取景框高度不再在移动端另设（只在别处引用，不重新定义）
      expect(mobileStyle).not.toContain('--cl-home-album-window:')
      expect(mobileStyle).not.toContain('--cl-home-album-slot')
      // R14：条目铺满取景框（四个名字叠在同一位置）
      expect(albumStyle).toMatch(
        /\.cl-home-album-entry \{[^}]*position: absolute;[^}]*inset: 0/
      )
      // 窗口顶 = 焦点线 - 半个窗口 → 焦点标题中心恒在窗口正中
      // （窗口规则两端共用，落在 base 段）
      expect(albumStyle).toContain('top: calc(')
      expect(albumStyle).toContain(
        'var(--cl-home-album-focus) - var(--cl-home-album-window) / 2'
      )
    })

    test('聚焦框已下线（R11）：窗口里只有名字，强调靠字色', () => {
      // 两条朱砂细线撤掉 → 视线上没有任何多余的线元素
      expect(albumStyle).not.toContain('.cl-home-album-viewport::before')
      expect(albumStyle).not.toContain('.cl-home-album-viewport::after')
      // 窗口本身保留（取景框）—— 它决定换挡位置，不是装饰
      expect(albumStyle).toContain('.cl-home-album-viewport {')
    })

    test('窗口不带遮罩（R11/R14）：名字只画当前一个，不需要渐隐', () => {
      const win = albumStyle.match(
        /\.cl-home-album-viewport \{([\s\S]*?)\n\s{6}\}/
      )
      expect(win).not.toBeNull()
      expect(albumStyle).toContain('--cl-home-album-window: 42vh')
      expect(win[1]).not.toContain('mask-image')
    })

    test('移动端主角是影集名：字号放大到 clamp(1.75rem, 8.5vw, 2.5rem)', () => {
      expect(mobileStyle).toContain('clamp(1.75rem, 8.5vw, 2.5rem)')
    })

    test('字体框：行高 1em + 名字在自己的格子里垂直居中（转轮范式）', () => {
      // 开源里程表/老虎机的硬要求：格 = 字形盒（1em），父级 line-height ≥ 1.15
      const nameRule = albumStyle.match(
        /#theme-circlelife \.cl-home-album-item-name \{([\s\S]*?)\n\s{6}\}/
      )
      expect(nameRule).not.toBeNull()
      expect(nameRule[1]).toContain('line-height: 1;')
      // 名字在格中居中（桌面横排 align-items，移动端纵向 justify-content）
      expect(albumStyle).toMatch(
        /\.cl-home-album-entry \{[^}]*align-items: center;/
      )
      expect(mobileStyle).toMatch(
        /\.cl-home-album-entry \{[^}]*justify-content: center;/
      )
      // 纵向 flex 里 align-items 是水平轴 → 必须 flex-start（否则名字被水平居中）
      expect(mobileStyle).toMatch(
        /\.cl-home-album-entry \{[^}]*align-items: flex-start;/
      )
    })

    test('照片上的字叠暗色光晕（照片明暗不定时靠描边咬出轮廓）', () => {
      expect(mobileStyle).toContain('text-shadow: var(--cl-wall-halo)')
      const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
      expect(tokenStyle).toContain('--cl-wall-halo')
    })
  })

  describe('R14：单名取景框（只画当前影集名 + 换挡交叉淡入）', () => {
    test('左列包一层取景框，名字列表叠在框里', () => {
      expect(showcaseSource).toContain(
        "<div className='cl-home-album-viewport' ref={viewportRef}>"
      )
      expect(showcaseSource).toContain("<ol className='cl-home-album-list'>")
      // 窗口内只留影集名列表（ol）
      expect(showcaseSource).toContain('</ol>')
      // 列表不再挂 ref（没有位移要写了）
      expect(showcaseSource).not.toContain('listRef')
    })

    test('当前名字恒在取景框正中（靠条目铺满取景框 + 垂直居中）', () => {
      // 名字不再需要「基准位移」那套测量：条目绝对定位铺满取景框即可
      expect(showcaseSource).not.toContain('baseTitleOffset')
      expect(showcaseSource).not.toContain('baseOffset')
      expect(showcaseSource).not.toContain('windowH')
      expect(showcaseSource).not.toContain('gap =')
      const entry = albumStyle.match(
        /\.cl-home-album-entry \{([\s\S]*?)\n\s{6}\}/
      )
      expect(entry[1]).toContain('position: absolute')
      expect(entry[1]).toContain('inset: 0')
      expect(entry[1]).toContain('align-items: center')
    })

    test('断点切换重新测量（窗口形态变了 → 几何必须重测）', () => {
      expect(showcaseSource).toContain("matchMedia('(max-width: 1023px)')")
      expect(showcaseSource).toContain("mq.addEventListener?.('change'")
    })

    test('右栏沉到视口底（封面保持自然 4:5，段尾不留白）', () => {
      // ⚠️ sticky 的 bottom 只「拦」不「拉」：必须先让自然位置落到栅格行底
      //    （align-self: end），bottom: 0 才拉得住 → 面板底边 = 视口底
      const panel = albumStyle.match(
        /\.cl-home-album-panel \{([\s\S]*?)\n\s{6}\}/
      )
      expect(panel[1]).toContain('align-self: end')
      expect(panel[1]).toContain('top: auto')
      expect(panel[1]).toContain('bottom: 0')
      // 面板栅格回到「文案栏定宽 + 封面吃剩余」→ 封面 = 轨道宽的 4:5 自然尺寸
      expect(albumStyle).toMatch(
        /\.cl-home-album-panel \{[^}]*grid-template-columns:\s*minmax\(240px, 30rem\) minmax\(0, 1fr\);/
      )
      // 上一轮的「把封面拉高」机制整体撤回（它把封面拉成了竖长条）
      expect(albumStyle).not.toContain('--cl-home-album-cover-w')
      expect(showcaseSource).not.toContain('--cl-home-album-cover-w')
      expect(showcaseSource).not.toContain('ALBUM_COPY_MIN_W')
      // 4:5 的比例挂在 img 上（盒子随轨道宽自适应）
      expect(albumStyle).toMatch(
        /\.cl-home-album-img \{[^}]*aspect-ratio: 4 \/ 5;/
      )
    })

    test('换挡窗口跟右栏面板走（两端同公式 = 0.75 × 行程）', () => {
      // 桌面端：面板底边钉在视口底 → 段底抵到视口底时释放
      expect(showcaseSource).toContain('bodyBottom - window.innerHeight')
      // 移动端：照片舞台 top 钉住、100vh 高 → 舞台底边触到段底时释放
      expect(showcaseSource).toContain('bodyBottom - primaryTop - primaryH')
      // 桌面端的主元件 = 右栏面板（不是取景框）
      expect(showcaseSource).toContain(
        'isMobile ? stageRef.current : panelRef.current'
      )
      // 尾段驻留 1/4 不变
      expect(showcaseSource).toContain('computeSweepWindow(bodyTop, releaseAt, 0.25)')
    })

    test('行程加长到与移动端同值（step 19vh）—— 保住每辑约 94px 的换挡距离', () => {
      // 桌面基值（.cl-home-album 的第一条规则）必须是 19vh，与移动端同值
      const base = albumStyle.match(
        /#theme-circlelife \.cl-home-album \{([\s\S]*?)\n\s{6}\}/
      )
      expect(base[1]).toContain('--cl-home-album-step: 19vh;')
      // 移动端媒体查询里同样是 19vh（两端同值）
      expect(albumStyle).toContain('--cl-home-album-step: 19vh;')
      expect(albumStyle).not.toContain('--cl-home-album-step: 7vh;')
    })

    test('不做 hover 预选（会与换挡打架），改为键盘聚焦接管', () => {
      // 只查 JSX 属性（注释里可以解释为什么删）
      expect(showcaseSource).not.toContain('onMouseEnter={')
      expect(showcaseSource).not.toContain('onMouseEnter={() => setActiveIndex')
      expect(showcaseSource).toContain('onFocus={() => handleItemFocus(index)}')
      expect(showcaseSource).toContain('onBlur={handleItemBlur}')
      expect(showcaseSource).toContain('handleItemFocus')
      // 焦点权在 blur 时交回滚动（滚动路径不抢焦点）
      expect(showcaseSource).not.toContain('manualRef.current = null\n        applyFocus()')
    })

    test('滚动只决定「当前是第几辑」，不写任何位移', () => {
      const updateBlock = showcaseSource.match(
        /const updateScroll = \(\) => \{([\s\S]*?)\n    \}/
      )
      expect(updateBlock).not.toBeNull()
      expect(updateBlock[1]).toContain('computeFocusProgress')
      expect(updateBlock[1]).toContain('syncFocus()')
      expect(updateBlock[1]).not.toContain('getBoundingClientRect')
      expect(updateBlock[1]).not.toContain('offsetHeight')
      expect(updateBlock[1]).not.toContain('style.transform')
    })

    test('键盘聚焦 → 立刻换挡（不受 250ms 限速），blur 交回滚动', () => {
      expect(showcaseSource).toContain('applyRef.current?.()')
      expect(showcaseSource).toContain('manualRef.current = null')
      // 换挡限速常量仍在（滚动驱动时防频闪）
      expect(showcaseSource).toContain('ALBUM_FOCUS_MIN_MS')
      expect(showcaseSource).toContain('syncFocus()')
    })

    test('文章段首尾：影集段照片不再压住下面的精选文章章', () => {
      // 舞台不得用负下边距抵消占位（sticky 底部约束会失效）
      const stage = mobileStyle.match(
        /\.cl-home-album-stage \{([\s\S]*?)\n\s{8}\}/
      )
      expect(stage).not.toBeNull()
      expect(stage[1]).not.toContain('margin-bottom: -100vh')
      // 照片 → 纸面：封面底部压暗溶进页面纸色
      expect(homeStyle).toContain('.cl-home-album-scrim')
      // 时间线首行让开导航带（列表页仍用时间线）
      expect(homeStyle).toMatch(
        /\.cl-timeline \{[^}]*scroll-margin-top: calc\(var\(--cl-nav-band\) \+ 1rem\)/
      )
    })
  })

  describe('R5：进入 / 退出时机（钉住区间 + 尾部驻留）', () => {
    test('推进区间：起点 = 段体顶，终点 = 主元件释放点往前留 1/4 驻留', () => {
      expect(showcaseSource).toContain('computeSweepWindow')
      // 移动端主元件 = 照片舞台（满屏即钉住）；桌面端 = 右栏面板（底边钉在视口底）
      expect(showcaseSource).toContain('stageRef')
      expect(showcaseSource).toContain(
        'isMobile ? stageRef.current : panelRef.current'
      )
      // 起点 = 段体顶（移动端 = 照片满屏；桌面端 = 段体顶进视口）
      expect(showcaseSource).toContain('computeSweepWindow(bodyTop, releaseAt, 0.25)')
      // 终点 = 主元件释放点：包含块下沿把它顶出来
      expect(showcaseSource).toContain('releaseAt')
      // 桌面端：段底抵到视口底（面板底边钉在视口底）；移动端：舞台底边触到段底
      expect(showcaseSource).toContain('bodyBottom - window.innerHeight')
      expect(showcaseSource).toContain('bodyBottom - primaryTop - primaryH')
      // 布局高度用 offsetHeight（架构库「测量单位陷阱」）
      expect(showcaseSource).toContain('primary.offsetHeight')
    })

    test('测量阶段读的是段体上下沿（不是段头/整段）', () => {
      expect(showcaseSource).toContain('bodyBottom')
      expect(showcaseSource).not.toContain('sectionBottom - window.innerHeight')
    })
  })

  describe('回顶按钮避让（R2）', () => {
    const wallSource = readFile(
      'themes',
      'circlelife',
      'components',
      'HomeTiltWall.js'
    )
    const backTopSource = readFile(
      'themes',
      'circlelife',
      'components',
      'BackToTop.js'
    )

    test('两个区段各自给 <html> 打状态类（并在卸载时摘除）', () => {
      expect(showcaseSource).toContain('cl-home-album-active')
      expect(showcaseSource).toContain(
        "root.classList.remove('cl-home-album-active')"
      )
      expect(wallSource).toContain('cl-home-hero-active')
      expect(wallSource).toContain(
        "classList.remove('cl-home-hero-active')"
      )
    })

    test('样式压制规则存在且可覆盖 common.js 的 .is-visible', () => {
      // 状态类挂在 <html> 上 → 选择器必须带 #theme-circlelife 才能压过
      // common.js 的 `#theme-circlelife .cl-backtop.is-visible`（1 id + 2 class）
      expect(albumStyle).toContain(
        'html.cl-home-hero-active #theme-circlelife .cl-backtop.is-visible'
      )
      expect(albumStyle).toContain(
        'html.cl-home-album-active #theme-circlelife .cl-backtop.is-visible'
      )
      const rule = albumStyle.match(
        /\.cl-backtop\.is-visible,([\s\S]*?)\{([\s\S]*?)\n\s{6}\}/
      )
      expect(rule).not.toBeNull()
      expect(rule[2]).toContain('opacity: 0')
      expect(rule[2]).toContain('visibility: hidden')
      expect(rule[2]).toContain('pointer-events: none')
    })

    test('BackToTop 组件未被改成区域感知（共享组件保持原逻辑）', () => {
      expect(backTopSource).toContain('SHOW_AFTER')
      expect(backTopSource).toContain('window.scrollY')
      expect(backTopSource).not.toContain('cl-home-')
      expect(backTopSource).not.toContain('IntersectionObserver')
    })
  })

  describe('DOM 与无障碍', () => {
    test('段标题与段头出口都已撤：section 用 aria-label 命名（首页已有 h1，不得制造第二个 h1）', () => {
      // 段头整块撤除（博主定稿：影集段不再有任何出口，只留段内「进入影集 →」）
      expect(showcaseSource).toContain("aria-label='精选影集'")
      expect(showcaseSource).not.toContain('cl-home-album-title')
      expect(showcaseSource).not.toContain('cl-home-album-kicker')
      expect(showcaseSource).not.toContain('<h1')
      expect(showcaseSource).not.toContain('PageMast')
      // 段头与它的出口链接都已下线（正文里的「进入影集 →」不受影响）
      expect(showcaseSource).not.toContain('cl-home-album-head')
      expect(showcaseSource).not.toContain('cl-home-sec-link')
      expect(showcaseSource).not.toContain('全部影集')
      // 死 CSS 一并清掉
      expect(albumStyle).not.toContain('.cl-home-album-head')
    })

    test('影集名只在左列出现：左列是 h2，中间面板不再有专辑名', () => {
      // 名字由左列承担（左列是本段最大的字）
      expect(showcaseSource).toContain(
        "className='cl-home-album-item-name'"
      )
      // 段标题已撤 → h1（题字）之后直接是 h2，避免 h1 → h3 的层级跳跃
      expect(showcaseSource).toContain('<h2')
      expect(showcaseSource).not.toContain('<h3')
      // 中间面板不再重复渲染专辑名
      // （注意：id 前缀 cl-home-album-name- 是合法的，故按 className 精确匹配）
      expect(showcaseSource).not.toContain("className='cl-home-album-name'")
      expect(showcaseSource).not.toContain('className="cl-home-album-name"')
      expect(showcaseSource).not.toContain('{active?.name}</h2>')
      expect(albumStyle).not.toContain('.cl-home-album-name')
    })

    test('面板的无障碍名指向当前焦点项的标题（不新增可见文字）', () => {
      expect(showcaseSource).toContain(
        'aria-labelledby={`cl-home-album-name-${active?.id}`}'
      )
      expect(showcaseSource).toContain(
        'id={`cl-home-album-name-${album.id}`}'
      )
    })

    test('每辑都是真链接并带 aria-current，装饰件 aria-hidden', () => {
      expect(showcaseSource).toContain("aria-current={index === activeIndex ? 'true' : undefined}")
      expect(showcaseSource).toContain("aria-hidden='true'")
      expect(showcaseSource).toContain('href={album.href}')
      expect(showcaseSource).toContain('href={active?.href}')
    })

    test('空数据时整段不渲染', () => {
      expect(showcaseSource).toContain('if (!albums.length) return null')
    })
  })

  describe('接入与配置', () => {
    test('挂载在照片墙之后、文章列表之前，且只在首页', () => {
      const wallAt = themeIndexSource.indexOf('<HomeTiltWall')
      const albumAt = themeIndexSource.indexOf('<HomeAlbumShowcase')
      const listAt = themeIndexSource.indexOf('cl-home-content-container')
      expect(wallAt).toBeGreaterThan(-1)
      expect(albumAt).toBeGreaterThan(wallAt)
      expect(listAt).toBeGreaterThan(albumAt)
      expect(themeIndexSource).toContain("router.pathname === '/'")
      expect(themeIndexSource).toContain('CIRCLELIFE_HOME_ALBUM_SHOWCASE')
    })

    test('主题配置提供段开关与数量上限', () => {
      const configSource = readFile('themes', 'circlelife', 'config.js')
      expect(configSource).toContain('CIRCLELIFE_HOME_ALBUM_SHOWCASE')
      expect(configSource).toContain('CIRCLELIFE_HOME_ALBUM_COUNT')
      // 旧的「首页影集转筒」配置已无引用
      expect(configSource).not.toContain('CIRCLELIFE_HOME_FILM_COUNT')
    })
  })

  describe('Notion 数据链路', () => {
    test('属性名映射新增 featured → 精选', () => {
      expect(notionConfigSource).toContain('featured')
      expect(notionConfigSource).toContain("'精选'")
    })

    test('getPageProperties 支持 checkbox 并产出真正的布尔值', async () => {
      const { default: getPageProperties } = require('../../../lib/db/notion/getPageProperties')
      const value = {
        properties: { 'hOG~': [['Yes']] },
        created_time: '2026-01-01T00:00:00.000Z',
        last_edited_time: '2026-01-01T00:00:00.000Z',
        format: {},
        content: []
      }
      const schema = { 'hOG~': { name: '精选', type: 'checkbox' } }
      const props = await getPageProperties('page-id', value, schema, null, [])
      expect(props['精选']).toBe(true)
      // 映射循环把 精选 复制成 featured
      expect(props.featured).toBe(true)
    })

    test('未勾选的 checkbox 必须是 false（不能是 truthy 字符串）', async () => {
      const { default: getPageProperties } = require('../../../lib/db/notion/getPageProperties')
      const value = {
        properties: { 'hOG~': [['No']] },
        created_time: '2026-01-01T00:00:00.000Z',
        last_edited_time: '2026-01-01T00:00:00.000Z',
        format: {},
        content: []
      }
      const schema = { 'hOG~': { name: '精选', type: 'checkbox' } }
      const props = await getPageProperties('page-id', value, schema, null, [])
      expect(props['精选']).toBe(false)
      // 关键回归点：getTextContent 对 [["No"]] 返回 "No"（真值串），
      // 若走通用文本分支就会把「未勾选」误判为「已勾选」。
      // 注意：共享映射循环只复制真值（`properties[字段] && ...`），
      // 故未勾选时 featured 保持 undefined —— 语义仍是「未精选」，
      // isFeaturedAlbum 对 undefined 返回 false。
      expect(props.featured).toBeFalsy()
    })

    test('白名单含 featured / 精选（否则字段会被静默剥掉）', () => {
      const block = siteDataSource.match(
        /CLIENT_POST_SUMMARY_FIELDS\s*=\s*\[([\s\S]*?)\]/
      )
      expect(block).not.toBeNull()
      expect(block[1]).toContain("'featured'")
      expect(block[1]).toContain("'精选'")
    })
  })

  describe('首页负载', () => {
    test('死负载 photoDecks 已移除，改为精简的 homeAlbums', () => {
      expect(pagesIndexSource).not.toContain('props.photoDecks')
      expect(pagesIndexSource).toContain('props.homeAlbums')
    })

    test('homeAlbums 只下发封面与摘要，不下发全部正文图 URL', () => {
      expect(pagesIndexSource).toContain('isFeaturedAlbum')
      expect(pagesIndexSource).toContain('buildImageSources')
      // 不再把 images 数组整包塞进首页
      expect(pagesIndexSource).not.toMatch(/images\s*:\s*images/)
    })

    test('精选优先 + 最新补齐的排序口径写在代码里', () => {
      expect(pagesIndexSource).toContain('featuredPages')
      expect(pagesIndexSource).toContain('restPages')
      expect(pagesIndexSource).toContain('[...featuredPages, ...restPages]')
    })
  })

  describe('移动端 CTA 移位（2026-10 末定稿）', () => {
    test('移动端「进入影集 →」放在影集名下面，不再钉照片右下角', () => {
      // 右下角实测与回顶键重叠（CTA x=342–424 / y=905–928，回顶键 x=380–422 / y=886–928）
      expect(mobileStyle).toMatch(
        /\.cl-home-album-cta \{[^}]*left: var\(--cl-wide-pad\);/
      )
      expect(mobileStyle).toMatch(/\.cl-home-album-cta \{[^}]*right: auto;/)
      expect(mobileStyle).toMatch(/\.cl-home-album-cta \{[^}]*bottom: auto;/)
      // 纵坐标相对**取景框**（50% = 辑名中心）→ 与辑名同框、永远不分离
      expect(mobileStyle).toMatch(/\.cl-home-album-cta \{[^}]*top: calc\(\s*50%/)
      expect(mobileStyle).not.toMatch(
        /\.cl-home-album-cta \{[^}]*bottom: calc\(env\(safe-area-inset-bottom/
      )
      // ⚠️ 不能再按焦点线绝对定位：那套坐标挂在照片舞台上，
      // 与会上下移动的辑名不在同一个 sticky 坐标系里（真踩过）
      expect(mobileStyle).not.toMatch(
        /\.cl-home-album-cta \{[^}]*var\(--cl-home-album-focus-line\)/
      )
    })

    test('CTA 与影集名在同一个 sticky 框里（取景框），不是照片舞台', () => {
      // 两个 sticky 坐标系分离 → 名字动、CTA 不动 → 叠上去 / 离很远
      const viewportIdx = showcaseSource.indexOf(
        "className='cl-home-album-viewport'"
      )
      const ctaIdx = showcaseSource.indexOf("className='cl-home-album-cta'")
      expect(viewportIdx).toBeGreaterThan(-1)
      expect(ctaIdx).toBeGreaterThan(viewportIdx)
      // 取景框是 sticky 的定位上下文 → 绝对定位的 CTA 以它为基准
      expect(albumStyle).toMatch(
        /\.cl-home-album-viewport \{[^}]*position: sticky;/
      )
    })

    test('桌面端 CTA 显式藏掉（它现在住在可见的取景框里）', () => {
      expect(albumStyle).toMatch(/\.cl-home-album-cta \{\s*display: none;/)
      // 桌面自己的入口仍是右栏面板里的那颗
      expect(albumStyle).toContain('.cl-home-album-enter')
    })
  })
})
