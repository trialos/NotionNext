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
import fs from 'fs'
import path from 'path'
import {
  computeBitmapSize,
  computeCoverRect,
  drawCover,
  measureBox,
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

  /**
   * 取盒铁律（2026-10 踩过的坑）：
   * 照片墙祖先链有 rotate(8deg) scale(1.15) → getBoundingClientRect() 返回的是
   * 变换后的外接框 → 裁切比例按外接框算 → 非方形卡片被多裁 7%~14%
   * （表现为「有的照片被裁剪了」）。必须用布局盒。
   */
  describe('measureBox（取布局盒，不取变换后的外接框）', () => {
    test('优先用 clientWidth/clientHeight（布局像素，不受 transform 影响）', () => {
      const fake = {
        clientWidth: 150,
        clientHeight: 112,
        offsetWidth: 150,
        offsetHeight: 112,
        // 祖先 rotate+scale 后的外接框（**不能**用它）
        getBoundingClientRect: () => ({ width: 297.8, height: 239.9 })
      }
      expect(measureBox(fake)).toEqual({ w: 150, h: 112 })
    })

    test('clientWidth 为 0 时回退 offsetWidth/offsetHeight', () => {
      const fake = {
        clientWidth: 0,
        clientHeight: 0,
        offsetWidth: 150,
        offsetHeight: 199
      }
      expect(measureBox(fake)).toEqual({ w: 150, h: 199 })
    })

    test('空输入不崩', () => {
      expect(measureBox(null)).toEqual({ w: 0, h: 0 })
      expect(measureBox({})).toEqual({ w: 0, h: 0 })
    })

    test('回归护栏：源码里不得再用 getBoundingClientRect 取盒', () => {
      const source = fs.readFileSync(
        path.join(
          __dirname,
          '../../../themes/circlelife/components/CanvasImage.js'
        ),
        'utf-8'
      )
      // 注释里可以出现（说明为什么不能用），但**不能有真实调用**
      expect(source).not.toMatch(/\.getBoundingClientRect\s*\(/)
    })
  })

  describe('computeBitmapSize（位图 = 显示尺寸 × DPR，不超过源图）', () => {
    test('按显示尺寸 × DPR 分配', () => {
      // 440×656 @DPR2 → 需要 880×1312；源图 768×1024 更小 → 按源图封顶
      // （并保持盒的比例：宽 = 源高 × 盒比例 = 1024 × 0.6707 = 687）
      expect(computeBitmapSize(440, 656, 2, 768, 1024)).toEqual({
        w: 687,
        h: 1024
      })
      // 源图够大 → 位图 = 显示尺寸 × DPR
      expect(computeBitmapSize(150, 112, 2, 512, 683)).toEqual({
        w: 300,
        h: 224
      })
    })

    test('源图小于显示尺寸时按源图封顶（不放大位图）', () => {
      // 303×404 的源放进 440×656 的盒 → 裁切后正好是 271×404（= 源高 × 盒比例）
      expect(computeBitmapSize(440, 656, 2, 303, 404)).toEqual({
        w: 271,
        h: 404
      })
    })

    test('DPR 缺省按 1 处理；盒为 0 时不崩', () => {
      expect(computeBitmapSize(150, 112, 1, 512, 683)).toEqual({
        w: 150,
        h: 112
      })
      expect(computeBitmapSize(0, 0, 2, 0, 0)).toEqual({ w: 1, h: 1 })
    })
  })

  describe('drawCover（画进目标位图，可见矩形等比铺满）', () => {
    const makeCtx = () => {
      const calls = []
      return {
        calls,
        clearRect: (...args) => calls.push(['clearRect', ...args]),
        drawImage: (...args) => calls.push(['drawImage', ...args])
      }
    }

    test('影集段：源 345×460 放进 440×956 的满幅舞台 → 只留 61% 宽（与 cover 一致）', () => {
      const ctx = makeCtx()
      const img = { naturalWidth: 345, naturalHeight: 460 }
      drawCover(ctx, img, 440, 656, 440, 956, 'center')
      const call = ctx.calls.find(c => c[0] === 'drawImage')
      // [ 'drawImage', img, sx, sy, sw, sh, dx, dy, dw, dh ]
      // cover：scale = max(440/345, 956/460) = 956/460 → 可见宽 = 440 / scale
      const scale = Math.max(440 / 345, 956 / 460)
      expect(call[4]).toBeCloseTo(440 / scale, 4)
      expect(call[5]).toBeCloseTo(460, 4)
      expect(call[8]).toBe(440)
      expect(call[9]).toBe(656)
    })

    test('照片墙 3:4 卡片：用**布局盒**算 → 源图不再被多裁 6.6%', () => {
      const ctx = makeCtx()
      const img = { naturalWidth: 170, naturalHeight: 226 }
      // 布局盒 150×199（0.754），源图 0.752 → 几乎等比 → 整张可见
      drawCover(ctx, img, 300, 398, 150, 199, 'center')
      const call = ctx.calls.find(c => c[0] === 'drawImage')
      const scale = Math.max(150 / 170, 199 / 226)
      expect(call[4]).toBeCloseTo(150 / scale, 4)
      expect(call[5]).toBeCloseTo(199 / scale, 4)
    })
  })
})
