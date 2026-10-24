import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../../utils/formatDate'
// import { createHash } from 'crypto'
import { siteConfig } from '../../config'
import { convertUrlStartWithOneSlash, getLastSegmentFromUrl, isHttpLink, isMailOrTelLink } from '../../utils'
import { extractLangPrefix } from '../../utils/pageId'
import {
  isMd5Digest,
  isSHA256Digest,
  sha256Digest
} from '../../utils/password'
import { mapImgUrl } from './mapImage'
import notionAPI from '@/lib/db/notion/getNotionAPI'

/**
 * 鑾峰彇椤甸潰鍏冪礌鎴愬憳灞炴€?
 * @param {*} id
 * @param {*} value
 * @param {*} schema
 * @param {*} authToken
 * @param {*} tagOptions
 * @returns
 */
/**
 * 从 files 属性的 raw 值里取图片地址（形状无关）
 *
 * 背景：v3 recordMap 的 files raw 与官方 API 不同（官方是
 * { files: [{ name, type, file: { url } }] }），且通用文本分支
 * （getTextContent）对它只会返回**文件名**、取不到地址 →
 * 必须自己取 url。这里做一次形状无关遍历，避免为不同形状各写一套分支。
 *
 * 取到的地址还要交给 mapImgUrl 过一遍 Notion 代理：
 * Notion 的文件直链是带 exp/sig 的临时签名地址，不代理会过期裂图。
 */
const pickFileUrl = raw => {
  const seen = new Set()
  const isSrc = s =>
    typeof s === 'string' &&
    (s.startsWith('http://') ||
      s.startsWith('https://') ||
      s.startsWith('attachment:'))
  const walk = node => {
    if (typeof node === 'string') return isSrc(node) ? node : ''
    if (!node || typeof node !== 'object') return ''
    if (seen.has(node)) return ''
    seen.add(node)
    if (isSrc(node.url)) return node.url
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item)
        if (found) return found
      }
      return ''
    }
    for (const value of Object.values(node)) {
      const found = walk(value)
      if (found) return found
    }
    return ''
  }
  return walk(raw)
}

/**
 * @param {*} id
 * @param {*} value
 * @param {*} schema
 * @param {*} authToken
 * @param {*} tagOptions
 * @returns
 */
export default async function getPageProperties(
  id,
  value,
  schema,
  authToken,
  tagOptions
) {
  const rawProperties = Object.entries(value?.properties || [])
  const excludeProperties = [
    'date',
    'select',
    'multi_select',
    'person',
    'checkbox',
    'file', // files 要单独取地址（通用文本分支只能拿到文件名）
    'files' // 官方 API 的类型名是 files，一并放行
  ]
  const properties = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        case 'checkbox': {
          // Notion v3 原始值为 [["Yes"]] / [["No"]]（未设置时为空数组）。
          // 不能走通用文本分支：getTextContent 对 "No" 同样返回真值串，
          // 会让「未勾选」被误判为已勾选。这里统一产出真正的布尔值。
          const raw = val?.[0]?.[0]
          properties[schema[key].name] = raw === true || raw === 'Yes'
          break
        }
        // v3 的类型名是 'file'（官方 API 是 'files'），两种都接
        case 'file':
        case 'files': {
          // 形状无关取值 → 再过 mapImgUrl（Notion 代理重新签名 + 追加 width 档位）
          const url = pickFileUrl(val)
          properties[schema[key].name] = url ? mapImgUrl(url, value) : ''
          break
        }
        case 'person': {
          const rawUsers = val.flat()
          const users = []

          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await notionAPI.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }

  // 鏄犲皠閿細鐢ㄦ埛鑷畾涔夎〃澶村悕
  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]]) {
        properties[key] = properties[fieldNames[key]]
      }
    })
  }

  // 「首页封面」列的**两种列名都认**：
  // 映射是按列名精确匹配的 → 博主在 Notion 里把列名从「首页封面」改成
  // 「精选封面」后，映射会静默失配（取不到值 → 首页图版悄悄回落页面封面，
  // 看上去就是「上传的封面没生效」）。这里做别名兜底，两种列名都能命中。
  if (properties.homeCover === undefined) {
    const alias = properties['首页封面'] || properties['精选封面']
    if (alias) properties.homeCover = alias
  }

  // type\status\category 鏄崟閫変笅鎷夋 鍙栨暟缁勭涓€涓?
  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.category = properties.category?.[0] || ''
  properties.comment = properties.comment?.[0] || ''

  // 鏄犲皠鍊硷細鐢ㄦ埛涓€у寲type鍜宻tatus瀛楁鐨勪笅鎷夋閫夐」锛屽湪姝ゆ槧灏勫洖浠ｇ爜鐨勮嫳鏂囨爣璇?
  mapProperties(properties)

  properties.publishDate = new Date(
    properties?.date?.start_date || value.created_time
  ).getTime()
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.lastEditedDate = new Date(value?.last_edited_time)
  properties.lastEditedDay = formatDate(
    new Date(value?.last_edited_time),
    BLOG.LANG
  )
  properties.fullWidth = value?.format?.page_full_width ?? false
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''
  properties.pageCover = mapImgUrl(value?.format?.page_cover, value) ?? ''
  properties.pageCoverThumbnail =
    mapImgUrl(value?.format?.page_cover, value, 'block') ?? ''
  // Notion 自带的封面裁剪焦点（0=顶 0.5=中 1=底）——
  // 此前站点完全丢弃它，横幅与图版一律按居中裁切，
  // 于是「在 Notion 里拖了头图却没反应」。语义与 CSS object-position 的 y 分量一致。
  const rawCoverPos = Number(value?.format?.page_cover_position)
  properties.pageCoverPosition = Number.isFinite(rawCoverPos)
    ? Math.min(1, Math.max(0, rawCoverPos))
    : 0.5
  properties.ext = convertToJSON(properties?.ext)
  properties.content = value.content ?? []
  properties.tagItems =
    properties?.tags?.map(tag => {
      return {
        name: tag,
        color: tagOptions?.find(t => t.value === tag)?.color || 'gray'
      }
    }) || []
  delete properties.content
  return properties
}

/**
 * 瀛楃涓茶浆json
 * @param {*} str
 * @returns
 */
function convertToJSON(str) {
  if (!str) {
    return {}
  }
  // 浣跨敤姝ｅ垯琛ㄨ揪寮忓幓闄ょ┖鏍煎拰鎹㈣绗?
  try {
    return JSON.parse(str.replace(/\s/g, ''))
  } catch (error) {
    console.warn('鏃犳晥JSON', str)
    return {}
  }
}

/**
 * 鏄犲皠鐢ㄦ埛鑷畾涔夎〃澶?
 */
function mapProperties(properties) {
  const typeMap = {
    [BLOG.NOTION_PROPERTY_NAME.type_post]: 'Post',
    [BLOG.NOTION_PROPERTY_NAME.type_page]: 'Page',
    [BLOG.NOTION_PROPERTY_NAME.type_notice]: 'Notice',
    [BLOG.NOTION_PROPERTY_NAME.type_menu]: 'Menu',
    [BLOG.NOTION_PROPERTY_NAME.type_sub_menu]: 'SubMenu',
    [BLOG.NOTION_PROPERTY_NAME.type_member]: 'Member',
    [BLOG.NOTION_PROPERTY_NAME.type_event]: 'Event',
    [BLOG.NOTION_PROPERTY_NAME.type_photo]: 'Photo'
  }

  const statusMap = {
    [BLOG.NOTION_PROPERTY_NAME.status_publish]: 'Published',
    [BLOG.NOTION_PROPERTY_NAME.status_invisible]: 'Invisible'
  }

  if (properties?.type && typeMap[properties.type]) {
    properties.type = typeMap[properties.type]
  }

  if (properties?.status && statusMap[properties.status]) {
    properties.status = statusMap[properties.status]
  }
}

/**
 * 杩囨护澶勭悊椤甸潰鏁版嵁
 * 杩囨护澶勭悊杩囩▼浼氱敤鍒癗OTION_CONFIG涓殑閰嶇疆
 */
export function adjustPageProperties(properties, NOTION_CONFIG) {
  // 澶勭悊URL
  // 1.鎸夌収鐢ㄦ埛閰嶇疆鐨刄RL_PREFIX 杞崲涓€涓媠lug
  // 2.涓烘枃绔犳坊鍔犱竴涓猦ref瀛楁锛屽瓨鍌ㄦ渶缁堣皟鏁寸殑璺緞
  if (properties.type === 'Post' || properties.type === 'Photo') {
    properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Page') {
    if (shouldUseMappedCategorySlug(properties, NOTION_CONFIG)) {
      properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)
    }
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Menu' || properties.type === 'SubMenu') {
    // 鑿滃崟璺緞涓虹┖銆佷綔涓哄彲灞曞紑鑿滃崟浣跨敤
    properties.href = properties.slug ?? '#'
    properties.name = properties.title ?? ''
  }

  // http or https 寮€澶寸殑瑙嗕负澶栭摼
  if (isHttpLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_blank'
  } else if (isMailOrTelLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_self'
  } else {
    properties.target = '_self'
    // 浼潤鎬佽矾寰勫彸渚ф嫾鎺?html
    if (siteConfig('PSEUDO_STATIC', false, NOTION_CONFIG)) {
      if (
        !properties?.href?.endsWith('.html') &&
        properties?.href !== '' &&
        properties?.href !== '#' &&
        properties?.href !== '/'
      ) {
        properties.href += '.html'
      }
    }

    // 鐩稿璺緞杞粷瀵硅矾寰勶細url宸︿晶鎷兼帴 /
    properties.href = convertUrlStartWithOneSlash(properties?.href)
  }

  // 濡傛灉璺宠浆閾炬帴鏄璇█锛屽垯鍦ㄦ柊绐楀彛鎵撳紑
  if (BLOG.NOTION_PAGE_ID.indexOf(',') > 0) {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const prefix = extractLangPrefix(siteId)
      if (getLastSegmentFromUrl(properties.href) === prefix) {
        properties.target = '_blank'
      }
    }
  }

  // 鏂囩珷閿侊細鏂扮増涓?SHA256(鏄庢枃)锛涙敮鎸?Notion 鍐呯洿鎺ュ～ 64 浣?SHA256锛涗繚鐣?32 浣?md5 鎽樿浠ュ吋瀹规棫鏁版嵁锛圥R #3389锛?
  if (!properties.password) {
    properties.password = ''
  } else if (isSHA256Digest(properties.password)) {
    properties.password = properties.password.trim()
  } else if (isMd5Digest(properties.password)) {
    properties.password = properties.password.trim()
  } else {
    properties.password = sha256Digest(properties.password)
  }
}

/**
 * 鑾峰彇鑷畾涔塙RL
 * 鍙互鏍规嵁鍙橀噺鐢熸垚URL
 * 鏀寔锛?category%/%year%/%month%/%day%/%slug%
 * @param {*} postProperties
 * @returns
 */
function shouldUseMappedCategorySlug(properties, NOTION_CONFIG) {
  const allSlugPatterns =
    NOTION_CONFIG?.POST_URL_PREFIX ??
    siteConfig('POST_URL_PREFIX', BLOG.POST_URL_PREFIX, NOTION_CONFIG)
  const categoryMap = siteConfig(
    'POST_URL_PREFIX_MAPPING_CATEGORY',
    {},
    NOTION_CONFIG
  )

  return (
    properties?.type === 'Page' &&
    properties?.category &&
    allSlugPatterns?.includes('%category%') &&
    !!categoryMap?.[properties.category]
  )
}

function generateCustomizeSlug(postProperties, NOTION_CONFIG) {
  // 澶栭摼涓嶅鐞?
  if (isHttpLink(postProperties.slug)) {
    return postProperties.slug
  }
  const fullPrefixParts = []
  let allSlugPatterns = NOTION_CONFIG?.POST_URL_PREFIX
  if (allSlugPatterns === undefined || allSlugPatterns === null) {
    allSlugPatterns = siteConfig(
      'POST_URL_PREFIX',
      BLOG.POST_URL_PREFIX,
      NOTION_CONFIG
    ).split('/')
  } else {
    allSlugPatterns = allSlugPatterns.split('/')
  }

  const POST_URL_PREFIX_MAPPING_CATEGORY = siteConfig(
    'POST_URL_PREFIX_MAPPING_CATEGORY',
    {},
    NOTION_CONFIG
  )

  allSlugPatterns.forEach(pattern => {
    if (pattern === '%year%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefixParts.push(String(formatPostCreatedDate.getUTCFullYear()))
    } else if (pattern === '%month%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefixParts.push(
        String(formatPostCreatedDate.getUTCMonth() + 1).padStart(2, 0)
      )
    } else if (pattern === '%day%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefixParts.push(String(formatPostCreatedDate.getUTCDate()).padStart(2, 0))
    } else if (pattern === '%slug%') {
      fullPrefixParts.push(postProperties.slug ?? postProperties.id)
    } else if (pattern === '%category%' && postProperties?.category) {
      let categoryPrefix = postProperties.category
      // 鍏佽鏄犲皠鍒嗙被鍚嶏紝閫氬父鐢ㄦ潵灏嗕腑鏂囧垎绫绘槧灏勬垚鑻辨枃锛岀編鍖杣rl.
      if (POST_URL_PREFIX_MAPPING_CATEGORY[postProperties?.category]) {
        categoryPrefix =
          POST_URL_PREFIX_MAPPING_CATEGORY[postProperties?.category]
      }
      fullPrefixParts.push(categoryPrefix)
    } else if (!pattern.includes('%')) {
      fullPrefixParts.push(pattern)
    }
  })
  const fullPrefix = fullPrefixParts.filter(Boolean).join('/')

  if (fullPrefix) {
    return `${fullPrefix}/${postProperties.slug ?? postProperties.id}`
  } else {
    return `${postProperties.slug ?? postProperties.id}`
  }
}
