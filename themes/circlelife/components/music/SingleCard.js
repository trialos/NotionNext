import MusicCard from './MusicCard'
import NcmLink from './NcmLink'

/**
 * 展架 A 的单曲卡：一张卡就是一篇 kind=Single 的手记。
 * 封面/标题 → 手记页；网易云外链单独摆在角上（不与整卡链接嵌套）。
 */
export default function SingleCard({ item, priority = false, headingLevel = 'h2' }) {
  const meta = [item.artist, item.year || ''].filter(Boolean).join(' · ')
  return (
    <MusicCard
      className='cl-music-card--single'
      href={item.href}
      cover={item.cover}
      coverSeed={item.id}
      coverAlt={`${item.title} — 单曲封面`}
      ariaLabel={`阅读单曲手记《${item.title}》`}
      priority={priority}
      title={item.title}
      headingLevel={headingLevel}
      meta={meta}>
      <span className='cl-music-kind cl-music-kind--single'>单曲手记</span>
      <NcmLink href={item.neteaseUrl} label={item.title} />
    </MusicCard>
  )
}
