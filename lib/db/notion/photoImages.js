import { fetchNotionPageBlocks, formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { idToUuid } from 'notion-utils'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { extractImagesFromBlockMap } from '@/themes/circlelife/components/extractPhotoImages'

/**
 * 拉取单个 Photo 页的正文图片（页面封面优先，其后按正文顺序）
 * 影集页与首页影集轮共用；失败返回 []，由调用方降级
 */
export async function loadPhotoImages(page) {
  try {
    let pageId = page.id
    if (checkStrIsNotionId(pageId)) pageId = idToUuid(pageId)
    if (!checkStrIsUuid(pageId)) return []

    const raw = await fetchNotionPageBlocks(pageId, 'album')
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
