import BLOG from '@/blog.config'
import Head from 'next/head'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildAlbumProps } from '@/lib/music/data'
import { loadAlbumTracks } from '@/lib/music/loaders'
import {
  isDelisted,
  isMusicAlbum,
  isMusicType,
  isPublished
} from '@/lib/music/paths'
import { getStaticPathsBase } from '@/lib/build/staticPaths'
import { DynamicLayout } from '@/themes/theme'

const isStaticExport = process.env.EXPORT === 'true'

/**
 * 专辑页 D2：大封面 hero + 曲目表（每首带自己的封面）
 * 曲目来自正文折叠块里的 JSON（本地脚本写入），本页不请求网易云
 */
const MusicAlbumPage = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <>
      {/* 首屏封面预加载必须放页面级：写在主题里的 <Head> 会在 SSR 阶段被丢弃。
          href 与主题 SSR 出的档位是同一个字符串，因此精确命中缓存 */}
      {props.coverLcp?.src ? (
        <Head>
          <link
            rel='preload'
            as='image'
            href={props.coverLcp.src}
            fetchPriority='high'
          />
        </Head>
      ) : null}
      <DynamicLayout theme={theme} layoutName='LayoutMusicAlbum' {...props} />
    </>
  )
}

export async function getStaticPaths({ locale }) {
  // 已上架且未下架的专辑才预渲染：Invisible 留给 URL 直达预览，
  // 新策展的专辑下一次 ISR 周期自然补上
  return getStaticPathsBase({
    from: 'music-album-paths',
    locale,
    filterFn: row => isMusicAlbum(row) && isPublished(row) && !isDelisted(row),
    mapPageToParams: row => ({ params: { album: row.slug } })
  })
}

export async function getStaticProps({ params, locale }) {
  const props = await fetchGlobalAllData({ from: 'music-album', locale })
  const musicPages = (props.allPages || []).filter(p => p && isMusicType(p.type))
  const albumPage = musicPages.find(
    p => isMusicAlbum(p) && p.slug === params.album
  )

  delete props.allPages
  delete props.posts
  delete props.latestPosts
  delete props.tagOptions
  delete props.categoryOptions

  const revalidate = isStaticExport
    ? undefined
    : siteConfig(
        'NEXT_REVALIDATE_SECOND',
        BLOG.NEXT_REVALIDATE_SECOND,
        props.NOTION_CONFIG
      )

  // 已下架 = 上游确认消失，专辑页不再提供；Invisible 仍可 URL 直达预览
  if (!albumPage || isDelisted(albumPage)) {
    return { notFound: true, revalidate }
  }

  const tracks = await loadAlbumTracks(albumPage, { from: 'music-album' })
  props.music = buildAlbumProps(albumPage, musicPages, tracks)
  props.coverLcp = { src: props.music.album.cover }

  return { props, revalidate }
}

export default MusicAlbumPage
