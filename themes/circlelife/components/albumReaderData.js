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

/**
 * 小序分段：Notion 里靠手动回车分段（\n / \r\n）。
 * 连续空行与首尾空白一并收掉，只留下有内容的段落。
 */
export function splitIntroParagraphs(intro) {
  if (!intro || typeof intro !== 'string') return []
  return intro
    .replace(/\r\n?/g, '\n')
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
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
  const raw =
    firstString(page?.publishDay) || firstString(page?.date?.start_date)
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
 * 一页一辑：summary（目录题眼）/ description（章页小序）/ 正文图片（Caption 已去重）。
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
      thumbSrc: buildSizedSource(photo.url, THUMB_IMAGE_WIDTH) || photo.url,
      ratio: Number(photo.aspectRatio) > 0 ? Number(photo.aspectRatio) : 0,
      caption: firstString(photo.caption)
    }))
    const { year, month } = dateParts(page)
    const title = firstString(page.title) || '未命名影集'
    // 目录题眼只看 Summary；章页小序只看 Description，两者互不兜底
    const summary = firstString(page.summary)
    const intro = firstString(page.description)
    const introParagraphs = splitIntroParagraphs(intro)
    albums.push({
      id: page.id,
      title,
      summary,
      intro,
      introParagraphs,
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
 *   /album?deck=<id>                  → 该辑章页（首页 / 搜索进入，刷新回章页）
 *   /album                            → 最近一辑章页
 * 只在 URL 记 deck，不记单张照片；旧链接的 view 参数会被忽略。
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
    deck: deck.trim()
  }
}

export function readerQuery(deckId) {
  const q = {}
  if (deckId) q.deck = String(deckId)
  return q
}

/**
 * 同路由换辑判定：/album 内只有一个阅读器实例，外部导航改 deck 时
 * 需要主动切辑；阅读器自己 syncUrl 写回的 deck 不能重复触发。
 * `lastQueryDeck` 是上一次观察到的 query：跨辑过渡期间 router.query
 * 会短暂停留在旧值，必须用它与状态切换区分开。
 * 返回需要切换到的 deck；空字符串表示无需处理。
 */
export function resolveQueryDeckChange({
  queryDeck,
  syncedDeck,
  currentDeck,
  lastQueryDeck
}) {
  if (!queryDeck) return ''
  if (queryDeck === lastQueryDeck) return ''
  if (queryDeck === syncedDeck) return ''
  if (queryDeck === currentDeck) return ''
  return queryDeck
}
