import LazyImage from '@/components/LazyImage'

/**
 * 作者徽标：可选头像 + 名
 */
export default function AuthorBadge({
  author,
  className = '',
  size = 22,
  showName = true
}) {
  if (!author?.name) return null
  const initial = String(author.name).trim().charAt(0).toUpperCase()
  const hasAvatar = Boolean(author.avatar)

  return (
    <span className={`cl-author-badge inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`cl-author-avatar ${hasAvatar ? 'has-img' : 'is-empty'}`}
        style={{ width: size, height: size }}
        aria-hidden={!hasAvatar}>
        {hasAvatar ? (
          <LazyImage
            src={author.avatar}
            alt=''
            className='cl-author-avatar-img'
          />
        ) : (
          <span className='cl-author-initial'>{initial}</span>
        )}
      </span>
      {showName ? <span className='cl-author-name'>{author.name}</span> : null}
    </span>
  )
}
