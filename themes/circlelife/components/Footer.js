import { BrandLockup } from './BrandLockup'
import { FooterSocial } from './FooterSocial'

/**
 * 页脚：品牌锁头 + 社交通道
 */
export const Footer = ({ footerRef }) => {
  return (
    <footer
      ref={footerRef}
      className='cl-footer relative z-10 mt-auto w-full text-sm'>
      <div className='cl-footer-inner'>
        <BrandLockup href='/' />
        <FooterSocial />
      </div>
    </footer>
  )
}
