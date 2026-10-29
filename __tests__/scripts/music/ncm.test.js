import { parseNeteaseRef, publicSongDetail } from '../../../scripts/music/ncm.mjs'
import { contract } from '../../../scripts/music/contract.mjs'

describe('识别网易云链接', () => {
  it('网页链接取 kind + 数字 ID', () => {
    expect(
      parseNeteaseRef('https://music.163.com/#/album?id=277294562')
    ).toEqual({ kind: 'album', id: '277294562' })
    expect(
      parseNeteaseRef('https://music.163.com/#/song?id=2722532807')
    ).toEqual({ kind: 'song', id: '2722532807' })
  })

  it('App 分享链与裸参数形式也认', () => {
    expect(
      parseNeteaseRef('https://music.163.com/m/album?id=144983009&uctour=sks')
    ).toEqual({ kind: 'album', id: '144983009' })
    expect(parseNeteaseRef('music.163.com/#/song?song_id=123')).toEqual({
      kind: 'song',
      id: '123'
    })
  })

  it('裸数字要配合 --type，否则不知道是专辑还是歌', () => {
    expect(parseNeteaseRef('277294562', { type: 'album' })).toEqual({
      kind: 'album',
      id: '277294562'
    })
    expect(parseNeteaseRef('277294562', { type: 'song' })).toEqual({
      kind: 'song',
      id: '277294562'
    })
    expect(parseNeteaseRef('277294562')).toEqual({ kind: '', id: '277294562' })
  })

  it('歌单明确识别出来，好给出「v1 不支持」的准确提示', () => {
    expect(parseNeteaseRef('https://music.163.com/#/playlist?id=123')).toEqual({
      kind: 'playlist',
      id: '123'
    })
  })

  it('认不出的输入不报错也不硬编 ID', () => {
    expect(parseNeteaseRef('')).toEqual({ kind: '', id: '' })
    expect(parseNeteaseRef('不是链接')).toEqual({ kind: '', id: '', raw: '不是链接' })
    expect(parseNeteaseRef('EB58FDA47887FB3CDC865137EFF67642')).toEqual({
      kind: '',
      id: '',
      raw: 'EB58FDA47887FB3CDC865137EFF67642'
    })
  })

  it('拼出的外链与站点契约前缀一致（两侧不能各写一份）', () => {
    expect(contract.netease.album).toMatch(/^https:\/\/music\.163\.com\/#\/album\?id=/)
  })
})

describe('单曲公开接口', () => {
  function stubJson(replies) {
    const calls = []
    let index = 0
    global.fetch = jest.fn(async url => {
      calls.push(String(url))
      const reply = replies[Math.min(index, replies.length - 1)]
      index += 1
      return {
        ok: reply.status < 400,
        status: reply.status,
        json: async () => reply.json
      }
    })
    return calls
  }

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('取 songs 第一条，请求只带数字 ID', async () => {
    const calls = stubJson([
      { status: 200, json: { songs: [{ id: 2722532807, name: '二十岁' }], code: 200 } }
    ])
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const song = await publicSongDetail('2722532807')
    expect(song.name).toBe('二十岁')
    expect(calls[0]).toContain('music.163.com/api/song/detail')
    expect(calls[0]).toContain('ids=%5B2722532807%5D')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('偶发 5xx 会重试，不是一次就放弃', async () => {
    const calls = stubJson([
      { status: 503, json: {} },
      { status: 200, json: { songs: [{ id: 1, name: 'ok' }] } }
    ])
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const song = await publicSongDetail('1')
    expect(song.name).toBe('ok')
    expect(calls).toHaveLength(2)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('取不到歌时返回 null，由上层决定报错文案', async () => {
    stubJson([{ status: 200, json: { songs: [], code: 200 } }])
    await expect(publicSongDetail('9')).resolves.toBeNull()
  })
})
