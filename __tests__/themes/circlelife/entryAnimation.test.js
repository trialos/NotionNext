/**
 * 入场动效契约测试
 *
 * 背景：文章 / 归档 / 关于等页此前被 headlessui <Transition>（enterFrom 带
 * translate-y-16）包住，站内跳转时「从下往上」滑入；而影集 / 首页是直出，
 * 两页观感不一致。且该 transform 会给 position: fixed 的子元素（目录 fab、
 * 回顶按钮）造出包含块，把 fixed 变成相对定位 —— 实测文章页动画期间回顶按钮
 * right 从 1373.8 漂到 1361（偏约 13px）。
 *
 * 设计规范（circlelife-DESIGN.md §2.2）要求：首屏淡入是「唯一动效入口，纯 CSS
 * 驱动」「只淡入、不位移」。故 JS 位移入场必须下线，CSS 关键帧里也不得再有
 * transform —— 否则等于换个地方重犯同一个错。
 */
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve(process.cwd())
const readFile = (...parts) =>
  fs.readFileSync(path.join(rootDir, ...parts), 'utf8')

const themeIndexSource = readFile('themes', 'circlelife', 'index.js')
const { commonStyle } = require('../../../themes/circlelife/styles/common')

/** 去掉注释后再断言 —— 源码里有一段注释在说明「这里曾用过 <Transition>」，
 *  否则注释文本会把自己判成"仍在使用"。 */
const stripComments = src =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const themeCode = stripComments(themeIndexSource)

describe('circlelife 入场动效', () => {
  test('主题不再用 headlessui Transition 做位移入场', () => {
    expect(themeCode).not.toContain("from '@headlessui/react'")
    expect(themeCode).not.toContain('<Transition')
    expect(themeCode).not.toContain('translate-y-16')
    expect(themeCode).not.toContain('enterFrom=')
    expect(themeCode).not.toContain('leaveFrom=')
  })

  test('主题不再依赖 onLoading（原本只服务于 Transition 的 show）', () => {
    expect(themeCode).not.toContain('onLoading')
  })

  test('所有页面共用同一块直出容器（内容与 slotTop 都不丢）', () => {
    expect(themeIndexSource).toContain("<div className='w-full'>")
    expect(themeIndexSource).toContain('{props.slotTop}')
    expect(themeIndexSource).toContain('{children}')
  })

  test('纯 CSS 淡入仍在，且只动 opacity（不给 fixed 子元素造包含块）', () => {
    expect(commonStyle).toContain('@keyframes clContentIn')
    const keyframes = commonStyle.match(
      /@keyframes clContentIn \{([\s\S]*?)\n\s{6}\}/
    )
    expect(keyframes).not.toBeNull()
    expect(keyframes[1]).toContain('opacity')
    expect(keyframes[1]).not.toContain('transform')
    expect(keyframes[1]).not.toContain('translate')
  })

  test('#main-content 仍引用该纯 CSS 淡入（首屏直达仍有淡入）', () => {
    expect(commonStyle).toContain('#theme-circlelife #main-content')
    expect(commonStyle).toContain('animation: clContentIn')
  })
})
