/**
 * 等级提升庆祝弹窗
 * 全屏庆祝效果，显示新等级
 * 包含粒子/星星效果和五彩纸屑
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { DURATION, EASING } from '../../utils/animations'
import ConfettiEffect from './ConfettiEffect'

interface LevelUpModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 新等级 */
  newLevel: number
  /** 旧等级 */
  previousLevel?: number
  /** 关闭回调 */
  onClose: () => void
  /** 自动关闭延迟 (毫秒)，0 表示不自动关闭 */
  autoCloseDelay?: number
}

// 等级对应的称号
const LEVEL_TITLES: Record<number, string> = {
  1: '算术新手',
  2: '计算小兵',
  3: '数字达人',
  4: '计算能手',
  5: '数学高手',
  6: '算术大师',
  7: '计算专家',
  8: '数学天才',
  9: '算术大师',
  10: '数学王者',
}

// 等级对应的颜色主题
const LEVEL_COLORS: Record<
  number,
  { primary: string; secondary: string; bg: string; glow: string }
> = {
  1: {
    primary: 'text-blue-500',
    secondary: 'text-blue-400',
    bg: 'bg-blue-500',
    glow: 'shadow-blue-400/50',
  },
  2: {
    primary: 'text-green-500',
    secondary: 'text-green-400',
    bg: 'bg-green-500',
    glow: 'shadow-green-400/50',
  },
  3: {
    primary: 'text-teal-500',
    secondary: 'text-teal-400',
    bg: 'bg-teal-500',
    glow: 'shadow-teal-400/50',
  },
  4: {
    primary: 'text-orange-500',
    secondary: 'text-orange-400',
    bg: 'bg-orange-500',
    glow: 'shadow-orange-400/50',
  },
  5: {
    primary: 'text-purple-500',
    secondary: 'text-purple-400',
    bg: 'bg-purple-500',
    glow: 'shadow-purple-400/50',
  },
  6: {
    primary: 'text-pink-500',
    secondary: 'text-pink-400',
    bg: 'bg-pink-500',
    glow: 'shadow-pink-400/50',
  },
  7: {
    primary: 'text-indigo-500',
    secondary: 'text-indigo-400',
    bg: 'bg-indigo-500',
    glow: 'shadow-indigo-400/50',
  },
  8: {
    primary: 'text-cyan-500',
    secondary: 'text-cyan-400',
    bg: 'bg-cyan-500',
    glow: 'shadow-cyan-400/50',
  },
  9: {
    primary: 'text-amber-500',
    secondary: 'text-amber-400',
    bg: 'bg-amber-500',
    glow: 'shadow-amber-400/50',
  },
  10: {
    primary: 'text-yellow-500',
    secondary: 'text-yellow-400',
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    glow: 'shadow-yellow-400/60',
  },
}

// 星星动画组件
function Star({ delay, size = 'md' }: { delay: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        rotate: [0, 180, 360],
        opacity: [0, 1, 1],
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: EASING.bounce,
      }}
      className={`${sizeClasses[size]} text-yellow-400`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </motion.div>
  )
}

// 光环效果
function GlowRing({ level }: { level: number }) {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS[1]

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.5 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`absolute w-64 h-64 rounded-full ${colors.bg} blur-3xl`}
    />
  )
}

// 上升的星星粒子
function RisingStars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 + '%',
            y: '100%',
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            y: '-20%',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: i * 0.15,
            ease: 'easeOut',
          }}
          className="absolute text-yellow-300"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

export function LevelUpModal({
  isOpen,
  newLevel,
  previousLevel,
  onClose,
  autoCloseDelay = 3000,
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const colors = LEVEL_COLORS[newLevel] || LEVEL_COLORS[1]
  const title = LEVEL_TITLES[newLevel] || '算术新手'

  // 触发纸屑效果
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
    }
  }, [isOpen])

  // 自动关闭
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDelay, onClose])

  // 生成等级星星
  const stars = Math.min(newLevel, 5)

  return (
    <>
      {/* 纸屑效果 */}
      <ConfettiEffect isActive={showConfetti} count={60} duration={4000} />

      {/* 弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
          >
            {/* 上升星星背景 */}
            <RisingStars />

            {/* 主弹窗 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -30 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl overflow-hidden"
            >
              {/* 背景光环 */}
              <GlowRing level={newLevel} />

              {/* 内容 */}
              <div className="relative z-10">
                {/* 庆祝标题 */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-700 mb-4"
                >
                  恭喜升级!
                </motion.div>

                {/* 等级数字 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                  }}
                  className={`text-8xl font-bold mb-4 ${colors.primary}`}
                  style={{
                    textShadow: `0 0 30px ${newLevel === 10 ? 'rgba(234, 179, 8, 0.5)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  {newLevel}
                </motion.div>

                {/* 等级称号 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-xl font-bold mb-4 ${colors.secondary}`}
                >
                  {title}
                </motion.div>

                {/* 星星显示 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center gap-2 mb-6"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} delay={0.5 + i * 0.1} size={i < stars ? 'lg' : 'sm'} />
                  ))}
                </motion.div>

                {/* 升级信息 */}
                {previousLevel !== undefined && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-500 text-sm mb-4"
                  >
                    等级 {previousLevel} → 等级 {newLevel}
                  </motion.div>
                )}

                {/* 继续按钮 */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`
                    px-8 py-3 rounded-xl font-bold text-white
                    ${colors.bg} shadow-lg ${colors.glow}
                    transition-all duration-200
                  `}
                >
                  继续挑战!
                </motion.button>
              </div>

              {/* 装饰性边框 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${newLevel === 10 ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.2)'} 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LevelUpModal
