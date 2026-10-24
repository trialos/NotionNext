'use client'

import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useMemo } from 'react'
import CONFIG from '../config'
import { buildImageSources, buildSizedSource, computeTargetPixelWidth } from './imageSrcset'
import { loadIntoCanvas, releaseCanvas } from './CanvasImage'
import {
  computeTiltProgress,
  computeTiltTravel,
  EASE_TAU_DESKTOP,
  EASE_TAU_NARROW,
  easeTiltProgress
} from './tiltProgress'
import { buildColumnBuckets, computeSlotsPerColumn } from './tiltLayout'

/**
 * 题字呼吸参数（滚动位移的三档系数不在此声明：它们由 CSS 的
 * --cl-wall-flow 表达式分别乘 0.62 / 0.5 / 0.38 承担，此处不重复一份）
 */
/** 呼吸幅度（px）：题字随照片墙的常驻呼吸轻微起伏 */
const WALL_TITLE_BREATH_PX = 7
/** 呼吸三角波的周期（以 idleOffset 的像素漂移量计）：越大摆动越慢 */
const WALL_TITLE_BREATH_PERIOD = 220
/** 墙尾淡出起点（进度）：越过就开始淡 */
const WALL_TITLE_FADE_START = 0.66
/** 墙尾淡出终点（进度）：到此彻底隐去（墙底越过题字基线之前） */
const WALL_TITLE_FADE_END = 0.88

/**
 * 只在值真的变了时才写自定义属性。
 * 静止时呼吸与位移几乎不变，省掉每帧的样式失效与重算。
 */
const setVarIfChanged = (el, name, value) => {
  if (!el) return
  if (el.style.getPropertyValue(name) === value) return
  el.style.setProperty(name, value)
}

/**
 * 首页全屏倾斜交错流光照片墙 (HomeTiltWall) - 多轴联动与严苛边界控制版
 * 1. 顺时针倾斜 8°（走向严格对齐 "\"）
 * 2. 微视差：位移 = 区块高 × 0.12（对齐参考站 moment.priority.vision 实测值）
 * 3. 严格边界脱离保护：一旦完全滚出首屏区块（rect.bottom <= 0），立即彻底冻结终态，停止 RAF 计算与事件响应
 * 4. 整屏区块随页面滚走（不 sticky）：去掉粘连子树后 iOS 合成压力最小
 * 5. 遵照 Vercel 规范：支持 prefers-reduced-motion，首屏图片异步解码防爆显存
 * 6. 无图源时整块不渲染（不再用示例图冒充博主作品）
 * 7. 题字（--cl-wall-*）：与照片墙同源的漂移与呼吸，唯一写入者是本组件既有的 RAF 循环
 */
export default function HomeTiltWall({
  homeCoverImages = [],
  showWallTitle = true,
  titleZh = '与我同行',
  titleEn = 'WITH CIRCLE OF LIFE'
}) {
  const trackWrapperRef = useRef(null)
  const containerRef = useRef(null)
  const panRef = useRef(null)
  const rotatedRef = useRef(null)
  const titleRef = useRef(null)

  // 严格只读取用户指定的 HomeCover 页面图片；不向一般影集回退
  const displayCards = useMemo(() => {
    if (!Array.isArray(homeCoverImages)) return []
    return homeCoverImages
      .filter(im => im && (typeof im === 'string' || im.src || im.url))
      .map((im, idx) => {
        const aspectRatio =
          (typeof im === 'string' ? 0 : im.aspectRatio) ||
          (idx % 3 === 0 ? 0.8 : idx % 2 === 0 ? 1.333 : 1.0)

        // 数据层已给出候选集；纯字符串入参时在此兜底派生，保证档位一致
        if (typeof im === 'string') {
          const sources = buildImageSources(im)
          return {
            id: `hc-${idx}`,
            src: sources.src,
            srcSet: sources.srcSet,
            sizes: sources.sizes,
            aspectRatio,
            title: ''
          }
        }

        return {
          id: im.id || `hc-${idx}`,
          src: im.src || im.url,
          srcSet: im.srcSet || '',
          sizes: im.sizes || '',
          aspectRatio,
          title: im.title || ''
        }
      })
  }, [homeCoverImages])

  useEffect(() => {
    const trackWrapper = trackWrapperRef.current
    const container = containerRef.current
    const panLayer = panRef.current
    const rotated = rotatedRef.current
    if (!trackWrapper || !container || !panLayer || !rotated) return
    if (!displayCards.length) return

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
    const IDLE_SPEED = 0.12 // 舒缓呼吸速度（呼吸节奏保持不变）

    // 列位移按「行程 × 比例」派生，区块高度变化时手感保持一致
    let cachedSpan = 1
    let cachedTravel = 0
    let easeTau = EASE_TAU_DESKTOP

    let maxPanX = 120
    let maxPanY = 90
    // 轨道在文档中的绝对顶部（不是 0：上方可能有公告、刊头等占位）
    let cachedTop = 0
    let cachedWallHeight = 0
    let cachedBottomLimit = 2000
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0
    let resizeTimer = null
    let scrollCount = 0
    let flowingTimer = null

    const updateGeometry = () => {
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
      maxPanX = winW < 640 ? 60 : winW < 1024 ? 90 : 130
      maxPanY = winW < 640 ? 40 : winW < 1024 ? 65 : 100
      easeTau = winW < 1024 ? EASE_TAU_NARROW : EASE_TAU_DESKTOP

      if (trackWrapper) {
        const rect = trackWrapper.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset || 0
        const h = trackWrapper.offsetHeight
        cachedTop = rect.top + scrollY
        cachedWallHeight = h
        cachedBottomLimit = cachedTop + h
        // 整屏区块随页面滚走：行程就是区块自身高度（不再减去视口）
        cachedSpan = Math.max(1, h)
        cachedTravel = computeTiltTravel(cachedSpan)
      }
    }

    // 相对轨道自身的滚动进度：分子必须减去 cachedTop，否则动画会整体超前
    const computeProgress = scrollY =>
      computeTiltProgress({
        scrollY,
        top: cachedTop,
        wallHeight: cachedWallHeight,
        viewportHeight: window.innerHeight,
        pinned: false
      })

    // 每帧只翻译 pan 层（视口大小、成本低）；
    // rotate/scale 由 CSS 变量静态承载，不再每帧重写大图层的整段变换串
    const applyPanTransform = () => {
      // 随滚动进行对角线与横向平移，平滑将两侧及后续列带入中心视野
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
      // 移动端初始微调，避免绝对居中遮蔽，保证首屏两侧列均有明显露出，下拉时整网格横移展开
      const initialShiftX = winW < 640 ? -18 : 0
      const panX = initialShiftX + (currentProgress - 0.5) * -maxPanX
      const panY = (currentProgress - 0.5) * -maxPanY
      if (panLayer) {
        panLayer.style.transform = `translate(${panX.toFixed(1)}px, ${panY.toFixed(1)}px)`
      }
    }

    // 题字：与照片墙同源的漂移与呼吸。
    // 只写 3 个 CSS 变量（common / flow / alpha），各行的位移系数由 CSS 承担；
    // 子树仅数个节点，样式重算代价可忽略。
    const applyTitleMotion = () => {
      const title = titleRef.current
      if (!title) return

      // 画布漂移（与 pan 层同源）+ 呼吸（三角波，避免锯齿回卷造成的跳变）
      const panY = (currentProgress - 0.5) * -maxPanY
      const phase =
        (idleOffset % WALL_TITLE_BREATH_PERIOD) / WALL_TITLE_BREATH_PERIOD
      const breath = (1 - Math.abs(phase * 2 - 1)) * 2 - 1 // ∈ [-1, 1]
      const common = panY + breath * WALL_TITLE_BREATH_PX
      const flow = -currentProgress * cachedTravel

      // 墙尾淡出：墙底越过题字基线之前就已淡尽
      let alpha = 1
      if (currentProgress > WALL_TITLE_FADE_START) {
        const t = Math.min(
          1,
          (currentProgress - WALL_TITLE_FADE_START) /
            (WALL_TITLE_FADE_END - WALL_TITLE_FADE_START)
        )
        alpha = 1 - t * t * (3 - 2 * t) // smoothstep
      }

      setVarIfChanged(title, '--cl-wall-common', `${common.toFixed(1)}px`)
      setVarIfChanged(title, '--cl-wall-flow', `${flow.toFixed(1)}px`)
      setVarIfChanged(title, '--cl-wall-alpha', alpha.toFixed(3))
    }

    // 滚动期间临时提示浏览器提升图层；静止后移除，避免长期占用大纹理
    const markFlowing = () => {
      if (!container) return
      container.classList.add('is-flowing')
      if (flowingTimer) clearTimeout(flowingTimer)
      flowingTimer = setTimeout(() => {
        container.classList.remove('is-flowing')
        flowingTimer = null
      }, 150)
    }

    const updateScale = () => {
      const w = container.offsetWidth || window.innerWidth
      const h = container.offsetHeight || window.innerHeight
      const s = w * Math.cos(rad) + h * Math.sin(rad)
      const r = w * Math.sin(rad) + h * Math.cos(rad)
      const isMobile = (container.offsetWidth || window.innerWidth) < 640
      const scaleMultiplier = isMobile ? 1.06 : 1.15
      currentScale = Math.max(s / w, r / h) * scaleMultiplier
      // 静态 rotate+scale：只在尺寸变化时写一次 CSS 变量
      container.style.setProperty('--cl-tilt-scale', currentScale.toFixed(4))
      updateGeometry()
      applyPanTransform()
    }

    // —— 取图预算：错峰挂载 ——
    // 前 IMMEDIATE_COLUMNS 列立即挂载保证首屏不空窗，其余列按批摊到空闲时隙，
    // 避免一进页面就同时解码几十张大图（此前实测 31 张同时挂 src）
    const LOAD_BATCH = 6
    const IMMEDIATE_COLUMNS = 3
    /** 实测补足列内容高度时的最大追加次数，防止异常数据导致死循环 */
    const MAX_FILL_ATTEMPTS = 40
    const loadQueue = []
    let drainHandle = null
    let drainViaIdle = false
    let draining = false

    const markLoaded = img => {
      if (!isDestroyed) img.classList.add('is-loaded')
    }

    const decodeImage = img => {
      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(() => markLoaded(img))
          .catch(() => markLoaded(img))
      } else {
        img.onload = () => markLoaded(img)
      }
    }

    // 卡片分两种承载：
    // - **首屏那几张仍是 <img>**：它们是首屏最大的 LCP 候选，且正好对应页面级
    //   preload（fetchpriority=high）。保留 <img> 才能让 preload 精确命中，
    //   同时给整页一个「大候选」——之后滚来滚去，任何重新绘制的元素
    //   （题字、影集封面…）都比它小，换不掉它 → LCP 稳定在首屏。
    // - **其余卡片是 <canvas>**：canvas 的像素不进入 LCP 候选 → 照片墙深处
    //   那些更大的卡片不会把 LCP 顶到十几秒。裁剪由 drawCover 按
    //   object-fit:cover 完成（见 CanvasImage.js）。
    const mountImage = el => {
      if (isDestroyed) return
      const src = el.dataset.src
      if (!src || el.dataset.mounted === 'true') return
      el.dataset.mounted = 'true'
      if (el.tagName === 'CANVAS') {
        loadIntoCanvas(el, {
          src,
          targetPx: Number(el.dataset.targetpx) || undefined,
          position: 'center',
          onReady: () => markLoaded(el)
        })
        return
      }
      // ⚠️ 不用 srcset/sizes：Notion 代理在 srcset 选档路径下返回「预裁切小图」
      // （同一 URL 直连才是未裁切原图）→ 见 imageSrcset.js 的说明。
      // 档位在创建卡片时就按「列宽 × DPR」算好，写进了 src 的 width 参数。
      el.src = src
      decodeImage(el)
    }

    // 回收必须与挂载成对：
    // - <img>：删 src（浏览器才会真正丢弃解码纹理）
    // - <canvas>：断开观察器 + 位图置零（把 width 归 0）→ 浏览器立刻释放这块纹理，
    //   否则解码纹理留在显存里不走 → 离屏卡片会一直占着显存。
    const unloadImage = el => {
      if (el.dataset.critical === 'true') return
      el.dataset.mounted = 'false'
      if (el.tagName === 'CANVAS') {
        releaseCanvas(el)
      } else {
        if (el.hasAttribute('srcset')) el.removeAttribute('srcset')
        if (el.hasAttribute('sizes')) el.removeAttribute('sizes')
        if (el.hasAttribute('src')) el.removeAttribute('src')
      }
      el.classList.remove('is-loaded')
      const queued = loadQueue.indexOf(el)
      if (queued > -1) loadQueue.splice(queued, 1)
    }

    const drainQueue = () => {
      draining = false
      drainHandle = null
      if (isDestroyed) return
      loadQueue.splice(0, LOAD_BATCH).forEach(mountImage)
      if (loadQueue.length) scheduleDrain()
    }

    const scheduleDrain = () => {
      if (draining || isDestroyed) return
      draining = true
      drainViaIdle =
        typeof window !== 'undefined' &&
        typeof window.requestIdleCallback === 'function'
      drainHandle = drainViaIdle
        ? window.requestIdleCallback(drainQueue, { timeout: 400 })
        : setTimeout(drainQueue, 80)
    }

    const scheduleMount = img => {
      if (img.getAttribute('src') || loadQueue.includes(img)) return
      loadQueue.push(img)
      scheduleDrain()
    }

    // 显存生命周期观察器：入屏排队挂载，离屏成对卸载
    const memoryLifecycleObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const img = entry.target
          if (entry.isIntersecting) scheduleMount(img)
          else unloadImage(img)
        })
      },
      { rootMargin: '800px 0px 800px 0px' }
    )

    let columns = []
    /**
     * 卡片显示宽（= 列宽，.cl-home-tilt-item 是 width:100%）——
     * 取图档位按「列宽 × DPR」算。不在这里量 DOM：卡片创建时还没入列。
     */
    let cardCssWidth = 300

    // 依据视口宽度构建充裕的列数（移动端 3 列，桌面端 5 列，大屏 6 列），确保多轴视野饱满展开
    const buildColumns = () => {
      memoryLifecycleObserver.disconnect()
      rotated.innerHTML = ''
      columns = []

      const winW = window.innerWidth
      const winH = window.innerHeight
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

      // 列宽只能实测：CSS 是 clamp(220px, 20vw, 360px)，并在 1180 / 767 两个断点改写，
      // 用 JS 常量推断会偏。临时挂一个同 class 的探针，量完立刻移除（不能留在画布里，
      // 否则会多出一条空列参与 gap 与居中）
      const probe = document.createElement('div')
      probe.className = 'cl-home-tilt-col'
      probe.style.visibility = 'hidden'
      probe.style.pointerEvents = 'none'
      rotated.appendChild(probe)
      const colWidth = probe.offsetWidth || 300
      probe.remove()
      cardCssWidth = colWidth

      const colGap = winW <= 767 ? 12 : winW <= 1024 ? 18 : 24

      // 覆盖校验：画布旋转 8° 后，视口四角需要「列带」足够宽才不会被裁出空白。
      // 只按断点定列数时，手机上 3 列×132px 的带子比旋转后的视口外接框窄，左下/右下会露白。
      // 因此这里按外接框反算最少列数（列宽实测，不再猜）。
      // 窄屏列少（3~4 条），旋转后侧边最容易露白，余量给 1.25；
      // 宽屏列多，1.02 足够，多留反而无谓增加列数
      const coverageMargin = winW < 1024 ? 1.25 : 1.02
      const rotatedNeedWidth =
        (winW * Math.cos(rad) + winH * Math.sin(rad)) * coverageMargin
      const minColsForCoverage = Math.ceil(
        (rotatedNeedWidth + colGap) / (colWidth + colGap)
      )
      colCount = Math.min(8, Math.max(colCount, minColsForCoverage))
      const avgRatio =
        displayCards.reduce(
          (sum, card) => sum + (card.aspectRatio || 1.333),
          0
        ) / displayCards.length
      const itemHeight = colWidth / avgRatio + colGap

      const slots = computeSlotsPerColumn({
        viewportHeight: window.innerHeight,
        itemHeight,
        count: displayCards.length
      })

      // 连续分块 + 同行去撞：替代原先 idx % colCount 的跨列步进
      const colBuckets = buildColumnBuckets(displayCards, {
        colCount,
        slots
      })

      // 列内容高度下限的推导（曾经的露白根因）：
    // 轨道内容 = A + B = 2A，按 modulo 最多向上位移 A；
    // 旋转+居中后列顶还可能在视口上方 overhang 处，
    // 于是要求的 A ≥ 视口高 + overhang，否则向上位移后底部必然露白。
    const viewportH = window.innerHeight

    for (let c = 0; c < colCount; c++) {
        const bucket = colBuckets[c] || []
        const colDiv = document.createElement('div')
        colDiv.className = 'cl-home-tilt-col'
        // 必须先入 DOM：否则下面量 setA 高度恒为 0，补足逻辑会一路加到上限
        rotated.appendChild(colDiv)

        const track = document.createElement('div')
        track.className = 'cl-home-tilt-track'
        colDiv.appendChild(track)

        // Set A: 基础卡片集
        const setA = document.createElement('div')
        setA.className = 'cl-home-tilt-set cl-home-tilt-set-a'
        const used = bucket.slice()
        used.forEach((card, cIdx) => {
          const itemEl = createItemElement(card, cIdx, true, c)
          setA.appendChild(itemEl)
        })
        track.appendChild(setA)

        // 覆盖基准为「画布高度」：轨道内容 = 2A、最大向上位移 A，
        // 因此 A ≥ 画布高即可保证任何位移位置都不露白（画布已含旋转余量）
        const canvasHeight = rotated.clientHeight || viewportH * 2.6
        const needHeight = canvasHeight + 32

        // 注意单位：祖先有 rotate+scale，getBoundingClientRect() 返回的是「屏幕像素」，
        // 而 clientHeight / translateY 用的是「布局像素」。这里必须用 offsetHeight，
        // 否则判据会虚高（实测 1529 vs 1109），列还没铺满就停止追加，首屏底部露白
        let fillGuard = 0
        let measured = setA.offsetHeight
        while (
          measured > 0 &&
          bucket.length &&
          measured < needHeight &&
          fillGuard < MAX_FILL_ATTEMPTS
        ) {
          const card = bucket[fillGuard % bucket.length]
          setA.appendChild(createItemElement(card, used.length, true, c))
          used.push(card)
          fillGuard++
          measured = setA.offsetHeight
        }

        // 反向收敛：竖构图会把张数算多（重复更密），超出 1.35 倍需求就从尾部回收，
        // 但必须保证裁完仍高于 needHeight
        const trimFloor = needHeight * 1.35
        while (used.length > 2 && measured > trimFloor) {
          const avgItem = measured / used.length
          if (measured - avgItem < needHeight) break
          const last = setA.lastElementChild
          if (!last) break
          setA.removeChild(last)
          used.pop()
          measured = setA.offsetHeight
        }

        // Set B: 必须与 A 完全一致，才能无缝闭环
        const setB = document.createElement('div')
        setB.className = 'cl-home-tilt-set cl-home-tilt-set-b'
        used.forEach((card, cIdx) => {
          const itemEl = createItemElement(card, cIdx, false, c)
          setB.appendChild(itemEl)
        })
        track.appendChild(setB)

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
            // 必须用布局像素：translateY 也在布局像素空间，
            // 用 getBoundingClientRect() 会拿到被 rotate+scale 放大的值（实测偏差 38%），
            // 模数变大后回卷时刻错位，周期性露出空隙
            const h = col.setA.offsetHeight
            col.halfHeight = h > 1 ? h : 2000
          }
        })
      })
    }

    const createItemElement = (card, cardIdx, isSetA, colIndex) => {
      const item = document.createElement('div')
      item.className = 'cl-home-tilt-item'

      const ratio = card.aspectRatio || 1.333
      item.style.aspectRatio = String(ratio)

      // 首屏不空窗：前几列立即挂载且不回收
      const immediate = isSetA && colIndex < IMMEDIATE_COLUMNS

      // 首屏那几张用 <img>（大 LCP 候选 + 精确命中页面 preload），
      // 其余用 <canvas>（不进 LCP 候选）
      const el = document.createElement(immediate ? 'img' : 'canvas')
      if (immediate) {
        el.alt = card.title || 'Circle of Life'
        el.decoding = 'async'
        el.draggable = false
      } else {
        el.className = 'cl-home-tilt-canvas'
        el.setAttribute('role', 'img')
        el.setAttribute('aria-label', card.title || 'Circle of Life')
      }

      // 与页面 preload 对应的那一张（首图）：**必须用与 preload 完全相同的 URL**
      // → 保留 card.src 原样（它就是 preload 的 href），否则会白下载两份。
      const isPreloadTarget = isSetA && colIndex === 0 && cardIdx === 0
      // 其余卡片：按「列宽 × DPR」选 Notion 的 width 档位，直连取原图
      // （不走 srcset：Notion 代理在 srcset 路径下返回预裁切小图）
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      const targetPx = computeTargetPixelWidth(cardCssWidth, dpr)
      el.dataset.src = isPreloadTarget
        ? card.src
        : buildSizedSource(card.src, targetPx)
      el.dataset.targetpx = String(targetPx)

      if (immediate) {
        el.dataset.critical = 'true'
        // 只有与页面 preload 对应的那一张拿最高优先级，其余按默认排队
        // （必须在挂载**之前**设好：fetchPriority 在请求发出时读取）
        if (isPreloadTarget) {
          el.setAttribute('fetchpriority', 'high')
        }
        mountImage(el)
      }

      memoryLifecycleObserver.observe(el)
      item.appendChild(el)
      return item
    }

    const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const isReducedMotion = () => Boolean(motionQuery && motionQuery.matches)

    // 核心物理渲染循环
    // - 呼吸漂移按时间戳推进，与帧率解耦，降帧不会让漂移变慢
    // - 仅有呼吸漂移（进度已稳定）时降到 30fps，位移视觉无差别，主线程开销减半
    let frame = 0
    let lastTs = 0
    const render = ts => {
      if (isDestroyed || !isVisible || isExited || isReducedMotion()) return

      const now = typeof ts === 'number' ? ts : 0
      const dt = lastTs ? Math.min(64, Math.max(0, now - lastTs)) : 16.7
      lastTs = now
      frame++

      const progressing = currentProgress !== targetProgress

      // 平滑缓动插值追赶目标滚动进度
      if (progressing) {
        // dt 归一化：120Hz / 60Hz / 掉帧时的收敛时间一致
        currentProgress = easeTiltProgress(
          currentProgress,
          targetProgress,
          dt,
          easeTau
        )
      }

      idleOffset += IDLE_SPEED * (dt / 16.7)

      // 纯呼吸帧隔帧渲染（30fps）；滚动跟随时保持满帧，避免拖影
      if (progressing || frame % 2 === 0) {
        // 更新平移层（只翻 z 轴平移，rotate/scale 已静态化）
        applyPanTransform()

        // 更新题字（与画布同源的漂移与呼吸）
        applyTitleMotion()

        // 更新各列的交错流动位移
        columns.forEach(col => {
          if (!col.track) return
          const h = col.halfHeight || 2000
          const scrollDisplacement = col.dir * (currentProgress * cachedTravel)
          const totalDisplacement = (idleOffset * col.dir + scrollDisplacement) % h
          const normalizedY = totalDisplacement < 0 ? totalDisplacement + h : totalDisplacement

          // 2D translateY：与参考站一致，不强制生成 3D 图层
          col.track.style.transform = `translateY(${(-normalizedY).toFixed(1)}px)`
        })
      }

      rafId = requestAnimationFrame(render)
    }

    // 滚动监听器：严格限定作用范围，脱离首屏轨道彻底切断 (零布局抖动，零强制重排)
    const onScroll = () => {
      scrollCount++
      // 首次交互时兜底再校正一次几何：挂载初期布局可能仍在收敛，
      // 若用户此时就开始滑动，用旧基准会整段偏移
      if (scrollCount <= 3) updateGeometry()
      const scrollY = window.scrollY || window.pageYOffset || 0

      // 滚动期间才提示浏览器提升图层，停手 150ms 后归还
      if (scrollY > cachedTop && scrollY < cachedBottomLimit) markFlowing()

      // 1. 完全滚入首屏下方（用户在浏览文章列表或页脚）：彻底冻结终态，不产生任何动作。
      //    已冻结过就直接返回，保证文章区滚动时这里零成本
      if (scrollY >= cachedBottomLimit) {
        if (!isExited) {
          isExited = true
          targetProgress = 1
          currentProgress = 1
          applyPanTransform()
          // 题字也要落到「淡出」终态：只更新平移层的话，--cl-wall-alpha 会冻结在
          // 上一个值（多半是 1 = 满透明）→ 题字以 fixed 浮层盖在当前内容上。
          applyTitleMotion()
          if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
          }
        }
        if (container?.classList.contains('is-flowing')) {
          container.classList.remove('is-flowing')
        }
        if (flowingTimer) {
          clearTimeout(flowingTimer)
          flowingTimer = null
        }
        return
      }

      // 2. 位于轨道上方（含罕见负滚动）：归零，并解除冻结以便再次下滑时能恢复动画
      if (scrollY <= cachedTop) {
        isExited = false
        targetProgress = 0
        currentProgress = 0
        applyPanTransform()
        if (!rafId && !isDestroyed && isVisible && !isReducedMotion()) {
          rafId = requestAnimationFrame(render)
        }
        return
      }

      // 3. 重新进入首屏区间：恢复活动态与 RAF
      if (isExited) {
        isExited = false
        if (!rafId && !isDestroyed && isVisible) {
          rafId = requestAnimationFrame(render)
        }
      }

      // 计算相对轨道顶部的滚动比例 [0, 1]（纯数学计算，零 DOM 重排）
      targetProgress = computeProgress(scrollY)
    }

    // 视口观察器
    const viewObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        // 不只信 IO 的快照：恢复滚动（从文章返回首页）时，IO 可能先拿恢复**之前**
        // 算出的旧矩形报一次「可见」、再报「不可见」，两次回调的先后不保证。
        // 谁后到谁说了算 → 题字会停在满透明度盖在当前内容上、回顶键也一直藏着。
        // 这里用真实滚动位置兜底：已经越过墙尾就一定算「不可见」。
        const scrolledPast =
          (window.scrollY || 0) >= cachedBottomLimit && cachedBottomLimit > 0
        const visible = Boolean(entry && entry.isIntersecting) && !scrolledPast
        isVisible = visible

        // 照片墙在视口内时压制回顶按钮（滚到下方影集/文章列表后自动恢复）
        document.documentElement.classList.toggle(
          'cl-home-hero-active',
          visible
        )

        if (!visible) {
          if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
          }
          // 完全离屏：隐藏以释放光栅纹理，避免下方文章滚动继续背着这块大画布的显存
          if (container) {
            container.classList.add('is-offscreen')
            container.classList.remove('is-flowing')
          }
        } else if (visible && !rafId && !isDestroyed && !isExited) {
          // 先恢复可见，下一帧再启动渲染，避免刚显示就重绘出现空白帧
          container?.classList.remove('is-offscreen')
          rafId = requestAnimationFrame(render)
        } else {
          container?.classList.remove('is-offscreen')
        }
      },
      { threshold: 0 }
    )

    // 几何校正：SSR/hydration 期间布局可能尚未稳定（实测挂载瞬间轨道顶部会读到
    // 924px 的临时值，随后回落到 0），若直接缓存会让整段进度基准偏移。
    // 因此在首帧后、load 后各校正一次，并用 ResizeObserver 跟进后续布局变化
    const refreshGeometry = () => {
      if (isDestroyed) return
      updateGeometry()
      onScroll()
    }

    const onResize = () => {
      // 缩放与几何校正立即执行，避免拖拽过程中画面变形
      updateScale()

      // 只有视口宽度真正变化才重建列结构：移动端地址栏收起仅改变高度，
      // 若也触发重建，滚动中会出现整片照片墙闪白
      const width = window.innerWidth
      if (width === lastWidth) {
        onScroll()
        return
      }
      lastWidth = width

      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (isDestroyed) return
        buildColumns()
        onScroll()
      }, 150)
    }

    updateScale()
    buildColumns()
    viewObserver.observe(trackWrapper)
    onScroll()
    rafId = requestAnimationFrame(render)

    // 首帧后再校正一次几何（此时 React 已完成 hydration、布局稳定）
    const firstFrameId = requestAnimationFrame(refreshGeometry)
    window.addEventListener('load', refreshGeometry)

    const geometryObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(refreshGeometry)
        : null
    geometryObserver?.observe(document.body)

    const onMotionChange = () => {
      if (isReducedMotion()) {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
      } else if (isVisible && !rafId && !isDestroyed && !isExited) {
        rafId = requestAnimationFrame(render)
      }
    }
    motionQuery?.addEventListener?.('change', onMotionChange)

    // 标签页切走时彻底停机，回来再续帧（IntersectionObserver 不会因切页触发）
    const onVisibility = () => {
      if (isDestroyed) return
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
        lastTs = 0
      } else if (!rafId && isVisible && !isExited && !isReducedMotion()) {
        rafId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      isDestroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      if (resizeTimer) clearTimeout(resizeTimer)
      if (flowingTimer) clearTimeout(flowingTimer)
      container?.classList.remove('is-flowing')
      if (drainHandle) {
        if (
          drainViaIdle &&
          typeof window !== 'undefined' &&
          typeof window.cancelIdleCallback === 'function'
        ) {
          window.cancelIdleCallback(drainHandle)
        } else {
          clearTimeout(drainHandle)
        }
        drainHandle = null
      }
      loadQueue.length = 0
      viewObserver.disconnect()
      // 卸载时摘除状态类：否则切页后回顶按钮会永久隐藏
      document.documentElement.classList.remove('cl-home-hero-active')
      memoryLifecycleObserver.disconnect()
      motionQuery?.removeEventListener?.('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', refreshGeometry)
      cancelAnimationFrame(firstFrameId)
      geometryObserver?.disconnect()
    }
  }, [displayCards])

  // 没有图源时整块不渲染，避免用示例图冒充博主作品
  if (!displayCards.length) return null

  // 题字开关：主题配置可整体关掉，showWallTitle 再按页面收窄（仅首页）
  const titleEnabled =
    showWallTitle &&
    siteConfig('CIRCLELIFE_HOME_WALL_TITLE', true, CONFIG) !== false

  // 首屏 LCP 的 preload 由主题布局（LayoutPostList）在 SSR 阶段输出，
  // 组件内 critical 图会自行带 fetchpriority，此处不重复声明
  return (
    <div ref={trackWrapperRef} className='cl-home-tilt-track-wrapper'>
      {/* 240vh 区块随页面滚走：提供约 2.4 屏的浏览时长，内部只做 0.12 微视差 */}
      <section
        ref={containerRef}
        className='cl-home-tilt-section select-none bg-[var(--cl-bg)]'>
        {/* 平移层：每帧只翻 translate，尺寸=视口；旋转与缩放交给内层静态变换 */}
        <div ref={panRef} className='cl-home-tilt-pan' aria-hidden='true'>
          {/* 8° 倾斜的无限照片瀑布流母画卷（rotate/scale 静态，缩放值走 CSS 变量） */}
          <div ref={rotatedRef} className='cl-home-tilt-rotated' />
        </div>

        {/* 同行题字：与照片墙同源的漂移与呼吸。
            刻意放在 pan 层之外（pan 是 aria-hidden 的装饰画布），题字必须留在无障碍树中。
            外层行元素承载滚动位移的 transform，内层 span 承载入场关键帧，两者互不覆盖。 */}
        {titleEnabled ? (
          <div ref={titleRef} className='cl-home-tilt-title'>
            <h1 className='cl-home-tilt-title-zh'>
              <span>{titleZh}</span>
            </h1>
            <span className='cl-home-tilt-title-rule' aria-hidden='true'>
              <span />
            </span>
            <p className='cl-home-tilt-title-en' lang='en'>
              <span>{titleEn}</span>
            </p>
          </div>
        ) : null}

        {/* 顶部与底部微弱过渡渐变遮罩 */}
        <div className='cl-home-tilt-fade-top pointer-events-none absolute inset-x-0 top-0 h-28 z-10' />
        <div className='cl-home-tilt-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-36 z-10' />
      </section>
    </div>
  )
}
