import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="card text-center max-w-lg w-full">
        <h1 className="text-4xl md:text-5xl font-display text-primary-600 mb-2 text-shadow-lg">
          儿童算数小能手
        </h1>
        <p className="text-lg text-gray-600 mb-6">通过有趣的游戏学习数学，成为算数小达人!</p>

        {/* 用户状态 */}
        {user ? (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-bold">👤 {user.nickname}</span>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-500">
                退出
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSync}
                className="flex-1 text-xs py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                ☁️ 上传进度
              </button>
              <button
                onClick={handleLoad}
                className="flex-1 text-xs py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                📥 云端恢复
              </button>
            </div>
            {syncMsg && <p className="text-xs mt-1 text-gray-600">{syncMsg}</p>}
          </div>
        ) : (
          <div className="mb-4">
            {!showAuth ? (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                🔑 登录 / 注册（开启云端同步）
              </button>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl border">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      setAuthMode('login')
                      setAuthMsg('')
                    }}
                    className={`flex-1 text-xs py-1 rounded ${authMode === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    登录
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register')
                      setAuthMsg('')
                    }}
                    className={`flex-1 text-xs py-1 rounded ${authMode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    注册
                  </button>
                </div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="用户名"
                  className="w-full mb-2 px-3 py-1 border rounded text-sm"
                />
                {authMode === 'register' && (
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="昵称（可选）"
                    className="w-full mb-2 px-3 py-1 border rounded text-sm"
                  />
                )}
                <button
                  onClick={handleAuth}
                  className="w-full py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {authMode === 'login' ? '登录' : '注册'}
                </button>
                {authMsg && <p className="text-xs mt-1 text-gray-600">{authMsg}</p>}
              </div>
            )}
          </div>
        )}

        {/* 历史战绩卡片 */}
        {stats && stats.totalGames > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-primary-50 rounded-xl border border-amber-200">
            <h3 className="text-sm font-bold text-amber-700 mb-3">🏆 我的战绩</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-display text-primary-600">{stats.highScore}</div>
                <div className="text-xs text-gray-500">最高分</div>
              </div>
              <div>
                <div className="text-2xl font-display text-secondary-600">Lv.{stats.bestLevel}</div>
                <div className="text-xs text-gray-500">最高等级</div>
              </div>
              <div>
                <div className="text-2xl font-display text-success-600">{getAccuracy(stats)}%</div>
                <div className="text-xs text-gray-500">正确率</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              共 {stats.totalGames} 局 · {stats.totalQuestions} 题
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link to="/game" className="btn-primary block w-full text-center">
            开始冒险
          </Link>
          <Link to="/quiz" className="btn-secondary block w-full text-center">
            答题挑战
          </Link>
          <a
            href="https://your-store.lemonsqueezy.com/checkout/custom/PRODUCT_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-105 shadow-lg"
          >
            ⭐ 升级会员（解锁全部关卡）— $4.99/年
          </a>
        </div>
      </div>
      <footer className="mt-8 text-sm text-gray-500">适合 6-12 岁儿童使用</footer>
    </div>
  )
}

export default Home
