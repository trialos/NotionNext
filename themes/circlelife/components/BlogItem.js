import NotionIcon from '@/components/NotionIcon'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import LazyImage from '@/components/LazyImage'

/**
 * 列表 / 时间线条目
 */
const BlogItem = ({ post, variant = 'default' }) => {
  const showPageCover =
    variant === 'default' &&
    siteConfig('CIRCLELIFE_POST_LIST_COVER', null, CONFIG) &&
    post?.pageCoverThumbnail

  if (variant === 'timeline') {
    return (
      <article className='cl-timeline-post'>
        <div className='cl-timeline-post-row'>
          <SmartLink href={post?.href} className='cl-post-title'>
            {siteConfig('POST_TITLE_ICON') && (
              <span className='mr-1 inline-flex align-middle opacity-70'>
                <NotionIcon icon={post.pageIcon} />
              </span>
            )}
            {post?.title}
          </SmartLink>
          {post?.type !== 'Page' && post?.category && (
            <SmartLink
              href={`/category/${post.category}`}
              className='cl-chip cl-chip--soft'>
              {post.category}
            </SmartLink>
          )}
        </div>
        {post.summary && !post.results ? (
          <p className='cl-post-summary'>{post.summary}</p>
        ) : null}
        {post.results ? (
          <p className='cl-post-summary'>
            {post.results.map((r, index) => (
              <span key={index}>{r}</span>
            ))}
          </p>
        ) : null}
      </article>
    )
  }

  return (
    <article className='cl-list-post'>
      <div className={showPageCover ? 'flex gap-4' : ''}>
        <div className='min-w-0 flex-1'>
          <SmartLink href={post?.href} className='cl-post-title'>
            {siteConfig('POST_TITLE_ICON') && (
              <span className='mr-1 inline-flex align-middle opacity-70'>
                <NotionIcon icon={post.pageIcon} />
              </span>
            )}
            {post?.title}
          </SmartLink>
          <div className='cl-meta mt-1.5'>
            {post?.publishDay ? <span>{post.publishDay}</span> : null}
            {post?.category ? (
              <>
                <span className='cl-dot'>·</span>
                <SmartLink href={`/category/${post.category}`}>
                  {post.category}
                </SmartLink>
              </>
            ) : null}
          </div>
          {post.summary ? <p className='cl-post-summary'>{post.summary}</p> : null}
        </div>
        {showPageCover ? (
          <SmartLink href={post?.href} className='cl-media-card cl-media-card--sm'>
            <LazyImage
              src={post.pageCoverThumbnail}
              alt={post.title}
              className='h-full w-full object-cover'
            />
          </SmartLink>
        ) : null}
      </div>
    </article>
  )
}

export default BlogItem
