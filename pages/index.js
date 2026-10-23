import { getPublicPostBlockMap } from '@/lib/utils/publicPost'
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import {
  cleanPostSummaries,
  fetchGlobalAllData,
  getPostBlocks
} from '@/lib/db/SiteDataApi'
import { loadPhotoImages, resolveHomeCoverImages } from '@/lib/db/notion/photoImages'
import { formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { buildImageSources } from '@/themes/circlelife/components/imageSrcset'
import { isFeaturedAlbum } from '@/themes/circlelife/components/homeAlbumFocus'
import { generateRobotsTxt } from '@/lib/utils/robots.txt'
import { generateRss, shouldGenerateRssForLocale } from '@/lib/utils/rss'
import { generateSitemapXml } from '@/lib/utils/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import Head from 'next/head'
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
  // 首屏 LCP：只预加载首图一张。主题布局内的 Head 在本项目 SSR 阶段不生效，
  // 因此放在页面级 Head；图片本身由 LayoutIndex 渲染，这里不重复下载。
  // 必须同时给出 imagesrcset/imagesizes：否则浏览器按 sizes 选中 512 档，
  // 却已被预加载了 1024 档，会白下载两份
  const heroLcp = props.homeCoverImages?.[0]
  return (
    <>
      {heroLcp?.src ? (
        <Head>
          <link
            rel='preload'
            as='image'
            href={heroLcp.src}
            imageSrcSet={heroLcp.srcSet || undefined}
            imageSizes={heroLcp.sizes || undefined}
            fetchPriority='high'
          />
        </Head>
      ) : null}
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
  // 首页「精选影集」段：Notion「精选」勾选的优先，不足用最新影集补齐。
  // 只下发封面与摘要，不再下发全部正文图 URL —— 旧实现把 6 辑 67 张图的
  // URL 塞进首页 pageProps 却无人消费，白付约 17 KB（占整包 24%）。
  const homeAlbumCount = Math.max(
    1,
    Number(
      siteConfig('CIRCLELIFE_HOME_ALBUM_COUNT', 4, props?.NOTION_CONFIG)
    ) || 4
  )
  const filmBatch = Math.max(
    1,
    Math.min(
      8,
      Number(
        siteConfig('CIRCLELIFE_ALBUM_FETCH_BATCH', 4, props?.NOTION_CONFIG)
      ) || 4
    )
  )
  const byDateDesc = (a, b) => (b.publishDate || 0) - (a.publishDate || 0)
  const allPhotoPages = cleanPostSummaries(
    (props.allPages || []).filter(
      p =>
        p &&
        (p.type === 'Photo' || p.type === 'photo') &&
        p.status === 'Published'
    )
  )
  const featuredPages = allPhotoPages.filter(isFeaturedAlbum).sort(byDateDesc)
  const restPages = allPhotoPages.filter(p => !isFeaturedAlbum(p)).sort(byDateDesc)
  const orderedPhotoPages = [...featuredPages, ...restPages].slice(
    0,
    homeAlbumCount
  )
  const homeAlbums = []
  for (let i = 0; i < orderedPhotoPages.length; i += filmBatch) {
    const slice = orderedPhotoPages.slice(i, i + filmBatch)
    const parts = await Promise.all(
      slice.map(async p => {
        const images = (await loadPhotoImages(p)).filter(im => im?.url)
        const cover = images[0]
        if (!cover) return null
        const sources = buildImageSources(cover.url, {
          sizes: '(max-width: 1023px) 92vw, 620px'
        })
        return {
          id: p.id,
          name: p.title,
          href: `/album?view=gallery&deck=${p.id}`,
          summary: p.summary || '',
          date: p.publishDay || '',
          count: images.length,
          featured: isFeaturedAlbum(p),
          cover: {
            url: cover.url,
            src: sources.src,
            srcSet: sources.srcSet,
            sizes: sources.sizes
          }
        }
      })
    )
    homeAlbums.push(...parts.filter(Boolean))
  }
  props.homeAlbums = homeAlbums

  // 首页首屏照片墙图源：按 homecover 语义解析，私有页面 ID 只从服务端环境变量注入
  props.homeCoverImages = await resolveHomeCoverImages(props.allPages || [], {
    pageId: process.env.CIRCLELIFE_HOME_COVER_PAGE_ID
  })
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
