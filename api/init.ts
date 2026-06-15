import { sql } from '@vercel/postgres'

// 初始化数据库表（首次部署时调用一次）
export default async function handler(req: any, res: any) {
  try {
    // 用户表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        nickname VARCHAR(255),
        grade INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // 进度表
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        high_score INTEGER DEFAULT 0,
        total_games INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        total_correct INTEGER DEFAULT 0,
        best_level INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `

    res.status(200).json({ success: true, message: 'Database tables created' })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
