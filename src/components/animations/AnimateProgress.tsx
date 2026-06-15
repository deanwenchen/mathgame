/**
 * 进度条动画组件
 *
 * 特性:
 * - 平滑过渡动画
 * - 可自定义颜色和样式
 * - 可选显示标签
 * - 符合儿童卡通风格
 *
 * 教学意义: 可视化学习进度，帮助孩子建立目标感和成就感
 */

import { motion, AnimatePresence } from 'framer-motion'
import { DURATION, EASING } from '../../utils/animations'

interface AnimateProgressProps {
  /** 当前进度值 */
  value: number
  /** 最大值 */
  max: number
  /** 进度条颜色 */
  color?: ProgressColor
  /** 自定义颜色类名 */
  customColor?: string
  /** 进度条高度 */
  height?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签文本 */
  label?: string
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 是否显示动画条纹 */
  showStripes?: boolean
  /** 是否发光效果 */
  glow?: boolean
  /** 自定义类名 */
  className?: string
  /** 数值变化回调 */
  onValueChange?: (value: number) => void
}

// 预设颜色
type ProgressColor =
  | 'green'   // 正确/成功
  | 'blue'    // 经验值
  | 'yellow'  // 金币
  | 'red'     // 生命值
  | 'purple'  // 魔法值
  | 'orange'  // 连击

// 颜色配置映射
const colorConfig: Record<ProgressColor, {
  bg: string
  glow: string
  text: string
}> = {
  green: {
    bg: 'bg-gradient-to-r from-green-400 to-green-500',
    glow: 'shadow-lg shadow-green-400/50',
    text: 'text-green-600',
  },
  blue: {
    bg: 'bg-gradient-to-r from-blue-400 to-blue-500',
    glow: 'shadow-lg shadow-blue-400/50',
    text: 'text-blue-600',
  },
  yellow: {
    bg: 'bg-gradient-to-r from-yellow-300 to-yellow-400',
    glow: 'shadow-lg shadow-yellow-400/50',
    text: 'text-yellow-600',
  },
  red: {
    bg: 'bg-gradient-to-r from-red-400 to-red-500',
    glow: 'shadow-lg shadow-red-400/50',
    text: 'text-red-600',
  },
  purple: {
    bg: 'bg-gradient-to-r from-purple-400 to-purple-500',
    glow: 'shadow-lg shadow-purple-400/50',
    text: 'text-purple-600',
  },
  orange: {
    bg: 'bg-gradient-to-r from-orange-400 to-orange-500',
    glow: 'shadow-lg shadow-orange-400/50',
    text: 'text-orange-600',
  },
}

// 高度映射
const heightClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
  xl: 'h-6',
}

// 条纹动画背景
function StripesPattern() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-full"
      style={{
        background: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 8px,
          rgba(255, 255, 255, 0.1) 8px,
          rgba(255, 255, 255, 0.1) 16px
        )`,
        animation: 'stripes 1s linear infinite',
      }}
    />
  )
}

// 进度里程碑指示器
function MilestoneIndicators({
  milestones,
  max
}: {
  milestones: number[]
  max: number
}) {
  return (
    <>
      {milestones.map((milestone) => (
        <div
          key={milestone}
          className="absolute top-0 bottom-0 w-0.5 bg-white/30"
          style={{ left: `${(milestone / max) * 100}%` }}
        />
      ))}
    </>
  )
}

export function AnimateProgress({
  value,
  max,
  color = 'green',
  customColor,
  height = 'md',
  showLabel = false,
  label = '',
  showPercentage = false,
  showStripes = false,
  glow = false,
  className = '',
}: AnimateProgressProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const colorStyle = customColor ? null : colorConfig[color]

  // 计算颜色类
  const progressBgClass = customColor || colorStyle?.bg || colorConfig.green.bg
  const progressGlowClass = colorStyle?.glow || ''
  const progressTextClass = colorStyle?.text || 'text-gray-600'

  // 显示里程碑（如 25%, 50%, 75%）
  const milestones = [25, 50, 75].filter(m => m < percentage && m > 0)

  return (
    <div className={`w-full ${className}`}>
      {/* 标签行 */}
      {(showLabel || showPercentage) && (
        <motion.div
          className="flex justify-between items-center mb-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.fast }}
        >
          {showLabel && (
            <span className={`text-sm font-medium ${progressTextClass}`}>
              {label}
            </span>
          )}
          {showPercentage && (
            <motion.span
              className="text-sm font-bold text-gray-600"
              key={percentage}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: DURATION.fast, ease: EASING.bounce }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
          {!showPercentage && (
            <span className="text-sm text-gray-500">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={value}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: DURATION.fast }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
              <span className="mx-0.5">/</span>
              <span>{max}</span>
            </span>
          )}
        </motion.div>
      )}

      {/* 进度条容器 */}
      <div
        className={`
          relative w-full ${heightClasses[height]}
          bg-gray-200 rounded-full overflow-hidden
          ${glow ? 'shadow-inner' : ''}
        `}
      >
        {/* 里程碑指示器 */}
        <MilestoneIndicators milestones={milestones} max={100} />

        {/* 进度条主体 */}
        <motion.div
          className={`
            absolute top-0 left-0 h-full rounded-full
            ${progressBgClass}
            ${glow ? progressGlowClass : ''}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: DURATION.slow,
            ease: EASING.smooth,
          }}
        >
          {/* 条纹动画 */}
          {showStripes && <StripesPattern />}

          {/* 发光边缘效果 */}
          {glow && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  'inset 0 0 10px rgba(255,255,255,0.3)',
                  'inset 0 0 20px rgba(255,255,255,0.5)',
                  'inset 0 0 10px rgba(255,255,255,0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* 进度完成时的闪光效果 */}
        <AnimatePresence>
          {percentage >= 100 && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* CSS 动画样式 */}
      <style>{`
        @keyframes stripes {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 32px 0;
          }
        }
      `}</style>
    </div>
  )
}

export default AnimateProgress