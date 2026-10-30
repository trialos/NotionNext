import contract from './contract.json'
import { neteaseSongUrl, numericId } from './paths'

const SCHEMA = contract.schema
const VERSION = contract.version

function blockValue(entry) {
  return entry?.value?.value || entry?.value || null
}

/** Notion v3 文本属性：[["文字",[["b"]]], ...] */
function textOf(segments) {
  if (!Array.isArray(segments)) return ''
  return segments
    .map(seg => (Array.isArray(seg) ? String(seg[0] ?? '') : String(seg ?? '')))
    .join('')
}

function cleanTitle(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function cleanArtists(value) {
  const list = Array.isArray(value) ? value : value ? [value] : []
  const seen = new Set()
  const out = []
  for (const raw of list) {
    const name = cleanTitle(typeof raw === 'string' ? raw : raw?.name)
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

function cleanCover(value) {
  const url = String(value ?? '').trim()
  if (!/^https?:\/\//i.test(url)) return ''
  return url.replace(/^http:/i, 'https:')
}

function cleanIndex(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export function normalizeTracks(list) {
  if (!Array.isArray(list)) return []
  const seen = new Set()
  const tracks = []
  list.forEach((raw, i) => {
    if (!raw || typeof raw !== 'object') return
    const title = cleanTitle(raw.title ?? raw.name)
    if (!title) return
    const id = numericId(raw.id ?? raw.ncmId ?? raw.songId)
    const key = id || `t:${title}:${i}`
    if (seen.has(key)) return
    seen.add(key)
    const duration = Number(raw.duration)
    tracks.push({
      id,
      title,
      artists: cleanArtists(raw.artists ?? raw.artist),
      duration: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 0,
      disc: cleanIndex(raw.disc),
      no: cleanIndex(raw.no),
      cover: cleanCover(raw.cover ?? raw.coverUrl),
      url: cleanCover(raw.url) || (id ? neteaseSongUrl(id) : ''),
      mvId: id && raw.mvId ? String(raw.mvId) : null
    })
  })

  const sortable = tracks.every(t => t.disc !== null && t.no !== null)
  if (sortable) {
    tracks.sort((a, b) => a.disc - b.disc || a.no - b.no)
  }
  return tracks.map((t, i) => ({ ...t, index: i + 1 }))
}

/**
 * 解析曲目 JSON。返回 { status, payload, error }
 * status: 'ok' | 'empty'（无块/无内容） | 'invalid'（解析或契约失败，页面降级空态）
 */
export function parseTracksPayload(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return { status: 'empty', payload: null, error: '' }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    return { status: 'invalid', payload: null, error: error?.message || 'JSON 解析失败' }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { status: 'invalid', payload: null, error: '顶层不是对象' }
  }
  if (parsed.schema !== SCHEMA) {
    return { status: 'invalid', payload: null, error: `schema 不匹配：${parsed.schema}` }
  }
  if (Number(parsed.v) !== VERSION) {
    return { status: 'invalid', payload: null, error: `不支持的版本：${parsed.v}` }
  }

  const tracks = normalizeTracks(parsed.tracks)
  if (!tracks.length) {
    return { status: 'invalid', payload: null, error: 'tracks 为空或全部非法' }
  }

  // total / truncated 是脚本写的「上游真实条数」：大歌单只存前 60 首，
  // 页面要能诚实说明列了前多少、一共多少
  const total = Number(parsed.total)
  return {
    status: 'ok',
    payload: {
      schema: SCHEMA,
      v: VERSION,
      kind: parsed.kind === 'playlist' ? 'playlist' : 'album',
      albumId: numericId(parsed.albumId),
      syncedAt: String(parsed.syncedAt || ''),
      total: Number.isFinite(total) && total > 0 ? total : tracks.length,
      truncated: Boolean(parsed.truncated),
      tracks
    },
    error: ''
  }
}

function codeTextOf(block) {
  const props = block?.properties || {}
  return textOf(props.title ?? props.code ?? props.source)
}

function isCodeBlock(block) {
  return block?.type === 'code'
}

/**
 * 在专辑页 blockMap 里找曲目块：先直接子级（含折叠 toggle 的一层子级），
 * 找不到再全量兜底扫描 —— 按 JSON 里的 schema 标记认，不依赖 toggle 标题。
 */
export function findTracksBlock(blockMap, pageId) {
  const blocks = blockMap?.block || {}
  const page = blockValue(blocks[pageId])
  if (!page) return { status: 'empty', payload: null, error: '' }

  const directIds = Array.isArray(page.content) ? page.content : []
  const candidates = []
  for (const id of directIds) {
    const block = blockValue(blocks[id])
    if (!block) continue
    if (isCodeBlock(block)) candidates.push({ id, block })
    if (block.type === 'toggle' && Array.isArray(block.content)) {
      for (const childId of block.content) {
        const child = blockValue(blocks[childId])
        if (child && isCodeBlock(child)) candidates.push({ id: childId, block: child })
      }
    }
  }

  const scanList = candidates.length
    ? candidates
    : Object.keys(blocks)
        .map(id => ({ id, block: blockValue(blocks[id]) }))
        .filter(item => item.block && isCodeBlock(item.block))

  for (const { id, block } of scanList) {
    const result = parseTracksPayload(codeTextOf(block))
    if (result.status === 'ok') return { ...result, blockId: id }
    if (result.status === 'invalid') return { ...result, blockId: id }
  }

  return { status: 'empty', payload: null, error: '' }
}

/** 毫秒 → 3:42 / 1:02:11；拿不到时长就留空，不显示 0:00 这种假值 */
export function formatDuration(ms) {
  const total = Math.round(Number(ms) / 1000)
  if (!Number.isFinite(total) || total <= 0) return ''
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = n => String(n).padStart(2, '0')
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

export { SCHEMA, VERSION, textOf as richTextOf }
