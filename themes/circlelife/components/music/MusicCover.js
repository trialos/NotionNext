import { useState } from 'react'

const TONES = ['ink', 'plum', 'rust', 'olive', 'sand']

/** 占位封面的色调：按 ID 稳定取。随机数会让服务端与水合各拿一色，观感跳动 */
export function sleeveTone(seed = '') {
  const text = String(seed)
  if (!text) return TONES[0]
  let sum = 0
  for (let i = 0; i < text.length; i += 1) {
    sum = (sum * 31 + text.charCodeAt(i)) % 9973
  }
  return TONES[sum % TONES.length]
}

/** 占位封面上的首字：拉丁取大写首字母，中文取第一字 */
export function coverInitial(title = '') {
  const text = String(title).trim()
  if (!text) return '♪'
  return /^[\x00-\x7F]/.test(text) ? text[0].toUpperCase() : text[0]
}

/**
 * 唱片封面。尺寸与比例由外层封面框（.cl-music-*-cover）决定，这里只负责两种形态：
 * 真图（网易云 CDN，档位已由 lib/music/images.js 按显示宽算好）或纸感占位。
 *
 * referrerPolicy=no-referrer 是必须的：网易云 CDN 按 Referer 拒绝站内引用，
 * 带着本站 Referer 请求会整片裂图。
 */
export default function MusicCover({ src, seed = '', title = '', alt = '', priority = false }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span
        className={`cl-music-sleeve cl-music-sleeve--${sleeveTone(seed || title)}`}
        aria-hidden='true'>
        <span className='cl-music-sleeve-mark'>{coverInitial(title || seed)}</span>
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className='cl-music-img'
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding='async'
      referrerPolicy='no-referrer'
      onError={() => setFailed(true)}
    />
  )
}
