import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from '@testing-library/react'

import ArchiveIndex from '@/themes/circlelife/components/ArchiveIndex'
import {
  ARCHIVE_ALL,
  buildArchiveFacets
} from '@/themes/circlelife/components/archiveFilter'

const { archiveStyle } = require('../../../themes/circlelife/styles/archive')

const flatCss = css => css.replace(/\s+/g, ' ')
const note = '梳理对生活与世界的感悟，写下想要深度思考的一些话题。'

const facets = buildArchiveFacets({
  '2026-11': [
    {
      id: 'p1',
      title: '甲',
      category: '字里行间',
      publishDate: 1,
      tagItems: [{ name: '思考' }]
    }
  ]
})

function renderIndex(activeCategoryNote) {
  return render(
    <ArchiveIndex
      facets={facets}
      activeCategoryKey='cat:字里行间'
      activeTagKey={ARCHIVE_ALL}
      activeCategoryName='字里行间'
      activeCategoryNote={activeCategoryNote}
      activeTagName=''
      archiveRange='2026-11'
      expanded={false}
      onCategoryChange={() => {}}
      onTagChange={() => {}}
      onToggleExpanded={() => {}}>
      <div>stage</div>
    </ArchiveIndex>
  )
}

describe('归档分类注记（select 选项的 description）', () => {
  test('渲染在分类轨道与归档主体之间', () => {
    const { container } = renderIndex(note)
    const el = container.querySelector('.cl-archive-note')
    expect(el).not.toBeNull()
    expect(el.textContent).toBe(note)
    expect(el.previousElementSibling.className).toContain('cl-cat-track')
    expect(el.nextElementSibling.className).toContain('cl-archive-body')
  })

  test('没有注释时不渲染任何占位', () => {
    const { container } = renderIndex('')
    expect(container.querySelector('.cl-archive-note')).toBeNull()
  })

  describe('接线与样式契约', () => {
    const themeSource = fs.readFileSync(
      path.resolve(process.cwd(), 'themes/circlelife/index.js'),
      'utf8'
    )
    const pageSource = fs.readFileSync(
      path.resolve(process.cwd(), 'pages/archive/index.js'),
      'utf8'
    )

    test('LayoutArchive：只在选中具体分类时取注释，「全部」传空串', () => {
      expect(themeSource).toContain('categoryNotes?.[activeCategoryName]')
      expect(themeSource).toContain('activeCategoryKey === ARCHIVE_ALL')
      expect(themeSource).toContain(
        'activeCategoryNote={activeCategoryNote}'
      )
    })

    test('归档页生成「分类名 → 注释」轻量映射，不保留完整 categoryOptions', () => {
      expect(pageSource).toContain('props.categoryNotes')
      expect(pageSource).toContain('category?.description')
      expect(pageSource).toContain('delete props.categoryOptions')
    })

    test('样式：朱砂竖线、衬线 13px、换行平衡', () => {
      const flat = flatCss(archiveStyle)
      expect(flat).toContain('#theme-circlelife .cl-archive-note {')
      expect(flat).toContain('border-left: 2px solid var(--cl-accent)')
      expect(flat).toContain('font-size: 13px')
      expect(flat).toContain('text-wrap: balance')
    })
  })
})
