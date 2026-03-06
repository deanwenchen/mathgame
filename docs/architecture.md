# 儿童算数小能手 - 系统架构设计文档

## 1. 系统架构概览

### 1.1 架构设计理念

本系统采用**分层模块化架构**，核心设计原则：

- **教育优先**：所有技术决策以支持教育目标为首要考量
- **渐进增强**：MVP 快速验证，逐步扩展功能
- **跨平台兼容**：一次开发，多端部署
- **可扩展性**：支持未来功能扩展和内容更新

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Client Layer)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │   Web App   │  │  小程序端   │  │   App 端    │                      │
│  │  (React)    │  │ (Taro/Uni)  │  │ (React Nav) │                      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
│         │                │                │                              │
│         └────────────────┼────────────────┘                              │
│                          ▼                                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    游戏引擎层 (Phaser.js)                          │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │  │
│  │  │场景管理 │ │精灵系统 │ │动画系统 │ │物理引擎 │ │音频系统 │     │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API 网关层 (API Gateway)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Express.js + 中间件 (认证/限流/日志/CORS)                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          业务服务层 (Service Layer)                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐              │
│  │ 用户服务   │ │ 游戏服务   │ │ 题目服务   │ │ 报告服务   │              │
│  │ UserService│ │GameService│ │QuizService │ │ReportSvc  │              │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘              │
│        │             │             │             │                      │
│  ┌─────┴─────────────┴─────────────┴─────────────┴─────┐              │
│  │                    核心业务引擎                       │              │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │              │
│  │  │对战引擎  │ │成长引擎  │ │推荐引擎  │ │分析引擎  │ │              │
│  │  │BattleEng │ │GrowthEng │ │RecomEng  │ │AnalyEng  │ │              │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │              │
│  └─────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          数据持久层 (Data Layer)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐              │
│  │  SQLite   │ │  Redis    │ │  文件存储  │ │  缓存层   │              │
│  │ (MVP主库) │ │ (会话/排行榜)│ │ (头像/资源)│ │ (本地存储)│              │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. 项目目录结构

```
mathgame/
├── docs/                          # 文档目录
│   ├── architecture.md            # 架构设计文档
│   ├── pedagogy.md               # 教学方法论文档
│   └── api/                      # API 文档
│       └── openapi.yaml
│
├── packages/                      # Monorepo 多包结构
│   │
│   ├── core/                     # 核心共享库
│   │   ├── src/
│   │   │   ├── types/            # TypeScript 类型定义
│   │   │   │   ├── user.ts
│   │   │   │   ├── game.ts
│   │   │   │   ├── quiz.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/        # 游戏常量
│   │   │   │   ├── skills.ts     # 技能定义
│   │   │   │   ├── items.ts      # 道具定义
│   │   │   │   └── levels.ts     # 等级配置
│   │   │   ├── utils/            # 工具函数
│   │   │   │   ├── math.ts       # 数学计算
│   │   │   │   ├── random.ts     # 随机数生成
│   │   │   │   └── validation.ts # 数据验证
│   │   │   └── engines/          # 核心引擎
│   │   │       ├── battle/       # 对战引擎
│   │   │       ├── growth/       # 成长引擎
│   │   │       └── quiz/         # 题目引擎
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                      # Web 前端应用
│   │   ├── public/
│   │   │   ├── assets/           # 静态资源
│   │   │   │   ├── sprites/      # 精灵图
│   │   │   │   ├── audio/        # 音效
│   │   │   │   └── fonts/        # 字体
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── components/       # React 组件
│   │   │   │   ├── common/       # 通用组件
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   └── Loading/
│   │   │   │   ├── game/         # 游戏组件
│   │   │   │   │   ├── BattleScene/
│   │   │   │   │   ├── MapScene/
│   │   │   │   │   ├── QuizModal/
│   │   │   │   │   └── Character/
│   │   │   │   ├── home/         # 首页组件
│   │   │   │   └── parent/       # 家长端组件
│   │   │   ├── hooks/            # 自定义 Hooks
│   │   │   │   ├── useGame.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useProgress.ts
│   │   │   ├── stores/           # 状态管理 (Zustand)
│   │   │   │   ├── userStore.ts
│   │   │   │   ├── gameStore.ts
│   │   │   │   └── settingsStore.ts
│   │   │   ├── services/         # API 服务
│   │   │   │   ├── api.ts
│   │   │   │   ├── authService.ts
│   │   │   │   └── gameService.ts
│   │   │   ├── phaser/           # Phaser 游戏配置
│   │   │   │   ├── scenes/       # 游戏场景
│   │   │   │   │   ├── BootScene.ts
│   │   │   │   │   ├── MainMenuScene.ts
│   │   │   │   │   ├── WorldMapScene.ts
│   │   │   │   │   ├── BattleScene.ts
│   │   │   │   │   └── ResultScene.ts
│   │   │   │   ├── objects/      # 游戏对象
│   │   │   │   │   ├── Player.ts
│   │   │   │   │   ├── Enemy.ts
│   │   │   │   │   └── NPC.ts
│   │   │   │   └── config.ts     # Phaser 配置
│   │   │   ├── styles/           # Tailwind 样式
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   ├── server/                   # 后端服务
│   │   ├── src/
│   │   │   ├── controllers/       # 控制器
│   │   │   │   ├── authController.ts
│   │   │   │   ├── userController.ts
│   │   │   │   ├── gameController.ts
│   │   │   │   ├── quizController.ts
│   │   │   │   └── reportController.ts
│   │   │   ├── services/         # 业务服务
│   │   │   │   ├── authService.ts
│   │   │   │   ├── userService.ts
│   │   │   │   ├── gameService.ts
│   │   │   │   ├── quizService.ts
│   │   │   │   └── reportService.ts
│   │   │   ├── models/           # 数据模型
│   │   │   │   ├── User.ts
│   │   │   │   ├── Character.ts
│   │   │   │   ├── Quiz.ts
│   │   │   │   ├── Battle.ts
│   │   │   │   └── Progress.ts
│   │   │   ├── routes/           # 路由
│   │   │   │   ├── index.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── games.ts
│   │   │   │   └── reports.ts
│   │   │   ├── middlewares/      # 中间件
│   │   │   │   ├── auth.ts
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── validator.ts
│   │   │   ├── database/         # 数据库
│   │   │   │   ├── connection.ts
│   │   │   │   ├── migrations/
│   │   │   │   └── seeds/
│   │   │   ├── utils/            # 工具函数
│   │   │   └── app.ts            # Express 应用入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                   # 共享类型定义
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── package.json                  # Monorepo 根配置
├── pnpm-workspace.yaml          # pnpm workspace 配置
├── tsconfig.base.json          # TypeScript 基础配置
├── .gitignore
├── .env.example
└── README.md
```

## 3. 核心模块说明

### 3.1 核心引擎模块 (packages/core/src/engines/)

#### 3.1.1 对战引擎 (BattleEngine)

```typescript
// 核心职责
interface BattleEngine {
  // 初始化对战
  initBattle(config: BattleConfig): BattleSession;

  // 处理答题结果
  processAnswer(sessionId: string, answer: Answer): BattleResult;

  // 计算伤害
  calculateDamage(attacker: Character, defender: Character, isCorrect: boolean): number;

  // 触发技能
  triggerSkill(sessionId: string, skillId: string): SkillResult;

  // 结算对战
  settleBattle(sessionId: string): BattleReward;
}
```

**教学设计要点**：
- 答题正确 → 造成伤害（强化正确行为的正向反馈）
- 答题错误 → 受到伤害（温和惩罚，激发学习动力）
- 连续正确 → 连击加成（鼓励持续专注）

#### 3.1.2 成长引擎 (GrowthEngine)

```typescript
// 核心职责
interface GrowthEngine {
  // 计算经验值
  calculateExp(action: GameAction): number;

  // 检查升级
  checkLevelUp(character: Character): LevelUpResult;

  // 属性成长
  applyGrowth(character: Character, level: number): Character;

  // 装备加成计算
  calculateEquipmentBonus(equipment: Equipment[]): StatBonus;
}
```

**教学设计要点**：
- 知识点掌握度 → 角色属性值
- 学习时长 → 经验值积累
- 正确率 → 稀有装备获取概率

#### 3.1.3 题目引擎 (QuizEngine)

```typescript
// 核心职责
interface QuizEngine {
  // 生成题目
  generateQuiz(config: QuizConfig): Quiz;

  // 难度自适应
  adaptDifficulty(userId: string, performance: Performance): DifficultyLevel;

  // 知识点关联
  mapKnowledgePoint(quiz: Quiz): KnowledgePoint;

  // 题目验证
  validateQuiz(quiz: Quiz): boolean;
}
```

### 3.2 游戏场景模块 (packages/web/src/phaser/scenes/)

| 场景 | 职责 | 教学功能 |
|------|------|----------|
| BootScene | 资源加载、初始化 | 加载动画展示学习小贴士 |
| MainMenuScene | 主菜单、角色选择 | 展示学习进度、成就 |
| WorldMapScene | 世界地图、关卡选择 | 知识地图可视化 |
| BattleScene | 核心对战玩法 | 答题对战 |
| ResultScene | 战斗结算 | 学习报告、奖励展示 |

### 3.3 数据模型设计

```typescript
// 用户模型
interface User {
  id: string;
  role: 'student' | 'parent' | 'teacher';
  profile: {
    nickname: string;
    avatar: string;
    grade: number;  // 年级
  };
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

// 角色模型
interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;  // 战士/法师/弓箭手

  // 属性
  stats: {
    level: number;
    exp: number;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };

  // 装备槽
  equipment: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };

  // 技能列表
  skills: Skill[];
}

// 题目模型
interface Quiz {
  id: string;
  type: QuizType;  // 选择/填空/计算
  knowledgePoint: string;  // 知识点标识
  difficulty: number;  // 1-10

  content: {
    question: string;
    options?: string[];  // 选择题选项
    answer: string | number;
    explanation: string;
  };

  metadata: {
    grade: number;
    chapter: string;
    estimatedTime: number;  // 预估答题时间
  };
}

// 对战记录模型
interface BattleRecord {
  id: string;
  userId: string;
  enemyId: string;

  result: 'win' | 'lose';
  duration: number;

  // 答题详情
  answers: {
    quizId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];

  // 奖励
  rewards: {
    exp: number;
    gold: number;
    items?: string[];
  };

  createdAt: Date;
}

// 学习进度模型
interface LearningProgress {
  userId: string;

  // 知识点掌握度
  knowledgePoints: {
    [pointId: string]: {
      masteryLevel: number;  // 0-100
      correctCount: number;
      wrongCount: number;
      lastPracticed: Date;
    };
  };

  // 统计数据
  statistics: {
    totalBattles: number;
    winRate: number;
    totalQuestions: number;
    accuracy: number;
    streakDays: number;  // 连续学习天数
  };

  updatedAt: Date;
}
```

## 4. 技术选型与决策理由

### 4.1 前端技术栈

| 技术 | 版本 | 选择理由 |
|------|------|----------|
| React | 18.x | 组件化开发、生态成熟、团队熟悉度高 |
| TypeScript | 5.x | 类型安全、代码可维护性、IDE 支持 |
| Tailwind CSS | 3.x | 快速样式开发、响应式设计支持 |
| Phaser.js | 3.x | 2D 游戏引擎、文档完善、社区活跃 |
| Zustand | 4.x | 轻量状态管理、TypeScript 友好 |
| Vite | 5.x | 快速开发构建、HMR 性能优秀 |

### 4.2 后端技术栈

| 技术 | 版本 | 选择理由 |
|------|------|----------|
| Node.js | 20.x LTS | 与前端技术栈统一、全栈 JavaScript |
| Express | 4.x | 轻量灵活、中间件生态丰富 |
| SQLite | 3.x | MVP 阶段无需独立数据库服务、零配置 |
| better-sqlite3 | - | 同步 API、性能优秀 |
| Zod | 3.x | 运行时类型验证、与 TypeScript 配合良好 |

### 4.3 开发工具

| 工具 | 用途 |
|------|------|
| pnpm | Monorepo 包管理、依赖管理效率高 |
| ESLint + Prettier | 代码规范、格式化 |
| Vitest | 单元测试 |
| Playwright | E2E 测试 |

## 5. API 设计概要

### 5.1 RESTful API 端点设计

```
基础路径: /api/v1

认证相关:
POST   /auth/login           # 登录
POST   /auth/register        # 注册
POST   /auth/logout          # 登出
POST   /auth/refresh         # 刷新 Token

用户相关:
GET    /users/me             # 获取当前用户信息
PUT    /users/me             # 更新用户信息
GET    /users/me/characters  # 获取用户角色列表
POST   /users/me/characters  # 创建新角色

游戏相关:
GET    /game/maps            # 获取地图列表
GET    /game/maps/:id        # 获取地图详情
GET    /game/enemies/:id     # 获取敌人信息
POST   /game/battles         # 开始对战
PUT    /game/battles/:id     # 提交答案/结束对战

题目相关:
GET    /quizzes              # 获取题目列表（按条件筛选）
GET    /quizzes/random       # 获取随机题目
POST   /quizzes/generate     # 生成特定类型题目

报告相关:
GET    /reports/progress     # 获取学习进度
GET    /reports/statistics   # 获取统计数据
GET    /reports/weakness     # 获取薄弱知识点
```

### 5.2 请求/响应格式

```typescript
// 标准响应格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// 分页请求参数
interface PaginationParams {
  page?: number;  // 默认 1
  limit?: number; // 默认 20，最大 100
}
```

### 5.3 WebSocket 事件（未来扩展）

```typescript
// 实时对战（PVP 模式预留）
events: {
  'battle:join': { roomId: string };
  'battle:ready': { userId: string };
  'battle:answer': { quizId: string; answer: string };
  'battle:result': { winner: string };
}
```

## 6. 安全设计

### 6.1 认证与授权

- JWT Token 认证
- 角色权限控制（RBAC）
- 家长账户关联学生账户

### 6.2 数据安全

- 敏感数据加密存储
- API 请求速率限制
- 输入数据验证与清洗

### 6.3 儿童隐私保护

- 不收集真实姓名
- 昵称审核机制
- 家长可查看和管理孩子数据

## 7. 性能优化策略

### 7.1 前端优化

- 游戏资源预加载与懒加载
- 图片精灵图合并
- 音频按需加载
- IndexedDB 本地缓存题目

### 7.2 后端优化

- API 响应缓存
- 数据库查询优化
- 连接池管理

## 8. 部署架构

### 8.1 MVP 阶段部署

```
┌─────────────────┐
│   静态资源 CDN   │
│  (Web 前端)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Node.js       │
│   单实例部署     │
│   (Express)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQLite        │
│   文件数据库     │
└─────────────────┘
```

### 8.2 生产环境扩展方案

- 容器化部署 (Docker)
- 数据库迁移至 PostgreSQL
- 负载均衡 (Nginx)
- 缓存层 (Redis)

---

## 版本记录

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| v1.0 | 2026-03-05 | 初始架构设计 |