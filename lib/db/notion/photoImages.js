import { fetchNotionPageBlocks, formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { buildImageSources } from '@/themes/circlelife/components/imageSrcset'
import { idToUuid } from 'notion-utils'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { extractImagesFromBlockMap } from '@/themes/circlelife/components/extractPhotoImages'

/**
 * 拉取单个 Photo 页的正文图片（页面封面优先，其后按正文顺序）
 * 影集页与首页影集轮共用；失败返回 []，由调用方降级
 */
export async function loadPhotoImages(page, options = {}) {
  try {
    let pageId = page.id
    if (checkStrIsNotionId(pageId)) pageId = idToUuid(pageId)
    if (!checkStrIsUuid(pageId)) return []

    const cacheVersion =
      options.cacheVersion ||
      page.lastEditedDate ||
      page.lastEditedTime ||
      page.last_edited_time ||
      page.lastEditedDay ||
      page.date?.start_date ||
      page.publishDay ||
      ''
    const raw = await fetchNotionPageBlocks(pageId, 'album', { cacheVersion, ...options })
    if (!raw) return []
    const blockMap = adapterNotionBlockMap(raw)
    if (blockMap?.block) {
      blockMap.block = formatNotionBlock(blockMap.block)
    }
    return extractImagesFromBlockMap(blockMap, pageId, page)
  } catch (e) {
    console.warn('[photoImages] extract images failed', page?.id, e?.message)
    return []
  }
}

const HOME_COVER_ALIAS = 'homecover'

const normalizeText = value =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const normalizePageId = value => normalizeText(value).replace(/-/g, '')

const matchesHomeCoverAlias = page =>
  normalizeText(page?.type) === HOME_COVER_ALIAS ||
  normalizeText(page?.title) === HOME_COVER_ALIAS ||
  normalizeText(page?.slug) === HOME_COVER_ALIAS

/**
 * 首页首屏照片墙图源：解析 HomeCover 页并取其正文图片
 *
 * 识别顺序（短路）：显式 pageId → type/title/slug 等于 homecover → 返回 []
 * 显式 pageId 仅来自服务端环境变量，仓库内不保存任何 Notion 页面 ID
 * 未命中时不构造伪造页面，避免无意义的 Notion 请求
 *
 * 取图档位由 buildImageSources 统一决定（512/1024 两档候选），不再接受写死的宽度，
 * 避免又滑回 2048 档（651KB/张、解码位图 12.6MB+）
 *
 * @param {Array} pages 全站页面列表（通常是 allPages）
 * @param {{ pageId?: string }} options
 * @returns {Promise<Array<{ id: string, src: string, srcSet: string, sizes: string, aspectRatio: number, title: string }>>}
 */
export async function resolveHomeCoverImages(pages = [], options = {}) {
  const { pageId } = options
  const list = Array.isArray(pages) ? pages.filter(Boolean) : []
  const targetId = normalizePageId(pageId)

  let matched = []
  if (targetId) {
    matched = list.filter(page => normalizePageId(page?.id) === targetId)
    // 页面可能处于草稿（Invisible）状态而不在 allPages 中，此时按 ID 直接拉取
    if (!matched.length) {
      matched = [{ id: pageId, title: HOME_COVER_ALIAS }]
    }
  }

  if (!matched.length) {
    matched = list.filter(matchesHomeCoverAlias)
  }

  if (!matched.length) {
    console.warn(
      '[photoImages] home cover page not found (expect type/title/slug = homecover)'
    )
    return []
  }

  const images = []
  for (const page of matched) {
    const imgs = await loadPhotoImages(page)
    imgs.forEach(im => {
      if (!im?.url) return
      const sources = buildImageSources(im.url)
      if (!sources.src) return
      images.push({
        id: im.id || im.url,
        src: sources.src,
        srcSet: sources.srcSet,
        sizes: sources.sizes,
        aspectRatio: im.aspectRatio || 1.333,
        title: im.caption || page.title || ''
      })
    })
  }
  return images
}
