import BLOG from '@/blog.config'
import { siteConfig, convertVal } from '@/lib/config'
import { resolvePostProps } from '@/lib/db/SiteDataApi'
import { resolveArticleCoverPreload } from '@/lib/db/notion/articleCover'
import Slug from '..'
import { getStaticPathsBase } from '@/lib/build/staticPaths'
import { isExport } from '@/lib/utils/buildMode'
import { checkSlugHasOneSlash } from '@/lib/utils/post'
import { getThemeConfig } from '@/themes/theme'

const isStaticExport = process.env.EXPORT === 'true'

/**
 * 读取主题开关，优先级与运行时 siteConfig 一致：NotionConfig → 主题配置 → 兜底
 * （构建期没有全局快照，siteConfig 读不到 NotionConfig，这里显式补一层）
 */
const readThemeSwitch = (key, fallback, notionConfig, themeConfig) => {
  const fromNotion = notionConfig?.[key]
  if (fromNotion !== undefined && fromNotion !== null) return convertVal(fromNotion)
  const fromTheme = themeConfig?.[key]
  if (fromTheme !== undefined && fromTheme !== null) return convertVal(fromTheme)
  return fallback
}

/**
 * 根据notion的slug访问页面
 * 解析二级目录 /article/about
 * @param {*} props
 * @returns
 */
const PrefixSlug = props => {
  return <Slug {...props} />
}

export async function getStaticPaths() {
  return getStaticPathsBase({
    from: 'slug-paths',
    filterFn: row => checkSlugHasOneSlash(row),
    mapPageToParams: row => ({
      params: {
        prefix: row.slug.split('/')[0],
        slug: row.slug.split('/')[1]
      }
    })
  })
}

export async function getStaticProps({ params: { prefix, slug }, locale, revalidateReason }) {
  const props = await resolvePostProps({
    prefix,
    slug,
    locale,
    revalidateReason,
  })

  // 头图是站内唯一 LCP 大图，这里给出与主题实际渲染一致的预加载信息。
  // 预加载必须放在页面级：写在主题里的 <Head> 会在 SSR 阶段被丢弃。
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  const themeConfig = await getThemeConfig(theme)
  const coverLcp = resolveArticleCoverPreload(props.post, {
    coverEnabled: readThemeSwitch(
      'CIRCLELIFE_ARTICLE_COVER',
      true,
      props.NOTION_CONFIG,
      themeConfig
    ),
    cardMode: readThemeSwitch(
      'CIRCLELIFE_ARTICLE_CARD',
      false,
      props.NOTION_CONFIG,
      themeConfig
    )
  })

  return {
    props: { ...props, coverLcp },
    revalidate: isStaticExport
      ? undefined
      : siteConfig(
        'NEXT_REVALIDATE_SECOND',
        BLOG.NEXT_REVALIDATE_SECOND,
        props.NOTION_CONFIG
      ),
    notFound: !props.post
  }
}

export default PrefixSlug
