// Faint, repeating car-parts doodle that sits behind the entire page.
// Pure inline SVG (no image request), fixed so it stays put while the
// page scrolls, and non-interactive so it never blocks clicks.
export default function DoodleBackground() {
  return (
    <svg
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="carPartsDoodle"
          width="260"
          height="260"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-6)"
        >
          {/* wrench */}
          <g transform="translate(14,18)" stroke="#0B0B14" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 34 L20 16" />
            <path d="M16 12a5 5 0 1 1 7.5 4.3L34 6.8l3.2 3.2-9.9 10.5A5 5 0 1 1 16 12Z" />
          </g>

          {/* gear / cog */}
          <g transform="translate(150,20)" stroke="#0B0B14" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="18" r="7" />
            <circle cx="18" cy="18" r="15.5" strokeDasharray="4.2 5.2" />
          </g>

          {/* tire, top-down */}
          <g transform="translate(55,95)" stroke="#0B0B14" strokeWidth="2" fill="none">
            <circle cx="16" cy="16" r="15" />
            <circle cx="16" cy="16" r="6" />
            <path d="M16 1v6M16 25v6M1 16h6M25 16h6M6 6l4 4M22 22l4 4M26 6l-4 4M10 22l-4 4" strokeLinecap="round" />
          </g>

          {/* hex bolt */}
          <g transform="translate(190,110)" stroke="#0B0B14" strokeWidth="2" fill="none" strokeLinejoin="round">
            <path d="M12 0 L23 6 V18 L12 24 L1 18 V6 Z" />
            <circle cx="12" cy="12" r="3.5" />
          </g>

          {/* oil drop */}
          <g transform="translate(95,175)" stroke="#0B0B14" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 0c6 8 11 13.5 11 19.5A11 11 0 1 1 0 19.5C0 13.5 5 8 11 0Z" />
          </g>

          {/* spark plug */}
          <g transform="translate(200,190)" stroke="#0B0B14" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 0h10v8H8z" />
            <path d="M10 8v10a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V8" />
            <path d="M13 21v9M9 34h8" />
          </g>

          {/* steering wheel */}
          <g transform="translate(15,210)" stroke="#0B0B14" strokeWidth="2" fill="none">
            <circle cx="17" cy="17" r="16" />
            <circle cx="17" cy="17" r="4" />
            <path d="M17 5v8M6 24l7.5-4M28 24l-7.5-4" strokeLinecap="round" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#carPartsDoodle)" opacity="0.045" />
    </svg>
  )
}
