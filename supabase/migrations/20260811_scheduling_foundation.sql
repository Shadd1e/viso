create extension if not exists pgcrypto;

alter table public.bookings
  add column if not exists service_ids jsonb not null default '[]'::jsonb,
  add column if not exists extra_information text,
  add column if not exists scheduled_start text,
  add column if not exists scheduled_end text,
  add column if not exists assigned_technician_id uuid,
  add column if not exists dispatch_mode text not null default 'scheduled';

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  name text not null,
  phone text,
  active boolean not null default true,
  available_for_jobs boolean not null default true,
  services jsonb not null default '[]'::jsonb,
  base_address text,
  base_lat numeric,
  base_lng numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technician_availability (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technicians(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time text not null,
  end_time text not null,
  active boolean not null default true,
);

create table if not exists public.technician_time_off (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technicians(id) on delete cascade,
  date date not null,
  reason text,
  unique (technician_id, date)
);

create table if not exists public.technician_location_pings (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technicians(id) on delete cascade,
  latitude numeric not null,
  longitude numeric not null,
  accuracy_meters numeric,
  recorded_at timestamptz not null default now()
);

create index if not exists technician_location_pings_recent_idx
  on public.technician_location_pings (technician_id, recorded_at desc);
create index if not exists bookings_schedule_idx
  on public.bookings (appointment_date, appointment_time);

alter table public.technicians enable row level security;
alter table public.technician_availability enable row level security;
alter table public.technician_time_off enable row level security;
alter table public.technician_location_pings enable row level security;

-- Public booking flow reads these only through Edge Functions using the service role.
-- Admin/technician policies can be added when authentication is wired.

create or replace function public.touch_technician_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists technicians_touch_updated_at on public.technicians;
create trigger technicians_touch_updated_at
before update on public.technicians
for each row execute function public.touch_technician_updated_at();

-- Allow more than one working interval per weekday (e.g. split shifts).
alter table public.technician_availability drop constraint if exists technician_availability_technician_id_weekday_key;
