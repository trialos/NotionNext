# V4.9.5.2 - Latest
> 迁移自：[V4.9.5.2 - Latest](https://docs.tangly1024.com/article/latest)
> 发布日期：2025-10-11
> 最后编辑：2026-5-1
> 原栏目：✨ 更新日志
> 标签：NotionNext、Notion、更新历史

<details>
<summary>旧版异常更新提示</summary>

> **💡**
>
由于Notion数据格式的变化，所有在 2026.4.2 之前部署的站点请升级至最新版本。
> 可以关注此页面，或项目讨论页获取最新动态：
>
> [https://docs.tangly1024.com/article/latest](https://docs.tangly1024.com/article/latest)
> [https://github.com/tangly1024/NotionNext/issues](https://github.com/tangly1024/NotionNext/issues)
> **💡**
>
最新事件：2026.4.2 Notion再次更新了接口的数据格式，导致旧版站点不可用。NotionNext紧急发布4.9.3.2 版本修复。4.9.3.2伴随部分数据获取的bug，在4.9.4.2版本中修复。
> <details>
> <summary>过往事件  2026.2.7</summary>
>
> 2026.2.7，Notion官方调整了数据结构，导致旧版NotionNext数据异常，目前已恢复，Notion突然的升级，让我又掉了不少头发。
> 相关问题讨论：[https://github.com/tangly1024/NotionNext/issues/3749](https://github.com/tangly1024/NotionNext/issues/3749)
>
> </details>
> <details>
> <summary>过往事件　2025.10.8</summary>
>
> > **💡**
> >
> 由于NotionAPI的升级，建议所有在2025.10.11之前部署的站点都升级至4.9.2的最新版
> 事件：2025.10.08 ,  Notion官方api改动，导致所有旧版本的NotionNext站点无法部署。站长反馈站点出现大量的530API异常。
> ![image.png](/legacy/9f96470a17fe4698.png)
>
> </details>

</details>

> **👉**
>
完整的版本发布历史可关注Github页面：
> [https://github.com/tangly1024/NotionNext/releases](https://github.com/tangly1024/NotionNext/releases)


## v4.9.5.2  - 2026.5.1

NotionNext `v4.9.5.2` 已发布 🎉

本次更新重点：**性能基线、稳定性修复、协作文档规范化**。


### 本次重点

- 新增全主题性能审计：`yarn perf:audit:themes`

- 首次提交生产模式全主题基线报告（LCP/CLS/SEO 等）

- 修复多项运行时问题与警告（Hook、菜单 key、DOM props、Mermaid）

- 优化构建/运行热路径与部分 CPU 开销

- 补齐双语贡献文档与开发导航（含中文贡献入口）


### 对开发者的价值

- 新主题开发可按统一性能准入流程验收

- 性能问题可追踪、可对比、可持续改进

- 新贡献者上手路径更清晰（脚本用途 + 双语文档）


### 版本信息

- Release: `v4.9.5.2`

- Changelog: [https://github.com/tangly1024/NotionNext/compare/v4.9.5.1...v4.9.5.2](https://github.com/tangly1024/NotionNext/compare/v4.9.5.1...v4.9.5.2)

欢迎继续反馈与贡献 ❤️


## v4.9.5.1 2026.4.30

![新主题 fuwari](/legacy/6b58471fbd621412.png)
![新主题 claude](/legacy/5c1ecb7ee6fd8c2d.png)


### **NotionNext v4.9.5.1**

**本版本是一次较大范围的迭代，重点覆盖 新主题能力（Fuwari / Claude）、渲染与兼容性稳定性、站点生成链路健壮性 与 工程流程完善。相较 **`**v4.9.4.4**`**，本版本在主题体验统一性、跨场景兼容性与维护可控性方面有明显提升。**


### **升级亮点总览**

- ✅ 完成 **Fuwari 主题迁移与多轮体验打磨**

- ✅ 引入 **Claude 主题**（增量接入，不破坏现有主题体系）

- ✅ 修复 **Mermaid / Prism / Gitbook 深色模式** 等高频反馈问题

- ✅ 修复 **站点封面、Sitemap、RSS** 等关键基础能力

- ✅ 增强 **Issue 响应自动化** 与评论系统兼容性

- ✅ 版本升级至 **4.9.5.1**

---


### **详细变更**


### **1. Fuwari 主题（迁移 + 交互完善）**


#### **1.1 主题迁移与发布**

- 完成 Fuwari 主题在 NotionNext 的适配迁移，建立主题基础布局与视觉体系。

- 形成可持续迭代的配置与组件组织方式，为后续主题共性能力复用打基础。
  - PR: [#3961](https://github.com/tangly1024/NotionNext/pull/3961)


#### **1.2 移动端与导航交互优化**

- 优化移动端顶部栏布局，提升小屏设备可读性与触达效率。

- 新增目录悬浮抽屉交互，改善文章内快速定位体验。
  - PR: [#3962](https://github.com/tangly1024/NotionNext/pull/3962)


#### **1.3 菜单与归档链路修复**

- 修复二级菜单交互问题（显示/点击路径更稳定）。

- 优化归档跳转参数继承逻辑，减少路由切换时的状态丢失。
  - PR: [#3963](https://github.com/tangly1024/NotionNext/pull/3963)


#### **1.4 视觉与可用性细节**

- 调整主题调色板行为，减少切换时体验不一致。

- 优化 analytics i18n 文案与 Hero 区域信息清晰度。
  - PR: [#3964](https://github.com/tangly1024/NotionNext/pull/3964)


#### **1.5 收尾与稳定性修正**

- 完成 Fuwari 阶段性收尾，补齐 TechGrow 模态行为问题。

- 稳定 Contact Card 翻转表现，减少镜像/背面可读性问题。
  - PR: [#3967](https://github.com/tangly1024/NotionNext/pull/3967)
  - PR: [#3971](https://github.com/tangly1024/NotionNext/pull/3971)

---


### **2. Claude 主题引入（增量接入）**

- 新增 Claude 主题能力，采用增量接入策略，尽量避免影响既有主题。

- 覆盖主题必要组件与数据链路说明，便于后续维护和二次开发。
  - PR: [#3789](https://github.com/tangly1024/NotionNext/pull/3789)

> 注：Claude 主题后续还在相关 PR 中持续补充稳定性/安全性修复（例如菜单回退、刷新链路安全、README 渲染边界、文档整理等）。

---


### **3. Mermaid / Prism / Gitbook 相关稳定性**


#### **3.1 Mermaid 渲染生命周期修复**

- 修复主题切换后 Mermaid 需要强刷才能渲染的问题。

- 改进多容器场景下 Mermaid 的扫描与绑定策略，提升动态页面稳定性。


#### **3.2 Prism 作用域与主题兼容**

- 调整 Prism/Mermaid 的作用域定位逻辑，降低不同主题结构差异导致的误匹配或漏匹配。


#### **3.3 Gitbook 深色模式配色协调**

- 优化移动端底部导航、抽屉层、目录与文章列表在 dark 模式下的配色一致性与可读性。
  - PR: [#3972](https://github.com/tangly1024/NotionNext/pull/3972)
  - PR: [#3973](https://github.com/tangly1024/NotionNext/pull/3973)

---


### **4. 核心能力修复（全站层）**


#### **4.1 首页封面回退逻辑修复**

- 修复数据库根页面场景下首页封面回退策略，补齐对 `page_cover` 优先链路的支持。
  - PR: [#3825](https://github.com/tangly1024/NotionNext/pull/3825)


#### **4.2 Proxio 导航回退修复**

- 在 `CUSTOM_MENU` 开启但自定义菜单为空时，保留默认导航回退，避免菜单整体消失。
  - PR: [#3807](https://github.com/tangly1024/NotionNext/pull/3807)


#### **4.3 Sitemap 生成健壮性提升**

- 跳过外部 slug，避免无效 URL 混入站点地图。

- 增加非法日期兜底，防止 sitemap 输出异常时间值。
  - PR: [#3806](https://github.com/tangly1024/NotionNext/pull/3806)


#### **4.4 RSS 404 问题修复**

- 修复 RSS 页面生成/访问失败导致 404 的问题，增强 Notion 数据格式兼容。
  - PR: [#3804](https://github.com/tangly1024/NotionNext/pull/3804)

---


### **5. 工程化与平台集成**


#### **5.1 自动化流程**

- 新增 Issue Response Bot 工作流，提高 issue 首次响应效率与规范化程度。
  - PR: [#3965](https://github.com/tangly1024/NotionNext/pull/3965)


#### **5.2 评论系统集成修复**

- 修复 Giscus Discussion 集成参数缺失（`data-category`、`data-strict`、`crossOrigin`）。
  - PR: [#3966](https://github.com/tangly1024/NotionNext/pull/3966)


#### **5.3 仓库清理与发布准备**

- 优化 `.gitignore`（包括本地临时目录与测试产物策略）。

- 回填本地开发缓存与部分主题 UX 变更，减少遗落差异。

- 修复 SEO 中无效字体 preload。
  - PR: [#3968](https://github.com/tangly1024/NotionNext/pull/3968)
  - PR: [#3969](https://github.com/tangly1024/NotionNext/pull/3969)
  - PR: [#3970](https://github.com/tangly1024/NotionNext/pull/3970)

---


### **6. 版本变更**

- 版本号从 `4.9.5.0` 升级至 `4.9.5.1`。
  - PR: [#3975](https://github.com/tangly1024/NotionNext/pull/3975)

---


### **PR 列表（按时间线）**

- [#3961](https://github.com/tangly1024/NotionNext/pull/3961) feat(theme): 完成 fuwari 主题迁移并发布 v4.9.5.0

- [#3962](https://github.com/tangly1024/NotionNext/pull/3962) fix(fuwari): 优化移动端顶栏布局并新增目录悬浮抽屉

- [#3963](https://github.com/tangly1024/NotionNext/pull/3963) fix(fuwari): 修复二级菜单交互并优化归档跳转参数继承

- [#3964](https://github.com/tangly1024/NotionNext/pull/3964) fix(fuwari): refine palette behavior, analytics i18n, and hero clarity

- [#3967](https://github.com/tangly1024/NotionNext/pull/3967) feat(fuwari): finalize theme work and fix TechGrow modal behavior

- [#3965](https://github.com/tangly1024/NotionNext/pull/3965) Add automated Issue Response Bot GitHub Actions workflow

- [#3966](https://github.com/tangly1024/NotionNext/pull/3966) Fix Giscus GitHub Discussion integration

- [#3968](https://github.com/tangly1024/NotionNext/pull/3968) chore(gitignore): ignore local .tmp workspace directory

- [#3969](https://github.com/tangly1024/NotionNext/pull/3969) chore: backfill missed local dev cache and fuwari UX updates

- [#3970](https://github.com/tangly1024/NotionNext/pull/3970) fix(seo): remove invalid inter-var preload

- [#3971](https://github.com/tangly1024/NotionNext/pull/3971) fix(fuwari): stabilize contact card flip and prism scoping

- [#3972](https://github.com/tangly1024/NotionNext/pull/3972) fix(prism,gitbook): stabilize mermaid lifecycle and dark mode palette

- [#3973](https://github.com/tangly1024/NotionNext/pull/3973) fix(prism,gitbook): stabilize mermaid lifecycle and dark mode palette

- [#3825](https://github.com/tangly1024/NotionNext/pull/3825) Fix homepage site cover fallback for database root page

- [#3807](https://github.com/tangly1024/NotionNext/pull/3807) fix(proxio): keep fallback nav when custom menu is empty

- [#3806](https://github.com/tangly1024/NotionNext/pull/3806) fix(sitemap): skip external slugs and guard invalid dates

- [#3804](https://github.com/tangly1024/NotionNext/pull/3804) 修复RSS页404报错

- [#3789](https://github.com/tangly1024/NotionNext/pull/3789) Claude 主题

- [#3975](https://github.com/tangly1024/NotionNext/pull/3975) chore(release): bump version to 4.9.5.1

---


### **New Contributors**

感谢以下首次贡献者：

- @Copilot in [#3965](https://github.com/tangly1024/NotionNext/pull/3965)

- **[@yunhe-dev](https://github.com/yunhe-dev)** in [#3825](https://github.com/tangly1024/NotionNext/pull/3825)

- **[@qianzhu18](https://github.com/qianzhu18)** in [#3807](https://github.com/tangly1024/NotionNext/pull/3807)

- **[@lyizhuo](https://github.com/lyizhuo)** in [#3804](https://github.com/tangly1024/NotionNext/pull/3804)

- **[@HiderX](https://github.com/HiderX)** in [#3789](https://github.com/tangly1024/NotionNext/pull/3789)

---

**Full Changelog**: [v4.9.4.4...v4.9.5.1](https://github.com/tangly1024/NotionNext/compare/v4.9.4.4...v4.9.5.1)


## v4.9.4.4 2026.4.29

这个版本重点围绕 **稳定性、兼容性与协作体验**：修复 Notion 数据结构兼容问题、增强多 Worker 构建稳定性、补齐外链与 TechGrow 行为一致性，并补充了更完善的开源协作文档。


### ✨ Highlights

- **Notion 兼容性增强**
  - 修复新版 Notion heading 类型下的 TOC 解析异常
  - 修复 Notion data source/schema 解析与页面列表合并问题
  - 修复读取 Notion 列表时的数据窜读问题

- **构建稳定性优化（并发场景）**
  - 基于 #3906 的增强，补强 `export` 阶段 block prefetch 在多 Worker 环境下的协调行为，降低重复预热与超时退化风险

- **安全与部署**
  - 锁定 `form-data` resolution 到 `^4.0.4`
  - 最小化引入 Netlify Next.js 兼容配置

- **体验改进**
  - 修复 heo 主题翻转卡片悬停状态异常
  - Notion 外链默认新标签页打开，并增加同源保护
  - 增强 TechGrow 兼容性，替代 OpenWrite 公众号解锁方案
  - 新增全局置顶标签排序（仅重排置顶子集，按最近更新时间倒序）

- **文档与协作**
  - 完善开源协作文档体系，并升级版本到 `4.9.4.4`

---


### 📦 What's Changed

- Fix: 读取Notion列表窜数据 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3932](https://github.com/tangly1024/NotionNext/pull/3932)

- Fix TOC parsing for newer Notion heading types. by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3946](https://github.com/tangly1024/NotionNext/pull/3946)

- 并发编译优化：基于 #3906 补强 export 阶段 block prefetch 的多 Worker 协调 by @88lin in [https://github.com/tangly1024/NotionNext/pull/3919](https://github.com/tangly1024/NotionNext/pull/3919)

- security: pin form-data resolution to ^4.0.4 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3952](https://github.com/tangly1024/NotionNext/pull/3952)

- Fix Notion data source schema parsing and page list merging. by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3953](https://github.com/tangly1024/NotionNext/pull/3953)

- fix: 修复 heo 主题交流频道翻转卡片悬停状态异常 by @88lin in [https://github.com/tangly1024/NotionNext/pull/3871](https://github.com/tangly1024/NotionNext/pull/3871)

- fix(notion): open external article links in new tabs with same-origin safeguard by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3954](https://github.com/tangly1024/NotionNext/pull/3954)

- chore(netlify): 最小化引入 Netlify Next.js 兼容配置 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3955](https://github.com/tangly1024/NotionNext/pull/3955)

- 增强 TechGrow 兼容性：替代OpenWrite公众号解锁方案 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3956](https://github.com/tangly1024/NotionNext/pull/3956)

- feat: 新增全局置顶标签排序（仅重排置顶子集，按最近更新时间倒序） by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3959](https://github.com/tangly1024/NotionNext/pull/3959)

- docs: 完善开源协作文档体系并升级版本到 4.9.4.4 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3960](https://github.com/tangly1024/NotionNext/pull/3960)

---


### 🙌 New Contributors

- @88lin made their first contribution in [https://github.com/tangly1024/NotionNext/pull/3919](https://github.com/tangly1024/NotionNext/pull/3919)

---

**Full Changelog**: [https://github.com/tangly1024/NotionNext/compare/v4.9.4.2...v4.9.4.4](https://github.com/tangly1024/NotionNext/compare/v4.9.4.2...v4.9.4.4)


## V4.9.4.2 2026.4.5

- 针对 4.9.3.2 - 4.9.4 版本中，为了兼容Notion数据格式变动，而产生的新bug进行修复；

- 修复 由于循环获取数据，导致API超频调用 Too Many Requests 429的问题，同时导致部分文章数据丢失的问题。

- 构建模式调整
  1. 默认改为 ISR（fallback: 'blocking'），并且最多预存首页文章与最新文章（不超过10篇），控制编译打包时长。
  1. 仅纯静态部署方案使用全量SSG。


## V4.9.4 2026.4.2

- 将 react-notion-x/notion-utils 组件升级至 7.10.0 版本，修复页面部分样式丢失的问题


## **V4.9.3.2 2026.4.2**

**What's Changed**

- hotfix： 兼容NOTION_API升级 by **[@tangly1024](https://github.com/tangly1024)** in [#3746](https://github.com/tangly1024/NotionNext/pull/3746)

- 修复由于Notion数据格式改变导致的编译异常 by **[@tanglyqq](https://github.com/tanglyqq)** in [#3883](https://github.com/tangly1024/NotionNext/pull/3883) **[@tangly1024](https://github.com/tangly1024)** in [#3884](https://github.com/tangly1024/NotionNext/pull/3884)

- log by **[@tangly1024](https://github.com/tangly1024)** in [#3747](https://github.com/tangly1024/NotionNext/pull/3747)

- 保证编译通过 by **[@tangly1024](https://github.com/tangly1024)** in [#3748](https://github.com/tangly1024/NotionNext/pull/3748)

- Release/4.9.2.1 by **[@tangly1024](https://github.com/tangly1024)** in [#3752](https://github.com/tangly1024/NotionNext/pull/3752)

- 修復clerk 無法編譯 by **[@tangly1024](https://github.com/tangly1024)** in [#3753](https://github.com/tangly1024/NotionNext/pull/3753)

- Release/4.9.3 by **[@tangly1024](https://github.com/tangly1024)** in [#3757](https://github.com/tangly1024/NotionNext/pull/3757)

- 页面url转换bug by **[@tangly1024](https://github.com/tangly1024)** in [#3771](https://github.com/tangly1024/NotionNext/pull/3771)

- 文章路由错乱bug by **[@tangly1024](https://github.com/tangly1024)** in [#3802](https://github.com/tangly1024/NotionNext/pull/3802)

- 英雄区副文章数量 by **[@tanglyqq](https://github.com/tanglyqq)** in [#3870](https://github.com/tangly1024/NotionNext/pull/3870)

![image](/legacy/5fbe0e79bae1b19e.png)

**Full Changelog**: [v4.9.3...v4.9.3.2](https://github.com/tangly1024/NotionNext/compare/v4.9.3...v4.9.3.2)


## **[V4.9.3](https://github.com/tangly1024/NotionNext/releases/tag/v4.9.3)**** 2026.2.8**

![image](/legacy/5fbe0e79bae1b19e.png)

- 修复Notion数据更新导致的站点部署异常，数据显示异常等bug

- 在文章分享区增加了CSDN和稀土掘金的选项 by **[@DalnyEFZ](https://github.com/DalnyEFZ)** in [#3691](https://github.com/tangly1024/NotionNext/pull/3691)

- 修复了Next主题无法解密邮件地址 by **[@KZaqur](https://github.com/KZaqur)** in [#3709](https://github.com/tangly1024/NotionNext/pull/3709)

**New Contributors**

- **[@DalnyEFZ](https://github.com/DalnyEFZ)** made their first contribution in [#3691](https://github.com/tangly1024/NotionNext/pull/3691)

- **[@KZaqur](https://github.com/KZaqur)** made their first contribution in [#3709](https://github.com/tangly1024/NotionNext/pull/3709)

**Full Changelog**: [v4.9.2...v4.9.3](https://github.com/tangly1024/NotionNext/compare/v4.9.2...v4.9.3)


## [V4.9.2](https://github.com/tangly1024/NotionNext/releases/tag/v4.9.2)

- 2025.10.11 : NotionNext跟随 notion-react-x 补丁，发布4.9.2版本，修复notion-api异常，不再需要额外添加`api_base_url`进行过度。

- 升级notion-react-x 核心依赖，修复notion-api异常 ，并使网页样式更加贴近Notion Release/4.9.2 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3656](https://github.com/tangly1024/NotionNext/pull/3656)

**Full Changelog**: [https://github.com/tangly1024/NotionNext/compare/v4.9.1...v4.9.2](https://github.com/tangly1024/NotionNext/compare/v4.9.1...v4.9.2)


## **[v4.9.1](https://github.com/tangly1024/NotionNext/releases/tag/v4.9.1)**** **

- 2025.10.09 : 发布紧急补丁版本4.9.1，支持用户配置自定义接口域名，暂时让站点能够使用。

- 版本 4.9.1，临时用api_base_url方案处理接口异常。 by @tangly1024 in [https://github.com/tangly1024/NotionNext/pull/3637](https://github.com/tangly1024/NotionNext/pull/3637)


### **What's Changed**

- fix(PROXIO): add second button support and improve code structure by **[@qixing-jk](https://github.com/qixing-jk)** in [#3540](https://github.com/tangly1024/NotionNext/pull/3540)

- fix(giscus): add padding to prevent iframe overflow by **[@qixing-jk](https://github.com/qixing-jk)** in [#3579](https://github.com/tangly1024/NotionNext/pull/3579)

- 【更新waline】更新package.json中的waline/client版本 by **[@lifeafter619](https://github.com/lifeafter619)** in [#3549](https://github.com/tangly1024/NotionNext/pull/3549)

- fix notion 溢出1000个block不显示 by **[@tangly1024](https://github.com/tangly1024)** in [#3582](https://github.com/tangly1024/NotionNext/pull/3582)

- UMAMI by **[@tangly1024](https://github.com/tangly1024)** in [#3583](https://github.com/tangly1024/NotionNext/pull/3583)


### **重要**

由于NotionAPI的调整，增加了一些打包限流的补丁功能

- custom_api_base_url by **[@tangly1024](https://github.com/tangly1024)** in [#3632](https://github.com/tangly1024/NotionNext/pull/3632)

- Feat/deploy ratelimiter by **[@tangly1024](https://github.com/tangly1024)** in [#3636](https://github.com/tangly1024/NotionNext/pull/3636)

**Full Changelog**: [V4.9.0...v4.9.1](https://github.com/tangly1024/NotionNext/compare/V4.9.0...v4.9.1)

## 原文链接

https://docs.tangly1024.com/article/latest
