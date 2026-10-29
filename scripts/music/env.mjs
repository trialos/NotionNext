import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** 与内容 MCP 保持同一套候选文件，避免两处各自找 env */
const CANDIDATES = [
  '.env.local',
  '.env',
  '.env.mcp.local',
  '.env.notion.local'
]

function parseEnvFile(text) {
  const out = {}
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[match[1]] = value
  }
  return out
}

/**
 * 读取本地凭据：进程环境优先，其次候选 .env 文件（可 --env-file 追加）。
 * 任何情况下都不打印值。
 */
export function loadEnv({ envFiles = [], quiet = true } = {}) {
  const files = [...CANDIDATES.map(f => path.join(ROOT, f)), ...envFiles.map(f =>
    path.isAbsolute(f) ? f : path.join(ROOT, f)
  )]

  const merged = {}
  for (const file of files) {
    if (!fs.existsSync(file)) continue
    Object.assign(merged, parseEnvFile(fs.readFileSync(file, 'utf8')))
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && value.trim()) merged[key] = value.trim()
  }

  if (!quiet) {
    console.log(`[music] env 来源：${files.filter(f => fs.existsSync(f)).map(f => path.relative(ROOT, f)).join(', ') || '（仅进程环境）'}`)
  }
  return merged
}

export function missingEnv(env, keys) {
  return keys.filter(key => !String(env[key] || '').trim())
}

/** 只用于日志：确认配了没有，绝不外泄内容 */
export function describeEnvValue(value) {
  const raw = String(value || '')
  if (!raw) return '<未配置>'
  if (raw.length <= 8) return '<已配置>'
  return `${raw.slice(0, 4)}…${raw.slice(-4)}`
}
