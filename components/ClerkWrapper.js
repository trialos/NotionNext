import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations/zh-CN'

/**
 * Clerk 身份提供者轻量按需包装组件
 * 替代全量静态引入 4.3MB 的 @clerk/localizations/dist/index.mjs
 * 仅在配置 Clerk 密钥时按需载入 64KB 的 zh-CN 语言包
 */
export default function ClerkWrapper({ children }) {
  return <ClerkProvider localization={zhCN}>{children}</ClerkProvider>
}
