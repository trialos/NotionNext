import { contract } from './contract.mjs'

const MAX_ROUNDS = 12 // 单次 60s 计算限制内的续跑上限，防止脚本无限循环

function baseUrlOf(env) {
  const raw =
    env.SITE_BASE_URL ||
    env.NOTIONNEXT_SITE_URL ||
    env.MCP_SITE_BASE_URL ||
    env.NEXT_PUBLIC_LINK ||
    ''
  const url = String(raw).trim().replace(/\/+$/, '')
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) return `https://${url}`
  return url
}

/** 音乐页在站点上的路径：只由 slug 拼，locale 前缀交给服务端处理 */
export function musicPaths({ albumSlugs = [], noteSlugs = [] } = {}) {
  const paths = [contract.routes.shelf]
  for (const slug of albumSlugs) {
    if (slug) paths.push(`${contract.routes.album}${slug}`)
  }
  for (const slug of noteSlugs) {
    if (slug) paths.push(`${contract.routes.note}${slug}`)
  }
  return [...new Set(paths.filter(p => p && p !== '/'))]
}

/**
 * 打线上 /api/revalidate。失败只告警：Notion 已经写好了，
 * 缓存稍后随 ISR 自然过期，不该让同步命令因为一次网络抖动而报错。
 */
export async function revalidateSite({
  env,
  paths,
  invalidateData = true,
  fetchImpl = fetch,
  log = console.log
} = {}) {
  const baseUrl = baseUrlOf(env || {})
  const token = String((env || {}).REVALIDATION_TOKEN || '').trim()

  if (!paths.length) return { ok: true, skipped: 'no-paths' }
  if (!baseUrl) return { ok: false, warning: '缺少站点地址（SITE_BASE_URL / NEXT_PUBLIC_LINK），跳过刷新' }
  if (!token) return { ok: false, warning: '缺少 REVALIDATION_TOKEN，跳过刷新' }

  let pending = paths
  let invalidated = invalidateData
  const results = []

  for (let round = 0; round < MAX_ROUNDS && pending.length; round += 1) {
    const body = { paths: pending }
    if (invalidated) body.invalidateData = true
    const response = await fetchImpl(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        ok: false,
        warning: `刷新失败 ${response.status}：${String(data.message || '').slice(0, 160)}`
      }
    }

    results.push(data.message || `Revalidated ${pending.length} paths`)
    pending = data.remainingPaths || []
    invalidated = false // 续跑只补剩下的路径，数据失效只做一次

    if (pending.length) log(`  刷新续跑：剩余 ${pending.length} 个路径`)
  }

  return {
    ok: pending.length === 0,
    warning: pending.length ? `仍有 ${pending.length} 个路径未刷新，可稍后重跑` : '',
    results,
    baseUrl
  }
}
