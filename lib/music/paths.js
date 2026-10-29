import contract from './contract.json'

const ALBUM_TYPE = contract.types.album
const NOTE_TYPE = contract.types.note
const KIND = contract.noteKinds
export const ENTRY = contract.entryTypes

/**
 * 条目类型：展架卡片标签与年份带分组都看它。
 * 空值一律按「专辑」处理 —— 建列之前建的行不该因此从展架上消失。
 */
export function entryType(page) {
  const raw = firstString(page?.musicEntryType)
  if (raw === ENTRY.playlist || raw === ENTRY.annual) return raw
  return ENTRY.album
}

export function isPlaylistEntry(page) {
  return entryType(page) === ENTRY.playlist
}

export function isAnnualEntry(page) {
  return entryType(page) === ENTRY.annual
}

export function firstString(value) {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string')
    return value[0].trim()
  return ''
}

/** 只认数字 ID：网易云外链与手记匹配都靠它，不靠标题 */
export function numericId(value) {
  const raw = typeof value === 'number' ? String(value) : firstString(value)
  return raw.replace(/\D/g, '')
}

export function isMusicType(type) {
  return type === ALBUM_TYPE || type === NOTE_TYPE
}

export function isMusicAlbum(page) {
  return page?.type === ALBUM_TYPE
}

export function isMusicNote(page) {
  return page?.type === NOTE_TYPE
}

export function noteKind(page) {
  return firstString(page?.musicNoteKind)
}

export function isSingleNote(page) {
  return isMusicNote(page) && noteKind(page) === KIND.single
}

export function isTrackNote(page) {
  return isMusicNote(page) && noteKind(page) === KIND.track
}

export function isAlbumNote(page) {
  return isMusicNote(page) && noteKind(page) === KIND.album
}

/** 机器下架标记：只有同步脚本确认上游消失才为 true */
export function isDelisted(page) {
  return page?.musicDelisted === true
}

export function isPublished(page) {
  return page?.status === 'Published'
}

/** 展架可见 = 人已发布 且 机器未确认下架；Invisible 仍可 URL 直达预览 */
export function isShelfVisible(page) {
  return isPublished(page) && !isDelisted(page)
}

export function cleanSlug(slug) {
  return String(slug || '').trim().replace(/^\/+|\/+$/g, '')
}

function encodePath(slug) {
  return cleanSlug(slug)
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')
}

export function albumPath(slug) {
  const encoded = encodePath(slug)
  return encoded ? `${contract.routes.album}${encoded}` : ''
}

export function notePath(slug) {
  const encoded = encodePath(slug)
  return encoded ? `${contract.routes.note}${encoded}` : ''
}

export function albumHref(page) {
  return albumPath(page?.slug)
}

export function noteHref(page) {
  return notePath(page?.slug)
}

/**
 * 音乐行在站点上的真实路径。
 * sitemap 与 revalidation 都要用它：这两处若图省事直接写 row.slug，
 * 就会把音乐行登记成一个本不该存在的裸文章路由。
 */
export function sitePathOf(page) {
  if (!page?.slug) return ''
  if (isMusicAlbum(page)) return albumPath(page.slug)
  if (isMusicNote(page)) return notePath(page.slug)
  return ''
}

export function neteaseAlbumUrl(albumId) {
  const id = numericId(albumId)
  return id ? `${contract.netease.album}${id}` : ''
}

export function neteaseSongUrl(songId) {
  const id = numericId(songId)
  return id ? `${contract.netease.song}${id}` : ''
}

export function neteasePlaylistUrl(playlistId) {
  const id = numericId(playlistId)
  return id ? `${contract.netease.playlist}${id}` : ''
}

/** 优先用同步写入的规范链接，缺省时由数字 ID 现拼（歌单行的 ID 存在同一列里） */
export function neteaseUrlOf(page) {
  const stored = firstString(page?.musicNeteaseUrl)
  if (/^https?:\/\//i.test(stored)) return stored
  const song = numericId(page?.musicNcmSongId)
  if (song) return neteaseSongUrl(song)
  if (isAnnualEntry(page) || isPlaylistEntry(page)) {
    return neteasePlaylistUrl(page?.musicNcmAlbumId)
  }
  return neteaseAlbumUrl(page?.musicNcmAlbumId)
}

export function albumIdOf(page) {
  return numericId(page?.musicNcmAlbumId)
}

export function songIdOf(page) {
  return numericId(page?.musicNcmSongId)
}

export function releaseDateOf(page) {
  const date = page?.musicReleaseDate
  if (!date) return ''
  if (typeof date === 'string') return date.slice(0, 10)
  return firstString(date.start_date).slice(0, 10)
}

export function yearOf(page) {
  const iso = releaseDateOf(page)
  const year = Number(iso.slice(0, 4))
  return Number.isFinite(year) && year > 0 ? year : 0
}

/** 展架手排序：rich_text 存字符串，解析失败排最后 */
export function parseShelfOrder(value) {
  const raw = firstString(value).replace(/[^\d-]/g, '')
  if (!raw || raw === '-') return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

export function trackCountOf(page) {
  const parsed = Number(firstString(page?.musicTrackCount).replace(/\D/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function artistLineOf(page) {
  return firstString(page?.musicArtist)
}

export function summaryOf(page) {
  return firstString(page?.summary)
}

export function descriptionOf(page) {
  return firstString(page?.description)
}

export function titleOf(page) {
  return firstString(page?.title)
}

export { ALBUM_TYPE, NOTE_TYPE, KIND, contract }
