-- Optional setup for a fresh Supabase project.
-- If bookings, booked_dates and admin policies already work in the current
-- project, this file does not need to be run again.

alter table public.bookings
  add column if not exists services text[] not null default array['Дом']::text[];

grant select, update on public.bookings to authenticated;
grant select on public.booked_dates to authenticated;

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

-- Public visitors do not write to Supabase directly in the Next.js version.
-- The server booking endpoint uses SUPABASE_SERVICE_ROLE_KEY and bypasses RLS.
drop policy if exists "allow new booking inserts" on public.bookings;

-- Existing rows receive a useful services list.
update public.bookings
set services = array_remove(array[
  'Дом',
  case when hot_tub then 'Купель' end,
  case when banquet then 'Банкет' end
], null)
where services = array['Дом']::text[];
