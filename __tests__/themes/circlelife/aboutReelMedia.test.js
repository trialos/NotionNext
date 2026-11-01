import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import AboutReelMedia from '@/themes/circlelife/components/AboutReelMedia'
import { REEL_MOBILE_QUERY } from '@/themes/circlelife/components/aboutReel'

const REEL = {
  enabled: true,
  desktop: 'https://media.withcol.com/about/reel-desktop-v3.mp4',
  mobile: 'https://media.withcol.com/about/reel-mobile-v3.mp4',
  poster: 'https://media.withcol.com/about/reel-poster-desktop-v3.webp',
  posterMobile: 'https://media.withcol.com/about/reel-poster-mobile-v3.webp'
}

const originalMatchMedia = window.matchMedia
const originalRequestIdleCallback = window.requestIdleCallback
const originalCancelIdleCallback = window.cancelIdleCallback
const originalPlay = HTMLMediaElement.prototype.play
const originalPause = HTMLMediaElement.prototype.pause
const originalLoad = HTMLMediaElement.prototype.load
const originalConnection = Object.getOwnPropertyDescriptor(
  navigator,
  'connection'
)

let mediaState
let playMock
let pauseMock
let loadMock
let idleMock

function renderReel(onStateChange = jest.fn()) {
  const ref = React.createRef()
  const view = render(
    <AboutReelMedia ref={ref} reel={REEL} onStateChange={onStateChange} />
  )
  return { ...view, ref, onStateChange }
}

beforeEach(() => {
  mediaState = { reduced: false, mobile: false }
  window.matchMedia = jest.fn(query => ({
    matches: query.includes('prefers-reduced-motion')
      ? mediaState.reduced
      : query === REEL_MOBILE_QUERY
        ? mediaState.mobile
        : false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: { saveData: false, effectiveType: '4g', downlink: 10 }
  })
  playMock = jest.fn().mockResolvedValue(undefined)
  pauseMock = jest.fn()
  loadMock = jest.fn()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: playMock
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: pauseMock
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    writable: true,
    value: loadMock
  })
  idleMock = jest.fn(callback => {
    callback({ didTimeout: false })
    return 1
  })
  Object.defineProperty(window, 'requestIdleCallback', {
    configurable: true,
    writable: true,
    value: idleMock
  })
  Object.defineProperty(window, 'cancelIdleCallback', {
    configurable: true,
    writable: true,
    value: jest.fn()
  })
})

afterEach(() => {
  cleanup()
  if (Object.prototype.hasOwnProperty.call(document, 'hidden')) {
    delete document.hidden
  }
})

afterAll(() => {
  if (originalMatchMedia) window.matchMedia = originalMatchMedia
  if (originalRequestIdleCallback) {
    window.requestIdleCallback = originalRequestIdleCallback
  } else {
    delete window.requestIdleCallback
  }
  if (originalCancelIdleCallback) {
    window.cancelIdleCallback = originalCancelIdleCallback
  } else {
    delete window.cancelIdleCallback
  }
  HTMLMediaElement.prototype.play = originalPlay
  HTMLMediaElement.prototype.pause = originalPause
  HTMLMediaElement.prototype.load = originalLoad
  if (originalConnection) {
    Object.defineProperty(navigator, 'connection', originalConnection)
  } else {
    delete navigator.connection
  }
})

describe('AboutReelMedia', () => {
  test('renders the poster pair and delays the desktop source until idle', async () => {
    const { container, onStateChange } = renderReel()
    const video = container.querySelector('video')
    const img = container.querySelector('img')
    const source = container.querySelector('source')

    expect(img.getAttribute('src')).toContain('reel-poster-desktop-v3.webp')
    expect(source.getAttribute('srcset')).toContain(
      'reel-poster-mobile-v3.webp'
    )
    expect(video.getAttribute('preload')).toBe('none')
    expect(video.getAttribute('aria-hidden')).toBe('true')
    expect(video.hasAttribute('controls')).toBe(false)

    await waitFor(() => expect(playMock).toHaveBeenCalled())
    expect(idleMock).toHaveBeenCalled()
    expect(video.getAttribute('src')).toContain('reel-desktop-v3.mp4')
    expect(video.muted).toBe(true)
    expect(onStateChange).toHaveBeenCalledWith('loading')

    act(() => {
      video.dispatchEvent(new Event('playing'))
    })
    expect(video.classList.contains('is-playing')).toBe(true)
    expect(onStateChange).toHaveBeenCalledWith('playing')
  })

  test('uses the mobile master on the mobile breakpoint', async () => {
    mediaState.mobile = true
    const { container } = renderReel()
    const video = container.querySelector('video')

    await waitFor(() => expect(playMock).toHaveBeenCalled())
    expect(video.getAttribute('src')).toContain('reel-mobile-v3.mp4')
  })

  test('does not autoplay under reduced motion', async () => {
    mediaState.reduced = true
    const { container, onStateChange } = renderReel()
    const video = container.querySelector('video')

    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith('reduced'))
    expect(playMock).not.toHaveBeenCalled()
    expect(video.getAttribute('src')).toBeNull()
  })

  test('does not autoplay under Save-Data', async () => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g', downlink: 10 }
    })
    const { onStateChange } = renderReel()

    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith('save-data'))
    expect(playMock).not.toHaveBeenCalled()
  })

  test('does not autoplay on a slow connection', async () => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '3g', downlink: 0.8 }
    })
    const { onStateChange } = renderReel()

    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith('slow'))
    expect(playMock).not.toHaveBeenCalled()
  })

  test('allows an explicit user play after the autoplay decision', async () => {
    mediaState.reduced = true
    const { container, ref } = renderReel()
    const video = container.querySelector('video')

    act(() => {
      ref.current.play()
    })
    await waitFor(() => expect(playMock).toHaveBeenCalled())
    expect(video.getAttribute('src')).toContain('reel-desktop-v3.mp4')
  })

  test('reports a blocked autoplay rejection', async () => {
    mediaState.reduced = true
    playMock.mockRejectedValueOnce(
      Object.assign(new Error('blocked'), { name: 'NotAllowedError' })
    )
    const { ref, onStateChange } = renderReel()

    act(() => {
      ref.current.play()
    })
    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith('blocked'))
  })

  test('pauses and closes the media when the hero closes', async () => {
    const { container, ref, onStateChange } = renderReel()
    const media = container.querySelector('.cl-about-hero-media')

    await waitFor(() => expect(playMock).toHaveBeenCalled())
    act(() => {
      ref.current.setActive(false)
    })

    expect(pauseMock).toHaveBeenCalled()
    expect(media.classList.contains('is-closed')).toBe(true)
    expect(onStateChange).toHaveBeenCalledWith('idle')
  })

  test('pauses when the tab becomes hidden', async () => {
    const { onStateChange } = renderReel()

    await waitFor(() => expect(playMock).toHaveBeenCalled())
    act(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(pauseMock).toHaveBeenCalled()
    expect(onStateChange).toHaveBeenCalledWith('idle')
  })
})
