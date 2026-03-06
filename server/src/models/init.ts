/**
 * 数据库初始化脚本
 * 儿童算数小能手 - SQLite 数据库模型
 *
 * 教育设计说明：
 * - users表支持家长与学生账户关联，便于家长查看学习进度
 * - characters表记录游戏角色属性，激励学生持续学习
 * - questions表存储题库，支持多种题型和难度分级
 * - learning_progress表追踪知识点掌握度，支持自适应学习
 * - battle_records表记录对战历史，用于学习报告生成
 */

import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import type { DatabaseConfig } from '../types/models';

// 数据库实例
let db: DatabaseType | null = null;

/**
 * 初始化数据库连接
 */
export function initDatabase(config: DatabaseConfig): DatabaseType {
  if (db) {
    return db;
  }

  db = new Database(config.filename, {
    verbose: config.verbose ? console.log : undefined
  });

  // 启用外键约束
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

/**
 * 获取数据库实例
 */
export function getDatabase(): DatabaseType {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * 创建所有表
 */
export function createTables(): void {
  const database = getDatabase();

  // 用户表
  // 教育意义：支持学生、家长、教师三种角色，家长可关联学生账户
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 角色表（游戏角色）
  // 教育意义：通过角色成长激励学生持续学习，属性与学习表现挂钩
  database.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      gold INTEGER DEFAULT 0,
      hp INTEGER DEFAULT 100,
      atk INTEGER DEFAULT 10,
      def INTEGER DEFAULT 5,
      current_map TEXT DEFAULT 'forest',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 题目表
  // 教育意义：支持多题型、多难度，关联知识点，支持自适应出题
  database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      knowledge_point_id TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      content TEXT NOT NULL,
      answer TEXT NOT NULL,
      options TEXT,
      hint TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 学习进度表
  // 教育意义：追踪每个知识点的掌握度，支持个性化学习路径
  database.exec(`
    CREATE TABLE IF NOT EXISTS learning_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      knowledge_point_id TEXT NOT NULL,
      mastery_level REAL DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      last_practiced_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, knowledge_point_id)
    )
  `);

  // 对战记录表
  // 教育意义：记录每次对战详情，用于生成学习报告和分析薄弱点
  database.exec(`
    CREATE TABLE IF NOT EXISTS battle_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      monster_id TEXT NOT NULL,
      damage_dealt INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      wrong_answers INTEGER DEFAULT 0,
      result TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    )
  `);

  // 创建索引以提升查询性能
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_id);
    CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
    CREATE INDEX IF NOT EXISTS idx_questions_kp ON questions(knowledge_point_id);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
    CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_learning_progress_kp ON learning_progress(knowledge_point_id);
    CREATE INDEX IF NOT EXISTS idx_battle_records_user ON battle_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_battle_records_created ON battle_records(created_at);
  `);
}

/**
 * 插入示例题目数据
 * 教育意义：MVP阶段覆盖1-2年级核心知识点，难度递进
 */
export function insertSampleQuestions(): void {
  const database = getDatabase();

  // 检查是否已有题目
  const count = database.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  if (count.count > 0) {
    return; // 已有数据，跳过插入
  }

  const insertQuestion = database.prepare(`
    INSERT INTO questions (id, type, knowledge_point_id, difficulty, content, answer, options, hint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 示例题目数据
  // 知识点ID说明：
  // KP1-KP3: 10以内加法
  // KP4-KP6: 10以内减法
  // KP7-KP10: 20以内加减法
  // KP11-KP14: 100以内加法
  // KP15-KP18: 100以内减法
  const sampleQuestions = [
    // ========== 10以内加法（一年级上册）==========
    // KP1: 5以内加法（难度2）
    {
      id: 'Q001',
      type: 'calculation',
      knowledge_point_id: 'KP1',
      difficulty: 2,
      content: '2 + 3 = ?',
      answer: '5',
      hint: '可以用手指帮忙数一数哦！'
    },
    {
      id: 'Q002',
      type: 'calculation',
      knowledge_point_id: 'KP1',
      difficulty: 2,
      content: '1 + 4 = ?',
      answer: '5',
      hint: '1和4合起来是几呢？'
    },
    // KP2: 10以内不进位加法（难度3）
    {
      id: 'Q003',
      type: 'calculation',
      knowledge_point_id: 'KP2',
      difficulty: 3,
      content: '5 + 3 = ?',
      answer: '8',
      hint: '5个加上3个，一共是几个？'
    },
    {
      id: 'Q004',
      type: 'calculation',
      knowledge_point_id: 'KP2',
      difficulty: 3,
      content: '6 + 2 = ?',
      answer: '8',
      hint: '从6开始往后数2个数。'
    },
    // KP3: 10以内进位加法（难度4）
    {
      id: 'Q005',
      type: 'calculation',
      knowledge_point_id: 'KP3',
      difficulty: 4,
      content: '8 + 5 = ?',
      answer: '13',
      hint: '试试凑十法：8需要几凑成10？'
    },

    // ========== 10以内减法（一年级上册）==========
    // KP4: 5以内减法（难度2）
    {
      id: 'Q006',
      type: 'calculation',
      knowledge_point_id: 'KP4',
      difficulty: 2,
      content: '5 - 2 = ?',
      answer: '3',
      hint: '5个拿走2个，还剩几个？'
    },
    // KP5: 10以内不退位减法（难度3）
    {
      id: 'Q007',
      type: 'calculation',
      knowledge_point_id: 'KP5',
      difficulty: 3,
      content: '8 - 3 = ?',
      answer: '5',
      hint: '8减去3等于几？'
    },
    // KP6: 10以内退位减法（难度4）
    {
      id: 'Q008',
      type: 'calculation',
      knowledge_point_id: 'KP6',
      difficulty: 4,
      content: '12 - 5 = ?',
      answer: '7',
      hint: '把12分成10和2，10减5等于5，5加2等于7。'
    },

    // ========== 20以内加减法（一年级下册）==========
    // KP8: 20以内进位加法（难度5）
    {
      id: 'Q009',
      type: 'calculation',
      knowledge_point_id: 'KP8',
      difficulty: 5,
      content: '9 + 6 = ?',
      answer: '15',
      hint: '用凑十法：9加1等于10，6分成1和5，10加5等于15。'
    },
    {
      id: 'Q010',
      type: 'calculation',
      knowledge_point_id: 'KP8',
      difficulty: 5,
      content: '8 + 7 = ?',
      answer: '15',
      hint: '8和谁能凑成10呢？'
    },
    // KP10: 20以内退位减法（难度5）
    {
      id: 'Q011',
      type: 'calculation',
      knowledge_point_id: 'KP10',
      difficulty: 5,
      content: '15 - 8 = ?',
      answer: '7',
      hint: '想：8加几等于15？'
    },
    {
      id: 'Q012',
      type: 'calculation',
      knowledge_point_id: 'KP10',
      difficulty: 5,
      content: '13 - 7 = ?',
      answer: '6',
      hint: '破十法：10减7等于3，3加3等于6。'
    },

    // ========== 100以内加减法（二年级）==========
    // KP11: 整十数加法（难度4）
    {
      id: 'Q013',
      type: 'calculation',
      knowledge_point_id: 'KP11',
      difficulty: 4,
      content: '30 + 40 = ?',
      answer: '70',
      hint: '3个十加4个十等于7个十。'
    },
    // KP12: 两位数加一位数（不进位）（难度5）
    {
      id: 'Q014',
      type: 'calculation',
      knowledge_point_id: 'KP12',
      difficulty: 5,
      content: '23 + 5 = ?',
      answer: '28',
      hint: '个位加个位：3加5等于8。'
    },
    // KP13: 两位数加一位数（进位）（难度6）
    {
      id: 'Q015',
      type: 'calculation',
      knowledge_point_id: 'KP13',
      difficulty: 6,
      content: '38 + 6 = ?',
      answer: '44',
      hint: '8加6等于14，进1后是44。'
    },
    // KP15: 整十数减法（难度4）
    {
      id: 'Q016',
      type: 'calculation',
      knowledge_point_id: 'KP15',
      difficulty: 4,
      content: '60 - 20 = ?',
      answer: '40',
      hint: '6个十减2个十等于4个十。'
    },
    // KP17: 两位数减一位数（退位）（难度6）
    {
      id: 'Q017',
      type: 'calculation',
      knowledge_point_id: 'KP17',
      difficulty: 6,
      content: '42 - 8 = ?',
      answer: '34',
      hint: '个位不够减，向十位借1当10。'
    },

    // ========== 选择题示例 ==========
    {
      id: 'Q018',
      type: 'selection',
      knowledge_point_id: 'KP1',
      difficulty: 2,
      content: '下面哪个算式的结果最大？',
      answer: 'C',
      options: JSON.stringify({
        A: '1 + 2',
        B: '2 + 2',
        C: '3 + 2',
        D: '1 + 1'
      }),
      hint: '算出每个算式的结果再比较。'
    },
    {
      id: 'Q019',
      type: 'selection',
      knowledge_point_id: 'KP8',
      difficulty: 5,
      content: '9 + 5 = ?',
      answer: 'B',
      options: JSON.stringify({
        A: '13',
        B: '14',
        C: '15',
        D: '16'
      }),
      hint: '用凑十法：9加1等于10。'
    },

    // ========== 应用题示例 ==========
    {
      id: 'Q020',
      type: 'word_problem',
      knowledge_point_id: 'KP19',
      difficulty: 5,
      content: '小明有8个苹果，妈妈又给了他5个苹果。小明现在一共有多少个苹果？',
      answer: '13',
      hint: '求一共有多少个，用加法。'
    },
    {
      id: 'Q021',
      type: 'word_problem',
      knowledge_point_id: 'KP21',
      difficulty: 5,
      content: '小红有15支铅笔，送给同学7支。小红还剩多少支铅笔？',
      answer: '8',
      hint: '求还剩多少，用减法。'
    },
    {
      id: 'Q022',
      type: 'word_problem',
      knowledge_point_id: 'KP19',
      difficulty: 6,
      content: '树上有12只鸟，又飞来了8只。现在树上一共有多少只鸟？',
      answer: '20',
      hint: '原来有12只，又来了8只，求总共。'
    }
  ];

  // 批量插入题目
  const insertMany = database.transaction((questions: typeof sampleQuestions) => {
    for (const q of questions) {
      insertQuestion.run(
        q.id,
        q.type,
        q.knowledge_point_id,
        q.difficulty,
        q.content,
        q.answer,
        q.options || null,
        q.hint || null
      );
    }
  });

  insertMany(sampleQuestions);
  console.log(`[DB] Inserted ${sampleQuestions.length} sample questions`);
}

/**
 * 完整初始化数据库（创建表 + 插入示例数据）
 */
export function initializeDatabase(config: DatabaseConfig): DatabaseType {
  const database = initDatabase(config);
  createTables();
  insertSampleQuestions();
  console.log('[DB] Database initialized successfully');
  return database;
}

// 默认数据库配置
export const defaultDatabaseConfig: DatabaseConfig = {
  filename: './data/mathgame.db',
  verbose: process.env.NODE_ENV === 'development'
};

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  createTables,
  insertSampleQuestions,
  initializeDatabase,
  defaultDatabaseConfig
};