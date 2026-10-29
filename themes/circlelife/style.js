/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

import { aboutStyle } from './styles/about'
import { albumStyle } from './styles/album'
import { archiveStyle } from './styles/archive'
import { articleStyle } from './styles/article'
import { commonStyle } from './styles/common'
import { filterTrackStyle } from './styles/filterTrack'
import { headerStyle } from './styles/header'
import { homeStyle } from './styles/home'
import { homeArticlesStyle } from './styles/homeArticles'
import { mastStyle } from './styles/mast'
import { musicStyle } from './styles/music'
import { tokenStyle } from './styles/tokens'

/**
 * Circle of Life — 疏朗顶栏 + 全站回顶 + 抽屉 portal
 * 样式拆在 styles/（tokens/header/common/mast/filterTrack/home/archive/article/album/music/about），此处按序拼接注入
 */
const Style = () => {
  return (
    <style jsx global>{`
${tokenStyle}
${headerStyle}
${commonStyle}
${mastStyle}
${filterTrackStyle}
${homeStyle}
${homeArticlesStyle}
${archiveStyle}
${articleStyle}
${albumStyle}
${musicStyle}
${aboutStyle}
      ${themeConsoleStyle('circlelife', CONFIG)}
    `}</style>
  )
}

export { Style }
