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

/** 默认候选档（既有调用不变）；全出血封面等大图场景可传 widths: [1024, 2048] */
const DEFAULT_WIDTHS = [IMAGE_TIERS.mobile, IMAGE_TIERS.desktop]

/**
 * 直连取图（不走 srcset）时的宽度档位。
 *
 * ⚠️ 为什么首页图片不走 srcset（2026-10 实测，勿轻易改回）：
 * Notion 图片代理对**同一个 URL** 会按请求方式返回**不同的图**：
 *   - `img.src = url`                        → 未预裁切的原图（正常遵守 width 参数）
 *   - `img.srcset = url + ' 2048w'` + `sizes` → **预裁切的小图**（同一 URL，尺寸差 2~6 倍）
 * 用 cache-buster 复现，结果稳定（排除缓存因素）。
 * 后果：走 srcset 的图本身就已经被裁过一道，canvas 再按 cover 裁一次 = 双重裁切
 * → 首页照片看起来「被放大 / 边缘被切」。所以首页一律**直连 width URL**，
 * 裁切只由 drawCover 做一次。
 */
export const WIDTH_TIERS = [256, 512, 1024, 2048]

/** 取「不小于目标像素」的最小档位；超上限取最高档 */
export function pickWidthTier(targetPx) {
  const px = Number(targetPx)
  if (!Number.isFinite(px) || px <= 0) return WIDTH_TIERS[0]
  for (const tier of WIDTH_TIERS) {
    if (px <= tier) return tier
  }
  return WIDTH_TIERS[WIDTH_TIERS.length - 1]
}

/**
 * 按「显示宽度 × DPR」算出该请求的取图档位。
 *
 * @param {number} cssWidth 显示宽度（CSS 像素，布局尺寸）
 * @param {number} dpr 设备像素比
 * @returns {number} WIDTH_TIERS 里的档位宽度
 */
export function computeTargetPixelWidth(cssWidth, dpr) {
  const width = Number(cssWidth)
  if (!Number.isFinite(width) || width <= 0) return WIDTH_TIERS[0]
  const ratio = Number(dpr) > 0 ? Number(dpr) : 1
  return pickWidthTier(Math.round(width * ratio))
}

/**
 * 按目标像素宽度产出**单一** URL（不产 srcset）。
 *
 * 只改写 `width` 参数，其余（table/block/id/t/cache）原样保留；
 * 非 Notion 反代地址（S3 直链、外链、本地图带 width 参数）→ 原样返回。
 *
 * @param {string} url 原始地址
 * @param {number} targetPx 目标像素宽度（会被量化到 WIDTH_TIERS）
 * @returns {string}
 */
export function buildSizedSource(url, targetPx) {
  if (typeof url !== 'string' || !url) return ''
  if (!isNotionProxyUrl(url)) return url
  if (!targetPx) return url
  return withWidth(url, pickWidthTier(targetPx))
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
 * @param {{ sizes?: string, widths?: number[] }} [options]
 *   widths 自定义候选档（至少两档，末档作为 src）；默认 [512, 1024] 保持既有行为
 * @returns {{ src: string, srcSet: string, sizes: string }}
 *  非反代地址时 srcSet 为空字符串，调用方应退化为纯 src
 */
export function buildImageSources(url, options = {}) {
  const sizes = options.sizes || DEFAULT_SIZES
  const widths =
    Array.isArray(options.widths) && options.widths.length >= 2
      ? options.widths
      : DEFAULT_WIDTHS

  if (typeof url !== 'string' || !url) {
    return { src: '', srcSet: '', sizes: '' }
  }

  if (!isNotionProxyUrl(url)) {
    return { src: url, srcSet: '', sizes: '' }
  }

  const candidates = widths.map(width => ({
    url: withWidth(url, width),
    width
  }))

  return {
    src: candidates[candidates.length - 1].url,
    srcSet: candidates.map(c => `${c.url} ${c.width}w`).join(', '),
    sizes
  }
}

export default buildImageSources
