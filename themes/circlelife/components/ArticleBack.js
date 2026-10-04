import { useRouter } from 'next/router'

/**
 * 文章返回：优先 history.back，否则回首页
 */
export default function ArticleBack({ className = '' }) {
  const router = useRouter()
  const go = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }
  return (
    <button
      type='button'
      className={`cl-article-back ${className}`.trim()}
      onClick={go}>
      ← 返回
    </button>
  )
}
