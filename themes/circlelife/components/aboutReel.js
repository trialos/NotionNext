export const REEL_MOBILE_QUERY = '(max-width: 767px)'

const INVALID_URL_CHARS = /[\s<>]/

export function sanitizeMediaUrl(value) {
  const url = typeof value === 'string' ? value.trim() : ''
  if (!url || INVALID_URL_CHARS.test(url)) return ''
  if (url.startsWith('/') && !url.startsWith('//')) return url
  if (url.startsWith('https://')) return url
  return ''
}

export function resolveAboutReel({
  desktop,
  mobile,
  poster,
  posterMobile
} = {}) {
  const safeDesktop = sanitizeMediaUrl(desktop)
  const safeMobile = sanitizeMediaUrl(mobile) || safeDesktop
  const safePoster = sanitizeMediaUrl(poster)
  const safePosterMobile = sanitizeMediaUrl(posterMobile) || safePoster
  return {
    enabled: !!(safeDesktop || safeMobile),
    desktop: safeDesktop || safeMobile,
    mobile: safeMobile || safeDesktop,
    poster: safePoster,
    posterMobile: safePosterMobile
  }
}

export function pickReelSrc(reel, isMobile) {
  if (!reel?.enabled) return ''
  return isMobile ? reel.mobile || reel.desktop : reel.desktop || reel.mobile
}

export function shouldAutoplayReel({
  hasSource = false,
  reducedMotion = false,
  saveData = false,
  effectiveType = ''
} = {}) {
  if (!hasSource || reducedMotion || saveData) return false
  if (['slow-2g', '2g', '3g'].includes(effectiveType)) return false
  return true
}
