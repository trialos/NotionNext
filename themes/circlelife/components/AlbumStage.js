import { siteConfig } from '@/lib/config'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CONFIG from '../config'
import AlbumGallery from './AlbumGallery'
import AlbumRail from './AlbumRail'
import AlbumShelf from './AlbumShelf'
import { buildAlbumDecks } from './albumUtils'

/**
 * 影集：默认书架 · 点开长画廊（可邻辑）· 墨线轴
 */
export default function AlbumStage({ pages }) {
  const decks = useMemo(() => buildAlbumDecks(pages), [pages])
  const scrollerRef = useRef(null)
  const [view, setView] = useState('shelf') // shelf | gallery
  const [activeIndex, setActiveIndex] = useState(0)
  /** 进入画廊要落到的辑；与 activeIndex 解耦，避免 spy 抢跑 */
  const entryIndexRef = useRef(null)
  const spyLockedRef = useRef(false)

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

  const openGallery = useCallback(i => {
    entryIndexRef.current = i
    spyLockedRef.current = true
    setActiveIndex(i)
    setView('gallery')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cl-album-view', { detail: { view: 'gallery' } })
      )
    }
  }, [])

  const backToShelf = useCallback(() => {
    setView('shelf')
    entryIndexRef.current = null
    spyLockedRef.current = false
    setActiveIndex(0)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cl-album-view', { detail: { view: 'shelf' } })
      )
    }
  }, [])

  // 画廊态：藏页脚 + 通知顶栏绑定 snap
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const root = document.documentElement
    if (view === 'gallery') {
      root.classList.add('cl-album-gallery-active')
    } else {
      root.classList.remove('cl-album-gallery-active')
    }
    return () => root.classList.remove('cl-album-gallery-active')
  }, [view])

  // 导航「影集」同页回书架
  useEffect(() => {
    const onGoShelf = () => backToShelf()
    window.addEventListener('cl-album-go-shelf', onGoShelf)
    return () => window.removeEventListener('cl-album-go-shelf', onGoShelf)
  }, [backToShelf])

  // 进入画廊：只跑一次定位，不依赖 activeIndex
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
      // 布局稳定后再解 spy 锁
      window.setTimeout(() => {
        if (cancelled) return
        scrollToDeck(target, { smooth: false })
        entryIndexRef.current = null
        spyLockedRef.current = false
      }, 80)
    }
    const t = window.setTimeout(run, 16)
    // 通知 Header 绑定内滚
    const notify = () => {
      const el = scrollerRef.current
      if (!el) return
      el.setAttribute('data-cl-scrollroot', '1')
      window.dispatchEvent(
        new CustomEvent('cl-album-scrollroot', { detail: { el } })
      )
    }
    window.setTimeout(notify, 20)
    window.setTimeout(notify, 100)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, scrollToDeck])

  // scroll spy（首屏定位锁定期不写 active）
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
      setActiveIndex(best)
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [decks.length, view])

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
      scrollToDeck(next, { smooth: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decks.length, activeIndex, scrollToDeck, view])

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
        onSelect={i => scrollToDeck(i, { smooth: true })}
      />
      <div className='cl-album-snap' ref={scrollerRef}>
        {decks.map((deck, i) => (
          <section
            key={deck.id || deck.name}
            className='cl-album-section'
            data-album={deck.name}
            data-index={i}
            aria-label={`影集 ${deck.name}`}>
            <AlbumGallery
              albumName={deck.name}
              photos={deck.photos}
              onBackToShelf={backToShelf}
            />
            {i < decks.length - 1 ? (
              <p className='cl-album-snap-hint'>继续下滑 · 下一辑</p>
            ) : (
              <p className='cl-album-snap-hint'>左右拖动翻图 · 循环</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
