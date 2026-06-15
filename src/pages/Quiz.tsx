import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuizStats, finishQuizGame, getAccuracy, type QuizStats } from '@utils/storage'

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
    case '*':
      const smallNum1 = Math.min(num1, 10)
      const smallNum2 = Math.min(num2, 10)
      expression = `${smallNum1} × ${smallNum2} = ?`
      answer = smallNum1 * smallNum2
      break
    default:
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
  }

  const options: number[] = [answer]
  while (options.length < 4) {
    const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10
    if (wrongAnswer >= 0 && wrongAnswer !== answer && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }

  return { id: Date.now(), expression, answer, options: options.sort(() => Math.random() - 0.5) }
}

const spring = { type: 'spring', stiffness: 300, damping: 20 }
const popIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: spring },
}

// 选项按钮动效配置
const optionVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.04 },
  tap: { scale: 0.97 },
  correct: { scale: 1.06, backgroundColor: '#22c55e', color: '#fff' },
  wrong: { backgroundColor: '#ef4444', color: '#fff' },
  dim: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
}

function Quiz() {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestion(1))
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [stats, setStats] = useState<QuizStats>(() => getQuizStats())
  const [showLevelUp, setShowLevelUp] = useState(false)

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.answer
    setIsCorrect(correct)
    if (correct) {
      setScore((prev) => prev + level * 10)
      setCorrectCount((prev) => prev + 1)
    }
    setTimeout(() => {
      const newCount = questionCount + 1
      setQuestionCount(newCount)
      let newLevel = level
      if (correctCount > 0 && correctCount % 5 === 0) {
        newLevel = Math.min(level + 1, 10)
        setLevel(newLevel)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 2000)
      }
      setCurrentQuestion(generateQuestion(newLevel))
      setSelectedAnswer(null)
      setIsCorrect(null)
    }, 1500)
  }

  const handleRestart = () => {
    if (questionCount > 0) {
      const updated = finishQuizGame({
        score,
        level,
        questions: questionCount,
        correct: correctCount,
      })
      setStats(updated)
    }
    setLevel(1)
    setScore(0)
    setQuestionCount(0)
    setCorrectCount(0)
    setCurrentQuestion(generateQuestion(1))
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex flex-col relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 -left-20 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            算数小能手
          </Link>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-amber-100 px-3 py-1.5 rounded-full flex items-center gap-1"
              title="历史最高分"
            >
              <span className="text-amber-600 font-bold text-sm"> {stats.highScore}</span>
            </motion.div>
            <motion.div
              key={level}
              initial={{ scale: 0.5, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              transition={spring}
              className="bg-purple-100 px-3 py-1.5 rounded-full"
            >
              <span className="text-purple-700 font-bold text-sm">Lv.{level}</span>
            </motion.div>
            <motion.div
              key={score}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3 }}
              className="bg-orange-100 px-3 py-1.5 rounded-full"
            >
              <span className="text-orange-700 font-bold text-sm">{score}分</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* 等级提升庆祝 */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-xl font-bold text-lg"
          >
            🎉 升级到 Lv.{level}！
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-6 md:p-8 space-y-6"
        >
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>
                已答 <span className="font-bold text-gray-700">{questionCount}</span> 题
              </span>
              <span>
                正确 <span className="font-bold text-green-600">{correctCount}</span> · {accuracy}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={spring}
              />
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring}
            className="text-center py-4"
          >
            <h2 className="text-4xl md:text-5xl font-display text-gray-800 tracking-tight">
              {currentQuestion.expression}
            </h2>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {currentQuestion.options.map((option, i) => {
                let variant: string = 'idle'
                if (selectedAnswer !== null) {
                  if (option === currentQuestion.answer) variant = 'correct'
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
                    style={variant !== 'idle' ? {} : {}}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Feedback */}
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
                <p className="text-lg font-bold">{isCorrect ? ' 回答正确！' : ' 再接再厉！'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Restart */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRestart}
            className="w-full py-3 text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
          >
            重新开始
          </motion.button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center text-xs text-gray-400">
          <span>
            累计 {stats.totalGames} 局 · {stats.totalQuestions} 题 · 正确率 {getAccuracy(stats)}%
          </span>
          <span>每答对 5 题自动升级</span>
        </div>
      </footer>
    </div>
  )
}

export default Quiz
