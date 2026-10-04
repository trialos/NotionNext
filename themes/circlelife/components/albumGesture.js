import { useRef } from 'react'

const THRESH = 0.2
const TAP_MAX = 10

/** 主卡实测宽；无则按舞台宽估算 */
export function getCardWidth(stageRef) {
  const stage = stageRef.current
  if (!stage) return 320
  const main = stage.querySelector('.cl-ag-card--main')
  return main?.offsetWidth || Math.min(stage.clientWidth * 0.7, 360)
}

/**
 * 翻卡指针手势：8px 死区 · 垂直锁定 · 横向 clamp · 阈值翻页 · 轻点三分区
 *
 * setStack（写整叠 CSS 变量）、onFlip（换 index）、onCenterTap（开灯箱）
 * 均由 AlbumGallery 提供；busyRef 是与 commitFlip/dots 共享的动画互斥锁。
 */
export function useDeckGesture({
  stageRef,
  busyRef,
  count,
  disabled,
  setStack,
  onFlip,
  onCenterTap
}) {
  const dragRef = useRef({
    active: false,
    locked: null,
    x: 0,
    startX: 0,
    startY: 0,
    moved: false,
    pid: null
  })

  const onPointerDown = e => {
    if (disabled || busyRef.current) return
    if (e.button != null && e.button !== 0) return
    if (e.target.closest?.('button, a')) return
    dragRef.current = {
      active: true,
      locked: null,
      x: 0,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pid: e.pointerId
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
    setStack(0, false)
  }

  const onPointerMove = e => {
    const d = dragRef.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        d.active = false
        d.locked = 'v'
        setStack(0, true, 220)
        try {
          e.currentTarget.releasePointerCapture(d.pid)
        } catch (_) {}
        return
      }
      d.locked = 'h'
    }
    if (d.locked !== 'h') return
    if (e.cancelable) e.preventDefault()
    const maxX = Math.max(130, getCardWidth(stageRef) * 0.8)
    const x = Math.max(-maxX, Math.min(maxX, dx))
    d.x = x
    if (Math.abs(x) > TAP_MAX) d.moved = true
    setStack(x, false)
  }

  const onPointerUp = e => {
    const d = dragRef.current
    if (!d.active) {
      d.active = false
      return
    }
    const x = d.x
    const moved = d.moved
    const w = getCardWidth(stageRef)
    const th = Math.max(48, w * THRESH)
    d.active = false
    d.locked = null

    if (count > 1 && x <= -th) {
      onFlip(1)
    } else if (count > 1 && x >= th) {
      onFlip(-1)
    } else {
      setStack(0, true, 240)
      if (!moved && Math.abs(x) <= TAP_MAX) {
        // 轻点：左/右 1/3 翻页，中区开灯箱
        const stage = stageRef.current
        const rect = stage?.getBoundingClientRect()
        const cx = e?.clientX ?? d.startX
        if (rect && count > 1) {
          const rel = (cx - rect.left) / rect.width
          if (rel < 0.33) onFlip(-1)
          else if (rel > 0.67) onFlip(1)
          else onCenterTap()
        } else {
          onCenterTap()
        }
      }
    }
    d.x = 0
    d.moved = false
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp
  }
}
