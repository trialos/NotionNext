'use client'

import { useEffect, useRef, useMemo } from 'react'

// 高品质默认兜底图片池（当 Notion 尚未加载时保证视觉完整度，绝不抓取无关影集）
const FALLBACK_CARDS = [
  { id: 'fb-1', src: '/images/starter/about/about-image-01.jpg', aspectRatio: 1.333 },
  { id: 'fb-2', src: '/images/starter/about/about-image-02.jpg', aspectRatio: 0.8 },
  { id: 'fb-3', src: '/images/starter/about/about-image-01.jpg', aspectRatio: 1.5 },
  { id: 'fb-4', src: '/images/starter/about/about-image-02.jpg', aspectRatio: 1.25 },
  { id: 'fb-5', src: '/images/starter/about/about-image-01.jpg', aspectRatio: 1.0 },
  { id: 'fb-6', src: '/images/starter/about/about-image-02.jpg', aspectRatio: 1.4 },
  { id: 'fb-7', src: '/images/starter/about/about-image-01.jpg', aspectRatio: 1.333 },
  { id: 'fb-8', src: '/images/starter/about/about-image-02.jpg', aspectRatio: 0.8 },
  { id: 'fb-9', src: '/images/starter/about/about-image-01.jpg', aspectRatio: 1.5 }
]

/**
 * 首页全屏倾斜交错流光照片墙 (HomeTiltWall) - 多轴联动与严苛边界控制版
 * 1. 顺时针倾斜 8°（走向严格对齐 "\"）
 * 2. 多轴滚动联动：下拉时交错列产生大幅相对运动，同时倾斜母画布产生横向与垂直向平移（Diagonal Pan），让第3列、第4列完整进入中心视野
 * 3. 严格边界脱离保护：一旦完全滚出首屏轨道（rect.bottom <= 0），立即彻底冻结终态，完全停止 RAF 计算与事件响应，绝不干扰下方内容
 * 4. 220vh 充足粘性行程，直接映射页面滚动行程
 * 5. 遵照 Vercel 规范：支持 prefers-reduced-motion，首屏图片异步解码防爆显存
 */
export default function HomeTiltWall({ homeCoverImages = [] }) {
  const trackWrapperRef = useRef(null)
  const containerRef = useRef(null)
  const rotatedRef = useRef(null)

  // 严格只读取用户指定的 HomeCover 页面图片；不向一般影集回退
  const displayCards = useMemo(() => {
    if (Array.isArray(homeCoverImages) && homeCoverImages.length > 0) {
      return homeCoverImages.map((im, idx) => ({
        id: im.id || `hc-${idx}`,
        src: typeof im === 'string' ? im : im.src || im.url,
        aspectRatio: im.aspectRatio || (idx % 3 === 0 ? 0.8 : idx % 2 === 0 ? 1.333 : 1.0),
        title: im.title || ''
      }))
    }
    return FALLBACK_CARDS
  }, [homeCoverImages])

  useEffect(() => {
    const trackWrapper = trackWrapperRef.current
    const container = containerRef.current
    const rotated = rotatedRef.current
    if (!trackWrapper || !container || !rotated) return

    let isDestroyed = false
    let isVisible = true
    let isExited = false
    let rafId = null

    // 旋转角度与几何自适应缩放（顺时针 8 度，精确消除四角留白）
    const ROTATE_DEG = 8
    const rad = Math.abs(ROTATE_DEG) * (Math.PI / 180)
    let currentScale = 1.08

    // 滚动行程与多轴平移状态
    let targetProgress = 0  // 0 到 1
    let currentProgress = 0 // 平滑插值进度
    let idleOffset = 0      // 静止时的呼吸微漫游
    const IDLE_SPEED = 0.12 // 舒缓呼吸速度
    const TRAVEL_DISTANCE = 960 // 滚动时奇偶列的大幅度对流行程

    let maxPanX = 120
    let maxPanY = 90
    let cachedScrollMax = 1000
    let cachedBottomLimit = 2000

    const updateGeometry = () => {
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
      maxPanX = winW < 640 ? 60 : winW < 1024 ? 90 : 130
      maxPanY = winW < 640 ? 40 : winW < 1024 ? 65 : 100

      if (trackWrapper) {
        const rect = trackWrapper.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset || 0
        const top = rect.top + scrollY
        const h = trackWrapper.offsetHeight
        cachedScrollMax = Math.max(1, h - window.innerHeight)
        cachedBottomLimit = top + h
      }
    }

    const applyRotatedTransform = () => {
      // 随滚动进行对角线与横向平移，平滑将两侧及后续列带入中心视野
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
      // 移动端初始微调，避免绝对居中遮蔽，保证首屏两侧列均有明显露出，下拉时整网格横移展开
      const initialShiftX = winW < 640 ? -18 : 0
      const panX = initialShiftX + (currentProgress - 0.5) * -maxPanX
      const panY = (currentProgress - 0.5) * -maxPanY
      rotated.style.transform = `translate3d(calc(-50% + ${panX.toFixed(1)}px), calc(-50% + ${panY.toFixed(1)}px), 0) rotate(${ROTATE_DEG}deg) scale(${currentScale.toFixed(4)})`
    }

    const updateScale = () => {
      const w = container.offsetWidth || window.innerWidth
      const h = container.offsetHeight || window.innerHeight
      const s = w * Math.cos(rad) + h * Math.sin(rad)
      const r = w * Math.sin(rad) + h * Math.cos(rad)
      const isMobile = (container.offsetWidth || window.innerWidth) < 640
      const scaleMultiplier = isMobile ? 1.06 : 1.15
      currentScale = Math.max(s / w, r / h) * scaleMultiplier
      updateGeometry()
      applyRotatedTransform()
    }

    // 显存生命周期观察器（仅解码视口内及其近邻缓冲区的真实图片，防爆显存）
    const memoryLifecycleObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const img = entry.target
          if (entry.isIntersecting) {
            const src = img.dataset.src
            if (src && img.getAttribute('src') !== src) {
              img.src = src
              if (typeof img.decode === 'function') {
                img.decode().then(() => {
                  if (!isDestroyed) img.classList.add('is-loaded')
                }).catch(() => {
                  if (!isDestroyed) img.classList.add('is-loaded')
                })
              } else {
                img.onload = () => {
                  if (!isDestroyed) img.classList.add('is-loaded')
                }
              }
            }
          } else {
            if (img.getAttribute('src') && !img.dataset.critical) {
              img.removeAttribute('src')
              img.classList.remove('is-loaded')
            }
          }
        })
      },
      { rootMargin: '800px 0px 800px 0px' }
    )

    let columns = []

    // 依据视口宽度构建充裕的列数（移动端 3 列，桌面端 5 列，大屏 6 列），确保多轴视野饱满展开
    const buildColumns = () => {
      memoryLifecycleObserver.disconnect()
      rotated.innerHTML = ''
      columns = []

      const winW = window.innerWidth
      let colCount = 5
      if (winW < 640) {
        colCount = 3
      } else if (winW < 1024) {
        colCount = 4
      } else if (winW < 1600) {
        colCount = 5
      } else {
        colCount = 6
      }

      let pool = [...displayCards]
      while (pool.length < colCount * 5) {
        pool = pool.concat(displayCards)
      }

      const colBuckets = Array.from({ length: colCount }, () => [])
      pool.forEach((card, idx) => {
        colBuckets[idx % colCount].push(card)
      })

      for (let c = 0; c < colCount; c++) {
        const colDiv = document.createElement('div')
        colDiv.className = 'cl-home-tilt-col'

        const track = document.createElement('div')
        track.className = 'cl-home-tilt-track'
        colDiv.appendChild(track)

        // Set A: 基础卡片集
        const setA = document.createElement('div')
        setA.className = 'cl-home-tilt-set cl-home-tilt-set-a'
        colBuckets[c].forEach((card, cIdx) => {
          const itemEl = createItemElement(card, cIdx, true, colCount)
          setA.appendChild(itemEl)
        })
        track.appendChild(setA)

        // Set B: 无缝对齐闭环集
        const setB = document.createElement('div')
        setB.className = 'cl-home-tilt-set cl-home-tilt-set-b'
        colBuckets[c].forEach((card, cIdx) => {
          const itemEl = createItemElement(card, cIdx, false, colCount)
          setB.appendChild(itemEl)
        })
        track.appendChild(setB)

        rotated.appendChild(colDiv)

        columns.push({
          colDiv,
          track,
          setA,
          halfHeight: 2000,
          // 奇偶列相反方向交错对流（偶数列向下 -1，奇数列向上 +1）
          dir: c % 2 === 0 ? -1 : 1
        })
      }

      requestAnimationFrame(() => {
        if (isDestroyed) return
        columns.forEach(col => {
          if (col.setA) {
            col.halfHeight = col.setA.offsetHeight || 2000
          }
        })
      })
    }

    const createItemElement = (card, cardIdx, isSetA, colCount) => {
      const item = document.createElement('div')
      item.className = 'cl-home-tilt-item'

      const ratio = card.aspectRatio || 1.333
      item.style.aspectRatio = String(ratio)

      const img = document.createElement('img')
      img.alt = card.title || 'Circle of Life'
      img.decoding = 'async'
      img.draggable = false
      img.dataset.src = card.src

      const isCritical = isSetA && cardIdx < Math.max(2, colCount)
      if (isCritical) {
        img.dataset.critical = 'true'
        img.src = card.src
        img.setAttribute('fetchpriority', 'high')
        if (typeof img.decode === 'function') {
          img.decode().then(() => {
            if (!isDestroyed) img.classList.add('is-loaded')
          }).catch(() => {
            if (!isDestroyed) img.classList.add('is-loaded')
          })
        } else {
          img.onload = () => {
            if (!isDestroyed) img.classList.add('is-loaded')
          }
        }
      }

      memoryLifecycleObserver.observe(img)
      item.appendChild(img)
      return item
    }

    const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const isReducedMotion = () => Boolean(motionQuery && motionQuery.matches)

    // 核心物理渲染循环
    const render = () => {
      if (isDestroyed || !isVisible || isExited || isReducedMotion()) return

      // 平滑缓动插值追赶目标滚动进度
      currentProgress += (targetProgress - currentProgress) * 0.12
      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress
      }

      idleOffset += IDLE_SPEED

      // 更新倾斜画布的横向与纵向视差平移
      applyRotatedTransform()

      // 更新各列的交错流动位移
      columns.forEach(col => {
        if (!col.track) return
        const h = col.halfHeight || 2000
        const scrollDisplacement = col.dir * (currentProgress * TRAVEL_DISTANCE)
        const totalDisplacement = (idleOffset * col.dir + scrollDisplacement) % h
        const normalizedY = totalDisplacement < 0 ? totalDisplacement + h : totalDisplacement

        col.track.style.transform = `translate3d(0, ${(-normalizedY).toFixed(1)}px, 0)`
      })

      rafId = requestAnimationFrame(render)
    }

    // 滚动监听器：严格限定作用范围，脱离首屏轨道彻底切断 (零布局抖动，零强制重排)
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0

      // 1. 完全滚入首屏下方（用户在浏览文章列表或页脚）：彻底冻结终态，不产生任何动作
      if (scrollY >= cachedBottomLimit) {
        if (!isExited) {
          isExited = true
          targetProgress = 1
          currentProgress = 1
          applyRotatedTransform()
          if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
          }
        }
        return
      }

      // 2. 位于首屏上方（罕见负滚动）：重置归零
      if (scrollY <= 0) {
        targetProgress = 0
        currentProgress = 0
        applyRotatedTransform()
        return
      }

      // 3. 重新进入首屏区间：恢复活动态与 RAF
      if (isExited) {
        isExited = false
        if (!rafId && !isDestroyed && isVisible) {
          rafId = requestAnimationFrame(render)
        }
      }

      // 计算首屏粘性轨道内的滚动比例 [0, 1]（纯数学计算，零 DOM 重排）
      targetProgress = Math.min(1, Math.max(0, scrollY / cachedScrollMax))
    }

    // 视口观察器
    const viewObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        const visible = Boolean(entry && entry.isIntersecting)
        isVisible = visible

        if (!visible) {
          if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
          }
        } else if (visible && !rafId && !isDestroyed && !isExited) {
          rafId = requestAnimationFrame(render)
        }
      },
      { threshold: 0 }
    )

    const onResize = () => {
      updateScale()
      buildColumns()
      onScroll()
    }

    updateScale()
    buildColumns()
    viewObserver.observe(trackWrapper)
    onScroll()
    rafId = requestAnimationFrame(render)

    const onMotionChange = () => {
      if (isReducedMotion()) {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
      } else if (isVisible && !rafId && !isDestroyed && !isExited) {
        rafId = requestAnimationFrame(render)
      }
    }
    motionQuery?.addEventListener?.('change', onMotionChange)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      isDestroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      viewObserver.disconnect()
      memoryLifecycleObserver.disconnect()
      motionQuery?.removeEventListener?.('change', onMotionChange)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [displayCards])

  return (
    <div ref={trackWrapperRef} className='cl-home-tilt-track-wrapper'>
      {/* 粘性吸顶视窗：在 220vh 行程内牢牢吸附在屏幕，提供充沛的滚轮交错视差流光体验 */}
      <section
        ref={containerRef}
        className='cl-home-tilt-sticky cl-home-tilt-section select-none bg-[var(--cl-bg)]'>
        {/* 8° 倾斜并随滚轮产生横向/垂直对角线位移的无限照片瀑布流母画卷 */}
        <div
          ref={rotatedRef}
          className='cl-home-tilt-rotated'
          aria-hidden='true'
        />

        {/* 顶部与底部微弱过渡渐变遮罩 */}
        <div className='cl-home-tilt-fade-top pointer-events-none absolute inset-x-0 top-0 h-28 z-10' />
        <div className='cl-home-tilt-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-36 z-10' />
      </section>
    </div>
  )
}
