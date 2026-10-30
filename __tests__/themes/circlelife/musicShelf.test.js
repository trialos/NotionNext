/**
 * 音乐展架与曲目表契约测试
 *
 * 守的是四条点错就废掉的路径，而不是像素：
 * 1. 专辑卡 → 专辑页；单曲卡 → 手记页（一张卡就是那篇 kind=Single 的手记）
 * 2. 有手记的曲目行才给标题链接与「手记」入口；没手记的整行不可点，只留外链
 * 3. 外链一律 target=_blank + rel=noopener noreferrer，图标形态带 aria-label
 * 4. 站内不出现任何播放控件；封面取不到时退回纸感占位而不是裂图
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import MusicCover, {
  coverInitial,
  sleeveTone
} from '@/themes/circlelife/components/music/MusicCover'
import MusicShelf from '@/themes/circlelife/components/music/MusicShelf'
import NoteHead from '@/themes/circlelife/components/music/NoteHead'
import TrackList from '@/themes/circlelife/components/music/TrackList'
import NcmLink from '@/themes/circlelife/components/music/NcmLink'

const albumItem = {
  kind: 'album',
  entryType: '专辑',
  id: 'page-album',
  slug: 'album-35561162',
  title: 'Cigarettes After Sex',
  artist: 'Cigarettes After Sex',
  year: 2017,
  trackCount: 10,
  href: '/music/album/album-35561162',
  cover: 'https://p1.music.126.net/abc/123.jpg?param=520y520',
  neteaseUrl: 'https://music.163.com/#/album?id=35561162',
  hasNotes: true,
  noteCount: 2
}

const singleItem = {
  kind: 'single',
  entryType: '专辑',
  id: 'page-single',
  slug: 'note-480768665',
  title: 'Apocalypse',
  noteTitle: '像一场缓慢的告别',
  artist: 'Cigarettes After Sex',
  year: 2017,
  href: '/music/note/note-480768665',
  cover: 'https://p1.music.126.net/def/456.jpg?param=520y520',
  neteaseUrl: 'https://music.163.com/#/song?id=480768665'
}

describe('展架 A', () => {
  it('专辑卡与单曲卡各自链到该去的地方，且卡片不嵌套链接', () => {
    const { container } = render(
      <MusicShelf items={[albumItem, singleItem]} />
    )
    const albumCover = container.querySelector('.cl-music-card--album .cl-music-card-cover')
    const singleCover = container.querySelector('.cl-music-card--single .cl-music-card-cover')
    expect(albumCover.getAttribute('href')).toBe(albumItem.href)
    expect(singleCover.getAttribute('href')).toBe(singleItem.href)
    // 卡片封面上只有一个 a：封面/标题是并列的两个链接，不套嵌
    expect(container.querySelectorAll('.cl-music-card-cover a')).toHaveLength(0)
    expect(container.querySelectorAll('a a')).toHaveLength(0)
  })

  it('专辑卡不给网易云外链（进专辑页再给），单曲卡给', () => {
    const { container } = render(<MusicShelf items={[albumItem, singleItem]} />)
    expect(
      container.querySelectorAll('.cl-music-card--album .cl-music-ncm')
    ).toHaveLength(0)
    const singleLink = container.querySelector('.cl-music-card--single .cl-music-ncm')
    expect(singleLink.getAttribute('href')).toBe(singleItem.neteaseUrl)
    expect(singleLink.getAttribute('target')).toBe('_blank')
    expect(singleLink.getAttribute('rel')).toContain('noopener')
  })

  it('没写正文的单曲只做展示卡：不可点、标签写「单曲」、网易云外链留在卡脚', () => {
    const { container } = render(
      <MusicShelf items={[{ ...singleItem, hasBody: false }]} />
    )
    const card = container.querySelector('.cl-music-card--single')
    expect(card).toBeTruthy()
    expect(card.querySelectorAll('a[href^="/music/"]')).toHaveLength(0)
    expect(card.querySelector('.cl-music-card-title').textContent.trim()).toBe(
      singleItem.title
    )
    expect(card.querySelector('.cl-music-kind').textContent).toBe('单曲')
    const ncm = card.querySelector('.cl-music-ncm')
    expect(ncm.getAttribute('href')).toBe(singleItem.neteaseUrl)
    expect(ncm.getAttribute('target')).toBe('_blank')
  })

  it('写了正文的单曲才是可点的手记卡，标签写「单曲手记」', () => {
    const { container } = render(
      <MusicShelf items={[{ ...singleItem, hasBody: true }]} />
    )
    const card = container.querySelector('.cl-music-card--single')
    expect(card.querySelectorAll('a[href^="/music/"]').length).toBeGreaterThan(0)
    expect(card.querySelector('.cl-music-kind').textContent).toBe('单曲手记')
  })

  it('曲数、手记标记来自数据而不是文案拼装', () => {
    render(<MusicShelf items={[albumItem, singleItem]} />)
    expect(screen.getByText('10 首')).toBeTruthy()
    expect(screen.getByText('手记')).toBeTruthy()
  })

  it('刊头不再展示「N 张唱片 · M 篇手记」计数位', () => {
    const { container } = render(<MusicShelf items={[albumItem, singleItem]} />)
    expect(container.querySelector('.cl-page-mast-aside')).toBeNull()
    expect(container.textContent).not.toMatch(/张唱片/)
  })

  it('空展架给出可执行的下一步，而不是空白页', () => {
    render(<MusicShelf items={[]} />)
    expect(screen.getByText(/发给 Qoder/)).toBeTruthy()
  })
})

describe('外链文案说清层级', () => {
  it('条目页写「网易云专辑 / 网易云歌单」（中文不加空格），曲目行仍是图标', () => {
    const { container: albumBox } = render(
      <NcmLink href='https://music.163.com/#/album?id=1' label='X' kind='专辑' />
    )
    expect(albumBox.querySelector('a').textContent).toBe('网易云专辑 ↗')
    const { container: listBox } = render(
      <NcmLink href='https://music.163.com/#/playlist?id=1' label='X' kind='歌单' />
    )
    expect(listBox.querySelector('a').textContent).toBe('网易云歌单 ↗')
    const { container: iconBox } = render(
      <NcmLink href='https://music.163.com/#/song?id=1' label='K.' compact />
    )
    expect(iconBox.querySelector('a').textContent).toBe('↗')
    expect(iconBox.querySelector('a').getAttribute('aria-label')).toBe('在网易云打开《K.》')
  })
})

describe('年份带', () => {
  const annualItem = {
    ...albumItem,
    id: 'annual-2025',
    entryType: '年度歌单',
    title: 'NotJabes的2025年度歌单',
    year: 2025,
    trackCount: 10,
    href: '/music/album/annual-2025'
  }

  it('年度卡只显年份，不重复「年度歌单」标签，链接仍指向条目页', () => {
    const { container } = render(
      <MusicShelf items={[albumItem]} annual={[annualItem]} />
    )
    const band = container.querySelector('.cl-music-band')
    expect(band.querySelector('.cl-music-card--year .cl-music-card-title').textContent.trim()).toBe('2025')
    expect(band.querySelector('.cl-music-card-cover').getAttribute('href')).toBe(annualItem.href)
    expect(band.querySelector('.cl-music-kind')).toBeNull()
    // 年份带在主网格之前，且年度卡不会混进主网格
    expect(container.querySelectorAll('.cl-music-grid .cl-music-card')).toHaveLength(1)
    expect(container.querySelector('.cl-music-band-range').textContent).toBe('2025')
  })

  it('标题层级：年份带在 section 标题之下，卡片标题降一级（h3）', () => {
    const { container } = render(
      <MusicShelf items={[albumItem]} annual={[annualItem]} />
    )
    expect(container.querySelector('.cl-music-band-head').tagName).toBe('H2')
    expect(container.querySelector('.cl-music-band .cl-music-card-title').tagName).toBe('H3')
    expect(container.querySelector('.cl-music-grid .cl-music-card-title').tagName).toBe('H2')
  })

  it('没有年度歌单时整条年份带不渲染', () => {
    const { container } = render(
      <MusicShelf items={[albumItem]} annual={[]} />
    )
    expect(container.querySelector('.cl-music-band')).toBeNull()
  })
})

describe('专辑页 D2 曲目表', () => {
  const tracks = [
    { id: '1', index: 0, title: 'K.', artists: ['Cigarettes After Sex'], duration: 319560, cover: 'https://p1.music.126.net/a/1.jpg', url: 'https://music.163.com/#/song?id=1' },
    {
      id: '2',
      index: 1,
      title: 'Apocalypse',
      artists: ['Cigarettes After Sex'],
      duration: 282000,
      cover: '',
      url: 'https://music.163.com/#/song?id=2',
      note: { href: '/music/note/note-2', title: '像一场缓慢的告别' }
    }
  ]

  it('有手记的行才有标题链接与手记入口，无手记的行整行不可点', () => {
    const { container } = render(<TrackList tracks={tracks} status='ok' albumTitle='X' />)
    const rows = container.querySelectorAll('.cl-music-track')
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelectorAll('a[href^="/music/"]')).toHaveLength(0)
    const noteLinks = Array.from(rows[1].querySelectorAll('a'))
    expect(
      noteLinks.filter(a => a.getAttribute('href') === '/music/note/note-2')
    ).toHaveLength(2)
  })

  it('每行都有网易云外链：新窗口、带 aria-label、只显示图标', () => {
    const { container } = render(<TrackList tracks={tracks} status='ok' albumTitle='X' />)
    const icons = container.querySelectorAll('.cl-music-ncm--icon')
    expect(icons).toHaveLength(2)
    expect(icons[0].getAttribute('aria-label')).toBe('在网易云打开《K.》')
    expect(icons[0].getAttribute('target')).toBe('_blank')
    expect(icons[0].getAttribute('rel')).toContain('noreferrer')
  })

  it('时长按分:秒显示，缺时长时不编造 0:00', () => {
    const { container } = render(
      <TrackList tracks={[{ ...tracks[0], duration: 0 }, tracks[1]]} status='ok' albumTitle='X' />
    )
    const durations = container.querySelectorAll('.cl-music-track-dur')
    expect(durations[0].textContent).toBe('')
    expect(durations[1].textContent).toBe('4:42')
  })

  it('曲目缺失或契约不匹配只出空态，不报错不 404', () => {
    const { rerender } = render(<TrackList tracks={[]} status='empty' albumTitle='X' />)
    expect(screen.getByText(/曲目待同步/)).toBeTruthy()
    rerender(<TrackList tracks={[]} status='invalid' error='v=2' albumTitle='X' />)
    expect(screen.getByText(/格式不认识/)).toBeTruthy()
  })

  it('表头与行的列数一致（网格靠列数对齐），且列头是真 th（屏幕阅读器能读到列语境）', () => {
    const { container } = render(<TrackList tracks={tracks} status='ok' albumTitle='X' />)
    expect(container.querySelectorAll('.cl-music-track-head th')).toHaveLength(6)
    expect(container.querySelectorAll('.cl-music-track-head th[scope="col"]')).toHaveLength(6)
    // 列头不能对 AT 藏起来：藏了之后每格只剩裸数字，听不出是时长还是序号
    expect(container.querySelector('.cl-music-track-head').getAttribute('aria-hidden')).toBeNull()
    expect(container.querySelectorAll('.cl-music-track')).toHaveLength(2)
    expect(container.querySelectorAll('.cl-music-track > td')).toHaveLength(12)
  })
})

describe('手记页上下文头（槽位不能混）', () => {
  const note = { id: 'n1', kind: 'Single', title: '像一场缓慢的告别' }
  const context = {
    songId: '480769652',
    albumId: '35561162',
    songTitle: 'Apocalypse',
    albumTitle: 'Cigarettes After Sex',
    artistLine: 'Cigarettes After Sex',
    cover: 'https://p1.music.126.net/a/1.jpg?param=160y160',
    neteaseUrl: 'https://music.163.com/#/song?id=480769652',
    albumHref: '/music/album/album-35561162'
  }

  it('歌名槽放歌名，专辑名只出现在 meta 的回链里（同名专辑不重复）', () => {
    const { container } = render(<NoteHead note={note} context={context} />)
    expect(container.querySelector('.cl-music-note-song').textContent.trim()).toBe('Apocalypse')
    const albumLink = container.querySelector('.cl-music-note-meta a[href="/music/album/album-35561162"]')
    expect(albumLink.textContent).toBe('Cigarettes After Sex')
    // 同名专辑（艺人==专辑）不并排重复，只留带链接的那一个
    expect(
      container.querySelector('.cl-music-note-meta').textContent.match(
        /Cigarettes After Sex/g
      )
    ).toHaveLength(1)
  })

  it('艺人名与专辑名不同时两个都显示', () => {
    const { container } = render(
      <NoteHead
        note={note}
        context={{
          ...context,
          artistLine: '山本彩',
          albumTitle: '缓慢的告别'
        }}
      />
    )
    expect(container.querySelector('.cl-music-note-meta').textContent).toContain(
      '山本彩 · 缓慢的告别'
    )
  })

  it('专辑下架或未上架时专辑名降级为纯文本，页面仍完整', () => {
    const { container } = render(
      <NoteHead note={note} context={{ ...context, albumHref: '' }} />
    )
    // 站内回链没了，但网易云外链仍在（它本来就在 meta 这一行里）
    expect(container.querySelectorAll('.cl-music-note-meta a[href^="/music/"]')).toHaveLength(0)
    expect(container.querySelectorAll('.cl-music-note-meta .cl-music-ncm')).toHaveLength(1)
    expect(container.querySelector('.cl-music-note-meta').textContent).toContain(
      'Cigarettes After Sex'
    )
  })

  it('专辑手记没有歌名时退回专辑名，标签写「专辑手记」', () => {
    const { container } = render(
      <NoteHead
        note={{ ...note, kind: 'Album' }}
        context={{ ...context, songTitle: '' }}
      />
    )
    expect(container.querySelector('.cl-music-kicker').textContent).toBe('专辑手记')
    expect(container.querySelector('.cl-music-note-song').textContent.trim()).toBe(
      'Cigarettes After Sex'
    )
  })
})

describe('封面取图', () => {
  it('同一 ID 的占位色调稳定（SSR 与水合必须一致）', () => {
    expect(sleeveTone('page-album')).toBe(sleeveTone('page-album'))
    expect(sleeveTone('')).toBe(sleeveTone(''))
    expect(sleeveTone('page-album')).not.toBe(sleeveTone('page-single'))
  })

  it('首字：拉丁取大写首字母，中文取第一字，空值用音符', () => {
    expect(coverInitial('cigarettes')).toBe('C')
    expect(coverInitial('二十岁')).toBe('二')
    expect(coverInitial('')).toBe('♪')
  })

  it('无封面直接出占位，不请求空 src', () => {
    const { container } = render(<MusicCover src='' title='二十岁' seed='p' />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.cl-music-sleeve')).toBeTruthy()
  })

  it('CDN 拒绝外链时（onError）退回占位，而不是留一个裂图', () => {
    const { container } = render(
      <MusicCover src='https://p1.music.126.net/x/1.jpg' title='二十岁' seed='p' />
    )
    const img = container.querySelector('img')
    expect(img.getAttribute('referrerPolicy') || img.getAttribute('referrerpolicy')).toBe(
      'no-referrer'
    )
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.cl-music-sleeve')).toBeTruthy()
  })
})
