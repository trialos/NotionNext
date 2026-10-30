import pLimit from 'p-limit'
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildShelfItems } from '@/lib/music/data'
import { loadNoteBlockMap } from '@/lib/music/loaders'
import { noteHasBody } from '@/lib/music/notes'
import { isMusicType } from '@/lib/music/paths'
import { DynamicLayout } from '@/themes/theme'

/**
 * 展架上的单曲卡：没写正文的不链到手记页，在这里逐条读一次正文块。
 * 只读有卡可点的那些行（Single 且已上架），读不到就当「有正文」。
 */
async function loadSingleBodyState(pages, singles) {
  if (!singles.length) return new Map()
  const byId = new Map(pages.map(page => [page.id, page]))
  const limit = pLimit(5)
  const pairs = await Promise.all(
    singles.map(item =>
      limit(async () => {
        const row = byId.get(item.id)
        if (!row) return null
        const blockMap = await loadNoteBlockMap(row, { from: 'music-shelf' })
        if (!blockMap) return null
        return [item.id, noteHasBody(blockMap, row.id)]
      })
    )
  )
  return new Map(pairs.filter(Boolean))
}

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
  const musicPages = (props.allPages || []).filter(p => p && isMusicType(p.type))

  const shelf = buildShelfItems(musicPages)
  const hasBodyById = await loadSingleBodyState(
    musicPages,
    shelf.items.filter(item => item.kind === 'single')
  )
  props.musicShelf = buildShelfItems(musicPages, { hasBodyById })

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
