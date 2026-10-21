import { useEffect, useRef } from 'react'
import { ARCHIVE_ALL } from './archiveFilter'

const TAG_PANEL_ID = 'archive-tag-index-panel'

function formatCount(count) {
  return String(count || 0).padStart(2, '0')
}

function CategoryTrack({
  facets,
  activeCategoryKey,
  archiveRange,
  onCategoryChange
}) {
  return (
    <div className='cl-archive-cats'>
      <div className='cl-archive-cats__row'>
        <div
          className='cl-archive-cats__track'
          role='group'
          aria-label='按分类筛选'
        >
          {facets.categories.map(category => {
            const label =
              category.key === ARCHIVE_ALL ? '全部' : category.name || '未分类'
            return (
              <button
                key={category.key}
                type='button'
                className='cl-archive-cat'
                aria-pressed={activeCategoryKey === category.key}
                aria-label={`${label}，${category.count} 篇`}
                onClick={() => onCategoryChange(category.key)}
              >
                <span>{label}</span>
                <span className='cl-archive-cat__count' aria-hidden='true'>
                  {formatCount(category.count)}
                </span>
              </button>
            )
          })}
        </div>
        {archiveRange ? (
          <span className='cl-archive-cats__range'>{archiveRange}</span>
        ) : null}
      </div>
    </div>
  )
}

function TagRow({ label, count, selected, all = false, onClick }) {
  return (
    <button
      type='button'
      className={`cl-archive-tagrow${all ? ' cl-archive-tagrow--all' : ''}`}
      aria-pressed={selected}
      aria-label={`${label}，${count} 篇`}
      onClick={onClick}
    >
      <span className='cl-archive-tagrow__dot' aria-hidden='true' />
      <span className='cl-archive-tagrow__label'>{label}</span>
      <span className='cl-archive-tagrow__leader' aria-hidden='true' />
      <span className='cl-archive-tagrow__count' aria-hidden='true'>
        {formatCount(count)}
      </span>
    </button>
  )
}

export default function ArchiveIndex({
  facets,
  activeCategoryKey,
  activeTagKey,
  activeCategoryName,
  activeTagName,
  archiveRange,
  collapsed,
  onCategoryChange,
  onTagChange,
  onToggleCollapsed,
  children
}) {
  const activeScope =
    facets.scopes.get(activeCategoryKey) || facets.scopes.get(ARCHIVE_ALL)
  const isAllCategory = activeCategoryKey === ARCHIVE_ALL
  const title = isAllCategory
    ? '全站标签索引'
    : `「${activeCategoryName || '未分类'}」标签索引`
  const allRowLabel = isAllCategory
    ? '全部标签'
    : `全部「${activeCategoryName || '未分类'}」文章`
  const tags = activeScope?.tags || []
  const collapsedValue = activeTagName ? `#${activeTagName}` : allRowLabel
  const hasTag = activeTagKey !== ARCHIVE_ALL
  const expandRef = useRef(null)
  const collapseRef = useRef(null)
  const previousCollapsed = useRef(collapsed)

  useEffect(() => {
    if (previousCollapsed.current === collapsed) return
    previousCollapsed.current = collapsed
    if (
      typeof window === 'undefined' ||
      !window.matchMedia('(max-width: 767px)').matches
    ) {
      return
    }
    if (collapsed) {
      expandRef.current?.focus({ preventScroll: true })
    } else {
      collapseRef.current?.focus({ preventScroll: true })
    }
  }, [collapsed])

  return (
    <>
      <CategoryTrack
        facets={facets}
        activeCategoryKey={activeCategoryKey}
        archiveRange={archiveRange}
        onCategoryChange={onCategoryChange}
      />

      <div className='cl-archive-body'>
        <aside className='cl-archive-rail'>
          <section
            className={`cl-archive-tagindex${collapsed ? ' is-collapsed' : ''}`}
            aria-label='标签索引'
          >
            <div className='cl-archive-tagbar'>
              <div className='cl-archive-tagbar__inner'>
                <span className='cl-archive-tagbar__label'>标签索引</span>
                <span className='cl-archive-tagbar__value'>
                  {collapsedValue}
                </span>
                <span className='cl-archive-tagbar__actions'>
                  <button
                    ref={expandRef}
                    type='button'
                    aria-expanded={false}
                    aria-controls={TAG_PANEL_ID}
                    onClick={onToggleCollapsed}
                  >
                    展开
                  </button>
                  {hasTag ? (
                    <button
                      type='button'
                      className='is-muted'
                      onClick={() => onTagChange(ARCHIVE_ALL)}
                    >
                      清除
                    </button>
                  ) : null}
                </span>
              </div>
            </div>

            <div className='cl-archive-tagindex__panel' id={TAG_PANEL_ID}>
              <div className='cl-archive-tagindex__head'>
                <h2 className='cl-archive-tagindex__title'>{title}</h2>
                <button
                  ref={collapseRef}
                  type='button'
                  className='cl-archive-tagindex__collapse'
                  aria-expanded={!collapsed}
                  aria-controls={TAG_PANEL_ID}
                  onClick={onToggleCollapsed}
                >
                  收起
                </button>
              </div>

              <div
                className='cl-archive-taggrid'
                role='group'
                aria-label='按标签筛选'
              >
                <TagRow
                  all
                  label={allRowLabel}
                  count={activeScope?.postCount || 0}
                  selected={activeTagKey === ARCHIVE_ALL}
                  onClick={() => onTagChange(ARCHIVE_ALL)}
                />
                {tags.map(tag => (
                  <TagRow
                    key={tag.key}
                    label={`#${tag.name}`}
                    count={tag.count}
                    selected={activeTagKey === tag.key}
                    onClick={() => onTagChange(tag.key)}
                  />
                ))}
                {tags.length === 0 ? (
                  <p className='cl-archive-taghint'>该分类下暂无标签</p>
                ) : null}
              </div>
            </div>
          </section>
        </aside>

        <div className='cl-archive-main'>{children}</div>
      </div>
    </>
  )
}
