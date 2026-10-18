import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CONFIG from '../config'
import { useAlbumUI } from './albumContext'
import AlbumDeckNav from './AlbumDeckNav'
import AlbumInfiniteWall from './AlbumInfiniteWall'
import AlbumLightbox from './AlbumLightbox'
import AlbumShelfStack from './AlbumShelfStack'
import {
  buildAlbumHref,
  findDeckIndexById,
  parseAlbumQuery
} from './albumRoute'
import { buildAlbumDecks } from './albumUtils'

/**
 * 影集舞台 (AlbumStage)
 * 两态极简架构：
 * 1. 书架态 (Shelf)：全部影集封面总览与统计
 * 2. 画廊态 (Gallery)：顶栏横向快切轨道 + 专辑专属无限瀑布流 + 全屏灯箱
 */
export default function AlbumStage({ pages }) {
  const router = useRouter()
  const albumUI = useAlbumUI()
  const decks = useMemo(() => buildAlbumDecks(pages), [pages])

  const [view, setView] = useState('shelf')
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(null)
  const [isGalleryScrolled, setIsGalleryScrolled] = useState(false)

  const urlSyncLockRef = useRef(false)

  const replaceAlbumUrl = useCallback(
    ({ view: v, deckId }) => {
      if (!router?.replace) return
      urlSyncLockRef.current = true
      const href = buildAlbumHref({ view: v, deckId })
      router
        .replace(href, undefined, { shallow: true, scroll: false })
        .finally(() => {
          window.setTimeout(() => {
            urlSyncLockRef.current = false
          }, 60)
        })
    },
    [router]
  )

  // 打开某个影集进入画廊态
  const openGallery = useCallback(
    i => {
      const deck = decks[i]
      if (!deck) return
      setActiveIndex(i)
      setView('gallery')
      setLightboxPhotoIndex(null)
      replaceAlbumUrl({ view: 'gallery', deckId: deck.id })
    },
    [decks, replaceAlbumUrl]
  )

  // 返回书架总览
  const backToShelf = useCallback(() => {
    setView('shelf')
    setActiveIndex(0)
    setLightboxPhotoIndex(null)
    replaceAlbumUrl({ view: 'shelf' })
  }, [replaceAlbumUrl])

  // 画廊快切轨道切换画辑
  const selectDeck = useCallback(
    i => {
      const deck = decks[i]
      if (!deck) return
      setActiveIndex(i)
      setLightboxPhotoIndex(null)
      replaceAlbumUrl({ view: 'gallery', deckId: deck.id })
    },
    [decks, replaceAlbumUrl]
  )

  // URL 驱动权威状态同步
  useEffect(() => {
    if (!router.isReady) return
    if (urlSyncLockRef.current) return

    const { view: qView, deck: qDeck } = parseAlbumQuery(router.query)

    if (qView === 'gallery' || qDeck) {
      const i = findDeckIndexById(decks, qDeck)
      if (i < 0) {
        setView('shelf')
        setActiveIndex(0)
        if (qDeck || router.query.view === 'gallery') {
          replaceAlbumUrl({ view: 'shelf' })
        }
        return
      }
      if (view !== 'gallery' || activeIndex !== i) {
        setActiveIndex(i)
        setView('gallery')
      }
    } else if (view !== 'shelf') {
      setView('shelf')
      setActiveIndex(0)
    }
  }, [router.isReady, router.query, decks, view, activeIndex, replaceAlbumUrl])

  // 画廊态控制页面全局类（隐藏默认页脚，适配全屏视差画廊）
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

  // 导航栏点击「影集」回归书架
  useEffect(() => {
    if (!albumUI?.registerGoShelf) return undefined
    albumUI.registerGoShelf(backToShelf)
    return () => albumUI.registerGoShelf(null)
  }, [albumUI, backToShelf])

  // 灯箱回调挂载（保证在所有条件返回前无条件声明）
  const handlePhotoClick = useCallback(idx => {
    setLightboxPhotoIndex(idx)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxPhotoIndex(null)
  }, [])

  const handleGoLightbox = useCallback((delta, total) => {
    setLightboxPhotoIndex(prev => (prev + delta + total) % total)
  }, [])

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
        <AlbumShelfStack decks={decks} onOpen={openGallery} />
      </div>
    )
  }

  const currentDeck = decks[activeIndex] || decks[0]
  const currentPhotos = currentDeck?.photos || []
  const activePhoto =
    lightboxPhotoIndex !== null ? currentPhotos[lightboxPhotoIndex] : null

  return (
    <div className='cl-album-shell is-gallery'>
      {/* 核心摄影瀑布流展墙 */}
      <AlbumInfiniteWall
        key={currentDeck.id || activeIndex}
        photos={currentPhotos}
        albumName={currentDeck.name}
        albumSummary={currentPhotos[0]?.summary || ''}
        albumDate={currentPhotos[0]?.date || ''}
        onBackToShelf={backToShelf}
        onPhotoClick={handlePhotoClick}
        isPaused={lightboxPhotoIndex !== null}
        onScrollChange={setIsGalleryScrolled}
      />

      {/* 右下角灵动影集快速切辑器 */}
      <AlbumDeckNav
        decks={decks}
        activeDeckIndex={activeIndex}
        onBack={backToShelf}
        onSelect={selectDeck}
        isScrolled={isGalleryScrolled}
      />

      {/* 全屏灯箱 */}
      {activePhoto && lightboxPhotoIndex !== null && (
        <AlbumLightbox
          title={activePhoto.title || currentDeck.name}
          photo={activePhoto}
          index={lightboxPhotoIndex}
          total={currentPhotos.length}
          onClose={handleCloseLightbox}
          onGo={delta => handleGoLightbox(delta, currentPhotos.length)}
        />
      )}
    </div>
  )
}
