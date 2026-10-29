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
