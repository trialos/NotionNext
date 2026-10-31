import { buildSizedSource } from './imageSrcset'

/** 阅读器取图：正文/单张大图 1024 档，缩略 512 档；S3/外链原样返回 */
export const READER_IMAGE_WIDTH = 1024
export const THUMB_IMAGE_WIDTH = 512

function firstString(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value) && value.length) {
    return typeof value[0] === 'string' ? String(value[0]).trim() : ''
  }
  return ''
}

function uniqueCaption(caption, title, summary, description) {
  const c = firstString(caption)
  if (!c) return ''
  if (c === title || c === summary || c === description) return ''
  return c
}

/** Photo 页 → 阅读器照片（页面 images 已包含封面；无图时退回页面封面） */
function extractReaderPhotos(page) {
  const title = firstString(page?.title)
  const summary = firstString(page?.summary)
  const description = firstString(page?.description)
  const images = Array.isArray(page?.images)
    ? page.images.filter(image => image?.url)
    : []
  if (images.length) {
    return images.map((image, index) => ({
      id: image.id || `${page.id}-${index}`,
      url: image.url,
      caption: uniqueCaption(image.caption, title, summary, description),
      aspectRatio: Number(image.aspectRatio) > 0 ? Number(image.aspectRatio) : 0
    }))
  }
  const cover = page?.pageCoverThumbnail || page?.pageCover || ''
  if (!cover) return []
  return [
    {
      id: `${page.id}-cover`,
      url: cover,
      caption: uniqueCaption(page?.caption, title, summary, description),
      aspectRatio: 0
    }
  ]
}

function dateParts(page) {
  const raw = firstString(page?.publishDay) || firstString(page?.date?.start_date)
  const match = raw.match(/(\d{4})[.\-/](\d{1,2})/)
  if (match) {
    return {
      year: match[1],
      month: `${match[1]}.${String(match[2]).padStart(2, '0')}`
    }
  }
  const stamp = Number(page?.publishDate)
  if (Number.isFinite(stamp) && stamp > 0) {
    const d = new Date(stamp)
    if (!Number.isNaN(d.getTime())) {
      const year = String(d.getFullYear())
      return {
        year,
        month: `${year}.${String(d.getMonth() + 1).padStart(2, '0')}`
      }
    }
  }
  return { year: '', month: '' }
}

/**
 * Photo 页 → 阅读器专辑模型。
 * 一页一辑：title / summary（题眼）/ description（小序）/ 正文图片（Caption 已去重）。
 */
export function buildReaderAlbums(pages = []) {
  const list = (pages || []).filter(
    p =>
      p &&
      (p.type === 'Photo' || p.type === 'photo') &&
      (!p.status || p.status === 'Published')
  )
  list.sort((a, b) => (b.publishDate || 0) - (a.publishDate || 0))

  const albums = []
  for (const page of list) {
    const sourcePhotos = extractReaderPhotos(page)
    if (!sourcePhotos.length) continue
    const photos = sourcePhotos.map((photo, index) => ({
      id: photo.id || `${page.id}-${index}`,
      index,
      src: buildSizedSource(photo.url, READER_IMAGE_WIDTH) || photo.url,
      fullSrc: photo.url,
      thumbSrc:
        buildSizedSource(photo.url, THUMB_IMAGE_WIDTH) || photo.url,
      ratio: Number(photo.aspectRatio) > 0 ? Number(photo.aspectRatio) : 0,
      caption: firstString(photo.caption)
    }))
    const { year, month } = dateParts(page)
    const title = firstString(page.title) || '未命名影集'
    const summary = firstString(page.summary)
    const intro = firstString(page.description)
    // 站点旧数据里 summary 偶尔等于标题；此时把 description 当作题眼，避免目录重复标题
    const tagline = summary && summary !== title ? summary : intro
    albums.push({
      id: page.id,
      title,
      summary: tagline,
      intro,
      year,
      month,
      count: photos.length,
      photos
    })
  }
  return albums
}

export function findReaderAlbumIndex(albums, id) {
  if (!id || !Array.isArray(albums)) return -1
  return albums.findIndex(album => String(album?.id) === String(id))
}

/**
 * 阅读器 URL 约定：
 *   /album?deck=<id>                  → 该辑章页（刷新回章页）
 *   /album?view=gallery&deck=<id>     → 首页进入，直接第一张
 *   /album                            → 最近一辑章页
 * 只在 URL 记 deck，不记单张照片。
 */
export function parseReaderQuery(query = {}) {
  const deckRaw = query?.deck
  const deck =
    typeof deckRaw === 'string'
      ? deckRaw
      : Array.isArray(deckRaw)
        ? String(deckRaw[0] || '')
        : ''
  return {
    deck: deck.trim(),
    gallery: query?.view === 'gallery'
  }
}

export function readerQuery(deckId, { gallery = false } = {}) {
  const q = {}
  if (deckId) q.deck = String(deckId)
  if (gallery) q.view = 'gallery'
  return q
}
