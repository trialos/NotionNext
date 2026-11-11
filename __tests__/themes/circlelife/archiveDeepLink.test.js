import fs from 'fs'
import path from 'path'

import {
  buildArchiveQuery,
  readArchiveQuery,
  resolveArchiveKeys,
  resolveArchiveSelection
} from '@/themes/circlelife/components/archiveDeepLink'
import {
  ARCHIVE_ALL,
  buildArchiveFacets
} from '@/themes/circlelife/components/archiveFilter'

const archivePosts = {
  '2026-11': [
    {
      id: 'p1',
      title: '甲',
      category: '字里行间',
      publishDate: 1,
      tagItems: [{ name: '思考' }]
    },
    {
      id: 'p2',
      title: '乙',
      category: '人机协作',
      publishDate: 2,
      tagItems: [{ name: '开发' }]
    }
  ],
  '2026-10': [
    {
      id: 'p3',
      title: '丙',
      category: '字里行间',
      publishDate: 3,
      tagItems: [{ name: '思考' }, { name: '生活' }]
    }
  ]
}
const facets = buildArchiveFacets(archivePosts)

const themeSource = fs.readFileSync(
  path.resolve(process.cwd(), 'themes/circlelife/index.js'),
  'utf8'
)

describe('归档深链：名字 ↔ 筛选 key 映射', () => {
  test('readArchiveQuery 只接受字符串；数组/空值归零', () => {
    expect(
      readArchiveQuery({ category: '字里行间', tag: '思考' })
    ).toEqual({ categoryName: '字里行间', tagName: '思考' })
    expect(
      readArchiveQuery({ category: ['字里行间'], tag: '' })
    ).toEqual({ categoryName: '', tagName: '' })
    expect(readArchiveQuery(undefined)).toEqual({
      categoryName: '',
      tagName: ''
    })
  })

  test('已知分类 → 对应 key；未知分类 → 全部', () => {
    expect(resolveArchiveKeys(facets, { categoryName: '字里行间' })).toEqual({
      categoryKey: 'cat:字里行间',
      tagKey: ARCHIVE_ALL
    })
    expect(resolveArchiveKeys(facets, { categoryName: '不存在' })).toEqual({
      categoryKey: ARCHIVE_ALL,
      tagKey: ARCHIVE_ALL
    })
    expect(resolveArchiveKeys(facets)).toEqual({
      categoryKey: ARCHIVE_ALL,
      tagKey: ARCHIVE_ALL
    })
  })

  test('标签必须属于当前分类：跨分类的标签回落为全部', () => {
    expect(
      resolveArchiveKeys(facets, { categoryName: '字里行间', tagName: '思考' })
    ).toEqual({ categoryKey: 'cat:字里行间', tagKey: 'tag:思考' })
    expect(
      resolveArchiveKeys(facets, { categoryName: '人机协作', tagName: '思考' })
    ).toEqual({ categoryKey: 'cat:人机协作', tagKey: ARCHIVE_ALL })
  })

  test('buildArchiveQuery 只写非空项；全部时回到裸 /archive', () => {
    expect(buildArchiveQuery(facets, ARCHIVE_ALL, ARCHIVE_ALL)).toEqual({})
    expect(buildArchiveQuery(facets, 'cat:字里行间', ARCHIVE_ALL)).toEqual({
      category: '字里行间'
    })
    expect(buildArchiveQuery(facets, 'cat:字里行间', 'tag:思考')).toEqual({
      category: '字里行间',
      tag: '思考'
    })
    expect(buildArchiveQuery(facets, ARCHIVE_ALL, 'tag:思考')).toEqual({
      tag: '思考'
    })
  })

  test('query → key → query 往返一致', () => {
    const query = buildArchiveQuery(facets, 'cat:字里行间', 'tag:思考')
    const { categoryName, tagName } = readArchiveQuery(query)
    expect(resolveArchiveKeys(facets, { categoryName, tagName })).toEqual({
      categoryKey: 'cat:字里行间',
      tagKey: 'tag:思考'
    })
  })
})

describe('归档深链：无效参数清理', () => {
  test('有效参数不需要清理', () => {
    const seeded = resolveArchiveSelection(facets, {
      category: '字里行间',
      tag: '思考'
    })
    expect(seeded).toEqual({
      categoryKey: 'cat:字里行间',
      tagKey: 'tag:思考',
      cleaned: { category: '字里行间', tag: '思考' },
      needsCleanup: false
    })
  })

  test('旧分类名 → 回落全部，并标记清理', () => {
    const stale = resolveArchiveSelection(facets, { category: '随笔' })
    expect(stale.categoryKey).toBe(ARCHIVE_ALL)
    expect(stale.needsCleanup).toBe(true)
    expect(stale.cleaned).toEqual({})
  })

  test('失效标签 → 保留有效分类，只清理标签', () => {
    const stale = resolveArchiveSelection(facets, {
      category: '人机协作',
      tag: '思考'
    })
    expect(stale.categoryKey).toBe('cat:人机协作')
    expect(stale.tagKey).toBe(ARCHIVE_ALL)
    expect(stale.needsCleanup).toBe(true)
    expect(stale.cleaned).toEqual({ category: '人机协作' })
  })

  test('空值/数组参数视为未提供，不触发清理', () => {
    expect(resolveArchiveSelection(facets, {}).needsCleanup).toBe(false)
    expect(
      resolveArchiveSelection(facets, { category: ['字里行间'] }).needsCleanup
    ).toBe(false)
  })
})

describe('LayoutArchive 深链接线契约', () => {
  test('URL 只在路由就绪后、经纯映射函数进入 state', () => {
    expect(themeSource).toContain('readArchiveQuery(')
    expect(themeSource).toContain('router.isReady')
    expect(themeSource).toContain('resolveArchiveSelection(facets')
    expect(themeSource).toContain(
      'setActiveCategoryKey(prev => (prev === categoryKey ? prev : categoryKey))'
    )
    expect(themeSource).toContain(
      'setActiveTagKey(prev => (prev === tagKey ? prev : tagKey))'
    )
  })

  test('用户显式操作 push 进历史；无效参数用 replace 静默清理', () => {
    expect(themeSource).toContain('buildArchiveQuery(facets, categoryKey, tagKey)')
    expect(themeSource).toContain(
      'router.push({ pathname: router.pathname, query }'
    )
    expect(themeSource).toContain(
      'router.replace({ pathname: router.pathname, query: cleaned }'
    )
    expect(themeSource).toContain('if (needsCleanup)')
    expect(themeSource).toContain('shallow: true')
    expect(themeSource).toContain('scroll: false')
  })

  test('重复点击当前筛选不写历史', () => {
    expect(themeSource).toContain('const unchanged =')
    expect(themeSource).toContain('if (unchanged) return')
  })

  test('筛选 setter 只出现在声明、深链 effect、两个显式 handler —— 无隐式重置', () => {
    const count = needle => themeSource.split(needle).length - 1
    // 声明 1 + 深链 effect 1 + handleCategoryChange 1
    expect(count('setActiveCategoryKey')).toBe(3)
    // 声明 1 + 深链 effect 1 + handleCategoryChange 1 + handleTagChange 1
    expect(count('setActiveTagKey')).toBe(4)
  })
})
