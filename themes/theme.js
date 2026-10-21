import BLOG from '@/blog.config'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { getQueryParam, getQueryVariable, isBrowser } from '../lib/utils'

// 在next.config.js中扫描所有主题
export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}
const baseLayoutCache = new Map()
const layoutByThemeCache = new Map()
let domFixTimer = null

const LayoutLoading = () => (
  <div className='min-h-screen w-full bg-[#f6f6f1] dark:bg-black' />
)

const EmptyBaseLayout = ({ children }) => <>{children}</>
const EmptyPageLayout = () => null

const IndexLayoutLoading = () => (
  <div className='pt-10 md:pt-18 w-full bg-[#f6f6f1] dark:bg-black'>
    <div className='mx-auto w-full max-w-screen-3xl px-4 py-10 lg:px-0'>
      <div className='grid gap-10 xl:grid-cols-2'>
        <section className='space-y-5'>
          <div className='h-80 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-10 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </section>
        <section className='space-y-6'>
          <div className='h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          {[0, 1].map(item => (
            <div
              key={item}
              className='flex gap-6 border-t border-gray-300 pt-6 dark:border-gray-800'>
              <div className='min-w-0 flex-1 space-y-3'>
                <div className='h-6 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-800' />
              </div>
              <div className='h-32 w-32 shrink-0 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </section>
      </div>

      <section className='mt-12'>
        <div className='flex items-center justify-between'>
          <div className='h-7 w-28 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-5 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </div>
        <div className='mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-4'>
          {[0, 1, 2, 3].map(item => (
            <div
              key={item}
              className='space-y-4 border-t border-gray-300 pt-5 dark:border-gray-800'>
              <div className='h-5 w-3/4 animate-pulse bg-gray-200 dark:bg-gray-800' />
              <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
)

const getLayoutLoading = layoutName => {
  if (layoutName === 'LayoutIndex') {
    return IndexLayoutLoading
  }
  return LayoutLoading
}

const normalizeThemeName = themeValue => {
  if (!themeValue || typeof themeValue !== 'string') return BLOG.THEME
  const firstTheme = themeValue.split(',')[0].trim()
  if (!firstTheme) return BLOG.THEME
  return THEMES.includes(firstTheme) ? firstTheme : BLOG.THEME
}

const getFallbackThemeName = themeName => {
  const preferred = normalizeThemeName(BLOG.THEME)
  if (preferred && preferred !== themeName) return preferred
  if (THEMES.includes('example') && themeName !== 'example') return 'example'
  return THEMES.find(item => item !== themeName) || null
}

const getThemeExport = (mod, exportName) => {
  if (mod?.[exportName]) return mod[exportName]
  if (mod?.default?.[exportName]) return mod.default[exportName]
  if (exportName === 'LayoutBase' && typeof mod?.default === 'function') {
    return mod.default
  }
  return null
}

const scheduleFixThemeDOM = (delay = 120) => {
  if (!isBrowser) return
  if (domFixTimer) {
    clearTimeout(domFixTimer)
  }
  domFixTimer = setTimeout(() => {
    fixThemeDOM()
    domFixTimer = null
  }, delay)
}

async function importThemeConfig(themeFolderName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return getThemeExport(mod, 'THEME_CONFIG')
  } catch (err) {
    console.error(`Failed to load theme config "${themeFolderName}":`, err)
    return null
  }
}

async function importThemeLayout(themeFolderName, layoutName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return (
      getThemeExport(mod, layoutName) ||
      getThemeExport(mod, 'LayoutSlug') ||
      null
    )
  } catch (err) {
    console.error(`Failed to load theme "${themeFolderName}":`, err)
    return null
  }
}

async function resolveThemeLayout(themeName, layoutName, emptyLayout) {
  let Layout = await importThemeLayout(themeName, layoutName)
  if (Layout) return Layout

  const fallback = getFallbackThemeName(themeName)
  if (fallback) {
    Layout = await importThemeLayout(fallback, layoutName)
    if (Layout) {
      console.warn(
        `[theme] "${themeName}" missing "${layoutName}", using fallback "${fallback}".`
      )
      return Layout
    }
  }

  console.warn(`[theme] "${themeName}" missing "${layoutName}", using empty layout.`)
  return emptyLayout
}

/* ==========================================================================
   模块级布局注册表（SSR 骨架竞态根治）

   背景：next/dynamic 只有在**模块求值期**创建，Next 的 SSR 预加载链路才能在
   服务端渲染前完成主题模块加载。此前 useLayoutByTheme() 与
   getBaseLayoutByTheme() 都在**渲染期**才 dynamic()，导致部分页面的静态产物
   直接落成 LayoutLoading 骨架（`min-h-screen w-full bg-[#f6f6f1]`）而非真实
   布局：首屏是灰屏而非纸色，SEO/社交抓到的也是骨架，同一 URL 在不同构建中
   结果可能不同（见私有库 circlelife-THEME-ARCH 排错 14）。

   做法：模块求值期一次性为主主题预建全部布局，渲染期只做查表。
   非主主题（?theme= 切换）首次访问时按需补注册，行为与改造前完全一致。
   ========================================================================== */
const layoutRegistry = new Map()

/* ==========================================================================
   主主题的静态 layout loader（CLS 1.0 根治）

   背景：next/dynamic 只有在 loader 里的 import() 能被 babel 静态识别时，才会生成
   loadableGenerated —— 客户端水合时就能同步 require 该 chunk，不必等异步下载。
   这里原本用的是模板字面量的 context import（import(`@/themes/${x}`)），插件识别不了，
   于是主题 chunk 从未被预加载（实测 <link rel=preload> 里没有它）：
     · 客户端水合时，主题组件还处在 loading 态（灰屏骨架），
     · 与服务端渲染出来的实体布局不一致 → React 判定**整棵树 hydration 不匹配**，
     · 丢弃服务端 DOM 改为客户端重渲染；期间新旧两棵树并存，
     · 页面高度翻倍再回落 → **CLS 直接到 1.0**（Core Web Vitals 不合格）。

   做法：主主题改用可静态识别的 import()，它的 chunk 本来每个页面都要用，
   预加载是净收益；其余主题（?theme= 切换）仍走 context import，
   代价只是切换时的一次闪烁 + 同样的 CLS（可接受，属边缘场景）。
   ========================================================================== */
const PRIMARY_THEME_NAME = 'circlelife'
const primaryThemeLayouts = {
  LayoutBase: dynamic(() => import('@/themes/circlelife').then(m => m.LayoutBase), {
    ssr: true
  }),
  LayoutIndex: dynamic(() => import('@/themes/circlelife').then(m => m.LayoutIndex), {
    ssr: true
  }),
  LayoutPostList: dynamic(
    () => import('@/themes/circlelife').then(m => m.LayoutPostList),
    { ssr: true }
  ),
  LayoutSlug: dynamic(() => import('@/themes/circlelife').then(m => m.LayoutSlug), {
    ssr: true
  }),
  LayoutArchive: dynamic(
    () => import('@/themes/circlelife').then(m => m.LayoutArchive),
    { ssr: true }
  ),
  LayoutAlbum: dynamic(() => import('@/themes/circlelife').then(m => m.LayoutAlbum), {
    ssr: true
  }),
  LayoutAbout: dynamic(() => import('@/themes/circlelife').then(m => m.LayoutAbout), {
    ssr: true
  }),
  LayoutSearch: dynamic(() => import('@/themes/circlelife').then(m => m.LayoutSearch), {
    ssr: true
  }),
  Layout404: dynamic(() => import('@/themes/circlelife').then(m => m.Layout404), {
    ssr: true
  }),
  LayoutTagIndex: dynamic(
    () => import('@/themes/circlelife').then(m => m.LayoutTagIndex),
    { ssr: true }
  ),
  LayoutCategoryIndex: dynamic(
    () => import('@/themes/circlelife').then(m => m.LayoutCategoryIndex),
    { ssr: true }
  )
}

/** 页面级布局：解析失败时兜底 EmptyPageLayout */
const registerPageLayout = (themeName, layoutName) => {
  const key = `${themeName}:${layoutName}`
  if (layoutRegistry.has(key)) return layoutRegistry.get(key)
  const Component =
    themeName === PRIMARY_THEME_NAME && primaryThemeLayouts[layoutName]
      ? primaryThemeLayouts[layoutName]
      : dynamic(() => resolveThemeLayout(themeName, layoutName, EmptyPageLayout), {
          ssr: true,
          loading: getLayoutLoading(layoutName)
        })
  layoutRegistry.set(key, Component)
  return Component
}

/**
 * 基础布局（LayoutBase）：解析失败时兜底 EmptyBaseLayout。
 * 与页面级链路分开，避免把「基础布局兜底」误用成「页面布局兜底」。
 */
const registerBaseLayout = themeName => {
  if (baseLayoutCache.has(themeName)) return baseLayoutCache.get(themeName)
  const Component =
    themeName === PRIMARY_THEME_NAME
      ? primaryThemeLayouts.LayoutBase
      : dynamic(() => resolveThemeLayout(themeName, 'LayoutBase', EmptyBaseLayout), {
          ssr: true
        })
  baseLayoutCache.set(themeName, Component)
  return Component
}

// 预建主主题的全部布局名（来自路由 → 布局映射表，外加基础布局）
// 注意：blog.config.js 是 CommonJS 的 module.exports，没有具名导出，
// LAYOUT_MAPPINGS 必须从 BLOG 上取（直接从 '@/blog.config' 具名导入会是 undefined）
const PRIMARY_THEME = normalizeThemeName(BLOG.THEME)
const LAYOUT_NAMES = Array.from(
  new Set([...Object.values(BLOG.LAYOUT_MAPPINGS || {}), 'LayoutBase'])
)

// 模块求值期一次性预建：SSR 可预加载，静态产物不再落成骨架
LAYOUT_NAMES.forEach(layoutName => registerPageLayout(PRIMARY_THEME, layoutName))
registerBaseLayout(PRIMARY_THEME)

/**
 * 获取主题配置（始终动态加载，与运行时 BLOG.THEME / URL ?theme 一致；不依赖编译期别名）。
 * @param {string} themeQuery - 主题查询参数（支持多个主题用逗号分隔）
 * @returns {Promise<object|null>} 主题配置对象
 */
export const getThemeConfig = async themeQuery => {
  const themeName = normalizeThemeName(themeQuery)
  let cfg = await importThemeConfig(themeName)
  if (cfg) {
    return cfg
  }
  const fallback = normalizeThemeName(BLOG.THEME)
  if (fallback !== themeName) {
    cfg = await importThemeConfig(fallback)
    if (cfg) {
      console.warn(
        `[theme] "${themeName}" config unavailable, using fallback "${fallback}".`
      )
      return cfg
    }
  }
  console.warn('[theme] No theme configuration could be loaded, using empty config.')
  return {}
}

/**
 * 获取当前主题（query 主题优先，且做合法性校验）
 */
const getCurrentTheme = (router, fallbackTheme) => {
  const queryTheme = getQueryParam(router?.asPath, 'theme')
  if (queryTheme) {
    return normalizeThemeName(queryTheme)
  }
  return normalizeThemeName(fallbackTheme || BLOG.THEME)
}

/**
 * 加载全局布局
 * @param {*} theme
 * @returns
 */
export const getBaseLayoutByTheme = theme => {
  const normalizedTheme = normalizeThemeName(theme)
  // 组件引用来自模块级注册表：同一主题恒定返回同一个组件，
  // 客户端导航不会因组件类型变化而 remount 整棵子树
  return registerBaseLayout(normalizedTheme)
}

/**
 * 动态获取布局
 * @param {*} props
 */
export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = useLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

/**
 * 加载主题文件
 * @param {*} layoutName
 * @param {*} theme
 * @returns
 */
export const useLayoutByTheme = ({ layoutName, theme }) => {
  const router = useRouter()
  const themeQuery = getCurrentTheme(router, theme)
  const cacheKey = `${themeQuery}:${layoutName}`

  if (layoutByThemeCache.has(cacheKey)) {
    // 同一主题 + 同一布局：组件引用稳定，主题根不会重复，无需再修 DOM
    return layoutByThemeCache.get(cacheKey)
  }

  // 组件由模块级注册表提供（主主题已在模块求值期预建）
  const DynamicLayoutComponent = registerPageLayout(themeQuery, layoutName)
  layoutByThemeCache.set(cacheKey, DynamicLayoutComponent)
  scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
  return DynamicLayoutComponent
}

/**
 * 根据路径 获取对应的layout名称
 * @param {*} path
 * @returns
 */
const getLayoutNameByPath = path => {
  const layoutName = BLOG.LAYOUT_MAPPINGS?.[path] || 'LayoutSlug'
  //   console.log('path-layout',path,layoutName)
  return layoutName
}

/**
 * 切换主题时的特殊处理
 * 删除多余的元素
 */
const fixThemeDOM = () => {
  if (isBrowser) {
    const elements = document.querySelectorAll('[id^="theme-"]')
    if (elements?.length > 1) {
      // 移除重复的主题根节点，保留文档顺序里最后出现的那个（当前生效的）
      for (let i = 0; i < elements.length - 1; i++) {
        if (
          elements[i] &&
          elements[i].parentNode &&
          elements[i].parentNode.contains(elements[i])
        ) {
          elements[i].parentNode.removeChild(elements[i])
        }
      }
      // 滚到存活下来的那个主题根：原写法指向 elements[0]，
      // 而它已在上面被移除，对游离节点调 scrollIntoView 是空操作
      elements[elements.length - 1]?.scrollIntoView()
    }
  }
}

/**
 * 初始化主题 , 优先级 query > cookies > systemPrefer
 * @param isDarkMode
 * @param updateDarkMode 更改主题ChangeState函数
 * @description 读取cookie中存的用户主题
 */
export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  // 查看用户设备浏览器是否深色模型
  let newDarkMode = isPreferDark()

  // 查看localStorage中用户记录的是否深色模式
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode) // 用户手动的才保存
  }

  // 如果站点强制设置默认深色，则优先级改过用
  if (defaultDarkMode === 'true') {
    newDarkMode = true
  }

  // url查询条件中是否深色模式
  const queryMode = getQueryVariable('mode')
  if (queryMode) {
    newDarkMode = queryMode === 'dark'
  }

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

/**
 * 是否优先深色模式， 根据系统深色模式以及当前时间判断
 * @returns {*}
 */
export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') {
    return true
  }
  if (BLOG.APPEARANCE === 'auto') {
    // 系统深色模式或时间是夜间时，强行置为夜间模式
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

/**
 * 读取深色模式
 * @returns {*}
 */
export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

/**
 * 保存深色模式
 * @param newTheme
 */
export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
