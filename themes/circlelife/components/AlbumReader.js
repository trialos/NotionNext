'use client'

import SmartLink from '@/components/SmartLink'
import PageMast from './PageMast'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAlbumUI } from './albumContext'
import {
  buildReaderAlbums,
  findReaderAlbumIndex,
  parseReaderQuery,
  readerQuery
} from './albumReaderData'
import { linkTitle } from './navConfig'

const pad = n => String(n).padStart(2, '0')

// 与 styles/albumReader.js 的 transition-duration 对齐；改一处必须同步另一处
const DUR = {
  cover: 900,
  hold: 650,
  reveal: 900,
  chapterEnter: 900,
  indexIn: 820,
  indexOut: 700,
  thumbsIn: 620,
  thumbsReveal: 640
}

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function ChapterInner({ album, albumIndex, total, withEnter, onEnter }) {
  if (!album) return null
  return (
    <div className='chapter-inner'>
      <span className='chapter-rule' aria-hidden='true' />
      <p className='chapter-kicker'>
        ALBUM · {pad(albumIndex + 1)} / {pad(total)}
      </p>
      <h2 className='chapter-title'>{album.title}</h2>
      {album.intro ? <p className='chapter-intro'>{album.intro}</p> : null}
      <p className='chapter-meta'>
        {album.month ? `${album.month} · ` : ''}
        {album.count} 张
      </p>
      {withEnter ? (
        <button type='button' className='chapter-enter' onClick={onEnter}>
          点击进入影集 →
        </button>
      ) : null}
    </div>
  )
}

/**
 * 影集阅读器：章页 / 单张 / 目录抽屉 / 当前辑缩略 / 跨辑纸面裁切
 * 一页一辑；URL 只记 deck（首页 view=gallery 直接第一张）。
 */
export default function AlbumReader({ pages = [], navLinks = [] }) {
  const router = useRouter()
  const albumUI = useAlbumUI()
  const albums = useMemo(() => buildReaderAlbums(pages), [pages])
  const [ready, setReady] = useState(false)
  const [albumIndex, setAlbumIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [chapter, setChapter] = useState(true)
  const [chapterCovering, setChapterCovering] = useState(false)
  const [chapterRevealing, setChapterRevealing] = useState(false)
  const [transition, setTransition] = useState(null)
  const [sliding, setSliding] = useState(false)
  const [footDim, setFootDim] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [naturalRatio, setNaturalRatio] = useState(0)
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 })
  const [indexOpen, setIndexOpen] = useState(false)
  const [indexRising, setIndexRising] = useState(false)
  const [indexClosing, setIndexClosing] = useState(false)
  const [indexPhoto, setIndexPhoto] = useState(false)
  const [thumbsOpen, setThumbsOpen] = useState(false)
  const [thumbsRising, setThumbsRising] = useState(false)
  const [thumbsEntering, setThumbsEntering] = useState(false)
  const [thumbsRevealed, setThumbsRevealed] = useState(false)
  const [toast, setToast] = useState('')

  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const thumbsOverlayRef = useRef(null)
  const mountedRef = useRef(true)
  const bootedRef = useRef(false)
  const slideIdRef = useRef(0)
  const chapterTimerRef = useRef(null)
  const indexTimerRef = useRef(null)
  const thumbsTimerRef = useRef(null)
  const toastTimerRef = useRef(null)
  const slideTimersRef = useRef([])

  const activeAlbum = albums[albumIndex] || albums[0] || null
  const activePhoto = activeAlbum?.photos?.[photoIndex] || null
  const showThumbsChrome = thumbsOpen || thumbsRising
  const activeRatio =
    Number(activePhoto?.ratio) > 0
      ? Number(activePhoto.ratio)
      : naturalRatio > 0
        ? naturalRatio
        : 0.75

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    document.documentElement.classList.add('cl-album-reader-active')
    return () => {
      document.documentElement.classList.remove('cl-album-reader-active')
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(chapterTimerRef.current)
      clearTimeout(indexTimerRef.current)
      clearTimeout(thumbsTimerRef.current)
      clearTimeout(toastTimerRef.current)
      slideTimersRef.current.forEach(id => clearTimeout(id))
      slideTimersRef.current = []
    }
  }, [])

  const clearSlideTimers = useCallback(() => {
    slideTimersRef.current.forEach(id => clearTimeout(id))
    slideTimersRef.current = []
  }, [])

  const scheduleSlide = useCallback((fn, ms) => {
    const id = setTimeout(() => fn(), ms)
    slideTimersRef.current.push(id)
    return id
  }, [])

  const showToast = useCallback(text => {
    setToast(text)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const syncUrl = useCallback(
    (deckId, gallery) => {
      if (!router?.replace) return
      router
        .replace(
          { query: readerQuery(deckId, { gallery }) },
          undefined,
          { shallow: true, scroll: false }
        )
        .catch(() => {})
    },
    [router]
  )

  // 首屏：先等 router ready，再按 deck/view 决定章页还是第一张，避免闪现错误的辑
  useEffect(() => {
    if (!router.isReady || bootedRef.current) return
    bootedRef.current = true
    const { deck, gallery } = parseReaderQuery(router.query)
    const target = findReaderAlbumIndex(albums, deck)
    if (target >= 0) {
      setAlbumIndex(target)
      setPhotoIndex(0)
      if (gallery) {
        // 首页「进入影集」的 view=gallery 只用于这一次直接落到第一张；
        // URL 随后只保留 deck，刷新按约定回到该辑章页。
        setChapter(false)
        setChapterCovering(false)
        setFootDim(false)
        syncUrl(albums[target].id, false)
      } else {
        setChapter(true)
        setChapterCovering(false)
        setFootDim(true)
      }
    } else {
      setAlbumIndex(0)
      setPhotoIndex(0)
      setChapter(true)
      setChapterCovering(false)
      setFootDim(true)
    }
    setReady(true)
  }, [router.isReady, router.query, albums, syncUrl])

  // 章页在场时，从底部盖上（首屏或从阅读页回到章页）
  useEffect(() => {
    if (!ready || !chapter || chapterRevealing || chapterCovering) return undefined
    const id = requestAnimationFrame(() => setChapterCovering(true))
    return () => cancelAnimationFrame(id)
  }, [ready, chapter, chapterRevealing, chapterCovering, albumIndex])

  const computeFrame = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const maxW = Math.max(120, stage.clientWidth - 32)
    const maxH = Math.max(120, stage.clientHeight - 16)
    let w = maxW
    let h = w / activeRatio
    if (h > maxH) {
      h = maxH
      w = h * activeRatio
    }
    setFrameSize({ w: Math.round(w), h: Math.round(h) })
  }, [activeRatio])

  useEffect(() => {
    computeFrame()
  }, [computeFrame, albumIndex, photoIndex, ready])

  // 同一张照片（例：点当前缩略图、同辑章页进出）不会触发新的 load 事件；
  // 若此时 loaded 被重置，必须从已缓存的 img.complete 补回来，否则画面会空一帧以上。
  useEffect(() => {
    if (loaded) return
    const img = imageRef.current
    if (img && img.complete && img.naturalWidth) {
      setLoaded(true)
      setNaturalRatio(img.naturalWidth / img.naturalHeight)
    }
  }, [loaded, albumIndex, photoIndex, activePhoto?.src])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => computeFrame())
    observer.observe(stage)
    return () => observer.disconnect()
  }, [computeFrame])

  const preload = useCallback(photo => {
    if (!photo?.src || typeof window === 'undefined') return
    const img = new window.Image()
    img.decoding = 'async'
    img.src = photo.src
  }, [])

  // 预载同辑前后张 + 相邻辑的首/尾
  useEffect(() => {
    if (!activeAlbum || !ready) return
    const last = activeAlbum.photos.length - 1
    if (photoIndex < last) preload(activeAlbum.photos[photoIndex + 1])
    if (photoIndex > 0) preload(activeAlbum.photos[photoIndex - 1])
    const nextAlbum = albums[albumIndex + 1]
    const prevAlbum = albums[albumIndex - 1]
    if (nextAlbum?.photos?.length) preload(nextAlbum.photos[0])
    if (prevAlbum?.photos?.length) {
      preload(prevAlbum.photos[prevAlbum.photos.length - 1])
    }
  }, [activeAlbum, albumIndex, photoIndex, albums, preload, ready])

  const openIndex = useCallback(() => {
    if (!ready || transition || chapterRevealing || thumbsOpen) return
    if (indexOpen) return
    clearTimeout(indexTimerRef.current)
    setIndexRising(false)
    setIndexClosing(false)
    setIndexOpen(true)
    setIndexPhoto(true)
    requestAnimationFrame(() => setIndexRising(true))
  }, [chapterRevealing, indexOpen, ready, thumbsOpen, transition])

  const closeIndex = useCallback(() => {
    if (!indexOpen || indexClosing) return
    clearTimeout(indexTimerRef.current)
    setIndexRising(false)
    setIndexClosing(true)
    setIndexPhoto(false)
    const wait = reducedMotion() ? 30 : DUR.indexOut
    indexTimerRef.current = setTimeout(() => {
      setIndexOpen(false)
      setIndexClosing(false)
    }, wait)
  }, [indexClosing, indexOpen])

  useEffect(() => {
    if (!albumUI?.registerAlbumIndex) return undefined
    albumUI.registerAlbumIndex(openIndex)
    return () => albumUI.registerAlbumIndex(null)
  }, [albumUI, openIndex])

  const showChapter = useCallback(
    (targetIndex, { writeUrl = true } = {}) => {
      const target = albums[targetIndex]
      if (!target) return
      const wasChapter = chapter
      setAlbumIndex(targetIndex)
      setPhotoIndex(0)
      setChapter(true)
      setChapterRevealing(false)
      setFootDim(true)
      setLoaded(false)
      setNaturalRatio(0)
      if (writeUrl) syncUrl(target.id, false)
      if (wasChapter) {
        setChapterCovering(true)
      } else {
        setChapterCovering(false)
        requestAnimationFrame(() => setChapterCovering(true))
      }
    },
    [albums, chapter, syncUrl]
  )

  const enterChapter = useCallback(() => {
    if (!chapter || chapterRevealing || transition) return
    setChapterRevealing(true)
    setChapterCovering(false)
    setSliding(true)
    setFootDim(false)
    clearTimeout(chapterTimerRef.current)
    const wait = reducedMotion() ? 30 : DUR.chapterEnter
    chapterTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      setChapter(false)
      setChapterRevealing(false)
      setSliding(false)
    }, wait)
  }, [chapter, chapterRevealing, transition])

  const dismissChapter = useCallback(() => {
    clearTimeout(chapterTimerRef.current)
    setChapter(false)
    setChapterCovering(false)
    setChapterRevealing(false)
    setFootDim(false)
    setSliding(false)
  }, [])

  const transitionTo = useCallback(
    (targetIndex, direction) => {
      const target = albums[targetIndex]
      if (!target || !target.photos.length || transition || sliding) return
      const incomingIndex =
        direction === 'next' ? 0 : target.photos.length - 1
      const incoming = target.photos[incomingIndex]
      if (!incoming) return
      const id = ++slideIdRef.current
      clearSlideTimers()
      setSliding(true)
      setFootDim(true)
      setTransition({ albumIndex: targetIndex, covering: false, revealing: false })
      preload(incoming)
      requestAnimationFrame(() => {
        if (id !== slideIdRef.current) return
        setTransition(t => (t ? { ...t, covering: true } : t))
      })
      const fast = reducedMotion()
      const p1 = fast ? 30 : DUR.cover
      const hold = fast ? 260 : DUR.hold
      const p2 = fast ? 30 : DUR.reveal
      scheduleSlide(() => {
        if (id !== slideIdRef.current) return
        setAlbumIndex(targetIndex)
        setPhotoIndex(incomingIndex)
        setLoaded(false)
        setNaturalRatio(0)
        syncUrl(target.id, false)
        scheduleSlide(() => {
          if (id !== slideIdRef.current) return
          setTransition(t => (t ? { ...t, revealing: true } : t))
          scheduleSlide(() => {
            if (id !== slideIdRef.current) return
            setTransition(null)
            setSliding(false)
            setFootDim(false)
          }, p2)
        }, hold)
      }, p1)
    },
    [albums, clearSlideTimers, preload, scheduleSlide, sliding, syncUrl, transition]
  )

  const goNext = useCallback(() => {
    if (!ready) return
    if (chapter) {
      enterChapter()
      return
    }
    if (transition || sliding) return
    if (!activeAlbum) return
    if (photoIndex < activeAlbum.photos.length - 1) {
      setPhotoIndex(photoIndex + 1)
      setLoaded(false)
      setNaturalRatio(0)
      return
    }
    if (albumIndex < albums.length - 1) {
      transitionTo(albumIndex + 1, 'next')
      return
    }
    showToast('已是最后一辑')
  }, [
    activeAlbum,
    albumIndex,
    albums.length,
    chapter,
    enterChapter,
    photoIndex,
    ready,
    showToast,
    sliding,
    transition,
    transitionTo
  ])

  const goPrev = useCallback(() => {
    if (!ready) return
    if (chapter) {
      enterChapter()
      return
    }
    if (transition || sliding) return
    if (!activeAlbum) return
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1)
      setLoaded(false)
      setNaturalRatio(0)
      return
    }
    if (albumIndex > 0) {
      transitionTo(albumIndex - 1, 'prev')
      return
    }
    showToast('已是第一辑的第一张')
  }, [
    activeAlbum,
    albumIndex,
    chapter,
    enterChapter,
    photoIndex,
    ready,
    showToast,
    sliding,
    transition,
    transitionTo
  ])

  const openThumbs = useCallback(() => {
    if (!ready || transition || chapterRevealing || indexOpen) return
    if (thumbsOpen) return
    clearTimeout(thumbsTimerRef.current)
    setThumbsEntering(true)
    setThumbsRevealed(false)
    setThumbsRising(false)
    setThumbsOpen(true)
    requestAnimationFrame(() => setThumbsRising(true))
    const wait = reducedMotion() ? 30 : DUR.thumbsReveal
    thumbsTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setThumbsRevealed(true)
    }, wait)
  }, [chapterRevealing, indexOpen, ready, thumbsOpen, transition])

  const closeThumbs = useCallback(() => {
    clearTimeout(thumbsTimerRef.current)
    setThumbsOpen(false)
    setThumbsRising(false)
    setThumbsEntering(false)
    setThumbsRevealed(false)
  }, [])

  const toggleThumbs = useCallback(() => {
    if (thumbsOpen) closeThumbs()
    else openThumbs()
  }, [closeThumbs, openThumbs, thumbsOpen])

  const choosePhoto = useCallback(
    index => {
      const album = activeAlbum
      if (!album?.photos?.[index]) return
      dismissChapter()
      setPhotoIndex(index)
      setLoaded(false)
      setNaturalRatio(0)
      closeThumbs()
    },
    [activeAlbum, closeThumbs, dismissChapter]
  )

  const chooseAlbum = useCallback(
    index => {
      const target = albums[index]
      if (!target) return
      closeIndex()
      closeThumbs()
      if (index === albumIndex && chapter) return
      showChapter(index)
    },
    [albumIndex, albums, chapter, closeIndex, closeThumbs, showChapter]
  )

  const handleThumbsClick = useCallback(
    event => {
      if (!event.target.closest('.thumb')) closeThumbs()
    },
    [closeThumbs]
  )

  useEffect(() => {
    if (!thumbsOpen || !thumbsOverlayRef.current) return
    const overlay = thumbsOverlayRef.current
    const current = overlay.querySelector('.thumb.is-current')
    const id = requestAnimationFrame(() => {
      overlay.querySelectorAll('.thumb img').forEach(img => {
        if (img.complete && img.naturalWidth) {
          img.parentElement?.classList.add('is-loaded')
        }
      })
      if (!current) return
      const viewH = overlay.clientHeight
      overlay.scrollTop = Math.max(
        0,
        current.offsetTop - (viewH - current.offsetHeight) / 2
      )
    })
    return () => cancelAnimationFrame(id)
  }, [thumbsOpen, photoIndex, albumIndex])

  useEffect(() => {
    const onKeyDown = event => {
      if (
        typeof document !== 'undefined' &&
        document.querySelector('.cl-fullscreen-root.is-open, .cl-search-overlay')
      ) {
        return
      }
      if (event.key === 'Escape') {
        if (indexOpen) closeIndex()
        else if (thumbsOpen) closeThumbs()
        return
      }
      if (indexOpen || thumbsOpen || !ready) return
      if (event.key === 'ArrowRight') goNext()
      else if (event.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    closeIndex,
    closeThumbs,
    goNext,
    goPrev,
    indexOpen,
    ready,
    thumbsOpen
  ])

  const groups = useMemo(() => {
    const map = new Map()
    albums.forEach((album, index) => {
      const year = album.year || '—'
      if (!map.has(year)) map.set(year, [])
      map.get(year).push({ album, index })
    })
    return [...map.entries()]
  }, [albums])

  const readerClass = [
    'reader',
    indexOpen ? 'is-index' : '',
    indexPhoto ? 'is-index-photo' : '',
    thumbsOpen ? 'is-thumbs' : ''
  ]
    .filter(Boolean)
    .join(' ')

  if (!albums.length) {
    return (
      <div className='cl-album-reader-page'>
        <div className='cl-album-reader'>
          <div className='reader'>
            <header className='reader-top'>
              <div className='reader-center'>
                <span className='nav-album'>影集</span>
              </div>
            </header>
            <div className='reader-stage'>
              <div className='reader-empty'>
                <p className='cl-kicker'>影集</p>
                <h1>还没有影像</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='cl-album-reader-page'>
      <div className='cl-album-reader'>
        <div className={readerClass}>
          <header className='reader-top'>
            <span className='reader-count' aria-live='polite'>
              {activePhoto
                ? `${pad(photoIndex + 1)} / ${pad(activeAlbum?.count || 0)}`
                : ''}
            </span>
          </header>

          <div className='reader-stage' ref={stageRef}>
            {ready && activePhoto ? (
              <div
                className={`photo-frame ${loaded ? 'is-loaded' : ''}`}
                style={{ width: frameSize.w, height: frameSize.h }}>
                <img
                  ref={imageRef}
                  key={`${albumIndex}-${photoIndex}`}
                  src={activePhoto.src}
                  alt={`${activeAlbum?.title || '影集'} · ${
                    photoIndex + 1
                  }`}
                  decoding='async'
                  loading='eager'
                  onLoad={event => {
                    const img = event.currentTarget
                    if (img.naturalWidth && img.naturalHeight) {
                      setNaturalRatio(img.naturalWidth / img.naturalHeight)
                    }
                    setLoaded(true)
                  }}
                  onError={event => {
                    const img = event.currentTarget
                    if (
                      activePhoto.fullSrc &&
                      img.src !== activePhoto.fullSrc
                    ) {
                      img.src = activePhoto.fullSrc
                    }
                  }}
                />
              </div>
            ) : null}

            {chapter ? (
              <div
                className={`chapter-panel ${
                  chapterCovering ? 'is-covering' : ''
                } ${chapterRevealing ? 'is-revealing' : ''}`}>
                <ChapterInner
                  album={activeAlbum}
                  albumIndex={albumIndex}
                  total={albums.length}
                  withEnter
                  onEnter={enterChapter}
                />
              </div>
            ) : null}

            {transition ? (
              <div
                className={`chapter-panel ${
                  transition.covering ? 'is-covering' : ''
                } ${transition.revealing ? 'is-revealing' : ''}`}
                aria-hidden='true'>
                <ChapterInner
                  album={albums[transition.albumIndex]}
                  albumIndex={transition.albumIndex}
                  total={albums.length}
                />
              </div>
            ) : null}
          </div>

          <button
            type='button'
            className='tap-zone tap-prev'
            aria-label={chapter ? '进入影集' : '上一张'}
            onClick={goPrev}
          />
          <button
            type='button'
            className='tap-zone tap-next'
            aria-label={chapter ? '进入影集' : '下一张'}
            onClick={goNext}
          />

          <footer className={`reader-foot ${footDim ? 'is-dim' : ''}`}>
            <p className='foot-caption' hidden={!activePhoto?.caption}>
              {activePhoto?.caption || ''}
            </p>
          </footer>

          <nav
            className={`reader-nav ${showThumbsChrome ? 'is-thumbs' : ''}`}
            aria-label='影集导航'>
            <div className='reader-center'>
              {!showThumbsChrome ? (
                <button
                  type='button'
                  data-action='index'
                  aria-label='打开影集目录'
                  onClick={openIndex}
                  disabled={!ready}>
                  目录
                </button>
              ) : (
                <span className='nav-album'>{activeAlbum?.title || ''}</span>
              )}
              <span
                className={`nav-sep ${showThumbsChrome ? 'is-bar' : ''}`}
                aria-hidden='true'
              />
              <button
                type='button'
                aria-label={thumbsOpen ? '关闭缩略' : '打开当前辑缩略'}
                aria-expanded={thumbsOpen}
                onClick={toggleThumbs}
                disabled={!ready}>
                {thumbsOpen ? '关闭' : '缩略'}
              </button>
            </div>
          </nav>

          <div
            className={`toast ${toast ? 'is-on' : ''}`}
            role='status'
            aria-live='polite'>
            {toast}
          </div>

          <div
            id='indexScrim'
            className={`index-scrim ${indexOpen && !indexClosing ? 'is-open' : ''}`}
            aria-hidden='true'
            onClick={closeIndex}
          />

          <section
            id='indexOverlay'
            className={`overlay index-drawer ${
              indexOpen ? 'is-open' : ''
            } ${indexRising ? 'is-rising' : ''} ${
              indexClosing ? 'is-closing' : ''
            }`}
            aria-label='影集目录'
            aria-hidden={!indexOpen}
            role='dialog'
            aria-modal='true'>
            <div className='overlay-head index-mast-head'>
              {/* 沿用旧影集页刊头文案，保持站点历史一致 */}
              <PageMast
                eyebrow='ALBUM · 影集'
                title='影的轨迹'
                description='影于我是空间的书签'
                className='cl-page-mast--section cl-page-mast--album index-drawer-mast'
              />
              <button
                type='button'
                className='overlay-close'
                aria-label='关闭目录'
                onClick={closeIndex}>
                ×
              </button>
            </div>

            <div className='index-list'>
              {groups.map(([year, rows]) => (
                <div key={year} className='index-group'>
                  <div className='index-year'>{year}</div>
                  {rows.map(({ album, index }) => (
                    <button
                      key={album.id}
                      type='button'
                      className={`index-row ${
                        index === albumIndex ? 'is-current' : ''
                      }`}
                      onClick={() => chooseAlbum(index)}>
                      <span className='index-no'>{pad(index + 1)}</span>
                      <span className='index-main'>
                        <span className='index-title'>{album.title}</span>
                        {album.summary ? (
                          <span className='index-tagline'>{album.summary}</span>
                        ) : null}
                      </span>
                      <span className='index-meta'>
                        {album.month ? `${album.month} · ` : ''}
                        {album.count} 张
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className='index-foot'>
              {navLinks.map(link => (
                <SmartLink
                  key={link.href || linkTitle(link)}
                  href={link.href || '/'}
                  target={link.target}
                  onClick={closeIndex}>
                  {linkTitle(link)}
                </SmartLink>
              ))}
            </div>
          </section>

          <section
            id='thumbsOverlay'
            ref={thumbsOverlayRef}
            className={`overlay thumbs-overlay ${
              thumbsOpen ? 'is-open' : ''
            } ${thumbsRising ? 'is-rising' : ''}`}
            aria-label='当前辑缩略图'
            aria-hidden={!thumbsOpen}
            onClick={handleThumbsClick}>
            {thumbsOpen && activeAlbum ? (
              <div
                className={`thumbs-grid ${
                  thumbsEntering ? 'is-entering' : ''
                } ${thumbsRevealed ? 'is-revealed' : ''}`}>
                {activeAlbum.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type='button'
                    className={`thumb ${
                      index === photoIndex ? 'is-current' : ''
                    }`}
                    style={{ '--stagger': `${index * 24}ms` }}
                    aria-label={`${activeAlbum.title} 第 ${index + 1} 张`}
                    onClick={() => choosePhoto(index)}>
                    <img
                      src={photo.thumbSrc}
                      alt=''
                      loading={index === photoIndex ? 'eager' : 'lazy'}
                      decoding='async'
                      onLoad={event =>
                        event.currentTarget.parentElement?.classList.add(
                          'is-loaded'
                        )
                      }
                      onError={event => {
                        const img = event.currentTarget
                        if (photo.fullSrc && img.src !== photo.fullSrc) {
                          img.src = photo.fullSrc
                        }
                      }}
                      style={
                        photo.ratio > 0
                          ? { aspectRatio: String(photo.ratio) }
                          : undefined
                      }
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
