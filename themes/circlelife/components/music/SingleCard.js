import MusicCard from './MusicCard'
import NcmLink from './NcmLink'

/**
 * 展架 A 的单曲卡：一张卡就是一篇 kind=Single 的手记。
 * 封面/标题 → 手记页；网易云外链单独摆在角上（不与整卡链接嵌套）。
 *
 * 还没写正文的单曲只是一张展示卡：不可点、标签写「单曲」而不是「单曲手记」，
 * 网易云外链照旧留在右下角。
 */
export default function SingleCard({ item, priority = false, headingLevel = 'h2' }) {
  const meta = [item.artist, item.year || ''].filter(Boolean).join(' · ')
  const isNote = item.hasBody !== false
  return (
    <MusicCard
      className='cl-music-card--single'
      href={item.href}
      cover={item.cover}
      coverSeed={item.id}
      coverAlt={`${item.title} — 单曲封面`}
      ariaLabel={isNote ? `阅读单曲手记《${item.title}》` : undefined}
      interactive={isNote}
      priority={priority}
      title={item.title}
      headingLevel={headingLevel}
      meta={meta}>
      <span className='cl-music-kind cl-music-kind--single'>
        {isNote ? '单曲手记' : '单曲'}
      </span>
      <NcmLink href={item.neteaseUrl} label={item.title} />
    </MusicCard>
  )
}
