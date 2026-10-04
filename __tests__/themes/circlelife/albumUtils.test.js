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
    expect(decks[0].photos).toHaveLength(2)
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
