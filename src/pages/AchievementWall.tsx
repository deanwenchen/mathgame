import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'
import {
  ACHIEVEMENTS,
  getAchievements,
  type AchievementDef,
  type AchievementRecord,
} from '@utils/storage'

/**
 * 成就墙
 *
 * 教学设计（pedagogy.md §3.2 多元化激励）：
 * - 10 个成就覆盖多维度（分数/正确率/连胜/坚持/题量）
 * - 已解锁成就展示达成时间，强化成就感
 * - 未解锁成就展示目标描述，引导努力方向
 */

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }
const staggerContainer = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: spring },
}

function AchievementWall() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<AchievementRecord[]>([])

  useEffect(() => {
    setRecords(getAchievements())
  }, [])

  const unlockedIds = new Set(records.map((r) => r.id))
  const unlockedCount = unlockedIds.size
  const totalCount = ACHIEVEMENTS.length

  const TYPE_COLORS: Record<AchievementDef['type'], { bg: string; text: string; labelKey: string }> = {
    score: { bg: 'bg-amber-50', text: 'text-amber-600', labelKey: 'achievement.typeScore' },
    accuracy: { bg: 'bg-green-50', text: 'text-green-600', labelKey: 'achievement.typeAccuracy' },
    streak: { bg: 'bg-red-50', text: 'text-red-500', labelKey: 'achievement.typeStreak' },
    games: { bg: 'bg-blue-50', text: 'text-blue-600', labelKey: 'achievement.typeGames' },
    questions: { bg: 'bg-purple-50', text: 'text-purple-600', labelKey: 'achievement.typeQuestions' },
  }

  const getUnlockDate = (id: string): string | null => {
    const rec = records.find((r) => r.id === id)
    if (!rec) return null
    return new Date(rec.unlockedAt).toLocaleDateString()
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('achievement.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('achievement.unlockedCount', { count: unlockedCount, total: totalCount })}
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            {t('achievement.back')}
          </Link>
        </div>

        {/* 总进度条 */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{t('achievement.progress')}</span>
            <span className="font-bold text-amber-600">
              {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={spring}
            />
          </div>
        </div>

        {/* 成就列表 */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedIds.has(achievement.id)
            const unlockDate = getUnlockDate(achievement.id)
            const typeColor = TYPE_COLORS[achievement.type]

            return (
              <motion.div
                key={achievement.id}
                variants={fadeUp}
                className={`
                  rounded-2xl border p-4 transition-all
                  ${
                    unlocked
                      ? 'bg-white/80 backdrop-blur-sm border-amber-200/50 shadow-sm'
                      : 'bg-gray-50/60 border-gray-200/50 opacity-60'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* 图标 */}
                  <div
                    className={`
                      text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl
                      ${unlocked ? typeColor.bg : 'bg-gray-100'}
                    `}
                  >
                    {unlocked ? achievement.icon : t('achievement.lockIcon')}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-bold text-sm truncate ${
                          unlocked ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {t(`achievements.${achievement.id}.name`)}
                      </h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeColor.bg} ${typeColor.text}`}
                      >
                        {t(typeColor.labelKey)}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        unlocked ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {t(`achievements.${achievement.id}.desc`)}
                    </p>
                    {unlocked && unlockDate && (
                      <p className="text-[10px] text-amber-500 mt-1.5">✨ {unlockDate} {t('achievement.unlockedAt')}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* 底部鼓励语 */}
        {unlockedCount < totalCount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            {t('achievement.keepGoing')}
          </motion.div>
        )}

        {unlockedCount === totalCount && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="text-4xl mb-2">🎊</div>
            <p className="text-lg font-bold text-amber-600">{t('achievement.allUnlocked')}</p>
            <p className="text-sm text-gray-500">{t('achievement.allUnlockedDetail')}</p>
            <button
              onClick={() => {
                const text = t('achievement.shareText', { total: totalCount })
                if (navigator.share) {
                  navigator.share({ title: t('achievement.title'), text })
                } else {
                  navigator.clipboard.writeText(text)
                  alert(t('achievement.copied'))
                }
              }}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {t('achievement.share')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AchievementWall
