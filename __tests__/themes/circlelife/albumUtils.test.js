/**
 * @jest-environment node
 */
import {
  buildAlbumDecks,
  expandPhotoPage
} from '@/themes/circlelife/components/albumUtils'

describe('buildAlbumDecks / expandPhotoPage', () => {
  const base = {
    id: 'page-a',
    title: '国外的日子',
    type: 'Photo',
    status: 'Published',
    publishDate: 100,
    summary: '下班喜欢路过独立纪念碑。',
    description: '第一句导语。\n第二句导语。',
    images: [
      { id: '1', url: 'https://example.com/1.jpg', caption: 'a' },
      { id: '2', url: 'https://example.com/2.jpg', caption: '国外的日子' }
    ]
  }

  it('groups one published Photo page as one deck', () => {
    const decks = buildAlbumDecks([base])
    expect(decks).toHaveLength(1)
    expect(decks[0].id).toBe('page-a')
    expect(decks[0].name).toBe('国外的日子')
    expect(decks[0].description).toBe(base.description)
    expect(decks[0].photos).toHaveLength(2)
  })

  it('keeps summary short and stores description on the deck only', () => {
    const cards = expandPhotoPage(base)
    expect(cards[0].summary).toBe(base.summary)
    expect(cards[0].description).toBeUndefined()

    const decks = buildAlbumDecks([base])
    expect(decks[0].description).toBe(base.description)
  })

  it('does not fall back to description when summary is empty', () => {
    const page = {
      ...base,
      summary: '',
      description: '只有长导语',
      images: [{ id: '1', url: 'https://example.com/1.jpg' }]
    }
    const cards = expandPhotoPage(page)
    expect(cards[0].summary).toBe('')

    const decks = buildAlbumDecks([page])
    expect(decks[0].description).toBe('只有长导语')
  })

  it('trims description and preserves its internal line breaks', () => {
    const page = {
      ...base,
      summary: ' 短题眼 ',
      description: '  第一句。\n第二句。  '
    }
    const decks = buildAlbumDecks([page])
    expect(decks[0].description).toBe('第一句。\n第二句。')
    expect(decks[0].photos[0].summary).toBe('短题眼')
  })

  it('dedupes caption equal to description even when summary is empty', () => {
    const page = {
      ...base,
      summary: '',
      description: '图注即导语',
      images: [{ id: '1', url: 'https://example.com/1.jpg', caption: '图注即导语' }]
    }
    const cards = expandPhotoPage(page)
    expect(cards[0].caption).toBe('')
  })

  it('skips non-Photo and non-Published', () => {
    const decks = buildAlbumDecks([
      base,
      { ...base, id: 'x', type: 'Post' },
      { ...base, id: 'y', status: 'Draft' }
    ])
    expect(decks).toHaveLength(1)
    expect(decks[0].id).toBe('page-a')
  })

  it('dedupes caption equal to title', () => {
    const cards = expandPhotoPage(base)
    expect(cards[1].caption).toBe('')
    expect(cards[0].caption).toBe('a')
  })

  it('orders decks by publishDate desc', () => {
    const decks = buildAlbumDecks([
      {
        ...base,
        id: 'old',
        title: '旧',
        publishDate: 1,
        images: [{ url: 'https://a.com/o.jpg' }]
      },
      {
        ...base,
        id: 'new',
        title: '新',
        publishDate: 9,
        images: [{ url: 'https://a.com/n.jpg' }]
      }
    ])
    expect(decks.map(d => d.id)).toEqual(['new', 'old'])
  })
})
