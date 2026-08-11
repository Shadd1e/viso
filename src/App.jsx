import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Cursor from './components/Cursor.jsx'
import Loader from './components/Loader.jsx'
import Nav from './components/Nav.jsx'
import DoodleBackground from './components/DoodleBackground.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import About from './pages/About.jsx'
import Fleet from './pages/Fleet.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [ready, setReady] = useState(false)
  return (
    <>
      <DoodleBackground />
      <Cursor />
      {!ready && <Loader onDone={() => setReady(true)} />}
      <Nav />
      <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home ready={ready} />} />
        <Route path="/book" element={<Booking />} />
        <Route path="/about" element={<About />} />
        <Route path="/fleet" element={<Fleet />} />
      </Routes>
      </div>
      <Footer />
    </>
  )
}
