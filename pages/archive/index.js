import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { isBrowser } from '@/lib/utils'
import { formatDateFmt } from '@/lib/utils/formatDate'
import { DynamicLayout } from '@/themes/theme'
import { useEffect } from 'react'

const CIRCLELIFE_ARCHIVE_POST_FIELDS = [
  'id',
  'title',
  'href',
  'category',
  'publishDate',
  'publishDay',
  'tagItems'
]

/**
 * 归档首页
 * @param {*} props
 * @returns
 */
const ArchiveIndex = props => {
  useEffect(() => {
    if (isBrowser) {
      const anchor = window.location.hash
      if (anchor) {
        setTimeout(() => {
          const anchorElement = document.getElementById(anchor.substring(1))
          if (anchorElement) {
            anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
          }
        }, 300)
      }
    }
  }, [])

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutArchive' {...props} />
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'archive-index', locale })
  const posts = (props.allPages || []).filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  delete props.allPages

  const postsSortByDate = [...posts].sort((a, b) => {
    return b?.publishDate - a?.publishDate
  })

  const archivePosts = {}

  postsSortByDate.forEach(post => {
    const date = formatDateFmt(post.publishDate, 'yyyy-MM')
    if (archivePosts[date]) {
      archivePosts[date].push(post)
    } else {
      archivePosts[date] = [post]
    }
  })

  props.posts = posts

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  if (theme === 'circlelife') {
    // circlelife 的 LayoutArchive/BlogListArchive 只消费这些字段；
    // 归档 UI 新增字段时必须同步更新，否则应保留完整 post 对象。
    Object.keys(archivePosts).forEach(month => {
      archivePosts[month] = archivePosts[month].map(post => {
        const slim = {}
        CIRCLELIFE_ARCHIVE_POST_FIELDS.forEach(field => {
          if (post?.[field] !== undefined) slim[field] = post[field]
        })
        return slim
      })
    })
    delete props.posts
    delete props.latestPosts
    delete props.tagOptions
    delete props.categoryOptions
  }

  props.archivePosts = archivePosts

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

export default ArchiveIndex
