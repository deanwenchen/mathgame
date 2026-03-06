/**
 * Battle Scene - Core Gameplay
 *
 * Educational Purpose:
 * - Main learning interaction point
 * - Integrates math questions with battle mechanics
 * - Provides immediate feedback for answers
 * - Tracks learning progress through gameplay
 */

import Phaser from 'phaser';
import { COLORS, GAME_CONSTANTS } from '../config';
import { gameManager, BattleState } from '../GameManager';

interface Question {
  text: string;
  answer: number;
  options: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export class BattleScene extends Phaser.Scene {
  // Game state
  private battleState!: BattleState;
  private currentQuestion: Question | null = null;
  private answerButtons: Phaser.GameObjects.Container[] = [];
  private isAnswered = false;

  // UI Elements
  private enemySprite!: Phaser.GameObjects.Sprite;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private questionText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  // Timers
  private questionTimer!: Phaser.Time.TimerEvent;
  private timerGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { difficulty?: string; isPractice?: boolean }): void {
    // Initialize battle state
    const enemyName = this.getEnemyName(data.difficulty || 'easy');
    const enemyHp = this.getEnemyHp(data.difficulty || 'easy');

    this.battleState = gameManager.initBattleState(enemyName, enemyHp);
  }

  private getEnemyName(difficulty: string): string {
    const names: Record<string, string[]> = {
      easy: ['Slime', 'Blob', 'Jelly'],
      medium: ['Goblin', 'Imp', 'Gremlin'],
      hard: ['Dragon', 'Demon', 'Boss']
    };
    const list = names[difficulty] || names.easy;
    return list[Math.floor(Math.random() * list.length)];
  }

  private getEnemyHp(difficulty: string): number {
    const hp: Record<string, number> = {
      easy: 50,
      medium: 80,
      hard: 120
    };
    return hp[difficulty] || hp.easy;
  }

  create(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // Create battle UI
    this.createBattleUI(centerX, centerY);

    // Create enemy
    this.createEnemy(centerX, centerY - 50);

    // Create player info
    this.createPlayerInfo();

    // Generate first question
    this.generateQuestion();

    // Create question UI
    this.createQuestionUI(centerX, centerY);

    // Start battle
    this.startQuestionTimer();
  }

  private createBattleUI(centerX: number, _centerY: number): void {
    // Battle title
    this.add.text(centerX, 30, `Battle: ${this.battleState.enemyName}`, {
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Combo display
    this.comboText = this.add.text(centerX, 60, '', {
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Timer graphics
    this.timerGraphics = this.add.graphics();
  }

  private createEnemy(centerX: number, centerY: number): void {
    // Enemy sprite placeholder
    this.enemySprite = this.add.sprite(centerX, centerY, 'monster_slime', 0);
    this.enemySprite.setScale(3);

    // Enemy HP bar
    this.enemyHpBar = this.add.graphics();
    this.updateEnemyHpBar(centerX, centerY + 80);

    // Enemy HP text
    this.add.text(centerX, centerY + 110, `${this.battleState.enemyName}`, {
      fontSize: '16px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Idle animation
    this.tweens.add({
      targets: this.enemySprite,
      y: centerY - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private updateEnemyHpBar(x: number, y: number): void {
    this.enemyHpBar.clear();

    // Background
    this.enemyHpBar.fillStyle(0x333333, 1);
    this.enemyHpBar.fillRect(x - 75, y - 10, 150, 20);

    // HP fill
    const hpPercent = this.battleState.enemyHp / this.battleState.enemyMaxHp;
    const hpColor = hpPercent > 0.5 ? COLORS.SUCCESS : hpPercent > 0.25 ? COLORS.WARNING : COLORS.DANGER;
    this.enemyHpBar.fillStyle(hpColor, 1);
    this.enemyHpBar.fillRect(x - 73, y - 8, 146 * hpPercent, 16);
  }

  private createPlayerInfo(): void {
    const playerState = gameManager.getPlayerState();
    if (!playerState) return;

    const x = 100;
    const y = 50;

    // Player panel
    this.add.rectangle(x, y, 160, 60, COLORS.PANEL)
      .setStrokeStyle(2, COLORS.PRIMARY);

    // Player name and level
    this.add.text(x, y - 15, `${playerState.name} Lv.${playerState.level}`, {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Player HP bar
    this.playerHpBar = this.add.graphics();
    this.updatePlayerHpBar(x, y + 15);
  }

  private updatePlayerHpBar(x: number, y: number): void {
    const playerState = gameManager.getPlayerState();
    if (!playerState) return;

    this.playerHpBar.clear();

    // Background
    this.playerHpBar.fillStyle(0x333333, 1);
    this.playerHpBar.fillRect(x - 60, y - 8, 120, 16);

    // HP fill
    const hpPercent = playerState.hp / playerState.maxHp;
    const hpColor = hpPercent > 0.5 ? COLORS.SUCCESS : hpPercent > 0.25 ? COLORS.WARNING : COLORS.DANGER;
    this.playerHpBar.fillStyle(hpColor, 1);
    this.playerHpBar.fillRect(x - 58, y - 6, 116 * hpPercent, 12);

    // HP text
    this.playerHpBar.fillStyle(0xFFFFFF, 1);
    // Text handled separately
  }

  private generateQuestion(): void {
    // Generate a math question based on difficulty
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let a: number, b: number, answer: number;

    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 20) + 10;
        b = Math.floor(Math.random() * Math.min(a, 10)) + 1;
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        answer = a * b;
        break;
      default:
        a = 1;
        b = 1;
        answer = 2;
    }

    const questionText = `${a} ${operation} ${b} = ?`;

    // Generate wrong options
    const options = this.generateOptions(answer);

    this.currentQuestion = {
      text: questionText,
      answer,
      options,
      difficulty: 'easy'
    };
  }

  private generateOptions(correctAnswer: number): number[] {
    const options = [correctAnswer];
    const range = 10;

    while (options.length < 4) {
      // Generate plausible wrong answers
      const offset = Math.floor(Math.random() * range) - range / 2;
      const wrongAnswer = correctAnswer + (offset === 0 ? 1 : offset);

      if (!options.includes(wrongAnswer) && wrongAnswer >= 0) {
        options.push(wrongAnswer);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }

  private createQuestionUI(centerX: number, centerY: number): void {
    // Question panel
    const questionY = centerY + 150;

    // Question box
    this.add.rectangle(centerX, questionY, 500, 200, COLORS.PANEL)
      .setStrokeStyle(2, COLORS.PRIMARY);

    // Question text
    this.questionText = this.add.text(centerX, questionY - 60, this.currentQuestion?.text || '', {
      fontSize: '36px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Answer buttons
    this.createAnswerButtons(centerX, questionY + 20);

    // Feedback text
    this.feedbackText = this.add.text(centerX, questionY + 100, '', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createAnswerButtons(centerX: number, y: number): void {
    if (!this.currentQuestion) return;

    // Clear existing buttons
    this.answerButtons.forEach(btn => btn.destroy());
    this.answerButtons = [];

    const buttonWidth = 100;
    const buttonHeight = 50;
    const spacing = 20;
    const startX = centerX - (2 * buttonWidth + 1.5 * spacing);

    this.currentQuestion.options.forEach((option, index) => {
      const buttonX = startX + (index % 2) * (buttonWidth + spacing) + buttonWidth / 2;
      const buttonY = y + Math.floor(index / 2) * (buttonHeight + spacing);

      const container = this.add.container(buttonX, buttonY);

      const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, COLORS.PRIMARY);
      const text = this.add.text(0, 0, String(option), {
        fontSize: '24px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setSize(buttonWidth, buttonHeight);
      container.setInteractive({ useHandCursor: true });

      // Button interactions
      container.on('pointerover', () => {
        bg.setFillStyle(COLORS.SECONDARY);
      });

      container.on('pointerout', () => {
        bg.setFillStyle(COLORS.PRIMARY);
      });

      container.on('pointerdown', () => {
        if (!this.isAnswered) {
          this.handleAnswer(option);
        }
      });

      this.answerButtons.push(container);
    });
  }

  private startQuestionTimer(): void {
    let timeLeft = GAME_CONSTANTS.ANSWER_TIME_LIMIT;
    const centerX = this.cameras.main.centerX;

    this.questionTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        timeLeft -= 100;

        // Update timer display
        this.timerGraphics.clear();
        const timerWidth = 400 * (timeLeft / GAME_CONSTANTS.ANSWER_TIME_LIMIT);
        const timerColor = timeLeft > 10000 ? COLORS.PRIMARY :
          timeLeft > 5000 ? COLORS.WARNING : COLORS.DANGER;

        this.timerGraphics.fillStyle(0x333333, 1);
        this.timerGraphics.fillRect(centerX - 200, 90, 400, 10);
        this.timerGraphics.fillStyle(timerColor, 1);
        this.timerGraphics.fillRect(centerX - 200, 90, timerWidth, 10);

        if (timeLeft <= 0 && !this.isAnswered) {
          this.handleTimeout();
        }
      },
      repeat: GAME_CONSTANTS.ANSWER_TIME_LIMIT / 100 - 1
    });
  }

  private handleAnswer(selectedAnswer: number): void {
    if (!this.currentQuestion || this.isAnswered) return;

    this.isAnswered = true;
    this.questionTimer.destroy();

    const isCorrect = selectedAnswer === this.currentQuestion.answer;
    const result = gameManager.processAnswer(isCorrect);

    // Show feedback
    this.showFeedback(isCorrect, result.damage);

    // Animate result
    if (isCorrect) {
      this.animateCorrectAnswer(result.damage);
    } else {
      this.animateWrongAnswer();
    }

    // Update UI
    this.updateBattleUI();

    // Check for battle end
    this.time.delayedCall(1000, () => {
      if (result.isDefeated) {
        this.endBattle();
      } else {
        this.nextQuestion();
      }
    });
  }

  private handleTimeout(): void {
    this.isAnswered = true;
    this.questionTimer.destroy();

    const result = gameManager.processAnswer(false);
    this.showFeedback(false, 0);
    this.animateWrongAnswer();
    this.updateBattleUI();

    this.time.delayedCall(1000, () => {
      if (result.isDefeated) {
        this.endBattle();
      } else {
        this.nextQuestion();
      }
    });
  }

  private showFeedback(isCorrect: boolean, damage: number): void {
    if (isCorrect) {
      this.feedbackText.setText(`Correct! -${damage} HP`);
      this.feedbackText.setColor('#4CAF50');
    } else {
      this.feedbackText.setText(`Wrong! The answer was ${this.currentQuestion?.answer}`);
      this.feedbackText.setColor('#F44336');
    }

    // Fade out feedback
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 800,
      delay: 200
    });
  }

  private animateCorrectAnswer(damage: number): void {
    // Flash enemy
    this.enemySprite.setTint(0xFF0000);
    this.time.delayedCall(100, () => {
      this.enemySprite.clearTint();
    });

    // Shake effect
    this.cameras.main.shake(100, 0.01);

    // Damage number
    const damageText = this.add.text(
      this.enemySprite.x,
      this.enemySprite.y - 50,
      `-${damage}`,
      {
        fontSize: '32px',
        color: '#FF4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
    });
  }

  private animateWrongAnswer(): void {
    // Player takes damage - screen flash red
    this.cameras.main.flash(200, 255, 0, 0);
  }

  private updateBattleUI(): void {
    const centerX = this.cameras.main.centerX;

    // Update enemy HP
    this.updateEnemyHpBar(centerX, this.enemySprite.y + 80);

    // Update player HP
    const playerState = gameManager.getPlayerState();
    if (playerState) {
      this.updatePlayerHpBar(100, 65);
    }

    // Update combo
    if (this.battleState.currentCombo > 1) {
      this.comboText.setText(`${this.battleState.currentCombo}x Combo!`);
      this.tweens.add({
        targets: this.comboText,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    } else {
      this.comboText.setText('');
    }
  }

  private nextQuestion(): void {
    this.isAnswered = false;
    this.feedbackText.setAlpha(1);
    this.feedbackText.setText('');

    // Generate new question
    this.generateQuestion();
    this.questionText.setText(this.currentQuestion?.text || '');

    // Recreate answer buttons
    this.createAnswerButtons(this.cameras.main.centerX, this.cameras.main.centerY + 170);

    // Restart timer
    this.startQuestionTimer();
  }

  private endBattle(): void {
    this.questionTimer.destroy();

    // Calculate rewards
    const rewards = gameManager.calculateRewards();

    // Transition to result scene
    this.scene.start('ResultScene', {
      isVictory: this.battleState.isVictory,
      correctAnswers: this.battleState.correctAnswers,
      totalQuestions: this.battleState.questionsAnswered,
      maxCombo: this.battleState.maxCombo,
      rewards
    });
  }

  update(): void {
    // Update animations if needed
  }
}