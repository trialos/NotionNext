import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import BeiAnSite from '@/components/BeiAnSite'
import CopyRightDate from '@/components/CopyRightDate'
import { siteConfig } from '@/lib/config'
import { BrandLockup } from './BrandLockup'

export const Footer = () => {
  const description = siteConfig('DESCRIPTION')

  return (
    <footer className='cl-footer relative z-10 mt-auto w-full px-4 py-10 text-sm'>
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-4 text-center'>
        <BrandLockup compact href='/' />
        {description && (
          <p
            className='m-0 max-w-md text-xs leading-relaxed text-[var(--cl-muted)]'
            style={{ fontFamily: 'var(--cl-font-mono)' }}>
            {description}
          </p>
        )}
        <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[var(--cl-faint)]'>
          <CopyRightDate />
          <BeiAnSite />
          <BeiAnGongAn />
        </div>
      </div>
    </footer>
  )
}
