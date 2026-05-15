import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

/**
 * 关联推荐文章
 * @param {prev,next} param0
 * @returns
 */
export default function ArticleRecommend({ recommendPosts, siteInfo }) {
  const { locale } = useGlobal()

  if (
    !siteConfig('HEXO_ARTICLE_RECOMMEND', null, CONFIG) ||
    !recommendPosts ||
    recommendPosts.length === 0
  ) {
    return <></>
  }

  return (
    <div className='pt-8'>
      <div className=' mb-2 px-1 flex flex-nowrap justify-between'>
        <div className='dark:text-gray-300'>
          <i className='mr-2 fas fa-thumbs-up' />
          {locale.COMMON.RELATE_POSTS}
        </div>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {recommendPosts.map(post => {
          const headerImage = post?.pageCoverThumbnail
            ? post.pageCoverThumbnail
            : siteInfo?.pageCover

          return (
            <SmartLink
              key={post.id}
              title={post.title}
              href={post?.href}
              passHref
              className='flex h-40 cursor-pointer overflow-hidden'>
              <div className='h-full w-full relative isolate group'>
                <LazyImage
                  src={headerImage}
                  className='absolute inset-0 z-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110 group-hover:brightness-50'
                />

                {/* 整图半透明蒙层：统一压暗封面，避免只遮文字区、与图上文字仍打架 */}
                <div
                  aria-hidden
                  className='pointer-events-none absolute inset-0 z-[5] bg-black/40 backdrop-blur-[2px] transition-colors duration-300 supports-[backdrop-filter]:backdrop-blur-sm group-hover:bg-black/50'
                />

                <div className='relative z-20 flex h-full w-full items-center justify-center duration-300'>
                  <div className='max-w-full px-4 text-center text-lg font-bold text-white shadow-text select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]'>
                    {post.title}
                  </div>
                </div>
              </div>
            </SmartLink>
          )
        })}
      </div>
    </div>
  )
}
