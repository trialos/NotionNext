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
  test('正常文章：给出**直连**的 1024 档 URL，且不产候选集', () => {
    const preload = resolveArticleCoverPreload({ pageCover: COVER })
    expect(preload).not.toBeNull()
    // 直连 width URL：与主题侧 SSR 的首屏档位逐字一致 → 预加载精确命中
    expect(preload.src).toContain('width=1024')
    // ⚠️ 不再产 srcset/sizes：Notion 代理在 srcset 选档路径下按 **CSS 宽度**
    // 出图、不吃 DPR（Retina 上头图差 2~3 倍像素 → 发虚）；且带候选集会让
    // 预加载落在另一个 URL 上 → 白下载一份。
    expect(preload.srcSet).toBe('')
    expect(preload.sizes).toBe('')
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

  test('卡片回退形态与全屏形态同档（SSR 都是 1024 档；客户端按显示宽 × DPR 升级）', () => {
    const preload = resolveArticleCoverPreload(
      { pageCover: COVER },
      { cardMode: true }
    )
    expect(preload.src).toContain('width=1024')
    expect(preload.srcSet).toBe('')
    expect(preload.sizes).toBe('')
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
