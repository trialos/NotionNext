/**
 * 手记正文判定：展架上「没写正文的单曲」只做展示卡，不链到手记页。
 * 这个判定必须准（否则会把写好的手记变成死卡），也必须在读不到时放宽。
 */
import { noteHasBody } from '@/lib/music/notes'
import contract from '@/lib/music/contract.json'

const PAGE_ID = 'page-1'

const segments = text => [[text, []]]

function block(id, value = {}) {
  return [id, { id, value: { value: { id, ...value } } }]
}

function mapOf(childIds, blocks = []) {
  return {
    block: {
      [PAGE_ID]: {
        id: PAGE_ID,
        value: {
          value: {
            id: PAGE_ID,
            type: 'page',
            content: childIds,
            properties: { title: segments('关于《K.》') }
          }
        }
      },
      ...Object.fromEntries(blocks)
    }
  }
}

const textBlock = (id, text) => block(id, { type: 'text', content: [], properties: { title: segments(text) } })

const tracksPayload = JSON.stringify({
  schema: contract.schema,
  v: contract.version,
  kind: 'album',
  albumId: 221047,
  total: 1,
  tracks: [{ id: 1, title: 'K.', artists: ['CAS'], duration: 1000 }]
})

describe('noteHasBody', () => {
  test('有文字的段落算正文', () => {
    const map = mapOf(['b1'], [textBlock('b1', '今天又听了一遍。')])
    expect(noteHasBody(map, PAGE_ID)).toBe(true)
  })

  test('只有空白段落不算正文', () => {
    const map = mapOf(['b1'], [textBlock('b1', '   ')])
    expect(noteHasBody(map, PAGE_ID)).toBe(false)
  })

  test('只有自动生成的曲目折叠块不算正文', () => {
    const map = mapOf(
      ['toggle'],
      [
        block('toggle', {
          type: 'toggle',
          content: ['code'],
          properties: { title: segments(contract.tracksBlock.toggleTitle) }
        }),
        block('code', {
          type: 'code',
          parent_id: 'toggle',
          content: [],
          properties: { title: segments(tracksPayload) }
        })
      ]
    )
    expect(noteHasBody(map, PAGE_ID)).toBe(false)
  })

  test('只有图片也算有内容（纯图手记不是空手记）', () => {
    const map = mapOf(['img'], [block('img', { type: 'image', content: [], properties: {} })])
    expect(noteHasBody(map, PAGE_ID)).toBe(true)
  })

  test('折叠块里的文字也算正文', () => {
    const map = mapOf(
      ['toggle'],
      [
        block('toggle', { type: 'toggle', content: ['inner'], properties: { title: segments('展开') } }),
        textBlock('inner', '藏在折叠里的那句话')
      ]
    )
    expect(noteHasBody(map, PAGE_ID)).toBe(true)
  })

  test('读不到 blockMap 时一律按有正文处理（fail-open）', () => {
    expect(noteHasBody(null, PAGE_ID)).toBe(true)
    expect(noteHasBody(undefined, PAGE_ID)).toBe(true)
    expect(noteHasBody({ block: {} }, PAGE_ID)).toBe(true)
  })

  test('页面块读到了但没有子块：空手记', () => {
    const map = { block: { [PAGE_ID]: { value: { value: { id: PAGE_ID, type: 'page' } } } } }
    expect(noteHasBody(map, PAGE_ID)).toBe(false)
    const withEmptyList = { block: { [PAGE_ID]: { value: { value: { id: PAGE_ID, type: 'page', content: [] } } } } }
    expect(noteHasBody(withEmptyList, PAGE_ID)).toBe(false)
  })

  test('传入的 id 与 blockMap 的键不一致时，按 type=page 兜底', () => {
    const map = mapOf(['b1'], [textBlock('b1', '正文')])
    expect(noteHasBody(map, 'not-a-uuid')).toBe(true)
    const empty = mapOf(['b1'], [textBlock('b1', '')])
    expect(noteHasBody(empty, 'not-a-uuid')).toBe(false)
  })
})
