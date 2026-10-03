import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'

/**
 * 文章元信息：分类 · 日期 · 编辑（全 mono）
 */
export const PostMeta = props => {
  const { post } = props
  const { locale } = useGlobal()
  if (!post || post.type === 'Page') return null

  return (
    <div className='cl-meta cl-article-meta'>
      {post.category ? (
        <SmartLink href={`/category/${post.category}`}>{post.category}</SmartLink>
      ) : null}
      {post.category && post.publishDay ? <span className='cl-dot'>·</span> : null}
      {post.publishDay ? (
        <SmartLink
          href={`/archive#${formatDateFmt(post.publishDate, 'yyyy-MM')}`}>
          {post.publishDay}
        </SmartLink>
      ) : null}
      {post.lastEditedDay ? (
        <>
          <span className='cl-dot'>·</span>
          <span className='cl-meta-muted'>
            {locale.COMMON.LAST_EDITED_TIME} {post.lastEditedDay}
          </span>
        </>
      ) : null}
    </div>
  )
}
