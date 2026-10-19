import { getPublicPostBlockMap } from '@/lib/utils/publicPost'
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import {
  cleanPostSummaries,
  fetchGlobalAllData,
  getPostBlocks
} from '@/lib/db/SiteDataApi'
import { loadPhotoImages } from '@/lib/db/notion/photoImages'
import { formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { generateRobotsTxt } from '@/lib/utils/robots.txt'
import { generateRss, shouldGenerateRssForLocale } from '@/lib/utils/rss'
import { generateSitemapXml } from '@/lib/utils/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import Head from 'next/head'
import { compressImage } from '@/lib/db/notion/mapImage'
import { generateRedirectJson } from '@/lib/utils/redirect'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'
import pLimit from 'p-limit'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  const firstCard = props.homeCoverImages?.[0]
  const secondCard = props.homeCoverImages?.[1]
  return (
    <>
      <Head>
        {firstCard?.src && (
          <link
            key='preload-hero-0'
            rel='preload'
            as='image'
            href={firstCard.src}
            fetchpriority='high'
          />
        )}
        {secondCard?.src && (
          <link
            key='preload-hero-1'
            rel='preload'
            as='image'
            href={secondCard.src}
            fetchpriority='high'
          />
        )}
      </Head>
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
      <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
    </>
  )
}

/**
 * SSG 获取数据
 * @returns
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  const props = await fetchGlobalAllData({ from, locale })
  if (process.env.NODE_ENV === 'development') {
    const configTheme = BLOG.THEME
    const notionTheme = props?.NOTION_CONFIG?.THEME || null
    const finalTheme = siteConfig('THEME', BLOG.THEME, props?.NOTION_CONFIG)
    const source = notionTheme ? 'notion:config' : 'blog/env:config'
    console.log(
      '[ThemeResolver][server-static-props]',
      JSON.stringify({
        route: '/',
        configTheme,
        notionTheme,
        finalTheme,
        source
      })
    )
  }
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    8,
    props?.NOTION_CONFIG
  )
  const POST_PREVIEW_MAX_COUNT = siteConfig(
    'POST_PREVIEW_MAX_COUNT',
    4,
    props?.NOTION_CONFIG
  )
  const POST_LIST_PREVIEW = siteConfig(
    'POST_LIST_PREVIEW',
    false,
    props?.NOTION_CONFIG
  )
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  // 处理分页
  const POST_LIST_STYLE = siteConfig(
    'POST_LIST_STYLE',
    'page',
    props?.NOTION_CONFIG
  )
  if (POST_LIST_STYLE === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (POST_LIST_STYLE === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // 预览文章内容
  if (POST_LIST_PREVIEW) {
    const previewLimit = pLimit(
      siteConfig('POST_PREVIEW_CONCURRENCY', 5, props?.NOTION_CONFIG)
    )
    const previewTargets = props.posts.filter(
      post => !post.password || post.password === ''
    ).slice(0, POST_PREVIEW_MAX_COUNT)
    await Promise.all(
      previewTargets.map(post =>
        previewLimit(async () => {
          const rawBlockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
          post.blockMap = getPublicPostBlockMap(post, adapterNotionBlockMap(rawBlockMap), props.allPages)
          if (post.blockMap?.block) {
            post.blockMap.block = formatNotionBlock(post.blockMap.block)
          }
        })
      )
    )
  }
  const isBuildLifecycle = ['build', 'export'].includes(
    process.env.npm_lifecycle_event
  )
  if (isBuildLifecycle) {
    // 生成robotTxt
    generateRobotsTxt(props)
    // 生成Feed订阅
    if (shouldGenerateRssForLocale({ locale })) {
      await generateRss(props)
    }
    // 生成
    generateSitemapXml(props)
    // 检查数据是否需要从algolia删除
    await checkDataFromAlgolia(props)
    if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
      // 生成重定向 JSON
      generateRedirectJson(props)
    }
  }

  // 生成全文索引 - 仅在 yarn build 时执行 && process.env.npm_lifecycle_event === 'build'

  if (!POST_LIST_PREVIEW) {
    props.posts = cleanPostSummaries(props.posts)
  }
  props.latestPosts = cleanPostSummaries(props.latestPosts)
  // 首页影集转筒：最新 N 辑（type=Photo）拉正文图，与影集页共用管线；
  // 不依赖 Notion 页面封面，发新一辑自动出现
  const filmCount =
    Number(siteConfig('CIRCLELIFE_HOME_FILM_COUNT', 6, props?.NOTION_CONFIG)) ||
    6
  const filmBatch = Math.max(
    1,
    Math.min(
      8,
      Number(
        siteConfig('CIRCLELIFE_ALBUM_FETCH_BATCH', 4, props?.NOTION_CONFIG)
      ) || 4
    )
  )
  const photoPages = cleanPostSummaries(
    (props.allPages || [])
      .filter(
        p =>
          p &&
          (p.type === 'Photo' || p.type === 'photo') &&
          p.status === 'Published'
      )
      .sort((a, b) => (b.publishDate || 0) - (a.publishDate || 0))
      .slice(0, filmCount)
  )
  const photoDecks = []
  for (let i = 0; i < photoPages.length; i += filmBatch) {
    const slice = photoPages.slice(i, i + filmBatch)
    const parts = await Promise.all(
      slice.map(async p => {
        const images = (await loadPhotoImages(p))
          .map(im => im?.url)
          .filter(Boolean)
        return {
          id: p.id,
          name: p.title,
          date: p.publishDay,
          count: images.length,
          images
        }
      })
    )
    photoDecks.push(...parts.filter(d => d.images.length > 0))
  }
  props.photoDecks = photoDecks

  // 首页倾斜流光照片墙专属图源
  // 优先精准定位指定的 HomeCover 页面 (ID: 3fe96e7033d3808f9b98f07cec6937ad)，或 type=HomeCover
  const targetCoverId = '3fe96e7033d3808f9b98f07cec6937ad'
  let homeCoverPages = (props.allPages || []).filter(
    p =>
      p &&
      ((p.id && p.id.replace(/-/g, '') === targetCoverId) ||
        (p.type &&
          typeof p.type === 'string' &&
          p.type.toLowerCase().trim() === 'homecover') ||
        (p.title && p.title.toLowerCase().trim() === 'homecover'))
  )
  if (homeCoverPages.length === 0) {
    homeCoverPages = [
      { id: '3fe96e70-33d3-808f-9b98-f07cec6937ad', title: 'homecover' }
    ]
  }

  const homeCoverImages = []
  for (const p of homeCoverPages) {
    try {
      const imgs = await loadPhotoImages(p)
      imgs.forEach(im => {
        if (im?.url) {
          homeCoverImages.push({
            id: im.id || im.url,
            src: compressImage(im.url, 1200),
            aspectRatio: im.aspectRatio || 1.333,
            title: im.caption || p.title || ''
          })
        }
      })
    } catch (e) {
      console.warn('[homeCoverImages] load failed for', p.id, e.message)
    }
  }
  props.homeCoverImages = homeCoverImages
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

export default Index
