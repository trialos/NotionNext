import { useEffect, useRef } from 'react'
import { ARCHIVE_ALL } from './archiveFilter'
import FilterTrack, { formatCount } from './FilterTrack'

const TAG_PANEL_ID = 'archive-tag-index-panel'

function CategoryTrack({
  facets,
  activeCategoryKey,
  archiveRange,
  onCategoryChange
}) {
  return (
    <FilterTrack
      items={facets.categories.map(category => ({
        key: category.key,
        label: category.key === ARCHIVE_ALL ? '全部' : category.name || '未分类',
        count: category.count
      }))}
      activeKey={activeCategoryKey}
      onSelect={onCategoryChange}
      range={archiveRange}
      unit='篇'
      ariaLabel='按分类筛选'
    />
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
  expanded = false,
  onCategoryChange,
  onTagChange,
  onToggleExpanded,
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
  const barValue = activeTagName ? `#${activeTagName}` : allRowLabel
  const hasTag = activeTagKey !== ARCHIVE_ALL
  const expandRef = useRef(null)
  const collapseRef = useRef(null)
  const panelRef = useRef(null)
  const barRef = useRef(null)
  const previousExpanded = useRef(expanded)

  useEffect(() => {
    if (previousExpanded.current === expanded) return
    previousExpanded.current = expanded
    if (
      typeof window === 'undefined' ||
      !window.matchMedia('(max-width: 767px)').matches
    ) {
      return
    }
    // 只有焦点本就落在「即将被隐藏的控件」上时才搬运：
    // 点分类轨道时焦点在组件外，不能抢；载入时也不该抢焦点。
    const active = document.activeElement
    const focusInside =
      panelRef.current?.contains(active) || barRef.current?.contains(active)
    if (!focusInside) return
    if (expanded) {
      collapseRef.current?.focus({ preventScroll: true })
    } else {
      expandRef.current?.focus({ preventScroll: true })
    }
  }, [expanded])

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
            className={`cl-archive-tagindex${expanded ? ' is-expanded' : ''}`}
            aria-label='标签索引'
          >
            <div className='cl-archive-tagbar' ref={barRef}>
              <div className='cl-archive-tagbar__inner'>
                <span className='cl-archive-tagbar__label'>标签索引</span>
                <span className='cl-archive-tagbar__value'>
                  {barValue}
                </span>
                <span className='cl-archive-tagbar__actions'>
                  <button
                    ref={expandRef}
                    type='button'
                    aria-expanded={expanded}
                    aria-controls={TAG_PANEL_ID}
                    onClick={onToggleExpanded}
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

            <div
              className='cl-archive-tagindex__panel'
              id={TAG_PANEL_ID}
              ref={panelRef}
            >
              <div className='cl-archive-tagindex__head'>
                <h2 className='cl-archive-tagindex__title'>{title}</h2>
                <button
                  ref={collapseRef}
                  type='button'
                  className='cl-archive-tagindex__collapse'
                  aria-expanded={expanded}
                  aria-controls={TAG_PANEL_ID}
                  onClick={onToggleExpanded}
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
