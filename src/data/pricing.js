// ---------------------------------------------------------------------------
// PRICING DATA LAYER
// ---------------------------------------------------------------------------
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

  // Fleet checkout is handled by the same Stripe checkout function,
  // but its amount must be defined server-side rather than trusted from
  // the browser.
  'fleet-service': 0,
}

export const OTHER_BOOKING_FEE = 49

export const DEFAULT_MILEAGE_RATE = 0.75

export const MILEAGE_BONUSES = [
  { id: 'standard', label: 'Standard rate', multiplier: 1 },
  { id: 'off-peak', label: 'Off-peak discount', multiplier: 0.8 },
  { id: 'surge', label: 'High-demand surge', multiplier: 1.25 },
]

export const COUPONS = {
  VISO10: { percentOff: 10, label: '10% off' },
  FIRSTFIX: { percentOff: 15, label: '15% off your first booking' },
}

export async function getPricing() {
  return {
    bookingFees: SERVICE_BOOKING_FEES,
    mileageRate: DEFAULT_MILEAGE_RATE,
    bonuses: MILEAGE_BONUSES,
    activeBonusId: 'standard',
  }
}

export async function validateCoupon(code) {
  const entry = COUPONS[code?.trim().toUpperCase()]
  if (!entry) return { valid: false }
  return { valid: true, ...entry }
}
