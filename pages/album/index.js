import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { cleanPostSummaries, fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'

/**
 * 影集：type=Photo 条目
 */
const AlbumIndex = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutAlbum' {...props} />
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'album-index', locale })
  const all = props.allPages || []
  const photos = all.filter(
    p =>
      p &&
      (p.type === 'Photo' || p.type === 'photo') &&
      (p.status === 'Published' || p.status === 'Invisible')
  )
  // keep Invisible out of public album
  props.photos = cleanPostSummaries(
    photos.filter(p => p.status === 'Published')
  )
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
