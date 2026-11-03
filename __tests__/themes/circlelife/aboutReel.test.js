import {
  REEL_MOBILE_QUERY,
  isReelFallbackState,
  pickReelSrc,
  reelFallbackReason,
  resolveAboutReel,
  sanitizeExternalUrl,
  sanitizeMediaUrl,
  shouldAutoplayReel
} from '@/themes/circlelife/components/aboutReel'

const DESKTOP = 'https://media.withcol.com/about/reel-desktop-v3.mp4'
const MOBILE = 'https://media.withcol.com/about/reel-mobile-v3.mp4'
const POSTER = 'https://media.withcol.com/about/reel-poster-desktop-v3.webp'
const POSTER_MOBILE = 'https://media.withcol.com/about/reel-poster-mobile-v3.webp'
const BILIBILI = 'https://www.bilibili.com/video/BV1hT4F6QEy8/'

describe('aboutReel URL resolution', () => {
  test('accepts https and site-relative media URLs', () => {
    expect(sanitizeMediaUrl(DESKTOP)).toBe(DESKTOP)
    expect(sanitizeMediaUrl('  /images/about/reel.webp  ')).toBe(
      '/images/about/reel.webp'
    )
  })

  test('rejects unsafe or unsupported media URLs', () => {
    expect(sanitizeMediaUrl('http://media.withcol.com/reel.mp4')).toBe('')
    expect(sanitizeMediaUrl('//media.withcol.com/reel.mp4')).toBe('')
    expect(sanitizeMediaUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeMediaUrl('data:video/mp4;base64,abc')).toBe('')
    expect(sanitizeMediaUrl('https://media.withcol.com/a b.mp4')).toBe('')
    expect(sanitizeMediaUrl('<https://media.withcol.com/a.mp4>')).toBe('')
    expect(sanitizeMediaUrl(null)).toBe('')
  })

  test('resolves the reel and falls back mobile/poster to desktop', () => {
    const reel = resolveAboutReel({ desktop: DESKTOP, poster: POSTER })
    expect(reel.enabled).toBe(true)
    expect(reel.desktop).toBe(DESKTOP)
    expect(reel.mobile).toBe(DESKTOP)
    expect(reel.poster).toBe(POSTER)
    expect(reel.posterMobile).toBe(POSTER)
  })

  test('keeps a distinct mobile master and poster', () => {
    const reel = resolveAboutReel({
      desktop: DESKTOP,
      mobile: MOBILE,
      poster: POSTER,
      posterMobile: POSTER_MOBILE
    })
    expect(reel).toMatchObject({
      enabled: true,
      desktop: DESKTOP,
      mobile: MOBILE,
      poster: POSTER,
      posterMobile: POSTER_MOBILE
    })
  })

  test('is disabled when no usable video URL exists', () => {
    expect(resolveAboutReel({}).enabled).toBe(false)
    expect(
      resolveAboutReel({ desktop: 'http://insecure.test/reel.mp4' }).enabled
    ).toBe(false)
    expect(
      resolveAboutReel({ poster: POSTER, posterMobile: POSTER_MOBILE }).enabled
    ).toBe(false)
  })

  test('accepts only https for the full-video link', () => {
    expect(sanitizeExternalUrl(BILIBILI)).toBe(BILIBILI)
    expect(sanitizeExternalUrl('http://www.bilibili.com/video/BV1')).toBe('')
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeExternalUrl('/about')).toBe('')
    expect(sanitizeExternalUrl('')).toBe('')
  })

  test('carries the Bilibili link without changing reel enablement', () => {
    const reel = resolveAboutReel({ desktop: DESKTOP, bilibili: BILIBILI })
    expect(reel.enabled).toBe(true)
    expect(reel.bilibili).toBe(BILIBILI)
    expect(resolveAboutReel({ bilibili: BILIBILI }).enabled).toBe(false)
    expect(resolveAboutReel({ desktop: DESKTOP }).bilibili).toBe('')
  })

  test('picks the source for the viewport', () => {
    const reel = { enabled: true, desktop: DESKTOP, mobile: MOBILE }
    expect(pickReelSrc(reel, true)).toBe(MOBILE)
    expect(pickReelSrc(reel, false)).toBe(DESKTOP)
    expect(pickReelSrc({ enabled: false }, true)).toBe('')
  })

  test('uses the approved mobile breakpoint', () => {
    expect(REEL_MOBILE_QUERY).toBe('(max-width: 767px)')
  })
})

describe('aboutReel autoplay policy', () => {
  test('allows a normal connection with a source', () => {
    expect(shouldAutoplayReel({ hasSource: true })).toBe(true)
    expect(
      shouldAutoplayReel({ hasSource: true, effectiveType: '4g', downlink: 10 })
    ).toBe(true)
  })

  test('blocks autoplay without source, reduced motion or Save-Data', () => {
    expect(shouldAutoplayReel({ hasSource: false })).toBe(false)
    expect(shouldAutoplayReel({ hasSource: true, reducedMotion: true })).toBe(
      false
    )
    expect(shouldAutoplayReel({ hasSource: true, saveData: true })).toBe(false)
  })

  test('gates slow estimates only on cellular connections', () => {
    expect(
      shouldAutoplayReel({
        hasSource: true,
        effectiveType: '3g',
        connectionType: 'cellular'
      })
    ).toBe(false)
    expect(
      shouldAutoplayReel({
        hasSource: true,
        effectiveType: '2g',
        connectionType: 'cellular'
      })
    ).toBe(false)
    expect(
      shouldAutoplayReel({
        hasSource: true,
        effectiveType: 'slow-2g',
        connectionType: 'cellular'
      })
    ).toBe(false)
    expect(
      shouldAutoplayReel({
        hasSource: true,
        effectiveType: '4g',
        connectionType: 'cellular'
      })
    ).toBe(true)
    // 桌面 Wi-Fi/以太网/未知连接会被 Chrome 误报 3g，不能因此拦自动播放
    for (const connectionType of ['wifi', 'ethernet', 'unknown', '']) {
      expect(
        shouldAutoplayReel({
          hasSource: true,
          effectiveType: '3g',
          connectionType
        })
      ).toBe(true)
    }
    // Chrome 的 downlink 估计值波动很大（实测 4g 也会报 0.45），
    // 不作为自动播放门禁；慢网只认蜂窝 effectiveType 与 Save-Data。
    expect(shouldAutoplayReel({ hasSource: true, downlink: 1 })).toBe(true)
  })
})

describe('aboutReel fallback reasons', () => {
  test('maps every play-button state to a visible reason', () => {
    expect(reelFallbackReason('reduced')).toBe('浏览器已要求减少动态效果')
    expect(reelFallbackReason('save-data')).toBe('已开启省流模式')
    expect(reelFallbackReason('slow')).toBe('移动网络较慢')
    expect(reelFallbackReason('blocked')).toBe('浏览器阻止了自动播放')
    expect(reelFallbackReason('paused')).toBe('播放已暂停')
    for (const state of ['reduced', 'save-data', 'slow', 'blocked', 'paused']) {
      expect(isReelFallbackState(state)).toBe(true)
    }
  })

  test('stays quiet while the reel is idle, loading or playing', () => {
    for (const state of ['idle', 'loading', 'playing', 'error', '', null, undefined]) {
      expect(isReelFallbackState(state)).toBe(false)
      expect(reelFallbackReason(state)).toBe('')
    }
  })
})
