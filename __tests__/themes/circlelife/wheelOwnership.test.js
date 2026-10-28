/**
 * 展墙滚轮归属契约测试
 *
 * 背景：影集页右下角「影集目录」面板曾完全无法用滚轮滚动。照片墙把 wheel 监听
 * 挂在 window 上并无条件 preventDefault，把浏览器「滚动事件目标最近的原生滚动祖先」
 * 这一默认行为整个取消，影集目录列表（overflow-y:auto）因此一动不动，
 * 滚轮全喂给了背景照片墙。
 *
 * 这里守三类容易悄悄坏掉的东西：
 * 1. 判定语义：指针落在原生滚动容器内 → 交还浏览器；落在展墙画布或不含滚动容器的
 *    浮层（顶栏导航胶囊）→ 展墙照常接管。
 * 2. 根滚动容器不参与判定：全站 html { overflow-x: hidden } 按 CSS 规范会让
 *    overflow-y 的计算值变成 auto，根滚动容器一旦被误判，展墙将彻底失去滚轮。
 * 3. 源码契约：两个展墙的 onWheel 必须先做归属判定再 preventDefault；
 *    且滚轮监听仍需挂在 window 上，否则顶栏导航胶囊将不再驱动照片墙。
 */
import fs from 'fs'
import path from 'path'
import { shouldWallOwnWheel } from '@/themes/circlelife/components/wheelOwnership'

const rootDir = path.resolve(process.cwd())
const readComponent = name =>
  fs.readFileSync(
    path.join(rootDir, 'themes', 'circlelife', 'components', name),
    'utf8'
  )

/** 取出 onWheel 函数体（止于该函数自身的闭合花括号） */
const extractOnWheel = source => {
  const start = source.indexOf('const onWheel = e => {')
  if (start < 0) return ''
  const end = source.indexOf('\n    }', start)
  return source.slice(start, end < 0 ? undefined : end)
}

describe('展墙滚轮归属判定', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.removeAttribute('style')
    document.documentElement.removeAttribute('style')
  })

  test('指针落在展墙舞台内 → 展墙接管', () => {
    document.body.innerHTML = '<div id="stage"><div id="card"></div></div>'
    const stage = document.getElementById('stage')
    expect(shouldWallOwnWheel(document.getElementById('card'), stage)).toBe(true)
  })

  test('指针落在影集目录列表（overflow-y:auto）内 → 交还浏览器原生滚动', () => {
    document.body.innerHTML = `
      <div id="stage"></div>
      <div id="root">
        <div id="popover">
          <ul id="list" style="overflow-y: auto"><li id="item"></li></ul>
        </div>
      </div>`
    const stage = document.getElementById('stage')
    expect(shouldWallOwnWheel(document.getElementById('item'), stage)).toBe(false)
  })

  test('指针落在不含滚动容器的顶栏导航胶囊上 → 展墙照常接管', () => {
    document.body.innerHTML = '<div id="stage"></div><nav id="pill"></nav>'
    const stage = document.getElementById('stage')
    expect(shouldWallOwnWheel(document.getElementById('pill'), stage)).toBe(true)
  })

  test('根滚动容器（body / html）不参与判定', () => {
    document.body.style.overflowY = 'auto'
    document.documentElement.style.overflowY = 'auto'
    document.body.innerHTML = '<div id="stage"></div><div id="outside"></div>'
    const stage = document.getElementById('stage')
    expect(shouldWallOwnWheel(document.getElementById('outside'), stage)).toBe(true)
    expect(shouldWallOwnWheel(document.documentElement, stage)).toBe(true)
  })

  test('没有事件目标时默认由展墙接管', () => {
    expect(shouldWallOwnWheel(null, null)).toBe(true)
  })
})

describe('展墙 onWheel 源码契约', () => {
  test.each(['AlbumInfiniteWall.js', 'InfiniteAboutGrid.js'])(
    '%s 必须先做滚轮归属判定再 preventDefault',
    file => {
      const body = extractOnWheel(readComponent(file))
      expect(body).not.toBe('')
      const guardAt = body.indexOf('shouldWallOwnWheel')
      const preventAt = body.indexOf('preventDefault')
      expect(guardAt).toBeGreaterThan(-1)
      expect(preventAt).toBeGreaterThan(-1)
      expect(guardAt).toBeLessThan(preventAt)
    }
  )

  test('影集展墙的滚轮监听仍挂在 window（顶栏导航胶囊须照常驱动照片墙）', () => {
    const source = readComponent('AlbumInfiniteWall.js')
    expect(source).toMatch(
      /window\.addEventListener\('wheel',\s*onWheel,\s*\{\s*passive:\s*false\s*\}\s*\)/
    )
  })

  test('影集目录列表保留原生滚动链路', () => {
    const { albumStyle } = require('../../../themes/circlelife/styles/album')
    expect(albumStyle).toMatch(
      /\.cl-album-deck-popover-list\s*\{[^}]*overflow-y:\s*auto/
    )
    expect(albumStyle).toMatch(
      /\.cl-album-deck-popover-list\s*\{[^}]*overscroll-behavior:\s*contain/
    )
  })
})
