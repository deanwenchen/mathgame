import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, nickname, grade } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // 检查用户是否存在
    const existing = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // 创建用户
    const result = await sql`
      INSERT INTO users (username, password, nickname, grade)
      VALUES (${username}, ${password || null}, ${nickname || username}, ${grade || 1})
      RETURNING id, username, nickname, grade, created_at
    `;

    const user = result.rows[0];

    // 初始化进度
    await sql`
      INSERT INTO user_progress (user_id)
      VALUES (${user.id})
    `;

    res.status(201).json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
