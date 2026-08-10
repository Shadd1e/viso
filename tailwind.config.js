/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        ink: '#0B0B14',
        blue: {
          DEFAULT: '#33359C',
          deep: '#22235F',
        },
        line: 'rgba(11,11,20,0.10)',
        muted: 'rgba(11,11,20,0.58)',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        // Headlines / section titles. Coolvetica not delivered yet — falls back
        // to Instrument Sans (extrabold) until the font file is uploaded.
        display: ['Coolvetica', 'Instrument Sans', 'sans-serif'],
        // Nav / buttons / UI labels. Lemon Milk not delivered yet — same fallback.
        label: ['Lemon Milk', 'Instrument Sans', 'sans-serif'],
        // Stat numbers / big callouts — Stretch Pro is live.
        stat: ['Stretch Pro', 'Instrument Sans', 'sans-serif'],
      },
      keyframes: {
        idlePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.015)' },
        },
      },
      animation: {
        'idle-pulse': 'idlePulse 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
