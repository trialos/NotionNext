import { mapImgUrl } from '@/lib/db/notion/mapImage'

/**
 * 从 Notion blockMap 提取图片（正文 image 块 + 可选封面）
 * @param {object} blockMap
 * @param {string} pageId uuid
 * @param {object} [pageMeta] 含 pageCover 等
 * @returns {{ id: string, url: string, caption: string }[]}
 */
export function extractImagesFromBlockMap(blockMap, pageId, pageMeta = {}) {
  const images = []
  const seen = new Set()
  const blocks = blockMap?.block || {}

  const push = (id, url, caption = '') => {
    if (!url || seen.has(url)) return
    seen.add(url)
    images.push({ id: id || url, url, caption: caption || '' })
  }

  // 1) page cover first (if any)
  const cover =
    pageMeta.pageCoverThumbnail ||
    pageMeta.pageCover ||
    pageMeta.page_cover ||
    ''
  if (cover) {
    push(`cover-${pageId}`, cover, '')
  }

  // 2) walk page content order
  const pageBlock = blocks[pageId]?.value
  const contentIds = Array.isArray(pageBlock?.content)
    ? pageBlock.content
    : Object.keys(blocks)

  const parseCaption = block => {
    if (!block?.properties?.caption) return ''
    const segs = block.properties.caption
    const text = Array.isArray(segs)
      ? segs.map(part => (Array.isArray(part) ? part[0] : (part || ''))).join('')
      : String(segs || '')
    // 排除自动上传时带入的文件名
    return /\.(jpe?g|png|gif|webp|heic|avif)$/i.test(text.trim()) ? '' : text.trim()
  }

  for (const id of contentIds) {
    const block = blocks[id]?.value
    if (!block || block.type !== 'image') continue

    const source =
      block.properties?.source?.[0]?.[0] ||
      block.format?.display_source ||
      block.format?.source ||
      ''
    // needCompress=false 尽量保留清晰度
    const url = mapImgUrl(source, block, 'block', false)
    const caption = parseCaption(block)
    push(id, url, caption)
  }

  // 3) fallback scan all blocks if content empty
  if (images.length <= (cover ? 1 : 0)) {
    for (const id of Object.keys(blocks)) {
      const block = blocks[id]?.value
      if (!block || block.type !== 'image') continue
      const source =
        block.properties?.source?.[0]?.[0] ||
        block.format?.display_source ||
        ''
      const url = mapImgUrl(source, block, 'block', false)
      const caption = parseCaption(block)
      push(id, url, caption)
    }
  }

  return images
}
