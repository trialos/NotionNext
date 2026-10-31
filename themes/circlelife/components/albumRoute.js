/**
 * 影集路径判定：导航里点「影集」时，区分是否已在 /album。
 * 阅读器的 deck/view 解析在 albumReaderData.js。
 */
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
