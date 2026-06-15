/**
 * 连击特效组件
 * 显示3连击、5连击、10连击等不同效果
 * 包含文字弹跳、粒子效果和金色闪光
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { DURATION, EASING } from '../../utils/animations'

interface ComboEffectProps {
  /** 当前连击数 */
  combo: number
  /** 是否显示特效 */
  isVisible: boolean
  /** 动画结束后回调 */
  onComplete?: () => void
}

// 连击等级配置
const COMBO_LEVELS = {
  3: {
    label: '不错哦!',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    glow: 'shadow-orange-400/50',
    particles: 8,
    scale: 1.2,
  },
  5: {
    label: '太棒了!',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    glow: 'shadow-purple-400/50',
    particles: 12,
    scale: 1.3,
  },
  10: {
    label: '超神!',
    color: 'text-yellow-500',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    borderColor: 'border-yellow-400',
    glow: 'shadow-yellow-400/60',
    particles: 20,
    scale: 1.5,
  },
} as const

// 粒子组件
interface ParticleProps {
  index: number
  total: number
  color: string
}

function Particle({ index, total, color }: ParticleProps) {
  const angle = (360 / total) * index
  const radius = 60 + Math.random() * 40

  return (
    <motion.div
      initial={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 1,
      }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
        delay: index * 0.02,
      }}
      className={`absolute w-3 h-3 rounded-full ${color}`}
      style={{
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  )
}

// 闪光效果
function Sparkle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180],
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
      className="absolute text-2xl"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    >
      *
    </motion.div>
  )
}

export function ComboEffect({ combo, isVisible, onComplete }: ComboEffectProps) {
  const [showEffect, setShowEffect] = useState(false)

  // 确定连击等级
  const comboLevel = useMemo(() => {
    if (combo >= 10) return 10
    if (combo >= 5) return 5
    if (combo >= 3) return 3
    return null
  }, [combo])

  // 获取配置
  const config = comboLevel ? COMBO_LEVELS[comboLevel as keyof typeof COMBO_LEVELS] : null

  useEffect(() => {
    if (isVisible && comboLevel) {
      setShowEffect(true)
      // 自动关闭
      const timer = setTimeout(() => {
        setShowEffect(false)
        onComplete?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isVisible, comboLevel, onComplete])

  // 粒子颜色映射
  const particleColors: Record<number, string> = {
    3: '#f97316', // orange
    5: '#a855f7', // purple
    10: '#eab308', // yellow/gold
  }

  if (!config || !comboLevel) return null

  return (
    <AnimatePresence>
      {showEffect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* 背景光晕 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.3 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute w-32 h-32 rounded-full ${config.bgColor}`}
          />

          {/* 主容器 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{
              scale: [0.5, config.scale * 1.1, config.scale],
              opacity: 1,
              y: 0,
            }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{
              duration: DURATION.normal,
              ease: EASING.bounce,
            }}
            className={`
              relative px-8 py-6 rounded-2xl border-4
              ${config.bgColor} ${config.borderColor}
              shadow-2xl ${config.glow}
            `}
          >
            {/* 连击数字 */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 15,
              }}
              className={`text-6xl font-bold text-center ${config.color}`}
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {combo}
            </motion.div>

            {/* 连击文字 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl font-bold text-center mt-2 ${config.color}`}
            >
              连击!
            </motion.div>

            {/* 鼓励文字 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-medium text-center mt-1 text-gray-600"
            >
              {config.label}
            </motion.div>

            {/* 粒子效果 */}
            <div className="absolute inset-0 flex items-center justify-center">
              {Array.from({ length: config.particles }).map((_, i) => (
                <Particle
                  key={i}
                  index={i}
                  total={config.particles}
                  color={particleColors[comboLevel]}
                />
              ))}
            </div>

            {/* 闪光效果 (仅10连击) */}
            {comboLevel === 10 && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Sparkle key={i} delay={i * 0.1} />
                ))}
              </>
            )}
          </motion.div>

          {/* 金色闪光边框 (仅10连击) */}
          {comboLevel === 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 opacity-20"
              style={{ mixBlendMode: 'overlay' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ComboEffect