/**
 * _document 预连接契约测试（2026-11-24 PageSpeed 修正）
 *
 * 报告原文：
 * - https://images.unsplash.com/ 的 preconnect「未使用的 preconnect」→ 删掉。
 * - https://img.withcol.com/ 的 preconnect 带 crossorigin="anonymous"
 *   「请检查并确保正确使用了 crossorigin 属性」→ 页面图片是 <img>（no-cors），
 *   preconnect 带 crossorigin 会建另一条 CORS 连接、命中不到，
 *   去掉后报告估省 350ms。
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const source = fs.readFileSync(path.join(rootDir, 'pages', '_document.js'), 'utf8')

describe('_document 预连接（手机 LCP）', () => {
  test('删除未使用的 images.unsplash.com preconnect 与 dns-prefetch', () => {
    expect(source).not.toContain("href='https://images.unsplash.com'")
    expect(source).not.toContain("href='//images.unsplash.com'")
  })

  test('NOTION_HOST preconnect 不带 crossorigin（匹配 <img> 的 no-cors 请求）', () => {
    expect(source).toContain("<link rel='preconnect' href={BLOG.NOTION_HOST} />")
    expect(source).not.toMatch(
      /preconnect[\s\S]{0,120}crossOrigin='anonymous'/
    )
  })

  test('NOTION_HOST 的 dns-prefetch 仍保留', () => {
    expect(source).toContain(
      "href={BLOG.NOTION_HOST.replace(/^https?:\\/\\//, '//')}"
    )
  })

  test('百度统计源做 dns-prefetch（uses-rel-preconnect 估省 210ms）', () => {
    expect(source).toContain("rel='dns-prefetch' href='//hm.baidu.com'")
  })

  test('FontAwesome 字体仍不做高优先级 preload', () => {
    expect(source).toMatch(/FontAwesome 字体不做高优先级 preload/)
  })
})
