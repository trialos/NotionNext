import { createHash } from 'node:crypto'
import { ENTRY, KIND, P, TYPES, contract } from './contract.mjs'

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&apos': "'",
  '&nbsp;': ' '
}

export function cleanText(value) {
  let text = String(value ?? '')
  for (const [entity, char] of Object.entries(ENTITIES)) {
    text = text.split(entity).join(char)
  }
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function clipText(value, max = 1800) {
  const text = cleanText(value)
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

/** 网易云时间戳是本地零点毫秒；按 UTC 取日会整体偏一天 */
export function dateInShanghai(ms) {
  const num = Number(ms)
  if (!Number.isFinite(num) || num <= 0) return ''
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(num))
  } catch {
    return new Date(num).toISOString().slice(0, 10)
  }
}

export function httpsCover(value) {
  const url = String(value ?? '').trim()
  if (!/^https?:\/\//i.test(url)) return ''
  return (
    url
      .replace(/^http:/i, 'https:')
      .replace(/[?&]param=[^&]*$/i, '')
      // 网易云对同一张图轮换 p1/p2/p3 主机：不固定就会每次刷新都"变了"一次
      .replace(/^https:\/\/p\d+\.music\.(126\.net|163\.com)/i, 'https://p1.music.$1')
  )
}

export function artistLine(value) {
  const list = Array.isArray(value) ? value : value ? [value] : []
  const seen = new Set()
  const names = []
  for (const item of list) {
    const name = cleanText(typeof item === 'string' ? item : item?.name)
    if (!name || seen.has(name)) continue
    seen.add(name)
    names.push(name)
  }
  return names.join(' / ')
}

const num = value => {
  const id = String(value ?? '').replace(/\D/g, '')
  return id
}

/**
 * 网易云同一资源有两个 ID：originalId 是数字（网页链接用），
 * id 是 32 位十六进制加密串（CLI 参数用）。
 * 只取数字 ID 时必须先认 originalId，否则会把十六进制里的数字抠成一个假 ID。
 */
function digitsOnly(value) {
  const text = String(value ?? '').trim()
  return /^\d+$/.test(text) ? text : ''
}

function pickId(...candidates) {
  for (const candidate of candidates) {
    const id = num(candidate)
    if (id) return id
  }
  return ''
}

/** CLI 与公开接口字段名不同，这里一次抹平 */
function readSong(raw = {}) {
  const artists = raw.artists || raw.ar || []
  const album = raw.album || raw.al || {}
  const duration = Number(raw.duration ?? raw.dt ?? 0)
  return {
    id: pickId(raw.originalId, digitsOnly(raw.id)),
    title: cleanText(raw.name ?? raw.title),
    artists: artistLine(artists),
    duration: Number.isFinite(duration) ? Math.round(duration) : 0,
    cover: httpsCover(raw.coverImgUrl || raw.picUrl || album.picUrl || album.blurPicUrl),
    albumId: pickId(album.originalId, digitsOnly(album.id)),
    albumTitle: cleanText(album.name ?? album.title),
    albumPublishTime: Number(album.publishTime) || 0,
    disc: raw.cd ?? raw.disc,
    no: raw.no ?? raw.position
  }
}

function readAlbumDetail(detail = {}) {
  return {
    id: pickId(detail.originalId, digitsOnly(detail.id)),
    name: cleanText(detail.name),
    artists: artistLine(detail.artists),
    cover: httpsCover(detail.coverImgUrl),
    publishDate: dateInShanghai(detail.publishTime),
    company: cleanText(detail.company),
    language: cleanText(detail.language),
    description: clipText(detail.description)
  }
}

export function neteaseAlbumUrl(albumId) {
  const id = num(albumId)
  return id ? `${contract.netease.album}${id}` : ''
}

export function neteaseSongUrl(songId) {
  const id = num(songId)
  return id ? `${contract.netease.song}${id}` : ''
}

function indexValue(value) {
  const parsed = Number(value)
  if (Number.isFinite(parsed)) return parsed
  const text = cleanText(value)
  if (!text) return null
  const digits = text.match(/\d+/)
  return digits ? Number(digits[0]) : null
}

/** 曲目 JSON v1：字段名必须与 lib/music/tracks.js 的读取端一致 */
export function buildTracksPayload(
  albumId,
  rawTracks,
  { kind = 'album', total = 0 } = {}
) {
  const all = (Array.isArray(rawTracks) ? rawTracks : [])
    .map(readSong)
    .filter(track => track.title)
    .map((track, i) => ({
      id: track.id,
      title: track.title,
      artists: track.artists ? track.artists.split(' / ') : [],
      duration: track.duration,
      disc: indexValue(track.disc),
      no: indexValue(track.no) ?? i + 1,
      cover: track.cover,
      url: track.id ? neteaseSongUrl(track.id) : '',
      mvId: null
    }))

  // 大歌单只存前若干首：整块 JSON 会被站点读进页面数据，全量会直接撑爆预算
  const cap = Number(contract.tracksBlock.maxTracks) || 60
  const tracks = all.slice(0, cap)
  const realTotal = Number(total) > 0 ? Number(total) : all.length

  return {
    schema: contract.schema,
    v: contract.version,
    kind,
    albumId: num(albumId),
    syncedAt: new Date().toISOString(),
    total: realTotal,
    truncated: all.length > cap || realTotal > tracks.length,
    tracks
  }
}

/** 哈希只覆盖内容本身：不含 syncedAt，否则每次跑都算「变了」 */
export function syncHash(payload) {
  const stable = JSON.stringify(payload, (key, value) => {
    if (key === 'syncedAt') return undefined
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
    }
    return value
  })
  return createHash('sha256').update(stable).digest('hex').slice(0, 12)
}

/** 专辑行：机器字段 + 种子字段（种子字段由 plan 层决定是否真的写） */
export function normalizeAlbum({ detail, tracks, encryptedId = '' }) {
  const album = readAlbumDetail(detail)
  const payload = buildTracksPayload(album.id, tracks)
  const hash = syncHash(payload)

  return {
    kind: 'album',
    type: TYPES.album,
    albumId: album.id,
    title: album.name,
    hash,
    payload,
    properties: {
      [P.artistLine]: album.artists,
      [P.coverUrl]: album.cover,
      [P.releaseDate]: album.publishDate,
      [P.label]: album.company,
      [P.language]: album.language,
      [P.trackCount]: String(payload.tracks.length),
      [P.ncmAlbumId]: album.id,
      [P.ncmEncryptedId]: encryptedId || '',
      [P.neteaseUrl]: neteaseAlbumUrl(album.id),
      [P.delisted]: false
    },
    seeds: {
      title: album.name,
      summary: '',
      description: album.description
    }
  }
}

export function neteasePlaylistUrl(playlistId) {
  const id = num(playlistId)
  return id ? `${contract.netease.playlist}${id}` : ''
}

/** 年度歌单的年份只从标题取：API 的 createTime 是入库时间，不是年份 */
export function yearFromTitle(title) {
  const match = String(title || '').match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : 0
}

/**
 * 歌单行（含年度歌单）：与专辑共用 MusicAlbum 行类型，靠「条目类型」列分卡片标签。
 * 创建者进「艺人」列 —— 收藏的第三方歌单要让人知道是谁建的。
 */
export function normalizePlaylist({
  detail,
  tracks,
  encryptedId = '',
  playlistId = '',
  entryType = ENTRY.playlist
}) {
  const id = playlistId || pickId(detail?.originalId, digitsOnly(detail?.id))
  const title = cleanText(detail?.name)
  const payload = buildTracksPayload(id, tracks, {
    kind: 'playlist',
    total: Number(detail?.trackCount) || 0
  })
  const year = entryType === ENTRY.annual ? yearFromTitle(title) : 0

  return {
    kind: 'playlist',
    type: TYPES.album,
    entryType,
    albumId: id,
    title,
    hash: syncHash(payload),
    payload,
    properties: {
      [P.entryType]: entryType,
      [P.artistLine]: cleanText(detail?.creatorNickName),
      [P.coverUrl]: httpsCover(detail?.coverImgUrl),
      [P.releaseDate]: year ? `${year}-01-01` : '',
      [P.trackCount]: String(payload.total || payload.tracks.length),
      [P.ncmAlbumId]: id,
      [P.ncmEncryptedId]: encryptedId || '',
      [P.neteaseUrl]: neteasePlaylistUrl(id),
      [P.delisted]: false
    },
    seeds: {
      title,
      summary: '',
      description: clipText(detail?.describe ?? detail?.description)
    },
    warnings: entryType === ENTRY.annual && !year
      ? [`标题里没有年份：${title}（告诉我哪一年，或在 Notion 填「发行日期」）`]
      : []
  }
}

/** 单曲：一行同时是展架单曲卡和手记 */
export function normalizeSingle({ song }) {
  const track = readSong(song)
  return {
    kind: KIND.single,
    type: TYPES.note,
    songId: track.id,
    albumId: track.albumId,
    title: track.title,
    properties: {
      [P.noteKind]: KIND.single,
      [P.ncmSongId]: track.id,
      [P.ncmAlbumId]: track.albumId,
      [P.noteSongTitle]: track.title,
      [P.noteAlbumTitle]: track.albumTitle,
      [P.artistLine]: track.artists,
      [P.coverUrl]: track.cover,
      [P.releaseDate]: dateInShanghai(track.albumPublishTime),
      [P.neteaseUrl]: neteaseSongUrl(track.id)
    },
    seeds: {
      title: `关于《${track.title}》`,
      summary: ''
    }
  }
}

/** 专辑手记 / 曲目手记：只填关联与快照，正文永远归人 */
export function normalizeNote({ kind, song, album }) {
  if (kind === KIND.track) {
    const track = readSong(song)
    return {
      kind,
      type: TYPES.note,
      songId: track.id,
      albumId: album?.id ? pickId(album.originalId, digitsOnly(album.id)) : track.albumId,
      properties: {
        [P.noteKind]: KIND.track,
        [P.ncmSongId]: track.id,
        [P.ncmAlbumId]: album?.id ? pickId(album.originalId, digitsOnly(album.id)) : track.albumId,
        [P.noteSongTitle]: track.title,
        [P.noteAlbumTitle]: track.albumTitle,
        [P.artistLine]: track.artists,
        [P.coverUrl]: track.cover,
        [P.releaseDate]: dateInShanghai(track.albumPublishTime),
        [P.neteaseUrl]: neteaseSongUrl(track.id)
      },
      seeds: { title: `关于《${track.title}》`, summary: '' }
    }
  }

  const detail = readAlbumDetail(album || {})
  return {
    kind: KIND.album,
    type: TYPES.note,
    albumId: detail.id,
    properties: {
      [P.noteKind]: KIND.album,
      [P.ncmAlbumId]: detail.id,
      [P.noteAlbumTitle]: detail.name,
      [P.artistLine]: detail.artists,
      [P.coverUrl]: detail.cover,
      [P.releaseDate]: detail.publishDate,
      [P.neteaseUrl]: neteaseAlbumUrl(detail.id)
    },
    seeds: { title: `关于《${detail.name}》`, summary: '' }
  }
}

/**
 * 长 JSON 分片写进同一个代码块（Notion 单段富文本上限 2000 字符）。
 * 直接产出官方 API 形状：创建（children）与改块（PATCH）用的是同一份结构，
 * 少一层转换就少一处会漏的地方（实测漏过一次，建行直接 400）。
 */
export function chunkRichText(text, size = contract.tracksBlock.chunkChars) {
  const source = String(text ?? '')
  if (!source) return [{ type: 'text', text: { content: ' ' } }]
  const parts = []
  for (let i = 0; i < source.length; i += size) {
    parts.push({ type: 'text', text: { content: source.slice(i, i + size) } })
  }
  return parts
}

export function tracksBlockChildren(payload) {
  return [
    {
      object: 'block',
      type: 'code',
      code: {
        language: contract.tracksBlock.language,
        rich_text: chunkRichText(JSON.stringify(payload, null, 2))
      }
    }
  ]
}

export function tracksToggleBlock(payload) {
  return {
    object: 'block',
    type: 'toggle',
    toggle: {
      rich_text: [{ type: 'text', text: { content: contract.tracksBlock.toggleTitle } }],
      children: tracksBlockChildren(payload)
    }
  }
}

export { contract, P, KIND }
