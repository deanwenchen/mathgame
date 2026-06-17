import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from '@/i18n'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { finishQuizGame, getQuizStats, type QuizStats } from '@utils/storage'
import { playCorrect, playWrong, playLevelUp } from '@utils/sounds'

interface Question {
  id: number
  expression: string
  answer: number
  options: number[]
}

function generateQuestion(level: number): Question {
  const maxNum = level * 10
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1
  const operators = ['+', '-', '*']
  const operator = operators[Math.floor(Math.random() * Math.min(level, 3))]

  let expression: string
  let answer: number

  switch (operator) {
    case '+':
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
      break
    case '-':
      expression = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`
      answer = Math.abs(num1 - num2)
      break
    case '*': {
      const a = Math.min(num1, 10)
      const b = Math.min(num2, 10)
      expression = `${a} × ${b} = ?`
      answer = a * b
      break
    }
    default:
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
  }

  const options: number[] = [answer]
  while (options.length < 4) {
    const wrong = answer + Math.floor(Math.random() * 20) - 10
    if (wrong >= 0 && wrong !== answer && !options.includes(wrong)) options.push(wrong)
  }
  return {
    id: Date.now() + Math.random(),
    expression,
    answer,
    options: options.sort(() => Math.random() - 0.5),
  }
}

const spring = { type: 'spring', stiffness: 300, damping: 20 }
const DURATION_OPTIONS = [30, 60, 90, 120]
const DEFAULT_DURATION = 60

function TimedChallenge() {
  const { t } = useTranslation()
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION)
  const [question, setQuestion] = useState<Question>(() => generateQuestion(1))
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [level, setLevel] = useState(1)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const [stats, setStats] = useState<QuizStats>(() => getQuizStats())

  const handleStart = useCallback(() => {
    setStarted(true)
    setTimeLeft(duration)
    setScore(0)
    setCombo(0)
    setLevel(1)
    setCorrectCount(0)
    setTotalAnswered(0)
    setFinished(false)
    setQuestion(generateQuestion(1))
    setSelected(null)
    setIsCorrect(null)
  }, [duration])

  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setFinished(true)
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [started, timeLeft])

  useEffect(() => {
    if (finished && totalAnswered > 0) {
      const updated = finishQuizGame({
        score,
        level,
        questions: totalAnswered,
        correct: correctCount,
      })
      setStats(updated)
    }
  }, [finished, totalAnswered, score, level, correctCount])

  const handleAnswer = (answer: number) => {
    if (selected !== null || finished) return
    setSelected(answer)
    const correct = answer === question.answer
    setIsCorrect(correct)
    setTotalAnswered((t) => t + 1)

    if (correct) {
      const comboBonus = Math.floor(combo / 3) * 5
      setScore((s) => s + 10 + comboBonus)
      setCorrectCount((c) => c + 1)
      setCombo((c) => c + 1)
      playCorrect()
      if (correctCount > 0 && (correctCount + 1) % 5 === 0) {
        setLevel((l) => Math.min(l + 1, 10))
        playLevelUp()
      }
    } else {
      setCombo(0)
      playWrong()
    }

    setTimeout(() => {
      setQuestion(generateQuestion(level))
      setSelected(null)
      setIsCorrect(null)
    }, 800)
  }

  const timerColor =
    timeLeft > 20 ? 'text-green-600' : timeLeft > 10 ? 'text-amber-600' : 'text-red-600'
  const timerBg =
    timeLeft > 20
      ? 'from-green-400 to-emerald-500'
      : timeLeft > 10
        ? 'from-amber-400 to-orange-500'
        : 'from-red-400 to-rose-500'

  if (!started) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-8 text-center space-y-6"
        >
          <div className="text-6xl">⏱️</div>
          <h1 className="text-3xl font-bold text-gray-800">{t('timed.title')}</h1>
          <p className="text-gray-500">{t('timed.selectDuration')}: {duration}s</p>
          {/* 时长选择 */}
          <div className="flex gap-2 justify-center">
            {DURATION_OPTIONS.map((dur) => (
              <button
                key={dur}
                onClick={() => setDuration(dur)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  duration === dur ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="font-bold text-blue-600">⏱ {duration}s</div>
              <div className="text-xs text-gray-500">{t('timed.title')}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="font-bold text-green-600">🔥 {t('combo.label')}</div>
              <div className="text-xs text-gray-500">{t('quiz.score')}+</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="font-bold text-purple-600">📈 {t('feedback.levelUp')}</div>
              <div className="text-xs text-gray-500">{t('quiz.of')} 5</div>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              {t('timed.start')}
            </button>
            <button
              onClick={() => {
                const text = `⏱️ ${t('timed.title')}: ${duration}s`
                if (navigator.share) navigator.share({ title: t('timed.title'), text })
                else {
                  navigator.clipboard.writeText(text)
                  alert(t('common.confirm'))
                }
              }}
              className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-full text-sm hover:shadow-md transition-all"
            >
              {t('timed.share')}
            </button>
            <Link
              to="/"
              className="block w-full py-3 text-gray-400 hover:text-orange-500 transition-colors text-sm"
            >
              {t('timed.back')}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (finished) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-8 text-center space-y-6"
        >
          <div className="text-6xl">{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👍' : '💪'}</div>
          <h1 className="text-3xl font-bold text-gray-800">{t('timed.timeUp')}</h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-amber-600">{score}</div>
              <div className="text-xs text-gray-500">{t('timed.score')}</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-green-600">
                {correctCount}/{totalAnswered}
              </div>
              <div className="text-xs text-gray-500">{t('quiz.correct')}</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-xs text-gray-500">{t('quiz.correctRate')}</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-blue-600">Lv.{level}</div>
              <div className="text-xs text-gray-500">{t('quiz.level', {level})}</div>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              {t('quiz.playAgain')}
            </button>
            <Link
              to="/"
              className="block w-full py-3 text-gray-400 hover:text-orange-500 transition-colors text-sm"
            >
              {t('timed.back')}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex flex-col relative overflow-hidden">
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-xl"
          >
            {t('timed.title')}
          </Link>
          <div className="flex items-center gap-2">
            {combo >= 3 && (
              <motion.div
                key={combo}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="bg-red-100 px-3 py-1.5 rounded-full"
              >
                <span className="text-red-600 font-bold text-sm">{t('quiz.combo', {count: combo})}</span>
              </motion.div>
            )}
            <div className="bg-orange-100 px-3 py-1.5 rounded-full">
              <span className="text-orange-700 font-bold text-sm">{score} pts</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 px-6 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-3xl font-bold font-mono ${timerColor}`}>{timeLeft}s</span>
            <span className="text-sm text-gray-500">
              Lv.{level} · {t('quiz.question')} {totalAnswered}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${timerBg} rounded-full`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / duration) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          key={question.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-6 md:p-8 space-y-6"
        >
          <div className="text-center py-4">
            <h2 className="text-4xl md:text-5xl font-display text-gray-800 tracking-tight">
              {question.expression}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {question.options.map((option) => {
                let variant = 'idle'
                if (selected !== null) {
                  if (option === question.answer) variant = 'correct'
                  else if (option === selected) variant = 'wrong'
                  else variant = 'dim'
                }
                return (
                  <motion.button
                    key={option}
                    whileHover={selected === null ? { scale: 1.04 } : undefined}
                    whileTap={selected === null ? { scale: 0.97 } : undefined}
                    animate={
                      variant === 'correct'
                        ? { scale: 1.06, backgroundColor: '#22c55e', color: '#fff' }
                        : variant === 'wrong'
                          ? { backgroundColor: '#ef4444', color: '#fff' }
                          : variant === 'dim'
                            ? { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                            : {}
                    }
                    transition={spring}
                    onClick={() => handleAnswer(option)}
                    disabled={selected !== null}
                    className={`py-4 px-6 text-2xl font-bold rounded-2xl ${selected === null ? 'bg-white border-2 border-orange-200 text-orange-700 hover:border-orange-400 shadow-sm' : ''}`}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className={`text-center py-3 rounded-2xl text-lg font-bold ${isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
              >
                {isCorrect ? `✓ +${10 + Math.floor(combo / 3) * 5}` : t('feedback.tryAgain')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}

export default TimedChallenge
