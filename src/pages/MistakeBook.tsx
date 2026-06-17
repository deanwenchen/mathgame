import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n'
import {
  getMistakes,
  removeMistake,
  clearMistakes,
  type MistakeRecord,
  getKPMastery,
} from '@utils/storage'

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

// 知识点颜色映射 (支持中英文知识点名)
const KP_COLORS: Record<string, { bg: string; text: string }> = {
  '10以内加法': { bg: 'bg-blue-50', text: 'text-blue-600' },
  '10以内减法': { bg: 'bg-green-50', text: 'text-green-600' },
  '20以内加法': { bg: 'bg-amber-50', text: 'text-amber-600' },
  '20以内减法': { bg: 'bg-orange-50', text: 'text-orange-600' },
  '100以内加法': { bg: 'bg-purple-50', text: 'text-purple-600' },
  '100以内减法': { bg: 'bg-pink-50', text: 'text-pink-600' },
  表内乘法: { bg: 'bg-red-50', text: 'text-red-600' },
  'Addition within 10': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'Subtraction within 10': { bg: 'bg-green-50', text: 'text-green-600' },
  'Addition within 20': { bg: 'bg-amber-50', text: 'text-amber-600' },
  'Subtraction within 20': { bg: 'bg-orange-50', text: 'text-orange-600' },
  'Addition within 100': { bg: 'bg-purple-50', text: 'text-purple-600' },
  'Subtraction within 100': { bg: 'bg-pink-50', text: 'text-pink-600' },
  'Multiplication': { bg: 'bg-red-50', text: 'text-red-600' },
}

function getKPColor(kp: string) {
  return KP_COLORS[kp] || { bg: 'bg-gray-50', text: 'text-gray-600' }
}

function MistakeBook() {
  const { t } = useTranslation()
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([])
  const [filterKP, setFilterKP] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  useEffect(() => {
    setMistakes(getMistakes())
  }, [])

  const knowledgePoints = [...new Set(mistakes.map((m) => m.knowledgePoint))]
  const filtered = mistakes
    .filter((m) => !filterKP || m.knowledgePoint === filterKP)
    .filter(
      (m) => !searchText || m.question.includes(searchText) || m.knowledgePoint.includes(searchText)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // 统计每个知识点的错题数量，找出薄弱点
  const weakPoints = knowledgePoints
    .map((kp) => ({ kp, count: mistakes.filter((m) => m.knowledgePoint === kp).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // 知识点掌握度
  const masteryList = getKPMastery()

  const handleRemove = (id: string) => {
    removeMistake(id)
    setMistakes(getMistakes())
  }
  const handleClearAll = () => {
    if (confirm(t('mistakes.confirmClear'))) {
      clearMistakes()
      setMistakes([])
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('mistakes.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('mistakes.totalCount', { count: mistakes.length })}</p>
            {masteryList.length > 0 && (
              <div className="flex gap-2 mt-1">
                {masteryList.slice(0, 3).map((m) => (
                  <span
                    key={m.knowledgePoint}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                  >
                    {m.knowledgePoint} {Math.round((m.correct / m.total) * 100)}%
                  </span>
                ))}
              </div>
            )}
            {weakPoints.length > 0 && mistakes.length >= 3 && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ {t('mistakes.weakPoints')}：{weakPoints.map((w) => `${w.kp}(${w.count}${t('mistakes.questionCount')})`).join('、')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {mistakes.length > 0 && (
              <>
                <Link
                  to="/mistakes/practice"
                  className="px-4 py-2 text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full hover:shadow-md transition-all active:scale-[0.98]"
                >
                  ✏️ {t('mistakes.practice')}
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                >
                  {t('mistakes.clearAll')}
                </motion.button>
              </>
            )}
            <Link
              to="/"
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              {t('mistakes.back')}
            </Link>
          </div>
        </div>

        {/* 知识点筛选标签 */}
        {knowledgePoints.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setFilterKP('')}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                !filterKP
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/80 text-gray-500 border border-gray-200'
              }`}
            >
              {t('mistakes.all')}
            </button>
            {knowledgePoints.map((kp) => (
              <button
                key={kp}
                onClick={() => setFilterKP(kp === filterKP ? '' : kp)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  filterKP === kp
                    ? `${getKPColor(kp).bg} ${getKPColor(kp).text} border border-current`
                    : 'bg-white/80 text-gray-500 border border-gray-200'
                }`}
              >
                {kp} ({mistakes.filter((m) => m.knowledgePoint === kp).length})
              </button>
            ))}
          </div>
        )}

        {/* 搜索框 */}
        {mistakes.length > 3 && (
          <div className="mb-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`🔍 ${t('mistakes.search')}...`}
              className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        )}

        {mistakes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4"></div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">{t('feedback.great')}</h2>
            <p className="text-gray-500">{t('mistakes.noMistakesDetail')}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ ...spring, delay: i * 0.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getKPColor(m.knowledgePoint).bg} ${getKPColor(m.knowledgePoint).text}`}
                        >
                          {m.knowledgePoint}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(m.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mb-2">{m.question}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-red-500">{t('mistakes.yourAnswer')}：{m.userAnswer}</span>
                        <span className="text-green-600">{t('mistakes.correctAnswer')}：{m.correctAnswer}</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemove(m.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title={t('mistakes.markMastered')}
                    >
                      ✓
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default MistakeBook
