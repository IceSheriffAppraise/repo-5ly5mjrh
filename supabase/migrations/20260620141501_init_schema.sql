-- Food Kitchen — initial schema
-- All customer-facing, configurable data lives in Supabase (single source of truth).

create extension if not exists "pgcrypto";

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- programs: ФИТ / ХИТ / ПРО
-- ---------------------------------------------------------------------------
create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text not null default '',
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger programs_set_updated_at before update on public.programs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- dishes: блюда (menu items)
-- ---------------------------------------------------------------------------
create table public.dishes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  image_url   text not null default '',
  category    text not null default 'lunch', -- breakfast | lunch | dinner | snack
  calories    int  not null default 0,
  proteins    numeric not null default 0,
  fats        numeric not null default 0,
  carbs       numeric not null default 0,
  has_fish    boolean not null default false,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger dishes_set_updated_at before update on public.dishes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- meal_plans: меню на день (per program + calorie tier)
-- ---------------------------------------------------------------------------
create table public.meal_plans (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  calories    int  not null default 0,
  name        text not null default 'Меню на день',
  plan_date   date,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger meal_plans_set_updated_at before update on public.meal_plans
  for each row execute function public.set_updated_at();

create table public.meal_plan_items (
  id           uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  dish_id      uuid not null references public.dishes(id) on delete cascade,
  meal_type    text not null default 'lunch',
  sort_order   int  not null default 0
);

-- ---------------------------------------------------------------------------
-- delivery_rules: длительности (2/4/6/14/30), скидки, дефолт, плашка
-- ---------------------------------------------------------------------------
create table public.delivery_rules (
  id               uuid primary key default gen_random_uuid(),
  days             int  not null unique,
  discount_percent numeric not null default 0,
  badge            text,            -- e.g. 'Рассрочка' for 30 days (data-driven, not hardcoded in UI)
  is_default       boolean not null default false,
  sort_order       int  not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger delivery_rules_set_updated_at before update on public.delivery_rules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- pricing_rules: тарифы (program + calories) → приёмы пищи + цена за день
-- ---------------------------------------------------------------------------
create table public.pricing_rules (
  id            uuid primary key default gen_random_uuid(),
  program_id    uuid not null references public.programs(id) on delete cascade,
  calories      int  not null,
  meals_count   int  not null default 5,
  price_per_day numeric not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (program_id, calories)
);
create trigger pricing_rules_set_updated_at before update on public.pricing_rules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders: заявки
-- ---------------------------------------------------------------------------
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  customer_name       text not null,
  phone               text not null,
  address             text not null default '',
  program_id          uuid references public.programs(id) on delete set null,
  program_code        text,
  calories            int  not null default 0,
  duration_days       int  not null default 0,
  order_format        text not null default 'one_time', -- one_time | subscription
  without_fish        boolean not null default false,
  first_delivery_date date,
  meals_count         int  not null default 0,
  total_price         numeric not null default 0,
  comment             text not null default '',
  status              text not null default 'new',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- content: базовые тексты (key/value)
-- ---------------------------------------------------------------------------
create table public.content (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  title      text not null default '',
  value      text not null default '',
  updated_at timestamptz not null default now()
);
create trigger content_set_updated_at before update on public.content
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.programs        enable row level security;
alter table public.dishes          enable row level security;
alter table public.meal_plans      enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.delivery_rules  enable row level security;
alter table public.pricing_rules   enable row level security;
alter table public.orders          enable row level security;
alter table public.content         enable row level security;

-- Public (anon + authenticated) read of ACTIVE rows only.
create policy "programs_public_read" on public.programs
  for select using (is_active = true);
create policy "dishes_public_read" on public.dishes
  for select using (is_active = true);
create policy "meal_plans_public_read" on public.meal_plans
  for select using (is_active = true);
create policy "delivery_rules_public_read" on public.delivery_rules
  for select using (is_active = true);
create policy "pricing_rules_public_read" on public.pricing_rules
  for select using (is_active = true);
create policy "content_public_read" on public.content
  for select using (true);

-- meal_plan_items are readable when their parent plan is active.
create policy "meal_plan_items_public_read" on public.meal_plan_items
  for select using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_items.meal_plan_id and mp.is_active = true
    )
  );

-- Orders: anyone may create a заявка publicly; nobody may read/update via anon.
-- Reading and editing orders is done server-side with the service role (bypasses RLS).
create policy "orders_public_insert" on public.orders
  for insert with check (true);
