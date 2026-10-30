import { useEffect, useId, useRef, useState } from 'react'
import { siteConfig } from '@/lib/config'
import { BrandGlyph } from './brandIcons'

const isHttpUrl = value =>
  typeof value === 'string' && /^https?:\/\//i.test(value.trim())

const normalizeLink = value => (isHttpUrl(value) ? value.trim() : '')

const normalizeImage = value => {
  const url = typeof value === 'string' ? value.trim() : ''
  if (isHttpUrl(url) || url.startsWith('/')) return url
  return ''
}

/**
 * 页脚社交通道：公众号二维码 + 小红书 / 网易云外链。
 * 数据全部来自 Notion CONFIG 配置表，空值即隐藏。
 */
export function FooterSocial() {
  const qrCode = normalizeImage(siteConfig('CONTACT_WECHAT_QR', ''))
  const channels = [
    {
      icon: 'xiaohongshu',
      label: '小红书',
      href: normalizeLink(siteConfig('CONTACT_XIAOHONGSHU', ''))
    },
    {
      icon: 'netease',
      label: '网易云音乐',
      href: normalizeLink(siteConfig('CONTACT_NETEASE', ''))
    },
    {
      icon: 'github',
      label: 'GitHub',
      href: normalizeLink(siteConfig('CONTACT_GITHUB', ''))
    }
  ].filter(channel => channel.href)

  const [qrOpen, setQrOpen] = useState(false)
  const [qrError, setQrError] = useState(false)
  const qrRootRef = useRef(null)
  const qrButtonRef = useRef(null)
  const qrPanelId = useId()

  useEffect(() => {
    if (!qrOpen) return
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setQrOpen(false)
        qrButtonRef.current?.focus()
      }
    }
    const handlePointerDown = event => {
      if (
        qrRootRef.current &&
        !qrRootRef.current.contains(event.target)
      ) {
        setQrOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [qrOpen])

  if (!qrCode && channels.length === 0) return null

  return (
    <div className='cl-footer-social' role='group' aria-label='关注与外部链接'>
      {qrCode ? (
        <div
          className='cl-footer-qr'
          ref={qrRootRef}
          onPointerEnter={event => {
            if (event.pointerType === 'mouse') setQrOpen(true)
          }}
          onPointerLeave={event => {
            if (event.pointerType === 'mouse') setQrOpen(false)
          }}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setQrOpen(false)
            }
          }}>
          <button
            type='button'
            ref={qrButtonRef}
            className='cl-footer-social-btn'
            aria-label='微信公众号二维码'
            title='微信公众号'
            aria-expanded={qrOpen}
            aria-controls={qrOpen ? qrPanelId : undefined}
            onClick={() => setQrOpen(open => !open)}>
            <BrandGlyph name='wechat' />
          </button>
          {qrOpen ? (
            <div className='cl-footer-qr-card' id={qrPanelId}>
              <span className='cl-footer-qr-plate'>
                {qrError ? (
                  <span className='cl-footer-qr-fallback'>二维码加载失败</span>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt='微信公众号二维码'
                      width='168'
                      height='168'
                      loading='lazy'
                      decoding='async'
                      onError={() => setQrError(true)}
                    />
                  </>
                )}
              </span>
              <span className='cl-footer-qr-caption'>微信扫码关注</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {channels.map(channel => (
        <a
          key={channel.icon}
          className='cl-footer-social-btn'
          href={channel.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={channel.label}
          title={channel.label}>
          <BrandGlyph name={channel.icon} />
        </a>
      ))}
    </div>
  )
}

export default FooterSocial
