/**
 * @jest-environment node
 */
import {
  buildColumnBuckets,
  computeSlotsPerColumn,
  MAX_SLOTS_PER_COLUMN,
  SLOTS_COVERAGE_RATIO
} from '@/themes/circlelife/components/tiltLayout'

/** 造 N 张带可读 id 的卡片 */
const makeCards = n =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    src: `https://example.com/${i}.jpg`
  }))

const keyOf = card =>
  typeof card === 'string' ? card : String(card?.id ?? card?.src ?? '')

const ids = column => column.map(keyOf)

/** 任意两列在相同索引位重复的个数 */
const indexCollisions = columns => {
  let count = 0
  for (let a = 0; a < columns.length; a++) {
    for (let b = a + 1; b < columns.length; b++) {
      const len = Math.min(columns[a].length, columns[b].length)
      for (let i = 0; i < len; i++) {
        if (keyOf(columns[a][i]) === keyOf(columns[b][i])) count++
      }
    }
  }
  return count
}

const pairwiseOverlap = (x, y) => {
  const set = new Set(ids(y))
  return ids(x).filter(id => set.has(id)).length
}

describe('computeSlotsPerColumn', () => {
  it('按视口与卡高推导：900 / 271 → 5', () => {
    expect(
      computeSlotsPerColumn({ viewportHeight: 900, itemHeight: 271, count: 14 })
    ).toBe(5)
  })

  it('移动端小卡高会得到更多张数', () => {
    const mobile = computeSlotsPerColumn({
      viewportHeight: 844,
      itemHeight: 137,
      count: 14
    })
    const desktop = computeSlotsPerColumn({
      viewportHeight: 900,
      itemHeight: 271,
      count: 14
    })
    expect(mobile).toBeGreaterThan(desktop)
  })

  it('只受 MAX_SLOTS_PER_COLUMN 约束，不因图片少而减少张数', () => {
    expect(
      computeSlotsPerColumn({ viewportHeight: 4000, itemHeight: 100, count: 50 })
    ).toBe(MAX_SLOTS_PER_COLUMN)
    // 图片只有 3 张时仍需按视口推导张数，否则列内容短于一屏会露白
    expect(
      computeSlotsPerColumn({ viewportHeight: 4000, itemHeight: 100, count: 3 })
    ).toBe(MAX_SLOTS_PER_COLUMN)
  })

  it('卡片高于视口时仍有下限 2，单图同样按 2 铺底', () => {
    expect(
      computeSlotsPerColumn({ viewportHeight: 600, itemHeight: 900, count: 8 })
    ).toBe(2)
    expect(
      computeSlotsPerColumn({ viewportHeight: 600, itemHeight: 900, count: 1 })
    ).toBe(2)
  })

  it('尺寸缺失或非法时安全兜底', () => {
    expect(computeSlotsPerColumn({ count: 0 })).toBe(0)
    expect(computeSlotsPerColumn()).toBe(0)
    expect(computeSlotsPerColumn({ viewportHeight: 0, itemHeight: 0, count: 6 })).toBe(2)
    expect(
      computeSlotsPerColumn({
        viewportHeight: Number.NaN,
        itemHeight: Number.NaN,
        count: 6
      })
    ).toBe(2)
  })

  it('覆盖倍数常量符合「略超一屏」的设计', () => {
    expect(SLOTS_COVERAGE_RATIO).toBeGreaterThan(1)
    expect(SLOTS_COVERAGE_RATIO).toBeLessThan(1.5)
  })
})

describe('buildColumnBuckets', () => {
  it('连续分块：14 张 5 列 4 张，相邻列不重叠', () => {
    const columns = buildColumnBuckets(makeCards(14), { colCount: 5, slots: 4 })
    expect(columns).toHaveLength(5)
    expect(ids(columns[0])).toEqual(['p0', 'p1', 'p2', 'p3'])
    expect(ids(columns[1])).toEqual(['p4', 'p5', 'p6', 'p7'])
    expect(ids(columns[2])).toEqual(['p8', 'p9', 'p10', 'p11'])
    // 绕回处允许与列 0 重合，但不得与相邻列重合
    expect(pairwiseOverlap(columns[0], columns[1])).toBe(0)
    expect(pairwiseOverlap(columns[1], columns[2])).toBe(0)
    expect(pairwiseOverlap(columns[2], columns[3])).toBe(0)
    expect(pairwiseOverlap(columns[3], columns[4])).toBe(0)
  })

  it('保持传入顺序，不洗牌', () => {
    const cards = makeCards(14)
    const columns = buildColumnBuckets(cards, { colCount: 5, slots: 4 })
    expect(ids(columns[0])).toEqual(ids(cards.slice(0, 4)))
  })

  it('同索引位不撞图：常规情况', () => {
    const columns = buildColumnBuckets(makeCards(14), { colCount: 5, slots: 4 })
    expect(indexCollisions(columns)).toBe(0)
  })

  it('同索引位不撞图：N 能被 slots 整除时靠校正避开', () => {
    // 12 % 4 === 0，原始分块会让列 3 与列 0 完全相同
    const columns = buildColumnBuckets(makeCards(12), { colCount: 5, slots: 4 })
    expect(indexCollisions(columns)).toBe(0)
    expect(ids(columns[3])).not.toEqual(ids(columns[0]))
  })

  it('图片少于「列数 × 每列张数」时仍可用且不撞同行', () => {
    const columns = buildColumnBuckets(makeCards(5), { colCount: 5, slots: 3 })
    expect(columns).toHaveLength(5)
    expect(columns.every(col => col.length === 3)).toBe(true)
    expect(indexCollisions(columns)).toBe(0)
  })

  it('图片极少时列内循环重复，但张数必须够铺满（不得提前截断）', () => {
    // 回归用例：早期实现把每列张数钳到图片数量，图片少时列内容短于一屏，
    // 循环位移上移后画布底部露白
    const columns = buildColumnBuckets(makeCards(2), { colCount: 3, slots: 6 })
    expect(columns.every(col => col.length === 6)).toBe(true)
    expect(ids(columns[0])).toEqual(['p0', 'p1', 'p0', 'p1', 'p0', 'p1'])
  })

  it('单图时每列仍按张数铺满，不退化成长度 1', () => {
    const one = buildColumnBuckets(makeCards(1), { colCount: 3, slots: 4 })
    expect(one).toHaveLength(3)
    expect(one.every(col => col.length === 4)).toBe(true)
    expect(new Set(ids(one[0]))).toEqual(new Set(['p0']))
  })

  it('张数大于图片数量时允许列内重复，但每列长度一致', () => {
    const columns = buildColumnBuckets(makeCards(3), { colCount: 2, slots: 8 })
    expect(columns[0]).toHaveLength(8)
    expect(columns[1]).toHaveLength(8)
  })

  it('非法输入返回空数组且不抛错', () => {
    expect(buildColumnBuckets([], { colCount: 5, slots: 4 })).toEqual([])
    expect(buildColumnBuckets(null, { colCount: 5, slots: 4 })).toEqual([])
    expect(buildColumnBuckets(makeCards(5), { colCount: 0, slots: 4 })).toEqual([])
    expect(buildColumnBuckets(makeCards(5), {})).toEqual([])
  })

  it('字符串入参也能去重（按 URL 比较）', () => {
    const urls = Array.from({ length: 6 }, (_, i) => `https://x/${i}.jpg`)
    const columns = buildColumnBuckets(urls, { colCount: 3, slots: 2 })
    expect(columns[0]).toEqual(['https://x/0.jpg', 'https://x/1.jpg'])
    expect(indexCollisions(columns)).toBe(0)
  })
})
