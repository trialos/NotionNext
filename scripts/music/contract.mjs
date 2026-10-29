import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** 契约只有一份：站点读 lib/music/contract.json，脚本读同一个文件，改列名两边同时生效 */
export const contract = require('../../lib/music/contract.json')

export const P = contract.properties
export const KIND = contract.noteKinds
export const TYPES = contract.types
export const ENTRY = contract.entryTypes

/**
 * 规范列（type/status/title/slug/summary/featured/date）的列名可被环境变量覆盖，
 * 必须与站点取同一份 conf，写死在契约里会和站点判断静默失配。
 */
export const NAMES = require('../../conf/notion.config.js').NOTION_PROPERTY_NAME

/** 种子字段的实际列名：优先用 conf 的映射，description 这类没配别名映射的走契约默认列名 */
export function columnOf(key) {
  return NAMES[key] || contract.seedColumns[key] || key
}
