const WECHAT_ORIGIN_KEYS = ['微信原文', 'wechatOrigin']

/**
 * 文章「微信原文」链接：只接受 http(s)，空值或脏值返回空字符串。
 * Notion 列名固定为「微信原文」（URL 类型）。
 */
export function resolveWechatOrigin(post) {
  if (!post) return ''
  for (const key of WECHAT_ORIGIN_KEYS) {
    const value = post[key]
    if (typeof value !== 'string') continue
    const url = value.trim()
    if (/^https?:\/\//i.test(url)) return url
  }
  return ''
}

export default resolveWechatOrigin
