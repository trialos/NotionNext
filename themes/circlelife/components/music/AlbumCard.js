import MusicCard from './MusicCard'

/**
 * 展架 A 的条目卡（专辑 / 歌单通用）：封面与标题都指向条目页。
 * 网易云外链不在卡上（进条目页再给），否则一张卡上三个链接会互相误点。
 * labelAsYear 用于年份带：那里年份比一长串「XX的2025年度歌单」更好读。
 * headingLevel 由调用方给：年份带在 section 标题之下，用 h3。
 */
export default function AlbumCard({
  item,
  priority = false,
  labelAsYear = false,
  headingLevel = 'h2'
}) {
  const meta = [item.artist, item.year || ''].filter(Boolean).join(' · ')
  const shown = labelAsYear && item.year ? String(item.year) : item.title
  const isAlbum = item.entryType === '专辑'
  const cardKind = isAlbum ? 'album' : 'playlist'
  return (
    <MusicCard
      className={`cl-music-card--${cardKind}${
        labelAsYear ? ' cl-music-card--year' : ''
      }`}
      href={item.href}
      cover={item.cover}
      coverSeed={item.id}
      coverAlt={`${item.title} — 封面`}
      ariaLabel={`进入《${item.title}》`}
      priority={priority}
      title={shown}
      headingLevel={headingLevel}
      meta={labelAsYear ? '' : meta}>
      {labelAsYear ? null : (
        <span className={`cl-music-kind cl-music-kind--${cardKind}`}>
          {item.entryType}
        </span>
      )}
      {item.trackCount ? <span>{item.trackCount} 首</span> : null}
      {item.hasNotes ? (
        <span className='cl-music-mark' title={`手记 ${item.noteCount} 篇`}>
          手记
        </span>
      ) : null}
    </MusicCard>
  )
}
