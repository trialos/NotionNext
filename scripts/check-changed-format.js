#!/usr/bin/env node

/**
 * 只检查「本次改动文件」的格式门禁。
 *
 * 仓库里存在大量历史文件不符合当前 Prettier 配置，全量
 * `prettier --check .` 永远失败、失去信号价值。这里把检查范围
 * 收敛到 git 改动：已跟踪文件的修改 + 未跟踪的新增文件。
 * 无改动时直接跳过，不因基线文件报错。
 */

const { execFileSync, spawnSync } = require('child_process')

function parseFileList(output) {
  if (!output || !output.trim()) return []
  return output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function collectChangedFiles({ tracked = '', untracked = '' } = {}) {
  return [...new Set([...parseFileList(tracked), ...parseFileList(untracked)])]
}

function getChangedFiles(runGit = execFileSync) {
  const tracked = runGit(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'],
    { encoding: 'utf8' }
  )
  const untracked = runGit(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    { encoding: 'utf8' }
  )
  return collectChangedFiles({ tracked, untracked })
}

function main() {
  const files = getChangedFiles()
  if (files.length === 0) {
    console.log('✅ 没有改动文件，跳过格式检查。')
    return
  }

  console.log(`🔍 检查 ${files.length} 个改动文件的格式...`)
  const prettierCli = require.resolve('prettier/bin/prettier.cjs')
  const result = spawnSync(
    process.execPath,
    [prettierCli, '--check', '--ignore-unknown', ...files],
    { stdio: 'inherit' }
  )
  process.exitCode = result.status === null ? 1 : result.status
}

if (require.main === module) main()

module.exports = { parseFileList, collectChangedFiles, getChangedFiles }
