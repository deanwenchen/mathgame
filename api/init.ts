import { sql } from '@vercel/postgres'

export default async function handler(req: any, res: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        nickname VARCHAR(255),
        grade INTEGER DEFAULT 1,
        is_premium BOOLEAN DEFAULT false,
        premium_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP`

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
