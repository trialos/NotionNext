/**
 * 音乐行防泄漏契约
 *
 * 音乐行与普通博文同库同表，靠 type 区分。任何一处忘了排除，
 * 它就会从四条链路漏出去：通用 slug 路由（渲染成文章页）、
 * sitemap（登记一个不该存在的裸 slug）、revalidate（刷不存在的页）、
 * 以及站内代码里出现网易云接口地址（构建期直连网易云）。
 */
import fs from 'fs'
import path from 'path'

// notion-utils / notion-client 是 ESM 包，jest 的 transformIgnorePatterns 放行不了
// （与既有测试套件一致的约束：不改动 jest.config.js）。这里只补上被 import 链拉到的那几个导出。
jest.mock('notion-utils', () => {
  const getTextContent = val => {
    if (!Array.isArray(val)) return val
    return val
      .map(el => {
        if (!el) return ''
        if (typeof el === 'string') return el
        if (Array.isArray(el)) return getTextContent(el)
        return el.plain_text || ''
      })
      .join('')
  }
  return {
    __esModule: true,
    getTextContent,
    getDateValue: () => ({ start_date: null, end_date: null, time_zone: null }),
    idToUuid: id => id
  }
})

import { checkSlugHasMorThanTwoSlash, checkSlugHasNoSlash, checkSlugHasOneSlash } from '@/lib/utils/post'
import { isMusicType, sitePathOf } from '@/lib/music/paths'
import { getSEOMeta } from '@/components/SEO'

const ROOT = process.cwd()
const albumRow = {
  type: 'MusicAlbum',
  slug: 'album-35561162',
  href: 'album-35561162',
  status: 'Published'
}
const noteRow = { type: 'MusicNote', slug: 'note-480768665', status: 'Published' }

describe('通用 slug 路由不认音乐行', () => {
  test.each([
    ['checkSlugHasNoSlash', checkSlugHasNoSlash],
    ['checkSlugHasOneSlash', checkSlugHasOneSlash],
    ['checkSlugHasMorThanTwoSlash', checkSlugHasMorThanTwoSlash]
  ])('%s 不论 slug 什么形状都排除音乐行', (_name, fn) => {
    expect(fn(albumRow)).toBe(false)
    expect(fn({ ...albumRow, slug: 'a/b' })).toBe(false)
    expect(fn({ ...albumRow, slug: 'a/b/c' })).toBe(false)
    expect(fn(noteRow)).toBe(false)
    expect(isMusicType('MusicAlbum')).toBe(true)
    expect(isMusicType('Post')).toBe(false)
  })

  test('三种形状对普通文章的判定没被改坏', () => {
    expect(checkSlugHasNoSlash({ type: 'Post', slug: 'hello' })).toBe(true)
    expect(checkSlugHasOneSlash({ type: 'Post', slug: 'a/b' })).toBe(true)
    expect(checkSlugHasMorThanTwoSlash({ type: 'Post', slug: 'a/b/c' })).toBe(true)
    expect(checkSlugHasOneSlash({ type: 'Post', slug: 'hello' })).toBe(false)
    expect(checkSlugHasMorThanTwoSlash({ type: 'Post', slug: 'a/b' })).toBe(false)
  })

  test('菜单行的原有排除没被改坏', () => {
    expect(checkSlugHasNoSlash({ type: 'Menu', slug: 'about' })).toBe(false)
    expect(checkSlugHasNoSlash({ type: 'Post', slug: 'about' })).toBe(true)
  })
})

describe('站点路径由代码拼接', () => {
  test('专辑与手记各自落到自己的命名空间', () => {
    expect(sitePathOf(albumRow)).toBe('/music/album/album-35561162')
    expect(sitePathOf(noteRow)).toBe('/music/note/note-480768665')
    expect(sitePathOf({ type: 'Post', slug: 'hello' })).toBe('')
    expect(sitePathOf({ type: 'MusicAlbum' })).toBe('')
  })
})

describe('SEO 走真实路径', () => {
  const router = route => ({ route, query: {}, locale: 'zh-CN' })
  const locale = { NAV: {}, COMMON: {} }

  test('展架与专辑、手记的 canonical 都指向 /music/*', () => {
    const shelf = getSEOMeta({ NOTION_CONFIG: {} }, router('/music'), locale)
    expect(shelf.slug).toBe('music')

    const album = getSEOMeta(
      {
        NOTION_CONFIG: {},
        music: { album: { title: '二十岁', artist: '宝石Gem', cover: 'https://p1.music.126.net/a/1.jpg?param=840y840' } }
      },
      { route: '/music/album/[album]', query: { album: 'album-277294562' }, locale: 'zh-CN' },
      locale
    )
    expect(album.slug).toBe('music/album/album-277294562')
    expect(album.title).toContain('二十岁')
    // 外链封面必须是原样绝对地址，否则 og:image 会指到站内
    expect(album.image).toMatch(/^https:\/\/p1\.music\.126\.net/)

    const note = getSEOMeta(
      { NOTION_CONFIG: {}, note: { note: { title: '像一场缓慢的告别' }, context: {} } },
      { route: '/music/note/[note]', query: { note: 'note-480768665' }, locale: 'zh-CN' },
      locale
    )
    expect(note.slug).toBe('music/note/note-480768665')
    expect(note.type).toBe('article')
  })

  test('带 post 的音乐手记不会掉进 default 分支拼出裸 slug', () => {
    const meta = getSEOMeta(
      {
        NOTION_CONFIG: {},
        post: { ...noteRow, title: '像一场缓慢的告别' },
        note: { note: { title: '像一场缓慢的告别' }, context: {} }
      },
      { route: '/music/note/[note]', query: { note: 'note-480768665' }, locale: 'zh-CN' },
      locale
    )
    expect(meta.slug).not.toBe('note-480768665')
  })
})

describe('站点代码不请求网易云', () => {
  const SCAN_DIRS = ['lib', 'pages', 'components', 'hooks', 'themes']
  const banned = /music\.163\.com\/api/

  const sources = []
  const walk = dir => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), {
      withFileTypes: true
    })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(js|jsx|mjs|ts|tsx)$/.test(entry.name)) {
        sources.push([full, fs.readFileSync(path.join(ROOT, full), 'utf8')])
      }
    }
  }
  SCAN_DIRS.forEach(walk)

  test('lib/pages/components/hooks/themes 里搜不到网易云接口地址', () => {
    const hits = sources.filter(([, text]) => banned.test(text)).map(([f]) => f)
    expect(hits).toEqual([])
    // 确实扫到了文件，避免目录改名后这条断言空转
    expect(sources.length).toBeGreaterThan(50)
  })

  test('只有本地脚本可以碰网易云接口', () => {
    const scripts = fs.readdirSync(path.join(ROOT, 'scripts/music'))
    const withApi = scripts
      .filter(name => /\.mjs$/.test(name))
      .filter(name =>
        banned.test(
          fs.readFileSync(path.join(ROOT, 'scripts/music', name), 'utf8')
        )
      )
    expect(withApi).toEqual(['ncm.mjs'])
  })
})

describe('sitemap 与 revalidate 登记音乐路径', () => {
  test('两个 sitemap 生成器都走 sitePathOf', () => {
    const serverSitemap = fs.readFileSync(
      path.join(ROOT, 'pages/sitemap.xml.js'),
      'utf8'
    )
    const buildSitemap = fs.readFileSync(
      path.join(ROOT, 'lib/utils/sitemap.xml.js'),
      'utf8'
    )
    expect(serverSitemap).toContain('sitePathOf(post)')
    expect(buildSitemap).toContain('sitePathOf(post)')
    expect(serverSitemap).toMatch(/slug: 'music'/)
    expect(buildSitemap).toMatch(/slug: 'music'/)
  })

  test('全站 revalidate 默认包含 /music，且音乐行不登记裸 slug', () => {
    const revalidation = fs.readFileSync(
      path.join(ROOT, 'lib/server/revalidation.js'),
      'utf8'
    )
    expect(revalidation).toContain("'/music'")
    expect(revalidation).toContain('add(sitePathOf(post))')
  })
})
