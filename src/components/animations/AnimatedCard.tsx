/**
 * 题目卡片动画容器
 * 提供题目切换时的入场/退场动画
 * 符合儿童卡通风格的生动过渡效果
 */

import { motion, AnimatePresence } from 'framer-motion'
import { DURATION, EASING } from '../../utils/animations'

interface AnimatedCardProps {
  children: React.ReactNode
  questionId: number | string
  className?: string
}

export function AnimatedCard({ children, questionId, className = '' }: AnimatedCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionId}
        // 入场：从右侧滑入 + 缩放弹入
        initial={{ x: 100, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        // 退场：向左淡出 + 轻微缩小
        exit={{ x: -80, opacity: 0, scale: 0.95 }}
        transition={{
          duration: DURATION.normal, // 400ms
          ease: EASING.bounce, // 弹跳缓动
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedCard