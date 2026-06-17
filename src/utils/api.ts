// API client - Cloud sync

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

// Register
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

// Login
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

// Save progress to cloud
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

// Load progress from cloud
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

// Local user session storage
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
