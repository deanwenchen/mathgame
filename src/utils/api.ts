// API 客户端 - 云端同步功能

export interface User {
  id: number
  username: string
  nickname: string
  grade: number
}

export interface QuizProgress {
  high_score: number
  total_games: number
  total_questions: number
  total_correct: number
  best_level: number
  updated_at: string
}

// 注册
export async function register(
  username: string,
  nickname?: string,
  grade?: number
): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, nickname, grade }),
    })
    return await res.json()
  } catch (error) {
    return { success: false, error: 'Network error' }
  }
}

// 登录
export async function login(
  username: string,
  password?: string
): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    return await res.json()
  } catch (error) {
    return { success: false, error: 'Network error' }
  }
}

// 保存进度到云端
export async function saveProgress(
  userId: number,
  progress: QuizProgress
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/user/sync?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    })
    return await res.json()
  } catch (error) {
    return { success: false, error: 'Network error' }
  }
}

// 从云端加载进度
export async function loadProgress(
  userId: number
): Promise<{ success: boolean; data?: QuizProgress; error?: string }> {
  try {
    const res = await fetch(`/api/user/sync?user_id=${userId}`)
    return await res.json()
  } catch (error) {
    return { success: false, error: 'Network error' }
  }
}

// 本地存储当前用户
export function saveCurrentUser(user: User): void {
  localStorage.setItem('current_user', JSON.stringify(user))
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem('current_user')
  return data ? JSON.parse(data) : null
}

export function logout(): void {
  localStorage.removeItem('current_user')
}
