import { BrandLockup } from './BrandLockup'

/**
 * 页脚：仅品牌锁头（无 description / © / 备案）
 */
export const Footer = () => {
  return (
    <footer className='cl-footer relative z-10 mt-auto w-full px-4 py-12 text-sm'>
      <div className='mx-auto flex max-w-3xl flex-col items-center justify-center'>
        <BrandLockup compact href='/' />
      </div>
    </footer>
  )
}
