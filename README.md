# Viso Mobile Autocare — scheduling foundation

This sweep merges the existing Stripe checkout Edge Function architecture with technician scheduling.

## What changed

- Customers choose a service date using the booking calendar.
- Available time slots are generated from technician working hours, time-off, and existing bookings.
- A technician must be active, available for jobs, and able to perform all selected services.
- Multiple technicians can cover the same slot.
- Scheduled bookings can use the technician's latest location, falling back to their configured base location for mileage.
- Immediate dispatch is reserved for a future live-dispatch flow where a technician has a fresh location ping.
- Multiple services, `Other / Not listed`, and optional extra information remain supported.
- The final price and technician assignment are calculated server-side before Stripe checkout.
- Georgia validation remains server-side.

## Folder placement

Copy the contents into the existing Viso project, preserving the paths:

- `src/pages/Booking.jsx` → replace your current booking page.
- `src/lib/dispatch.js` → replace the current dispatch helper.
- `supabase/` → add this entire folder to the project root.

## Supabase migration

Run `supabase/migrations/20260811_scheduling_foundation.sql` in the Supabase SQL editor before deploying the functions.

## Technician setup

Create technicians in `public.technicians`, then give each technician one or more rows in `technician_availability`:

- `weekday`: 0 Sunday through 6 Saturday
- `start_time`: `HH:MM`
- `end_time`: `HH:MM`

Use `technician_time_off` for individual days off.

Set `services` to a JSON array of service IDs, e.g. `["oil-change","battery"]`.

Set `base_lat` and `base_lng` as the fallback location. The later technician-location Edge Function will insert live pings into `technician_location_pings`.

## Environment / secrets

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge Functions:

- `SUPABASE_URL`
- `VISO_SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

Do not put the service-role key or Stripe secret in the frontend `.env` variables.

## Deploy order

Do not deploy yet if Stripe is still using test/incomplete credentials. When ready:

```bash
supabase functions deploy get-availability
supabase functions deploy create-checkout-session
```

The webhook and technician GPS ping function come in the next sweep.
