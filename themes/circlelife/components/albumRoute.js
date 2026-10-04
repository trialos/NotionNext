/**
 * 影集 URL 约定（P0）
 * 书架: /album 或 ?view=shelf
 * 画廊: ?view=gallery&deck=<Notion pageId>
 */

export function parseAlbumQuery(query = {}) {
  const rawView = query?.view
  const view = rawView === 'gallery' ? 'gallery' : 'shelf'
  const deckRaw = query?.deck
  const deck =
    typeof deckRaw === 'string'
      ? deckRaw
      : Array.isArray(deckRaw)
        ? String(deckRaw[0] || '')
        : ''
  return { view, deck: deck.trim() }
}

export function findDeckIndexById(decks, deckId) {
  if (!deckId || !Array.isArray(decks) || !decks.length) return -1
  const id = String(deckId)
  return decks.findIndex(d => d && String(d.id) === id)
}

export function buildAlbumHref({ view = 'shelf', deckId = '' } = {}) {
  if (view !== 'gallery') return '/album'
  if (!deckId) return '/album?view=gallery'
  return `/album?view=gallery&deck=${encodeURIComponent(String(deckId))}`
}

export function isAlbumPath(pathnameOrHref) {
  if (!pathnameOrHref || typeof pathnameOrHref !== 'string') return false
  try {
    const path = pathnameOrHref.startsWith('http')
      ? new URL(pathnameOrHref).pathname
      : pathnameOrHref.split('?')[0].split('#')[0]
    return path.replace(/\/$/, '') === '/album'
  } catch (_) {
    return (
      pathnameOrHref.replace(/\/$/, '').split('?')[0].split('#')[0] === '/album'
    )
  }
}
