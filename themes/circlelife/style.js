/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

import { albumStyle } from './styles/album'
import { articleStyle } from './styles/article'
import { commonStyle } from './styles/common'
import { headerStyle } from './styles/header'
import { homeStyle } from './styles/home'
import { tokenStyle } from './styles/tokens'

/**
 * Circle of Life — 疏朗顶栏 + 全站回顶 + 抽屉 portal
 * 样式拆在 styles/（tokens/header/common/home/article/album），此处按序拼接注入
 */
const Style = () => {
  return (
    <style jsx global>{`
${tokenStyle}
${headerStyle}
${commonStyle}
${homeStyle}
${articleStyle}
${albumStyle}
      ${themeConsoleStyle('circlelife', CONFIG)}
    `}</style>
  )
}

export { Style }
