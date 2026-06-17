import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { getDailyChallenge, completeDailyChallenge } from '@utils/storage'
import { playCorrect, playWrong, playLevelUp } from '@utils/sounds'

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

function DailyChallengePage() {
  const { t } = useTranslation()
  const [challenge] = useState(getDailyChallenge())
  const [question, setQuestion] = useState(generateQuestion)
  const [selected, setSelected] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(challenge.completed)

  const handleAnswer = (ans: number) => {
    if (selected !== null || completed) return
    setSelected(ans)
    const correct = ans === question.answer
    if (correct) {
      playCorrect()
      setProgress((p) => p + 1)
      if (progress + 1 >= challenge.target) {
        completeDailyChallenge()
        setCompleted(true)
        playLevelUp()
      }
    } else {
      playWrong()
    }
    setTimeout(() => {
      setQuestion(generateQuestion())
      setSelected(null)
    }, 1000)
  }

  if (completed) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white/80 rounded-3xl border shadow-xl p-8 text-center space-y-6"
        >
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800">{t('dailyChallenge.completed')}</h1>
          <p className="text-lg text-gray-600">{t('dailyChallenge.reward')}</p>
          <Link
            to="/"
            className="block py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full text-lg shadow-lg"
          >
            {t('quiz.back')}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="font-bold text-lg">📅 {t('dailyChallenge.title')}</span>
          <div className="flex gap-2">
            <span className="bg-green-100 px-3 py-1 rounded-full text-sm font-bold text-green-700">
              {progress}/{challenge.target}
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
          <p className="text-center text-sm text-green-600 font-bold">
            {t('dailyChallenge.start')}
          </p>
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
                className="py-4 text-2xl font-bold rounded-2xl bg-white border-2 border-green-200 text-green-700"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default DailyChallengePage
