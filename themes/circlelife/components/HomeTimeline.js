import { useMemo } from 'react'
import BlogItem from './BlogItem'

/**
 * 首页时间线。顺序跟传入数组走（Notion 行序），不再按发布日期重排。
 * 只有相邻且同一天的文章并成一组，避免打乱数据库里的前后。
 */
export default function HomeTimeline({ posts }) {
  const groups = useMemo(() => {
    if (!posts?.length) return []
    const grouped = []
    for (const post of posts) {
      const day = post.publishDay || post.date?.start_date || ''
      const last = grouped[grouped.length - 1]
      if (last && last.day === day) {
        last.posts.push(post)
      } else {
        grouped.push({ day, posts: [post] })
      }
    }
    return grouped
  }, [posts])

  if (!groups.length) return null

  return (
    <div id='posts-wrapper' className='cl-timeline'>
      {groups.map(({ day, posts: dayPosts }) => (
        <section key={`${day}-${dayPosts[0]?.id || 'unknown'}`} className='cl-timeline-day'>
          <h2 className='cl-timeline-day-label'>{day || '—'}</h2>
          <ul className='cl-timeline-rail'>
            {dayPosts.map(post => (
              <li key={post.id} className='cl-timeline-item'>
                <BlogItem post={post} variant='timeline' />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
