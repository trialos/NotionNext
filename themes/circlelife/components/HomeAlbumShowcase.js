import CanvasImage from './CanvasImage'
import { buildAlbumView } from './homeAlbumData'

/**
 * 首页精选影集段（01 接触印相）
 *
 * 右侧一张主封面（最新勾选的一辑），左侧一列编号索引；桌面 620 / 480
 * 与上方文章段的「图 480 左 / 文 620 右」逐列镜像。
 *
 * 纯静态版面：
 * - 无 hooks、无 scroll 监听、无 sticky、无 JS 换挡
 * - 「当前是哪一辑」不再存在 —— 四辑同时在场，页面滚动就是原生滚动
 * - 索引行数 = 精选数 − 1（上限 4 辑由 pages/index.js 截断）
 *
 * 数据规则：只显示 Notion「精选」勾选的影集，不补齐；0 辑整段不渲染。
 */

const pad = n => String(n).padStart(2, '0')

function albumMeta(album) {
  const parts = []
  if (album?.count) parts.push(`${album.count} 张`)
  if (album?.date) parts.push(album.date)
  return parts.join(' · ')
}

export default function HomeAlbumShowcase({ albums = [] }) {
  if (!albums.length) return null

  const { hero, rest, total, count } = buildAlbumView(albums)
  if (!hero) return null

  return (
    <section
      className='cl-home-album'
      data-count={count}
      aria-label='精选影集'>
      <div className='cl-home-album-top'>
        <p className='cl-home-album-kicker'>精选影集</p>
        <p className='cl-home-album-count'>
          {pad(count)} 辑 · {total} 张
        </p>
      </div>

      <div className='cl-home-album-body'>
        <a className='cl-home-album-hero' href={hero.href}>
          <CanvasImage
            className='cl-home-album-cover'
            src={hero.cover?.src}
            position='center'
          />
          <div className='cl-home-album-hero-copy'>
            <span className='cl-home-album-line'>
              <span className='cl-home-album-idx'>01</span>
              <span className='cl-home-album-meta'>{albumMeta(hero)}</span>
            </span>
            <h2 className='cl-home-album-name cl-home-album-hero-name'>
              {hero.name}
            </h2>
            <span className='cl-home-album-cta'>
              进入影集 <span aria-hidden='true'>→</span>
            </span>
          </div>
        </a>

        {rest.length > 0 ? (
          <ol className='cl-home-album-index' start={2}>
            {rest.map((album, index) => (
              <li key={album.id}>
                <a className='cl-home-album-row' href={album.href}>
                  <CanvasImage
                    className='cl-home-album-thumb'
                    src={album.cover?.src}
                    position='center'
                  />
                  <div className='cl-home-album-row-copy'>
                    <span className='cl-home-album-line'>
                      <span className='cl-home-album-idx'>
                        {pad(index + 2)}
                      </span>
                      <span className='cl-home-album-meta'>
                        {albumMeta(album)}
                      </span>
                    </span>
                    <h2 className='cl-home-album-name cl-home-album-row-name'>
                      {album.name}
                    </h2>
                  </div>
                  <span className='cl-home-album-arrow' aria-hidden='true'>
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  )
}
