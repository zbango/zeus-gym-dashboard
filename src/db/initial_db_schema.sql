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
      'customers','plans','memberships','payments','attendance','staff',
      'store_products','store_stock_movements','store_sales','store_sale_items'
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
      'customers','plans','memberships','payments','attendance','staff',
      'store_products','store_stock_movements','store_sales','store_sale_items'
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

-- Ensure updated_at exists on all core tables and is maintained automatically
-- Add updated_at column if missing
alter table if exists public.user_profiles add column if not exists updated_at timestamptz not null default now();
alter table if exists public.customers add column if not exists updated_at timestamptz not null default now();
alter table if exists public.plans add column if not exists updated_at timestamptz not null default now();
alter table if exists public.memberships add column if not exists updated_at timestamptz not null default now();
alter table if exists public.payments add column if not exists updated_at timestamptz not null default now();
alter table if exists public.attendance add column if not exists updated_at timestamptz not null default now();
alter table if exists public.staff add column if not exists updated_at timestamptz not null default now();
alter table if exists public.progress_events add column if not exists updated_at timestamptz not null default now();
alter table if exists public.store_products add column if not exists updated_at timestamptz not null default now();
alter table if exists public.store_stock_movements add column if not exists updated_at timestamptz not null default now();
alter table if exists public.store_sales add column if not exists updated_at timestamptz not null default now();
alter table if exists public.store_sale_items add column if not exists updated_at timestamptz not null default now();

-- Generic trigger function to update updated_at on row modifications
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach BEFORE UPDATE triggers to keep updated_at fresh
drop trigger if exists trg_user_profiles_set_updated_at on public.user_profiles;
create trigger trg_user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_set_updated_at on public.customers;
create trigger trg_customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_plans_set_updated_at on public.plans;
create trigger trg_plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists trg_memberships_set_updated_at on public.memberships;
create trigger trg_memberships_set_updated_at
before update on public.memberships
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_set_updated_at on public.payments;
create trigger trg_payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_attendance_set_updated_at on public.attendance;
create trigger trg_attendance_set_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

drop trigger if exists trg_staff_set_updated_at on public.staff;
create trigger trg_staff_set_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

drop trigger if exists trg_progress_events_set_updated_at on public.progress_events;
create trigger trg_progress_events_set_updated_at
before update on public.progress_events
for each row execute function public.set_updated_at();

-- ==============================
-- Store: Products, Sales, Stock
-- ==============================

-- Basic products table for store sales
create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  sku text,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0), -- retail price
  cost_cents int check (cost_cents >= 0),            -- optional cost for margin
  active boolean not null default true,
  low_stock_threshold int not null default 0,
  created_at timestamptz not null default now()
);

-- SKU unique per gym
create unique index if not exists uq_store_products_gym_sku on public.store_products(gym_id, sku) where sku is not null;
create index if not exists idx_store_products_gym on public.store_products(gym_id);

-- Stock movements: single source of truth for on-hand quantities
do $$
begin
  if not exists (select 1 from pg_type where typname = 'stock_movement_type') then
    create type stock_movement_type as enum ('in','out');
  end if;
end$$;

create table if not exists public.store_stock_movements (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  product_id uuid not null references public.store_products(id) on delete cascade,
  movement_type stock_movement_type not null,
  quantity int not null check (quantity > 0),
  reason text not null check (reason in ('purchase','sale','adjustment','return','void')),
  related_sale_id uuid,
  staff_id uuid references public.staff(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_stock_movements_gym_product on public.store_stock_movements(gym_id, product_id);
create index if not exists idx_store_stock_movements_sale on public.store_stock_movements(related_sale_id);

-- Sales (POS)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_sale_status') then
    create type store_sale_status as enum ('draft','paid','void','refunded');
  end if;
end$$;

create table if not exists public.store_sales (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  customer_id uuid references public.customers(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  status store_sale_status not null default 'draft',
  payment_method text, -- 'cash','card','transfer','other'
  paid_at timestamptz,
  subtotal_cents int not null default 0 check (subtotal_cents >= 0),
  discount_cents int not null default 0 check (discount_cents >= 0),
  total_cents int not null default 0 check (total_cents >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_sales_gym on public.store_sales(gym_id);
create index if not exists idx_store_sales_status on public.store_sales(status);

-- Sale line items
create table if not exists public.store_sale_items (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null,
  sale_id uuid not null references public.store_sales(id) on delete cascade,
  product_id uuid not null references public.store_products(id),
  quantity int not null check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents >= 0),
  total_cents int generated always as (quantity * unit_price_cents) stored,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_sale_items_sale on public.store_sale_items(sale_id);
create index if not exists idx_store_sale_items_gym on public.store_sale_items(gym_id);

-- Helper view: current stock per product (sum(in) - sum(out))
-- view defined later after all tables are declared

-- Keep store_sales totals in sync from items
create or replace function public.store_recompute_sale_totals() returns trigger as $$
declare
  v_subtotal int;
  v_sale_id uuid;
begin
  v_sale_id := coalesce(new.sale_id, old.sale_id);
  select coalesce(sum(total_cents), 0) into v_subtotal
  from public.store_sale_items where sale_id = v_sale_id;

  update public.store_sales s
    set subtotal_cents = v_subtotal,
        total_cents = greatest(v_subtotal - s.discount_cents, 0)
  where s.id = v_sale_id;

  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_store_sale_items_totals_ins on public.store_sale_items;
create trigger trg_store_sale_items_totals_ins
after insert on public.store_sale_items
for each row execute function public.store_recompute_sale_totals();

drop trigger if exists trg_store_sale_items_totals_upd on public.store_sale_items;
create trigger trg_store_sale_items_totals_upd
after update on public.store_sale_items
for each row execute function public.store_recompute_sale_totals();

drop trigger if exists trg_store_sale_items_totals_del on public.store_sale_items;
create trigger trg_store_sale_items_totals_del
after delete on public.store_sale_items
for each row execute function public.store_recompute_sale_totals();

-- Apply stock movements when a sale is paid; reverse on void/refunded
create or replace function public.store_apply_sale_stock_movements() returns trigger as $$
declare
  li record;
  v_type stock_movement_type;
  v_reason text;
begin
  if (tg_op = 'INSERT' and new.status = 'paid') or
     (tg_op = 'UPDATE' and old.status <> new.status and new.status in ('paid','void','refunded')) then
    if new.status = 'paid' then
      v_type := 'out'; v_reason := 'sale';
    else
      -- Void/Refund: put items back
      v_type := 'in'; v_reason := 'void';
    end if;

    for li in
      select i.product_id, i.quantity from public.store_sale_items i where i.sale_id = new.id
    loop
      insert into public.store_stock_movements (
        gym_id, product_id, movement_type, quantity, reason, related_sale_id, staff_id, notes
      ) values (
        new.gym_id, li.product_id, v_type, li.quantity, v_reason, new.id, new.staff_id, null
      );
    end loop;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_store_sales_apply_stock on public.store_sales;
create trigger trg_store_sales_apply_stock
after insert or update on public.store_sales
for each row execute function public.store_apply_sale_stock_movements();

-- RLS for store tables
alter table public.store_products enable row level security;
alter table public.store_stock_movements enable row level security;
alter table public.store_sales enable row level security;
alter table public.store_sale_items enable row level security;

-- Specific policies for the view
drop view if exists public.store_product_current_stock cascade;
create or replace view public.store_product_current_stock as
  select
    p.id as product_id,
    p.gym_id,
    coalesce(sum(case when m.movement_type = 'in' then m.quantity else -m.quantity end), 0) as on_hand
  from public.store_products p
  left join public.store_stock_movements m
    on m.product_id = p.id and m.gym_id = p.gym_id
  group by p.id, p.gym_id;

-- Allow selecting from the stock view when in same gym via base table policies
-- (inherits RLS from underlying tables)

-- Attach BEFORE UPDATE triggers to keep updated_at fresh on store tables
drop trigger if exists trg_store_products_set_updated_at on public.store_products;
create trigger trg_store_products_set_updated_at
before update on public.store_products
for each row execute function public.set_updated_at();

drop trigger if exists trg_store_stock_movements_set_updated_at on public.store_stock_movements;
create trigger trg_store_stock_movements_set_updated_at
before update on public.store_stock_movements
for each row execute function public.set_updated_at();

drop trigger if exists trg_store_sales_set_updated_at on public.store_sales;
create trigger trg_store_sales_set_updated_at
before update on public.store_sales
for each row execute function public.set_updated_at();

drop trigger if exists trg_store_sale_items_set_updated_at on public.store_sale_items;
create trigger trg_store_sale_items_set_updated_at
before update on public.store_sale_items
for each row execute function public.set_updated_at();

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