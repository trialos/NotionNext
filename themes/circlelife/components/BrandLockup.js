import SmartLink from '@/components/SmartLink'

/**
 * 时光的弧线 lockup：弧线 mark + 中文名 + CIRCLE OF LIFE
 * collapsed：仅弧标 + 英文 Circle of Life
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
 * @param {{ compact?: boolean, collapsed?: boolean, href?: string | null, className?: string }} props
 */
export function BrandLockup({
  compact = false,
  collapsed = false,
  href = '/',
  className = ''
}) {
  const mark = collapsed ? 22 : compact ? 26 : 32
  const cn = compact ? 'text-[15px]' : 'text-base md:text-lg'
  const en = collapsed ? 'text-[9px]' : compact ? 'text-[9px]' : 'text-[10px]'

  const inner = (
    <span
      className={`cl-lockup inline-flex items-center gap-2.5 ${
        collapsed ? 'cl-lockup--collapsed' : ''
      } ${className}`}>
      <ArcMark size={mark} />
      <span className='flex min-w-0 flex-col leading-none'>
        {!collapsed ? (
          <span
            className={`cl-lockup-cn font-medium tracking-[0.04em] text-[var(--cl-text)] ${cn}`}
            style={{ fontFamily: 'var(--cl-font-display)' }}>
            时光的弧线
          </span>
        ) : null}
        <span
          className={`cl-lockup-en uppercase tracking-[0.16em] text-[var(--cl-muted)] ${en} ${
            collapsed ? 'mt-0' : 'mt-1'
          }`}
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
