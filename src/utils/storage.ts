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

export function setDailyTarget(target: number): DailyTask {
  const task = getDailyTask()
  task.targetQuestions = Math.max(1, Math.min(50, target))
  safeWrite(DAILY_TASK_KEY, task)
  return task
}

// ========== 成就系统 ==========

// ========== 连续学习天数 ==========

// ========== 道具系统 ==========

const INVENTORY_KEY = 'mathgame_inventory'

export interface Inventory {
  hint_x3: number
  shield: number
  double_coins: number
  skip_question: number
  time_extend: number
  theme_dark: boolean
}

export function getInventory(): Inventory {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY)
    return raw
      ? JSON.parse(raw)
      : {
          hint_x3: 0,
          shield: 0,
          double_coins: 0,
          skip_question: 0,
          time_extend: 0,
          theme_dark: false,
        }
  } catch {
    return {
      hint_x3: 0,
      shield: 0,
      double_coins: 0,
      skip_question: 0,
      time_extend: 0,
      theme_dark: false,
    }
  }
}

export function addItem(itemId: string): void {
  const inv = getInventory()
  if (itemId === 'theme_dark') {
    inv.theme_dark = true
  } else if (itemId in inv) {
    ;(inv as any)[itemId]++
  }
  safeWrite(INVENTORY_KEY, inv)
}

export function useItem(itemId: string): boolean {
  const inv = getInventory()
  if (itemId === 'theme_dark') return inv.theme_dark
  if ((inv as any)[itemId] > 0) {
    ;(inv as any)[itemId]--
    safeWrite(INVENTORY_KEY, inv)
    return true
  }
  return false
}

// ========== 无障碍设置 ==========

const ACCESSIBILITY_KEY = 'mathgame_accessibility'

export interface AccessibilitySettings {
  largeText: boolean
  highContrast: boolean
  reducedMotion: boolean
}

export function getAccessibility(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_KEY)
    return raw ? JSON.parse(raw) : { largeText: false, highContrast: false, reducedMotion: false }
  } catch {
    return { largeText: false, highContrast: false, reducedMotion: false }
  }
}

export function setAccessibility(settings: Partial<AccessibilitySettings>): void {
  const current = getAccessibility()
  safeWrite(ACCESSIBILITY_KEY, { ...current, ...settings })
}

// ========== 主题系统 ==========

const THEME_KEY = 'mathgame_theme'

export type Theme = 'default' | 'ocean' | 'forest' | 'candy'

export function getTheme(): Theme {
  try {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'default'
  } catch {
    return 'default'
  }
}

export function setTheme(theme: Theme): void {
  safeWrite(THEME_KEY, theme)
}

export const THEME_GRADIENTS: Record<Theme, string> = {
  default: 'from-amber-50 via-orange-50 to-purple-50',
  ocean: 'from-blue-50 via-cyan-50 to-teal-50',
  forest: 'from-green-50 via-emerald-50 to-lime-50',
  candy: 'from-pink-50 via-rose-50 to-fuchsia-50',
}

// ========== 每日挑战 ==========

const DAILY_CHALLENGE_KEY = 'mathgame_daily_challenge'

export interface DailyChallenge {
  date: string
  target: number
  completed: boolean
}

export function getDailyChallenge(): DailyChallenge {
  try {
    const raw = localStorage.getItem(DAILY_CHALLENGE_KEY)
    const today = new Date().toISOString().split('T')[0]
    if (!raw) return { date: today, target: 20, completed: false }
    const challenge = JSON.parse(raw) as DailyChallenge
    if (challenge.date !== today) return { date: today, target: 20, completed: false }
    return challenge
  } catch {
    return { date: new Date().toISOString().split('T')[0], target: 20, completed: false }
  }
}

export function completeDailyChallenge(): void {
  const challenge = getDailyChallenge()
  challenge.completed = true
  safeWrite(DAILY_CHALLENGE_KEY, challenge)
}

// ========== 数据导出导入 ==========

export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('mathgame_')) {
      data[key] = localStorage.getItem(key)
    }
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json)
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('mathgame_')) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      }
    })
    return true
  } catch {
    return false
  }
}

// ========== 家长控制 ==========

const PARENT_CONTROL_KEY = 'mathgame_parent_control'

export interface ParentControl {
  dailyLimitMinutes: number // 每日使用时长限制（分钟）
  enabled: boolean
  pin: string // 简单密码
}

export function getParentControl(): ParentControl {
  try {
    const raw = localStorage.getItem(PARENT_CONTROL_KEY)
    return raw ? JSON.parse(raw) : { dailyLimitMinutes: 60, enabled: false, pin: '' }
  } catch {
    return { dailyLimitMinutes: 60, enabled: false, pin: '' }
  }
}

export function setParentControl(control: Partial<ParentControl>): void {
  const current = getParentControl()
  safeWrite(PARENT_CONTROL_KEY, { ...current, ...control })
}

// ========== 排行榜 ==========

const LEADERBOARD_KEY = 'mathgame_leaderboard'

export interface LeaderboardEntry {
  name: string
  score: number
  date: string // ISO 8601
  mode: string
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addScoreToLeaderboard(name: string, score: number, mode: string): void {
  const list = getLeaderboard()
  list.push({ name, score, date: new Date().toISOString(), mode })
  list.sort((a, b) => b.score - a.score)
  safeWrite(LEADERBOARD_KEY, list.slice(0, 50)) // 只保留前50名
}

// ========== 金币系统 ==========

const COINS_KEY = 'mathgame_coins'

export function getCoins(): number {
  try {
    const raw = localStorage.getItem(COINS_KEY)
    return raw ? parseInt(raw, 10) || 0 : 0
  } catch {
    return 0
  }
}

export function addCoins(amount: number): number {
  const coins = getCoins() + amount
  safeWrite(COINS_KEY, coins)
  return coins
}

export function spendCoins(amount: number): boolean {
  const coins = getCoins()
  if (coins < amount) return false
  safeWrite(COINS_KEY, coins - amount)
  return true
}

// ========== 知识点掌握度 ==========

const MASTERY_KEY = 'mathgame_kp_mastery'

export interface KPMastery {
  knowledgePoint: string
  correct: number
  total: number
  lastPracticed: string // ISO 8601
}

export function getKPMastery(): KPMastery[] {
  try {
    const raw = localStorage.getItem(MASTERY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function updateKPMastery(kp: string, correct: boolean): void {
  const list = getKPMastery()
  const idx = list.findIndex((m) => m.knowledgePoint === kp)
  if (idx >= 0) {
    list[idx].total++
    if (correct) list[idx].correct++
    list[idx].lastPracticed = new Date().toISOString()
  } else {
    list.push({
      knowledgePoint: kp,
      correct: correct ? 1 : 0,
      total: 1,
      lastPracticed: new Date().toISOString(),
    })
  }
  safeWrite(MASTERY_KEY, list)
}

export function getKPAccuracy(kp: string): number {
  const m = getKPMastery().find((x) => x.knowledgePoint === kp)
  if (!m || m.total === 0) return 0
  return Math.round((m.correct / m.total) * 100)
}

// ========== 连续学习天数（实际） ==========

const STREAK_KEY = 'mathgame_learning_streak'

export interface LearningStreak {
  lastDate: string // YYYY-MM-DD
  count: number
}

export function getLearningStreak(): LearningStreak {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { lastDate: '', count: 0 }
    return JSON.parse(raw) as LearningStreak
  } catch {
    return { lastDate: '', count: 0 }
  }
}

export function checkInLearning(): LearningStreak {
  const today = getTodayString()
  const streak = getLearningStreak()
  if (streak.lastDate === today) return streak
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().split('T')[0]
  const newCount = streak.lastDate === yStr ? streak.count + 1 : 1
  const updated = { lastDate: today, count: newCount }
  safeWrite(STREAK_KEY, updated)
  return updated
}

// ========== 成就系统（定义） ==========

/**
 * 成就设计说明（符合 pedagogy.md §3.2 多元化激励）：
 * - 覆盖多种维度：分数/正确率/连胜/游戏局数/总题数
 * - 每个成就对应一个具体学习行为，激励持续进步
 * - "初学者"引导入门，"完美主义者"激励高质量答题
 */

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  type: 'score' | 'streak' | 'accuracy' | 'games' | 'questions'
  requirement: number
}

export interface AchievementRecord {
  id: string
  unlockedAt: string // ISO 8601
}

// 10 个成就定义，难度递进
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_win',
    name: '初学者',
    description: '完成第一局游戏',
    icon: '🌱',
    type: 'games',
    requirement: 1,
  },
  {
    id: 'score_100',
    name: '崭露头角',
    description: '单局得分达到 100',
    icon: '⭐',
    type: 'score',
    requirement: 100,
  },
  {
    id: 'score_500',
    name: '算数新星',
    description: '单局得分达到 500',
    icon: '🌟',
    type: 'score',
    requirement: 500,
  },
  {
    id: 'score_1000',
    name: '算数达人',
    description: '单局得分达到 1000',
    icon: '💫',
    type: 'score',
    requirement: 1000,
  },
  {
    id: 'accuracy_90',
    name: '精准射手',
    description: '正确率达到 90%',
    icon: '🎯',
    type: 'accuracy',
    requirement: 90,
  },
  {
    id: 'accuracy_100',
    name: '完美主义者',
    description: '单局正确率 100%（≥10题）',
    icon: '💎',
    type: 'accuracy',
    requirement: 100,
  },
  {
    id: 'games_10',
    name: '坚持学习',
    description: '累计完成 10 局游戏',
    icon: '📚',
    type: 'games',
    requirement: 10,
  },
  {
    id: 'questions_50',
    name: '勤学苦练',
    description: '累计答对 50 道题',
    icon: '📖',
    type: 'questions',
    requirement: 50,
  },
  {
    id: 'questions_200',
    name: '题海战术',
    description: '累计答对 200 道题',
    icon: '🏆',
    type: 'questions',
    requirement: 200,
  },
  {
    id: 'streak_10',
    name: '十连胜',
    description: '答题挑战中达成 10 连胜',
    icon: '🔥',
    type: 'streak',
    requirement: 10,
  },
  {
    id: 'games_50',
    name: '学霸之路',
    description: '累计完成 50 局游戏',
    icon: '🎓',
    type: 'games',
    requirement: 50,
  },
  {
    id: 'timed_30',
    name: '闪电侠',
    description: '计时挑战答对 30 题',
    icon: '⚡',
    type: 'questions',
    requirement: 30,
  },
  {
    id: 'streak_days_7',
    name: '一周坚持',
    description: '连续学习 7 天',
    icon: '📅',
    type: 'games',
    requirement: 7,
  },
  {
    id: 'score_2000',
    name: '算数之王',
    description: '单局得分达到 2000',
    icon: '👑',
    type: 'score',
    requirement: 2000,
  },
  {
    id: 'games_100',
    name: '百局达人',
    description: '累计完成 100 局游戏',
    icon: '💯',
    type: 'games',
    requirement: 100,
  },
  {
    id: 'streak_20',
    name: '二十连胜',
    description: '达成 20 连胜',
    icon: '💥',
    type: 'streak',
    requirement: 20,
  },
]

const ACHIEVEMENTS_KEY = 'mathgame_achievements'

export function getAchievements(): AchievementRecord[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAchievements(records: AchievementRecord[]): void {
  safeWrite(ACHIEVEMENTS_KEY, records)
}

/**
 * 解锁一个成就，返回新解锁的成就（重复解锁则返回 null）
 */
export function unlockAchievement(id: string): AchievementDef | null {
  const records = getAchievements()
  if (records.some((r) => r.id === id)) return null // 已解锁
  const def = ACHIEVEMENTS.find((a) => a.id === id)
  if (!def) return null
  records.push({ id, unlockedAt: new Date().toISOString() })
  saveAchievements(records)
  return def
}

/**
 * 判断成就是否已解锁
 */
export function isAchievementUnlocked(id: string): boolean {
  return getAchievements().some((r) => r.id === id)
}

/**
 * 结算一局后，检测所有应解锁的成就
 * @returns 本局新解锁的成就列表（可能为空）
 */
export function checkAndUnlockAchievements(input: {
  score: number
  accuracy: number // 0-100
  totalQuestions: number // 本局答题数（100% 成就需 ≥10）
  streak: number // 本局最大连胜
}): AchievementDef[] {
  const stats = getQuizStats()
  const newlyUnlocked: AchievementDef[] = []

  const tryUnlock = (id: string) => {
    const def = unlockAchievement(id)
    if (def) newlyUnlocked.push(def)
  }

  // 分数类
  if (input.score >= 100) tryUnlock('score_100')
  if (input.score >= 500) tryUnlock('score_500')
  if (input.score >= 1000) tryUnlock('score_1000')
  if (input.score >= 2000) tryUnlock('score_2000')

  // 正确率类
  if (input.accuracy >= 90) tryUnlock('accuracy_90')
  if (input.accuracy >= 100 && input.totalQuestions >= 10) tryUnlock('accuracy_100')

  // 局数类
  if (stats.totalGames >= 1) tryUnlock('first_win')
  if (stats.totalGames >= 10) tryUnlock('games_10')
  if (stats.totalGames >= 50) tryUnlock('games_50')
  if (stats.totalGames >= 100) tryUnlock('games_100')

  // 总答对题数类
  if (stats.totalCorrect >= 50) tryUnlock('questions_50')
  if (stats.totalCorrect >= 200) tryUnlock('questions_200')

  // 连胜类
  if (input.streak >= 10) tryUnlock('streak_10')
  if (input.streak >= 20) tryUnlock('streak_20')

  // 连续学习天数
  const streak = getLearningStreak()
  if (streak.count >= 7) tryUnlock('streak_days_7')

  return newlyUnlocked
}
