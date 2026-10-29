import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import { resolveAuthor } from './authors'

function firstString(v) {
  if (!v) return ''
  if (typeof v === 'string') return v.trim()
  if (Array.isArray(v) && v.length) {
    if (typeof v[0] === 'string') return String(v[0]).trim()
    return ''
  }
  return ''
}

export function photoCover(p) {
  return p?.pageCoverThumbnail || p?.pageCover || ''
}

/** Notion「专辑」字段（分类用，不驱动分屏主标题） */
export function photoAlbumTag(p) {
  const raw =
    firstString(p?.album) ||
    firstString(p?.['专辑']) ||
    firstString(p?.Album) ||
    ''
  if (raw) return raw
  return ''
}

/** caption 与 title/summary/description 相同时不展示 */
export function uniqueCaption(caption, title, summary, description = '') {
  const c = (caption || '').trim()
  if (!c) return ''
  const t = (title || '').trim()
  const s = (summary || '').trim()
  const d = (description || '').trim()
  if (c === t || c === s || c === d) return ''
  return c
}

/**
 * 一条 Photo 页 → 多张可滑卡片
 * title = 页面标题；caption 去重；summary = 页面短题眼；description = 长导语
 */
export function expandPhotoPage(p) {
  if (!p) return []
  const author = resolveAuthor(p)
  const albumTag = photoAlbumTag(p)
  const pageTitle = (p.title || '').trim()
  const pageSummary = (p.summary || '').trim()
  const pageDescription = firstString(p.description)
  const base = {
    pageId: p.id,
    href: p.href || '',
    date: p.publishDay || p.date?.start_date || '',
    publishDate: p.publishDate || 0,
    album: albumTag,
    albumTag,
    author,
    title: pageTitle,
    summary: pageSummary
  }

  const imgs = Array.isArray(p.images) ? p.images.filter(i => i?.url) : []
  if (imgs.length) {
    return imgs.map((img, i) => {
      const caption = uniqueCaption(
        img.caption || '',
        pageTitle,
        pageSummary,
        pageDescription
      )
      return {
        ...base,
        id: `${p.id}-${img.id || i}`,
        url: img.url,
        cover: img.url,
        caption,
        aspectRatio: img.aspectRatio || null,
        indexInPage: i,
        totalInPage: imgs.length
      }
    })
  }

  const cover = photoCover(p)
  if (!cover && !pageTitle) return []
  return [
    {
      ...base,
      id: p.id,
      url: cover,
      cover,
      caption:
        uniqueCaption(
          p.caption || '',
          pageTitle,
          pageSummary,
          pageDescription
        ) || '',
      indexInPage: 0,
      totalInPage: 1
    }
  ]
}

/**
 * 一 Photo 页 = 一辑（分屏单位）
 */
export function buildAlbumDecks(pages) {
  const list = (pages || []).filter(
    p =>
      p &&
      (p.type === 'Photo' || p.type === 'photo') &&
      (!p.status || p.status === 'Published')
  )
  list.sort((a, b) => (b.publishDate || 0) - (a.publishDate || 0))

  const decks = []
  for (const p of list) {
    const photos = expandPhotoPage(p)
    if (!photos.length) continue
    const name =
      (p.title || '').trim() ||
      siteConfig('CIRCLELIFE_ALBUM_DEFAULT_NAME', '未命名影集', CONFIG)
    decks.push({
      id: p.id,
      name,
      description: firstString(p.description),
      photos
    })
  }
  return decks
}
