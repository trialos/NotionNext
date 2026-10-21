import { compressImage } from '@/lib/db/notion/mapImage'
import { buildImageSources } from '@/themes/circlelife/components/imageSrcset'

/**
 * 文章页头图（站内唯一 LCP 大图）的预加载信息
 *
 * 预加载必须与主题**实际渲染**的封面完全一致，否则等于白下载（2048 档约 651KB）：
 *   · 主题关掉封面开关 → 不预加载
 *   · 文章有密码（走 PostLock，不渲染封面）→ 不预加载
 *   · 卡片回退形态的 sizes 与全屏形态不同
 * 候选集与停靠点必须与主题侧同源，否则移动端会预加载一档、页面又拉另一档。
 *
 * 预加载只能放在**页面级**：写在主题里的 <Head> 在 SSR 阶段会被丢弃，
 * 等 hydration 补上时预加载已无意义（见私有库 circlelife-THEME-ARCH 排错 6）。
 *
 * @param {Object} post 文章对象（需含 pageCover / password）
 * @param {{ coverEnabled?: boolean, cardMode?: boolean }} options 主题侧封面开关与形态
 * @returns {{ src: string, srcSet: string, sizes: string } | null}
 */
export function resolveArticleCoverPreload(post, options = {}) {
  const { coverEnabled = true, cardMode = false } = options
  if (!coverEnabled) return null
  if (!post?.pageCover) return null
  // 有密码的文章渲染的是 PostLock，没有头图
  if (post?.password) return null

  const src = compressImage(post.pageCover, 1600)
  const sources = buildImageSources(src, {
    sizes: cardMode ? '(max-width: 767px) 100vw, 48rem' : '100vw',
    widths: [1024, 2048]
  })
  if (!sources.src) return null
  return { src: sources.src, srcSet: sources.srcSet, sizes: sources.sizes }
}
