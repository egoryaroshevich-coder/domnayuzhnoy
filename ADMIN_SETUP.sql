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
  source text not null default 'website'
    check (source in ('website', 'manual')),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in)
);

alter table public.bookings
  add column if not exists services text[] not null default array['Дом']::text[];

alter table public.bookings
  add column if not exists source text not null default 'website';

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

create or replace function public.create_manual_booking(
  p_name text,
  p_phone text,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_total_price numeric,
  p_comment text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  created_booking public.bookings;
  safe_name text := nullif(btrim(p_name), '');
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;

  if safe_name is null then
    raise exception 'NAME_REQUIRED' using errcode = '22023';
  end if;
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in then
    raise exception 'INVALID_DATES' using errcode = '22023';
  end if;
  if p_guests is null or p_guests < 1 or p_guests > 20 then
    raise exception 'INVALID_GUESTS' using errcode = '22023';
  end if;
  if p_total_price is null or p_total_price < 0 then
    raise exception 'INVALID_PRICE' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(739821);

  if exists (
    select 1
    from public.bookings
    where status in ('confirmed', 'completed')
      and daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
  ) then
    raise exception 'DATES_UNAVAILABLE' using errcode = 'P0001';
  end if;

  insert into public.bookings (
    name,
    phone,
    check_in,
    check_out,
    adults,
    children,
    guests,
    services,
    hot_tub,
    banquet,
    total_price,
    comment,
    source,
    status
  ) values (
    safe_name,
    coalesce(nullif(btrim(p_phone), ''), 'Не указан'),
    p_check_in,
    p_check_out,
    p_guests,
    0,
    p_guests,
    array['Дом']::text[],
    false,
    false,
    p_total_price,
    nullif(btrim(p_comment), ''),
    'manual',
    'confirmed'
  )
  returning * into created_booking;

  return created_booking;
end;
$$;

revoke all on function public.create_manual_booking(text, text, date, date, integer, numeric, text) from public;
revoke all on function public.create_manual_booking(text, text, date, date, integer, numeric, text) from anon;
grant execute on function public.create_manual_booking(text, text, date, date, integer, numeric, text) to authenticated;

update public.bookings
set services = array_remove(array[
  'Дом',
  case when hot_tub then 'Купель' end,
  case when banquet then 'Банкет' end
], null)
where services = array['Дом']::text[];
