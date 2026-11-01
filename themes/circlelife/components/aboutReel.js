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
  effectiveType = '',
  connectionType = ''
} = {}) {
  if (!hasSource || reducedMotion || saveData) return false
  // effectiveType 是 Chrome 的网络质量估计（会漂移/误报 3g），只对蜂窝网络生效；
  // Wi-Fi、以太网、未知连接一律不按它拦自动播放。
  const isCellular = String(connectionType).toLowerCase() === 'cellular'
  if (isCellular && ['slow-2g', '2g', '3g'].includes(effectiveType)) {
    return false
  }
  return true
}

const REEL_FALLBACK_REASONS = {
  reduced: '浏览器已要求减少动态效果',
  'save-data': '已开启省流模式',
  slow: '移动网络较慢',
  blocked: '浏览器阻止了自动播放',
  paused: '播放已暂停'
}

export function isReelFallbackState(state) {
  return Object.prototype.hasOwnProperty.call(REEL_FALLBACK_REASONS, state)
}

export function reelFallbackReason(state) {
  return isReelFallbackState(state) ? REEL_FALLBACK_REASONS[state] : ''
}
