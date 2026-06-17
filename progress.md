# 项目进度追踪

## 当前阶段: M0 - 项目初始化 (进行中)

### 已完成
- [x] 项目计划制定
- [x] Agent Team组建
- [x] 架构设计文档 (docs/architecture.md) - 2026-03-05
- [x] 教学方法论文档 (docs/pedagogy.md) - 2026-03-05
- [x] 家长功能设计 (2026-03-05)
- [x] MVP开发计划制定 (2026-03-05)
- [x] 知识内容系统设计 (docs/knowledge-system.md) - 2026-03-05
- [x] 数据模型和数据库初始化脚本 (server/src/models/) - 2026-03-05
- [x] 前端项目初始化 (React + TypeScript + Tailwind) - 2026-03-05
- [x] Phaser.js 游戏引擎集成 - 2026-03-05
- [x] 后端项目搭建 (Node.js + Express + SQLite) - 2026-03-05

### 进行中
- [ ] 安装前端依赖
- [ ] 功能测试

### 待开始
- [ ] 游戏核心开发 (M1)
- [ ] 内容填充
- [ ] 测试与发布

## 里程碑进度

| 里程碑 | 状态 | 说明 |
|--------|------|------|
| M0: 项目初始化 | 进行中 | 基础框架已搭建 |
| M1: 核心玩法验证 | 待开始 | 第2-3周 |
| M2: 家长功能集成 | 待开始 | 第4周 |
| M3: MVP发布 | 待开始 | 第5周 |

## 更新日志

### 2026-03-05 (v1.3) - 数据模型创建
- 完成数据库初始化脚本 (server/src/models/init.ts)
  - 创建 users 表（支持学生/家长/教师角色）
  - 创建 characters 表（游戏角色属性系统）
  - 创建 questions 表（题库，支持多题型多难度）
  - 创建 learning_progress 表（知识点掌握度追踪）
  - 创建 battle_records 表（对战记录）
  - 创建数据库索引优化查询性能
- 完成 TypeScript 类型定义 (server/src/types/models.ts)
  - 定义所有数据库表的 TypeScript 接口
  - 定义辅助类型（分页、统计等）
- 插入22道示例题目
  - 覆盖10以内加减法、20以内加减法、100以内加减法
  - 包含计算题、选择题、应用题三种题型
  - 难度从2到6递进，符合教学设计

### 2026-03-05 (v1.2) - 知识内容系统设计
- 完成知识内容系统设计文档 (docs/knowledge-system.md)
  - 设计知识点层级模型（领域->模块->单元->知识点）
  - 定义MVP知识图谱（20以内加减法、100以内加减法、简单应用题）
  - 设计题库数据模型（题目核心结构、模板系统、示例）
  - 实现自适应出题算法（知识点选择策略、难度计算、掌握度更新）
  - 规划RESTful API接口（知识图谱、题库、自适应出题、用户状态）
  - 设计数据库表结构（知识点表、题目表、用户掌握状态表等）
  - 规划缓存策略和性能优化方案

### 2026-03-05 (v1.1)
- 完成系统架构设计文档 (docs/architecture.md)
  - 采用 React + TypeScript + Tailwind 前端技术栈
  - 采用 Phaser.js 作为游戏引擎
  - 采用 Node.js + Express 后端架构
  - 采用 SQLite 作为 MVP 数据库
  - 设计 Monorepo 项目结构
  - 定义核心引擎模块（对战引擎、成长引擎、题目引擎）
  - 设计数据模型（用户、角色、题目、对战记录、学习进度）
  - 规划 RESTful API 端点
- 完成教学方法论文档 (docs/pedagogy.md)
  - 确立游戏化学习核心理念
  - 设计激励机制和难度自适应
  - 定义知识点图谱和掌握度计算

### 2026-03-05
- **家长功能设计完成**
  - 学习时长统计方案
  - 正确率分析设计
  - 薄弱知识点提示逻辑
  - 安全控制措施
  - 数据统计方案

- **MVP开发计划完成**
  - 定义4个里程碑（M0-M3）
  - 分解详细任务清单
  - 确定MVP功能范围
  - 规划成功指标
  - 明确团队分工

- 启动Agent Team模式
- 分配7个核心任务

### 2026-06-16 (v1.4) - 三大优化功能上线
**Architect 完成三项核心功能的全栈实现：**

1. **错题复习模式**（符合 pedagogy.md §3 间隔重复 + §4.2 即时反馈）
   - 新建 `src/pages/MistakePractice.tsx`：从错题库随机抽题重做
   - 答对 → 从错题本移除（已掌握）；答错 → 展示正确答案
   - 完成页展示本次练习统计（答对/答错/正确率）
   - 路由：`/mistakes/practice`

2. **成就系统**（符合 pedagogy.md §3.2 多元化激励）
   - 更新 `src/utils/storage.ts`：新增 13 个成就定义 + 解锁逻辑
   - 覆盖维度：分数/正确率/连胜/坚持局数/累计答对/连续学习
   - 新建 `src/pages/AchievementWall.tsx`：成就墙展示页（解锁/未解锁状态 + 分享功能）
   - 更新 `src/pages/Quiz.tsx`：结算时自动检测成就 + 弹窗庆祝
   - 路由：`/achievements`

3. **每日任务 UI**（符合 pedagogy.md §3.1 核心循环可视化）
   - 更新 `src/pages/Home.tsx`：环形进度条 + 领取奖励按钮 + 可自定义目标
   - 接入已有 `getDailyTask/claimDailyReward/setDailyTarget` 存储函数
   - 更新 `Quiz.tsx`：每答对一题递增每日进度

**文件变更清单：**
- 新增：`MistakePractice.tsx`、`AchievementWall.tsx`
- 修改：`storage.ts`、`Home.tsx`、`Quiz.tsx`、`MistakeBook.tsx`、`App.tsx`

### 2026-06-16 (v1.5) - 30 轮自循环开发完成
**30 轮迭代新增功能总览：**

| 轮次 | 功能 | 文件 |
|------|------|------|
| 2 | 答题音效反馈 | `sounds.ts` (新建), `Quiz.tsx` |
| 3 | 答题提示系统 | `Quiz.tsx` (hint 字段, 连续错误提示) |
| 4 | 计时挑战模式 | `TimedChallenge.tsx` (新建), `App.tsx`, `Home.tsx` |
| 5 | 错题知识点颜色分类 | `MistakeBook.tsx` |
| 6 | 可自定义每日任务目标 | `storage.ts`, `Home.tsx` |
| 7 | 连击奖励提示 | `Quiz.tsx` |
| 8 | 首页连续学习天数 | `storage.ts`, `Home.tsx` |
| 9 | 错题本按知识点筛选 | `MistakeBook.tsx` |
| 10 | 护眼模式 | `Home.tsx` |
| 11 | 成就系统扩展 (+3成就) | `storage.ts` |
| 12 | 错题本薄弱知识点提示 | `MistakeBook.tsx` |
| 13 | 答题难度选择器 | `Quiz.tsx` |
| 14 | 首页错题提醒角标 | `Home.tsx` |
| 15 | 答题今日统计 | `Quiz.tsx` |
| 16 | 答题快捷键 (1-4) | `Quiz.tsx` |
| 17 | 错题本搜索 | `MistakeBook.tsx` |
| 18 | 计时挑战时长选择 | `TimedChallenge.tsx` |
| 19 | 答题音效开关 | `Quiz.tsx` |
| 20 | 错题排序（按时间倒序） | `MistakeBook.tsx` |
| 21 | 成就分享功能 | `AchievementWall.tsx` |
| 22 | 首页最近成就展示 | `Home.tsx` |
| 23 | 知识点掌握度追踪 | `storage.ts`, `Quiz.tsx`, `MistakeBook.tsx` |
| 24 | 错题本掌握度展示 | `MistakeBook.tsx` |
| 25 | 答题结算分享按钮 | `Quiz.tsx` |
| 26 | 计时挑战分享 | `TimedChallenge.tsx` |
| 27 | 深色模式背景适配 | `Home.tsx` |
| 28 | 深色模式标题适配 | `Home.tsx` |
| 29 | 错题本深色模式 | `MistakeBook.tsx` |
| 30 | 文档更新 | `progress.md` |

**教学设计对齐（pedagogy.md）：**
- §3 间隔重复 → 错题复习模式、错题排序
- §3.1 核心循环 → 每日任务、连击系统、成就解锁
- §3.2 多元化激励 → 16 个成就覆盖多维度
- §3.4 挫折保护 → 提示系统、护眼模式、音效开关
- §4.2 即时反馈 → 音效、连击提示、掌握度追踪

### 2026-06-16 (v2.0) - 第二轮 30 轮自循环开发完成

**新增系统：**
1. **金币系统** — 答题获得金币，用于商店兑换
2. **商店系统** — 6 种道具和主题可购买
3. **道具系统** — 提示/护盾/双倍金币等
4. **冒险模式** — 20 关卡制，逐步解锁
5. **生存模式** — 3 条命，答错扣命
6. **精准模式** — 答错即结束，追求最高连击
7. **排行榜** — 本地成绩排名
8. **家长控制** — 时长限制 + 密码保护
9. **应用题** — 3 种文字题模板
10. **主题系统** — 4 种主题（默认/海洋/森林/糖果）
11. **无障碍设置** — 大字/高对比/减少动画
12. **每日挑战** — 每日目标，奖励 50 金币
13. **数据导出** — 支持 JSON 导出导入
14. **成就扩展** — 新增 3 个成就（共 16 个）

**新增文件：**
- `src/pages/Shop.tsx`
- `src/pages/Adventure.tsx`
- `src/pages/Survival.tsx`
- `src/pages/Precision.tsx`
- `src/pages/Leaderboard.tsx`
- `src/pages/ParentControl.tsx`
- `src/pages/DailyChallengePage.tsx`

**路由新增：**
- `/shop` — 商店
- `/adventure` — 冒险模式
- `/survival` — 生存模式
- `/precision` — 精准模式
- `/leaderboard` — 排行榜
- `/parent-control` — 家长控制
- `/daily-challenge` — 每日挑战

**localStorage 新增 key：**
- `mathgame_coins` — 金币
- `mathgame_inventory` — 道具背包
- `mathgame_leaderboard` — 排行榜
- `mathgame_parent_control` — 家长控制
- `mathgame_theme` — 主题
- `mathgame_accessibility` — 无障碍设置
- `mathgame_daily_challenge` — 每日挑战

### 2026-06-17 (v2.1) - 登录还原 + 商店移除 + i18n 国际化

**需求**：还原登录模块，移除付费/商店模块，实现多语言国际化支持。

**技术选型**：`react-i18next` + `i18next` + `i18next-browser-languagedetector`

#### 1. 登录模块还原
- **还原**：`src/utils/api.ts` — 恢复 `register`、`login`、`logout`、`saveProgress`、`loadProgress`
- **还原**：`src/utils/index.ts` — 恢复 `export * from './api'`
- **还原**：`src/pages/Home.tsx` — 恢复 auth state + handleAuth/handleSync/handleLoad/handleLogout + 用户状态 UI

#### 2. 付费/商店模块移除
- **删除**：`src/pages/Shop.tsx`
- **移除**：`App.tsx` 中的 Shop import 和 `/shop` 路由
- **移除**：`Home.tsx` 中的金币显示和商店链接

#### 3. i18n 国际化实现
**核心配置**：
- `src/i18n.ts` — i18next 配置，浏览器语言检测，动态加载 locale JSON
- `src/main.tsx` — 改为异步加载翻译后再渲染
- `public/locales/{lang}/translation.json` — 8 种语言翻译文件

**支持语言**：
| 代码 | 语言 | 状态 |
|------|------|------|
| en | English | ✅ 完整 |
| zh | 简体中文 | ✅ 完整 |
| es | Español | ✅ 完整 |
| fr | Français | ✅ 完整 |
| de | Deutsch | ✅ 部分 key 已 fallback |
| ja | 日本語 | ✅ 部分 key 已 fallback |
| pt | Português | ✅ 部分 key 已 fallback |
| ar | العربية | ✅ 部分 key 已 fallback |

**翻译键总数**：~200+ keys，覆盖：
- Home 页（导航、统计、成就、每日任务、认证）
- Quiz/Game/Timed/Adventure/Survival/Precision 模式
- MistakeBook/MistakePractice 错题系统
- AchievementWall/Leaderboard/ParentControl/ParentReport
- engine/questions.ts 题目引擎（知识点名、应用题模板、角色名、物品名、提示）
- 动画组件（ComboEffect/FeedbackOverlay/LevelUpModal）

**语言切换器**：Home 页右上角下拉菜单，选择后存入 `localStorage('mathgame_lang')`

**浏览器检测**：首次访问时通过 `navigator.language` 自动匹配

**文件变更清单**：
- 新增：`src/i18n.ts`
- 新增：`public/locales/{en,zh,es,fr,de,ja,pt,ar}/translation.json` (8 个)
- 修改：`src/main.tsx`, `src/App.tsx`, `src/utils/index.ts`, `src/utils/api.ts`
- 修改：15 个页面文件（i18n hook + 字符串替换 + 金币移除）
- 修改：3 个动画组件（ComboEffect, FeedbackOverlay, LevelUpModal）
- 修改：`src/engine/questions.ts`（i18next.t() 替换中文知识点名/模板/人名/物品名）
- 删除：`src/pages/Shop.tsx`

**构建结果**：✅ `vite build` 成功，497 模块，5.96s

---

### 2026-06-17 (v2.2) - i18n 系统重构（纯前端 + 15 语言 + SEO）

**用户技术要求**：
1. 网页右上角现代感语言切换下拉
2. 不要复杂后端路由，前端 `const translations = {...}` 字典
3. 纯 JS 监听切换，一键替换文本
4. `navigator.language` 自动检测浏览器语言
5. 动态更新 meta title/description 用于 SEO

**重构内容**：
- 移除 npm 依赖：`react-i18next`、`i18next`、`i18next-browser-languagedetector`
- 新建 `src/translations.ts`（238KB，15 种语言，单文件字典）
- 新建 `src/i18n.tsx`：纯 React Context + Hook 实现
  - `t()` 函数支持 `{{var}}` 插值和嵌套 key
  - `LANGUAGES` 数组导出 15 种语言（含 RTL 标记）
  - `detectLanguage()` 优先级：localStorage → navigator.languages → 默认 `en`
  - `updateSEO()` 动态更新 `<title>`、`meta[description]`、`html[lang]`、`html[dir]`
  - 提供 `useTranslation()` hook（API 与 react-i18next 兼容）
  - 提供 `i18n.t()` 用于非 React 文件（engine/questions.ts）

**支持语言（15 种）**：
| 主流 | 小语种 |
|------|--------|
| English (en) | 한국어 (ko) |
| 简体中文 (zh) | Русский (ru) |
| Español (es) | Türkçe (tr) |
| Français (fr) | Tiếng Việt (vi) |
| Deutsch (de) | ภาษาไทย (th) |
| 日本語 (ja) | हिन्दी (hi) |
| Português (pt) | Italiano (it) |
| العربية (ar, RTL) | |

**Home 页语言切换器（重新设计）**：
- 现代感下拉按钮：国旗 + 母语名 + 旋转箭头
- 点击展开浮层：所有 15 种语言列表 + 当前选中高亮 + ✓ 标记
- 移动端友好（小屏幕仅显示国旗）
- 选择后立即切换 + 持久化到 `localStorage('mathgame_lang')`
- 自动更新页面 SEO 标签

**SEO 优化**：
- `index.html` 默认英文标题/描述/og:tags（爬虫首次访问看到 EN）
- 切换语言后 `document.title` 和 `meta[description]` 立即更新
- `<html lang="...">` 和 `<html dir="...">` 动态切换（阿拉伯语 RTL 自动生效）
- 15 种语言的 SEO meta 文案均已编写（覆盖儿童数学游戏关键词）

**构建结果**：
- ✅ `vite build` 成功，467 模块（移除 30 个 i18next 模块）
- 包大小：491KB → 178KB gzip
- 翻译数据：197.5KB（15 种语言全打包，无懒加载延迟）

**文件变更清单**：
- 新增：`src/translations.ts`、`public/locales/{ko,ru,tr,vi,th,hi,it}/translation.json`
- 重写：`src/i18n.tsx`（原 `src/i18n.ts` 删除）
- 修改：`src/main.tsx`（使用 `I18nProvider`）、`index.html`（SEO defaults）
- 修改：`src/pages/Home.tsx`（现代下拉切换器 + 15 语言）
- 修改：所有页面/组件 import：`react-i18next` → `@/i18n`
- 修改：`engine/questions.ts`、`Quiz.tsx` 中 `i18next.t()` → `i18n.t()`

---

### 2026-06-17 (v2.3) - SEO 优化（仅 Googlebot 范围）

**用户要求**：只对 Googlebot 友好就够了，不需要为不执行 JS 的爬虫做 SSR/预渲染。

**已实现的 7 项 Googlebot SEO**：

1. **`hreflang` 多语言标签**（最关键）
   - 静态：`index.html` 含 16 个 hreflang link（15 语言 + x-default）
   - 动态：切换语言时由 `i18n.tsx` 重新生成 hreflang，URL 含 `?lang=xx`

2. **`canonical` URL**
   - 默认英文版指向根 URL
   - 切换语言时同步为 `https://...?lang=xx`

3. **JSON-LD 结构化数据**（`EducationalApplication` schema）
   - 含 audience（儿童 6-12 岁）、teaches（加减乘除）、offers（免费）
   - Google Rich Snippets 可显示星级、年龄段、价格标签
   - 切换语言时 `name`、`description`、`inLanguage` 字段同步更新

4. **完整 Open Graph**
   - og:type, og:site_name, og:url, og:title, og:description
   - og:image（指向 `/og-image.png`，需后续准备图片）
   - og:locale + 14 个 og:locale:alternate（声明所有语言变体）

5. **Twitter Card**
   - summary_large_image 类型
   - twitter:title / description / image 同步切换

6. **`sitemap.xml`** (`public/sitemap.xml`, 23KB)
   - 15 个 URL 入口
   - 每个 URL 包含全部 15 个 hreflang alternates + x-default
   - 含 lastmod、changefreq、priority

7. **`robots.txt`** (`public/robots.txt`)
   - Allow all + Sitemap 声明

**URL 策略**：单页应用通过 `?lang=xx` 查询参数声明语言变体
- `https://site.com/` — 英文（默认，无参数）
- `https://site.com/?lang=ja` — 日文
- 各语言变体通过 hreflang 互相声明

**语言检测优先级**（更新）：
1. URL `?lang=xx` 参数（最高，便于 SEO/分享）
2. localStorage 用户偏好
3. `navigator.languages` 浏览器语言
4. 默认英文

**真实 Chrome 验证**：
- ✅ 日语浏览器 → `<title>` 自动切换 + canonical 含 `?lang=ja` + html lang="ja"
- ✅ `?lang=ko` 直接访问 → 韩语标题 + canonical 正确
- ✅ 16 个 hreflang 全部存在
- ✅ JSON-LD `inLanguage` 字段动态更新
- ✅ robots.txt 和 sitemap.xml 可通过 HTTP 访问

**待办**（部署前需准备）：
- 准备 `public/og-image.png`（社交分享缩略图，建议 1200x630px）
- ~~修改所有 URL 中的 `mathwizard.app` 为实际域名~~ ✅ 已完成（域名: `https://math-game.lazytoolshub.top`）
- 部署后到 Google Search Console 提交 sitemap.xml

**文件变更**：
- 重写：`src/i18n.tsx`（updateSEO 函数大幅扩展）
- 重写：`index.html`（含完整静态 SEO meta）
- 新增：`public/sitemap.xml`、`public/robots.txt`

---

## 关键决策记录

### MVP范围决策
- 聚焦1-2年级内容，约500道计算题
- 核心RPG元素：角色属性、经验升级、简单战斗
- 家长功能：学习报告、时长统计、薄弱点提示
- 排除：多人对战、完整装备系统、高年级内容

### 家长功能设计原则
- 透明不监控：提供数据透明，避免过度监控
- 引导不控制：提供建议，尊重孩子自主性
- 鼓励不施压：正向激励为主
- 隐私保护：数据安全，家庭隐私保护