import { getAllCategories } from '@/lib/db/notion/getAllCategories'

const allPages = [
  { type: 'Post', status: 'Published', category: '字里行间' },
  { type: 'Post', status: 'Published', category: '字里行间' },
  { type: 'Post', status: 'Published', category: '人机协作' },
  { type: 'Post', status: 'Published', category: '未配置选项' },
  { type: 'Page', status: 'Published', category: '字里行间' },
  { type: 'Post', status: 'Draft', category: '人机协作' }
]

const categoryOptions = [
  {
    id: 'opt-1',
    value: '字里行间',
    color: 'orange',
    description: '梳理对生活与世界的感悟，写下想要深度思考的一些话题。'
  },
  { id: 'opt-2', value: '人机协作', color: 'red' },
  { id: 'opt-3', value: '趣苑杂坛', color: 'green', description: '不拘主题。' }
]

describe('getAllCategories：分类选项 description', () => {
  test('保留 select 选项自带的 description；没有则为空串', () => {
    const list = getAllCategories({ allPages, categoryOptions })
    expect(list).toEqual([
      {
        id: 'opt-1',
        name: '字里行间',
        color: 'orange',
        count: 2,
        description: '梳理对生活与世界的感悟，写下想要深度思考的一些话题。'
      },
      {
        id: 'opt-2',
        name: '人机协作',
        color: 'red',
        count: 1,
        description: ''
      }
    ])
  })

  test('只统计 Published 的 Post；没有文章的选项不出现', () => {
    const list = getAllCategories({ allPages, categoryOptions })
    expect(list.map(item => item.name)).toEqual(['字里行间', '人机协作'])
  })

  test('sliceCount 只影响条数，不影响字段', () => {
    const list = getAllCategories({
      allPages,
      categoryOptions,
      sliceCount: 1
    })
    expect(list).toHaveLength(1)
    expect(list[0].description).toContain('梳理')
  })
})
