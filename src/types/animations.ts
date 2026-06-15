/**
 * 动画类型定义
 */

import type { Variants, Transition } from 'framer-motion'

// 动画时长类型
export type AnimationDuration = 'fast' | 'normal' | 'slow'

// 动画缓动类型
export type AnimationEasing = 'bounce' | 'smooth' | 'elastic'

// 反馈状态
export type FeedbackState = 'correct' | 'incorrect' | null

// 动画配置接口
export interface AnimationConfig {
  duration: number
  ease: number[] | string
}

// 按钮动画属性
export interface ButtonAnimationProps {
  isDisabled?: boolean
  isSelected?: boolean
  isCorrect?: boolean
  isIncorrect?: boolean
  onClick?: () => void
}

// 卡片动画属性
export interface CardAnimationProps {
  key: string | number
  onAnimationComplete?: () => void
}

// 反馈覆盖层属性
export interface FeedbackOverlayProps {
  isVisible: boolean
  isCorrect: boolean
  message: string
  onClose?: () => void
}

// 连击效果属性
export interface ComboEffectProps {
  combo: number
  isVisible: boolean
}

// 等级提升庆祝属性
export interface LevelUpCelebrationProps {
  isVisible: boolean
  newLevel: number
  onComplete?: () => void
}

// 进度条动画属性
export interface AnimatedProgressProps {
  value: number
  max: number
  color?: string
}

// 数字动画属性
export interface AnimateNumberProps {
  value: number
  duration?: number
  className?: string
}