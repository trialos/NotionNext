import {
  KIND,
  albumIdOf,
  descriptionOf,
  isMusicNote,
  isPublished,
  noteHref,
  noteKind,
  releaseDateOf,
  songIdOf,
  summaryOf,
  titleOf,
  firstString
} from './paths'
import { findTracksBlock, richTextOf } from './tracks'

function noteDate(note) {
  const iso = releaseDateOf(note) || firstString(note?.date?.start_date)
  const stamp = Date.parse(iso)
  return Number.isFinite(stamp) ? stamp : note?.publishDate || 0
}

function toEntry(page) {
  return {
    id: page.id,
    slug: page.slug,
    kind: noteKind(page),
    title: titleOf(page) || '未命名手记',
    summary: summaryOf(page),
    description: descriptionOf(page),
    href: noteHref(page),
    albumId: albumIdOf(page),
    songId: songIdOf(page),
    albumTitle: firstString(page?.musicNoteAlbumTitle),
    songTitle: firstString(page?.musicNoteSongTitle),
    date: releaseDateOf(page) || firstString(page?.date?.start_date),
    publishDate: noteDate(page),
    featured: page?.featured === true,
    shelfOrder: page?.musicShelfOrder ?? null,
    coverUrl: firstString(page?.musicCoverOverride) || firstString(page?.musicCoverUrl),
    artistLine: firstString(page?.musicArtist),
    neteaseUrl: firstString(page?.musicNeteaseUrl)
  }
}

function byDateDesc(a, b) {
  return b.publishDate - a.publishDate
}

/**
 * 全站手记索引：只收 Published 手记，按专辑 ID / 歌曲 ID 分组。
 * 展架的单曲卡就是 kind=Single 的手记行本身（noteKind 即上架开关）。
 */
export function buildNoteIndex(pages) {
  const notes = (Array.isArray(pages) ? pages : [])
    .filter(page => isMusicNote(page) && isPublished(page) && page?.slug)
    .map(toEntry)

  const byAlbum = new Map()
  const bySong = new Map()
  const singles = []

  for (const note of notes) {
    if (note.kind === KIND.single) singles.push(note)
    if (note.albumId) {
      if (!byAlbum.has(note.albumId)) byAlbum.set(note.albumId, [])
      byAlbum.get(note.albumId).push(note)
    }
    if (note.songId) {
      if (!bySong.has(note.songId)) bySong.set(note.songId, [])
      bySong.get(note.songId).push(note)
    }
  }

  for (const list of byAlbum.values()) list.sort(byDateDesc)
  for (const list of bySong.values()) list.sort(byDateDesc)
  singles.sort(byDateDesc)

  return { notes, byAlbum, bySong, singles }
}

/** 专辑页顶部/手记条：只取挂在专辑上的手记（专辑级 + 该专辑内的曲目级） */
export function albumLevelNotes(index, albumId) {
  if (!albumId) return []
  return (index?.byAlbum?.get(albumId) || []).filter(n => n.kind === KIND.album)
}

/** 曲目行手记入口：同一首歌多篇时取最新（music:doctor 会报重复） */
export function trackNote(index, songId) {
  if (!songId) return null
  const list = index?.bySong?.get(songId) || []
  const match = list.filter(n => n.kind === KIND.track || n.kind === KIND.single)
  return match.length ? match[0] : null
}

export function singleNotes(index) {
  return index?.singles || []
}

/** 只有媒体、没有文字的块也算「有内容」：纯图手记不该被当成空手记 */
const MEDIA_TYPES = new Set([
  'image',
  'video',
  'embed',
  'bookmark',
  'file',
  'pdf',
  'audio',
  'divider'
])

function blockValueOf(entry) {
  return entry?.value?.value || entry?.value || null
}

function hasContent(block) {
  return MEDIA_TYPES.has(block?.type) || richTextOf(block?.properties?.title).trim() !== ''
}

/**
 * 手记有没有正文。
 *
 * 展架上的单曲卡靠它决定自己是不是一张真手记：没正文的单曲只做展示卡，
 * 不链到手记页（那页只剩一个「关于《…》」的标题）。自动生成的曲目折叠块
 * 不算正文；任何读不到的情况一律当「有正文」—— 宁可多一个可点链接，也不要
 * 因为一次 Notion 抖动把写好的手记变成死卡。
 */
export function noteHasBody(blockMap, pageId = '') {
  const blocks = blockMap?.block
  if (!blocks) return true
  const page =
    blockValueOf(blocks[pageId]) ||
    Object.values(blocks)
      .map(blockValueOf)
      .find(block => block?.type === 'page')
  if (!page) return true
  // 页面块读到了就说明正文拉取成功：没有 content 就是没有子块（空手记），
  // 不再当成「读不到」。只有整个 blockMap 拿不到时才放宽。
  const childIds = Array.isArray(page.content) ? page.content : []

  const tracks = findTracksBlock(blockMap, page.id)
  const skip = new Set()
  if (tracks.blockId) {
    skip.add(tracks.blockId)
    const parentId = blockValueOf(blocks[tracks.blockId])?.parent_id
    const parent = parentId ? blockValueOf(blocks[parentId]) : null
    if (parent?.type === 'toggle') skip.add(parentId)
  }

  for (const id of childIds) {
    if (skip.has(id)) continue
    const block = blockValueOf(blocks[id])
    if (!block) continue
    if (hasContent(block)) return true
    if (
      Array.isArray(block.content) &&
      block.content.some(childId => !skip.has(childId) && hasContent(blockValueOf(blocks[childId])))
    ) {
      return true
    }
  }
  return false
}
