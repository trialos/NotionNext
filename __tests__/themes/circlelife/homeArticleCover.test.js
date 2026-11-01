/**
 * 首页文章图版：两槽 canvas 池的取图/生命周期契约
 *
 * 只测纯函数与源码契约；真实绘制的像素/帧率由 3000 预览和真机验收。
 */
import fs from 'fs'
import path from 'path'
import {
  ARTICLE_COVER_TIER,
  COVER_SETTLE_MS,
  coverUrl
} from '../../../themes/circlelife/components/HomeArticleCover'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')
const coverSource = readFile(
  'themes',
  'circlelife',
  'components',
  'HomeArticleCover.js'
)

const SOURCE = 'https://prod-files-secure.s3.us-west-2.amazonaws.com/cover.jpg'
const PROXY = `https://www.notion.so/image/${encodeURIComponent(
  SOURCE
)}?table=block&id=abc&t=xyz&cache=v2&width=2048`

describe('首页文章图版 HomeArticleCover', () => {
  test('固定 1024 档；输入 2048 也会被改写；非代理直链原样返回', () => {
    expect(ARTICLE_COVER_TIER).toBe(1024)
    expect(COVER_SETTLE_MS).toBe(120)
    const url = coverUrl(PROXY)
    expect(new URL(url).searchParams.get('width')).toBe('1024')
    expect(url).not.toContain('width=2048')
    expect(coverUrl('https://example.com/a.jpg')).toBe(
      'https://example.com/a.jpg'
    )
    expect(coverUrl('')).toBe('')
  })

  test('源码契约：不拉更高档、只在 RO 量盒子、释放位图、无动画库', () => {
    expect(coverSource).toContain('ARTICLE_COVER_TIER = 1024')
    expect(coverSource).not.toContain('2048')
    expect(coverSource).toContain('releaseCanvas')
    expect(coverSource).toContain('ResizeObserver')
    expect(coverSource).toContain("aria-hidden='true'")
    expect((coverSource.match(/measureBox\(/g) || []).length).toBe(1)
    expect(coverSource).toContain('COVER_SETTLE_MS = 120')
    expect(coverSource).not.toContain('setInterval')
    expect(coverSource).not.toContain('translate3d')
    expect(coverSource).not.toMatch(/from\s+['"]gsap/)
  })

  test('缓存覆盖 ±2 工作集 + 可清理；arm/prefetch/release 三个入口存在', () => {
    expect(coverSource).toContain('MAX_DECODED = 5')
    expect(coverSource).toContain('export function clearCoverCache')
    expect(coverSource).toContain('cacheEpoch += 1')
    expect(coverSource).toContain('decoded.clear()')
    expect(coverSource).toContain('pending.clear()')
    expect(coverSource).toContain('arm(priority')
    expect(coverSource).toContain('prefetch()')
    expect(coverSource).toContain('release()')
  })
})
