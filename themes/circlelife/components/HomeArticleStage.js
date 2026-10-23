import SmartLink from '@/components/SmartLink'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  RULER_MIN_GAP,
  computeRulerPositions,
  formatMonthRange,
  formatRulerDay
} from './homeArticleFocus'

/**
 * 首页精选文章章 (HomeArticleStage)
 *
 * 形态：**一窗一屏，滚动换篇**（博主定稿方向）
 * - 整个章节 = 一个钉住的窗口（sticky, 100svh），用户往下滚时**不推动任何东西**，
 *   只推进「当前是第几篇」→ 底部时间轴上的游标从旧滑到新，文章随之交叉淡入淡出。
 * - 章节本体是 `100svh + 行程` 的滚动轨：行程 = (篇数 − 1) × 步距。
 *   6 篇 → 50svh 行程，滚过半屏就走完全部精选文章（不像「一篇一屏」那样要滚 6 屏）。
 * - 章节内**不设标题**：只留右上角「全部文章 N 篇 →」这一个出口。
 *
 * 底部时间轴（唯一大胆的元素）：
 * - 刻度按 publishDay 的**真实日距比例**分布（标尺是一把真尺子，不是等距装饰）
 * - 同日 / 过近的刻度由 computeRulerPositions 的 relax pass 错开（相邻 ≥ 56px）
 * - 游标（朱砂游标）随滚动连续移动，落在当前篇的刻度上；文章在游标到位时交叉淡入
 *
 * 性能契约：
 * - 零新增依赖、零常驻 RAF、零布局读取（滚动路径只读 window.scrollY + 预算几何）
 * - 游标每帧只写一个 CSS 变量（transform 合成，不触发布局）
 * - 文章层只在「当前篇」变化时才 setState（整段滚动最多 6 次）
 * - 进场是纯 CSS 关键帧（只动 opacity），服务端与客户端输出一致
 */

/** 步距：每篇占多少视口高度的滚动行程 */
export const ARTICLE_STEP_VH = 10

const pad2 = n => String(n).padStart(2, '0')

export default function HomeArticleStage({ articles = [], postCount = 0 }) {
  // 展示顺序：**由旧到新** —— 往下滚 = 时间往前走，底部时间轴的游标随之
  // 从左（最旧）滑到右（最新）。数据层给的是「新到旧」（上限截断取最新几篇），
  // 这里反向排列，得到一条与滚动同向的时间轴。
  const list = useMemo(() => {
    const src = Array.isArray(articles) ? articles.filter(Boolean) : []
    return [...src].reverse()
  }, [articles])
  const count = list.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(-1)
  const [positions, setPositions] = useState([])
  const activeRef = useRef(0)
  const inRangeRef = useRef(false)
  const releasedRef = useRef(false)
  const sectionRef = useRef(null)
  const panelRef = useRef(null)
  const stageRef = useRef(null)
  const axisRef = useRef(null)
  const cursorRef = useRef(null)
  const plateRefs = useRef([])
  const bodyRefs = useRef([])

  // 预算几何：段顶、行程、轴宽、刻度位置 —— 只在 mount / resize 时量一次
  const geomRef = useRef({ top: 0, sweep: 0, axisW: 0, positions: [] })

  const measure = useCallback(() => {
    const section = sectionRef.current
    const axis = axisRef.current
    if (!section || !axis) return
    const rect = section.getBoundingClientRect()
    const top = rect.top + window.scrollY
    const sweep = Math.max(0, section.offsetHeight - window.innerHeight)
    const axisW = axis.clientWidth
    const next = computeRulerPositions(
      list.map(a => a.publishDay),
      { width: axisW, minGap: RULER_MIN_GAP }
    )
    geomRef.current = { top, sweep, axisW, positions: next }
    setPositions(next)
  }, [list])

  // 图版宽度：窄屏下按「实际可用高度」动态算 —— 图版与文字上下叠放，
  // 图能开多大取决于文字块实际占多高（标题行数、摘要行数都会变），
  // 纯 CSS 的 svh 公式算不准，所以这里量一次再写回 CSS 变量。
  // 桌面端图文并排，图版高度不占额外空间 → 用 420px 上限即可。
  const fitPlates = useCallback(() => {
    const stage = stageRef.current
    if (!stage || typeof window === 'undefined') return
    const plates = plateRefs.current.filter(Boolean)
    const bodies = bodyRefs.current.filter(Boolean)
    const narrow =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 1023px)').matches
    if (!narrow) {
      plates.forEach(p => p.style.removeProperty('--plate-w'))
      return
    }
    const avail = stage.clientHeight
    const containerW = stage.clientWidth
    const gap = 16
    plates.forEach((plate, i) => {
      const body = bodies[i]
      if (!body) return
      const bodyH = body.getBoundingClientRect().height
      const ideal = Math.min(
        containerW,
        Math.max(90, (avail - gap - bodyH) * 0.75)
      )
      // 向下取整：四舍五入会让内容比可用高度多出 1px，
      // 结果是「继续阅读」的下沿正好压到时间轴上沿（实测差 1px）。
      plate.style.setProperty('--plate-w', `${Math.floor(ideal)}px`)
    })
  }, [])

  useEffect(() => {
    measure()
    fitPlates()
    const onResize = () => {
      measure()
      fitPlates()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure, fitPlates])

  // 字体加载完字宽会变 → 文字块高度变了 → 图版宽度要重算
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return undefined
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) fitPlates()
    })
    return () => {
      cancelled = true
    }
  }, [fitPlates])

  // 滚动 → 当前篇 + 游标位置
  useEffect(() => {
    if (!count) return undefined
    let raf = 0

    const apply = () => {
      raf = 0
      const { top, sweep, axisW, positions } = geomRef.current
      const y = window.scrollY || 0
      const p =
        sweep > 0 ? Math.min(1, Math.max(0, (y - top) / sweep)) : 0
      const index = count > 1 ? Math.round(p * (count - 1)) : 0

      // 游标：每帧只写一个 CSS 变量（transform 合成，不触发布局）
      const cursor = cursorRef.current
      if (cursor) {
        const x = (positions[index] ?? 0) * axisW
        cursor.style.setProperty('--cursor-x', `${x}px`)
      }

      if (index !== activeRef.current) {
        setPrevIndex(activeRef.current)
        activeRef.current = index
        setActiveIndex(index)
        // 换篇 → 文字块高度可能变（标题行数 / 摘要行数）→ 图版宽度要重算
        fitPlates()
      }

      // 章节钉住期间隐藏回顶键（它会压在底部时间轴上）
      const inRange = y >= top - 1 && y <= top + sweep + 1
      if (inRange !== inRangeRef.current) {
        inRangeRef.current = inRange
        document.documentElement.classList.toggle(
          'cl-home-article-active',
          inRange
        )
      }

      // 退场：面板开始整体上移时，右上角出口淡出 ——
      // 否则它会从固定导航胶囊底下穿过去，留下「半截字压在胶囊上」的瞬间。
      const released = y > top + sweep + 1
      if (released !== releasedRef.current) {
        releasedRef.current = released
        panelRef.current?.classList.toggle('is-released', released)
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(apply)
    }

    // 首帧先对齐一次（用户可能已经滚到页面中段才加载完）
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      document.documentElement.classList.remove('cl-home-article-active')
    }
  }, [count, fitPlates])

  if (!count) return null

  const rangeLabel = formatMonthRange(list.map(a => a.publishDay))
  const totalLabel = postCount ? `${postCount}` : `${count}`

  return (
    <section
      ref={sectionRef}
      className='cl-home-articles'
      style={{ '--cl-home-article-count': count }}
      aria-label='精选文章'>
      <div className='cl-home-articles-panel' ref={panelRef}>
        <div className='cl-home-articles-top'>
          <a className='cl-home-sec-link' href='/archive'>
            全部文章 {totalLabel} 篇 <span aria-hidden='true'>→</span>
          </a>
        </div>

        <div className='cl-home-articles-stage' ref={stageRef}>
          {list.map((article, index) => (
            <article
              key={article.id || index}
              id={`cl-home-article-${article.id || index}`}
              className={`cl-home-article${
                index === activeIndex
                  ? ' is-active'
                  : index === prevIndex
                    ? ' is-prev'
                    : ''
              }`}>
              <figure
                className='cl-home-article-plate'
                ref={el => {
                  plateRefs.current[index] = el
                }}>
                {article.cover?.src ? (
                  <div className='cl-home-article-plate-frame'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.cover.src}
                      srcSet={article.cover.srcSet || undefined}
                      sizes={article.cover.sizes || undefined}
                      alt=''
                      loading='lazy'
                      fetchPriority='low'
                      decoding='async'
                    />
                  </div>
                ) : (
                  <div className='cl-home-article-plate-frame is-empty' />
                )}
              </figure>

              <div
                className='cl-home-article-body'
                ref={el => {
                  bodyRefs.current[index] = el
                }}>
                <div className='cl-home-article-meta'>
                  {article.category ? (
                    <span className='is-accent'>{article.category}</span>
                  ) : null}
                  {article.category && article.publishDay ? (
                    <span className='cl-dot' aria-hidden='true'>
                      ·
                    </span>
                  ) : null}
                  {article.publishDay ? <span>{article.publishDay}</span> : null}
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
                  <p className='cl-home-article-summary'>{article.summary}</p>
                ) : null}
                <SmartLink href={article.href} className='cl-home-article-cta'>
                  <span className='cl-home-article-cta-bar' aria-hidden='true' />
                  继续阅读
                </SmartLink>
              </div>
            </article>
          ))}
        </div>

        <nav className='cl-home-articles-ruler' aria-label='精选文章时间轴'>
          <div className='cl-home-articles-ruler-scroll'>
            <div className='cl-home-articles-ruler-axis' ref={axisRef}>
              {list.map((article, index) => {
                const x = (positions[index] ?? 0) * 100
                // 端点刻度显式标记：游标也是轴的子元素，靠 :last-child 会选错
                const edge =
                  index === 0 ? ' is-first' : index === list.length - 1 ? ' is-last' : ''
                return (
                  <span
                    key={article.id || index}
                    className={`cl-home-articles-tick${edge}${
                      index === activeIndex ? ' is-active' : ''
                    }`}
                    style={{ '--tick-x': `${x}%` }}>
                    <i aria-hidden='true' />
                    <span>{formatRulerDay(article.publishDay)}</span>
                  </span>
                )
              })}
              <span
                ref={cursorRef}
                className='cl-home-articles-cursor'
                aria-hidden='true'>
                <i />
              </span>
            </div>
          </div>
          <span className='cl-home-articles-range'>{rangeLabel}</span>
        </nav>
      </div>
    </section>
  )
}
