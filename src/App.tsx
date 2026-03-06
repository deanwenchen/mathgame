import { Routes, Route } from 'react-router-dom'
import Home from '@pages/Home'
import Game from '@pages/Game'
import Quiz from '@pages/Quiz'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </div>
  )
}

export default App