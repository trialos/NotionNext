import { useGlobal } from '@/lib/global'
import { useEffect, useRef } from 'react'

/**
 * 文章锁；通过此组件校验密码访问文章
 */
export const PostLock = props => {
  const { validPassword } = props
  const { locale } = useGlobal()

  const submitPassword = () => {
    const p = document.getElementById('password')
    if (!validPassword(p?.value)) {
      const tips = document.getElementById('tips')
      if (tips) {
        tips.innerHTML = ''
        tips.innerHTML = `<div class='text-red-500 animate__shakeX animate__animated'>${locale.COMMON.PASSWORD_ERROR}</div>`
      }
    }
  }
  const passwordInputRef = useRef(null)
  useEffect(() => {
    passwordInputRef.current?.focus()
  }, [])

  return (
    <div className='flex w-full justify-center py-16'>
      <div className='cl-card w-full max-w-md space-y-4 p-8 text-center'>
        <div className='text-sm font-medium text-[var(--cl-text)]'>
          {locale.COMMON.ARTICLE_LOCK_TIPS}
        </div>
        <div className='cl-search-bar flex overflow-hidden'>
          <input
            id='password'
            type='password'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                submitPassword()
              }
            }}
            ref={passwordInputRef}
            className='min-w-0 flex-1 border-0 bg-transparent py-3 pl-4 text-sm text-[var(--cl-text)] outline-none'
          />
          <button
            type='button'
            onClick={submitPassword}
            className='border-l border-[var(--cl-border)] bg-[var(--cl-accent-soft)] px-4 text-sm font-medium text-[var(--cl-accent)] hover:opacity-90'>
            <i className='fas fa-key mr-1' aria-hidden='true' />
            {locale.COMMON.SUBMIT}
          </button>
        </div>
        <div id='tips' />
      </div>
    </div>
  )
}
