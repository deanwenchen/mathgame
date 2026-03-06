import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function Game() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gameError, setGameError] = useState<string | null>(null)

  useEffect(() => {
    // Phaser game initialization will be implemented in task #14
    // For now, show a placeholder
    const initGame = async () => {
      try {
        setIsLoading(true)
        // Placeholder for Phaser initialization
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        setGameError('游戏加载失败，请刷新页面重试')
        setIsLoading(false)
      }
    }

    initGame()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-primary-600 font-bold text-xl hover:text-primary-700">
            儿童算数小能手
          </Link>
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 px-4 py-2 rounded-lg">
              <span className="text-primary-700 font-bold">得分: 0</span>
            </div>
            <div className="bg-danger-100 px-4 py-2 rounded-lg">
              <span className="text-danger-700 font-bold">生命: 3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="game-container">
          {isLoading && (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">游戏加载中...</p>
            </div>
          )}

          {gameError && (
            <div className="card text-center py-12">
              <p className="text-danger-600 text-lg mb-4">{gameError}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                重新加载
              </button>
            </div>
          )}

          {!isLoading && !gameError && (
            <div
              ref={gameContainerRef}
              className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              style={{ width: '100%', aspectRatio: '16/9' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-xl mb-4">游戏场景</p>
                  <p className="text-gray-400">Phaser.js 游戏引擎将在任务 #14 中集成</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-gray-500 hover:text-primary-600">
            返回首页
          </Link>
          <div className="text-sm text-gray-400">
            等级 1 | 第 1 关
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Game