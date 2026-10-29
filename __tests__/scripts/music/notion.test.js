import {
  buildProperty,
  createNotionClient,
  isEmptyValue,
  propertyValue
} from '../../../scripts/music/notion.mjs'
import { P, TYPES, contract } from '../../../scripts/music/contract.mjs'

const token = 'secret-token-for-tests'
const dataSourceId = 'ds-1'

function mockFetch(handler) {
  const calls = []
  global.fetch = jest.fn(async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined
    calls.push({ url: String(url), method: init.method || 'GET', body, headers: init.headers })
    const reply = handler(String(url), { method: init.method || 'GET', body }) || {}
    return {
      ok: reply.status === undefined ? true : reply.status < 400,
      status: reply.status ?? 200,
      headers: { get: name => reply.headers?.[String(name).toLowerCase()] ?? null },
      text: async () => (reply.json === undefined ? '' : JSON.stringify(reply.json))
    }
  })
  return calls
}

beforeEach(() => {
  jest.restoreAllMocks()
})

describe('客户端配置', () => {
  it('缺 token 或缺 data source 就直接报错', () => {
    expect(() => createNotionClient({ dataSourceId })).toThrow(/NOTION_API_TOKEN/)
    expect(() => createNotionClient({ token })).toThrow(/NOTION_POSTS_DATA_SOURCE_ID/)
  })

  it('请求头带 Bearer 与 Notion-Version，绝不写进日志', () => {
    const calls = mockFetch(() => ({ json: { properties: {} } }))
    const api = createNotionClient({ token, dataSourceId })
    return api.getSchema().then(() => {
      expect(calls[0].headers.Authorization).toBe(`Bearer ${token}`)
      expect(calls[0].headers['Notion-Version']).toBeTruthy()
      expect(calls[0].url).toBe(`https://api.notion.com/v1/data_sources/${dataSourceId}`)
    })
  })
})

describe('属性读写', () => {
  it('按列类型产出载荷，不认识的列返回 null', () => {
    expect(buildProperty({ type: 'rich_text' }, 'abc')).toEqual({
      rich_text: [{ type: 'text', text: { content: 'abc' } }]
    })
    expect(buildProperty({ type: 'select' }, 'Published')).toEqual({
      select: { name: 'Published' }
    })
    expect(buildProperty({ type: 'status' }, 'Published')).toEqual({
      status: { name: 'Published' }
    })
    expect(buildProperty({ type: 'checkbox' }, false)).toEqual({ checkbox: false })
    expect(buildProperty({ type: 'date' }, '2026-10-29')).toEqual({
      date: { start: '2026-10-29' }
    })
    expect(buildProperty({ type: 'title' }, '')).toBeNull()
    expect(buildProperty({ type: 'relation' }, 'x')).toBeNull()
    expect(buildProperty(undefined, 'x')).toBeNull()
  })

  it('长文本分片，拼回去仍是原文', () => {
    const long = 'x'.repeat(4200)
    const parts = buildProperty({ type: 'rich_text' }, long).rich_text
    expect(parts.length).toBe(3)
    expect(parts.map(p => p.text.content).join('')).toBe(long)
  })

  it('官方 API 各种列形状都能读成 JS 值', () => {
    const page = {
      properties: {
        t: { type: 'title', title: [{ plain_text: '标题' }] },
        r: { type: 'rich_text', rich_text: [{ plain_text: 'a' }, { plain_text: 'b' }] },
        s: { type: 'select', select: { name: 'MusicAlbum' } },
        m: { type: 'multi_select', multi_select: [{ name: 'x' }] },
        d: { type: 'date', date: { start: '2026-10-29', end: '2026-11-01' } },
        c: { type: 'checkbox', checkbox: true },
        missing: { type: 'formula' }
      }
    }
    expect(propertyValue(page, 't')).toBe('标题')
    expect(propertyValue(page, 'r')).toBe('ab')
    expect(propertyValue(page, 's')).toBe('MusicAlbum')
    expect(propertyValue(page, 'm')).toEqual(['x'])
    expect(propertyValue(page, 'd')).toEqual({ start: '2026-10-29', end: '2026-11-01' })
    expect(propertyValue(page, 'c')).toBe(true)
    expect(propertyValue(page, 'missing')).toBeUndefined()
    expect(propertyValue(page, 'nope')).toBeUndefined()
  })

  it('「空」的判断只认真空：false 与 0 都不算空', () => {
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue('   ')).toBe(true)
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue([])).toBe(true)
    expect(isEmptyValue({})).toBe(true)
    expect(isEmptyValue(false)).toBe(false)
    expect(isEmptyValue(0)).toBe(false)
  })
})

describe('建页与改页', () => {
  it('type 查询走所选视图的 data source，并跟分页游标', async () => {
    const calls = mockFetch((url, { body }) => {
      if (url.includes('/query')) {
        // 游标在请求体里，不在 URL 上
        if (body?.start_cursor) {
          return { json: { results: [{ id: 'p2' }], has_more: false } }
        }
        return { json: { results: [{ id: 'p1' }], has_more: true, next_cursor: 'c1' } }
      }
      return { json: {} }
    })
    const api = createNotionClient({ token, dataSourceId })
    const rows = await api.findAlbums()
    expect(rows.map(r => r.id)).toEqual(['p1', 'p2'])
    expect(calls[0].body.filter).toEqual({
      property: 'type',
      select: { equals: TYPES.album }
    })
  })

  it('buildProperties 跳过不存在的列并回报', async () => {
    mockFetch(() => ({
      json: { properties: { [P.ncmAlbumId]: { type: 'rich_text' }, title: { type: 'title' } } }
    }))
    const api = createNotionClient({ token, dataSourceId })
    const { properties, skipped } = await api.buildProperties({
      [P.ncmAlbumId]: '277294562',
      title: '专辑名',
      [P.syncHash]: 'h'
    })
    expect(Object.keys(properties)).toEqual([P.ncmAlbumId, 'title'])
    expect(skipped.join()).toMatch(/同步哈希/)
  })

  it('checkSchema 报缺列与缺选项，但不改 schema', async () => {
    mockFetch(() => ({
      json: {
        properties: {
          type: { type: 'select', select: { options: [{ name: TYPES.album }] } },
          title: { type: 'title' }
        }
      }
    }))
    const api = createNotionClient({ token, dataSourceId })
    const result = await api.checkSchema({
      required: ['title', '封面URL', '已下架'],
      selectOptions: { type: [TYPES.album, TYPES.note] }
    })
    expect(result.ok).toBe(false)
    expect(result.missing).toEqual(['封面URL', '已下架'])
    expect(result.badOptions).toEqual(['type 缺选项「MusicNote」'])
  })

  it('updatePage 没有任何属性时不发请求', async () => {
    const calls = mockFetch(() => ({ json: {} }))
    const api = createNotionClient({ token, dataSourceId })
    await expect(api.updatePage('p1', {})).resolves.toBeNull()
    expect(calls).toHaveLength(0)
  })
})

describe('曲目折叠块', () => {
  const payload = {
    schema: contract.schema,
    v: contract.version,
    albumId: '277294562',
    tracks: [{ id: '1', title: '二十岁' }]
  }
  const codeBlock = (text, id = 'block-1') => ({
    id,
    type: 'code',
    code: { rich_text: [{ plain_text: text }] }
  })
  const marker = JSON.stringify(payload, null, 2)

  it('认得出 toggle 里已有的块并只换内容', async () => {
    const calls = mockFetch(url => {
      if (url.includes('/blocks/page-1/children')) {
        return {
          json: {
            results: [
              {
                id: 'tg-1',
                type: 'toggle',
                toggle: { rich_text: [{ plain_text: '曲目数据（自动生成）' }] }
              }
            ]
          }
        }
      }
      if (url.includes('/blocks/tg-1/children')) {
        return { json: { results: [codeBlock(marker)] } }
      }
      return { json: {} }
    })
    const api = createNotionClient({ token, dataSourceId })
    const result = await api.upsertTracksBlock('page-1', payload)
    expect(result).toEqual({ action: 'updated', blockId: 'block-1' })
    const patch = calls.find(c => c.method === 'PATCH' && c.url.endsWith('/blocks/block-1'))
    expect(patch.body.code.language).toBe(contract.tracksBlock.language)
    expect(patch.body.code.rich_text.map(p => p.text.content).join('')).toBe(marker)
  })

  it('没有标记块时追加折叠块，不碰正文其他块', async () => {
    const calls = mockFetch(url => {
      if (url.includes('/children')) {
        return { json: { results: [{ id: 'p', type: 'paragraph', paragraph: {} }] } }
      }
      return { json: {} }
    })
    const api = createNotionClient({ token, dataSourceId })
    const result = await api.upsertTracksBlock('page-1', payload)
    expect(result.action).toBe('appended')
    const append = calls.find(c => c.url.endsWith('/blocks/page-1/children'))
    expect(append.body.children[0].type).toBe('toggle')
  })

  it('超长 JSON 分片写入，拼回去还是完整载荷', async () => {
    const big = {
      ...payload,
      tracks: Array.from({ length: 120 }, (_, i) => ({ id: String(i), title: `曲${i}名`.padEnd(40, '词') }))
    }
    const text = JSON.stringify(big, null, 2)
    expect(text.length).toBeGreaterThan(contract.tracksBlock.chunkChars)
    const calls = mockFetch(url => {
      if (url.includes('/blocks/page-1/children')) return { json: { results: [codeBlock(text)] } }
      return { json: {} }
    })
    const api = createNotionClient({ token, dataSourceId })
    await api.upsertTracksBlock('page-1', big)
    const patch = calls.find(c => c.method === 'PATCH' && c.url.endsWith('/blocks/block-1'))
    const joined = patch.body.code.rich_text.map(p => p.text.content).join('')
    expect(joined).toBe(text)
    expect(JSON.parse(joined).tracks).toHaveLength(120)
    for (const part of patch.body.code.rich_text) {
      expect(part.text.content.length).toBeLessThanOrEqual(contract.tracksBlock.chunkChars)
    }
  })
})

describe('限流与错误', () => {
  it('429 之后按 Retry-After 重试，成功就返回数据', async () => {
    let hit = 0
    mockFetch(() => {
      hit += 1
      if (hit === 1) return { status: 429, headers: { 'retry-after': '1' }, json: { message: 'rate limited' } }
      return { json: { properties: { title: { type: 'title' } } } }
    })
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const api = createNotionClient({ token, dataSourceId })
    await expect(api.getSchema()).resolves.toEqual({ title: { type: 'title' } })
    expect(hit).toBe(2)
  })

  it('4xx 永久性失败不重试，报错不带 token', async () => {
    let hit = 0
    mockFetch(() => {
      hit += 1
      return { status: 404, json: { code: 'object_not_found' } }
    })
    const api = createNotionClient({ token, dataSourceId })
    const error = await api.getSchema().catch(e => e)
    expect(error.message).toMatch(/404/)
    expect(error.message).not.toMatch(/secret-token|Bearer/)
    expect(hit).toBe(1)
  })
})
