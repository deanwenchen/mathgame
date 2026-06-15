/**
 * 动画配置常量
 * 符合儿童认知特点的动画参数
 */

// 时长配置 (符合儿童认知节奏)
export const DURATION = {
  fast: 0.2,    // 快速反馈
  normal: 0.4,  // 标准动画
  slow: 0.8,    // 缓慢展示
} as const

// 缓动函数
export const EASING = {
  // 弹跳效果 - 活泼有趣，适合儿童
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  // 平滑过渡 - 柔和自然
  smooth: [0.4, 0, 0.2, 1] as const,
  // 弹性效果
  elastic: [0.68, -0.6, 0.32, 1.6] as const,
} as const

// 预设动画变体
export const VARIANTS = {
  // 淡入淡出
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // 缩放
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },

  // 从右侧滑入
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },

  // 弹跳进入
  bounceIn: {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.3, opacity: 0 },
  },

  // 抖动效果 (错误反馈)
  shake: {
    initial: { x: 0 },
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  },

  // 脉冲效果 (正确反馈)
  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 },
    },
  },
} as const

// 按钮悬停效果
export const buttonHover = {
  scale: 1.05,
  y: -4,
  transition: { duration: DURATION.fast },
}

// 按钮点击效果
export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 },
}

// 颜色配置
export const FEEDBACK_COLORS = {
  correct: {
    bg: 'bg-green-500',
    text: 'text-white',
    glow: 'shadow-lg shadow-green-500/50',
  },
  incorrect: {
    bg: 'bg-red-500',
    text: 'text-white',
    glow: 'shadow-lg shadow-red-500/50',
  },
} as const