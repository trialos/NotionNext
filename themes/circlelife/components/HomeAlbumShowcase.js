import { useState } from 'react'
import CanvasImage from './CanvasImage'

/**
 * 首页精选影集段 · PC 版（悬停预览，对开书页卡片）
 *
 * 保留原有「左索引 620 / 右主视觉 480」两栏框架与左右贴缘的空间感；
 * 左侧改为 4 辑纯文字编号列表（01–04 + 辑名 + →），悬停/聚焦即高亮，
 * 并把右侧切到该辑；右侧换成手机端 C 方案同一套卡片语言：
 * 带相纸边的 4:5 印相 + 题签卡叠压下缘（朱砂页码签 + 细线 + 辑名），
 * 整卡就是一个 <a>，点击进 /album?deck=<id> 章页。
 *
 * 默认展示第 1 辑；鼠标离开整个段落后复位到第 1 辑。
 * 四张卡叠放在同一栅格单元里交叉淡入（只动 opacity / visibility，
 * 不碰 transform / filter —— 首页题字 fixed 祖先链的包含块纪律）。
 *
 * 数据：只显示 Notion「精选」勾选的影集，上限由数据层截断（默认 4），不补齐；
 * 0 辑整段不渲染。手机端由 HomeAlbumShowcaseMobile 独立承载（CSS 断点二选一）。
 */

const pad = n => String(n).padStart(2, '0')

export default function HomeAlbumShowcase({ albums = [] }) {
  const [active, setActive] = useState(0)
  const list = Array.isArray(albums) ? albums.filter(Boolean) : []
  if (!list.length) return null

  const count = list.length
  const current = Math.max(0, Math.min(count - 1, active))

  return (
    <section
      className='cl-home-album'
      data-count={count}
      aria-label='精选影集'
      onMouseLeave={event => {
        // 焦点还在段内（正在 Tab 左侧某行）时不复位：
        // 否则 active 归 0 会让焦点与高亮分离，焦点落在不可见的卡片上。
        if (event.currentTarget.contains(document.activeElement)) return
        setActive(0)
      }}>
      <div className='cl-home-album-top'>
        <p className='cl-home-album-kicker'>精选影集</p>
        <p className='cl-home-album-count'>{pad(count)} 辑</p>
      </div>

      <div className='cl-home-album-body'>
        <ol className='cl-home-album-index'>
          {list.map((album, index) => (
            <li key={album.id}>
              <a
                className={`cl-home-album-row${
                  index === current ? ' is-active' : ''
                }`}
                href={album.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}>
                <span className='cl-home-album-idx'>{pad(index + 1)}</span>
                <h2 className='cl-home-album-name cl-home-album-row-name'>
                  {album.name}
                </h2>
                <span className='cl-home-album-arrow' aria-hidden='true'>
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>

        <div className='cl-home-album-showcase'>
          {list.map((album, index) => (
            <a
              key={album.id}
              className={`cl-home-album-card${
                index === current ? ' is-active' : ''
              }`}
              href={album.href}
              aria-label={`进入影集：${album.name || ''}`}
              /* 叠放层四张卡对键盘/读屏隐藏（左侧四行已提供完整入口）；
                 鼠标照样可点。这样焦点永远不会落进被淡出的卡片里。 */
              aria-hidden='true'
              tabIndex={-1}>
              <figure className='cl-home-album-plate'>
                <div className='cl-home-album-mat'>
                  <CanvasImage
                    className='cl-home-album-cover'
                    src={album.cover?.src}
                    position='center'
                  />
                </div>
              </figure>
              <div className='cl-home-album-caption'>
                <span className='cl-home-album-folio' aria-hidden='true'>
                  {pad(index + 1)} / {pad(count)}
                </span>
                <span className='cl-home-album-rule' aria-hidden='true' />
                <h2 className='cl-home-album-name cl-home-album-hero-name'>
                  {album.name}
                </h2>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
