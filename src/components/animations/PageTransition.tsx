/**
 * 页面入场动画包装器
 * 提供统一的页面切换动画效果
 */

import { motion, AnimatePresence } from 'framer-motion'
import { DURATION, EASING } from '../../utils/animations'

interface PageTransitionProps {
  /** 子组件 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 动画模式 */
  mode?: 'wait' | 'sync' | 'popLayout'
  /** 动画方向 */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  /** 是否启用动画 */
  enabled?: boolean
  /** 唯一标识，用于触发动画切换 */
  pageKey?: string | number
}

/**
 * 页面过渡动画组件
 *
 * 设计说明：
 * - 淡入 + 上移效果
 * - 时长 400ms（符合儿童认知节奏）
 * - 支持多种动画方向
 * - 可复用的页面过渡组件
 *
 * 教学意义：
 * - 平滑过渡减少认知负荷
 * - 动画反馈增强操作感知
 * - 一致的视觉体验提升可用性
 */
export function PageTransition({
  children,
  className = '',
  mode = 'wait',
  direction = 'up',
  enabled = true,
  pageKey,
}: PageTransitionProps) {
  // 根据方向设置初始/结束状态
  const getDirectionVariants = () => {
    switch (direction) {
      case 'up':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        }
      case 'down':
        return {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
        }
      case 'left':
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
        }
      case 'right':
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
        }
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
    }
  }

  const directionVariants = getDirectionVariants()

  // 动画配置
  const transition = {
    duration: DURATION.normal, // 400ms
    ease: EASING.smooth,
  }

  // 如果禁用动画，直接返回子组件
  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  // 如果提供了 pageKey，使用 AnimatePresence 实现切换动画
  if (pageKey !== undefined) {
    return (
      <AnimatePresence mode={mode}>
        <motion.div
          key={pageKey}
          initial={directionVariants.initial}
          animate={directionVariants.animate}
          exit={directionVariants.exit}
          transition={transition}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  // 默认单次入场动画
  return (
    <motion.div
      initial={directionVariants.initial}
      animate={directionVariants.animate}
      exit={directionVariants.exit}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 页面过渡包装器
 * 用于包裹整个页面内容
 */
export function PageWrapper({
  children,
  className = '',
  direction = 'up',
}: Omit<PageTransitionProps, 'mode' | 'enabled' | 'pageKey'>) {
  return (
    <PageTransition className={`min-h-screen ${className}`} direction={direction}>
      {children}
    </PageTransition>
  )
}

export default PageTransition