import { musicPaths, revalidateSite } from '../../../scripts/music/revalidate.mjs'
import { contract } from '../../../scripts/music/contract.mjs'

function stubFetch(replies) {
  const calls = []
  let index = 0
  global.fetch = jest.fn(async (url, init = {}) => {
    calls.push({ url: String(url), body: JSON.parse(init.body || '{}'), headers: init.headers })
    const reply = replies[Math.min(index, replies.length - 1)]
    index += 1
    return {
      ok: reply.status < 400,
      status: reply.status,
      json: async () => reply.json
    }
  })
  return calls
}

describe('刷新路径', () => {
  it('展架 + 专辑页 + 手记页，去重且不带 locale 前缀', () => {
    expect(
      musicPaths({ albumSlugs: ['a-1', '', 'a-1'], noteSlugs: ['n-9'] })
    ).toEqual([
      contract.routes.shelf,
      `${contract.routes.album}a-1`,
      `${contract.routes.note}n-9`
    ])
  })

  it('只有 slug 为空的输入时不会拼出 /music/album/ 这种半截路径', () => {
    expect(musicPaths({ albumSlugs: [''], noteSlugs: [undefined] })).toEqual([
      contract.routes.shelf
    ])
  })
})

describe('revalidateSite', () => {
  it('没配 token 就只告警，不发请求：同步已经写好了，不该报错', async () => {
    const calls = stubFetch([{ status: 200, json: {} }])
    const result = await revalidateSite({
      env: { NEXT_PUBLIC_LINK: 'https://example.com' },
      paths: ['/music'],
      log: () => {}
    })
    expect(result.ok).toBe(false)
    expect(result.warning).toMatch(/REVALIDATION_TOKEN/)
    expect(calls).toHaveLength(0)
  })

  it('没配站点地址同样只告警', async () => {
    const calls = stubFetch([{ status: 200, json: {} }])
    const result = await revalidateSite({ env: { REVALIDATION_TOKEN: 't' }, paths: ['/music'] })
    expect(result.warning).toMatch(/站点地址/)
    expect(calls).toHaveLength(0)
  })

  it('带 Bearer 打 /api/revalidate，首请求要求数据失效', async () => {
    const calls = stubFetch([
      { status: 200, json: { ok: true, message: 'Revalidated 2/2', remainingPaths: [] } }
    ])
    const result = await revalidateSite({
      env: { REVALIDATION_TOKEN: 't', SITE_BASE_URL: 'https://example.com/' },
      paths: ['/music', '/music/album/a-1']
    })
    expect(result.ok).toBe(true)
    expect(calls[0].url).toBe('https://example.com/api/revalidate')
    expect(calls[0].headers.Authorization).toBe('Bearer t')
    expect(calls[0].body).toEqual({
      paths: ['/music', '/music/album/a-1'],
      invalidateData: true
    })
  })

  it('一次没刷完就续跑，续跑不再重复失效数据', async () => {
    const calls = stubFetch([
      {
        status: 202,
        json: { ok: true, message: 'partial', remainingPaths: ['/music/album/a-2'] }
      },
      { status: 200, json: { ok: true, message: 'done', remainingPaths: [] } }
    ])
    const result = await revalidateSite({
      env: { REVALIDATION_TOKEN: 't', SITE_BASE_URL: 'https://example.com' },
      paths: ['/music', '/music/album/a-1', '/music/album/a-2'],
      log: () => {}
    })
    expect(result.ok).toBe(true)
    expect(calls).toHaveLength(2)
    expect(calls[1].body).toEqual({ paths: ['/music/album/a-2'] })
  })

  it('续跑超上限就报「仍有路径未刷新」，不死循环', async () => {
    const calls = stubFetch([
      { status: 202, json: { ok: true, remainingPaths: ['/music/album/a-2'] } }
    ])
    const result = await revalidateSite({
      env: { REVALIDATION_TOKEN: 't', SITE_BASE_URL: 'https://example.com' },
      paths: ['/music', '/music/album/a-2'],
      log: () => {}
    })
    expect(result.ok).toBe(false)
    expect(result.warning).toMatch(/未刷新/)
    expect(calls.length).toBeLessThanOrEqual(12)
  })

  it('线上返回 401 时告警而不是抛错', async () => {
    stubFetch([{ status: 401, json: { ok: false, message: 'Unauthorized' } }])
    const result = await revalidateSite({
      env: { REVALIDATION_TOKEN: 'wrong', SITE_BASE_URL: 'https://example.com' },
      paths: ['/music']
    })
    expect(result.ok).toBe(false)
    expect(result.warning).toMatch(/401/)
  })

  it('没有路径就直接跳过', async () => {
    const calls = stubFetch([{ status: 200, json: {} }])
    const result = await revalidateSite({
      env: { REVALIDATION_TOKEN: 't', SITE_BASE_URL: 'https://example.com' },
      paths: []
    })
    expect(result).toEqual({ ok: true, skipped: 'no-paths' })
    expect(calls).toHaveLength(0)
  })
})
