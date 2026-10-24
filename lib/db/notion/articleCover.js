import { compressImage } from '@/lib/db/notion/mapImage'
import { buildSizedSource } from '@/themes/circlelife/components/imageSrcset'

/**
 * 文章页头图（站内唯一 LCP 大图）的预加载信息
 *
 * 预加载必须与主题**实际渲染**的封面完全一致，否则等于白下载（2048 档约 651KB）：
 *   · 主题关掉封面开关 → 不预加载
 *   · 文章有密码（走 PostLock，不渲染封面）→ 不预加载
 * 预加载 URL 必须是**直连 width URL**、且与主题 SSR 的首屏档位一致（1024）。
 *
 * ⚠️ **不再产 srcset/sizes**（2026-10-24 实测）：Notion 代理在 srcset 选档路径下
 * 按 **CSS 宽度**出图、不吃 DPR → Retina 上头图差 2~3 倍像素 → 被拉伸放大 → 发虚；
 * 而且带候选集会让预加载落在另一个 URL 上（白下载一份）。
 * 主题侧会在挂载后按「显示宽 × DPR」把头图升级到更大的直连档位。
 *
 * 预加载只能放在**页面级**：写在主题里的 <Head> 在 SSR 阶段会被丢弃，
 * 等 hydration 补上时预加载已无意义（见私有库 circlelife-THEME-ARCH 排错 6）。
 *
 * @param {Object} post 文章对象（需含 pageCover / password）
 * @param {{ coverEnabled?: boolean }} options 主题侧封面开关
 * @returns {{ src: string, srcSet: string, sizes: string } | null}
 */
export function resolveArticleCoverPreload(post, options = {}) {
  const { coverEnabled = true } = options
  if (!coverEnabled) return null
  if (!post?.pageCover) return null
  // 有密码的文章渲染的是 PostLock，没有头图
  if (post?.password) return null

  const src = compressImage(post.pageCover, 1600)
  const direct = buildSizedSource(src, 1024)
  if (!direct) return null
  return { src: direct, srcSet: '', sizes: '' }
}
