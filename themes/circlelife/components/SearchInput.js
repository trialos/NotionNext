import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useImperativeHandle, useRef, useState } from 'react'

let lock = false

/**
 * 搜索输入框
 */
const SearchInput = ({ currentTag, keyword, cRef }) => {
  const { locale } = useGlobal()
  const router = useRouter()
  const searchInputRef = useRef(null)
  useImperativeHandle(cRef, () => {
    return {
      focus: () => {
        searchInputRef?.current?.focus()
      }
    }
  })
  const handleSearch = () => {
    const key = searchInputRef.current.value
    if (key && key !== '') {
      router.push({ pathname: '/search/' + key }).then(() => {})
    } else {
      router.push({ pathname: '/' }).then(() => {})
    }
  }
  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      cleanSearch()
    }
  }
  const cleanSearch = () => {
    searchInputRef.current.value = ''
    setShowClean(false)
  }
  function lockSearchInput() {
    lock = true
  }

  function unLockSearchInput() {
    lock = false
  }
  const [showClean, setShowClean] = useState(false)
  const updateSearchKey = val => {
    if (lock) {
      return
    }
    searchInputRef.current.value = val
    if (val) {
      setShowClean(true)
    } else {
      setShowClean(false)
    }
  }

  return (
    <section className='cl-search-bar cl-card flex w-full max-w-2xl overflow-hidden'>
      <input
        ref={searchInputRef}
        type='search'
        placeholder={
          currentTag
            ? `${locale.SEARCH.TAGS} #${currentTag}`
            : `${locale.SEARCH.ARTICLES}`
        }
        aria-label={locale.NAV.SEARCH}
        autoComplete='off'
        spellCheck={false}
        enterKeyHint='search'
        className='min-w-0 flex-1 border-0 bg-transparent py-3 pl-4 text-sm text-[var(--cl-text)] placeholder:text-[var(--cl-faint)]'
        onKeyUp={handleKeyUp}
        onCompositionStart={lockSearchInput}
        onCompositionUpdate={lockSearchInput}
        onCompositionEnd={unLockSearchInput}
        onChange={e => updateSearchKey(e.target.value)}
        defaultValue={keyword || ''}
      />

      <button
        type='button'
        className='cl-icon-btn flex-shrink-0 rounded-none border-0 border-l border-[var(--cl-border)] px-4'
        onClick={handleSearch}
        aria-label={locale.NAV.SEARCH}>
        <i className='fas fa-search text-[var(--cl-muted)]' />
      </button>

      {showClean && (
        <button
          type='button'
          className='cl-icon-btn flex-shrink-0 rounded-none border-0 border-l border-[var(--cl-border)] px-3'
          onClick={cleanSearch}
          aria-label='Clear'>
          <i className='fas fa-times text-[var(--cl-muted)]' />
        </button>
      )}
    </section>
  )
}

export default SearchInput
