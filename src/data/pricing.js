// ---------------------------------------------------------------------------
// PRICING DATA LAYER — placeholder values, admin-editable shape
// ---------------------------------------------------------------------------
// Everything below is stand-in data. It's deliberately shaped the way a real
// response from an admin-managed endpoint would look, e.g.:
//
//   GET /api/admin/pricing        -> PRICING_CONFIG shape below
//   PATCH /api/admin/pricing      -> update booking fees / mileage rate / bonuses
//   GET /api/admin/coupons        -> COUPONS shape below
//   POST /api/admin/coupons       -> create a coupon
//
// Swapping the mock functions at the bottom for real fetch() calls is the
// only change needed once that endpoint exists — nothing that calls
// getPricing() / validateCoupon() has to change.
// ---------------------------------------------------------------------------

// Flat booking fee per service, in USD. This is what the admin dashboard
// would let staff edit per service line.
export const SERVICE_BOOKING_FEES = {
  'oil-change': 49,
  transmission: 129,
  'tyre-change': 39,
  'flat-fix': 35,
  'brake-service': 89,
  'air-conditioning': 79,
  sensors: 69,
  programming: 99,
  diagnostics: 59,
  battery: 45,
  'wash-detail': 59,
  towing: 75,
}

// Base mileage rate, dollars per mile.
export const DEFAULT_MILEAGE_RATE = 0.75

// Bonus / promo multipliers an admin could toggle on the mileage rate —
// e.g. a "slow day" discount or a surge rate. Stub for now; only "standard"
// is active by default.
export const MILEAGE_BONUSES = [
  { id: 'standard', label: 'Standard rate', multiplier: 1 },
  { id: 'off-peak', label: 'Off-peak discount', multiplier: 0.8 },
  { id: 'surge', label: 'High-demand surge', multiplier: 1.25 },
]

// Coupon stub — in production this validation happens server-side so codes
// aren't just sitting in the client bundle, but this wires up the UI now.
export const COUPONS = {
  VISO10: { percentOff: 10, label: '10% off' },
  FIRSTFIX: { percentOff: 15, label: '15% off your first booking' },
}

// --- "API" functions -------------------------------------------------------
// Swap the bodies of these two for real fetch() calls once the admin
// endpoint exists. Callers already treat them as async, so nothing else
// in the app needs to change.

export async function getPricing() {
  return {
    bookingFees: SERVICE_BOOKING_FEES,
    mileageRate: DEFAULT_MILEAGE_RATE,
    bonuses: MILEAGE_BONUSES,
    // which bonus is currently switched on — this is the one field an
    // admin would flip from a dashboard toggle, not something the
    // customer picks
    activeBonusId: 'standard',
  }
}

export async function validateCoupon(code) {
  const entry = COUPONS[code?.trim().toUpperCase()]
  if (!entry) return { valid: false }
  return { valid: true, ...entry }
}
