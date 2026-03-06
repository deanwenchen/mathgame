import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="card text-center max-w-lg w-full">
        <h1 className="text-4xl md:text-5xl font-display text-primary-600 mb-4 text-shadow-lg">
          儿童算数小能手
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          通过有趣的游戏学习数学，成为算数小达人!
        </p>

        <div className="space-y-4">
          <Link to="/game" className="btn-primary block w-full text-center">
            开始冒险
          </Link>
          <Link to="/quiz" className="btn-secondary block w-full text-center">
            答题挑战
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-3">游戏特色</h3>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="text-success-500 mr-2">+</span>
              趣味数学冒险
            </li>
            <li className="flex items-center">
              <span className="text-success-500 mr-2">+</span>
              角色成长系统
            </li>
            <li className="flex items-center">
              <span className="text-success-500 mr-2">+</span>
              智能题目适配
            </li>
            <li className="flex items-center">
              <span className="text-success-500 mr-2">+</span>
              家长进度查看
            </li>
          </ul>
        </div>
      </div>

      <footer className="mt-8 text-sm text-gray-500">
        适合 6-12 岁儿童使用
      </footer>
    </div>
  )
}

export default Home