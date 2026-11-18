const fs = require('fs')
const path = require('path')

const {
  parseFileList,
  collectChangedFiles,
  getChangedFiles
} = require('../../scripts/check-changed-format')

const root = path.resolve(__dirname, '../..')

describe('scripts/check-changed-format', () => {
  describe('parseFileList', () => {
    test('空输出返回空数组', () => {
      expect(parseFileList('')).toEqual([])
      expect(parseFileList('   \n\n')).toEqual([])
      expect(parseFileList(null)).toEqual([])
    })

    test('按行切分、去首尾空白、忽略空行', () => {
      expect(parseFileList('a.js\n  b.js  \n\n c.md\n')).toEqual([
        'a.js',
        'b.js',
        'c.md'
      ])
    })
  })

  describe('collectChangedFiles', () => {
    test('合并已跟踪与未跟踪文件并去重', () => {
      expect(
        collectChangedFiles({
          tracked: 'a.js\nb.js\n',
          untracked: 'b.js\nc.md\n'
        })
      ).toEqual(['a.js', 'b.js', 'c.md'])
    })

    test('两者都为空时返回空数组（无改动 → 门禁跳过）', () => {
      expect(collectChangedFiles({})).toEqual([])
    })
  })

  describe('getChangedFiles', () => {
    test('干净工作区（git 输出为空）返回空数组，门禁将跳过', () => {
      const runGit = jest.fn(() => '')
      expect(getChangedFiles(runGit)).toEqual([])
      expect(runGit).toHaveBeenCalledTimes(2)
    })

    test('合并已跟踪与未跟踪的 git 输出', () => {
      const runGit = jest
        .fn()
        .mockReturnValueOnce('a.js\n')
        .mockReturnValueOnce('b.md\n')
      expect(getChangedFiles(runGit)).toEqual(['a.js', 'b.md'])
    })
  })

  describe('门禁接线', () => {
    const pkg = require('../../package.json')

    test('format:check 指向改动文件门禁脚本', () => {
      expect(pkg.scripts['format:check']).toContain('check-changed-format')
    })

    test('保留 format:check:all 全量检查入口', () => {
      expect(pkg.scripts['format:check:all']).toContain('prettier --check .')
    })

    test('quality-check.js 不再硬编码全量 prettier check', () => {
      const src = fs.readFileSync(
        path.join(root, 'scripts/quality-check.js'),
        'utf8'
      )
      expect(src).not.toContain('npx prettier --check .')
      expect(src).toContain('npm run format:check')
    })
  })
})
