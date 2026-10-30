import SmartLink from '@/components/SmartLink'

export function ArcMark({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 120 120'
      fill='none'
      className={className}
      aria-hidden='true'
      style={{ flex: 'none', color: 'var(--cl-text)' }}>
      <circle
        cx='60'
        cy='60'
        r='42'
        stroke='currentColor'
        strokeWidth='1.2'
        opacity='0.16'
      />
      <path
        d='M25.6 84.1 A42 42 0 0 1 98.1 42.2'
        stroke='currentColor'
        strokeWidth='4.2'
        strokeLinecap='round'
      />
      <circle cx='98.1' cy='42.2' r='6.4' fill='var(--cl-accent)' />
    </svg>
  )
}

/**
 * 品牌锁头：弧标 + 中文在上、英文在下。
 * @param {boolean} compact 抽屉顶栏用的小号（弧标 26）；页脚用默认 32
 * @param {boolean} hideEn 只显示弧标 + 中文名
 */
export function BrandLockup({
  compact = false,
  href = '/',
  className = '',
  hideEn = false
}) {
  const mark = compact ? 26 : 32

  const inner = (
    <span className={`cl-lockup inline-flex items-center gap-2.5 ${className}`}>
      <ArcMark size={mark} className='cl-lockup-mark' />
      <span className='cl-lockup-text flex min-w-0 flex-col leading-none'>
        <span
          className='cl-lockup-cn font-medium tracking-[0.04em] text-[var(--cl-text)]'
          style={{ fontFamily: 'var(--cl-font-display)' }}
          translate='no'>
          时光的弧线
        </span>
        {!hideEn && (
          <span
            className='cl-lockup-en uppercase tracking-[0.16em] text-[var(--cl-muted)]'
            style={{ fontFamily: 'var(--cl-font-mono)' }}
            translate='no'>
            Circle of Life
          </span>
        )}
      </span>
    </span>
  )

  if (!href) return inner

  // 无障碍名直接取可见文字，不用 aria-label 覆盖（label-content-name-mismatch）。
  return (
    <SmartLink
      href={href}
      className='cl-brand inline-flex flex-shrink-0 no-underline hover:opacity-85'>
      {inner}
    </SmartLink>
  )
}

export default BrandLockup
