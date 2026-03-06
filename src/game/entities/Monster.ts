/**
 * Monster Entity Class
 *
 * Educational Purpose:
 * - Represents learning challenges of varying difficulty
 * - Difficulty correlates with question complexity
 * - Defeating monsters provides learning rewards
 */

import Phaser from 'phaser';
import { COLORS } from '../config';

/**
 * Monster difficulty levels aligned with learning progression
 */
export type MonsterDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

/**
 * Monster configuration interface
 */
export interface MonsterConfig {
  id: string;
  name: string;
  type: string;
  difficulty: MonsterDifficulty;
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  spriteKey: string;
}

/**
 * Predefined monster templates
 */
export const MONSTER_TEMPLATES: Record<string, MonsterConfig> = {
  // Easy monsters (Grade 1-2 basic operations)
  slime: {
    id: 'monster_slime',
    name: 'Slime',
    type: 'slime',
    difficulty: 'easy',
    hp: 50,
    attack: 5,
    defense: 2,
    expReward: 10,
    goldReward: 5,
    spriteKey: 'monster_slime'
  },
  blob: {
    id: 'monster_blob',
    name: 'Blob',
    type: 'blob',
    difficulty: 'easy',
    hp: 40,
    attack: 4,
    defense: 1,
    expReward: 8,
    goldReward: 4,
    spriteKey: 'monster_slime'
  },

  // Medium monsters (Grade 2-3 operations)
  goblin: {
    id: 'monster_goblin',
    name: 'Goblin',
    type: 'goblin',
    difficulty: 'medium',
    hp: 80,
    attack: 8,
    defense: 4,
    expReward: 20,
    goldReward: 12,
    spriteKey: 'monster_goblin'
  },
  imp: {
    id: 'monster_imp',
    name: 'Imp',
    type: 'imp',
    difficulty: 'medium',
    hp: 70,
    attack: 10,
    defense: 3,
    expReward: 18,
    goldReward: 10,
    spriteKey: 'monster_goblin'
  },

  // Hard monsters (Grade 3-4 operations)
  orc: {
    id: 'monster_orc',
    name: 'Orc',
    type: 'orc',
    difficulty: 'hard',
    hp: 120,
    attack: 12,
    defense: 6,
    expReward: 35,
    goldReward: 25,
    spriteKey: 'monster_goblin'
  },
  demon: {
    id: 'monster_demon',
    name: 'Demon',
    type: 'demon',
    difficulty: 'hard',
    hp: 100,
    attack: 15,
    defense: 5,
    expReward: 40,
    goldReward: 30,
    spriteKey: 'monster_dragon'
  },

  // Boss monsters (Grade 4+ advanced)
  dragon: {
    id: 'monster_dragon',
    name: 'Dragon',
    type: 'dragon',
    difficulty: 'boss',
    hp: 200,
    attack: 20,
    defense: 10,
    expReward: 100,
    goldReward: 80,
    spriteKey: 'monster_dragon'
  }
};

/**
 * Monster class representing enemy entities
 */
export class Monster extends Phaser.GameObjects.Sprite {
  // Monster properties
  public config: MonsterConfig;
  public currentHp: number;
  public maxHp: number;

  // State flags
  private isHurt: boolean = false;
  private isAttacking: boolean = false;

  // Animation keys (set dynamically based on sprite)
  private ANIM_IDLE = 'monster_idle';
  private ANIM_HURT = 'monster_hurt';
  private ANIM_ATTACK = 'monster_attack';
  private ANIM_DEATH = 'monster_death';

  // HP bar
  private hpBar: Phaser.GameObjects.Graphics | null = null;
  private hpText: Phaser.GameObjects.Text | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    monsterKey: string = 'slime'
  ) {
    // Get monster configuration
    const config = MONSTER_TEMPLATES[monsterKey] || MONSTER_TEMPLATES.slime;

    super(scene, x, y, config.spriteKey);

    this.config = config;
    this.currentHp = config.hp;
    this.maxHp = config.hp;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setImmovable(true);

    // Create animations
    this.createAnimations();

    // Start idle animation
    this.play(this.ANIM_IDLE);

    // Scale based on difficulty
    this.setScale(this.getScaleForDifficulty());

    // Create HP bar
    this.createHpBar();
  }

  /**
   * Get scale multiplier based on difficulty
   */
  private getScaleForDifficulty(): number {
    const scales: Record<MonsterDifficulty, number> = {
      easy: 1.5,
      medium: 2,
      hard: 2.5,
      boss: 3
    };
    return scales[this.config.difficulty] || 1.5;
  }

  /**
   * Create monster animations
   */
  private createAnimations(): void {
    const anims = this.scene.anims;
    const spriteKey = this.config.spriteKey;

    // Idle animation
    const idleKey = `${spriteKey}_idle`;
    if (!anims.exists(idleKey)) {
      anims.create({
        key: idleKey,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    this.ANIM_IDLE = idleKey;

    // Hurt animation
    const hurtKey = `${spriteKey}_hurt`;
    if (!anims.exists(hurtKey)) {
      anims.create({
        key: hurtKey,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 4, end: 5 }),
        frameRate: 10,
        repeat: 0
      });
    }
    this.ANIM_HURT = hurtKey;

    // Attack animation
    const attackKey = `${spriteKey}_attack`;
    if (!anims.exists(attackKey)) {
      anims.create({
        key: attackKey,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 6, end: 9 }),
        frameRate: 12,
        repeat: 0
      });
    }
    this.ANIM_ATTACK = attackKey;

    // Death animation
    const deathKey = `${spriteKey}_death`;
    if (!anims.exists(deathKey)) {
      anims.create({
        key: deathKey,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 10, end: 14 }),
        frameRate: 10,
        repeat: 0
      });
    }
    this.ANIM_DEATH = deathKey;
  }

  /**
   * Create HP bar above monster
   */
  private createHpBar(): void {
    this.hpBar = this.scene.add.graphics();
    this.hpText = this.scene.add.text(this.x, this.y - this.height / 2 - 25, '', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    this.updateHpBar();
  }

  /**
   * Update HP bar display
   */
  public updateHpBar(): void {
    if (!this.hpBar) return;

    this.hpBar.clear();

    const barWidth = 60;
    const barHeight = 8;
    const x = this.x - barWidth / 2;
    const y = this.y - this.height / 2 - 20;

    // Background
    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(x, y, barWidth, barHeight);

    // HP fill
    const hpPercent = this.currentHp / this.maxHp;
    const hpColor = hpPercent > 0.5 ? COLORS.SUCCESS :
      hpPercent > 0.25 ? COLORS.WARNING : COLORS.DANGER;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(x, y, barWidth * hpPercent, barHeight);

    // Border
    this.hpBar.lineStyle(1, 0x000000, 1);
    this.hpBar.strokeRect(x, y, barWidth, barHeight);

    // Update HP text
    if (this.hpText) {
      this.hpText.setPosition(this.x, y - 12);
      this.hpText.setText(`${this.currentHp}/${this.maxHp}`);
    }
  }

  /**
   * Take damage from player attack
   */
  public takeDamage(amount: number): number {
    if (this.isHurt) return 0;

    // Apply defense
    const actualDamage = Math.max(1, amount - this.config.defense * 0.3);
    this.currentHp = Math.max(0, this.currentHp - actualDamage);

    // Trigger hurt animation
    this.isHurt = true;
    this.play(this.ANIM_HURT, true);

    // Flash effect
    this.setTint(0xFF0000);

    // Show damage number
    this.showDamageNumber(actualDamage);

    // Reset after animation
    this.scene.time.delayedCall(200, () => {
      this.isHurt = false;
      this.clearTint();
      if (this.currentHp > 0) {
        this.play(this.ANIM_IDLE);
      }
    });

    // Update HP bar
    this.updateHpBar();

    // Check for death
    if (this.currentHp <= 0) {
      this.die();
    }

    return actualDamage;
  }

  /**
   * Display floating damage number
   */
  private showDamageNumber(damage: number): void {
    const damageText = this.scene.add.text(
      this.x + Phaser.Math.Between(-20, 20),
      this.y - this.height / 2,
      `-${damage}`,
      {
        fontSize: '24px',
        color: '#FF4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);

    // Animate damage number
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }

  /**
   * Perform attack animation
   */
  public attack(): void {
    if (this.isAttacking || this.isHurt) return;

    this.isAttacking = true;
    this.play(this.ANIM_ATTACK, true);

    // Reset after animation
    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
      this.play(this.ANIM_IDLE);
    });
  }

  /**
   * Handle monster death
   */
  private die(): void {
    // Play death animation
    this.play(this.ANIM_DEATH, true);

    // Fade out
    this.scene.tweens.add({
      targets: [this, this.hpBar, this.hpText],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.hpBar?.destroy();
        this.hpText?.destroy();
        this.destroy();
      }
    });
  }

  /**
   * Check if monster is alive
   */
  public isAlive(): boolean {
    return this.currentHp > 0;
  }

  /**
   * Get HP percentage
   */
  public getHpPercent(): number {
    return this.currentHp / this.maxHp;
  }

  /**
   * Get attack damage
   */
  public getAttackDamage(): number {
    return this.config.attack;
  }

  /**
   * Get reward for defeating this monster
   */
  public getRewards(): { exp: number; gold: number } {
    return {
      exp: this.config.expReward,
      gold: this.config.goldReward
    };
  }

  /**
   * Start idle bobbing animation
   */
  public startIdleAnimation(): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Update monster (called each frame)
   */
  public update(): void {
    // Update HP bar position
    if (this.hpBar && this.hpText) {
      this.updateHpBar();
    }
  }

  /**
   * Reset monster to full health
   */
  public reset(): void {
    this.currentHp = this.maxHp;
    this.setAlpha(1);
    this.play(this.ANIM_IDLE);
    this.updateHpBar();
  }

  /**
   * Cleanup when destroying
   */
  public destroy(): void {
    this.hpBar?.destroy();
    this.hpText?.destroy();
    super.destroy();
  }
}

/**
 * Factory function to create a random monster by difficulty
 */
export function createRandomMonster(
  scene: Phaser.Scene,
  x: number,
  y: number,
  difficulty: MonsterDifficulty
): Monster {
  const monstersByDifficulty: Record<MonsterDifficulty, string[]> = {
    easy: ['slime', 'blob'],
    medium: ['goblin', 'imp'],
    hard: ['orc', 'demon'],
    boss: ['dragon']
  };

  const availableMonsters = monstersByDifficulty[difficulty] || monstersByDifficulty.easy;
  const randomKey = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];

  return new Monster(scene, x, y, randomKey);
}