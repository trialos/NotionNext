/**
 * 悬浮胶囊滚动让位 契约测试
 *
 * 背景：让位若按「速度 + 定时器」判定，就会退回到已被废弃的迟滞收起手感。
 * 这里把判定钉死：净位移累计、方向翻转清零、上滚阈值分两档
 * （一般页 14px / 阅读态 25% 视口）。
 *
 * 阅读进度不在此文件：它固定在视口顶边，与胶囊显隐无关（见 styleFragments 契约）。
 */
import {
  NAV_PARK,
  computeUpThreshold,
  resolveNavParking
} from '@/themes/circlelife/components/navParking'

describe('上滚归位阈值', () => {
  test('一般页面固定 14px（导航是主操作，回位要灵敏）', () => {
    expect(computeUpThreshold({ reading: false, viewportHeight: 900 })).toBe(
      NAV_PARK.UP_SENSITIVE
    )
  })

  test('阅读态按视口 25% 取值', () => {
    expect(computeUpThreshold({ reading: true, viewportHeight: 900 })).toBe(225)
    expect(computeUpThreshold({ reading: true, viewportHeight: 844 })).toBe(211)
  })

  test('阅读态有下限，矮窗口不会被一行往回拽就唤出', () => {
    expect(computeUpThreshold({ reading: true, viewportHeight: 400 })).toBe(
      NAV_PARK.UP_READING_MIN
    )
  })
})

describe('让位状态机', () => {
  const reading = { reading: false, viewportHeight: 900 }

  test('常驻区内永不退场，并把累计清零', () => {
    const next = resolveNavParking({
      y: 80,
      delta: 80,
      down: 100,
      up: 100,
      parked: true,
      ...reading
    })
    expect(next.parked).toBe(false)
    expect(next.down).toBe(0)
    expect(next.up).toBe(0)
  })

  test('下滚累计超过 36px 才让位，未到阈值不动', () => {
    const first = resolveNavParking({ y: 120, delta: 20, ...reading })
    expect(first.parked).toBe(false)
    expect(first.down).toBe(20)

    const second = resolveNavParking({
      y: 140,
      delta: 20,
      down: first.down,
      up: first.up,
      parked: first.parked,
      ...reading
    })
    expect(second.parked).toBe(true)
    expect(second.down).toBe(40)
  })

  test('方向翻转清零：往回滚一点不算「上滚累计」', () => {
    const next = resolveNavParking({
      y: 200,
      delta: -10,
      down: 30,
      up: 0,
      parked: false,
      ...reading
    })
    expect(next.down).toBe(0)
    expect(next.up).toBe(10)
    expect(next.parked).toBe(false)
  })

  test('一般页上滚 14px 即归位', () => {
    const next = resolveNavParking({
      y: 400,
      delta: -15,
      up: 0,
      parked: true,
      ...reading
    })
    expect(next.parked).toBe(false)
  })

  test('阅读态上滚 15px 不归位，须达到 25% 视口', () => {
    const stillParked = resolveNavParking({
      y: 400,
      delta: -15,
      up: 0,
      parked: true,
      reading: true,
      viewportHeight: 900
    })
    expect(stillParked.parked).toBe(true)

    const revealed = resolveNavParking({
      y: 180,
      delta: -226,
      up: 0,
      parked: true,
      reading: true,
      viewportHeight: 900
    })
    expect(revealed.parked).toBe(false)
  })

  test('未滚动的帧不改变状态', () => {
    const next = resolveNavParking({
      y: 500,
      delta: 0,
      down: 10,
      up: 5,
      parked: true,
      ...reading
    })
    expect(next).toMatchObject({ parked: true, down: 10, up: 5 })
  })
})
