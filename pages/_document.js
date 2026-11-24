// eslint-disable-next-line @next/next/no-document-import-in-page
import BLOG from '@/blog.config'
import Document, { Head, Html, Main, NextScript } from 'next/document'

// 预先设置深色模式的脚本内容
const darkModeScript = `
(function() {
  const darkMode = localStorage.getItem('darkMode')

  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  const defaultAppearance = '${BLOG.APPEARANCE || 'auto'}'

  let shouldBeDark = darkMode === 'true' || darkMode === 'dark'

  if (darkMode === null) {
    if (defaultAppearance === 'dark') {
      shouldBeDark = true
    } else if (defaultAppearance === 'auto') {
      // 检查是否在深色模式时间范围内
      const date = new Date()
      const hours = date.getHours()
      const darkTimeStart = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[0] : 18}
      const darkTimeEnd = ${BLOG.APPEARANCE_DARK_TIME ? BLOG.APPEARANCE_DARK_TIME[1] : 6}
      
      shouldBeDark = prefersDark || (hours >= darkTimeStart || hours < darkTimeEnd)
    }
  }
  
  // 立即设置 html 元素的类
  document.documentElement.classList.add(shouldBeDark ? 'dark' : 'light')
})()
`

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang={BLOG.LANG}>
        <Head>
          {/* 2026-11-24 PageSpeed：删掉未使用的 images.unsplash.com preconnect
              （页面并不请求该源，留着只会多一次握手）。 */}
          {/* Notion 图片统一走 BLOG.NOTION_HOST 反代，预连接省掉握手延迟。
              ⚠️ 不带 crossorigin：<img> 请求是 no-cors，带 anonymous 会让
              preconnect 建的是另一条 CORS 连接、命中不到（PageSpeed 实测
              「未使用的 preconnect」，修掉预计省 350ms）。 */}
          <link rel='preconnect' href={BLOG.NOTION_HOST} />
          <link
            rel='dns-prefetch'
            href={BLOG.NOTION_HOST.replace(/^https?:\/\//, '//')}
          />

          {/* FontAwesome 字体不做高优先级 preload：
              2026-11-24 PageSpeed 手机端 LCP 12.7s，早期带宽要全留给首屏 LCP 图。
              两个 woff2 交给下面的 CSS 按需触发，不再抢占首图的下载窗口。
              CSS 本体仍是 preload + rAF 切 stylesheet，noscript 有兜底，功能不变。 */}
          {BLOG.FONT_AWESOME && (
            <>
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    '.fa,.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{display:inline-flex;width:1.25em;min-width:1.25em;height:1em;align-items:center;justify-content:center;text-align:center;line-height:1}'
                }}
              />
              <link
                id='font-awesome-css'
                rel='preload'
                as='style'
                href={BLOG.FONT_AWESOME}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html:
                    "requestAnimationFrame(function(){var l=document.getElementById('font-awesome-css');if(l)l.rel='stylesheet'})"
                }}
              />
              <noscript>
                <link rel='stylesheet' href={BLOG.FONT_AWESOME} />
              </noscript>
            </>
          )}

          {/* 预先设置深色模式，避免闪烁 */}
          <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
