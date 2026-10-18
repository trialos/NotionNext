import Head from 'next/head'
import InfiniteAboutGrid from './InfiniteAboutGrid'

/**
 * 关于我页面布局 (LayoutAbout)
 *
 * 沉浸式 3D 瀑布展墙与 Hero 序言封面
 */
export default function LayoutAbout(props) {
  const pageTitle = `${props.aboutTitle || '关于我'} | ${props.siteInfo?.title || 'Circle of Life'}`
  const description =
    props.aboutSummary || '时光的弧线 · 捕捉生活、人机协作与日常美学的独立光影。'

  const firstCard = props.aboutCards?.[0]
  const secondCard = props.aboutCards?.[1]

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name='description' content={description} />
        <meta property='og:title' content={pageTitle} />
        <meta property='og:description' content={description} />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        {/* 字体非阻塞异步加载：优先级降为 Low，避免 VeryHigh 阻塞关键渲染与抢占 LCP 图片网络带宽 */}
        <link
          rel='preload'
          as='style'
          href='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@500&family=Newsreader:wght@500&family=Noto+Serif+SC:wght@500&display=swap'
        />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@500&family=Newsreader:wght@500&family=Noto+Serif+SC:wght@500&display=swap'
          media='print'
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@500&family=Newsreader:wght@500&family=Noto+Serif+SC:wght@500&display=swap'
          />
        </noscript>
      </Head>
      <main className='relative w-full h-[100dvh] overflow-hidden'>
        {/* 沉浸式 3D 瀑布展墙与 Hero 序言封面 */}
        <InfiniteAboutGrid
          cards={props.aboutCards || []}
          summary={props.aboutSummary}
          title={props.aboutTitle}
        />
      </main>
    </>
  )
}
