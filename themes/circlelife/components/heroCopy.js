const asTrimmedString = value => (typeof value === 'string' ? value.trim() : '')

const normalizeForCompare = value => asTrimmedString(value).replace(/\s+/g, ' ')

/** 序言幕布文案：summary 作短题眼，description 作导语；相同内容不重复渲染。 */
export function resolveHeroCopy({
  summary = '',
  description = '',
  fallbackSummary = ''
} = {}) {
  const headline = asTrimmedString(summary) || asTrimmedString(fallbackSummary)
  const lead = asTrimmedString(description)

  return {
    headline,
    lead: lead && normalizeForCompare(lead) !== normalizeForCompare(headline) ? lead : ''
  }
}
