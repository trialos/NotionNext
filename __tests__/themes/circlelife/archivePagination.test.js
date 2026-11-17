import { paginateArchiveMonths } from '@/themes/circlelife/components/archivePagination'

const MONTHS = [
  '2026-11',
  '2026-10',
  '2026-09',
  '2026-08',
  '2026-07',
  '2026-06',
  '2026-04',
  '2025-09',
  '2025-08',
  '2025-07',
  '2025-06',
  '2025-05'
]

describe('归档按整月分页', () => {
  test('12 个月按 4 个月一页切成 3 页，月份不拆', () => {
    const first = paginateArchiveMonths(MONTHS, 1, 4)
    expect(first.totalPage).toBe(3)
    expect(first.safePage).toBe(1)
    expect(first.months).toEqual(['2026-11', '2026-10', '2026-09', '2026-08'])

    const last = paginateArchiveMonths(MONTHS, 3, 4)
    expect(last.safePage).toBe(3)
    expect(last.months).toEqual(['2025-08', '2025-07', '2025-06', '2025-05'])
  })

  test('页码越界收敛到有效范围', () => {
    expect(paginateArchiveMonths(MONTHS, 9, 4).safePage).toBe(3)
    expect(paginateArchiveMonths(MONTHS, 0, 4).safePage).toBe(1)
    expect(paginateArchiveMonths(MONTHS, -3, 4).safePage).toBe(1)
  })

  test('筛选后月份变少时不会停留在空页', () => {
    const two = ['2026-11', '2026-10']
    const result = paginateArchiveMonths(two, 3, 4)
    expect(result.totalPage).toBe(1)
    expect(result.safePage).toBe(1)
    expect(result.months).toEqual(two)
  })

  test('空数据与非法输入安全回落', () => {
    expect(paginateArchiveMonths([], 1, 4)).toEqual({
      totalPage: 1,
      safePage: 1,
      months: []
    })
    expect(paginateArchiveMonths(null, 1, 4).months).toEqual([])
    // 非法的每页数量回落为 1，至少保证可渲染而不是除零
    expect(paginateArchiveMonths(MONTHS, 1, 0).totalPage).toBe(12)
    expect(paginateArchiveMonths(MONTHS, 1, undefined).totalPage).toBe(12)
  })
})
