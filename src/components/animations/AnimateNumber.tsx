/**
 * 数字动画组件
 * 分数等数字变化时的动画效果
 *
 * 特性:
 * - 数字变化时弹跳效果
 * - 增加时显示闪光效果
 * - 数字滚动过渡
 *
 * 教学意义: 通过视觉反馈强化学习成就感，符合儿童认知特点
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DURATION, EASING } from '../../utils/animations'

interface AnimateNumberProps {
  /** 当前数值 */
  value: number
  /** 自定义样式 */
  className?: string
  /** 是否显示正号 */
  showPlus?: boolean
  /** 数字字体大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否启用闪光效果 */
  enableSparkle?: boolean
  /** 自定义闪光图标 */
  sparkleIcon?: string
}

// 尺寸映射
const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

// 单个数字组件 - 实现滚动效果
function DigitRoller({ digit, delay }: { digit: string; delay: number }) {
  return (
    <motion.span
      key={digit}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{
        duration: DURATION.fast,
        delay: delay * 0.03,
        ease: EASING.bounce,
      }}
      className="inline-block"
      style={{ minWidth: '0.6em', textAlign: 'center' }}
    >
      {digit}
    </motion.span>
  )
}

// 闪光粒子效果
function SparkleEffect({ show }: { show: boolean }) {
  if (!show) return null

  const sparkles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    angle: (i * 72) * (Math.PI / 180), // 均匀分布
    delay: i * 0.05,
  }))

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className="absolute -top-2 -right-4 pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: DURATION.normal }}
        >
          {sparkles.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className="absolute text-yellow-400 text-sm"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: Math.cos(sparkle.angle) * 15,
                y: Math.sin(sparkle.angle) * 15,
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: sparkle.delay,
                ease: 'easeOut',
              }}
            >
              *
            </motion.span>
          ))}
          <motion.span
            className="text-yellow-400 text-lg"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: 1,
              ease: 'easeInOut',
            }}
          >
            *
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function AnimateNumber({
  value,
  className = '',
  showPlus = false,
  size = 'md',
  enableSparkle = true,
  sparkleIcon = '*',
}: AnimateNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [showSparkle, setShowSparkle] = useState(false)
  const [isIncreasing, setIsIncreasing] = useState(false)
  const isFirstRender = useRef(true)

  // 数值变化时的动画处理
  const animateValueChange = useCallback((newVal: number, oldVal: number) => {
    // 判断是否增加
    const increasing = newVal > oldVal
    setIsIncreasing(increasing)

    // 如果数值增加且启用闪光效果，显示闪光
    if (increasing && enableSparkle) {
      setShowSparkle(true)
      const timer = setTimeout(() => setShowSparkle(false), 800)
      return () => clearTimeout(timer)
    }
  }, [enableSparkle])

  useEffect(() => {
    if (value !== displayValue) {
      // 首次渲染不执行动画
      if (isFirstRender.current) {
        isFirstRender.current = false
        setDisplayValue(value)
        setPrevValue(value)
        return
      }

      setPrevValue(displayValue)

      // 数字滚动过渡
      const steps = Math.min(Math.abs(value - displayValue), 5)
      const stepDuration = 80
      let currentStep = 0

      const animateStep = () => {
        if (currentStep < steps) {
          const progress = currentStep / steps
          const intermediateValue = Math.round(
            displayValue + (value - displayValue) * progress
          )
          setDisplayValue(intermediateValue)
          currentStep++
          setTimeout(animateStep, stepDuration)
        } else {
          setDisplayValue(value)
        }
      }

      animateStep()
      animateValueChange(value, displayValue)
    }
  }, [value, displayValue, animateValueChange])

  // 将数字转换为单个数字数组用于滚动动画
  const valueStr = String(displayValue)
  const digits = valueStr.split('')

  return (
    <span className={`inline-flex items-center relative ${className}`}>
      {/* 弹跳容器 */}
      <motion.span
        animate={{
          scale: isIncreasing ? [1, 1.15, 1] : [1, 0.95, 1],
        }}
        transition={{
          duration: DURATION.normal,
          ease: EASING.bounce,
        }}
        className={`inline-flex items-baseline font-bold ${sizeClasses[size]}`}
      >
        {/* 正号显示 */}
        {showPlus && displayValue > 0 && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-500"
          >
            +
          </motion.span>
        )}

        {/* 数字滚动效果 */}
        <AnimatePresence mode="popLayout">
          {digits.map((digit, index) => (
            <DigitRoller
              key={`${digit}-${index}`}
              digit={digit}
              delay={index}
            />
          ))}
        </AnimatePresence>
      </motion.span>

      {/* 闪光效果 */}
      {enableSparkle && (
        <SparkleEffect show={showSparkle} />
      )}

      {/* 数值增加时的上升动画提示 */}
      <AnimatePresence>
        {isIncreasing && value !== prevValue && (
          <motion.span
            initial={{ opacity: 0, y: 10, x: -5 }}
            animate={{ opacity: 1, y: -15, x: 5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute -top-3 right-0 text-green-500 font-bold text-sm pointer-events-none"
          >
            +{value - prevValue}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export default AnimateNumber