export default function PaymentMethod({ total, onConfirm, loading = false }) {
  return (
    <div className="p-5 rounded-xl border border-line">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="font-label text-sm uppercase tracking-wide text-muted">Card payment</p>
          <p className="text-sm mt-1">You’ll enter your card details securely on Stripe.</p>
        </div>
        <span className="text-xs font-label text-blue border border-blue/20 bg-blue/5 px-2.5 py-1.5 rounded-full">Secure</span>
      </div>

      <div className="rounded-xl border border-line bg-[#FAFAF8] p-4">
        <p className="text-sm font-medium">Stripe Checkout</p>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          Your card number, expiry date and CVC are collected directly by Stripe after you continue. Viso never sees or stores your card details.
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        data-cursor
        className="w-full mt-5 px-5 py-3 rounded-lg font-label text-sm bg-blue text-white hover:bg-blue-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Opening secure checkout…' : `Continue to Stripe · $${Number(total || 0).toFixed(2)}`}
      </button>
    </div>
  )
}
