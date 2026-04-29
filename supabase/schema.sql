create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booker_name text not null,
  booking_date date not null,
  day_range text not null,
  sharing_ok boolean not null default false,
  status text not null default 'approved',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamp with time zone not null default now()
);
