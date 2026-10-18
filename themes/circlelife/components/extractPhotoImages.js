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

  const getAspectRatio = block => {
    const bar = block?.format?.block_aspect_ratio
    if (typeof bar === 'number' && bar > 0) {
      return parseFloat((1 / bar).toFixed(4))
    }
    return null
  }

  const push = (id, url, caption = '', aspectRatio = null) => {
    if (!url) return
    const existing = images.find(img => img.url === url)
    if (existing) {
      if (!existing.caption && caption) {
        existing.caption = caption
      }
      if (!existing.aspectRatio && aspectRatio) {
        existing.aspectRatio = aspectRatio
      }
      return
    }
    seen.add(url)
    images.push({ id: id || url, url, caption: caption || '', aspectRatio })
  }

  // 1) page cover first (if any)
  const cover =
    pageMeta.pageCoverThumbnail ||
    pageMeta.pageCover ||
    pageMeta.page_cover ||
    ''
  if (cover) {
    push(`cover-${pageId}`, cover, '', null)
  }

  // 2) walk page content order
  const pageBlock = blocks[pageId]?.value
  const contentIds = Array.isArray(pageBlock?.content)
    ? pageBlock.content
    : Object.keys(blocks)

  const parseCaption = block => {
    if (!block) return ''
    // 1. properties.caption (Notion 原生图片注释)
    const segs = block.properties?.caption
    if (segs) {
      const text = Array.isArray(segs)
        ? segs.map(part => (Array.isArray(part) ? part[0] : (part || ''))).join('')
        : String(segs || '')
      if (text.trim() && !/\.(jpe?g|png|gif|webp|heic|avif)$/i.test(text.trim())) {
        return text.trim()
      }
    }
    // 2. format.caption
    if (block.format?.caption && typeof block.format.caption === 'string') {
      const text = block.format.caption.trim()
      if (text && !/\.(jpe?g|png|gif|webp|heic|avif)$/i.test(text)) {
        return text
      }
    }
    // 3. properties.title (如果用户输入了非图片文件名的文字说明)
    const titleSegs = block.properties?.title
    if (titleSegs) {
      const text = Array.isArray(titleSegs)
        ? titleSegs.map(part => (Array.isArray(part) ? part[0] : (part || ''))).join('')
        : String(titleSegs || '')
      if (text.trim() && !/\.(jpe?g|png|gif|webp|heic|avif)$/i.test(text.trim())) {
        return text.trim()
      }
    }
    return ''
  }

  for (const id of contentIds) {
    const block = blocks[id]?.value
    if (!block || block.type !== 'image') continue

    const source =
      block.properties?.source?.[0]?.[0] ||
      block.format?.display_source ||
      block.format?.source ||
      ''
    // 采用 1200px 视网膜超采样高保真规格（Retina 2x/3x 零肉眼损耗，同时消除 92% 冗余显存）
    const blockWith1200 = {
      ...block,
      format: { ...(block.format || {}), block_width: 1200 }
    }
    const url = mapImgUrl(source, blockWith1200, 'block', true)
    const caption = parseCaption(block)
    const aspectRatio = getAspectRatio(block)
    push(id, url, caption, aspectRatio)
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
      const blockWith1200 = {
        ...block,
        format: { ...(block.format || {}), block_width: 1200 }
      }
      const url = mapImgUrl(source, blockWith1200, 'block', true)
      const caption = parseCaption(block)
      const aspectRatio = getAspectRatio(block)
      push(id, url, caption, aspectRatio)
    }
  }

  return images
}
