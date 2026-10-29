import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const CLI = process.env.NCM_CLI_PATH || 'ncm-cli'
const UA =
  process.env.NCM_HTTP_UA ||
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 「参数错误」是永久性失败，不能靠重试解决；
 * 而收藏列表接口实测会偶发 HTTP 400，属于可重试的抖动。
 */
function isTransient(message) {
  const text = String(message || '')
  if (/参数错误|非法|not found|不存在/i.test(text)) return false
  return /HTTP\s*(400|403|408|425|429|5\d\d)|ETIMEDOUT|ECONN|EAI_AGAIN|fetch failed|socket hang up|timeout/i.test(
    text
  )
}

async function withRetry(label, task, { retries = 3, baseDelay = 600 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task(attempt)
    } catch (error) {
      lastError = error
      if (!isTransient(error?.message) || attempt === retries) break
      const wait = baseDelay * 2 ** attempt
      console.warn(`[ncm] ${label} 第 ${attempt + 1} 次失败，${wait}ms 后重试：${error?.message}`)
      await sleep(wait)
    }
  }
  throw new Error(`${label} 失败：${lastError?.message || lastError}`)
}

async function runCli(args, { timeout = 30000 } = {}) {
  const { stdout } = await execFileAsync(CLI, [...args, '--output', 'json'], {
    timeout,
    maxBuffer: 24 * 1024 * 1024,
    env: process.env
  }).catch(error => {
    const detail = error?.stderr || error?.message || ''
    throw new Error(detail.split('\n').filter(Boolean).slice(-1)[0] || 'ncm-cli 调用失败')
  })

  let parsed
  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new Error('ncm-cli 输出不是 JSON')
  }

  if (parsed.code !== 200) {
    throw new Error(parsed.message || `ncm-cli code=${parsed.code}`)
  }
  return parsed.data
}

/** recordCount 实测会是 0，只能靠「取到空页」判停 */
export async function albumCollected({ pageSize = 20, maxPages = 50 } = {}) {
  const records = []
  for (let page = 0; page < maxPages; page += 1) {
    const data = await withRetry('album collected', () =>
      runCli(['album', 'collected', '--limit', String(pageSize), '--offset', String(page * pageSize)])
    )
    const batch = Array.isArray(data?.records) ? data.records : []
    records.push(...batch)
    if (batch.length < pageSize) break
  }
  return records
}

export async function albumDetail(encryptedId, { description = true } = {}) {
  return withRetry('album get', () =>
    runCli(['album', 'get', '--albumId', String(encryptedId), '--descFlag', description ? 'true' : 'false'])
  )
}

export async function albumTracks(encryptedId) {
  return withRetry('album tracks', () => runCli(['album', 'tracks', '--albumId', String(encryptedId)]))
}

export async function searchAlbum(keyword, { limit = 30 } = {}) {
  const data = await withRetry('search album', () =>
    runCli(['search', 'album', '--keyword', String(keyword), '--limit', String(limit)])
  )
  return Array.isArray(data?.records) ? data.records : []
}

export async function searchSong(keyword, { limit = 30 } = {}) {
  const data = await withRetry('search song', () =>
    runCli(['search', 'song', '--keyword', String(keyword), '--limit', String(limit)])
  )
  return Array.isArray(data?.records) ? data.records : []
}

async function getJson(url, { timeout = 15000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

/** CLI 没有 song detail 子命令，单曲走公开接口（无需登录） */
export async function publicSongDetail(songId) {
  const data = await withRetry('song detail', () =>
    getJson(`https://music.163.com/api/song/detail?ids=${encodeURIComponent(`[${songId}]`)}`)
  )
  return Array.isArray(data?.songs) ? data.songs[0] || null : null
}

/** 非收藏专辑的兜底详情：这个公开接口把专辑信息放在 album 里，曲目放在 songs 里 */
export async function publicAlbumDetail(albumId) {
  const data = await withRetry('album detail(public)', () =>
    getJson(`https://music.163.com/api/v1/album/${encodeURIComponent(String(albumId))}`)
  )
  const songs = Array.isArray(data?.songs) ? data.songs : []
  if (!songs.length) return null
  return { songs, album: data.album || songs[0]?.al || songs[0]?.album || {} }
}

/**
 * 专辑详情 + 曲目：CLI 只吃加密 ID，所以先按数字 ID 在收藏列表里找加密 ID，
 * 再退回搜索，最后退回公开接口。
 */
export async function fetchAlbum(numericId, { name = '' } = {}) {
  const collected = await albumCollected().catch(error => {
    console.warn(`[ncm] 收藏列表读取失败，继续用兜底路径：${error?.message}`)
    return []
  })
  const hit = collected.find(item => String(item?.originalId ?? '') === String(numericId))

  let encryptedId = hit?.id || ''
  if (!encryptedId && name) {
    const found = await searchAlbum(name).catch(() => [])
    encryptedId =
      found.find(item => String(item?.originalId ?? '') === String(numericId))?.id || ''
  }

  if (encryptedId) {
    const [detail, tracks] = await Promise.all([
      albumDetail(encryptedId),
      albumTracks(encryptedId).catch(() => [])
    ])
    if (detail?.name) {
      return { source: 'cli', encryptedId, detail, tracks: Array.isArray(tracks) ? tracks : [] }
    }
  }

  const publicData = await publicAlbumDetail(numericId)
  if (!publicData) throw new Error(`网易云没有这张专辑或已下架：${numericId}`)
  const { songs, album } = publicData
  const first = songs[0]
  return {
    source: 'public',
    // 公开接口给不出加密 ID；留空，下次刷新仍走同一套兜底解析
    encryptedId: '',
    detail: {
      id: String(numericId),
      originalId: numericId,
      name: album?.name || name || '',
      coverImgUrl: album?.picUrl || album?.blurPicUrl || '',
      publishTime: album?.publishTime || 0,
      // v1 拿不到专辑简介（这个接口不返回 description），留空由人在 Notion 里写
      description: album?.description || '',
      company: album?.company || '',
      language: album?.language || '',
      artists:
        album?.artists?.map(a => ({ name: a?.name })) ||
        (first?.ar || first?.artists || []).map(a => ({ name: a?.name }))
    },
    tracks: songs
  }
}

function playlistRecords(data) {
  return Array.isArray(data?.records) ? data.records : []
}

/** 我创建的歌单（年度歌单、自建精选都在这里） */
export async function playlistCreated() {
  const data = await withRetry('playlist created', () =>
    runCli(['playlist', 'created', '--limit', '100'])
  )
  return playlistRecords(data)
}

/** 我收藏的歌单（别人建的也算） */
export async function playlistCollected() {
  const data = await withRetry('playlist collected', () =>
    runCli(['playlist', 'collected', '--limit', '100'])
  )
  return playlistRecords(data)
}

export async function searchPlaylist(keyword, { limit = 30 } = {}) {
  const data = await withRetry('search playlist', () =>
    runCli(['search', 'playlist', '--keyword', String(keyword), '--limit', String(limit)])
  )
  return playlistRecords(data)
}

export async function playlistDetail(encryptedId) {
  return withRetry('playlist get', () =>
    runCli(['playlist', 'get', '--playlistId', String(encryptedId)])
  )
}

/** 歌单曲目按 50 首一页取到上限即停：大歌单动辄上千首，全量拉取没有意义 */
export async function playlistTracks(encryptedId, { cap = 60 } = {}) {
  const pageSize = 50
  const tracks = []
  for (let offset = 0; offset < cap; offset += pageSize) {
    const data = await withRetry('playlist tracks', () =>
      runCli([
        'playlist',
        'tracks',
        '--playlistId',
        String(encryptedId),
        '--limit',
        String(Math.min(pageSize, cap)),
        '--offset',
        String(offset)
      ])
    )
    const batch = Array.isArray(data) ? data : data?.records || []
    tracks.push(...batch)
    if (batch.length < pageSize || tracks.length >= cap) break
  }
  return tracks.slice(0, cap)
}

/**
 * 歌单详情 + 曲目。CLI 的 playlist 系列同样只吃加密 ID，
 * 所以先在我创建/收藏里按数字 ID 匹配，再退回搜索。
 */
export async function fetchPlaylist(ref, { name = '', cap = 60 } = {}) {
  const wanted = String(ref || '').trim()
  const lists = await Promise.all([
    playlistCreated().catch(error => {
      console.warn(`[ncm] 创建歌单列表读取失败：${error?.message}`)
      return []
    }),
    playlistCollected().catch(error => {
      console.warn(`[ncm] 收藏歌单列表读取失败：${error?.message}`)
      return []
    })
  ])
  const [created, collected] = lists
  const pool = [
    ...created.map(p => ({ ...p, mine: true })),
    ...collected.map(p => ({ ...p, mine: false }))
  ]

  const byId = pool.find(p => String(p.originalId ?? '') === wanted)
  const byHex = pool.find(p => String(p.id ?? '').toUpperCase() === wanted.toUpperCase())
  let hit = byId || byHex
  if (!hit && name) {
    const found = await searchPlaylist(name).catch(() => [])
    hit = found.find(p => String(p.originalId ?? '') === wanted) || found[0]
  }
  if (!hit?.id) {
    throw new Error(`网易云没有找到这张歌单：${wanted || name}（歌单要先出现在你创建或收藏的列表里）`)
  }

  const detail = await playlistDetail(hit.id).catch(error => {
    throw new Error(`歌单详情取不到：${error?.message}`)
  })
  const tracks = await playlistTracks(hit.id, { cap }).catch(error => {
    console.warn(`[ncm] 歌单曲目读取失败，按空曲目写入：${error?.message}`)
    return []
  })

  return {
    source: hit.mine === false ? 'collected' : 'created',
    encryptedId: hit.id,
    numericId: String(detail?.originalId ?? hit.originalId ?? ''),
    detail: detail || {},
    tracks
  }
}

/** 从网易云网页/分享链接里取 kind + 数字 ID */
export function parseNeteaseRef(input, { type = '' } = {}) {
  const raw = String(input || '').trim()
  if (!raw) return { kind: '', id: '' }

  const numeric = raw.match(/^\d+$/)
  if (numeric) {
    return { kind: type === 'song' ? 'song' : type === 'album' ? 'album' : '', id: raw }
  }

  const kind = raw.match(/\/(album|song|playlist)[/?#]/i)?.[1] || raw.match(/(album|song|playlist)=/i)?.[1] || ''
  const id = raw.match(/[?&#](?:id|song_id|album_id|playlist_id)=(\d+)/i)?.[1] || ''
  if (!kind || !id) return { kind: '', id: '', raw }
  if (kind.toLowerCase() === 'playlist') return { kind: 'playlist', id }
  return { kind: kind.toLowerCase(), id }
}
