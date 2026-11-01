import SmartLink from '@/components/SmartLink'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HomeArticleCover, { clearCoverCache } from './HomeArticleCover'
import {
  RULER_MIN_GAP,
  computeRulerPositions,
  formatMonthRange,
  formatRulerDay
} from './homeArticleFocus'

/**
 * 首页精选文章章 (HomeArticleStage)
 *
 * 形态：**一窗一屏，原生横向滑动**
 * - 100svh 面板 + 一条原生横向滚动轨道；一屏一篇，`scroll-snap-stop: always`
 *   一次手势最多换一篇。滚动/惯性/吸附全部由浏览器接管，JS 不在拖拽路径里。
 * - 文章 DOM/文字/链接/图版/日期尺全部保留；日期尺是可点击的时间轴，
 *   当前篇高亮，桌面有上一张/下一张，键盘左右/Home/End。
 * - 图版继续走 HomeArticleCover 的 canvas 槽位：1024 档，只绘制当前篇与
 *   左右邻篇，再外侧预取/释放；不逐帧绘制，也不做滚动驱动 transform。
 * - 活动篇由 IntersectionObserver 判定；不在 scroll 回调里 setState/写布局。
 *
 * 性能契约：
 * - 零新增依赖、零常驻 RAF、无 wheel/touch 劫持、无 scroll 路径布局读取
 * - 日期尺位置、图版宽度只在 mount / resize / fonts / load 时重算
 * - 滚动路径只有浏览器原生滚动；JS 只在活动篇变化时更新状态/覆盖图
 */

const ARTICLE_INDEX_KEY = 'cl-home-article-index'

const samePositions = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 0.0001) return false
  }
  return true
}

export default function HomeArticleStage({ articles = [] }) {
  // 展示顺序：由旧到新 —— 往下滚/往右滑 = 时间往前走，时间尺从左到右。
  const list = useMemo(() => {
    const src = Array.isArray(articles) ? articles.filter(Boolean) : []
    return [...src].reverse()
  }, [articles])
  const count = list.length
  const listKey = useMemo(
    () => list.map(a => a.id || a.title || '').join('|'),
    [list]
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [positions, setPositions] = useState([])
  const sectionRef = useRef(null)
  const railRef = useRef(null)
  const axisRef = useRef(null)
  const coverRefs = useRef([])
  const activeRef = useRef(0)
  const railWidthRef = useRef(0)
  const didRestoreRef = useRef(false)
  const didWriteRef = useRef(false)
  activeRef.current = activeIndex

  // 日期尺位置 + 移动端图版宽度：只在布局节点变化时算；不进入滚动路径
  const layout = useCallback(() => {
    const axis = axisRef.current
    if (axis) {
      const next = computeRulerPositions(
        list.map(a => a.publishDay),
        { width: axis.clientWidth, minGap: RULER_MIN_GAP }
      )
      setPositions(prev => (samePositions(prev, next) ? prev : next))
    }

    const rail = railRef.current
    if (!rail || typeof window === 'undefined') return
    const railW = rail.clientWidth
    // 宽度变了（转屏/窗口缩放）：按篇位重算像素偏移，别把当前篇留在半路
    if (railWidthRef.current && railW && railW !== railWidthRef.current) {
      rail.style.scrollBehavior = 'auto'
      rail.scrollLeft = activeRef.current * railW
      rail.style.removeProperty('scroll-behavior')
    }
    railWidthRef.current = railW
    const narrow =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 1023px)').matches
    const slides = rail.querySelectorAll('.cl-home-article')
    const avail = rail.clientHeight
    const containerW = document.documentElement.clientWidth

    slides.forEach(slide => {
      const plate = slide.querySelector('.cl-home-article-plate')
      if (!plate) return
      if (!narrow) {
        plate.style.removeProperty('--plate-w')
        return
      }
      const body = slide.querySelector('.cl-home-article-body')
      if (!body) return
      const bodyH = body.getBoundingClientRect().height
      // 高度优先：矮屏宁可图版不满宽，也不让文字被时间轴压住
      const budget = avail > 0 ? (avail - 16 - bodyH) * 0.75 : containerW
      const ideal = Math.min(containerW, Math.max(90, budget))
      plate.style.setProperty('--plate-w', `${Math.floor(ideal)}px`)
    })
  }, [list])

  useEffect(() => {
    layout()
    let raf = 0
    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        layout()
      })
    }
    window.addEventListener('resize', schedule)
    window.addEventListener('load', schedule)
    const fonts = typeof document !== 'undefined' ? document.fonts : null
    if (fonts?.ready) fonts.ready.then(schedule)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('load', schedule)
    }
  }, [layout])

  const goTo = useCallback(
    target => {
      const rail = railRef.current
      if (!rail) return
      const next = Math.max(0, Math.min(count - 1, Number(target) || 0))
      const reduce =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const slide = rail.clientWidth
      const current = slide ? rail.scrollLeft / slide : activeIndex
      if (reduce || Math.abs(next - current) > 1) {
        // 跨多篇的跳转（时间轴/Home/End）直接瞬移：平滑滚过 3–5 篇只会
        // 让活动篇和 canvas 槽位一路抖过去，还来不及画。邻篇保留平滑。
        rail.style.scrollBehavior = 'auto'
        rail.scrollLeft = next * slide
        rail.style.removeProperty('scroll-behavior')
      } else {
        rail.scrollTo({ left: next * slide, behavior: 'smooth' })
      }
      setActiveIndex(next)
    },
    [activeIndex, count]
  )

  const onKeyDown = useCallback(
    event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(activeIndex - 1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goTo(activeIndex + 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        goTo(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        goTo(count - 1)
      }
    },
    [activeIndex, count, goTo]
  )

  // 活动篇 → 图版槽位：当前 + 左右邻篇绘制，±2 预取，其余释放
  useEffect(() => {
    coverRefs.current.length = count
    coverRefs.current.forEach((cover, index) => {
      if (!cover) return
      const distance = Math.abs(index - activeIndex)
      if (distance === 0) cover.arm('high')
      else if (distance === 1) cover.arm('auto')
      else if (distance === 2) {
        // 只预取图片，不保留 canvas 位图：最多当前 ±1 三篇有纹理
        cover.release()
        cover.prefetch()
      } else cover.release()
    })
  }, [activeIndex, count, listKey])

  // 从文章返回首页时恢复当前篇（横向轨道不依赖页面滚动位置）
  useEffect(() => {
    if (!count) return
    let stored = 0
    try {
      stored = Number(window.sessionStorage.getItem(ARTICLE_INDEX_KEY)) || 0
    } catch {
      stored = 0
    }
    const target = Math.max(0, Math.min(count - 1, stored))
    didRestoreRef.current = true
    if (!target) return
    const rail = railRef.current
    if (!rail) return
    // 轨道 CSS 是 smooth：临时关掉，恢复当前篇必须是瞬时定位
    rail.style.scrollBehavior = 'auto'
    rail.scrollLeft = target * rail.clientWidth
    rail.style.removeProperty('scroll-behavior')
    setActiveIndex(target)
  }, [count])

  // active 变化时写回 session；restore 的那一帧不写，避免把旧值先冲成 0
  useEffect(() => {
    if (!didRestoreRef.current) return
    if (!didWriteRef.current) {
      didWriteRef.current = true
      return
    }
    try {
      window.sessionStorage.setItem(ARTICLE_INDEX_KEY, String(activeIndex))
    } catch {
      // 隐私模式下 storage 不可用：忽略
    }
  }, [activeIndex])

  // 原生横向轨道 → 活动篇；只在跨过半屏时更新，不监听 scroll
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
        if (Number.isFinite(index)) setActiveIndex(index)
      },
      {
        root: rail,
        threshold: [0.5, 0.6, 0.7, 0.8, 0.9]
      }
    )
    slides.forEach(slide => observer.observe(slide))
    return () => observer.disconnect()
  }, [count, listKey])

  // 章节在视口内时隐藏回顶键（它会压在日期尺上）
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        document.documentElement.classList.toggle(
          'cl-home-article-active',
          entry.isIntersecting
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
  const rangeLabel = formatMonthRange(list.map(a => a.publishDay))

  return (
    <section ref={sectionRef} className='cl-home-articles' aria-label='精选文章'>
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
                  id={`cl-home-article-${article.id || index}`}
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
                          /* Notion 自带的封面裁剪焦点（0=顶 0.5=中 1=底）：
                             页面封面回落时按它取景；用独立「首页封面」时为居中（3:4 成品图） */
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
          <button
            className='cl-home-articles-nav'
            type='button'
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex <= 0}
            aria-label='上一张文章'>
            ← <span>上一张</span>
          </button>

          <nav className='cl-home-articles-ruler' aria-label='精选文章时间轴'>
            <div className='cl-home-articles-ruler-axis' ref={axisRef}>
              {list.map((article, index) => {
                const x = (positions[index] ?? 0) * 100
                // 端点刻度显式标记：游标也是轴的子元素，靠 :last-child 会选错
                const edge =
                  index === 0
                    ? ' is-first'
                    : index === list.length - 1
                      ? ' is-last'
                      : ''
                return (
                  <button
                    key={article.id || index}
                    className={`cl-home-articles-tick${edge}${
                      index === activeIndex ? ' is-active' : ''
                    }`}
                    type='button'
                    style={{ '--tick-x': `${x}%` }}
                    aria-label={`${article.publishDay}，第 ${index + 1} 篇`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    onClick={() => goTo(index)}>
                    <i aria-hidden='true' />
                    <span>{formatRulerDay(article.publishDay)}</span>
                  </button>
                )
              })}
              <span
                className='cl-home-articles-cursor'
                style={{
                  '--cursor-x': `${(positions[activeIndex] ?? 0) * 100}%`
                }}
                aria-hidden='true'>
                <i />
              </span>
            </div>
            <span className='cl-home-articles-range'>{rangeLabel}</span>
          </nav>

          <button
            className='cl-home-articles-nav'
            type='button'
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex >= count - 1}
            aria-label='下一张文章'>
            <span>下一张</span> →
          </button>
        </footer>

        <p className='sr-only' aria-live='polite'>
          {activeTitle
            ? `第 ${activeIndex + 1} 篇，共 ${count} 篇：${activeTitle}`
            : ''}
        </p>
      </div>
    </section>
  )
}
