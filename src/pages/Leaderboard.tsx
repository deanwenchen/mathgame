import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { getLeaderboard, addScoreToLeaderboard } from '@utils/storage'

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

function Leaderboard() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState(getLeaderboard())
  const [name, setName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = () => {
    if (!name.trim()) return
    const score = Math.floor(Math.random() * 1000) + 100
    addScoreToLeaderboard(name, score, 'quiz')
    setEntries(getLeaderboard())
    setName('')
    setShowAdd(false)
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('leaderboard.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('leaderboard.recordCount', { count: entries.length })}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full hover:shadow-md transition-all"
            >
              {t('leaderboard.add')}
            </button>
            <Link
              to="/"
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50"
            >
              {t('leaderboard.back')}
            </Link>
          </div>
        </div>

        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-white/80 rounded-2xl border shadow-sm space-y-3"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('leaderboard.enterName')}
              className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold"
              >
                {t('leaderboard.confirm')}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {t('leaderboard.cancel')}
              </button>
            </div>
          </motion.div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">{t('leaderboard.noRecords')}</h2>
            <p className="text-gray-500">{t('leaderboard.noRecordsDetail')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${i < 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-white/80 border-white/50'} shadow-sm`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{entry.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()} · {entry.mode}
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600">{entry.score}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
