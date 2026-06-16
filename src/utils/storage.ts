/**
 * localStorage 存储工具
 *
 * 教育设计说明：
 * - 所有数据仅存在浏览器本地，不上传服务器，保护儿童隐私
 * - 记录历史最高分、总答题数、正确数，激励持续学习
 * - 数据结构简单透明，便于家长查看孩子学习情况
 */

// ========== 类型定义 ==========

export interface QuizStats {
  highScore: number // 单次最高分
  totalGames: number // 总共玩过几次
  totalQuestions: number // 总共答了多少题
  totalCorrect: number // 总共答对多少题
  bestLevel: number // 达到的最高等级
  lastPlayedAt: string | null // 上次游玩时间 (ISO 8601)
}

// ========== 存储键名 ==========

const KEYS = {
  QUIZ_STATS: 'mathgame_quiz_stats',
} as const

// ========== 默认值 ==========

const DEFAULT_QUIZ_STATS: QuizStats = {
  highScore: 0,
  totalGames: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  bestLevel: 0,
  lastPlayedAt: null,
}

// ========== 通用读写 ==========

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 存储空间不足或隐私模式，静默忽略
  }
}

// ========== Quiz 统计 ==========

export function getQuizStats(): QuizStats {
  return safeRead<QuizStats>(KEYS.QUIZ_STATS, DEFAULT_QUIZ_STATS)
}

/**
 * 结算一局游戏，更新统计
 * @returns 更新后的统计
 */
export function finishQuizGame(opts: {
  score: number
  level: number
  questions: number
  correct: number
}): QuizStats {
  const prev = getQuizStats()

  const updated: QuizStats = {
    highScore: Math.max(prev.highScore, opts.score),
    totalGames: prev.totalGames + 1,
    totalQuestions: prev.totalQuestions + opts.questions,
    totalCorrect: prev.totalCorrect + opts.correct,
    bestLevel: Math.max(prev.bestLevel, opts.level),
    lastPlayedAt: new Date().toISOString(),
  }

  safeWrite(KEYS.QUIZ_STATS, updated)
  return updated
}

/**
 * 重置所有统计（"重新开始"按钮用）
 */
export function resetQuizStats(): void {
  safeWrite(KEYS.QUIZ_STATS, DEFAULT_QUIZ_STATS)
}

/**
 * 计算正确率，返回 0-100 的整数
 */
export function getAccuracy(stats: QuizStats): number {
  if (stats.totalQuestions === 0) return 0
  return Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
}

// ========== 错题本 ==========

export interface MistakeRecord {
  id: string
  question: string
  userAnswer: number
  correctAnswer: number
  grade: number
  type: string
  knowledgePoint: string
  timestamp: string
}

const MISTAKES_KEY = 'mathgame_mistakes'

export function getMistakes(): MistakeRecord[] {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addMistake(mistake: Omit<MistakeRecord, 'timestamp'>): void {
  const mistakes = getMistakes()
  mistakes.push({ ...mistake, timestamp: new Date().toISOString() })
  safeWrite(MISTAKES_KEY, mistakes)
}

export function removeMistake(id: string): void {
  const mistakes = getMistakes().filter((m) => m.id !== id)
  safeWrite(MISTAKES_KEY, mistakes)
}

export function clearMistakes(): void {
  safeWrite(MISTAKES_KEY, [])
}

// ========== 每日任务 ==========

export interface DailyTask {
  date: string
  questionsCompleted: number
  targetQuestions: number
  rewardClaimed: boolean
}

const DAILY_TASK_KEY = 'mathgame_daily_task'

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDailyTask(): DailyTask {
  try {
    const raw = localStorage.getItem(DAILY_TASK_KEY)
    if (!raw)
      return {
        date: getTodayString(),
        questionsCompleted: 0,
        targetQuestions: 5,
        rewardClaimed: false,
      }
    const task = JSON.parse(raw) as DailyTask
    if (task.date !== getTodayString()) {
      const newTask = {
        date: getTodayString(),
        questionsCompleted: 0,
        targetQuestions: 5,
        rewardClaimed: false,
      }
      safeWrite(DAILY_TASK_KEY, newTask)
      return newTask
    }
    return task
  } catch {
    return {
      date: getTodayString(),
      questionsCompleted: 0,
      targetQuestions: 5,
      rewardClaimed: false,
    }
  }
}

export function incrementDailyTask(): DailyTask {
  const task = getDailyTask()
  task.questionsCompleted++
  safeWrite(DAILY_TASK_KEY, task)
  return task
}

export function claimDailyReward(): void {
  const task = getDailyTask()
  task.rewardClaimed = true
  safeWrite(DAILY_TASK_KEY, task)
}
