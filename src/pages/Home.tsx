import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation, LANGUAGES } from '@/i18n'
import {
  getQuizStats,
  getAccuracy,
  type QuizStats,
  getDailyTask,
  claimDailyReward,
  setDailyTarget,
  type DailyTask,
  getAchievements,
  ACHIEVEMENTS,
  checkInLearning,
  getMistakes,
  getTheme,
  setTheme,
  THEME_GRADIENTS,
  type Theme,
} from '@utils/storage'
import {
  getCurrentUser,
  login,
  register,
  logout,
  saveCurrentUser,
  loadProgress,
  saveProgress,
  type User,
} from '@utils/api'

// Spring animation config
const springTransition = { type: 'spring', stiffness: 300, damping: 20 }
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springTransition },
}

function Home() {
  const { t, i18n } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [user, setUser] = useState<User | null>(() => getCurrentUser())
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [authMsg, setAuthMsg] = useState('')
  const [syncMsg, setSyncMsg] = useState('')
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null)
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [learningDays, setLearningDays] = useState(0)
  const [mistakeCount, setMistakeCount] = useState(0)
  const [theme, setThemeState] = useState<Theme>(getTheme())
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('mathgame_dark_mode') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    setStats(getQuizStats())
    setDailyTask(getDailyTask())
    setUnlockedCount(getAchievements().length)
    const streak = checkInLearning()
    setLearningDays(streak.count)
    setMistakeCount(getMistakes().length)
  }, [])

  const handleAuth = async () => {
    setAuthMsg('')
    if (!username.trim()) {
      setAuthMsg(t('home.auth.usernameRequired'))
      return
    }
    if (authMode === 'register') {
      const res = await register(username, nickname || username)
      if (res.success && res.data?.user) {
        saveCurrentUser(res.data.user)
        setUser(res.data.user)
        setAuthMsg(t('home.auth.registerSuccess'))
        setShowAuth(false)
      } else {
        setAuthMsg(res.error || t('home.auth.registerFailed'))
      }
    } else {
      const res = await login(username)
      if (res.success && res.data?.user) {
        saveCurrentUser(res.data.user)
        setUser(res.data.user)
        setAuthMsg(t('home.auth.loginSuccess'))
        setShowAuth(false)
      } else {
        setAuthMsg(res.error || t('home.auth.loginFailed'))
      }
    }
  }

  const handleSync = async () => {
    if (!user) return
    setSyncMsg(t('home.auth.syncing'))
    const localStats = getQuizStats()
    const res = await saveProgress(user.id, {
      high_score: localStats.highScore,
      total_games: localStats.totalGames,
      total_questions: localStats.totalQuestions,
      total_correct: localStats.totalCorrect,
      best_level: localStats.bestLevel,
      updated_at: new Date().toISOString(),
    })
    setSyncMsg(res.success ? t('home.auth.synced') : `❌ ${res.error}`)
  }

  const handleLoad = async () => {
    if (!user) return
    setSyncMsg(t('home.auth.loading'))
    const res = await loadProgress(user.id)
    if (res.success && res.data) {
      setSyncMsg(
        `${t('home.auth.cloudData')}: ${t('home.stats.highScore')} ${res.data.high_score}, ${res.data.total_games} ${t('home.stats.games')}`,
      )
    } else {
      setSyncMsg(t('home.auth.noCloudData'))
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setSyncMsg('')
  }

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    try {
      localStorage.setItem('mathgame_dark_mode', String(next))
    } catch {}
  }

  const changeLang = (code: string) => {
    i18n.changeLanguage(code)
    setLangOpen(false)
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language?.slice(0, 2)) || LANGUAGES[0]

  return (
    <div
      className={`min-h-[100dvh] relative overflow-hidden bg-gradient-to-br ${THEME_GRADIENTS[theme]}`}
    >
      {/* Theme selector */}
      <div className="fixed top-4 left-4 z-50 flex gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
        {(['default', 'ocean', 'forest', 'candy'] as Theme[]).map((themeKey) => (
          <button
            key={themeKey}
            onClick={() => {
              setThemeState(themeKey)
              setTheme(themeKey)
            }}
            className={`w-6 h-6 rounded-full transition-all ${theme === themeKey ? 'ring-2 ring-offset-1 ring-orange-400' : ''}`}
            style={{
              background:
                themeKey === 'default'
                  ? '#fbbf24'
                  : themeKey === 'ocean'
                    ? '#3b82f6'
                    : themeKey === 'forest'
                      ? '#22c55e'
                      : '#ec4899',
            }}
            title={t(`home.theme.${themeKey}`)}
          />
        ))}
      </div>

      {/* Language switcher — modern dropdown */}
      <div className="fixed top-4 right-16 z-50" onBlur={() => setTimeout(() => setLangOpen(false), 200)}>
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-sm shadow-md hover:shadow-lg transition-all"
        >
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline font-medium">{currentLang.name}</span>
          <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {langOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl py-2 min-w-[180px] max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors text-left ${
                  i18n.language?.slice(0, 2) === lang.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {i18n.language?.slice(0, 2) === lang.code && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md flex items-center justify-center text-lg hover:scale-110 transition-transform"
        title={darkMode ? t('home.lightMode') : t('home.darkMode')}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!darkMode && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/3 -left-16 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
            />
          </>
        )}
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center p-6 md:p-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-lg w-full space-y-6"
        >
          {/* Title */}
          <motion.div variants={fadeUp} className="text-center">
            <motion.h1
              className={`text-5xl md:text-7xl font-display mb-3 ${darkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500'}`}
              whileHover={{ scale: 1.02 }}
              transition={springTransition}
            >
              {t('home.title')}
            </motion.h1>
            <p
              className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {t('home.subtitle')}
            </p>
          </motion.div>

          {/* Learning streak */}
          {learningDays > 0 && (
            <motion.div variants={fadeUp} className="text-center">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-orange-200/50">
                🔥 {t('home.streak', { count: learningDays })}
              </span>
            </motion.div>
          )}

          {/* User status */}
          {user ? (
            <motion.div
              variants={fadeUp}
              className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-purple-700 font-bold">👤 {user.nickname}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  {t('home.auth.logout')}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  className="flex-1 text-xs py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-md transition-all active:scale-[0.98]"
                >
                  ☁️ {t('home.auth.upload')}
                </button>
                <button
                  onClick={handleLoad}
                  className="flex-1 text-xs py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-md transition-all active:scale-[0.98]"
                >
                  📥 {t('home.auth.restore')}
                </button>
              </div>
              {syncMsg && <p className="text-xs mt-2 text-gray-500 text-center">{syncMsg}</p>}
            </motion.div>
          ) : !showAuth ? (
            <motion.div variants={fadeUp} className="text-center">
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm text-purple-600 hover:text-purple-700 underline underline-offset-4 transition-colors"
              >
                🔑 {t('home.auth.loginRegister')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUp}
              className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg space-y-3"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setAuthMsg('')
                  }}
                  className={`flex-1 text-xs py-2 rounded-full transition-all active:scale-[0.98] ${authMode === 'login' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                >
                  {t('home.auth.login')}
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register')
                    setAuthMsg('')
                  }}
                  className={`flex-1 text-xs py-2 rounded-full transition-all active:scale-[0.98] ${authMode === 'register' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                >
                  {t('home.auth.register')}
                </button>
              </div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('home.auth.username')}
                className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              {authMode === 'register' && (
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('home.auth.nickname')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                />
              )}
              <button
                onClick={handleAuth}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all active:scale-[0.98]"
              >
                {authMode === 'login' ? t('home.auth.login') : t('home.auth.register')}
              </button>
              {authMsg && <p className="text-xs text-gray-500 text-center">{authMsg}</p>}
            </motion.div>
          )}

          {/* Stats card */}
          {stats && stats.totalGames > 0 && (
            <motion.div
              variants={fadeUp}
              className="p-5 bg-gradient-to-br from-amber-100/80 to-orange-100/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-lg"
            >
              <h3 className="text-sm font-bold text-amber-700 mb-4 text-center">
                {t('home.stats.title')}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
                  <div className="text-3xl font-display text-amber-600">{stats.highScore}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('home.stats.highScore')}</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
                  <div className="text-3xl font-display text-purple-600">Lv.{stats.bestLevel}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('home.stats.bestLevel')}</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
                  <div className="text-3xl font-display text-green-600">{getAccuracy(stats)}%</div>
                  <div className="text-xs text-gray-500 mt-1">{t('home.stats.accuracy')}</div>
                </motion.div>
              </div>
              <div className="mt-3 text-xs text-gray-400 text-center">
                {t('home.stats.summary', {
                  games: stats.totalGames,
                  questions: stats.totalQuestions,
                })}
              </div>
            </motion.div>
          )}

          {/* Recent achievements */}
          {unlockedCount > 0 && (
            <motion.div
              variants={fadeUp}
              className="p-4 bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-purple-700">🏅 {t('home.achievements.recent')}</h3>
                <Link to="/achievements" className="text-xs text-purple-500 hover:underline">
                  {t('home.achievements.viewAll')} →
                </Link>
              </div>
              <p className="text-sm text-gray-600">
                {t('home.achievements.unlocked', { count: unlockedCount, total: ACHIEVEMENTS.length })}
              </p>
            </motion.div>
          )}

          {/* Daily task */}
          {dailyTask && (
            <motion.div
              variants={fadeUp}
              className="p-5 bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-green-700">📋 {t('home.daily.title')}</h3>
                {dailyTask.rewardClaimed ? (
                  <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                    ✓ {t('home.daily.claimed')}
                  </span>
                ) : dailyTask.questionsCompleted >= dailyTask.targetQuestions ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      claimDailyReward()
                      setDailyTask({ ...dailyTask, rewardClaimed: true })
                    }}
                    className="text-xs text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    🎁 {t('home.daily.claimReward')}
                  </motion.button>
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                {/* Circular progress */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="url(#greenGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(dailyTask.questionsCompleted / dailyTask.targetQuestions) * 94.2} 94.2`}
                      initial={{ strokeDasharray: '0 94.2' }}
                      animate={{
                        strokeDasharray: `${(dailyTask.questionsCompleted / dailyTask.targetQuestions) * 94.2} 94.2`,
                      }}
                      transition={{ ...springTransition, delay: 0.2 }}
                    />
                    <defs>
                      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">
                      {dailyTask.questionsCompleted}/{dailyTask.targetQuestions}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700 font-medium">{t('home.daily.todayGoal')}</p>
                    <div className="flex gap-1">
                      {[5, 10, 15, 20].map((tgt) => (
                        <button
                          key={tgt}
                          onClick={() => {
                            const updated = setDailyTarget(tgt)
                            setDailyTask(updated)
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all ${
                            dailyTask.targetQuestions === tgt
                              ? 'bg-green-600 text-white'
                              : 'bg-white/60 text-gray-500 hover:bg-green-100'
                          }`}
                        >
                          {tgt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dailyTask.questionsCompleted >= dailyTask.targetQuestions
                      ? t('home.daily.goalReached')
                      : t('home.daily.keepGoing', {
                          remaining: dailyTask.targetQuestions - dailyTask.questionsCompleted,
                        })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <motion.div variants={fadeUp} className="space-y-3">
            <Link
              to="/quiz"
              className="block w-full text-center py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] hover:-translate-y-0.5"
            >
              🎯 {t('home.nav.quiz')}
            </Link>
            <Link
              to="/game"
              className="block w-full text-center py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] hover:-translate-y-0.5"
            >
              {t('home.nav.startAdventure')}
            </Link>
            <Link
              to="/timed"
              className="block w-full text-center py-4 px-6 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] hover:-translate-y-0.5"
            >
              ⏱️ {t('home.nav.timedChallenge')}
            </Link>
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/adventure"
                className="text-center py-3 bg-white/80 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                🗺️ {t('home.nav.adventure')}
              </Link>
              <Link
                to="/survival"
                className="text-center py-3 bg-white/80 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                🧟 {t('home.nav.survival')}
              </Link>
              <Link
                to="/precision"
                className="text-center py-3 bg-white/80 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                🎯 {t('home.nav.precision')}
              </Link>
            </div>
            <div className="flex gap-3">
              <Link
                to="/mistakes"
                className="flex-1 text-center py-3 px-4 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-600 font-medium rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative"
              >
                📕 {t('home.nav.mistakes')}
                {mistakeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {mistakeCount > 99 ? '99+' : mistakeCount}
                  </span>
                )}
              </Link>
              <Link
                to="/achievements"
                className="flex-1 text-center py-3 px-4 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-600 font-medium rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative"
              >
                🏅 {t('home.nav.achievements')}
                {unlockedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {unlockedCount}
                  </span>
                )}
              </Link>
              <Link
                to="/leaderboard"
                className="flex-1 text-center py-3 px-4 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-600 font-medium rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                🏆 {t('home.nav.leaderboard')}
              </Link>
              <Link
                to="/daily-challenge"
                className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-700 font-medium rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                📅 {t('home.nav.challenge')}
              </Link>
              <Link
                to="/parent-control"
                className="flex-1 text-center py-3 px-4 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-600 font-medium rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                🔒 {t('home.nav.parent')}
              </Link>
              <Link
                to="/report"
                className="flex-1 text-center py-3 px-4 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-600 font-medium rounded-full text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                📊 {t('home.nav.report')}
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <footer className="mt-12 text-sm text-gray-400">{t('home.footer')}</footer>
      </div>
    </div>
  )
}

export default Home
