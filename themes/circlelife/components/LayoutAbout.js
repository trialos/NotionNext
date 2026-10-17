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
