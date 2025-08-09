-- Tenancy linkage
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  gym_id uuid not null,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  first_name text not null,
  last_name text not null,
  email text,
  identification text,
  phone text,
  dob date,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gym_id, email, identification)
);

-- Plans (products)
create type billing_interval as enum ('day','week','month','year','pack');

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'USD',
  interval billing_interval not null default 'month',
  duration_days int, -- for packs or fixed durations
  max_classes_per_period int, -- null = unlimited
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Memberships (subscriptions)
create type membership_status as enum ('active','paused','canceled','expired','pending');

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  start_date date not null default current_date,
  end_date date,
  status membership_status not null default 'active',
  auto_renew boolean not null default true,
  renew_day_of_month int check (renew_day_of_month between 1 and 28),
  created_at timestamptz not null default now()
);

-- Payments (invoices/receipts)
create type payment_status as enum ('pending','paid','failed','refunded');

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status payment_status not null default 'pending',
  method text, -- 'cash','card','stripe','paypal'
  provider_id text, -- external reference
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Staff
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role text not null, -- 'trainer','admin','frontdesk'
  phone text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Attendance (kiosk/manual)
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  check_in_at timestamptz not null default now(),
  source text not null default 'manual' -- 'kiosk','manual','auto'
);

-- Indexes
create index if not exists idx_customers_gym on public.customers(gym_id);
create index if not exists idx_memberships_gym on public.memberships(gym_id);
create index if not exists idx_payments_gym on public.payments(gym_id);
create index if not exists idx_attendance_gym_customer on public.attendance(gym_id, customer_id);

-- RLS
alter table public.customers enable row level security;
alter table public.plans enable row level security;
alter table public.memberships enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.staff enable row level security;

-- Policy helper: every table uses the same EXISTS on user_profiles
-- SELECT
do $$ declare r record;
begin
  for r in
    select unnest(array[
      'customers','plans','memberships','payments','attendance','staff'
    ]) as t
  loop
    execute format($f$
      drop policy if exists %1$s_select on public.%1$s;
      create policy %1$s_select on public.%1$s
      for select using (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid() and up.gym_id = %1$s.gym_id
        )
      );
    $f$, r.t);
  end loop;
end $$;

-- INSERT/UPDATE/DELETE
do $$ declare r record;
begin
  for r in
    select unnest(array[
      'customers','plans','memberships','payments','attendance','staff'
    ]) as t
  loop
    execute format($f$
      drop policy if exists %1$s_write on public.%1$s;
      create policy %1$s_write on public.%1$s
      for all using (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid() and up.gym_id = %1$s.gym_id
        )
      ) with check (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid() and up.gym_id = %1$s.gym_id
        )
      );
    $f$, r.t);
  end loop;
end $$;

-- Optional: fuzzy search
create extension if not exists pg_trgm with schema public;
alter table public.customers add column if not exists search tsvector;
create index if not exists idx_customers_search on public.customers using gin(search);
create or replace function public.customers_tsv_update() returns trigger as $$
begin
  new.search :=
    to_tsvector('simple',
      coalesce(new.first_name,'') || ' ' ||
      coalesce(new.last_name,'') || ' ' ||
      coalesce(new.email,'') || ' ' ||
      coalesce(new.identification,'') || ' ' ||
      coalesce(new.phone,'')
    );
  return new;
end $$ language plpgsql;

drop trigger if exists trg_customers_tsv on public.customers;
create trigger trg_customers_tsv
before insert or update on public.customers
for each row execute procedure public.customers_tsv_update();


-- Tipos
create type progress_event_type as enum (
  'measurement',     -- medidas corporales
  'performance',     -- 1RM, tiempos, etc.
  'note',            -- notas libres
  'photo'            -- fotos de progreso
);

-- Tabla única de eventos
create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  event_type progress_event_type not null,
  measured_at timestamptz not null default now(), -- cuándo aplica el dato
  notes text,
  metrics jsonb,          -- payload flexible: { weight_kg, body_fat_pct, rm_bench, ... }
  photo_path text,        -- ruta en storage (bucket)
  staff_id uuid references public.staff(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_progress_events_gym_customer_date
  on public.progress_events(gym_id, customer_id, measured_at desc);
create index if not exists idx_progress_events_type
  on public.progress_events(event_type);
create index if not exists idx_progress_events_metrics_gin
  on public.progress_events using gin (metrics jsonb_path_ops);

alter table public.progress_events enable row level security;

-- RLS: mismo patrón que el resto (user_profiles.gym_id)
drop policy if exists progress_events_select on public.progress_events;
create policy progress_events_select on public.progress_events
for select using (
  exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.gym_id = progress_events.gym_id
  )
);

drop policy if exists progress_events_write on public.progress_events;
create policy progress_events_write on public.progress_events
for all using (
  exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.gym_id = progress_events.gym_id
  )
) with check (
  exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.gym_id = progress_events.gym_id
  )
);