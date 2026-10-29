'use client'

import { useEffect, useRef } from 'react'
import { shouldWallOwnWheel } from './wheelOwnership'
import { resolveHeroCopy } from './heroCopy'

/**
 * 影集无限瀑布流展墙 (AlbumInfiniteWall)
 * 复用 About 页的高性能 RAF 渲染循环、Lerp 物理惯性、视差差速、双向显存生命周期与题注动效
 * 针对影集特化：有限照片集、首尾物理回弹边界、画廊 Hero 序言幕布、点击照片全屏灯箱
 */
export default function AlbumInfiniteWall({
  photos = [],
  albumName = '',
  albumSummary = '',
  albumDescription = '',
  albumDate = '',
  onBackToShelf,
  onPhotoClick,
  isPaused = false,
  onScrollChange
}) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const backdropRef = useRef(null)
  const heroOverlayRef = useRef(null)
  const prologueBtnRef = useRef(null)
  const endMarkerRef = useRef(null)
  const closeHeroRef = useRef(null)
  const openHeroRef = useRef(null)
  const toggleHeroRef = useRef(null)
  const isPausedRef = useRef(isPaused)

  const onPhotoClickRef = useRef(onPhotoClick)
  onPhotoClickRef.current = onPhotoClick
  const onBackToShelfRef = useRef(onBackToShelf)
  onBackToShelfRef.current = onBackToShelf
  const onScrollChangeRef = useRef(onScrollChange)
  onScrollChangeRef.current = onScrollChange

  isPausedRef.current = isPaused

  const { headline: finalSummary, lead: heroLead } = resolveHeroCopy({
    summary: albumSummary || albumName,
    description: albumDescription,
    fallbackSummary: `捕捉光影、定格日常与独立视觉叙事 · 共 ${photos.length} 张照片。`
  })
  const showAlbumNameInBadge =
    albumName && finalSummary.trim() !== albumName.trim()

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current || container
    if (!container || !stage) return

    let isDestroyed = false
    let rafId = null

    // 锁定视口，防止移动端与 Safari 橡皮筋穿透
    document.documentElement.classList.add('cl-about-locked')
    document.body.classList.add('cl-about-locked')

    let winW = window.innerWidth
    let winH = window.innerHeight

    // 垂直滚动物理量
    const scroll = {
      ease: 0.08,
      current: 0,
      target: 0,
      last: 0,
      delta: { c: 0, t: 0 }
    }

    let ambientDrift = 0
    let isHeroOpen = true // 默认呈现 Hero 序言画布
    let maxScroll = 0
    let lastScrolledState = false

    // 初始展开序言幕布与高亮胶囊按钮
    heroOverlayRef.current?.classList.remove('is-closed')
    heroOverlayRef.current?.setAttribute('aria-hidden', 'false')
    backdropRef.current?.classList.remove('is-closed')
    backdropRef.current?.setAttribute('aria-hidden', 'false')
    prologueBtnRef.current?.classList.add('is-active')
    prologueBtnRef.current?.setAttribute('aria-expanded', 'true')

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

    // 题注滑入揭示观察器 (100% 还原 SplitText 动效)
    const captionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('visible', entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    // 优雅图片懒加载观察器：滑入即触发高清预载，加载后永久保持，杜绝滚动误卸载
    const memoryLifecycleObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const img = entry.target
          if (entry.isIntersecting) {
            const src = img.dataset.src
            if (src && img.getAttribute('src') !== src) {
              img.src = src
              const onLazyLoaded = () => {
                if (!isDestroyed) {
                  img.classList.add('is-loaded')
                  if (img.naturalWidth && img.naturalHeight && img.parentElement) {
                    img.parentElement.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
                  }
                  updateBounds()
                }
              }

              if (typeof img.decode === 'function') {
                img
                  .decode()
                  .then(onLazyLoaded)
                  .catch(onLazyLoaded)
              } else {
                img.onload = onLazyLoaded
              }
            }
            memoryLifecycleObserver.unobserve(img)
          }
        })
      },
      { rootMargin: '800px 0px 800px 0px' }
    )

    let colData = []
    let wallResizeObserver = null
    let wallElRef = null

    // 测量所有列高与计算最大滚动边界（建立在所有列实际渲染高度之上的安全界限）
    const updateBounds = () => {
      let maxColHeight = 0
      colData.forEach(cd => {
        if (cd.track) {
          const h = cd.track.offsetHeight || 1200
          cd.height = h
          if (h > maxColHeight) maxColHeight = h
        }
      })

      winH = window.innerHeight
      // 安全结束界限：严格保留 140px 纯净留白，坚决杜绝与任何一列照片重叠。
      // 留白要从照片实际起点算起，而照片起点是 CSS 里由导航带推导的 top，
      // 故必须叠加 wallEl.offsetTop（否则刘海机上边界会直接压进末排照片）
      const wallTop = wallElRef?.offsetTop || 0
      const safeEndTop = wallTop + maxColHeight + 140
      maxScroll = Math.max(0, safeEndTop - winH + 280)

      if (endMarkerRef.current) {
        endMarkerRef.current.style.top = `${safeEndTop}px`
      }
    }

    // 构建单张照片卡片 DOM
    const createCardElement = (photo, photoIndex, isCritical) => {
      const el = document.createElement('div')
      el.className = 'cl-about-item item cl-album-item cl-clickable-target'
      el.dataset.photoIndex = String(photoIndex)
      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      const photoLabel =
        photo.title || photo.caption || `${albumName || '影集'}照片 ${photoIndex + 1}`
      el.setAttribute('aria-label', `查看照片：${photoLabel}`)
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!isHeroOpen && onPhotoClickRef.current) {
            onPhotoClickRef.current(photoIndex)
          }
        }
      })

      const wrapper = document.createElement('div')
      wrapper.className = 'item-wrapper'
      el.appendChild(wrapper)

      const itemImage = document.createElement('div')
      itemImage.className = 'item-image'
      const ratio = photo.aspectRatio || 1.333
      itemImage.style.aspectRatio = String(ratio)
      wrapper.appendChild(itemImage)

      const img = document.createElement('img')
      img.alt = photo.title || photo.caption || albumName || '照片'
      img.decoding = 'async'
      img.draggable = false
      const photoSrc = photo.url || photo.cover || ''
      img.dataset.src = photoSrc

      const onLoaded = () => {
        if (!isDestroyed) {
          img.classList.add('is-loaded')
          if (img.naturalWidth && img.naturalHeight) {
            itemImage.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
          }
          updateBounds()
        }
      }

      if (isCritical) {
        img.dataset.critical = 'true'
        img.src = photoSrc
        img.setAttribute('fetchpriority', 'high')
        if (typeof img.decode === 'function') {
          img
            .decode()
            .then(onLoaded)
            .catch(onLoaded)
        } else {
          img.onload = onLoaded
        }
      }

      memoryLifecycleObserver.observe(img)
      itemImage.appendChild(img)

      // 题注：严格遵循「有注释显示注释，无注释不显示任何文字」，完美支持多行 Split 揭示
      const rawCaption = (photo.caption || '').trim()
      if (rawCaption) {
        const caption = document.createElement('small')
        caption.className = 'cl-about-caption'
        const lines = rawCaption.includes('\n')
          ? rawCaption.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
          : [rawCaption]

        lines.forEach((lineText, lineIdx) => {
          const mask = document.createElement('span')
          mask.className = 'line-mask'
          const line = document.createElement('span')
          line.className = `line ${lineIdx === 0 ? 'caption-title' : ''}`
          line.textContent = lineText
          mask.appendChild(line)
          caption.appendChild(mask)
        })

        wrapper.appendChild(caption)
        captionObserver.observe(caption)
      }

      return el
    }

    const calculateLayout = () => {
      winW = window.innerWidth
      winH = window.innerHeight
      const mobileMode = winW < 768

      // PC 端控制最多只显示 2-3 列，手机端固定 2 列，更加专注大画幅视觉
      let cols = 3
      if (mobileMode) {
        cols = 2
      } else if (winW < 1280) {
        cols = 2
      } else {
        cols = 3
      }

      const wallPadding = mobileMode ? 24 : winW < 1440 ? 40 : 64
      const gapTotal = mobileMode
        ? 14 * (cols - 1)
        : winW < 1440
          ? 24 * (cols - 1)
          : 32 * (cols - 1)
      const availableW = winW - wallPadding - gapTotal
      const colW = Math.max(140, Math.floor(availableW / cols))

      captionObserver.disconnect()
      memoryLifecycleObserver.disconnect()
      container.innerHTML = ''
      colData = []

      // 瀑布展墙容器
      const wallEl = document.createElement('div')
      wallEl.className = 'cl-about-masonry-wall cl-album-masonry-wall'
      container.appendChild(wallEl)
      wallElRef = wallEl

      if (typeof ResizeObserver !== 'undefined') {
        wallResizeObserver?.disconnect()
        wallResizeObserver = new ResizeObserver(() => {
          if (!isDestroyed) {
            updateBounds()
          }
        })
        wallResizeObserver.observe(wallEl)
      }

      // 智能瀑布流分列算法 (Shortest Column First)：
      // 依据真实宽高比估算累计高度，将照片自动加入当前最矮列，杜绝左右列断层与空白
      const colCards = Array.from({ length: cols }, () => [])
      const colHeights = Array.from({ length: cols }, () => 0)

      photos.forEach((photo, idx) => {
        let shortestCol = 0
        for (let c = 1; c < cols; c++) {
          if (colHeights[c] < colHeights[shortestCol]) {
            shortestCol = c
          }
        }
        colCards[shortestCol].push({ photo, originalIndex: idx })
        const ratio = Number(photo.aspectRatio) || 1.333
        colHeights[shortestCol] += 1 / ratio
      })

      for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement('div')
        colDiv.className = 'cl-about-column cl-album-column'
        colDiv.style.width = `${colW}px`

        const track = document.createElement('div')
        track.className = 'cl-about-col-track cl-album-col-track'
        colDiv.appendChild(track)

        const setA = document.createElement('div')
        setA.className = 'cl-about-col-set cl-album-col-set'

        colCards[c].forEach(({ photo, originalIndex }, cardIdx) => {
          const isCritical = cardIdx < Math.max(2, Math.ceil(cols / 2))
          const cardEl = createCardElement(photo, originalIndex, isCritical)
          setA.appendChild(cardEl)
        })

        track.appendChild(setA)
        wallEl.appendChild(colDiv)

        colData.push({
          colDiv,
          track,
          speed: 1.0 + (c % 2 === 1 ? 0.03 : 0), // 奇偶列微妙视差差速
          height: 1200
        })
      }

      // 底部完结标记（设立独立界限，居于所有照片下方安全留白区）
      const endEl = document.createElement('div')
      endEl.className = 'cl-album-wall-end'
      endEl.innerHTML = `
        <div class="cl-album-end-boundary">
          <span class="cl-album-end-line"></span>
          <span class="cl-album-end-dot"></span>
          <span class="cl-album-end-line"></span>
        </div>
        <p class="cl-album-end-count">— 全卷完 · 共 ${photos.length} 张照片 · ${albumName || '影集'} —</p>
        <button type="button" class="cl-album-end-back-btn" aria-label="返回全部影集">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>返回影集总览</span>
        </button>
      `
      const backBtn = endEl.querySelector('.cl-album-end-back-btn')
      backBtn?.addEventListener('click', e => {
        e.stopPropagation()
        onBackToShelfRef.current?.()
      })

      container.appendChild(endEl)
      endMarkerRef.current = endEl

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
      heroOverlayRef.current?.setAttribute('aria-hidden', 'true')
      backdropRef.current?.classList.add('is-closed')
      backdropRef.current?.setAttribute('aria-hidden', 'true')
      prologueBtnRef.current?.classList.remove('is-active')
      prologueBtnRef.current?.setAttribute('aria-expanded', 'false')
    }

    // 唤出序言幕布（原位缓缓降落，保留当前滚动位移，恢复呼吸流动）
    const openHero = () => {
      if (isHeroOpen) return
      isHeroOpen = true
      ambientDrift = 0

      heroOverlayRef.current?.classList.remove('is-closed')
      heroOverlayRef.current?.setAttribute('aria-hidden', 'false')
      backdropRef.current?.classList.remove('is-closed')
      backdropRef.current?.setAttribute('aria-hidden', 'false')
      prologueBtnRef.current?.classList.add('is-active')
      prologueBtnRef.current?.setAttribute('aria-expanded', 'true')
    }

    const toggleHero = () => {
      if (isHeroOpen) {
        closeHero()
      } else {
        openHero()
      }
    }

    closeHeroRef.current = closeHero
    openHeroRef.current = openHero
    toggleHeroRef.current = toggleHero

    // GPU 渲染循环 (RAF)
    const render = () => {
      if (isDestroyed) return
      // 当全屏灯箱打开时，冻结物理渲染与位移，杜绝后台滑动
      if (isPausedRef.current) {
        rafId = requestAnimationFrame(render)
        return
      }

      // 处于序言态时，背景照片墙缓慢静谧流动 (0.35px/帧，遵守用户的减弱动态效果偏好)
      if (isHeroOpen && !isDragging) {
        const prefersReduced =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (!prefersReduced) {
          ambientDrift += 0.35
        }
      }

      if (!isDragging) {
        // 释放后物理弹性回弹边界处理
        if (scroll.target < 0) {
          scroll.target += (0 - scroll.target) * 0.12
        } else if (scroll.target > maxScroll) {
          scroll.target += (maxScroll - scroll.target) * 0.12
        }
      }

      // 平滑插值 (Lerp)
      scroll.current += (scroll.target - scroll.current) * scroll.ease
      scroll.delta.t = scroll.current - scroll.last
      scroll.delta.c += (scroll.delta.t - scroll.delta.c) * 0.06

      const streamY = scroll.current + ambientDrift

      for (let c = 0; c < colData.length; c++) {
        const cd = colData[c]
        const colScroll = streamY * cd.speed
        cd.track.style.transform = `translate3d(0, ${(-colScroll).toFixed(1)}px, 0)`
      }

      if (endMarkerRef.current) {
        endMarkerRef.current.style.transform = `translate3d(0, ${(-streamY).toFixed(1)}px, 0)`
      }

      // 联动全站顶部导航栏 Header 收缩/复原
      if (typeof window !== 'undefined') {
        const nextY = Math.max(0, scroll.current)
        if (Math.abs((window.__CL_ABOUT_SCROLL_Y__ || 0) - nextY) > 2) {
          window.__CL_ABOUT_SCROLL_Y__ = nextY
          window.dispatchEvent(new Event('cl-virtual-scroll'))
        }
      }

      const isScrolled = scroll.current > 30
      if (isScrolled !== lastScrolledState) {
        lastScrolledState = isScrolled
        onScrollChangeRef.current?.(isScrolled)
        prologueBtnRef.current?.classList.toggle('is-scrolled', isScrolled)
      }

      scroll.last = scroll.current
      rafId = requestAnimationFrame(render)
    }

    // 事件处理：PointerEvents
    const onPointerDown = e => {
      if (
        e.target &&
        e.target.closest &&
        (e.target.closest('.cl-about-prologue-btn') ||
          e.target.closest('.cl-album-prologue-top-btn') ||
          e.target.closest('.cl-album-prologue-center-btn') ||
          e.target.closest('.cl-album-deck-nav-root') ||
          e.target.closest('.cl-album-deck-nav-btn') ||
          e.target.closest('.cl-album-deck-popover') ||
          e.target.closest('.cl-album-end-back-btn'))
      ) {
        return
      }
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

      const dy = drag.startY - e.clientY
      let nextTarget = drag.scrollY + dy

      // 拖拽触界时的橡皮筋阻尼衰减
      if (nextTarget < 0) {
        nextTarget = nextTarget * 0.35
      } else if (nextTarget > maxScroll) {
        const overflow = nextTarget - maxScroll
        nextTarget = maxScroll + overflow * 0.35
      }

      scroll.target = nextTarget

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

      // 序言上手滑手势关闭
      if (isHeroOpen && drag.startY - e.clientY > 36) {
        closeHero()
      }

      // 卡片点击判定（无明显位移判定为点击照片查看灯箱）
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY)
      if (dist < 8) {
        // 彻底清空所有速度与目标，杜绝微小抖动引发的滑行
        velocity.y = 0
        scroll.target = scroll.current
        if (!isHeroOpen) {
          const elAtPoint = document.elementFromPoint(e.clientX, e.clientY)
          const item =
            elAtPoint?.closest?.('.cl-album-item') ||
            e.target?.closest?.('.cl-album-item')
          if (item && item.dataset.photoIndex != null) {
            const idx = parseInt(item.dataset.photoIndex, 10)
            if (!isNaN(idx) && onPhotoClickRef.current) {
              onPhotoClickRef.current(idx)
            }
          }
        }
        return // 点击照片直接返回，严禁继续执行后续惯性滑行计算！
      }

      // 惯性滑行 + 软边界限制
      const vy = Math.max(-2.5, Math.min(2.5, velocity.y))
      let inertiaTarget = scroll.target + vy * 180

      if (inertiaTarget < -80) inertiaTarget = -80
      if (inertiaTarget > maxScroll + 80) inertiaTarget = maxScroll + 80

      scroll.target = inertiaTarget
    }

    const onWheel = e => {
      // 灯箱开启时展墙不接管滚轮，避免关闭后照片墙跳位
      if (isPausedRef.current) return

      // 指针落在浮层内的原生滚动容器（影集目录 / 顶栏全屏菜单 / 搜索结果）时，
      // 交还浏览器原生滚动，展墙不得吞掉滚轮
      if (!shouldWallOwnWheel(e.target, stage)) return

      e.preventDefault()

      if (isHeroOpen) {
        if (e.deltaY > 12) {
          closeHero()
        }
        return
      }

      const delta = e.deltaY * (e.deltaMode === 1 ? 24 : 1)
      let nextTarget = scroll.target + delta * 0.85

      // 限制滚轮超界最大量
      if (nextTarget < -100) nextTarget = -100
      if (nextTarget > maxScroll + 100) nextTarget = maxScroll + 100

      scroll.target = nextTarget
    }

    const onResize = () => {
      calculateLayout()
    }

    calculateLayout()
    rafId = requestAnimationFrame(render)

    const onKeyDown = e => {
      if (e.key === 'Escape' && isHeroOpen) {
        e.preventDefault()
        closeHero()
      }
    }

    stage.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      isDestroyed = true
      document.documentElement.classList.remove('cl-about-locked')
      document.body.classList.remove('cl-about-locked')
      if (rafId) cancelAnimationFrame(rafId)
      captionObserver.disconnect()
      memoryLifecycleObserver.disconnect()
      wallResizeObserver?.disconnect()
      stage.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      closeHeroRef.current = null
      openHeroRef.current = null
      toggleHeroRef.current = null
      delete window.__CL_ABOUT_SCROLLED__
      delete window.__CL_ABOUT_SCROLL_Y__
      window.dispatchEvent(new Event('cl-virtual-scroll'))
      document.body.classList.remove('cursor-grabbing')
    }
  }, [photos, albumName, albumSummary])

  const handleCloseHero = e => {
    e?.stopPropagation()
    e?.preventDefault()
    closeHeroRef.current?.()
  }

  const handleToggleHero = e => {
    e?.stopPropagation()
    e?.preventDefault()
    toggleHeroRef.current?.()
  }

  return (
    <div
      ref={stageRef}
      className='cl-about-stage cl-album-stage relative h-screen h-[100dvh] w-full overflow-hidden select-none bg-[var(--cl-bg)]'>
      {/* 瀑布展墙画布 */}
      <div
        ref={containerRef}
        id='cl-about-canvas'
        className='cl-album-canvas absolute inset-0 h-full w-full cursor-grab overflow-hidden touch-none'
      />

      {/* Hero 序言毛玻璃与暗膜滤镜过渡层 */}
      <button
        ref={backdropRef}
        type='button'
        tabIndex={-1}
        onClick={handleCloseHero}
        aria-label='收起影集简介'
        className='cl-about-hero-backdrop cl-album-hero-backdrop'
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      />

      {/* Hero 序言杂志排版覆盖层 */}
      <div
        ref={heroOverlayRef}
        id='cl-about-hero-overlay'
        className='cl-about-hero-overlay cl-album-hero-overlay'>
        <div className='cl-about-hero-inner'>
          <div className='cl-about-hero-badge'>
            <span className='cl-about-hero-badge-dot' aria-hidden='true' />
            <span>
              {showAlbumNameInBadge ? `影集 · ${albumName}` : '影集'}
            </span>
          </div>

          <h1 className='cl-about-hero-summary'>{finalSummary}</h1>

          {heroLead && <p className='cl-about-hero-lead'>{heroLead}</p>}

          <div className='cl-album-hero-meta'>
            <span>共 {photos.length} 张照片</span>
            {albumDate && <span> · {albumDate}</span>}
          </div>

          <button
            type='button'
            onClick={handleCloseHero}
            className='cl-about-hero-hint-text'
            aria-label='进入画廊浏览'>
            <span>进入画廊浏览</span>
            <svg
              className='cl-about-hero-hint-arrow'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'>
              <polyline points='6 9 12 15 18 9' />
            </svg>
          </button>
        </div>
      </div>

      {/* 顶部居中当前影集胶囊按钮（始终可见可点击，自由展开/收起序言） */}
      <button
        ref={prologueBtnRef}
        type='button'
        onClick={handleToggleHero}
        className='cl-album-prologue-top-btn'
        aria-expanded='true'
        aria-controls='cl-about-hero-overlay'
        aria-label={`展开或收起《${albumName || '影集'}》简介`}
        title={`展开或收起《${albumName || '影集'}》简介`}>
        <span className='cl-album-prologue-dot' aria-hidden='true' />
        <span className='cl-album-prologue-title'>{albumName || '影集简介'}</span>
      </button>
    </div>
  )
}
