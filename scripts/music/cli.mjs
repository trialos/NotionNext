#!/usr/bin/env node
import { ENTRY, KIND, NAMES, P, TYPES, columnOf, contract } from './contract.mjs'
import { loadEnv, missingEnv } from './env.mjs'
import {
  albumCollected,
  fetchAlbum,
  fetchPlaylist,
  parseNeteaseRef,
  playlistCollected,
  playlistCreated,
  publicSongDetail
} from './ncm.mjs'
import {
  normalizeAlbum,
  normalizeNote,
  normalizePlaylist,
  normalizeSingle,
  tracksToggleBlock
} from './normalize.mjs'
import {
  createNotionClient,
  propertyValue
} from './notion.mjs'
import {
  defaultSlug,
  planDelist,
  planUpsert,
  refreshRoute,
  storedTracksState
} from './plan.mjs'
import { musicPaths, revalidateSite } from './revalidate.mjs'

const HELP = `音乐展架本地同步（只手动执行，绝不进站点构建）

用法：
  yarn music:collected [--limit N]        只读：列出网易云收藏专辑，标出哪些已上架
  yarn music:playlists                    只读：列出我创建与我收藏的歌单
  yarn music:add "<专辑或歌单链接/数字ID>"  策展新增/更新一张条目（含曲目块）；--type album|playlist|annual
  yarn music:note "<歌曲链接或数字ID>" --kind single|track [--album "<专辑链接>"]
  yarn music:note "<专辑链接或数字ID>" --kind album
  yarn music:refresh --id <专辑数字ID> | --all
  yarn music:doctor                        只读体检：缺列、重复 ID、孤儿手记

开关：
  --dry-run       只打印将要写入的字段差异，不写 Notion
  --publish       新建行直接置 Published（默认 Invisible：不上架但可 URL 直达预览）
  --revalidate    写完后打线上 /api/revalidate（需 REVALIDATION_TOKEN + SITE_BASE_URL）
  --name "<名字>"  专辑名，收藏列表里找不到时用于搜索兜底
  --env-file <f>  追加一个 env 文件
`

const args = parseArgs(process.argv.slice(2))
const command = args._[0] || 'help'
const flags = args.flags

const log = (...lines) => console.log(...lines)
const warn = msg => console.warn(`[music] ${msg}`)

function fail(msg) {
  const error = new Error(msg)
  error.musicFailure = true
  throw error
}

function parseArgs(argv) {
  const out = { _: [], flags: {} }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      out._.push(token)
      continue
    }
    const key = token.slice(2)
    if (['dry-run', 'publish', 'revalidate', 'all', 'verbose'].includes(key)) {
      out.flags[key] = true
      continue
    }
    out.flags[key] = argv[i + 1]
    i += 1
  }
  return out
}

/** 命令名之后的第一个位置参数 */
function targetArg() {
  return args._.filter(token => token !== command)[0] || ''
}

function readEnv() {
  const files = flags['env-file'] ? [flags['env-file']] : []
  return loadEnv({ envFiles: files, quiet: !flags.verbose })
}

async function openStore() {
  const store = readEnv()
  const dataSourceId =
    store.NOTION_POSTS_DATA_SOURCE_ID || store.NOTION_CONTENT_DATA_SOURCE_ID || ''
  const missing = [...missingEnv(store, ['NOTION_API_TOKEN'])]
  if (!dataSourceId) missing.push('NOTION_POSTS_DATA_SOURCE_ID')
  if (missing.length) {
    fail(
      `缺少本地凭据：${missing.join(', ')}。写进 .env.local（已 gitignore），绝不提交。`
    )
  }
  return {
    store,
    api: createNotionClient({
      token: store.NOTION_API_TOKEN,
      dataSourceId
    })
  }
}

/** 展架只有几十行：一次性读回全部音乐行，比逐个查省请求，也便于查重复 */
async function loadRows(api) {
  const [albums, notes] = await Promise.all([api.findAlbums(), api.findNotes()])
  return { albums, notes }
}

const ncmAlbumIdOf = page => String(propertyValue(page, P.ncmAlbumId) || '')
const ncmSongIdOf = page => String(propertyValue(page, P.ncmSongId) || '')
const kindOf = page => String(propertyValue(page, P.noteKind) || '')
const titleOf = page => String(propertyValue(page, NAMES.title) || '')
const slugOf = page => String(propertyValue(page, NAMES.slug) || '')

function clip(value, max = 60) {
  const text = String(value ?? '').replace(/\s+/g, ' ')
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function describeRow(page) {
  return `${page.id}  ${clip(titleOf(page) || '(无标题)', 30)}  slug=${slugOf(page) || '(空)'}`
}

function pickOne(rows, label) {
  if (rows.length <= 1) return rows[0] || null
  fail(
    `匹配到 ${rows.length} 行「${label}」，脚本不敢猜，请人工删掉多余的：\n  ` +
      rows.map(describeRow).join('\n  ')
  )
}

function printDiff(label, plan) {
  log(`\n[${label}] ${plan.action}`)
  for (const line of plan.warnings || []) warn(line)
  if (!plan.diff.length) {
    log('  无字段变化（0 写入）')
    return
  }
  for (const row of plan.diff) {
    log(`  ${row.column}：${clip(row.from || '(空)')} → ${clip(row.to)}  [${row.reason}]`)
  }
  if (plan.tracks !== 'none') log(`  曲目块：${plan.tracks}`)
}

/**
 * 只有新建行才需要兜标题（Notion 拒绝无标题建行）。
 * 更新时绝不能过这一步：title 不在写入集里 = 空，补上去就会把博主写的标题冲掉。
 */
function ensureCreatedTitle(values) {
  const title = columnOf('title')
  if (!String(values[title] || '').trim()) values[title] = '(未命名音乐)'
  return values
}

async function applyPlan({ api, page, plan }) {
  if (flags['dry-run'] || plan.action === 'skip') {
    return { pageId: page?.id || '', wrote: 0, created: null }
  }

  if (plan.action === 'create') ensureCreatedTitle(plan.values)
  const { properties, skipped } = await api.buildProperties(plan.values)
  for (const line of skipped) warn(`跳过列：${line}`)

  if (plan.action === 'create') {
    if (!Object.keys(properties).length) fail('新建行的属性为空，中止')
    const children = plan.payload ? [tracksToggleBlock(plan.payload)] : []
    const created = await api.createPage({ properties, children })
    log(`  ✓ 已新建（${plan.diff.length} 个字段${children.length ? ' + 曲目块' : ''}）`)
    return { pageId: created.id, wrote: 1, created }
  }

  if (!Object.keys(properties).length) return { pageId: page.id, wrote: 0, created: null }
  await api.updatePage(page.id, { properties })
  log(`  ✓ 已更新 ${clip(titleOf(page), 24)}（${plan.diff.length} 个字段）`)
  return { pageId: page.id, wrote: 1, created: null }
}

/** 曲目块单独一步：新建时已随 children 写入，不再重复请求 */
async function writeTracksBlock({ api, pageId, plan, created }) {
  if (created || flags['dry-run'] || plan.tracks === 'none' || !plan.payload) return
  const result = await api.upsertTracksBlock(pageId, plan.payload)
  log(
    `  ✓ 曲目块${result.action === 'appended' ? '已追加' : '已替换'}（${plan.payload.tracks.length} 首）`
  )
}

async function maybeRevalidate({ albumSlugs = [], noteSlugs = [] }) {
  if (!flags.revalidate) return
  const paths = musicPaths({ albumSlugs, noteSlugs })
  if (paths.length <= 1) return
  const result = await revalidateSite({ env: readEnv(), paths })
  if (result.ok && !result.skipped) log(`  ✓ 已请求刷新 ${paths.length} 个路径`)
  if (result.warning) warn(result.warning)
}

// ---------------------------------------------------------------- 命令

async function cmdCollected() {
  const limit = Number(flags.limit || 0)
  const records = await albumCollected({
    pageSize: 20,
    maxPages: Math.max(1, Math.ceil((limit || 200) / 20))
  })

  let onShelf = new Set()
  try {
    const { api } = await openStore()
    const { albums } = await loadRows(api)
    onShelf = new Set(albums.map(ncmAlbumIdOf))
  } catch (error) {
    warn(`读不到 Notion 已上架状态，只列收藏：${error?.message}`)
  }

  const shown = limit ? records.slice(0, limit) : records
  log(`网易云收藏专辑 ${records.length} 张：`)
  shown.forEach((item, i) => {
    const id = String(item.originalId ?? '')
    const year = item.publishTime ? new Date(item.publishTime).getFullYear() : ''
    const artists = (item.artists || []).map(a => a?.name).filter(Boolean).join(' / ')
    log(
      `  ${String(i + 1).padStart(3)}  ${id.padEnd(12)}${onShelf.has(id) ? ' 已上架 ' : '       '}` +
        `${clip(item.name, 40).padEnd(42)}${clip(artists, 22).padEnd(24)}${year}`
    )
  })
  log('\n上架其中一张：yarn music:add "<专辑链接或数字ID>"')
}

/** 条目类型：显式 --type 优先，否则年度歌单靠标题里的「年度」识别 */
function entryTypeOf(title) {
  const forced = String(flags.type || '').trim()
  if (forced) {
    const map = {
      album: ENTRY.album,
      playlist: ENTRY.playlist,
      annual: ENTRY.annual,
      [ENTRY.album]: ENTRY.album,
      [ENTRY.playlist]: ENTRY.playlist,
      [ENTRY.annual]: ENTRY.annual
    }
    if (map[forced]) return map[forced]
    fail(`--type 只认 album / playlist / annual / ${ENTRY.album} / ${ENTRY.playlist} / ${ENTRY.annual}`)
  }
  return /年度/.test(String(title || '')) ? ENTRY.annual : ENTRY.playlist
}

/** 我创建 + 我收藏的歌单清单：挑歌单上架时看这个 */
async function cmdPlaylists() {
  const [created, collected] = await Promise.all([
    playlistCreated().catch(error => {
      warn(`创建歌单列表读取失败：${error?.message}`)
      return []
    }),
    playlistCollected().catch(error => {
      warn(`收藏歌单列表读取失败：${error?.message}`)
      return []
    })
  ])

  let onShelf = new Set()
  try {
    const { api } = await openStore()
    const { albums } = await loadRows(api)
    onShelf = new Set(albums.map(ncmAlbumIdOf))
  } catch (error) {
    warn(`读不到 Notion 已上架状态，只列歌单：${error?.message}`)
  }

  const print = (label, rows) => {
    log(`\n${label}（${rows.length} 张）：`)
    rows.forEach((item, i) => {
      const id = String(item.originalId ?? '')
      log(
        `  ${String(i + 1).padStart(3)} ${(id || '-').padEnd(12)}` +
          `${onShelf.has(id) && id ? ' 已上架 ' : '       '}` +
          `曲数 ${String(item.trackCount ?? '?').padStart(5)}  ${clip(item.name, 40)}`
      )
    })
  }
  print('我创建的', created)
  print('我收藏的', collected)
  log('\n上架其中一张：把名字或数字ID告诉我，我跑 music:add；年度歌单会自动归入年份带。')
}

async function cmdAdd() {
  const target = targetArg()
  if (!target) fail(`缺少专辑或歌单链接、数字ID。\n\n${HELP}`)
  const parsed = parseNeteaseRef(target, { type: 'album' })
  const isPlaylist =
    parsed.kind === 'playlist' ||
    [ENTRY.playlist, ENTRY.annual].includes(String(flags.type || '').trim())

  const { api } = await openStore()
  const { albums } = await loadRows(api)
  const existing = pickOne(
    albums.filter(row => ncmAlbumIdOf(row) === parsed.id),
    `条目 ${parsed.id}`
  )

  let fetched
  let desired
  if (isPlaylist) {
    log(`拉取网易云歌单 ${parsed.id || clip(target)} …`)
    fetched = await fetchPlaylist(parsed.id || target, {
      name: flags.name || titleOf(existing)
    })
    desired = normalizePlaylist({
      ...fetched,
      playlistId: fetched.numericId,
      entryType: entryTypeOf(fetched.detail?.name)
    })
  } else {
    if (parsed.kind === 'song') fail('这是单曲链接：yarn music:note "<歌曲链接>" --kind single')
    if (!parsed.id) fail(`识别不出专辑 ID：${clip(target)}`)
    log(`拉取网易云专辑 ${parsed.id} …`)
    fetched = await fetchAlbum(parsed.id, {
      name: flags.name || titleOf(existing)
    })
    desired = normalizeAlbum({
      detail: fetched.detail,
      tracks: fetched.tracks,
      encryptedId: fetched.encryptedId
    })
  }
  for (const line of desired.warnings || []) warn(line)
  if (!desired.albumId) fail('网易云返回里没有数字 ID，中止（不写半行数据）')

  const block = existing ? await api.findTracksBlock(existing.id) : null
  const plan = planUpsert({
    page: existing,
    desired: { ...desired, slug: defaultSlug(TYPES.album, desired.albumId) },
    tracksBlockText: block?.text || '',
    publish: Boolean(flags.publish)
  })

  log(`《${clip(desired.title, 40)}》来源 ${fetched.source}，曲目 ${desired.payload.tracks.length} 首`)
  printDiff(`add ${desired.albumId}`, plan)
  if (flags['dry-run']) {
    log('\n--dry-run：未写入。')
    return
  }

  const applied = await applyPlan({ api, page: existing, plan })
  await writeTracksBlock({ ...applied, api, plan })

  const slug = slugOf(existing) || plan.values[NAMES.slug] || defaultSlug(TYPES.album, desired.albumId)
  if (applied.wrote) maybeRevalidate({ albumSlugs: [slug] })
}

async function cmdNote() {
  const kind = String(flags.kind || '').toLowerCase()
  if (!['single', 'track', 'album'].includes(kind)) {
    fail(`--kind 只能是 single / track / album。\n\n${HELP}`)
  }
  const target = targetArg()
  if (!target) fail(`缺少链接或数字ID。\n\n${HELP}`)

  const { api } = await openStore()
  const { albums, notes } = await loadRows(api)

  let desired
  let matches
  const noteKind = kind === 'album' ? KIND.album : kind === 'track' ? KIND.track : KIND.single

  if (kind === 'album') {
    const parsed = parseNeteaseRef(target, { type: 'album' })
    if (!parsed.id || parsed.kind === 'playlist') fail('认不出这张专辑的链接')
    log(`拉取网易云专辑 ${parsed.id} …`)
    const fetched = await fetchAlbum(parsed.id, { name: flags.name || '' })
    desired = normalizeNote({ kind: KIND.album, album: fetched.detail })
    matches = notes.filter(
      row => kindOf(row) === KIND.album && ncmAlbumIdOf(row) === String(desired.albumId || parsed.id)
    )
    if (!albums.some(row => ncmAlbumIdOf(row) === desired.properties[P.ncmAlbumId])) {
      warn('这张专辑还没上架：手记可以先建，专辑页要等 yarn music:add。')
    }
  } else {
    const parsed = parseNeteaseRef(target, { type: 'song' })
    if (!parsed.id || parsed.kind === 'playlist') fail('认不出这首歌的链接（单曲走公开接口）')
    const song = await publicSongDetail(parsed.id)
    if (!song) fail(`网易云取不到这首歌：${parsed.id}`)
    desired =
      kind === 'single'
        ? normalizeSingle({ song })
        : normalizeNote({ kind: KIND.track, song })

    if (flags.album) {
      const override = parseNeteaseRef(flags.album, { type: 'album' })
      if (!override.id) fail(`--album 认不出专辑 ID：${clip(flags.album)}`)
      // 同一首歌在网易云常挂多个版本专辑，允许人工指定归属
      desired.properties[P.ncmAlbumId] = override.id
    }
    matches = notes.filter(
      row => kindOf(row) === noteKind && ncmSongIdOf(row) === String(desired.songId)
    )
  }

  const existing = pickOne(matches, `${noteKind} 手记（${desired.songId || desired.albumId}）`)
  const slugSeed = defaultSlug(TYPES.note, desired.songId || desired.albumId)
  const plan = planUpsert({
    page: existing,
    desired: { ...desired, slug: slugSeed },
    publish: Boolean(flags.publish)
  })

  printDiff(`note:${noteKind} ${desired.songId || desired.albumId}`, plan)
  if (flags['dry-run']) {
    log('\n--dry-run：未写入。')
    return
  }

  const applied = await applyPlan({ api, page: existing, plan })
  await writeTracksBlock({ ...applied, api, plan })
  if (applied.wrote) maybeRevalidate({ noteSlugs: [slugOf(existing) || plan.values[NAMES.slug] || slugSeed] })
  if (!existing) log('\n接下来在 Notion 里写正文，把 status 改成 Published 才会上架。')
}

/**
 * 行里的条目类型决定走哪条取数路径：歌单与年度歌单在网易云是**另一个接口**，
 * 拿专辑接口去查歌单会得到「没有这张专辑」—— 那不是下架信号。
 */
function entryTypeOfRow(row) {
  const stored = String(propertyValue(row, P.entryType) || '').trim()
  if (stored === ENTRY.playlist || stored === ENTRY.annual) return stored
  return ENTRY.album
}

async function fetchDesired(row, albumId, title) {
  const route = refreshRoute(entryTypeOfRow(row))
  if (route.source === 'playlist') {
    const fetched = await fetchPlaylist(albumId, { name: title })
    return normalizePlaylist({
      ...fetched,
      playlistId: fetched.numericId,
      entryType: entryTypeOfRow(row)
    })
  }
  const fetched = await fetchAlbum(albumId, { name: title })
  return normalizeAlbum({
    detail: fetched.detail,
    tracks: fetched.tracks,
    encryptedId: fetched.encryptedId
  })
}

async function cmdRefresh() {
  const { api } = await openStore()
  const { albums } = await loadRows(api)
  const only = flags.id ? String(flags.id) : ''
  if (!only && !flags.all) fail('刷新全部专辑要显式加 --all，避免手一抖把整架重跑一遍。')

  const targets = only ? albums.filter(row => ncmAlbumIdOf(row) === only) : albums
  if (!targets.length) {
    fail(`没有匹配到专辑行${only ? `（${P.ncmAlbumId}=${only}）` : ''}，先 yarn music:add 一张。`)
  }

  const touched = []
  for (const row of targets) {
    const albumId = ncmAlbumIdOf(row)
    const title = titleOf(row)
    try {
      log(`\n刷新《${clip(title, 30)}》(${albumId}) …`)
      const desired = await fetchDesired(row, albumId, title)
      const block = await api.findTracksBlock(row.id)
      const plan = planUpsert({
        page: row,
        desired: { ...desired, slug: defaultSlug(TYPES.album, desired.albumId) },
        tracksBlockText: block?.text || ''
      })
      printDiff(`refresh ${albumId}`, plan)
      const applied = await applyPlan({ api, page: row, plan })
      await writeTracksBlock({ ...applied, api, plan })
      if (applied.wrote) touched.push(slugOf(row))
    } catch (error) {
      // 只有上游确实消失才下架；网络抖动、超时都不改状态。
      // 歌单一律不自动下架：取数路径不同、也可能只是没出现在「我创建/我收藏」的列表里，
      // 那是取数问题不是下架信号 —— 歌单下架请人工在 Notion 勾「已下架」。
      const route = refreshRoute(entryTypeOfRow(row))
      const upstreamGone =
        route.autoDelist &&
        /没有这张专辑或已下架|not found|不存在/i.test(error?.message || '')
      if (upstreamGone) {
        const plan = planDelist({ page: row, reason: error.message })
        printDiff(`delist ${albumId}`, plan)
        const applied = await applyPlan({ api, page: row, plan })
        if (applied.wrote) touched.push(slugOf(row))
      } else {
        warn(`跳过《${clip(title, 24)}》：${error?.message}`)
      }
    }
  }

  if (touched.filter(Boolean).length) maybeRevalidate({ albumSlugs: touched.filter(Boolean) })
  else log('\n全部行都是 0 写入。')
}

const REQUIRED_COLUMNS = [
  NAMES.type,
  NAMES.status,
  NAMES.title,
  NAMES.slug,
  NAMES.summary,
  NAMES.featured,
  contract.seedColumns.description,
  ...Object.values(P)
]

/** 站点用 getPageProperties 解析列，它不认 url/number/relation 列 */
const EXPECTED_COLUMN_TYPES = [
  [P.entryType, 'select'],
  [P.ncmAlbumId, 'rich_text'],
  [P.ncmSongId, 'rich_text'],
  [P.ncmEncryptedId, 'rich_text'],
  [P.syncHash, 'rich_text'],
  [P.trackCount, 'rich_text'],
  [P.shelfOrder, 'rich_text'],
  [P.delisted, 'checkbox'],
  [P.releaseDate, 'date'],
  [P.lastSyncedAt, 'date'],
  [P.noteKind, 'select']
].filter(([, expect]) => expect)

async function cmdDoctor() {
  const { api } = await openStore()
  const problems = []
  const notices = []

  const check = await api.checkSchema({
    required: REQUIRED_COLUMNS,
    selectOptions: {
      [NAMES.type]: [TYPES.album, TYPES.note],
      [P.noteKind]: [KIND.album, KIND.single, KIND.track],
      [P.entryType]: Object.values(ENTRY)
    }
  })
  for (const name of check.missing) problems.push(`缺列：${name}`)
  for (const line of check.badOptions) problems.push(`缺选项：${line}`)
  if (check.ok) notices.push('列与选项齐全')

  const { albums, notes } = await loadRows(api)
  notices.push(`专辑行 ${albums.length}，手记行 ${notes.length}`)

  for (const [name, expect] of EXPECTED_COLUMN_TYPES) {
    const actual = check.schema?.[name]?.type
    if (actual && actual !== expect) {
      problems.push(`「${name}」列类型是 ${actual}，站点按 ${expect} 解析`)
    }
  }

  for (const [label, rows, keyOf] of [
    ['专辑', albums, ncmAlbumIdOf],
    ['手记', notes, page => `${kindOf(page)}|${ncmSongIdOf(page) || ncmAlbumIdOf(page)}`]
  ]) {
    const seen = new Set()
    for (const row of rows) {
      const value = keyOf(row)
      if (!value) {
        problems.push(`${label}行缺网易云 ID，脚本无法匹配：${describeRow(row)}`)
        continue
      }
      if (seen.has(value)) problems.push(`${label} ID 重复：${value} → ${describeRow(row)}`)
      else seen.add(value)
    }
  }

  const slugs = new Set()
  for (const row of [...albums, ...notes]) {
    const slug = slugOf(row)
    if (!slug) problems.push(`缺 slug（不会进入站点数据）：${describeRow(row)}`)
    else if (slugs.has(slug)) problems.push(`slug 重复：${slug}`)
    else slugs.add(slug)

    if (!String(propertyValue(row, NAMES.status) || '')) {
      problems.push(`缺 status（不会进入站点数据）：${describeRow(row)}`)
    }
    if (String(propertyValue(row, NAMES.type) || '') === TYPES.note && !kindOf(row)) {
      problems.push(`手记缺「${P.noteKind}」，展架与曲目行都挂不上：${describeRow(row)}`)
    }
  }

  const albumIds = new Set(albums.map(ncmAlbumIdOf))
  const albumNoteCount = new Map()
  for (const row of notes) {
    const albumId = ncmAlbumIdOf(row)
    if (albumId && !albumIds.has(albumId)) {
      notices.push(
        `孤儿手记（所属专辑未上架）：《${clip(titleOf(row), 24)}》→ 专辑 ${albumId}`
      )
    }
    if (kindOf(row) === KIND.album && albumId) {
      albumNoteCount.set(albumId, (albumNoteCount.get(albumId) || 0) + 1)
    }
  }
  for (const [albumId, count] of albumNoteCount) {
    if (count > 1) problems.push(`专辑 ${albumId} 有 ${count} 篇专辑手记，专辑页只取最新一篇`)
  }

  for (const row of albums) {
    const title = clip(titleOf(row), 24)
    if (propertyValue(row, P.delisted) === true) {
      notices.push(`已下架：《${title}》（专辑页 404，手记仍可直达）`)
    }
    const block = await api.findTracksBlock(row.id)
    if (!block) {
      problems.push(`《${title}》缺曲目块：再跑一次 yarn music:add 同一张专辑即可补写`)
      continue
    }
    const stored = storedTracksState(block.text)
    if (stored.status !== 'stored') {
      problems.push(
        `《${title}》曲目块${stored.status === 'invalid' ? '解析失败' : '为空'}：yarn music:refresh --id ${ncmAlbumIdOf(row)}`
      )
    }
  }

  log('体检结果：')
  for (const line of notices) log(`  · ${line}`)
  for (const line of problems) log(`  ✗ ${line}`)
  if (!problems.length) log('  ✓ 没有需要处理的问题')
  log('\n提醒：菜单要有 /music 这一行；站点所选 Notion 视图不能按 type 过滤掉音乐行。')
  if (problems.length) process.exitCode = 1
}

// ---------------------------------------------------------------- 入口

const COMMANDS = {
  collected: cmdCollected,
  playlists: cmdPlaylists,
  add: cmdAdd,
  note: cmdNote,
  refresh: cmdRefresh,
  doctor: cmdDoctor
}

async function main() {
  const run = COMMANDS[command]
  if (!run) {
    log(HELP)
    if (command !== 'help') fail(`未知命令：${command}`)
    return
  }
  try {
    await run()
  } catch (error) {
    if (error?.message) console.error(`[music] ${error.message}`)
    process.exitCode = 1
  }
}

main()
