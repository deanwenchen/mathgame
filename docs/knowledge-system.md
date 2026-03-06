# 知识内容系统设计文档

## 1. 知识图谱结构

### 1.1 知识点层级模型

```
领域(Domain) -> 模块(Module) -> 单元(Unit) -> 知识点(KnowledgePoint)
```

#### 数据结构定义

```typescript
// 知识领域
interface Domain {
  id: string;                    // 领域ID，如 "arithmetic"
  name: string;                  // 领域名称，如 "算术运算"
  description: string;           // 领域描述
  modules: Module[];             // 包含的模块
}

// 知识模块
interface Module {
  id: string;                    // 模块ID，如 "addition_within_20"
  name: string;                  // 模块名称，如 "20以内加法"
  gradeRange: [number, number];  // 适用年级范围 [1, 2]
  units: Unit[];                 // 包含的单元
  prerequisites: string[];       // 前置模块ID
}

// 知识单元
interface Unit {
  id: string;                    // 单元ID
  name: string;                  // 单元名称
  knowledgePoints: KnowledgePoint[];
  order: number;                 // 单元顺序
}

// 知识点（最小粒度）
interface KnowledgePoint {
  id: string;                    // 知识点ID
  name: string;                  // 知识点名称
  description: string;           // 详细描述
  difficulty: number;            // 难度等级 1-10
  cognitiveLevel: CognitiveLevel;// 认知层次
  gameMapping: GameMapping;      // 游戏映射配置
  masteryCriteria: MasteryCriteria; // 掌握标准
}
```

### 1.2 MVP 知识图谱（1-2年级）

#### 领域：算术运算

```yaml
Domain: 算术运算 (arithmetic)
├── Module: 20以内加减法 (addition_subtraction_20)
│   ├── Unit 1: 10以内加法
│   │   ├── KP1: 5以内加法 (难度2)
│   │   ├── KP2: 10以内不进位加法 (难度3)
│   │   └── KP3: 10以内进位加法 (难度4)
│   ├── Unit 2: 10以内减法
│   │   ├── KP4: 5以内减法 (难度2)
│   │   ├── KP5: 10以内不退位减法 (难度3)
│   │   └── KP6: 10以内退位减法 (难度4)
│   └── Unit 3: 20以内加减混合
│       ├── KP7: 20以内不进位加法 (难度4)
│       ├── KP8: 20以内进位加法 (难度5)
│       ├── KP9: 20以内不退位减法 (难度4)
│       └── KP10: 20以内退位减法 (难度5)
│
├── Module: 100以内加减法 (addition_subtraction_100)
│   ├── Unit 1: 100以内加法
│   │   ├── KP11: 整十数加法 (难度4)
│   │   ├── KP12: 两位数加一位数(不进位) (难度5)
│   │   ├── KP13: 两位数加一位数(进位) (难度6)
│   │   └── KP14: 两位数加两位数 (难度6)
│   └── Unit 2: 100以内减法
│       ├── KP15: 整十数减法 (难度4)
│       ├── KP16: 两位数减一位数(不退位) (难度5)
│       ├── KP17: 两位数减一位数(退位) (难度6)
│       └── KP18: 两位数减两位数 (难度6)
│
└── Module: 简单应用题 (word_problems)
    ├── Unit 1: 加法应用题
    │   ├── KP19: 求总数问题 (难度5)
    │   └── KP20: 求比一个数多几的问题 (难度6)
    └── Unit 2: 减法应用题
        ├── KP21: 求剩余问题 (难度5)
        └── KP22: 求比一个数少几的问题 (难度6)
```

### 1.3 认知层次分类

```typescript
enum CognitiveLevel {
  MEMORY = 'memory',           // 记忆：直接回忆事实
  UNDERSTANDING = 'understanding', // 理解：解释概念
  APPLICATION = 'application', // 应用：在熟悉情境中使用
  ANALYSIS = 'analysis',       // 分析：分解问题
  SYNTHESIS = 'synthesis',     // 综合：组合多个知识点
  EVALUATION = 'evaluation'    // 评价：判断和决策
}
```

---

## 2. 题库数据模型

### 2.1 题目核心结构

```typescript
interface Question {
  // 基础信息
  id: string;                    // 题目唯一ID
  type: QuestionType;            // 题目类型
  knowledgePointId: string;      // 关联知识点ID
  difficulty: number;            // 难度系数 1-10

  // 题目内容
  content: QuestionContent;      // 题目内容
  answer: Answer;                // 答案信息
  hints: Hint[];                 // 提示链

  // 元数据
  metadata: QuestionMetadata;    // 题目元数据

  // 统计数据
  statistics: QuestionStatistics; // 题目统计
}

// 题目类型
enum QuestionType {
  CALCULATION = 'calculation',   // 计算题
  WORD_PROBLEM = 'word_problem', // 应用题
  COMPARISON = 'comparison',     // 比较题
  FILL_BLANK = 'fill_blank',     // 填空题
  SELECTION = 'selection',       // 选择题
  DRAG_DROP = 'drag_drop'        // 拖拽题
}

// 题目内容
interface QuestionContent {
  stem: string;                  // 题干
  stemType: 'text' | 'image' | 'audio' | 'mixed';
  visuals?: VisualElement[];     // 视觉元素
  context?: string;              // 情境描述(应用题)
  variables?: Variable[];        // 可变参数
}

// 答案结构
interface Answer {
  type: 'single' | 'multiple' | 'expression';
  value: number | string | string[];
  tolerance?: number;            // 容差范围
  acceptableFormats?: string[];  // 可接受格式
  solution: SolutionStep[];      // 解题步骤
}

// 提示链
interface Hint {
  level: number;                 // 提示等级 1-3
  content: string;               // 提示内容
  type: 'conceptual' | 'procedural' | 'strategic';
  cost: number;                  // 使用成本(游戏币)
}

// 题目元数据
interface QuestionMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  tags: string[];
  qualityScore: number;          // 质量评分
  reviewStatus: 'draft' | 'reviewed' | 'published';
}

// 题目统计
interface QuestionStatistics {
  totalAttempts: number;         // 总作答次数
  correctRate: number;           // 正确率
  avgTimeSpent: number;          // 平均用时(秒)
  hintUsageRate: number;         // 提示使用率
  discriminationIndex: number;   // 区分度指数
}
```

### 2.2 题目模板系统

```typescript
// 题目模板 - 用于动态生成同类题目
interface QuestionTemplate {
  id: string;
  name: string;
  knowledgePointId: string;
  type: QuestionType;

  // 模板内容
  template: {
    stemPattern: string;         // 题干模板，使用占位符
    variables: VariableDefinition[]; // 变量定义
    answerExpression: string;    // 答案表达式
    constraints: Constraint[];   // 约束条件
  };

  // 生成配置
  generation: {
    difficultyRange: [number, number];
    variations: number;          // 变体数量
    seedPool?: number[];         // 种子数池
  };
}

// 变量定义
interface VariableDefinition {
  name: string;                  // 变量名
  type: 'integer' | 'decimal' | 'fraction';
  range: [number, number];       // 数值范围
  constraints?: Constraint[];     // 约束条件
  weight?: number;               // 权重分布
}

// 约束条件
interface Constraint {
  type: 'range' | 'expression' | 'unique' | 'divisible';
  expression: string;            // 约束表达式
  message?: string;              // 约束说明
}
```

### 2.3 题目示例

#### 示例1: 20以内进位加法题目

```json
{
  "id": "Q_001",
  "type": "calculation",
  "knowledgePointId": "KP8",
  "difficulty": 5,
  "content": {
    "stem": "{a} + {b} = ?",
    "stemType": "text",
    "variables": [
      {"name": "a", "range": [9, 15]},
      {"name": "b", "range": [3, 9]}
    ]
  },
  "answer": {
    "type": "single",
    "value": "{a} + {b}",
    "solution": [
      {"step": 1, "action": "识别进位", "description": "{a}的个位是{a_ones}，{b}需要补到10"},
      {"step": 2, "action": "凑十法", "description": "{b} = {complement} + {remainder}"},
      {"step": 3, "action": "计算结果", "description": "{a} + {complement} + {remainder} = {result}"}
    ]
  },
  "hints": [
    {"level": 1, "content": "想想能不能凑成10？", "type": "strategic", "cost": 5},
    {"level": 2, "content": "{a}需要{complement}才能凑成10", "type": "procedural", "cost": 10},
    {"level": 3, "content": "把{b}分成{complement}和{remainder}", "type": "procedural", "cost": 15}
  ]
}
```

#### 示例2: 简单应用题

```json
{
  "id": "Q_019",
  "type": "word_problem",
  "knowledgePointId": "KP19",
  "difficulty": 5,
  "content": {
    "stem": "{name}有{a}个{item}，又买了{b}个，现在一共有多少个{item}？",
    "stemType": "text",
    "context": "求总数问题",
    "variables": [
      {"name": "name", "type": "string", "pool": ["小明", "小红", "小华"]},
      {"name": "item", "type": "string", "pool": ["苹果", "铅笔", "橡皮"]},
      {"name": "a", "range": [5, 15]},
      {"name": "b", "range": [3, 10]}
    ]
  },
  "answer": {
    "type": "single",
    "value": "{a} + {b}",
    "solution": [
      {"step": 1, "action": "理解题意", "description": "原来有{a}个，又买了{b}个"},
      {"step": 2, "action": "确定运算", "description": "求总数用加法"},
      {"step": 3, "action": "列式计算", "description": "{a} + {b} = {result}"}
    ]
  },
  "hints": [
    {"level": 1, "content": "题目问的是什么？", "type": "conceptual", "cost": 5},
    {"level": 2, "content": "原来有{a}个，又买了{b}个，求一共多少个", "type": "procedural", "cost": 10}
  ]
}
```

---

## 3. 自适应出题算法

### 3.1 算法架构

```
用户状态 -> 难度评估 -> 知识点选择 -> 题目生成 -> 反馈收集 -> 状态更新
    ^                                                              |
    |______________________________________________________________|
```

### 3.2 用户知识状态模型

```typescript
interface UserKnowledgeState {
  userId: string;

  // 知识点掌握度
  knowledgePoints: Map<string, KPMastery>;

  // 整体能力评估
  ability: {
    overall: number;             // 综合能力值
    domains: Map<string, number>; // 各领域能力值
  };

  // 学习偏好
  preferences: {
    preferredQuestionTypes: QuestionType[];
    avgResponseTime: number;
    hintUsageRate: number;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  };

  // 历史轨迹
  history: {
    recentQuestions: string[];   // 最近50题
    wrongQuestions: string[];    // 错题记录
    improvementTrend: number;    // 进步趋势
  };
}

// 知识点掌握度
interface KPMastery {
  knowledgePointId: string;
  masteryLevel: number;          // 掌握度 0-100
  confidence: number;            // 置信度 0-1
  lastAttempted: Date;
  attempts: number;              // 尝试次数
  correctCount: number;          // 正确次数
  avgTimeSpent: number;
  nextReviewDate: Date;          // 下次复习时间(遗忘曲线)
}
```

### 3.3 自适应算法核心

```typescript
class AdaptiveQuestionSelector {

  /**
   * 自适应出题主算法
   * 综合考虑：当前能力、知识点状态、学习进度、游戏进度
   */
  selectQuestion(
    userState: UserKnowledgeState,
    gameContext: GameContext,
    options: SelectionOptions
  ): Question {

    // Step 1: 确定目标知识点
    const targetKP = this.selectKnowledgePoint(userState, gameContext);

    // Step 2: 计算目标难度
    const targetDifficulty = this.calculateTargetDifficulty(
      userState,
      targetKP,
      options.challengeLevel
    );

    // Step 3: 选择或生成题目
    const question = this.selectOrGenerateQuestion(
      targetKP,
      targetDifficulty,
      userState.history.recentQuestions
    );

    // Step 4: 应用游戏化包装
    return this.applyGameContext(question, gameContext);
  }

  /**
   * 知识点选择策略
   */
  private selectKnowledgePoint(
    userState: UserKnowledgeState,
    gameContext: GameContext
  ): KnowledgePoint {

    const candidates: KPCandidate[] = [];

    // 策略1: 游戏关卡绑定的知识点 (优先级最高)
    if (gameContext.currentLevel?.knowledgePointId) {
      const kp = this.getKnowledgePoint(gameContext.currentLevel.knowledgePointId);
      if (this.shouldPractice(userState, kp)) {
        candidates.push({ kp, priority: 100, reason: 'level_bound' });
      }
    }

    // 策略2: 需要复习的知识点 (遗忘曲线)
    const reviewKPs = this.getReviewNeeded(userState);
    reviewKPs.forEach(kp => {
      candidates.push({ kp, priority: 80, reason: 'review_needed' });
    });

    // 策略3: 当前学习路径的下一个知识点
    const nextKP = this.getNextInPath(userState);
    if (nextKP && this.isReadyFor(userState, nextKP)) {
      candidates.push({ kp: nextKP, priority: 60, reason: 'learning_path' });
    }

    // 策略4: 弱点强化
    const weakKPs = this.getWeakPoints(userState);
    weakKPs.forEach(kp => {
      candidates.push({ kp, priority: 50, reason: 'weak_point' });
    });

    // 加权随机选择
    return this.weightedRandomSelect(candidates);
  }

  /**
   * 难度计算 - 基于IRT(Item Response Theory)简化模型
   */
  private calculateTargetDifficulty(
    userState: UserKnowledgeState,
    kp: KnowledgePoint,
    challengeLevel: number // 0.7 = 舒适区, 0.8 = 学习区, 0.9 = 挑战区
  ): number {

    const mastery = userState.knowledgePoints.get(kp.id);
    const baseDifficulty = kp.difficulty;

    if (!mastery) {
      // 新知识点，从基础难度开始
      return baseDifficulty;
    }

    // 根据掌握度调整
    const masteryAdjustment = (mastery.masteryLevel / 100 - 0.5) * 2;

    // 根据挑战等级调整
    const challengeAdjustment = (challengeLevel - 0.7) * 3;

    // 计算目标难度
    let targetDifficulty = baseDifficulty + masteryAdjustment + challengeAdjustment;

    // 边界限制
    return Math.max(1, Math.min(10, targetDifficulty));
  }

  /**
   * 题目选择/生成
   */
  private selectOrGenerateQuestion(
    kp: KnowledgePoint,
    difficulty: number,
    recentQuestions: string[]
  ): Question {

    // 尝试从题库选择
    const existingQuestions = this.questionBank.query({
      knowledgePointId: kp.id,
      difficultyRange: [difficulty - 0.5, difficulty + 0.5],
      excludeIds: recentQuestions
    });

    if (existingQuestions.length > 0) {
      return this.randomSelect(existingQuestions);
    }

    // 题库无合适题目，使用模板生成
    const template = this.templateManager.getTemplate(kp.id, difficulty);
    if (template) {
      return this.generateFromTemplate(template, difficulty);
    }

    // 兜底：返回知识点的基础题目
    return this.generateBasicQuestion(kp, difficulty);
  }
}
```

### 3.4 掌握度更新算法

```typescript
class MasteryUpdater {

  /**
   * 更新知识点掌握度
   * 使用贝叶斯知识追踪(BKT)简化版
   */
  updateMastery(
    currentMastery: KPMastery,
    answerResult: AnswerResult
  ): KPMastery {

    const { isCorrect, timeSpent, hintUsed, attempts } = answerResult;

    // P(L) - 学习概率
    const pLearn = 0.1;  // 单次学习的概率
    // P(G) - 猜对概率
    const pGuess = 0.25; // 选择题猜对概率
    // P(S) - 犯错概率
    const pSlip = 0.1;   // 会做但做错的概率

    let pKnow = currentMastery.masteryLevel / 100;

    if (isCorrect) {
      // 正确答案：P(K|correct) = P(correct|K) * P(K) / P(correct)
      const pCorrectGivenKnow = 1 - pSlip;
      const pCorrectGivenNotKnow = pGuess;
      const pCorrect = pCorrectGivenKnow * pKnow + pCorrectGivenNotKnow * (1 - pKnow);

      pKnow = (pCorrectGivenKnow * pKnow) / pCorrect;
    } else {
      // 错误答案：P(K|incorrect) = P(incorrect|K) * P(K) / P(incorrect)
      const pIncorrectGivenKnow = pSlip;
      const pIncorrectGivenNotKnow = 1 - pGuess;
      const pIncorrect = pIncorrectGivenKnow * pKnow + pIncorrectGivenNotKnow * (1 - pKnow);

      pKnow = (pIncorrectGivenKnow * pKnow) / pIncorrect;
    }

    // 学习更新
    pKnow = pKnow + (1 - pKnow) * pLearn;

    // 时间惩罚/奖励
    const expectedTime = currentMastery.avgTimeSpent || 30;
    const timeFactor = this.calculateTimeFactor(timeSpent, expectedTime);
    pKnow = pKnow * timeFactor;

    // 提示惩罚
    if (hintUsed) {
      pKnow = pKnow * 0.9; // 使用提示降低掌握度增益
    }

    // 连续正确奖励
    if (isCorrect && currentMastery.correctCount >= 2) {
      pKnow = Math.min(1, pKnow * 1.1);
    }

    return {
      ...currentMastery,
      masteryLevel: Math.round(pKnow * 100),
      confidence: this.updateConfidence(currentMastery.confidence, isCorrect),
      attempts: currentMastery.attempts + 1,
      correctCount: currentMastery.correctCount + (isCorrect ? 1 : 0),
      avgTimeSpent: this.updateAvgTime(currentMastery.avgTimeSpent, timeSpent),
      lastAttempted: new Date(),
      nextReviewDate: this.calculateNextReview(pKnow)
    };
  }

  /**
   * 计算下次复习时间 (基于遗忘曲线)
   */
  private calculateNextReview(masteryLevel: number): Date {
    const now = new Date();

    // 艾宾浩斯遗忘曲线间隔 (小时)
    const intervals = [1, 8, 24, 72, 168, 336, 720]; // 1h, 8h, 1d, 3d, 1w, 2w, 1m

    // 根据掌握度选择间隔
    let intervalIndex = Math.floor(masteryLevel / 15);
    intervalIndex = Math.min(intervalIndex, intervals.length - 1);

    const hours = intervals[intervalIndex];
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }
}
```

### 3.5 难度自适应流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                      自适应出题流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ 用户请求 │───>│ 获取用户状态 │───>│ 获取游戏上下文│         │
│  └──────────┘    └──────────────┘    └──────────────┘         │
│                                               │                 │
│                                               v                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              知识点选择策略                            │      │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐        │      │
│  │  │关卡绑定(100)│ │复习需求(80)│ │学习路径(60)│        │      │
│  │  └────────────┘ └────────────┘ └────────────┘        │      │
│  │  ┌────────────┐                                       │      │
│  │  │弱点强化(50)│                                       │      │
│  │  └────────────┘                                       │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                     │
│                           v                                     │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              难度计算 (IRT模型)                        │      │
│  │                                                      │      │
│  │  目标难度 = 基础难度 + 掌握度调整 + 挑战等级调整       │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                     │
│                           v                                     │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              题目选择/生成                            │      │
│  │  ┌────────────────┐    ┌────────────────┐            │      │
│  │  │ 查询题库匹配   │───>│ 模板动态生成   │            │      │
│  │  └────────────────┘    └────────────────┘            │      │
│  └──────────────────────────────────────────────────────┘      │
│                           │                                     │
│                           v                                     │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ 返回题目 │<───│ 应用游戏包装 │<───│ 题目质量检查 │         │
│  └──────────┘    └──────────────┘    └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. API 接口设计

### 4.1 RESTful API 规范

#### 基础路径
```
/api/v1/knowledge
```

#### 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 4.2 知识图谱 API

#### 获取知识领域列表

```
GET /api/v1/knowledge/domains
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "arithmetic",
      "name": "算术运算",
      "description": "基础算术运算能力",
      "moduleCount": 3,
      "knowledgePointCount": 22
    }
  ]
}
```

#### 获取知识模块详情

```
GET /api/v1/knowledge/modules/:moduleId
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "addition_subtraction_20",
    "name": "20以内加减法",
    "gradeRange": [1, 2],
    "units": [
      {
        "id": "unit_1",
        "name": "10以内加法",
        "order": 1,
        "knowledgePoints": [
          {
            "id": "KP1",
            "name": "5以内加法",
            "difficulty": 2,
            "masteryCriteria": {
              "requiredAttempts": 10,
              "passThreshold": 0.8
            }
          }
        ]
      }
    ],
    "prerequisites": []
  }
}
```

#### 获取知识点详情

```
GET /api/v1/knowledge/points/:pointId
```

### 4.3 题库 API

#### 获取题目

```
GET /api/v1/knowledge/questions/:questionId
```

#### 查询题目列表

```
POST /api/v1/knowledge/questions/query
```

**请求体:**
```json
{
  "knowledgePointId": "KP8",
  "difficultyRange": [4, 6],
  "types": ["calculation", "word_problem"],
  "excludeIds": ["Q_001", "Q_002"],
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

#### 创建题目 (管理员)

```
POST /api/v1/knowledge/questions
```

**请求体:**
```json
{
  "type": "calculation",
  "knowledgePointId": "KP8",
  "difficulty": 5,
  "content": {
    "stem": "8 + 7 = ?",
    "stemType": "text"
  },
  "answer": {
    "type": "single",
    "value": 15,
    "solution": [
      {"step": 1, "action": "凑十", "description": "把7分成2和5"},
      {"step": 2, "action": "计算", "description": "8 + 2 = 10, 10 + 5 = 15"}
    ]
  },
  "hints": [
    {"level": 1, "content": "想想怎么凑成10？", "type": "strategic", "cost": 5}
  ]
}
```

#### 更新题目 (管理员)

```
PUT /api/v1/knowledge/questions/:questionId
```

#### 删除题目 (管理员)

```
DELETE /api/v1/knowledge/questions/:questionId
```

### 4.4 自适应出题 API

#### 获取下一题 (核心接口)

```
POST /api/v1/knowledge/adaptive/next-question
```

**请求体:**
```json
{
  "userId": "user_123",
  "gameContext": {
    "currentLevel": "level_5",
    "currentStage": 3,
    "timeLimit": 60,
    "challengeLevel": 0.8
  },
  "options": {
    "preferNewQuestion": true,
    "includeReviewQuestions": true,
    "maxDifficulty": 10
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "Q_Generated_12345",
      "type": "calculation",
      "content": {
        "stem": "9 + 6 = ?",
        "stemType": "text",
        "visuals": []
      },
      "hints": [
        {"level": 1, "content": "凑十法可以帮助你", "cost": 5}
      ],
      "timeLimit": 60
    },
    "context": {
      "knowledgePointId": "KP8",
      "knowledgePointName": "20以内进位加法",
      "difficulty": 5,
      "reason": "learning_path",
      "masteryLevel": 45
    },
    "gameData": {
      "monsterType": "goblin",
      "reward": {
        "coins": 10,
        "experience": 15
      }
    }
  }
}
```

#### 提交答案

```
POST /api/v1/knowledge/adaptive/submit-answer
```

**请求体:**
```json
{
  "userId": "user_123",
  "questionId": "Q_Generated_12345",
  "answer": {
    "value": 15,
    "timeSpent": 12,
    "hintUsed": false,
    "attempts": 1
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "correct": true,
    "correctAnswer": 15,
    "solution": [
      {"step": 1, "action": "凑十", "description": "把6分成1和5"},
      {"step": 2, "action": "计算", "description": "9 + 1 = 10, 10 + 5 = 15"}
    ],
    "masteryUpdate": {
      "previousLevel": 45,
      "newLevel": 48,
      "delta": 3
    },
    "rewards": {
      "coins": 10,
      "experience": 15,
      "bonusCoins": 5
    },
    "achievements": [
      {
        "id": "streak_5",
        "name": "连击达人",
        "description": "连续答对5题"
      }
    ],
    "nextQuestionReady": true
  }
}
```

#### 获取学习报告

```
GET /api/v1/knowledge/adaptive/learning-report/:userId
```

**查询参数:**
- `period`: "day" | "week" | "month" | "all"

**响应示例:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "summary": {
      "totalQuestions": 150,
      "correctRate": 0.82,
      "totalTime": 3600,
      "avgTimePerQuestion": 24
    },
    "knowledgeProgress": [
      {
        "knowledgePointId": "KP8",
        "name": "20以内进位加法",
        "masteryLevel": 75,
        "trend": "improving",
        "attempts": 25,
        "correctRate": 0.84
      }
    ],
    "recommendations": [
      {
        "type": "review",
        "knowledgePointId": "KP10",
        "reason": "已有3天未复习，建议复习20以内退位减法"
      },
      {
        "type": "challenge",
        "knowledgePointId": "KP11",
        "reason": "当前知识点掌握良好，可以挑战新内容"
      }
    ],
    "weakPoints": [
      {
        "knowledgePointId": "KP6",
        "name": "10以内退位减法",
        "masteryLevel": 35,
        "suggestion": "建议加强练习"
      }
    ]
  }
}
```

### 4.5 用户知识状态 API

#### 获取用户知识点掌握状态

```
GET /api/v1/knowledge/user/:userId/mastery
```

**查询参数:**
- `domainId`: 可选，筛选特定领域
- `moduleId`: 可选，筛选特定模块

#### 获取错题本

```
GET /api/v1/knowledge/user/:userId/wrong-questions
```

**查询参数:**
- `knowledgePointId`: 可选，筛选特定知识点
- `page`: 页码
- `pageSize`: 每页数量

#### 标记错题已掌握

```
POST /api/v1/knowledge/user/:userId/wrong-questions/:questionId/master
```

### 4.6 题目模板 API (管理员)

#### 创建题目模板

```
POST /api/v1/knowledge/templates
```

#### 根据模板生成题目

```
POST /api/v1/knowledge/templates/:templateId/generate
```

**请求体:**
```json
{
  "count": 10,
  "difficulty": 5,
  "seed": 42
}
```

### 4.7 API 错误码定义

```typescript
enum KnowledgeErrorCode {
  // 知识点相关 1000-1099
  KNOWLEDGE_POINT_NOT_FOUND = 'KN_1001',
  KNOWLEDGE_POINT_LOCKED = 'KN_1002',
  PREREQUISITE_NOT_MET = 'KN_1003',

  // 题目相关 1100-1199
  QUESTION_NOT_FOUND = 'KN_1101',
  QUESTION_GENERATION_FAILED = 'KN_1102',
  INVALID_QUESTION_TYPE = 'KN_1103',
  DIFFICULTY_OUT_OF_RANGE = 'KN_1104',

  // 用户状态相关 1200-1299
  USER_STATE_NOT_FOUND = 'KN_1201',
  MASTERY_UPDATE_FAILED = 'KN_1202',
  INVALID_ANSWER_FORMAT = 'KN_1203',

  // 自适应算法相关 1300-1399
  ADAPTIVE_ALGORITHM_ERROR = 'KN_1301',
  NO_SUITABLE_QUESTION = 'KN_1302',
  CONTEXT_INVALID = 'KN_1303',

  // 通用错误
  VALIDATION_ERROR = 'KN_0001',
  UNAUTHORIZED = 'KN_0002',
  RATE_LIMIT_EXCEEDED = 'KN_0003'
}
```

---

## 5. 数据库设计

### 5.1 核心表结构

#### 知识点表 (knowledge_points)

```sql
CREATE TABLE knowledge_points (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  module_id VARCHAR(50) NOT NULL,
  difficulty INT CHECK (difficulty BETWEEN 1 AND 10),
  cognitive_level VARCHAR(20),
  order_index INT,
  prerequisites JSON,
  mastery_criteria JSON,
  game_mapping JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_id),
  INDEX idx_difficulty (difficulty)
);
```

#### 题目表 (questions)

```sql
CREATE TABLE questions (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  knowledge_point_id VARCHAR(50) NOT NULL,
  difficulty DECIMAL(3,1) CHECK (difficulty BETWEEN 1 AND 10),
  content JSON NOT NULL,
  answer JSON NOT NULL,
  hints JSON,
  metadata JSON,
  statistics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kp (knowledge_point_id),
  INDEX idx_type (type),
  INDEX idx_difficulty (difficulty),
  FULLTEXT INDEX idx_content (content)
);
```

#### 题目模板表 (question_templates)

```sql
CREATE TABLE question_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  knowledge_point_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  template JSON NOT NULL,
  generation_config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kp (knowledge_point_id)
);
```

#### 用户知识点掌握状态表 (user_knowledge_mastery)

```sql
CREATE TABLE user_knowledge_mastery (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  knowledge_point_id VARCHAR(50) NOT NULL,
  mastery_level INT CHECK (mastery_level BETWEEN 0 AND 100),
  confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
  attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  avg_time_spent INT,
  last_attempted_at TIMESTAMP,
  next_review_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_kp (user_id, knowledge_point_id),
  INDEX idx_user (user_id),
  INDEX idx_next_review (next_review_at)
);
```

#### 用户答题记录表 (user_answer_records)

```sql
CREATE TABLE user_answer_records (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  question_id VARCHAR(50) NOT NULL,
  knowledge_point_id VARCHAR(50) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INT,
  hint_used BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 1,
  user_answer JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_question (question_id),
  INDEX idx_kp (knowledge_point_id),
  INDEX idx_created (created_at)
);
```

---

## 6. 性能与扩展考虑

### 6.1 缓存策略

```typescript
// Redis 缓存键设计
const CacheKeys = {
  // 知识点缓存 (长期)
  KNOWLEDGE_POINT: 'kp:{id}',
  KNOWLEDGE_MODULE: 'km:{id}',

  // 题目缓存 (中期)
  QUESTION: 'q:{id}',
  QUESTIONS_BY_KP: 'q:kp:{kpId}:diff:{min}-{max}',

  // 用户状态缓存 (短期)
  USER_MASTERY: 'user:{userId}:mastery',
  USER_RECENT_QUESTIONS: 'user:{userId}:recent',

  // 自适应算法缓存
  ADAPTIVE_CANDIDATES: 'adaptive:kp:{kpId}:candidates'
};

// 缓存过期时间
const CacheTTL = {
  KNOWLEDGE_POINT: 86400,      // 1天
  QUESTION: 3600,               // 1小时
  USER_MASTERY: 300,            // 5分钟
  USER_RECENT_QUESTIONS: 600,   // 10分钟
  ADAPTIVE_CANDIDATES: 1800     // 30分钟
};
```

### 6.2 题目预生成

```typescript
// 定时任务：预生成题目
class QuestionPreGenerator {
  // 根据热点知识点预生成题目
  async preGenerateForHotTopics(): Promise<void> {
    const hotKPs = await this.getHotKnowledgePoints();

    for (const kp of hotKPs) {
      const template = await this.getTemplate(kp.id);
      const questions = await this.generateQuestions(template, 10);

      await this.cacheQuestions(kp.id, questions);
    }
  }

  // 根据用户群体预生成
  async preGenerateForUserSegments(): Promise<void> {
    const segments = await this.getUserSegments();

    for (const segment of segments) {
      const targetKPs = this.getTargetKnowledgePoints(segment);
      await this.preGenerateForSegment(segment, targetKPs);
    }
  }
}
```

### 6.3 扩展性设计

1. **知识点扩展**: 支持动态添加新年级、新领域知识点
2. **题型扩展**: 可插拔的题目类型系统
3. **算法扩展**: 自适应算法可替换/升级
4. **存储扩展**: 支持分库分表、读写分离

---

## 7. 与游戏系统集成

### 7.1 游戏关卡映射

```typescript
interface LevelKnowledgeMapping {
  levelId: string;
  stageId: string;
  primaryKnowledgePoint: string;    // 主要知识点
  secondaryKnowledgePoints: string[]; // 辅助知识点
  difficultyScale: number;           // 难度缩放因子
  questionCount: number;            // 题目数量
  timeLimit: number;                // 时间限制(秒)
  rewardConfig: RewardConfig;
}
```

### 7.2 怪物知识绑定

```typescript
interface MonsterKnowledgeBinding {
  monsterType: string;
  preferredKnowledgePoints: string[]; // 偏好知识点
  difficultyModifier: number;         // 难度修正
  specialRules: SpecialRule[];        // 特殊规则
}
```

---

## 文档版本

- 版本: 1.0.0
- 创建日期: 2026-03-05
- 作者: Backend Developer Agent
- 状态: 设计完成，待评审