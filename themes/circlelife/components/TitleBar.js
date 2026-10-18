import { useRouter } from 'next/router'

/**
 * 旧站名大标题区已废弃：列表页改用 PageMast / TlPageHero。
 * 保留组件以免 LayoutBase 报错，一律不渲染。
 */
export default function TitleBar() {
  useRouter()
  return null
}
