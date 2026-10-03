import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'

/**
 * 文章详情元信息（等宽，贴近封面 kicker 层级）
 */
export const PostMeta = props => {
  const { post } = props
  const { locale } = useGlobal()

  return (
    <section className='cl-meta mt-2 flex flex-wrap text-xs leading-7 text-[var(--cl-muted)]'>
      <div>
        {post?.type !== 'Page' && (
          <>
            <SmartLink
              href={`/category/${post?.category}`}
              passHref
              className='cursor-pointer hover:text-[var(--cl-accent)]'>
              {post?.category}
            </SmartLink>
            <span className='mx-2 text-[var(--cl-faint)]'>·</span>
          </>
        )}

        {post?.type !== 'Page' && (
          <>
            <SmartLink
              href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
              passHref
              className='cursor-pointer hover:text-[var(--cl-accent)]'>
              {post?.publishDay}
            </SmartLink>
            <span className='mx-2 text-[var(--cl-faint)]'>·</span>
            <span className='text-[var(--cl-faint)]'>
              {locale.COMMON.LAST_EDITED_TIME}: {post?.lastEditedDay}
            </span>
            <span className='mx-2 text-[var(--cl-faint)]'>·</span>
            <span className='hidden busuanzi_container_page_pv'>
              <span className='busuanzi_value_page_pv' />
            </span>
          </>
        )}
      </div>
    </section>
  )
}
