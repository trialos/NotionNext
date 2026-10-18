import SmartLink from '@/components/SmartLink'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function haystack(item) {
  return [item?.title, item?.summary, item?.category, item?.type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/**
 * 顶栏搜索：浮在当前页上，不跳转 /search。
 * 数据来自构建时写入每页的 searchIndex。
 */
export default function SearchOverlay({ open, items = [], onClose }) {
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const fine =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches
    const timer = fine
      ? window.setTimeout(() => inputRef.current?.focus(), 30)
      : 0
    const onKey = e => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      if (timer) window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items.slice(0, 8)
    return items.filter(item => haystack(item).includes(q)).slice(0, 12)
  }, [items, query])

  if (!open || !mounted) return null

  return createPortal(
    <div className='cl-search-overlay' role='presentation'>
      <button
        type='button'
        className='cl-search-overlay-mask'
        aria-label='关闭搜索'
        onClick={onClose}
      />
      <div
        className='cl-search-panel'
        role='dialog'
        aria-modal='true'
        aria-label='搜索'>
        <div className='cl-search-panel-row'>
          <i className='fas fa-search' aria-hidden='true' />
          <input
            ref={inputRef}
            type='search'
            value={query}
            name='q'
            placeholder='搜索文章或影集…'
            aria-label='搜索文章或影集'
            autoComplete='off'
            spellCheck={false}
            enterKeyHint='search'
            onChange={e => setQuery(e.target.value)}
          />
          <button type='button' className='cl-search-close' onClick={onClose}>
            关闭
          </button>
        </div>
        <ul className='cl-search-results'>
          {results.length ? (
            results.map(item => (
              <li key={`${item.type}-${item.href}`}>
                <SmartLink href={item.href} onClick={onClose}>
                  <span className='cl-search-kind'>
                    {item.type === 'Photo' ? '影集' : item.category || '文章'}
                  </span>
                  <span className='cl-search-hit'>{item.title}</span>
                  {item.summary ? (
                    <span className='cl-search-sum'>{item.summary}</span>
                  ) : null}
                </SmartLink>
              </li>
            ))
          ) : (
            <li className='cl-search-empty'>没有匹配的文章或影集</li>
          )}
        </ul>
      </div>
    </div>,
    document.body
  )
}
