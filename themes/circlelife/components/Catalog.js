import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 文章目录：细轨墨线 + 当前章节高亮
 */
const Catalog = ({ toc }) => {
  const tRef = useRef(null)
  const tocIdsRef = useRef([])
  const [activeSection, setActiveSection] = useState(null)

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
      const index = tocIdsRef.current.indexOf(currentSectionId) || 0
      tRef?.current?.scrollTo({ top: 28 * index, behavior: 'smooth' })
    }, 200),
    [activeSection]
  )

  useEffect(() => {
    window.addEventListener('scroll', actionSectionScrollSpy, { passive: true })
    actionSectionScrollSpy()
    return () => window.removeEventListener('scroll', actionSectionScrollSpy)
  }, [actionSectionScrollSpy])

  if (!toc || toc.length < 1) return null

  tocIdsRef.current = []

  return (
    <div className='cl-toc px-1 pb-2 pt-1'>
      <div className='cl-toc-scroll overflow-y-auto overscroll-none' ref={tRef}>
        <nav className='cl-toc-nav' aria-label='目录'>
          {toc.map(tocItem => {
            const id = uuidToId(tocItem.id)
            tocIdsRef.current.push(id)
            const active = activeSection === id
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`cl-toc-item ${active ? 'is-active' : ''}`}
                style={{ paddingLeft: 12 + tocItem.indentLevel * 12 }}>
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
