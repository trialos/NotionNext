import {
  REEL_MOBILE_QUERY,
  pickReelSrc,
  resolveAboutReel,
  sanitizeMediaUrl,
  shouldAutoplayReel
} from '@/themes/circlelife/components/aboutReel'

const DESKTOP = 'https://media.withcol.com/about/reel-desktop-v3.mp4'
const MOBILE = 'https://media.withcol.com/about/reel-mobile-v3.mp4'
const POSTER = 'https://media.withcol.com/about/reel-poster-desktop-v3.webp'
const POSTER_MOBILE = 'https://media.withcol.com/about/reel-poster-mobile-v3.webp'

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

  test('blocks slow connections', () => {
    expect(
      shouldAutoplayReel({ hasSource: true, effectiveType: 'slow-2g' })
    ).toBe(false)
    expect(shouldAutoplayReel({ hasSource: true, effectiveType: '2g' })).toBe(
      false
    )
    expect(shouldAutoplayReel({ hasSource: true, effectiveType: '3g' })).toBe(
      false
    )
    // Chrome 的 downlink 估计值波动很大（实测 4g 也会报 0.45），
    // 不作为自动播放门禁；慢网只认 effectiveType 与 Save-Data。
    expect(shouldAutoplayReel({ hasSource: true, downlink: 1 })).toBe(true)
  })
})
