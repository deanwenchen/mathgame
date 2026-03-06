/**
 * Boot Scene - Resource Loading
 *
 * Educational Purpose:
 * - Displays loading progress to prepare young learners
 * - Shows educational tips during loading
 * - Ensures smooth game start experience
 */

import Phaser from 'phaser';
import { COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private tipText!: Phaser.GameObjects.Text;

  // Educational tips to display during loading
  private readonly tips: string[] = [
    'Tip: Answering correctly builds your combo!',
    'Tip: Higher combos mean more damage!',
    'Tip: Practice makes perfect!',
    'Tip: Wrong answers help you learn too!',
    'Tip: Keep your HP high to survive longer!'
  ];

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading UI
    this.createLoadingUI();

    // Load placeholder assets (in production, load real sprites)
    this.loadPlaceholderAssets();

    // Simulate loading progress for demonstration
    this.simulateLoading();
  }

  private createLoadingUI(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // Title
    this.add.text(centerX, 100, 'Math Hero Adventure', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(centerX, centerY - 50, 'Loading...', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Progress bar background
    this.add.rectangle(centerX, centerY, 400, 30, 0x333333).setOrigin(0.5);

    // Progress bar fill
    this.progressBar = this.add.graphics();

    // Tip text
    this.tipText = this.add.text(centerX, centerY + 100, '', {
      fontSize: '16px',
      color: '#AAAAAA',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    // Cycle through tips
    let tipIndex = 0;
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        tipIndex = (tipIndex + 1) % this.tips.length;
        this.tipText.setText(this.tips[tipIndex]);
      },
      loop: true
    });
    this.tipText.setText(this.tips[0]);
  }

  private loadPlaceholderAssets(): void {
    // In production, load actual sprite assets here
    // For now, we'll create placeholder graphics

    // Create placeholder player sprite (32x32)
    this.createPlaceholderSprite('player', 0x4A90D9);

    // Create placeholder monster sprites
    this.createPlaceholderSprite('monster_slime', 0x4CAF50);
    this.createPlaceholderSprite('monster_goblin', 0xFFC107);
    this.createPlaceholderSprite('monster_dragon', 0xF44336);

    // Create placeholder UI elements
    this.createPlaceholderSprite('button', 0x7B68EE);
    this.createPlaceholderSprite('heart', 0xF44336);

    // Create button hover state
    this.createPlaceholderSprite('button_hover', 0x9B79EE);
  }

  private createPlaceholderSprite(key: string, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Create a simple colored rectangle as placeholder
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, 32, 32, 4);
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }

  private simulateLoading(): void {
    // Simulate loading progress
    let progress = 0;

    this.time.addEvent({
      delay: 50,
      callback: () => {
        progress += 0.05;

        // Update progress bar
        this.progressBar.clear();
        this.progressBar.fillStyle(COLORS.PRIMARY, 1);
        this.progressBar.fillRect(
          this.cameras.main.centerX - 195,
          this.cameras.main.centerY - 12,
          390 * Math.min(progress, 1),
          24
        );

        // Update loading text
        this.loadingText.setText(
          `Loading... ${Math.floor(Math.min(progress, 1) * 100)}%`
        );

        // When complete, start menu scene
        if (progress >= 1) {
          this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
          });
        }
      },
      repeat: 19
    });
  }

  create(): void {
    // Assets are loaded, transition handled in simulateLoading
  }
}