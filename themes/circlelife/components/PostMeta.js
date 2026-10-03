import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'

function personName(p) {
  if (!p) return ''
  if (typeof p === 'string') return p.trim()
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
  if (full) return full
  return (p.name || p.full_name || p.nickname || '').trim()
}

function resolveAuthor(post) {
  if (!post) return ''
  const candidates = [
    post.author,
    post.Author,
    post['作者'],
    post.writer,
    post.Writer
  ]
  for (const c of candidates) {
    if (!c) continue
    if (typeof c === 'string' && c.trim()) return c.trim()
    if (Array.isArray(c) && c.length) {
      const names = c.map(personName).filter(Boolean)
      if (names.length) return names.join(' · ')
    }
    if (typeof c === 'object') {
      const n = personName(c)
      if (n) return n
    }
  }
  return siteConfig('AUTHOR') || ''
}

/**
 * 文章元信息：作者 · 日期 · 分类(chip)
 */
export const PostMeta = props => {
  const { post } = props
  const { locale } = useGlobal()
  if (!post || post.type === 'Page') return null

  const author = resolveAuthor(post)
  const parts = []

  if (author) {
    parts.push(
      <span key='author' className='cl-meta-author'>
        {author}
      </span>
    )
  }

  if (post.publishDay) {
    parts.push(
      <SmartLink
        key='date'
        href={`/archive#${formatDateFmt(post.publishDate, 'yyyy-MM')}`}
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

  if (!parts.length && !post.lastEditedDay) return null

  return (
    <div className='cl-meta cl-article-meta'>
      {parts.map((node, i) => (
        <span key={node.key || i} className='cl-meta-item inline-flex items-center gap-2'>
          {i > 0 ? <span className='cl-dot' aria-hidden='true'>·</span> : null}
          {node}
        </span>
      ))}
      {post.lastEditedDay ? (
        <span className='cl-meta-item inline-flex items-center gap-2'>
          {parts.length ? <span className='cl-dot' aria-hidden='true'>·</span> : null}
          <span className='cl-meta-muted'>
            {locale.COMMON.LAST_EDITED_TIME} {post.lastEditedDay}
          </span>
        </span>
      ) : null}
    </div>
  )
}
