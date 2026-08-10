// Single source of truth for every service line Viso offers.
// Both the homepage <Services> grid and the /book flow read from this file
// so a new service only has to be added in one place.
export const services = [
  { id: 'oil-change', name: 'Oil Change', blurb: 'Premium oil and filter, done at the curb.' },
  { id: 'transmission', name: 'Transmission', blurb: 'Fluid service and diagnostics on-site.' },
  { id: 'tyre-change', name: 'Tyre Change', blurb: 'Swap, balance, or replace, wherever you are.' },
  { id: 'flat-fix', name: 'Flat Fix', blurb: 'Patch or plug, back on the road fast.' },
  { id: 'brake-service', name: 'Brake Service', blurb: 'Pads, rotors, and inspection at your curb.' },
  { id: 'air-conditioning', name: 'Air Conditioning', blurb: 'Recharge and repair, beat the heat.' },
  { id: 'sensors', name: 'Sensors', blurb: 'Diagnose and replace faulty sensors.' },
  { id: 'programming', name: 'Programming', blurb: 'Key fobs, modules, and ECU programming.' },
  { id: 'diagnostics', name: 'Diagnostics', blurb: 'Full computer scan, right at the hood.' },
  { id: 'battery', name: 'Battery', blurb: 'Test and replace, no jump required.' },
  { id: 'wash-detail', name: 'Wash & Detail', blurb: 'A full clean without the drop-off.' },
  { id: 'towing', name: 'Towing', blurb: "Stuck? We'll get your car to safety, fast." },
]

export function getServiceById(id) {
  return services.find((s) => s.id === id)
}
