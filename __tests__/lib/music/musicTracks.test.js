import {
  findTracksBlock,
  normalizeTracks,
  parseTracksPayload
} from '@/lib/music/tracks'
import contract from '@/lib/music/contract.json'

const PAGE_ID = 'page-1'

function segments(text, size = contract.tracksBlock.chunkChars) {
  const out = []
  for (let i = 0; i < text.length; i += size) {
    out.push([text.slice(i, i + size), []])
  }
  return out.length ? out : [['', []]]
}

function block(id, value) {
  return [id, { id, value: { value } }]
}

function codeBlock(id, text) {
  return block(id, {
    type: 'code',
    content: [],
    format: { language: contract.tracksBlock.language },
    properties: { title: segments(text) }
  })
}

function toggleBlock(id, childIds, title = contract.tracksBlock.toggleTitle) {
  return block(id, {
    type: 'toggle',
    content: childIds,
    properties: { title: segments(title) }
  })
}

function blockMap(childIds, extra = []) {
  return {
    block: Object.fromEntries([
      block(PAGE_ID, { type: 'page', content: childIds, properties: {} }),
      ...extra
    ])
  }
}

const payload = (tracks, over = {}) =>
  JSON.stringify({
    schema: contract.schema,
    v: contract.version,
    albumId: '277294562',
    syncedAt: '2026-10-29T10:00:00.000Z',
    tracks,
    ...over
  })

const oneTrack = [{ id: 2722532807, title: '二十岁', artists: ['宝石Gem'], duration: 204782 }]

describe('normalizeTracks', () => {
  it('丢掉没标题的条目、按 ID 去重、补 index', () => {
    const out = normalizeTracks([
      { id: 1, title: 'A' },
      { id: 1, title: 'A 重复' },
      { id: 2, title: '   ' },
      { id: 3, title: 'B' },
      null
    ])
    expect(out.map(t => t.id)).toEqual(['1', '3'])
    expect(out.map(t => t.index)).toEqual([1, 2])
  })

  it('艺人去重成字符串数组，时长取整毫秒', () => {
    const [track] = normalizeTracks([
      {
        id: 9,
        title: 'X',
        artists: ['甲', '甲', { name: '乙' }, ''],
        duration: 204782.6
      }
    ])
    expect(track.artists).toEqual(['甲', '乙'])
    expect(track.duration).toBe(204783)
  })

  it('disc/no 齐全时按碟号排序，否则保持接口顺序', () => {
    const sorted = normalizeTracks([
      { id: 2, title: 'B', disc: 1, no: 2 },
      { id: 1, title: 'A', disc: 1, no: 1 },
      { id: 3, title: 'C', disc: 2, no: 1 }
    ])
    expect(sorted.map(t => t.title)).toEqual(['A', 'B', 'C'])

    const kept = normalizeTracks([
      { id: 2, title: 'B' },
      { id: 1, title: 'A' }
    ])
    expect(kept.map(t => t.title)).toEqual(['B', 'A'])
  })

  it('封面强制 https，缺链接时由歌曲 ID 现拼外链', () => {
    const [track] = normalizeTracks([
      { id: 5, title: 'T', cover: 'http://p1.music.126.net/a/b.jpg' }
    ])
    expect(track.cover).toBe('https://p1.music.126.net/a/b.jpg')
    expect(track.url).toBe('https://music.163.com/#/song?id=5')
  })
})

describe('parseTracksPayload', () => {
  it('契约匹配时返回归一化曲目', () => {
    const r = parseTracksPayload(payload(oneTrack))
    expect(r.status).toBe('ok')
    expect(r.payload.albumId).toBe('277294562')
    expect(r.payload.tracks[0].title).toBe('二十岁')
  })

  it('空内容算 empty，不报错', () => {
    expect(parseTracksPayload('')).toMatchObject({ status: 'empty' })
    expect(parseTracksPayload('   ')).toMatchObject({ status: 'empty' })
  })

  it('schema / 版本 / 语法 / 空曲目都归为 invalid 并带原因', () => {
    expect(parseTracksPayload('不是 JSON')).toMatchObject({ status: 'invalid' })
    expect(
      parseTracksPayload(JSON.stringify({ schema: 'other', tracks: oneTrack }))
    ).toMatchObject({ status: 'invalid' })
    expect(
      parseTracksPayload(JSON.stringify({ schema: contract.schema, v: 99, tracks: oneTrack }))
    ).toMatchObject({ status: 'invalid' })
    expect(
      parseTracksPayload(JSON.stringify({ schema: contract.schema, v: 1, tracks: [] }))
    ).toMatchObject({ status: 'invalid' })
  })
})

describe('findTracksBlock', () => {
  it('直接子级的代码块能认出来', () => {
    const map = blockMap(['c1'], [codeBlock('c1', payload(oneTrack))])
    const r = findTracksBlock(map, PAGE_ID)
    expect(r).toMatchObject({ status: 'ok', blockId: 'c1' })
  })

  it('藏在折叠 toggle 里的代码块也能认出来', () => {
    const map = blockMap(
      ['t1'],
      [toggleBlock('t1', ['c1']), codeBlock('c1', payload(oneTrack))]
    )
    expect(findTracksBlock(map, PAGE_ID)).toMatchObject({ status: 'ok', blockId: 'c1' })
  })

  it('分片写进同一个代码块的长 JSON 会先拼接再解析', () => {
    const long = payload(
      Array.from({ length: 40 }, (_, i) => ({ id: i + 1, title: `曲目 ${i + 1} —— 一个足够长的名字来撑爆单段富文本` }))
    )
    expect(long.length).toBeGreaterThan(contract.tracksBlock.chunkChars)
    const map = blockMap(['c1'], [codeBlock('c1', long)])
    const r = findTracksBlock(map, PAGE_ID)
    expect(r).toMatchObject({ status: 'ok' })
    expect(r.payload.tracks).toHaveLength(40)
  })

  it('没有代码块 → empty；有标记但内容坏了 → invalid（页面据此出空态而不是 404）', () => {
    expect(findTracksBlock(blockMap([]), PAGE_ID)).toMatchObject({ status: 'empty' })
    const broken = blockMap(['c1'], [codeBlock('c1', '{"schema":"broken"}')])
    expect(findTracksBlock(broken, PAGE_ID)).toMatchObject({
      status: 'invalid',
      blockId: 'c1'
    })
  })

  it('页面 content 丢了时全量兜底扫描', () => {
    const map = {
      block: {
        ...Object.fromEntries([block(PAGE_ID, { type: 'page', properties: {} })]),
        ...Object.fromEntries([codeBlock('c9', payload(oneTrack))])
      }
    }
    expect(findTracksBlock(map, PAGE_ID)).toMatchObject({ status: 'ok', blockId: 'c9' })
  })

  it('blockMap 缺失不炸', () => {
    expect(findTracksBlock(null, PAGE_ID)).toMatchObject({ status: 'empty' })
    expect(findTracksBlock({ block: {} }, PAGE_ID)).toMatchObject({ status: 'empty' })
  })
})
