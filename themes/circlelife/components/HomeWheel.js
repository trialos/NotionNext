import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'

const TWO_PI = Math.PI * 2
const STEP = TWO_PI / 8 // 8 槽位，每槽 45°
const VISIBLE = 1.45 // ≈83°，之外的槽位隐藏（含 tabindex 剔除）
const AUTO_SPEED = 0.0022 // 每帧自转弧度（约 47s 一圈，展览式漂移）
const EASE = 0.08 // 当前角向目标角缓动
const RX = 0.42 // 水平半径（占容器宽比例）
const LIFT = 110 // 弧线两端上抬量 px（手绘稿的微笑弧）

/**
 * 首页影集弧形转筒：书架叠卡排在下弯弧线上
 * 拖拽转动 + 缓慢自转 + 循环全部影集；正前辑最大，两侧渐小渐淡
 *
 * 合规：暂停按钮（自动播放 >5s 红线）、键盘 ←/→ 旋转 + 回车打开、
 * 聚焦侧卡自动转正、Cmd/Ctrl+click 放行新标签、拖拽 6px 阈值防误点、
 * 拖拽中 user-select:none、rAF 内 ref 直写 transform（零逐帧 setState）
 */
export default function HomeWheel({ decks = [] }) {
  const list = decks.slice(
    0,
    siteConfig('CIRCLELIFE_HOME_FILM_COUNT', 6, CONFIG)
  )
  const n = list.length
  const slotCount = n < 4 ? n * 2 : 8

  const router = useRouter()
  const viewportRef = useRef(null)
  const nodesRef = useRef([])
  const wRef = useRef(0)
  const rotRef = useRef({ cur: 0, target: 0 })
  const dragRef = useRef(null)
  const movedRef = useRef(false)
  const hoverRef = useRef(false)
  const frontRef = useRef(-1)
  const reduceRef = useRef(false)
  const [focused, setFocused] = useState(0)
  const [paused, setPaused] = useState(false)

  const deckOf = k => list[((k % n) + n) % n]
  const wrap = a => {
    a = a % TWO_PI
    if (a > Math.PI) a -= TWO_PI
    if (a <= -Math.PI) a += TWO_PI
    return a
  }

  // 布局缓存：卡片节点 + 容器宽（resize 时更新，rAF 内零布局读取）
  useEffect(() => {
    const measure = () => {
      nodesRef.current = viewportRef.current
        ? Array.from(viewportRef.current.querySelectorAll('.cl-wheel-card'))
        : []
      wRef.current = viewportRef.current?.offsetWidth || 0
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [slotCount])

  useEffect(() => {
    reduceRef.current = Boolean(
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    )
  }, [])

  // 渲染循环：只写 transform/opacity/zIndex/visibility
  useEffect(() => {
    let raf
    const tick = () => {
      const s = rotRef.current
      if (
        !s.dragging &&
        !paused &&
        !hoverRef.current &&
        !reduceRef.current
      ) {
        s.target += AUTO_SPEED
      }
      if (Math.abs(s.target) > TWO_PI * 4) {
        const shift = TWO_PI * Math.floor(s.target / TWO_PI)
        s.target -= shift
        s.cur -= shift
      }
      s.cur += (s.target - s.cur) * (reduceRef.current ? 1 : EASE)

      const W = wRef.current || 1
      let bestCos = -2
      let bestSlot = -1
      for (let k = 0; k < slotCount; k++) {
        const el = nodesRef.current[k]
        if (!el) continue
        const a = wrap(k * STEP + s.cur)
        const c = Math.cos(a)
        const x = Math.sin(a) * W * RX
        const y = -(1 - c) * LIFT
        const sc = Math.max(0.12, 0.4 + 0.6 * c)
        const op = Math.max(
          0.1,
          1 - (Math.max(0, Math.abs(a) - 0.5) / (VISIBLE - 0.5)) * 0.9
        )
        el.style.transform = `translate(-50%, -50%) translateX(${x.toFixed(
          1
        )}px) translateY(${y.toFixed(1)}px) scale(${sc.toFixed(3)})`
        el.style.opacity = op.toFixed(3)
        el.style.zIndex = String(Math.round(c * 100) + 100)
        el.style.visibility = Math.abs(a) > VISIBLE ? 'hidden' : 'visible'
        if (c > bestCos) {
          bestCos = c
          bestSlot = k
        }
      }
      if (bestSlot >= 0) {
        const deckIdx = ((bestSlot % n) + n) % n
        if (frontRef.current !== deckIdx) {
          frontRef.current = deckIdx
          setFocused(deckIdx)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [slotCount, paused, n])

  const bringToFront = k => {
    const s = rotRef.current
    const delta = wrap(-k * STEP - s.target)
    s.target += delta
    if (reduceRef.current) s.cur = s.target
  }
  const rotateBySlot = dir => {
    const s = rotRef.current
    s.target = (Math.round(s.target / STEP) + dir) * STEP
  }

  const onPointerDown = e => {
    dragRef.current = { startX: e.clientX, startTarget: rotRef.current.target }
    movedRef.current = false
    // 不在此处 setPointerCapture：捕获会把 click 重定向到视口，
    // 导致卡片链接永远点不中；改为拖拽越阈值后再捕获
  }
  const onPointerMove = e => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (!movedRef.current && Math.abs(dx) < 6) return
    if (!movedRef.current) {
      movedRef.current = true
      viewportRef.current?.classList.add('is-dragging')
      try {
        viewportRef.current?.setPointerCapture?.(e.pointerId)
      } catch (_) {}
    }
    const W = wRef.current || 1
    rotRef.current.target = d.startTarget + (dx / W) * 1.8
  }
  const endDrag = () => {
    dragRef.current = null
    viewportRef.current?.classList.remove('is-dragging')
  }
  const onClickCapture = e => {
    if (!movedRef.current) return
    e.preventDefault()
    e.stopPropagation()
    movedRef.current = false
    viewportRef.current?.classList.remove('is-dragging')
  }
  const onCardClick = (e, k) => {
    if (e.metaKey || e.ctrlKey) return // 放行浏览器新标签打开
    const a = wrap(k * STEP + rotRef.current.cur)
    if (Math.abs(a) < STEP / 2) return // 正前：放行深链导航
    e.preventDefault()
    bringToFront(k)
  }
  const onKeyDown = e => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      rotateBySlot(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      rotateBySlot(1)
    } else if (e.key === 'Enter') {
      const deck = deckOf(frontRef.current)
      if (deck?.id) {
        e.preventDefault()
        router.push(`/album?view=gallery&deck=${deck.id}`)
      }
    }
  }

  if (!n) return null
  const front = deckOf(frontRef.current)

  return (
    <section className='cl-wheel'>
      <div className='cl-wheel-head'>
        <div className='cl-wheel-mast'>
          <span className='cl-wheel-kicker'>影集 · SHELF</span>
          <h2 className='cl-wheel-title'>近期影集</h2>
        </div>
        <div className='cl-wheel-head-actions'>
          <button
            type='button'
            className='cl-wheel-pause'
            aria-pressed={paused}
            aria-label={paused ? '开始影集轮播' : '暂停影集轮播'}
            title={paused ? '开始轮播' : '暂停轮播'}
            onClick={() => setPaused(p => !p)}>
            <i
              className={`fas ${paused ? 'fa-play' : 'fa-pause'}`}
              aria-hidden='true'
            />
          </button>
          <SmartLink href='/album' className='cl-wheel-all' aria-label='查看全部影集'>
            全部影集 →
          </SmartLink>
        </div>
      </div>
      <div
        ref={viewportRef}
        className='cl-wheel-viewport'
        tabIndex={0}
        role='group'
        aria-roledescription='轮播'
        aria-label='影集转筒：左右方向键旋转，回车打开正前影集'
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        onMouseEnter={() => {
          hoverRef.current = true
        }}
        onMouseLeave={() => {
          hoverRef.current = false
        }}>
        <div className='cl-wheel-stage'>
          {Array.from({ length: slotCount }).map((_, k) => {
            const deck = deckOf(k)
            return (
              <SmartLink
                key={k}
                href={`/album?view=gallery&deck=${deck.id}`}
                className='cl-wheel-card'
                aria-label={`打开影集：${deck.name}`}
                onClick={e => onCardClick(e, k)}
                onFocus={() => bringToFront(k)}>
                <span className='cl-wheel-stack' aria-hidden='true'>
                  {deck.images.slice(0, 3).map((url, si) => (
                    <LazyImage
                      key={si}
                      src={url}
                      alt=''
                      className={`cl-wheel-shot cl-wheel-shot--${si}`}
                    />
                  ))}
                </span>
              </SmartLink>
            )
          })}
        </div>
      </div>
      <div className='cl-wheel-caption' aria-hidden='true'>
        <span className='cl-wheel-name'>{front?.name}</span>
        <span className='cl-wheel-meta'>
          {front?.date} · {String(front?.count).padStart(2, '0')} 张
        </span>
      </div>
    </section>
  )
}
