/**
 * style.js 与 styles/ 片段的契约测试
 *
 * 背景：拆分 style.js 时出现过导出名不匹配（tokens.js 导出 tokensStyle，
 * style.js 引用 tokenStyle），webpack 仅报 warning 不阻断构建，undefined
 * 被字符串化拼进 CSS 顶部导致全站 token 失效。本测试让这类事故在
 * Jest 阶段爆掉。
 */
import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const styleSource = fs.readFileSync(path.join(themeDir, 'style.js'), 'utf8')

// style.js 声明的全部片段引用：import { X } from './styles/Y'
const refs = [...styleSource.matchAll(/import \{ (\w+) \} from '\.\/styles\/(\w+)'/g)].map(
  m => ({ exportName: m[1], file: m[2] })
)

describe('circlelife styles fragments', () => {
  test('style.js 至少引用六个样式片段', () => {
    expect(refs.length).toBeGreaterThanOrEqual(6)
  })

  test.each(refs.map(r => [`${r.file}.js 导出 ${r.exportName}`, r]))(
    '%s',
    (_label, { exportName, file }) => {
      const mod = require(`../../../themes/circlelife/styles/${file}`)
      const frag = mod[exportName]
      expect(typeof frag).toBe('string')
      expect(frag.length).toBeGreaterThan(0)
      expect(frag).toContain('{')
    }
  )

  test('拼接后的 CSS 不含 undefined 且括号平衡', () => {
    const joined = refs
      .map(({ exportName, file }) => {
        const mod = require(`../../../themes/circlelife/styles/${file}`)
        return mod[exportName]
      })
      .join('\n')
    expect(joined).not.toMatch(/\bundefined\b/)
    let balance = 0
    for (const ch of joined) {
      if (ch === '{') balance++
      if (ch === '}') balance--
    }
    expect(balance).toBe(0)
  })
})

/* ==========================================================================
   文章页头图渐变 + 阅读进度条几何契约
   ------------------------------------------------------------------------
   背景：这两处都出过「改了但线上没生效 / 观感不对」的事故，且都属于
   纯 CSS 几何，没有任何自动化能兜住。固化成契约断言：
     · 头图底部渐隐必须收敛到 45%，且末端精确落在纸色 --cl-bg（不留硬边）
     · 顶部压暗必须存在（浅色头图上导航胶囊要读得清）
     · 阅读进度基座线必须用 --cl-pill-radius 内缩、贴内缘，
       不允许回到 left:0/right:0 的全宽直条（那会溢出胶囊圆角）
   ========================================================================== */
describe('circlelife 头图渐变与阅读进度条契约', () => {
  const { tokenStyle } = require('../../../themes/circlelife/styles/tokens')
  const { articleStyle } = require('../../../themes/circlelife/styles/article')
  const { headerStyle } = require('../../../themes/circlelife/styles/header')

  // 取出一条 CSS 规则（含嵌套 {} 的安全截取）
  const ruleOf = (css, selector) => {
    const start = css.indexOf(selector)
    if (start < 0) return null
    let depth = 0
    let i = css.indexOf('{', start)
    const from = i
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++
      else if (css[i] === '}') {
        depth--
        if (depth === 0) break
      }
    }
    return css.slice(from, i + 1)
  }

  // 按「顶层逗号」切分遮罩色标：rgba(...) 内部的逗号不能当分隔符
  const splitStops = body => {
    const out = []
    let depth = 0
    let cur = ''
    for (const ch of body) {
      if (ch === '(') depth++
      else if (ch === ')') depth--
      if (ch === ',' && depth === 0) {
        out.push(cur.trim())
        cur = ''
        continue
      }
      cur += ch
    }
    if (cur.trim()) out.push(cur.trim())
    return out
  }

  // 解析 linear-gradient 的色标 → [{ pos, alpha }]，alpha: 1=不透明 / 0=全透明
  const parseMaskStops = body => {
    const stops = []
    // 去掉方向关键字（to bottom / to top …）
    const cleaned = body.replace(/to\s+(bottom|top|left|right)/gi, '')
    for (const part of splitStops(cleaned)) {
      // 位置可带 % 也可省略（CSS 允许无单位的 0）
      const m = part.match(/^(.*?)\s+([\d.]+)%?$/s)
      if (!m) continue
      const color = m[1].trim()
      const pos = Number(m[2])
      let alpha = 1
      if (/^transparent$/i.test(color)) {
        alpha = 0
      } else {
        const rgba = color.match(/rgba?\(([^)]*)\)/i)
        if (rgba) {
          const comps = rgba[1].split(',').map(x => x.trim())
          alpha = Number(comps[comps.length - 1])
        }
      }
      stops.push({ pos, alpha })
    }
    return stops
  }

  test('头图底边改用遮罩溶解，并保留顶部压暗 token', () => {
    expect(tokenStyle).toContain('--cl-article-cover-mask:')
    expect(tokenStyle).toContain('--cl-article-cover-mask-card:')
    expect(tokenStyle).toContain('--cl-article-cover-scrim-h:')
    expect(tokenStyle).toContain('--cl-article-cover-scrim:')
    // 旧的「渐隐区高度」token 已随遮罩方案下线
    expect(tokenStyle).not.toContain('--cl-article-cover-fade-h')
  })

  test('遮罩挂在图片上，mask-size / mask-repeat 显式写全', () => {
    const rule = ruleOf(articleStyle, '#theme-circlelife .cl-article-cover-img')
    expect(rule).not.toBeNull()
    expect(rule).toContain('mask-image: var(--cl-article-cover-mask)')
    expect(rule).toContain('-webkit-mask-image: var(--cl-article-cover-mask)')
    // 漏写这两条遮罩会平铺
    expect(rule).toContain('mask-size: 100% 100%')
    expect(rule).toContain('mask-repeat: no-repeat')
  })

  test('顶部压暗层存在且只在全屏形态生效', () => {
    const rule = ruleOf(articleStyle, '#theme-circlelife .cl-article-cover-scrim')
    expect(rule).not.toBeNull()
    expect(rule).toContain('var(--cl-article-cover-scrim)')
    expect(rule).toContain('var(--cl-article-cover-scrim-h)')
  })

  test('卡片回退形态走 surface 遮罩与 surface 底色，不受全屏规则污染', () => {
    const cardMask = ruleOf(
      articleStyle,
      '#theme-circlelife .cl-article--card .cl-article-cover-img'
    )
    expect(cardMask).not.toBeNull()
    expect(cardMask).toContain('mask-image: var(--cl-article-cover-mask-card)')

    const cardCover = ruleOf(
      articleStyle,
      '#theme-circlelife .cl-article--card .cl-article-cover'
    )
    expect(cardCover).not.toBeNull()
    expect(cardCover).toContain('background: var(--cl-surface)')
  })

  test('胶囊圆角 token 由 --cl-nav-height 派生（随移动端覆盖自动跟随）', () => {
    expect(tokenStyle).toContain(
      '--cl-pill-radius: calc(var(--cl-nav-height) / 2)'
    )
  })

  test('阅读进度基座线内缩到胶囊圆角、贴内缘，不再是全宽直条', () => {
    const rule = ruleOf(headerStyle, '.cl-read-progress {')
    expect(rule).not.toBeNull()
    expect(rule).toContain('left: var(--cl-pill-radius)')
    expect(rule).toContain('right: var(--cl-pill-radius)')
    expect(rule).toContain('bottom: 1px')
    // 全宽直条会让两端画到胶囊圆角之外（胶囊无 overflow:hidden，裁不掉）
    expect(rule).not.toMatch(/left:\s*0\b/)
    expect(rule).not.toMatch(/right:\s*0\b/)
    // 轨道必须自带圆角，朱砂填充被裁在同一形状内
    expect(rule).toContain('border-radius: 9999px')
    expect(rule).toContain('overflow: hidden')
  })

  test('胶囊仍不加 overflow: hidden（会裁掉父级就地下拉 .cl-pill-sub）', () => {
    const pillRule = ruleOf(headerStyle, '.cl-floating-pill {')
    expect(pillRule).not.toBeNull()
    expect(pillRule).not.toContain('overflow: hidden')
    expect(pillRule).toContain('position: relative')
  })

  /* ==========================================================================
     遮罩溶解契约
     ------------------------------------------------------------------------
     背景：原先底边是「盖一层色纱的覆盖层 div」。深色模式下目标色近黑 #14110e，
     照片要跨越的亮度差极大，色纱把照片中下段整片压黑 —— 博主反馈"黑边没消去、
     照片可用范围反而被黑色渐变缩小了"（拉长到 65% 是反效果）。
     改为遮罩：消失的是照片自己的像素，透出的是页面底色本身；且可以很浅。
     浅色用遮罩精确复刻原曲线（55% 停靠 + 七级对应）→ 观感逐像素不变。
     ========================================================================== */
  test('色纱覆盖层已彻底移除（样式与 JSX 都不该再有）', () => {
    expect(articleStyle).not.toContain('cl-article-cover-fade')
    const indexSource = fs.readFileSync(
      path.join(themeDir, 'index.js'),
      'utf8'
    )
    expect(indexSource).not.toContain('cl-article-cover-fade')
  })

  test('封面容器底色 = 页面底色，溶解区不留残留色带', () => {
    const coverRule = ruleOf(articleStyle, '#theme-circlelife .cl-article-cover')
    expect(coverRule).not.toBeNull()
    expect(coverRule).toContain('background: var(--cl-bg)')
  })

  test('浅色遮罩：照片 55% 保持原样，末端全透明', () => {
    const rootRule = ruleOf(tokenStyle, ':root {')
    expect(rootRule).not.toBeNull()
    const mask = rootRule.match(
      /--cl-article-cover-mask:\s*linear-gradient\(([^;]+)\);/
    )
    expect(mask).not.toBeNull()
    const stops = parseMaskStops(mask[1])
    // 首个全不透明停靠点 = 照片保持原样的比例
    expect(stops[0].pos).toBe(0)
    expect(stops[1].pos).toBe(55)
    expect(stops[1].alpha).toBe(1)
    // 末端必须完全透明 → 封面底边与页面零色差
    expect(stops[stops.length - 1].alpha).toBe(0)
    expect(stops[stops.length - 1].pos).toBe(100)
    // 位置与不透明度都必须单调递减（越往下越透明）
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].pos).toBeGreaterThan(stops[i - 1].pos)
      expect(stops[i].alpha).toBeLessThanOrEqual(stops[i - 1].alpha)
    }
  })

  test('深色遮罩：照片至少 75% 保持原样（防止再被拉长成大片黑边）', () => {
    const darkRule = ruleOf(tokenStyle, '.dark {')
    expect(darkRule).not.toBeNull()
    const mask = darkRule.match(
      /--cl-article-cover-mask:\s*linear-gradient\(([^;]+)\);/
    )
    expect(mask).not.toBeNull()
    const stops = parseMaskStops(mask[1])
    // 第一个仍完全不透明的位置
    let solidUntil = 0
    for (const s of stops) {
      if (s.alpha >= 1) solidUntil = s.pos
      else break
    }
    expect(solidUntil).toBeGreaterThanOrEqual(75)
    // 末端必须完全透明
    expect(stops[stops.length - 1].alpha).toBe(0)
    expect(stops[stops.length - 1].pos).toBe(100)
  })
})
