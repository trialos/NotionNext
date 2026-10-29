import { parseTracksPayload } from '@/lib/music/tracks'
import contract from '@/lib/music/contract.json'
import {
  artistLine,
  chunkRichText,
  clipText,
  dateInShanghai,
  httpsCover,
  normalizeAlbum,
  normalizeNote,
  normalizeSingle,
  syncHash,
  tracksToggleBlock
} from '../../../scripts/music/normalize.mjs'

const P = contract.properties
const TYPES = contract.types

const cliDetail = {
  originalId: 277294562,
  id: 'C5D747553C38D0D5356EBA19CB37C322',
  name: '二十岁',
  coverImgUrl: 'http://p1.music.126.net/abc/109951171462194133.jpg',
  publishTime: 1752595200000,
  company: '某某唱片',
  language: '国语',
  description: '这是&nbsp;一段&thinsp;描述',
  artists: [{ name: '宝石Gem' }, { name: '宝石Gem' }]
}

const cliTracks = [
  {
    id: 'EB58FDA47887FB3CDC865137EFF67642',
    originalId: 2722532807,
    name: '二十岁',
    duration: 204782,
    artists: [{ name: '宝石Gem' }],
    coverImgUrl: 'http://p1.music.126.net/def/1.jpg?param=60y60',
    album: { originalId: 277294562, id: 'C5D7', name: '二十岁' }
  }
]

/** 公开接口 /api/v1/album/<id> 的字段名与 CLI 完全不同 */
const publicSongs = [
  {
    id: 2722532807,
    title: '二十岁',
    dt: 204782,
    ar: [{ id: 12084497, name: '宝石Gem' }],
    al: {
      id: 277294562,
      name: '二十岁',
      picUrl: 'http://p1.music.126.net/def/1.jpg',
      publishTime: 1752595200000
    },
    cd: '01',
    no: 1
  }
]

describe('清洗：字段归一', () => {
  it('网易云时间戳按上海时区取日，不按 UTC（否则整体偏一天）', () => {
    expect(dateInShanghai(1752595200000)).toBe('2025-07-16')
    expect(dateInShanghai(0)).toBe('')
    expect(dateInShanghai('abc')).toBe('')
  })

  it('同一张图轮换 p1/p2/p3 主机时归一到 p1，避免每次刷新都算变化', () => {
    const path = '/qWv-LvAUKuvRU86tqu00jg==/109951173953378964.jpg'
    expect(httpsCover(`http://p2.music.126.net${path}?param=302y302`)).toBe(
      `https://p1.music.126.net${path}`
    )
    expect(httpsCover(`https://p3.music.163.com${path}`)).toBe(
      `https://p1.music.163.com${path}`
    )
  })

  it('封面强制 https 并剥掉尺寸参数，留给站点按显示宽重新取档', () => {
    expect(httpsCover('http://p1.music.126.net/a/b.jpg?param=60y60')).toBe(
      'https://p1.music.126.net/a/b.jpg'
    )
    expect(httpsCover('/local/b.jpg')).toBe('')
  })

  it('艺人去重后用 / 连接', () => {
    expect(artistLine([{ name: '甲' }, '甲', { name: '乙' }])).toBe('甲 / 乙')
  })

  it('描述解实体、折叠空白并限长', () => {
    expect(clipText('a&nbsp;b   c')).toBe('a b c')
    expect(clipText('x'.repeat(3000), 100).length).toBe(100)
  })
})

describe('清洗：专辑载荷', () => {
  it('CLI 形状 → 机器属性齐全，且写出的 JSON 能被站点解析器接受', () => {
    const result = normalizeAlbum({ detail: cliDetail, tracks: cliTracks, encryptedId: 'C5D7' })

    expect(result.title).toBe('二十岁')
    expect(result.properties[P.ncmAlbumId]).toBe('277294562')
    expect(result.properties[P.ncmEncryptedId]).toBe('C5D7')
    expect(result.properties[P.artistLine]).toBe('宝石Gem')
    expect(result.properties[P.releaseDate]).toBe('2025-07-16')
    expect(result.properties[P.trackCount]).toBe('1')
    expect(result.properties[P.neteaseUrl]).toBe('https://music.163.com/#/album?id=277294562')
    expect(result.properties[P.delisted]).toBe(false)

    const roundTrip = parseTracksPayload(JSON.stringify(result.payload))
    expect(roundTrip.status).toBe('ok')
    expect(roundTrip.payload.tracks[0]).toMatchObject({
      id: '2722532807',
      title: '二十岁',
      duration: 204782,
      index: 1,
      url: 'https://music.163.com/#/song?id=2722532807'
    })
    expect(roundTrip.payload.tracks[0].cover).toBe('https://p1.music.126.net/def/1.jpg')
  })

  it('公开接口形状（ar/al/dt/cd/no）清洗后与 CLI 结果一致', () => {
    const fromCli = normalizeAlbum({ detail: cliDetail, tracks: cliTracks })
    const fromPublic = normalizeAlbum({
      detail: {
        originalId: 277294562,
        name: '二十岁',
        coverImgUrl: 'http://p1.music.126.net/abc/1.jpg',
        publishTime: 1752595200000,
        artists: [{ name: '宝石Gem' }]
      },
      tracks: publicSongs
    })
    expect(fromPublic.payload.tracks[0].id).toBe(fromCli.payload.tracks[0].id)
    expect(fromPublic.payload.tracks[0].artists).toEqual(fromCli.payload.tracks[0].artists)
    expect(fromPublic.properties[P.trackCount]).toBe('1')
  })

  it('没有任何有效曲目时不产出空载荷', () => {
    const result = normalizeAlbum({ detail: cliDetail, tracks: [{ id: 1 }] })
    expect(result.payload.tracks).toEqual([])
    expect(parseTracksPayload(JSON.stringify(result.payload)).status).toBe('invalid')
  })
})

describe('清洗：同步哈希', () => {
  const base = normalizeAlbum({ detail: cliDetail, tracks: cliTracks }).payload

  it('键序与 syncedAt 不影响哈希', () => {
    // 重排必须带上全部字段：少一个字段就是真的变了，哈希本来就该不同
    const reordered = {
      tracks: base.tracks,
      v: base.v,
      albumId: base.albumId,
      schema: base.schema,
      kind: base.kind,
      total: base.total,
      truncated: base.truncated,
      syncedAt: '1999-01-01'
    }
    expect(syncHash(reordered)).toBe(syncHash(base))
  })

  it('曲目内容变化必须改哈希', () => {
    const changed = JSON.parse(JSON.stringify(base))
    changed.tracks[0].title = '换了个名字'
    expect(syncHash(changed)).not.toBe(syncHash(base))
  })
})

describe('清洗：手记', () => {
  it('单曲手记一行同时给出卡片字段与关联字段', () => {
    const single = normalizeSingle({ song: publicSongs[0] })
    expect(single.properties[P.noteKind]).toBe('Single')
    expect(single.properties[P.ncmSongId]).toBe('2722532807')
    expect(single.properties[P.noteSongTitle]).toBe('二十岁')
    expect(single.properties[P.coverUrl]).toBe('https://p1.music.126.net/def/1.jpg')
    expect(single.properties[P.releaseDate]).toBe('2025-07-16')
    expect(single.properties[P.neteaseUrl]).toBe('https://music.163.com/#/song?id=2722532807')
    expect(single.seeds.title).toContain('二十岁')
  })

  it('曲目手记填关联、快照与展示上下文，不碰正文字段', () => {
    const note = normalizeNote({ kind: 'Track', song: publicSongs[0] })
    expect(Object.keys(note.properties)).toEqual([
      P.noteKind,
      P.ncmSongId,
      P.ncmAlbumId,
      P.noteSongTitle,
      P.noteAlbumTitle,
      P.artistLine,
      P.coverUrl,
      P.releaseDate,
      P.neteaseUrl
    ])
    expect(note.properties[P.ncmAlbumId]).toBe('277294562')
    // 手记页要靠这几列显示歌名/封面，专辑行不在架上也得能渲染
    expect(note.type).toBe(TYPES.note)
    expect(note.properties[P.coverUrl]).toMatch(/^https:\/\//)
  })

  it('专辑手记用专辑详情填快照', () => {
    const note = normalizeNote({ kind: 'Album', album: cliDetail })
    expect(note.properties[P.noteKind]).toBe('Album')
    expect(note.properties[P.noteAlbumTitle]).toBe('二十岁')
    expect(note.properties[P.ncmAlbumId]).toBe('277294562')
  })
})

describe('清洗：折叠块写入形状', () => {
  it('长 JSON 分片写进同一个代码块，拼接后仍是原文', () => {
    const payload = normalizeAlbum({
      detail: cliDetail,
      tracks: Array.from({ length: 60 }, (_, i) => ({
        id: 1000 + i,
        name: `第 ${i + 1} 首 · 一个足够长的中文歌名用来把 JSON 撑过单段上限`,
        dt: 200000,
        ar: [{ name: '某人' }],
        al: { id: 277294562, name: '二十岁', picUrl: 'http://p/1.jpg' }
      }))
    }).payload

    const text = JSON.stringify(payload, null, 2)
    expect(text.length).toBeGreaterThan(contract.tracksBlock.chunkChars)

    const block = tracksToggleBlock(payload)
    expect(block.type).toBe('toggle')
    expect(block.toggle.rich_text[0].text.content).toBe(contract.tracksBlock.toggleTitle)

    const code = block.toggle.children[0]
    expect(code.type).toBe('code')
    expect(code.code.language).toBe('json')
    expect(code.code.rich_text.length).toBeGreaterThan(1)
    expect(
      code.code.rich_text.every(
        part =>
          part.type === 'text' &&
          part.text.content.length <= contract.tracksBlock.chunkChars
      )
    ).toBe(true)
    expect(code.code.rich_text.map(part => part.text.content).join('')).toBe(text)

    expect(
      parseTracksPayload(
        code.code.rich_text.map(part => part.text.content).join('')
      ).status
    ).toBe('ok')
  })

  it('chunkRichText 空文本给一个空格，Notion 不接受空 rich_text', () => {
    expect(chunkRichText('')).toEqual([{ type: 'text', text: { content: ' ' } }])
  })
})
