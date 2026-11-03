import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const inlineSource = readFile(
  'themes',
  'circlelife',
  'components',
  'InfiniteAboutGrid.js'
)
const layoutSource = readFile(
  'themes',
  'circlelife',
  'components',
  'LayoutAbout.js'
)
const pageSource = readFile('pages', 'about', 'index.js')
const mediaSource = readFile(
  'themes',
  'circlelife',
  'components',
  'AboutReelMedia.js'
)
const reelSource = readFile(
  'themes',
  'circlelife',
  'components',
  'aboutReel.js'
)
const styleSource = readFile('themes', 'circlelife', 'styles', 'about.js')

describe('About reel data wiring', () => {
  test('resolves the R2 URLs and the optional full-video link', () => {
    expect(pageSource).toContain('resolveAboutReel')
    for (const key of [
      'ABOUT_REEL_DESKTOP',
      'ABOUT_REEL_MOBILE',
      'ABOUT_REEL_POSTER',
      'ABOUT_REEL_POSTER_MOBILE'
    ]) {
      expect(pageSource).toContain(key)
    }
    expect(pageSource).toContain('ABOUT_REEL_BILIBILI')
  })

  test('preloads the matching poster and keeps the wall-card fallback', () => {
    expect(pageSource).toContain('hasMobilePoster')
    expect(pageSource).toContain('reel.poster')
    expect(pageSource).toContain('reel.posterMobile')
    expect(pageSource).toContain("media='(min-width: 768px)'")
    expect(pageSource).toContain("media='(max-width: 767px)'")
    expect(pageSource).toContain('!hasReel && firstCard?.src')
  })

  test('forwards the reel to the About layout and wall', () => {
    expect(layoutSource).toContain('reel={props.aboutReel}')
    expect(inlineSource).toContain("<AboutReelMedia")
    expect(inlineSource).toContain('reel={reel}')
    expect(inlineSource).toContain('onStateChange={handleReelState}')
  })
})

describe('About reel wall integration', () => {
  test('pauses and resumes the reel with the prologue curtain', () => {
    expect(inlineSource).toContain('reelRef.current?.setActive(false)')
    expect(inlineSource).toContain('reelRef.current?.setActive(true)')
  })

  test('hands fetchpriority to the poster, not the wall first card', () => {
    expect(inlineSource).toContain('if (!reel?.enabled) {')
    expect(inlineSource).toContain(
      "img.setAttribute('fetchpriority', 'high')"
    )
    expect(inlineSource).toContain('if (isHeroOpen && reel?.enabled) return')
  })

  test('defers wall image loading until the reel prologue closes', () => {
    expect(inlineSource).toContain('if (isHeroOpen && reel?.enabled) return')
    expect(inlineSource).toContain('const primeWallMedia = () => {')
    expect(inlineSource).toContain('if (reel?.enabled) primeWallMedia()')
  })

  test('keeps the hint after the lead and offers the play fallback', () => {
    const h1At = inlineSource.indexOf(
      "<h1 className='cl-about-hero-summary'>"
    )
    const leadAt = inlineSource.indexOf(
      "{heroLead && <p className='cl-about-hero-lead'>{heroLead}</p>}"
    )
    const hintAt = inlineSource.indexOf('cl-about-hero-hint-text')
    expect(h1At).toBeGreaterThan(-1)
    expect(leadAt).toBeGreaterThan(h1At)
    expect(hintAt).toBeGreaterThan(leadAt)
    expect(inlineSource).toContain('播放快闪')
  })

  test('renders an optional Bilibili full-video button', () => {
    expect(pageSource).toContain('ABOUT_REEL_BILIBILI')
    expect(inlineSource).toContain('reel?.bilibili')
    expect(inlineSource).toContain('cl-about-hero-action--bilibili')
    expect(inlineSource).toContain('cl-about-hero-action-links')
    expect(inlineSource).toContain("target='_blank'")
    expect(inlineSource).toContain("rel='noopener noreferrer'")
    expect(inlineSource).toContain('在 B 站观看完整版（新窗口）')
    expect(styleSource).toContain('.cl-about-hero-action--bilibili')
    expect(styleSource).toContain(
      '#theme-circlelife a.cl-about-hero-action--bilibili'
    )
  })

  test('shows the fallback reason next to the play button', () => {
    expect(inlineSource).toContain('reelFallbackReason')
    expect(inlineSource).toContain('cl-about-hero-action-group')
    expect(inlineSource).toContain('cl-about-hero-action-reason')
    expect(inlineSource).toContain(
      "aria-describedby='cl-about-reel-reason'"
    )
    expect(inlineSource).toContain("role='status'")
    expect(styleSource).toContain('.cl-about-hero-action-reason')
  })

  test('re-syncs the prologue DOM when the wall effect rebuilds', () => {
    expect(inlineSource).toContain(
      'const syncHeroOpen = ({ activateReel = false } = {}) =>'
    )
    expect(
      (inlineSource.match(/syncHeroOpen\(/g) || []).length
    ).toBeGreaterThanOrEqual(2)
    expect(inlineSource).toContain('if (isHeroOpen && !overlayClosed) return')
    expect(styleSource).toContain(
      '.cl-about-hero-overlay:not(.is-closed) ~ .cl-about-prologue-btn'
    )
    expect(styleSource).toContain('visibility: hidden;')
    expect(styleSource).toContain('visibility: visible;')
  })

  test('reserves bottom clearance for the iOS Safari toolbar', () => {
    expect(styleSource).toContain(
      'calc(56px + env(safe-area-inset-bottom, 0px))'
    )
    expect(styleSource).toContain(
      '#theme-circlelife.cl-is-about .cl-about-hero-overlay--reel'
    )
  })

  test('uses dedicated reel modifiers and stops action taps from dragging the wall', () => {
    expect(inlineSource).toContain('cl-about-hero-actions')
    expect(inlineSource).toContain('cl-about-hero-overlay--reel')
    expect(inlineSource).toContain('cl-about-hero-backdrop--reel')
    expect(inlineSource).toContain(
      'e.target.closest(\'.cl-about-prologue-btn, .cl-about-hero-actions\')'
    )
    expect(inlineSource).not.toContain('WebkitBackdropFilter')
  })
})

describe('AboutReelMedia runtime contract', () => {
  test('declares an inert, muted, looping video without a poster attribute', () => {
    expect(mediaSource).toContain("preload='none'")
    expect(mediaSource).toContain('muted')
    expect(mediaSource).toContain('playsInline')
    expect(mediaSource).toContain('loop')
    expect(mediaSource).toContain('disablePictureInPicture')
    expect(mediaSource).toContain('aria-hidden=\'true\'')
    expect(mediaSource).toContain('tabIndex={-1}')
    expect(mediaSource).not.toMatch(/<video[\s\S]{0,600}?poster=/)
  })

  test('keeps the poster as the LCP image and selects the viewport source', () => {
    expect(mediaSource).toContain('fetchpriority=\'high\'')
    expect(mediaSource).toContain('showMobilePoster')
    expect(mediaSource).toContain('REEL_MOBILE_QUERY')
    expect(mediaSource).toContain('pickReelSrc')
    expect(mediaSource).toContain('video.src = src')
  })

  test('defers autoplay, caps policy, and pauses on close/visibility', () => {
    expect(mediaSource).toContain('requestIdleCallback')
    expect(mediaSource).toContain('prefers-reduced-motion')
    expect(mediaSource).toContain('saveData')
    expect(mediaSource).toContain('effectiveType')
    expect(mediaSource).toContain('connectionType')
    expect(mediaSource).toContain('visibilitychange')
    expect(mediaSource).toContain('NotAllowedError')
    expect(mediaSource).toContain("'blocked'")
    expect(mediaSource).toContain('setActive')
    expect(mediaSource).toContain('is-closed')
    expect(mediaSource).toContain("report('idle')")
    expect(reelSource).toContain('shouldAutoplayReel')
    expect(reelSource).toContain("url.startsWith('https://')")
    expect(reelSource).toContain("url.startsWith('/')")
  })
})

describe('About reel CSS contract', () => {
  test('appends the A layout without shadowing the base hero rules', () => {
    const baseOverlayAt = styleSource.indexOf('.cl-about-hero-overlay {')
    const reelOverlayAt = styleSource.indexOf('.cl-about-hero-overlay--reel')
    expect(baseOverlayAt).toBeGreaterThan(-1)
    expect(reelOverlayAt).toBeGreaterThan(baseOverlayAt)

    const baseLeadAt = styleSource.indexOf(
      '#theme-circlelife.cl-is-about .cl-about-hero-lead'
    )
    const reelLeadAt = styleSource.indexOf(
      '#theme-circlelife.cl-is-about\n    .cl-about-hero-overlay--reel'
    )
    expect(baseLeadAt).toBeGreaterThan(-1)
    expect(reelLeadAt).toBeGreaterThan(baseLeadAt)
    expect(styleSource).toContain('color: var(--cl-text)')
  })

  test('ships the full-bleed media, scrim, title and action styles', () => {
    expect(styleSource).toContain('.cl-about-hero-media {')
    expect(styleSource).toContain('.cl-about-hero-media.is-closed')
    expect(styleSource).toContain('.cl-about-hero-video.is-playing')
    expect(styleSource).toContain(
      '.cl-about-hero-backdrop.cl-about-hero-backdrop--reel'
    )
    expect(styleSource).toContain('backdrop-filter: none')
    expect(styleSource).toContain('.cl-about-hero-overlay--reel')
    expect(styleSource).toContain('.cl-about-hero-actions')
    expect(styleSource).toContain('.cl-about-hero-action')
    expect(styleSource).toContain('object-position: center 42%')
    expect(styleSource).toContain('font-size: clamp(3.4rem, 19vw, 5.2rem)')
    expect(styleSource).toContain('font-size: clamp(5rem, 8vw, 8rem)')
    expect(styleSource).toContain("text-wrap: balance")
  })
})
