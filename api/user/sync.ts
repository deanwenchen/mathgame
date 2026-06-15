import { sql } from '@vercel/postgres'

export default async function handler(req: any, res: any) {
  const { user_id } = req.query

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' })
  }

  if (req.method === 'GET') {
    // 加载进度
    try {
      const result = await sql`
        SELECT high_score, total_games, total_questions, total_correct, best_level, updated_at
        FROM user_progress
        WHERE user_id = ${user_id}
      `

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Progress not found' })
      }

      res.status(200).json({
        success: true,
        data: result.rows[0],
      })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  } else if (req.method === 'POST') {
    // 保存进度
    try {
      const { high_score, total_games, total_questions, total_correct, best_level } = req.body

      await sql`
        INSERT INTO user_progress (user_id, high_score, total_games, total_questions, total_correct, best_level, updated_at)
        VALUES (${user_id}, ${high_score || 0}, ${total_games || 0}, ${total_questions || 0}, ${total_correct || 0}, ${best_level || 0}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          high_score = EXCLUDED.high_score,
          total_games = EXCLUDED.total_games,
          total_questions = EXCLUDED.total_questions,
          total_correct = EXCLUDED.total_correct,
          best_level = EXCLUDED.best_level,
          updated_at = NOW()
      `

      res.status(200).json({
        success: true,
        message: 'Progress synced',
      })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
