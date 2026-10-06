import SmartLink from '@/components/SmartLink'
import { formatDateFmt } from '@/lib/utils/formatDate'
import AuthorBadge from './AuthorBadge'
import { resolveAuthorOrSite } from './authors'

/**
 * 作者（头像）· 日期 · 分类 chip
 */
export const PostMeta = props => {
  const { post } = props
  if (!post || post.type === 'Page') return null

  const author = resolveAuthorOrSite(post)
  const parts = []

  if (author?.name) {
    parts.push(
      <AuthorBadge key='author' author={author} size={22} className='cl-meta-author' />
    )
  }

  if (post.publishDay) {
    parts.push(
      <SmartLink
        key='date'
        href={`/archive#archive-${formatDateFmt(post.publishDate, 'yyyy-MM')}`}
        className='cl-meta-date'>
        {post.publishDay}
      </SmartLink>
    )
  }

  if (post.category) {
    parts.push(
      <SmartLink
        key='cat'
        href={`/category/${post.category}`}
        className='cl-chip cl-chip--soft cl-meta-category'>
        {post.category}
      </SmartLink>
    )
  }

  if (!parts.length) return null

  return (
    <div className='cl-meta cl-article-meta'>
      {parts.map((node, i) => (
        <span
          key={node.key || i}
          className='cl-meta-item inline-flex items-center gap-2'>
          {i > 0 ? (
            <span className='cl-dot' aria-hidden='true'>
              ·
            </span>
          ) : null}
          {node}
        </span>
      ))}
    </div>
  )
}
