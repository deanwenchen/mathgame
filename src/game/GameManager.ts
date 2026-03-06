/**
 * Game Manager - Singleton Pattern
 *
 * Educational Purpose:
 * - Centralizes game state management for learning progress tracking
 * - Manages scene transitions for smooth learning flow
 * - Stores player progress and battle statistics
 */

import Phaser from 'phaser';
import { gameConfig, GAME_CONSTANTS } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { BattleScene } from './scenes/BattleScene';
import { ResultScene } from './scenes/ResultScene';

/**
 * Player state interface for tracking learning progress
 */
export interface PlayerState {
  id: string;
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  streak: number;
  maxStreak: number;
  totalCorrect: number;
  totalWrong: number;
}

/**
 * Battle session state
 */
export interface BattleState {
  battleId: string;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  questionsAnswered: number;
  correctAnswers: number;
  currentCombo: number;
  maxCombo: number;
  startTime: number;
  isVictory: boolean | null;
}

/**
 * Game Manager singleton class
 */
export class GameManager {
  private static instance: GameManager | null = null;
  private game: Phaser.Game | null = null;
  private playerState: PlayerState | null = null;
  private battleState: BattleState | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Initialize the Phaser game
   */
  public initialize(parentElement: string): Phaser.Game {
    if (this.game) {
      return this.game;
    }

    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      parent: parentElement,
      scene: [BootScene, MenuScene, BattleScene, ResultScene]
    };

    this.game = new Phaser.Game(config);
    return this.game;
  }

  /**
   * Destroy the game instance
   */
  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  /**
   * Initialize player state for new game
   */
  public initPlayerState(name: string): PlayerState {
    this.playerState = {
      id: `player_${Date.now()}`,
      name,
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: GAME_CONSTANTS.PLAYER_DEFAULT.HP,
      maxHp: GAME_CONSTANTS.PLAYER_DEFAULT.HP,
      attack: GAME_CONSTANTS.PLAYER_DEFAULT.ATTACK,
      defense: GAME_CONSTANTS.PLAYER_DEFAULT.DEFENSE,
      gold: 0,
      streak: 0,
      maxStreak: 0,
      totalCorrect: 0,
      totalWrong: 0
    };
    return this.playerState;
  }

  /**
   * Get current player state
   */
  public getPlayerState(): PlayerState | null {
    return this.playerState;
  }

  /**
   * Update player state
   */
  public updatePlayerState(updates: Partial<PlayerState>): void {
    if (this.playerState) {
      this.playerState = { ...this.playerState, ...updates };
    }
  }

  /**
   * Initialize battle state
   */
  public initBattleState(enemyName: string, enemyMaxHp: number): BattleState {
    this.battleState = {
      battleId: `battle_${Date.now()}`,
      enemyName,
      enemyHp: enemyMaxHp,
      enemyMaxHp,
      questionsAnswered: 0,
      correctAnswers: 0,
      currentCombo: 0,
      maxCombo: 0,
      startTime: Date.now(),
      isVictory: null
    };
    return this.battleState;
  }

  /**
   * Get current battle state
   */
  public getBattleState(): BattleState | null {
    return this.battleState;
  }

  /**
   * Update battle state
   */
  public updateBattleState(updates: Partial<BattleState>): void {
    if (this.battleState) {
      this.battleState = { ...this.battleState, ...updates };
    }
  }

  /**
   * Process answer result in battle
   */
  public processAnswer(isCorrect: boolean): {
    damage: number;
    comboBonus: number;
    isDefeated: boolean;
  } {
    if (!this.battleState || !this.playerState) {
      return { damage: 0, comboBonus: 0, isDefeated: false };
    }

    const result = {
      damage: 0,
      comboBonus: 0,
      isDefeated: false
    };

    this.battleState.questionsAnswered++;

    if (isCorrect) {
      // Calculate combo bonus (educational: encourages consecutive correct answers)
      this.battleState.currentCombo++;
      if (this.battleState.currentCombo > this.battleState.maxCombo) {
        this.battleState.maxCombo = this.battleState.currentCombo;
      }

      // Combo bonus: 10% per combo, max 50%
      result.comboBonus = Math.min(this.battleState.currentCombo * 0.1, 0.5);
      result.damage = Math.floor(
        this.playerState.attack * (1 + result.comboBonus)
      );

      this.battleState.correctAnswers++;
      this.battleState.enemyHp -= result.damage;

      if (this.battleState.enemyHp <= 0) {
        this.battleState.enemyHp = 0;
        this.battleState.isVictory = true;
        result.isDefeated = true;
      }

      // Update player stats
      this.playerState.totalCorrect++;
      this.playerState.streak++;
      if (this.playerState.streak > this.playerState.maxStreak) {
        this.playerState.maxStreak = this.playerState.streak;
      }
    } else {
      // Wrong answer - player takes damage
      const enemyDamage = 10; // Base enemy damage
      const actualDamage = Math.max(
        1,
        enemyDamage - this.playerState.defense * 0.5
      );
      this.playerState.hp -= actualDamage;

      // Reset combo on wrong answer
      this.battleState.currentCombo = 0;
      this.playerState.streak = 0;
      this.playerState.totalWrong++;

      // Check for defeat
      if (this.playerState.hp <= 0) {
        this.playerState.hp = 0;
        this.battleState.isVictory = false;
        result.isDefeated = true;
      }
    }

    return result;
  }

  /**
   * Calculate rewards after battle
   */
  public calculateRewards(): { exp: number; gold: number } {
    if (!this.battleState || !this.battleState.isVictory) {
      return { exp: 0, gold: 0 };
    }

    const baseExp = 20;
    const baseGold = 10;

    // Bonus for accuracy
    const accuracy = this.battleState.correctAnswers / this.battleState.questionsAnswered;
    const accuracyBonus = accuracy > 0.8 ? 1.5 : accuracy > 0.6 ? 1.2 : 1.0;

    // Bonus for combo
    const comboBonus = this.battleState.maxCombo >= 5 ? 1.3 : 1.0;

    const exp = Math.floor(baseExp * accuracyBonus * comboBonus);
    const gold = Math.floor(baseGold * accuracyBonus * comboBonus);

    // Apply to player
    if (this.playerState) {
      this.playerState.exp += exp;
      this.playerState.gold += gold;

      // Check level up
      while (this.playerState.exp >= this.playerState.expToNext) {
        this.playerState.exp -= this.playerState.expToNext;
        this.playerState.level++;
        this.playerState.expToNext = Math.floor(
          this.playerState.expToNext * 1.5
        );
        // Increase stats on level up
        this.playerState.maxHp += 10;
        this.playerState.hp = this.playerState.maxHp;
        this.playerState.attack += 2;
        this.playerState.defense += 1;
      }
    }

    return { exp, gold };
  }

  /**
   * Switch to a scene
   */
  public switchScene(sceneName: string, data?: object): void {
    if (this.game) {
      this.game.scene.start(sceneName, data);
    }
  }

  /**
   * Get the Phaser game instance
   */
  public getGame(): Phaser.Game | null {
    return this.game;
  }
}

// Export singleton instance
export const gameManager = GameManager.getInstance();