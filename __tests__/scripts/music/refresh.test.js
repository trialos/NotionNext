import fs from 'fs'
import path from 'path'

import { ENTRY } from '../../../scripts/music/contract.mjs'
import { refreshRoute } from '../../../scripts/music/plan.mjs'

/**
 * 刷新路径的取数分流：歌单与年度歌单在网易云是另一个接口。
 *
 * 背景：早先 refresh 一律调专辑接口，拿歌单 ID 去查专辑只会得到
 * 「网易云没有这张专辑或已下架」→ 被当成下架信号 → 整排歌单从展架消失。
 */
describe('刷新路径按条目类型分流', () => {
  it('专辑走专辑接口，并允许在上游确认消失时自动下架', () => {
    expect(refreshRoute(ENTRY.album)).toEqual({ source: 'album', autoDelist: true })
  })

  it('歌单走歌单接口，且永不自动下架', () => {
    expect(refreshRoute(ENTRY.playlist)).toEqual({ source: 'playlist', autoDelist: false })
  })

  it('年度歌单同样走歌单接口', () => {
    expect(refreshRoute(ENTRY.annual)).toEqual({ source: 'playlist', autoDelist: false })
  })

  it('条目类型为空按专辑处理（建列前的老行）', () => {
    expect(refreshRoute('')).toEqual({ source: 'album', autoDelist: true })
    expect(refreshRoute(undefined)).toEqual({ source: 'album', autoDelist: true })
  })
})

describe('cli 的 refresh 真的用了这条分流', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'scripts/music/cli.mjs'),
    'utf8'
  )

  it('歌单分支调用 fetchPlaylist，专辑分支调用 fetchAlbum', () => {
    expect(src).toContain("if (route.source === 'playlist')")
    expect(src).toMatch(/route\.source === 'playlist'[\s\S]{0,400}fetchPlaylist\(/)
    expect(src).toMatch(/fetchAlbum\(albumId, \{ name: title \}\)/)
  })

  it('自动下架必须先过 autoDelist 这道闸', () => {
    expect(src).toContain('route.autoDelist &&')
  })

  it('下架判定不再把「已下架」当成上游错误特征', () => {
    // 「已下架」是脚本自己写进 Notion 的状态词，拿它当上游错误特征会误伤
    expect(src).not.toContain('/没有这张专辑|已下架|not found|不存在/')
  })
})
