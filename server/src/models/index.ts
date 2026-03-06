/**
 * 模块导出入口
 */

export * from './init';
export { default as initDb, initializeDatabase, getDatabase, closeDatabase, createTables, insertSampleQuestions, defaultDatabaseConfig } from './init';