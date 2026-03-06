/**
 * Menu Scene - Main Menu
 *
 * Educational Purpose:
 * - Entry point for the learning adventure
 * - Displays player progress to motivate continued learning
 * - Provides clear navigation for young users
 */

import Phaser from 'phaser';
import { COLORS, GAME_CONSTANTS } from '../config';
import { gameManager } from '../GameManager';

export class MenuScene extends Phaser.Scene {
  private playerName = 'Young Hero';
  private playerLevel = 1;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // Create decorative elements
    this.createDecorations();

    // Title with animation
    this.createTitle(centerX);

    // Player info panel
    this.createPlayerPanel(centerX);

    // Menu buttons
    this.createMenuButtons(centerX, centerY);

    // Version info
    this.add.text(10, this.cameras.main.height - 20, 'v1.0.0 - Math Hero Adventure', {
      fontSize: '12px',
      color: '#666666'
    });
  }

  private createDecorations(): void {
    // Add floating particles for visual appeal
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_CONSTANTS.WIDTH);
      const y = Phaser.Math.Between(0, GAME_CONSTANTS.HEIGHT);
      const star = this.add.circle(x, y, 2, COLORS.PRIMARY, 0.5);

      // Animate stars
      this.tweens.add({
        targets: star,
        y: y - 100,
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        onRepeat: () => {
          star.setPosition(
            Phaser.Math.Between(0, GAME_CONSTANTS.WIDTH),
            GAME_CONSTANTS.HEIGHT + 10
          );
          star.setAlpha(0.5);
        }
      });
    }
  }

  private createTitle(centerX: number): void {
    const title = this.add.text(centerX, 80, 'Math Hero Adventure', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 130, 'Learn Math Through Battle!', {
      fontSize: '18px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      y: 85,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createPlayerPanel(centerX: number): void {
    const playerState = gameManager.getPlayerState();

    // Panel background
    this.add.rectangle(centerX, 200, 400, 100, COLORS.PANEL)
      .setStrokeStyle(2, COLORS.PRIMARY);

    // Player avatar placeholder
    this.add.rectangle(centerX - 160, 200, 60, 60, COLORS.PRIMARY);

    // Player info
    const displayName = playerState?.name || this.playerName;
    const displayLevel = playerState?.level || this.playerLevel;

    this.add.text(centerX - 100, 175, displayName, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    this.add.text(centerX - 100, 210, `Level ${displayLevel}`, {
      fontSize: '16px',
      color: '#AAAAAA'
    });

    // XP bar
    if (playerState) {
      const xpBarBg = this.add.rectangle(centerX + 50, 220, 200, 10, 0x333333);
      const xpPercent = playerState.exp / playerState.expToNext;
      const xpBar = this.add.rectangle(
        centerX + 50 - 100 + (xpPercent * 100),
        220,
        xpPercent * 200,
        10,
        COLORS.SUCCESS
      ).setOrigin(0.5);

      this.add.text(centerX + 50, 235, `${playerState.exp}/${playerState.expToNext} XP`, {
        fontSize: '12px',
        color: '#888888'
      }).setOrigin(0.5);
    }
  }

  private createMenuButtons(centerX: number, centerY: number): void {
    // Start Battle Button
    this.createButton(centerX, centerY + 50, 'Start Battle', () => {
      // Initialize player if needed
      if (!gameManager.getPlayerState()) {
        gameManager.initPlayerState(this.playerName);
      }
      this.scene.start('BattleScene', { difficulty: 'easy' });
    });

    // Quick Practice Button
    this.createButton(centerX, centerY + 120, 'Quick Practice', () => {
      if (!gameManager.getPlayerState()) {
        gameManager.initPlayerState(this.playerName);
      }
      this.scene.start('BattleScene', { difficulty: 'easy', isPractice: true });
    });

    // Settings Button (placeholder)
    this.createButton(centerX, centerY + 190, 'Settings', () => {
      // TODO: Implement settings scene
      console.log('Settings clicked');
    }, true);

    // Stats display at bottom
    this.createStatsDisplay(centerX, centerY + 270);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    isSecondary = false
  ): void {
    const button = this.add.rectangle(x, y, 250, 50, isSecondary ? 0x444444 : COLORS.PRIMARY)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Hover effects
    button.on('pointerover', () => {
      button.setFill(isSecondary ? 0x555555 : COLORS.SECONDARY);
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setFill(isSecondary ? 0x444444 : COLORS.PRIMARY);
      button.setScale(1);
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1.05);
      callback();
    });
  }

  private createStatsDisplay(x: number, y: number): void {
    const playerState = gameManager.getPlayerState();

    if (!playerState) {
      return;
    }

    const statsBox = this.add.rectangle(x, y, 350, 60, COLORS.PANEL)
      .setStrokeStyle(1, 0x444444);

    // Stats text
    const statsText = `Correct: ${playerState.totalCorrect} | Wrong: ${playerState.totalWrong} | Best Streak: ${playerState.maxStreak}`;
    this.add.text(x, y, statsText, {
      fontSize: '14px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Calculate accuracy
    const total = playerState.totalCorrect + playerState.totalWrong;
    if (total > 0) {
      const accuracy = ((playerState.totalCorrect / total) * 100).toFixed(1);
      this.add.text(x, y + 18, `Accuracy: ${accuracy}%`, {
        fontSize: '12px',
        color: COLORS.SUCCESS
      }).setOrigin(0.5);
    }
  }

  update(): void {
    // Animation updates if needed
  }
}