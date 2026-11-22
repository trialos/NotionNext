import {
  buildReaderAlbums,
  findReaderAlbumIndex,
  parseReaderQuery,
  readerQuery,
  resolveQueryDeckChange,
  selectReaderPhotoSrc,
  splitIntroParagraphs
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
  test('summary 与 title 相同时，题眼仍取 Summary，不再回退到 description', () => {
    const [album] = buildReaderAlbums([page()])
    expect(album.summary).toBe('老派的方式')
    expect(album.intro).toBe('老派是一种方式，也是一种记忆。')
    expect(album.introParagraphs).toEqual(['老派是一种方式，也是一种记忆。'])
    expect(album.title).toBe('老派的方式')
  })

  test('summary 独立存在时保留为题眼', () => {
    const [album] = buildReaderAlbums([
      page({ summary: '雨还没停。', description: '九月的金边，雨还没停。' })
    ])
    expect(album.summary).toBe('雨还没停。')
    expect(album.intro).toBe('九月的金边，雨还没停。')
  })

  test('Description 的多行文本保留在 intro，并切成 introParagraphs', () => {
    const description =
      '九月的金边，雨还没停。\n\n我们在河边坐了一下午。\n夜里才回去。'
    const [album] = buildReaderAlbums([
      page({ summary: '雨还没停。', description })
    ])
    expect(album.intro).toBe(description)
    expect(album.introParagraphs).toEqual([
      '九月的金边，雨还没停。',
      '我们在河边坐了一下午。',
      '夜里才回去。'
    ])
  })

  test('没有 Description 时 introParagraphs 为空数组', () => {
    const [album] = buildReaderAlbums([page({ description: '' })])
    expect(album.intro).toBe('')
    expect(album.introParagraphs).toEqual([])
  })

  describe('splitIntroParagraphs', () => {
    test('按手动换行切段，收掉连续空行、CRLF 与首尾空白', () => {
      expect(splitIntroParagraphs('\n第一段\n\n\n第二段\r\n第三段\n')).toEqual([
        '第一段',
        '第二段',
        '第三段'
      ])
    })

    test('空值、纯空白与非字符串返回空数组', () => {
      expect(splitIntroParagraphs('')).toEqual([])
      expect(splitIntroParagraphs('   \n\n ')).toEqual([])
      expect(splitIntroParagraphs(null)).toEqual([])
      expect(splitIntroParagraphs(undefined)).toEqual([])
      expect(splitIntroParagraphs(42)).toEqual([])
    })

    test('单段不拆散，段内空格保留', () => {
      expect(splitIntroParagraphs('  一句话  ')).toEqual(['一句话'])
      expect(splitIntroParagraphs('前半 后半')).toEqual(['前半 后半'])
    })
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

  test('解析 deck，并生成只含专辑的 query；旧 view 参数被忽略', () => {
    expect(parseReaderQuery({ deck: 'p1' })).toEqual({ deck: 'p1' })
    expect(parseReaderQuery({ deck: ['p1'], view: 'gallery' })).toEqual({
      deck: 'p1'
    })
    expect(readerQuery('p1')).toEqual({ deck: 'p1' })
    expect(readerQuery('')).toEqual({})
  })

  test('同路由换辑只处理外部导航', () => {
    // 真正的对外导航：query 变了，且不是刚写回的 deck
    expect(
      resolveQueryDeckChange({
        queryDeck: 'b',
        syncedDeck: 'a',
        currentDeck: 'a',
        lastQueryDeck: 'a'
      })
    ).toBe('b')
    // query 没变化：不处理
    expect(
      resolveQueryDeckChange({
        queryDeck: 'a',
        syncedDeck: 'a',
        currentDeck: 'a',
        lastQueryDeck: 'a'
      })
    ).toBe('')
    // 跨辑过渡期 query 还停在旧值：不能误判成外部导航
    expect(
      resolveQueryDeckChange({
        queryDeck: 'a',
        syncedDeck: 'b',
        currentDeck: 'b',
        lastQueryDeck: 'a'
      })
    ).toBe('')
    // query 先更新、状态后更新：刚写回的 deck 不处理
    expect(
      resolveQueryDeckChange({
        queryDeck: 'b',
        syncedDeck: 'b',
        currentDeck: 'a',
        lastQueryDeck: 'a'
      })
    ).toBe('')
    // 状态已在目标辑：不重复处理
    expect(
      resolveQueryDeckChange({
        queryDeck: 'a',
        syncedDeck: 'b',
        currentDeck: 'a',
        lastQueryDeck: 'b'
      })
    ).toBe('')
    // 空 query：不处理
    expect(
      resolveQueryDeckChange({
        queryDeck: '',
        syncedDeck: 'a',
        currentDeck: 'a',
        lastQueryDeck: 'a'
      })
    ).toBe('')
  })
})

describe('selectReaderPhotoSrc', () => {
  const photo = {
    src: 'https://www.notion.so/image/a.jpg?width=1024&cache=v2',
    fullSrc: 'https://www.notion.so/image/a.jpg?width=1080&cache=v2'
  }
  const widthOf = src => Number(new URL(src).searchParams.get('width'))

  test('按显示宽 × DPR 选档：大屏 Retina 升 2048，小屏维持 1024', () => {
    expect(widthOf(selectReaderPhotoSrc(photo, 1008, 1))).toBe(1024)
    expect(widthOf(selectReaderPhotoSrc(photo, 1008, 2))).toBe(2048)
    expect(widthOf(selectReaderPhotoSrc(photo, 504, 2))).toBe(1024)
    expect(widthOf(selectReaderPhotoSrc(photo, 504, 1))).toBe(512)
  })

  test('无框宽或缺失 fullSrc 时退回预生成的 1024 档', () => {
    expect(selectReaderPhotoSrc(photo, 0, 3)).toBe(photo.src)
    expect(selectReaderPhotoSrc(photo, undefined, 2)).toBe(photo.src)
    expect(selectReaderPhotoSrc({ src: photo.src }, 1008, 2)).toBe(photo.src)
    expect(selectReaderPhotoSrc(null, 1008, 2)).toBe('')
  })

  test('外链原样返回，不强行改写 width', () => {
    const external = {
      src: 'https://example.com/a.jpg?width=800',
      fullSrc: 'https://example.com/a.jpg?width=800'
    }
    expect(selectReaderPhotoSrc(external, 1008, 2)).toBe(external.src)
  })
})
