import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Cursor from './components/Cursor.jsx'
import Loader from './components/Loader.jsx'
import Nav from './components/Nav.jsx'
import DoodleBackground from './components/DoodleBackground.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  return (
    <>
      <DoodleBackground />
      <Cursor />
      {!ready && <Loader onDone={() => setReady(true)} />}
      <Nav />
      <Routes>
        <Route path="/" element={<Home ready={ready} />} />
        <Route path="/book" element={<Booking />} />
        {/* About, Fleet, Contact routes land here next */}
      </Routes>
    </>
  )
}
