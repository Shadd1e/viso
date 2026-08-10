import logo from '../assets/images/logo.png'
import BookButton from './BookButton.jsx'

const links = [
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/#faq' },
]

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[500] border-b border-line backdrop-blur-md bg-white/85">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 h-14 flex items-center justify-between">
        <a
          href="/"
          aria-label="VISO Mobile Auto Care"
          className="group flex items-center shrink-0"
          data-cursor
        >
          <img
            src={logo}
            alt="VISO Mobile Auto Care"
            className="h-10 w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </a>

        <div className="hidden md:flex gap-9 text-[14.5px] font-label">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-cursor
              className="group relative py-1.5 opacity-75 transition-colors duration-200 hover:opacity-100 hover:text-blue"
            >
              {l.label}
              <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-full origin-left scale-x-0 bg-blue transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3.5">
          <BookButton>Find My Tech</BookButton>
          <BookButton primary href="/book">Book Service</BookButton>
        </div>
      </div>
    </nav>
  )
}
