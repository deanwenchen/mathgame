import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // 查找用户（简单验证，无密码或密码匹配）
    const result = await sql`
      SELECT id, username, nickname, grade, password, created_at
      FROM users
      WHERE username = ${username}
    `;

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // 如果设置了密码，验证密码
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          grade: user.grade
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
