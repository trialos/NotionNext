import SmartLink from '@/components/SmartLink'
import { formatDateFmt } from '@/lib/utils/formatDate'
import { normalizePostTags } from './archiveFilter'

function formatArchiveDay(post) {
  if (post?.publishDate) {
    return formatDateFmt(post.publishDate, 'MM-dd')
  }
  return post?.publishDay || '—'
}

/**
 * 归档：按月分组，编辑部式条目（日期 / 标题 / 分类与标签）
 */
export default function BlogListArchive({
  archiveTitle,
  archivePosts,
  activeTagName = ''
}) {
  const posts = archivePosts[archiveTitle] || []
  const sectionId = `archive-${String(archiveTitle).replace(/\s+/g, '-')}`

  return (
    <section className='cl-archive-section' aria-labelledby={sectionId}>
      <h2 id={sectionId} className='cl-archive-month'>
        {archiveTitle}
      </h2>
      <ul className='cl-archive-list'>
        {posts.map(post => {
          const tags = normalizePostTags(post)
          return (
            <li key={post.id} className='cl-archive-row'>
              <article className='cl-archive-entry'>
                <time className='cl-archive-date'>
                  {formatArchiveDay(post)}
                </time>
                <h3 className='cl-archive-title-wrap'>
                  <SmartLink href={post?.href} className='cl-post-title'>
                    {post.title}
                  </SmartLink>
                </h3>
                <div className='cl-archive-meta'>
                  <span className='cl-archive-entry-cat'>
                    {post.category?.trim() || '未分类'}
                  </span>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className={`cl-archive-tag${
                        tag === activeTagName ? ' is-active' : ''
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
