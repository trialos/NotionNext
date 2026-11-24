import {
  ARCHIVE_MEMORY_KEY,
  ARCHIVE_PAGE_KEY,
  readArchiveMemory,
  readArchivePage,
  writeArchiveMemory,
  writeArchivePage
} from '@/themes/circlelife/components/archiveMemory'

function createStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
    dump: () => Object.fromEntries(data)
  }
}

describe('归档筛选记忆（sessionStorage）', () => {
  test('写入后可读回分类与标签', () => {
    const storage = createStorage()
    writeArchiveMemory(storage, { category: '字里行间', tag: '思考' })
    expect(readArchiveMemory(storage)).toEqual({
      category: '字里行间',
      tag: '思考'
    })
    expect(JSON.parse(storage.dump()[ARCHIVE_MEMORY_KEY])).toEqual({
      category: '字里行间',
      tag: '思考'
    })
  })

  test('只写标签也有效（全站视角下的标签筛选）', () => {
    const storage = createStorage()
    writeArchiveMemory(storage, { tag: '思考' })
    expect(readArchiveMemory(storage)).toEqual({ category: '', tag: '思考' })
  })

  test('「全部」清空记忆', () => {
    const storage = createStorage()
    writeArchiveMemory(storage, { category: '字里行间' })
    writeArchiveMemory(storage, {})
    expect(readArchiveMemory(storage)).toBe(null)
    expect(storage.dump()[ARCHIVE_MEMORY_KEY]).toBeUndefined()
  })

  test('非法 JSON / 空值 / 无存储时安全回落', () => {
    expect(
      readArchiveMemory(createStorage({ [ARCHIVE_MEMORY_KEY]: '{oops' }))
    ).toBe(null)
    expect(
      readArchiveMemory(createStorage({ [ARCHIVE_MEMORY_KEY]: '{}' }))
    ).toBe(null)
    expect(readArchiveMemory(null)).toBe(null)
    expect(readArchiveMemory(undefined)).toBe(null)
  })

  test('存储抛错（隐私模式）时静默降级', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      }
    }
    expect(readArchiveMemory(throwing)).toBe(null)
    expect(() =>
      writeArchiveMemory(throwing, { category: '字里行间' })
    ).not.toThrow()
  })
})

describe('归档页码记忆（sessionStorage，返回归档恢复用）', () => {
  test('写入后可读回页码与筛选签名', () => {
    const storage = createStorage()
    writeArchivePage(storage, 3, { category: '字里行间', tag: '思考' })
    expect(readArchivePage(storage)).toEqual({
      page: 3,
      category: '字里行间',
      tag: '思考'
    })
  })

  test('空筛选签名也能记住（裸 /archive 翻页）', () => {
    const storage = createStorage()
    writeArchivePage(storage, 2, {})
    expect(readArchivePage(storage)).toEqual({ page: 2, category: '', tag: '' })
  })

  test('页码 0 / 非法值清空记忆', () => {
    const storage = createStorage()
    writeArchivePage(storage, 2, {})
    writeArchivePage(storage, 0, null)
    expect(readArchivePage(storage)).toBe(null)
    expect(storage.dump()[ARCHIVE_PAGE_KEY]).toBeUndefined()
    writeArchivePage(storage, -1, null)
    expect(readArchivePage(storage)).toBe(null)
  })

  test('非法 JSON / 空值 / 无存储 / 抛错均安全降级', () => {
    expect(
      readArchivePage(createStorage({ [ARCHIVE_PAGE_KEY]: '{oops' }))
    ).toBe(null)
    expect(readArchivePage(createStorage({ [ARCHIVE_PAGE_KEY]: '{}' }))).toBe(
      null
    )
    expect(readArchivePage(null)).toBe(null)
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      }
    }
    expect(readArchivePage(throwing)).toBe(null)
    expect(() => writeArchivePage(throwing, 2, {})).not.toThrow()
  })
})
