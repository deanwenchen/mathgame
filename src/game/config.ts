/**
 * Phaser.js Game Configuration
 *
 * Educational Purpose:
 * - Configures the game canvas for optimal learning experience
 * - Sets up physics for interactive battle mechanics
 * - Defines responsive game dimensions
 */

import Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [], // Scenes will be registered dynamically
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};

/**
 * Game dimensions and constants
 */
export const GAME_CONSTANTS = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 32,

  // Battle timing (educational: allows sufficient thinking time)
  ANSWER_TIME_LIMIT: 30000, // 30 seconds per question
  COMBO_TIMEOUT: 5000, // 5 seconds to maintain combo

  // Player default stats
  PLAYER_DEFAULT: {
    HP: 100,
    ATTACK: 10,
    DEFENSE: 5,
    SPEED: 100
  },

  // Monster configurations by difficulty
  MONSTER_DIFFICULTY: {
    EASY: { hp: 50, attack: 5, exp: 10 },
    MEDIUM: { hp: 80, attack: 8, exp: 20 },
    HARD: { hp: 120, attack: 12, exp: 35 }
  },

  // Animation frame rates
  ANIMATION: {
    IDLE_FPS: 6,
    WALK_FPS: 10,
    ATTACK_FPS: 15,
    HIT_FPS: 12
  }
} as const;

/**
 * Color palette for the game UI
 */
export const COLORS = {
  PRIMARY: 0x4A90D9,
  SECONDARY: 0x7B68EE,
  SUCCESS: 0x4CAF50,
  WARNING: 0xFFC107,
  DANGER: 0xF44336,
  TEXT: 0xFFFFFF,
  TEXT_DARK: 0x333333,
  BACKGROUND: 0x1a1a2e,
  PANEL: 0x16213e
} as const;