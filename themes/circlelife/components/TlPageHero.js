import PageMast from './PageMast'

/**
 * 列表类页面统一页头 → PageMast
 */
export default function TlPageHero({ eyebrow, title, description }) {
  return (
    <PageMast
      eyebrow={eyebrow}
      title={title}
      description={description}
      className='cl-page-mast--list'
    />
  )
}
