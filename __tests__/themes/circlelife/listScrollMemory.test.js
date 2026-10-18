/**
 * @jest-environment node
 */
import {
  pickScroll,
  readScrollMap,
  updateScrollMap
} from '@/themes/circlelife/components/ListScrollMemory'

describe('ListScrollMemory scroll map', () => {
  test('readScrollMap 容错解析', () => {
    expect(readScrollMap('')).toEqual({})
    expect(readScrollMap(null)).toEqual({})
    expect(readScrollMap('not-json')).toEqual({})
    expect(readScrollMap('[1,2]')).toEqual({})
    expect(readScrollMap('{"a":{"y":10,"ts":1}}')).toEqual({
      a: { y: 10, ts: 1 }
    })
  })

  test('写入、读取与 LRU 剪枝', () => {
    let map = {}
    for (let i = 0; i < 10; i++) {
      map = updateScrollMap(map, `/p/${i}`, i * 100, i + 1)
    }
    expect(Object.keys(map).length).toBe(8)
    expect(pickScroll(map, '/p/9')).toBe(900)
    expect(pickScroll(map, '/p/2')).toBe(200)
    expect(pickScroll(map, '/p/1')).toBe(null) // 最旧的两条被剪掉
    map = updateScrollMap(map, '/x', 5, 100)
    expect(pickScroll(map, '/x')).toBe(5)
  })

  test('非法 dest/y 被忽略', () => {
    expect(pickScroll(updateScrollMap({}, '/a', NaN, 1), '/a')).toBe(null)
    expect(pickScroll(updateScrollMap({}, '', 10, 1), '')).toBe(null)
    expect(pickScroll({}, '/a')).toBe(null)
  })
})
