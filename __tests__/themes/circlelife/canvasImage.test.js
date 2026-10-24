/**
 * CanvasImage 的裁剪算法契约测试
 *
 * 背景：首页的影集封面与文章图版改用 canvas 承载（canvas 的像素不进入
 * LCP 候选 → 滚到影集段时 LCP 不再被顶到十几秒）。代价是**裁剪逻辑从
 * CSS（object-fit/object-position）搬到了 JS** —— 所以必须用测试把这条
 * 链路钉死：算出来的矩形要跟浏览器原本的 `object-fit: cover` 一致。
 *
 * 这里测的是纯函数（computeCoverRect / parseObjectPosition），
 * 不碰 DOM。
 */
import {
  computeCoverRect,
  parseObjectPosition
} from '../../../themes/circlelife/components/CanvasImage'

describe('circlelife CanvasImage 裁剪算法', () => {
  describe('parseObjectPosition', () => {
    test('缺省 / 空值 → 居中', () => {
      expect(parseObjectPosition(undefined)).toEqual([0.5, 0.5])
      expect(parseObjectPosition('')).toEqual([0.5, 0.5])
      expect(parseObjectPosition('center')).toEqual([0.5, 0.5])
    })

    test('百分比 → 0~1 的比例', () => {
      expect(parseObjectPosition('50% 30%')).toEqual([0.5, 0.3])
      expect(parseObjectPosition('0% 100%')).toEqual([0, 1])
      expect(parseObjectPosition('100% 0%')).toEqual([1, 0])
    })

    test('只有一个值 → 横纵同值（与 CSS 一致）', () => {
      expect(parseObjectPosition('30%')).toEqual([0.3, 0.3])
    })

    test('关键字 left/top/right/bottom', () => {
      expect(parseObjectPosition('left top')).toEqual([0, 0])
      expect(parseObjectPosition('right bottom')).toEqual([1, 1])
    })

    test('越界值被夹到 [0,1]', () => {
      expect(parseObjectPosition('-20% 150%')).toEqual([0, 1])
    })
  })

  describe('computeCoverRect（object-fit: cover 的等价实现）', () => {
    test('源图比目标盒小（放大铺满）：可见矩形 = 整张源图', () => {
      // 源 100x100，目标 200x200 → cover 要放大 2 倍，可见区域是整张源图
      const r = computeCoverRect(100, 100, 200, 200)
      expect(r.sw).toBeCloseTo(100, 6)
      expect(r.sh).toBeCloseTo(100, 6)
      expect(r.sx).toBeCloseTo(0, 6)
      expect(r.sy).toBeCloseTo(0, 6)
    })

    test('源图比目标盒宽（横向裁切）：按比例缩到高度刚好', () => {
      // 源 200x100，目标 100x100 → cover 缩放系数 = max(100/200, 100/100) = 1
      // 可见宽度 = 目标宽 / 缩放 = 100 → 从源图横向取 100 宽
      const r = computeCoverRect(200, 100, 100, 100)
      expect(r.sh).toBeCloseTo(100, 6)
      expect(r.sw).toBeCloseTo(100, 6)
    })

    test('源图比目标盒高（纵向裁切）', () => {
      // 源 100x200，目标 100x100 → 缩放 1，可见高度 100
      const r = computeCoverRect(100, 200, 100, 100)
      expect(r.sw).toBeCloseTo(100, 6)
      expect(r.sh).toBeCloseTo(100, 6)
    })

    test('object-position 决定裁切窗口的位置', () => {
      // 源 200x100 → 目标 100x100，可见窗口宽 100，横向有 100 的富余
      // posX=0 → 取最左；posX=1 → 取最右；posX=0.5 → 居中
      const left = computeCoverRect(200, 100, 100, 100, 0, 0.5)
      const center = computeCoverRect(200, 100, 100, 100, 0.5, 0.5)
      const right = computeCoverRect(200, 100, 100, 100, 1, 0.5)
      expect(left.sx).toBeCloseTo(0, 6)
      expect(center.sx).toBeCloseTo(50, 6)
      expect(right.sx).toBeCloseTo(100, 6)
    })

    test('纵横两个焦点各自独立生效（cover 只在长边方向裁切）', () => {
      // 源 200x100 → 目标 100x100：cover 缩放 1 → 可见 100x100，横向富余 100
      const horizontal = computeCoverRect(200, 100, 100, 100, 0.25, 0.5)
      expect(horizontal.sx).toBeCloseTo(25, 6)
      expect(horizontal.sy).toBeCloseTo(0, 6)
      // 源 100x200 → 目标 100x100：纵向富余 100
      const vertical = computeCoverRect(100, 200, 100, 100, 0.5, 0.75)
      expect(vertical.sx).toBeCloseTo(0, 6)
      expect(vertical.sy).toBeCloseTo(75, 6)
    })

    test('非法输入不崩（返回退化矩形）', () => {
      const r = computeCoverRect(0, 0, 100, 100)
      expect(r.sw).toBe(0)
      expect(r.sh).toBe(0)
      expect(() => computeCoverRect(100, 100, 0, 0)).not.toThrow()
    })
  })

  describe('与 CSS object-fit: cover 的一致性（比值不变式）', () => {
    test('可见矩形的宽高比恒等于目标盒的宽高比', () => {
      const cases = [
        [200, 100, 100, 100],
        [100, 200, 100, 100],
        [345, 460, 485, 656],
        [1024, 1365, 314, 419]
      ]
      cases.forEach(([sw, sh, bw, bh]) => {
        const r = computeCoverRect(sw, sh, bw, bh, 0.5, 0.5)
        expect(r.sw / r.sh).toBeCloseTo(bw / bh, 6)
      })
    })

    test('可见矩形永远落在源图内（不越界）', () => {
      const r = computeCoverRect(345, 460, 485, 656, 0.3, 0.8)
      expect(r.sx).toBeGreaterThanOrEqual(0)
      expect(r.sy).toBeGreaterThanOrEqual(0)
      expect(r.sx + r.sw).toBeLessThanOrEqual(345 + 0.001)
      expect(r.sy + r.sh).toBeLessThanOrEqual(460 + 0.001)
    })
  })
})
