import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getQuizStats, getAccuracy, getMistakes } from '@utils/storage'

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

function ParentReport() {
  const [stats, setStats] = useState(getQuizStats())
  const mistakes = getMistakes()
  useEffect(() => {
    setStats(getQuizStats())
  }, [])

  const accuracy = getAccuracy(stats)
  const weakPoints = [...new Set(mistakes.slice(-10).map((m) => m.knowledgePoint))]

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800"> 学习报告</h1>
            <p className="text-sm text-gray-500 mt-1">家长专属 · 了解孩子学习情况</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            {' '}
            返回
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: '总答题数',
              value: stats.totalQuestions,
              color: 'from-blue-500 to-blue-600',
              icon: '',
            },
            {
              label: '正确率',
              value: `${accuracy}%`,
              color: 'from-green-500 to-emerald-500',
              icon: '✅',
            },
            {
              label: '最高分',
              value: stats.highScore,
              color: 'from-amber-500 to-orange-500',
              icon: '',
            },
            {
              label: '错题数',
              value: mistakes.length,
              color: 'from-red-500 to-rose-500',
              icon: '📝',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.1 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 text-white shadow-lg`}
            >
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs opacity-80">{card.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4"> 详细数据</h2>
          <div className="space-y-3">
            {[
              { label: '总游戏局数', value: `${stats.totalGames} 局`, color: 'text-gray-800' },
              { label: '答对题数', value: `${stats.totalCorrect} 题`, color: 'text-green-600' },
              {
                label: '答错题数',
                value: `${stats.totalQuestions - stats.totalCorrect} 题`,
                color: 'text-red-500',
              },
              { label: '最高等级', value: `Lv.${stats.bestLevel}`, color: 'text-purple-600' },
              {
                label: '上次游玩',
                value: stats.lastPlayedAt
                  ? new Date(stats.lastPlayedAt).toLocaleDateString()
                  : '从未',
                color: 'text-gray-800',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-gray-600">{row.label}</span>
                <span className={`font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {weakPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">💡 薄弱知识点</h2>
            <div className="flex flex-wrap gap-2">
              {weakPoints.map((kp, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {kp}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">建议让孩子针对性练习以上知识点</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl border border-purple-200/50 p-6"
        >
          <h2 className="text-lg font-bold text-purple-800 mb-3"> 给家长的建议</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              '每天练习 10-15 分钟，保持学习兴趣',
              '多鼓励，少批评，关注进步而非分数',
              '错题本是好帮手，定期复习错题',
              '适当休息，保护视力',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

export default ParentReport
