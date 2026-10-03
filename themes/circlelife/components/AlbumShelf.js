/**
 * 影集书架：叠图原比例 + 朱砂刊头
 */
export default function AlbumShelf({ decks, onOpen }) {
  if (!decks?.length) return null

  return (
    <div className='cl-album-shelf'>
      <header className='cl-album-shelf-head'>
        <div className='cl-album-shelf-mast'>
          <span className='cl-album-shelf-kicker'>影集 · SHELF</span>
          <h1 className='cl-album-shelf-title'>全部影集</h1>
        </div>
        <p className='cl-album-shelf-desc'>点开一辑，进入长画廊</p>
      </header>
      <ul className='cl-album-shelf-grid'>
        {decks.map((deck, i) => {
          const shots = (deck.photos || [])
            .map(p => p?.url || p?.cover)
            .filter(Boolean)
            .slice(0, 3)
          const count = deck.photos?.length || 0
          return (
            <li key={deck.id || deck.name || i}>
              <button
                type='button'
                className='cl-album-shelf-card'
                onClick={() => onOpen?.(i)}
                aria-label={`打开影集 ${deck.name}`}>
                <span className='cl-album-shelf-stack' aria-hidden={!shots.length}>
                  {shots.length ? (
                    shots.map((src, si) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${deck.id || i}-${si}`}
                        src={src}
                        alt=''
                        className={`cl-album-shelf-shot cl-album-shelf-shot--${si}`}
                      />
                    ))
                  ) : (
                    <span className='cl-album-shelf-ph'>无图</span>
                  )}
                </span>
                <span className='cl-album-shelf-meta'>
                  <span className='cl-album-shelf-name'>{deck.name}</span>
                  <span className='cl-album-shelf-count'>
                    {String(count).padStart(2, '0')} 张
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
