import React from 'react'
import { render, screen } from '@testing-library/react'
import SmartLink from '@/components/SmartLink'

jest.mock('next/link', () => {
  const ReactModule = require('react')
  return {
    __esModule: true,
    default: ({ href, children }) =>
      ReactModule.createElement(
        'a',
        {
          href: typeof href === 'string' ? href : href?.pathname,
          'data-query':
            href && typeof href === 'object' && href.query
              ? JSON.stringify(href.query)
              : undefined
        },
        children
      )
  }
})

const setSearch = search => {
  window.history.pushState({}, '', `/${search}`)
}

describe('SmartLink 跨页 query 透传', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  test('归档筛选 category/tag 不注入首页链接，theme 仍保留', () => {
    setSearch('?category=cat&tag=tag&theme=dark&page=2')
    render(<SmartLink href='/'>首页</SmartLink>)
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute(
      'href',
      '/?theme=dark'
    )
  })

  test('搜索关键词 s 与跳评论 target 也不跨页透传', () => {
    setSearch('?s=abc&target=comment&theme=dark')
    render(<SmartLink href='/'>首页</SmartLink>)
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute(
      'href',
      '/?theme=dark'
    )
  })

  test('href 自带的 category 不被覆盖，归档筛选链接仍可直达', () => {
    setSearch('?category=old&theme=dark')
    render(<SmartLink href='/archive?category=new'>分类</SmartLink>)
    expect(screen.getByRole('link', { name: '分类' })).toHaveAttribute(
      'href',
      '/archive?category=new&theme=dark'
    )
  })

  test('对象形式 href 同样不注入 category/tag', () => {
    setSearch('?category=cat&tag=tag&theme=dark')
    render(
      <SmartLink href={{ pathname: '/page/[page]', query: { s: 'abc' } }}>
        下一页
      </SmartLink>
    )
    const link = screen.getByRole('link', { name: '下一页' })
    expect(JSON.parse(link.getAttribute('data-query'))).toEqual({
      s: 'abc',
      theme: 'dark'
    })
  })

  test('外链不注入任何 query', () => {
    setSearch('?category=cat&theme=dark')
    render(<SmartLink href='https://example.com/x'>外链</SmartLink>)
    expect(screen.getByRole('link', { name: '外链' })).toHaveAttribute(
      'href',
      'https://example.com/x'
    )
  })
})
