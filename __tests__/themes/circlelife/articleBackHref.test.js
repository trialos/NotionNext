/**
 * @jest-environment node
 */
import { resolveArticleBackHref } from '@/themes/circlelife/components/articleBackHref'

describe('resolveArticleBackHref', () => {
  it('uses stored when present', () => {
    expect(
      resolveArticleBackHref({
        stored: '/archive',
        lastList: '/tag/x',
        currentPath: '/article/foo'
      })
    ).toBe('/archive')
  })

  it('uses the session last list page when nothing is stored', () => {
    expect(
      resolveArticleBackHref({
        lastList: '/category/life',
        currentPath: '/article/foo'
      })
    ).toBe('/category/life')
  })

  it('ignores non-path lastList values', () => {
    expect(
      resolveArticleBackHref({
        lastList: 'https://example.com/category/life',
        currentPath: '/article/foo'
      })
    ).toBe('/')
  })

  it('falls back to home when lastList is the current article', () => {
    expect(
      resolveArticleBackHref({
        lastList: '/article/foo',
        currentPath: '/article/foo'
      })
    ).toBe('/')
  })

  it('falls back to home when nothing is available', () => {
    expect(resolveArticleBackHref({ currentPath: '/article/foo' })).toBe('/')
  })
})
