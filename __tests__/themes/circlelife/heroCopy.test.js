/**
 * @jest-environment node
 */
import { resolveHeroCopy } from '@/themes/circlelife/components/heroCopy'

describe('resolveHeroCopy', () => {
  const fallbackSummary = '时光的弧线 · 捕捉生活、人机协作与日常美学的独立光影。'

  test('只有 summary 时保持标题，不产生导语', () => {
    expect(
      resolveHeroCopy({
        summary: '这是我，尽情探索！',
        description: '',
        fallbackSummary
      })
    ).toEqual({ headline: '这是我，尽情探索！', lead: '' })
  })

  test('只有 description 时用 fallback 标题，description 成为导语', () => {
    expect(
      resolveHeroCopy({
        summary: '',
        description: '一段较长的导语。',
        fallbackSummary
      })
    ).toEqual({ headline: fallbackSummary, lead: '一段较长的导语。' })
  })

  test('summary 与 description 都有时分别作为标题和导语', () => {
    expect(
      resolveHeroCopy({
        summary: '短题眼',
        description: '第一句。第二句。',
        fallbackSummary
      })
    ).toEqual({ headline: '短题眼', lead: '第一句。第二句。' })
  })

  test('description 只有空白时视为空', () => {
    expect(
      resolveHeroCopy({
        summary: '短题眼',
        description: '  \n  ',
        fallbackSummary
      })
    ).toEqual({ headline: '短题眼', lead: '' })
  })

  test('description 与标题规范化后相同则不重复渲染', () => {
    expect(
      resolveHeroCopy({
        summary: '短 题眼',
        description: ' 短\n题眼 ',
        fallbackSummary
      })
    ).toEqual({ headline: '短 题眼', lead: '' })
  })

  test('description 与 fallback 标题相同且 summary 为空时不重复渲染', () => {
    expect(
      resolveHeroCopy({
        summary: '',
        description: fallbackSummary,
        fallbackSummary
      })
    ).toEqual({ headline: fallbackSummary, lead: '' })
  })

  test('保留导语内部换行，只裁掉首尾空白', () => {
    expect(
      resolveHeroCopy({
        summary: '短题眼',
        description: '  第一句。\n第二句。  ',
        fallbackSummary
      })
    ).toEqual({ headline: '短题眼', lead: '第一句。\n第二句。' })
  })

  test('关于页当前真实值不产生导语', () => {
    expect(
      resolveHeroCopy({
        summary: '这是我，尽情探索！',
        description: '',
        fallbackSummary
      })
    ).toEqual({ headline: '这是我，尽情探索！', lead: '' })
  })

  test('非字符串输入按空处理', () => {
    expect(
      resolveHeroCopy({
        summary: null,
        description: 123,
        fallbackSummary
      })
    ).toEqual({ headline: fallbackSummary, lead: '' })
  })
})
