import {
  ENTRY,
  albumHref,
  albumIdOf,
  artistLineOf,
  descriptionOf,
  entryType,
  firstString,
  isDelisted,
  isMusicAlbum,
  isPublished,
  isShelfVisible,
  isSingleNote,
  neteaseSongUrl,
  neteaseUrlOf,
  noteHref,
  parseShelfOrder,
  releaseDateOf,
  songIdOf,
  summaryOf,
  titleOf,
  trackCountOf,
  yearOf
} from './paths'
import { neteaseCover, coverSrc, coverSourceOf, COVER_SIZES } from './images'
import { buildNoteIndex, albumLevelNotes, trackNote } from './notes'

const LAST = Number.MAX_SAFE_INTEGER

function orderOf(page) {
  const parsed = parseShelfOrder(page?.musicShelfOrder)
  return parsed === null ? LAST : parsed
}

/**
 * 展架顺序只认博主的手势：精选置顶 → 展架排序（填了号的在前，按号升序）→ 数据原序。
 * 不再按发行日期自动排：日期自动排会把博主精心摆的顺序打乱，
 * 而且音乐行没有站点的 date 列，publishDate 实际是 Notion 建行的时间，等于随机。
 */
function shelfSort(a, b) {
  const aFeatured = a.featured ? 1 : 0
  const bFeatured = b.featured ? 1 : 0
  if (aFeatured !== bFeatured) return bFeatured - aFeatured
  if (a.order !== b.order) return a.order - b.order
  return a.rowIndex - b.rowIndex
}

/** 年份带同理：填了排序号听他的，没填才按年份倒序（年份对年度歌单本身就是顺序语义） */
function annualSort(a, b) {
  if (a.order !== b.order) return a.order - b.order
  if (b.year !== a.year) return b.year - a.year
  return a.rowIndex - b.rowIndex
}

function albumCard(page, index, rowIndex) {
  const albumId = albumIdOf(page)
  const notes = albumId ? index.byAlbum.get(albumId) || [] : []
  const entry = entryType(page)
  return {
    kind: 'album',
    entryType: entry,
    id: page.id,
    slug: page.slug,
    title: titleOf(page) || '未命名条目',
    artist: artistLineOf(page),
    year: yearOf(page),
    trackCount: trackCountOf(page),
    summary: summaryOf(page),
    href: albumHref(page),
    cover: coverSrc(page, COVER_SIZES.card),
    coverSource: coverSourceOf(page).source,
    neteaseUrl: neteaseUrlOf(page),
    noteCount: notes.length,
    hasNotes: notes.length > 0,
    featured: page.featured === true,
    order: orderOf(page),
    rowIndex
  }
}

/** 单曲卡就是 kind=Single 的那篇手记；卡面用歌曲名，点进去是手记正文 */
function singleCard(page, rowIndex) {
  const songId = songIdOf(page)
  return {
    kind: 'single',
    id: page.id,
    slug: page.slug,
    title: firstString(page.musicNoteSongTitle) || titleOf(page) || '未命名单曲',
    noteTitle: titleOf(page),
    artist: artistLineOf(page) || firstString(page.musicNoteAlbumTitle),
    year: yearOf(page),
    summary: summaryOf(page),
    href: noteHref(page),
    cover: coverSrc(page, COVER_SIZES.card),
    coverSource: coverSourceOf(page).source,
    neteaseUrl: firstString(page.musicNeteaseUrl) || neteaseSongUrl(songId),
    featured: page.featured === true,
    order: orderOf(page),
    rowIndex
  }
}

/**
 * 展架 A：条目行 + kind=Single 的手记行混排成一面唱片墙。
 * 年度歌单单独抽出来成年份带 —— 七八张同名同形的卡挤在主网格里会连成一片。
 */
export function buildShelfItems(pages) {
  const list = Array.isArray(pages) ? pages.filter(Boolean) : []
  const index = buildNoteIndex(list)

  const all = []
  list.forEach((page, i) => {
    if (isMusicAlbum(page) && isShelfVisible(page)) {
      all.push(albumCard(page, index, i))
    } else if (isSingleNote(page) && isPublished(page) && !isDelisted(page)) {
      all.push(singleCard(page, i))
    }
  })

  const annual = all
    .filter(item => item.entryType === ENTRY.annual)
    .sort(annualSort)
  const items = all
    .filter(item => item.entryType !== ENTRY.annual)
    .sort(shelfSort)

  return {
    items,
    annual
  }
}

/**
 * 专辑页 D2：头部信息 + 曲目（每首带自己的封面与手记入口）+ 专辑手记条。
 * tracksResult 来自 lib/music/tracks.js 的 findTracksBlock。
 */
export function buildAlbumProps(albumPage, pages, tracksResult) {
  const index = buildNoteIndex(Array.isArray(pages) ? pages.filter(Boolean) : [])
  const albumId = albumIdOf(albumPage)
  const payload = tracksResult?.payload
  const tracks = (payload?.tracks || []).map(track => ({
    ...track,
    cover: track.cover ? neteaseCover(track.cover, COVER_SIZES.track) : '',
    note: trackNote(index, track.id)
  }))

  const entry = entryType(albumPage)
  return {
    entryType: entry,
    listLabel: entry === ENTRY.album ? '曲目' : '歌曲',
    total: payload?.total || 0,
    truncated: Boolean(payload?.truncated),
    album: {
      id: albumPage.id,
      slug: albumPage.slug,
      entryType: entry,
      title: titleOf(albumPage) || '未命名条目',
      artist: artistLineOf(albumPage),
      year: yearOf(albumPage),
      releaseDate: releaseDateOf(albumPage),
      trackCount: trackCountOf(albumPage) || tracks.length,
      summary: summaryOf(albumPage),
      description: descriptionOf(albumPage),
      label: firstString(albumPage.musicLabel),
      language: firstString(albumPage.musicLanguage),
      cover: coverSrc(albumPage, COVER_SIZES.hero),
      coverSource: coverSourceOf(albumPage).source,
      neteaseUrl: neteaseUrlOf(albumPage),
      href: albumHref(albumPage)
    },
    tracks,
    tracksStatus: tracksResult?.status || 'empty',
    tracksError: tracksResult?.error || '',
    syncedAt: payload?.syncedAt || '',
    notes: albumLevelNotes(index, albumId),
    noteCount: (albumId && index.byAlbum.get(albumId)?.length) || 0
  }
}

/** 手记页上下文：专辑还在展架就给返回链，下架/未上架则退回展架并用快照展示 */
export function buildNoteProps(notePage, pages) {
  const list = Array.isArray(pages) ? pages.filter(Boolean) : []
  const albumId = albumIdOf(notePage)
  const songId = songIdOf(notePage)
  const album = albumId
    ? list.find(p => isMusicAlbum(p) && albumIdOf(p) === albumId)
    : null
  const albumVisible = Boolean(album) && isShelfVisible(album)

  return {
    note: {
      id: notePage.id,
      slug: notePage.slug,
      kind: firstString(notePage.musicNoteKind),
      title: titleOf(notePage) || '未命名手记',
      summary: summaryOf(notePage),
      date: releaseDateOf(notePage) || firstString(notePage.date?.start_date),
      href: noteHref(notePage)
    },
    context: {
      albumId,
      songId,
      albumTitle: (album ? titleOf(album) : '') || firstString(notePage.musicNoteAlbumTitle),
      songTitle: firstString(notePage.musicNoteSongTitle) || titleOf(notePage),
      artistLine: artistLineOf(notePage) || (album ? artistLineOf(album) : ''),
      cover:
        coverSrc(notePage, COVER_SIZES.noteContext) ||
        (album ? coverSrc(album, COVER_SIZES.noteContext) : ''),
      neteaseUrl:
        firstString(notePage.musicNeteaseUrl) ||
        neteaseSongUrl(songId) ||
        neteaseUrlOf(notePage),
      albumHref: albumVisible ? albumHref(album) : '',
      backHref: albumVisible ? albumHref(album) : '/music'
    }
  }
}
