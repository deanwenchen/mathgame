/**
 * 五彩纸屑效果组件
 * 使用 CSS 和 framer-motion 实现
 * 多彩纸屑从上方飘落，庆祝成功时触发
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

interface ConfettiEffectProps {
  /** 是否显示纸屑效果 */
  isActive: boolean
  /** 纸屑数量 */
  count?: number
  /** 持续时间 (毫秒) */
  duration?: number
  /** 动画结束回调 */
  onComplete?: () => void
}

// 纸屑颜色配置 - 儿童友好的明亮色彩
const CONFETTI_COLORS = [
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#FFE66D', // 黄色
  '#95E1D3', // 薄荷绿
  '#F38181', // 珊瑚红
  '#AA96DA', // 淡紫
  '#FCBAD3', // 粉色
  '#A8D8EA', // 天蓝
] as const

// 纸屑形状
const CONFETTI_SHAPES = ['square', 'circle', 'triangle'] as const

interface ConfettiPieceProps {
  color: string
  shape: typeof CONFETTI_SHAPES[number]
  delay: number
  duration: number
  startPosition: number
}

// 单个纸屑组件
function ConfettiPiece({
  color,
  shape,
  delay,
  duration,
  startPosition,
}: ConfettiPieceProps) {
  // 随机参数
  const xOffset = useMemo(() => (Math.random() - 0.5) * 400, [])
  const rotation = useMemo(() => Math.random() * 720 - 360, [])
  const wobble = useMemo(() => Math.random() * 100 - 50, [])

  // 形状样式
  const shapeStyles = {
    square: 'w-3 h-3 rounded-sm',
    circle: 'w-3 h-3 rounded-full',
    triangle: 'w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent',
  }

  // 三角形特殊处理
  const isTriangle = shape === 'triangle'

  return (
    <motion.div
      initial={{
        x: startPosition,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        x: [startPosition, startPosition + wobble, startPosition + xOffset],
        y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
        rotate: rotation,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
      }}
      className={`absolute top-0 ${!isTriangle ? shapeStyles[shape] : ''}`}
      style={
        isTriangle
          ? {
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: color,
            }
          : { backgroundColor: color }
      }
    />
  )
}

// 爆发型纸屑
function BurstConfetti({ isActive, centerX, centerY }: { isActive: boolean; centerX: number; centerY: number }) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (360 / 20) * i
            const distance = 100 + Math.random() * 100
            const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]

            return (
              <motion.div
                key={i}
                initial={{
                  x: centerX,
                  y: centerY,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: centerX + Math.cos((angle * Math.PI) / 180) * distance,
                  y: centerY + Math.sin((angle * Math.PI) / 180) * distance,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="absolute w-2 h-2 rounded-sm"
                style={{ backgroundColor: color }}
              />
            )
          })}
        </>
      )}
    </AnimatePresence>
  )
}

export function ConfettiEffect({
  isActive,
  count = 50,
  duration = 3000,
  onComplete,
}: ConfettiEffectProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isActive) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isActive, duration, onComplete])

  // 预生成纸屑配置
  const confettiPieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      delay: Math.random() * 500,
      startPosition: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
    }))
  }, [count])

  if (!showConfetti) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          color={piece.color}
          shape={piece.shape}
          delay={piece.delay}
          duration={duration}
          startPosition={piece.startPosition}
        />
      ))}
    </div>
  )
}

// 导出爆发型纸屑组件
export { BurstConfetti }

export default ConfettiEffect