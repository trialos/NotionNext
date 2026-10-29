import { fetchNotionPageBlocks, formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { idToUuid } from 'notion-utils'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { findTracksBlock } from './tracks'

const EMPTY = { status: 'empty', payload: null, error: '', blockId: '' }

function toUuid(id) {
  let pageId = id
  if (checkStrIsNotionId(pageId)) pageId = idToUuid(pageId)
  return checkStrIsUuid(pageId) ? pageId : ''
}

/** 块缓存版本：行被编辑过就要重拉，避免刷新后仍端出旧曲目 */
function cacheVersionOf(page) {
  return (
    page?.lastEditedDate ||
    page?.lastEditedDay ||
    page?.date?.start_date ||
    page?.publishDay ||
    ''
  )
}

/**
 * 读专辑页正文里的曲目块（折叠 toggle 内的 JSON 代码块）。
 * 任何失败都降级成空态：曲目缺失不该把专辑页打成 404，更不该炸构建。
 */
export async function loadAlbumTracks(page, options = {}) {
  const pageId = toUuid(page?.id)
  if (!pageId) return { ...EMPTY }

  try {
    const raw = await fetchNotionPageBlocks(pageId, options.from || 'music-album', {
      cacheVersion: options.cacheVersion || cacheVersionOf(page),
      ...options
    })
    if (!raw) return { ...EMPTY }
    const adapted = adapterNotionBlockMap(raw)
    const blockMap = { ...adapted, block: formatNotionBlock(adapted.block) }
    const result = findTracksBlock(blockMap, pageId)
    return { ...result, blockId: result.blockId || '' }
  } catch (error) {
    console.warn('[music] 曲目块读取失败:', page?.id, error?.message)
    return { ...EMPTY, error: error?.message || '' }
  }
}

/** 手记正文：与文章页同一套 blockMap 适配，直接喂给 NotionPage */
export async function loadNoteBlockMap(page, options = {}) {
  const pageId = toUuid(page?.id)
  if (!pageId) return null

  try {
    const raw = await fetchNotionPageBlocks(pageId, options.from || 'music-note', {
      cacheVersion: options.cacheVersion || cacheVersionOf(page),
      ...options
    })
    if (!raw) return null
    const adapted = adapterNotionBlockMap(raw)
    return { ...adapted, block: formatNotionBlock(adapted.block) }
  } catch (error) {
    console.warn('[music] 手记正文读取失败:', page?.id, error?.message)
    return null
  }
}
