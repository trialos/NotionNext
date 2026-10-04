import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { cleanPostSummaries, fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { fetchNotionPageBlocks, formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { idToUuid } from 'notion-utils'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { DynamicLayout } from '@/themes/theme'
import { extractImagesFromBlockMap } from '@/themes/circlelife/components/extractPhotoImages'

/**
 * 影集：拉取 Photo 页正文图片
 *
 * 缓存：ISR 使用站级 NEXT_REVALIDATE_SECOND。
 * Notion 更新后请对 /album 调用 POST /api/revalidate
 *   Body: { "path": "/album" } 或 paths 含 "/album"
 *   Header: Authorization: Bearer <REVALIDATION_TOKEN>
 */
const AlbumIndex = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutAlbum' {...props} />
}

async function loadPhotoImages(page) {
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
    console.warn('[album] extract images failed', page?.id, e?.message)
    return []
  }
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'album-index', locale })
  const all = props.allPages || []
  const photoPages = cleanPostSummaries(
    all.filter(
      p =>
        p &&
        (p.type === 'Photo' || p.type === 'photo') &&
        p.status === 'Published'
    )
  )

  // parallel fetch body images（批次可配置，避免 Photo 增多打爆 Notion/构建）
  const enriched = []
  const batch = Math.max(
    1,
    Math.min(
      8,
      Number(
        siteConfig(
          'CIRCLELIFE_ALBUM_FETCH_BATCH',
          4,
          props.NOTION_CONFIG
        )
      ) || 4
    )
  )
  for (let i = 0; i < photoPages.length; i += batch) {
    const slice = photoPages.slice(i, i + batch)
    const parts = await Promise.all(
      slice.map(async p => {
        const images = await loadPhotoImages(p)
        return { ...p, images }
      })
    )
    enriched.push(...parts)
  }

  props.photos = enriched
  delete props.allPages
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default AlbumIndex
