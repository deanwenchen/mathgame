import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMistakes, removeMistake, clearMistakes, type MistakeRecord } from '@utils/storage'

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

function MistakeBook() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([])
  useEffect(() => {
    setMistakes(getMistakes())
  }, [])

  const handleRemove = (id: string) => {
    removeMistake(id)
    setMistakes(getMistakes())
  }
  const handleClearAll = () => {
    if (confirm('确定清空所有错题？')) {
      clearMistakes()
      setMistakes([])
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800"> 错题本</h1>
            <p className="text-sm text-gray-500 mt-1">共 {mistakes.length} 道错题</p>
          </div>
          <div className="flex gap-2">
            {mistakes.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
              >
                清空全部
              </motion.button>
            )}
            <Link
              to="/"
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              {' '}
              返回
            </Link>
          </div>
        </div>

        {mistakes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4"></div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">太棒了！</h2>
            <p className="text-gray-500">你还没有错题，继续保持！</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {mistakes.map((m, i) => (
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
                        <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                          {m.knowledgePoint}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(m.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mb-2">{m.question}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-red-500">你的答案：{m.userAnswer}</span>
                        <span className="text-green-600">正确答案：{m.correctAnswer}</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemove(m.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="标记为已掌握"
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
