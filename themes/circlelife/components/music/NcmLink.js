/**
 * 网易云外链：站内不放任何播放控件，只听就跳出去。
 * 图标形态（compact）用在曲目行；文字形态用在卡片与页头，
 * 并用 kind 说清楚跳的是专辑还是歌单 —— 只写「网易云」看不出层级。
 */
export default function NcmLink({
  href,
  label,
  kind = '',
  compact = false,
  className = ''
}) {
  if (!href) return null
  const text = label || '网易云'
  const shown = kind ? `网易云${kind} ↗` : '网易云 ↗'
  return (
    <a
      className={`cl-music-ncm ${compact ? 'cl-music-ncm--icon' : ''} ${className}`.trim()}
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={compact ? `在网易云打开《${text}》` : undefined}
      title={compact ? '在网易云打开' : `在网易云打开《${text}》`}>
      {compact ? '↗' : shown}
    </a>
  )
}
