import SmartLink from '@/components/SmartLink'

/**
 * 归档：按月（或站点约定）分组的文章列表
 */
export default function BlogListArchive({ archiveTitle, archivePosts }) {
  const posts = archivePosts[archiveTitle] || []
  const sectionId = `archive-${String(archiveTitle).replace(/\s+/g, '-')}`
  return (
    <section className='cl-archive-section' aria-labelledby={sectionId}>
      <h2 id={sectionId} className='cl-timeline-day-label mb-3 mt-10 first:mt-0'>
        {archiveTitle}
      </h2>
      <ul className='cl-archive-rail m-0 list-none border-l border-[var(--cl-border)] pl-0'>
        {posts.map(post => (
          <li key={post.id} className='cl-archive-item relative pl-5 py-1.5'>
            <span className='mb-0.5 block text-xs text-[var(--cl-faint)]'>
              {post?.publishDay}
            </span>
            <SmartLink
              href={post?.href}
              className='text-[var(--cl-text)] no-underline hover:text-[var(--cl-accent)]'>
              {post.title}
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
