import {
  ARCHIVE_MEMORY_KEY,
  readArchiveMemory,
  writeArchiveMemory
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
