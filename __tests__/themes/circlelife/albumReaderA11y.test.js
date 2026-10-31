/**
 * 影集目录抽屉无障碍契约
 *
 * 抽屉是模态对话框：打开聚焦关闭按钮，Tab / Shift+Tab 在抽屉内循环，
 * 关闭后焦点归还底部「目录」触发器。阅读器不放行 wheel，滚动仍是原生链路。
 */
import fs from 'fs'
import path from 'path'

const reader = fs.readFileSync(
  path.resolve(process.cwd(), 'themes/circlelife/components/AlbumReader.js'),
  'utf8'
)

describe('影集目录抽屉焦点管理', () => {
  test('抽屉声明为模态对话框，关闭时对辅助技术隐藏', () => {
    expect(reader).toContain("role='dialog'")
    expect(reader).toContain("aria-modal='true'")
    expect(reader).toContain('aria-hidden={!indexOpen}')
  })

  test('打开后聚焦关闭按钮，关闭后归还目录触发器', () => {
    expect(reader).toContain("querySelector('.overlay-close')")
    expect(reader).toMatch(/indexTriggerRef\.current\?\.focus/)
    expect(reader).toContain('ref={indexTriggerRef}')
    expect(reader).toContain('ref={indexOverlayRef}')
  })

  test('Tab 焦点在抽屉内循环', () => {
    expect(reader).toContain("event.key === 'Tab' && indexOpen")
    expect(reader).toContain('trapIndexFocus(event)')
    expect(reader).toContain('event.shiftKey && active === first')
    expect(reader).toContain('!event.shiftKey && active === last')
    expect(reader).toContain('overlay.contains(active)')
  })
})
