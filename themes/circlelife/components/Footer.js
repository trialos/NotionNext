import { BrandLockup } from './BrandLockup'
import { FooterSocial } from './FooterSocial'

/**
 * 页脚：品牌锁头 + 社交通道
 */
export const Footer = ({ footerRef }) => {
  return (
    <footer
      ref={footerRef}
      className='cl-footer relative z-10 mt-auto w-full px-4 py-8 text-sm'>
      <div className='mx-auto flex max-w-3xl flex-col items-center justify-center'>
        <BrandLockup href='/' />
        <FooterSocial />
      </div>
    </footer>
  )
}
