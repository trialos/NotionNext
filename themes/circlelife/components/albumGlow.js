import { useEffect, useRef, useState } from 'react'

const GLOW_MS = 1100

/**
 * 氛围光：隐藏槽换 src → 预载 onload → 交叉淡化 → 切 front，不卸 DOM
 * A/B 双槽常驻，结尾不空窗
 */
export function useAmbientGlow(url) {
  const [glowA, setGlowA] = useState('')
  const [glowB, setGlowB] = useState('')
  const [frontSlot, setFrontSlot] = useState('a')
  const [crossOn, setCrossOn] = useState(false)
  const glowFrontRef = useRef('a')
  const glowUrlRef = useRef('')

  useEffect(() => {
    if (!url || url === glowUrlRef.current) return undefined

    if (!glowUrlRef.current) {
      glowUrlRef.current = url
      setGlowA(url)
      setFrontSlot('a')
      glowFrontRef.current = 'a'
      setCrossOn(false)
      return undefined
    }

    const front = glowFrontRef.current
    const writeA = front === 'b'
    if (writeA) setGlowA(url)
    else setGlowB(url)

    let cancelled = false
    let settleTimer = 0
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      setCrossOn(true)
      settleTimer = window.setTimeout(() => {
        if (cancelled) return
        const next = writeA ? 'a' : 'b'
        glowFrontRef.current = next
        setFrontSlot(next)
        setCrossOn(false)
        glowUrlRef.current = url
      }, GLOW_MS)
    }
    img.onerror = () => {
      if (cancelled) return
      const next = writeA ? 'a' : 'b'
      glowFrontRef.current = next
      setFrontSlot(next)
      setCrossOn(false)
      glowUrlRef.current = url
    }
    img.src = url
    return () => {
      cancelled = true
      if (settleTimer) window.clearTimeout(settleTimer)
    }
  }, [url])

  return { glowA, glowB, frontSlot, crossOn }
}
