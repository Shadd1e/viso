import { useState } from 'react'

// Text-based channel to the technician, unlocked post-payment alongside
// live tracking. Messages are simulated client-side for now — swap for a
// real thread (websocket / polling a messages table) once dispatch is
// wired up. The "prefer a call" path just uses the number already
// collected in the ContactHandoff step, so nothing new is asked here.
export default function TechnicianChat({ technician = 'Marcus O.', customerPhone }) {
  const [messages, setMessages] = useState([
    { from: 'tech', text: `Hey, this is ${technician} — on my way now, I'll message if anything changes.` },
  ])
  const [draft, setDraft] = useState('')
  const [showCallOption, setShowCallOption] = useState(false)

  function send(e) {
    e.preventDefault()
    if (!draft.trim()) return
    setMessages((m) => [...m, { from: 'me', text: draft.trim() }])
    setDraft('')
  }

  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <div className="p-4 border-b border-line flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">{technician}</div>
          <div className="text-xs text-muted">Message your technician</div>
        </div>
        <button
          type="button"
          data-cursor
          onClick={() => setShowCallOption((s) => !s)}
          className="text-xs font-label px-3 py-1.5 rounded-full border border-line hover:border-blue hover:text-blue transition-colors"
        >
          Prefer a call?
        </button>
      </div>

      {showCallOption && (
        <div className="px-4 py-3 bg-blue/5 border-b border-line text-xs text-muted leading-relaxed">
          {customerPhone
            ? <>We\u2019ll have {technician.split(' ')[0]} call {customerPhone} directly if needed — no extra setup on your end.</>
            : 'Add a contact number above so your technician can call you directly.'}
        </div>
      )}

      <div className="p-4 space-y-2.5 max-h-64 overflow-y-auto bg-[#FAFAF8]">
        {messages.map((m, i) => (
          <div key={i} className={'flex ' + (m.from === 'me' ? 'justify-end' : 'justify-start')}>
            <div
              className={
                'max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ' +
                (m.from === 'me' ? 'bg-blue text-white rounded-br-sm' : 'bg-white border border-line rounded-bl-sm')
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-3 border-t border-line flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message your technician…"
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
        />
        <button
          type="submit"
          data-cursor
          className="px-4 py-2.5 rounded-lg font-label text-sm bg-blue text-white hover:bg-blue-deep transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
