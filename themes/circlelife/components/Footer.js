import { BrandLockup } from './BrandLockup'

/**
 * 页脚：横向品牌锁头
 */
export const Footer = () => {
  return (
    <footer className='cl-footer relative z-10 mt-auto w-full px-4 py-8 text-sm'>
      <div className='mx-auto flex max-w-3xl flex-col items-center justify-center'>
        <BrandLockup compact layout='row' href='/' />
      </div>
    </footer>
  )
}
