export const SERVICE_BOOKING_FEES: Record<string, number> = {
  'oil-change':49, transmission:129, 'tyre-change':39, 'flat-fix':35, 'brake-service':89,
  'air-conditioning':79, sensors:69, programming:99, diagnostics:59, battery:45,
  'wash-detail':59, towing:75, other:49,
};
export const SERVICE_DURATIONS_MIN: Record<string, number> = {
  'oil-change':60, transmission:120, 'tyre-change':60, 'flat-fix':45, 'brake-service':90,
  'air-conditioning':90, sensors:60, programming:90, diagnostics:60, battery:45,
  'wash-detail':120, towing:60, other:90,
};
export const COUPONS: Record<string, number> = { VISO10:10, FIRSTFIX:15 };
export const MILEAGE_RATE = 0.75;
export function durationFor(ids:string[]) { return Math.max(30, ids.reduce((sum,id)=>sum+(SERVICE_DURATIONS_MIN[id]||60),0)); }
export function priceFor(ids:string[], distance:number, couponCode:string) {
  const subtotal = ids.reduce((sum,id)=>sum+(SERVICE_BOOKING_FEES[id]||0),0) + distance*MILEAGE_RATE;
  const percent = COUPONS[couponCode.trim().toUpperCase()] || 0;
  const discount = Number((subtotal*percent/100).toFixed(2));
  return { subtotal:Number(subtotal.toFixed(2)), mileageCharge:Number((distance*MILEAGE_RATE).toFixed(2)), discount, discountPercent:percent, total:Number(Math.max(subtotal-discount,0).toFixed(2)) };
}
