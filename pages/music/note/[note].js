import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildNoteProps } from '@/lib/music/data'
import { loadNoteBlockMap } from '@/lib/music/loaders'
import { isMusicNote, isMusicType, isPublished } from '@/lib/music/paths'
import { getStaticPathsBase } from '@/lib/build/staticPaths'
import { DynamicLayout } from '@/themes/theme'

const isStaticExport = process.env.EXPORT === 'true'

/**
 * 音乐手记：正文来自 Notion，上下文（歌名/专辑/外链）来自行属性与快照
 * 所属专辑即使下架或没上架，本页仍按快照渲染
 */
const MusicNotePage = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutMusicNote' {...props} />
}

export async function getStaticPaths({ locale }) {
  return getStaticPathsBase({
    from: 'music-note-paths',
    locale,
    filterFn: row => isMusicNote(row) && isPublished(row),
    mapPageToParams: row => ({ params: { note: row.slug } })
  })
}

export async function getStaticProps({ params, locale }) {
  const props = await fetchGlobalAllData({ from: 'music-note', locale })
  const musicPages = (props.allPages || []).filter(p => p && isMusicType(p.type))
  const notePage = musicPages.find(p => isMusicNote(p) && p.slug === params.note)

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

  if (!notePage) return { notFound: true, revalidate }

  const blockMap = await loadNoteBlockMap(notePage, { from: 'music-note' })

  props.note = buildNoteProps(notePage, musicPages)
  // 只为正文渲染与 SEO 提供 post：LayoutBase 按路由排除音乐页，
  // 所以这个 post 不会带来文章封面、目录侧栏或上一篇/下一篇
  props.post = {
    id: notePage.id,
    slug: notePage.slug,
    title: notePage.title,
    summary: notePage.summary || '',
    blockMap
  }

  return { props, revalidate }
}

export default MusicNotePage
