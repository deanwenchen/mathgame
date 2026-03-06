/**
 * Player Entity Class
 *
 * Educational Purpose:
 * - Represents the student's learning avatar
 * - Attributes reflect learning progress and achievement
 * - Growth system tied to educational milestones
 */

import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS } from '../config';
import { PlayerState } from '../GameManager';

/**
 * Player character class with RPG attributes
 */
export class Player extends Phaser.GameObjects.Sprite {
  // Player attributes
  public stats: PlayerState;

  // Movement properties
  private moveSpeed: number = GAME_CONSTANTS.PLAYER_DEFAULT.SPEED;
  private isMoving: boolean = false;

  // Animation keys
  private readonly ANIM_IDLE = 'player_idle';
  private readonly ANIM_WALK = 'player_walk';
  private readonly ANIM_ATTACK = 'player_attack';
  private readonly ANIM_HIT = 'player_hit';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'player',
    initialState?: Partial<PlayerState>
  ) {
    super(scene, x, y, texture);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Initialize stats
    this.stats = this.initializeStats(initialState);

    // Setup physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(24, 28);
    body.setOffset(4, 4);

    // Initialize animations
    this.createAnimations();

    // Start idle animation
    this.play(this.ANIM_IDLE);
  }

  /**
   * Initialize player stats with defaults or provided values
   */
  private initializeStats(state?: Partial<PlayerState>): PlayerState {
    const defaults: PlayerState = {
      id: `player_${Date.now()}`,
      name: 'Hero',
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

    return { ...defaults, ...state };
  }

  /**
   * Create player animations
   */
  private createAnimations(): void {
    // Note: In production, these would use actual sprite sheets
    // For now, we create simple frame-based animations

    const anims = this.scene.anims;

    // Idle animation
    if (!anims.exists(this.ANIM_IDLE)) {
      anims.create({
        key: this.ANIM_IDLE,
        frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: GAME_CONSTANTS.ANIMATION.IDLE_FPS,
        repeat: -1
      });
    }

    // Walk animation
    if (!anims.exists(this.ANIM_WALK)) {
      anims.create({
        key: this.ANIM_WALK,
        frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 9 }),
        frameRate: GAME_CONSTANTS.ANIMATION.WALK_FPS,
        repeat: -1
      });
    }

    // Attack animation
    if (!anims.exists(this.ANIM_ATTACK)) {
      anims.create({
        key: this.ANIM_ATTACK,
        frames: this.scene.anims.generateFrameNumbers('player', { start: 10, end: 14 }),
        frameRate: GAME_CONSTANTS.ANIMATION.ATTACK_FPS,
        repeat: 0
      });
    }

    // Hit animation
    if (!anims.exists(this.ANIM_HIT)) {
      anims.create({
        key: this.ANIM_HIT,
        frames: this.scene.anims.generateFrameNumbers('player', { start: 15, end: 17 }),
        frameRate: GAME_CONSTANTS.ANIMATION.HIT_FPS,
        repeat: 0
      });
    }
  }

  /**
   * Move player in a direction
   */
  public move(direction: 'left' | 'right' | 'up' | 'down'): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (direction) {
      case 'left':
        body.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
        this.facingDirection = 'left';
        break;
      case 'right':
        body.setVelocityX(this.moveSpeed);
        this.setFlipX(false);
        this.facingDirection = 'right';
        break;
      case 'up':
        body.setVelocityY(-this.moveSpeed);
        break;
      case 'down':
        body.setVelocityY(this.moveSpeed);
        break;
    }

    if (!this.isMoving) {
      this.isMoving = true;
      this.play(this.ANIM_WALK);
    }
  }

  /**
   * Stop player movement
   */
  public stopPlayer(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    if (this.isMoving) {
      this.isMoving = false;
      this.play(this.ANIM_IDLE);
    }
  }

  /**
   * Perform attack animation
   */
  public attack(): void {
    this.play(this.ANIM_ATTACK, true);

    // Return to idle after attack
    this.scene.time.delayedCall(300, () => {
      this.play(this.ANIM_IDLE);
    });
  }

  /**
   * Take damage and play hit animation
   */
  public takeDamage(amount: number): number {
    // Apply defense reduction
    const actualDamage = Math.max(1, amount - this.stats.defense * 0.5);
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);

    // Play hit animation
    this.play(this.ANIM_HIT, true);

    // Flash red
    this.setTint(0xFF0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // Return to idle
    this.scene.time.delayedCall(200, () => {
      this.play(this.ANIM_IDLE);
    });

    return actualDamage;
  }

  /**
   * Heal the player
   */
  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);

    // Flash green
    this.setTint(0x00FF00);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }

  /**
   * Add experience and check for level up
   */
  public addExp(amount: number): { leveledUp: boolean; newLevel: number } {
    this.stats.exp += amount;
    let leveledUp = false;

    while (this.stats.exp >= this.stats.expToNext) {
      this.stats.exp -= this.stats.expToNext;
      this.stats.level++;
      this.stats.expToNext = Math.floor(this.stats.expToNext * 1.5);

      // Increase stats on level up
      this.stats.maxHp += 10;
      this.stats.hp = this.stats.maxHp;
      this.stats.attack += 2;
      this.stats.defense += 1;

      leveledUp = true;
    }

    return {
      leveledUp,
      newLevel: this.stats.level
    };
  }

  /**
   * Calculate damage output
   */
  public calculateDamage(comboBonus: number = 0): number {
    const baseDamage = this.stats.attack;
    const bonusDamage = baseDamage * comboBonus;
    return Math.floor(baseDamage + bonusDamage);
  }

  /**
   * Check if player is alive
   */
  public isAlive(): boolean {
    return this.stats.hp > 0;
  }

  /**
   * Get current HP percentage
   */
  public getHpPercent(): number {
    return this.stats.hp / this.stats.maxHp;
  }

  /**
   * Get EXP percentage to next level
   */
  public getExpPercent(): number {
    return this.stats.exp / this.stats.expToNext;
  }

  /**
   * Update player stats from external state
   */
  public updateStats(newState: Partial<PlayerState>): void {
    this.stats = { ...this.stats, ...newState };
  }

  /**
   * Create HP bar above player
   */
  public createHpBar(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
    const hpBar = scene.add.graphics();
    this.updateHpBar(hpBar);
    return hpBar;
  }

  /**
   * Update HP bar graphics
   */
  public updateHpBar(hpBar: Phaser.GameObjects.Graphics): void {
    hpBar.clear();

    const barWidth = 40;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - this.height / 2 - 15;

    // Background
    hpBar.fillStyle(0x333333, 1);
    hpBar.fillRect(x, y, barWidth, barHeight);

    // HP fill
    const hpPercent = this.getHpPercent();
    const hpColor = hpPercent > 0.5 ? COLORS.SUCCESS :
      hpPercent > 0.25 ? COLORS.WARNING : COLORS.DANGER;
    hpBar.fillStyle(hpColor, 1);
    hpBar.fillRect(x, y, barWidth * hpPercent, barHeight);
  }

  /**
   * Reset player to full health
   */
  public reset(): void {
    this.stats.hp = this.stats.maxHp;
    this.setPosition(400, 300);
    this.play(this.ANIM_IDLE);
  }

  /**
   * Serialize player data for saving
   */
  public serialize(): PlayerState {
    return { ...this.stats };
  }

  /**
   * Cleanup when destroying player
   */
  public destroy(): void {
    super.destroy();
  }
}