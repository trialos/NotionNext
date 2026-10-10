import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CONFIG from '../config'
import { useAlbumUI } from './albumContext'
import AlbumGallery from './AlbumGallery'
import AlbumRail from './AlbumRail'
import AlbumShelf from './AlbumShelf'
import {
  buildAlbumHref,
  findDeckIndexById,
  parseAlbumQuery
} from './albumRoute'
import { buildAlbumDecks } from './albumUtils'

/**
 * 影集：默认书架 · 点开长画廊（可邻辑）· URL ?view=&deck=
 */
export default function AlbumStage({ pages }) {
  const router = useRouter()
  const albumUI = useAlbumUI()
  const decks = useMemo(() => buildAlbumDecks(pages), [pages])
  const scrollerRef = useRef(null)
  const [view, setView] = useState('shelf')
  const [activeIndex, setActiveIndex] = useState(0)
  const entryIndexRef = useRef(null)
  const spyLockedRef = useRef(false)
  const urlSyncLockRef = useRef(false)
  const deckQueryRef = useRef(router.query.deck)
  const replaceAlbumUrlRef = useRef(null)

  // 滚动根同时喂给本地 spy 与 Context（Header 收起监听）
  const registerScrollRoot = albumUI?.registerScrollRoot
  const snapRef = useCallback(
    el => {
      scrollerRef.current = el
      if (registerScrollRoot) registerScrollRoot(el)
    },
    [registerScrollRoot]
  )

  const scrollToDeck = useCallback((i, { smooth = true } = {}) => {
    const root = scrollerRef.current
    if (!root) return false
    const sections = root.querySelectorAll('.cl-album-section')
    const el = sections[i]
    if (!el) return false
    root.scrollTo({
      top: el.offsetTop,
      behavior: smooth ? 'smooth' : 'auto'
    })
    setActiveIndex(i)
    return true
  }, [])

  const replaceAlbumUrl = useCallback(
    ({ view: v, deckId }) => {
      if (!router?.replace) return
      urlSyncLockRef.current = true
      const href = buildAlbumHref({ view: v, deckId })
      router.replace(href, undefined, { shallow: true, scroll: false }).finally(
        () => {
          window.setTimeout(() => {
            urlSyncLockRef.current = false
          }, 50)
        }
      )
    },
    [router]
  )
  replaceAlbumUrlRef.current = replaceAlbumUrl
  deckQueryRef.current = router.query.deck

  const openGallery = useCallback(
    i => {
      const deck = decks[i]
      if (!deck) return
      entryIndexRef.current = i
      spyLockedRef.current = true
      setActiveIndex(i)
      setView('gallery')
      replaceAlbumUrl({ view: 'gallery', deckId: deck.id })
    },
    [decks, replaceAlbumUrl]
  )

  const backToShelf = useCallback(() => {
    setView('shelf')
    entryIndexRef.current = null
    spyLockedRef.current = false
    setActiveIndex(0)
    replaceAlbumUrl({ view: 'shelf' })
  }, [replaceAlbumUrl])

  // URL → 状态（权威）
  useEffect(() => {
    if (!router.isReady) return
    if (urlSyncLockRef.current) return
    const { view: qView, deck } = parseAlbumQuery(router.query)
    if (qView === 'gallery') {
      const i = findDeckIndexById(decks, deck)
      if (i < 0) {
        setView('shelf')
        setActiveIndex(0)
        if (deck || router.query.view === 'gallery') {
          replaceAlbumUrl({ view: 'shelf' })
        }
        return
      }
      if (view !== 'gallery' || activeIndex !== i) {
        entryIndexRef.current = i
        spyLockedRef.current = true
        setActiveIndex(i)
        setView('gallery')
      }
    } else if (view !== 'shelf') {
      setView('shelf')
      entryIndexRef.current = null
      spyLockedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.view, router.query.deck, decks, replaceAlbumUrl])

  // 画廊态：藏页脚 + 通知顶栏
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const root = document.documentElement
    if (view === 'gallery') root.classList.add('cl-album-gallery-active')
    else root.classList.remove('cl-album-gallery-active')
    return () => root.classList.remove('cl-album-gallery-active')
  }, [view])

  // 点导航「影集」回书架：经 Context 注册，替代 cl-album-go-shelf 事件
  useEffect(() => {
    if (!albumUI?.registerGoShelf) return undefined
    albumUI.registerGoShelf(backToShelf)
    return () => albumUI.registerGoShelf(null)
  }, [albumUI, backToShelf])

  // 进入画廊定位
  useEffect(() => {
    if (view !== 'gallery') return undefined
    const target =
      entryIndexRef.current != null ? entryIndexRef.current : activeIndex

    let cancelled = false
    const run = () => {
      if (cancelled) return
      const ok = scrollToDeck(target, { smooth: false })
      if (!ok) {
        window.requestAnimationFrame(run)
        return
      }
      window.setTimeout(() => {
        if (cancelled) return
        scrollToDeck(target, { smooth: false })
        entryIndexRef.current = null
        spyLockedRef.current = false
      }, 80)
    }
    const t = window.setTimeout(run, 16)
    const tLater = window.setTimeout(() => {
      if (!cancelled) scrollToDeck(target, { smooth: false })
    }, 320)
    return () => {
      cancelled = true
      window.clearTimeout(t)
      window.clearTimeout(tLater)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, scrollToDeck])

  // iOS Safari 会忽略滚动子项的 dvh/百分比高度，一屏就露出两辑，吸附也不触发。
  // 用可视高度把每一辑锁成和滚动口一样高，松手后再吸到最近一辑。
  useEffect(() => {
    if (view !== 'gallery') return undefined
    const root = scrollerRef.current
    if (!root) return undefined

    const sectionsOf = () => [...root.querySelectorAll('.cl-album-section')]

    const lockHeights = () => {
      const viewport = Math.round(
        window.visualViewport?.height || window.innerHeight || 0
      )
      if (!viewport) return 0
      let h = root.clientHeight
      if (h < viewport * 0.7 || h > viewport * 1.05) {
        root.style.height = viewport + 'px'
        root.style.maxHeight = viewport + 'px'
        root.style.flex = 'none'
        h = root.clientHeight || viewport
      }
      sectionsOf().forEach(section => {
        section.style.height = h + 'px'
        section.style.minHeight = h + 'px'
        section.style.maxHeight = h + 'px'
        section.style.flex = 'none'
      })
      return h
    }

    const nearest = () => {
      const sections = sectionsOf()
      let best = 0
      let bestDist = Infinity
      sections.forEach((section, i) => {
        const d = Math.abs(section.offsetTop - root.scrollTop)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      return { sections, best, bestDist }
    }

    let timer = 0
    let touching = 0
    const settle = () => {
      if (touching || spyLockedRef.current) return
      const { sections, best, bestDist } = nearest()
      const el = sections[best]
      if (!el || bestDist <= 2) return
      spyLockedRef.current = true
      root.scrollTo({ top: el.offsetTop, behavior: 'auto' })
      setActiveIndex(best)
      const id = el.getAttribute('data-deck-id')
      if (id && deckQueryRef.current !== id) {
        replaceAlbumUrlRef.current({ view: 'gallery', deckId: id })
      }
      window.setTimeout(() => {
        spyLockedRef.current = false
      }, 80)
    }
    const arm = ms => {
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, ms)
    }
    const onScroll = () => {
      if (!touching) arm(140)
    }
    const onTouchStart = () => {
      touching += 1
      window.clearTimeout(timer)
    }
    const onTouchEnd = () => {
      touching = Math.max(0, touching - 1)
      if (!touching) arm(180)
    }

    lockHeights()
    const ro = new ResizeObserver(() => {
      lockHeights()
    })
    ro.observe(root)
    window.visualViewport?.addEventListener('resize', lockHeights)
    root.addEventListener('scroll', onScroll, { passive: true })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchend', onTouchEnd, { passive: true })
    root.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.clearTimeout(timer)
      ro.disconnect()
      window.visualViewport?.removeEventListener('resize', lockHeights)
      root.removeEventListener('scroll', onScroll)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchend', onTouchEnd)
      root.removeEventListener('touchcancel', onTouchEnd)
      root.style.height = ''
      root.style.maxHeight = ''
      root.style.flex = ''
      sectionsOf().forEach(section => {
        section.style.height = ''
        section.style.minHeight = ''
        section.style.maxHeight = ''
        section.style.flex = ''
      })
    }
  }, [view, decks.length])

  // scroll spy + URL deck 同步
  useEffect(() => {
    if (view !== 'gallery') return undefined
    const root = scrollerRef.current
    if (!root || !decks.length) return undefined
    const onScroll = () => {
      if (spyLockedRef.current) return
      const sections = [...root.querySelectorAll('.cl-album-section')]
      if (!sections.length) return
      const mid = root.scrollTop + root.clientHeight * 0.35
      let best = 0
      let bestDist = Infinity
      sections.forEach((s, i) => {
        const c = s.offsetTop + s.offsetHeight * 0.25
        const d = Math.abs(c - mid)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      setActiveIndex(prev => {
        if (prev === best) return prev
        const id = decks[best]?.id
        if (id && router.query.deck !== String(id)) {
          replaceAlbumUrl({ view: 'gallery', deckId: id })
        }
        return best
      })
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [decks, view, replaceAlbumUrl, router.query.deck])

  useEffect(() => {
    if (view !== 'gallery') return undefined
    if (decks.length <= 1) return undefined
    const onKey = e => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
      if (document.querySelector('.cl-ag-lb')) return
      e.preventDefault()
      const next =
        e.key === 'ArrowDown'
          ? Math.min(decks.length - 1, activeIndex + 1)
          : Math.max(0, activeIndex - 1)
      const id = decks[next]?.id
      entryIndexRef.current = next
      spyLockedRef.current = true
      setActiveIndex(next)
      scrollToDeck(next, { smooth: true })
      if (id) replaceAlbumUrl({ view: 'gallery', deckId: id })
      window.setTimeout(() => {
        spyLockedRef.current = false
      }, 400)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decks, activeIndex, scrollToDeck, view, replaceAlbumUrl])

  const emptyHint = siteConfig(
    'CIRCLELIFE_ALBUM_EMPTY_HINT',
    '在 Notion 新增 type 为 Photo 的页面，正文插入图片并 Published。每个页面即一辑。',
    CONFIG
  )

  if (!decks.length) {
    return (
      <div className='cl-album-empty'>
        <p className='cl-kicker mb-3'>影集</p>
        <h1 className='cl-article-title !mb-3'>还没有影像</h1>
        <p className='cl-post-summary mx-auto max-w-md'>{emptyHint}</p>
        <ul className='cl-album-howto'>
          <li>
            type 选 <strong>Photo</strong>，status 为 <strong>Published</strong>
          </li>
          <li>
            <strong>页面标题</strong> = 影集名（一页一辑）
          </li>
          <li>正文插入多张图（左右循环翻）</li>
          <li>summary = 描述；图题勿与标题重复</li>
        </ul>
      </div>
    )
  }

  if (view === 'shelf') {
    return (
      <div className='cl-album-shell is-shelf'>
        <AlbumShelf decks={decks} onOpen={openGallery} />
      </div>
    )
  }

  return (
    <div className='cl-album-shell is-gallery'>
      <AlbumRail
        decks={decks}
        activeIndex={activeIndex}
        onSelect={i => {
          const id = decks[i]?.id
          entryIndexRef.current = i
          spyLockedRef.current = true
          setActiveIndex(i)
          scrollToDeck(i, { smooth: true })
          if (id) replaceAlbumUrl({ view: 'gallery', deckId: id })
          window.setTimeout(() => {
            spyLockedRef.current = false
          }, 400)
        }}
      />
      <div className='cl-album-snap' ref={snapRef}>
        {decks.map((deck, i) => (
          <section
            key={deck.id || deck.name}
            className='cl-album-section'
            data-album={deck.name}
            data-deck-id={deck.id}
            data-index={i}
            aria-label={`影集 ${deck.name}`}>
            <AlbumGallery
              albumName={deck.name}
              photos={deck.photos}
              onBackToShelf={backToShelf}
            />
          </section>
        ))}
      </div>
    </div>
  )
}
