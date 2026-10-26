import { useCallback, useEffect, useRef, useState } from 'react'
import CanvasImage from './CanvasImage'
import {
  ALBUM_FOCUS_MIN_MS,
  computeFocusProgress,
  computeSweepWindow
} from './homeAlbumFocus'

/**
 * 首页精选影集段 (HomeAlbumShowcase)
 *
 * 形态参考 thereach.travel 的 Destination Discoverer 段：
 * - 左列 = 固定高度的取景框（sticky），滚动时框本身纹丝不动
 * - 框里**只显示当前影集的名字**（R14）：滚动不再平移任何东西，
 *   滚到哪一档就把哪个名字淡进来 —— 一格一格地换，不推、不滑
 * - 换挡 = 交叉淡入（名字与封面同时淡入淡出，时长同源）
 * - 强调 / 封面 / CTA 跟着「当前这一档」走（限速 250ms → 快滑不频闪）
 * - 右侧 = 纯 CSS position: sticky 钉住的面板，内容随焦点整块换页
 * - 焦点表现 = 当前名字全亮（其余名字不画）+ 2px 朱砂竖线
 *
 * 为什么不做成「滚动的连续函数」（R10 的方案）：
 *   名字跟着手指走 = 文字层每帧都要重新合成；而每次换挡，
 *   整层大字（带 4 层光晕）还要重画一遍 —— iPhone 上这两笔叠加，
 *   就是「上下滑动时像掉帧」。只留当前一个名字后：
 *   整段滚动里文字层纹丝不动（零逐帧合成），换挡也只重画一个字。
 *
 * 性能契约：
 * - 零新增依赖、零 JS 动画库、零常驻 RAF
 * - 滚动路径零布局读取、零 transform 写入（几何预计算 + 纯数值比较）
 * - 段外（IntersectionObserver 判定不可见时）自动摘掉 scroll 监听
 * - 入场动效为纯 CSS 关键帧，fill-mode: both —— 无 hydration 不匹配
 */

/**
 * 桌面端右栏的「文案栏」最小宽（≈11rem）：
 * 封面再大也不能把文案挤没 —— 封面撑到视口底时，宽度不够就让给文案栏。
 */
const ALBUM_COPY_MIN_W = 176

export default function HomeAlbumShowcase({ albums = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null)
  const bodyRef = useRef(null)
  // 照片舞台（移动端的主 sticky 元件：焦点推进区间以它的满屏时刻为准）
  const stageRef = useRef(null)
  // 取景框：桌面 display:contents（透明通道），移动端 = 真正的窗口
  const viewportRef = useRef(null)
  // 右侧 sticky 面板（桌面）：**底边钉在视口底**（align-self:end + bottom:0）
  // → 面板底边 = 视口底 → 段底抵达视口底的那一刻面板释放、Footer 紧接，
  // 段尾不留白；封面撑到视口底但**保持 4:5 比例**（不被拉成竖长条），
  // 宽度由 CSS 的视口高公式给出（见 styles/home.js）。
  // 换挡窗口以它的释放点为准（见 measure()）。
  const panelRef = useRef(null)
  // 封面盒（桌面）：measure() 用它读回 CSS 算出的「视口高驱动」封面宽，
  // 右栏空间不够时据此收窄（见 ALBUM_COPY_MIN_W）。
  const figureRef = useRef(null)
  // 上一档焦点：溶解时旧封面要在新封面下面垫底（不透明），所以要记住「谁是上一档」
  const prevActiveRef = useRef(0)
  const prevActiveIndex = prevActiveRef.current
  // 键盘聚焦的手动档位：Tab 到某条时它立刻成为当前影集；下次滚动恢复滚动驱动
  const manualRef = useRef(null)
  // 把滚动路径里的换挡逻辑暴露给 JSX 事件用
  const applyRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const section = sectionRef.current
    let scrollRafId = 0
    let focusTimer = 0
    let resizeTimer = 0
    let listening = false
    // 段几何（唯一读布局的地方）
    let sweepStart = 0
    let sweepLength = 0
    let isMobile = false
    // 状态：滚动只决定「当前是第几辑」，不再写任何位移
    let progress = 0 // 滚动进度（滚动回调写入）
    let scrollY = 0 // 最近一次滚动位置
    let focusIndex = 0 // 当前是第几辑
    let lastFocusAt = 0 // 上一次换挡的时刻（限速用）

    const mq = window.matchMedia('(max-width: 1023px)')

    // 当前档 = 滚动进度四舍五入到最近的档（名字正好在取景框正中时换）
    const focusIndexFor = p => {
      const n = albums.length
      if (n <= 1) return 0
      return Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))))
    }

    const applyFocus = index => {
      focusIndex = index
      lastFocusAt = performance.now()
      setActiveIndex(index)
    }

    // 换挡限速：两次切换至少隔 ALBUM_FOCUS_MIN_MS（快速滑动时不频闪）；
    // 被限速挡下的那次在定时器里补上（用户停手后仍要落到正确的那一辑）。
    const syncFocus = () => {
      const target = focusIndexFor(progress)
      if (target === focusIndex) return
      const wait = ALBUM_FOCUS_MIN_MS - (performance.now() - lastFocusAt)
      if (wait <= 0) {
        applyFocus(target)
        return
      }
      if (focusTimer) return
      focusTimer = window.setTimeout(() => {
        focusTimer = 0
        const next = focusIndexFor(progress)
        if (next !== focusIndex) applyFocus(next)
      }, wait)
    }

    // 滚动回调：只算「当前是第几辑」，不写 transform（文字层整段滚动纹丝不动）
    const updateScroll = () => {
      scrollY = window.scrollY || 0
      progress = computeFocusProgress(scrollY, sweepStart, sweepLength)
      const manual = manualRef.current
      if (manual != null) {
        // 键盘：直接切到那一辑（不受限速，是用户明确的动作）
        const idx = Math.min(albums.length - 1, Math.max(0, manual))
        if (idx !== focusIndex) applyFocus(idx)
        return
      }
      syncFocus()
    }
    applyRef.current = updateScroll

    // mount / resize / 字体就绪 / 断点切换后各测一次
    const measure = () => {
      const body = bodyRef.current
      if (!body || !section) return
      isMobile = mq.matches
      const bodyRect = body.getBoundingClientRect()
      const bodyTop = bodyRect.top + window.scrollY
      const bodyBottom = bodyRect.bottom + window.scrollY

      // 主 sticky 元件：移动端 = 照片舞台（满屏即钉住），
      // 桌面端 = 右栏面板（底边钉在视口底）。
      // 推进区间：
      //   起点 = 段体顶 —— 移动端是照片满屏那一刻，
      //           桌面端是段体顶进视口那一刻（这一段「真正到位」才换）
      //   终点 = 主元件被释放的位置往前留 1/4 驻留
      //           （否则最后一张刚切上来画面就开始退场）
      //
      // 释放点 = **段底抵到视口底的那一刻**：
      //   桌面端：右栏面板 bottom 钉住 → 面板底边在视口底 → 段底追上时释放
      //   移动端：照片舞台 top 钉住、高 100vh → 舞台底边触到段底时释放
      // 两端换挡窗口因此都是「0.75 × 行程」（行程 = 段体超出视口的高度）。
      const primary = isMobile ? stageRef.current : panelRef.current
      const primaryTop = primary
        ? parseFloat(getComputedStyle(primary).top) || 0
        : 0
      // 布局像素（架构库「测量单位陷阱」：布局高度判断一律用 offsetHeight）
      const primaryH = primary ? primary.offsetHeight : 0
      const releaseAt = isMobile
        ? bodyBottom - primaryTop - primaryH
        : bodyBottom - window.innerHeight
      const win = computeSweepWindow(bodyTop, releaseAt, 0.25)
      sweepStart = win.start
      sweepLength = win.length

      // 封面宽度（桌面）：面板的封面列宽由 **CSS 的视口高公式**给出
      // （calc((100svh − nav-band − 2.5rem) × 0.8) → 封面高 = 视口高 − 顶距，
      // 4:5 反推宽度；兜底值写在 CSS 里 → SSR 首帧即满高封面，无首帧位移）。
      // 这里只做一件事：**右栏宽度不够时把封面收窄**，保住文案列的最小宽
      // （否则文案被压到 0 行）。
      // ⚠️ 不能用 getComputedStyle(panel).top 反推顶距：面板是「底边钉在视口底」
      //    （top: auto），顶距是由封面高度自然得出的；desired 直接读回 CSS
      //    已经算好的宽度即可，不在 JS 里复刻导航带数学。
      // 量测点：mount / resize（去抖）/ 字体就绪 / 断点切换 —— 滚动路径零读取。
      const panel = panelRef.current
      const figure = figureRef.current
      if (isMobile || !panel || !figure) {
        if (panel) panel.style.removeProperty('--cl-home-album-cover-w')
      } else {
        // 先摘掉上一次的收窄值 → 读回的宽度就是 CSS 的「视口高驱动」满高封面宽
        panel.style.removeProperty('--cl-home-album-cover-w')
        const desired = figure.clientWidth
        const colGap = parseFloat(getComputedStyle(panel).columnGap) || 0
        const avail = panel.clientWidth - colGap - ALBUM_COPY_MIN_W
        if (desired > avail) {
          const coverW = Math.max(120, Math.floor(avail))
          panel.style.setProperty('--cl-home-album-cover-w', `${coverW}px`)
        }
      }

      // 几何变了 → 进度重算，当前档直接落位（不播过渡）
      scrollY = window.scrollY || 0
      progress = computeFocusProgress(scrollY, sweepStart, sweepLength)
      const target = focusIndexFor(progress)
      focusIndex = target
      lastFocusAt = performance.now()
      setActiveIndex(target)
    }

    const onScroll = () => {
      if (scrollRafId) return
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = 0
        updateScroll()
      })
    }

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(measure, 150)
    }

    // 断点切换（旋转 / 拖窗口）：窗口形态变了 → 重新测量
    const onMq = () => measure()

    const setListening = next => {
      if (next === listening) return
      listening = next
      if (next) {
        window.addEventListener('scroll', onScroll, { passive: true })
        updateScroll()
      } else {
        window.removeEventListener('scroll', onScroll)
        if (scrollRafId) {
          window.cancelAnimationFrame(scrollRafId)
          scrollRafId = 0
        }
        if (focusTimer) {
          window.clearTimeout(focusTimer)
          focusTimer = 0
        }
      }
    }

    measure()
    window.addEventListener('resize', onResize, { passive: true })
    mq.addEventListener?.('change', onMq)

    // 段外零开销：不可见时直接摘掉 scroll 监听
    let observer = null
    const root = document.documentElement
    if (section && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        entries => {
          const visible = entries.some(entry => entry.isIntersecting)
          // 本段可见时压制回顶按钮（滚到文章列表后自动恢复）
          root.classList.toggle('cl-home-album-active', visible)
          setListening(visible)
        },
        { rootMargin: '240px 0px 240px 0px' }
      )
      observer.observe(section)
    } else {
      setListening(true)
    }

    // Web Font 落地会改变行高 → 坐标需重测一次
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {})
    }

    return () => {
      if (observer) observer.disconnect()
      // 卸载时务必摘除状态类：否则切页后回顶按钮会永久隐藏
      root.classList.remove('cl-home-album-active')
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener?.('change', onMq)
      if (scrollRafId) window.cancelAnimationFrame(scrollRafId)
      if (focusTimer) window.clearTimeout(focusTimer)
      if (resizeTimer) window.clearTimeout(resizeTimer)
      applyRef.current = null
    }
  }, [albums.length])

  // 提交后记录当前焦点：渲染期读到的仍是上一档（用于溶解的 z 序）
  useEffect(() => {
    prevActiveRef.current = activeIndex
  }, [activeIndex])

  // 键盘可达：Tab 聚焦某条 → 它立刻成为当前影集（不受换挡限速）。
  // （不做 hover 预选：指针下的条目会随换挡变化，onMouseEnter 会反复触发 → 抖动）
  const handleItemFocus = useCallback(index => {
    manualRef.current = index
    setActiveIndex(index)
    applyRef.current?.()
  }, [])

  // 焦点离开 → 焦点权交回滚动
  const handleItemBlur = useCallback(() => {
    manualRef.current = null
    applyRef.current?.()
  }, [])

  if (!albums.length) return null

  const active = albums[activeIndex] || albums[0]
  // 下一档：提前加载它，滚过去时照片已就绪（消除「先看到上一档垫底」的空窗）
  const nextIndex = Math.min(activeIndex + 1, albums.length - 1)

  return (
    <section
      ref={sectionRef}
      className='cl-home-album'
      style={{ '--cl-home-album-count': albums.length }}
      aria-label='精选影集'>
      {/* 段头已撤：影集段不再有任何出口（博主定稿）——
          只留段内的「进入影集 →」这一个入口，段落语义由 aria-label 承担。 */}

      <div className='cl-home-album-body' ref={bodyRef}>
        {/* 移动端满幅照片舞台（桌面 display:none → 不发起图片请求）。
            溶解：当前焦点封面在上层淡入，上一档封面保持不透明垫底，
            任何一帧底下都有实体照片 → 白字始终有依托，不会露出纸底。
            舞台本身不再 aria-hidden：右下角的 CTA 要留在无障碍树里，
            装饰性的封面（alt=''）与遮罩各自退出无障碍树。 */}
        <div className='cl-home-album-stage' ref={stageRef}>
          {albums.map((album, index) =>
            album.cover?.src ? (
              <CanvasImage
                key={album.id}
                className={`cl-home-album-cover ${
                  index === activeIndex ? 'is-active' : ''
                } ${
                  index !== activeIndex && index !== prevActiveIndex
                    ? 'is-muted'
                    : ''
                }`}
                style={{
                  zIndex:
                    index === activeIndex
                      ? 2
                      : index === prevActiveIndex
                        ? 1
                        : 0
                }}
                src={album.cover.src}
                srcSet={album.cover.srcSet || undefined}
                sizes={album.cover.sizes || undefined}
                /* 当前档与**下一档**都提前加载：影集段在页面最底部，
                   等滚到才发请求会看到「上一档垫底」的旧照片（用户可感知的
                   空窗）。提前一档 → 滚过去时照片已就绪，溶解即时完成。 */
                eager={index === activeIndex || index === nextIndex}
                position='center'
              />
            ) : null
          )}
          <div className='cl-home-album-scrim' aria-hidden='true' />
        </div>

        {/* 左列：取景框（移动端 sticky 固定；桌面 display:contents 退化成原来的目录列）。
            外层的 reel 限定 sticky 的活动范围 —— 让取景框与照片舞台在同一时刻释放：
            否则舞台先退场（它的 sticky 底部在视口底），取景框却还钉着，
            标题会悬在纸面上（奶白字压奶白纸，读不出来）。
            框里只画当前影集的名字（其余条目 visibility: hidden，不参与绘制）；
            换挡时新旧名字交叉淡入。每项都是真链接，键盘可直接跳。 */}
        <div className='cl-home-album-reel'>
          <div className='cl-home-album-viewport' ref={viewportRef}>
            <ol className='cl-home-album-list'>
              {albums.map((album, index) => (
                <li
                  key={album.id}
                  className={`cl-home-album-entry ${
                    index === activeIndex ? 'is-active' : ''
                  }`}>
                  <a
                    className='cl-home-album-item'
                    href={album.href}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    onFocus={() => handleItemFocus(index)}
                    onBlur={handleItemBlur}>
                    <span className='cl-home-album-item-rule' aria-hidden='true' />
                    {/* 名字提到 h2：段标题已撤，h1（题字）之后直接是 h2，
                        避免 h1 → h3 的层级跳跃（id 与面板的 aria-labelledby 引用不变）。 */}
                    <h2
                      className='cl-home-album-item-name'
                      id={`cl-home-album-name-${album.id}`}>
                      {album.name}
                    </h2>
                    <span className='cl-home-album-item-count'>
                      {album.count} 张
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            {/* 移动端 CTA：**在取景框里**，紧跟当前辑名的下方。
                ⚠️ 必须与辑名待在**同一个 sticky 框**里（`.cl-home-album-viewport`），
                不能挂在照片舞台（`.cl-home-album-stage`）上 —— 那是两个不同的
                sticky 坐标系：取景框的 sticky 有「拉入」与「释放」两段，
                辑名在钉住之前/释放之后会上下移动，而舞台那层的坐标纹丝不动
                → CTA 与辑名会分离（真踩过：还没钉住时 CTA 叠在辑名上，
                释放后 CTA 离辑名老远）。放进取景框，两者永远同框。
                纵坐标用 `50%`（取景框高 42vh，辑名在其中垂直居中 → 名字中心
                = 50%）+ 名字半高 + 间距 → 恒在名字正下方。
                不挂 key：换挡时不必销毁重建这颗链接（滑动中的主线程开销）。 */}
            <a className='cl-home-album-cta' href={active?.href}>
              进入影集 <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>

        {/* 右侧：桌面 = sticky 钉住的面板（移动端隐藏：照片已铺底、CTA 已进窗口） */}
        <div
          ref={panelRef}
          className='cl-home-album-panel'
          aria-labelledby={`cl-home-album-name-${active?.id}`}>
          <div className='cl-home-album-panel-copy' key={active?.id}>
            <p className='cl-home-album-meta'>
              <span className='cl-home-album-meta-count'>
                {active?.count} 张
              </span>
              {active?.date ? (
                <>
                  <span className='cl-home-album-dot' aria-hidden='true'>
                    ·
                  </span>
                  <span className='cl-home-album-meta-date'>{active.date}</span>
                </>
              ) : null}
            </p>
            {active?.summary ? (
              <p className='cl-home-album-summary'>{active.summary}</p>
            ) : null}
            <a className='cl-home-album-enter' href={active?.href}>
              进入影集 <span aria-hidden='true'>→</span>
            </a>
          </div>

          <figure className='cl-home-album-figure' ref={figureRef}>
            {/* 全部封面叠在同一个网格单元里：焦点切换时不改 src（不闪白），
                旧封面留在下层，新封面解码完成前由它托底。
                桌面端这张也会在滚到影集段时成为 LCP 候选 → 同样用 canvas。 */}
            {albums.map((album, index) =>
              album.cover?.src ? (
                <CanvasImage
                  key={album.id}
                  className={`cl-home-album-img ${
                    album.id === active?.id ? 'is-active' : ''
                  }`}
                  src={album.cover.src}
                  srcSet={album.cover.srcSet || undefined}
                  sizes={album.cover.sizes || undefined}
                  /* canvas 没有 alt → 用 role="img" + aria-label 保留语义 */
                  ariaLabel={album.id === active?.id ? album.name : undefined}
                  eager={index === activeIndex || index === nextIndex}
                  position='center'
                />
              ) : null
            )}
          </figure>
        </div>
      </div>
    </section>
  )
}
