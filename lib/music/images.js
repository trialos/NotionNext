import { firstString } from './paths'

/**
 * 网易云封面档位。
 *
 * 站内 Notion 图走 buildSizedSource + srcset 档位；网易云是外部 CDN，
 * 它自己支持 ?param=<w>y<h> 服务端缩放，所以这里**不套 Notion 反代、不产 srcset**
 * （反代后档位被量化成 512/1024，且外链走 srcset 会被按 CSS 宽出图）。
 * 取值按「显示宽 × 2」向上取一档，Retina 直出清晰、体积仍远小于原图。
 */
export const COVER_TIERS = [160, 320, 480, 640, 800, 1024]

export function pickCoverTier(px) {
  const target = Number(px)
  if (!Number.isFinite(target) || target <= 0) return COVER_TIERS[0]
  for (const tier of COVER_TIERS) if (target <= tier) return tier
  return COVER_TIERS[COVER_TIERS.length - 1]
}

export function neteaseCover(url, cssWidth, dpr = 2) {
  const raw = String(url || '').trim()
  if (!/^https?:\/\//i.test(raw)) return ''
  const base = raw.replace(/^http:/i, 'https:')
  const [withoutParam, ...rest] = base.split('?')
  const query = rest
    .join('?')
    .split('&')
    .filter(part => part && !/^param=/i.test(part))
  const px = pickCoverTier(Math.round(cssWidth * (Number(dpr) > 0 ? dpr : 2)))
  query.push(`param=${px}y${px}`)
  return `${withoutParam}?${query.join('&')}`
}

/** 封面来源优先级：人给的自定义封面 → 同步写入的网易云原图 → Notion 页面封面 */
export function coverSourceOf(page) {
  const override = firstString(page?.musicCoverOverride)
  if (override) return { url: override, source: 'override' }
  const ncm = firstString(page?.musicCoverUrl)
  if (ncm) return { url: ncm, source: 'ncm' }
  const notion = firstString(page?.pageCoverThumbnail) || firstString(page?.pageCover)
  if (notion) return { url: notion, source: 'notion' }
  return { url: '', source: '' }
}

/** Notion 反代地址不能再拼 ?param，只有网易云 CDN 支持 */
export function coverSrc(page, cssWidth, dpr) {
  const { url, source } = coverSourceOf(page)
  if (!url) return ''
  if (source === 'notion') return url
  return neteaseCover(url, cssWidth, dpr)
}

export function trackCoverSrc(track, cssWidth, dpr) {
  const url = typeof track === 'string' ? track : track?.cover
  return neteaseCover(url, cssWidth, dpr)
}

/**
 * 显示宽（CSS px）：与 styles/music.js 的封面框几何对齐。
 * card 取桌面五列墙的单格宽；手机端会略微超采样，但网易云 param 出图本就很小，
 * 不做客户端按实测宽重算 —— 那会让整墙封面在挂载后集体换源重载。
 */
export const COVER_SIZES = {
  card: 320,
  hero: 420,
  track: 44,
  noteContext: 72
}
