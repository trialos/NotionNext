import SmartLink from '@/components/SmartLink'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HomeArticleCover, { clearCoverCache } from './HomeArticleCover'
import {
  clampArticleIndex,
  formatArticleNo,
  formatAxisDay,
  isNodeVisible
} from './homeArticleFocus'

/**
 * 首页精选文章章 · 桌面版（>1023px）— A「题名脊轨」
 *
 * 形态：单篇舞台 + 底部四栏题名轴，**无横向滑轨**。
 * - 悬停轴上的题名切换舞台；鼠标移出整段（且焦点不在段内）淡回第 1 篇。
 * - 选中栏左缘一条 2px 朱砂竖线贯通，题名转朱砂并右移 3px，附极淡朱砂渐变底色。
 * - 切换只动 opacity / visibility，和影集悬停预览同一套过渡。
 * - 手机形态见 HomeArticleStageMobile.js，两者靠 ≤1023px 断点二选一。
 */

const ARTICLE_INDEX_KEY = 'cl-home-article-index-v2'

export default function HomeArticleStage({ articles = [] }) {
  const list = useMemo(() => {
    const src = Array.isArray(articles) ? articles : []
    return src.filter(Boolean)
  }, [articles])
  const count = list.length
  const listKey = useMemo(
    () => list.map(a => a.id || a.title || '').join('|'),
    [list]
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [nearViewport, setNearViewport] = useState(false)
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const coverRefs = useRef([])
  const activeRef = useRef(0)
  const wasVisibleRef = useRef(false)
  activeRef.current = activeIndex

  // 2026-11-24 PageSpeed：文章段在首屏下方很远（照片墙 240vh 之后），
  // 挂载即 arm 会让 4~5 张 1024 大图抢首屏 LCP 图的带宽。
  // 改为滚到提前一屏才取图；无 IO 时退化为立即取图。
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      entries => setNearViewport(entries.some(e => e.isIntersecting)),
      { rootMargin: '100% 0px' }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // 只在「真实交互改了篇位」时落盘（goTo 一个来源）。
  // restore 只读不写；桌面视口下本组件可见，隐藏态由 isNodeVisible 拦住。
  // 不用「active 变化 + 首帧跳过」的 effect：隐藏形态不消费首帧守卫，
  // 切回该断点后第一次真实切换会被吞掉。
  const persist = useCallback(index => {
    if (!isNodeVisible(sectionRef.current)) return
    try {
      window.sessionStorage.setItem(ARTICLE_INDEX_KEY, String(index))
    } catch {
      // 隐私模式下 storage 不可用：忽略
    }
  }, [])

  const restore = useCallback(() => {
    let stored = 0
    try {
      stored = Number(window.sessionStorage.getItem(ARTICLE_INDEX_KEY)) || 0
    } catch {
      stored = 0
    }
    setActiveIndex(clampArticleIndex(stored, count))
  }, [count])

  useEffect(() => {
    if (!count) return
    restore()
  }, [count, restore])

  // 从手机断点切回桌面：节点由隐藏变可见时重读一次篇位
  useEffect(() => {
    if (!count) return undefined
    const onResize = () => {
      const visible = isNodeVisible(sectionRef.current)
      if (visible && !wasVisibleRef.current) restore()
      wasVisibleRef.current = visible
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [count, restore])

  const goTo = useCallback(
    target => {
      const next = clampArticleIndex(target, count)
      setActiveIndex(next)
      persist(next)
    },
    [count, persist]
  )

  const onKeyDown = useCallback(
    event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(activeRef.current - 1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goTo(activeRef.current + 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        goTo(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        goTo(count - 1)
      }
    },
    [count, goTo]
  )

  const onMouseLeave = useCallback(() => {
    const section = sectionRef.current
    if (section && section.contains(document.activeElement)) return
    goTo(0)
  }, [goTo])

  // 篇位 → 图版槽位：当前 high、邻篇 auto、±2 预取，其余释放。
  // 仅在文章段进入视口附近后执行；未进入时全部 release，不下载大图。
  useEffect(() => {
    coverRefs.current.length = count
    coverRefs.current.forEach((cover, index) => {
      if (!cover) return
      if (!nearViewport || !isNodeVisible(sectionRef.current)) {
        cover.release()
        return
      }
      const distance = Math.abs(index - activeIndex)
      if (distance === 0) cover.arm('high')
      else if (distance === 1) cover.arm('auto')
      else if (distance === 2) {
        cover.release()
        cover.prefetch()
      } else cover.release()
    })
  }, [activeIndex, count, listKey, nearViewport])

  // 章节在视口内时隐藏回顶键；隐藏形态不改这个全局类
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      entries => {
        if (!isNodeVisible(section)) return
        document.documentElement.classList.toggle(
          'cl-home-article-active',
          entries[0].isIntersecting
        )
      },
      { threshold: 0.5 }
    )
    observer.observe(section)
    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('cl-home-article-active')
    }
  }, [])

  useEffect(
    () => () => {
      coverRefs.current.forEach(cover => cover?.release())
      clearCoverCache()
    },
    []
  )

  if (!count) return null

  const activeTitle = list[activeIndex]?.title?.trim() || ''

  return (
    <section
      ref={sectionRef}
      className='cl-home-articles'
      onMouseLeave={onMouseLeave}
      aria-label='精选文章'>
      <div className='cl-home-articles-panel'>
        <div className='cl-home-articles-top'>
          <SmartLink className='cl-home-sec-link' href='/archive'>
            全部文章 <span aria-hidden='true'>→</span>
          </SmartLink>
        </div>

        <div
          ref={stageRef}
          className='cl-home-articles-stage'
          tabIndex={0}
          role='region'
          aria-roledescription='carousel'
          aria-label={`精选文章，共 ${count} 篇`}
          onKeyDown={onKeyDown}>
          {list.map((article, index) => (
            <article
              key={article.id || index}
              id={`cl-home-article-${article.id || index}`}
              data-index={index}
              className={`cl-home-article${
                index === activeIndex ? ' is-active' : ''
              }`}
              aria-roledescription='slide'
              aria-label={`第 ${index + 1} 篇，共 ${count} 篇：${
                article.title?.trim() || ''
              }`}
              aria-hidden={index === activeIndex ? undefined : 'true'}
              aria-current={index === activeIndex ? 'true' : undefined}>
              <figure className='cl-home-article-plate'>
                {article.cover?.src ? (
                  <div className='cl-home-article-plate-frame'>
                    <HomeArticleCover
                      ref={el => {
                        coverRefs.current[index] = el
                      }}
                      className='cl-home-article-plate-img'
                      src={article.cover.src}
                      position={`50% ${(article.cover.pos ?? 0.5) * 100}%`}
                    />
                  </div>
                ) : (
                  <div className='cl-home-article-plate-frame is-empty' />
                )}
              </figure>

              <div className='cl-home-article-body'>
                <div className='cl-home-article-meta'>
                  {article.category ? (
                    <span className='is-accent'>{article.category}</span>
                  ) : null}
                  {article.category && article.publishDay ? (
                    <span className='cl-dot' aria-hidden='true'>
                      ·
                    </span>
                  ) : null}
                  {article.publishDay ? (
                    <span>{article.publishDay}</span>
                  ) : null}
                  {article.readTime ? (
                    <>
                      <span className='cl-dot' aria-hidden='true'>
                        ·
                      </span>
                      <span>约 {article.readTime} 分钟</span>
                    </>
                  ) : null}
                </div>
                <h2 className='cl-home-article-title'>
                  <SmartLink href={article.href}>{article.title}</SmartLink>
                </h2>
                <span className='cl-home-article-rule' aria-hidden='true' />
                {article.summary ? (
                  <p className='cl-home-article-summary'>
                    {article.summary}
                  </p>
                ) : null}
                <SmartLink
                  href={article.href}
                  className='cl-home-article-cta'>
                  <span
                    className='cl-home-article-cta-bar'
                    aria-hidden='true'
                  />
                  继续阅读
                </SmartLink>
              </div>
            </article>
          ))}
        </div>

        <footer className='cl-home-articles-foot'>
          <nav
            className='cl-home-articles-axis'
            aria-label='精选文章题名轴'>
            {list.map((article, index) => (
              <button
                key={article.id || index}
                className={`cl-home-articles-axis-item${
                  index === activeIndex ? ' is-active' : ''
                }`}
                type='button'
                onMouseEnter={() => goTo(index)}
                onFocus={() => goTo(index)}
                onClick={() => goTo(index)}
                aria-current={index === activeIndex ? 'true' : undefined}
                aria-label={`第 ${index + 1} 篇：${article.title?.trim() || ''}`}>
                <span className='cl-home-articles-axis-no'>
                  {formatArticleNo(index)}
                </span>
                <span className='cl-home-articles-axis-title'>
                  {article.title}
                </span>
                <span className='cl-home-articles-axis-date'>
                  {formatAxisDay(article.publishDay)}
                </span>
              </button>
            ))}
          </nav>
        </footer>
      </div>

      <p className='sr-only' aria-live='polite'>
        {activeTitle
          ? `第 ${activeIndex + 1} 篇，共 ${count} 篇：${activeTitle}`
          : ''}
      </p>
    </section>
  )
}
