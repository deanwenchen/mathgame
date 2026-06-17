import { Routes, Route } from 'react-router-dom'
import Home from '@pages/Home'
import Game from '@pages/Game'
import Quiz from '@pages/Quiz'
import TimedChallenge from '@pages/TimedChallenge'
import MistakeBook from '@pages/MistakeBook'
import MistakePractice from '@pages/MistakePractice'
import AchievementWall from '@pages/AchievementWall'
import Adventure from '@pages/Adventure'
import Survival from '@pages/Survival'
import Precision from '@pages/Precision'
import Leaderboard from '@pages/Leaderboard'
import ParentControl from '@pages/ParentControl'
import DailyChallengePage from '@pages/DailyChallengePage'
import ParentReport from '@pages/ParentReport'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/timed" element={<TimedChallenge />} />
        <Route path="/mistakes" element={<MistakeBook />} />
        <Route path="/mistakes/practice" element={<MistakePractice />} />
        <Route path="/achievements" element={<AchievementWall />} />
        <Route path="/adventure" element={<Adventure />} />
        <Route path="/survival" element={<Survival />} />
        <Route path="/precision" element={<Precision />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/parent-control" element={<ParentControl />} />
        <Route path="/daily-challenge" element={<DailyChallengePage />} />
        <Route path="/report" element={<ParentReport />} />
      </Routes>
    </div>
  )
}

export default App
