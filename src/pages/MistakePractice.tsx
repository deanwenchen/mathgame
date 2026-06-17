import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { getMistakes, removeMistake, type MistakeRecord } from '@utils/storage'

/**
 * 错题复习模式
 *
 * 教学设计（pedagogy.md §3 间隔重复 + §4.2 即时反馈）：
 * - 从错题库随机抽题重做，直面薄弱点
 * - 答对 → 标记已掌握，从错题库移除（正强化）
 * - 答错 → 展示正确答案，保留题目继续练习（即时纠正）
 * - 全部掌握后显示庆祝页，激励持续学习
 */

interface PracticeQuestion {
  id: string
  expression: string
  correctAnswer: number
  options: number[]
  knowledgePoint: string
  originalId: string // 对应 MistakeRecord.id
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

const optionVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.04 },
  tap: { scale: 0.97 },
  correct: { scale: 1.06, backgroundColor: '#22c55e', color: '#fff' },
  wrong: { backgroundColor: '#ef4444', color: '#fff' },
  dim: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
}

function generateOptions(correctAnswer: number): number[] {
  const opts = new Set<number>([correctAnswer])
  let attempts = 0
  while (opts.size < 4 && attempts < 30) {
    const offset = Math.floor(Math.random() * 20) - 10
    const wrong = correctAnswer + offset
    if (wrong >= 0 && wrong !== correctAnswer) opts.add(wrong)
    attempts++
  }
  // 保底：确保有 4 个选项
  let fill = 1
  while (opts.size < 4) {
    opts.add(correctAnswer + fill * 5)
    fill++
  }
  return [...opts].sort(() => Math.random() - 0.5)
}

function mistakeToQuestion(m: MistakeRecord): PracticeQuestion {
  return {
    id: `p_${m.id}_${Date.now()}`,
    expression: m.question,
    correctAnswer: m.correctAnswer,
    options: generateOptions(m.correctAnswer),
    knowledgePoint: m.knowledgePoint,
    originalId: m.id,
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function MistakePractice() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const mistakes = getMistakes()
    if (mistakes.length === 0) {
      setFinished(true)
      return
    }
    const qs = shuffleArray(mistakes).map(mistakeToQuestion)
    setQuestions(qs)
  }, [])

  const current = questions[currentIndex]

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null || !current) return
    setSelectedAnswer(answer)
    const correct = answer === current.correctAnswer
    setIsCorrect(correct)

    if (correct) {
      setCorrectCount((c) => c + 1)
      // 答对：从错题库移除（已掌握）
      removeMistake(current.originalId)
    } else {
      setWrongCount((c) => c + 1)
    }

    // 1.5 秒后进入下一题
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setFinished(true)
      } else {
        setCurrentIndex((i) => i + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
      }
    }, 1500)
  }

  // 空题/已完成状态
  if (finished || questions.length === 0) {
    const total = correctCount + wrongCount
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-8 text-center space-y-6"
        >
          <div className="text-6xl">
            {questions.length === 0 ? '📭' : correctCount > wrongCount ? '🎉' : '💪'}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {questions.length === 0
              ? t('mistakes.noMistakes')
              : correctCount > wrongCount
                ? t('feedback.great')
                : t('feedback.keepGoing')}
          </h1>
          <p className="text-gray-500">
            {questions.length === 0
              ? t('mistakes.noMistakesDetail')
              : t('mistakes.practiceSummary', { correct: correctCount, wrong: wrongCount, accuracy })}
          </p>

          {total > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="bg-green-50 rounded-2xl p-3">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-gray-500">{t('mistakes.correctLabel')}</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <div className="text-2xl font-bold text-red-500">{wrongCount}</div>
                <div className="text-xs text-gray-500">{t('mistakes.wrongLabel')}</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-3">
                <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
                <div className="text-xs text-gray-500">{t('mistakes.accuracyLabel')}</div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              to="/mistakes"
              className="block w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              {t('mistakes.back')}
            </Link>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
            >
              {t('mistakes.backToHome')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex flex-col relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/mistakes"
            className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            {t('mistakes.practiceTitle')}
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-green-100 px-3 py-1.5 rounded-full">
              <span className="text-green-700 font-bold text-sm">✓ {correctCount}</span>
            </div>
            <div className="bg-red-100 px-3 py-1.5 rounded-full">
              <span className="text-red-600 font-bold text-sm">✗ {wrongCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="relative z-10 px-6 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              {t('mistakes.questionProgress', { current: currentIndex + 1, total: questions.length })}
            </span>
            <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
              {current.knowledgePoint}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={spring}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-6 md:p-8 space-y-6"
        >
          {/* 题目 */}
          <motion.div
            key={current.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring}
            className="text-center py-4"
          >
            <div className="inline-block bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-600 mb-4">
              {t('mistakes.reviewLabel')}
            </div>
            <h2 className="text-4xl md:text-5xl font-display text-gray-800 tracking-tight">
              {current.expression}
            </h2>
          </motion.div>

          {/* 选项 */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {current.options.map((option) => {
                let variant: string = 'idle'
                if (selectedAnswer !== null) {
                  if (option === current.correctAnswer) variant = 'correct'
                  else if (option === selectedAnswer) variant = 'wrong'
                  else variant = 'dim'
                }
                return (
                  <motion.button
                    key={option}
                    variants={optionVariants}
                    initial="idle"
                    whileHover={selectedAnswer === null ? 'hover' : undefined}
                    whileTap={selectedAnswer === null ? 'tap' : undefined}
                    animate={variant}
                    transition={spring}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={`
                      py-4 px-6 text-2xl font-bold rounded-2xl
                      ${
                        selectedAnswer === null
                          ? 'bg-white border-2 border-orange-200 text-orange-700 hover:border-orange-400 shadow-sm'
                          : ''
                      }
                    `}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* 反馈 */}
          <AnimatePresence>
            {selectedAnswer !== null && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={spring}
                className={`text-center py-4 rounded-2xl ${
                  isCorrect
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                }`}
              >
                <p className="text-lg font-bold">
                  {isCorrect ? t('mistakes.mastered') : t('mistakes.stillLearning')}
                </p>
                {!isCorrect && (
                  <p className="text-sm mt-1 text-red-500">{t('mistakes.correctAnswerLabel')}：{current.correctAnswer}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 退出 */}
          <Link
            to="/mistakes"
            className="block w-full text-center py-3 text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
          >
            {t('mistakes.exitPractice')}
          </Link>
        </motion.div>
      </main>
    </div>
  )
}

export default MistakePractice
