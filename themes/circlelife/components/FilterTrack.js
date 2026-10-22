/**
 * 全站分类轨道：归档分类栏 / 影集标签栏共用
 *
 * 样式唯一真源 = styles/filterTrack.js（filterTrackStyle）
 * 两页的 DOM 结构完全同构，只有数据与 onSelect 回调不同：
 *   · 归档页：facets.categories（key = 分类键），onSelect = onCategoryChange
 *   · 影集页：categories（key = 影集标签），onSelect = setSelectedTag
 */

/** 计数补零到两位（归档 30/14/01，影集 06/02/01/02） */
export function formatCount(count) {
  return String(count || 0).padStart(2, '0')
}

export default function FilterTrack({
  items = [], // [{ key, label, count }]
  activeKey,
  onSelect,
  range = '', // 右端时间跨度（≥1024px 显示）
  unit = '篇', // 计量的单位，仅用于 aria-label
  ariaLabel = '按分类筛选',
  className = ''
}) {
  if (!items.length) return null

  return (
    <div className={`cl-cat-track ${className}`.trim()}>
      <div className='cl-cat-track__row'>
        <div
          className='cl-cat-track__items'
          role='group'
          aria-label={ariaLabel}
        >
          {items.map(item => {
            const isSelected = item.key === activeKey
            return (
              <button
                key={item.key}
                type='button'
                className='cl-cat-track__item'
                aria-pressed={isSelected}
                aria-label={`${item.label}，共 ${item.count} ${unit}`}
                onClick={() => onSelect?.(item.key)}
              >
                <span>{item.label}</span>
                <span className='cl-cat-track__count' aria-hidden='true'>
                  {formatCount(item.count)}
                </span>
              </button>
            )
          })}
        </div>
        {range ? <span className='cl-cat-track__range'>{range}</span> : null}
      </div>
    </div>
  )
}
