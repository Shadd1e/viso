import { Routes, Route } from 'react-router-dom'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import DoodleBackground from './components/DoodleBackground.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import About from './pages/About.jsx'
import Fleet from './pages/Fleet.jsx'
import TechnicianApply from './pages/TechnicianApply.jsx'
import Account from './pages/Account.jsx'
import Footer from './components/Footer.jsx'

export default function App(){return <><DoodleBackground/><Cursor/><Nav/><div className="min-h-screen"><Routes><Route path="/" element={<Home ready/>}/><Route path="/book" element={<Booking/>}/><Route path="/about" element={<About/>}/><Route path="/fleet" element={<Fleet/>}/><Route path="/technicians/apply" element={<TechnicianApply/>}/><Route path="/account" element={<Account/>}/></Routes></div><Footer/></>}
