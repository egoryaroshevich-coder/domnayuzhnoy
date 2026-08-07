-- Complete, repeatable setup for the booking backend and admin panel.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  telegram text,
  check_in date not null,
  check_out date not null,
  adults integer not null default 1 check (adults >= 1),
  children integer not null default 0 check (children >= 0),
  guests integer not null default 1 check (guests between 1 and 20),
  services text[] not null default array['Дом']::text[],
  hot_tub boolean not null default false,
  banquet boolean not null default false,
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  comment text,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in)
);

alter table public.bookings
  add column if not exists services text[] not null default array['Дом']::text[];

create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);

create index if not exists bookings_status_dates_idx
  on public.bookings (status, check_in, check_out);

create or replace view public.booked_dates
with (security_invoker = true)
as
select id, check_in, check_out, status
from public.bookings
where status in ('confirmed', 'completed');

alter table public.bookings enable row level security;

drop policy if exists "owner can read bookings" on public.bookings;
create policy "owner can read bookings"
on public.bookings
for select
to authenticated
using (true);

drop policy if exists "owner can update bookings" on public.bookings;
create policy "owner can update bookings"
on public.bookings
for update
to authenticated
using (true)
with check (true);

-- Public visitors use the server routes, never the database directly.
drop policy if exists "allow new booking inserts" on public.bookings;
revoke all on public.bookings from anon;
revoke all on public.booked_dates from anon;

grant select, update on public.bookings to authenticated;
grant select on public.booked_dates to authenticated;
grant all on public.bookings to service_role;
grant select on public.booked_dates to service_role;

update public.bookings
set services = array_remove(array[
  'Дом',
  case when hot_tub then 'Купель' end,
  case when banquet then 'Банкет' end
], null)
where services = array['Дом']::text[];
