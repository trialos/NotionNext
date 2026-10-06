'use client'

/**
 * Circle of Life 主题
 *
 * 基于 thoughtlite 骨架，视觉对齐 Null_Byte / 时光的弧线封面工具（theme-ink）。
 * 使用：Notion 配置中心或环境变量 THEME=circlelife
 */

import replaceSearchResult from '@/components/Mark'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import SmartLink from '@/components/SmartLink'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import BlogListArchive from './components/BlogListArchive'
import { BlogListPage } from './components/BlogListPage'
import { BlogListScroll } from './components/BlogListScroll'
import AlbumStage from './components/AlbumStage'
import { AlbumUIProvider } from './components/albumContext'
import ArticleBack from './components/ArticleBack'
import BackToTop from './components/BackToTop'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import LatestCard from './components/LatestCard'
import ListScrollMemory from './components/ListScrollMemory'
import MobileToc from './components/MobileToc'
import { PostLock } from './components/PostLock'
import { PostMeta } from './components/PostMeta'
import SearchInput from './components/SearchInput'
import { SideBar } from './components/SideBar'
import TitleBar from './components/TitleBar'
import PageMast from './components/PageMast'
import TlPageHero from './components/TlPageHero'
import CONFIG from './config'
import { Style } from './style'

const Comment = dynamic(() => import('@/components/Comment'), { ssr: false })

/**
 * 基础布局框架
 * 1.其它页面都嵌入在LayoutBase中
 * 2.采用左右两侧布局，移动端使用顶部导航栏
 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { children, post } = props
  const { onLoading, fullWidth, locale } = useGlobal()
  const router = useRouter()
  const isAlbumPage =
    router?.pathname === '/album' ||
    (typeof router?.asPath === 'string' &&
      router.asPath.split('?')[0].replace(/\/$/, '') === '/album')

  const LAYOUT_VERTICAL =
    post && siteConfig('CIRCLELIFE_ARTICLE_LAYOUT_VERTICAL', false, CONFIG)

  const LAYOUT_SIDEBAR_REVERSE = siteConfig('LAYOUT_SIDEBAR_REVERSE', false)

  const sidebarOnlyPost = siteConfig(
    'CIRCLELIFE_SIDEBAR_ONLY_ON_POST',
    true,
    CONFIG
  )
  const wide = fullWidth || isAlbumPage
  // 与 SideBar 的渲染条件对齐：无目录的页面不预留侧栏槽，避免内容被空槽挤偏
  const hasDesktopToc = Boolean(post?.toc && post.toc.length > 2)
  const showSidebar =
    !wide &&
    (!sidebarOnlyPost || Boolean(post)) &&
    !LAYOUT_VERTICAL &&
    hasDesktopToc

  // 会话内记录最后一个非文章页，作为文章「返回」的兜底目标；
  // document.referrer 指向文档最后一次完整加载的页面，SPA 内不更新，不可靠
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (post) return
    try {
      sessionStorage.setItem(
        'cl-list-last',
        window.location.pathname + window.location.search
      )
    } catch (_) {}
  }, [router.asPath, post])

  return (
    <AlbumUIProvider>
    <div
      id='theme-circlelife'
      className={`${siteConfig('FONT_STYLE')} flex min-h-screen flex-col scroll-smooth${isAlbumPage ? ' cl-is-album' : ''}${showSidebar ? ' cl-has-sidebar' : ''}`}>
      <Style />

      <Header {...props} />
      <TitleBar {...props} />

      <div id='container-inner' className='relative z-10 w-full flex-1'>
        <div
          id='container-wrapper'
          className={`relative mx-auto flex justify-center ${
            isAlbumPage
              ? 'max-w-none w-full flex-col items-stretch px-0 py-0'
              : `px-4 py-8 md:px-6 ${LAYOUT_SIDEBAR_REVERSE ? 'md:flex-row-reverse' : ''} ${
                  LAYOUT_VERTICAL
                    ? 'max-w-5xl flex-col items-center'
                    : showSidebar
                      ? 'max-w-5xl flex-col items-start gap-8 md:flex-row md:gap-10'
                      : 'max-w-3xl flex-col items-start'
                }`
          }`}>
          <div
            className={`min-w-0 flex-1 ${
              wide
                ? 'w-full max-w-none'
                : LAYOUT_VERTICAL
                  ? 'w-full max-w-5xl'
                  : 'w-full max-w-3xl'
            }`}>
            <Transition
              show={!onLoading}
              appear={true}
              enter='transition ease-in-out duration-700 transform order-first'
              enterFrom='opacity-0 translate-y-16'
              enterTo='opacity-100'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 -translate-y-16'
              unmount={false}>
              {props.slotTop}
              {children}
            </Transition>
          </div>

          {showSidebar && (
            <div className='w-full flex-shrink-0 md:w-64 md:sticky cl-sidebar-sticky'>
              <SideBar {...props} />
            </div>
          )}

          {LAYOUT_VERTICAL && !wide && (
            <div className='flex w-full max-w-5xl flex-col justify-center space-y-0 px-0 md:flex-row md:space-x-2 md:space-y-0'>
              <SideBar {...props} />
            </div>
          )}
        </div>
      </div>

      <Footer />

      <BackToTop label={locale?.POST?.TOP || '返回顶部'} />
      <ListScrollMemory />
    </div>
    </AlbumUIProvider>
  )
}

/**
 * 首页
 * @param {*} props
 * @returns 此主题首页就是列表
 */
const LayoutIndex = props => {
  return <LayoutPostList {...props} />
}

/**
 * 文章列表
 * @param {*} props
 * @returns
 */
const LayoutPostList = props => {
  const { category, tag, keyword, latestPosts, posts } = props
  const router = useRouter()
  const useTimeline =
    siteConfig('CIRCLELIFE_HOME_TIMELINE', true, CONFIG) &&
    !category &&
    !tag &&
    !keyword &&
    !router?.query?.s &&
    (router.pathname === '/' || router.pathname === '/page/[page]')

  const heroPosts =
    (latestPosts?.length ? latestPosts : posts)?.filter(Boolean) || []

  return (
    <>
      {category ? (
        <PageMast eyebrow='分类' title={category} />
      ) : null}
      {tag ? (
        <PageMast eyebrow='标签' title={String(tag)} />
      ) : null}

      {useTimeline &&
        siteConfig('CIRCLELIFE_HOME_LATEST_CARD', true, CONFIG) && (
          <LatestCard posts={heroPosts} post={heroPosts[0]} />
        )}

      {siteConfig('POST_LIST_STYLE') === 'page' ? (
        <BlogListPage {...props} useTimeline={useTimeline} />
      ) : (
        <BlogListScroll {...props} useTimeline={useTimeline} />
      )}
    </>
  )
}

/**
 * 文章详情页
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const { locale } = useGlobal()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  // Notion Page 型页面（关于/往期整理等）用统一刊头；普通文章保持 hero+meta
  const isPage = post?.type === 'Page'
  useEffect(() => {
    // 404
    if (!post) {
      setTimeout(
        () => {
          if (isBrowser) {
            const article = document.querySelector('#article-wrapper #notion-article')
            if (!article) {
              router.push('/404').then(() => {
                console.warn('找不到页面', router.asPath)
              })
            }
          }
        },
        waiting404
      )
    }
  }, [post])
  return (
    <>
      {lock ? (
        <PostLock validPassword={validPassword} />
      ) : (
        post && (
          <article className='cl-card cl-article-card overflow-hidden'>
            {siteConfig('CIRCLELIFE_ARTICLE_COVER', true, CONFIG) &&
            (post.pageCoverThumbnail || post.pageCover) ? (
              <div className='cl-article-cover'>
                <LazyImage
                  src={post.pageCoverThumbnail || post.pageCover}
                  alt=''
                  className='cl-article-cover-img'
                />
                <div className='cl-article-cover-fade' aria-hidden='true' />
              </div>
            ) : null}
            <div className='cl-article-inner px-5 py-6 md:px-8 md:py-9'>
            <ArticleBack className='cl-article-back--top' postId={post?.id} />
            {isPage ? (
              <PageMast
                title={post.title}
                description={post.summary || undefined}
                className='cl-page-mast--article'
              />
            ) : (
              <header className='cl-article-hero'>
                <h1 className='cl-article-title'>
                  {siteConfig('POST_TITLE_ICON') && (
                    <NotionIcon icon={post.pageIcon} />
                  )}
                  {post.title}
                </h1>
                <PostMeta post={post} />
              </header>
            )}
            <div id='article-wrapper' className='cl-prose-wrap'>
              <NotionPage post={post} />
              {siteConfig('CIRCLELIFE_SHOW_SHARE', false, CONFIG) ? (
                <ShareBar post={post} />
              ) : null}
            </div>
            <div className='cl-article-back-row'>
              <ArticleBack className='cl-article-back--bottom' postId={post?.id} />
            </div>
            {siteConfig('CIRCLELIFE_SHOW_COMMENT', false, CONFIG) ? (
              <section
                className='mt-8 border-t border-[var(--cl-border)] pt-6'
                aria-label={locale?.COMMON?.COMMENTS || 'Comments'}>
                <h2 className='cl-kicker mb-4 !text-[var(--cl-muted)]'>
                  {locale?.COMMON?.COMMENTS || '评论'}
                </h2>
                <Comment frontMatter={post} />
              </section>
            ) : null}
            </div>
          </article>
        )
      )}
      {post?.toc && post.toc.length > 2 ? <MobileToc toc={post.toc} /> : null}
    </>
  )
}

/**
 * 404页
 * @param {*} props
 * @returns
 */

/**
 * 影集：卡片舞台
 */
const LayoutAlbum = props => {
  return (
    <div className='cl-album-page w-full'>
      <AlbumStage pages={props.photos || []} />
    </div>
  )
}

const Layout404 = props => {
  const router = useRouter()
  useEffect(() => {
    // 延时3秒如果加载失败就返回首页
    setTimeout(() => {
      const article = isBrowser && document.getElementById('article-wrapper')
      if (!article) {
        router.push('/').then(() => {
          // console.log('找不到页面', router.asPath)
        })
      }
    }, 3000)
  }, [])

  return <>
        <div className='cl-card mx-auto mt-24 max-w-md px-8 py-12 text-center'>
            <div className='text-[var(--cl-text)]'>
                <h2 className='inline-block border-r-2 border-[var(--cl-border)] mr-2 px-3 py-2 align-top text-2xl font-semibold'><i className='mr-2 fas fa-spinner animate-spin' />404</h2>
                <div className='inline-block text-left h-32 leading-10 items-center text-[var(--cl-muted)]'>
                    <h2 className='m-0 p-0 text-base'>页面无法加载，即将返回首页</h2>
                </div>
            </div>
        </div>
    </>
}

/**
 * 搜索页
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  const { locale } = useGlobal()
  useEffect(() => {
    if (isBrowser) {
      const container = document.getElementById('posts-wrapper')
      if (keyword && container) {
        replaceSearchResult({
          doms: container,
          search: keyword,
          target: {
            element: 'span',
            className: 'text-red-500 border-b border-dashed'
          }
        })
      }
    }
  }, [router, keyword])

  return (
    <>
      <TlPageHero
        eyebrow='搜索'
        title={keyword ? String(keyword) : locale?.NAV?.SEARCH || '搜索'}
      />
      <div className='mb-8'>
        <SearchInput {...props} />
      </div>
      <LayoutPostList {...props} />
    </>
  )
}

/**
 * 归档列表
 * @param {*} props
 * @returns 按照日期将文章分组排序
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  const { locale } = useGlobal()
  const keys = Object.keys(archivePosts || {}).sort((a, b) =>
    String(b).localeCompare(String(a), undefined, {
      sensitivity: 'base',
      numeric: true
    })
  )
  return (
    <>
      <TlPageHero eyebrow='时间线' title={locale?.NAV?.ARCHIVE || '时间线'} />
      <div className='w-full pb-16'>
        {keys.map(archiveTitle => (
          <BlogListArchive
            key={archiveTitle}
            archiveTitle={archiveTitle}
            archivePosts={archivePosts}
          />
        ))}
      </div>
    </>
  )
}

/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { categoryOptions } = props
  const { locale } = useGlobal()
  return (
    <>
      <TlPageHero eyebrow='导航' title={locale?.COMMON?.CATEGORY || '分类'} />
      <div id='category-list' className='flex flex-wrap'>
        {categoryOptions?.map(category => (
          <SmartLink
            key={category.name}
            href={`/category/${category.name}`}
            className='cl-chip'>
            <i className='fas fa-folder opacity-70' aria-hidden='true' />
            {category.name}
            <span className='text-[var(--cl-faint)]'>({category.count})</span>
          </SmartLink>
        ))}
      </div>
    </>
  )
}

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { tagOptions } = props
  const { locale } = useGlobal()
  return (
    <>
      <TlPageHero eyebrow='导航' title={locale?.COMMON?.TAGS || '标签'} />
      <div id='tags-list' className='flex flex-wrap'>
        {tagOptions.map(tag => (
          <SmartLink
            key={tag.name}
            href={`/tag/${encodeURIComponent(tag.name)}`}
            className={`cl-chip notion-${tag.color}_background`}>
            <i className='fas fa-tag opacity-70' aria-hidden='true' />
            {tag.name}
            {tag.count ? (
              <span className='text-[var(--cl-faint)]'>({tag.count})</span>
            ) : null}
          </SmartLink>
        ))}
      </div>
    </>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutAlbum,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
