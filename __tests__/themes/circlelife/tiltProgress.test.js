/**
 * @jest-environment node
 */
import {
  computeTiltProgress,
  computeTiltTravel,
  EASE_TAU_DESKTOP,
  EASE_TAU_NARROW,
  easeTiltProgress,
  TRAVEL_RATIO
} from '@/themes/circlelife/components/tiltProgress'

const VIEWPORT = 720
const WALL = 1584 // 220vh
const SPAN = WALL - VIEWPORT // 864

describe('computeTiltProgress', () => {
  it('墙位于文档顶部时按相对行程线性映射', () => {
    expect(
      computeTiltProgress({
        scrollY: 0,
        top: 0,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(0)

    expect(
      computeTiltProgress({
        scrollY: SPAN / 2,
        top: 0,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(0.5)

    expect(
      computeTiltProgress({
        scrollY: SPAN,
        top: 0,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(1)
  })

  it('墙上方有占位时以墙自身顶部为基准，而不是文档绝对滚动量', () => {
    const top = 600
    // 回归用例：旧实现用 scrollY / SPAN，此处会得到 1200/864 > 1 的错误进度
    expect(
      computeTiltProgress({
        scrollY: top,
        top,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(0)

    expect(
      computeTiltProgress({
        scrollY: top + SPAN / 2,
        top,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(0.5)
  })

  it('越界进度夹紧到 [0, 1]', () => {
    expect(
      computeTiltProgress({
        scrollY: 5000,
        top: 300,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(1)

    expect(
      computeTiltProgress({
        scrollY: 100,
        top: 300,
        wallHeight: WALL,
        viewportHeight: VIEWPORT
      })
    ).toBe(0)
  })

  it('墙高不超过视口时退化为二元状态，避免瞬时跳变', () => {
    const params = {
      top: 200,
      wallHeight: VIEWPORT,
      viewportHeight: VIEWPORT
    }
    expect(computeTiltProgress({ ...params, scrollY: 0 })).toBe(0)
    expect(computeTiltProgress({ ...params, scrollY: 199 })).toBe(0)
    expect(computeTiltProgress({ ...params, scrollY: 201 })).toBe(1)
  })

  it('非法输入不会产生 NaN', () => {
    expect(computeTiltProgress()).toBe(0)
    expect(
      computeTiltProgress({
        scrollY: Number.NaN,
        top: Number.NaN,
        wallHeight: Number.NaN,
        viewportHeight: Number.NaN
      })
    ).toBe(0)
  })

  describe('pinned: false（整屏区块随页面滚走）', () => {
    const blockHeight = 844 // 100dvh

    it('行程等于区块自身高度，滚完一块即到终态', () => {
      const params = {
        top: 0,
        wallHeight: blockHeight,
        viewportHeight: blockHeight,
        pinned: false
      }
      expect(computeTiltProgress({ ...params, scrollY: 0 })).toBe(0)
      expect(computeTiltProgress({ ...params, scrollY: blockHeight / 2 })).toBe(0.5)
      expect(computeTiltProgress({ ...params, scrollY: blockHeight })).toBe(1)
    })

    it('墙高等于视口高时不再退化为二元状态', () => {
      // 钉住模式在 wall === viewport 时会直接返回 0/1，整屏模式必须给出连续进度
      const mid = computeTiltProgress({
        scrollY: 300,
        top: 0,
        wallHeight: 844,
        viewportHeight: 844,
        pinned: false
      })
      expect(mid).toBeGreaterThan(0)
      expect(mid).toBeLessThan(1)
      expect(mid).toBeCloseTo(300 / 844, 6)
    })

    it('越界仍夹紧，中心值不漂移', () => {
      const params = {
        top: 120,
        wallHeight: 844,
        viewportHeight: 844,
        pinned: false
      }
      expect(computeTiltProgress({ ...params, scrollY: 0 })).toBe(0)
      expect(computeTiltProgress({ ...params, scrollY: 120 + 422 })).toBe(0.5)
      expect(computeTiltProgress({ ...params, scrollY: 5000 })).toBe(1)
    })
  })
})

describe('computeTiltTravel', () => {
  it('按行程比例换算：整屏区块下位移约 0.12 倍', () => {
    // 对齐参考站实测：滚 300px 列走 36px → 0.12
    expect(computeTiltTravel(675)).toBeCloseTo(675 * TRAVEL_RATIO, 5)
    expect(computeTiltTravel(675)).toBeCloseTo(81, 0)
    expect(computeTiltTravel(300)).toBeCloseTo(36, 0)
  })

  it('缩行程不会把速度顶回去（220vh vs 180vh 都保持同一比例）', () => {
    const before = computeTiltTravel(1013) / 1013
    const after = computeTiltTravel(675) / 675
    expect(before).toBeCloseTo(TRAVEL_RATIO, 6)
    expect(after).toBeCloseTo(TRAVEL_RATIO, 6)
  })

  it('异常行程与非法比例安全兜底', () => {
    expect(computeTiltTravel(0)).toBe(0)
    expect(computeTiltTravel(-100)).toBe(0)
    expect(computeTiltTravel(Number.NaN)).toBe(0)
    expect(computeTiltTravel(675, 0)).toBeCloseTo(675 * TRAVEL_RATIO, 5)
    expect(computeTiltTravel(675, 0.2)).toBeCloseTo(135, 5)
  })
})

describe('easeTiltProgress', () => {
  const run = (frames, dt, tau = EASE_TAU_DESKTOP) => {
    let value = 0
    for (let i = 0; i < frames; i++) {
      value = easeTiltProgress(value, 1, dt, tau)
    }
    return value
  }

  it('与帧率解耦：同样经过 100ms，60Hz 与 120Hz 结果一致', () => {
    const at60 = run(6, 16.7) // ≈100ms
    const at120 = run(12, 8.35) // ≈100ms
    expect(Math.abs(at60 - at120)).toBeLessThan(1e-3)
  })

  it('同样经过时间，60Hz 与掉帧到 30fps 结果一致', () => {
    const at60 = run(6, 16.7)
    const at30 = run(3, 33.4)
    expect(Math.abs(at60 - at30)).toBeLessThan(1e-3)
  })

  it('单调逼近目标并最终吸附，不越过目标', () => {
    let value = 0
    for (let i = 0; i < 200; i++) {
      const next = easeTiltProgress(value, 1, 16.7, EASE_TAU_NARROW)
      expect(next).toBeGreaterThanOrEqual(value)
      expect(next).toBeLessThanOrEqual(1)
      value = next
    }
    expect(value).toBe(1)
  })

  it('dt 异常时回落到 16.7ms，超长 dt 被钳到 64ms', () => {
    expect(easeTiltProgress(0, 1, 0, 120)).toBeCloseTo(
      easeTiltProgress(0, 1, 16.7, 120),
      6
    )
    expect(easeTiltProgress(0, 1, Number.NaN, 120)).toBeCloseTo(
      easeTiltProgress(0, 1, 16.7, 120),
      6
    )
    // 切标签页回来 dt 可能上千毫秒，必须钳制，否则一帧直接跳到位
    expect(easeTiltProgress(0, 1, 5000, 120)).toBeLessThan(0.5)
  })

  it('窄屏时间常数比桌面更跟手', () => {
    expect(EASE_TAU_NARROW).toBeLessThan(EASE_TAU_DESKTOP)
    expect(easeTiltProgress(0, 1, 16.7, EASE_TAU_NARROW)).toBeGreaterThan(
      easeTiltProgress(0, 1, 16.7, EASE_TAU_DESKTOP)
    )
  })
})
