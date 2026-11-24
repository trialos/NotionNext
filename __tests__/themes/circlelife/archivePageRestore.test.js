import fs from 'fs'
import path from 'path'

const themeDir = path.resolve(process.cwd(), 'themes/circlelife')
const source = fs.readFileSync(path.join(themeDir, 'index.js'), 'utf8')

describe('归档返回恢复页码（LayoutArchive 契约）', () => {
  test('首帧页码恒为 1，避免 SSR/CSR hydration 不一致', () => {
    expect(source).toContain('const [page, setPage] = useState(1)')
  })

  test('首次解析用筛选签名比对记忆，命中才 setPage(记住的页)', () => {
    expect(source).toContain('pageFilterSigRef.current === null')
    expect(source).toContain('const filterSig = `${categoryKey}|${tagKey}`')
    expect(source).toContain('readArchivePage(storage)')
    expect(source).toContain('if (signatureMatches) setPage(remembered.page)')
  })

  test('后续筛选真的变了回第 1 页，router 重跑不误重置', () => {
    expect(source).toContain('pageFilterSigRef.current !== filterSig')
    expect(source).toContain('setPage(1)')
  })

  test('翻页写入页码 + 当前筛选签名', () => {
    expect(source).toContain('writeArchivePage(')
    expect(source).toContain('clamped,\n      currentQuery')
  })

  test('显式切筛选清空页码记忆，但重复点当前筛选不清', () => {
    const clearCall =
      'writeArchivePage(isBrowser ? window.sessionStorage : null, 0, null)'
    expect(source).toContain(clearCall)
    // 清空必须发生在 if (unchanged) return 之后，否则重复点当前分类会误抹页码
    const unchangedReturn = source.indexOf('if (unchanged) return')
    const clearIndex = source.indexOf(clearCall)
    expect(unchangedReturn).toBeGreaterThan(-1)
    expect(clearIndex).toBeGreaterThan(unchangedReturn)
  })
})
