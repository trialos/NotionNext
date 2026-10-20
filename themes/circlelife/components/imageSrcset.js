/**
 * 取图档位与 srcset 候选集
 *
 * 背景（实测）：Notion 图片代理会把 width 参数量化到三档，无法精细控制。
 *   请求 300–400   → 512px  / 42KB
 *   请求 600–1000  → 1024px / 178KB
 *   请求 1200–1600 → 2048px / 651KB
 * 此前统一按 1200 取图，正好命中最高档：每张 651KB、解码位图 12.6–22MB，
 * 14 张唯一图合计约 176–300MB，是首页卡顿与移动端崩溃的真实原因。
 *
 * 因此这里只产出两档候选（512 / 1024），由浏览器按 sizes + DPR 自行挑选。
 * 仅对 Notion 反代 URL 生效：S3 直链、外链、本地图带 width 参数不会缩放，
 * 强行生成候选只会造成无效请求。
 */

/** 两档宽度（对应 Notion 服务端的 512 / 1024 两档） */
export const IMAGE_TIERS = {
  mobile: 512,
  desktop: 1024
}

/**
 * 照片墙栏宽 clamp(220px, 20vw, 360px)，再叠加画布 scale(1.06~1.42)。
 * 桌面 360 × 1.42 ≈ 512 CSS px → DPR1/DPR2 都落到 1024 档；
 * 移动 150 × 1.06 ≈ 160 → DPR3 约 480，落到 512 档。
 */
export const DEFAULT_SIZES = '(max-width: 767px) 170px, 520px'

const HTTP_URL = /^https?:\/\//i
/** Notion 官方反代：https://www.notion.so/image/<encoded source> */
const NOTION_PROXY = /\/image\//

/**
 * 是否是可被 width 参数缩放的反代地址
 * @param {string} url
 */
export function isNotionProxyUrl(url) {
  if (typeof url !== 'string' || !HTTP_URL.test(url)) return false
  if (url.includes('.svg')) return false
  return NOTION_PROXY.test(url)
}

/**
 * 改写反代地址的 width 参数（档位由服务端决定，这里只负责表达诉求）
 * @param {string} url
 * @param {number} width
 */
function withWidth(url, width) {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('width', String(width))
    urlObj.searchParams.set('cache', 'v2')
    return urlObj.toString()
  } catch (_) {
    return url
  }
}

/**
 * 生成单个图片的取图候选
 * @param {string} url 原始地址
 * @param {{ sizes?: string }} [options]
 * @returns {{ src: string, srcSet: string, sizes: string }}
 *  非反代地址时 srcSet 为空字符串，调用方应退化为纯 src
 */
export function buildImageSources(url, options = {}) {
  const sizes = options.sizes || DEFAULT_SIZES

  if (typeof url !== 'string' || !url) {
    return { src: '', srcSet: '', sizes: '' }
  }

  if (!isNotionProxyUrl(url)) {
    return { src: url, srcSet: '', sizes: '' }
  }

  const mobile = withWidth(url, IMAGE_TIERS.mobile)
  const desktop = withWidth(url, IMAGE_TIERS.desktop)

  return {
    src: desktop,
    srcSet: `${mobile} ${IMAGE_TIERS.mobile}w, ${desktop} ${IMAGE_TIERS.desktop}w`,
    sizes
  }
}

export default buildImageSources
