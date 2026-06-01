import { Routes, Route, useLocation } from 'react-router-dom'
import Portal from './pages/Portal'
import StarRaid from './pages/StarRaid'
import Archery from './pages/Archery'
import ReadingTraining from './pages/ReadingTraining'
import Dashboard from './pages/Dashboard'
import FluidBg from './components/layout/FluidBg'

const GAME_PATHS = ['/play/star_raid', '/play/archery']

export default function App() {
  const loc = useLocation()
  const isGame = GAME_PATHS.includes(loc.pathname)

  return (
    <>
      {!isGame && <FluidBg />}
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/play/star_raid" element={<StarRaid />} />
        <Route path="/play/archery" element={<Archery />} />
        <Route path="/play/reading" element={<ReadingTraining />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}
