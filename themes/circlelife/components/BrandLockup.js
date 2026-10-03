import SmartLink from '@/components/SmartLink'

/**
 * 时光的弧线 lockup：弧线 mark + 中文名 + CIRCLE OF LIFE
 * 与封面工具保持一致，三件套不拆开。
 */
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
 * @param {{ compact?: boolean, href?: string | null, className?: string }} props
 */
export function BrandLockup({ compact = false, href = '/', className = '' }) {
  const mark = compact ? 26 : 32
  const cn = compact ? 'text-[15px]' : 'text-base md:text-lg'
  const en = compact ? 'text-[9px]' : 'text-[10px]'

  const inner = (
    <span className={`cl-lockup inline-flex items-center gap-2.5 ${className}`}>
      <ArcMark size={mark} />
      <span className='flex min-w-0 flex-col leading-none'>
        <span
          className={`cl-lockup-cn font-medium tracking-[0.04em] text-[var(--cl-text)] ${cn}`}
          style={{ fontFamily: 'var(--cl-font-display)' }}>
          时光的弧线
        </span>
        <span
          className={`cl-lockup-en mt-1 uppercase tracking-[0.16em] text-[var(--cl-muted)] ${en}`}
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
      className='cl-brand inline-flex flex-shrink-0 no-underline hover:opacity-85'>
      {inner}
    </SmartLink>
  )
}

export default BrandLockup
