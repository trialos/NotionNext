import { ENTRY, NAMES, P, columnOf, contract } from './contract.mjs'
import { syncHash } from './normalize.mjs'
import { isEmptyValue, propertyValue } from './notion.mjs'

const TYPES = contract.types

/**
 * 列归属表：这是「脚本能改什么」的唯一答案。
 * machine 每次刷新按上游覆盖；seed 只在当前为空时写一次，之后归人。
 */
export const MACHINE = [
  P.artistLine,
  P.coverUrl,
  P.releaseDate,
  P.label,
  P.language,
  P.trackCount,
  P.ncmAlbumId,
  P.ncmSongId,
  P.ncmEncryptedId,
  P.neteaseUrl,
  P.delisted,
  P.syncHash,
  P.lastSyncedAt
]

export const SEED = [
  P.entryType, // 建行的那次推断，之后归人：他改类型不该被下次 refresh 冲掉
  NAMES.title,
  NAMES.slug,
  NAMES.summary,
  contract.seedColumns.description,
  NAMES.status,
  NAMES.featured,
  P.coverOverride,
  P.shelfOrder,
  P.noteKind,
  P.noteAlbumTitle,
  P.noteSongTitle
]

const machineSet = new Set(MACHINE)

export function isMachineColumn(column) {
  return machineSet.has(column)
}

/** Notion 值与脚本值比较前先归一：日期取 start、其余转字符串 */
export function comparable(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object' && !Array.isArray(value)) {
    return String(value.start ?? value.start_date ?? '').trim()
  }
  return String(value).trim()
}

/**
 * 代码块里曲目载荷的状态。
 * 是否「变过」靠重算哈希判断，而不是比 syncedAt——否则每次刷新都算变了，
 * 白写一次 Notion 会把站点的 block 缓存整体弄失效。
 */
export function storedTracksState(text) {
  if (!text) return { status: 'missing', hash: '' }
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    return { status: 'invalid', hash: '' }
  }
  if (payload?.schema !== contract.schema || payload?.v !== contract.version) {
    return { status: 'invalid', hash: '' }
  }
  return { status: 'stored', hash: syncHash(payload), payload }
}

/** slug 种子：数字 ID 稳定、不会和博文撞名；人在 Notion 里改成可读 slug 后脚本不再动它 */
export function defaultSlug(kind, id) {
  const text = String(id ?? '').trim()
  // 只接纯数字：加密 ID 是十六进制，抠掉字母会拼出一个假 ID
  if (!/^\d+$/.test(text)) return ''
  return kind === TYPES.album ? `album-${text}` : `note-${text}`
}

export function isoDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function wantedColumns(desired) {
  const out = { ...desired.properties }
  for (const [key, value] of Object.entries(desired.seeds || {})) {
    out[columnOf(key)] = value
  }
  if (desired.slug) out[NAMES.slug] = desired.slug
  return out
}

/**
 * 生成写入计划（纯函数，不碰网络）：
 * create 建新行；update 只写 diff 里的列；skip 表示 0 写入。
 */
export function planUpsert({
  page = null,
  desired,
  tracksBlockText = '',
  publish = false,
  now = new Date()
} = {}) {
  if (!desired?.type) throw new Error('planUpsert 需要 desired.type')

  const values = {}
  const diff = []
  const warnings = []
  const wanted = wantedColumns(desired)
  const current = column => propertyValue(page, column)

  if (!page) {
    values[NAMES.type] = desired.type
    values[NAMES.status] = publish ? 'Published' : 'Invisible'
    for (const [column, value] of Object.entries(wanted)) {
      if (column === NAMES.status || isEmptyValue(value)) continue
      values[column] = value
      diff.push({ column, from: '', to: comparable(value), reason: '新建' })
    }
    if (desired.hash) values[P.syncHash] = desired.hash
    values[P.lastSyncedAt] = isoDate(now)
    if (!values[NAMES.slug]) {
      warnings.push(`未生成 slug：${desired.type} 没有 slug 不会进入站点数据`)
    }
    return {
      action: 'create',
      values,
      diff,
      warnings,
      tracks: desired.payload ? 'append' : 'none',
      payload: desired.payload || null
    }
  }

  const existingType = comparable(current(NAMES.type))
  if (existingType && existingType !== desired.type) {
    warnings.push(
      `匹配到的行 type 是「${existingType}」，与本次的「${desired.type}」不一致，请人工确认`
    )
  }

  const existingHash = comparable(current(P.syncHash))

  for (const [column, value] of Object.entries(wanted)) {
    if (column === NAMES.status || column === NAMES.type) continue
    const before = current(column)

    if (isMachineColumn(column)) {
      if (isEmptyValue(value) || comparable(before) === comparable(value)) continue
      values[column] = value
      diff.push({
        column,
        from: comparable(before),
        to: comparable(value),
        reason: '机器字段'
      })
      continue
    }

    // 人字段：只在当前为空时种子，绝不覆盖
    if (!isEmptyValue(before) || isEmptyValue(value)) continue
    values[column] = value
    diff.push({ column, from: '', to: comparable(value), reason: '种子' })
  }

  let tracks = 'none'
  if (desired.payload) {
    const stored = storedTracksState(tracksBlockText)
    if (stored.status === 'missing') tracks = 'append'
    else if (stored.status === 'invalid') tracks = 'replace'
    else if (stored.hash !== desired.hash || existingHash !== desired.hash) {
      tracks = 'write'
    }
  }

  if (tracks !== 'none') {
    values[P.syncHash] = desired.hash || ''
    diff.push({
      column: P.syncHash,
      from: existingHash,
      to: desired.hash || '',
      reason:
        tracks === 'append'
          ? '曲目块缺失，补写'
          : tracks === 'replace'
            ? '曲目块内容无法解析，重写'
            : '曲目变化'
    })
  }

  if (!Object.keys(values).length) {
    return { action: 'skip', values: {}, diff: [], warnings, tracks: 'none', payload: null }
  }

  values[P.lastSyncedAt] = isoDate(now)
  diff.push({
    column: P.lastSyncedAt,
    from: '',
    to: isoDate(now),
    reason: '记录（不参与是否有变化的判断）'
  })

  return { action: 'update', values, diff, warnings, tracks, payload: tracks === 'none' ? null : desired.payload }
}

/**
 * 刷新一条行时走哪条取数路径，以及出错了能不能自动下架。
 *
 * 歌单与年度歌单在网易云是**另一个接口**：拿专辑接口查歌单只会得到
 * 「没有这张专辑」—— 那是取数路径错了，不是下架。
 * 歌单也不自动下架：它可能只是没出现在「我创建 / 我收藏」的列表里，
 * 那是取数问题，下架要人工在 Notion 勾「已下架」。
 */
export function refreshRoute(entryType) {
  const type = String(entryType || '').trim()
  if (type === ENTRY.playlist || type === ENTRY.annual) {
    return { source: 'playlist', autoDelist: false }
  }
  return { source: 'album', autoDelist: true }
}

/** 上游确认消失：只置「已下架」，绝不删行、绝不归档 */
export function planDelist({ page = null, reason = '' } = {}) {  if (!page) return { action: 'skip', values: {}, diff: [], warnings: ['行不存在'] }
  const column = P.delisted
  if (propertyValue(page, column) === true) {
    return { action: 'skip', values: {}, diff: [], warnings: [] }
  }
  return {
    action: 'update',
    values: { [column]: true, [P.lastSyncedAt]: isoDate() },
    diff: [
      { column, from: 'false', to: 'true', reason: reason || '上游确认消失' }
    ],
    warnings: [],
    tracks: 'none',
    payload: null
  }
}
