import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 桌面目录：细轨 + 朱砂游标 + 主/子层级
 */
const Catalog = ({ toc }) => {
  const tRef = useRef(null)
  const navRef = useRef(null)
  const tocIdsRef = useRef([])
  const [activeSection, setActiveSection] = useState(null)
  const [cursorY, setCursorY] = useState(8)

  const syncCursor = useCallback(id => {
    const nav = navRef.current
    if (!nav || !id) return
    const el = nav.querySelector(`[data-toc-id="${id}"]`)
    if (!el) return
    const navBox = nav.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    const y = box.top - navBox.top + nav.scrollTop + box.height / 2 - 6
    setCursorY(Math.max(4, y))
  }, [])

  const actionSectionScrollSpy = useCallback(
    throttle(() => {
      const sections = document.getElementsByClassName('notion-h')
      let prevBBox = null
      let currentSectionId = activeSection
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        if (!currentSectionId) {
          currentSectionId = section.getAttribute('data-id')
        }
        const bbox = section.getBoundingClientRect()
        const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
        const offset = Math.max(120, prevHeight / 4)
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
          continue
        }
        break
      }
      setActiveSection(currentSectionId)
      syncCursor(currentSectionId)
      const index = tocIdsRef.current.indexOf(currentSectionId) || 0
      tRef?.current?.scrollTo({ top: 28 * index, behavior: 'smooth' })
    }, 160),
    [activeSection, syncCursor]
  )

  useEffect(() => {
    window.addEventListener('scroll', actionSectionScrollSpy, { passive: true })
    actionSectionScrollSpy()
    return () => window.removeEventListener('scroll', actionSectionScrollSpy)
  }, [actionSectionScrollSpy])

  useEffect(() => {
    syncCursor(activeSection)
  }, [activeSection, syncCursor, toc])

  if (!toc || toc.length < 1) return null

  tocIdsRef.current = []

  return (
    <div className='cl-toc px-1 pb-2 pt-1'>
      <div className='cl-toc-scroll' ref={tRef}>
        <nav className='cl-toc-nav' aria-label='目录' ref={navRef}>
          <span
            className='cl-toc-cursor'
            style={{ transform: `translateY(${cursorY}px)` }}
            aria-hidden
          />
          {toc.map(tocItem => {
            const id = uuidToId(tocItem.id)
            tocIdsRef.current.push(id)
            const active = activeSection === id
            const level = tocItem.indentLevel || 0
            const levelClass =
              level <= 0 ? 'cl-toc-item--h1' : level === 1 ? 'cl-toc-item--h2' : 'cl-toc-item--h3'
            return (
              <a
                key={id}
                href={`#${id}`}
                data-toc-id={id}
                className={`cl-toc-item ${levelClass} ${active ? 'is-active' : ''}`}
                style={{ paddingLeft: `${0.75 + level * 0.7}rem` }}
                onClick={e => {
                  e.preventDefault()
                  const el =
                    document.getElementById(id) ||
                    document.querySelector(`.notion-h[data-id="${id}"]`)
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  setActiveSection(id)
                  syncCursor(id)
                }}>
                <span className='cl-toc-item-text'>{tocItem.text}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Catalog
