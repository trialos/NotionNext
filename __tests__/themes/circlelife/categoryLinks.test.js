import fs from 'fs'
import path from 'path'

const readTheme = (...parts) =>
  fs.readFileSync(path.join(process.cwd(), 'themes/circlelife', ...parts), 'utf8')

const readRepo = (...parts) =>
  fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8')

describe('circlelife 分类链接：指向归档分类视图', () => {
  test('文章页分类 chip → /archive?category=', () => {
    const source = readTheme('components', 'PostMeta.js')
    expect(source).toContain(
      'href={`/archive?category=${encodeURIComponent(post.category)}`}'
    )
    expect(source).not.toContain('/category/')
  })

  test('列表与时间线 chip → /archive?category=（两处）', () => {
    const source = readTheme('components', 'BlogItem.js')
    expect(source.match(/\/archive\?category=/g)).toHaveLength(2)
    expect(source).not.toContain('/category/')
  })
})

describe('/category 退役', () => {
  test('分类路由文件已删除', () => {
    const repo = process.cwd()
    expect(fs.existsSync(path.join(repo, 'pages/category'))).toBe(false)
  })

  // EXPORT 模式下 next.config 不启用 redirects，重定向契约不适用
  const redirectTest = process.env.EXPORT ? test.skip : test
  redirectTest('next.config：旧链接 308 到归档分类视图，具体规则在前', () => {
    const config = require('../../../next.config.js')
    const rules = config.redirects()
    const paged = rules.find(
      rule => rule.source === '/category/:category/page/:page'
    )
    const single = rules.find(rule => rule.source === '/category/:category')
    const index = rules.find(rule => rule.source === '/category')

    expect(paged).toMatchObject({
      destination: '/archive?category=:category',
      permanent: true
    })
    expect(single).toMatchObject({
      destination: '/archive?category=:category',
      permanent: true
    })
    expect(index).toMatchObject({
      destination: '/archive',
      permanent: true
    })
    // i18n 开启时 source 由 Next 按语言自动加前缀；显式 locale:false 会命中不到默认语言裸路径
    expect(rules.some(rule => rule.locale === false)).toBe(false)

    const order = rule => rules.indexOf(rule)
    expect(order(paged)).toBeLessThan(order(single))
    expect(order(single)).toBeLessThan(order(index))
  })

  test('sitemap 生成器不再输出 /category/*', () => {
    const builder = readRepo('lib', 'utils', 'sitemap.xml.js')
    expect(builder).toContain('isCategorySlug')
    expect(builder).not.toContain("slug: 'category'")
    expect(builder).toContain("slug: 'archive'")

    const dynamic = readRepo('pages', 'sitemap.xml.js')
    expect(dynamic).not.toContain("slug: 'category'")
    expect(dynamic).toContain('isCategorySlug')

    // 未被引用的旧生成器也保持同一口径
    const legacy = readRepo('lib', 'utils', 'sitemap.js')
    expect(legacy).not.toContain('/category/')
    expect(legacy).toContain('url: `${LINK}/archive`')
  })
})
