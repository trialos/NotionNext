import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CanvasImage from './CanvasImage'

/**
 * 首页精选影集段 · 手机端 C 方案（对开书页）
 *
 * 与 HomeArticleStage 共用同一副交互骨架：100svh 面板 + 原生横向滚动轨道，
 * 一屏一辑，scroll-snap-stop: always；键盘 ←/→/Home/End、sessionStorage
 * 记住当前辑、aria-live 播报。滚动路径只有浏览器原生滚动，活动辑由
 * IntersectionObserver 判定，JS 不监听 scroll/wheel/touchmove、不写 transform。
 *
 * 与文章段的有意差异（读起来是「书」不是「屏」）：
 * 1. 主封面是一张带相纸边的 4:5 印相（收进 --cl-wide-pad、直角相纸），
 *    不做 100vw 满幅出血；PC 端是另一套悬停预览形态，见 HomeAlbumShowcase.js。
 * 2. 题签卡压在印相下缘：朱砂页码签 01/04 + 一道细线 + 辑名 h2
 *    （无 CTA / 张数 / 日期）。卡是普通文档流，用负 margin 轻微叠压，
 *    不碰 transform（首页题字的 fixed 祖先链禁用包含块属性）。
 * 3. 底部换成书页页码 tabs（01–04 等宽可点），而不是文章段的时间刻度尺。
 *
 * 数据：只显示 Notion「精选」勾选的影集，上限由数据层截断（默认 4），不补齐；
 * 0 辑不渲染。入口仍是 /album?deck=<id> → 章页序言。
 */

const ALBUM_INDEX_KEY = 'cl-home-album-index-v1'

const pad = n => String(n).padStart(2, '0')

export default function HomeAlbumShowcaseMobile({ albums = [] }) {
  const list = useMemo(() => {
    const src = Array.isArray(albums) ? albums : []
    return src.filter(a => a && a.href)
  }, [albums])
  const count = list.length
  const listKey = useMemo(
    () => list.map(a => a.id || a.name || '').join('|'),
    [list]
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const railRef = useRef(null)
  const activeRef = useRef(0)
  const railWidthRef = useRef(0)
  activeRef.current = activeIndex

  // 只在「真实交互改了辑位」时落盘（goTo / IO 两个来源）。
  // restore 只读不写；桌面视口本组件 display:none、轨道宽 0，天然不写。
  // 不能用「active 变化 + 首帧跳过」的 effect：隐藏态会让首帧守卫永不消费，
  // 切回手机后第一次真实滑动反被当成 restore 帧吞掉。
  const persist = useCallback(index => {
    const rail = railRef.current
    if (!rail || !rail.clientWidth) return
    try {
      window.sessionStorage.setItem(ALBUM_INDEX_KEY, String(index))
    } catch {
      // 隐私模式下 storage 不可用：忽略
    }
  }, [])

  // 图版宽度只在布局节点变化时算，不进入滚动路径。
  // 4:5 印相高 = 1.25·W；题签卡以 -2.2rem 叠压在印相下缘，故对总高的
  // 净增量 ≈ 卡片高 − 35px。预算 = (可用高 − 卡片高 + 24) × 0.8，
  // 尽量让印相吃满 gutter，矮屏再自动收窄。
  const layout = useCallback(() => {
    const rail = railRef.current
    if (!rail || typeof window === 'undefined') return
    const railW = rail.clientWidth
    // 桌面视口本组件 display:none（clientWidth=0）；切回手机时宽度由 0 变正，
    // 按 activeIndex 把轨道重定位到当前辑（与文章段 layout 宽度重对齐同款）。
    if (railWidthRef.current !== railW) {
      if (railWidthRef.current && railW) {
        rail.style.scrollBehavior = 'auto'
        rail.scrollLeft = activeRef.current * railW
        rail.style.removeProperty('scroll-behavior')
      }
      railWidthRef.current = railW
    }
    if (!railW) return
    const slides = rail.querySelectorAll('.cl-home-album-m-slide')
    const available = rail.clientHeight
    const containerW = document.documentElement.clientWidth
    for (let index = 0; index < list.length; index++) {
      const slide = slides[index]
      if (!slide) continue
      const card = slide.querySelector('.cl-home-album-m-card')
      if (!card) continue
      const cardH = card.getBoundingClientRect().height
      const budget = available > 0 ? (available - cardH + 24) * 0.8 : containerW
      const ideal = Math.min(containerW - 32, Math.max(120, budget))
      // 写在 slide 上：相纸与题签卡共用同一宽度基准（卡片比相纸窄 2rem）
      slide.style.setProperty('--plate-w', `${Math.floor(ideal)}px`)
    }
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
        rail.style.scrollBehavior = 'auto'
        rail.scrollLeft = next * slide
        rail.style.removeProperty('scroll-behavior')
      } else {
        rail.scrollTo({ left: next * slide, behavior: 'smooth' })
      }
      setActiveIndex(next)
      persist(next)
    },
    [activeIndex, count, persist]
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

  // 从影集/其它页返回首页时恢复当前辑；横向轨道不依赖页面纵向滚动位置。
  useEffect(() => {
    if (!count) return
    let stored = 0
    try {
      stored = Number(window.sessionStorage.getItem(ALBUM_INDEX_KEY)) || 0
    } catch {
      stored = 0
    }
    const target = Math.max(0, Math.min(count - 1, stored))
    if (!target) return
    const rail = railRef.current
    if (!rail) return
    rail.style.scrollBehavior = 'auto'
    rail.scrollLeft = target * rail.clientWidth
    rail.style.removeProperty('scroll-behavior')
    activeRef.current = target
    setActiveIndex(target)
  }, [count])

  // 原生横向轨道 → 活动辑；只在跨过半屏时更新，不监听 scroll
  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof IntersectionObserver === 'undefined') return undefined
    const slides = [...rail.querySelectorAll('.cl-home-album-m-slide')]
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

  if (!count) return null

  const activeName = list[activeIndex]?.name?.trim() || ''

  return (
    <section
      className='cl-home-album-m'
      data-count={count}
      aria-label='精选影集'>
      <div className='cl-home-album-m-top'>
        <p className='cl-home-album-m-kicker'>精选影集</p>
        <p className='cl-home-album-m-count'>{pad(count)} 辑</p>
      </div>

      <div className='cl-home-album-m-stage'>
        <div
          className='cl-home-album-m-viewport'
          tabIndex={0}
          role='region'
          aria-roledescription='carousel'
          aria-label={`精选影集，共 ${count} 辑`}
          onKeyDown={onKeyDown}>
          <div className='cl-home-album-m-rail' ref={railRef}>
            {list.map((album, index) => (
              <article
                key={album.id || index}
                id={`cl-home-album-m-${album.id || index}`}
                data-index={index}
                className='cl-home-album-m-slide'
                aria-roledescription='slide'
                aria-label={`第 ${index + 1} 辑，共 ${count} 辑：${album.name || ''}`}
                aria-current={index === activeIndex ? 'true' : undefined}>
                <figure className='cl-home-album-m-plate'>
                  <div className='cl-home-album-m-mat'>
                    <CanvasImage
                      className='cl-home-album-m-cover'
                      src={album.cover?.src}
                      position='center'
                    />
                  </div>
                </figure>

                <a
                  className='cl-home-album-m-card'
                  href={album.href}
                  aria-label={`进入影集：${album.name || ''}`}>
                  <span className='cl-home-album-m-folio' aria-hidden='true'>
                    {pad(index + 1)} / {pad(count)}
                  </span>
                  <span className='cl-home-album-m-rule' aria-hidden='true' />
                  <h2 className='cl-home-album-m-name'>{album.name}</h2>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>

      <footer className='cl-home-album-m-foot'>
        <nav className='cl-home-album-m-tabs' aria-label='精选影集页码'>
          {list.map((album, index) => (
            <button
              key={album.id || index}
              className={`cl-home-album-m-tab${
                index === activeIndex ? ' is-active' : ''
              }`}
              type='button'
              aria-label={`第 ${index + 1} 辑：${album.name || ''}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goTo(index)}>
              {pad(index + 1)}
            </button>
          ))}
        </nav>
      </footer>

      <p className='sr-only' aria-live='polite'>
        {activeName
          ? `第 ${activeIndex + 1} 辑，共 ${count} 辑：${activeName}`
          : ''}
      </p>
    </section>
  )
}
