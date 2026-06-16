import { Routes, Route } from 'react-router-dom'
import Home from '@pages/Home'
import Game from '@pages/Game'
import Quiz from '@pages/Quiz'
import MistakeBook from '@pages/MistakeBook'
import ParentReport from '@pages/ParentReport'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/mistakes" element={<MistakeBook />} />
        <Route path="/report" element={<ParentReport />} />
      </Routes>
    </div>
  )
}

export default App
