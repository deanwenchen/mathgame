import { useState, useRef, useEffect } from 'react'
import { useTranslation, i18n } from '@/i18n'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getQuizStats,
  finishQuizGame,
  getAccuracy,
  type QuizStats,
  checkAndUnlockAchievements,
  incrementDailyTask,
  type AchievementDef,
  getDailyTask,
  updateKPMastery,
} from '@utils/storage'
import { playCorrect, playWrong, playLevelUp, playAchievement } from '@utils/sounds'

interface Question {
  id: number
  expression: string
  answer: number
  options: number[]
  hint: string
  type: string // 'add' | 'sub' | 'mul'
}

function generateQuestion(level: number): Question {
  const maxNum = level * 10
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1
  const operators = ['+', '-', '*']
  const operator = operators[Math.floor(Math.random() * Math.min(level, 3))]

  let expression: string
  let answer: number
  let hint: string

  switch (operator) {
    case '+':
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
      hint = i18n.t('quiz.hintCounting', { start: num1, n: num2 })
      break
    case '-':
      expression = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`
      answer = Math.abs(num1 - num2)
      hint = i18n.t('quiz.hintCountingBack', { start: Math.max(num1, num2), n: Math.min(num1, num2) })
      break
    case '*':
      const smallNum1 = Math.min(num1, 10)
      const smallNum2 = Math.min(num2, 10)
      expression = `${smallNum1} × ${smallNum2} = ?`
      answer = smallNum1 * smallNum2
      hint = i18n.t('quiz.hintMultiplication', { a: smallNum1, b: smallNum2 })
      break
    default:
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
      hint = i18n.t('quiz.hintCounting', { start: num1, n: num2 })
  }

  const type = operator === '+' ? 'addition' : operator === '-' ? 'subtraction' : 'multiplication'

  const options: number[] = [answer]
  while (options.length < 4) {
    const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10
    if (wrongAnswer >= 0 && wrongAnswer !== answer && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }

  return {
    id: Date.now(),
    expression,
    answer,
    options: options.sort(() => Math.random() - 0.5),
    hint,
    type,
  }
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
  const { t } = useTranslation()
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal')
  const startLevel = difficulty === 'easy' ? 1 : difficulty === 'normal' ? 3 : 6
  const [level, setLevel] = useState(startLevel)
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestion(startLevel))
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [stats, setStats] = useState<QuizStats>(() => getQuizStats())
  const [showLevelUp, setShowLevelUp] = useState(false)
  const streakRef = useRef(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([])
  const [wrongStreak, setWrongStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [comboText, setComboText] = useState('')
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem('mathgame_sound') !== 'off' } catch { return true }
  })

  const playIfOn = (fn: () => void) => { if (soundOn) fn() }

  // 键盘快捷键：1-4 选择选项
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = parseInt(e.key)
      if (key >= 1 && key <= 4 && currentQuestion.options[key - 1] !== undefined) {
        handleAnswer(currentQuestion.options[key - 1])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentQuestion, selectedAnswer])

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.answer
    setIsCorrect(correct)
    updateKPMastery(currentQuestion.type, correct)
    if (correct) {
      setScore((prev) => prev + level * 10)
      setCorrectCount((prev) => prev + 1)
      playIfOn(playCorrect)
      setWrongStreak(0)
      setShowHint(false)
      // 连胜追踪
      streakRef.current += 1
      setBestStreak((best) => Math.max(best, streakRef.current))
      // 连击里程碑提示
      const s = streakRef.current
      if (s === 3) { setComboText(t('combo.3')); setTimeout(() => setComboText(''), 1200) }
      else if (s === 5) { setComboText(t('combo.5')); setScore(p => p + 10); setTimeout(() => setComboText(''), 1200) }
      else if (s === 10) { setComboText(t('combo.10')); setScore(p => p + 30); setTimeout(() => setComboText(''), 1500) }
      else if (s > 10 && s % 10 === 0) { setComboText(t('quiz.combo', {count: s})); setTimeout(() => setComboText(''), 1200) }
    } else {
      playIfOn(playWrong)
      setWrongStreak((prev) => prev + 1)
      streakRef.current = 0
    }
    setTimeout(() => {
      const newCount = questionCount + 1
      setQuestionCount(newCount)
      let newLevel = level
      if (correctCount > 0 && correctCount % 5 === 0) {
        newLevel = Math.min(level + 1, 10)
        setLevel(newLevel)
        setShowLevelUp(true)
        playIfOn(playLevelUp)
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

      // 成就检测
      const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0
      const unlocked = checkAndUnlockAchievements({
        score,
        accuracy,
        totalQuestions: questionCount,
        streak: bestStreak,
      })
      if (unlocked.length > 0) {
        setNewAchievements(unlocked)
        playIfOn(playAchievement)
      }

      // 每日任务递增（按本局答对题数递增）
      for (let n = 0; n < correctCount; n++) {
        incrementDailyTask()
      }
    }
    setLevel(startLevel)
    setScore(0)
    setQuestionCount(0)
    setCorrectCount(0)
    streakRef.current = 0
    setBestStreak(0)
    setCurrentQuestion(generateQuestion(startLevel))
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
            {t('home.title')}
          </Link>
          <div className="flex items-center gap-2">
            {/* 音效开关 */}
            <button
              onClick={() => {
                const next = !soundOn
                setSoundOn(next)
                try { localStorage.setItem('mathgame_sound', next ? 'on' : 'off') } catch {}
              }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
              title={soundOn ? t('quiz.soundOff') : t('quiz.soundOn')}
            >
              {soundOn ? '🔊' : '🔇'}
            </button>
            {/* 难度选择 */}
            <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5">
              {(['easy', 'normal', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); setLevel(d === 'easy' ? 1 : d === 'normal' ? 3 : 6) }}
                  className={`text-[10px] px-2 py-1 rounded-full transition-all ${
                    difficulty === d ? 'bg-white shadow-sm font-bold text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {d === 'easy' ? t('quiz.easy') : d === 'normal' ? t('quiz.medium') : t('quiz.hard')}
                </button>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-amber-100 px-3 py-1.5 rounded-full flex items-center gap-1"
              title={t('home.stats.highScore')}
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
              <span className="text-orange-700 font-bold text-sm">{score} pts</span>
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
            🎉 {t('feedback.levelUp')} Lv.{level}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* 连击提示 */}
      <AnimatePresence>
        {comboText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full shadow-xl font-bold text-base"
          >
            {comboText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成就解锁弹窗 */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setNewAchievements([])}
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={spring}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">🏅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {newAchievements.length === 1
                  ? t('achievement.unlocked')
                  : `${newAchievements.length} ${t('achievement.unlocked')}`}
              </h2>
              <div className="space-y-2 mb-4">
                {newAchievements.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...spring, delay: 0.1 }}
                    className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
                  >
                    <span className="text-3xl">{a.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-amber-700 text-sm">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewAchievements([])}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('common.close')}
                </button>
                <Link
                  to="/achievements"
                  onClick={() => setNewAchievements([])}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all"
                >
                  {t('achievement.title')}
                </Link>
              </div>
            </motion.div>
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
                {t('quiz.question')} <span className="font-bold text-gray-700">{questionCount}</span>
              </span>
              <span>
                {t('quiz.correct')} <span className="font-bold text-green-600">{correctCount}</span> · {accuracy}%
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
                <p className="text-lg font-bold">{isCorrect ? t('feedback.great') : t('feedback.tryAgain')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 提示按钮（连续答错 2 题后显示） */}
          {wrongStreak >= 2 && !showHint && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHint(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 font-bold rounded-2xl border border-blue-200 hover:shadow-md transition-all"
            >
              {t('quiz.hint')}
            </motion.button>
          )}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center"
            >
              <p className="text-blue-700 text-sm">💡 {currentQuestion.hint}</p>
            </motion.div>
          )}

          {/* Restart & Share */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const text = `🎯 ${t('home.title')}: ${t('quiz.correct')} ${correctCount}, ${t('quiz.score')} ${score}!`
                if (navigator.share) navigator.share({ title: t('home.title'), text })
                else { navigator.clipboard.writeText(text); alert(t('common.confirm')) }
              }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 font-bold rounded-full text-sm hover:shadow-md transition-all"
            >
              {t('quiz.share')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRestart}
              className="flex-1 py-3 text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
            >
              {t('quiz.playAgain')}
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center text-xs text-gray-400">
          <span>
            {t('home.stats.summary', {games: stats.totalGames, questions: stats.totalQuestions})} · {t('home.stats.accuracy')} {getAccuracy(stats)}%
          </span>
          <span className="text-green-600">
            {t('home.daily.todayGoal')} {getDailyTask().questionsCompleted}/{getDailyTask().targetQuestions}
          </span>
          <span>{t('feedback.levelUp')}</span>
        </div>
      </footer>
    </div>
  )
}

export default Quiz
