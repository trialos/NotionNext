import { siteConfig } from '@/lib/config'
import { useEffect, useMemo, useRef } from 'react'
import CONFIG from '../config'
import AlbumGallery from './AlbumGallery'
import { buildAlbumDecks } from './albumUtils'

/**
 * 影集：纵向一页一屏 snap · 横向循环翻卡
 */
export default function AlbumStage({ pages }) {
  const decks = useMemo(() => buildAlbumDecks(pages), [pages])
  const scrollerRef = useRef(null)

  useEffect(() => {
    const root = scrollerRef.current
    if (!root || decks.length <= 1) return undefined

    const onKey = e => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
      // 灯箱打开时不抢垂直键
      if (document.querySelector('.cl-ag-lb')) return
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

  return (
    <div className='cl-album-snap' ref={scrollerRef}>
      {decks.map((deck, i) => (
        <section
          key={deck.id || deck.name}
          className='cl-album-section'
          data-album={deck.name}
          aria-label={`影集 ${deck.name}`}>
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
