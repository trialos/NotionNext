import {
  albumLevelNotes,
  buildNoteIndex,
  singleNotes,
  trackNote
} from '@/lib/music/notes'
import {
  buildAlbumProps,
  buildNoteProps,
  buildShelfItems
} from '@/lib/music/data'
import { parseTracksPayload } from '@/lib/music/tracks'
import contract from '@/lib/music/contract.json'

const albumRow = over => ({
  id: 'a1',
  type: 'MusicAlbum',
  status: 'Published',
  slug: 'album-100',
  title: '缓慢的告别',
  musicArtist: '山本彩',
  musicNcmAlbumId: '100',
  musicCoverUrl: 'http://p1.music.126.net/a/100.jpg',
  musicReleaseDate: { start_date: '2023-05-18' },
  musicTrackCount: '7',
  ...over
})

const noteRow = over => ({
  id: 'n1',
  type: 'MusicNote',
  status: 'Published',
  slug: 'note-200',
  title: '像一场缓慢的告别',
  musicNoteKind: ['Single'],
  musicNcmSongId: '200',
  musicNcmAlbumId: '100',
  musicNoteSongTitle: 'Apocalypse',
  musicNoteAlbumTitle: 'Cigarettes After Sex',
  musicArtist: 'Cigarettes After Sex',
  musicCoverUrl: 'http://p1.music.126.net/a/200.jpg',
  musicReleaseDate: { start_date: '2017-04-07' },
  ...over
})

const tracksResult = tracks =>
  parseTracksPayload(
    JSON.stringify({
      schema: contract.schema,
      v: contract.version,
      albumId: '100',
      syncedAt: '2026-10-29T10:00:00.000Z',
      tracks
    })
  )

describe('手记索引', () => {
  it('只收已发布且有 slug 的 MusicNote', () => {
    const index = buildNoteIndex([
      albumRow(),
      noteRow(),
      noteRow({ id: 'n2', status: 'Invisible' }),
      noteRow({ id: 'n3', slug: '' })
    ])
    expect(index.notes.map(n => n.id)).toEqual(['n1'])
  })

  it('按专辑 ID 与歌曲 ID 分别分组，同一目标按时间倒序', () => {
    const index = buildNoteIndex([
      noteRow({ id: 'old', musicReleaseDate: { start_date: '2020-01-01' } }),
      noteRow({ id: 'new', musicReleaseDate: { start_date: '2026-01-01' } })
    ])
    expect(index.byAlbum.get('100').map(n => n.id)).toEqual(['new', 'old'])
    expect(index.bySong.get('200').map(n => n.id)).toEqual(['new', 'old'])
    expect(singleNotes(index).map(n => n.id)).toEqual(['new', 'old'])
  })

  it('专辑手记条只取 kind=Album；曲目入口取该曲最新一篇', () => {
    const index = buildNoteIndex([
      noteRow({ id: 's', musicNoteKind: ['Single'] }),
      noteRow({ id: 't', musicNoteKind: ['Track'], musicNcmSongId: '201' }),
      noteRow({ id: 'a', musicNoteKind: ['Album'], musicNcmSongId: '' })
    ])
    expect(albumLevelNotes(index, '100').map(n => n.id)).toEqual(['a'])
    expect(trackNote(index, '201')?.id).toBe('t')
    expect(trackNote(index, '200')?.id).toBe('s')
    expect(trackNote(index, 'nope')).toBeNull()
    expect(trackNote(index, '')).toBeNull()
  })
})

describe('展架 A 数据', () => {
  it('专辑行与 kind=Single 的手记行混排成两种卡', () => {
    const { items } = buildShelfItems([albumRow(), noteRow()])
    expect(items.map(i => i.kind)).toEqual(['album', 'single'])
    const single = items[1]
    expect(single.title).toBe('Apocalypse')
    expect(single.noteTitle).toBe('像一场缓慢的告别')
    expect(single.href).toBe('/music/note/note-200')
    expect(single.neteaseUrl).toBe('https://music.163.com/#/song?id=200')
    expect(single.cover).toContain('param=640y640')
  })

  it('专辑/单曲卡都不可点向网易云以外的地方：专辑卡不带外链、单曲卡 href 指向手记', () => {
    const { items } = buildShelfItems([albumRow(), noteRow()])
    expect(items[0].href).toBe('/music/album/album-100')
    expect(items[0].neteaseUrl).toBe('https://music.163.com/#/album?id=100')
    expect(items[1].href).toBe('/music/note/note-200')
  })

  it('下架专辑、未发布手记、非 Single 手记都不进展架', () => {
    const { items } = buildShelfItems([
      albumRow({ musicDelisted: true }),
      noteRow({ status: 'Invisible' }),
      noteRow({ id: 'n9', musicNoteKind: ['Track'] })
    ])
    expect(items).toHaveLength(0)
  })

  it('Invisible 专辑不进展架（但仍可 URL 直达预览）', () => {
    const { items } = buildShelfItems([albumRow({ status: 'Invisible' })])
    expect(items).toHaveLength(0)
  })

  it('排序：精选 → 手排号 → 发行日期倒序 → 行序', () => {
    const { items } = buildShelfItems([
      albumRow({ id: 'plain', slug: 'plain', musicReleaseDate: { start_date: '2024-01-01' } }),
      albumRow({ id: 'old', slug: 'old', musicReleaseDate: { start_date: '2001-01-01' } }),
      albumRow({ id: 'pinned', slug: 'pinned', featured: true }),
      albumRow({ id: 'second', slug: 'second', musicShelfOrder: '2' }),
      albumRow({ id: 'first', slug: 'first', musicShelfOrder: '1' })
    ])
    expect(items.map(i => i.id)).toEqual(['pinned', 'first', 'second', 'plain', 'old'])
  })

  it('专辑卡带手记数量徽标（专辑级与曲目级都算）', () => {
    const { items } = buildShelfItems([
      albumRow(),
      noteRow({ id: 'a', musicNoteKind: ['Album'], musicNcmSongId: '' }),
      noteRow({ id: 't', musicNoteKind: ['Track'], musicNcmSongId: '201' })
    ])
    const album = items.find(i => i.kind === 'album')
    expect(album.noteCount).toBe(2)
    expect(album.hasNotes).toBe(true)
  })

  it('没有内容时返回空数组而不是报错', () => {
    expect(buildShelfItems(undefined).items).toEqual([])
    expect(buildShelfItems([null]).annual).toEqual([])
  })
})

describe('专辑页 D2 数据', () => {
  it('每首曲目带自己的封面与手记入口', () => {
    const result = buildAlbumProps(
      albumRow(),
      [noteRow({ musicNoteKind: ['Track'], musicNcmSongId: '201' })],
      tracksResult([
        { id: '200', title: 'Apocalypse', artists: ['CAS'], duration: 300000, cover: 'http://p/x/200.jpg' },
        { id: '201', title: '潮汐', artists: ['山本彩'], duration: 238000 }
      ])
    )
    expect(result.tracksStatus).toBe('ok')
    expect(result.tracks[0].cover).toContain('param=160y160')
    expect(result.tracks[0].note).toBeNull()
    expect(result.tracks[1].note?.kind).toBe('Track')
    expect(result.tracks[1].url).toBe('https://music.163.com/#/song?id=201')
  })

  it('曲目数缺列时回落到解析出的条数', () => {
    const result = buildAlbumProps(
      albumRow({ musicTrackCount: '' }),
      [],
      tracksResult([{ id: '1', title: 'A' }, { id: '2', title: 'B' }])
    )
    expect(result.album.trackCount).toBe(2)
  })

  it('曲目块坏了时保留专辑信息并给出空态状态', () => {
    const result = buildAlbumProps(albumRow(), [], {
      status: 'invalid',
      payload: null,
      error: 'schema 不匹配'
    })
    expect(result.album.title).toBe('缓慢的告别')
    expect(result.tracks).toEqual([])
    expect(result.tracksStatus).toBe('invalid')
    expect(result.tracksError).toBe('schema 不匹配')
  })

  it('专辑手记条只列 kind=Album', () => {
    const result = buildAlbumProps(
      albumRow(),
      [
        noteRow({ id: 'a', musicNoteKind: ['Album'], musicNcmSongId: '' }),
        noteRow({ id: 's', musicNoteKind: ['Single'] })
      ],
      tracksResult([])
    )
    expect(result.notes.map(n => n.id)).toEqual(['a'])
    expect(result.noteCount).toBe(2)
  })
})

describe('手记页上下文', () => {
  it('关联专辑还在展架 → 返回专辑页', () => {
    const { context } = buildNoteProps(noteRow(), [albumRow()])
    expect(context.albumHref).toBe('/music/album/album-100')
    expect(context.backHref).toBe('/music/album/album-100')
    expect(context.albumTitle).toBeTruthy()
  })

  it('关联专辑已下架 → 退回展架，但快照名字仍然可用', () => {
    const { context } = buildNoteProps(noteRow(), [albumRow({ musicDelisted: true })])
    expect(context.albumHref).toBe('')
    expect(context.backHref).toBe('/music')
    expect(context.albumTitle).toBe('缓慢的告别')
    expect(context.songTitle).toBe('Apocalypse')
  })

  it('关联专辑根本不存在时用行内快照，不编造链接', () => {
    const { context } = buildNoteProps(noteRow(), [])
    expect(context.backHref).toBe('/music')
    expect(context.albumTitle).toBe('Cigarettes After Sex')
    expect(context.neteaseUrl).toBe('https://music.163.com/#/song?id=200')
  })
})

describe('条目类型（专辑 / 歌单 / 年度歌单）', () => {
  const annualRow = (year, over = {}) =>
    albumRow({
      slug: `annual-${year}`,
      title: `NotJabes的${year}年度歌单`,
      musicEntryType: '年度歌单',
      musicReleaseDate: { start_date: `${year}-01-01` },
      musicNcmAlbumId: String(year),
      ...over
    })

  it('年度歌单抽成年份带并按年份倒序，不挤进主网格', () => {
    const { items, annual } = buildShelfItems([
      albumRow(),
      annualRow(2021),
      annualRow(2025),
      annualRow(2019)
    ])
    expect(annual.map(i => i.year)).toEqual([2025, 2021, 2019])
    expect(items.map(i => i.slug)).toEqual(['album-100'])
  })

  it('条目类型空着按「专辑」处理：建列之前的老行不该因此从展架消失', () => {
    const { items, annual } = buildShelfItems([albumRow({ musicEntryType: '' })])
    expect(annual).toHaveLength(0)
    expect(items[0].entryType).toBe('专辑')
  })

  it('收藏的第三方歌单进主网格，卡片标签是「歌单」', () => {
    const { items } = buildShelfItems([
      albumRow({
        slug: 'playlist-9',
        title: '温暖爵士｜咖啡与猫',
        musicEntryType: '歌单',
        musicArtist: '某位 curator',
        musicNcmAlbumId: '6678233267'
      })
    ])
    expect(items[0].entryType).toBe('歌单')
  })

  it('歌单页文案走「歌曲」，并把真实条数与截断标记透传', () => {
    const result = parseTracksPayload(
      JSON.stringify({
        schema: contract.schema,
        v: contract.version,
        kind: 'playlist',
        albumId: '6678233267',
        total: 1191,
        truncated: true,
        tracks: [{ id: '1', title: '一首', duration: 60000 }]
      })
    )
    expect(result.payload.kind).toBe('playlist')
    const props = buildAlbumProps(
      albumRow({ musicEntryType: '歌单' }),
      [],
      result
    )
    expect(props.listLabel).toBe('歌曲')
    expect(props.total).toBe(1191)
    expect(props.truncated).toBe(true)
    expect(props.album.title).toBe('缓慢的告别')
  })

  it('专辑页仍是「曲目」，未截断时不报总数', () => {
    const props = buildAlbumProps(albumRow(), [], tracksResult([{ id: '1', title: 'K.' }]))
    expect(props.listLabel).toBe('曲目')
    expect(props.truncated).toBe(false)
    expect(props.total).toBe(1)
  })
})

describe('展架顺序只认手势', () => {
  const row = (slug, over) =>
    albumRow({ slug, musicNcmAlbumId: slug, ...over })

  it('填了「展架排序」的按号排，没填的排后面 —— 发行日期不再自动插队', () => {
    const { items } = buildShelfItems([
      row('newest', { musicReleaseDate: { start_date: '2026-01-01' } }),
      row('second', {
        musicShelfOrder: '2',
        musicReleaseDate: { start_date: '2011-01-01' }
      }),
      row('first', {
        musicShelfOrder: '1',
        musicReleaseDate: { start_date: '2009-01-01' }
      })
    ])
    // 没填排序号的 2026 那张必须垫底，而不是按日期跑到最前
    expect(items.map(i => i.slug)).toEqual(['first', 'second', 'newest'])
  })

  it('「精选」仍然置顶，但组内还是按排序号', () => {
    const { items } = buildShelfItems([
      row('a', { musicShelfOrder: '1' }),
      row('b', { musicShelfOrder: '9', featured: true }),
      row('c', { musicShelfOrder: '1', featured: true })
    ])
    expect(items.map(i => i.slug)).toEqual(['c', 'b', 'a'])
  })

  it('年份带也听排序号：没填才按年份倒序', () => {
    const annual = year =>
      row(`y${year}`, {
        musicEntryType: '年度歌单',
        musicReleaseDate: { start_date: `${year}-01-01` }
      })
    const { annual: band } = buildShelfItems([
      annual(2019),
      annual(2025),
      annual(2023)
    ])
    expect(band.map(i => i.year)).toEqual([2025, 2023, 2019])

    const forced = buildShelfItems([
      { ...annual(2025), musicShelfOrder: undefined },
      row('y2019', {
        musicEntryType: '年度歌单',
        musicReleaseDate: { start_date: '2019-01-01' },
        musicShelfOrder: '1'
      })
    ])
    expect(forced.annual.map(i => i.year)).toEqual([2019, 2025])
  })
})
