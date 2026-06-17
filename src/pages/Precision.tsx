import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { playCorrect, playWrong } from '@utils/sounds'

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

function generateQuestion() {
  const level = Math.floor(Math.random() * 5) + 1
  const maxNum = level * 10
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1
  const ops = ['+', '-', '*']
  const op = ops[Math.floor(Math.random() * 3)]
  let expr: string, answer: number
  switch (op) {
    case '+':
      expr = `${num1} + ${num2}`
      answer = num1 + num2
      break
    case '-':
      expr = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`
      answer = Math.abs(num1 - num2)
      break
    default: {
      const a = Math.min(num1, 10),
        b = Math.min(num2, 10)
      expr = `${a} × ${b}`
      answer = a * b
    }
  }
  const opts = new Set([answer])
  while (opts.size < 4) {
    const w = answer + Math.floor(Math.random() * 20) - 10
    if (w >= 0 && w !== answer) opts.add(w)
  }
  return { expr: expr + ' = ?', answer, options: [...opts].sort(() => Math.random() - 0.5) }
}

function Precision() {
  const { t } = useTranslation()
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [question, setQuestion] = useState(generateQuestion)
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const handleAnswer = (ans: number) => {
    if (selected !== null || gameOver) return
    setSelected(ans)
    const correct = ans === question.answer
    setIsCorrect(correct)
    if (correct) {
      playCorrect()
      setScore((s) => s + 10 + streak * 2)
      setStreak((s) => {
        const next = s + 1
        setBestStreak((b) => Math.max(b, next))
        return next
      })
      setTimeout(() => {
        setQuestion(generateQuestion())
        setSelected(null)
        setIsCorrect(null)
      }, 800)
    } else {
      playWrong()
      setGameOver(true)
    }
  }

  const restart = () => {
    setScore(0)
    setStreak(0)
    setQuestion(generateQuestion())
    setSelected(null)
    setIsCorrect(null)
    setGameOver(false)
  }

  if (gameOver) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white/80 rounded-3xl border shadow-xl p-8 text-center space-y-6"
        >
          <div className="text-6xl">🎯</div>
          <h1 className="text-3xl font-bold text-gray-800">{t('precision.gameOver')}</h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-xs text-gray-500">{t('precision.score')}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-purple-600">{bestStreak}</div>
              <div className="text-xs text-gray-500">🔥</div>
            </div>
          </div>
          <button
            onClick={restart}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full text-lg shadow-lg"
          >
            {t('quiz.playAgain')}
          </button>
          <Link to="/" className="block text-gray-400 hover:text-blue-500">
            {t('quiz.back')}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="font-bold text-lg">🎯 {t('precision.title')}</span>
          <div className="flex gap-2">
            <span className="bg-purple-100 px-3 py-1 rounded-full text-sm font-bold text-purple-700">
              🔥 {streak}
            </span>
            <span className="bg-blue-100 px-3 py-1 rounded-full text-sm font-bold text-blue-700">
              {t('precision.score')}: {score}
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          key={question.expr}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-white/80 rounded-3xl border shadow-xl p-8 space-y-6"
        >
          <p className="text-center text-sm text-gray-500">{t('precision.gameOver')}</p>
          <h2 className="text-4xl font-bold text-center text-gray-800">{question.expr}</h2>
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt) => (
              <motion.button
                key={opt}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                animate={
                  selected !== null
                    ? opt === question.answer
                      ? { backgroundColor: '#22c55e', color: '#fff' }
                      : opt === selected
                        ? { backgroundColor: '#ef4444', color: '#fff' }
                        : {}
                    : {}
                }
                onClick={() => handleAnswer(opt)}
                disabled={selected !== null}
                className="py-4 text-2xl font-bold rounded-2xl bg-white border-2 border-blue-200 text-blue-700"
              >
                {opt}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-3 rounded-2xl font-bold ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {isCorrect ? `✓ +${10 + (streak - 1) * 2}` : t('precision.wrong')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}

export default Precision
