/**
 * @jest-environment node
 */
import {
  DEPARTURE_TTL,
  INTENT_TTL,
  makeDeparture,
  makeIntent,
  matchIntent,
  readDeparture
} from '@/themes/circlelife/components/ListScrollMemory'

describe('makeDeparture', () => {
  const base = {
    from: '/archive',
    to: '/article/x',
    y: 151.5,
    ts: 1000
  }

  test('生成规范化的单条离开记录', () => {
    expect(makeDeparture(base)).toEqual({
      from: '/archive',
      to: '/article/x',
      y: 152,
      ts: 1000
    })
  })

  test('同路径点击（目录 hash / 自身链接）不记录', () => {
    expect(makeDeparture({ ...base, from: '/', to: '/' })).toBe(null)
    expect(makeDeparture({ ...base, from: '/a?x=1', to: '/a?x=1' })).toBe(null)
  })

  test('非站内路径不记录', () => {
    expect(makeDeparture({ ...base, from: 'https://example.com' })).toBe(null)
    expect(makeDeparture({ ...base, to: '//evil.com' })).toBe(null)
    expect(makeDeparture({ ...base, from: '' })).toBe(null)
  })

  test('负 y 归零', () => {
    expect(makeDeparture({ ...base, y: -20 }).y).toBe(0)
    expect(makeDeparture({ ...base, y: NaN }).y).toBe(0)
  })
})

describe('readDeparture', () => {
  const record = makeDeparture({
    from: '/archive',
    to: '/article/x',
    y: 151,
    ts: 1000
  })
  const json = JSON.stringify(record)

  test('目标页匹配且在 TTL 内返回记录', () => {
    expect(readDeparture(json, '/article/x', 1000 + 500)).toEqual(record)
    expect(readDeparture(json, '/article/x', 1000 + DEPARTURE_TTL)).toEqual(
      record
    )
  })

  test('过期、目标不匹配、坏 JSON 都返回 null', () => {
    expect(readDeparture(json, '/article/x', 1000 + DEPARTURE_TTL + 1)).toBe(
      null
    )
    expect(readDeparture(json, '/article/other', 1100)).toBe(null)
    expect(readDeparture('not-json', '/article/x', 1100)).toBe(null)
    expect(readDeparture('', '/article/x', 1100)).toBe(null)
  })

  test('时间戳明显超前视为无效', () => {
    expect(readDeparture(json, '/article/x', 1000 - 5000)).toBe(null)
  })
})

describe('back intent', () => {
  test('写入时规范化 href，命中目标页返回 y', () => {
    const intent = makeIntent({ href: '/archive/', y: 151.6, ts: 1000 })
    expect(intent).toEqual({ href: '/archive', y: 152, ts: 1000 })
    const json = JSON.stringify(intent)
    expect(matchIntent(json, '/archive', 1100)).toBe(152)
    expect(matchIntent(json, '/archive?x=1', 1100)).toBe(null)
  })

  test('过期、坏格式、旧时间戳都视为无意图', () => {
    const json = JSON.stringify({ href: '/', y: 2900, ts: 1000 })
    expect(matchIntent(json, '/', 1000 + INTENT_TTL + 1)).toBe(null)
    expect(matchIntent('1793181662354', '/', 1100)).toBe(null)
    expect(matchIntent('not-json', '/', 1100)).toBe(null)
    expect(
      matchIntent(JSON.stringify({ href: '/', y: 0, ts: 1000 }), '/', 1100)
    ).toBe(0)
  })

  test('非站内目标不写入', () => {
    expect(makeIntent({ href: 'https://example.com', y: 1 })).toBe(null)
    expect(makeIntent({ href: '//evil.com', y: 1 })).toBe(null)
    expect(makeIntent({ href: '', y: 1 })).toBe(null)
  })
})
