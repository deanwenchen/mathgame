/**
 * 答题反馈覆盖层
 * 显示正确/错误反馈动画
 * 全屏覆盖层设计，符合儿童卡通风格
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { DURATION, EASING, FEEDBACK_COLORS } from '../../utils/animations'

interface FeedbackOverlayProps {
  /** 是否显示覆盖层 */
  isVisible: boolean
  /** 答案是否正确 */
  isCorrect: boolean
  /** 反馈消息文本 */
  message: string
  /** 自动关闭延迟时间(毫秒)，默认1500ms */
  autoCloseDelay?: number
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 答题反馈覆盖层组件
 *
 * 设计说明：
 * - 正确答案：绿色背景 + 🎉 emoji + 弹跳入场
 * - 错误答案：红色背景 + 💪 emoji + 弹跳入场
 * - 自动消失动画
 * - 全屏覆盖层设计，视觉反馈强烈
 *
 * 教学意义：
 * - 即时反馈增强学习效果（即时反馈原则）
 * - 正向激励设计，错误也给予鼓励（挫折保护）
 * - 视觉化反馈帮助儿童理解结果
 */
export function FeedbackOverlay({
  isVisible,
  isCorrect,
  message,
  autoCloseDelay = 1500,
  onClose,
}: FeedbackOverlayProps) {
  const { t } = useTranslation()
  // 根据正确/错误获取样式配置
  const feedbackStyle = isCorrect ? FEEDBACK_COLORS.correct : FEEDBACK_COLORS.incorrect

  // 弹跳入场动画变体
  const overlayVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: DURATION.fast,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: DURATION.fast,
        ease: 'easeIn',
      },
    },
  }

  // 内容弹跳动画变体
  const contentVariants = {
    initial: {
      scale: 0.3,
      opacity: 0,
      y: 50,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: DURATION.normal,
        ease: EASING.bounce,
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -30,
      transition: {
        duration: DURATION.fast,
        ease: 'easeIn',
      },
    },
  }

  // Emoji 弹跳动画
  const emojiVariants = {
    initial: { scale: 0, rotate: -30 },
    animate: {
      scale: [0, 1.3, 1],
      rotate: [ -30, 10, 0 ],
      transition: {
        duration: DURATION.slow,
        ease: EASING.elastic,
        delay: 0.1,
      },
    },
  }

  // 文字渐入动画
  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DURATION.normal,
        ease: EASING.smooth,
        delay: 0.2,
      },
    },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <motion.div
            className={`absolute inset-0 ${isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 内容区域 */}
          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 text-center px-8 py-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Emoji 图标 */}
            <motion.div
              variants={emojiVariants}
              initial="initial"
              animate="animate"
              className="text-8xl mb-6"
              role="img"
              aria-label={isCorrect ? t('feedback.great') : t('feedback.tryAgain')}
            >
              {isCorrect ? '\u{1F389}' : '\u{1F4AA}'}
            </motion.div>

            {/* 反馈消息 */}
            <motion.h2
              variants={textVariants}
              initial="initial"
              animate="animate"
              className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            >
              {message}
            </motion.h2>

            {/* 鼓励性副标题 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: DURATION.normal }}
              className="text-xl md:text-2xl text-white/90 font-medium"
            >
              {isCorrect ? t('feedback.great') : t('feedback.tryAgain')}
            </motion.p>

            {/* 装饰性星星动画（仅正确答案） */}
            {isCorrect && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: DURATION.normal, ease: EASING.bounce }}
                className="absolute -top-4 -right-4 text-4xl"
              >
                {'\u2B50'}
              </motion.div>
            )}
          </motion.div>

          {/* 装饰性粒子效果 */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-3 h-3 rounded-full ${
                  isCorrect ? 'bg-yellow-300' : 'bg-white'
                }`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  scale: 0,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  scale: [0, 1, 0],
                  rotate: [0, 180],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,
                  ease: 'easeIn',
                  repeat: 1,
                }}
                style={{
                  left: `${10 + i * 15}%`,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FeedbackOverlay