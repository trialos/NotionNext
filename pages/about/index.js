import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { cleanPostSummaries, fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { fetchNotionPageBlocks, formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import { extractImagesFromBlockMap } from '@/themes/circlelife/components/extractPhotoImages'
import { compressImage } from '@/lib/db/notion/mapImage'
import Head from 'next/head'
import { DynamicLayout } from '@/themes/theme'

/**
 * 关于我：无限视差平铺网格画廊
 *
 * 数据源：100% 由 Notion 数据库驱动。
 * 1. 在 Notion 中新建文章，分类（Category）或标签（Tags）设为『关于』；
 * 2. 封面（PageCover）作为卡片主画片，摘要（Summary）作为卡片副标题；
 * 3. 正文（Blocks）为点击卡片后展开的深度故事；
 * 4. 亦兼容 slug='about' 的单页图片提取。
 */
const AboutIndex = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  const firstCard = props.aboutCards?.[0]
  const secondCard = props.aboutCards?.[1]
  return (
    <>
      <Head>
        {/* 静默预加载首屏核心 LCP 图片（置顶最前列，消灭资源发现延迟） */}
        {firstCard?.src && (
          <link
            key='preload-lcp-0'
            rel='preload'
            as='image'
            href={firstCard.src}
            fetchpriority='high'
          />
        )}
        {secondCard?.src && (
          <link
            key='preload-lcp-1'
            rel='preload'
            as='image'
            href={secondCard.src}
            fetchpriority='high'
          />
        )}
      </Head>
      {/* SSR 预备 LCP 节点：让浏览器在解析 HTML 第一瞬间完成 DOM 绑定，彻底归零 166ms 发现延迟 */}
      {firstCard?.src && (
        <div className='sr-only pointer-events-none absolute h-0 w-0 overflow-hidden' aria-hidden='true'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firstCard.src}
            alt=''
            fetchPriority='high'
            decoding='async'
            style={{ width: 1, height: 1 }}
          />
        </div>
      )}
      <DynamicLayout theme={theme} layoutName='LayoutAbout' {...props} />
    </>
  )
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'about-index', locale })
  const all = props.allPages || []

  // 1. 匹配分类为「关于」或标签含「关于」的文章
  const isAboutMatch = p => {
    if (!p || p.status !== 'Published') return false
    const cat = String(p.category || '').trim().toLowerCase()
    if (cat === '关于' || cat === 'about') return true
    if (Array.isArray(p.tags)) {
      const hit = p.tags.some(t => {
        const tag = String(t || '').trim().toLowerCase()
        return tag === '关于' || tag === 'about'
      })
      if (hit) return true
    }
    if (p.type === 'About' || p.type === 'about') return true
    return false
  }

  const matchedPosts = cleanPostSummaries(all.filter(isAboutMatch))

  // 2. 匹配 slug === 'about' 的单页
  const singleAboutPage = all.find(
    p =>
      p &&
      p.status === 'Published' &&
      (p.slug === 'about' || p.slug === '关于' || (p.title === '关于' && p.type === 'Page'))
  )

  const cards = []

  // 批次获取匹配文章的 blockMap 与图片（上限 16 篇防 Notion 超时）
  const targetPosts = matchedPosts.slice(0, 16)
  for (const post of targetPosts) {
    try {
      let pageId = post.id
      if (checkStrIsNotionId(pageId)) pageId = idToUuid(pageId)
      if (checkStrIsUuid(pageId)) {
        const raw = await fetchNotionPageBlocks(pageId, 'about')
        let blockMap = null
        if (raw) {
          blockMap = adapterNotionBlockMap(raw)
          if (blockMap?.block) {
            blockMap.block = formatNotionBlock(blockMap.block)
          }
        }
        const extractedImages = blockMap
          ? extractImagesFromBlockMap(blockMap, pageId, post)
          : []
        const captionText = post.summary || extractedImages[0]?.caption || ''
        const lines = captionText
          ? (captionText.includes('\n')
              ? captionText.split(/\r?\n/)
              : captionText.split(/\s*[\/|]\s*/))
              .map(s => s.trim())
              .filter(Boolean)
          : [post.title || '关于', post.category || 'Circle of Life', 'Self-Portrait', post.publishDay || '']

            const rawCover = post.pageCoverThumbnail || post.pageCover || extractedImages[0]?.url || ''
            const cover = compressImage(rawCover, 1200)

        const defaultRatios = [1.5, 1.25, 0.8, 1.333, 1.0, 1.4]
        const firstImgRatio = extractedImages[0]?.aspectRatio || defaultRatios[cards.length % defaultRatios.length]

        cards.push({
          id: post.id,
          title: post.title || '关于',
          caption: captionText,
          lines,
          src: cover,
          aspectRatio: firstImgRatio,
          date: post.date?.start_date || post.publishDay || '',
          author: post.author || '',
          category: post.category || '关于',
          slug: post.slug || ''
        })
      }
    } catch (err) {
      console.warn('[about] fetch post blocks error', post.id, err)
    }
  }

  // 3. 若有 slug='about' 单页，将其正文中的图片提取并并入画廊网格（支持批量自拍上传）
  if (singleAboutPage) {
    try {
      let pageId = singleAboutPage.id
      if (checkStrIsNotionId(pageId)) pageId = idToUuid(pageId)
      if (checkStrIsUuid(pageId)) {
        const raw = await fetchNotionPageBlocks(pageId, 'about')
        if (raw) {
          const blockMap = adapterNotionBlockMap(raw)
          if (blockMap?.block) {
            blockMap.block = formatNotionBlock(blockMap.block)
          }
          const images = extractImagesFromBlockMap(blockMap, pageId, singleAboutPage)

          // 遍历关于单页正文里的全部图片，提取为画廊卡片
          images.forEach((img, idx) => {
            if (img.url && !cards.some(c => c.src === img.url)) {
              const cText = img.caption || singleAboutPage.summary || ''
              const imgLines = cText
                ? (cText.includes('\n')
                    ? cText.split(/\r?\n/)
                    : cText.split(/\s*[\/|]\s*/))
                    .map(s => s.trim())
                    .filter(Boolean)
                : [
                    `${singleAboutPage.title} #${idx + 1}`,
                    'Circle of Life',
                    'Original Portrait',
                    singleAboutPage.publishDay || '2024'
                  ]

              const defaultRatios = [1.5, 1.25, 0.8, 1.333, 1.0, 1.4]
              const finalRatio = img.aspectRatio || defaultRatios[cards.length % defaultRatios.length]

              cards.push({
                id: `${singleAboutPage.id}-img-${idx}`,
                title: img.caption ? img.caption.split(/\r?\n/)[0] : `${singleAboutPage.title} #${idx + 1}`,
                caption: cText,
                lines: imgLines,
                src: compressImage(img.url, 1200),
                aspectRatio: finalRatio,
                date: singleAboutPage.date?.start_date || singleAboutPage.publishDay || '',
                author: singleAboutPage.author || '',
                category: '关于',
                slug: singleAboutPage.slug || 'about'
              })
            }
          })
        }
      }
    } catch (err) {
      console.warn('[about] extract single page images error', err)
    }
  }

  // 4. 若关于卡片数量不足，自动融合博主 Notion 数据库中已发布的精选实体文章与影集封面（100% 在线真实内容）
  if (cards.length < 9) {
    const published = all.filter(
      p =>
        p &&
        p.status === 'Published' &&
        (p.pageCoverThumbnail || p.pageCover) &&
        !cards.some(c => c.id === p.id || c.src === (p.pageCoverThumbnail || p.pageCover))
    )
    for (const post of published) {
      if (cards.length >= 9) break
      const captionText = post.summary || ''
      const lines = captionText
        ? (captionText.includes('\n')
            ? captionText.split(/\r?\n/)
            : captionText.split(/\s*[\/|]\s*/))
            .map(s => s.trim())
            .filter(Boolean)
        : [
            post.title || '时光的弧线',
            post.category || '随笔',
            'Circle of Life · 独立创作',
            post.publishDay || '2024'
          ]

      const defaultRatios = [1.5, 1.25, 0.8, 1.333, 1.0, 1.4]
      const finalRatio = defaultRatios[cards.length % defaultRatios.length]

      cards.push({
        id: post.id,
        title: post.title || '时光的弧线',
        caption: captionText,
        lines,
        src: compressImage(post.pageCoverThumbnail || post.pageCover, 1200),
        aspectRatio: finalRatio,
        date: post.date?.start_date || post.publishDay || '',
        author: post.author || 'Felix',
        category: post.category || '关于',
        slug: post.slug || ''
      })
    }
  }

  props.aboutSummary =
    singleAboutPage?.summary ||
    siteConfig('DESCRIPTION', BLOG.DESCRIPTION, props.NOTION_CONFIG) ||
    '时光的弧线 · 捕捉生活、人机协作与日常美学的独立光影。'
  props.aboutTitle = singleAboutPage?.title || '关于我 · ABOUT'
  props.aboutCards = cards
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

export default AboutIndex
