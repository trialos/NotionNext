import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import BeiAnSite from '@/components/BeiAnSite'
import CopyRightDate from '@/components/CopyRightDate'
import PoweredBy from '@/components/PoweredBy'

export const Footer = () => {
  return (
    <footer className='tl-footer relative z-10 mt-auto w-full px-4 py-8 text-sm'>
      <div className='mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left'>
        <CopyRightDate />
        <div className='flex flex-col items-center gap-1 md:items-end text-xs'>
          <div className='flex flex-wrap justify-center gap-x-2'>
            <BeiAnSite />
            <BeiAnGongAn />
          </div>
          <PoweredBy />
        </div>
      </div>
    </footer>
  )
}
