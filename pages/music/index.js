import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildShelfItems } from '@/lib/music/data'
import { isMusicType } from '@/lib/music/paths'
import { DynamicLayout } from '@/themes/theme'

/**
 * 音乐展架：专辑行 + kind=Single 的手记行混排成一面唱片墙
 *
 * 数据全部来自 Notion 里的人工策展行；站点构建从不请求网易云。
 * Notion 更新后对 /music 调 POST /api/revalidate（见 scripts/music/cli.mjs 的 --revalidate）
 */
const MusicIndex = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutMusic' {...props} />
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'music-shelf', locale })

  props.musicShelf = buildShelfItems(
    (props.allPages || []).filter(p => p && isMusicType(p.type))
  )

  delete props.allPages
  // 展架只消费 musicShelf：文章列表字段对本页是纯负担
  delete props.posts
  delete props.latestPosts
  delete props.tagOptions
  delete props.categoryOptions

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

export default MusicIndex
