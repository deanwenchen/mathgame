/**
 * Result Scene - Battle Results
 *
 * Educational Purpose:
 * - Provides positive reinforcement for learning
 * - Shows detailed performance metrics
 * - Encourages continued learning through rewards
 */

import Phaser from 'phaser';
import { COLORS } from '../config';
import { gameManager } from '../GameManager';

interface ResultData {
  isVictory: boolean;
  correctAnswers: number;
  totalQuestions: number;
  maxCombo: number;
  rewards: {
    exp: number;
    gold: number;
  };
}

export class ResultScene extends Phaser.Scene {
  private resultData!: ResultData;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData): void {
    this.resultData = data;
  }

  create(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    if (this.resultData.isVictory) {
      this.createVictoryUI(centerX, centerY);
    } else {
      this.createDefeatUI(centerX, centerY);
    }

    // Create buttons
    this.createButtons(centerX, centerY);

    // Particles for victory
    if (this.resultData.isVictory) {
      this.createCelebrationParticles();
    }
  }

  private createVictoryUI(centerX: number, centerY: number): void {
    // Victory title
    const title = this.add.text(centerX, 80, 'Victory!', {
      fontSize: '64px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Bounce animation
    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Stats panel
    this.createStatsPanel(centerX, centerY - 30, true);

    // Rewards panel
    this.createRewardsPanel(centerX, centerY + 100);
  }

  private createDefeatUI(centerX: number, centerY: number): void {
    // Defeat title
    const title = this.add.text(centerX, 80, 'Try Again!', {
      fontSize: '48px',
      color: '#FF6B6B',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Encouraging message
    this.add.text(centerX, 130, 'Keep practicing and you will improve!', {
      fontSize: '18px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Stats panel
    this.createStatsPanel(centerX, centerY - 30, false);

    // Encouragement
    this.createEncouragementPanel(centerX, centerY + 120);
  }

  private createStatsPanel(centerX: number, centerY: number, isVictory: boolean): void {
    // Panel background
    const panel = this.add.rectangle(centerX, centerY, 400, 150, COLORS.PANEL)
      .setStrokeStyle(2, isVictory ? COLORS.SUCCESS : COLORS.WARNING);

    // Stats title
    this.add.text(centerX, centerY - 60, 'Battle Statistics', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Accuracy
    const accuracy = this.resultData.totalQuestions > 0
      ? ((this.resultData.correctAnswers / this.resultData.totalQuestions) * 100).toFixed(1)
      : '0.0';

    // Stats rows
    const stats = [
      { label: 'Correct Answers', value: `${this.resultData.correctAnswers}/${this.resultData.totalQuestions}` },
      { label: 'Accuracy', value: `${accuracy}%` },
      { label: 'Max Combo', value: `${this.resultData.maxCombo}x` }
    ];

    stats.forEach((stat, index) => {
      const y = centerY - 20 + index * 30;
      this.add.text(centerX - 150, y, stat.label, {
        fontSize: '16px',
        color: '#AAAAAA'
      });
      this.add.text(centerX + 150, y, stat.value, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(1, 0);
    });
  }

  private createRewardsPanel(centerX: number, centerY: number): void {
    // Panel background
    const panel = this.add.rectangle(centerX, centerY, 400, 100, 0x1a2a1a)
      .setStrokeStyle(2, COLORS.SUCCESS);

    // Rewards title
    this.add.text(centerX, centerY - 35, 'Rewards Earned!', {
      fontSize: '20px',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Experience
    this.add.text(centerX - 100, centerY + 10, 'EXP', {
      fontSize: '16px',
      color: '#AAAAAA'
    }).setOrigin(0.5);
    this.add.text(centerX - 100, centerY + 35, `+${this.resultData.rewards.exp}`, {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Gold
    this.add.text(centerX + 100, centerY + 10, 'Gold', {
      fontSize: '16px',
      color: '#AAAAAA'
    }).setOrigin(0.5);
    this.add.text(centerX + 100, centerY + 35, `+${this.resultData.rewards.gold}`, {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animate rewards
    this.tweens.add({
      targets: panel,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 300,
      yoyo: true
    });
  }

  private createEncouragementPanel(centerX: number, centerY: number): void {
    // Panel background
    const panel = this.add.rectangle(centerX, centerY, 400, 80, COLORS.PANEL)
      .setStrokeStyle(2, COLORS.WARNING);

    // Tips
    const tips = [
      'Practice makes perfect!',
      'Every mistake is a learning opportunity!',
      'Keep going, you are improving!',
      'Try easier questions to build confidence!'
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    this.add.text(centerX, centerY - 10, 'Tip:', {
      fontSize: '16px',
      color: COLORS.WARNING,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 15, randomTip, {
      fontSize: '14px',
      color: '#AAAAAA',
      wordWrap: { width: 350 },
      align: 'center'
    }).setOrigin(0.5);
  }

  private createButtons(centerX: number, centerY: number): void {
    // Battle Again button
    this.createButton(centerX - 110, centerY + 200, 'Battle Again', () => {
      this.scene.start('BattleScene', { difficulty: 'easy' });
    }, COLORS.PRIMARY);

    // Return to Menu button
    this.createButton(centerX + 110, centerY + 200, 'Main Menu', () => {
      this.scene.start('MenuScene');
    }, 0x555555);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    color: number
  ): void {
    const button = this.add.rectangle(x, y, 180, 50, color)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Hover effects
    button.on('pointerover', () => {
      button.setFill(Phaser.Display.Color.IntegerToColor(color).lighten(20).color);
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setFill(color);
      button.setScale(1);
    });

    button.on('pointerup', callback);
  }

  private createCelebrationParticles(): void {
    // Create simple celebration particles
    const colors = [0xFFD700, 0xFF6B6B, 0x4CAF50, 0x4A90D9];

    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, 800);
      const color = colors[Math.floor(Math.random() * colors.length)];

      const particle = this.add.circle(x, 650, 8, color);

      this.tweens.add({
        targets: particle,
        y: Phaser.Math.Between(100, 300),
        x: x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 500),
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  update(): void {
    // Update animations if needed
  }
}