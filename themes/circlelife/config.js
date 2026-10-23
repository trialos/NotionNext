/**
 * Circle of Life 主题配置
 */
const CONFIG = {
  CIRCLELIFE_COLOR_BG: '#F5F0E4',
  CIRCLELIFE_COLOR_TEXT: '#20190F',
  CIRCLELIFE_COLOR_BORDER: 'rgba(32,25,15,0.13)',

  CIRCLELIFE_MENU_CATEGORY: true,
  CIRCLELIFE_MENU_TAG: true,
  CIRCLELIFE_MENU_ARCHIVE: true,
  CIRCLELIFE_MENU_SEARCH: true,

  CIRCLELIFE_HOME_TIMELINE: true,
  CIRCLELIFE_HOME_LATEST_CARD: true,
  /**
   * 首页照片墙题字（与照片墙同源的漂移与呼吸）：
   * 第一行「与我同行」+ 第二行「WITH CIRCLE OF LIFE」，关掉后首页不渲染该浮层
   */
  CIRCLELIFE_HOME_WALL_TITLE: true,
  CIRCLELIFE_LATEST_KICKER: '最近',
  CIRCLELIFE_HERO_COUNT: 5,
  CIRCLELIFE_HERO_AUTO_MS: 6000,
  CIRCLELIFE_HERO_COVER: true,
  /**
   * 首页「精选影集」段：最多放几辑
   * 排序规则 = Notion「精选」勾选的优先，不足用最新影集补齐
   */
  CIRCLELIFE_HOME_ALBUM_COUNT: 4,
  /** 首页精选影集段总开关 */
  CIRCLELIFE_HOME_ALBUM_SHOWCASE: true,
  CIRCLELIFE_HOME_RECENT_COUNT: 5,
  CIRCLELIFE_ARTICLE_COVER: true,

  /**
   * 文章页形态：false=全屏纸面（默认，与影集/归档同构，封面全出血 + 宽容器 + TOC 细轨）
   * true=旧卡片窄栏形态（LayoutBase 侧栏目录），供回退对比
   */
  CIRCLELIFE_ARTICLE_CARD: false,

  /** 文章正文：首行缩进 2em（false 时回到纯段距模式，段间 0.5em 仍保留） */
  CIRCLELIFE_PROSE_INDENT: true,

  CIRCLELIFE_SIDEBAR_ONLY_ON_POST: true,

  CIRCLELIFE_POST_LIST_COVER: false,

  CIRCLELIFE_ARTICLE_LAYOUT_VERTICAL: false,
  /** 文章底部分享条 / 评论：默认关，改 true 可恢复 */
  CIRCLELIFE_SHOW_SHARE: false,
  CIRCLELIFE_SHOW_COMMENT: false,

  /** 影集：Notion type=Photo；专辑字段默认「专辑」 */
  CIRCLELIFE_ALBUM_EMPTY_HINT: '在 Notion 新增 type 为 Photo 的条目，并填写封面与描述。',
  CIRCLELIFE_ALBUM_DEFAULT_NAME: '未分辑',
  /** 构建时并行拉取 Photo 正文图的批次大小（1–8） */
  CIRCLELIFE_ALBUM_FETCH_BATCH: 4,

  /**
   * 三作者：Notion 文章「作者」字段匹配 name/id
   * avatar 可选公开图 URL；不填则仅显示名或首字母
   */
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
