import { NAMES, TYPES, contract } from './contract.mjs'
import { chunkRichText, tracksToggleBlock } from './normalize.mjs'

const API = 'https://api.notion.com/v1'
const DEFAULT_VERSION = '2026-03-11'
const MIN_INTERVAL = 350 // ~3 req/s，留足 Notion 集成限流余量
const TITLE_CHUNK = 2000 // 官方 API 单段富文本上限

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function richParts(text, size = TITLE_CHUNK) {
  const source = String(text ?? '')
  const parts = []
  for (let i = 0; i < source.length; i += size) {
    parts.push({ type: 'text', text: { content: source.slice(i, i + size) } })
  }
  return parts.length ? parts : [{ type: 'text', text: { content: ' ' } }]
}

function blockText(block) {
  const holder = block?.code || block?.toggle || block?.paragraph || {}
  return (holder.rich_text || [])
    .map(part => part?.plain_text ?? part?.text?.content ?? '')
    .join('')
}

/**
 * 官方 API 的 page.properties → JS 值。
 * 脚本要判断「这一列是不是空的」（空才种子、非空绝不覆盖），必须先能读懂当前值。
 */
export function propertyValue(page, columnName) {
  const prop = page?.properties?.[columnName]
  if (!prop) return undefined
  switch (prop.type) {
    case 'title':
      return (prop.title || []).map(t => t.plain_text ?? '').join('')
    case 'rich_text':
      return (prop.rich_text || []).map(t => t.plain_text ?? '').join('')
    case 'select':
      return prop.select?.name || ''
    case 'status':
      return prop.status?.name || ''
    case 'multi_select':
      return (prop.multi_select || []).map(o => o.name)
    case 'date':
      return prop.date
        ? { start: prop.date.start, end: prop.date.end || '' }
        : null
    case 'checkbox':
      return Boolean(prop.checkbox)
    case 'number':
      return prop.number
    case 'url':
      return prop.url || ''
    case 'files':
      return prop.files || []
    default:
      return undefined
  }
}

/** 人字段是否为空：未定义 / 空串 / 空数组 / 空日期都算空，只有空时才允许种子 */
export function isEmptyValue(value) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return !value.trim()
  if (typeof value === 'boolean') return false
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return !value.start
  return false
}

/** 属性值 → Notion 载荷；列不存在或类型不认识就返回 null，由调用方记入 skipped */
export function buildProperty(schema, value) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' && !value.trim()) return null
  if (Array.isArray(value) && !value.length) return null

  switch (schema?.type) {
    case 'title':
      return { title: richParts(value) }
    case 'rich_text':
      return { rich_text: richParts(value) }
    case 'url':
      return { url: String(value).trim().slice(0, TITLE_CHUNK) }
    case 'select':
      return { select: { name: String(value) } }
    case 'status':
      return { status: { name: String(value) } }
    case 'multi_select':
      return {
        multi_select: (Array.isArray(value) ? value : String(value).split(/[,/]/))
          .map(name => String(name).trim())
          .filter(Boolean)
          .map(name => ({ name }))
      }
    case 'date': {
      const start =
        typeof value === 'object' ? value.start || value.start_date : value
      if (!start) return null
      const date = { start: String(start).slice(0, 10) }
      const end =
        typeof value === 'object' ? value.end || value.end_date : ''
      if (end) date.end = String(end).slice(0, 10)
      return { date }
    }
    case 'checkbox':
      return { checkbox: Boolean(value) }
    case 'number': {
      const number = Number(value)
      return Number.isFinite(number) ? { number } : null
    }
    default:
      return null
  }
}

export function createNotionClient({
  token,
  dataSourceId,
  version = DEFAULT_VERSION
} = {}) {
  if (!token) throw new Error('缺少 NOTION_API_TOKEN')
  if (!dataSourceId) {
    throw new Error('缺少 NOTION_POSTS_DATA_SOURCE_ID')
  }

  let lastCall = 0
  let schemaCache = null
  const throttle = async () => {
    const wait = lastCall + MIN_INTERVAL - Date.now()
    if (wait > 0) await sleep(wait)
    lastCall = Date.now()
  }

  async function request(path, { method = 'GET', body, attempt = 0 } = {}) {
    await throttle()
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': version,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const text = await response.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      /* 非 JSON 错误体，走下面的统一报错 */
    }

    if (!response.ok) {
      const retriable = response.status === 429 || response.status >= 500
      if (retriable && attempt < 3) {
        const retryAfter = Number(response.headers.get('retry-after'))
        await sleep(
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 800 * 2 ** attempt
        )
        return request(path, { method, body, attempt: attempt + 1 })
      }
      throw new Error(
        `Notion API ${response.status} ${path}：${text.slice(0, 300)}`
      )
    }
    return data
  }

  async function queryAll(filter) {
    const results = []
    let cursor
    do {
      const data = await request(`/data_sources/${dataSourceId}/query`, {
        method: 'POST',
        body: { filter, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }
      })
      results.push(...(data.results || []))
      cursor = data.has_more ? data.next_cursor : undefined
    } while (cursor)
    return results
  }

  const typeFilter = typeValue => ({
    property: NAMES.type,
    select: { equals: typeValue }
  })

  return {
    getSchema: async () => {
      if (schemaCache) return schemaCache
      const data = await request(`/data_sources/${dataSourceId}`)
      schemaCache = data.properties || {}
      return schemaCache
    },

    /** 一次性 setup 校验：缺列/缺选项只报清单，脚本绝不自动改 schema */
    async checkSchema({ required = [], selectOptions = {} } = {}) {
      const schema = await this.getSchema()
      const missing = required.filter(name => !schema[name])
      const badOptions = []
      for (const [name, options] of Object.entries(selectOptions)) {
        const prop = schema[name]
        if (!prop) continue
        const choices = new Set([
          ...(prop.select?.options || []),
          ...(prop.status?.options || [])
        ].map(o => o.name))
        for (const option of options) {
          if (!choices.has(option)) badOptions.push(`${name} 缺选项「${option}」`)
        }
      }
      return { schema, missing, badOptions, ok: !missing.length && !badOptions.length }
    },

    /** 匹配只按数字 ID + type：标题会被改，ID 才是身份。整表读取交给调用方一次做完 */
    findAlbums: () => queryAll(typeFilter(TYPES.album)),

    findNotes: () => queryAll(typeFilter(TYPES.note)),

    createPage: ({ properties, children }) =>
      request('/pages', {
        method: 'POST',
        body: {
          parent: { data_source_id: dataSourceId },
          properties,
          ...(children?.length ? { children } : {})
        }
      }),

    /** 只 PATCH 传进来的列：其余列与正文块一律不碰，也绝不删行、绝不归档 */
    async updatePage(pageId, { properties } = {}) {
      if (!properties || !Object.keys(properties).length) return null
      return request(`/pages/${pageId}`, { method: 'PATCH', body: { properties } })
    },

    async listChildren(blockId) {
      const results = []
      let cursor
      do {
        const data = await request(
          `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`
        )
        results.push(...(data.results || []))
        cursor = data.has_more ? data.next_cursor : undefined
      } while (cursor)
      return results
    },

    /** 认块靠 JSON 里的 schema 标记，不靠 toggle 标题（用户改名也认得到） */
    async findTracksBlock(pageId) {
      const topLevel = await this.listChildren(pageId)
      const codes = []
      for (const block of topLevel) {
        if (block.type === 'code') codes.push(block)
        if (block.type === 'toggle') {
          const children = await this.listChildren(block.id)
          codes.push(...children.filter(c => c.type === 'code'))
        }
      }
      for (const block of codes) {
        const text = blockText(block)
        if (text.includes(`"${contract.schema}"`)) return { block, text }
      }
      return null
    },

    /** 有则只换代码块内容，无则追加折叠块；不删、不动正文其他块 */
    async upsertTracksBlock(pageId, payload) {
      const existing = await this.findTracksBlock(pageId)
      if (existing) {
        await request(`/blocks/${existing.block.id}`, {
          method: 'PATCH',
          body: {
            code: {
              language: contract.tracksBlock.language,
              rich_text: chunkRichText(JSON.stringify(payload, null, 2))
            }
          }
        })
        return { action: 'updated', blockId: existing.block.id }
      }
      await request(`/blocks/${pageId}/children`, {
        method: 'PATCH',
        body: { children: [tracksToggleBlock(payload)] }
      })
      return { action: 'appended' }
    },

    /** 值 → 官方 API properties；列不存在/类型不认识就记入 skipped 供报告 */
    async buildProperties(values) {
      const props = await this.getSchema()
      const out = {}
      const skipped = []
      for (const [name, value] of Object.entries(values)) {
        if (value === undefined) continue
        const payload = buildProperty(props[name], value)
        if (!payload) {
          skipped.push(`${name}（${props[name]?.type || '列不存在'}）`)
          continue
        }
        out[name] = payload
      }
      return { properties: out, skipped }
    }
  }
}
