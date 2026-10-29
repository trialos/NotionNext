import PageMast from '../PageMast'
import AlbumCard from './AlbumCard'
import SingleCard from './SingleCard'

/**
 * 展架 A：专辑与单曲手记混排在同一 1:1 网格，年度歌单单独一条年份带。
 * 顺序由 lib/music/data.js 决定（精选 → 手排序 → 发行日期 → 行序），这里不再排。
 */
export default function MusicShelf({ items = [], annual = [] }) {
  const years = annual.map(item => item.year).filter(Boolean)
  const yearRange = years.length
    ? years.length > 1
      ? `${years[years.length - 1]}—${years[0]}`
      : String(years[0])
    : ''

  return (
    <div className='cl-music-shelf w-full'>
      <PageMast
        className='cl-page-mast--section cl-page-mast--music'
        eyebrow='MUSIC · 唱片'
        title='我的音乐'
        description='对我而言音乐是一种时间的标签，定位和回忆'
      />

      {annual.length ? (
        <section className='cl-music-band' aria-label='年度歌单'>
          <h2 className='cl-music-band-head'>
            <span className='cl-music-band-title'>年度歌单</span>
            {yearRange ? (
              <span className='cl-music-band-range'>{yearRange}</span>
            ) : null}
          </h2>
          <div className='cl-music-band-grid'>
            {annual.map(item => (
              <AlbumCard key={item.id} item={item} labelAsYear headingLevel='h3' />
            ))}
          </div>
        </section>
      ) : null}

      {items.length ? (
        <section className='cl-music-grid' aria-label='唱片'>
          {items.map((item, index) =>
            item.kind === 'single' ? (
              <SingleCard key={item.id} item={item} priority={index < 2} />
            ) : (
              <AlbumCard key={item.id} item={item} priority={index < 2} />
            )
          )}
        </section>
      ) : (
        <p className='cl-music-empty'>
          展架还空着。把网易云的专辑或歌单链接发给 Qoder，我建第一张。
        </p>
      )}
    </div>
  )
}
