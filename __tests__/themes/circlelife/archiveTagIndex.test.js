/**
 * 归档页标签索引（手机端默认收缩）契约测试
 *
 * 背景：博主 2026-10 要求「/archive（页内刊头『全部文章』）在手机端的标签索引
 * 默认收缩」。此前手机端首屏默认铺开 11 个标签行，实测占位 550px（390 视口），
 * 把文章时间线整片推到首屏之下；收缩后只剩一条 52px 窄条
 * （标签索引 | 全部标签 | 展开），时间线起点由 y≈767 提前到 y≈293。
 *
 * 关键设计：收缩态由 CSS 承担（<768px 默认隐藏面板、显示窄条），展开态由 JS
 * 挂 .is-expanded 覆盖。这样服务端 HTML 与客户端首帧完全一致 → 无 hydration
 * 不匹配、无「先展开再收缩」的闪动与 CLS。本测试把这三点固化成断言：
 *   ① CSS：手机默认收缩、显式展开才铺开、旧类名 is-collapsed 退役；
 *   ② 组件：默认不带 is-expanded，点「展开」才带，选中标签即收窄；
 *   ③ 焦点：只在焦点本就落在被隐藏控件上时搬运，不抢分类轨道的焦点。
 */
import fs from 'fs'
import path from 'path'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import ArchiveIndex from '@/themes/circlelife/components/ArchiveIndex'
import {
  ARCHIVE_ALL,
  buildArchiveFacets
} from '@/themes/circlelife/components/archiveFilter'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const readThemeFile = (...parts) =>
  fs.readFileSync(path.join(themeDir, ...parts), 'utf8')

const { archiveStyle } = require('../../../themes/circlelife/styles/archive')

/** 折叠所有空白，便于对多行 CSS 选择器做单行包含断言 */
const flatCss = css => css.replace(/\s+/g, ' ')

/** 真实形状的 facets（走 buildArchiveFacets，不手搓夹具） */
const archivePosts = {
  '2026-10': [
    {
      id: 'p1',
      title: '甲',
      category: '随笔',
      publishDate: 1,
      tagItems: [{ name: '思考' }]
    },
    {
      id: 'p2',
      title: '乙',
      category: '人机协作',
      publishDate: 2,
      tagItems: [{ name: '思考' }, { name: '工具' }]
    }
  ]
}
const facets = buildArchiveFacets(archivePosts)

/**
 * 与 themes/circlelife/index.js 的 LayoutArchive 同构的受控外壳：
 * 父级持有展开态与筛选态，组件保持受控。
 * 注意：展开/收起只由「展开」「收起」两个按钮驱动，切分类 / 选标签都不重置。
 */
function ArchiveHarness({ onCategoryChange, onTagChange }) {
  const [activeCategoryKey, setActiveCategoryKey] = React.useState(ARCHIVE_ALL)
  const [activeTagKey, setActiveTagKey] = React.useState(ARCHIVE_ALL)
  const [expanded, setExpanded] = React.useState(false)

  const activeScope =
    facets.scopes.get(activeCategoryKey) || facets.scopes.get(ARCHIVE_ALL)
  const activeTagName =
    activeTagKey === ARCHIVE_ALL
      ? ''
      : activeScope?.tags.find(tag => tag.key === activeTagKey)?.name || ''

  return (
    <ArchiveIndex
      facets={facets}
      activeCategoryKey={activeCategoryKey}
      activeTagKey={activeTagKey}
      activeCategoryName=""
      activeTagName={activeTagName}
      archiveRange='2026-10'
      expanded={expanded}
      onCategoryChange={key => {
        setActiveCategoryKey(key)
        setActiveTagKey(ARCHIVE_ALL)
        onCategoryChange?.(key)
      }}
      onTagChange={key => {
        setActiveTagKey(key)
        onTagChange?.(key)
      }}
      onToggleExpanded={() => setExpanded(value => !value)}
    >
      <div>stage</div>
    </ArchiveIndex>
  )
}

const indexOf = container => container.querySelector('.cl-archive-tagindex')
const isExpanded = container => indexOf(container).className.includes('is-expanded')

describe('circlelife 归档页标签索引：手机端默认收缩', () => {
  describe('CSS 契约（styles/archive.js）', () => {
    const flat = flatCss(archiveStyle)

    test('手机端默认：面板隐藏、窄条显示', () => {
      expect(flat).toContain(
        '#theme-circlelife .cl-archive-tagindex .cl-archive-tagindex__panel { display: none; }'
      )
      expect(flat).toContain(
        '#theme-circlelife .cl-archive-tagindex .cl-archive-tagbar { display: block; }'
      )
    })

    test('显式展开（.is-expanded）才铺开面板、收起窄条', () => {
      expect(flat).toContain(
        '#theme-circlelife .cl-archive-tagindex.is-expanded .cl-archive-tagindex__panel { display: block; }'
      )
      expect(flat).toContain(
        '#theme-circlelife .cl-archive-tagindex.is-expanded .cl-archive-tagbar { display: none; }'
      )
    })

    test('默认收缩规则落在 @media (max-width: 767px) 内（桌面不受影响）', () => {
      const mobileStart = flat.indexOf('@media (max-width: 767px)')
      expect(mobileStart).toBeGreaterThan(-1)
      const mobileBlock = flat.slice(mobileStart)
      expect(mobileBlock).toContain(
        '#theme-circlelife .cl-archive-tagindex .cl-archive-tagindex__panel { display: none; }'
      )
    })

    test('旧类名 is-collapsed 退役（语义已反转为 is-expanded）', () => {
      expect(archiveStyle).not.toContain('is-collapsed')
      expect(archiveStyle).toContain('is-expanded')
    })
  })

  describe('父级契约（themes/circlelife/index.js）', () => {
    const source = readThemeFile('index.js')

    test('展开态初值为 false —— 手机端默认收缩', () => {
      expect(source).toContain(
        'const [tagIndexExpanded, setTagIndexExpanded] = useState(false)'
      )
    })

    test('旧的收缩态命名不再出现', () => {
      expect(source).not.toContain('tagIndexCollapsed')
    })

    test('组件收到 expanded / onToggleExpanded', () => {
      expect(source).toContain('expanded={tagIndexExpanded}')
      expect(source).toContain('onToggleExpanded={() => setTagIndexExpanded(')
    })

    test('展开态只由「展开 / 收起」按钮驱动：切分类、选标签都不重置', () => {
      // useState 解构 1 次 + onToggleExpanded 1 次 = 2；多一处就说明有人
      // 又让分类/标签切换去改展开态（会覆盖用户的显式选择）
      const occurrences = source.split('setTagIndexExpanded').length - 1
      expect(occurrences).toBe(2)
      expect(source).not.toContain('setTagIndexExpanded(true)')
      expect(source).not.toContain('setTagIndexExpanded(key')
    })
  })

  describe('组件契约（ArchiveIndex 渲染）', () => {
    test('默认不带 is-expanded：两个按钮 aria-expanded 均为 false', () => {
      const { container } = render(<ArchiveHarness />)
      expect(isExpanded(container)).toBe(false)
      expect(screen.getByRole('button', { name: '展开' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
      expect(screen.getByRole('button', { name: '收起' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })

    test('点「展开」→ 挂上 is-expanded，「收起」按钮 aria-expanded 转 true', () => {
      const { container } = render(<ArchiveHarness />)
      fireEvent.click(screen.getByRole('button', { name: '展开' }))
      expect(isExpanded(container)).toBe(true)
      expect(screen.getByRole('button', { name: '收起' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
      expect(screen.getByRole('button', { name: '展开' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    test('点「收起」→ 摘掉 is-expanded', () => {
      const { container } = render(<ArchiveHarness />)
      fireEvent.click(screen.getByRole('button', { name: '展开' }))
      fireEvent.click(screen.getByRole('button', { name: '收起' }))
      expect(isExpanded(container)).toBe(false)
    })

    test('选中具体标签 → 筛选生效，但不改展开态（只由按钮驱动）', () => {
      const onTagChange = jest.fn()
      const { container } = render(<ArchiveHarness onTagChange={onTagChange} />)
      fireEvent.click(screen.getByRole('button', { name: '展开' }))
      fireEvent.click(screen.getByRole('button', { name: /#思考/ }))
      expect(onTagChange).toHaveBeenCalled()
      expect(isExpanded(container)).toBe(true)
      // 收起后窄条显示当前标签
      fireEvent.click(screen.getByRole('button', { name: '收起' }))
      expect(isExpanded(container)).toBe(false)
      expect(
        container.querySelector('.cl-archive-tagbar__value').textContent
      ).toBe('#思考')
    })

    test('切分类 → 展开态保持：默认收起就一直收起', () => {
      const onCategoryChange = jest.fn()
      const { container } = render(
        <ArchiveHarness onCategoryChange={onCategoryChange} />
      )
      fireEvent.click(screen.getByRole('button', { name: /随笔/ }))
      expect(onCategoryChange).toHaveBeenCalled()
      expect(isExpanded(container)).toBe(false)
    })

    test('切分类 → 展开态保持：用户手动展开后，各分类都保持展开', () => {
      const { container } = render(<ArchiveHarness />)
      fireEvent.click(screen.getByRole('button', { name: '展开' }))
      fireEvent.click(screen.getByRole('button', { name: /随笔/ }))
      expect(isExpanded(container)).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: /人机协作/ }))
      expect(isExpanded(container)).toBe(true)
    })

    test('点「清除」→ 展开态保持（只由按钮驱动）', () => {
      const { container } = render(<ArchiveHarness />)
      fireEvent.click(screen.getByRole('button', { name: '展开' }))
      fireEvent.click(screen.getByRole('button', { name: /#思考/ }))
      const clearBtn = screen.queryByRole('button', { name: '清除' })
      expect(clearBtn).not.toBeNull()
      fireEvent.click(clearBtn)
      expect(isExpanded(container)).toBe(true)
      expect(
        container.querySelector('.cl-archive-tagbar__value').textContent
      ).toBe('全部标签')
    })

    test('窄条始终提供「展开」入口', () => {
      const { container } = render(<ArchiveHarness />)
      const bar = container.querySelector('.cl-archive-tagbar')
      expect(bar).not.toBeNull()
      expect(bar.textContent).toContain('标签索引')
      expect(bar.textContent).toContain('全部标签')
    })
  })

  describe('焦点搬运（手机端）', () => {
    const originalMatchMedia = window.matchMedia

    beforeEach(() => {
      window.matchMedia = jest.fn(query => ({
        matches: query.includes('max-width: 767px'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      }))
    })

    afterEach(() => {
      window.matchMedia = originalMatchMedia
    })

    test('点「展开」→ 焦点从窄条移到面板的「收起」', () => {
      render(<ArchiveHarness />)
      const expandBtn = screen.getByRole('button', { name: '展开' })
      expandBtn.focus()
      expect(document.activeElement).toBe(expandBtn)
      fireEvent.click(expandBtn)
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: '收起' })
      )
    })

    test('点「收起」→ 焦点回到窄条的「展开」', () => {
      render(<ArchiveHarness />)
      fireEvent.click(screen.getByRole('button', { name: '展开' }))
      const collapseBtn = screen.getByRole('button', { name: '收起' })
      collapseBtn.focus()
      fireEvent.click(collapseBtn)
      expect(document.activeElement).toBe(screen.getByRole('button', { name: '展开' }))
    })

    test('点分类轨道 → 不改展开态、不抢焦点（焦点留在分类按钮上）', () => {
      render(<ArchiveHarness />)
      const categoryBtn = screen.getByRole('button', { name: /全部，共 2 篇/ })
      categoryBtn.focus()
      fireEvent.click(categoryBtn)
      expect(document.activeElement).toBe(categoryBtn)
    })

    test('载入时不动焦点', () => {
      render(<ArchiveHarness />)
      expect(document.activeElement).toBe(document.body)
    })
  })
})
