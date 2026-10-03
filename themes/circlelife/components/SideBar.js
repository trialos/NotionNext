import { useGlobal } from '@/lib/global'
import Catalog from './Catalog'

/**
 * 侧栏：文章页只保留目录（无公告 / 分类 / 最新 / 挂件）
 */
export const SideBar = props => {
  const { locale } = useGlobal()
  const { post } = props

  if (!post?.toc || post.toc.length <= 2) {
    return null
  }

  return (
    <aside className='cl-card cl-toc-card mb-6 w-full overflow-hidden pb-3'>
      <h3 className='cl-sidebar-title'>{locale.COMMON.TABLE_OF_CONTENTS}</h3>
      <Catalog toc={post.toc} />
    </aside>
  )
}
