import Catalog from './Catalog'

/**
 * 侧栏：桌面文章目录（手机用 MobileToc 浮层）
 */
export const SideBar = props => {
  const { post } = props

  if (!post?.toc || post.toc.length <= 2) {
    return null
  }

  return (
    <aside className='cl-card cl-toc-card cl-toc-card--desktop mb-6 w-full overflow-hidden pb-3'>
      <h2 className='cl-sidebar-title'>目录</h2>
      <Catalog toc={post.toc} />
    </aside>
  )
}
