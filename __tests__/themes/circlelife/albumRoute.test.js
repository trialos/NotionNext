import { isAlbumPath } from '@/themes/circlelife/components/albumRoute'

describe('albumRoute', () => {
  it('isAlbumPath 只命中 /album 路径', () => {
    expect(isAlbumPath('/album')).toBe(true)
    expect(isAlbumPath('/album/')).toBe(true)
    expect(isAlbumPath('/album?view=gallery')).toBe(true)
    expect(isAlbumPath('https://example.com/album?deck=abc')).toBe(true)
    expect(isAlbumPath('/about')).toBe(false)
    expect(isAlbumPath('')).toBe(false)
    expect(isAlbumPath(null)).toBe(false)
  })
})
