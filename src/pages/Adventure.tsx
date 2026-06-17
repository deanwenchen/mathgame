import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { playCorrect, playWrong, playLevelUp } from '@utils/sounds'

function generateQuestion(level: number) {
  const maxNum = level * 5 + 10
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1
  const operators = ['+', '-', '*']
  const op = operators[Math.floor(Math.random() * Math.min(level, 3))]
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

function Adventure() {
  const { t } = useTranslation()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [question, setQuestion] = useState(() => generateQuestion(1))
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set())
  const targetQuestions = 5 + currentLevel - 1

  const startLevel = (level: number) => {
    setCurrentLevel(level)
    setPlaying(true)
    setProgress(0)
    setQuestion(generateQuestion(level))
    setSelected(null)
    setCorrect(null)
  }

  const handleAnswer = (ans: number) => {
    if (selected !== null) return
    setSelected(ans)
    const isCorrect = ans === question.answer
    setCorrect(isCorrect)
    if (isCorrect) {
      playCorrect()
      setProgress((p) => p + 1)
    } else {
      playWrong()
    }
    setTimeout(() => {
      if (progress + 1 >= targetQuestions) {
        setCompletedLevels((prev) => new Set(prev).add(currentLevel))
        playLevelUp()
        setPlaying(false)
      } else {
        setQuestion(generateQuestion(currentLevel))
        setSelected(null)
        setCorrect(null)
      }
    }, 1000)
  }

  if (!playing) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🗺️ {t('adventure.level')}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 20 }, (_, i) => {
              const id = i + 1
              const completed = completedLevels.has(id)
              const unlocked = id === 1 || completedLevels.has(id - 1)
              const reward = 10 + i * 5
              return (
                <motion.button
                  key={id}
                  whileHover={unlocked ? { scale: 1.05 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => unlocked && startLevel(id)}
                  disabled={!unlocked}
                  className={`p-4 rounded-2xl border text-center ${completed ? 'bg-green-50 border-green-200' : unlocked ? 'bg-white/80 border-orange-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}
                >
                  <div className="text-2xl mb-1">{completed ? '⭐' : unlocked ? '🔓' : '🔒'}</div>
                  <div className="font-bold text-sm">{t('adventure.level')} {id}</div>
                  <div className="text-xs text-gray-500">{t('adventure.reward')}: {reward}</div>
                </motion.button>
              )
            })}
          </div>
          <Link to="/" className="block mt-6 text-center text-gray-500 hover:text-orange-500">
            {t('quiz.back')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="font-bold text-lg">{t('adventure.level')} {currentLevel}</span>
          <div className="flex gap-2">
            <span className="bg-green-100 px-3 py-1 rounded-full text-sm font-bold text-green-700">
              ✓ {progress}
            </span>
            <span className="bg-orange-100 px-3 py-1 rounded-full text-sm font-bold text-orange-700">
              🎯 {targetQuestions}
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
                className="py-4 text-2xl font-bold rounded-2xl bg-white border-2 border-orange-200 text-orange-700"
              >
                {opt}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {correct !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-3 rounded-2xl font-bold ${correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {correct ? '✓ ✅' : '✗ ❌'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}

export default Adventure
