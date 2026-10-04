/**
 * @jest-environment node
 */
import { resolveArticleBackHref } from '@/themes/circlelife/components/articleBackHref'

describe('resolveArticleBackHref', () => {
  const origin = 'https://felixorb.com'

  it('uses stored when present', () => {
    expect(
      resolveArticleBackHref({
        stored: '/archive',
        referrer: 'https://felixorb.com/tag/x',
        currentPath: '/article/foo',
        origin
      })
    ).toBe('/archive')
  })

  it('parses same-origin referrer', () => {
    expect(
      resolveArticleBackHref({
        referrer: 'https://felixorb.com/category/life',
        currentPath: '/article/foo',
        origin
      })
    ).toBe('/category/life')
  })

  it('rejects external referrer', () => {
    expect(
      resolveArticleBackHref({
        referrer: 'https://google.com/',
        currentPath: '/article/foo',
        origin
      })
    ).toBe('/')
  })

  it('falls back when referrer is current article', () => {
    expect(
      resolveArticleBackHref({
        referrer: 'https://felixorb.com/article/foo',
        currentPath: '/article/foo',
        origin
      })
    ).toBe('/')
  })
})
