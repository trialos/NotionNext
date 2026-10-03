/**
 * 影集书架总览：封面墙
 */
export default function AlbumShelf({ decks, onOpen }) {
  if (!decks?.length) return null

  return (
    <div className='cl-album-shelf'>
      <header className='cl-album-shelf-head'>
        <p className='cl-kicker'>影集 · SHELF</p>
        <h1 className='cl-album-shelf-title'>全部影集</h1>
        <p className='cl-album-shelf-desc'>点开一辑，进入长画廊</p>
      </header>
      <ul className='cl-album-shelf-grid'>
        {decks.map((deck, i) => {
          const cover =
            deck.photos?.[0]?.url ||
            deck.photos?.[0]?.cover ||
            ''
          const count = deck.photos?.length || 0
          return (
            <li key={deck.id || deck.name || i}>
              <button
                type='button'
                className='cl-album-shelf-card'
                onClick={() => onOpen?.(i)}
                aria-label={`打开影集 ${deck.name}`}>
                <span className='cl-album-shelf-cover'>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt='' className='cl-album-shelf-img' />
                  ) : (
                    <span className='cl-album-shelf-ph'>无封面</span>
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
