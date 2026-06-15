/**
 * 选项按钮动画
 * 悬停、点击、正确/错误反馈动画
 * 符合儿童卡通风格的生动交互效果
 */

import { motion } from 'framer-motion'
import { DURATION, EASING } from '../../utils/animations'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  isSelected?: boolean
  isCorrect?: boolean
  isIncorrect?: boolean
  className?: string
}

export function AnimatedButton({
  children,
  onClick,
  disabled = false,
  isSelected = false,
  isCorrect = false,
  isIncorrect = false,
  className = '',
}: AnimatedButtonProps) {
  // 基础样式 - 圆润卡通风格
  const baseStyle = 'py-4 px-6 text-2xl font-bold rounded-2xl transition-colors duration-200'

  // 根据状态确定样式
  const getStateStyle = () => {
    if (isCorrect) {
      // 正确状态：绿色背景 + 发光光晕
      return 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] ring-4 ring-green-300/50'
    }
    if (isIncorrect) {
      // 错误状态：红色背景
      return 'bg-red-500 text-white'
    }
    if (disabled) {
      // 禁用状态：灰色不可点击
      return 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }
    // 默认状态：卡通蓝色
    return 'bg-gradient-to-b from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 shadow-md'
  }

  // 抖动动画（错误反馈）- 更明显的左右晃动
  const shakeAnimation = isIncorrect
    ? {
        x: [0, -12, 12, -10, 10, -6, 6, -3, 3, 0],
      }
    : {}

  // 脉冲动画（正确反馈）- 绿色脉冲 + 光晕闪烁
  const pulseAnimation = isCorrect
    ? {
        scale: [1, 1.12, 1.06, 1.1, 1.05],
        boxShadow: [
          '0 0 0px rgba(34, 197, 94, 0.6)',
          '0 0 30px rgba(34, 197, 94, 0.8)',
          '0 0 15px rgba(34, 197, 94, 0.7)',
          '0 0 25px rgba(34, 197, 94, 0.75)',
          '0 0 20px rgba(34, 197, 94, 0.6)',
        ],
      }
    : {}

  // 动画时长配置
  const getTransition = () => {
    if (isIncorrect) {
      // 错误抖动：稍长一点的动画
      return {
        duration: 0.5,
        ease: 'easeInOut' as const,
      }
    }
    if (isCorrect) {
      // 正确脉冲：弹性缓动
      return {
        duration: 0.6,
        ease: EASING.bounce,
      }
    }
    // 默认：快速响应
    return {
      duration: DURATION.fast,
      ease: EASING.smooth,
    }
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        ...shakeAnimation,
        ...pulseAnimation,
      }}
      whileHover={!disabled ? { scale: 1.05, y: -3 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={getTransition()}
      className={`${baseStyle} ${getStateStyle()} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export default AnimatedButton