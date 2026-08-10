import { useState } from 'react'

// Runs once, right after payment. Collects what the technician actually
// needs to reach the customer — nothing here is used for the estimate or
// the charge, which are both already final by this point.
export default function ContactHandoff({ invoiceName, onComplete }) {
  const [name, setName] = useState(invoiceName || '')
  const [saveAsAccountName, setSaveAsAccountName] = useState(true)
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)

  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 10

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    onComplete?.({ name: name.trim(), phone: phone.trim(), saveAsAccountName })
  }

  return (
    <form onSubmit={submit} className="p-5 rounded-xl border border-blue bg-blue/5">
      <div className="mb-4">
        <span className="text-blue text-xs font-label uppercase tracking-widest">One more thing</span>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Your technician may need to reach you — for directions, gate codes, or anything else once they're
          close.
        </p>
      </div>

      <label className="block text-sm font-medium mb-1.5">Your name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        className="w-full px-4 py-3 rounded-lg border border-line bg-white text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
      />

      <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={saveAsAccountName}
          onChange={(e) => setSaveAsAccountName(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-blue shrink-0"
        />
        <span className="text-xs text-muted leading-relaxed">
          Use this as the name on my account (matches your invoice).
        </span>
      </label>

      <label className="block text-sm font-medium mb-1.5">Contact number</label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(555) 123-4567"
        className="w-full px-4 py-3 rounded-lg border border-line bg-white text-sm mb-1.5 focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
      />
      <p className="text-[11px] text-muted mb-4">
        Used only so your technician can call or text you about this visit.
      </p>

      {touched && !valid && (
        <p className="text-xs text-red-600 mb-3">Add your name and a valid contact number to continue.</p>
      )}

      <button
        type="submit"
        data-cursor
        className="w-full py-3.5 rounded-lg font-label text-sm bg-blue text-white hover:bg-blue-deep transition-colors"
      >
        Continue to live tracking
      </button>
    </form>
  )
}
