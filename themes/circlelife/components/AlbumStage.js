import { siteConfig } from '@/lib/config'
import { useEffect, useMemo, useRef } from 'react'
import CONFIG from '../config'
import AlbumGallery from './AlbumGallery'
import { buildAlbumDecks } from './albumUtils'

/**
 * 影集：纵向一辑一屏 snap · 横向循环翻卡
 */
export default function AlbumStage({ pages }) {
  const decks = useMemo(() => buildAlbumDecks(pages), [pages])
  const scrollerRef = useRef(null)

  // keyboard album nav when focus in scroller
  useEffect(() => {
    const root = scrollerRef.current
    if (!root || decks.length <= 1) return undefined

    const onKey = e => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
      const sections = [...root.querySelectorAll('.cl-album-section')]
      if (!sections.length) return
      const top = root.scrollTop
      let idx = 0
      let best = Infinity
      sections.forEach((s, i) => {
        const d = Math.abs(s.offsetTop - top)
        if (d < best) {
          best = d
          idx = i
        }
      })
      e.preventDefault()
      const next =
        e.key === 'ArrowDown'
          ? Math.min(sections.length - 1, idx + 1)
          : Math.max(0, idx - 1)
      root.scrollTo({ top: sections[next].offsetTop, behavior: 'smooth' })
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decks.length])

  const emptyHint = siteConfig(
    'CIRCLELIFE_ALBUM_EMPTY_HINT',
    '在 Notion 新增 type 为 Photo 的条目，正文插入图片并 Published。',
    CONFIG
  )

  if (!decks.length) {
    return (
      <div className='cl-album-empty'>
        <p className='cl-kicker mb-3'>影集 · FILM</p>
        <h1 className='cl-article-title !mb-3'>还没有影像</h1>
        <p className='cl-post-summary mx-auto max-w-md'>{emptyHint}</p>
        <ul className='cl-album-howto'>
          <li>type 选 <strong>Photo</strong>，status 为 <strong>Published</strong></li>
          <li>正文插入多张图（左右循环翻）</li>
          <li>「专辑」字段分辑（上下滚动吸附换辑）</li>
          <li>summary = 描述；title = 组名（不与图题重复）</li>
        </ul>
      </div>
    )
  }

  return (
    <div className='cl-album-snap' ref={scrollerRef}>
      {decks.map((deck, i) => (
        <section
          key={deck.name}
          className='cl-album-section'
          data-album={deck.name}
          aria-label={`专辑 ${deck.name}`}>
          <AlbumGallery albumName={deck.name} photos={deck.photos} />
          {i < decks.length - 1 ? (
            <p className='cl-album-snap-hint'>继续下滑 · 下一辑</p>
          ) : (
            <p className='cl-album-snap-hint'>左右拖动翻图 · 循环</p>
          )}
        </section>
      ))}
    </div>
  )
}
