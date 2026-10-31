/**
 * 展墙滚轮归属契约测试
 *
 * 关于页的 InfiniteAboutGrid 仍使用 window 级非 passive wheel；
 * 判定规则必须让指针落在原生滚动容器内时交还浏览器。
 * 影集阅读器的目录抽屉已改为纯原生滚动列表（无 wheel 拦截），
 * 这里同时守住抽屉列表的 overflow / overscroll 契约。
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

  test('指针落在原生滚动列表内 → 交还浏览器原生滚动', () => {
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

  test('指针落在不含滚动容器的顶栏胶囊上 → 展墙照常接管', () => {
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
  test('InfiniteAboutGrid.js 必须先做滚轮归属判定再 preventDefault', () => {
    const body = extractOnWheel(readComponent('InfiniteAboutGrid.js'))
    expect(body).not.toBe('')
    const guardAt = body.indexOf('shouldWallOwnWheel')
    const preventAt = body.indexOf('preventDefault')
    expect(guardAt).toBeGreaterThan(-1)
    expect(preventAt).toBeGreaterThan(-1)
    expect(guardAt).toBeLessThan(preventAt)
  })

  test('关于展墙的滚轮监听仍挂在 window', () => {
    const source = readComponent('InfiniteAboutGrid.js')
    expect(source).toMatch(
      /window\.addEventListener\('wheel',\s*onWheel,\s*\{\s*passive:\s*false\s*\}\s*\)/
    )
  })

  test('影集目录列表使用纯原生滚动链路（无 wheel 拦截）', () => {
    const { albumReaderStyle } = require('../../../themes/circlelife/styles/albumReader')
    const reader = readComponent('AlbumReader.js')
    expect(albumReaderStyle).toMatch(
      /#indexOverlay \.index-list\s*\{[^}]*overflow-y:\s*auto/
    )
    expect(albumReaderStyle).toMatch(
      /#indexOverlay \.index-list\s*\{[^}]*overscroll-behavior:\s*contain/
    )
    expect(reader).not.toContain("addEventListener('wheel'")
  })
})
