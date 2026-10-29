import SmartLink from '@/components/SmartLink'
import MusicCover from './MusicCover'
import NcmLink from './NcmLink'

const KIND_LABEL = { Album: '专辑手记', Single: '单曲手记', Track: '曲目手记' }

/**
 * 手记页的上下文头。三个槽位各放一个字段，别混：
 * kicker=手记类型，歌名槽=歌曲名（专辑手记时退回专辑名），meta=艺人 + 专辑名回链。
 * 专辑已下架或没上架时 albumHref 为空，专辑名降级成纯文本，页面仍完整可读。
 */
export default function NoteHead({ note, context }) {
  // 同名专辑（艺人名 == 专辑名）并排读起来像重复，只留带链接的那个
  const showArtist =
    context.artistLine && context.artistLine !== context.albumTitle
  const albumNode = context.albumTitle ? (
    context.albumHref ? (
      <SmartLink href={context.albumHref}>{context.albumTitle}</SmartLink>
    ) : (
      context.albumTitle
    )
  ) : null

  return (
    <header className='cl-music-note-head'>
      <div className='cl-music-note-cover'>
        <MusicCover
          src={context.cover}
          seed={context.songId || context.albumId || note.id}
          title={context.songTitle || context.albumTitle}
          alt=''
          priority
        />
      </div>
      <div className='cl-music-note-context'>
        <p className='cl-music-kicker'>{KIND_LABEL[note.kind] || '音乐手记'}</p>
        <p className='cl-music-note-song'>
          {context.songTitle || context.albumTitle}
        </p>
        <p className='cl-music-note-meta'>
          {showArtist ? context.artistLine : null}
          {showArtist && albumNode ? ' · ' : null}
          {albumNode}
          <NcmLink href={context.neteaseUrl} label={context.songTitle} />
        </p>
      </div>
    </header>
  )
}
