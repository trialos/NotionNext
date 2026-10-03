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
  // fallback: first tag that isn't generic
  const tags = p?.tags
  if (Array.isArray(tags) && tags.length) {
    const t = typeof tags[0] === 'string' ? tags[0] : tags[0]?.name
    if (t) return String(t)
  }
  return siteConfig('CIRCLELIFE_ALBUM_DEFAULT_NAME', '未分辑', CONFIG)
}

export function normalizePhoto(p) {
  if (!p) return null
  const author = resolveAuthor(p)
  return {
    id: p.id,
    title: p.title || '',
    summary: p.summary || p.description || '',
    cover: photoCover(p),
    href: p.href || '',
    date: p.publishDay || p.date?.start_date || '',
    publishDate: p.publishDate || 0,
    album: photoAlbumName(p),
    author
  }
}

/**
 * @returns {{ name: string, photos: object[] }[]}
 */
export function buildAlbumDecks(pages) {
  const photos = (pages || [])
    .filter(p => p && (p.type === 'Photo' || p.type === 'photo'))
    .filter(p => p.status === 'Published' || !p.status)
    .map(normalizePhoto)
    .filter(p => p && (p.cover || p.title))

  photos.sort((a, b) => (b.publishDate || 0) - (a.publishDate || 0))

  const order = []
  const map = new Map()
  for (const ph of photos) {
    const name = ph.album || siteConfig('CIRCLELIFE_ALBUM_DEFAULT_NAME', '未分辑', CONFIG)
    if (!map.has(name)) {
      map.set(name, [])
      order.push(name)
    }
    map.get(name).push(ph)
  }

  // If no Photo types yet, empty
  return order.map(name => ({
    name,
    photos: map.get(name) || []
  }))
}
