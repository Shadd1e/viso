export const GA = {
  minLat: 30.35,
  maxLat: 35.05,
  minLng: -85.65,
  maxLng: -80.75,
};

export const MAX_LIVE_LOCATION_AGE_MS = 2 * 60 * 1000;

export function isGeorgia(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= GA.minLat &&
    lat <= GA.maxLat &&
    lng >= GA.minLng &&
    lng <= GA.maxLng
  );
}

export function milesBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 3958.7613;

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}