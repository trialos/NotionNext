/**
 * Circle of Life 主题配置
 */
const CONFIG = {
  CIRCLELIFE_COLOR_BG: '#F5F0E4',
  CIRCLELIFE_COLOR_SURFACE: '#FCFAF4',
  CIRCLELIFE_COLOR_TEXT: '#20190F',
  CIRCLELIFE_COLOR_MUTED: '#57493A',
  CIRCLELIFE_COLOR_BORDER: 'rgba(32,25,15,0.13)',
  CIRCLELIFE_COLOR_ACCENT: '#B24A33',

  CIRCLELIFE_MENU_CATEGORY: true,
  CIRCLELIFE_MENU_TAG: true,
  CIRCLELIFE_MENU_ARCHIVE: true,
  CIRCLELIFE_MENU_SEARCH: true,

  CIRCLELIFE_HOME_TIMELINE: true,
  CIRCLELIFE_HOME_LATEST_CARD: true,
  CIRCLELIFE_LATEST_KICKER: '最近',
  CIRCLELIFE_HERO_COUNT: 5,
  CIRCLELIFE_HERO_AUTO_MS: 6000,
  CIRCLELIFE_HERO_COVER: true,
  CIRCLELIFE_ARTICLE_COVER: true,

  CIRCLELIFE_SIDEBAR_ONLY_ON_POST: true,

  CIRCLELIFE_POST_LIST_COVER: false,
  CIRCLELIFE_TITLE_IMAGE: false,
  CIRCLELIFE_HOME_MINIMAL_HEADER: true,

  CIRCLELIFE_ARTICLE_LAYOUT_VERTICAL: false,
  CIRCLELIFE_ARTICLE_HIDDEN_NOTIFICATION: true,
  /** 文章底部分享条 / 评论：默认关，改 true 可恢复 */
  CIRCLELIFE_SHOW_SHARE: false,
  CIRCLELIFE_SHOW_COMMENT: false,

  /**
   * 三作者：Notion 文章「作者」字段匹配 name/id
   * avatar 可选公开图 URL；不填则仅显示名或首字母
   */
  /** 影集：Notion type=Photo；专辑字段默认「专辑」 */
  CIRCLELIFE_ALBUM_EMPTY_HINT: '在 Notion 新增 type 为 Photo 的条目，并填写封面与描述。',
  CIRCLELIFE_ALBUM_DEFAULT_NAME: '未分辑',
  /** 构建时并行拉取 Photo 正文图的批次大小（1–8） */
  CIRCLELIFE_ALBUM_FETCH_BATCH: 4,

  CIRCLELIFE_AUTHORS: [
    {
      id: 'andrew',
      name: 'Andrew',
      avatar: '',
      blurb: '喜欢生活和思考'
    },
    {
      id: 'felix',
      name: 'Felix',
      avatar: '',
      blurb: 'ex-通信 · 折腾 AI'
    },
    {
      id: 'barry',
      name: 'Barry',
      avatar: '',
      blurb: '期权观察 · 周报'
    }
  ]
}
export default CONFIG
