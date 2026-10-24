'use client'

/**
 * Circle of Life 主题
 *
 * 基于 thoughtlite 骨架，视觉对齐 Null_Byte / 时光的弧线封面工具（theme-ink）。
 * 使用：Notion 配置中心或环境变量 THEME=circlelife
 */

import replaceSearchResult from '@/components/Mark'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { compressImage } from '@/lib/db/notion/mapImage'
import SmartLink from '@/components/SmartLink'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import ArchiveIndex from './components/ArchiveIndex'
import BlogListArchive from './components/BlogListArchive'
import {
  ARCHIVE_ALL,
  buildArchiveFacets,
  filterArchivePosts
} from './components/archiveFilter'
import { BlogListPage } from './components/BlogListPage'
import { BlogListScroll } from './components/BlogListScroll'
import AlbumStage from './components/AlbumStage'
import { buildAlbumDecks } from './components/albumUtils'
import LayoutAbout from './components/LayoutAbout'
import { AlbumUIProvider } from './components/albumContext'
import ArticleBack from './components/ArticleBack'
import BackToTop from './components/BackToTop'
import Catalog from './components/Catalog'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import HomeTiltWall from './components/HomeTiltWall'
import HomeAlbumShowcase from './components/HomeAlbumShowcase'
import HomeArticleStage from './components/HomeArticleStage'
import ListScrollMemory from './components/ListScrollMemory'
import MobileToc from './components/MobileToc'
import { PostLock } from './components/PostLock'
import { PostMeta } from './components/PostMeta'
import SearchInput from './components/SearchInput'
import { SideBar } from './components/SideBar'
import PageMast from './components/PageMast'
import TlPageHero from './components/TlPageHero'
import CONFIG from './config'
import { buildSizedSource, computeTargetPixelWidth } from './components/imageSrcset'
import { Style } from './style'

const Comment = dynamic(() => import('@/components/Comment'), { ssr: false })

/**
 * 基础布局框架
 * 1.其它页面都嵌入在LayoutBase中
 * 2.文章页可带侧栏；列表页与归档等大屏模块按各自布局展开
 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { children, post } = props
  const { fullWidth, locale } = useGlobal()
  const router = useRouter()
  const isAlbumPage =
    router?.pathname === '/album' ||
    (typeof router?.asPath === 'string' &&
      router.asPath.split('?')[0].replace(/\/$/, '') === '/album')

  const isAboutPage =
    router?.pathname === '/about' ||
    (typeof router?.asPath === 'string' &&
      router.asPath.split('?')[0].replace(/\/$/, '') === '/about')

  const isHomePage =
    (router?.pathname === '/' ||
      (typeof router?.asPath === 'string' &&
        router.asPath.split('?')[0].replace(/\/$/, '') === '')) &&
    !router?.query?.s

  const archivePath =
    (typeof router?.asPath === 'string'
      ? router.asPath.split('?')[0].replace(/\/$/, '')
      : '') || ''
  const isArchivePage =
    router?.pathname === '/archive' ||
    archivePath === '/archive' ||
    /^\/[a-z]{2}(?:-[A-Z]{2})?\/archive$/.test(archivePath)

  const LAYOUT_VERTICAL =
    post && siteConfig('CIRCLELIFE_ARTICLE_LAYOUT_VERTICAL', false, CONFIG)

  const LAYOUT_SIDEBAR_REVERSE = siteConfig('LAYOUT_SIDEBAR_REVERSE', false)

  const sidebarOnlyPost = siteConfig(
    'CIRCLELIFE_SIDEBAR_ONLY_ON_POST',
    true,
    CONFIG
  )
  // 文章页全屏化（默认）：与影集/归档/关于同构的 wide 外壳，封面全出血、宽容器内自立双栏
  // CIRCLELIFE_ARTICLE_CARD=true 时回退旧卡片窄栏形态（含 LayoutBase 侧栏目录）
  const ARTICLE_CARD = siteConfig('CIRCLELIFE_ARTICLE_CARD', false, CONFIG)
  const isArticlePage = Boolean(post) && !isAlbumPage && !isAboutPage
  const wide =
    fullWidth ||
    isAlbumPage ||
    isAboutPage ||
    isHomePage ||
    isArchivePage ||
    (isArticlePage && !ARTICLE_CARD)
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
    <Head>
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@500&family=Newsreader:wght@500&family=Noto+Serif+SC:wght@500;700&display=swap'
      />
    </Head>
    <div
      id='theme-circlelife'
      className={`${siteConfig('FONT_STYLE')} flex min-h-screen flex-col scroll-smooth${isAlbumPage ? ' cl-is-album' : ''}${isAboutPage ? ' cl-is-about' : ''}${isHomePage ? ' cl-is-home' : ''}${isArchivePage ? ' cl-is-archive' : ''}${isArticlePage && !ARTICLE_CARD ? ' cl-is-article' : ''}${isArticlePage && ARTICLE_CARD ? ' cl-article-card-mode' : ''}${showSidebar ? ' cl-has-sidebar' : ''}`}>
      <Style />

      {/* 跳过链接：键盘用户按一次 Tab 即可直达正文，视觉上常态隐藏 */}
      <a href='#main-content' className='cl-skip-link'>
        {locale?.COMMON?.SKIP_TO_CONTENT || '跳到正文'}
      </a>

      <Header {...props} />

      <div id='container-inner' className='relative z-10 w-full flex-1'>
        <div
          id='container-wrapper'
          className={`relative mx-auto flex justify-center ${
            isAlbumPage || isAboutPage || isHomePage || isArchivePage || (isArticlePage && !ARTICLE_CARD)
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
            id='main-content'
            tabIndex={-1}
            className={`min-w-0 flex-1 ${
              wide
                ? 'w-full max-w-none'
                : LAYOUT_VERTICAL
                  ? 'w-full max-w-5xl'
                  : 'w-full max-w-3xl'
            }`}>
            {/* 入场动效：统一由 styles/common.js 的纯 CSS 动画 clContentIn 承担
                （#main-content 上的 opacity 淡入，服务端与客户端输出一致）。
                原先这里用的是 headlessui <Transition> + translate-y-16：文章 / 归档
                等页会「从下往上」滑入，而影集 / 首页直接显示，两页观感不一致；且该
                transform 会给 position: fixed 的子元素（目录 fab、回顶按钮）造出
                包含块，动画期间回顶按钮实测漂移约 13px。按设计规范「只淡入、不位移」，
                此处统一改为不位移。 */}
            <div className='w-full'>
              {props.slotTop}
              {children}
            </div>
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

      {!isAboutPage && <Footer />}

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
  const { category, tag, keyword } = props
  const router = useRouter()
  // 刊头描述：在自定义菜单（含子菜单）里找与当前分类/标签同链接的行，取其 summary
  const menuSummaryFor = path => {
    const rows = []
    ;(props.customMenu || []).forEach(m => {
      if (m) rows.push(m)
      ;(m?.subMenus || []).forEach(s => s && rows.push(s))
    })
    const norm = p => {
      try {
        return decodeURIComponent(String(p || '')).replace(/\/$/, '')
      } catch (_) {
        return String(p || '').replace(/\/$/, '')
      }
    }
    const hit = rows.find(r => norm(r?.href) === norm(path))
    return hit?.summary || ''
  }
  const categoryDesc = category
    ? menuSummaryFor(`/category/${category}`)
    : ''
  const tagDesc = tag ? menuSummaryFor(`/tag/${tag}`) : ''
  const useTimeline =
    siteConfig('CIRCLELIFE_HOME_TIMELINE', true, CONFIG) &&
    !category &&
    !tag &&
    !keyword &&
    !router?.query?.s &&
    (router.pathname === '/' || router.pathname === '/page/[page]')

  // 首页与列表页分流：首页下半部已是全屏章节（精选文章一文一屏 + 近期单栏排版），
  // 列表容器（窄栏时间线）只留给 /page/[page]、/category/*、/tag/* 等列表页。
  const isHome = router.pathname === '/'

  return (
    <>
      {category ? (
        <PageMast
          eyebrow='分类'
          title={category}
          description={categoryDesc || undefined}
        />
      ) : null}
      {tag ? (
        <PageMast
          eyebrow='标签'
          title={String(tag)}
          description={tagDesc || undefined}
        />
      ) : null}

      {useTimeline && (
        <HomeTiltWall
          homeCoverImages={props.homeCoverImages || []}
          // 题字只出现在首页：/page/[page] 同样有照片墙，但不重复出现题字
          showWallTitle={router.pathname === '/'}
        />
      )}

      {/* 首页精选文章章：一窗一屏 + 底部时间标尺（顺序在影集段之前） */}
      {isHome &&
        siteConfig('CIRCLELIFE_HOME_ARTICLE_STAGE', true, CONFIG) &&
        Array.isArray(props.homeArticles) &&
        props.homeArticles.length > 0 && (
          <HomeArticleStage articles={props.homeArticles} />
        )}

      {/* 首页精选影集段：照片墙（Hero）与文章段之后 */}
      {router.pathname === '/' &&
        siteConfig('CIRCLELIFE_HOME_ALBUM_SHOWCASE', true, CONFIG) &&
        Array.isArray(props.homeAlbums) &&
        props.homeAlbums.length > 0 && (
          <HomeAlbumShowcase albums={props.homeAlbums} />
        )}

      {!isHome && (
        <div
          className={
            useTimeline
              ? 'cl-home-content-container max-w-4xl mx-auto w-full px-4 md:px-6 py-12'
              : ''
          }>
          {siteConfig('POST_LIST_STYLE') === 'page' ? (
            <BlogListPage {...props} useTimeline={useTimeline} />
          ) : (
            <BlogListScroll {...props} useTimeline={useTimeline} />
          )}
        </div>
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
  const ARTICLE_CARD = siteConfig('CIRCLELIFE_ARTICLE_CARD', false, CONFIG)
  /**
   * 头图取图档位：SSR 先给 1024 档（移动端够用），挂载后按「显示宽 × DPR」升级。
   *
   * 为什么不用 srcset：Notion 代理在 srcset 选档路径下按 **CSS 宽度**出图、
   * 不吃 DPR → Retina 上头图差 2~3 倍像素（实测 440@DPR2 只拿到 343×343，
   * 而显示要 880×400）→ 被拉伸放大 → 发虚。直连 width URL 才严格按参数出图。
   */
  const [coverTier, setCoverTier] = useState(1024)
  useEffect(() => {
    const update = () => {
      const displayWidth = ARTICLE_CARD ? 768 : window.innerWidth
      setCoverTier(
        computeTargetPixelWidth(displayWidth, window.devicePixelRatio || 1)
      )
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [ARTICLE_CARD])
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
          (() => {
            const PROSE_INDENT = siteConfig(
              'CIRCLELIFE_PROSE_INDENT',
              true,
              CONFIG
            )
            const hasCover =
              siteConfig('CIRCLELIFE_ARTICLE_COVER', true, CONFIG) &&
              (post.pageCoverThumbnail || post.pageCover)
            const hasToc = Boolean(post.toc && post.toc.length > 2)

            // 封面取图：直连 Notion 的 width URL，档位按「显示宽 × DPR」自算。
            // （LazyImage 会把 width 改写封顶 1080 且不透传 srcSet，故封面直出 img）
            //
            // ⚠️ **不再走 srcset**（2026-10-24 实测）：Notion 代理在 srcset 选档路径下
            // 按 **CSS 宽度**出图、不吃 DPR → Retina 上每张头图都差 2~3 倍像素
            // （实测 440 宽 @DPR2 的头图只拿到 343×343，而显示要 880×400）→ 被拉伸放大 → 发虚。
            // 直连路径则严格按 `width` 参数出图，自己算档位就正好。
            const coverSrc = post.pageCover
              ? compressImage(post.pageCover, 1600)
              : post.pageCoverThumbnail
            const coverUrl = buildSizedSource(coverSrc, coverTier)

            const cover = hasCover ? (
              <div className='cl-article-cover'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt=''
                  className='cl-article-cover-img'
                  fetchPriority='high'
                  decoding='async'
                  // Notion 自带的封面裁剪焦点（0=顶 0.5=中 1=底）：
                  // 横幅是 3:1 长条，同一张图在这里的取景与首页 3:4 图版完全不同 ——
                  // 此前站点写死居中，导致「在 Notion 里拖了头图却没反应」。
                  style={{
                    objectPosition: `50% ${
                      (post.pageCoverPosition ?? 0.5) * 100
                    }%`
                  }}
                />
                {/* 顶部极轻压暗：仅全屏形态。卡片回退形态封面小且不浮导航，不加此层 */}
                {!ARTICLE_CARD ? (
                  <div className='cl-article-cover-scrim' aria-hidden='true' />
                ) : null}
              </div>
            ) : null

            const body = (
              <>
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
                <div
                  id='article-wrapper'
                  className={`cl-prose-wrap${
                    PROSE_INDENT ? '' : ' cl-indent-off'
                  }`}>
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
              </>
            )

            /* 回退形态：旧卡片窄栏（含 LayoutBase 侧栏目录） */
            if (ARTICLE_CARD) {
              return (
                <article className='cl-card cl-article-card cl-article--card overflow-hidden'>
                  {cover}
                  <div className='cl-article-inner'>{body}</div>
                </article>
              )
            }

            /* 全屏形态：全出血封面 + 宽容器双栏壳（TOC 细轨 + 正文列） */
            return (
              <article className='cl-article-page'>
                {cover}
                <div
                  className={`cl-article-shell${
                    hasToc ? ' cl-article-shell--toc' : ''
                  }${hasCover ? '' : ' cl-article-shell--no-cover'}`}>
                  {hasToc && (
                    <div className='cl-article-rail'>
                      <h2 className='cl-sidebar-title'>目录</h2>
                      <Catalog toc={post.toc} />
                    </div>
                  )}
                  <div className='cl-article-main'>
                    <div className='cl-article-inner'>{body}</div>
                  </div>
                </div>
              </article>
            )
          })()
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
  const decks = useMemo(
    () => buildAlbumDecks(props.photos || []),
    [props.photos]
  )
  const firstDeck = decks[0]
  const lcpCover =
    firstDeck?.photos?.[0]?.cover ||
    firstDeck?.photos?.[0]?.url ||
    ''

  return (
    <>
      {lcpCover && (
        <Head>
          <link
            rel='preload'
            as='image'
            href={lcpCover}
            fetchPriority='high'
          />
        </Head>
      )}
      <div className='cl-album-page w-full'>
        <AlbumStage pages={props.photos || []} />
      </div>
    </>
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
                <h1 className='inline-block border-r-2 border-[var(--cl-border)] mr-2 px-3 py-2 align-top text-2xl font-semibold'><i className='mr-2 fas fa-spinner animate-spin' />404</h1>
                <div className='inline-block text-left h-32 leading-10 items-center text-[var(--cl-muted)]'>
                    <p className='m-0 p-0 text-base'>页面无法加载，即将返回首页</p>
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
  const [activeCategoryKey, setActiveCategoryKey] = useState(ARCHIVE_ALL)
  const [activeTagKey, setActiveTagKey] = useState(ARCHIVE_ALL)
  const [tagIndexCollapsed, setTagIndexCollapsed] = useState(false)

  const facets = useMemo(
    () => buildArchiveFacets(archivePosts),
    [archivePosts]
  )
  const filteredArchivePosts = useMemo(
    () => filterArchivePosts(archivePosts, activeCategoryKey, activeTagKey),
    [archivePosts, activeCategoryKey, activeTagKey]
  )
  const keys = useMemo(
    () =>
      Object.keys(filteredArchivePosts).sort((a, b) =>
        String(b).localeCompare(String(a), undefined, {
          sensitivity: 'base',
          numeric: true
        })
      ),
    [filteredArchivePosts]
  )
  const filteredCount = useMemo(
    () =>
      Object.values(filteredArchivePosts).reduce(
        (total, posts) => total + posts.length,
        0
      ),
    [filteredArchivePosts]
  )
  const archiveMonths = useMemo(
    () => Object.keys(archivePosts || {}).sort(),
    [archivePosts]
  )
  const archiveRange =
    archiveMonths.length > 1
      ? `${archiveMonths[0]} — ${archiveMonths[archiveMonths.length - 1]}`
      : archiveMonths[0] || ''

  const activeCategory = facets.categories.find(
    category => category.key === activeCategoryKey
  )
  const activeCategoryName =
    activeCategoryKey === ARCHIVE_ALL
      ? ''
      : activeCategory?.name || '未分类'
  const activeScope =
    facets.scopes.get(activeCategoryKey) || facets.scopes.get(ARCHIVE_ALL)
  const activeTagName =
    activeTagKey === ARCHIVE_ALL
      ? ''
      : activeScope?.tags.find(tag => tag.key === activeTagKey)?.name || ''

  const handleCategoryChange = key => {
    setActiveCategoryKey(key)
    setActiveTagKey(ARCHIVE_ALL)
    setTagIndexCollapsed(false)
  }

  const handleTagChange = key => {
    setActiveTagKey(key)
    setTagIndexCollapsed(key !== ARCHIVE_ALL)
  }

  const hasPosts = facets.totalCount > 0
  const statusLabel =
    activeCategoryKey === ARCHIVE_ALL ? '全站归档文章' : activeCategoryName
  const stage = (
    <div className='cl-archive-stage w-full pb-16'>
      {hasPosts && (
        <div
          className='cl-archive-stage__head'
          role='status'
          aria-live='polite'
          aria-atomic='true'>
          <span className='cl-archive-stage__label'>
            当前筛选：
            <strong>
              {statusLabel}
              {activeTagName ? ` / #${activeTagName}` : ''}
            </strong>
          </span>
          <span className='cl-archive-stage__count'>
            共 {filteredCount} 篇
          </span>
        </div>
      )}
      {keys.map(archiveTitle => (
        <BlogListArchive
          key={archiveTitle}
          archiveTitle={archiveTitle}
          archivePosts={filteredArchivePosts}
          activeTagName={activeTagName}
        />
      ))}
      {keys.length === 0 && (
        <p className='cl-archive-empty' role='status'>
          {hasPosts ? '没有符合筛选条件的文章' : '暂无归档文章'}
        </p>
      )}
    </div>
  )

  return (
    <div className='cl-archive-page w-full'>
      <TlPageHero
        eyebrow='ARCHIVE · 时间线与脉络'
        title='全部文章'
        className='cl-page-mast--section cl-page-mast--archive'
      />
      {hasPosts ? (
        <ArchiveIndex
          facets={facets}
          activeCategoryKey={activeCategoryKey}
          activeTagKey={activeTagKey}
          activeCategoryName={activeCategoryName}
          activeTagName={activeTagName}
          archiveRange={archiveRange}
          collapsed={tagIndexCollapsed}
          onCategoryChange={handleCategoryChange}
          onTagChange={handleTagChange}
          onToggleCollapsed={() => setTagIndexCollapsed(value => !value)}>
          {stage}
        </ArchiveIndex>
      ) : (
        stage
      )}
    </div>
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
  LayoutAbout,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
