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

export function photoAlbumName(p) {
  const raw =
    firstString(p?.album) ||
    firstString(p?.['专辑']) ||
    firstString(p?.Album) ||
    ''
  if (raw) return raw
  const tags = p?.tags
  if (Array.isArray(tags) && tags.length) {
    const t = typeof tags[0] === 'string' ? tags[0] : tags[0]?.name
    if (t) return String(t)
  }
  return siteConfig('CIRCLELIFE_ALBUM_DEFAULT_NAME', '未分辑', CONFIG)
}

/** caption 与 title/summary 相同时不展示 */
export function uniqueCaption(caption, title, summary) {
  const c = (caption || '').trim()
  if (!c) return ''
  const t = (title || '').trim()
  const s = (summary || '').trim()
  if (c === t || c === s) return ''
  return c
}

/**
 * 一条 Photo 页 → 多张可滑卡片
 * title 始终用页面标题；caption 单独；summary 只用页面摘要
 */
export function expandPhotoPage(p) {
  if (!p) return []
  const author = resolveAuthor(p)
  const album = photoAlbumName(p)
  const pageTitle = (p.title || '').trim()
  const pageSummary = (p.summary || p.description || '').trim()
  const base = {
    pageId: p.id,
    href: p.href || '',
    date: p.publishDay || p.date?.start_date || '',
    publishDate: p.publishDate || 0,
    album,
    author,
    title: pageTitle,
    summary: pageSummary
  }

  const imgs = Array.isArray(p.images) ? p.images.filter(i => i?.url) : []
  if (imgs.length) {
    return imgs.map((img, i) => {
      const caption = uniqueCaption(img.caption || '', pageTitle, pageSummary)
      return {
        ...base,
        id: `${p.id}-${img.id || i}`,
        url: img.url,
        cover: img.url,
        caption,
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
      caption: '',
      indexInPage: 0,
      totalInPage: 1
    }
  ]
}

export function buildAlbumDecks(pages) {
  const cards = []
  for (const p of pages || []) {
    if (!p || (p.type !== 'Photo' && p.type !== 'photo')) continue
    if (p.status && p.status !== 'Published') continue
    cards.push(...expandPhotoPage(p))
  }

  cards.sort((a, b) => (b.publishDate || 0) - (a.publishDate || 0))

  const order = []
  const map = new Map()
  for (const ph of cards) {
    const name =
      ph.album || siteConfig('CIRCLELIFE_ALBUM_DEFAULT_NAME', '未分辑', CONFIG)
    if (!map.has(name)) {
      map.set(name, [])
      order.push(name)
    }
    map.get(name).push(ph)
  }

  return order.map(name => ({
    name,
    photos: map.get(name) || []
  }))
}
