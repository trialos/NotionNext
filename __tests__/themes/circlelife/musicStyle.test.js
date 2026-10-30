/**
 * 音乐模块样式契约测试
 *
 * 音乐三页是新模块，最容易悄悄坏掉的是这几件事（全是纯 CSS，自动化兜不住）：
 *   1. 刊头基线：必须与归档/影集落在同一条 --cl-mast-top 上，且顶部间距由模块自持
 *   2. 几何不散落：桌面/手机的量值只改 --cl-music-* token，不在各条规则里重复写像素
 *   3. 模块色：墨蓝 --cl-music 在 :root 与 .dark 各定义一次，深色必须提亮
 *      （#2e4a5a 在 #14110e 暗底上会糊成一片）
 *   4. 焦点环仍走全站朱砂，不跟模块色走
 */
import fs from 'fs'
import path from 'path'

const { musicStyle } = require('../../../themes/circlelife/styles/music')
const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
const { mastStyle } = require('../../../themes/circlelife/styles/mast')

const ROOT = process.cwd()
const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), 'utf8')

/** 取出某个选择器的第一条规则体 */
const ruleBodyOf = (css, selector) => {
  const m = css.match(
    new RegExp(
      selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'
    )
  )
  return m ? m[1] : null
}

describe('音乐模块几何', () => {
  test('页面容器与归档/影集同基准：--cl-mast-top + --cl-wide-pad + --cl-wide-max', () => {
    const body = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-page')
    expect(body).not.toBeNull()
    expect(body).toContain('var(--cl-mast-top)')
    expect(body).toContain('var(--cl-wide-pad)')
    expect(body).toContain('max-width: var(--cl-wide-max)')
  })

  test('断点里只改 token，网格字面值不散落在规则体里', () => {
    // 列数在三个断点各定一次（2 / 4 / 5），其余几何各两次（默认 + ≥768）
    expect([...musicStyle.matchAll(/--cl-music-grid-cols:/g)]).toHaveLength(3)
    expect([...musicStyle.matchAll(/--cl-music-track-cols:/g)]).toHaveLength(2)
    expect([...musicStyle.matchAll(/--cl-music-hero-cover:/g)]).toHaveLength(2)

    const grids = [...musicStyle.matchAll(/grid-template-columns:\s*([^;\n]+)/g)].map(m =>
      m[1].trim()
    )
    expect(grids.length).toBeGreaterThan(0)
    grids.forEach(value => {
      // 允许：token 推导的网格、以及单列自适应（minmax(0,1fr)，不含任何字面像素）
      expect(value).toMatch(
        /var\(--cl-music-|repeat\(var\(--cl-music-|^minmax\(0, 1fr\)$/
      )
    })
  })

  test('序号与时长用等宽数字，避免抖动', () => {
    const no = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-track-no')
    const dur = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-track-dur')
    expect(no).toContain('tabular-nums')
    expect(dur).toContain('tabular-nums')
  })

  test('没有低于 12px 的字号（原型 8–9px 装饰小字落到中文页面上读不动）', () => {
    const small = [...musicStyle.matchAll(/font-size:\s*([0-9.]+)rem/g)]
      .map(m => Number(m[1]))
      .filter(px => px < 0.75)
    expect(small).toEqual([])
    // 表头、序号、时长、外链这些都必须走同一个 token，不许各写各的
    const tokenUses = [
      ...musicStyle.matchAll(/font-size:\s*var\(--cl-music-micro\)/g)
    ]
    expect(tokenUses.length).toBeGreaterThanOrEqual(15)
  })

  test('曲目行外链的触控热区补足到 44px', () => {
    const body = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-ncm--icon')
    expect(body).toContain('min-height: 2.75rem')
  })

  test('文字形态外链与返回链接也补触控区（本体只有 18–20px 高）', () => {
    expect(ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-ncm')).toContain(
      'padding-block'
    )
    expect(ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-back')).toContain(
      'padding-block'
    )
  })

  test('曲目区与上文留出段距，外链不再贴着表头', () => {
    const section = ruleBodyOf(
      musicStyle,
      '#theme-circlelife .cl-music-track-section'
    )
    expect(section).not.toBeNull()
    expect(section).toContain('margin-top: var(--cl-music-section-gap)')
    expect(
      ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-actions')
    ).toContain('margin-bottom: var(--cl-music-space-lg)')
  })

  test('条目页顶部返回与手记页顶部同一节奏', () => {
    const body = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-album-top')
    expect(body).not.toBeNull()
    expect(body).toContain('margin-bottom: var(--cl-music-space-xl)')
  })

  test('条目页页脚只留表尾与全站页脚两条线，行内基线齐平', () => {
    const foot = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-foot')
    expect(foot).not.toBeNull()
    expect(foot).not.toContain('border-top')
    expect(foot).not.toContain('padding-top')
    const synced = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-synced')
    expect(synced).not.toBeNull()
    expect(synced).toContain('margin: 0;')
  })

  test('模块内不出现低于 13px 的硬编码字号（小字只走 micro / body 两个 token）', () => {
    const hardCoded = [...musicStyle.matchAll(/font-size:\s*([0-9.]+)rem/g)]
      .map(m => Number(m[1]))
      .filter(size => size < 0.8125)
    expect(hardCoded).toEqual([])
    // 正文级小字（描述、摘要）有独立 token，且不低于 micro
    expect(musicStyle).toContain('--cl-music-body: 0.8125rem;')
    expect(ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-desc')).toContain(
      'var(--cl-music-body)'
    )
  })

  test('手记页正文宽度引用全站测量宽 token，不写死 60rem', () => {
    const body = ruleBodyOf(musicStyle, '#theme-circlelife .cl-music-note-wrap')
    expect(body).toContain('var(--cl-prose-measure)')
    expect(body).not.toMatch(/max-width:\s*60rem/)
  })
})

describe('音乐模块色与全站纪律', () => {
  test('--cl-music 在 :root 与 .dark 各定义一次，深色值必须更亮', () => {
    expect(tokenStyle).toContain('--cl-music: #2e4a5a;')
    const dark = tokenStyle.match(/\.dark \{([\s\S]*?)\n      \}/)
    expect(dark?.[1]).toContain('--cl-music: #8fa9b8;')
  })

  test('刊头竖线用模块色，影集朱砂与归档暖金不受影响', () => {
    expect(
      ruleBodyOf(mastStyle, '#theme-circlelife .cl-page-mast--music')
    ).toContain('--cl-mast-rule: var(--cl-music)')
    expect(
      ruleBodyOf(mastStyle, '#theme-circlelife .cl-page-mast--album')
    ).toContain('var(--cl-vermilion, #b93a2b)')
    expect(
      ruleBodyOf(mastStyle, '#theme-circlelife .cl-page-mast--archive')
    ).toContain('var(--cl-gold)')
  })

  test('焦点环保持全站朱砂，不跟模块色', () => {
    const body = ruleBodyOf(
      musicStyle,
      '#theme-circlelife .cl-music-page a:focus-visible'
    )
    expect(body).toContain('var(--cl-accent)')
    expect(body).not.toContain('var(--cl-music)')
  })

  test('色值只出现在两处：token 定义与占位唱片套面配色', () => {
    // 占位封面是设计件（原型同款），其余一律走 var(--cl-*)
    const hexes = musicStyle.match(/#[0-9a-f]{3,8}\b/gi) || []
    const allowed = new Set([
      '#1f2a30',
      '#f0e9dc',
      '#4a3038',
      '#f0e2e6',
      '#5a3a2e',
      '#f3e8dc',
      '#3f4636',
      '#eef0e4',
      '#c9b99e',
      '#20190f'
    ])
    hexes.forEach(hex => expect(allowed.has(hex.toLowerCase())).toBe(true))
  })
})

describe('接线完整', () => {
  test('music 片段已按序注入主题样式', () => {
    const style = read('themes/circlelife/style.js')
    expect(style).toContain("import { musicStyle } from './styles/music'")
    expect(style.indexOf('${albumStyle}')).toBeLessThan(
      style.indexOf('${musicStyle}')
    )
    expect(style.indexOf('${musicStyle}')).toBeLessThan(
      style.indexOf('${aboutStyle}')
    )
  })

  test('三个布局都在主题导出与路由映射里登记（漏一条会静默回落 LayoutSlug）', () => {
    const themeIndex = read('themes/circlelife/index.js')
    const layoutMap = read('conf/layout-map.config.js')
    const themeLoader = read('themes/theme.js')
    const names = ['LayoutMusic', 'LayoutMusicAlbum', 'LayoutMusicNote']
    names.forEach(name => {
      expect(themeIndex).toContain(name)
      expect(themeLoader).toContain(`m.${name}`)
    })
    expect(layoutMap).toContain("'/music': 'LayoutMusic'")
    expect(layoutMap).toContain("'/music/album/[album]': 'LayoutMusicAlbum'")
    expect(layoutMap).toContain("'/music/note/[note]': 'LayoutMusicNote'")
  })

  test('条目页上下各一处返回链接', () => {
    const index = read('themes/circlelife/index.js')
    expect(index).toContain("className='cl-music-album-top'")
    expect((index.match(/className='cl-music-back'/g) || []).length).toBe(2)
  })
})
