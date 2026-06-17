/**
 * 音效工具 — 使用 Web Audio API 合成简单反馈音效
 *
 * 教学设计（pedagogy.md §4.2 即时反馈）：
 * - 答对：上升音阶（正强化）
 * - 答错：柔和低音（不制造挫败感，符合 §3.4 挫折保护）
 * - 升级：欢快三连音（成就感）
 * - 成就解锁：华丽和弦（里程碑庆祝）
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  delay: number = 0
): void {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = volume
    gain.gain.setValueAtTime(0, ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration)
  } catch {
    /* 静默忽略 */
  }
}

/** 答对 — C5→E5→G5 上升音阶 */
export function playCorrect(): void {
  playTone(523, 0.12, 'sine', 0.25, 0)
  playTone(659, 0.12, 'sine', 0.25, 0.1)
  playTone(784, 0.18, 'sine', 0.3, 0.2)
}

/** 答错 — 柔和低音 */
export function playWrong(): void {
  playTone(220, 0.3, 'triangle', 0.15, 0)
}

/** 升级 — 欢快四连音 */
export function playLevelUp(): void {
  playTone(523, 0.1, 'square', 0.15, 0)
  playTone(659, 0.1, 'square', 0.15, 0.08)
  playTone(784, 0.1, 'square', 0.15, 0.16)
  playTone(1047, 0.2, 'square', 0.2, 0.24)
}

/** 成就解锁 — 华丽和弦 */
export function playAchievement(): void {
  playTone(523, 0.3, 'sine', 0.2, 0)
  playTone(659, 0.3, 'sine', 0.2, 0)
  playTone(784, 0.3, 'sine', 0.2, 0)
  playTone(1047, 0.4, 'sine', 0.25, 0.15)
}

/** 按钮点击 */
export function playClick(): void {
  playTone(800, 0.05, 'sine', 0.1, 0)
}
