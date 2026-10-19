import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * 影集先锋艺术展架 (AlbumShelfStack)
 * 核心逻辑：「左定点·右滚轮」先锋艺术画廊排版（100% 还原 Per Appelgren 原生体验）：
 * 1. 左侧定点锚定 (Sticky Pinned)：标题、描述与元数据固定在视口中央左侧，滚动时位置不动，内容平滑淡入切换
 * 2. 右侧照片滚轮 (Photo Wheel)：中轴封面竖向流动，当前项处于中轴激活态时向右自然横向展开同辑伴随照片
 * 3. 顶部 Notion「专辑」自动分类聚合标签（全部、旅行、日常等）
 * 4. 底部浮动视图切换胶囊 [ 堆叠 | 网格 ]（网格支持 2~4 列自适应）
 * 5. 100% 原生拍摄比例，彻底杜绝图片裁剪与任何多余白框
 */
export default function AlbumShelfStack({ decks = [], onOpen }) {
  const [selectedTag, setSelectedTag] = useState('ALL')
  const [viewMode, setViewMode] = useState('STACK') // 'STACK' | 'GRID'
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef([])

  // 从 Notion 的「专辑 / album」字段动态提取并聚合分类标签
  const categories = useMemo(() => {
    const map = new Map()
    let total = 0

    decks.forEach(deck => {
      total++
      const tag = (deck.photos?.[0]?.albumTag || '').trim()
      if (tag) {
        map.set(tag, (map.get(tag) || 0) + 1)
      }
    })

    const list = [{ id: 'ALL', name: '全部', count: total }]
    map.forEach((count, name) => {
      list.push({ id: name, name, count })
    })
    return list
  }, [decks])

  // 按分类标签过滤
  const filteredDecks = useMemo(() => {
    if (selectedTag === 'ALL') return decks
    return decks.filter(d => (d.photos?.[0]?.albumTag || '').trim() === selectedTag)
  }, [decks, selectedTag])

  // 视口中轴吸附监听：计算卡片中心与视口中心的绝对距离，100% 精准锁定滑到正中央的影集
  useEffect(() => {
    if (typeof window === 'undefined' || viewMode !== 'STACK') return undefined

    let rafId = null
    const updateCenterActiveItem = () => {
      const centerY = window.innerHeight / 2
      let closestIndex = -1
      let minDistance = Infinity

      itemRefs.current.forEach((el, index) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const itemCenter = rect.top + rect.height / 2
        const distance = Math.abs(itemCenter - centerY)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== -1) {
        setActiveIndex(prev => (prev !== closestIndex ? closestIndex : prev))
      }
    }

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateCenterActiveItem)
    }

    if (typeof window !== 'undefined' && window.scrollY > 10) {
      updateCenterActiveItem()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [filteredDecks, viewMode])

  // 底部 Footer 避让监听：滑到视口接近底部/遇到 Footer 时自动隐退胶囊，彻底杜绝遮挡文字
  const [isNearFooter, setIsNearFooter] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const checkFooter = () => {
      const footer = document.querySelector('.cl-footer') || document.querySelector('footer')
      if (footer) {
        const rect = footer.getBoundingClientRect()
        setIsNearFooter(rect.top <= window.innerHeight - 30)
        return
      }
      const scrollBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight)
      setIsNearFooter(scrollBottom < 120)
    }

    checkFooter()
    window.addEventListener('scroll', checkFooter, { passive: true })
    window.addEventListener('resize', checkFooter, { passive: true })
    return () => {
      window.removeEventListener('scroll', checkFooter)
      window.removeEventListener('resize', checkFooter)
    }
  }, [viewMode])

  if (!decks?.length) return null

  const activeDeck = filteredDecks[activeIndex] || filteredDecks[0]
  const originalActiveIndex = decks.findIndex(d => d.id === activeDeck?.id)
  const activeFirstPhoto = activeDeck?.photos?.[0]
  const activeDate = activeFirstPhoto?.date || ''
  const activeSummary = activeFirstPhoto?.summary || '光影叙事 · 独立定格'
  const activeCount = activeDeck?.photos?.length || 0

  return (
    <div className='cl-album-stack-root'>
      {/* 顶部艺术刊头与 Notion 专辑分类标签 */}
      <header className='cl-album-stack-head'>
        <div className='cl-album-stack-mast'>
          <span className='cl-album-stack-kicker'>ARCHIVE · 影集展架</span>
          <h1 className='cl-album-stack-main-title'>全部影集</h1>
        </div>

        {/* 动态识别 Notion「专辑」的分类切换条 */}
        {categories.length > 1 && (
          <nav className='cl-album-stack-tags' aria-label='影集分类'>
            {categories.map(cat => {
              const isSelected = selectedTag === cat.id
              return (
                <button
                  key={cat.id}
                  type='button'
                  className={`cl-album-stack-tag ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedTag(cat.id)
                    setActiveIndex(0)
                  }}>
                  <span className='cl-album-stack-tag-name'>{cat.name}</span>
                  <span className='cl-album-stack-tag-count'>{cat.count}</span>
                </button>
              )
            })}
          </nav>
        )}
      </header>

      {/* STACK 先锋架构：「左定点锚定 · 右照片滚轮」 */}
      {viewMode === 'STACK' ? (
        <div className='cl-shelf-stack-container'>
          {/* 移动端专属吸顶定点中轴 HUD (Sticky Top Spine HUD)：滚动时定点不动，滚轮过中轴平滑淡入切换 */}
          <div className='cl-shelf-mobile-sticky-hud'>
            <button
              type='button'
              key={activeDeck?.id || activeIndex}
              className='cl-shelf-mobile-hud-inner cl-clickable-target'
              onClick={() => onOpen?.(originalActiveIndex >= 0 ? originalActiveIndex : activeIndex)}
              aria-label={`浏览《${activeDeck?.name}》影集`}>
              <div className='cl-shelf-mobile-hud-top'>
                <div className='cl-shelf-mobile-hud-title-wrap'>
                  <span className='cl-shelf-mobile-hud-dot' aria-hidden='true' />
                  <span className='cl-shelf-mobile-hud-index'>
                    {String(activeIndex + 1).padStart(2, '0')}/{String(filteredDecks.length).padStart(2, '0')}
                  </span>
                  <h2 className='cl-shelf-mobile-hud-name'>
                    {activeDeck?.name}
                  </h2>
                </div>
                <div className='cl-shelf-mobile-hud-badge'>
                  <span className='cl-shelf-mobile-hud-count'>{activeCount}张</span>
                  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                    <line x1='5' y1='12' x2='19' y2='12' />
                    <polyline points='12 5 19 12 12 19' />
                  </svg>
                </div>
              </div>
              {activeSummary && (
                <p className='cl-shelf-mobile-hud-desc'>
                  {activeSummary}
                </p>
              )}
            </button>
          </div>

          {/* 左侧定点锚定信息区 (Sticky Pinned)：固定在视口中，不随滚动移出视口 */}
          <aside className='cl-shelf-pinned-col' aria-label='当前影集信息'>
            <div className='cl-shelf-pinned-panel'>
              <div
                key={activeDeck?.id || activeIndex}
                className='cl-shelf-pinned-inner'>
                <div className='cl-shelf-pinned-mast'>
                  <span className='cl-shelf-pinned-dot' aria-hidden='true' />
                  <span className='cl-shelf-pinned-kicker'>
                    PROJECT · {String(activeIndex + 1).padStart(2, '0')} / {String(filteredDecks.length).padStart(2, '0')}
                  </span>
                </div>

                <h2 className='cl-shelf-pinned-title'>
                  <button
                    type='button'
                    className='cl-shelf-pinned-title-btn'
                    onClick={() => onOpen?.(originalActiveIndex >= 0 ? originalActiveIndex : activeIndex)}
                    aria-label={`进入《${activeDeck?.name}》画廊`}>
                    {activeDeck?.name}
                  </button>
                </h2>

                <p className='cl-shelf-pinned-desc'>
                  {activeSummary}
                </p>

                <div className='cl-shelf-pinned-meta'>
                  <span className='cl-shelf-pinned-count'>{activeCount} 张照片</span>
                  {activeDate && (
                    <>
                      <span className='cl-shelf-pinned-sep'>·</span>
                      <span className='cl-shelf-pinned-date'>{activeDate}</span>
                    </>
                  )}
                </div>

                <button
                  type='button'
                  className='cl-shelf-pinned-enter-btn'
                  onClick={() => onOpen?.(originalActiveIndex >= 0 ? originalActiveIndex : activeIndex)}
                  aria-label={`浏览《${activeDeck?.name}》影集`}>
                  <span>浏览影集</span>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                    <line x1='5' y1='12' x2='19' y2='12' />
                    <polyline points='12 5 19 12 12 19' />
                  </svg>
                </button>
              </div>
            </div>
          </aside>

          {/* 右侧中轴照片滚轮区 (Photo Wheel Stage) */}
          <div className='cl-shelf-wheel-col'>
            {filteredDecks.map((deck, i) => {
              const originalIndex = decks.findIndex(d => d.id === deck.id)
              const firstPhoto = deck.photos?.[0]
              const coverSrc = firstPhoto?.cover || firstPhoto?.url || ''
              const companionPhotos = deck.photos?.slice(1, 5) || []
              const count = deck.photos?.length || 0
              const isActive = activeIndex === i
              const handleOpen = () => onOpen?.(originalIndex >= 0 ? originalIndex : i)

              return (
                <section
                  key={deck.id || deck.name || i}
                  ref={el => (itemRefs.current[i] = el)}
                  data-index={i}
                  className={`cl-shelf-wheel-item ${isActive ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}>
                  {/* 核心摄影展架：中央主图 + 右侧自然延展伴随图 */}
                  <div className='cl-shelf-wheel-stage'>
                    {/* 中央主封面图 */}
                    <div className='cl-shelf-wheel-cover-wrap'>
                      <button
                        type='button'
                        className='cl-shelf-wheel-cover cl-clickable-target'
                        onClick={handleOpen}
                        aria-label={`浏览《${deck.name}》影集，共 ${count} 张照片`}>
                        {coverSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverSrc}
                            alt={deck.name}
                            width='780'
                            height='520'
                            decoding='async'
                            loading={i === 0 ? 'eager' : 'lazy'}
                            fetchPriority={i === 0 ? 'high' : undefined}
                            className='cl-shelf-wheel-cover-img'
                          />
                        ) : (
                          <div className='cl-album-stack-ph'>暂无照片</div>
                        )}
                      </button>
                    </div>

                    {/* 右侧同辑伴随照片（激活时优雅横向铺展） */}
                    <div className='cl-shelf-wheel-aside-wrap'>
                      <div className='cl-shelf-wheel-aside-row'>
                        {companionPhotos.map((photo, pIdx) => {
                          const pSrc = photo.url || photo.cover
                          if (!pSrc) return null
                          return (
                            <button
                              type='button'
                              key={photo.id || pIdx}
                              className='cl-shelf-wheel-aside-card cl-clickable-target'
                              onClick={handleOpen}
                              aria-label={`查看《${deck.name}》伴随照片 ${pIdx + 1}`}
                              style={{
                                transitionDelay: `${pIdx * 0.05}s`
                              }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={pSrc}
                                alt={photo.caption || photo.title || ''}
                                width='300'
                                height='225'
                                decoding='async'
                                loading='lazy'
                                className='cl-shelf-wheel-aside-img'
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      ) : (
        /* GRID 紧凑瀑布流视图（备选模式，支持 2~4 列自适应铺满） */
        <div className='cl-album-stack-grid-view'>
          {filteredDecks.map((deck, i) => {
            const originalIndex = decks.findIndex(d => d.id === deck.id)
            const firstPhoto = deck.photos?.[0]
            const coverSrc = firstPhoto?.cover || firstPhoto?.url || ''
            const count = deck.photos?.length || 0
            const handleOpen = () => onOpen?.(originalIndex >= 0 ? originalIndex : i)

            return (
              <button
                type='button'
                key={deck.id || i}
                className='cl-album-stack-grid-card cl-clickable-target'
                onClick={handleOpen}
                aria-label={`进入《${deck.name}》影集，共 ${count} 张照片`}>
                <div className='cl-album-stack-grid-img-wrap'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverSrc}
                    alt={deck.name}
                    width='600'
                    height='800'
                    decoding='async'
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : undefined}
                    className='cl-album-stack-grid-img'
                  />
                </div>
                <div className='cl-album-stack-grid-info'>
                  <h3 className='cl-album-stack-grid-title'>{deck.name}</h3>
                  <span className='cl-album-stack-grid-count'>{count}张</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 底部浮动视图切换胶囊 [ 堆叠 | 网格 ]（触底遇 Footer 自动避让隐退） */}
      <div className={`cl-album-mode-capsule-wrap ${isNearFooter ? 'is-hidden-footer' : ''}`}>
        <div className='cl-album-mode-capsule' role='tablist' aria-label='影集浏览视图切换'>
          <button
            type='button'
            role='tab'
            aria-selected={viewMode === 'STACK'}
            className={`cl-album-mode-btn ${viewMode === 'STACK' ? 'is-active' : ''}`}
            onClick={() => setViewMode('STACK')}
            aria-label='切换至 堆叠 艺术展架版式'>
            <span className='cl-album-mode-dot' aria-hidden='true' />
            <span>堆叠</span>
          </button>
          <button
            type='button'
            role='tab'
            aria-selected={viewMode === 'GRID'}
            className={`cl-album-mode-btn ${viewMode === 'GRID' ? 'is-active' : ''}`}
            onClick={() => setViewMode('GRID')}
            aria-label='切换至 网格 紧凑版式'>
            <span className='cl-album-mode-dot' aria-hidden='true' />
            <span>网格</span>
          </button>
        </div>
      </div>
    </div>
  )
}
