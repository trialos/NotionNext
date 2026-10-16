'use client'

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'

// Fisher-Yates 洗牌算法：确保每次进入页面或刷新时，所有照片公平轮换展位
function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 优雅的保底卡片（无内容时呈现，避免白屏）
const FALLBACK_CARDS = [
  {
    id: 'fb-1',
    title: '30 knots',
    lines: ['30 knots', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2021'],
    src: '/images/starter/about/about-image-01.jpg'
  },
  {
    id: 'fb-2',
    title: 'Sad Mis-Step',
    lines: ['Sad Mis-Step', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2024'],
    src: '/images/starter/about/about-image-02.jpg'
  },
  {
    id: 'fb-3',
    title: 'Mini Orange',
    lines: ['Mini Orange', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2014'],
    src: '/images/starter/about/about-image-01.jpg'
  },
  {
    id: 'fb-4',
    title: 'After Storm',
    lines: ['After Storm', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2022'],
    src: '/images/starter/about/about-image-02.jpg'
  },
  {
    id: 'fb-5',
    title: 'Untitled',
    lines: ['Untitled', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2016'],
    src: '/images/starter/about/about-image-01.jpg'
  },
  {
    id: 'fb-6',
    title: 'Toilet Paper',
    lines: ['Toilet Paper', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2022'],
    src: '/images/starter/about/about-image-02.jpg'
  },
  {
    id: 'fb-7',
    title: 'Cocoa Eggplant Tomato',
    lines: ['Cocoa Eggplant Tomato', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2025'],
    src: '/images/starter/about/about-image-01.jpg'
  },
  {
    id: 'fb-8',
    title: 'Toilet Paper',
    lines: ['Toilet Paper', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2022'],
    src: '/images/starter/about/about-image-02.jpg'
  },
  {
    id: 'fb-9',
    title: 'Production Fun Fact (Eggs)',
    lines: ['Production Fun Fact (Eggs)', '12 x 16 inch C type hand print', 'Edition of 1 Plus an artist Proof', '2024'],
    src: '/images/starter/about/about-image-01.jpg'
  }
]

export default function InfiniteAboutGrid({ cards = [], summary = '', title = '' }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const backdropRef = useRef(null)
  const heroOverlayRef = useRef(null)
  const backTopRef = useRef(null)
  const scrollToTopRef = useRef(null)
  const hasRunIntroRef = useRef(false)

  const finalSummary = summary?.trim() || '时光的弧线 · 捕捉生活、人机协作与日常美学的独立光影。'

  // 融合 Notion 传入的卡片与保底，并执行每次访问公平随机洗牌
  const displayCards = useMemo(() => {
    const raw = Array.isArray(cards) && cards.length > 0 ? cards : FALLBACK_CARDS
    return shuffleArray(raw)
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
    let winH = window.innerHeight

    // 垂直滚动物理量（标准正向位移：0 为 Hero 顶部，正值为向下深入画廊）
    const scroll = {
      ease: 0.08,
      current: 0,
      target: 0,
      last: 0,
      delta: { c: 0, t: 0 }
    }

    let isMobile = winW < 768
    const TRANSITION_DIST = isMobile ? 140 : 180
    let ambientDrift = 0

    scrollToTopRef.current = () => {
      isDragging = false
      velocity.y = 0
      mouse.press.t = 0
      document.body.classList.remove('cursor-grabbing')
      scroll.target = 0
    }

    // 指针拖拽与滑动状态
    let isDragging = false
    const drag = {
      startY: 0,
      startX: 0,
      scrollY: 0,
      pid: null
    }

    const mouse = {
      x: { t: 0.5, c: 0.5 },
      y: { t: 0.5, c: 0.5 },
      press: { t: 0, c: 0 }
    }

    const velocity = {
      y: 0,
      lastY: 0,
      lastTime: 0
    }

    // 题注滑入揭示观察器
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('visible', entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    let wallEl = null
    let colData = []
    let allImgs = []

    // 辅助构建单张卡片 DOM
    const createCardElement = (card, cardIdx) => {
      const el = document.createElement('div')
      el.className = 'cl-about-item item'

      // 悬停智能提层 (Hover Lift)
      const onEnter = () => {
        if (isDragging) return
        el.classList.add('is-hovered')
      }
      const onLeave = () => {
        el.classList.remove('is-hovered')
      }
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointerleave', onLeave)

      const wrapper = document.createElement('div')
      wrapper.className = 'item-wrapper'
      el.appendChild(wrapper)

      // 刚性相框视窗
      const itemImage = document.createElement('div')
      itemImage.className = 'item-image'
      wrapper.appendChild(itemImage)

      const img = document.createElement('img')
      img.src = card.src || '/images/starter/about/about-image-01.jpg'
      img.alt = card.title || '关于'
      img.loading = 'lazy'
      img.decoding = 'async'
      img.draggable = false

      img.onload = () => {
        if (isDestroyed) return
        colData.forEach(cd => {
          if (cd.setA) {
            cd.setHeight = cd.setA.offsetHeight || cd.setHeight
          }
        })
      }
      itemImage.appendChild(img)
      allImgs.push(img)

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
      observer.observe(caption)

      return el
    }

    const calculateLayout = () => {
      winW = window.innerWidth
      winH = window.innerHeight
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

      // 清理旧 DOM 结构
      observer.disconnect()
      container.innerHTML = ''
      colData = []
      allImgs = []

      // 创建 3D 展墙母容器
      wallEl = document.createElement('div')
      wallEl.className = 'cl-about-masonry-wall'
      container.appendChild(wallEl)

      // 将全部卡片均匀分发至各列
      const colCards = Array.from({ length: cols }, () => [])
      displayCards.forEach((card, idx) => {
        colCards[idx % cols].push(card)
      })

      // 为每一列创建独立的滚动 Track 与双周期镜像 (Set A + Set B)，确保上下滑动无缝回环
      for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement('div')
        colDiv.className = 'cl-about-column'
        colDiv.style.width = `${colW}px`

        const track = document.createElement('div')
        track.className = 'cl-about-col-track'
        colDiv.appendChild(track)

        // Set A: 原始卡片组
        const setA = document.createElement('div')
        setA.className = 'cl-about-col-set cl-about-col-set-a'
        colCards[c].forEach((card, cardIdx) => {
          const cardEl = createCardElement(card, cardIdx)
          setA.appendChild(cardEl)
        })
        track.appendChild(setA)

        // Set B: 镜像克隆组 (首尾相连实现 100% 无缝循环)
        const setB = document.createElement('div')
        setB.className = 'cl-about-col-set cl-about-col-set-b'
        colCards[c].forEach((card, cardIdx) => {
          const cardEl = createCardElement(card, cardIdx)
          setB.appendChild(cardEl)
        })
        track.appendChild(setB)

        wallEl.appendChild(colDiv)

        colData.push({
          colDiv,
          track,
          setA,
          setB,
          speed: 1.15 + (c % 2 === 1 ? 0.08 : 0), // 奇偶列微差速，增强流动层次感与速度感
          setHeight: 2400
        })
      }

      // 延迟一帧测量真实高度
      setTimeout(() => {
        if (isDestroyed) return
        colData.forEach(cd => {
          if (cd.setA) {
            cd.setHeight = cd.setA.offsetHeight || 2400
          }
        })
      }, 60)
    }

    // 入场动画：首屏卡片平滑浮现展开
    const triggerIntroAnimation = () => {
      const wrappers = container.querySelectorAll('.cl-about-col-set-a .item-wrapper')
      if (wrappers.length > 0) {
        gsap.from(wrappers, {
          y: 70,
          opacity: 0,
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.04,
          clearProps: 'opacity,transform'
        })
      }
      hasRunIntroRef.current = true
    }

    // 渲染循环 (RAF)
    const render = () => {
      if (isDestroyed) return

      // 上限锁定：不能小于 0（顶部即为 Hero 序言）
      if (scroll.target < 0) {
        scroll.target = 0
      }

      // 平滑插值 (标准 Lerp)
      scroll.current += (scroll.target - scroll.current) * scroll.ease
      scroll.delta.t = scroll.current - scroll.last
      scroll.delta.c += (scroll.delta.t - scroll.delta.c) * 0.06

      // 归一化过渡进度 (0 到 1)
      const progress = Math.min(1, Math.max(0, scroll.current / TRANSITION_DIST))

      // 处于 Hero 序言态且未处于拖拽时，瀑布背景自然优雅呼吸微漂移（轻盈灵动）
      if (scroll.current < 6 && !isDragging) {
        ambientDrift += 0.45
      }

      // 联动全局导航栏 Header：下拉超过 28px 收缩成紧凑单条，返回顶部平滑复原
      if (typeof window !== 'undefined') {
        const wasScrolled = window.__CL_ABOUT_SCROLLED__ || false
        let isNowScrolled = wasScrolled
        if (!wasScrolled && scroll.current > 28) {
          isNowScrolled = true
        } else if (wasScrolled && scroll.current < 10) {
          isNowScrolled = false
        }
        if (wasScrolled !== isNowScrolled) {
          window.__CL_ABOUT_SCROLLED__ = isNowScrolled
          window.__CL_ABOUT_SCROLL_Y__ = isNowScrolled ? scroll.current : 0
          window.dispatchEvent(new Event('cl-virtual-scroll'))
        }
      }

      // 动态更新 Hero 序言文字：文字自然渐隐
      if (heroOverlayRef.current) {
        const textOpacity = Math.max(0, 1 - progress * 1.25)
        const textTransY = -progress * 24
        heroOverlayRef.current.style.opacity = textOpacity.toFixed(3)
        heroOverlayRef.current.style.transform = `translate3d(0, ${textTransY.toFixed(1)}px, 0)`
        heroOverlayRef.current.style.visibility = textOpacity <= 0 ? 'hidden' : 'visible'
      }

      // 动态更新背景毛玻璃与暗膜（静态滤镜 + 纯 GPU Opacity 驱动，彻底杜绝 iOS Safari 重算掉帧）
      if (backdropRef.current) {
        const backdropOpacity = Math.max(0, 1 - progress)
        backdropRef.current.style.opacity = backdropOpacity.toFixed(3)
        backdropRef.current.style.visibility = progress >= 1 ? 'hidden' : 'visible'
      }

      // 鼠标位置平滑滤波
      mouse.x.c += (mouse.x.t - mouse.x.c) * 0.05
      mouse.y.c += (mouse.y.t - mouse.y.c) * 0.05
      mouse.press.c += (mouse.press.t - mouse.press.c) * 0.05

      // 1. 整面 3D 展墙空间姿态与聚合绽放 (Wall Bloom)
      if (wallEl) {
        const wallScale = 0.92 + 0.08 * progress
        const wallRotY = (mouse.x.c - 0.5) * 15
        const wallRotX = -(mouse.y.c - 0.5) * 9
        wallEl.style.transform = `scale(${wallScale.toFixed(3)}) rotateX(${wallRotX.toFixed(2)}deg) rotateY(${wallRotY.toFixed(2)}deg)`
      }

      // 2. 各列无缝循环滚动：
      const streamY = ambientDrift + scroll.current
      for (let c = 0; c < colData.length; c++) {
        const cd = colData[c]
        const h = cd.setHeight || 2400
        const colScroll = -streamY * cd.speed
        let wrapY = colScroll % h
        if (wrapY > 0) wrapY -= h
        cd.track.style.transform = `translate3d(0, ${wrapY.toFixed(1)}px, 0)`
      }

      // 3. 画芯内部 3D 视差窗 (PC 端轻微呼吸微动，移动端跳过以节省 60~80 次每帧 DOM 重绘)
      if (!isMobile) {
        const transX = -(mouse.x.c - 0.5) * 10
        const transY = -(mouse.y.c - 0.5) * 10 - scroll.delta.c * 0.1
        const clampedX = Math.max(-6, Math.min(6, transX))
        const clampedY = Math.max(-6, Math.min(6, transY))
        const baseScale = 1.18 + 0.05 * mouse.press.c

        for (let i = 0; i < allImgs.length; i++) {
          allImgs[i].style.transform = `scale(${baseScale}) translate3d(${clampedX.toFixed(2)}%, ${clampedY.toFixed(2)}%, 0)`
        }
      }

      // 4. 动态切换返回顶部按钮（深入画廊后浮现，在 Hero 顶部自动隐退）
      if (backTopRef.current) {
        const showBackTop = scroll.current > 100
        backTopRef.current.classList.toggle('is-visible', showBackTop)
      }

      scroll.last = scroll.current
      rafId = requestAnimationFrame(render)
    }

    // 事件处理：PointerEvents 统一收口鼠标与触控拖拽
    const onPointerDown = e => {
      // 避免捕获返回顶部按钮点击，确保按钮原生点击即刻触发
      if (e.target && e.target.closest && e.target.closest('.cl-about-back-top')) return
      if (e.button != null && e.button !== 0) return
      isDragging = true
      drag.startY = e.clientY
      drag.startX = e.clientX
      drag.scrollY = scroll.target
      drag.pid = e.pointerId
      mouse.press.t = 1

      document.querySelectorAll('.cl-about-item.is-hovered').forEach(node => {
        node.classList.remove('is-hovered')
      })

      velocity.lastY = e.clientY
      velocity.lastTime = performance.now()
      velocity.y = 0

      try {
        stage.setPointerCapture(e.pointerId)
      } catch (_) {}

      document.body.classList.add('cursor-grabbing')
    }

    const onPointerMove = e => {
      mouse.x.t = e.clientX / winW
      mouse.y.t = e.clientY / winH

      if (!isDragging) return

      // 标准自然物理映射：上拖 (dy > 0) 查看下方内容 -> 深入画廊 -> target 增加
      const dy = drag.startY - e.clientY
      const newTarget = drag.scrollY + dy
      scroll.target = Math.max(0, newTarget)

      const now = performance.now()
      const dt = Math.max(1, now - velocity.lastTime)
      velocity.y = (velocity.lastY - e.clientY) / dt
      velocity.lastTime = now
      velocity.lastY = e.clientY
    }

    const onPointerUp = e => {
      if (!isDragging) return
      isDragging = false
      mouse.press.t = 0
      document.body.classList.remove('cursor-grabbing')

      try {
        if (drag.pid != null) {
          stage.releasePointerCapture(drag.pid)
        }
      } catch (_) {}

      // 释放后的自然平滑惯性滑行
      const vy = Math.max(-2.5, Math.min(2.5, velocity.y))
      scroll.target = Math.max(0, scroll.target + vy * 180)
    }

    const onWheel = e => {
      e.preventDefault()
      const delta = e.deltaY * (e.deltaMode === 1 ? 24 : 1)
      // 滚轮向下滚动 (delta > 0) -> target 增加深入画廊，滚轮向上滚动 (delta < 0) -> target 减小回到 Hero
      scroll.target = Math.max(0, scroll.target + delta * 0.85)
    }

    const onResize = () => {
      isMobile = window.innerWidth < 768
      calculateLayout()
    }

    // 拦截移动端默认网页拖拽和橡皮筋露底
    const onTouchMove = e => {
      if (e.cancelable) {
        e.preventDefault()
      }
    }

    // 初始化瀑布流布局与渲染
    calculateLayout()
    rafId = requestAnimationFrame(render)

    // 首次进入/刷新触发优雅入场浮现
    if (!hasRunIntroRef.current) {
      setTimeout(() => {
        if (!isDestroyed) {
          triggerIntroAnimation()
        }
      }, 50)
    }

    stage.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('resize', onResize)

    return () => {
      isDestroyed = true
      document.documentElement.classList.remove('cl-about-locked')
      document.body.classList.remove('cl-about-locked')
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
      stage.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
      scrollToTopRef.current = null
      delete window.__CL_ABOUT_SCROLLED__
      delete window.__CL_ABOUT_SCROLL_Y__
      window.dispatchEvent(new Event('cl-virtual-scroll'))
      document.body.classList.remove('cursor-grabbing')
    }
  }, [displayCards])

  return (
    <div
      ref={stageRef}
      className='cl-about-stage relative h-screen h-[100dvh] w-full overflow-hidden select-none bg-[var(--cl-bg)]'>
      {/* 3D 摄影瀑布展墙画布 */}
      <div
        ref={containerRef}
        id='cl-about-canvas'
        className='absolute inset-0 h-full w-full cursor-grab overflow-hidden touch-none'
      />

      {/* Hero 序言毛玻璃与暗膜滤镜过渡层 */}
      <div
        ref={backdropRef}
        className='cl-about-hero-backdrop pointer-events-none'
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      />

      {/* Hero 序言杂志排版覆盖层（纯粹克制，穿透触控，无冗余胶囊按钮） */}
      <div
        ref={heroOverlayRef}
        className='cl-about-hero-overlay pointer-events-none'>
        <div className='cl-about-hero-inner pointer-events-none'>
          <div className='cl-about-hero-badge'>
            <span className='cl-about-hero-badge-dot' />
            <span>时光的弧线 · 序言</span>
          </div>

          <h1 className='cl-about-hero-summary'>
            {finalSummary}
          </h1>

          {/* 纯粹极简文字指引（无胶囊边框、无色块背景，克制自然） */}
          <div className='cl-about-hero-hint-text'>
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
          </div>
        </div>
      </div>

      {/* 极简返回顶部 / 回到序言按钮 */}
      <button
        ref={backTopRef}
        type='button'
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          scrollToTopRef.current?.()
        }}
        className='cl-about-back-top'
        aria-label='返回顶部 · 回到序言'
        title='返回顶部'>
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <polyline points='18 15 12 9 6 15' />
        </svg>
      </button>
    </div>
  )
}
