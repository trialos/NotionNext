/**
 * 全站列表刊头：与影集 mast 同系（朱砂竖线 + 眉题 + 主标题）
 */
export default function PageMast({ eyebrow, title, description, className = '' }) {
  if (!title && !eyebrow) return null
  return (
    <header className={`cl-page-mast ${className}`.trim()}>
      <div className='cl-page-mast-inner'>
        {eyebrow ? <span className='cl-page-mast-kicker'>{eyebrow}</span> : null}
        {title ? <h1 className='cl-page-mast-title'>{title}</h1> : null}
      </div>
      {description ? (
        <p className='cl-page-mast-desc'>{description}</p>
      ) : null}
    </header>
  )
}
