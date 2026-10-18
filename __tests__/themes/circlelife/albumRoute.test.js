/**
 * @jest-environment node
 */
import {
  buildAlbumHref,
  findDeckIndexById,
  isAlbumPath,
  parseAlbumQuery
} from '@/themes/circlelife/components/albumRoute'

describe('albumRoute', () => {
  it('parseAlbumQuery defaults to shelf', () => {
    expect(parseAlbumQuery({})).toEqual({ view: 'shelf', deck: '' })
    expect(parseAlbumQuery({ view: 'gallery', deck: 'abc' })).toEqual({
      view: 'gallery',
      deck: 'abc'
    })
  })

  it('buildAlbumHref', () => {
    expect(buildAlbumHref({ view: 'shelf' })).toBe('/album')
    expect(buildAlbumHref({ view: 'gallery', deckId: 'id 1' })).toBe(
      '/album?view=gallery&deck=id%201'
    )
  })

  it('findDeckIndexById', () => {
    const decks = [{ id: 'a' }, { id: 'b' }]
    expect(findDeckIndexById(decks, 'b')).toBe(1)
    expect(findDeckIndexById(decks, 'nope')).toBe(-1)
  })

  it('isAlbumPath', () => {
    expect(isAlbumPath('/album')).toBe(true)
    expect(isAlbumPath('/album/')).toBe(true)
    expect(isAlbumPath('/album?view=gallery')).toBe(true)
    expect(isAlbumPath('/about')).toBe(false)
  })
})
