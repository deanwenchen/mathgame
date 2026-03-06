import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path - use process.cwd() for CommonJS compatibility
const DB_PATH = path.resolve(process.cwd(), 'data/mathgame.db');

// Create database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better performance
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDatabase();

  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'parent', 'teacher')),
      nickname TEXT,
      avatar TEXT,
      grade INTEGER CHECK(grade >= 1 AND grade <= 6),
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id)
    );
  `);

  // Create characters table
  database.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      class TEXT NOT NULL CHECK(class IN ('warrior', 'mage', 'archer')),
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      hp INTEGER DEFAULT 100,
      max_hp INTEGER DEFAULT 100,
      attack INTEGER DEFAULT 10,
      defense INTEGER DEFAULT 5,
      speed INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create quizzes table
  database.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('choice', 'fill', 'calculate')),
      knowledge_point TEXT NOT NULL,
      difficulty INTEGER NOT NULL CHECK(difficulty >= 1 AND difficulty <= 10),
      question TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      grade INTEGER CHECK(grade >= 1 AND grade <= 6),
      chapter TEXT,
      estimated_time INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create battle_records table
  database.exec(`
    CREATE TABLE IF NOT EXISTS battle_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      enemy_id TEXT NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('win', 'lose')),
      duration INTEGER NOT NULL,
      rewards_exp INTEGER DEFAULT 0,
      rewards_gold INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (character_id) REFERENCES characters(id)
    );
  `);

  // Create battle_answers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS battle_answers (
      id TEXT PRIMARY KEY,
      battle_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      time_spent INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (battle_id) REFERENCES battle_records(id),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    );
  `);

  // Create learning_progress table
  database.exec(`
    CREATE TABLE IF NOT EXISTS learning_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      knowledge_point TEXT NOT NULL,
      mastery_level INTEGER DEFAULT 0 CHECK(mastery_level >= 0 AND mastery_level <= 100),
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      last_practiced DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, knowledge_point)
    );
  `);

  // Create user_statistics table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_statistics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      total_battles INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      last_play_date DATE,
      total_play_time INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
    CREATE INDEX IF NOT EXISTS idx_quizzes_knowledge_point ON quizzes(knowledge_point);
    CREATE INDEX IF NOT EXISTS idx_quizzes_grade ON quizzes(grade);
    CREATE INDEX IF NOT EXISTS idx_battle_records_user_id ON battle_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_battle_answers_battle_id ON battle_answers(battle_id);
    CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
  `);

  console.log('Database tables created successfully');
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}