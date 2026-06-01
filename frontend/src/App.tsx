import { Routes, Route } from 'react-router-dom'
import Portal from './pages/Portal'
import StarRaid from './pages/StarRaid'
import FluidBg from './components/layout/FluidBg'

export default function App() {
  return (
    <>
      <FluidBg />
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/play/star_raid" element={<StarRaid />} />
        <Route path="/play/archery" element={<div />} />
        <Route path="/play/reading" element={<div />} />
        <Route path="/dashboard" element={<div />} />
      </Routes>
    </>
  )
}
