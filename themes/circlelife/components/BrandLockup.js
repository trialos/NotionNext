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
 * collapsed：仅弧标 + Circle of Life（中文用 CSS 交叉隐藏，减少抽搐）
 */
export function BrandLockup({
  compact = false,
  collapsed = false,
  href = '/',
  className = ''
}) {
  const mark = collapsed ? 20 : compact ? 26 : 32

  const inner = (
    <span
      className={`cl-lockup inline-flex items-center gap-2 ${
        collapsed ? 'cl-lockup--collapsed' : 'cl-lockup--expanded'
      } ${className}`}>
      <ArcMark size={mark} className='cl-lockup-mark' />
      <span className='cl-lockup-text flex min-w-0 flex-col leading-none'>
        <span
          className='cl-lockup-cn font-medium tracking-[0.04em] text-[var(--cl-text)]'
          style={{ fontFamily: 'var(--cl-font-display)' }}>
          时光的弧线
        </span>
        <span
          className='cl-lockup-en uppercase tracking-[0.16em] text-[var(--cl-muted)]'
          style={{ fontFamily: 'var(--cl-font-mono)' }}>
          Circle of Life
        </span>
      </span>
    </span>
  )

  if (!href) return inner

  return (
    <SmartLink
      href={href}
      className='cl-brand inline-flex flex-shrink-0 no-underline hover:opacity-85'
      aria-label='时光的弧线 · Circle of Life'>
      {inner}
    </SmartLink>
  )
}

export default BrandLockup
