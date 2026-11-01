'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import {
  REEL_MOBILE_QUERY,
  pickReelSrc,
  shouldAutoplayReel
} from './aboutReel'

function useAboutReel({ reel, videoRef, onStateChange }) {
  const [status, setStatus] = useState('idle')
  const statusRef = useRef('idle')
  const activeRef = useRef(true)
  const userStartedRef = useRef(false)
  const loadedRef = useRef(false)
  const idleRef = useRef(null)
  const onStateChangeRef = useRef(onStateChange)

  useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  const report = useCallback(next => {
    if (statusRef.current === next) return
    statusRef.current = next
    setStatus(next)
    onStateChangeRef.current?.(next)
  }, [])

  const cancelIdle = useCallback(() => {
    const pending = idleRef.current
    if (!pending) return
    idleRef.current = null
    if (
      pending.type === 'idle' &&
      typeof window !== 'undefined' &&
      window.cancelIdleCallback
    ) {
      window.cancelIdleCallback(pending.id)
    } else {
      clearTimeout(pending.id)
    }
  }, [])

  const policyReason = useCallback(() => {
    if (!reel?.enabled) return 'error'
    if (typeof window === 'undefined') return 'idle'
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const connection = navigator.connection || {}
    const allowed = shouldAutoplayReel({
      hasSource: !!(reel.desktop || reel.mobile),
      reducedMotion,
      saveData: !!connection.saveData,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink
    })
    if (allowed) return ''
    if (reducedMotion) return 'reduced'
    if (connection.saveData) return 'save-data'
    return 'slow'
  }, [reel])

  const load = useCallback(() => {
    const video = videoRef.current
    if (!video || !reel?.enabled) return false
    if (!loadedRef.current) {
      const isMobile = window.matchMedia(REEL_MOBILE_QUERY).matches
      const src = pickReelSrc(reel, isMobile)
      if (!src) return false
      loadedRef.current = true
      video.src = src
      video.muted = true
      video.load()
    }
    return true
  }, [reel, videoRef])

  const play = useCallback(
    ({ restart = false, user = false } = {}) => {
      const video = videoRef.current
      if (!video || !reel?.enabled) return
      if (user) userStartedRef.current = true
      cancelIdle()
      if (!load()) return
      video.muted = true
      if (restart) {
        try {
          video.currentTime = 0
        } catch (_) {}
      }
      report('loading')
      const attempt = video.play()
      if (attempt && typeof attempt.then === 'function') {
        attempt.catch(error => {
          report(error?.name === 'NotAllowedError' ? 'blocked' : 'error')
        })
      }
    },
    [cancelIdle, load, reel?.enabled, report, videoRef]
  )

  const schedule = useCallback(() => {
    cancelIdle()
    const reason = policyReason()
    if (reason) {
      report(reason)
      return
    }
    const run = () => {
      idleRef.current = null
      if (!activeRef.current) return
      const nextReason = policyReason()
      if (nextReason) {
        report(nextReason)
        return
      }
      play()
    }
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      idleRef.current = {
        type: 'idle',
        id: window.requestIdleCallback(run, { timeout: 1200 })
      }
    } else {
      idleRef.current = { type: 'timeout', id: setTimeout(run, 400) }
    }
  }, [cancelIdle, play, policyReason, report])

  const setActive = useCallback(
    next => {
      activeRef.current = next
      const video = videoRef.current
      if (!next) {
        cancelIdle()
        if (video) video.pause()
        report('idle')
        return
      }
      if (userStartedRef.current) play({ restart: true })
      else schedule()
    },
    [cancelIdle, play, report, schedule, videoRef]
  )

  const playFromUser = useCallback(() => {
    activeRef.current = true
    play({ restart: true, user: true })
  }, [play])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlaying = () => report('playing')
    const onPause = () => {
      if (statusRef.current === 'playing') report('idle')
    }
    const onError = () => report('error')
    const onVisibility = () => {
      if (document.hidden) {
        cancelIdle()
        video.pause()
        report('idle')
        return
      }
      if (!activeRef.current) return
      if (userStartedRef.current) play()
      else schedule()
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => {
      if (motion.matches && !userStartedRef.current) {
        cancelIdle()
        video.pause()
        report('reduced')
      }
    }

    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    if (motion.addEventListener) motion.addEventListener('change', onMotion)
    else motion.addListener(onMotion)

    activeRef.current = true
    schedule()

    return () => {
      cancelIdle()
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onError)
      document.removeEventListener('visibilitychange', onVisibility)
      if (motion.removeEventListener) {
        motion.removeEventListener('change', onMotion)
      } else {
        motion.removeListener(onMotion)
      }
    }
  }, [cancelIdle, play, report, schedule, videoRef])

  return { status, setActive, play: playFromUser }
}

const AboutReelMedia = forwardRef(function AboutReelMedia(
  { reel, onStateChange },
  ref
) {
  const videoRef = useRef(null)
  const [active, setActiveState] = useState(true)
  const { status, setActive, play } = useAboutReel({
    reel,
    videoRef,
    onStateChange
  })

  const handleSetActive = useCallback(
    next => {
      setActiveState(next)
      setActive(next)
    },
    [setActive]
  )

  useImperativeHandle(
    ref,
    () => ({ setActive: handleSetActive, play }),
    [handleSetActive, play]
  )

  const showMobilePoster = !!(
    reel?.posterMobile && reel.posterMobile !== reel.poster
  )

  return (
    <div
      className={`cl-about-hero-media${active ? '' : ' is-closed'}`}
      aria-hidden='true'>
      {reel?.poster && (
        <picture className='cl-about-hero-poster-wrap'>
          {showMobilePoster && (
            <source
              media={REEL_MOBILE_QUERY}
              srcSet={reel.posterMobile}
            />
          )}
          <img
            className='cl-about-hero-poster'
            src={reel.poster}
            alt=''
            fetchpriority='high'
            decoding='async'
            draggable={false}
          />
        </picture>
      )}
      <video
        ref={videoRef}
        className={`cl-about-hero-video${
          status === 'playing' ? ' is-playing' : ''
        }`}
        muted
        playsInline
        loop
        preload='none'
        aria-hidden='true'
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  )
})

export default AboutReelMedia
export { useAboutReel }
