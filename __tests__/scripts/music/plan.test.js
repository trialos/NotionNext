import fs from 'fs'
import path from 'path'

import { NAMES, P, TYPES, contract } from '../../../scripts/music/contract.mjs'
import { syncHash } from '../../../scripts/music/normalize.mjs'
import {
  defaultSlug,
  planDelist,
  planUpsert,
  storedTracksState
} from '../../../scripts/music/plan.mjs'

const title = value => ({ type: 'title', title: [{ plain_text: value }] })
const rich = value => ({ type: 'rich_text', rich_text: [{ plain_text: value }] })
const select = value => ({ type: 'select', select: { name: value } })
const check = value => ({ type: 'checkbox', checkbox: value })
const date = value => ({ type: 'date', date: { start: value } })

const pageOf = properties => ({ id: 'page-1', properties })

const album = ({ hash = '', tracks = [{ id: '1', title: '二十岁' }] } = {}) => {
  const payload = {
    schema: contract.schema,
    v: contract.version,
    albumId: '277294562',
    tracks
  }
  return {
    type: TYPES.album,
    albumId: '277294562',
    title: 'test album',
    // 真实哈希：脚本靠它判断「有没有变」，写死一个值就测不出幂等
    payload,
    hash: hash || syncHash(payload),
    properties: {
      [P.artistLine]: '宝石Gem',
      [P.coverUrl]: 'https://p1.music.163.com/x.jpg',
      [P.ncmAlbumId]: '277294562',
      [P.delisted]: false
    },
    seeds: { title: 'test album', summary: '一句简介' }
  }
}

const BASE = album()

const storedBlock = payload => JSON.stringify(payload, null, 2)

describe('planUpsert 新建', () => {
  it('默认 Invisible，带 slug 与曲目块', () => {
    const plan = planUpsert({
      desired: { ...album(), slug: defaultSlug(TYPES.album, '277294562') }
    })
    expect(plan.action).toBe('create')
    expect(plan.tracks).toBe('append')
    expect(plan.values[NAMES.type]).toBe(TYPES.album)
    expect(plan.values[NAMES.status]).toBe('Invisible')
    expect(plan.values[NAMES.slug]).toBe('album-277294562')
    expect(plan.values[P.syncHash]).toBe(BASE.hash)
  })

  it('--publish 才直接上架', () => {
    const plan = planUpsert({ desired: album(), publish: true })
    expect(plan.values[NAMES.status]).toBe('Published')
  })

  it('没有 slug 时报警：这种行不会进站点数据', () => {
    const plan = planUpsert({ desired: { ...album(), seeds: {} } })
    expect(plan.warnings.join('')).toMatch(/slug/)
  })
})

describe('planUpsert 更新', () => {
  const existing = pageOf({
    [NAMES.type]: select(TYPES.album),
    [NAMES.status]: select('Published'),
    [NAMES.title]: title('我自己起的名字'),
    [NAMES.slug]: rich('my-album'),
    [NAMES.summary]: rich('我自己写的简介'),
    [P.artistLine]: rich('老艺人'),
    [P.coverUrl]: rich('https://p1.music.163.com/x.jpg'),
    [P.ncmAlbumId]: rich('277294562'),
    [P.syncHash]: rich(BASE.hash),
    [P.delisted]: check(false)
  })

  it('机器字段变、人字段不覆盖：只写机器字段', () => {
    const plan = planUpsert({
      page: existing,
      desired: { ...album(), properties: { ...album().properties, [P.artistLine]: '新艺人' } }
    })
    expect(plan.action).toBe('update')
    expect(plan.values[P.artistLine]).toBe('新艺人')
    expect(plan.values[NAMES.title]).toBeUndefined()
    expect(plan.values[NAMES.summary]).toBeUndefined()
    expect(plan.values[NAMES.slug]).toBeUndefined()
  })

  it('载荷没变就是 0 写入（连同步时间都不刷）', () => {
    const plan = planUpsert({
      page: existing,
      desired: { ...album(), properties: { ...album().properties, [P.artistLine]: '老艺人' } },
      tracksBlockText: storedBlock(album().payload)
    })
    expect(plan.action).toBe('skip')
    expect(plan.tracks).toBe('none')
    expect(plan.values[P.lastSyncedAt]).toBeUndefined()
  })

  it('人字段为空时补种子', () => {
    const bare = pageOf({
      [NAMES.type]: select(TYPES.album),
      [NAMES.status]: select('Published'),
      [NAMES.title]: title('有标题'),
      [NAMES.slug]: rich('x')
    })
    const plan = planUpsert({ page: bare, desired: album() })
    expect(plan.values[NAMES.summary]).toBe('一句简介')
    expect(plan.values[NAMES.title]).toBeUndefined()
  })

  it('曲目哈希变了才重写代码块', () => {
    const plan = planUpsert({
      page: existing,
      desired: album({ hash: 'bbb222' }),
      tracksBlockText: storedBlock(album().payload)
    })
    expect(plan.tracks).toBe('write')
    expect(plan.values[P.syncHash]).toBe('bbb222')
  })

  it('代码块被删掉：即使哈希没变也要补写', () => {
    const plan = planUpsert({ page: existing, desired: album(), tracksBlockText: '' })
    expect(plan.tracks).toBe('append')
  })

  it('代码块内容坏了：重写覆盖', () => {
    const plan = planUpsert({
      page: existing,
      desired: album(),
      tracksBlockText: `{"schema":"${contract.schema}","v":99}`
    })
    expect(plan.tracks).toBe('replace')
  })

  it('上游恢复：已下架翻回 false', () => {
    const delisted = pageOf({
      ...existing.properties,
      [P.delisted]: check(true)
    })
    const plan = planUpsert({ page: delisted, desired: album() })
    expect(plan.values[P.delisted]).toBe(false)
  })

  it('type 对不上时报人工确认，不静默改', () => {
    const wrong = pageOf({ ...existing.properties, [NAMES.type]: select('Post') })
    const plan = planUpsert({ page: wrong, desired: album() })
    expect(plan.warnings.join('')).toMatch(/type/)
    expect(plan.values[NAMES.type]).toBeUndefined()
  })
})

describe('下架与曲目块状态', () => {
  it('planDelist 只置「已下架」，绝不删行', () => {
    const plan = planDelist({ page: pageOf({ [P.delisted]: check(false) }) })
    expect(plan.values[P.delisted]).toBe(true)
    expect(JSON.stringify(plan.values)).not.toMatch(/in_trash|archived/)
  })

  it('已经下架就不再写', () => {
    const plan = planDelist({ page: pageOf({ [P.delisted]: check(true) }) })
    expect(plan.action).toBe('skip')
  })

  it('storedTracksState 只认当前契约版本', () => {
    expect(storedTracksState('').status).toBe('missing')
    expect(storedTracksState('not json').status).toBe('invalid')
    expect(storedTracksState('{"schema":"other"}').status).toBe('invalid')
    expect(
      storedTracksState(`{"schema":"${contract.schema}","v":1,"tracks":[]}`).status
    ).toBe('stored')
  })

  it('defaultSlug 只接纯数字 ID：链接要先过 parseNeteaseRef', () => {
    expect(defaultSlug(TYPES.album, '277294562')).toBe('album-277294562')
    expect(defaultSlug(TYPES.album, 'https://music.163.com/#/album?id=277294562')).toBe('')
    expect(defaultSlug(TYPES.note, 'EB58FDA47887FB3C')).toBe('')
    expect(defaultSlug(TYPES.note, 123)).toBe('note-123')
  })
})

describe('写入侧的标题纪律', () => {
  it('兜标题只允许发生在 create 分支（更新时 title 不在写入集里，补上就会冲掉博主标题）', () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/music/cli.mjs'),
      'utf8'
    )
    expect(src).toContain("if (plan.action === 'create') ensureCreatedTitle(plan.values)")
    // 不允许出现无条件的兜标题调用
    expect(src).not.toMatch(/^\s{2}ensureCreatedTitle\(plan\.values\)$/m)
  })

  it('更新计划本身永远不带 title 列（除非原值为空的种子）', () => {
    const page = {
      id: 'p',
      properties: {
        [NAMES.type]: { type: 'select', select: { name: TYPES.album } },
        [NAMES.title]: { type: 'title', title: [{ plain_text: '我自己起的名字' }] },
        [NAMES.slug]: { type: 'rich_text', rich_text: [{ plain_text: 'x' }] },
        [NAMES.status]: { type: 'select', select: { name: 'Published' } }
      }
    }
    const plan = planUpsert({
      page,
      desired: { type: TYPES.album, properties: {}, seeds: { title: '网易云给的标题' } }
    })
    expect(plan.values[NAMES.title]).toBeUndefined()
  })
})
