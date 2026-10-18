import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

function personName(p) {
  if (!p) return ''
  if (typeof p === 'string') return p.trim()
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
  if (full) return full
  return (p.name || p.full_name || p.nickname || '').trim()
}

function rawAuthorFromPost(post) {
  if (!post) return ''
  // 作者字段优先于 author。两者不一致时（例如 select 已改成 Andrew，
  // author 仍是 Notion 账号名）与首页卡片保持同一来源。
  const candidates = [
    post['作者'],
    post.author,
    post.Author,
    post.writer,
    post.Writer
  ]
  for (const c of candidates) {
    if (!c) continue
    if (typeof c === 'string' && c.trim()) return c.trim()
    if (Array.isArray(c) && c.length) {
      if (typeof c[0] === 'string') {
        const s = c.map(x => String(x).trim()).filter(Boolean)
        if (s.length) return s[0]
      }
      const names = c.map(personName).filter(Boolean)
      if (names.length) return names.join(' · ')
    }
    if (typeof c === 'object') {
      const n = personName(c)
      if (n) return n
    }
  }
  return ''
}

export function getAuthorDirectory() {
  const list = siteConfig('CIRCLELIFE_AUTHORS', null, CONFIG)
  return Array.isArray(list) ? list : CONFIG.CIRCLELIFE_AUTHORS || []
}

/**
 * @returns {{ name: string, avatar?: string, id?: string, blurb?: string } | null}
 */
export function resolveAuthor(post) {
  const raw = rawAuthorFromPost(post)
  const dir = getAuthorDirectory()
  if (raw) {
    const key = raw.toLowerCase()
    const hit = dir.find(
      a => a.name?.toLowerCase() === key || a.id?.toLowerCase() === key
    )
    if (hit) {
      return {
        id: hit.id,
        name: hit.name,
        avatar: hit.avatar || '',
        blurb: hit.blurb || ''
      }
    }
    return { name: raw, avatar: '' }
  }
  // 没有文章作者时不回退成站点主人，避免首页与文章页眉不一致。
  return null
}
