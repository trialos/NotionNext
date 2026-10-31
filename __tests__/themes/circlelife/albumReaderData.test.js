import {
  buildReaderAlbums,
  findReaderAlbumIndex,
  parseReaderQuery,
  readerQuery
} from '@/themes/circlelife/components/albumReaderData'

const page = overrides => ({
  id: 'page-1',
  type: 'Photo',
  status: 'Published',
  title: '老派的方式',
  summary: '老派的方式',
  description: '老派是一种方式，也是一种记忆。',
  publishDay: '2026-09-21',
  publishDate: 1790000000000,
  images: [
    {
      id: 'img-1',
      url: 'https://www.notion.so/image/attachment%3Aabc%3Acover.jpg?table=block&id=1&width=1200&cache=v2',
      caption: '车窗',
      aspectRatio: 0.75
    }
  ],
  ...overrides
})

describe('albumReaderData', () => {
  test('summary 等于标题时，题眼回退到 description，避免目录重复标题', () => {
    const [album] = buildReaderAlbums([page()])
    expect(album.summary).toBe('老派是一种方式，也是一种记忆。')
    expect(album.intro).toBe('老派是一种方式，也是一种记忆。')
    expect(album.title).toBe('老派的方式')
  })

  test('summary 独立存在时保留为题眼', () => {
    const [album] = buildReaderAlbums([
      page({ summary: '雨还没停。', description: '九月的金边，雨还没停。' })
    ])
    expect(album.summary).toBe('雨还没停。')
    expect(album.intro).toBe('九月的金边，雨还没停。')
  })

  test('整理日期、张数、图注与取图档位', () => {
    const [album] = buildReaderAlbums([page()])
    expect(album.month).toBe('2026.09')
    expect(album.year).toBe('2026')
    expect(album.count).toBe(1)
    expect(album.photos[0].caption).toBe('车窗')
    expect(album.photos[0].ratio).toBe(0.75)
    expect(album.photos[0].src).toContain('width=1024')
    expect(album.photos[0].thumbSrc).toContain('width=512')
  })

  test('图注等于标题/题眼/小序时不重复展示', () => {
    const [album] = buildReaderAlbums([
      page({
        images: [
          {
            id: 'img-1',
            url: 'https://www.notion.so/image/attachment%3Aabc%3Acover.jpg?table=block&id=1&width=1200&cache=v2',
            caption: '老派的方式',
            aspectRatio: 0.75
          }
        ]
      })
    ])
    expect(album.photos[0].caption).toBe('')
  })

  test('正文无图时回退到页面封面', () => {
    const [album] = buildReaderAlbums([
      page({ images: [], pageCover: 'https://example.com/cover.jpg' })
    ])
    expect(album.count).toBe(1)
    expect(album.photos[0].src).toBe('https://example.com/cover.jpg')
    expect(album.photos[0].ratio).toBe(0)
  })

  test('按 publishDate 倒序', () => {
    const albums = buildReaderAlbums([
      page({ id: 'old', title: '旧', publishDate: 1 }),
      page({ id: 'new', title: '新', publishDate: 10 })
    ])
    expect(albums.map(a => a.id)).toEqual(['new', 'old'])
    expect(findReaderAlbumIndex(albums, 'old')).toBe(1)
    expect(findReaderAlbumIndex(albums, 'missing')).toBe(-1)
  })

  test('解析 deck / view，并生成只含专辑的 query', () => {
    expect(parseReaderQuery({ deck: 'p1' })).toEqual({
      deck: 'p1',
      gallery: false
    })
    expect(parseReaderQuery({ deck: ['p1'], view: 'gallery' })).toEqual({
      deck: 'p1',
      gallery: true
    })
    expect(readerQuery('p1')).toEqual({ deck: 'p1' })
    expect(readerQuery('p1', { gallery: true })).toEqual({
      deck: 'p1',
      view: 'gallery'
    })
  })
})
