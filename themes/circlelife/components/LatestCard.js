import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 首页报头块：mono kicker + serif 标题 + 摘要（贴近封面 Masthead）
 */
export default function LatestCard({ post }) {
  if (!post?.href) return null
  const enabled = siteConfig('CIRCLELIFE_HOME_LATEST_CARD', true, CONFIG)
  if (!enabled) return null

  const kicker =
    (post.category && String(post.category)) ||
    siteConfig('CIRCLELIFE_LATEST_KICKER', '最近', CONFIG)
  const day = post.publishDay || post.date?.start_date || ''

  return (
    <aside className='cl-latest-card'>
      <div className='cl-kicker'>
        <span>{kicker}</span>
        {day ? <span className='cl-kicker-sep'>·</span> : null}
        {day ? <span>{day}</span> : null}
      </div>
      <SmartLink href={post.href} className='cl-latest-title'>
        {post.title}
      </SmartLink>
      {post.summary ? (
        <p className='cl-latest-summary'>{post.summary}</p>
      ) : null}
      {post.category ? (
        <div className='cl-latest-meta'>
          <SmartLink
            href={`/category/${post.category}`}
            className='cl-chip cl-chip--soft'>
            {post.category}
          </SmartLink>
        </div>
      ) : null}
    </aside>
  )
}
