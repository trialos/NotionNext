import { defineConfig } from 'vitepress'

/** 仅发布站长向文档；开发者长篇与英文副本不进入静态站 */
const srcExclude = [
  '**/*.en.md',
  '**/performance/**',
  'GETTING_STARTED.md',
  'ARCHITECTURE.md',
  'PROJECT_STRUCTURE.md',
  'CONFIGURATION.md',
  'CONTRIBUTION_WORKFLOW.md',
  'MAINTENANCE_PHILOSOPHY.zh-CN.md',
  'MAINTENANCE_PHILOSOPHY.en.md',
  'THEME_MIGRATION_GUIDE.md',
  'THEME_MIGRATION_GUIDE.zh-CN.md',
  'COMMUNITY_SITE_ROADMAP.md',
  'UPDATE.md',
  'README.en.md',
  'themes/THOUGHTLITE_MIGRATION_PLAN.zh-CN.md',
  // 含 {{ }} 或复杂代码块，易触发 VitePress 解析错误；站长向见 user-guide/themes/
  'themes/CLAUDE.md',
  'themes/ENDSPACE.md',
  'themes/FUWARI.md',
  'themes/THOUGHTLITE.md'
]

export default defineConfig({
  title: 'NotionNext 使用说明',
  description: 'NotionNext 部署、配置、主题与 Notion 教程',
  lang: 'zh-CN',
  srcDir: 'docs',
  srcExclude: [...srcExclude, 'README.md', 'themes/README.md'],
  cleanUrls: true,
  lastUpdated: true,
  /** 教程内大量链到未收录的开发者文档 / 仓库根路径，构建时不阻断 */
  ignoreDeadLinks: true,
  themeConfig: {
    logo: '/favicon.ico',
    nav: [
      { text: '使用说明', link: '/user-guide/intro', activeMatch: '/user-guide/' },
      { text: '主题', link: '/user-guide/themes/THEMES_CATALOG', activeMatch: '/user-guide/themes/' },
      { text: '参考手册', link: '/user-guide/reference/features', activeMatch: '/user-guide/reference/' },
      { text: '维护策略', link: '/DOCUMENTATION_POLICY' },
      { text: '参与维护', link: '/user-guide/maintain-docs' },
      {
        text: 'GitHub',
        link: 'https://github.com/notionnext-org/NotionNext/tree/main/docs'
      }
    ],
    sidebar: {
      '/user-guide/': [
        {
          text: '快速开始',
          items: [
            { text: '介绍', link: '/user-guide/intro' },
            { text: 'Vercel 部署', link: '/user-guide/deploy-vercel' },
            { text: 'Notion 数据库', link: '/user-guide/notion-database' },
            { text: '配置站点', link: '/user-guide/config-site' },
            { text: '菜单 Menu', link: '/user-guide/menu-secondary' },
            { text: '升级', link: '/user-guide/update' }
          ]
        },
        {
          text: '参考（4.9.x）',
          items: [
            { text: '全站配置索引', link: '/user-guide/reference/features' },
            { text: 'Notion 4.x', link: '/user-guide/reference/notion-4x' }
          ]
        },
        {
          text: '部署',
          collapsed: true,
          items: [
            { text: '部署索引', link: '/user-guide/deploy/' },
            { text: 'Vercel 域名', link: '/user-guide/deploy/vercel-domain' },
            { text: 'Vercel 静态导出', link: '/user-guide/deploy/vercel-static' },
            { text: 'Cloudflare Pages', link: '/user-guide/deploy/cloudflare-pages' },
            { text: 'Netlify', link: '/user-guide/deploy/netlify' },
            { text: 'VPS', link: '/user-guide/deploy/vps' }
          ]
        },
        {
          text: '配置',
          collapsed: true,
          items: [
            { text: '基础功能', link: '/user-guide/config/site-basics' },
            { text: 'URL 自定义', link: '/user-guide/config/url-customize' },
            { text: 'Algolia', link: '/user-guide/config/algolia' }
          ]
        },
        {
          text: '主题（25）',
          collapsed: true,
          items: [
            { text: '主题目录', link: '/user-guide/themes/' },
            { text: '全览表', link: '/user-guide/themes/THEMES_CATALOG' },
            { text: 'Simple', link: '/user-guide/themes/simple' },
            { text: 'Hexo', link: '/user-guide/themes/hexo' },
            { text: 'Heo', link: '/user-guide/themes/heo' },
            { text: 'Proxio', link: '/user-guide/themes/proxio' },
            { text: 'GitBook', link: '/user-guide/themes/gitbook' },
            { text: 'Claude', link: '/user-guide/themes/claude' },
            { text: 'ThoughtLite', link: '/user-guide/themes/thoughtlite' }
          ]
        },
        {
          text: '评论 · 统计 · 插件',
          collapsed: true,
          items: [
            { text: '评论总览', link: '/user-guide/comments/overview' },
            { text: '统计总览', link: '/user-guide/analytics/overview' },
            { text: '插件总览', link: '/user-guide/plugins/overview' },
            { text: '音乐播放器', link: '/user-guide/plugins/music-player' }
          ]
        },
        {
          text: '开发与帮助',
          collapsed: true,
          items: [
            { text: '开发入门', link: '/user-guide/development/getting-started' },
            { text: '运行原理', link: '/user-guide/development/architecture' },
            { text: '反馈', link: '/user-guide/help/feedback' },
            { text: '参与维护（在线站）', link: '/user-guide/maintain-docs' },
            { text: '维护工作流', link: '/user-guide/MAINTENANCE_WORKFLOW' },
            { text: '迁移索引', link: '/user-guide/ARTICLE_INDEX' }
          ]
        },
        {
          text: '更新日志',
          collapsed: true,
          items: [
            { text: '最新版本', link: '/user-guide/changelog/latest' },
            { text: 'V4 历史', link: '/user-guide/changelog/v4-history' }
          ]
        }
      ],
      '/': [
        {
          text: '文档',
          items: [
            { text: '首页', link: '/' },
            { text: '使用说明', link: '/user-guide/intro' },
            { text: '文档维护策略', link: '/DOCUMENTATION_POLICY' },
            { text: '参与维护', link: '/user-guide/maintain-docs' }
          ]
        }
      ]
    },
    editLink: {
      pattern:
        'https://github.com/notionnext-org/NotionNext/edit/main/docs/:path',
      text: '在 GitHub 上维护此页'
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/notionnext-org/NotionNext/tree/main/docs'
      }
    ],
    footer: {
      message:
        '以 GitHub 仓库为准 · <a href="https://github.com/notionnext-org/NotionNext/tree/main/docs" target="_blank" rel="noreferrer">浏览 docs 目录</a> · <a href="https://github.com/notionnext-org/NotionNext/blob/main/docs/README.md" target="_blank" rel="noreferrer">维护说明</a>',
      copyright: 'NotionNext · MIT'
    },
    search: { provider: 'local' }
  }
})
