/**
 * 列表类页面统一页头
 */
export default function TlPageHero({ eyebrow, title, description }) {
  if (!title) return null
  return (
    <header className='cl-page-hero'>
      {eyebrow ? <p className='cl-kicker mb-2'>{eyebrow}</p> : null}
      <h1 className='cl-article-title !mb-0 !text-[1.5rem] md:!text-[1.75rem]'>
        {title}
      </h1>
      {description ? (
        <p className='mt-2 mb-0 text-sm leading-relaxed text-[var(--cl-muted)]'>
          {description}
        </p>
      ) : null}
    </header>
  )
}
