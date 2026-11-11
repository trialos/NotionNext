import fs from 'fs'
import path from 'path'

import {
  buildArchiveQuery,
  readArchiveQuery,
  resolveArchiveKeys
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

describe('LayoutArchive 深链接线契约', () => {
  test('URL 只在路由就绪后、经纯映射函数进入 state', () => {
    expect(themeSource).toContain('readArchiveQuery(')
    expect(themeSource).toContain('router.isReady')
    expect(themeSource).toContain('resolveArchiveKeys(facets')
    expect(themeSource).toContain(
      'setActiveCategoryKey(prev => (prev === categoryKey ? prev : categoryKey))'
    )
    expect(themeSource).toContain(
      'setActiveTagKey(prev => (prev === tagKey ? prev : tagKey))'
    )
  })

  test('用户显式操作才写 URL：shallow + 不滚动', () => {
    expect(themeSource).toContain('buildArchiveQuery(facets, categoryKey, tagKey)')
    expect(themeSource).toContain("router.replace({ pathname: router.pathname, query }")
    expect(themeSource).toContain('shallow: true')
    expect(themeSource).toContain('scroll: false')
  })

  test('筛选 setter 只出现在声明、深链 effect、两个显式 handler —— 无隐式重置', () => {
    const count = needle => themeSource.split(needle).length - 1
    // 声明 1 + 深链 effect 1 + handleCategoryChange 1
    expect(count('setActiveCategoryKey')).toBe(3)
    // 声明 1 + 深链 effect 1 + handleCategoryChange 1 + handleTagChange 1
    expect(count('setActiveTagKey')).toBe(4)
  })
})
