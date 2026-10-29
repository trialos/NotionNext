'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useGlobal } from '@/lib/global'
import {
  buildSizedSource,
  computeTargetPixelWidth
} from './imageSrcset'
import { shouldWallOwnWheel } from './wheelOwnership'
import { resolveHeroCopy } from './heroCopy'

// 优雅的保底卡片（无内容时呈现，避免白屏）
const FALLBACK_CARDS = [
  {
    id: 'fb-1',
    title: '30 knots',
    lines: ['30 knots', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2021'],
    src: '/images/starter/about/about-image-01.jpg',
    aspectRatio: 1.333
  },
  {
    id: 'fb-2',
    title: 'Sad Mis-Step',
    lines: ['Sad Mis-Step', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2024'],
    src: '/images/starter/about/about-image-02.jpg',
    aspectRatio: 0.8
  },
  {
    id: 'fb-3',
    title: 'Mini Orange',
    lines: ['Mini Orange', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2014'],
    src: '/images/starter/about/about-image-01.jpg',
    aspectRatio: 1.5
  },
  {
    id: 'fb-4',
    title: 'After Storm',
    lines: ['After Storm', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2022'],
    src: '/images/starter/about/about-image-02.jpg',
    aspectRatio: 1.25
  },
  {
    id: 'fb-5',
    title: 'Untitled',
    lines: ['Untitled', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2016'],
    src: '/images/starter/about/about-image-01.jpg',
    aspectRatio: 1.0
  },
  {
    id: 'fb-6',
    title: 'Toilet Paper',
    lines: ['Toilet Paper', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2022'],
    src: '/images/starter/about/about-image-02.jpg',
    aspectRatio: 1.4
  },
  {
    id: 'fb-7',
    title: 'Cocoa Eggplant Tomato',
    lines: ['Cocoa Eggplant Tomato', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2025'],
    src: '/images/starter/about/about-image-01.jpg',
    aspectRatio: 1.333
  },
  {
    id: 'fb-8',
    title: 'Toilet Paper',
    lines: ['Toilet Paper', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2022'],
    src: '/images/starter/about/about-image-02.jpg',
    aspectRatio: 0.8
  },
  {
    id: 'fb-9',
    title: 'Production Fun Fact (Eggs)',
    lines: ['Production Fun Fact (Eggs)', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2024'],
    src: '/images/starter/about/about-image-01.jpg',
    aspectRatio: 1.5
  }
]

export default function InfiniteAboutGrid({
  cards = [],
  summary = '',
  description = '',
  title = ''
}) {
  const { locale } = useGlobal()
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const backdropRef = useRef(null)
  const heroOverlayRef = useRef(null)
  const prologueBtnRef = useRef(null)
  const closeHeroRef = useRef(null)
  const openHeroRef = useRef(null)

  const { headline: finalSummary, lead: heroLead } = resolveHeroCopy({
    summary,
    description,
    fallbackSummary: '时光的弧线 · 捕捉生活、人机协作与日常美学的独立光影。'
  })

  // 严格忠实呈现 Notion 原生排版叙事顺序，与 SSR HTML 预加载形成 100% 同构匹配
  const displayCards = useMemo(() => {
    return Array.isArray(cards) && cards.length > 0 ? cards : FALLBACK_CARDS
  }, [cards])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current || container
    if (!container || !stage) return

    let isDestroyed = false
    let rafId = null

    document.documentElement.classList.add('cl-about-locked')
    document.body.classList.add('cl-about-locked')

    let winW = window.innerWidth

    // 垂直滚动物理量
    const scroll = {
      ease: 0.08,
      current: 0,
      target: 0,
      last: 0,
      delta: { c: 0, t: 0 }
    }

    let ambientDrift = 0
    let isHeroOpen = true

    // 指针拖拽与滑动状态
    let isDragging = false
    const drag = {
      startY: 0,
      startX: 0,
      scrollY: 0,
      pid: null
    }

    const velocity = {
      y: 0,
      lastY: 0,
      lastTime: 0
    }

    // 题注滑入揭示观察器
    const captionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('visible', entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    // 双向动态视口显存生命周期观察器：
    // 1. 滑入 800px 缓冲区：按需加载并硬件栅格化（被卸载过的卡片从本地 HTTP 缓存秒开）；
    // 2. 滑出 1000px 以外：立即卸载未压缩的位图显存（释放 3.8MB~4.5MB 显存/张），永不累积膨胀！
    // 3. 容器 aspectRatio 刚性保留：卸载时 DOM 布局高宽绝对零抖动（零 CLS）。
    const memoryLifecycleObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const img = entry.target
          if (entry.isIntersecting) {
            const src = img.dataset.src
            if (src && img.getAttribute('src') !== src) {
              // ⚠️ 不用 srcset/sizes：Notion 代理在 srcset 选档路径下按 **CSS 宽度**
              // 出图、不吃 DPR → Retina 上每张卡片都差 2~3 倍像素 → 被拉伸放大 → 发虚。
              // 改为直连 width URL，档位按「卡片宽 × DPR」自算。
              img.src = buildSizedSource(
                src,
                computeTargetPixelWidth(
                  img.clientWidth || 320,
                  typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
                )
              )
              if (typeof img.decode === 'function') {
                img
                  .decode()
                  .then(() => {
                    if (!isDestroyed) img.classList.add('is-loaded')
                  })
                  .catch(() => {
                    if (!isDestroyed) img.classList.add('is-loaded')
                  })
              } else {
                img.onload = () => {
                  if (!isDestroyed) img.classList.add('is-loaded')
                }
              }
            }
          } else {
            // 滑出视口 800px 缓冲区之外：成对卸载 src，把解码位图归还给系统
            if (img.getAttribute('src') && !img.dataset.critical) {
              img.removeAttribute('src')
              img.classList.remove('is-loaded')
            }
          }
        })
      },
      { rootMargin: '800px 0px 800px 0px' }
    )

    let colData = []

    // 重新测量所有列高
    const updateBounds = () => {
      colData.forEach(cd => {
        if (cd.setA) {
          cd.setHeight = cd.setA.offsetHeight || cd.setHeight || 1800
        }
      })
    }

    // 辅助构建单张卡片 DOM（固定比例占位容器，从根源消除 CLS，纯 CSS 替代 JS 悬停闭包）
    const createCardElement = (card, cardIdx, isSetA, cols) => {
      const el = document.createElement('div')
      el.className = 'cl-about-item item'

      const wrapper = document.createElement('div')
      wrapper.className = 'item-wrapper'
      el.appendChild(wrapper)

      // 刚性相框视窗：强制设置 aspectRatio，防止未加载或卸载时高度为 0 撑开布局（彻底杜绝 CLS）
      const itemImage = document.createElement('div')
      itemImage.className = 'item-image'
      const ratio = card.aspectRatio || 1.333
      itemImage.style.aspectRatio = String(ratio)
      wrapper.appendChild(itemImage)

      const img = document.createElement('img')
      img.alt = card.title || '关于'
      img.decoding = 'async'
      img.draggable = false
      img.dataset.src = card.src || ''

      // 首屏关键路径卡片（Set A 的前 cols 张）：免等待直接挂载；
      // 只有第一张拿 high 抓取优先级，避免多图互抢带宽。
      // 第一张的 URL 必须与页面级 preload 的 href **完全一致**（= card.src，
      // 1024 档直连 URL）→ 预加载精确命中，不白下载。
      const isCritical = isSetA && cardIdx < Math.max(2, cols)
      if (isCritical && card.src) {
        img.dataset.critical = 'true'
        img.src = card.src
        if (isSetA && cardIdx === 0) {
          img.setAttribute('fetchpriority', 'high')
        }
        if (typeof img.decode === 'function') {
          img
            .decode()
            .then(() => {
              if (!isDestroyed) img.classList.add('is-loaded')
            })
            .catch(() => {
              if (!isDestroyed) img.classList.add('is-loaded')
            })
        } else {
          img.onload = () => {
            if (!isDestroyed) img.classList.add('is-loaded')
          }
        }
      }

      // 所有卡片均接入双向显存生命周期观察器：当用户滚动远离时，动态释放解码显存
      memoryLifecycleObserver.observe(img)
      itemImage.appendChild(img)

      // 题注：根据内容自适应高度，紧贴照片下方并保留美学间距
      const caption = document.createElement('small')
      caption.className = 'cl-about-caption'
      const lines = Array.isArray(card.lines) && card.lines.length > 0
        ? card.lines
        : [card.title || '无标题', 'Circle of Life', 'Original Portrait', card.date || '2024']

      lines.forEach((lineText, lineIdx) => {
        const mask = document.createElement('span')
        mask.className = 'line-mask'
        mask.style.transitionDelay = `${lineIdx * 0.12}s`

        const line = document.createElement('span')
        line.className = `line ${lineIdx === 0 ? 'caption-title' : ''}`
        line.textContent = lineText
        mask.appendChild(line)
        caption.appendChild(mask)
      })

      wrapper.appendChild(caption)
      captionObserver.observe(caption)

      return el
    }

    const calculateLayout = () => {
      winW = window.innerWidth
      const mobileMode = winW < 768

      // 计算列数
      let cols = 4
      if (mobileMode) {
        cols = 2
      } else if (winW < 1024) {
        cols = 3
      } else if (winW < 1440) {
        cols = 3
      } else {
        cols = 4
      }

      // 计算列宽
      const wallPadding = mobileMode ? 28 : (winW < 1440 ? 48 : 80)
      const gapTotal = mobileMode ? 14 * (cols - 1) : (winW < 1440 ? 24 * (cols - 1) : 32 * (cols - 1))
      const availableW = winW - wallPadding - gapTotal
      const colW = Math.max(140, Math.floor(availableW / cols))

      // 清理旧 DOM 结构与观察器
      captionObserver.disconnect()
      memoryLifecycleObserver.disconnect()
      container.innerHTML = ''
      colData = []

      // 创建瀑布展墙母容器
      const wallEl = document.createElement('div')
      wallEl.className = 'cl-about-masonry-wall'
      container.appendChild(wallEl)

      // 确保卡片池充足，避免少于 4 行产生视觉断层
      let pool = [...displayCards]
      while (pool.length < cols * 4) {
        pool = pool.concat(displayCards)
      }

      const colCards = Array.from({ length: cols }, () => [])
      pool.forEach((card, idx) => {
        colCards[idx % cols].push(card)
      })

      // 构建 Set A 与 Set B 无缝衔接循环
      for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement('div')
        colDiv.className = 'cl-about-column'
        colDiv.style.width = `${colW}px`

        const track = document.createElement('div')
        track.className = 'cl-about-col-track'
        colDiv.appendChild(track)

        // Set A: 真实卡片集
        const setA = document.createElement('div')
        setA.className = 'cl-about-col-set cl-about-col-set-a'
        colCards[c].forEach((card, cardIdx) => {
          const cardEl = createCardElement(card, cardIdx, true, cols)
          setA.appendChild(cardEl)
        })
        track.appendChild(setA)

        // Set B: 无缝闭环镜像集
        const setB = document.createElement('div')
        setB.className = 'cl-about-col-set cl-about-col-set-b'
        colCards[c].forEach((card, cardIdx) => {
          const cardEl = createCardElement(card, cardIdx, false, cols)
          setB.appendChild(cardEl)
        })
        track.appendChild(setB)

        wallEl.appendChild(colDiv)

        colData.push({
          colDiv,
          track,
          setA,
          setB,
          speed: 1.0 + (c % 2 === 1 ? 0.03 : 0), // 奇偶列极微妙视差差速
          setHeight: 2000
        })
      }

      // 测量稳定列高（因 aspectRatio 已强制预置，DOM 插入瞬间高宽即确定）
      requestAnimationFrame(() => {
        if (isDestroyed) return
        updateBounds()
      })
    }

    // 收起序言幕布，进入画廊自由探索
    const closeHero = () => {
      if (!isHeroOpen) return
      isHeroOpen = false

      // 将当前的自然漂移量吸收至 scroll 物理量，实现绝对零跳跃衔接
      scroll.current += ambientDrift
      scroll.target = scroll.current
      ambientDrift = 0

      heroOverlayRef.current?.classList.add('is-closed')
      backdropRef.current?.classList.add('is-closed')
      prologueBtnRef.current?.classList.add('is-visible')

      // 联动全局导航栏 Header 收缩成极简单条（通过 requestAnimationFrame 延迟调度，消灭同步 Commit/Layout Long Task）
      if (typeof window !== 'undefined') {
        window.__CL_ABOUT_SCROLLED__ = true
        window.__CL_ABOUT_SCROLL_Y__ = 100
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('cl-virtual-scroll'))
        })
      }
    }

    // 唤出序言幕布（原位缓缓降落，零重载，背景恢复缓慢流动）
    const openHero = () => {
      if (isHeroOpen) return
      isHeroOpen = true

      // 不对 scroll.current 做任何回退，保留当前瀑布流位置，恢复呼吸流动
      ambientDrift = 0

      heroOverlayRef.current?.classList.remove('is-closed')
      backdropRef.current?.classList.remove('is-closed')
      prologueBtnRef.current?.classList.remove('is-visible')

      // 联动全局导航栏 Header 展开复原（延迟到下一帧，消灭同步重绘）
      if (typeof window !== 'undefined') {
        window.__CL_ABOUT_SCROLLED__ = false
        window.__CL_ABOUT_SCROLL_Y__ = 0
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('cl-virtual-scroll'))
        })
      }
    }

    closeHeroRef.current = closeHero
    openHeroRef.current = openHero

    // 极轻量纯 2D GPU 渲染循环 (RAF) - 零逐帧 DOM 样式遍历
    const render = () => {
      if (isDestroyed) return

      // 处于序言态时，背景照片墙缓慢静谧流动 (0.45px/帧)
      if (isHeroOpen) {
        ambientDrift += 0.45
      }

      // 平滑插值 (标准 Lerp)
      scroll.current += (scroll.target - scroll.current) * scroll.ease
      scroll.delta.t = scroll.current - scroll.last
      scroll.delta.c += (scroll.delta.t - scroll.delta.c) * 0.06

      // 各列纯粹数学无缝循环无限瀑布流
      const streamY = scroll.current + ambientDrift
      for (let c = 0; c < colData.length; c++) {
        const cd = colData[c]
        const h = cd.setHeight || 1800
        const colScroll = streamY * cd.speed
        let offset = colScroll % h
        if (offset < 0) offset += h
        cd.track.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`
      }

      scroll.last = scroll.current
      rafId = requestAnimationFrame(render)
    }

    // 事件处理：PointerEvents 统一收口鼠标与触控拖拽
    const onPointerDown = e => {
      if (e.target && e.target.closest && e.target.closest('.cl-about-prologue-btn')) return
      if (e.button != null && e.button !== 0) return

      isDragging = true
      drag.startY = e.clientY
      drag.startX = e.clientX
      drag.scrollY = scroll.target
      drag.pid = e.pointerId

      velocity.lastY = e.clientY
      velocity.lastTime = performance.now()
      velocity.y = 0

      try {
        stage.setPointerCapture(e.pointerId)
      } catch (_) {}

      document.body.classList.add('cursor-grabbing')
    }

    const onPointerMove = e => {
      if (!isDragging) return

      // 上拖 (dy > 0) -> 内容向上滚动
      const dy = drag.startY - e.clientY
      scroll.target = drag.scrollY + dy

      const now = performance.now()
      const dt = Math.max(1, now - velocity.lastTime)
      velocity.y = (velocity.lastY - e.clientY) / dt
      velocity.lastTime = now
      velocity.lastY = e.clientY
    }

    const onPointerUp = e => {
      if (!isDragging) return
      isDragging = false
      document.body.classList.remove('cursor-grabbing')

      try {
        if (drag.pid != null) {
          stage.releasePointerCapture(drag.pid)
        }
      } catch (_) {}

      // 序言态下上滑手势自动收起幕布
      if (isHeroOpen && drag.startY - e.clientY > 36) {
        closeHero()
      }

      // 释放后的自然平滑惯性滑行
      const vy = Math.max(-2.5, Math.min(2.5, velocity.y))
      scroll.target += vy * 180
    }

    const onWheel = e => {
      // 指针落在浮层内的原生滚动容器（顶栏全屏菜单 / 搜索结果）时，
      // 交还浏览器原生滚动，展墙不得吞掉滚轮
      if (!shouldWallOwnWheel(e.target, stage)) return

      e.preventDefault()
      // 序言态下向下滚轮轻微下拨即可收起幕布，并带入画廊
      if (isHeroOpen) {
        if (e.deltaY > 12) {
          closeHero()
          scroll.target += e.deltaY * 0.8
        }
        return
      }

      const delta = e.deltaY * (e.deltaMode === 1 ? 24 : 1)
      scroll.target += delta * 0.85
    }

    // 键盘平移：画布是本页唯一的手势独占功能，键盘用户必须能操作。
    // 直接改写既有的 scroll.target，与滚轮/拖拽完全同构，复用同一套 Lerp 物理量
    const KEY_STEP = 140
    const KEY_STEP_LARGE = 620
    const onKeyDown = e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // 序言幕布打开时：向下键收起幕布并进入画廊（与滚轮下拨一致）
      if (isHeroOpen) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          closeHero()
          scroll.target += KEY_STEP
          e.preventDefault()
        }
        return
      }

      const step = e.key === 'PageUp' || e.key === 'PageDown' ? KEY_STEP_LARGE : KEY_STEP
      switch (e.key) {
        case 'ArrowUp':
          scroll.target -= step
          break
        case 'ArrowDown':
          scroll.target += step
          break
        case 'Home':
          scroll.target = 0
          break
        case 'End':
          scroll.target = KEY_STEP_LARGE * 4
          break
        default:
          return
      }
      e.preventDefault()
    }

    const onResize = () => {
      calculateLayout()
    }

    // 初始化瀑布流布局与渲染
    calculateLayout()
    rafId = requestAnimationFrame(render)

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)

    return () => {
      isDestroyed = true
      document.documentElement.classList.remove('cl-about-locked')
      document.body.classList.remove('cl-about-locked')
      if (rafId) cancelAnimationFrame(rafId)
      captionObserver.disconnect()
      memoryLifecycleObserver.disconnect()
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      closeHeroRef.current = null
      openHeroRef.current = null
      delete window.__CL_ABOUT_SCROLLED__
      delete window.__CL_ABOUT_SCROLL_Y__
      window.dispatchEvent(new Event('cl-virtual-scroll'))
      document.body.classList.remove('cursor-grabbing')
    }
  }, [displayCards])

  const handleCloseHero = e => {
    e?.stopPropagation()
    e?.preventDefault()
    closeHeroRef.current?.()
  }

  const handleOpenHero = e => {
    e?.stopPropagation()
    e?.preventDefault()
    openHeroRef.current?.()
  }

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role='application'
      aria-label={
        locale?.COMMON?.ABOUT_CANVAS_KEYS || '摄影展墙，使用上下方向键平移'
      }
      className='cl-about-stage relative h-screen h-[100dvh] w-full overflow-hidden select-none bg-[var(--cl-bg)]'>
      {/* 摄影瀑布展墙画布 */}
      <div
        ref={containerRef}
        id='cl-about-canvas'
        className='absolute inset-0 h-full w-full cursor-grab overflow-hidden touch-none'
      />

      {/* Hero 序言毛玻璃与暗膜滤镜过渡层 */}
      <div
        ref={backdropRef}
        onClick={handleCloseHero}
        className='cl-about-hero-backdrop'
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      />

      {/* Hero 序言杂志排版覆盖层 */}
      <div
        ref={heroOverlayRef}
        className='cl-about-hero-overlay'>
        <div className='cl-about-hero-inner'>
          <div className='cl-about-hero-badge'>
            <span className='cl-about-hero-badge-dot' />
            <span>时光的弧线 · 序言</span>
          </div>

          <h1 className='cl-about-hero-summary'>
            {finalSummary}
          </h1>

          {heroLead && <p className='cl-about-hero-lead'>{heroLead}</p>}

          {/* 纯粹极简文字指引（点击收起幕布） */}
          <button
            type='button'
            onClick={handleCloseHero}
            className='cl-about-hero-hint-text'
            aria-label='向下滑动探索'>
            <span>向下滑动探索</span>
            <svg
              className='cl-about-hero-hint-arrow'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <polyline points='6 9 12 15 18 9' />
            </svg>
          </button>
        </div>
      </div>

      {/* 极简「序言」朱砂徽标按钮（深入画廊后浮现，点击优雅降下幕布，零重载） */}
      <button
        ref={prologueBtnRef}
        type='button'
        onClick={handleOpenHero}
        className='cl-about-prologue-btn'
        aria-label='打开序言'
        title='打开序言'>
        <span className='cl-about-prologue-dot' />
        <span className='cl-about-prologue-text'>序言</span>
      </button>
    </div>
  )
}
