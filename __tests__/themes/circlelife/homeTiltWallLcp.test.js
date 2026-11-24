/**
 * 首页照片墙 · 首屏图固定档 SSR 直出契约测试
 *
 * 背景（2026-11-24 PageSpeed 手机端）：性能 66 分，唯一瓶颈 LCP 12.7 秒
 * （FCP 2.2s / TBT 120ms / CLS 0 均健康）。
 *
 * 根因：HomeTiltWall 首屏图全在 useEffect → buildColumns 里 createElement，
 * SSR HTML 里看不到 → 浏览器必须等 hydration 才发现 LCP 候选
 * （Lighthouse: requestDiscoverable=false，Load Delay 5.7s 占 48%）。
 *
 * 定四条契约：
 * 1. SSR 直出前 12 张候选图，带真实 src + fetchpriority=high。
 * 2. 首屏图（SSR 与 JS）统一固定 512 档：倾斜缩小的装饰图不追求 DPR 精确，
 *    URL 一致 → 浏览器命中缓存，不重复下载。preload 也必须是同一个 URL。
 * 3. 客户端按 DOM 顺序（先进先出）复用种子节点，不用 id 匹配、不另建 img。
 * 4. 非首屏卡片仍按 DPR 选档 + 用 <canvas>（不进 LCP 候选）。
 */
import { TextDecoder, TextEncoder } from 'util'
import React, { createElement } from 'react'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
const { renderToStaticMarkup } = require('react-dom/server')

const fs = require('fs')
const path = require('path')
const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const HomeTiltWall = require('../../../themes/circlelife/components/HomeTiltWall')
  .default
const source = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeTiltWall.js'
)

const coverImages = Array.from({ length: 15 }, (_, i) => ({
  id: `c${i}`,
  src: `https://img.withcol.com/image/pic-${i}.jpg?width=1024`,
  aspectRatio: i % 2 ? 0.8 : 1.333,
  title: `第${i}张`
}))

const renderWall = props =>
  renderToStaticMarkup(createElement(HomeTiltWall, props))

const seedTags = html => html.match(/<img[^>]*data-ssr-seed="true"[^>]*>/g) || []

describe('首页照片墙首屏图固定档 SSR 直出', () => {
  test('SSR 直出前 12 张候选图，每张带 512 档 src + fetchpriority=high + is-loaded', () => {
    const seeds = seedTags(renderWall({ homeCoverImages: coverImages }))
    expect(seeds).toHaveLength(12)
    seeds.forEach((tag, i) => {
      expect(tag).toContain(`pic-${i}.jpg?width=512`)
      expect(tag).toContain('fetchpriority="high"')
      expect(tag).toContain('is-loaded')
    })
  })

  test('图源不足 12 张时按实际数量输出', () => {
    expect(
      seedTags(renderWall({ homeCoverImages: coverImages.slice(0, 3) }))
    ).toHaveLength(3)
  })

  test('没有图源时不输出任何种子图', () => {
    expect(seedTags(renderWall({ homeCoverImages: [] }))).toHaveLength(0)
  })

  test('客户端按 DOM 顺序先进先出复用种子（不用 id 匹配）', () => {
    expect(source).toMatch(/seedQueue = \[\.\.\.rotated\.querySelectorAll/)
    expect(source).toMatch(/seedQueue\.shift\(\)/)
    expect(source).not.toMatch(/data-card-id/)
    expect(source).not.toMatch(/seedPool/)
  })

  test('首屏图固定 512 档，非首屏卡片才按 DPR 选档', () => {
    expect(source).toMatch(/const HERO_IMAGE_TIER = 512/)
    expect(source).toMatch(
      /const targetPx = immediate \? HERO_IMAGE_TIER : computeTargetPixelWidth\(cardCssWidth, dpr\)/
    )
    expect(source).toMatch(/buildSizedSource\(card\.src, HERO_IMAGE_TIER\)/)
  })

  test('非首屏卡片仍用 canvas，不产生额外 LCP 候选', () => {
    expect(source).toMatch(
      /document\.createElement\(immediate \? 'img' : 'canvas'\)/
    )
  })

  test('页面级 preload 与首屏种子图用同一个 512 URL，避免下载两份', () => {
    const pageIndex = readFile('pages', 'index.js')
    expect(pageIndex).toMatch(/buildSizedSource\(heroLcp\.src,\s*512\)/)
  })
})
