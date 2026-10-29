import SmartLink from '@/components/SmartLink'
import { formatDuration } from '@/lib/music/tracks'
import MusicCover from './MusicCover'
import NcmLink from './NcmLink'

/**
 * 专辑 / 歌单页的曲目表。每首带自己的封面：合集与歌单里条目封面代表不了每首歌。
 * 点击契约：有手记 → 标题与「手记」入口进手记页；没手记 → 整行不可点，只有右侧外链。
 * 大歌单只存前若干首（脚本按契约截断），这里诚实说明列了多少、一共多少。
 *
 * 用真 table：列头是 th（scope=col），屏幕阅读器逐格能读到「歌曲 / 艺人 / 时长」，
 * 视觉仍是网格 —— 表格元素转 block、行做 grid，列宽走同一组 --cl-music-* token。
 */
export default function TrackList({
  tracks = [],
  status = 'ok',
  error = '',
  albumTitle = '',
  total = 0,
  truncated = false,
  listLabel = '曲目'
}) {
  const headLabels = ['', '#', listLabel, '艺人', '时长', '']

  if (!tracks.length) {
    return (
      <p className='cl-music-tracks-empty'>
        {status === 'invalid'
          ? `曲目数据格式不认识（${error || '契约版本不匹配'}），请在本地重跑 yarn music:refresh`
          : '曲目待同步：本地跑 yarn music:refresh 补上。'}
      </p>
    )
  }

  return (
    <section aria-label={`${albumTitle} ${listLabel}列表`}>
      <table className='cl-music-track-table'>
        <thead>
          <tr className='cl-music-track-head'>
            {headLabels.map((label, i) => (
              <th key={i} scope='col'>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tracks.map(track => {
            const note = track.note
            const artist = Array.isArray(track.artists)
              ? track.artists.join(' / ')
              : String(track.artists || '')
            const duration = formatDuration(track.duration)
            const title = note ? (
              <SmartLink href={note.href}>{track.title}</SmartLink>
            ) : (
              track.title
            )
            return (
              <tr className='cl-music-track' key={`${track.id || track.index}`}>
                <td className='cl-music-track-cover'>
                  <MusicCover
                    src={track.cover}
                    seed={track.id || track.title}
                    title={track.title}
                    alt=''
                  />
                </td>
                <td className='cl-music-track-no'>
                  {String(track.index).padStart(2, '0')}
                </td>
                <td className='cl-music-track-title'>{title}</td>
                <td className='cl-music-track-artist'>{artist}</td>
                <td className='cl-music-track-dur'>{duration}</td>
                <td className='cl-music-track-actions'>
                  {note ? (
                    <SmartLink href={note.href} className='cl-music-track-note'>
                      手记
                    </SmartLink>
                  ) : null}
                  <NcmLink href={track.url} label={track.title} compact />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {truncated ? (
        <p className='cl-music-truncated'>
          共 {total} 首，此处列出前 {tracks.length} 首；完整{listLabel}请到网易云听。
        </p>
      ) : null}
    </section>
  )
}
