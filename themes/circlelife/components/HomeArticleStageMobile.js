import SmartLink from '@/components/SmartLink'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HomeArticleCover, { clearCoverCache } from './HomeArticleCover'
import {
  clampArticleIndex,
  formatArticleNo,
  isNodeVisible,
  resolveBarPos
} from './homeArticleFocus'

/**
 * 首页精选文章章 · 手机版（≤1023px）— M1「四栏题名 + 顶部滑动朱砂条」
 *
 * 形态：单列一屏一篇的原生横向轨道 + 底部四栏题名轴。
 * - 顶部朱砂条与栏等宽，由 rail.scrollLeft 连续驱动（被动 scroll + rAF 合帧，
 *   只写一个 CSS 变量 --bar-pos，不 setState、不做逐帧 transform 布局读取）。
 * - 松手由原生 scroll-snap 吸附；点按栏位走 goTo 平滑滚动，条同步移动。
 * - 选中栏题名/编号转朱砂 + 淡朱砂渐变底色；条只表示位置，强调色由栏承担。
 * - 桌面形态见 HomeArticleStage.js，两者靠 ≤1023px 断点二选一。
 *
 * 性能契约：零新增依赖、无常驻 RAF、无 wheel/touch 劫持、滚动路径只写一个 CSS 变量。
 */

const ARTICLE_INDEX_KEY = 'cl-home-article-index-v2'

export default function HomeArticleStageMobile({ articles = [] }) {
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
  const railRef = useRef(null)
  const barRef = useRef(null)
  const coverRefs = useRef([])
  const activeRef = useRef(0)
  const railWidthRef = useRef(0)
  const wasVisibleRef = useRef(false)
  activeRef.current = activeIndex

  // 2026-11-24 PageSpeed：同桌面版，文章段滚到提前一屏才取图，
  // 避免挂载即下 4~5 张 1024 大图抢首屏 LCP 图带宽。无 IO 时立即取图。
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

  // 只在真实交互改篇位时落盘（goTo / IO 两个来源）。
  // restore 只读不写；桌面视口本组件 display:none、轨道宽 0，天然不写。
  // 不用「active 变化 + 首帧跳过」的 effect：隐藏态让首帧守卫永不消费，
  // 切回手机后第一次真实滑动会被当成 restore 帧吞掉。
  const persist = useCallback(index => {
    const rail = railRef.current
    if (!rail || !rail.clientWidth) return
    try {
      window.sessionStorage.setItem(ARTICLE_INDEX_KEY, String(index))
    } catch {
      // 隐私模式：忽略
    }
  }, [])

  const layout = useCallback(() => {
    const rail = railRef.current
    if (!rail || typeof window === 'undefined') return
    const railW = rail.clientWidth
    if (railWidthRef.current && railW && railW !== railWidthRef.current) {
      rail.style.scrollBehavior = 'auto'
      rail.scrollLeft = activeRef.current * railW
      rail.style.removeProperty('scroll-behavior')
    }
    railWidthRef.current = railW
    const slides = rail.querySelectorAll('.cl-home-article')
    const avail = rail.clientHeight
    const containerW = document.documentElement.clientWidth
    for (let index = 0; index < list.length; index++) {
      const slide = slides[index]
      if (!slide) continue
      const plate = slide.querySelector('.cl-home-article-plate')
      if (!plate) continue
      const body = slide.querySelector('.cl-home-article-body')
      if (!body) continue
      const bodyH = body.getBoundingClientRect().height
      const budget = avail > 0 ? (avail - 16 - bodyH) * 0.75 : containerW
      const ideal = Math.min(containerW, Math.max(90, budget))
      plate.style.setProperty('--plate-w', `${Math.floor(ideal)}px`)
    }
  }, [list])

  // 把滚动量写成朱砂条的位置；只在 rAF 里跑，滚动回调不做布局读取
  const syncBar = useCallback(() => {
    const rail = railRef.current
    const bar = barRef.current
    if (!rail || !bar) return
    const slide = rail.clientWidth
    if (!slide) return
    bar.style.setProperty(
      '--bar-pos',
      String(resolveBarPos(rail.scrollLeft, slide, count))
    )
  }, [count])

  useEffect(() => {
    layout()
    syncBar()
    let layoutRaf = 0
    let barRaf = 0
    // 滚动路径只同步朱砂条：读 scrollLeft、写一个 CSS 变量，不量测布局、不 setState
    const scheduleBar = () => {
      if (barRaf) return
      barRaf = window.requestAnimationFrame(() => {
        barRaf = 0
        syncBar()
      })
    }
    // 图版宽度只在布局节点变化时重算（resize / load / fonts）
    const scheduleLayout = () => {
      if (layoutRaf) return
      layoutRaf = window.requestAnimationFrame(() => {
        layoutRaf = 0
        layout()
        syncBar()
      })
    }
    const rail = railRef.current
    rail?.addEventListener('scroll', scheduleBar, { passive: true })
    window.addEventListener('resize', scheduleLayout)
    window.addEventListener('load', scheduleLayout)
    const fonts = typeof document !== 'undefined' ? document.fonts : null
    if (fonts?.ready) fonts.ready.then(scheduleLayout)
    return () => {
      if (layoutRaf) window.cancelAnimationFrame(layoutRaf)
      if (barRaf) window.cancelAnimationFrame(barRaf)
      rail?.removeEventListener('scroll', scheduleBar)
      window.removeEventListener('resize', scheduleLayout)
      window.removeEventListener('load', scheduleLayout)
    }
  }, [layout, syncBar])

  const goTo = useCallback(
    target => {
      const rail = railRef.current
      if (!rail) return
      const next = clampArticleIndex(target, count)
      const reduce =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const slide = rail.clientWidth
      const current = slide ? rail.scrollLeft / slide : activeRef.current
      if (reduce || Math.abs(next - current) > 1) {
        rail.style.scrollBehavior = 'auto'
        rail.scrollLeft = next * slide
        rail.style.removeProperty('scroll-behavior')
      } else {
        rail.scrollTo({ left: next * slide, behavior: 'smooth' })
      }
      setActiveIndex(next)
      syncBar()
      persist(next)
    },
    [count, syncBar, persist]
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

  // 篇位 → 图版槽位：当前 + 左右邻篇绘制，±2 预取，其余释放。
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

  // 恢复篇位：只在可见时定位轨道，隐藏形态不写 session
  useEffect(() => {
    if (!count) return
    let stored = 0
    try {
      stored = Number(window.sessionStorage.getItem(ARTICLE_INDEX_KEY)) || 0
    } catch {
      stored = 0
    }
    const target = clampArticleIndex(stored, count)
    if (isNodeVisible(sectionRef.current)) {
      const rail = railRef.current
      if (rail) {
        rail.style.scrollBehavior = 'auto'
        rail.scrollLeft = target * rail.clientWidth
        rail.style.removeProperty('scroll-behavior')
        syncBar()
      }
    }
    setActiveIndex(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  // 从桌面断点切回手机：节点由隐藏变可见时按篇位重新对齐轨道
  useEffect(() => {
    if (!count) return undefined
    const onResize = () => {
      const visible = isNodeVisible(sectionRef.current)
      const rail = railRef.current
      if (visible && !wasVisibleRef.current && rail) {
        rail.style.scrollBehavior = 'auto'
        rail.scrollLeft = activeRef.current * rail.clientWidth
        rail.style.removeProperty('scroll-behavior')
        syncBar()
      }
      wasVisibleRef.current = visible
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [count, syncBar])

  // 原生横向轨道 → 活动篇；只在跨过半屏时更新，不监听 scroll 改状态
  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof IntersectionObserver === 'undefined') return undefined
    const slides = [...rail.querySelectorAll('.cl-home-article')]
    const observer = new IntersectionObserver(
      entries => {
        let best = null
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry
          }
        })
        if (!best) return
        const index = Number(best.target.dataset.index)
        if (!Number.isFinite(index) || index === activeRef.current) return
        activeRef.current = index
        setActiveIndex(index)
        persist(index)
      },
      { root: rail, threshold: [0.5, 0.6, 0.7, 0.8, 0.9] }
    )
    slides.forEach(slide => observer.observe(slide))
    return () => observer.disconnect()
  }, [count, listKey, persist])

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
      className='cl-home-articles cl-home-articles-m'
      aria-label='精选文章'>
      <div className='cl-home-articles-panel'>
        <div className='cl-home-articles-top'>
          <SmartLink className='cl-home-sec-link' href='/archive'>
            全部文章 <span aria-hidden='true'>→</span>
          </SmartLink>
        </div>

        <div className='cl-home-articles-stage'>
          <div
            className='cl-home-articles-viewport'
            tabIndex={0}
            role='region'
            aria-roledescription='carousel'
            aria-label={`精选文章，共 ${count} 篇`}
            onKeyDown={onKeyDown}>
            <div className='cl-home-articles-rail' ref={railRef}>
              {list.map((article, index) => (
                <article
                  key={article.id || index}
                  id={`cl-home-article-m-${article.id || index}`}
                  data-index={index}
                  className='cl-home-article'
                  aria-roledescription='slide'
                  aria-label={`第 ${index + 1} 篇，共 ${count} 篇：${
                    article.title?.trim() || ''
                  }`}
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
          </div>
        </div>

        <footer className='cl-home-articles-foot'>
          <nav
            className='cl-home-articles-axis cl-home-articles-axis-m'
            style={{ '--cl-home-article-cols': count }}
            aria-label='精选文章题名轴'>
            <span
              ref={barRef}
              className='cl-home-articles-axis-bar'
              style={{ '--bar-pos': 0 }}
              aria-hidden='true'
            />
            {list.map((article, index) => (
              <button
                key={article.id || index}
                className={`cl-home-articles-axis-item${
                  index === activeIndex ? ' is-active' : ''
                }`}
                type='button'
                onClick={() => goTo(index)}
                aria-current={index === activeIndex ? 'true' : undefined}
                aria-label={`第 ${index + 1} 篇：${article.title?.trim() || ''}`}>
                <span className='cl-home-articles-axis-no'>
                  {formatArticleNo(index)}
                </span>
                <span className='cl-home-articles-axis-title'>
                  {article.title}
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
