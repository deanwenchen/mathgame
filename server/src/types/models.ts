/**
 * 数据模型类型定义
 * 儿童算数小能手 - TypeScript 接口定义
 */

// ============================================
// 用户相关类型
// ============================================

/**
 * 用户角色类型
 */
export type UserRole = 'student' | 'parent' | 'teacher';

/**
 * 用户表模型
 */
export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  parent_id?: string;  // 关联的家长账户ID（学生用户专用）
  created_at: string;  // ISO 8601 格式
  updated_at: string;
}

/**
 * 用户创建参数
 */
export interface CreateUserParams {
  id: string;
  username: string;
  password_hash: string;
  role?: UserRole;
  parent_id?: string;
}

// ============================================
// 角色相关类型
// ============================================

/**
 * 地图类型
 */
export type MapType = 'forest' | 'desert' | 'ice' | 'volcano' | 'castle';

/**
 * 角色表模型（游戏角色）
 */
export interface Character {
  id: string;
  user_id: string;
  name: string;
  level: number;
  exp: number;
  gold: number;
  hp: number;
  max_hp?: number;
  atk: number;
  def: number;
  current_map: MapType;
  created_at: string;
}

/**
 * 角色创建参数
 */
export interface CreateCharacterParams {
  id: string;
  user_id: string;
  name: string;
  level?: number;
  exp?: number;
  gold?: number;
  hp?: number;
  atk?: number;
  def?: number;
  current_map?: MapType;
}

// ============================================
// 题目相关类型
// ============================================

/**
 * 题目类型
 */
export type QuestionType = 'calculation' | 'word_problem' | 'comparison' | 'fill_blank' | 'selection';

/**
 * 题目表模型
 */
export interface Question {
  id: string;
  type: QuestionType;
  knowledge_point_id: string;
  difficulty: number;  // 1-10
  content: string;     // 题目内容（JSON字符串或纯文本）
  answer: string;      // 答案
  options?: string;    // 选择题选项（JSON字符串）
  hint?: string;       // 提示
  created_at: string;
}

/**
 * 题目创建参数
 */
export interface CreateQuestionParams {
  id: string;
  type: QuestionType;
  knowledge_point_id: string;
  difficulty?: number;
  content: string;
  answer: string;
  options?: string;
  hint?: string;
}

/**
 * 选择题选项结构
 */
export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

// ============================================
// 学习进度相关类型
// ============================================

/**
 * 学习进度表模型
 */
export interface LearningProgress {
  id: string;
  user_id: string;
  knowledge_point_id: string;
  mastery_level: number;  // 0-100 掌握度
  correct_count: number;
  wrong_count: number;
  last_practiced_at?: string;
}

/**
 * 学习进度创建/更新参数
 */
export interface UpsertLearningProgressParams {
  id: string;
  user_id: string;
  knowledge_point_id: string;
  mastery_level?: number;
  correct_count?: number;
  wrong_count?: number;
  last_practiced_at?: string;
}

// ============================================
// 对战记录相关类型
// ============================================

/**
 * 对战结果类型
 */
export type BattleResult = 'win' | 'lose' | 'draw';

/**
 * 对战记录表模型
 */
export interface BattleRecord {
  id: string;
  user_id: string;
  character_id: string;
  monster_id: string;
  damage_dealt: number;
  correct_answers: number;
  wrong_answers: number;
  result: BattleResult;
  created_at: string;
}

/**
 * 对战记录创建参数
 */
export interface CreateBattleRecordParams {
  id: string;
  user_id: string;
  character_id: string;
  monster_id: string;
  damage_dealt?: number;
  correct_answers?: number;
  wrong_answers?: number;
  result: BattleResult;
}

// ============================================
// 统计相关类型
// ============================================

/**
 * 用户统计数据
 */
export interface UserStatistics {
  total_battles: number;
  total_wins: number;
  total_questions: number;
  total_correct: number;
  accuracy_rate: number;
  win_rate: number;
}

/**
 * 知识点掌握度统计
 */
export interface KnowledgePointMastery {
  knowledge_point_id: string;
  knowledge_point_name?: string;
  mastery_level: number;
  correct_count: number;
  wrong_count: number;
  total_attempts: number;
  accuracy_rate: number;
}

// ============================================
// 数据库配置类型
// ============================================

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  filename: string;
  verbose?: boolean;
}

// ============================================
// 辅助类型
// ============================================

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}