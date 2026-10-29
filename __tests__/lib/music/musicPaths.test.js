import {
  albumIdOf,
  albumPath,
  isAlbumNote,
  isDelisted,
  isMusicType,
  isPublished,
  isShelfVisible,
  isSingleNote,
  neteaseAlbumUrl,
  neteaseSongUrl,
  neteaseUrlOf,
  notePath,
  numericId,
  parseShelfOrder,
  releaseDateOf,
  trackCountOf,
  yearOf
} from '@/lib/music/paths'
import { coverSourceOf, coverSrc, neteaseCover, pickCoverTier } from '@/lib/music/images'

const album = over => ({
  type: 'MusicAlbum',
  status: 'Published',
  slug: 'album-277294562',
  title: '缓慢的告别',
  musicArtist: '山本彩',
  musicNcmAlbumId: '277294562',
  musicCoverUrl: 'http://p1.music.126.net/abc/123.jpg',
  musicReleaseDate: { start_date: '2023-05-18' },
  musicTrackCount: '7',
  ...over
})

describe('音乐类型与可见性', () => {
  it('只认 MusicAlbum / MusicNote 两个 type', () => {
    expect(isMusicType('MusicAlbum')).toBe(true)
    expect(isMusicType('MusicNote')).toBe(true)
    expect(isMusicType('Photo')).toBe(false)
    expect(isMusicType(undefined)).toBe(false)
  })

  it('展架可见 = 已发布 且 未被机器下架', () => {
    expect(isShelfVisible(album())).toBe(true)
    expect(isShelfVisible(album({ musicDelisted: true }))).toBe(false)
    expect(isShelfVisible(album({ status: 'Invisible' }))).toBe(false)
  })

  it('Invisible 仍算已收录（可 URL 直达预览），只是不上架', () => {
    const draft = album({ status: 'Invisible' })
    expect(isPublished(draft)).toBe(false)
    expect(isShelfVisible(draft)).toBe(false)
  })

  it('「已下架」只认真值，缺列/未勾选都不算下架', () => {
    expect(isDelisted(album())).toBe(false)
    expect(isDelisted(album({ musicDelisted: undefined }))).toBe(false)
    expect(isDelisted(album({ musicDelisted: true }))).toBe(true)
  })
})

describe('音乐 ID 与外链', () => {
  it('numericId 只留数字，容忍空格与脏值', () => {
    expect(numericId(' 277294562 ')).toBe('277294562')
    expect(numericId('ID: 277294562')).toBe('277294562')
    expect(numericId(['277294562'])).toBe('277294562')
    expect(numericId('')).toBe('')
    expect(numericId(undefined)).toBe('')
  })

  it('外链由数字 ID 现拼，不信任存下来的串', () => {
    expect(neteaseAlbumUrl('277294562')).toBe(
      'https://music.163.com/#/album?id=277294562'
    )
    expect(neteaseSongUrl(2722532807)).toBe(
      'https://music.163.com/#/song?id=2722532807'
    )
    expect(neteaseSongUrl('abc')).toBe('')
  })

  it('neteaseUrlOf：已存链接优先，其次歌曲 ID，再次专辑 ID', () => {
    expect(
      neteaseUrlOf(album({ musicNeteaseUrl: 'https://music.163.com/#/album?id=1' }))
    ).toBe('https://music.163.com/#/album?id=1')
    expect(neteaseUrlOf(album({ musicNcmSongId: '456' }))).toBe(
      'https://music.163.com/#/song?id=456'
    )
    expect(neteaseUrlOf(album())).toBe('https://music.163.com/#/album?id=277294562')
  })

  it('albumIdOf 读取网易云专辑 ID 列', () => {
    expect(albumIdOf(album())).toBe('277294562')
    expect(albumIdOf({})).toBe('')
  })
})

describe('音乐路径', () => {
  it('专辑与手记各自一段路径，中文 slug 会被编码', () => {
    expect(albumPath('album-1')).toBe('/music/album/album-1')
    expect(notePath('/note-1/')).toBe('/music/note/note-1')
    expect(notePath('夜航')).toBe('/music/note/' + encodeURIComponent('夜航'))
  })

  it('空 slug 不产出半截 URL', () => {
    expect(albumPath('')).toBe('')
    expect(albumPath(undefined)).toBe('')
    expect(notePath('  /  ')).toBe('')
  })
})

describe('音乐字段解析', () => {
  it('noteKind 是 select，取数后是数组也要认', () => {
    const single = { type: 'MusicNote', musicNoteKind: ['Single'] }
    expect(isSingleNote(single)).toBe(true)
    expect(isAlbumNote({ type: 'MusicNote', musicNoteKind: ['Album'] })).toBe(true)
    expect(isSingleNote({ type: 'MusicNote', musicNoteKind: 'Single' })).toBe(true)
    expect(isSingleNote({ type: 'MusicNote' })).toBe(false)
  })

  it('发行日期支持对象与字符串两种形状，年份取四位数', () => {
    expect(releaseDateOf(album())).toBe('2023-05-18')
    expect(releaseDateOf({ musicReleaseDate: '2021-11-02T00:00:00.000Z' })).toBe(
      '2021-11-02'
    )
    expect(yearOf(album())).toBe(2023)
    expect(yearOf({})).toBe(0)
  })

  it('展架排序解析失败排最后，0 是合法值', () => {
    expect(parseShelfOrder('3')).toBe(3)
    expect(parseShelfOrder(' 07 ')).toBe(7)
    expect(parseShelfOrder('0')).toBe(0)
    expect(parseShelfOrder('')).toBeNull()
    expect(parseShelfOrder('第三')).toBeNull()
    expect(trackCountOf(album())).toBe(7)
    expect(trackCountOf(album({ musicTrackCount: '约 12 首' }))).toBe(12)
    expect(trackCountOf({})).toBe(0)
  })
})

describe('网易云封面取档', () => {
  it('按显示宽×DPR 向上取一档，超上限取最高档', () => {
    expect(pickCoverTier(0)).toBe(160)
    expect(pickCoverTier(160)).toBe(160)
    expect(pickCoverTier(161)).toBe(320)
    expect(pickCoverTier(5000)).toBe(1024)
  })

  it('强制 https、剥掉旧 param、保留其它 query', () => {
    expect(neteaseCover('http://p1.music.126.net/a/b.jpg', 260)).toBe(
      'https://p1.music.126.net/a/b.jpg?param=640y640'
    )
    expect(neteaseCover('https://p1.music.126.net/a/b.jpg?param=60y60', 48)).toBe(
      'https://p1.music.126.net/a/b.jpg?param=160y160'
    )
    expect(neteaseCover('https://p1.music.126.net/a/b.jpg?k=1&param=9y9', 48)).toBe(
      'https://p1.music.126.net/a/b.jpg?k=1&param=160y160'
    )
  })

  it('非 http 地址不拼参数（Notion 反代有自己的档位规则）', () => {
    expect(neteaseCover('/image/abc.jpg', 260)).toBe('')
    expect(neteaseCover('', 260)).toBe('')
  })

  it('封面来源优先级：自定义 > 网易云 > Notion 页面封面', () => {
    expect(coverSourceOf(album()).source).toBe('ncm')
    expect(coverSourceOf(album({ musicCoverOverride: 'https://x/y.jpg' })).url).toBe(
      'https://x/y.jpg'
    )
    const onlyNotion = { pageCoverThumbnail: 'https://www.notion.so/image/abc' }
    expect(coverSourceOf(onlyNotion).source).toBe('notion')
    expect(coverSrc(onlyNotion, 260)).toBe('https://www.notion.so/image/abc')
    expect(coverSourceOf({}).source).toBe('')
    expect(coverSrc(album({ musicCoverUrl: '' }), 260)).toBe('')
  })
})
