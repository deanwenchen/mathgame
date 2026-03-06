/**
 * Game Module Index
 *
 * Educational Purpose:
 * - Central export point for all game modules
 * - Facilitates clean imports throughout the application
 */

// Configuration
export { gameConfig, GAME_CONSTANTS, COLORS } from './config';

// Game Manager
export { GameManager, gameManager } from './GameManager';
export type { PlayerState, BattleState } from './GameManager';

// Scenes
export { BootScene } from './scenes/BootScene';
export { MenuScene } from './scenes/MenuScene';
export { BattleScene } from './scenes/BattleScene';
export { ResultScene } from './scenes/ResultScene';

// Entities
export { Player } from './entities/Player';
export { Monster, createRandomMonster, MONSTER_TEMPLATES } from './entities/Monster';
export type { MonsterConfig, MonsterDifficulty } from './entities/Monster';