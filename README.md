# VISO — Mobile Auto Care (Hero + Car Transition Preview)

This is a real Vite + React project — not a chat-preview mockup. Running it locally
guarantees you see exactly what's there, with no CDN or sandbox issues.

## What's included in this preview

- **Hero section** — kinetic headline, stat counters, the top-down car diagram with
  hover hotspots (Diagnostics / AC & Cooling / Towing), magnetic tire-peel buttons.
- **Car Transition section (reworked)** — scroll-scrubbed, not autoplayed:
  - Hidden at rest — the car is parked fully off-screen until you scroll here.
  - Position is tied directly to scroll progress (0–100%) and is fully reversible —
    scroll up and it drives back.
  - The Hero content above fades and desaturates toward the background as you scroll
    through, proportional to progress.
  - The car lays a persistent tire trail behind it. The trail only fades locally
    where it would run under one of the real "Diagnostics / AC & Cooling / Towing"
    buttons in its lane.
  - Those three buttons are real, clickable links — Matter.js only simulates
    collisions on them specifically (scoped physics). The car nudges them aside as
    it passes; scroll back up past a button and it resets in place so the effect
    replays correctly. The old "OUR SERVICES" letter-physics concept is gone.
  - At 100% scroll the car has fully passed through and the Services section
    (built as the next block on the same page — no route change, no remount) is in
    view. The URL updates to `/services` cosmetically via `history.replaceState`,
    and back to `/` if you scroll up again.
- **Services section** — now wired in as the block right after the car transition.

## Typography status

- **Body copy** — Instrument Sans, unchanged.
- **Stat numbers / big callouts** — **Stretch Pro is live** (the file you sent is
  wired in via `@font-face` and the `font-stat` utility, used on the Hero stat
  counters).
- **Headlines / section titles (Coolvetica)** and **nav / buttons / UI labels
  (Lemon Milk)** — I don't actually have these font files on my end yet, despite
  the running list saying they'd been sent. They're not in this project or in
  anything uploaded to this conversation. Everything that should use them
  (`font-display` and `font-label` classes, already applied throughout) currently
  falls back to Instrument Sans, so nothing is broken — it just won't look like the
  final type system until the files show up. Upload `Coolvetica.otf/.ttf` and
  `LemonMilk.otf/.ttf` and I'll drop them into `src/assets/fonts/`, uncomment the
  two `@font-face` blocks at the top of `src/index.css`, and you're done.

## Color cleanup

Gold has been removed from every UI surface (buttons, tags, text accents, cursor,
loader, nav, selection color) and replaced with the existing blue as the sole
accent. The **only** place gold still appears is on the car's own SVG — its body,
trim, and accent details — which was already recolored and is untouched.

## Not included yet on purpose

Built as components already, just not wired into this page yet:
Testimonials, Gallery, CTA banner, FAQ.

Not started yet:
- About, Services (dedicated page), Fleet, Contact pages
- Full booking flow (numbered bays, GPS/reverse-geocode map pin, guest booking +
  phone quick sign-up, simulated live tracking)
- Supabase backend integration

## How to run it

You'll need [Node.js](https://nodejs.org) installed (v18 or newer). Then, in a
terminal, from this project folder:

```bash
npm install
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) — open that in your
browser. Any code changes hot-reload automatically while `npm run dev` is running.

To stop the server, press `Ctrl+C` in the terminal.

## If something looks off

Open your browser's DevTools console (right-click → Inspect → Console tab) and tell
me exactly what error, if any, shows up red — that pinpoints the problem immediately
instead of us guessing back and forth.
# viso
