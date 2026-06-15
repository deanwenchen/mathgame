import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getQuizStats, getAccuracy, type QuizStats } from '@utils/storage'
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

// Spring 动画配置
const springTransition = { type: 'spring', stiffness: 300, damping: 20 }
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springTransition },
}

function Home() {
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [user, setUser] = useState<User | null>(() => getCurrentUser())
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [authMsg, setAuthMsg] = useState('')
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    setStats(getQuizStats())
  }, [])

  const handleAuth = async () => {
    setAuthMsg('')
    if (!username.trim()) {
      setAuthMsg('请输入用户名')
      return
    }
    if (authMode === 'register') {
      const res = await register(username, nickname || username)
      if (res.success && res.data?.user) {
        saveCurrentUser(res.data.user)
        setUser(res.data.user)
        setAuthMsg('注册成功！')
        setShowAuth(false)
      } else {
        setAuthMsg(res.error || '注册失败')
      }
    } else {
      const res = await login(username)
      if (res.success && res.data?.user) {
        saveCurrentUser(res.data.user)
        setUser(res.data.user)
        setAuthMsg('登录成功！')
        setShowAuth(false)
      } else {
        setAuthMsg(res.error || '登录失败')
      }
    }
  }

  const handleSync = async () => {
    if (!user) return
    setSyncMsg('同步中...')
    const localStats = getQuizStats()
    const res = await saveProgress(user.id, {
      high_score: localStats.highScore,
      total_games: localStats.totalGames,
      total_questions: localStats.totalQuestions,
      total_correct: localStats.totalCorrect,
      best_level: localStats.bestLevel,
      updated_at: new Date().toISOString(),
    })
    setSyncMsg(res.success ? '✅ 已同步到云端' : `❌ ${res.error}`)
  }

  const handleLoad = async () => {
    if (!user) return
    setSyncMsg('加载中...')
    const res = await loadProgress(user.id)
    if (res.success && res.data) {
      setSyncMsg(`✅ 云端数据：最高分 ${res.data.high_score}，共 ${res.data.total_games} 局`)
    } else {
      setSyncMsg('❌ 云端暂无数据')
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setSyncMsg('')
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 right-1/4 w-48 h-48 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center p-6 md:p-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-lg w-full space-y-6"
        >
          {/* 标题区 */}
          <motion.div variants={fadeUp} className="text-center">
            <motion.h1
              className="text-5xl md:text-7xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500 mb-3"
              whileHover={{ scale: 1.02 }}
              transition={springTransition}
            >
              算数小能手
            </motion.h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              通过有趣的游戏学习数学，成为算数小达人！
            </p>
          </motion.div>

          {/* 用户状态 */}
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
                  退出
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  className="flex-1 text-xs py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-md transition-all active:scale-[0.98]"
                >
                  ☁️ 上传进度
                </button>
                <button
                  onClick={handleLoad}
                  className="flex-1 text-xs py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-md transition-all active:scale-[0.98]"
                >
                  📥 云端恢复
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
                🔑 登录 / 注册（开启云端同步）
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
                  登录
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register')
                    setAuthMsg('')
                  }}
                  className={`flex-1 text-xs py-2 rounded-full transition-all active:scale-[0.98] ${authMode === 'register' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                >
                  注册
                </button>
              </div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              {authMode === 'register' && (
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="昵称（可选）"
                  className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                />
              )}
              <button
                onClick={handleAuth}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all active:scale-[0.98]"
              >
                {authMode === 'login' ? '登录' : '注册'}
              </button>
              {authMsg && <p className="text-xs text-gray-500 text-center">{authMsg}</p>}
            </motion.div>
          )}

          {/* 战绩卡片 */}
          {stats && stats.totalGames > 0 && (
            <motion.div
              variants={fadeUp}
              className="p-5 bg-gradient-to-br from-amber-100/80 to-orange-100/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-lg"
            >
              <h3 className="text-sm font-bold text-amber-700 mb-4 text-center"> 我的战绩</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
                  <div className="text-3xl font-display text-amber-600">{stats.highScore}</div>
                  <div className="text-xs text-gray-500 mt-1">最高分</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
                  <div className="text-3xl font-display text-purple-600">Lv.{stats.bestLevel}</div>
                  <div className="text-xs text-gray-500 mt-1">最高等级</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
                  <div className="text-3xl font-display text-green-600">{getAccuracy(stats)}%</div>
                  <div className="text-xs text-gray-500 mt-1">正确率</div>
                </motion.div>
              </div>
              <div className="mt-3 text-xs text-gray-400 text-center">
                共 {stats.totalGames} 局 · {stats.totalQuestions} 题
              </div>
            </motion.div>
          )}

          {/* 按钮区 */}
          <motion.div variants={fadeUp} className="space-y-3">
            <Link
              to="/quiz"
              className="block w-full text-center py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] hover:-translate-y-0.5"
            >
              🎯 答题挑战
            </Link>
            <Link
              to="/game"
              className="block w-full text-center py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] hover:-translate-y-0.5"
            >
              开始冒险
            </Link>
          </motion.div>
        </motion.div>

        <footer className="mt-12 text-sm text-gray-400">适合 6-12 岁儿童使用</footer>
      </div>
    </div>
  )
}

export default Home
