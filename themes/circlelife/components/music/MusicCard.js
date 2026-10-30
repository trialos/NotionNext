import SmartLink from '@/components/SmartLink'
import MusicCover from './MusicCover'

/**
 * 展架卡片骨架：封面链接 + 标题 + meta + 卡脚。
 *
 * 专辑卡与单曲卡是同一副骨架，只是卡脚内容不同 —— 合成一个组件，
 * 免得两处结构各改各的、各自漂移。interactive=false 时封面与标题不给链接
 * （还没写正文的单曲只是一张展示卡），但排版与标题层级不变。
 */
export default function MusicCard({
  className = '',
  href,
  cover,
  coverSeed = '',
  coverAlt = '',
  priority = false,
  ariaLabel,
  title,
  titleHref,
  headingLevel = 'h2',
  meta = '',
  interactive = true,
  children
}) {
  const Heading = headingLevel
  const coverNode = (
    <MusicCover
      src={cover}
      seed={coverSeed}
      title={title}
      alt={coverAlt}
      priority={priority}
    />
  )
  return (
    <article className={`cl-music-card ${className}`.trim()}>
      {interactive ? (
        <SmartLink
          href={href}
          className='cl-music-card-cover'
          aria-label={ariaLabel}>
          {coverNode}
        </SmartLink>
      ) : (
        <div className='cl-music-card-cover'>{coverNode}</div>
      )}
      <div>
        <Heading className='cl-music-card-title'>
          {interactive ? (
            <SmartLink href={titleHref || href} title={title}>
              {title}
            </SmartLink>
          ) : (
            title
          )}
        </Heading>
        {meta ? <p className='cl-music-card-meta'>{meta}</p> : null}
        <div className='cl-music-card-foot'>{children}</div>
      </div>
    </article>
  )
}
