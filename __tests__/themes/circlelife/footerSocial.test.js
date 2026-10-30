import { fireEvent, render, screen } from '@testing-library/react'
import { siteConfig } from '@/lib/config'
import { FooterSocial } from '@/themes/circlelife/components/FooterSocial'

jest.mock('@/lib/config', () => ({ siteConfig: jest.fn() }))

const applyConfig = values => {
  siteConfig.mockImplementation((key, fallback = '') =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback
  )
}

describe('circlelife 页脚社交通道', () => {
  beforeEach(() => applyConfig({}))

  test('三项都未配置时不渲染整行', () => {
    const { container } = render(<FooterSocial />)
    expect(container).toBeEmptyDOMElement()
  })

  test('只配置二维码时只出现微信按钮', () => {
    applyConfig({ CONTACT_WECHAT_QR: '/images/wechat-public-qr.png' })
    render(<FooterSocial />)
    expect(
      screen.getByRole('button', { name: '微信公众号二维码' })
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  test('小红书 / 网易云 / GitHub 渲染为安全外链，空值隐藏', () => {
    applyConfig({
      CONTACT_XIAOHONGSHU: 'https://www.xiaohongshu.com/user/profile/abc',
      CONTACT_NETEASE: '  https://music.163.com/#/user/home?id=42  ',
      CONTACT_GITHUB: 'https://github.com/trialos'
    })
    render(<FooterSocial />)

    const xhs = screen.getByRole('link', { name: '小红书' })
    expect(xhs).toHaveAttribute(
      'href',
      'https://www.xiaohongshu.com/user/profile/abc'
    )
    expect(xhs).toHaveAttribute('target', '_blank')
    expect(xhs).toHaveAttribute('rel', 'noopener noreferrer')

    const ncm = screen.getByRole('link', { name: '网易云音乐' })
    expect(ncm).toHaveAttribute(
      'href',
      'https://music.163.com/#/user/home?id=42'
    )
    expect(ncm).toHaveAttribute('target', '_blank')

    const github = screen.getByRole('link', { name: 'GitHub' })
    expect(github).toHaveAttribute('href', 'https://github.com/trialos')
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('javascript: 等脏值不渲染', () => {
    applyConfig({
      CONTACT_XIAOHONGSHU: 'javascript:alert(1)',
      CONTACT_NETEASE: 'ftp://example.com/music',
      CONTACT_WECHAT_QR: 'javascript:alert(1)'
    })
    const { container } = render(<FooterSocial />)
    expect(container).toBeEmptyDOMElement()
  })

  test('点击微信按钮开合二维码，ESC 关闭并交还焦点', () => {
    applyConfig({ CONTACT_WECHAT_QR: '/images/wechat-public-qr.png' })
    render(<FooterSocial />)

    const trigger = screen.getByRole('button', { name: '微信公众号二维码' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const img = screen.getByRole('img', { name: '微信公众号二维码' })
    expect(img).toHaveAttribute('src', '/images/wechat-public-qr.png')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    expect(
      screen.queryByRole('img', { name: '微信公众号二维码' })
    ).not.toBeInTheDocument()
  })

  test('点击弹层外部关闭二维码', () => {
    applyConfig({ CONTACT_WECHAT_QR: '/images/wechat-public-qr.png' })
    render(<FooterSocial />)

    const trigger = screen.getByRole('button', { name: '微信公众号二维码' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('焦点离开后关闭二维码', () => {
    applyConfig({ CONTACT_WECHAT_QR: '/images/wechat-public-qr.png' })
    render(<FooterSocial />)

    const trigger = screen.getByRole('button', { name: '微信公众号二维码' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.blur(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('二维码加载失败时显示兜底文案', () => {
    applyConfig({ CONTACT_WECHAT_QR: '/images/missing.png' })
    render(<FooterSocial />)

    fireEvent.click(
      screen.getByRole('button', { name: '微信公众号二维码' })
    )
    fireEvent.error(screen.getByRole('img', { name: '微信公众号二维码' }))
    expect(screen.getByText('二维码加载失败')).toBeInTheDocument()
  })
})
