/**
 * 文章页头图 LCP 预加载的守卫条件
 *
 * 背景：头图是站内唯一 LCP 大图（2048 档约 651KB）。预加载一旦与主题实际渲染
 * 的封面不一致，就等于白下载 —— 比不预加载更糟。所以三个"不该预加载"的
 * 条件必须被钉死：主题关掉封面开关、文章有密码（走 PostLock 不渲染封面）、
 * 文章压根没有封面。
 */
import { resolveArticleCoverPreload } from '@/lib/db/notion/articleCover'

const COVER =
  'https://www.notion.so/image/https%3A%2F%2Fimages.unsplash.com%2Fphoto-1.jpg?table=block&id=abc'

describe('resolveArticleCoverPreload', () => {
  test('正常文章：给出与封面同源的 src / srcSet / sizes', () => {
    const preload = resolveArticleCoverPreload({ pageCover: COVER })
    expect(preload).not.toBeNull()
    expect(preload.src).toContain('width=2048')
    // 候选集必须与主题侧一致：1024w / 2048w 两档
    expect(preload.srcSet).toContain('1024w')
    expect(preload.srcSet).toContain('2048w')
    expect(preload.sizes).toBe('100vw')
  })

  test('主题关掉封面开关 → 不预加载（否则白下载 651KB）', () => {
    const preload = resolveArticleCoverPreload(
      { pageCover: COVER },
      { coverEnabled: false }
    )
    expect(preload).toBeNull()
  })

  test('文章有密码（走 PostLock、不渲染封面）→ 不预加载', () => {
    const preload = resolveArticleCoverPreload({
      pageCover: COVER,
      password: 'secret'
    })
    expect(preload).toBeNull()
  })

  test('没有封面 → 不预加载', () => {
    expect(resolveArticleCoverPreload({})).toBeNull()
    expect(resolveArticleCoverPreload(null)).toBeNull()
  })

  test('卡片回退形态用另一套 sizes（与主题侧一致）', () => {
    const preload = resolveArticleCoverPreload(
      { pageCover: COVER },
      { cardMode: true }
    )
    expect(preload.sizes).toBe('(max-width: 767px) 100vw, 48rem')
  })

  test('非反代地址（Notion page-cover）无候选集：src 即页面实际请求的 URL', () => {
    const preload = resolveArticleCoverPreload({
      pageCover: 'https://www.notion.so/images/page-cover/met_silk_kashan.jpg'
    })
    expect(preload).not.toBeNull()
    expect(preload.src).toBe(
      'https://www.notion.so/images/page-cover/met_silk_kashan.jpg'
    )
    // 非反代地址不生成候选集，sizes 也随之为空 —— 必须与主题侧 buildImageSources 的输出逐字一致，
    // 否则 preload 与 <img> 会对不上
    expect(preload.srcSet).toBe('')
    expect(preload.sizes).toBe('')
  })
})
