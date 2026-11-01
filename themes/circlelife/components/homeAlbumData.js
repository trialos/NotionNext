/**
 * 首页精选影集段的纯数据逻辑（精选判定 + 视图拆分）
 *
 * 影集段只显示 Notion「精选」勾选的影集，最多取
 * CIRCLELIFE_HOME_ALBUM_COUNT 辑（默认 4），**不用最新影集补齐**。
 * 主封面 = 发布日期最新的一辑（pages/index.js 已按日期倒序截断）。
 *
 * 影集与文章共用同一张 Notion 表（靠 type 区分），精选判定对两者通用。
 */

/**
 * 条目是否被标记为「精选」。
 *
 * 主路径是 Notion 的 Checkbox 属性（解析后为真正的布尔值，键名由
 * BLOG.NOTION_PROPERTY_NAME 把列名「精选」映射成 featured）。
 * 同时兼容原始列名「精选」与 Select/MultiSelect 降级形态（数组或字符串），
 * 以便博主临时改用选项列时无需改代码。
 *
 * @param {object} page Notion 页面属性对象
 * @returns {boolean}
 */
export function isFeaturedEntry(page) {
  if (!page) return false
  const raw = page.featured !== undefined ? page.featured : page['精选']
  if (typeof raw === 'boolean') return raw
  if (Array.isArray(raw)) {
    return raw.some(
      v => v === '精选' || v === 'Featured' || v === '__YES__' || v === 'Yes'
    )
  }
  if (typeof raw === 'string') {
    return (
      raw === '精选' ||
      raw === 'Featured' ||
      raw === '__YES__' ||
      raw === 'Yes' ||
      raw === 'true'
    )
  }
  return false
}

/** 旧名保留：影集段的精选判定（与 isFeaturedEntry 同语义） */
export const isFeaturedAlbum = isFeaturedEntry

/**
 * 把首页影集数组拆成「主封面 + 索引」。
 *
 * 主封面 = 数组第一项（最新勾选）；索引 = 其余。
 * 上限 4 辑由数据层截断；这里只做纯拆分，便于单测 0–4 辑。
 *
 * @param {Array<{count?: number}>} albums
 * @returns {{ hero: object|null, rest: object[], total: number, count: number }}
 */
export function buildAlbumView(albums = []) {
  const list = Array.isArray(albums) ? albums.filter(Boolean) : []
  return {
    hero: list[0] || null,
    rest: list.slice(1),
    total: list.reduce((sum, album) => sum + (Number(album?.count) || 0), 0),
    count: list.length
  }
}
